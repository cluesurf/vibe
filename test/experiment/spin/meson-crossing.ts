// WHAT CROSSES THE STRING-BOUND MESON'S BAND, AND IS THE MESON ONE PARTICLE ON THE BAND READ THROUGH IT? (E-SPN-0115)
// E-SPN-0114 (test/experiment/spin/meson-scaled-step) read the love-fear meson (code/measure/string-binding, string
// only, no meeting) on the joint path D = 2 D(n) with a K step set by its own quantum metric. At rest the total
// m*/E_rest goes to 1 (1.793 .. 1.003), but at n = 4, 8, 16 the band's consecutive overlap drops under 0.99 at ONE step,
// K 0.244, 0.216, 0.084 (0.39, 0.69, 0.54 of E_rest), on a step whose smooth loss is a quarter of the bound: a narrow
// crossing with another level. note/research/vibe/roadmap/remaining-pieces.md, "1", the rerun.
//
// THE CROSSING LEVEL (code/measure/meson-crossing). Two facts, each derived before it is read.
//  THE EXCHANGE. Love and fear enter the pair beat alike, so swapping them, (X phi)(d, j0, j1) = e^(iKd) phi(-d, j1, j0),
//  commutes with the beat at every K and keeps the parity of d. X = +1 and X = -1 are sectors the beat never connects:
//  a level of one crosses a level of the other with coupling exactly 0.
//  THE KLEIN CHANNEL. The lone walk's two branches have E_A = -E_B - 2m, m = pi/(3n). A pair with one token in each has
//  energy near -2m + sigma |d|, so at the band's energy E such a level sits at |d| = (E + 2m)/sigma: the string long
//  enough to pay for the gap, the Klein (Schwinger) channel of a Dirac particle in a linear potential. Those levels are
//  a ladder spaced sigma in energy and nearly flat in K, so the rising meson band crosses them one by one, and in the
//  meson's own sector each crossing is AVOIDED, with a gap set by the tunnelling through the gap.
// DISCLOSED PROBES (tmp/cross-probe*.ts, no gate read by them except as stated). cross-probe-4.log: at n = 4, D 100 the
// exchange commutes to 1e-14 (the wrong phase e^(-iKd) misses by 0.84), e0 is X = +1, and at the break (K 0.24374) the
// band's partner is an X = +1 level at |d| 38.5 (43.0 predicted, mixed), with its X = -1 twin at |d| 43.0 beside it.
// cross-probe3-4.log, -8f.log (the rule below, to E_rest only): every partner of the band is a Klein level at the
// predicted |d| to 0.1 dock; the breaks are avoided crossings of gap 3.2e-5 (n 4, K* 0.24385) and 1.3e-5 (n 8, at
// K 0.2293); the band is held to E_rest at n 4 and 8 (least overlap 0.99904 and 0.99897) with c_eff 0.9874 and 0.9969.
// cross-probe3-16.log: at n = 16 held to E_rest (least 0.99897), c_eff 0.99923, the break's partner at |d| 175.5 mixed
// (183.0 predicted) and dE 7e-6 from the band (its golden section there took a bracket of +- one step, which held two
// crossings; the bracket below is +- half a Klein spacing).
// Two solver defects the probes found and fixed before this file: a near spectrum of 4 to 6 vectors left the joined
// levels unconverged (tmp/cross-probe4-8.log, the band then lost to wall states), and a shift at the previous energy
// lags a light meson by several level spacings.
//
// THE DIABATIC READING RULE (fixed before the first run of this file, meson-crossing followDiabatic).
//  THE SECTOR. The band is followed in X = +1, its own sector at K = 0 (checked), by projecting every round.
//  THE POINT. At each K of E-SPN-0114's scaled grid (K = s step), the sector's near spectrum (10 vectors: the previous
//  point and the previous K's other Ritz vectors; shift at the band's energy extrapolated from its last two points;
//  iterated in rounds of 4 until the largest-overlap level's residual is at most 1e-10 and every joined level's at most
//  1e-8, at most 48 rounds). The point is the unit vector of LARGEST OVERLAP with the previous point inside the span of
//  the largest-overlap Ritz level and every level within WINDOW = sigma/2 of it (half the Klein ladder's spacing, so at
//  most one Klein partner) that carries at least 1e-6 of the previous point's weight. Away from a crossing that is the
//  eigenvector to O(1e-6); at a narrow crossing it is the state that keeps the meson's character. Its energy is its
//  Rayleigh quotient, unwrapped by continuity.
//  THE HELD CRITERION (E-SPN-0114's, on this point): even reading at K = 0 at least 1/2, tail |d| >= N at most TAIL =
//  1e-3 at every point, and every consecutive overlap at least 0.99, over K from 0 to K_hold = min(E_rest, pi).
//  THE RANGE TO PI (X3): the band followed on the same grid to pi, stopped at the first point under 0.99 or over TAIL.
//
// THE JOINT PATH (E-SPN-0113's): (n, 2 D(n)) = (1, 6), (2, 26), (4, 100), (8, 404), (16, 1612); box 2N.
//
// GATES, fixed before the first run of this file.
//  X1 at every n the diabatic band is held from K = 0 to K_hold.
//  X2 at n >= 4, c_eff from the least-squares fit of (E(K) + 2m)^2 - E_rest^2 = c_eff^2 K^2 over the held grid points
//     0 < K <= K_hold is within 5% of the lone fine walk's top speed cos m.
//  X3 at n >= 4, the top group velocity of the band held to pi (largest |dE/dK| by a symmetric difference over the
//     held points) is within 5% of cos m.
//  PASS iff X1, X2 and X3.
// CONTROLS (a failed control makes the verdict partial).
//  C1 E-SPN-0114 at K = 0 reproduced: E(0) to 1e-9 (E-SPN-0113's recorded values), the step pi/57, 117, 232, 466, 931,
//     and the total m*/E_rest on its scaled curvature to 5e-5 of its printed 1.7931, 1.1124, 1.0238, 1.0043, 1.0026.
//  C2 adiabatic following reproduces the break: E-SPN-0114's follow (meson-scaled-step followHeld) breaks at n = 4, 8, 16
//     within 5e-4 of K 0.244, 0.216, 0.084, and at n = 1, 2 not before K_hold.
//  C3 no drift cost, nothing held: at n = 1, 2 the dense spectrum with the cost off has no particle level with tail at
//     most TAIL; at n >= 4 the seed settled with the cost off has tail above TAIL.
//  C4 the symmetry: |U X - X U| at most 1e-12 (relative) at K = 0, 0.3, 1.1 at every n, the wrong phase e^(-iKd) at
//     least 1e-2 at K = 0.3 and 1.1, and <X> of the K = 0 level 1 to 1e-12.
//  C5 the instruments: meson-crossing's factor-once solve equals meson-band's bandSolve to 1e-12 (relative) at every n,
//     and the banded block leaks nothing to the odd block and is unitary to 1e-12.
//  REPORTED, NOT GATED (predicted before the run): at each E-SPN-0114 break, the band's partner (the level coupled most
//  to it) is an X = +1 Klein level, |d| within 1 of (E + 2m)/sigma; its X = -1 twin sits at the same |d|, and the
//  twin's matrix element with the band, |<twin|U|point>|, is 0 to 1e-12. The gap at closest approach (golden section
//  over K_b +- sigma/(2v), v the band's slope, so one Klein crossing is in the bracket), against sigma, against the
//  band's energy step v dK, and the golden-rule width Gamma = pi gap^2/(2 sigma) of the meson into the Klein ladder
//  (coupling gap/2, level spacing sigma), against E_rest. The first-order coupling |<v|point>| |E_v - E| to the
//  nearest partner at every held point, as its median times 2 over sigma: a second reading of the gap's scaling.
//
// PREDICTED (before run 1, from the disclosed probes). X1 holds at n = 4, 8 and 16; n = 1, 2 held by E-SPN-0114's
// adiabatic reading, so expected here. X2 holds at n = 4 (2.2%), 8 (0.6%) and 16 (0.1%). X3 open: E-SPN-0114 read
// 0.354 and 0.809 at n = 1, 2 (not gated here), and no probe followed n >= 4 past E_rest. The Klein prediction and the
// exact decoupling of the twin are expected to hold at every break. The gap should scale as sigma (the path holds the
// Schwinger factor exp(-pi m^2/sigma) near 1e-6 at every n), so gap/sigma roughly constant, and gap/E_rest falling as
// 1/n: the crossing is avoided at every n and never closes, but the meson's width into the Klein channel is a smaller
// fraction of its energy as n grows.
//
// RUN 1 (980 s, tmp/cross-run1.log, the record): PASS on X1, X2, X3, every control clean, no gate moved.
//   n   D     step     least    c_eff    top      cos m    m*/E_rest  break K   gap       gap/sigma  Gamma/E_rest
//   1   6     pi/57    0.99905  0.7230   0.3535   0.5000   1.7931     none      -         -          -
//   2   26    pi/117   0.99904  0.9467   0.8087   0.8660   1.1124     3.115     -         -          -
//   4   100   pi/232   0.99904  0.9874   0.9493   0.9659   1.0238     0.2437    3.21e-5   2.06e-3    1.7e-7
//   8   404   pi/466   0.99897  0.9969   0.9872   0.9914   1.0043     0.2157    8.43e-6   2.17e-3    9.2e-8
//   16  1612  pi/931   0.99897  0.9992   0.9968   0.9979   1.0026     0.0844    3.08e-6   3.16e-3    9.7e-8
// The diabatic band is held to E_rest at every n and to K 3.09 .. 3.14 beyond it; c_eff is 2.2%, 0.55%, 0.14% over
// cos m at n 4, 8, 16, the top speed 1.7%, 0.43%, 0.11% under it (1.7% is inside the 5% gate, not a knife edge at
// n >= 8). At n 1, 2 (not gated) both miss, as E-SPN-0114 found. Each break is an AVOIDED crossing in X = +1: the
// crossing width in K is 0.0067, 0.0022, 0.0019 of a step, which is why one step landing near it read as a break. The
// X = -1 twin sits at the Klein |d| to 0.5 dock (43.00, 98.03, 183.49 against 43.00, 98.00, 183.00) and its matrix
// element with the band is 2e-17, 4e-18, 3e-17: exactly decoupled. ONE REPORTED PREDICTION FAILED: the X = +1
// partner's own |d| at the break step reads 38.5, 95.7, 175.5 against 43.0, 98.0, 183.0, off by more than one dock,
// because at that step it is mixed with the meson (weight 0.12 at n 4), which pulls its mean |d| in; the unmixed twin
// is the clean reading. The gap stays open at every n and scales as sigma to within a factor 1.5 (gap/sigma 2.1e-3 to
// 3.2e-3, rising slowly), so it falls as about n^-1.7 in absolute terms; the golden-rule width into the Klein ladder is
// 1e-7 of E_rest. Controls: C1 E(0) exact, steps pi/57 .. pi/931, totals to 5e-5; C2 the adiabatic follow breaks at
// 0.2437, 0.2157, 0.0844 and not before K_hold at n 1, 2; C3 least free tails 0.40 .. 0.50; C4 commutator 1.9e-13 at
// most, wrong phase 0.80 at least; C5 the factor-once solve equals bandSolve bit for bit, leak 0.
//
// Depth L2: lattice Dirac walks bound by a linear string ('t Hooft, Schwinger); the crossings are the Klein (Schwinger)
// channel of a confined Dirac pair, and the reading is a standard diabatization. What could fail is whether the band
// read through the crossings is one particle to relativistic momenta, with a speed that goes to the lone walk's.
// DETERMINISM: no random numbers; the start vectors are Weyl sequences. NOTHING MOVES: the coin and the cost write
// amplitudes on a dock's own line; the stream copies. HUSK FIRST: one husk line.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightN } from '@/code/measure/drift-cost-bloch'
import { type Vec } from '@/code/measure/quantum-ladder'
import { meson, pairLevels, type Meson } from '@/code/measure/string-binding'
import { bandApply, bandCurvature, bandSolve, nrSeed, pairBand, readBand, settle, type BandLevel } from '@/code/measure/meson-band'
import { bandMetric, followHeld, scaledStep } from '@/code/measure/meson-scaled-step'
import {
  bandFactor,
  blockMoments,
  closestApproach,
  exchange,
  exchangeMap,
  exchangeValue,
  factorSolve,
  followDiabatic,
  kleinDistance,
  nearSpectrum,
  shiftOf,
  weylVector,
  WEYL,
  type DiabaticStep,
  type Exchange,
} from '@/code/measure/meson-crossing'

const TAIL = 1e-3
const EVEN = 0.5
const HOLD = 0.99
const ROTATION = 1e-3
const WINDOW_SIGMA = 1 / 2
const CURVE_FRAC = 1 / 64
const FINES: readonly number[] = [1, 2, 4, 8, 16]
const DENSE_FINES: readonly number[] = [1, 2]
const GATED_FROM = 4
const PATH_K = 2
const BOX = 2
const C_TOL = 0.05
const V_TOL = 0.05
const SAME = 1e-9
const TOTAL_SAME = 5e-5
const BREAK_SAME = 5e-4
const COMMUTE = 1e-12
const WRONG = 1e-2
const SOLVE_SAME = 1e-12
const UNITARY = 1e-12
const KLEIN_DOCK = 1
const SYMMETRY_K: readonly number[] = [0, 0.3, 1.1]
const RECORDED_ENERGY: Record<number, number> = {
  1: 0.3188654375223234,
  2: 0.19314564649226765,
  4: 0.10386658008071757,
  8: 0.05213891233226967,
  16: 0.026185373288082,
}
const RECORDED_STEPS: Record<number, number> = { 1: 57, 2: 117, 4: 232, 8: 466, 16: 931 }
const RECORDED_TOTAL: Record<number, number> = { 1: 1.7931, 2: 1.1124, 4: 1.0238, 8: 1.0043, 16: 1.0026 }
const RECORDED_BREAK: Record<number, number> = { 4: 0.244, 8: 0.216, 16: 0.084 }

type Crossing = {
  K: number
  partnerMean: number
  klein: number
  kleinOk: boolean
  twinMean: number
  twinGap: number
  twinCoupling: number
  gapK: number
  gap: number
  slope: number
  width: number
}

type Point = {
  n: number
  D: number
  N: number
  sigma: number
  energy: number
  even: number
  tail0: number
  exchange0: number
  step: number
  stepCount: number
  eRest: number
  kHold: number
  total: number
  held: boolean
  least: number
  worstTail: number
  failAt: number
  cEff: number
  top: number
  topAt: number
  heldTo: number
  cosM: number
  gapMedian: number
  worstRitz: number
  adiabaticBreak: number
  crossing: Crossing | undefined
  commute: number
  wrong: number
  solveGap: number
  leak: number
  unitarity: number
  free: number
}

const half = (n: number): number => Math.PI / (3 * n)

// E-SPN-0113's derived D(n): the smallest D with N = 2D + 1 >= 9 n^2 ln(1/TAIL)/pi^2
function derivedD(n: number): number {
  const need = (9 * n * n * Math.log(1 / TAIL)) / Math.PI ** 2

  return Math.max(0, Math.ceil((need - 1) / 2))
}

const boxOf = (D: number): number => BOX * lightN(D)

function levelAt(n: number, D: number): BandLevel {
  const m = meson(D, boxOf(D), n)

  if (DENSE_FINES.includes(n)) {
    const e0 = pairLevels(m).levels.filter(l => l.parity === 0).sort((a, b) => a.unwrapped - b.unwrapped)[0]!

    return readBand(m, e0.block, e0.energy, 0)
  }

  return settle(m, nrSeed(m))
}

const norm = (v: Vec): number => {
  let t = 0

  for (let i = 0; i < v.re.length; i++) t += v.re[i]! ** 2 + v.im[i]! ** 2

  return Math.sqrt(t)
}

const gapOf = (u: Vec, v: Vec): number => {
  let t = 0

  for (let i = 0; i < u.re.length; i++) t += (u.re[i]! - v.re[i]!) ** 2 + (u.im[i]! - v.im[i]!) ** 2

  return Math.sqrt(t)
}

// |U X w - X U w| / |w| on a Weyl vector, with the phase sign given
function commutator(m: Meson, x: Exchange, K: number, sign: number): number {
  const op = pairBand(m, K, 0)
  const w = weylVector(op.dim, WEYL[0]!)

  return gapOf(bandApply(op, exchange(x, K, w, sign)), exchange(x, K, bandApply(op, w), sign)) / norm(w)
}

// |<a|U|b>|
function matrixElement(m: Meson, K: number, a: Vec, b: Vec): number {
  const ub = bandApply(pairBand(m, K, 0), b)
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * ub.re[k]! + a.im[k]! * ub.im[k]!
    i += a.re[k]! * ub.im[k]! - a.im[k]! * ub.re[k]!
  }

  return Math.hypot(r, i)
}

function median(xs: readonly number[]): number {
  const s = [...xs].sort((a, b) => a - b)

  return s.length === 0 ? Number.NaN : s[Math.floor((s.length - 1) / 2)]!
}

function readPoint(n: number, D: number, log: (s: string) => void): Point {
  const level = levelAt(n, D)
  const m = meson(D, boxOf(D), n)
  const x = exchangeMap(m)
  const N = lightN(D)
  const sigma = Math.PI / N
  const op0 = pairBand(m, 0, 0)
  const step = scaledStep(bandMetric(m, level).metric, ROTATION, Math.PI)
  const stepCount = Math.round(Math.PI / step)
  const eRest = 2 * half(n) + level.unwrapped
  const kHold = Math.min(eRest, Math.PI)
  const at0 = { K: 0, energy: level.unwrapped, overlap: 1, residual: level.residual, vector: level.block }
  const total = 1 / bandCurvature(m, at0, CURVE_FRAC * eRest) / eRest

  // C2: E-SPN-0114's adiabatic follow
  const adiabatic = followHeld(m, level, step, Math.PI, HOLD)
  const broke = adiabatic.findIndex((t, s) => s > 0 && t.overlap < HOLD)
  const adiabaticBreak = broke === -1 ? -1 : adiabatic[broke]!.K

  // C4: the symmetry
  const commute = Math.max(...SYMMETRY_K.map(K => commutator(m, x, K, 1)))
  const wrong = Math.min(...SYMMETRY_K.filter(K => K > 0).map(K => commutator(m, x, K, -1)))
  const exchange0 = exchangeValue(x, 0, level.block)

  // C5: the factor-once solve against bandSolve
  const w = weylVector(op0.dim, WEYL[1]!)
  const a = { re: Float64Array.from(w.re), im: Float64Array.from(w.im) }
  const b = { re: Float64Array.from(w.re), im: Float64Array.from(w.im) }
  const s0 = shiftOf(level.unwrapped + 0.01)

  factorSolve(bandFactor(op0, ...s0), a.re, a.im)
  bandSolve(op0, s0[0], s0[1], b.re, b.im)

  const solveGap = gapOf(a, b) / norm(b)

  log(`n ${n} D ${D}: E(0) ${level.unwrapped} step pi/${stepCount} E_rest ${eRest.toFixed(4)} m*/E_rest ${total.toFixed(5)} adiabatic break ${adiabaticBreak.toFixed(4)} commute ${commute.toExponential(2)} wrong ${wrong.toExponential(2)} <X> ${exchange0} solve ${solveGap.toExponential(2)}`)

  // the diabatic band, on the scaled grid to pi
  const ks = Array.from({ length: stepCount + 1 }, (_, s) => Math.min(s * step, Math.PI))
  const track: DiabaticStep[] = followDiabatic(m, x, level.block, level.unwrapped, ks, 1, WINDOW_SIGMA * sigma, s => s.overlap < HOLD || s.tail > TAIL)
  const fail = track.findIndex((t, s) => (s > 0 && t.overlap < HOLD) || t.tail > TAIL)
  const last = fail === -1 ? track.length - 1 : fail - 1
  const reached = fail === -1 ? track[track.length - 1]!.K : track[fail - 1]?.K ?? 0
  const held = level.even >= EVEN && level.tailN <= TAIL && (fail === -1 || reached >= kHold - 1e-12)
  let least = 1
  let worstTail = 0

  track.forEach((t, s) => {
    if (s > 0 && track[s - 1]!.K < kHold - 1e-12) least = Math.min(least, t.overlap)
    if (s === 0 || track[s - 1]!.K < kHold - 1e-12) worstTail = Math.max(worstTail, t.tail)
  })

  // X2: c_eff over the held grid points 0 < K <= K_hold
  let num = 0
  let den = 0

  for (let s = 1; s <= last; s++) {
    const t = track[s]!

    if (t.K > kHold + 1e-12) break

    num += ((t.energy + 2 * half(n)) ** 2 - eRest ** 2) * t.K * t.K
    den += t.K ** 4
  }

  const cEff = den > 0 ? Math.sqrt(Math.max(0, num / den)) : Number.NaN

  // X3: the top group velocity over the held points
  let top = 0
  let topAt = 0

  for (let s = 1; s < last; s++) {
    const v = Math.abs(track[s + 1]!.energy - track[s - 1]!.energy) / (track[s + 1]!.K - track[s - 1]!.K)

    if (v > top) {
      top = v
      topAt = track[s]!.K
    }
  }

  const gapMedian = (2 * median(track.slice(1, last + 1).filter(t => t.K <= kHold + 1e-12).map(t => t.coupling))) / sigma
  const worstRitz = Math.max(...track.slice(0, last + 1).map(t => t.ritzResidual))

  log(`n ${n}: diabatic ${held ? 'held' : 'NOT held'} to K_hold ${kHold.toFixed(4)} (least ${least.toFixed(5)}, tail ${worstTail.toExponential(2)}${fail >= 0 ? `, fails at K ${track[fail]!.K.toFixed(4)}` : ''}), c_eff ${cEff.toFixed(5)} top ${top.toFixed(5)} at K ${topAt.toFixed(3)} held to ${track[last]!.K.toFixed(4)} cos m ${Math.cos(half(n)).toFixed(5)} median 2V/sigma ${gapMedian.toExponential(2)} Ritz ${worstRitz.toExponential(1)}`)

  // the crossing at E-SPN-0114's break
  let crossing: Crossing | undefined

  if (broke > 0 && broke + 1 < track.length) {
    const t = track[broke]!
    const klein = kleinDistance(m, t.energy + t.partner)
    const slope = (track[broke + 1]!.energy - track[broke - 1]!.energy) / (track[broke + 1]!.K - track[broke - 1]!.K)
    const twin = nearSpectrum(m, x, t.K, t.energy + t.partner, [t.vector, ...WEYL.slice(2, 8).map(a => weylVector(op0.dim, a))], -1, 24).sort(
      (p, q) => Math.abs(p.energy - (t.energy + t.partner)) - Math.abs(q.energy - (t.energy + t.partner)),
    )[0]!
    const twinMean = blockMoments(m, twin.vector).mean
    const reach = sigma / (2 * Math.abs(slope))
    const c = closestApproach(m, x, Math.max(0, t.K - reach), t.K + reach, t.energy, t.vector, [t.vector, ...WEYL.slice(0, 5).map(a => weylVector(op0.dim, a))], 1)

    crossing = {
      K: t.K,
      partnerMean: t.partnerMean,
      klein,
      kleinOk: Math.abs(t.partnerMean - klein) <= KLEIN_DOCK,
      twinMean,
      twinGap: twin.energy - (t.energy + t.partner),
      twinCoupling: matrixElement(m, t.K, twin.vector, t.vector),
      gapK: c.K,
      gap: c.gap,
      slope,
      width: c.gap / Math.abs(slope),
    }
    log(`n ${n} crossing at K ${t.K.toFixed(5)}: partner |d| ${t.partnerMean.toFixed(2)} (Klein ${klein.toFixed(2)}) dE ${t.partner.toExponential(3)}; twin X = -1 |d| ${twinMean.toFixed(2)} dE ${crossing.twinGap.toExponential(2)} |<twin|U|point>| ${crossing.twinCoupling.toExponential(2)}; closest approach K* ${c.K.toFixed(6)} gap ${c.gap.toExponential(3)} (residuals ${c.lower.residual.toExponential(1)}, ${c.upper.residual.toExponential(1)}), gap/sigma ${(c.gap / sigma).toExponential(2)}, width in K ${crossing.width.toExponential(2)} against step ${step.toExponential(2)}`)
  }

  // C3: no cost
  let free: number

  if (DENSE_FINES.includes(n)) {
    const levels = pairLevels(m, false).levels

    free = Math.min(...levels.map(l => l.tailN))
  } else {
    free = settle(m, nrSeed(m), undefined, false).tailN
  }

  return {
    n,
    D,
    N,
    sigma,
    energy: level.unwrapped,
    even: level.even,
    tail0: level.tailN,
    exchange0,
    step,
    stepCount,
    eRest,
    kHold,
    total,
    held,
    least,
    worstTail,
    failAt: fail === -1 ? -1 : track[fail]!.K,
    cEff,
    top,
    topAt,
    heldTo: track[last]!.K,
    cosM: Math.cos(half(n)),
    gapMedian,
    worstRitz,
    adiabaticBreak,
    crossing,
    commute,
    wrong,
    solveGap,
    leak: op0.leak,
    unitarity: op0.unitarity,
    free,
  }
}

export default experiment({
  id: 'spin/meson-crossing',
  code: 'E-SPN-0115',
  title:
    "the level that breaks the string-bound love-fear meson's band on the joint path (E-SPN-0114) is the Klein channel, one token in each branch of the walk at |d| = (E + 2m)/sigma, and read diabatically through it the meson is one particle to relativistic momenta, pass: love-fear exchange commutes with the beat (1.9e-13), so the Klein level's X = -1 twin crosses exactly (coupling 2e-17) while the X = +1 partner makes an avoided crossing of gap 3.2e-5, 8.4e-6, 3.1e-6 at n = 4, 8, 16 (2.1e-3 to 3.2e-3 of sigma, open at every n, width in K under 1% of a step); the band followed by largest overlap in its own sector holds to E_rest at every n (least overlap 0.99897), c_eff 0.9874, 0.9969, 0.9992 against cos m 0.9659, 0.9914, 0.9979, and the top group velocity to pi 0.9493, 0.9872, 0.9968; the partner's own |d| at the break reads mixed (38.5 against 43.0 predicted), E-SPN-0114 and its break reproduced, no cost holds nothing",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const secs = (): number => Math.round((Date.now() - started) / 1000)
    const log = (s: string): void => console.error(`${s}; at ${secs()} s`)
    const f4 = (x: number): string => x.toFixed(4)
    const e2 = (x: number): string => x.toExponential(2)

    const path = FINES.map(n => ({ n, D: PATH_K * derivedD(n) }))
    const points = path.map(({ n, D }) => readPoint(n, D, log))
    const gated = points.filter(p => p.n >= GATED_FROM)

    // gates
    const X1 = points.every(p => p.held)
    const X2 = gated.every(p => p.held && Math.abs(p.cEff / p.cosM - 1) <= C_TOL)
    const X3 = gated.every(p => Math.abs(p.top / p.cosM - 1) <= V_TOL)

    // controls
    const c1Rows = points.map(p => ({
      n: p.n,
      ok: Math.abs(p.energy - RECORDED_ENERGY[p.n]!) <= SAME && p.stepCount === RECORDED_STEPS[p.n] && Math.abs(p.total - RECORDED_TOTAL[p.n]!) <= TOTAL_SAME,
    }))
    const C1 = c1Rows.every(r => r.ok)
    const C2 = points.every(p => (RECORDED_BREAK[p.n] === undefined ? p.adiabaticBreak === -1 || p.adiabaticBreak >= p.kHold - 1e-12 : Math.abs(p.adiabaticBreak - RECORDED_BREAK[p.n]!) <= BREAK_SAME))
    const C3 = points.every(p => p.free > TAIL)
    const C4 = points.every(p => p.commute <= COMMUTE && p.wrong >= WRONG && Math.abs(p.exchange0 - 1) <= COMMUTE)
    const C5 = points.every(p => p.solveGap <= SOLVE_SAME && p.leak === 0 && p.unitarity <= UNITARY)
    const control = C1 && C2 && C3 && C4 && C5
    const status = !control ? 'partial' : X1 && X2 && X3 ? 'pass' : 'fail'

    log(`X1 ${X1} X2 ${X2} X3 ${X3}; C1 ${C1} (${c1Rows.map(r => `n ${r.n} ${r.ok}`).join(', ')}) C2 ${C2} C3 ${C3} C4 ${C4} C5 ${C5}`)

    const metrics: Record<string, number> = {
      X1: X1 ? 1 : 0,
      X2: X2 ? 1 : 0,
      X3: X3 ? 1 : 0,
      control: control ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      C3: C3 ? 1 : 0,
      C4: C4 ? 1 : 0,
      C5: C5 ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }

    for (const p of points) {
      const k = `n${p.n}_D${p.D}`

      metrics[`${k}_held`] = p.held ? 1 : 0
      metrics[`${k}_energy`] = p.energy
      metrics[`${k}_even`] = p.even
      metrics[`${k}_tail0`] = p.tail0
      metrics[`${k}_sigma`] = p.sigma
      metrics[`${k}_step`] = p.step
      metrics[`${k}_eRest`] = p.eRest
      metrics[`${k}_kHold`] = p.kHold
      metrics[`${k}_total`] = p.total
      metrics[`${k}_least`] = p.least
      metrics[`${k}_worstTail`] = p.worstTail
      metrics[`${k}_failAt`] = p.failAt
      metrics[`${k}_cEff`] = p.cEff
      metrics[`${k}_top`] = p.top
      metrics[`${k}_topAt`] = p.topAt
      metrics[`${k}_heldTo`] = p.heldTo
      metrics[`${k}_cosM`] = p.cosM
      metrics[`${k}_gapMedianOverSigma`] = p.gapMedian
      metrics[`${k}_worstRitz`] = p.worstRitz
      metrics[`${k}_adiabaticBreak`] = p.adiabaticBreak
      metrics[`${k}_commute`] = p.commute
      metrics[`${k}_wrongPhase`] = p.wrong
      metrics[`${k}_exchange0`] = p.exchange0
      metrics[`${k}_solveGap`] = p.solveGap
      metrics[`${k}_freeTail`] = p.free

      if (p.crossing) {
        const c = p.crossing

        metrics[`${k}_crossK`] = c.K
        metrics[`${k}_partnerMean`] = c.partnerMean
        metrics[`${k}_klein`] = c.klein
        metrics[`${k}_kleinOk`] = c.kleinOk ? 1 : 0
        metrics[`${k}_twinMean`] = c.twinMean
        metrics[`${k}_twinCoupling`] = c.twinCoupling
        metrics[`${k}_gapK`] = c.gapK
        metrics[`${k}_gap`] = c.gap
        metrics[`${k}_gapOverSigma`] = c.gap / p.sigma
        metrics[`${k}_gapOverEnergyStep`] = c.gap / (Math.abs(c.slope) * p.step)
        metrics[`${k}_widthOverStep`] = c.width / p.step
        metrics[`${k}_widthOverRest`] = (Math.PI * c.gap ** 2) / (2 * p.sigma) / p.eRest
      }
    }

    const g = (x: boolean): string => (x ? 'holds' : 'fails')
    const crossings = points.filter(p => p.crossing)

    return verdict({
      status,
      claim:
        `At every E-SPN-0114 break the band's partner is a Klein level of the meson's own exchange sector (X = +1): ${crossings
          .map(p => `n ${p.n} K ${f4(p.crossing!.K)} |d| ${p.crossing!.partnerMean.toFixed(1)} against (E + 2m)/sigma ${p.crossing!.klein.toFixed(1)}, gap ${e2(p.crossing!.gap)} (${e2(p.crossing!.gap / p.sigma)} sigma), X = -1 twin at |d| ${p.crossing!.twinMean.toFixed(1)} with |<twin|U|band>| ${e2(p.crossing!.twinCoupling)}`)
          .join('; ')}. ` +
        `Read diabatically: X1 ${g(X1)} (least overlap ${points.map(p => f4(p.least)).join(', ')} to K_hold${points.some(p => !p.held) ? `, not held: ${points.filter(p => !p.held).map(p => `n ${p.n}`).join(', ')}` : ''}); X2 ${g(X2)} (c_eff ${points.map(p => f4(p.cEff)).join(', ')} against cos m ${points.map(p => f4(p.cosM)).join(', ')}); X3 ${g(X3)} (top ${points.map(p => f4(p.top)).join(', ')}, held to K ${points.map(p => p.heldTo.toFixed(3)).join(', ')}). Controls: C1 ${C1}, C2 ${C2}, C3 ${C3}, C4 ${C4}, C5 ${C5}`,
      metrics,
      control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, C3: C3 ? 1 : 0, C4: C4 ? 1 : 0, C5: C5 ? 1 : 0 },
      notes: `L2. ${secs()} s.`,
    })
  },
})
