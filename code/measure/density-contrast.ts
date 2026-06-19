// The density contrast of a point set, the relative fluctuation in how many points fall in each cell of
// a regular grid over the unit cube. Binning N points into binsPerAxis^3 cells, the contrast is delta =
// std(counts) / mean(counts). For a Poisson (sprinkled) process this falls as (mean count)^{-1/2}, the
// scale-free white seed behind structure formation. Returns the mean count per cell and the contrast.

export function densityContrast(input: {
  points: ReadonlyArray<ReadonlyArray<number>>
  binsPerAxis: number
  dimension?: number
}): { meanCount: number; delta: number } {
  const { points, binsPerAxis } = input
  const dim = input.dimension ?? 3
  const cells = new Map<number, number>()
  for (const p of points) {
    let idx = 0
    for (let a = 0; a < dim; a++) {
      const c = Math.min(
        binsPerAxis - 1,
        Math.floor((p[a] ?? 0) * binsPerAxis),
      )
      idx = idx * binsPerAxis + c
    }
    cells.set(idx, (cells.get(idx) ?? 0) + 1)
  }
  const totalCells = binsPerAxis ** dim
  const counts: number[] = []
  for (let i = 0; i < totalCells; i++) {
    counts.push(cells.get(i) ?? 0)
  }
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length
  let varc = 0
  for (const c of counts) {
    varc += (c - mean) ** 2
  }
  varc /= counts.length
  return {
    meanCount: mean,
    delta: Math.sqrt(varc) / Math.max(1e-9, mean),
  }
}
