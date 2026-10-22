// IS THE LIGHT PAIR'S EXTRA QUARTIC ITS MEMBERS' LATTICE BAND, CARRIED BY THE BOUND STATE? (E-MTR-0033, OPEN-MOT-01,
// vibe-roadmap-moving-matter-0002). E-MTR-0031 and E-MTR-0032 read the light register pair's quartic fraction rho at
// m 0.284 a_B 12 (2.21 +- 0.05) and m 0.380 a_B 10 (3.21 +- 0.14) against relativity's 1 and the members' own 1.77 and
// 2.41, through a filter-diagonalization read that split the moving level into a "multiplet" differently at every
// setting. This file changes two things and adds no engine run: it reads every saved correlation again with an
// instrument that does not need the multiplet resolved, and it separates the members' lattice band from what binding
// adds, with a prediction computed before the pair's rho is read.
//
// WHY NOT THE LITTLE GROUP'S IRREPS (the first idea tried, on paper). The reduced engine (code/measure/register-reduced)
// stores only states invariant under the little group of K, psi(g y) = rho(g) psi(y): the trivial irrep A1 of C4v along
// an axis. Levels of A2, B1, B2 and E are never in the sector, so no two levels of different irreps can be confused by
// the solver. Every line of the "multiplet" is A1. What C4v's A1 gathers that O_h's A1g kept apart is A1g, Eg and T1u
// (the 1s orbital times the internal states of those irreps, and 2p_z near the 2s). So projecting on the little group's
// irreps changes nothing here; a finer label would need a symmetry the moving sector keeps, and the only one left is
// the exchange of the two members, which the boost (an exchange-even operator) does not break either.
//
// THE INSTRUMENT: THE LEVEL GROUP'S CENTROID (code/measure/level-group). The start's spectral measure smoothed by a
// Gaussian of width sigma, integrated over a window whose edges sit in gaps of the spectrum, gives the group's weight W,
// centroid c = sum o_i E_i / W and width. The centroid is the start's own diagonal energy on the group: lines that mix
// with K move apart, but their overlap-weighted mean does not, and it is within the group's width of each line. The
// group: the lowest peak of weight at least 0.1 in [2 M0 - 0.08 + 0.3 rise, 2 M0 + 1.2 rise + 0.03] (rise the lone
// member's threshold rise, code/measure/pair-boost thresholdRise), its window from 0.02 under its peak to `edge` of the
// way up to the next peak of weight at least 0.03. Settings: sigma 2.0e-3 (the main read), 2.5e-3, 3.0e-3, each with edge
// 0.5 and 0.4. sigma 2e-3 is the finest the 4,097-lag reads of E-MTR-0031 allow (the lag taper below 1e-12 at 3,715).
//
// THE DECOMPOSITION (the prediction). If binding only holds the members together, the pair at total momentum K has the
// energy of its two members at K/2 + p and K/2 - p, averaged over the level's relative-momentum density:
//   E_imp(K) = E0 + < E_m(K/2 + p) + E_m(K/2 - p) - 2 E_m(p) >   (code/measure/lattice-pair-inertia latticePairBand)
// with E_m the member's exact cycle band and the density hydrogenic at the radius whose binding is the level's own
// (bindingRadius, E0 the recorded K = 0 ground). Its rho, rho_imp, is fitted exactly as the pair's is. For a
// nonrelativistic composite of relativistic members this gives relativity's quartic automatically, 2 (K/2)^4 / (8 m^3) =
// K^4 / (8 (2m)^3), so rho_imp is the members' rho moved only by the density (an order <p^2> correction). A second form
// asks less: binding may change the K^2 coefficient (E-MTR-0028 found it does, by a lattice term in 1/a_B) but nothing
// beyond it. Write N(K) = E_imp(K) - E0 - a_imp K^2, a_imp the impulse's exact curvature (latticePairCurvature), and fit
//   E(K) - E0 = a K^2 + lambda N(K)
// lambda 1 means the pair's whole non-quadratic band is its members' carried by the bound state.
//
// GATES, fixed before the pair's rho was computed from the centroids (the instrument probe, tmp/mm-probe-groups.ts,
// printed the centroids and their spreads but no rho; the W2 and I tolerances below were set after it and are disclosed
// as such; the physics gates D, L, LIMIT were set before any rho):
//   W1  WITNESS, synthetic: lines 1.5 (0.3) and 1.5003 (0.33) beside 1.519 (0.2) and 1.4 (0.1), 8,192 lags: the centroid
//       of the pair of lines within 1e-7 of its exact value at sigma 2e-3
//   W2  WITNESS, K = 0: the centroid within 1e-4 of the recorded ground (P1 1.1141074420, E-SPN-0212; P3 1.4989864343,
//       E-MTR-0032), at the main setting
//   I   INSTRUMENT at every K of P1 and P3: group weight at least 0.2, centroid half-spread over the six settings at
//       most 5e-5
//   THE FIT: E0 the K = 0 centroid (same setting), (a, rho) by code/measure/pair-boost quarticFractionFit with sigma_E the
//       largest per-K half-spread (floor 1e-6); sigma_rho the fit's error and the half-spread of rho over settings in
//       quadrature. The same for lambda (weighted linear least squares).
//   D   THE BRIEF'S DECOMPOSITION: |rho - rho_imp| <= 2 sqrt(sigma_rho^2 + sigma_imp^2) at P1 and at P3, sigma_imp the
//       change of rho_imp when the density's radius is a_B instead of the binding radius
//   L   THE NON-QUADRATIC RATIO: |lambda - 1| <= 2 sigma_lambda at P1 and at P3
//   LIMIT (the registered item's fit): Delta = rho - rho_member (rho_member the lone member's own fraction averaged over
//       the K, its exact band, the control) against the lattice term (tan m / m - 1) / a_B, a line through P1 and P3
//       weighted by sigma_rho; its intercept C is the continuum excess and the limit is rho_inf = 1 + C, since
//       rho_member -> 1 as m -> 0 (M below). Pass when |C| <= 2 sigma_C and sigma_C <= 0.1 (a limit known to 0.1)
//   M   THE MEMBERS' LIMIT (L1, exact band only): rho_member at the same K / m as P1's four K, for m = 0.284, 0.142,
//       0.071, 0.0355, falls to within 0.01 of 1 at m 0.0355, and (rho_member - 1) / m^2 changes by under 10% from
//       m 0.071 to 0.0355; the same for rho_imp at m a_B 3.40 fixed (the binding radius scaled with 1/m)
//   Verdict: fail if W1, W2 or I fails; pass if LIMIT passes; partial if LIMIT fails but D or L holds at both points (the
//   quartic accounted for by the members' band, a weaker claim than relativity outright); fail otherwise.
// PREDICTED (computed before the pair's rho from the members' band and the recorded K = 0 grounds only,
// test/record/E-MTR-0033/mtr-band-predict.log, 2026-10-22): rho_imp 1.738 at P1 (binding radius 9.12; 1.739 with the
// density at a_B 12, sigma_imp 4e-4; R_imp 1.074) and 2.389 at P3 (radius 7.54; 2.380 at a_B, sigma_imp 0.009; R_imp
// 1.097), against the lone members' 1.770 and 2.414: the carried band sits 0.03 under its members'. M, read at the
// same time: the members' fraction at P1's K / m is 1.770, 1.189, 1.047, 1.0118 at m 0.284, 0.142, 0.071, 0.0355
// ((rho - 1) / m^2 9.57, 9.40, 9.36, 9.36: the scaling clause holds), so M reads FALSE on its first clause (1.0118 is
// not within 0.01 of 1 at m 0.0355; the threshold was set too tight for a 9.4 m^2 approach, and it stands). The carried
// band at fixed m a_B reads 1.738, 1.153, 1.011, 0.976: it does not tend to 1 but to about 0.97, under it by the
// order of the binding's share of the rest energy (Eb / E0 0.018): the frozen bound state is not itself a relativistic
// composite, which is expected of an impulse picture and is not a lattice term.
//
//
// FIRST RUN (2026-10-22, test/record/E-MTR-0033/mtr-band-verdict.log, seconds, no engine run): FAIL. No gate moved.
//  - The instrument holds: W1 off by 1.0e-8; the K = 0 centroids 7.5e-6 (P1) and 6.7e-5 (P3) above the recorded
//    grounds (P3's group holds a little weight just above its main line); every K's centroid stable to 3.5e-5 over the
//    six settings, weights 0.28 to 0.67. Read this way the moving level is no multiplet: its group's own width grows
//    from 4e-4 at K 0 to 1.3e-3 (P1) and 1.6e-3 (P3) at K 1.0, but the group's centroid is one smooth curve.
//  - THE NUMBERS. rho 2.192 +- 0.009 at P1 (per K 2.68, 2.20, 2.19, 2.19; K 0.2 resolves rho poorly) and 3.241 +-
//    0.018 at P3 (4.56, 3.36, 3.22, 3.24), each fitted with rms 7e-6 and 1.1e-5: E-MTR-0031's and E-MTR-0032's values
//    (2.21 +- 0.05, 3.21 +- 0.14) confirmed, now to 0.4% and 0.6%. R 1.111 and 1.138.
//  - D fails: the members' band carried by the bound state predicts 1.738 and 2.389; the pair is 0.45 and 0.85 above it
//    (50 sigma). L fails: lambda 1.184 +- 0.007 and 1.266 +- 0.009, so even with its own K^2 coefficient the pair bends
//    18 and 27 percent more than its members' band beyond K^2. Binding adds a quartic of its own.
//  - LIMIT fails: Delta 0.422 and 0.827 on the lattice term 0.00231 and 0.00507 give C 0.088 +- 0.022, rho_inf 1.088,
//    4 sigma above 1. With two points the form is assumed, not tested: a term in m^2 gives another intercept, a term
//    in 1 / (m a_B) one far from 1. P2 (m 0.284 a_B 8) fails the instrument (W2 1.4e-4; at K 1.0 its group spreads
//    over 6e-3 and moves 4e-4 with the settings), so it is reported and not used.
// MEANING. The extra quartic is real and was not an instrument artifact: the group does hold lines closer than the
// solver resolves (its width grows with K), which is why the solver split it differently at every setting, but the
// group's centroid is one smooth curve, read with errors 5 to 8 times smaller. It is not the members' band either: binding adds 18 to 27
// percent beyond K^2. What it is, by the weights: as K grows the start's weight leaves the 1s group for the 2s group
// (P1: 0.69 and 0.26 at K 0, 0.28 and 0.54 at K 1.0), so the moving 1s mixes with the n = 2 levels far more than a
// Lorentz contraction would (a rough estimate gives a 2% change of overlap at K 1.0, v 0.63 c); a mixing that grows with
// K repels the 1s downward, the sign of the extra quartic (a reading, not shown here). Whether it
// fades in the continuum is the form question, which two points cannot answer.
//
// SECOND STAGE (registered 2026-10-22 after the first verdict, before any K read of the new point existed; the forms'
// predictions are test/record/E-MTR-0033/mtr-band-stage2-predict.log): a third point, m 0.427 a_B 7.5 (x 0.00874,
// m a_B 3.20), read by E-SPN-0217's part runner at K 0.2, 0.35, 0.5, 1.0 (4,400 lags; its K = 0 read is E-SPN-0214's,
// 8,444 lags). The two-point forms predict its rho as: lattice term 4.159 (+- 0.044), m^2 3.873, 1 / (m a_B) 2.986
// (+- 0.018); the members' band carried 2.795 (radius 5.55), the lone member 2.808. Its lambda: 1.371, 1.314, 1.135.
//   S2-I  the new point passes W2 (within 1e-4 of E-SPN-0214's tracked 1s) and I, as the first two
//   S2-F  a form survives when |rho_new - its prediction| <= 3 sqrt(sigma_new^2 + 0.044^2)
//   S2-LIMIT  the three-point weighted fit Delta = C + B x: pass when |C| <= 2 sigma_C, sigma_C <= 0.1 and its chi^2 is at
//       most 3.84 (one degree of freedom); otherwise fail (and if chi^2 > 3.84, the lattice form itself is rejected)
//   Final verdict once the new point's four reads exist: fail if S2-I fails, else pass if S2-LIMIT passes, else partial
//   if D or L holds at all three points, else fail.
//
// Depth L2 (a two-body quantum walk on the husk quotient read through saved correlations; the lone member's band is the
// control; M is L1). DETERMINISM: no random numbers, no engine run.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { diracPhase } from '@/code/measure/spinor-register'
import {
  bindingRadius,
  latticePairBand,
  latticePairCurvature,
} from '@/code/measure/lattice-pair-inertia'
import {
  groupMoments,
  groupOverSettings,
  syntheticCorrelation,
  type Correlation,
  type GroupSetting,
} from '@/code/measure/level-group'
import { memberQuarticFraction, quarticFractionFit, thresholdRise } from '@/code/measure/pair-boost'
import { weightedLeastSquares, weightedLinearFit } from '@/code/measure/regression'
import { setupFor, type Setup } from '@/code/measure/register-track'

const RECORD = `${import.meta.dirname}/../../record`

export const SETTINGS: readonly GroupSetting[] = [
  { sigma: 0.002, edge: 0.5 },
  { sigma: 0.002, edge: 0.4 },
  { sigma: 0.0025, edge: 0.5 },
  { sigma: 0.0025, edge: 0.4 },
  { sigma: 0.003, edge: 0.5 },
  { sigma: 0.003, edge: 0.4 },
]
const LEAST = 0.1
const NEXT = 0.03
const BELOW = 0.02
const ABOVE = 0.01
const SYNTH = 1e-7
const WITNESS = 1e-4
const WEIGHT = 0.2
const STABLE = 5e-5
const SIGMA_FLOOR = 1e-6
const TWO = 2
const LIMIT_RESOLUTION = 0.1
const MEMBER_NEAR = 0.01
const MEMBER_SCALING = 0.1
const MEMBER_MASSES: readonly number[] = [0.2836816722286698, 0.1418408361143349, 0.07092041805716745, 0.035460209028583725]

export type Point = {
  name: string
  unit: readonly [number, number]
  aB: number
  E0ref: number
  zero: () => Correlation | null
  reads: readonly { K: number; file: string }[]
  gated: boolean
}

const load = (path: string, pick: (j: any) => Correlation): Correlation | null =>
  existsSync(path) ? pick(JSON.parse(readFileSync(path, 'utf8'))) : null

export const POINTS: readonly Point[] = [
  {
    name: 'm0284a12',
    unit: [-7, 2],
    aB: 12,
    E0ref: 1.1141074420257853,
    zero: () => load(`${RECORD}/E-SPN-0212/spn-light-m0284-a12.json`, j => j.zero.x),
    reads: [0.2, 0.35, 0.5, 1].map(K => ({ K, file: `${RECORD}/E-MTR-0031/mtr-light-K${K}.json` })),
    gated: true,
  },
  {
    name: 'm0380a10',
    unit: [-2, 5],
    aB: 10,
    E0ref: 1.4989864343049508,
    zero: () => load(`${RECORD}/E-MTR-0032/mtr-fade-m0380a10-zero.json`, j => j.x),
    reads: [0.2, 0.35, 0.5, 1].map(K => ({ K, file: `${RECORD}/E-MTR-0032/mtr-fade-m0380a10-K${K}.json` })),
    gated: true,
  },
  {
    name: 'm0284a8',
    unit: [-7, 2],
    aB: 8,
    E0ref: 1.0842040881932993,
    zero: () => load(`${RECORD}/E-SPN-0211/spn-mass-m0284.json`, j => j.zero.x),
    reads: [0.5, 1].map(K => ({ K, file: `${RECORD}/E-MTR-0032/mtr-fade-m0284a8-K${K}.json` })),
    gated: false,
  },
]

// the second stage's point, read by E-SPN-0217's part runner (its K = 0 read is E-SPN-0214's)
const STAGE_TWO_ZERO = `${RECORD}/E-SPN-0214/spn-cleanclock-zero-7.5.json`

export const STAGE_TWO: Point = {
  name: 'm0427a7.5',
  unit: [-5, 1],
  aB: 7.5,
  E0ref: existsSync(STAGE_TWO_ZERO) ? (JSON.parse(readFileSync(STAGE_TWO_ZERO, 'utf8')).tracked.E as number) : NaN,
  zero: () => load(STAGE_TWO_ZERO, j => j.x),
  reads: [0.2, 0.35, 0.5, 1].map(K => ({ K, file: `${RECORD}/E-SPN-0217/clock-c7.5-K${K}.json` })),
  gated: false,
}

const flag = (b: boolean): number => (b ? 1 : 0)
const lattice = (m: number, aB: number): number => (Math.tan(m) / m - 1) / aB

// ---- the prediction: the members' band carried by the bound state ----

export type Impulse = {
  radius: number
  aImp: number
  bands: { K: number; E: number }[]
  rhoImp: number
  rhoImpAB: number
  sigmaImp: number
}

const impulseRho = (su: Setup, E0: number, radius: number, Ks: readonly number[]) => {
  const bands = Ks.map(K => ({ K, E: E0 + latticePairBand({ M0: su.M0, radius, K }) }))
  const a0 = latticePairCurvature({ M0: su.M0, radius }).a
  const fit = quarticFractionFit({ E0, points: bands, a0, sigma: 1e-9 })

  return { bands, rho: fit.rho, a: a0 }
}

export function predictImpulse(point: Point): Impulse {
  const su = setupFor(point.unit)
  const Ks = point.reads.map(r => r.K)
  const radius = bindingRadius(su.mu, 2 * su.M0 - point.E0ref)
  const main = impulseRho(su, point.E0ref, radius, Ks)
  const alt = impulseRho(su, point.E0ref, point.aB, Ks)

  return {
    radius,
    aImp: main.a,
    bands: main.bands,
    rhoImp: main.rho,
    rhoImpAB: alt.rho,
    sigmaImp: Math.abs(main.rho - alt.rho),
  }
}

// the lone member's fraction at K = kappa m (kappa P1's K / m), for any member rest phase M0 = 2 m, from its exact band
export function memberFractionAt(m: number, kappas: readonly number[]): number {
  const M0 = 2 * m
  const h = 1e-3 * m
  const E = (k: number): number => diracPhase([k, 0, 0, 0], M0)
  const aM = (4 * ((E(h) - M0) / h ** 2) - (E(2 * h) - M0) / (2 * h) ** 2) / 3
  const cm2 = 2 * aM * M0
  const fr = kappas.map(kap => {
    const k = (kap * m) / 2
    const gal = M0 + (cm2 / (2 * M0)) * k * k
    const rel = Math.sqrt(M0 ** 2 + cm2 * k * k)

    return (gal - E(k)) / (gal - rel)
  })

  return fr.reduce((s, x) => s + x, 0) / fr.length
}

// rho_imp at fixed m a_B (the binding radius scaled with 1 / m, the binding's share of the rest energy kept) and the same
// K / m
export function impulseFractionAt(m: number, radiusAtP1: number, mP1: number, kappas: readonly number[], restShare: number): number {
  const M0 = 2 * m
  const radius = (radiusAtP1 * mP1) / m
  const Ks = kappas.map(k => k * m)
  const E0 = 2 * M0 * restShare
  const bands = Ks.map(K => ({ K, E: E0 + latticePairBand({ M0, radius, K }) }))
  const a0 = latticePairCurvature({ M0, radius }).a

  return quarticFractionFit({ E0, points: bands, a0, sigma: 1e-9 }).rho
}

// ---- the pair read: the 1s group's centroid at every K and setting ----

export type PointRead = {
  name: string
  m: number
  aB: number
  gated: boolean
  W2: boolean
  I: boolean
  E0: number
  rho: number
  sigmaRho: number
  a: number
  lambda: number
  sigmaLambda: number
  rhoMember: number
  delta: number
  impulse: Impulse
  D: boolean
  L: boolean
  text: string
  metrics: Record<string, number>
}

const groupAt = (su: Setup, x: Correlation, K: number) => {
  const rise = thresholdRise(su, K)

  return groupOverSettings({
    x,
    lo: 2 * su.M0 - 0.08 + 0.3 * rise,
    hi: 2 * su.M0 + 1.2 * rise + 0.03,
    settings: SETTINGS,
    least: LEAST,
    next: NEXT,
    below: BELOW,
    above: ABOVE,
  })
}

const lambdaFit = (E0: number, aImp: number, imp: { K: number; E: number }[], pts: { K: number; E: number }[], sigma: number) => {
  const rows = pts.map((p, i) => [p.K ** 2, imp[i]!.E - E0 - aImp * p.K ** 2])
  const ys = pts.map(p => p.E - E0)
  const f = weightedLeastSquares({ rows, ys, errors: pts.map(() => sigma) })
  const resid = pts.map((p, i) => ys[i]! - f.coefficients[0]! * rows[i]![0]! - f.coefficients[1]! * rows[i]![1]!)
  const scatter = Math.sqrt(resid.reduce((s, r) => s + r * r, 0) / Math.max(1, pts.length - 2))
  const scale = Math.max(1, scatter / sigma)

  return { a: f.coefficients[0]!, lambda: f.coefficients[1]!, sigmaLambda: f.errors[1]! * scale }
}

export function readPoint(point: Point, impulse: Impulse): PointRead | null {
  const su = setupFor(point.unit)
  const zero = point.zero()

  if (!zero) return null

  const reads = point.reads.filter(r => existsSync(r.file)).map(r => ({ K: r.K, x: load(r.file, j => j)! }))
  const g0 = groupAt(su, zero, 0)
  const groups = reads.map(r => ({ K: r.K, g: groupAt(su, r.x, r.K) }))
  const metrics: Record<string, number> = {}
  const E0main = g0.main?.centroid ?? NaN
  const W2 = Math.abs(E0main - point.E0ref) <= WITNESS
  let I = true
  let sigmaE = Math.max(SIGMA_FLOOR, g0.half)

  for (const { K, g } of groups) {
    const ok = g.main !== null && g.main.weight >= WEIGHT && g.half <= STABLE

    I = I && ok
    sigmaE = Math.max(sigmaE, g.half)
    metrics[`K${K}_c`] = g.main?.centroid ?? NaN
    metrics[`K${K}_W`] = g.main?.weight ?? NaN
    metrics[`K${K}_width`] = g.main?.width ?? NaN
    metrics[`K${K}_half`] = g.half
  }

  // the fit at each setting, E0 that setting's own K = 0 centroid
  const perSetting = SETTINGS.map((_, s) => {
    const E0 = g0.reads[s]?.centroid ?? NaN
    const pts = groups.map(({ K, g }) => ({ K, E: g.reads[s]?.centroid ?? NaN }))
    const a0 = thresholdRise(su, 0.2) / 0.04
    const fit = quarticFractionFit({ E0, points: pts, a0, sigma: sigmaE })
    const lam = lambdaFit(E0, impulse.aImp, impulse.bands.map(b => ({ K: b.K, E: b.E - point.E0ref + E0 })), pts, sigmaE)

    return { fit, lam }
  })
  const main = perSetting[0]!
  const rhos = perSetting.map(p => p.fit.rho)
  const lams = perSetting.map(p => p.lam.lambda)
  const spread = (xs: number[]): number => (Math.max(...xs) - Math.min(...xs)) / 2
  const sigmaRho = Math.hypot(main.fit.sigmaRho, spread(rhos))
  const sigmaLambda = Math.hypot(main.lam.sigmaLambda, spread(lams))
  const Ks = groups.map(g => g.K)
  const rhoMember = Ks.reduce((s, K) => s + memberQuarticFraction(su, K), 0) / Ks.length
  const D = Math.abs(main.fit.rho - impulse.rhoImp) <= TWO * Math.hypot(sigmaRho, impulse.sigmaImp)
  const L = Math.abs(main.lam.lambda - 1) <= TWO * sigmaLambda

  metrics.E0 = E0main
  metrics.E0_off = E0main - point.E0ref
  metrics.E0_half = g0.half
  metrics.W2 = flag(W2)
  metrics.I = flag(I)
  metrics.sigmaE = sigmaE
  metrics.a = main.fit.a
  metrics.R = 0.5 / (2 * main.fit.a * E0main)
  metrics.rho = main.fit.rho
  metrics.sigmaRho = sigmaRho
  metrics.rhoFitError = main.fit.sigmaRho
  metrics.rhoSettingsHalf = spread(rhos)
  metrics.rms = main.fit.rms
  metrics.lambda = main.lam.lambda
  metrics.sigmaLambda = sigmaLambda
  metrics.aLambda = main.lam.a
  metrics.rhoImp = impulse.rhoImp
  metrics.rhoImpAB = impulse.rhoImpAB
  metrics.aImp = impulse.aImp
  metrics.Rimp = 0.5 / (2 * impulse.aImp * point.E0ref)
  metrics.rhoMember = rhoMember
  metrics.delta = main.fit.rho - rhoMember
  metrics.D = flag(D)
  metrics.L = flag(L)
  for (const p of main.fit.perK) metrics[`K${p.K}_rho`] = p.rho

  return {
    name: point.name,
    m: su.m,
    aB: point.aB,
    gated: point.gated,
    W2,
    I,
    E0: E0main,
    rho: main.fit.rho,
    sigmaRho,
    a: main.fit.a,
    lambda: main.lam.lambda,
    sigmaLambda,
    rhoMember,
    delta: main.fit.rho - rhoMember,
    impulse,
    D,
    L,
    text: `${point.name} (m ${su.m.toFixed(4)}, a_B ${point.aB}): E0 ${E0main.toFixed(8)} (ref ${point.E0ref.toFixed(8)}), rho ${main.fit.rho.toFixed(3)} +- ${sigmaRho.toFixed(3)} (fit ${main.fit.sigmaRho.toFixed(3)}, settings ${spread(rhos).toFixed(3)}), R ${metrics.R.toFixed(4)}, rms ${main.fit.rms.toExponential(2)}, sigma_E ${sigmaE.toExponential(2)}; rho_imp ${impulse.rhoImp.toFixed(3)} (radius ${impulse.radius.toFixed(2)}; ${impulse.rhoImpAB.toFixed(3)} at a_B), R_imp ${metrics.Rimp.toFixed(4)}; lambda ${main.lam.lambda.toFixed(3)} +- ${sigmaLambda.toFixed(3)}; member ${rhoMember.toFixed(3)}; W2 ${W2} I ${I} D ${D} L ${L}. ${groups
      .map(({ K, g }) => `K ${K}: c ${(g.main?.centroid ?? NaN).toFixed(8)} W ${(g.main?.weight ?? NaN).toFixed(3)} width ${(g.main?.width ?? NaN).toExponential(2)} half ${g.half.toExponential(2)}`)
      .join('; ')}`,
    metrics,
  }
}

export function witnessSynthetic(): { off: number; ok: boolean } {
  const lines = [
    { E: 1.5, o: 0.3 },
    { E: 1.5003, o: 0.33 },
    { E: 1.519, o: 0.2 },
    { E: 1.4, o: 0.1 },
  ]
  const g = groupMoments({ x: syntheticCorrelation(lines, 8192), lo: 1.49, hi: 1.5095, sigma: 0.002 })
  const off = g.centroid - (1.5 * 0.3 + 1.5003 * 0.33) / 0.63

  return { off, ok: Math.abs(off) <= SYNTH }
}

export function memberLimit(radiusP1: number): { members: number[]; impulses: number[]; M: boolean } {
  const kappas = [0.2, 0.35, 0.5, 1].map(K => K / MEMBER_MASSES[0]!)
  const p1 = POINTS[0]!
  const restShare = p1.E0ref / (2 * setupFor(p1.unit).M0)
  const members = MEMBER_MASSES.map(m => memberFractionAt(m, kappas))
  const impulses = MEMBER_MASSES.map(m => impulseFractionAt(m, radiusP1, MEMBER_MASSES[0]!, kappas, restShare))
  const near = (xs: number[]) => Math.abs(xs[xs.length - 1]! - 1) <= MEMBER_NEAR
  const scaling = (xs: number[]) => {
    const n = xs.length
    const s1 = (xs[n - 2]! - 1) / MEMBER_MASSES[n - 2]! ** 2
    const s2 = (xs[n - 1]! - 1) / MEMBER_MASSES[n - 1]! ** 2

    return Math.abs(s2 / s1 - 1) <= MEMBER_SCALING
  }

  return { members, impulses, M: near(members) && scaling(members) && near(impulses) && scaling(impulses) }
}

export function combineDecomposition(reads: readonly PointRead[], synthetic: { off: number; ok: boolean }, limit: ReturnType<typeof memberLimit>): Verdict {
  const gated = reads.filter(r => r.gated)
  const metrics: Record<string, number> = { W1: flag(synthetic.ok), W1_off: synthetic.off, M: flag(limit.M) }
  const instrument = synthetic.ok && gated.length === 2 && gated.every(r => r.W2 && r.I)
  const fit = weightedLinearFit({
    xs: gated.map(r => lattice(r.m, r.aB)),
    ys: gated.map(r => r.delta),
    errors: gated.map(r => r.sigmaRho),
  })
  // with two points the line is exact; its intercept's error is the points' errors carried through
  const [p, q] = gated
  const Lp = lattice(p!.m, p!.aB)
  const Lq = lattice(q!.m, q!.aB)
  const C = p!.delta - (Lp * (q!.delta - p!.delta)) / (Lq - Lp)
  const sigmaC = Math.hypot((1 + Lp / (Lq - Lp)) * p!.sigmaRho, (Lp / (Lq - Lp)) * q!.sigmaRho)
  const LIMIT = Math.abs(C) <= TWO * sigmaC && sigmaC <= LIMIT_RESOLUTION
  const decomposition = gated.every(r => r.D) || gated.every(r => r.L)
  const lw = gated.reduce((s, r) => s + 1 / r.sigmaLambda ** 2, 0)
  const lambdaMean = gated.reduce((s, r) => s + r.lambda / r.sigmaLambda ** 2, 0) / lw
  const lambdaMeanError = 1 / Math.sqrt(lw)
  const status: Verdict['status'] = !instrument ? 'fail' : LIMIT ? 'pass' : decomposition ? 'partial' : 'fail'

  for (const r of reads) for (const [k, v] of Object.entries(r.metrics)) metrics[`${r.name}_${k}`] = v
  metrics.C = C
  metrics.sigmaC = sigmaC
  metrics.rhoInf = 1 + C
  metrics.B = fit.slope
  metrics.LIMIT = flag(LIMIT)
  metrics.lambdaMean = lambdaMean
  metrics.lambdaMeanError = lambdaMeanError
  limit.members.forEach((x, i) => (metrics[`member_m${MEMBER_MASSES[i]!.toFixed(4)}`] = x))
  limit.impulses.forEach((x, i) => (metrics[`impulse_m${MEMBER_MASSES[i]!.toFixed(4)}`] = x))

  return verdict({
    status,
    claim: `read as level-group centroids, the light pair's quartic fraction is ${gated.map(r => `${r.rho.toFixed(3)} +- ${r.sigmaRho.toFixed(3)} at m ${r.m.toFixed(3)} a_B ${r.aB} (members' band carried by the bound state ${r.impulse.rhoImp.toFixed(3)}, lone member ${r.rhoMember.toFixed(3)}; non-quadratic ratio lambda ${r.lambda.toFixed(3)} +- ${r.sigmaLambda.toFixed(3)})`).join('; ')}; the registered limit 1 + C = ${(1 + C).toFixed(3)} +- ${sigmaC.toFixed(3)} (LIMIT ${LIMIT}); decomposition D ${gated.map(r => r.D).join('/')} L ${gated.map(r => r.L).join('/')}, mean lambda ${lambdaMean.toFixed(3)} +- ${lambdaMeanError.toFixed(3)}; the members' own fraction at fixed K / m reads ${limit.members.map(x => x.toFixed(4)).join(', ')} and the carried band ${limit.impulses.map(x => x.toFixed(4)).join(', ')} at m ${MEMBER_MASSES.map(m => m.toFixed(3)).join(', ')} (M ${limit.M}); instrument ${instrument}`,
    metrics,
    control: Object.fromEntries(gated.map(r => [`rhoMember_${r.name}`, r.rhoMember])),
    notes: `L2 (M is L1). ${reads.map(r => r.text).join(' | ')}`,
  })
}

// the second stage's frozen two-point predictions (test/record/E-MTR-0033/mtr-band-stage2-predict.log)
export const STAGE_TWO_FORMS: readonly { name: string; rho: number }[] = [
  { name: 'lattice', rho: 4.1585270245569355 },
  { name: 'mass2', rho: 3.8732744029903725 },
  { name: 'coupling', rho: 2.985699408438069 },
]
const STAGE_TWO_PREDICTION_ERROR = 0.044
const SURVIVE = 3
const CHI2_ONE = 3.84

export function combineStageTwo(first: Verdict, reads: readonly PointRead[], extra: PointRead): Verdict {
  const all = [...reads.filter(r => r.gated), extra]
  const metrics: Record<string, number> = { ...first.metrics }
  const S2I = extra.W2 && extra.I
  const survives = STAGE_TWO_FORMS.map(f => ({
    ...f,
    off: Math.abs(extra.rho - f.rho) / Math.hypot(extra.sigmaRho, STAGE_TWO_PREDICTION_ERROR),
  }))
  const fit = weightedLinearFit({
    xs: all.map(r => lattice(r.m, r.aB)),
    ys: all.map(r => r.delta),
    errors: all.map(r => r.sigmaRho),
  })
  const S2LIMIT =
    Math.abs(fit.intercept) <= TWO * fit.interceptError && fit.interceptError <= LIMIT_RESOLUTION && fit.chi2 <= CHI2_ONE
  const decomposition = all.every(r => r.D) || all.every(r => r.L)
  const status: Verdict['status'] = !(first.metrics.W1 === 1 && S2I && reads.filter(r => r.gated).every(r => r.W2 && r.I))
    ? 'fail'
    : S2LIMIT
      ? 'pass'
      : decomposition
        ? 'partial'
        : 'fail'

  for (const [k, v] of Object.entries(extra.metrics)) metrics[`${extra.name}_${k}`] = v
  for (const s of survives) metrics[`S2_${s.name}_off`] = s.off
  Object.assign(metrics, {
    S2I: flag(S2I),
    S2_C: fit.intercept,
    S2_sigmaC: fit.interceptError,
    S2_B: fit.slope,
    S2_chi2: fit.chi2,
    S2_rhoInf: 1 + fit.intercept,
    S2LIMIT: flag(S2LIMIT),
  })

  return verdict({
    status,
    claim: `${first.claim}. SECOND STAGE: at m ${extra.m.toFixed(3)} a_B ${extra.aB} rho ${extra.rho.toFixed(3)} +- ${extra.sigmaRho.toFixed(3)} (carried band ${extra.impulse.rhoImp.toFixed(3)}, member ${extra.rhoMember.toFixed(3)}, lambda ${extra.lambda.toFixed(3)} +- ${extra.sigmaLambda.toFixed(3)}); the two-point forms miss it by ${survives.map(s => `${s.name} ${s.off.toFixed(1)} sigma`).join(', ')}; the three-point lattice fit gives rho_inf ${(1 + fit.intercept).toFixed(3)} +- ${fit.interceptError.toFixed(3)} with chi^2 ${fit.chi2.toFixed(2)} (S2-LIMIT ${S2LIMIT}); instrument ${S2I}`,
    metrics,
    control: first.control,
    notes: `${first.notes} | ${extra.text}`,
  })
}

export function runDecomposition(): Verdict {
  const impulses = POINTS.map(p => predictImpulse(p))
  const reads = POINTS.map((p, i) => readPoint(p, impulses[i]!)).filter((r): r is PointRead => r !== null)
  const first = combineDecomposition(reads, witnessSynthetic(), memberLimit(impulses[0]!.radius))
  const ready = STAGE_TWO.reads.every(r => existsSync(r.file))

  if (!ready) return first

  const extra = readPoint(STAGE_TWO, predictImpulse(STAGE_TWO))

  return extra ? combineStageTwo(first, reads, extra) : first
}

export default experiment({
  id: 'matter/light-pair-band-decomposition',
  code: 'E-MTR-0033',
  title:
    "explores whether the light register pair's extra quartic is its members' lattice band carried by the bound state, read as level-group centroids of the saved correlations, and whether its fitted continuum limit is relativity's 1",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return runDecomposition()
  },
})
