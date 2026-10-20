// THE CONTACT CORE OF THE REGISTER PAIR'S PULL, AND ITS SOFTENED CONTROLS (E-SPN-0206).
//
// The register pair of spin/register-coulomb-track is held by the count n(y) = floor(alpha G(y) / theta), G the husk
// light's lattice Green function read at the pair's relative offset y. On the lattice G stays finite at contact, and it
// is far deeper there than the 1/|y| it follows from |y| 3 outward: n(0) is about four times n at the first shell. A
// well that deep, set against a member band of about 0.4 a cycle, is the strong-coupling lattice regime, where a pair
// sitting on one dock moves only at second order (hopping squared over the well, the Hubbard pair's mass).
//
// These functions read that core off a count and build the controls that soften it. They are diagnostics, not rule
// pieces: each returns a new count on the same sector, with every value an integer count of the same unit theta, so the
// engine runs it exactly as the rule's own count.
//
//   coreProfile    n by distance shell, and the per-link drop of the pull between the first shells, in cycle phase
//   softenContact  n(0) set to the largest n off contact (the first shell's): the contact well removed, nothing else
//   capCore        n(y) capped at the largest n at |y| >= radius: the pull flat inside the radius
//   contactOnly    n(y) kept at y = 0 and set to 0 elsewhere: the contact well alone (an on-site pull, Hubbard's)

import type { ReducedCount, Sector } from '@/code/measure/register-reduced'

export type CountTransform = (s: Sector, c: ReducedCount) => ReducedCount

const radiusAt = (s: Sector, i: number): number =>
  Math.hypot(s.reps[3 * i]!, s.reps[3 * i + 1]!, s.reps[3 * i + 2]!)

const withCounts = (c: ReducedCount, counts: Int32Array): ReducedCount => {
  let top = 0

  for (let i = 0; i < counts.length; i++) {
    top = Math.max(top, counts[i]!)
  }

  return { counts, nearest: c.nearest, top, alpha: c.alpha, theta: c.theta }
}

// the largest count over the representatives at distance at least `radius` (radius > 0)
export function countOutside(
  s: Sector,
  c: ReducedCount,
  radius: number,
): number {
  let best = 0

  for (let i = 0; i < s.count; i++) {
    if (radiusAt(s, i) >= radius - 1e-12) {
      best = Math.max(best, c.counts[i]!)
    }
  }

  return best
}

export type CoreProfile = {
  // [distance, count, phase theta n] for each distinct distance up to maxRadius
  shells: [number, number, number][]
  contact: number
  first: number
  // the contact well's depth over the first shell's, theta (n(0) - n(first)), a cycle
  contactStep: number
}

export function coreProfile(
  s: Sector,
  c: ReducedCount,
  maxRadius: number,
): CoreProfile {
  const byRadius = new Map<number, number>()

  for (let i = 0; i < s.count; i++) {
    const r = radiusAt(s, i)

    if (r <= maxRadius + 1e-12) {
      const key = Math.round(r * 1e9) / 1e9

      byRadius.set(key, Math.max(byRadius.get(key) ?? 0, c.counts[i]!))
    }
  }

  const shells = [...byRadius.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([r, n]): [number, number, number] => [r, n, n * c.theta])
  const contact = shells[0]?.[0] === 0 ? shells[0][1] : 0
  const first = shells.find(x => x[0] > 0)?.[1] ?? 0

  return { shells, contact, first, contactStep: (contact - first) * c.theta }
}

export const softenContact: CountTransform = (s, c) => {
  const first = countOutside(s, c, 1e-9)
  const counts = Int32Array.from(c.counts)

  for (let i = 0; i < s.count; i++) {
    if (radiusAt(s, i) === 0) {
      counts[i] = Math.min(counts[i]!, first)
    }
  }

  return withCounts(c, counts)
}

export const capCore =
  (radius: number): CountTransform =>
  (s, c) => {
    const cap = countOutside(s, c, radius)
    const counts = Int32Array.from(c.counts)

    for (let i = 0; i < s.count; i++) {
      counts[i] = Math.min(counts[i]!, cap)
    }

    return withCounts(c, counts)
  }

export const contactOnly: CountTransform = (s, c) => {
  const counts = new Int32Array(c.counts.length)

  for (let i = 0; i < s.count; i++) {
    if (radiusAt(s, i) === 0) {
      counts[i] = c.counts[i]!
    }
  }

  return withCounts(c, counts)
}
