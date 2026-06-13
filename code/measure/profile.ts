// Measures over a one-dimensional spatial profile and over a weighted point cloud.
//
// A profile is the value of some occupancy or density observable across spatial slabs
// (the x-bins of a lattice). Its gradient signature, the range divided by the mean, is
// near zero for a flat equilibrium profile and large for a sustained non-equilibrium
// gradient.

// Gradient signature of a profile, its range over its mean. Flat is near zero.
export function profileGradient(profile: ReadonlyArray<number>): number {
  const mean = profile.reduce((a, b) => a + b, 0) / profile.length
  if (mean === 0) return 0
  return (Math.max(...profile) - Math.min(...profile)) / mean
}

// Weighted radius of gyration over a square grid of side `side`, where cell index i sits
// at (i % side, floor(i / side)) and carries weight `weightOf(i)`. The root-mean-square
// distance of the mass from its centre of mass, the compactness of a weighted blob.
export function weightedGridRadiusOfGyration(input: {
  cellCount: number
  side: number
  weightOf: (cell: number) => number
}): number {
  const { cellCount, side, weightOf } = input
  let total = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < cellCount; i++) {
    const w = weightOf(i)
    total += w
    cx += w * (i % side)
    cy += w * Math.floor(i / side)
  }
  if (total <= 0) return 0
  cx /= total
  cy /= total
  let m2 = 0
  for (let i = 0; i < cellCount; i++) {
    const w = weightOf(i)
    const dx = (i % side) - cx
    const dy = Math.floor(i / side) - cy
    m2 += w * (dx * dx + dy * dy)
  }
  return Math.sqrt(m2 / total)
}
