// Measurement for E-SPN-0107: a lone love under the fine coin (code/rule/fine-coin), and the slow coin it is set against.
//
// THE FINE LONE LOVE'S BAND (fineBand, the closed form the runs are read against). One love, no pieces, fine coin
// zeta = e^(2 pi i/(3n)) = e^(i theta): keep (1 + zeta)/2, cross (1 - zeta)/2, then label 0 steps forward and label 1 back.
// On sum_X e^(iKX) (a0 |X, 0> + a1 |X, 1>) one beat is U(K) = diag(e^(-iK), e^(iK)) C, trace cos(K) (1 + zeta) =
// 2 cos K cos(theta/2) e^(i theta/2) and determinant zeta, so its eigenvalues are e^(i(m +- eps)), m = theta/2 = pi/(3n),
// cos eps = cos(K) cos(m). The quasi-energies are -m -+ eps. The band through E = 0 at K = 0 is E(K) = eps(K) - m, the
// other E(K) = -m - eps(K): the gap at K = 0 is 2m, the half-gap (the rest energy from the band center) m. Curvature
// E''(0) = cot m, so m* = tan m, and the top speed dE/dK = sin K cos m / sin eps reaches cos m at K = pi/2. n = 1 is
// code/measure/moving-level loneBand.
//
// THE SLOW COIN (slowBand), for the control: the working coin C acting only on the beats where a love's own count of
// beats mod n wraps, the love streaming freely otherwise. Over its n-beat period a love at momentum K takes
// C S(K)^n = C diag(e^(-inK), e^(inK)): the working walk with K replaced by nK, run once per n beats. Its per-beat
// band is E_n(K) = E_1(nK) / n: half-gap (pi/3)/n, E''(0) = n cot(pi/3), m* = tan(pi/3) / n, and top speed
// E_1'(nK) max = cos(pi/3) = 1/2. The inertia and the rest energy both scale by 1/n, so m*/E_rest stays tan(pi/3)/(pi/3):
// a rarer coin is the same walk on docks n times larger, not a lighter walk on these docks. Read here numerically from
// the 2 x 2 period operator, not from this closed form.
//
// NOTHING MOVES: these are readings. The floats are measurement.

import { eisenstein, type AxisRing } from '@/code/measure/held-cluster'
import { pointOrbit, type Entry } from '@/code/measure/moving-level'
import { type LineGauge } from '@/code/measure/permutation-meeting'
import { type BoundState } from '@/code/rule/bound-line-pieces'
import { sameConfiguration } from '@/code/rule/doublet-locked-knit'

type C = [number, number]
const cm = (x: C, y: C): C => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]

// the fine lone love's band at K: the band through 0 (upper false) or the other; its energy, dE/dK and eigenvector
export function fineBand(n: number, K: number, upper = false): { energy: number; slope: number; vector: C[] } {
  const m = Math.PI / (3 * n)
  const eps = Math.acos(Math.cos(K) * Math.cos(m))
  const energy = upper ? -m - eps : eps - m
  const slope = ((upper ? -1 : 1) * Math.sin(K) * Math.cos(m)) / Math.sin(eps)
  const z: C = [Math.cos(2 * m), Math.sin(2 * m)]
  const k0: C = [(1 + z[0]) / 2, z[1] / 2]
  const c0: C = [(1 - z[0]) / 2, -z[1] / 2]
  const lambda: C = [Math.cos(energy), -Math.sin(energy)]
  const eK: C = [Math.cos(K), -Math.sin(K)]
  // the first row of (U - lambda) v = 0: e^(-iK) (k0 a0 + c0 a1) = lambda a0; a0 = e^(-iK) c0, a1 = lambda - e^(-iK) k0
  const a0 = cm(eK, c0)
  const ek = cm(eK, k0)
  const a1: C = [lambda[0] - ek[0], lambda[1] - ek[1]]
  const norm = Math.sqrt(a0[0] ** 2 + a0[1] ** 2 + a1[0] ** 2 + a1[1] ** 2)

  return {
    energy,
    slope,
    vector: [
      [a0[0] / norm, a0[1] / norm],
      [a1[0] / norm, a1[1] / norm],
    ],
  }
}

// the fine lone love's Bloch state on a gauge's cover (no cost: the cut trit is 0 and stays 0)
export function fineLoneEntries(gauge: LineGauge, n: number, K: number, P: number, upper = false): Entry[] {
  const L = gauge.L
  const orbit = pointOrbit(gauge)
  const cover = orbit.length * L
  const scale = 1 / Math.sqrt(cover)
  const { vector } = fineBand(n, K, upper)
  const out: Entry[] = []

  for (let Y = 0; Y < cover; Y++) {
    const x = Y % L
    const p = (gauge.to[x] as number[])[orbit[Math.floor(Y / L) % orbit.length] as number] as number

    for (const j of [0, 1]) {
      const v = vector[j] as C
      const re = (v[0] * Math.cos(K * Y) - v[1] * Math.sin(K * Y)) * scale
      const im = (v[0] * Math.sin(K * Y) + v[1] * Math.cos(K * Y)) * scale
      const { a, b } = eisenstein(re, im, P)

      if (a !== 0n || b !== 0n) out.push({ ts: [{ x, j, p }], c: 0, a, b })
    }
  }

  return out
}

// a line of L docks with flat links, for the ring form (code/measure/bound-line pointBeatWith with `flat`): the slots
// of `like`, every point held at 0. A lone love's amplitudes do not read its point (only a meeting does), so on one
// love this is the rule's line at any length; the experiment checks it against the mesh's own ring at shared K
export function flatLine(L: number, like: AxisRing): AxisRing {
  return { docks: new Array<number>(L).fill(like.docks[0] as number), first: like.first, second: like.second, position: new Map() }
}

// two exact states equal bit for bit: the same slices, each with the same branches (amplitude, scale, configuration)
export function sameBoundState(a: BoundState, b: BoundState): boolean {
  return (
    a.size === b.size &&
    [...a].every(([k, x]) => {
      const y = b.get(k)

      return y !== undefined && y.branches.length === x.branches.length && x.branches.every(u => y.branches.some(v => v.a === u.a && v.b === u.b && v.k === u.k && sameConfiguration(u, v)))
    })
  )
}

// the k heaviest entries of a placed state (weight |a + b w|^2 = a^2 - ab + b^2, ties by place), in their order of
// weight: a piece small enough for the exact window under the fine count, which multiplies the slices
export function heaviestEntries(entries: readonly Entry[], k: number): Entry[] {
  const weight = (e: Entry): bigint => e.a * e.a - e.a * e.b + e.b * e.b

  return entries
    .map((e, i) => ({ e, i, w: weight(e) }))
    .sort((x, y) => (y.w > x.w ? 1 : y.w < x.w ? -1 : x.i - y.i))
    .slice(0, k)
    .map(x => x.e)
}

// ---- the slow coin's period operator, read numerically ----

// eigenvalues of a complex 2 x 2 [[a, b], [c, d]]
function eigen2(a: C, b: C, c: C, d: C): [C, C] {
  const tr: C = [a[0] + d[0], a[1] + d[1]]
  const ad = cm(a, d)
  const bc = cm(b, c)
  const det: C = [ad[0] - bc[0], ad[1] - bc[1]]
  const t2 = cm(tr, tr)
  const disc: C = [t2[0] - 4 * det[0], t2[1] - 4 * det[1]]
  const r = Math.sqrt(Math.hypot(disc[0], disc[1]))
  const phi = Math.atan2(disc[1], disc[0]) / 2
  const s: C = [r * Math.cos(phi), r * Math.sin(phi)]

  return [
    [(tr[0] + s[0]) / 2, (tr[1] + s[1]) / 2],
    [(tr[0] - s[0]) / 2, (tr[1] - s[1]) / 2],
  ]
}

// the slow coin's two per-beat quasi-energies at K: -arg(lambda) / n for the eigenvalues lambda of C S(K)^n, C the
// working coin (keep (1 + w)/2, cross (1 - w)/2), each taken in (-pi/n, pi/n]
export function slowEnergies(n: number, K: number): [number, number] {
  const keep: C = [0.25, Math.sqrt(3) / 4]
  const cross: C = [0.75, -Math.sqrt(3) / 4]
  const f: C = [Math.cos(n * K), -Math.sin(n * K)]
  const g: C = [Math.cos(n * K), Math.sin(n * K)]
  // C S^n: column 0 carries e^(-inK), column 1 e^(inK)
  const [l1, l2] = eigen2(cm(keep, f), cm(cross, g), cm(cross, f), cm(keep, g))

  return [-Math.atan2(l1[1], l1[0]) / n, -Math.atan2(l2[1], l2[0]) / n]
}

export type SlowReading = { n: number; halfGap: number; mass: number; ratio: number; top: number }

// the slow coin's half-gap (half the distance of its two energies at K = 0), m* from the second difference of the band
// through 0, and the top |dE/dK| over a grid of K in (0, pi/n) (the band followed by continuity)
export function slowReading(n: number, d = 1e-4, grid = 2048): SlowReading {
  const near = (K: number, to: number): number => {
    const [a, b] = slowEnergies(n, K)

    return Math.abs(a - to) <= Math.abs(b - to) ? a : b
  }
  const [a0, b0] = slowEnergies(n, 0)
  const zero = Math.abs(a0) <= Math.abs(b0) ? a0 : b0
  const halfGap = Math.abs(a0 - b0) / 2
  const mass = (d * d) / (near(d, zero) + near(-d, zero) - 2 * zero)
  let top = 0
  let prev = zero

  for (let s = 1; s < grid; s++) {
    const K = (Math.PI * s) / (n * grid)
    const e = near(K, prev)

    top = Math.max(top, (Math.abs(e - prev) * n * grid) / Math.PI)
    prev = e
  }

  return { n, halfGap, mass, ratio: mass / halfGap, top }
}
