// The Fisher-Rao distinguishability metric on the tone substrate, the bridge to Timeless
// Dynamics (timeless-dynamics in the related-theories census). TD takes distinguishability,
// measured by the Fisher-Rao metric, as its one primitive, and makes time emerge as the
// accumulated Fisher-Rao arc length along record-preserving paths. Vibe's own primitive is
// the ternary distinction (the tone) under a reversible conserving rule, so its paths are
// record-preserving by construction (a reversible map erases nothing). This module lets an
// experiment ask whether vibe's emergent beat is the same clock TD names, the accumulated
// distinguishability, and whether a lossy path breaks the correspondence.
//
// A state's distinguishable content is read as a probability distribution over cells, the
// normalized scalar activity |tone| per cell. The Fisher-Rao distance between two such
// distributions is the geodesic distance on the probability simplex, 2 arccos of the
// Bhattacharyya overlap, which is exact and standard information geometry.

import { Will, cellActivity } from '@/code/tone/will'

// The spatial activity distribution of a state, p(cell) proportional to the tone MAGNITUDE of
// the cell (the sum of the absolute directional slots, cellActivity), normalized to sum to one.
// This is the distribution whose motion under the rule TD would call the record. Using the tone
// magnitude, not the net charge, is essential: a charge-balanced cell has zero net charge but is
// full of distinction, so a net-charge distribution would read a live state as empty. A dead
// state (no tone anywhere) has a zero distribution.
export function spatialActivityDistribution(will: Will): Float64Array {
  const cellCount = will.mesh.cellCount
  const distribution = new Float64Array(cellCount)

  let total = 0

  for (let cell = 0; cell < cellCount; cell++) {
    const activity = cellActivity(will, cell)
    distribution[cell] = activity
    total += activity
  }

  if (total === 0) {
    return distribution
  }

  for (let cell = 0; cell < cellCount; cell++) {
    distribution[cell] = distribution[cell]! / total
  }

  return distribution
}

// The coarse activity distribution, the per-cell activity summed into a fixed number of
// spatial blocks by cell index, then normalized. Coarse-graining makes consecutive
// distributions overlap partially rather than swapping support completely, so the per-step
// Fisher-Rao distance is sub-maximal and the arc length reads a real, non-degenerate rate of
// distinguishability rather than a pinned maximum.
export function blockActivityDistribution(input: {
  will: Will
  blocks: number
}): Float64Array {
  const { will, blocks } = input
  const cellCount = will.mesh.cellCount
  const blockSize = Math.ceil(cellCount / blocks)
  const distribution = new Float64Array(blocks)

  let total = 0

  for (let cell = 0; cell < cellCount; cell++) {
    const activity = cellActivity(will, cell)
    const block = Math.min(blocks - 1, Math.floor(cell / blockSize))
    distribution[block] = distribution[block]! + activity
    total += activity
  }

  if (total === 0) {
    return distribution
  }

  for (let block = 0; block < blocks; block++) {
    distribution[block] = distribution[block]! / total
  }

  return distribution
}

// The Fisher-Rao geodesic distance between two distributions on the simplex, 2 arccos of the
// Bhattacharyya coefficient sum(sqrt(p q)). Zero when identical, pi when disjoint. The
// argument is clamped into [0, 1] against floating error before the arccos.
export function fisherRaoDistance(
  p: ArrayLike<number>,
  q: ArrayLike<number>,
): number {
  const n = Math.min(p.length, q.length)

  let overlap = 0

  for (let i = 0; i < n; i++) {
    overlap += Math.sqrt((p[i] ?? 0) * (q[i] ?? 0))
  }

  const clamped = overlap < 0 ? 0 : overlap > 1 ? 1 : overlap

  return 2 * Math.acos(clamped)
}

// The cumulative Fisher-Rao arc length along a sequence of distributions, S(t). S(0) is zero,
// and each step adds the Fisher-Rao distance between consecutive distributions. This is TD's
// candidate for emergent time, the accumulated distinguishability along the path.
export function cumulativeArcLength(
  distributions: readonly ArrayLike<number>[],
): number[] {
  const arc: number[] = [0]

  for (let t = 1; t < distributions.length; t++) {
    const step = fisherRaoDistance(distributions[t - 1]!, distributions[t]!)
    arc.push(arc[t - 1]! + step)
  }

  return arc
}

// The slope of a series over a window, by least squares against the index. Used to read
// whether the arc length is still accumulating (a positive late slope, a live clock) or has
// saturated (a near-zero late slope, a stopped clock).
export function windowSlope(input: {
  series: readonly number[]
  from: number
  to: number
}): number {
  const { series, from, to } = input
  const lo = Math.max(0, from)
  const hi = Math.min(series.length - 1, to)
  const count = hi - lo + 1

  if (count < 2) {
    return 0
  }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (let i = lo; i <= hi; i++) {
    const x = i - lo
    const y = series[i]!
    sumX += x
    sumY += y
    sumXY += x * y
    sumXX += x * x
  }

  const denominator = count * sumXX - sumX * sumX

  return denominator === 0 ? 0 : (count * sumXY - sumX * sumY) / denominator
}
