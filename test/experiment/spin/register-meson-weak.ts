// HOW FAR DOES A STATIC STRING GET? THE REGISTER MESON'S INERTIA AT WEAK COUPLING (E-SPN-0174). E-SPN-0162 bound a light
// register meson exactly for the first time (members at m 0.190126, the singlet-pair string u^2 rho^min(V, cap) on S S and
// its conjugate on D D, the pair evolving exactly inside the 16 x 16 moving block), and it held, isotropic, but with
// R = 34.652263 against the NR model's 0.6941: its string step (tau = 0.280668 a unit of V) is comparable to the member's
// band width (Smax - M0 = 0.458), the strong-coupling lattice regime. This file reads R at weaker strings on larger balls,
// to measure the trend: how far a STATIC string gets toward R = 1, which sets the target for a dynamical field.
//
// DERIVED BEFORE THE GATE RUN (code/measure/register-meson; per cycle of two beats; c* = c/4 a beat, c*^2 = 1/2 a cycle;
// M0 = 0.380251 the member's rest phase, I = 2 tan(M0 / 2) = 0.384900 a member's inertia in the NR model).
// 1. THE NR MODEL'S R (E-SPN-0162 point 4, unchanged). The string acts on the S S pair as a potential W(V) = tau min(kappa
//    x, cap), not as a mass, so the members' inertia is fixed. The composite's inertia in energy units is 2 I + (1 + 2/d) T,
//    d = 4 the dimension of the relative problem (a free relativistic pair's P^2 coefficient), T the relative kinetic energy,
//    and its rest phase E_L = 2 M0 + T + <W>, so R_NR = (2 I + 1.5 T) / E_L. Since <W> > 0 and T > 0 with 1.5 T < T + <W>
//    whenever <W> > T / 2 (true for any well that binds: the linear-well virial gives <W> = 2 T), R_NR < 2 I / (2 M0) =
//    tan m / m = 1.012226: POTENTIAL ENERGY CARRIES NO INERTIA, so a static string gives R below 1 in the continuum.
// 2. THE STATIC-PULL FORMULA OF E-SPN-0155 IS THE SAME MODEL. R = (2 tan m + (5/3) E_b) / (2 m - E_b) (energy measured from
//    the members' rest, d = 3, a Coulomb well with E_b > 0 the binding) is 2 I + (1 + 2/3) T over E_L with the Coulomb
//    virial T = E_b and E_L = 2 m - E_b: there the potential is NEGATIVE, so the members' deficit makes R rise above 1;
//    here it is positive (a rising string measured from V = 0), so R falls below 1. One formula, the sign set by the sign of
//    <W>: neither a Coulomb pull nor a string gives R = 1 except at one tuned coupling, which is not a law.
// 3. THE CONTINUUM VALUE. As the step against the band width goes to 0 (tau -> 0 with the well depth tau cap held), the NR
//    level widens as tau^(-1/3), T and <W> fall as tau^(2/3), and R_NR -> tan m / m = 1.012226 from below. The NR values
//    (radialWell, 4d s-wave, centrifugal 3/4): tau 0.280668 cap 8: R_NR 0.6941 (E_L 2.0054); tau 0.187112 cap 12: 0.7277
//    (E_L 1.7105); tau 0.093556 cap 24: 0.7866 (E_L 1.3592). (tmp/rmw-probe1.log.)
// 4. THE LATTICE EXCESS, AND ITS PREDICTED TREND. E-SPN-0162 read R = 34.65, 50 times R_NR. Its reading after the run: the
//    pair's centre moves through each member's own S-D mixing, whose amplitude depends on the member's momentum K/2 +- q,
//    and a pair bound within ~3 sites spreads q over most of the zone, where the member band curves the other way near its
//    top. So E(K) - E(0) averages the band's curvature over the bound state's relative momenta (the variational bound: the
//    true a is at most that average), and the average nearly cancels. At weaker coupling the level widens (mean V 2.96,
//    3.39, 4.26 by NR), q concentrates near 0 where the curvature is the member's own, and the excess must shrink. PREDICTED:
//    R FALLS MONOTONICALLY AS tau FALLS, from 34.65 toward R_NR. The form of the fall is not derived; it is fitted (read,
//    below). If R did not fall, the excess would not be a strong-coupling lattice effect and E-SPN-0162's reading would be
//    wrong.
// 5. WHERE R = 1 CAN APPEAR. R starts at 34.65 at tau 0.28 and must end at R_NR < 1 as tau -> 0, so if the trend of point 4
//    holds R CROSSES 1 at some finite coupling. That crossing is a tuning of tau, not inertia equal to energy by a law: it
//    is read, not claimed. R = 1 at every coupling needs the field's own momentum (E-SPN-0155's transverse exchange).
// 6. THE CHANNELS (E-SPN-0162 point 2, per coupling): the cap holds the well depth tau cap = 2.245 at every coupling
//    (8 x 0.280668, 12 x 0.187112, 24 x 0.093556), below the D D limit 2 pi - E_L - 2 Smax (2.64 at tau 0.28, larger
//    at weaker coupling, where E_L is lower), so every channel stays closed at every separation, and none confines.
// 7. THE BALLS. The NR tail P(V > r) (probe 1): tau 0.187 cap 12: 4.5e-6 past 11, 5.2e-8 past 13, so radius 12 (97,969
//    relative sites, 0.40 GB a state); tau 0.094 cap 24: 2.0e-5 past 13, 5.6e-7 past 15, so radius 13 (133,225 sites, 0.55
//    GB a state), where the edge absorbs a few 1e-5 of the level. Radius 20 (about 1.6 million sites, 6.5 GB a state, a
//    minute a cycle) does not fit this machine's time budget: the engine is 2.5 s a cycle at radius 9 and linear in sites.
//
// PREDICTED: at each coupling the witness holds (the reduction is the rule), the channels are closed, the level holds and
// (at the weakest) moves isotropically; R FAILS 1 at each coupling; R FALLS MONOTONICALLY with tau (T1). Verdict fail.
//
// GATES, fixed before the gate run (per coupling, the tolerances of E-SPN-0162 unless stated).
//  H0 THE WITNESS (at the two new strings): the full 192 x 192 rule on a radius-4 ball against the lifted coordinate
//     cycle, one cycle, at K = (0.31, -0.17, 0.52, 0.08), from an S (x) S start over the whole ball and a generic start
//     within 2 steps: entries 1e-12, weights equal to 1e-10 relative, the coordinate norm kept to 1e-12.
//  H1 THE CHANNELS AT EVERY SEPARATION: every channel at every V = 0 .. 60 at distance at least 0.1 from E_L mod 2 pi.
//  H2 THE HOLD: the level (filters 64, 256, 512 at the new strings, from exp(-(V / ell)^1.5) in S (x) S with the
//     registers paired by delta, ell 2.9 and 3.6) with |lambda| >= 1 - 1e-6, residual <= 1e-3; over 64 cycles the norm's
//     change at most 1e-3, the fidelity at least 1 - 1e-2, and the edge shell at most 1e-5 (radius 12) or 1e-4 (radius 13).
//  H3 ISOTROPY (at the weakest string, where the level is widest and the ball's edge nearest): the K^2 coefficient along
//     the axis and the generic direction (Richardson at kappa 0.04, 0.02, filters of 256 from the level), within 1e-3.
//  H4 R = c*^2 / (2 a E_L) at each string (a along the axis) within 0.01 of 1. PREDICTED TO FAIL.
//  T1 THE TREND: R(0.093556) < R(0.187112) < R(0.280668). PREDICTED TO HOLD.
// INSTRUMENT (a failure makes the verdict partial): I1 the member coordinates against E-SPN-0160's band (1e-12, E-SPN-0162's
//  check), I2 the member R against tan m / m (1e-6).
// CONTROL (a failure makes the verdict partial): C1 E-SPN-0162 REPRODUCED BIT FOR BIT at its string (tau 0.280668, cap 8,
//  radius 9, ell 2.5, filters 64, 256, 1024, the NR guess on L = 30): E_L === 1.9789453403525277 and R ===
//  34.65226307820285, both recorded in tmp/rmh-hold-run1.log.
// READ, gating nothing: R_NR beside each R; the excess R / R_NR - 1; the power p of a fit R - R_NR = A tau^p over the three
//  strings, and the tau at which the fit gives R = 1; each level's block shares and profile.
// Verdict: fail if H0 to H4 or T1 fails; partial if the instrument or the control fails; pass if all hold.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/rmw-probe1.log: the ring's small angles (0.0060,
//  0.0875, 0.0936, 0.0996, 0.1871, 0.1931, 0.2807), the NR table of point 3 for each with cap 8 and with the cap that
//  holds tau cap at 2.245 (the tails of point 7), the ball sizes (radius 9 to 13: 32,761 to 133,225 sites, 0.13 to 0.55
//  GB a state), and the engine's 2.5 s a cycle at radius 9. The strings (-6, 4) and (-3, 2) and their caps 12 and 24 were
//  chosen from it. tmp/rmw-smoke.log: every code path on a small plan (radius 5, filters 16 and 16, K filter 16; 178 s;
//  unconverged, gating nothing): the witness at both new strings 4.7e-17 to 1.3e-16, the channels closed (margins 0.54,
//  0.79, 0.79), the member instrument 1.8e-15 and 1.012226137, and R 7.21, 2.66, 2.17 at the three strings (monotone,
//  unconverged on a radius-5 ball whose edge holds 3 to 42% of the level). The control does not reproduce E-SPN-0162 on
//  that plan, as it must not (a different ball and filters); on the gate plan it runs E-SPN-0162's exact sequence.
//
// FIRST RUN (three processes, one a string, combined by the verdict function; tmp/rmw-gate-control.log,
//  rmw-gate-middle.log, rmw-gate-weakest.log, combined in tmp/rmw-exp-run1.log; 38,246 s of process time): FAIL on H4, as
//  predicted, and on H2 at the middle string (the residual), not predicted. T1 holds: R FALLS MONOTONICALLY, 34.65, 13.47,
//  1.433. No gate moved and none was rerun.
//  - C1: E-SPN-0162 reproduced bit for bit, E_L 1.9789453403525277 and R 34.65226307820285 (=== the recorded values).
//  - H0: the witness at the two new strings 1.3e-16 and 9.7e-17 (weights equal, norm kept).
//  - H1: least margins 0.570 (middle, D F at V 0) and 0.802 (weakest, S D at V 0); the uncapped D D crossing would sit at
//    V* 15.4 and 35.8, past the caps.
//  - H2: middle E_L 1.734035 (NR 1.7106), |lambda| 1 - 3.2e-6, RESIDUAL 2.53e-3 AGAINST 1e-3 (FAIL: the 512 filter does
//    not isolate the level at this width), norm kept to 4e-13, least fidelity 0.975, edge 7.8e-9. Weakest E_L 1.259214
//    (NR 1.3590), residual 5.1e-4, norm kept to 5e-10, least fidelity 0.9991, edge 9.2e-7: holds.
//  - H3: the weakest string's K^2 coefficient 0.1385302337 (axis) and 0.1385302421 (generic), isotropic to 6.1e-8.
//  - H4 FAILS at every string, as predicted: R = 34.652263 (tau 0.2807), 13.467074 (tau 0.1871; the level's residual
//    2.5e-3, so this R carries some admixture), 1.433171 (tau 0.0936), against R_NR 0.6941, 0.7277, 0.7866. The excess
//    R / R_NR - 1 falls 48.9, 17.5, 0.82.
//  - READ: the fit R - R_NR = A tau^p through the three gives p = 3.68 (A 4445) and meets R = 1 at tau 0.067, between
//    the ring's angles 0.0600 and 0.0875 (unmeasured there; three points and a steep power, so the crossing is a rough
//    extrapolation). Block shares S S 0.917, 0.759, 0.851; the weakest level's profile peaks at V 3 (0.31) and falls to
//    9.2e-7 at the edge.
//  - WHAT IT MEANS. E-SPN-0162's R = 35 was the strong-coupling lattice regime, as read there: at a string a third as
//    strong the bound pair's centre moves 24 times more readily and R is 1.43, within 44% of 1. A static string gets there
//    only by falling THROUGH 1 at one tuned coupling on its way to the continuum's R_NR (about 0.79 at tau 0.094, rising
//    toward tan m / m = 1.012 as tau -> 0 but from below), so R = 1 at a single tau is a tuning, not a law. Inertia equal
//    to energy at every coupling still needs a field that carries its own momentum.
//
// Depth L2 (a two-body quantum walk of register members on the D4 mesh, in the exact coordinates of its invariant block,
// witnessed against the full rule). DETERMINISM: no random numbers; the start is placed, every level filtered, Weyl values
// for the generic witness start. NOTHING MOVES: the pieces hand values between slots and register components of one dock,
// the stream takes each slot's value one dock along, the string sets a phase on the pair's singlet sector.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { wrap } from '@/code/measure/dock-mixer'
import { cyclePhases } from '@/code/measure/swap-cone'
import { ringUnit, unitAngle, radialWell, stringKappa } from '@/code/measure/swap-string'
import { diracPhase, partnerProjector48, REGISTER_ROOTS, registerPiece, scaled, singletProjector24, structureVector, weylDirections } from '@/code/measure/spinor-register'
import {
  blockShares,
  clonePair,
  filterPair,
  fullBeat,
  fullGap,
  fullRule,
  inner,
  lift,
  memberCycle,
  newPair,
  normalizePair,
  norm2,
  pairCycle,
  pairEngine,
  profile,
  readLevel,
  relBall,
  sStart,
  type PairParams,
  type PairState,
} from '@/code/measure/register-meson'

const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const AXIS = [1, 0, 0, 0]
const WITNESS_K: readonly number[] = [0.31, -0.17, 0.52, 0.08]
const LIGHT: readonly [number, number] = [-1, 4]
const C_STAR2 = 0.5
const ENTRY = 1e-12
const WEIGHT = 1e-10
const NORM = 1e-12
const MARGIN = 0.1
const LAMBDA = 1e-6
const RESIDUAL = 1e-3
const LOST = 1e-3
const FIDELITY = 1e-2
const KAPPA = 0.04
const ISOTROPY = 1e-3
const R_TOLERANCE = 0.01
const I1_TOLERANCE = 1e-12
const I2_TOLERANCE = 1e-6
const HOLD_CYCLES = 64
const V_SCAN = 60

// E-SPN-0162's recorded level and R (tmp/rmh-hold-run1.log), the control's targets
export const RECORDED = { EL: 1.9789453403525277, R: 34.65226307820285 }

export type Coupling = {
  name: string
  unit: readonly [number, number]
  cap: number
  radius: number
  ell: number
  // the NR well's box (the level's first filter phase), 30 for E-SPN-0162's string
  nrL: number
  filters: readonly number[]
  kFilter: number
  // read the generic direction too (the isotropy gate)
  isotropy: boolean
  // run the full-rule witness (not at the control string, which E-SPN-0162 witnessed)
  witness: boolean
  // the gated edge shell
  edge: number
  // the control: E-SPN-0162's string, reproduced bit for bit, no hold
  control: boolean
}

export const COUPLINGS: Coupling[] = [
  { name: 'control', unit: [-9, 6], cap: 8, radius: 9, ell: 2.5, nrL: 30, filters: [64, 256, 1024], kFilter: 256, isotropy: false, witness: false, edge: 1e-6, control: true },
  { name: 'middle', unit: [-6, 4], cap: 12, radius: 12, ell: 2.9, nrL: 60, filters: [64, 256, 512], kFilter: 256, isotropy: false, witness: true, edge: 1e-5, control: false },
  { name: 'weakest', unit: [-3, 2], cap: 24, radius: 13, ell: 3.6, nrL: 60, filters: [64, 256, 512], kFilter: 256, isotropy: true, witness: true, edge: 1e-4, control: false },
]

export type CouplingRead = {
  name: string
  tau: number
  cap: number
  radius: number
  sites: number
  witnessGap: number
  witnessOk: boolean
  margin: number
  marginAt: string
  vStar: number
  EL: number
  lambdaAbs: number
  residual: number
  lost: number
  least: number
  edge: number
  shares: number[]
  profile: number[]
  base: number
  aAxis: number
  aGeneric: number
  isotropy: number
  R: number
  nrR: number
  nrEL: number
  nrMeanV: number
  held: boolean
  seconds: number
}

const unitValue = (angle: number): [number, number] => [Math.cos(angle), Math.sin(angle)]

function witnessStart(ballIndex: Map<string, number>, s: PairState, only: number): void {
  const at = ballIndex.get('0,0,0,0') as number
  let w = 0.5

  for (let k = 0; k < only; k++) {
    w = (w + 0.6180339887498949) % 1
    s.re[at * 256 + k] = w - 0.5
    w = (w + 0.4142135623730951) % 1
    s.im[at * 256 + k] = w - 0.5
  }
}

// the member instrument, E-SPN-0162's I1 and I2
export function memberInstrument(): { i1: number; RMember: number; tanOver: number; I1: boolean; I2: boolean } {
  const theta = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u = unitValue(theta)
  const M0 = wrap(theta - Math.PI)
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const phasesOf = (K: readonly number[]): number[] => {
    const m = memberCycle(u, K)
    const e = complexEigenvalues({ re: m.re, im: m.im, n: 16 })

    return e.re.map((x, i) => Math.atan2(e.im[i] as number, x)).sort((a, b) => a - b)
  }
  let i1 = 0

  for (const K of [[0, 0, 0, 0], [0.3, 0.1, -0.2, 0.05], [1.1, -0.7, 0.4, 0.9], [2.5, 0.3, 0.3, -1.2], [0.01, 0, 0, 0]]) {
    const ph = phasesOf(K)
    const E = diracPhase(K, M0)
    const want = [...Array(8).fill(wrap(Math.PI + E)), ...Array(8).fill(wrap(Math.PI - E))].sort((a, b) => a - b)
    const full = cyclePhases(Ps, REGISTER_ROOTS, K)
      .filter(x => Math.abs(wrap(x)) > 1e-7)
      .sort((a, b) => a - b)

    i1 = Math.max(i1, ...ph.map((x, i) => Math.abs(wrap(x - (want[i] as number)))), full.length === 16 ? Math.max(...full.map((x, i) => Math.abs(wrap(x - (ph[i] as number))))) : 99)
  }

  const sEps = (k: number): number => phasesOf([k, 0, 0, 0]).map(x => wrap(x - Math.PI)).reduce((b, x) => (Math.abs(x - M0) < Math.abs(b - M0) ? x : b))
  const aMember = (4 * ((sEps(0.01) - M0) / 0.01 ** 2) - (sEps(0.02) - M0) / 0.02 ** 2) / 3
  const RMember = C_STAR2 / (2 * aMember * M0)
  const tanOver = Math.tan(M0 / 2) / (M0 / 2)

  return { i1, RMember, tanOver, I1: i1 <= I1_TOLERANCE, I2: Math.abs(RMember - tanOver) <= I2_TOLERANCE }
}

// one string: the witness, the channels, the level, the hold and the inertia. The level and the K reads follow E-SPN-0162's
// sequence exactly (so the control reproduces it bit for bit).
export function readCoupling(c: Coupling, log: (what: string) => void = () => {}): CouplingRead {
  const started = Date.now()
  const theta = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u = unitValue(theta)
  const M0 = wrap(theta - Math.PI)
  const tau = unitAngle(ringUnit(c.unit[0], c.unit[1]))

  // ---- H0: the witness ----
  let witnessGap = 0
  let witnessOk = true

  if (c.witness) {
    const coord = relBall(6)
    const full = relBall(4)

    for (const kind of ['SS', 'generic'] as const) {
      const params: PairParams = { u, tau, cap: c.cap, K: WITNESS_K }
      const e = pairEngine(coord, params)
      const s = newPair(coord)

      witnessStart(coord.index, s, kind === 'SS' ? 64 : 256)

      const n0 = norm2(e, s)
      const before = lift(coord, s, full, WITNESS_K)

      pairCycle(e, s)

      const n1 = norm2(e, s)
      const want = lift(coord, s, full, WITNESS_K)
      const rule = fullRule(full, params)
      const two = fullBeat(rule, fullBeat(rule, before, 1), 2)
      const g = fullGap(full, two, want, kind === 'SS' ? Infinity : 2)

      witnessGap = Math.max(witnessGap, g.worst)
      witnessOk = witnessOk && g.worst <= ENTRY && Math.abs(n1 / n0 - 1) <= NORM && (kind !== 'SS' || (Math.abs(g.weightA / g.weightB - 1) <= WEIGHT && Math.abs(g.weightB / n1 - 1) <= WEIGHT))
      log(`${c.name} witness ${kind} gap ${g.worst.toExponential(2)}`)
    }
  }

  // ---- the NR prediction (E-SPN-0162's form; the box nrL) ----
  const kappa = stringKappa(12).mean
  const Imember = 2 * Math.tan(M0 / 2)
  const nr = radialWell(
    x => tau * Math.min(kappa * x, c.cap),
    () => Imember,
    c.nrL,
    12000,
  )
  let nrW = 0
  let nrMeanV = 0

  for (let i = 0; i < nr.u.length; i++) {
    nrW += (nr.u[i] as number) ** 2 * tau * Math.min(kappa * (i + 1) * nr.h, c.cap)
    nrMeanV += (nr.u[i] as number) ** 2 * kappa * (i + 1) * nr.h
  }

  const nrT = nr.E - nrW
  const nrEL = 2 * M0 + nr.E
  const nrR = (2 * Imember + 1.5 * nrT) / nrEL

  // ---- H2: the level and the hold ----
  const ball = relBall(c.radius)
  const params0: PairParams = { u, tau, cap: c.cap, K: [0, 0, 0, 0] }
  const e0 = pairEngine(ball, params0)
  const start = sStart(ball, c.ell)

  normalizePair(e0, start)

  let v = start
  let phase = nrEL
  let read = readLevel(e0, start)

  for (const S of c.filters) {
    v = filterPair(e0, v, phase, S)
    normalizePair(e0, v)
    read = readLevel(e0, v)
    phase = read.phase
    log(`${c.name} filter ${S} phase ${phase} residual ${read.residual.toExponential(2)}`)
  }

  const EL = read.phase
  const lambdaAbs = Math.hypot(...read.lambda)
  let lost = 0
  let least = 1

  if (!c.control) {
    const s = clonePair(v)
    const n0 = norm2(e0, v)

    for (let k = 1; k <= HOLD_CYCLES; k++) {
      pairCycle(e0, s)

      const [fr, fi] = inner(e0, v, s)

      least = Math.min(least, (fr * fr + fi * fi) / (n0 * n0))
    }
    lost = 1 - norm2(e0, s) / n0
  }

  const prof = profile(e0, v)
  const profTotal = prof.reduce((a, b) => a + b, 0)
  const edge = (prof[c.radius] as number) / profTotal
  const shares = blockShares(e0, v)
  const held = lambdaAbs >= 1 - LAMBDA && read.residual <= RESIDUAL && Math.abs(lost) <= LOST && least >= 1 - FIDELITY && edge <= c.edge

  log(`${c.name} hold lost ${lost.toExponential(2)} least ${least} edge ${edge.toExponential(2)}`)

  // ---- H1: the channels at every separation ----
  let gMax = 0

  for (const w of weylDirections(2000)) for (let k = 0.05; k < 3.2; k += 0.05) gMax = Math.max(gMax, Math.hypot(...structureVector(w.map(x => x * k))) / 2)

  const Smax = Math.acos(Math.cos(M0) - 2 * Math.cos(M0 / 2) ** 2 * gMax * gMax)
  const distance = (lo: number, hi: number): number => {
    let best = Infinity

    for (const shift of [-2 * Math.PI, 0, 2 * Math.PI]) {
      const x = EL + shift

      best = Math.min(best, x < lo ? lo - x : x > hi ? x - hi : 0)
    }

    return best
  }
  let margin = Infinity
  let marginAt = ''

  for (let V = 0; V <= V_SCAN; V++) {
    const w = tau * Math.min(V, c.cap)
    const bands: [string, number, number][] = [
      ['SS', 2 * M0 + w, 2 * Smax + w],
      ['DD', -2 * Smax - w, -2 * M0 - w],
      ['SD', -(Smax - M0), Smax - M0],
      ['SF', Math.PI + M0, Math.PI + Smax],
      ['DF', Math.PI - Smax, Math.PI - M0],
      ['FF', 2 * Math.PI, 2 * Math.PI],
    ]

    for (const [name, lo, hi] of bands) {
      if (name === 'SS' && V < c.cap) continue

      const d = distance(lo, hi)

      if (d < margin) {
        margin = d
        marginAt = `${name} at V ${V}`
      }
    }
  }

  const vStar = (2 * Math.PI - EL - 2 * Smax) / tau

  // ---- H3, H4: the inertia (E-SPN-0162's sequence) ----
  const eAt = (K: number[]): number => {
    const e = pairEngine(ball, { ...params0, K })
    const f = filterPair(e, v, EL, c.kFilter)

    normalizePair(e, f)

    return readLevel(e, f).phase
  }
  const base = eAt([0, 0, 0, 0])
  const coefficient = (d: number[]): number => {
    const e1 = eAt(d.map(x => x * KAPPA))
    const e2 = eAt(d.map(x => (x * KAPPA) / 2))
    const a1 = (e1 - base) / KAPPA ** 2
    const a2 = (e2 - base) / (KAPPA / 2) ** 2

    return (4 * a2 - a1) / 3
  }
  const aAxis = coefficient(AXIS)

  log(`${c.name} axis a ${aAxis}`)

  const aGeneric = c.isotropy ? coefficient(GENERIC) : NaN
  const isotropy = c.isotropy ? Math.abs(aGeneric / aAxis - 1) : NaN
  const R = C_STAR2 / (2 * aAxis * base)

  log(`${c.name} R ${R}`)

  return {
    name: c.name,
    tau,
    cap: c.cap,
    radius: c.radius,
    sites: ball.points.length,
    witnessGap,
    witnessOk,
    margin,
    marginAt,
    vStar,
    EL,
    lambdaAbs,
    residual: read.residual,
    lost,
    least,
    edge,
    shares,
    profile: prof.map(x => x / profTotal),
    base,
    aAxis,
    aGeneric,
    isotropy,
    R,
    nrR,
    nrEL,
    nrMeanV,
    held,
    seconds: (Date.now() - started) / 1000,
  }
}

const flag = (b: boolean): number => (b ? 1 : 0)

// the verdict from the three strings' reads (so the gate run can read the strings in parallel processes and combine)
export function combine(reads: CouplingRead[], instrument: ReturnType<typeof memberInstrument>): Verdict {
  const byName = (n: string): CouplingRead => reads.find(r => r.name === n) as CouplingRead
  const control = byName('control')
  const middle = byName('middle')
  const weakest = byName('weakest')
  const fresh = [middle, weakest]
  const H0 = fresh.every(r => r.witnessOk)
  const H1 = fresh.every(r => r.margin >= MARGIN)
  const H2 = fresh.every(r => r.held)
  const H3 = weakest.isotropy <= ISOTROPY
  const H4 = reads.every(r => Math.abs(r.R - 1) <= R_TOLERANCE)
  const T1 = weakest.R < middle.R && middle.R < control.R
  const C1 = control.EL === RECORDED.EL && control.R === RECORDED.R
  const status = !(H0 && H1 && H2 && H3 && H4 && T1) ? 'fail' : !(instrument.I1 && instrument.I2 && C1) ? 'partial' : 'pass'

  // the read fit: R - R_NR = A tau^p through the three strings (least squares in logs), and where the fit meets R = 1
  const pts = reads.filter(r => r.R - r.nrR > 0).map(r => [Math.log(r.tau), Math.log(r.R - r.nrR)] as [number, number])
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const my = pts.reduce((s, p) => s + p[1], 0) / pts.length
  const p = pts.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((s, q) => s + (q[0] - mx) ** 2, 0)
  const A = Math.exp(my - p * mx)
  // R_NR near the crossing: the weakest string's (it varies slowly), so tau* = ((1 - R_NR) / A)^(1 / p)
  const tauOne = Math.pow((1 - weakest.nrR) / A, 1 / p)
  const line = (r: CouplingRead): string =>
    `${r.name} tau ${r.tau.toFixed(6)} cap ${r.cap} radius ${r.radius} (${r.sites} sites): E_L ${r.EL.toFixed(6)} (NR ${r.nrEL.toFixed(4)}), residual ${r.residual.toExponential(2)}, lost ${r.lost.toExponential(2)}, least fidelity ${r.least.toFixed(10)}, edge ${r.edge.toExponential(2)}, margin ${r.margin.toFixed(4)} (${r.marginAt}), V* ${r.vStar.toFixed(2)}, a ${r.aAxis.toFixed(10)}${Number.isNaN(r.aGeneric) ? '' : ` / ${r.aGeneric.toFixed(10)} (isotropy ${r.isotropy.toExponential(2)})`}, R ${r.R.toFixed(6)} (NR ${r.nrR.toFixed(4)}, excess ${(r.R / r.nrR - 1).toFixed(4)})${r.witnessGap ? `, witness ${r.witnessGap.toExponential(2)}` : ''}`

  return verdict({
    status,
    claim: `H0 ${H0}; H1 ${H1}; H2 ${H2}; H3 ${H3}; H4 ${H4} (R ${reads.map(r => r.R.toFixed(4)).join(', ')}); T1 ${T1}; instrument I1 ${instrument.I1} (${instrument.i1.toExponential(2)}) I2 ${instrument.I2} (member R ${instrument.RMember.toFixed(9)} vs ${instrument.tanOver.toFixed(9)}); control C1 ${C1} (E_L ${control.EL} vs ${RECORDED.EL}, R ${control.R} vs ${RECORDED.R}). ${reads.map(line).join('; ')}. Fit R - R_NR = ${A.toFixed(3)} tau^${p.toFixed(3)}, meeting R = 1 at tau ${tauOne.toFixed(4)}.`,
    metrics: {
      H0: flag(H0),
      H1: flag(H1),
      H2: flag(H2),
      H3: flag(H3),
      H4: flag(H4),
      T1: flag(T1),
      I1: flag(instrument.I1),
      I2: flag(instrument.I2),
      C1: flag(C1),
      R_control: control.R,
      R_middle: middle.R,
      R_weakest: weakest.R,
      nrR_middle: middle.nrR,
      nrR_weakest: weakest.nrR,
      EL_middle: middle.EL,
      EL_weakest: weakest.EL,
      isotropy: weakest.isotropy,
      fitPower: p,
      fitA: A,
      tauOne,
      seconds: reads.reduce((s, r) => s + r.seconds, 0),
    },
    control: { C1: flag(C1), instrument: flag(instrument.I1 && instrument.I2) },
    notes: `L2. Block shares (S S, S D, D S, D D) and profiles: ${reads.map(r => `${r.name} ${r.shares.map(x => x.toFixed(4)).join(' ')}; profile ${r.profile.map(x => x.toExponential(1)).join(' ')}; NR mean V ${r.nrMeanV.toFixed(2)}`).join(' | ')}.`,
  })
}

export type WeakPlan = { couplings: Coupling[] }

export const GATE_PLAN: WeakPlan = { couplings: COUPLINGS }

export function registerMesonWeakRun(plan: WeakPlan): Verdict {
  const instrument = memberInstrument()

  return combine(
    plan.couplings.map(c => readCoupling(c)),
    instrument,
  )
}

export default experiment({
  id: 'spin/register-meson-weak',
  code: 'E-SPN-0174',
  title:
    "the register meson's inertia falls with the string, fail (H4, and H2 at the middle string): at string angles 0.2807, 0.1871 and 0.0936 a unit of V, with the well depth held at 2.245, the light register meson (m 0.190126) reads R = 34.65, 13.47 and 1.433, a monotone fall (E-SPN-0162 reproduced bit for bit at the first), against the continuum NR model's 0.69, 0.73 and 0.79; the weakest level holds (norm kept to 5e-10, fidelity 0.9991) and moves isotropically (6e-8), witnessed against the full rule at 1e-16, with every channel closed; a static string reaches R = 1 only by passing through it at one tuned coupling (a fit gives tau 0.067), not as a law",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerMesonWeakRun(GATE_PLAN)
  },
})
