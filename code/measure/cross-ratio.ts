// The conformal cross-ratio of four points on a sphere, the invariant that a
// conformal (Mobius) map preserves and a generic affine map does not. Built
// from chordal (straight-line) distances between boundary points:
//   cr = (|p1 - p2| |p3 - p4|) / (|p1 - p3| |p2 - p4|)
// This is the quantity a boundary conformal map leaves fixed, so it reads out
// whether a transformation of the boundary is conformal.

import { type Vec, norm, sub } from '@/code/algebra/vector'

function chord(a: Vec, b: Vec): number {
  return norm(sub(a, b))
}

// The cross-ratio of exactly four points. Input must have length four.
export function crossRatio(points: Vec[]): number {
  const [p1, p2, p3, p4] = points

  if (!p1 || !p2 || !p3 || !p4 || points.length !== 4)
    throw new Error('crossRatio needs exactly four points')

  const denominator = chord(p1, p3) * chord(p2, p4)

  return (chord(p1, p2) * chord(p3, p4)) / denominator
}

// The largest fractional change in any pairwise chordal distance between two
// point sets, a witness that a map genuinely deforms distances (so a preserved
// cross-ratio is not merely a rigid rotation that changed nothing).
export function maxChordDistortion(
  before: Vec[],
  after: Vec[],
): number {
  let worst = 0

  for (let i = 0; i < before.length; i++) {
    for (let j = i + 1; j < before.length; j++) {
      const b = chord(before[i]!, before[j]!)
      const a = chord(after[i]!, after[j]!)
      const rel = Math.abs(a - b) / Math.max(1e-12, b)

      if (rel > worst) worst = rel
    }
  }

  return worst
}
