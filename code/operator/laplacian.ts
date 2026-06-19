// The discrete graph Laplacian L = D - A over a substrate's undirected
// adjacency. Its low spectrum gives effective dimension and the heat-kernel
// return probability, a cross-check on measure/dimension.

import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import {
  SparseMatrix,
  Triplet,
  sparseFromTriplets,
  sparseMatVec,
  operatorFromSparse,
} from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'

// Build L = D - A. Diagonal entry is the degree of the node, each undirected
// edge contributes a -1 off-diagonal in both directions.
export function laplacian(input: {
  substrate: Substrate
}): SparseMatrix {
  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  const n = adjacency.length
  const triplets: Triplet[] = []

  for (let a = 0; a < n; a++) {
    const row = adjacency[a] ?? new Uint32Array(0)
    triplets.push({ row: a, col: a, value: row.length })

    for (let k = 0; k < row.length; k++) {
      const b = row[k] ?? 0
      triplets.push({ row: a, col: b, value: -1 })
    }
  }

  return sparseFromTriplets({ rows: n, cols: n, triplets })
}

// The lowest `count` eigenvalues of L (ascending) via Lanczos.
export function laplacianSpectrum(input: {
  substrate: Substrate
  count: number
}): Float64Array {
  const matrix = laplacian({ substrate: input.substrate })
  const operator = operatorFromSparse(matrix)

  return lowestEigenvalues({ operator, count: input.count })
}

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }

  return s
}

function subtractMean(x: Float64Array): void {
  let m = 0

  for (let i = 0; i < x.length; i++) {
    m += x[i] ?? 0
  }

  m /= x.length

  for (let i = 0; i < x.length; i++) {
    x[i] = (x[i] ?? 0) - m
  }
}

// The graph Laplacian Green's function: the static potential phi solving L phi = delta_center
// against a uniform neutralizing background, phi = L^{-1}(delta - 1/n). Solved by deflated
// conjugate gradient, with the constant null vector projected out each step (subtractMean), so the
// singular Laplacian solve is well posed. The static-force sector of a graph: a potential that
// decays with graph distance from the source.
export function laplacianGreensFunction(input: {
  substrate: Substrate
  center: number
}): Float64Array {
  const L = laplacian({ substrate: input.substrate })
  const n = L.rows
  const b = new Float64Array(n)
  b.fill(-1 / n)
  b[input.center] = 1 - 1 / n
  const phi = new Float64Array(n)
  const residual = Float64Array.from(b)
  const direction = Float64Array.from(b)

  let rsOld = dot(residual, residual)

  for (let iter = 0; iter < 4 * n; iter++) {
    const temp = sparseMatVec(L, { x: direction })
    subtractMean(temp)
    const alpha = rsOld / Math.max(dot(direction, temp), 1e-300)

    for (let i = 0; i < n; i++) {
      phi[i] = (phi[i] ?? 0) + alpha * (direction[i] ?? 0)
      residual[i] = (residual[i] ?? 0) - alpha * (temp[i] ?? 0)
    }

    const rsNew = dot(residual, residual)

    if (rsNew < 1e-14) {
      break
    }

    const beta = rsNew / rsOld

    for (let i = 0; i < n; i++) {
      direction[i] = (residual[i] ?? 0) + beta * (direction[i] ?? 0)
    }

    rsOld = rsNew
  }

  subtractMean(phi)

  return phi
}
