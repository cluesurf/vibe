// ON ONE LINE, IS A LOCAL LINK-FLUX STRING THE SAME AS THE INSTANTANEOUS SEPARATION COST, AND WHERE DOES THE MESON'S R
// EXCESS COME FROM (E-SPN-0149)? E-SPN-0146 to 0148 bound a love-fear composite on the swap-coin rule in 4d with a cost
// read from both charges at once (d4Steps of their separation, as a phase or a mixer angle), and its R = inertia c*^2 /
// E_rest came out 1.027, 1.568, 1.396. Three candidates for R != 1: (i) a lattice-scale member mass (m of order 1 rad),
// (ii) the cost being nonlocal and instantaneous in the lab frame (not boost covariant), (iii) binding comparable to the
// rest energy. This file separates them on the 1d reduction, the love-fear meson of code/measure/string-binding (the fine
// coin, rest energy m = pi/(3n), string sigma = pi/N a link, N = 2D + 1), where E-SPN-0113 to 0115 read the total
// m*/E_rest 1.793, 1.112, 1.024, 1.004, 1.003 on the joint path D = 2 D(n).
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/link-flux lineBeat, lineRegisterColumn; code/measure/meson-band).
// 1. ON A LINE THE LOCAL STRING IS THE INSTANTANEOUS ONE. A Z3 flux on every link, changed by -q along its motion by
//    each charge that crosses it, costing a phase per link that holds flux (Kogut-Susskind, electric term only). Gauss's
//    law div E = rho mod 3 is kept by every hop, and on a line it leaves the flux no freedom: E(y, y + 1) = sum of the
//    charges at x <= y (no flux at infinity), which for a love and a fear is 1 on the |d| links between them. So the
//    register's cost IS |d| on every branch, and the register form of the beat is string-binding's pairColumn column for
//    column, bit for bit (the same arithmetic in the same order). Candidate (ii) has no separate existence in 1d: in 1+1
//    dimensions the Coulomb-gauge linear potential is the whole gauge field, and a local link string cannot differ from
//    it. Whatever R does here, (a) and (b) do it identically.
// 2. WHERE (ii) LIVES: THE STRING'S TRANSVERSE INERTIA. Two members of rest energy m bound by an instantaneous linear
//    cost, total momentum P shared as P/2 + q and P/2 - q: the first order in P cancels, and the Hessian of sqrt(m^2 +
//    p^2) averaged over directions in d dimensions gives 1/M = (1/2m)(1 - (1/2 + 1/d) <q^2>/m^2), so M = 2m + (1 + 2/d) T
//    (T = <q^2>/m the kinetic energy), while the virial theorem for a linear potential, <V> = 2T, gives E_rest = 2m + 3T.
//        R_bind = M / E_rest = 1 - (2 - 2/d) T / (2m + 3T) + O((T/m)^2)
//    d = 1: R_bind = 1 at first order. In d > 1 the missing (2 - 2/d) T is exactly the inertia of a relativistic string
//    moving with the pair: a straight string of energy sigma L moving transversely carries inertia sigma L, longitudinally
//    none, and averaged over orientations that is sigma <L> (d - 1)/d = 2T (d - 1)/d. So the instantaneous cost's defect
//    is the string's missing transverse inertia; it vanishes on a line and costs (1.5 T)/(2m + 3T) in 4d.
// 3. (i) THE LATTICE MASS. The lone fine walk is cos(E + m) = cos m cos k (E-SPN-0143 point 2a at the fine coin), whose
//    rest inertia is tan m, so the members' own R_walk = tan(m)/m = 1 + m^2/3 + ...: the 1d meson's R_total = m*/E_rest
//    is R_walk R_bind, and on the continuum path (m -> 0 at fixed sigma/m^2) the lattice part falls as n^-2.
// 4. (iii) BINDING, AND THE KLEIN CHANNEL. Both are functions of r = sigma/m^2 on this family: T/m ~ r^(2/3) (the linear
//    well's only scale) and the Klein (Schwinger) channel, a member into the other branch with the string paying 2m, opens
//    as exp(-pi m^2/sigma) = exp(-pi/r). Point 2 removes (iii)'s first order in 1d; its second order is O(r^(4/3)), smooth
//    in r. The Klein channel turns on sharply below r ~ 0.23 (the path's exp(-pi/r) = 1e-6); its admixture (the weight
//    off the particle sector, 1 - even) carries inertia the level does not use to move (E-SPN-0113 read R 1.030 at
//    1.5 D(n) and 0.65 at D(n), n = 4 and 8, against 1.0003 at 2 D(n)). READ, gating nothing: the positive-branch potential
//    model's inertia on the level's own momentum content (string-binding pairModelInertia), whose own second order is 1 +
//    2.25 <x>^2 - 1.25 <x^2> (x = q^2/m^2): where it misses and the walk does not, the walk's extra covariance sits in what
//    the model lacks (its Klein components).
// 5. THE GRID. n = 1, 2, 4, 8, 16 and D = k D(n) for k = 1, 1.5, 2, 3, 4 (D(n) E-SPN-0113's: the least D with 2D + 1 >=
//    9 n^2 ln(1e3)/pi^2), so r = 9 n^2/(pi (2D + 1)) runs 0.45 .. 0.11 at every n and k = 2 is E-SPN-0113's path. The
//    family is E-SPN-0113's e0: the least unwrapped even-block particle level of the dense spectrum at n = 1, 2; at n >= 4
//    the non-relativistic seed settled at 4 D(n) and CARRIED down through 3, 2, 1.5, 1 D(n) (meson-band carry, steps of
//    at most a factor 1.1). m* = 1/E''(0) by a symmetric second difference of half-width E_rest/64 (E-SPN-0114's).
//
// PREDICTED: F1 holds exactly (bit for bit); L1 holds (R_bind within 3e-3 of 1 at n >= 4 on k = 2 and 4, R_total - 1
// falling as n^-2 to within 3e-3 of the lattice part); L2 holds (at k = 3, 4 R_bind within 3e-3 at n = 4, 8, 16 while at
// k = 1 it is at least 1e-2 off, with a Klein content at least ten times the k = 3 point's). The source of R != 1 in 1d:
// (i) and, for strong strings, the Klein channel; not (ii) (absent) and not (iii) beyond 3e-3 at T/m ~ 0.13.
//
// GATES, fixed before the gate run.
//  F1 THE REGISTER IS THE INSTANTANEOUS COST, EXACTLY: (a) at (n, D) = (1, 3), (2, 13), (4, 50), both parity blocks, every
//     basis column, K = 0, 0.3, 1.1: the register column (lineRegisterColumn, pi l / N as string-binding writes it) has
//     the same targets as pairColumn and equal floats (===), and every branch's register is the Gauss flux of its own
//     positions; (b) at n = 2, D = 13, a superposition of 12 starts (d0 = 0, 2, 6, the four labels) run 32 beats in
//     absolute coordinates with the register and with the instantaneous cost: the same branches with equal floats (===) at
//     every beat, and every register equal to Gauss.
//  L1 THE CONTINUUM PATH. On k = 2 and k = 4: every point at n >= 2 held (tail <= 1e-3 at |d| >= N, even >= 1/2); |R_bind
//     - 1| <= 3e-3 at n = 4, 8, 16; R_total - 1 falls strictly n = 2 -> 4 -> 8 -> 16 with |R_total - 1| <= 5e-3 at n = 16;
//     and the least-squares slope of ln(R_total - 1) on ln n over n = 2, 4, 8 on k = 4 is in [-2.6, -1.6] (predicted -2).
//  L2 THE SOURCE. (a) and (b) are one operator (F1), so they have one R; and at n = 4, 8, 16: |R_bind - 1| <= 3e-3 at k =
//     3 and 4, while at k = 1 (n = 4 and 8) |R_bind - 1| >= 1e-2 with a Klein content 1 - even at least ten times the k = 3
//     point's.
// CONTROLS (a failure makes the verdict partial). C1 E-SPN-0114 reproduced on k = 2: E(0) to 1e-9 of E-SPN-0115's
//  recorded values and the total m*/E_rest to 5e-5 of 1.7931, 1.1124, 1.0238, 1.0043, 1.0026. C2 no cost, nothing held:
//  at n = 1, 2 (k = 2) the dense spectrum with the cost off has no particle level with tail <= 1e-3, and at n >= 4 the
//  seed settled with the cost off has tail > 1e-3. C3 F1 can fail: the register with the fear's charge written +1, run as
//  F1 (b), breaks Gauss on some branch and differs from the instantaneous run on some beat. (As first written C3 asked
//  this of F1 (a)'s one-beat columns; the smoke found that a one-beat column reads only the start's register, which is
//  Gauss's by construction, so the wrong update cannot show there: 1,308 columns equal, 5,184 branches off Gauss. C3 was
//  moved to the multi-beat run before the gate run, and the one-beat reading is printed beside it.)
// READ, gating nothing: per point E_rest, m*, R_walk, R_bind, r, the Schwinger exponent pi/r, the Klein content, the mean
//  |d|, the carry overlap, and R_pm = (the potential model's inertia on the level's momentum content) / E_rest.
// Verdict: partial if a control fails; pass if F1, L1 and L2 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (written after the gates above; no gate moved). A smoke of every code path on n
// = 1, 2, 4 at all five k (tmp/lflux-1d-smoke.log, 136 s; it reads the gate grid's first three fines): F1 held (6,516
// columns, 32 beats of up to 4,480 branches, bit for bit, Gauss on every branch); it found C3's defect (above); C1 and C2
// held at n = 1, 2, 4 (E(0) at n = 4 equal to E-SPN-0115's to 4e-17). Read there: R_bind at n = 4 is 1.00102, 1.00137,
// 1.00032, 1.03014, 0.65624 at k = 4, 3, 2, 1.5, 1, and the Klein content 9.7e-4, 1.64e-3, 3.46e-3, 6.7e-3, 1.68e-2, so
// L2's Klein clause at n = 4 stands at 10.2 against its 10: a knife edge, recorded here before the gate run and not
// moved. The Klein content grows smoothly with r (about as r^2), not as exp(-pi/r), while R_bind jumps between k = 2 and
// 1.5: the reading that separates the Klein channel is R_bind's jump, and 1 - even is a weaker witness of it than point 4
// assumed. R_pm reads 1.0082, 1.0030, 0.9931, 0.9843, 0.9694 at n = 4 against R_total 1.0245 .. 0.6717: the positive-
// branch potential model sits 1.6% to 3% under the walk on the clean points.
//
// FIRST RUN (tmp/lflux-1d-exp-run1.log, 544 s): PASS on F1, L1 and L2, every control clean, no gate moved.
//   n   k    D     r      R_total   R_walk    R_bind    Klein     tail
//   4   4    200   0.114  1.02453   1.02349   1.00102   9.7e-4    9e-21
//   4   3    150   0.152  1.02489   1.02349   1.00137   1.6e-3    1e-18
//   4   2    100   0.228  1.02382   1.02349   1.00032   3.5e-3    3e-13
//   4   1.5  75    0.304  1.05434   1.02349   1.03014   6.7e-3    1e-8
//   4   1    50    0.454  0.67166   1.02349   0.65624   1.7e-2    5e-7
//   8   4    808   0.113  1.00604   1.00575   1.00029   9.1e-4    2e-23
//   8   3    606   0.151  1.00612   1.00575   1.00037   1.5e-3    1e-18
//   8   2    404   0.227  1.00428   1.00575   0.99853   3.4e-3    4e-10
//   8   1.5  303   0.302  0.85364   1.00575   0.84876   2.3e-2    1e-5
//   8   1    202   0.453  0.35673   1.00575   0.35469   5.8e-2    6e-5
//   16  4    3224  0.114  1.00155   1.00143   1.00012   9.0e-4    4e-24
//   16  3    2418  0.152  1.00157   1.00143   1.00014   1.5e-3    4e-18
//   16  2    1612  0.227  1.00259   1.00143   1.00116   3.3e-3    1e-10
//   16  1.5  1209  0.303  1.00286   1.00143   1.00143   6.7e-3    9e-9
//   16  1    806   0.455  NOT held: the carried family lost (carry 0.62, E(0) 6.33), E-SPN-0113's finding
//  (n = 1 and 2 in the notes: R_bind 1.042 .. 1.186 and 1.004 .. 1.099, the lattice cross terms at m of order 1.)
//  - F1: 6,516 columns and 32 beats (up to 4,480 branches) equal bit for bit, Gauss on every branch. C3: the wrong fear
//    charge differs on 136,359 branch-beats and breaks Gauss on 134,016 (the one-beat columns stay equal, as disclosed).
//  - L1: every clean point held; |R_bind - 1| at most 1.4e-3 at n >= 4 on k = 2 and 4 (gate 3e-3); R_total - 1 falls
//    0.1124, 0.0238, 0.0043, 0.0026 (k = 2) and 0.1076, 0.0245, 0.0060, 0.0016 (k = 4); the slope over n = 2, 4, 8 on
//    k = 4 is -2.078 (predicted -2): R_total - 1 is the lattice part m^2/3, n^-2, to within the 1e-3 binding floor.
//  - L2: at k = 3, 4 R_bind is 1.0001 to 1.0014 (n = 4, 8, 16); at k = 1 it is 0.656 (n = 4) and 0.355 (n = 8), with a
//    Klein content 10.2 and 37.9 times the k = 3 point's (the n = 4 clause at its disclosed knife edge, passed by 2%).
//    The strong-string defect is not smooth in r: at n = 16, k = 1.5 R_bind is still 1.0014, while at n = 8 it is 0.849
//    and at n = 4 1.030. It appears where the family's energy meets a Klein level (the carry overlap drops, 0.991 and
//    0.932 at n = 8), which is where it sits in r differently at each n: it is the Klein crossing, not binding strength.
//  - C1: E(0) and the totals reproduce E-SPN-0114/0115 (1.79308, 1.11240, 1.02382, 1.00428, 1.00259). C2: no cost, no level.
//  THE ANSWER FOR 1D. (a) and (b) are one operator. R_total -> 1 on the continuum path at fixed r as n^-2 (candidate (i),
//  the lattice mass, is the whole clean excess); binding with E_b/m up to 0.4 moves R by at most 1.4e-3 (candidate (iii)
//  is below that floor); and the large excursions at strong strings are Klein crossings (the 1d image of the 4d flipped
//  member channel). Candidate (ii) cannot be tested on a line at all: its content, per point 2, is the string's missing
//  transverse inertia, which needs d > 1. The positive-branch potential model on each level's own momentum content (R_pm)
//  reads 0.993 .. 1.008 (n = 4), 0.975 .. 0.990 (n = 8), 0.970 .. 0.986 (n = 16) on k = 2 .. 4: it stays 1.6 to 3% under
//  1 as n grows at fixed r, which is its own second order (1 + 2.25 <x>^2 - 1.25 <x^2>, x = q^2/m^2, constant on the
//  path), while the walk goes to 1. So the naive (iii) term exists in the model and is cancelled in the walk: the walk's
//  covariance beyond the potential model is carried by its Klein (negative-branch) components, as in the 't Hooft model.
//
// Depth L1 (Gauss's law on a line, the inertia expansion) and L2 (a lattice Dirac pair bound by a linear string, 't Hooft
// and Schwinger). DETERMINISM: no random numbers; placed starts, Weyl amplitudes. NOTHING MOVES: the coin writes
// amplitudes on a dock's own line, the stream takes each value one dock along, the register is a value on a link.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { lightN } from '@/code/measure/drift-cost-bloch'
import { meson, pairColumn, pairEmbed, pairLevels, pairModelInertia, parityIndices, type Meson } from '@/code/measure/string-binding'
import { bandCurvature, carry, nrSeed, readBand, settle, type BandLevel } from '@/code/measure/meson-band'
import { lineBeat, lineGauss, lineRegisterColumn, lineStateKey, type LineBranch } from '@/code/measure/link-flux'

const TAIL = 1e-3
const EVEN = 0.5
const CURVE_FRAC = 1 / 64
const CARRY_RATIO = 1.1
const BOX = 2
const BIND = 3e-3
const LAST = 5e-3
const OFF = 1e-2
const KLEIN_RATIO = 10
const SLOPE: readonly [number, number] = [-2.6, -1.6]
const SAME = 1e-9
const TOTAL_SAME = 5e-5
const COLUMN_POINTS: readonly [number, number][] = [
  [1, 3],
  [2, 13],
  [4, 50],
]
const COLUMN_K: readonly number[] = [0, 0.3, 1.1]
const RUN_POINT: readonly [number, number] = [2, 13]
const RUN_BEATS = 32
const RUN_D0: readonly number[] = [0, 2, 6]
// E-SPN-0115's recorded E(0) on the path and E-SPN-0114's printed totals
const RECORDED_ENERGY: Record<number, number> = { 1: 0.3188654375223234, 2: 0.19314564649226765, 4: 0.10386658008071757, 8: 0.05213891233226967, 16: 0.026185373288082 }
const RECORDED_TOTAL: Record<number, number> = { 1: 1.7931, 2: 1.1124, 4: 1.0238, 8: 1.0043, 16: 1.0026 }

export type LineFluxPlan = { fines: readonly number[]; mults: readonly number[]; dense: readonly number[] }

export const GATE_PLAN: LineFluxPlan = { fines: [1, 2, 4, 8, 16], mults: [1, 1.5, 2, 3, 4], dense: [1, 2] }

export default experiment({
  id: 'spin/line-flux-string',
  code: 'E-SPN-0149',
  title: 'on one line the local Z3 link-flux string is the instantaneous separation cost bit for bit (Gauss leaves the flux no freedom; 6,516 columns and 32 beats equal, Gauss on every branch), so candidate (ii) has no separate existence in 1d, pass: on the continuum path the meson R_total - 1 falls as n^-2.08 (the lattice mass tan m/m, 1.0016 at n = 16), binding with E_b/m up to 0.4 moves R by at most 1.4e-3 while the positive-branch potential model stays 1.6 to 3% low, and the large strong-string excursions (R 0.35 to 1.03) are Klein crossings; the missing inertia of an instantaneous string in d > 1 is derived to be the string transverse inertia (2 - 2/d) T',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return lineFluxRun(GATE_PLAN)
  },
})

const half = (n: number): number => Math.PI / (3 * n)

// E-SPN-0113's D(n): the least D with 2D + 1 >= 9 n^2 ln(1/TAIL)/pi^2
function derivedD(n: number): number {
  return Math.max(0, Math.ceil(((9 * n * n * Math.log(1 / TAIL)) / Math.PI ** 2 - 1) / 2))
}

const boxOf = (D: number): number => BOX * lightN(D)

type Point = {
  n: number
  k: number
  D: number
  N: number
  r: number
  held: boolean
  energy: number
  eRest: number
  mass: number
  total: number
  walk: number
  bind: number
  klein: number
  tail: number
  mean: number
  carry: number
  model: number
}

function readPoint(level: BandLevel, n: number, k: number, carryOverlap: number): Point {
  const m = meson(level.D, level.box, n)
  const eRest = 2 * half(n) + level.unwrapped
  const mass = 1 / bandCurvature(m, { K: 0, energy: level.unwrapped, overlap: 1, residual: 0, vector: level.block }, eRest * CURVE_FRAC)
  const N = lightN(level.D)
  const walk = Math.tan(half(n)) / half(n)
  const model = pairModelInertia(m, 2 * m.box + 6, pairEmbed(m, 0, level.block)).inertia

  return {
    n,
    k,
    D: level.D,
    N,
    r: (Math.PI / N) / half(n) ** 2,
    held: level.even >= EVEN && level.tailN <= TAIL,
    energy: level.unwrapped,
    eRest,
    mass,
    total: mass / eRest,
    walk,
    bind: mass / eRest / walk,
    klein: 1 - level.even,
    tail: level.tailN,
    mean: level.mean,
    carry: carryOverlap,
    model: model / eRest,
  }
}

// E-SPN-0113's dense e0 (the least unwrapped even-block particle level)
function denseE0(n: number, D: number, withCost = true): { m: Meson; level: BandLevel | null; inside: number } {
  const m = meson(D, boxOf(D), n)
  const levels = pairLevels(m, withCost).levels
  const e0 = levels.filter(l => l.parity === 0).sort((a, b) => a.unwrapped - b.unwrapped)[0]

  return { m, level: e0 ? readBand(m, e0.block, e0.energy, 0, withCost) : null, inside: levels.filter(l => l.tailN <= TAIL).length }
}

// ---- F1: the register against the instantaneous cost ----
function columnCheck(n: number, D: number, fearCharge = -1): { columns: number; differ: number; gaussBroken: number } {
  const m = meson(D, boxOf(D), n)
  const N = lightN(D)
  const angle = (l: number): number => (-Math.PI * l) / N
  let columns = 0
  let differ = 0
  let gaussBroken = 0

  for (const parity of [0, 1] as const) {
    for (const col of parityIndices(m, parity)) {
      const c = Math.floor(col / m.b.labelCount)
      const r0 = col % m.b.labelCount
      const d = m.b.configs[c]![1]!

      for (const K of COLUMN_K) {
        const want = pairColumn(m, K, col)
        const got = lineRegisterColumn(n, angle, m.box, d, r0 >> 1, r0 & 1, K, fearCharge)
        const byIndex = new Map<number, [number, number]>()

        columns++
        for (const g of got) {
          if (!g.gauss) gaussBroken++
          byIndex.set(m.b.index(m.b.configOf([0, g.d]), g.j0 * 2 + g.j1), [g.re, g.im])
        }

        let same = byIndex.size === want.idx.length

        want.idx.forEach((i, e) => {
          const a = byIndex.get(i)

          if (!a || a[0] !== want.re[e] || a[1] !== want.im[e]) same = false
        })

        if (!same) differ++
      }
    }
  }

  return { columns, differ, gaussBroken }
}

function runCheck(fearCharge = -1): { beats: number; differ: number; gaussBroken: number; branches: number } {
  const [n, D] = RUN_POINT
  const box = boxOf(D)
  const N = lightN(D)
  const angle = (l: number): number => (-Math.PI * l) / N
  const reach = RUN_BEATS + box + 2
  const lo = -reach
  const width = 2 * reach + 1
  const g = 0.6180339887498949
  let register: LineBranch[] = []
  let instant: LineBranch[] = []
  let s = 0

  for (const d0 of RUN_D0) {
    for (let j = 0; j < 4; j++) {
      const amp: [number, number] = [((s * g) % 1) - 0.5, ((s * g * g) % 1) - 0.5]

      s++
      register.push({ x0: 0, x1: d0, j0: j >> 1, j1: j & 1, flux: lineGauss(0, d0, lo, width), amp })
      instant.push({ x0: 0, x1: d0, j0: j >> 1, j1: j & 1, flux: null, amp })
    }
  }

  let differ = 0
  let gaussBroken = 0
  let branches = 0

  for (let t = 0; t < RUN_BEATS; t++) {
    register = lineBeat(register, n, angle, box, lo, fearCharge)
    instant = lineBeat(instant, n, angle, box, lo)

    const byKey = new Map(instant.map(b => [lineStateKey(b), b.amp]))

    if (byKey.size !== register.length) differ++
    for (const b of register) {
      const a = byKey.get(lineStateKey(b))

      if (!a || a[0] !== b.amp[0] || a[1] !== b.amp[1]) differ++

      const gl = lineGauss(b.x0, b.x1, lo, width)

      if (!(b.flux as Int8Array).every((v, k) => v === gl[k])) gaussBroken++
    }

    branches = Math.max(branches, register.length)
  }

  return { beats: RUN_BEATS, differ, gaussBroken, branches }
}

export function lineFluxRun(plan: LineFluxPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const f4 = (x: number): string => x.toFixed(4)
  const e2 = (x: number): string => x.toExponential(2)

  // ---- F1 ----
  const columns = COLUMN_POINTS.map(([n, D]) => ({ n, D, ...columnCheck(n, D) }))
  const run = runCheck()
  const F1 = columns.every(c => c.differ === 0 && c.gaussBroken === 0) && run.differ === 0 && run.gaussBroken === 0

  log(`F1 columns ${columns.map(c => `(${c.n},${c.D}) ${c.columns} differ ${c.differ} gauss ${c.gaussBroken}`).join('; ')}; run ${JSON.stringify(run)}`)

  // C3: the wrong register, over the 32-beat run (a one-beat column reads only the start's register, which is Gauss's)
  const wrong = columnCheck(RUN_POINT[0], RUN_POINT[1], 1)
  const wrongRun = runCheck(1)
  const C3 = wrongRun.differ > 0 && wrongRun.gaussBroken > 0

  log(`C3 columns ${JSON.stringify(wrong)}, run ${JSON.stringify(wrongRun)}`)

  // ---- the grid ----
  const points: Point[] = []

  for (const n of plan.fines) {
    const Dn = derivedD(n)
    const wanted = plan.mults.map(k => ({ k, D: Math.max(1, Math.round(k * Dn)) })).sort((a, b) => b.D - a.D)

    if (plan.dense.includes(n)) {
      for (const w of wanted) {
        const { level } = denseE0(n, w.D)
        const p = readPoint(level as BandLevel, n, w.k, 1)

        points.push(p)
        log(`n ${n} k ${w.k} D ${w.D}: E ${p.energy} R_bind ${p.bind} klein ${e2(p.klein)} tail ${e2(p.tail)}`)
      }
      continue
    }

    const top = wanted[0] as { k: number; D: number }
    const mTop = meson(top.D, boxOf(top.D), n)
    let level = settle(mTop, nrSeed(mTop))
    let least = 1

    for (const w of wanted) {
      while (level.D > w.D) {
        const D = Math.max(w.D, Math.floor(level.D / CARRY_RATIO))
        const c = carry(level, D, boxOf(D))

        least = Math.min(least, c.overlap)
        level = c.level
      }

      const p = readPoint(level, n, w.k, least)

      points.push(p)
      log(`n ${n} k ${w.k} D ${w.D}: E ${p.energy} R_bind ${p.bind} klein ${e2(p.klein)} tail ${e2(p.tail)} carry ${f4(least)}`)
    }
  }

  const at = (n: number, k: number): Point | undefined => points.find(p => p.n === n && p.k === k)
  const has = (n: number, k: number): boolean => at(n, k) !== undefined

  // ---- L1 ----
  const pathFines = plan.fines.filter(n => n >= 2)
  const L1rows = [2, 4].map(k => {
    const rows = pathFines.filter(n => has(n, k)).map(n => at(n, k) as Point)
    const held = rows.every(p => p.held)
    const bind = rows.filter(p => p.n >= 4).every(p => Math.abs(p.bind - 1) <= BIND)
    const falls = rows.every((p, i) => i === 0 || p.total - 1 < (rows[i - 1] as Point).total - 1)
    const last = rows.find(p => p.n === 16)
    const lastOk = last !== undefined && Math.abs(last.total - 1) <= LAST

    return { k, rows, held, bind, falls, lastOk }
  })
  const slopeRows = [2, 4, 8].filter(n => has(n, 4)).map(n => ({ x: Math.log(n), y: Math.log((at(n, 4) as Point).total - 1) }))
  const mx = slopeRows.reduce((s, p) => s + p.x, 0) / slopeRows.length
  const my = slopeRows.reduce((s, p) => s + p.y, 0) / slopeRows.length
  const slope = slopeRows.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / slopeRows.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  const L1 = L1rows.every(x => x.held && x.bind && x.falls && x.lastOk) && slopeRows.length === 3 && slope >= SLOPE[0] && slope <= SLOPE[1]

  // ---- L2 ----
  const clean = [4, 8, 16].flatMap(n => [3, 4].map(k => at(n, k))).filter((p): p is Point => p !== undefined)
  const strong = [4, 8].map(n => ({ one: at(n, 1), three: at(n, 3) }))
  const L2 = F1 && clean.length === 6 && clean.every(p => Math.abs(p.bind - 1) <= BIND) && strong.every(x => x.one !== undefined && x.three !== undefined && Math.abs(x.one.bind - 1) >= OFF && x.one.klein >= KLEIN_RATIO * x.three.klein)

  // ---- C1, C2 ----
  const c1Rows = plan.fines.filter(n => has(n, 2)).map(n => {
    const p = at(n, 2) as Point

    return { n, energy: p.energy, total: p.total, ok: Math.abs(p.energy - (RECORDED_ENERGY[n] as number)) <= SAME && Math.abs(p.total - (RECORDED_TOTAL[n] as number)) <= TOTAL_SAME }
  })
  const C1 = c1Rows.length === plan.fines.length && c1Rows.every(r => r.ok)
  const free = plan.fines.map(n => {
    const D = 2 * derivedD(n)

    if (plan.dense.includes(n)) return { n, D, tail: NaN, inside: denseE0(n, D, false).inside }

    const m = meson(D, boxOf(D), n)

    return { n, D, tail: settle(m, nrSeed(m), 12, false).tailN, inside: -1 }
  })
  const C2 = free.every(f => (f.inside >= 0 ? f.inside === 0 : f.tail > TAIL))

  log(`C1 ${JSON.stringify(c1Rows)}; C2 ${JSON.stringify(free)}`)

  const controls = C1 && C2 && C3
  const status = !controls ? 'partial' : F1 && L1 && L2 ? 'pass' : 'fail'
  const row = (p: Point): string => `n ${p.n} k ${p.k} D ${p.D} (r ${p.r.toFixed(3)}, pi/r ${(Math.PI / p.r).toFixed(1)}): ${p.held ? 'held' : 'NOT held'}, E(0) ${p.energy.toFixed(6)}, E_rest ${f4(p.eRest)}, m* ${f4(p.mass)}, R_total ${p.total.toFixed(5)}, R_walk ${p.walk.toFixed(5)}, R_bind ${p.bind.toFixed(5)}, Klein ${e2(p.klein)}, tail ${e2(p.tail)}, <|d|> ${p.mean.toFixed(2)}, carry ${f4(p.carry)}, R_pm ${p.model.toFixed(5)}`
  const metrics: Record<string, number> = {
    F1: F1 ? 1 : 0,
    L1: L1 ? 1 : 0,
    L2: L2 ? 1 : 0,
    C1: C1 ? 1 : 0,
    C2: C2 ? 1 : 0,
    C3: C3 ? 1 : 0,
    slope,
    columns: columns.reduce((s, c) => s + c.columns, 0),
    runBranches: run.branches,
    seconds: (Date.now() - started) / 1000,
  }

  for (const p of points) {
    const key = `n${p.n}_k${p.k}`

    metrics[`${key}_Rtotal`] = p.total
    metrics[`${key}_Rbind`] = p.bind
    metrics[`${key}_klein`] = p.klein
    metrics[`${key}_Rpm`] = p.model
    metrics[`${key}_energy`] = p.energy
  }

  return verdict({
    status,
    claim: `F1 ${F1} (${metrics.columns} columns and ${run.beats} beats of ${run.branches} branches, the register equal to the instantaneous cost bit for bit, Gauss on every branch); L1 ${L1} (${L1rows.map(x => `k ${x.k}: held ${x.held}, R_bind ${x.bind}, falls ${x.falls}, n 16 ${x.lastOk}`).join('; ')}; slope ${slope.toFixed(3)}); L2 ${L2}; controls C1 ${C1} C2 ${C2} C3 ${C3}`,
    metrics,
    control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, C3: C3 ? 1 : 0 },
    notes: `L1 and L2. ${points.map(row).join(' | ')}. F1 columns ${columns.map(c => `(${c.n}, ${c.D}) ${c.columns} differ ${c.differ} Gauss broken ${c.gaussBroken}`).join('; ')}; run ${JSON.stringify(run)}. C3 (fear charge +1): run ${JSON.stringify(wrongRun)}, one-beat columns ${JSON.stringify(wrong)}. C1 ${JSON.stringify(c1Rows)}. C2 ${JSON.stringify(free)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
