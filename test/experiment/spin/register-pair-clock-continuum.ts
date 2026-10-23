// THE MOVING CLOCK AS A CONTINUUM EXTRAPOLATION (E-SPN-0217, OPEN-MOT-01, vibe-roadmap-moving-matter-0001). E-SPN-0213 and
// E-SPN-0214 could not read the register pair's 1s-2s clock: the levels split into lines no tracking rule followed, and
// at the one clean point (m 0.427, a_B 7.5) the 2s line came out lighter per unit energy than the 1s (R 1.283 against
// 1.337), so the moving clock ran fast, alpha -1.09 times relativity's.
//
// WHAT THE GATE NEEDS (derived before any read here). Each level n has curvature a_n = c*^2 / (2 R_n E_n), and the clock
// Delta E(K) / Delta E(0) = 1 - alpha K^2 has alpha = (a_1 - a_2) / Delta E. Relativity (R_n = 1) gives alpha_SR =
// c*^2 / (2 E_1 E_2). Exactly,
//   alpha / alpha_SR = (E_2 / R_1 - E_1 / R_2) / Delta E,   and with R_n = 1 + eps_n,
//   alpha / alpha_SR = 1 - eps_1 - Q + O(eps^2),   Q = E_1 (eps_1 - eps_2) / Delta E
// The signal is Delta E / E_1, about the binding's share (0.017 at a_B 7.5): the gate |alpha / alpha_SR - 1| < 0.25
// needs |eps_1 - eps_2| below about 0.25 Delta E / E_1, 4e-3 at a_B 7.5 and less at larger a_B. The levels' remainders
// are lattice terms: E-MTR-0028 found the 1s's falling as (tan m / m - 1) / a_B at fixed m. A remainder in 1 / (level
// radius) leaves eps_1 - eps_2 of order 1 / a_B while Delta E / E_1 falls as 1 / a_B^2, so AT FIXED m THE CLOCK CANNOT
// CLOSE AS a_B GROWS: Q grows as a_B. It can close at fixed coupling (fixed m a_B, where Delta E / E_1 is fixed), as
// m -> 0, where (tan m / m - 1) / a_B falls as m^3. So the extrapolation here is in the lattice term at nearly fixed
// coupling, over the three points with readable K reads: m 0.284 a_B 12 (m a_B 3.40, E-MTR-0031's reads), m 0.380
// a_B 10 (3.80, E-MTR-0032's) and m 0.427 a_B 7.5 (3.20, read here; its K = 0 read is E-SPN-0214's).
//
// THE INSTRUMENT (code/measure/level-group, as E-MTR-0033): each level is read as its group's centroid, the start's
// overlap-weighted mean over the lines of the group, which no mixing inside the group moves; the 1s group is the lowest
// peak of weight at least 0.1, the 2s group the next peak of weight at least 0.01 above it, each window's top edge
// `edge` of the way to the next peak of weight at least 0.01. Settings: sigma 1.85e-3 (main; the finest the 4,097-lag
// reads of E-MTR-0031 allow), 2.2e-3, 2.6e-3, each with edge 0.5 and 0.4. The new point's K reads have 4,400 lags.
// EACH LEVEL'S CURVATURE (the brief's idea 1, by group and not by line): E_n(K) = E_n(0) + a_n K^2 + c_n K^4 over
// K 0, 0.2, 0.35, 0.5 (E_n(0) the K = 0 centroid, (a_n, c_n) weighted least squares, one degree of freedom); K 1.0 is
// left out, where the 2s group holds most of the start and the K^6 term is not small.
//
// GATES, fixed before the clock was computed from the centroids (the instrument probe, tmp/mm-probe-groups.ts, printed
// P1's and P3's 1s and 2s centroids, from which the gap's change at K 0.2 can be read by hand: about -1.7 and -2 times
// relativity's; so P1 and P3 are re-reads, not blind; the new point is blind):
//   I   at every K of every point, both groups' weight at least 0.05 (the 2s) and 0.2 (the 1s), and the centroid
//       half-spread over the six settings at most 5e-5 (1s) and 1.5e-4 (2s)
//   C   PER POINT, the item's gate: alpha > 0, |alpha / alpha_SR - 1| < 0.25, and both |R_n - 1| < 0.01
//   X   THE EXTRAPOLATION: eps_1 = C1 + B1 x and Delta eps = eps_1 - eps_2 = C + B x, x = (tan m / m - 1) / a_B, each a
//       weighted line through the three points; the continuum clock alpha_inf / alpha_SR = 1 - C1 - Lambda C, Lambda
//       the mean of E_1 / Delta E over the points (fixed coupling; its spread reported). Pass: alpha_inf > 0, |alpha_inf
//       / alpha_SR - 1| < 0.25, and its error at most 0.25 (resolved)
//   Verdict: fail if I fails at any point; pass if C holds at a point (the item's gate read directly); partial if C
//   fails everywhere but X passes (a continuum extrapolation, a weaker claim); fail otherwise, with the precision X
//   would need (sigma_C at most 0.25 / Lambda) and the fixed-coupling size where the fitted law reaches the gate.
// PREDICTED, for the new point m 0.427 a_B 7.5 before its K reads: alpha negative (the moving clock runs fast), between
// -2.5 and -0.5 times relativity's (E-SPN-0214's line-tracked read, -1.09, through a different instrument).
//
// STAGE 1, THE TWO SAVED POINTS RE-READ (test/record/E-SPN-0217/clock-stage1.log, before the new point's reads): I fails
// on the 2s group's stability (half-spreads 1.4e-4 to 1.9e-4 at K 0 and 0.2, gate 1.5e-4: the 2s window's top edge sits
// near the 3s line, and its truncation moves with sigma). The numbers: m 0.284 a_B 12, R_1s 1.1130 +- 0.0013, R_2s
// 1.048 +- 0.018, alpha -2.63 +- 1.06 times relativity's, Q 4.11; m 0.380 a_B 10, R_1s 1.1405 +- 0.0019, R_2s 1.056 +-
// 0.027, alpha -4.79 +- 1.98 times, Q 6.82. Both clocks run fast, as E-SPN-0214's did.
// SECOND REGISTRATION (2026-10-22, after stage 1 and before the new point's K reads landed): THE CLOCK TAKEN APART
// (code/measure/pair-clock clockDecomposition). The static class (an instantaneous pull: the members' band plus binding,
// E-SPN-0155's formula) gives each level R_static,n = (2 tan m + (5/3) e_n) / (2m - e_n), so it carries a Q of its own,
// Q_static = E_1 (R_static,1 - R_static,2) / Delta E, about 8/3 at ANY size and mass (8/3 from (5/3 + 1) e_n / 2m and
// E_1 = 4m): the levels' kinetic masses differ by their binding, which only the Darwin exchange (the transverse light,
// absent from the count's instantaneous pull) cancels, at S = 1. Stage 1's Q_static is 2.70 and 2.72; the rest, the
// lattice part, is 1.41 and 4.10, with eps_1 - eps_2 beyond the static class 0.0225 and 0.0511, 9.7 and 10.1 times
// x = (tan m / m - 1) / a_B (two points, each eps_1 - eps_2 uncertain by 0.018 and 0.027 through the 2s curvature, so
// the agreement is loose). So the raw engine's clock cannot reach relativity's at any size: its continuum
// limit is about 1 - 8/3 = -1.7 times relativity's. The diagnostic that can: the clock with each level's Darwin exchange
// restored at S = 1 (ratioDarwin, as E-MTR-0028 restored it for inertia), whose error is the lattice part alone.
// REFINED PREDICTION for m 0.427 a_B 7.5 (x 0.00874), from that decomposition: Q_static 2.74 (from the K = 0 centroids
// alone), Q_lattice about 5.0 (9.9 x times E_1 / Delta E 57.8), eps_1 about 0.19, so alpha / alpha_SR about -7, in
// [-10, -4]; the Darwin-restored ratio about -4, in [-7, -1].
//
// THE RUN AND ITS COST, estimated before it (tmp/mm-probe-cost.log): the a_B 7.5 C4v sector has 22,137 states, 2.3 s a
// cycle at 3 threads with setup on a machine at load 40 to 90, so 4,400 lags a K take 2 to 3 hours. K 0.2, 0.35, 0.5,
// 1.0 run as four processes of 2 threads (K 1.0 for E-MTR-0033's second stage).
//
// FIRST RUN (2026-10-22 23:44 to 2026-10-23 02:47, four one-K processes of 2 threads at load 50 to 93, 3.05 hours a K
// against the 2 to 3 estimated; test/record/E-SPN-0217/clock-c7.5-K*.log and .json; the verdict by
// test/record/E-SPN-0217/run/clock-combine.ts, test/record/E-SPN-0217/clock-verdict.log): FAIL. No gate moved.
//  - I fails at the two re-read points (the 2s group's half-spread 1.4e-4 to 1.9e-4 against 1.5e-4) and holds at the new
//    point (1s within 3.8e-5, 2s within 1.4e-4).
//  - THE CLOCK runs fast at all three: alpha / alpha_SR -2.63 +- 1.06 (m 0.284 a_B 12), -4.79 +- 1.98 (m 0.380 a_B 10),
//    -3.78 +- 1.01 (m 0.427 a_B 7.5, R_1s 1.2243 +- 0.0056, R_2s 1.115 +- 0.021). C fails everywhere. The new point
//    falls outside both registered predictions: the first band [-2.5, -0.5] and, narrowly, the refined [-10, -4].
//  - THE DECOMPOSITION holds where it was predicted from the K = 0 centroids alone: Q_static 2.70, 2.72, 2.74 (8/3 is
//    2.67). The lattice part is 1.41, 4.10, 3.54 (predicted about 5.0 at the new point). With each level's Darwin
//    exchange restored at S = 1 the clock reads -0.36, -2.68, -1.94 (the new point inside its predicted [-7, -1]).
//  - X fails: eps_1 - eps_2 extrapolates to 0.050 +- 0.025 (raw) and 0.011 +- 0.025 (Darwin restored), against the
//    0.0037 the gate needs; alpha_inf -2.42 +- 1.65 raw, 0.25 +- 1.65 Darwin restored. The law fitted on the
//    Darwin-restored remainders (eps_1 - eps_2 = 6.2 x, eps_1 = 14.6 x) puts the per-point clock inside the band only at
//    x <= 5.8e-4: m 0.18, a_B 18.9 at m a_B 3.4.
// MEANING. Two things stand between this engine's bound clock and relativity's, and they are separable. (1) The count's
// pull is instantaneous: without the transverse light (the Darwin exchange) each level's kinetic mass carries its own
// binding, so the 2s is lighter per unit energy than the 1s by an amount that makes Q 8/3 at every size and mass. This
// part does not fade with a_B; no run at any size can pass the item's gate on the raw engine. (2) The levels' lattice
// remainders differ, the 1s's being larger, falling with (tan m / m - 1) / a_B. With the Darwin exchange restored the
// continuum limit is consistent with relativity (0.25 +- 1.65) but not resolved: the 2s curvature carries an error of
// 0.02 in R, six times what the extrapolation needs. A resolved read needs either a 2s error near 0.003 at these points
// (longer correlations, so a finer sigma separates the 2s from the 3s; not estimated here), or a point near m 0.18
// a_B 19.
//
// Depth L2 (a two-body quantum walk on the husk quotient; the softened count as in E-SPN-0214; relativity's alpha is the
// control). DETERMINISM: no random numbers; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { groupOverSettings, type Correlation, type GroupSetting } from '@/code/measure/level-group'
import { clockDecomposition } from '@/code/measure/pair-clock'
import { thresholdRise } from '@/code/measure/pair-boost'
import { weightedLeastSquares, weightedLinearFit } from '@/code/measure/regression'
import { radiusOf, setupFor, type Setup, type TrackPoint } from '@/code/measure/register-track'

const RECORD = `${import.meta.dirname}/../../record`
const C_STAR2 = 0.5

export const SETTINGS: readonly GroupSetting[] = [
  { sigma: 0.00185, edge: 0.5 },
  { sigma: 0.00185, edge: 0.4 },
  { sigma: 0.0022, edge: 0.5 },
  { sigma: 0.0022, edge: 0.4 },
  { sigma: 0.0026, edge: 0.5 },
  { sigma: 0.0026, edge: 0.4 },
]
export const CLOCK_MOMENTA: readonly number[] = [0.2, 0.35, 0.5]
const LEAST = 0.1
const NEXT = 0.01
const BELOW = 0.02
const ABOVE = 0.006
const W1S = 0.2
const W2S = 0.05
const STABLE_1S = 5e-5
const STABLE_2S = 1.5e-4
const SIGMA_FLOOR = 1e-6
const BAND = 0.25
const REMAINDER = 0.01

export const NEW_POINT = { name: 'm0427a7.5', unit: [-5, 1] as const, aB: 7.5 }
export const newPointPlan = (): TrackPoint => ({ name: 'c7.5', aB: 7.5, R: radiusOf(7.5), N: 8192, motion: true })

type Point = { name: string; unit: readonly [number, number]; aB: number; zero: () => Correlation | null; file: (K: number) => string }

const load = (path: string, pick: (j: any) => Correlation): Correlation | null =>
  existsSync(path) ? pick(JSON.parse(readFileSync(path, 'utf8'))) : null

export const POINTS: readonly Point[] = [
  {
    name: 'm0284a12',
    unit: [-7, 2],
    aB: 12,
    zero: () => load(`${RECORD}/E-SPN-0212/spn-light-m0284-a12.json`, j => j.zero.x),
    file: K => `${RECORD}/E-MTR-0031/mtr-light-K${K}.json`,
  },
  {
    name: 'm0380a10',
    unit: [-2, 5],
    aB: 10,
    zero: () => load(`${RECORD}/E-MTR-0032/mtr-fade-m0380a10-zero.json`, j => j.x),
    file: K => `${RECORD}/E-MTR-0032/mtr-fade-m0380a10-K${K}.json`,
  },
  {
    name: NEW_POINT.name,
    unit: NEW_POINT.unit,
    aB: NEW_POINT.aB,
    zero: () => load(`${RECORD}/E-SPN-0214/spn-cleanclock-zero-7.5.json`, j => j.x),
    file: K => `${RECORD}/E-SPN-0217/clock-c7.5-K${K}.json`,
  },
]

const flag = (b: boolean): number => (b ? 1 : 0)
const lattice = (m: number, aB: number): number => (Math.tan(m) / m - 1) / aB
const spread = (xs: number[]): number => (Math.max(...xs) - Math.min(...xs)) / 2

const levelsAt = (su: Setup, x: Correlation, K: number) => {
  const rise = thresholdRise(su, K)
  const base = {
    x,
    lo: 2 * su.M0 - 0.08 + 0.3 * rise,
    hi: 2 * su.M0 + 1.2 * rise + 0.03,
    settings: SETTINGS,
    least: LEAST,
    next: NEXT,
    below: BELOW,
    above: ABOVE,
  }

  return { one: groupOverSettings({ ...base, rank: 0 }), two: groupOverSettings({ ...base, rank: 1 }) }
}

// E_n(K) - E_n(0) = a K^2 + c K^4 by weighted least squares
const curvature = (E0: number, pts: { K: number; E: number }[], sigma: number) => {
  const f = weightedLeastSquares({ rows: pts.map(p => [p.K ** 2, p.K ** 4]), ys: pts.map(p => p.E - E0), errors: pts.map(() => sigma) })

  return { a: f.coefficients[0]!, c: f.coefficients[1]!, sigmaA: f.errors[0]! }
}

export type ClockRead = {
  name: string
  m: number
  aB: number
  I: boolean
  C: boolean
  E1: number
  E2: number
  R1: number
  R2: number
  sigmaR1: number
  sigmaR2: number
  alpha: number
  alphaSR: number
  ratio: number
  sigmaRatio: number
  eps1: number
  deltaEps: number
  sigmaDeltaEps: number
  Q: number
  Qstatic: number
  eps1Full: number
  deltaEpsFull: number
  ratioDarwin: number
  text: string
  metrics: Record<string, number>
}

export function readClock(point: Point): ClockRead | null {
  const su = setupFor(point.unit)
  const zero = point.zero()
  const files = CLOCK_MOMENTA.map(K => ({ K, f: point.file(K) })).filter(r => existsSync(r.f))

  if (!zero || files.length < CLOCK_MOMENTA.length) return null

  const g0 = levelsAt(su, zero, 0)
  const gs = files.map(({ K, f }) => ({ K, g: levelsAt(su, load(f, j => j)!, K) }))
  const metrics: Record<string, number> = {}
  let I = true
  let s1 = Math.max(SIGMA_FLOOR, g0.one.half)
  let s2 = Math.max(SIGMA_FLOOR, g0.two.half)

  for (const { K, g } of [{ K: 0, g: g0 }, ...gs]) {
    const ok =
      g.one.main !== null &&
      g.two.main !== null &&
      g.one.main.weight >= W1S &&
      g.two.main.weight >= W2S &&
      g.one.half <= STABLE_1S &&
      g.two.half <= STABLE_2S

    I = I && ok
    s1 = Math.max(s1, g.one.half)
    s2 = Math.max(s2, g.two.half)
    metrics[`K${K}_c1`] = g.one.main?.centroid ?? NaN
    metrics[`K${K}_c2`] = g.two.main?.centroid ?? NaN
    metrics[`K${K}_W1`] = g.one.main?.weight ?? NaN
    metrics[`K${K}_W2`] = g.two.main?.weight ?? NaN
    metrics[`K${K}_half1`] = g.one.half
    metrics[`K${K}_half2`] = g.two.half
    metrics[`K${K}_width1`] = g.one.main?.width ?? NaN
    metrics[`K${K}_width2`] = g.two.main?.width ?? NaN
  }

  // every setting's own clock; the main read is the first, the settings' half-spread joins the fit error
  const per = SETTINGS.map((_, s) => {
    const E1 = g0.one.reads[s]?.centroid ?? NaN
    const E2 = g0.two.reads[s]?.centroid ?? NaN
    const l1 = curvature(E1, gs.map(({ K, g }) => ({ K, E: g.one.reads[s]?.centroid ?? NaN })), s1)
    const l2 = curvature(E2, gs.map(({ K, g }) => ({ K, E: g.two.reads[s]?.centroid ?? NaN })), s2)
    const R1 = C_STAR2 / (2 * l1.a * E1)
    const R2 = C_STAR2 / (2 * l2.a * E2)
    const alpha = (l1.a - l2.a) / (E2 - E1)
    const alphaSR = C_STAR2 / (2 * E1 * E2)

    return { E1, E2, l1, l2, R1, R2, alpha, alphaSR, ratio: alpha / alphaSR }
  })
  const main = per[0]!
  const sigmaR1 = Math.hypot((main.R1 * main.l1.sigmaA) / main.l1.a, spread(per.map(p => p.R1)))
  const sigmaR2 = Math.hypot((main.R2 * main.l2.sigmaA) / main.l2.a, spread(per.map(p => p.R2)))
  const dE = main.E2 - main.E1
  const sigmaRatio = Math.hypot(Math.hypot(main.l1.sigmaA, main.l2.sigmaA) / dE / main.alphaSR, spread(per.map(p => p.ratio)))
  const eps1 = main.R1 - 1
  const deltaEps = main.R1 - main.R2
  const parts = clockDecomposition({ m: su.m, M0: su.M0, E1: main.E1, E2: main.E2, R1: main.R1, R2: main.R2 })
  const C =
    main.alpha > 0 &&
    Math.abs(main.ratio - 1) < BAND &&
    Math.abs(main.R1 - 1) < REMAINDER &&
    Math.abs(main.R2 - 1) < REMAINDER

  Object.assign(metrics, {
    I: flag(I),
    C: flag(C),
    E1: main.E1,
    E2: main.E2,
    gap: dE,
    a1: main.l1.a,
    a2: main.l2.a,
    c1: main.l1.c,
    c2: main.l2.c,
    R1: main.R1,
    R2: main.R2,
    sigmaR1,
    sigmaR2,
    alpha: main.alpha,
    alphaSR: main.alphaSR,
    ratio: main.ratio,
    sigmaRatio,
    eps1,
    deltaEps,
    Q: (main.E1 * deltaEps) / dE,
    Qstatic: parts.Qstatic,
    Qlattice: parts.Qlattice,
    R1full: parts.R1full,
    R2full: parts.R2full,
    ratioDarwin: parts.ratioDarwin,
    sigma1: s1,
    sigma2: s2,
  })

  return {
    name: point.name,
    m: su.m,
    aB: point.aB,
    I,
    C,
    E1: main.E1,
    E2: main.E2,
    R1: main.R1,
    R2: main.R2,
    sigmaR1,
    sigmaR2,
    alpha: main.alpha,
    alphaSR: main.alphaSR,
    ratio: main.ratio,
    sigmaRatio,
    eps1,
    deltaEps,
    sigmaDeltaEps: Math.hypot(sigmaR1, sigmaR2),
    Q: (main.E1 * deltaEps) / dE,
    Qstatic: parts.Qstatic,
    eps1Full: parts.R1full - 1,
    deltaEpsFull: parts.R1full - parts.R2full,
    ratioDarwin: parts.ratioDarwin,
    text: `${point.name} (m ${su.m.toFixed(4)}, a_B ${point.aB}, m a_B ${(su.m * point.aB).toFixed(2)}): 1s ${main.E1.toFixed(7)} R ${main.R1.toFixed(4)} +- ${sigmaR1.toFixed(4)}, 2s ${main.E2.toFixed(7)} R ${main.R2.toFixed(4)} +- ${sigmaR2.toFixed(4)}, gap ${dE.toFixed(5)}; alpha ${main.alpha.toExponential(3)} against ${main.alphaSR.toExponential(3)}, ratio ${main.ratio.toFixed(3)} +- ${sigmaRatio.toFixed(3)}; Q ${((main.E1 * deltaEps) / dE).toFixed(3)}; I ${I} C ${C}. ${[{ K: 0, g: g0 }, ...gs]
      .map(({ K, g }) => `K ${K}: 1s ${(g.one.main?.centroid ?? NaN).toFixed(7)} (W ${(g.one.main?.weight ?? NaN).toFixed(3)}, half ${g.one.half.toExponential(1)}), 2s ${(g.two.main?.centroid ?? NaN).toFixed(7)} (W ${(g.two.main?.weight ?? NaN).toFixed(3)}, half ${g.two.half.toExponential(1)})`)
      .join('; ')}`,
    metrics,
  }
}

export function combineClock(reads: readonly ClockRead[]): Verdict {
  const metrics: Record<string, number> = {}
  const instrument = reads.length === POINTS.length && reads.every(r => r.I)
  const direct = reads.some(r => r.C)
  const xs = reads.map(r => lattice(r.m, r.aB))
  const f1 = weightedLinearFit({ xs, ys: reads.map(r => r.eps1), errors: reads.map(r => Math.max(1e-6, r.sigmaR1)) })
  const fd = weightedLinearFit({ xs, ys: reads.map(r => r.deltaEps), errors: reads.map(r => Math.max(1e-6, r.sigmaDeltaEps)) })
  const lambdas = reads.map(r => r.E1 / (r.E2 - r.E1))
  const Lambda = lambdas.reduce((s, x) => s + x, 0) / lambdas.length
  const ratioInf = 1 - f1.intercept - Lambda * fd.intercept
  const sigmaInf = Math.hypot(f1.interceptError, Lambda * fd.interceptError)
  const X = reads.length >= 3 && ratioInf > 0 && Math.abs(ratioInf - 1) < BAND && sigmaInf <= BAND
  // the same extrapolation with each level's Darwin exchange restored at S = 1 (a diagnostic, not gated)
  const g1 = weightedLinearFit({ xs, ys: reads.map(r => r.eps1Full), errors: reads.map(r => Math.max(1e-6, r.sigmaR1)) })
  const gd = weightedLinearFit({ xs, ys: reads.map(r => r.deltaEpsFull), errors: reads.map(r => Math.max(1e-6, r.sigmaDeltaEps)) })
  const ratioInfDarwin = 1 - g1.intercept - Lambda * gd.intercept
  const sigmaInfDarwin = Math.hypot(g1.interceptError, Lambda * gd.interceptError)
  // the fixed-coupling size at which the Darwin-restored law puts the per-point clock in the band: |eps1(x) + Lambda
  // Deps(x)| < 0.25 with the intercepts set to 0 (the law's own lattice part), x = (tan m / m - 1) / a_B at m a_B 3.4
  const xNeed = BAND / Math.abs(g1.slope + Lambda * gd.slope)
  let mNeed = NaN

  for (let m = 0.5; m > 0.005; m *= 0.999) {
    if (lattice(m, 3.4 / m) <= xNeed) {
      mNeed = m
      break
    }
  }

  const status: Verdict['status'] = !instrument ? 'fail' : direct ? 'pass' : X ? 'partial' : 'fail'

  for (const r of reads) for (const [k, v] of Object.entries(r.metrics)) metrics[`${r.name}_${k}`] = v
  Object.assign(metrics, {
    C1: f1.intercept,
    sigmaC1: f1.interceptError,
    B1: f1.slope,
    Cdelta: fd.intercept,
    sigmaCdelta: fd.interceptError,
    Bdelta: fd.slope,
    chi2delta: fd.chi2,
    Lambda,
    LambdaSpread: spread(lambdas),
    ratioInf,
    sigmaInf,
    X: flag(X),
    C1full: g1.intercept,
    Cdeltafull: gd.intercept,
    sigmaCdeltafull: gd.interceptError,
    Bdeltafull: gd.slope,
    B1full: g1.slope,
    ratioInfDarwin,
    sigmaInfDarwin,
    meanQstatic: reads.reduce((s, r) => s + r.Qstatic, 0) / reads.length,
    neededSigmaCdelta: BAND / Lambda,
    xNeed,
    mNeed,
    aBNeed: 3.4 / mNeed,
  })

  return verdict({
    status,
    claim: `the 1s-2s clock read as level-group centroids: ${reads.map(r => `${r.ratio.toFixed(3)} +- ${r.sigmaRatio.toFixed(3)} of relativity's at m ${r.m.toFixed(3)} a_B ${r.aB} (R ${r.R1.toFixed(4)} and ${r.R2.toFixed(4)}, Q ${r.Q.toFixed(2)})`).join('; ')}; extrapolated at m a_B near 3.4 in (tan m / m - 1) / a_B: eps_1 -> ${f1.intercept.toFixed(4)} +- ${f1.interceptError.toFixed(4)}, eps_1 - eps_2 -> ${fd.intercept.toFixed(4)} +- ${fd.interceptError.toFixed(4)} (gate needs its error under ${(BAND / Lambda).toFixed(4)}), alpha_inf ${ratioInf.toFixed(3)} +- ${sigmaInf.toFixed(3)} of relativity's (X ${X}); the static class's share of Q is ${reads.map(r => r.Qstatic.toFixed(2)).join(', ')} (8/3 at any size: the instantaneous pull's level-dependent inertia), and with each level's Darwin exchange restored at S = 1 the clock reads ${reads.map(r => r.ratioDarwin.toFixed(2)).join(', ')} and extrapolates to ${ratioInfDarwin.toFixed(3)} +- ${sigmaInfDarwin.toFixed(3)}; that law reaches the band at m ${mNeed.toFixed(3)}, a_B ${(3.4 / mNeed).toFixed(1)}; instrument ${instrument}`,
    metrics,
    control: Object.fromEntries(reads.map(r => [`alphaSR_${r.name}`, r.alphaSR])),
    notes: `L2. ${reads.map(r => r.text).join(' | ')}`,
  })
}

export function runClock(): Verdict {
  return combineClock(POINTS.map(p => readClock(p)).filter((r): r is ClockRead => r !== null))
}

export default experiment({
  id: 'spin/register-pair-clock-continuum',
  code: 'E-SPN-0217',
  title:
    "explores whether the register pair's 1s-2s clock dilates as relativity says once its levels' lattice remainders are extrapolated to the continuum, each level read as its level group's centroid, at m 0.284 a_B 12, m 0.380 a_B 10 and m 0.427 a_B 7.5: fail, the clock runs fast at all three (-2.6, -4.8, -3.8 times relativity's); 8/3 of its error is the instantaneous pull's level-dependent inertia at any size, and with the Darwin exchange restored the extrapolated clock, 0.25 +- 1.65 of relativity's, is not resolved",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return runClock()
  },
})
