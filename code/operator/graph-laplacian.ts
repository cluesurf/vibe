// Apply the unweighted graph Laplacian L = D - A to a vector, reading adjacency
// from a plain neighbor list. (L x)_i = deg(i) x_i - sum_{j ~ i} x_j. Writes the
// result into `out` (same length as `x`). This is the discrete Poisson operator
// the weak-field and rotation-curve solves invert.

export function graphLaplacian(input: {
  neighbors: readonly (readonly number[])[]
  x: Float64Array
  out: Float64Array
}): void {
  const { neighbors, x, out } = input

  for (let i = 0; i < x.length; i++) {
    const row = neighbors[i] ?? []

    let v = row.length * (x[i] ?? 0)

    for (const j of row) {
      v -= x[j] ?? 0
    }

    out[i] = v
  }
}

function dotProduct(a: Float64Array, b: Float64Array): number {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }

  return s
}

function subtractMean(x: Float64Array): void {
  let m = 0

  for (const value of x) {
    m += value ?? 0
  }

  m /= x.length

  for (let i = 0; i < x.length; i++) {
    x[i] = (x[i] ?? 0) - m
  }
}

// Solve L phi = b on a plain neighbor list by deflated conjugate gradient, with the
// constant null vector projected out each step so the singular graph Laplacian solve is
// well posed. Returns the zero-mean potential phi. The right side should be zero-mean.
export function solveGraphPoisson(input: {
  neighbors: readonly (readonly number[])[]
  b: Float64Array
  maxIterationFactor?: number
  tolerance?: number
}): Float64Array {
  const { neighbors, b } = input
  const maxIterationFactor = input.maxIterationFactor ?? 5
  const tolerance = input.tolerance ?? 1e-16
  const n = b.length
  const phi = new Float64Array(n)
  const residual = new Float64Array(b)
  subtractMean(residual)

  const direction = new Float64Array(residual)
  const temp = new Float64Array(n)

  let rsOld = dotProduct(residual, residual)

  for (let iter = 0; iter < maxIterationFactor * n; iter++) {
    graphLaplacian({ neighbors, x: direction, out: temp })
    subtractMean(temp)

    const alpha = rsOld / Math.max(dotProduct(direction, temp), 1e-300)

    for (let i = 0; i < n; i++) {
      phi[i] = (phi[i] ?? 0) + alpha * (direction[i] ?? 0)
      residual[i] = (residual[i] ?? 0) - alpha * (temp[i] ?? 0)
    }

    const rsNew = dotProduct(residual, residual)

    if (rsNew < tolerance) {
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

// The graph Laplacian Green's function on a neighbor list: the static potential of a
// unit charge at `center` against a uniform neutralizing background, phi = L^{-1}(delta -
// 1/n). The static-force sector of a mesh, a potential that decays with graph distance.
export function graphLaplacianGreensFunction(input: {
  neighbors: readonly (readonly number[])[]
  center: number
  maxIterationFactor?: number
  tolerance?: number
}): Float64Array {
  const n = input.neighbors.length
  const b = new Float64Array(n)
  b.fill(-1 / n)
  b[input.center] = 1 - 1 / n

  return solveGraphPoisson({
    neighbors: input.neighbors,
    b,
    maxIterationFactor: input.maxIterationFactor,
    tolerance: input.tolerance,
  })
}
