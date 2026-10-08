// DOES THE STRING-BOUND MESON'S TOTAL INERTIA OVER ENERGY GO TO 1 WHEN D GROWS FASTER THAN n? (E-SPN-0113)
// E-SPN-0112 found the love-fear meson (code/measure/string-binding, string only, no meeting) held at every D 3 to 30
// at fine n = 1 with R = (m*/E_rest)/(tan m/m) 1.186 to 1.018, at n = 2 held at D 20 and 30 (R 1.010, 1.008), and at
// n = 4 held at no D up to 30 (the D 30 ground has span 18). The walk's factor tan m/m goes to 1 as n grows, so the
// TOTAL m*/E_rest should go to 1 on a joint path where D grows faster than n. This file derives how much faster and
// runs that path. note/project/vibe/roadmap/research/remaining-pieces.md, "1b and 1c".
//
// THE DERIVATION (stated before any gate was read). Two walkers of rest energy m = pi/(3n) (the half gap of the fine
// walk) and inertia tan m, bound by sigma |d| with sigma = pi/N, N = 2D + 1. Two conditions hold a level.
//  (i) IT FITS. Non-relativistically the only length is l = (sigma tan m)^(-1/3) (the scale of -phi''/tan m + sigma |d|
//      phi), and the even ground is Ai(|d|/l + a1'), a1' = -1.0188, whose weight beyond 3.10 l is 1e-3. So it fits the
//      reading window when N >= 3.10 l, i.e. N^(2/3) >= 3.10 (tan m / pi)^(-1/3): N grows as n^(1/2). Smallest odd N:
//      3, 5, 7, 9, 13 at n = 1, 2, 4, 8, 16 (tmp/meson2-airy.log). This is NOT the binding condition: at n = 4, D 30
//      (N 61) l is 4.2 and E-SPN-0112 held nothing.
//  (ii) IT DOES NOT LEAK THROUGH THE GAP. A walker at rest in a slope sigma meets the other branch 2m away in energy,
//      2m/sigma away in d; the Landau-Zener (Schwinger) weight through that gap is exp(-pi m^2/sigma) per passage. A
//      level is held only when that leak is under the tail the reading allows: pi m^2/sigma >= ln(1/TAIL), i.e.
//      N >= 9 n^2 ln(1/TAIL)/pi^2 = 6.30 n^2. N grows as n^2, so (ii) binds for every n >= 1. The record agrees
//      without a fitted constant: n = 1 at D 3 (exponent 7.67, held), n = 2 at D 12 (6.85, not held) and D 20 (11.2,
//      held), n = 4 at D 30 (4.18, not held).
//  THE DERIVED D(n): the smallest D with N = 2D + 1 >= 6.30 n^2: D(1) 3, D(2) 13, D(4) 50, D(8) 202, D(16) 806.
//  THE BOX: 2N, E-SPN-0112's (the wall is measurement): it holds the Airy size (13.5 docks mean at n = 16) and twice
//  the window, and C4 checks a wider one. At the path's largest point (n 16, D 1612) the box is 6,450 and each parity
//  block has 25,804 dimensions: the dense eigensolve is past any budget, so n >= 4 runs on the banded block
//  (code/measure/meson-band, checked against the dense one in C3).
//  THE READING RULE (E-SPN-0112's). The family is e0: the even-d particle level (pair reader's even reading at least
//  1/2). It is HELD iff its weight at |d| >= N is at most TAIL = 1e-3 AND its band followed from K = 0 to 2 pi/32 in
//  steps of pi/64 keeps every consecutive overlap at least 0.99. m* = 1/E''(0) (second difference 1e-2), E_rest =
//  2 pi/(3n) + E(0), E(0) the unwrapped energy against the walk's own zero (a lone walker at rest has phase 0).
//  THE FAMILY IS FOLLOWED, never the lowest level under a cut. n = 1, 2: E-SPN-0112's e0 at every D (the least
//  unwrapped even particle level of the dense spectrum, whatever its tail). n >= 4: seeded once, at the path's D
//  (2 D(n)), from the non-relativistic start (meson-band nrSeed), and CARRIED down in D (meson-band carry, steps of at
//  most a factor 1.1) through 1.5 D(n), D(n) and 0.6 D(n); the carry's least overlap is reported. C3 checks that the
//  seeded and carried family is the dense e0 where both can be computed (n = 2, D 26; n = 4, D 50).
//
// THE JOINT PATH: (n, 2 D(n)), k = 2: (1, 6), (2, 26), (4, 100), (8, 404), (16, 1612).
//
// GATES, fixed before the first run of this file.
//  J1 e0 is held at D(n), 1.5 D(n) (rounded) and 2 D(n) for every n in 1, 2, 4, 8, 16.
//  J2 along the path the total m*/E_rest falls strictly from each n to the next and is within 5% of 1 at n = 16.
//  J3 along the path the top group velocity (the largest |dE/dK| on the band followed from K = 0 to pi in steps of
//     pi/64, a symmetric difference, taken over the part where every consecutive overlap is at least 0.99) rises
//     strictly from each n to the next and is at least 0.95 at n = 16.
//  PASS iff J1, J2 and J3.
//  REPORTED, NOT GATED: (P1) at 0.6 D(n) the derivation predicts NOT held; (P2) the lone walk's top velocity at each n.
// CONTROLS (a failed control makes the verdict partial).
//  C1 E-SPN-0112 reproduced: the n = 1 e0 at D 3, 12, 30 and the n = 2 e0 at D 20, 30: energy and mean span to 1e-12,
//     m*, R and the band overlap to 1e-6 relative (m* is now read on the banded block; the recorded values are
//     tmp/meson-run1.log's metrics).
//  C2 no drift cost, nothing held: the dense spectrum with the cost off has no particle level with tail at most TAIL at
//     n = 1, D 3 and 12, and n = 4, D 50; the seeded level with the cost off has tail above TAIL at every path point n
//     >= 4.
//  C3 the instruments: the banded block leaks nothing to the odd block (0) and is unitary to 1e-12 at every point; at
//     n = 1, D 3 the banded e0 band (overlap) and m* equal the dense followPair and pairCurvature to 1e-9 relative; the
//     seed at n = 2, D 26 settles on the dense e0 (overlap at least 1 - 1e-9, energy 1e-9); the family carried down
//     to n = 4, D 50 is the dense e0 there (overlap at least 1 - 1e-9, energy 1e-9).
//  C4 the box: at n = 8, D 202 the level on box 2N and on box 2.5N (rounded) has the same energy to 1e-9.
//
// PREDICTED (before run 1): J1 holds at n 1, 2 (tmp/meson2-probe1.log: the n 2 D 13 e0 has tail 2.3e-7); n >= 4 not
// known. DISCLOSED PROBES (instrument only, no gate read): tmp/meson2-probe1.log, the banded m* at n 1 D 3 equals the
// dense to 6e-12; the seed at n 2 D 13, 20, 26 settles on the dense e0 (overlap 1); carrying n 2 D 26 -> 13 lands on
// the dense e0 (carry overlap 0.983); the dense n 4 D 50 e0 is E 0.1697 tail 4.8e-7 span 4.05 (75 s). The seed at n 1
// D 3 settles on another level (orthogonal to e0), so n 1 and 2 use the dense e0.
//
// RUN 1 (1703 s, tmp/meson2-run1.log, the record): PARTIAL (C4 fails), J1, J2, J3 fail, no gate moved.
//   n   D     role   held  E(0)    tail     span     m*/E_rest  R       band overlap  carry
//   1   2     below  yes   0.5890  6.5e-6   0.600    2.0200     1.2213  0.9994
//   1   3     D(n)   yes   0.4751  9.9e-8   0.679    1.9616     1.1860  0.9994
//   1   5     mid    yes   0.3553  1.0e-10  0.803    1.8225     1.1019  0.9993
//   1   6     path   yes   0.3189  3.6e-16  0.855    1.7930     1.0840  0.9986
//   2   8     below  no    0.4362  2.8e-7   1.835    0.1381     0.1252  0.8578
//   2   13    D(n)   yes   0.3108  2.3e-7   1.933    1.2135     1.1005  0.9968
//   2   20    mid    yes   0.2311  8.1e-10  2.117    1.1132     1.0096  0.9971
//   2   26    path   yes   0.1931  5.8e-10  2.265    1.1123     1.0088  0.9964
//   4   30    below  no    0.2549  1.4e-2   12.05    -0.2185    -0.2135 0.4886        0.752
//   4   50    D(n)   no    0.1697  4.8e-7   4.045    0.6678     0.6525  0.9711        0.997
//   4   75    mid    no    0.1271  1.2e-8   4.361    1.0545     1.0303  0.9787        0.999
//   4   100   path   no    0.1039  3.3e-13  4.663    1.0238     1.0003  0.9869
//   8   121   below  no    6.4903  0.55     264.5    0.1064     0.1058  0.1260        0.242
//   8   202   D(n)   no    0.0854  5.8e-5   9.794    0.6563     0.6526  0.0074        0.932
//   8   303   mid    no    0.0639  1.3e-5   9.742    1.0350     1.0291  0.9209        0.991
//   8   404   path   no    0.0521  4.2e-10  9.445    1.0062     1.0004  0.9511
//   16  484   below  no    7.3496  0.61     1138     -0.1957    -0.1955 0.0049        1e-4
//   16  806   D(n)   no    6.3295  0.15     552.2    1.3580     1.3561  0.0027        0.624
//   16  1209  mid    no    0.0321  8.5e-9   17.71    1.0042     1.0027  0.8266        0.999
//   16  1612  path   no    0.0262  9.6e-11  18.92    1.0026     1.0012  0.8265
// J1 fails: at n >= 4 no point is held. The TAIL half of the derivation holds at every n from D(n) up to n 8 (tail
// 4.8e-7, 5.8e-5), but the band half does not: the consecutive overlap is under 0.99 everywhere at n >= 4, and at n 16
// the carried family is lost before D(n) (carry 0.62, span 552). J2 fails only through J1: the path's total m*/E_rest
// is 1.7930, 1.1123, 1.0238, 1.0062, 1.0026, strictly falling and within 0.3% of 1 at n 16 (R 1.0840, 1.0088, 1.0003,
// 1.0004, 1.0012), but n >= 4 is not held. J3 fails: at n >= 4 the first K step already breaks 0.99, so no held band
// is left to read; the top speed is 0.354 at n 1 (lone 0.500), 0.809 at n 2 (lone 0.866). P1: below D(n) nothing is
// held at n >= 2; n 1 is held at D 2 too (m = 1.05 is far from the continuum). Controls: C1 every recorded number to
// 1e-11 or better; C2 no particle level inside with the cost off (least tails 0.44, 0.41, 0.40; seeded 0.50); C3 leak
// 0, unitarity 7e-16, banded against dense 6e-12, seed and carry onto the dense e0 to 2e-15; C4 FAILS: the n 8 D 202
// level moves 2.6e-8 between boxes 810 and 1013 (it is the not-held level there, so the box gap is its mixing).
// POST-RUN DIAGNOSTIC (tmp/meson2-probe2.log, no gate): on the path points the band's overlap loss shrinks with the
// step and E(2 pi/32) stays to 1e-6 (n 4 D 100: least overlap 0.987, 0.996, 0.998, 0.998 at steps pi/64 to pi/512;
// n 8 D 404: 0.951 to 0.998; n 16 D 1612: 0.827 to 0.984), so there the fixed step pi/64 is a large boost for a light
// meson rather than a crossing; at D(n) (n 4 D 50, n 8 D 202) the overlap jumps about with the step and E(K) changes:
// another level crosses the band, so the derived D(n) is too small by more than the tail says. The n 8 D 404 level
// has the same energy on boxes 1618 and 2023 to 7e-14.
//
// Depth L2: lattice Dirac walks bound by a linear string ('t Hooft, Schwinger); the leak condition is Landau-Zener /
// Schwinger. What could fail is whether the derived D(n) holds the level on the rule's walk, and whether the total
// inertia over energy then goes to 1.
// DETERMINISM: no random numbers. NOTHING MOVES: the coin and the cost write amplitudes on a dock's own line; the
// stream copies. HUSK FIRST: one husk line.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightN } from '@/code/measure/drift-cost-bloch'
import {
  followPair,
  meson,
  pairCurvature,
  pairLevels,
  type Meson,
  type PairLevel,
} from '@/code/measure/string-binding'
import {
  bandCurvature,
  carry,
  followBand,
  loneTopVelocity,
  nrSeed,
  overlapOf,
  pairBand,
  readBand,
  settle,
  type BandLevel,
} from '@/code/measure/meson-band'

const TAIL = 1e-3
const EVEN = 0.5
const HOLD = 0.99
const STEP = Math.PI / 64
const HOLD_KS: readonly number[] = [0, (2 * Math.PI) / 32]
const CURVE_D = 1e-2
const FINES: readonly number[] = [1, 2, 4, 8, 16]
const DENSE_FINES: readonly number[] = [1, 2]
const PATH_K = 2
const MID = 1.5
const BELOW = 0.6
const CARRY_RATIO = 1.1
const BOX = 2
const WIDE_BOX = 2.5
const TOTAL_TOL = 0.05
const V_TOP = 0.95
const DERIVED: Record<number, number> = {
  1: 3,
  2: 13,
  4: 50,
  8: 202,
  16: 806,
}
const RECORDED: readonly {
  n: number
  D: number
  energy: number
  mean: number
  mass: number
  R: number
  overlap: number
}[] = [
  {
    n: 1,
    D: 3,
    energy: 0.47512993741818427,
    mean: 0.6786578926127047,
    mass: 5.040263547545393,
    R: 1.1859554686134817,
    overlap: 0.9993788007935024,
  },
  {
    n: 1,
    D: 12,
    energy: 0.20832737092606626,
    mean: 1.0836774434704757,
    mass: 3.9676664070350443,
    R: 1.0417452804896854,
    overlap: 0.9990282880527138,
  },
  {
    n: 1,
    D: 30,
    energy: 0.1159897688219681,
    mean: 1.4840218032793966,
    mass: 3.721328317489105,
    R: 1.017883510434067,
    overlap: 0.9985204449182442,
  },
  {
    n: 2,
    D: 20,
    energy: 0.2310647646840834,
    mean: 2.117435241913141,
    mass: 1.4229595840708447,
    R: 1.00955928875228,
    overlap: 0.9970964599804423,
  },
  {
    n: 2,
    D: 30,
    energy: 0.17520695217737686,
    mean: 2.35376872716106,
    mass: 1.3585242869728256,
    R: 1.0078867024814155,
    overlap: 0.9965945967700558,
  },
]
const EXACT = 1e-12
const SAME = 1e-9
const REL = 1e-6
const UNITARY = 1e-12
const FREE_DENSE: readonly { n: number; D: number }[] = [
  { n: 1, D: 3 },
  { n: 1, D: 12 },
  { n: 4, D: 50 },
]
const SEED_CHECK = { n: 2, D: 26 }
const CARRY_CHECK = { n: 4, D: 50 }
const BOX_CHECK = { n: 8, D: 202 }

type Point = {
  n: number
  D: number
  box: number
  role: string
  held: boolean
  energy: number
  tail: number
  mean: number
  contact: number
  even: number
  overlap: number
  mass: number
  eRest: number
  R: number
  total: number
  carryOverlap: number
  leak: number
  unitarity: number
  level: BandLevel
}

const half = (n: number): number => Math.PI / (3 * n)
const loneRatio = (n: number): number => Math.tan(half(n)) / half(n)

// the derived D(n): the smallest D with N = 2D + 1 >= 9 n^2 ln(1/TAIL)/pi^2
function derivedD(n: number): number {
  const need = (9 * n * n * Math.log(1 / TAIL)) / Math.PI ** 2

  return Math.max(0, Math.ceil((need - 1) / 2))
}

const boxOf = (D: number): number => BOX * lightN(D)

// E-SPN-0112's e0 from the dense spectrum
function denseE0(
  n: number,
  D: number,
  withCost = true,
): { m: Meson; e0: PairLevel; levels: PairLevel[] } {
  const m = meson(D, boxOf(D), n)
  const levels = pairLevels(m, withCost).levels
  const e0 = levels
    .filter(l => l.parity === 0)
    .sort((a, b) => a.unwrapped - b.unwrapped)[0]!

  return { m, e0, levels }
}

// the reading of a level: held, m*, E_rest, R, total
function readPoint(
  level: BandLevel,
  n: number,
  role: string,
  carryOverlap: number,
): Point {
  const m = meson(level.D, level.box, n)
  const op = pairBand(m, 0, 0)
  const band = followBand(m, level, HOLD_KS, STEP)
  const mass = 1 / bandCurvature(m, band[0]!, CURVE_D)
  const eRest = 2 * half(n) + level.unwrapped
  const overlap = band[band.length - 1]!.overlap
  const held =
    level.even >= EVEN && level.tailN <= TAIL && overlap >= HOLD

  return {
    n,
    D: level.D,
    box: level.box,
    role,
    held,
    energy: level.unwrapped,
    tail: level.tailN,
    mean: level.mean,
    contact: level.contact,
    even: level.even,
    overlap,
    mass,
    eRest,
    R: mass / eRest / loneRatio(n),
    total: mass / eRest,
    carryOverlap,
    leak: op.leak,
    unitarity: op.unitarity,
    level,
  }
}

// the band from K = 0 to pi: the largest |dE/dK| over the held part
function topVelocity(
  level: BandLevel,
  n: number,
): { top: number; at: number; heldTo: number; residual: number } {
  const m = meson(level.D, level.box, n)
  const count = Math.round(Math.PI / STEP)
  const ks = Array.from({ length: count + 1 }, (_, s) => s * STEP)
  const track = followBand(m, level, ks, STEP)

  let top = 0
  let at = 0
  let heldTo = 0
  let residual = 0

  for (let s = 1; s < count; s++) {
    if (track[s + 1]!.overlap < HOLD) {
      break
    }

    heldTo = track[s + 1]!.K
    residual = Math.max(residual, track[s + 1]!.residual)

    const v =
      Math.abs(track[s + 1]!.energy - track[s - 1]!.energy) / (2 * STEP)

    if (v > top) {
      top = v
      at = track[s]!.K
    }
  }

  return { top, at, heldTo, residual }
}

export default experiment({
  id: 'spin/meson-joint-limit',
  code: 'E-SPN-0113',
  title:
    'the string-bound love-fear meson on the joint path D = 2 D(n), with D(n) derived from the gap leak exp(-pi m^2/sigma) <= 1e-3 (N >= 6.30 n^2: D 3, 13, 50, 202, 806 at n = 1, 2, 4, 8, 16), partial and failing: its total m*/E_rest falls 1.793, 1.112, 1.024, 1.006, 1.003 (R 1.084, 1.009, 1.000, 1.000, 1.001, size 0.86 to 18.9 docks), but at n >= 4 no level is held, since the tail is small from D(n) on while the band followed in fixed K steps of pi/64 loses overlap (0.987 at n 4, 0.83 at n 16 on the path, and another level crosses at D(n) itself), so the held-band and top-velocity gates fail; E-SPN-0112 reproduced, no cost holds nothing, and the box control at n = 8, D 202 fails (2.6e-8, the not-held level)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const secs = (): number => Math.round((Date.now() - started) / 1000)
    const f3 = (x: number): string => x.toFixed(3)
    const f4 = (x: number): string => x.toFixed(4)
    const e2 = (x: number): string => x.toExponential(2)
    const log = (s: string): void =>
      console.error(`${s}; at ${secs()} s`)
    const show = (p: Point): string =>
      `n ${p.n} D ${p.D} (${p.role}, box ${p.box}): ${p.held ? 'held' : 'NOT held'} E ${f4(p.energy)} tail ${e2(p.tail)} span ${f3(p.mean)} contact ${f3(p.contact)} even ${f3(p.even)} overlap ${f4(p.overlap)} m* ${f4(p.mass)} E_rest ${f4(p.eRest)} m*/E_rest ${f4(p.total)} R ${f4(p.R)}${p.carryOverlap < 1 ? ` carry ${f4(p.carryOverlap)}` : ''}`

    // ---- the derived D(n) ----
    const derived = FINES.map(n => ({ n, D: derivedD(n) }))
    const derivedAsStated = derived.every(d => d.D === DERIVED[d.n])

    log(
      `derived D(n): ${derived.map(d => `n ${d.n} D ${d.D} N ${lightN(d.D)}`).join(', ')}; as stated ${derivedAsStated}`,
    )

    // ---- the points ----
    const plan = (n: number): { role: string; D: number }[] => {
      const Dn = derivedD(n)

      return [
        { role: 'below', D: Math.max(1, Math.round(BELOW * Dn)) },
        { role: 'D(n)', D: Dn },
        { role: 'mid', D: Math.round(MID * Dn) },
        { role: 'path', D: PATH_K * Dn },
      ]
    }

    const points: Point[] = []

    for (const n of FINES) {
      const wanted = plan(n)

      if (DENSE_FINES.includes(n)) {
        for (const w of wanted) {
          const { m, e0 } = denseE0(n, w.D)
          const level = readBand(m, e0.block, e0.energy, 0)
          const p = readPoint(level, n, w.role, 1)

          points.push(p)
          log(show(p))
        }

        continue
      }

      // seeded at the path's D, carried down
      const top = wanted[wanted.length - 1]!
      const mTop = meson(top.D, boxOf(top.D), n)

      let level = settle(mTop, nrSeed(mTop))
      let least = 1

      const got: Point[] = [readPoint(level, n, top.role, 1)]

      log(show(got[0]!))

      for (const w of wanted.slice(0, -1).reverse()) {
        while (level.D > w.D) {
          const D = Math.max(w.D, Math.floor(level.D / CARRY_RATIO))
          const c = carry(level, D, boxOf(D))

          least = Math.min(least, c.overlap)
          level = c.level
        }

        const p = readPoint(level, n, w.role, least)

        got.push(p)
        log(show(p))
      }

      points.push(...got.reverse())
    }

    const at = (n: number, role: string): Point =>
      points.find(p => p.n === n && p.role === role)!

    // J1
    const j1Missing = points.filter(p => p.role !== 'below' && !p.held)
    const J1 = j1Missing.length === 0
    // J2
    const path = FINES.map(n => at(n, 'path'))
    const falls = path.every(
      (p, i) => i === 0 || p.total < path[i - 1]!.total,
    )
    const lastTotal = path[path.length - 1]!.total
    const J2 =
      path.every(p => p.held) &&
      falls &&
      Math.abs(lastTotal - 1) <= TOTAL_TOL
    // J3
    const velocity = path.map(p => ({
      n: p.n,
      ...topVelocity(p.level, p.n),
      lone: loneTopVelocity(p.n),
    }))

    for (const v of velocity) {
      log(
        `velocity n ${v.n}: top ${f4(v.top)} at K ${f3(v.at)} held to K ${f3(v.heldTo)} (lone walk ${f4(v.lone)})`,
      )
    }

    const rises = velocity.every(
      (v, i) => i === 0 || v.top > velocity[i - 1]!.top,
    )
    const lastV = velocity[velocity.length - 1]!.top
    const J3 = path.every(p => p.held) && rises && lastV >= V_TOP
    const below = FINES.map(n => at(n, 'below'))

    // ---- controls ----
    // C1: E-SPN-0112
    const c1Rows = RECORDED.map(r => {
      const { m, e0 } = denseE0(r.n, r.D)
      const p = readPoint(
        readBand(m, e0.block, e0.energy, 0),
        r.n,
        'recorded',
        1,
      )
      const ok =
        Math.abs(p.energy - r.energy) <= EXACT &&
        Math.abs(p.mean - r.mean) <= EXACT &&
        Math.abs(p.mass / r.mass - 1) <= REL &&
        Math.abs(p.R / r.R - 1) <= REL &&
        Math.abs(p.overlap / r.overlap - 1) <= REL

      return { ...r, got: p, ok }
    })
    const c1 = c1Rows.every(r => r.ok)

    log(
      `C1 ${c1Rows.map(r => `n ${r.n} D ${r.D}: E ${r.got.energy} m* ${r.got.mass} R ${r.got.R} overlap ${r.got.overlap} ${r.ok}`).join('; ')}`,
    )

    // C2: no cost
    const freeDense = FREE_DENSE.map(f => {
      const { levels } = denseE0(f.n, f.D, false)

      return {
        ...f,
        inside: levels.filter(l => l.tailN <= TAIL).length,
        least: Math.min(...levels.map(l => l.tailN)),
      }
    })
    const freeSeeded = path
      .filter(p => !DENSE_FINES.includes(p.n))
      .map(p => {
        const m = meson(p.D, p.box, p.n)
        const l = settle(m, nrSeed(m), undefined, false)

        return { n: p.n, D: p.D, tail: l.tailN }
      })
    const c2 =
      freeDense.every(f => f.inside === 0) &&
      freeSeeded.every(f => f.tail > TAIL)

    log(
      `C2 dense ${freeDense.map(f => `n ${f.n} D ${f.D} inside ${f.inside} least ${e2(f.least)}`).join(', ')}; seeded ${freeSeeded.map(f => `n ${f.n} D ${f.D} tail ${e2(f.tail)}`).join(', ')}: ${c2}`,
    )

    // C3: instruments
    const leak = Math.max(...points.map(p => p.leak))
    const unitarity = Math.max(...points.map(p => p.unitarity))
    const d3 = denseE0(1, 3)
    const denseBand = followPair(d3.m, d3.e0, HOLD_KS, STEP)
    const denseMass = 1 / pairCurvature(d3.m, 0, denseBand[0]!, CURVE_D)
    const p13 = at(1, 'D(n)')
    const bandGap = Math.max(
      Math.abs(p13.mass / denseMass - 1),
      Math.abs(
        p13.overlap / denseBand[denseBand.length - 1]!.overlap - 1,
      ),
    )
    const seedDense = denseE0(SEED_CHECK.n, SEED_CHECK.D)
    const seeded = settle(seedDense.m, nrSeed(seedDense.m))
    const seedOverlap = overlapOf(seeded.block, seedDense.e0.block)
    const seedGap = Math.abs(seeded.unwrapped - seedDense.e0.unwrapped)
    const carryDense = denseE0(CARRY_CHECK.n, CARRY_CHECK.D)
    const carried = at(CARRY_CHECK.n, 'D(n)').level
    const carryOverlap = overlapOf(carried.block, carryDense.e0.block)
    const carryGap = Math.abs(
      carried.unwrapped - carryDense.e0.unwrapped,
    )
    const c3 =
      leak === 0 &&
      unitarity <= UNITARY &&
      bandGap <= SAME &&
      seedOverlap >= 1 - SAME &&
      seedGap <= SAME &&
      carryOverlap >= 1 - SAME &&
      carryGap <= SAME

    log(
      `C3 leak ${e2(leak)} unitarity ${e2(unitarity)} band gap ${e2(bandGap)} seed overlap ${1 - seedOverlap} gap ${e2(seedGap)} carry overlap ${1 - carryOverlap} gap ${e2(carryGap)} (dense e0 at n 4 D 50: E ${carryDense.e0.unwrapped} tail ${e2(carryDense.e0.tailN)} span ${f3(carryDense.e0.mean)}): ${c3}`,
    )

    // C4: box
    const boxLevel = at(BOX_CHECK.n, 'D(n)').level
    const wide = carry(
      boxLevel,
      BOX_CHECK.D,
      Math.round(WIDE_BOX * lightN(BOX_CHECK.D)),
    )
    const boxGap = Math.abs(wide.level.unwrapped - boxLevel.unwrapped)
    const c4 = boxGap <= SAME

    log(
      `C4 box ${boxLevel.box} vs ${wide.level.box}: gap ${e2(boxGap)}: ${c4}`,
    )

    const control = c1 && c2 && c3 && c4 && derivedAsStated
    const status = !control
      ? 'partial'
      : J1 && J2 && J3
        ? 'pass'
        : 'fail'
    const metrics: Record<string, number> = {
      J1: J1 ? 1 : 0,
      J2: J2 ? 1 : 0,
      J3: J3 ? 1 : 0,
      control: control ? 1 : 0,
      C1: c1 ? 1 : 0,
      C2: c2 ? 1 : 0,
      C3: c3 ? 1 : 0,
      C4: c4 ? 1 : 0,
      derivedAsStated: derivedAsStated ? 1 : 0,
      lastTotal,
      lastVelocity: lastV,
      leak,
      unitarity,
      bandGap,
      seedOverlap,
      seedGap,
      carryOverlap,
      carryGap,
      boxGap,
      seconds: (Date.now() - started) / 1000,
    }

    for (const d of derived) {
      metrics[`derived_n${d.n}`] = d.D
    }

    for (const p of points) {
      const k = `n${p.n}_D${p.D}`

      metrics[`${k}_held`] = p.held ? 1 : 0
      metrics[`${k}_energy`] = p.energy
      metrics[`${k}_tail`] = p.tail
      metrics[`${k}_mean`] = p.mean
      metrics[`${k}_contact`] = p.contact
      metrics[`${k}_even`] = p.even
      metrics[`${k}_overlap`] = p.overlap
      metrics[`${k}_mass`] = p.mass
      metrics[`${k}_total`] = p.total
      metrics[`${k}_R`] = p.R
      metrics[`${k}_carry`] = p.carryOverlap
    }

    for (const v of velocity) {
      metrics[`velocity_n${v.n}`] = v.top
      metrics[`velocity_n${v.n}_heldTo`] = v.heldTo
      metrics[`velocity_n${v.n}_lone`] = v.lone
    }

    for (const f of freeDense) {
      metrics[`free_n${f.n}_D${f.D}_inside`] = f.inside
    }

    for (const f of freeSeeded) {
      metrics[`free_n${f.n}_D${f.D}_tail`] = f.tail
    }

    const g = (x: boolean): string => (x ? 'holds' : 'fails')

    return verdict({
      status,
      claim: `Derived D(n) (leak exp(-pi m^2/sigma) <= ${TAIL}): ${derived.map(d => `${d.n}: ${d.D}`).join(', ')}. ${points.map(show).join('; ')}. J1 ${g(J1)}${J1 ? '' : ` (not held: ${j1Missing.map(p => `n ${p.n} D ${p.D}`).join(', ')})`}; J2 ${g(J2)} (total ${path.map(p => f4(p.total)).join(', ')}); J3 ${g(J3)} (top velocity ${velocity.map(v => f4(v.top)).join(', ')}, lone ${velocity.map(v => f4(v.lone)).join(', ')}); below D(n) held: ${below.map(p => `n ${p.n} ${p.held}`).join(', ')}. Controls: C1 ${c1}, C2 ${c2}, C3 ${c3}, C4 ${c4}`,
      metrics,
      control: {
        C1: c1 ? 1 : 0,
        C2: c2 ? 1 : 0,
        C3: c3 ? 1 : 0,
        C4: c4 ? 1 : 0,
      },
      notes: `L2. Velocity: ${velocity.map(v => `n ${v.n} top ${f4(v.top)} at K ${f3(v.at)}, held to K ${f3(v.heldTo)}`).join('; ')}. C1 ${c1Rows.map(r => `n ${r.n} D ${r.D} ${r.ok}`).join(', ')}. ${secs()} s.`,
    })
  },
})
