// Apply the unweighted graph Laplacian L = D - A to a vector, reading adjacency
// from a plain neighbor list. (L x)_i = deg(i) x_i - sum_{j ~ i} x_j. Writes the
// result into `out` (same length as `x`). This is the discrete Poisson operator
// the weak-field and rotation-curve solves invert.

export function graphLaplacian(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
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
