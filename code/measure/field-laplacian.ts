// The discrete Laplacian of a scalar field sampled on a 2D integer grid, the five-point stencil
// lap(f)(i, j) = f(i+h, j) + f(i-h, j) + f(i, j+h) + f(i, j-h) - 4 f(i, j). For an index field this is
// the effective Gaussian curvature (the Laplacian of ln n), concentrated where the source is. Returns
// the integrated magnitude over the window and the radius of the cell where it peaks, measured from
// the grid origin. The field is sampled, not stored, so the caller supplies it as a function.

export function fieldLaplacianProfile(input: {
  field: (x: number, y: number) => number
  radius: number
  step?: number
}): { peakRadius: number; total: number } {
  const { field, radius } = input
  const h = input.step ?? 1
  let peakValue = -Infinity
  let peakRadius = Infinity
  let total = 0
  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      const lap =
        field(i + h, j) +
        field(i - h, j) +
        field(i, j + h) +
        field(i, j - h) -
        4 * field(i, j)
      const mag = Math.abs(lap)
      total += mag
      if (mag > peakValue) {
        peakValue = mag
        peakRadius = Math.hypot(i, j)
      }
    }
  }

  return { peakRadius, total }
}
