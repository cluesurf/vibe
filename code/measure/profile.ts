// Measures over a one-dimensional spatial profile and over a weighted point cloud.
//
// A profile is the value of some occupancy or density observable across spatial slabs
// (the x-bins of a lattice). Its gradient signature, the range divided by the mean, is
// near zero for a flat equilibrium profile and large for a sustained non-equilibrium
// gradient.

import { Will } from '@/code/tone/will'

// The mean absolute charge per cell, binned by a cell-to-slab map, the activity (or density) profile across
// slabs. `binOf` maps a cell to its slab index in [0, bins). Used to read a vacuum-density profile across the
// lattice (e.g. by x-coordinate) and so to measure pressure imbalances between regions.
export function chargeDensityProfile(input: {
  will: Will
  binOf: (cell: number) => number
  bins: number
}): number[] {
  const { will, binOf, bins } = input
  const degree = will.mesh.degree
  const sum = new Array<number>(bins).fill(0)
  const count = new Array<number>(bins).fill(0)

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const bin = binOf(cell)
    const base = cell * degree

    let q = 0

    for (let direction = 0; direction < degree; direction++) {
      q += Math.abs(will.data[base + direction]!)
    }

    sum[bin]! += q
    count[bin]!++
  }

  return sum.map((s, b) => (count[b]! > 0 ? s / count[b]! : 0))
}

// Gradient signature of a profile, its range over its mean. Flat is near zero.
export function profileGradient(
  profile: ReadonlyArray<number>,
): number {
  const mean = profile.reduce((a, b) => a + b, 0) / profile.length

  if (mean === 0) {
    return 0
  }

  return (Math.max(...profile) - Math.min(...profile)) / mean
}

// The radially-averaged value of a field over a d-cube of side L, binned by integer distance
// from the center. Cells with rounded radius below `minRadius` or above `maxRadius` are dropped
// (the near-source singularity and the boundary layer), and each kept radius reports the mean of
// the field in that shell. The Green's-function falloff is read off this profile.
export function radialFieldProfile(input: {
  values: ArrayLike<number>
  coord: (i: number) => number[]
  side: number
  dimension: number
  minRadius: number
  maxRadius: number
}): { r: number; g: number }[] {
  const {
    values,
    coord,
    side: L,
    dimension: d,
    minRadius,
    maxRadius,
  } = input

  const c0 = L / 2
  const bins = new Map<number, { sum: number; count: number }>()

  for (let i = 0; i < values.length; i++) {
    const c = coord(i)

    let r2 = 0

    for (let k = 0; k < d; k++) {
      r2 += (c[k]! - c0) ** 2
    }

    const r = Math.round(Math.sqrt(r2))

    if (r < minRadius || r > maxRadius) {
      continue
    }

    const bin = bins.get(r) ?? { sum: 0, count: 0 }
    bin.sum += values[i]!
    bin.count++
    bins.set(r, bin)
  }

  return [...bins.entries()]
    .map(([r, bin]) => ({ r, g: bin.sum / bin.count }))
    .sort((a, b) => a.r - b.r)
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

  if (total <= 0) {
    return 0
  }

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
