// The discrete graph Laplacian L = D - A over a substrate's undirected
// adjacency. Its low spectrum gives effective dimension and the heat-kernel
// return probability, a cross-check on measure/dimension.

import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import {
  SparseMatrix,
  Triplet,
  sparseFromTriplets,
  operatorFromSparse,
} from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'

// Build L = D - A. Diagonal entry is the degree of the node, each undirected
// edge contributes a -1 off-diagonal in both directions.
export function laplacian(input: { substrate: Substrate }): SparseMatrix {
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
