// A LIGHT REGISTER PAIR HELD BY THE HUSK LIGHT'S PULL: DOES IT MOVE WITH INERTIA EQUAL TO ITS ENERGY? (E-SPN-0173).
// E-SPN-0162 bound a light register pair exactly with a capped string and found R = 34.65; E-SPN-0169 derived that the
// light's transverse (Darwin) exchange removes 0.879 of a STATIC pull's excess inertia. This file binds two register
// members with the husk light's own Coulomb law, on the husk quotient, runs it exactly in the members' moving block, and
// reads the level, its hold, its motion, and R with and without the Darwin exchange.
//
// DERIVED BEFORE THE RUN (code/measure/register-coulomb, register-meson, husk-meson, darwin-exchange; per cycle of two
// beats; a pair's eps its cycle phase; the member unit u = ringUnit(-5, 1)).
// 1. THE POTENTIAL, AN INTEGER COUNT. The pair phase at relative position y is rho^(-n(y)), rho = ringUnit(11, 5) (angle
//    theta = 0.006027, the ring's smallest), n(y) = floor(alpha G(y) / theta) with G the infinite husk Green's function
//    (E-FRC-0241: 1/(24 pi r) + A/r^5, the lattice's own value at contact, G(0) = 0.052831). An integer count with a
//    threshold, never a rounding: the rule sees n, exact in Z[w][1/42]; the count's error is under one step theta at
//    every site. The pair runs on the HUSK QUOTIENT (the D4 mesh with depth period 2, docks = Z^3, E-SPN-0155/0167),
//    where the root Laplacian is exactly the husk symbol, so the law is the Green's function of the lattice walked.
// 2. W (x) W STAYS EXACT, IN BOTH FORMS. A phase on Q_S (x) Q_S (beat 1) and on Q_D (x) Q_D (beat 2) keeps W (x) W
//    (E-SPN-0162 point 1). A DOCK-LOCAL phase can reach no other sector: the S content is dock-local at beat 1 and the D
//    content at beat 2, so S (x) D never has both members dock-local in their sectors at one beat. That is E-SPN-0162's
//    form ('scalar': S S down, D D the other way, as a mass). A COULOMB pull is a vector: V 1 (x) 1 moves every sector's
//    eps the same way. The 'vector' form puts phi on S S (beat 1) and on D D (beat 2, the same sign), and phi on S D and
//    D S through the orthogonal projector pieces P_SD = sum e^(i phi) |S_x1><S_x1| (x) |T D_x2><T D_x2| (and its mirror):
//    every term an orthogonal projector (S_x orthonormal, T D_y orthonormal), the terms mutually orthogonal, so 1 + sum
//    (e^(i phi) - 1) P is unitary, maps into W (x) W, and is the identity on its complement. Its coordinate form changes
//    one block: B += (e^(i phi) - 1)(B + C1 D + C2^dag A + C2^dag C1 X). THE GATE RUN USES THE VECTOR FORM. The cross
//    pieces act across one link (T D_y's content sits on the neighbours of y): they read the partner's position one link
//    away, the price of a vector coupling on this rule.
// 3. THE MEMBER, AND WHY m 0.427. A pair phase is a phase: a potential deeper than pi a cycle aliases. The contact phase
//    alpha G(0) must stay below pi, and with alpha = 24 pi / (mu a_B) (continuum hydrogen, mu = tan m the reduced mass in
//    cycle units) that needs a_B > 24 G(0) / mu. At E-SPN-0160's m 0.190126 (mu 0.1925) that is a_B > 6.6, a ball of
//    radius ~50 and filters of ~1000 cycles: out of reach. A member at m 0.427029 (ringUnit(-5, 1), mu 0.455030) is still
//    light by both tests that matter here: below pi/6, where E-SPN-0160's census closes, and below 0.62, under which
//    E-SPN-0155's swap-coin member leaked through the flat channel at every coupling. There a_B > 2.79: a_B 3.5 puts 2.501
//    rad a cycle at contact, a_B 3 puts 2.918. DOUBLING THE COUPLING (a_B 1.75) PUTS 5.002 RAD AT CONTACT, which no pair
//    phase can hold, so the trend is read over the representable range: a_B 3.5 (main) and 3 (stronger, x 1.17).
// 4. THE CHANNELS OPEN AT INFINITY (E-SPN-0155 point 6; V = 0 there, so the potential's form does not enter). With Smax
//    from g's largest value, the two-member bands at the run's total K: S S from 2 M0 (the level must sit below it by
//    E_b), S D within the S D width at that K (0 at K = 0), D D [-2 Smax, -2 M0], S F [pi + M0, pi + Smax], D F [pi - Smax,
//    pi - M0], F F 2 pi. At m 0.427, Smax 1.121 and the level near 1.61, the nearest is D F (margin ~0.43). A crossing near
//    contact, where the potential is large, is a local degeneracy that carries nothing to infinity.
// 5. HYDROGEN AND R. Continuum: E_b = mu alpha'^2 / 2 (alpha' = alpha / (24 pi)), 0.0897 at a_B 3.5, 0.1221 at 3. A
//    STATIC potential gives R = (2 tan m + (5/3) E_b) / (2 m - E_b) per beat (E-SPN-0155 point 4; E_b per beat is half
//    the cycle's): 1.23 at a_B 3.5. With the Darwin exchange at the level's own S (E-SPN-0169: S from the measured
//    relative density on a side-64 husk torus): R_full = R_static - (8/3) E_b S / (2 m - E_b), whose limit is tan m / m =
//    1.0656.
// 6. WHAT THE PROBES FOUND, AND THE PREDICTION (disclosed below: every number here was read before the gate plan was
//    fixed). The center of a light register pair bound this way MOVES HEAVILY, in every form tried: R static 7.5 (ball 20,
//    scalar, residual 9e-3), 15.0 (ball 16, scalar, S 2048, residual 1.2e-3), 12.2 (ball 14, scalar), 11.3 (ball 14,
//    vector), 7.8 (ball 14, vector, contact zeroed), against the static formula's 1.23 to 1.25, while its binding is
//    near the continuum's (E_b 0.095 to 0.104 against 0.0897) and its motion isotropic (to 1e-6). The vector form, which
//    phases the sector the pair would move through, does not cure it; the hard core lightens it but not near 1. The
//    level's residual halves as the filter doubles (3.2e-2, 9.8e-3, 4.2e-3 at 128, 512, 1024), the signature of a dense
//    spectrum near it rather than an isolated level: the start's spectral weight (ball 12) sits at E 1.39 and 1.48, far
//    below the hydrogenic 1.61, so the lattice core (2.5 rad at contact) holds deeper, immobile pair states, and the
//    hydrogenic level hybridizes with them. (At m 0.190 with an aliased core the same engine read R 1.88 and 2.20 against
//    the formula's 1.84 and 2.24: the heaviness is not the engine's.) PREDICTED: H0, H1, H3 hold; H2 FAILS or sits at the
//    edge (the residual ~1e-3 at S 2048 against 1e-3); H4 FAILS (R static ~10 against ~1.23); H5 FAILS (the Darwin shift
//    is ~0.3, not ~10); H6 not predicted. VERDICT PREDICTED: FAIL.
//
// GATES, fixed before the gate run (GATE_PLAN: m 0.427029; a_B 3.5 on a husk ball of radius 16; a_B 3 on radius 14;
// filters 128, 512, 2048; K filter 256; hold 64 cycles; the witness coordinate ball 7, full ball 6).
//  H0 THE WITNESS: the full 192 x 192 pair rule on the quotient (the vector form's two beats: the pieces with the pair
//     phases, the swap coin, the stream, every shift reduced to the quotient) against the coordinate cycle's two beats
//     lifted into it, one cycle, at K = 0 and (0.31, -0.17, 0.52, 0): an S S start at y = 0 over the whole full ball, and a
//     generic start (every block) within the full ball's radius less 3 (where a truncated ball is exact): entries 1e-12;
//     the coordinate norm kept to 1e-12; for the S S start the full weight equal to the lifted weight to 1e-10.
//  H1 THE CHANNELS (point 4): at the main level, every channel open at infinity at least 0.1 from E_L (mod 2 pi), and the
//     level at least 0.02 below the S S threshold.
//  H2 THE HOLD: |lambda| >= 1 - 1e-6 and residual <= 1e-3 after the filters; over 64 cycles the norm's change at most 1e-3
//     in size, the fidelity at least 1 - 1e-2 at every cycle, and the ball's outermost shell at most 1e-5 of the weight.
//  H3 ISOTROPY: the K^2 coefficient along the axis and a generic husk direction (K 0.04 and 0.02, Richardson) within 1e-3.
//  H4 THE STATIC R: R = c*^2 / (2 a E_L) (c*^2 = 1/2 a cycle) within 10% of E-SPN-0155's formula at the level's E_b.
//  H5 R WITH THE DARWIN EXCHANGE: R_full within 0.05 of tan m / m.
//  H6 THE TREND: at the stronger coupling (a_B 3) both R static and R_full lie farther from tan m / m than at a_B 3.5.
// INSTRUMENT (a failure makes the verdict partial). I1 the member coordinates' 16 phases on the husk slice equal E-SPN-0160's
//  Dirac band (pi +- E, 8 each) at 5 momenta to 1e-12. I2 the member R equals tan m / m to 1e-6. I3 the cross pieces are
//  exact projectors: on states held within husk radius 3 of a radius-16 ball, Gram self-adjointness <a|G P b> = <P a|G b>
//  and idempotence to 1e-12 (relative), and the Gram norm over one vector cycle kept to 1e-11.
// CONTROLS (a failure makes the verdict partial). C1 E-SPN-0162's capped string, set through this file's setPairPhases,
//  reproduces its engine bit for bit (three cycles, generic start, ball 5). C2 THE LIGHT OFF: the main level, run with
//  every count zero, loses fidelity below 1 - 1e-2 in 64 cycles. C3 THE TRANSVERSE EXCHANGE OFF: darwinR at S = 0 equals
//  staticR exactly.
// READ, gating nothing: the level's shares, shells, mean radius, <G>, S and the torus wrap, both forms' E_b against the
//  continuum, the R on the D 5 column (speed ratio 1.03125), the D D band's local reach, and the contact phase at the
//  doubled coupling.
// Verdict: fail if any of H0 to H6 fails; partial if the instrument or a control fails; pass if all hold.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/rch-probe1.log: the ring's small units (the smallest angle 0.006027); at m
//  0.190 the continuum numbers (a_B 2 to 6: alpha G(0) from 10.3 down to 3.4 rad, every one above or near pi); the engine
//  (ball 12, 16, 20: 0.51, 1.28, 2.40 s a cycle); a level at a_B 3.5, ball 20: E 1.5806 after S 64/128/128, residual
//  3.8e-3, E_b 0.1799 against the continuum 0.212, 16 cycles lost 8e-9 (its S read crashed: the 3d FFT needs a
//  power-of-two torus, fixed). tmp/rch-probe2.log: C1 bit for bit; the witness at coord 5 / full 4 and coord 7 / full 6,
//  S S and generic, K 0 and generic: 3.8e-17 to 8.6e-17 on the whole full ball at 7/6 (the generic start at 5/4 reads
//  4.4e-3 at the edge, 7e-17 inside). tmp/rch-probe3-35.log and -25.log (m 0.190, scalar): a_B 3.5, ball 20: E_b 0.1798,
//  isotropy 1.9e-7, R 1.877 against the formula 1.841; a_B 2.5, ball 16: E_b 0.2396 (continuum 0.416: the core aliased),
//  R 2.205 against 2.244. tmp/rch-probe4.log: the ring units with m in [0.35, 0.52] and their contact phases (point 3's
//  numbers). tmp/rch-probe3-m427-35.log (m 0.427, scalar, ball 20, S 128/512/256): E_b 0.0968, residual 9.0e-3, shares
//  0.979 S S, R static 7.546 against 1.230, S 0.9971. tmp/rch-probe5.log (the same, ball 16, S 2048): the start's weight
//  at E_L - 0.06 eight times that at E_L; residual 1.24e-3; R 14.97 against 1.246. tmp/rch-probe6-scalar.log and
//  -vector.log (ball 14, S 128/512/1024): scalar R 12.24, vector R 11.34 (E_b 0.098, 0.095); their cross-piece checks on
//  generic states filling the ball read 5e-4 (the edge; the gate's I3 holds its states inside). tmp/rch-probe6-core0.log
//  (vector, contact count zeroed): R 7.85, E_b 0.1037. tmp/rch-probe7.log (vector, ball 12, the start's spectral weight
//  at E 1.30 to 1.75 in steps of 0.03, S 512): weight at 1.36, 1.39 (645), 1.45, 1.48 (3785), 1.51 (1387) and upward.
//  tmp/rch-smoke.log (every code path on a small plan, unconverged, gating nothing): it found two defects in the gates as
//  first written, fixed before the gate run: H0 compared the generic start over the whole full ball, where only the
//  inside is exact (4.4e-3 at the edge, 7e-17 inside; E-SPN-0162 gated it "within 2 steps"); I3's norm over two cycles on
//  a radius-12 ball (1.2e-12) could reach the edge, so it reads one cycle on a radius-16 ball against 1e-11. These probes
//  moved the member from m 0.190 to 0.427, the form from scalar to vector, the main point from a_B 5 on a radius-34 ball
//  to a_B 3.5 on radius 16, the stronger point from a doubled coupling to a_B 3, and the filters to 128, 512, 2048.
//  tmp/rch-probe7.log's scan finished during the gate run (nothing changed after it): the start's weight rises from
//  1.51 to a broad maximum at 1.60 (6424) and falls to 134 at 1.75, a dense spectrum around the hydrogenic level.
//
// FIRST RUN (tmp/rch-exp-run1.log, 13,162 s): FAIL on H2, H4 and H5, as predicted; H0, H1, H3, H6, the instrument and
//  every control hold. No gate moved and none was rerun.
//  - H0: the full 192 x 192 rule and the lifted coordinate cycle agree to 3.6e-17 to 7.2e-17 (S S over the whole full
//    ball, generic within radius 3), weights equal to 12 digits, the coordinate norm kept to 1e-12.
//  - H1: the main level sits 0.0948 below the S S threshold, the nearest open channel D F at 0.406.
//  - MAIN, a_B 3.5, ball 16: E_L 1.61335735, E_b 0.09476 (continuum 0.08970), |lambda| 1 - 1.2e-6, residual 1.52e-3
//    (3.08e-2, 9.85e-3, 1.52e-3 after the three filters), lost 3.2e-7 over 64 cycles, fidelity above 0.9906, edge
//    4.3e-5, mean r 5.12, S S share 0.980. H2 FAILS on the residual (1.52e-3 against 1e-3) and the edge (4.3e-5 against
//    1e-5): the level is held (no leak, fidelity 0.99) but not isolated. Isotropy 1.8e-6 (H3). R static 8.459 against
//    the formula 1.226 (H4 FAILS). S 0.9969, R with the Darwin exchange 8.303 against tan m / m 1.0656 (H5 FAILS): the
//    exchange moves R by 0.156, the size E-SPN-0169 derived, against an excess of 7.4.
//  - STRONGER, a_B 3, ball 14: E_b 0.13957 (continuum 0.12209), residual 1.25e-4, fidelity above 1 - 6.2e-5, lost
//    9.2e-8, isotropy 5.7e-8: a clean, isolated, held level. R static 16.454 against 1.309, S 0.9444, R_full 16.230. So
//    the heaviness is not the main level's contamination: the cleanest level read is the heaviest, and the stronger the
//    pull the heavier the pair (H6 holds).
//  - I3: the cross pieces are exact projectors (adjointness 2.3e-15, idempotence 0, the norm over a cycle 1.7e-13).
//    C1 bit for bit; C2 with the light off the level's fidelity falls to 0.194 in 64 cycles; C3.
//  WHAT IT MEANS. A light register pair held by the light's Coulomb pull binds as hydrogen does (E_b within 6% and 14%
//  of the continuum, isotropic), and it does not move as a free composite: its centre is 8 and 16 times heavier than
//  the static formula, and heavier as it binds more tightly. The Darwin exchange is real and has the derived size, but
//  it is a correction of order E_b, and this excess is of order one. The heaviness survives every form of the pull
//  (scalar, vector, hard core) and every ball read, so it belongs to the pair-phase construction on this rule: a pair
//  phase is diagonal in the members' relative dock, and a member moves only by passing to its partner T D, whose
//  coordinate dock is one link away, so every centre-of-mass step changes the relative coordinate by a link and meets
//  the pull's full gradient there. Where the pull is strong on the scale of a link (here alpha G(1) = 0.59 rad a cycle,
//  against a member band width of about 0.27) the centre moves only at higher order, E-SPN-0162's strong-coupling
//  regime reached from the Coulomb side. R near tan m / m needs the pull weak on the scale of a link, a_B far above the
//  lattice (tens of docks), which the rule can hold (alpha G(0) < pi) only for a member that is heavier still or on a
//  ball far larger than this engine runs.
// NEXT. (1) A symmetry-reduced engine (the cubic group at K = 0, the s-wave sector) to reach a_B 10 to 20 on radius 60 to
//  120, where the pull is weak on the scale of a link, and read R's approach to the formula there. (2) The pull applied
//  to the member's own charge position rather than to the coordinate dock (the D content's true dock), which removes
//  the one-link displacement the heaviness traces to; it is not dock-local in coordinates and needs its own derivation.
//
// Depth L2 (a two-body quantum walk of register members on the husk quotient with an integer-counted Coulomb phase, in
// the exact coordinates of its invariant block, witnessed against the full rule). DETERMINISM: no random numbers; placed
// starts, filtered levels, Weyl values. NOTHING MOVES: the pieces hand values between slots and register components of
// one dock, the stream takes each slot's value one dock along, the pull is a phase on the pair's sectors.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { staticR, darwinR } from '@/code/measure/darwin-exchange'
import { wrap } from '@/code/measure/dock-mixer'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import {
  greenFar,
  huskGreenTable,
  type GreenTable,
} from '@/code/measure/husk-meson'
import {
  blockShares,
  clonePair,
  inner,
  memberCycle,
  newPair,
  norm2,
  normalizePair,
  pairCycle,
  pairEngine,
  relBall,
  type PairState,
} from '@/code/measure/register-meson'
import {
  coulombCounts,
  coulombCycle,
  coulombEngine,
  coulombFilter,
  coulombRead,
  crossProjection,
  densityS,
  type CoulombEngine,
  fullBeatQ,
  fullGapQ,
  fullRuleQ,
  huskRelBall,
  hydrogenStart,
  liftQ,
  meanGreen,
  setPairPhases,
  shells,
  siteWeights,
  type CoulombCount,
} from '@/code/measure/register-coulomb'
import {
  diracPhase,
  structureVector,
  weylDirections,
} from '@/code/measure/spinor-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const LIGHT: readonly [number, number] = [-5, 1]
const UNIT: readonly [number, number] = [11, 5]
const STRING: readonly [number, number] = [-9, 6]
const C_STAR2 = 0.5
const GENERIC_RAW = [0.29, 0.52, 0.8]
const GENERIC = [
  ...GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW)),
  0,
]
const DIRS: readonly number[][] = [[1, 0, 0, 0], GENERIC]
const WITNESS_K: readonly number[][] = [
  [0, 0, 0, 0],
  [0.31, -0.17, 0.52, 0],
]
const I1_MOMENTA: readonly number[][] = [
  [0, 0, 0, 0],
  [0.3, 0.1, -0.2, 0],
  [1.1, -0.7, 0.4, 0],
  [2.5, 0.3, 0.3, 0],
  [0.01, 0, 0, 0],
]
const KAPPA = 0.04

// the gate tolerances (fixed before the gate run; see the header)
const ENTRY = 1e-12
const WEIGHT = 1e-10
const NORM = 1e-12
const MARGIN = 0.1
const BOUND = 0.02
const LAMBDA = 1e-6
const RESIDUAL = 1e-3
const LOST = 1e-3
const FIDELITY = 1e-2
const EDGE = 1e-5
const ISOTROPY = 1e-3
const STATIC_BAND = 0.1
const FULL_BAND = 0.05
const I1_TOLERANCE = 1e-12
const I2_TOLERANCE = 1e-6
const I3_TOLERANCE = 1e-12
const I3_NORM = 1e-11
const C2_FIDELITY = 1e-2

export type CoulombPlan = {
  main: number
  mainRadius: number
  double: number
  doubleRadius: number
  filters: readonly number[]
  kFilter: number
  hold: number
  witness: boolean
  witnessCoord: number
  witnessFull: number
  sTorus: number
  gScan: number
}

export const GATE_PLAN: CoulombPlan = {
  main: 3.5,
  mainRadius: 16,
  double: 3,
  doubleRadius: 14,
  filters: [128, 512, 2048],
  kFilter: 256,
  hold: 64,
  witness: true,
  witnessCoord: 7,
  witnessFull: 6,
  sTorus: 64,
  gScan: 2000,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/register-coulomb-hold',
  code: 'E-SPN-0173',
  title:
    "a light register pair held by the husk light's Coulomb pull binds like hydrogen but moves 8 to 16 times too heavily, fail (H2, H4, H5): two members at m 0.427 (below pi/6 and below the swap coin's leak at 0.62) carrying the Cl+(4) register, held by an integer-counted pair phase rho^(-n(y)), n = floor(alpha G(y) / theta), in the vector form (every sector moved alike, the S D and D S sectors through exact one-link projector pieces), on the husk quotient, exact in the 16 x 16 moving block (witnessed against the full 192 x 192 rule to 7e-17); every channel open at infinity is closed (D F at 0.41); the level binds within 6% of hydrogen (E_b 0.0948 against 0.0897) and holds 64 cycles with no leak, isotropic to 2e-6, but R = 8.46 against the static formula's 1.23, and 16.45 at the stronger a_B 3 (a clean isolated level, residual 1e-4); the Darwin exchange moves R by the derived 0.16, far short; the doubled coupling would put 5.0 rad a cycle at contact, which no pair phase can hold",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerCoulombHoldRun(GATE_PLAN)
  },
})

const unitValue = (angle: number): [number, number] => [
  Math.cos(angle),
  Math.sin(angle),
]

type Point = {
  aB: number
  alpha: number
  radius: number
  sites: number
  count: CoulombCount
  EL: number
  Eb: number
  lambdaAbs: number
  residual: number
  lost: number
  least: number
  edge: number
  mean: number
  shares: number[]
  shellsHead: number[]
  meanG: number
  coefficients: number[]
  isotropy: number
  Rstatic: number
  S: number
  meanK2: number
  wrapped: number
  RformulaStatic: number
  Rfull: number
  RfullD5: number
  EbContinuum: number
  v: PairState
  e: CoulombEngine
  reads: number[]
}

export function registerCoulombHoldRun(plan: CoulombPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const theta0 = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u = unitValue(theta0)
  const M0 = wrap(theta0 - Math.PI)
  const m = M0 / 2
  const tanOver = Math.tan(m) / m
  const theta = unitAngle(ringUnit(UNIT[0], UNIT[1]))

  // ---------------- I1, I2: the member coordinates on the husk slice ----------------
  const phasesOf = (K: readonly number[]): number[] => {
    const c = memberCycle(u, K)
    const ev = complexEigenvalues({ re: c.re, im: c.im, n: 16 })

    return ev.re
      .map((x, i) => Math.atan2(ev.im[i]!, x))
      .sort((a, b) => a - b)
  }

  let i1 = 0

  for (const K of I1_MOMENTA) {
    const ph = phasesOf(K)
    const E = diracPhase(K, M0)
    const want = [
      ...new Array<number>(8).fill(wrap(Math.PI + E)),
      ...new Array<number>(8).fill(wrap(Math.PI - E)),
    ].sort((a, b) => a - b)

    i1 = Math.max(
      i1,
      ...ph.map((x, i) => Math.abs(wrap(x - (want[i] as number)))),
    )
  }

  const sEps = (k: number): number =>
    phasesOf([k, 0, 0, 0])
      .map(x => wrap(x - Math.PI))
      .reduce((b, x) => (Math.abs(x - M0) < Math.abs(b - M0) ? x : b))
  const aMember =
    (4 * ((sEps(0.01) - M0) / 0.01 ** 2) -
      (sEps(0.02) - M0) / 0.02 ** 2) /
    3
  const RMember = C_STAR2 / (2 * aMember * M0)
  const I1 = i1 <= I1_TOLERANCE
  const I2 = Math.abs(RMember - tanOver) <= I2_TOLERANCE
  // the reduced mass in cycle units: the member's inertia c*^2 / (2 a) over 2
  const mu = C_STAR2 / (2 * aMember) / 2

  log('I1 I2')

  // ---------------- the Green's function ----------------
  const G0 = infiniteGreenZero('husk', 64).value
  const table: GreenTable = huskGreenTable(128, 16, G0)
  const alphaOf = (aB: number): number => (24 * Math.PI) / (mu * aB)

  log('green')

  // ---------------- H0: the witness on the quotient ----------------
  const witness: {
    K: number[]
    kind: string
    gap: number
    gapInner: number
    weights: number[]
    norms: number[]
  }[] = []

  if (plan.witness) {
    const coord = huskRelBall(plan.witnessCoord)
    const full = huskRelBall(plan.witnessFull)
    const alpha = alphaOf(plan.main)
    const cc = coulombCounts(coord, table, alpha, theta)
    const fc = coulombCounts(full, table, alpha, theta)

    for (const K of WITNESS_K) {
      for (const kind of ['SS', 'generic'] as const) {
        const e = coulombEngine(coord, u, K, cc, 'vector')
        const s = newPair(coord)
        const at = coord.index.get('0,0,0,0')!

        let w = 0.5

        for (let k = 0; k < (kind === 'SS' ? 64 : 256); k++) {
          w = (w + 0.6180339887498949) % 1
          s.re[at * 256 + k] = w - 0.5
          w = (w + 0.4142135623730951) % 1
          s.im[at * 256 + k] = w - 0.5
        }

        const n0 = norm2(e, s)
        const before = liftQ(coord, s, full, K)

        pairCycle(e, s)

        const n1 = norm2(e, s)
        const want = liftQ(coord, s, full, K)
        const rule = fullRuleQ(
          full,
          u,
          K,
          Array.from(fc.counts, n => -theta * n),
          'vector',
        )
        const two = fullBeatQ(rule, fullBeatQ(rule, before, 1), 2)
        const g = fullGapQ(full, two, want)
        const gIn = fullGapQ(full, two, want, plan.witnessFull - 3)

        witness.push({
          K: [...K],
          kind,
          gap: g.worst,
          gapInner: gIn.worst,
          weights: [g.weightA, g.weightB],
          norms: [n0, n1],
        })
        log(`witness ${kind} ${K.join(',')}`)
      }
    }
  }

  const H0 =
    plan.witness &&
    witness.every(
      w =>
        (w.kind === 'SS' ? w.gap : w.gapInner) <= ENTRY &&
        Math.abs(w.norms[1]! / w.norms[0]! - 1) <= NORM,
    ) &&
    witness
      .filter(w => w.kind === 'SS')
      .every(w => Math.abs(w.weights[0]! / w.weights[1]! - 1) <= WEIGHT)

  // ---------------- a coupling point: the level, the hold, the motion, S and R ----------------
  const holdOf = (
    e: CoulombEngine,
    v: PairState,
    cycles: number,
  ): { lost: number; least: number } => {
    const s = clonePair(v)
    const n0 = norm2(e, v)

    let least = 1

    for (let c = 1; c <= cycles; c++) {
      coulombCycle(e, s)

      const [fr, fi] = inner(e, v, s)

      least = Math.min(least, (fr * fr + fi * fi) / (n0 * n0))
    }

    return { lost: 1 - norm2(e, s) / n0, least }
  }

  const levelOf = (
    e: CoulombEngine,
    from: PairState,
    guess: number,
    filters: readonly number[],
  ): {
    v: PairState
    read: ReturnType<typeof coulombRead>
    reads: number[]
  } => {
    let v = from
    let phase = guess
    let read = coulombRead(e, from)

    const reads: number[] = []

    for (const S of filters) {
      v = coulombFilter(e, v, phase, S)
      normalizePair(e, v)
      read = coulombRead(e, v)
      reads.push(read.residual)
      phase = read.phase
    }

    return { v, read, reads }
  }

  const pointAt = (aB: number, radius: number): Point => {
    const alpha = alphaOf(aB)
    const ball = huskRelBall(radius)
    const count = coulombCounts(ball, table, alpha, theta)
    const e = coulombEngine(ball, u, [0, 0, 0, 0], count, 'vector')
    const start = hydrogenStart(ball, aB)
    const EbContinuum = (mu * (alpha / (24 * Math.PI)) ** 2) / 2

    normalizePair(e, start)

    const level = levelOf(e, start, 2 * M0 - EbContinuum, plan.filters)
    const EL = level.read.phase
    const held = holdOf(e, level.v, plan.hold)
    const w = siteWeights(ball, level.v)
    const sh = shells(ball, w)

    log(`level a_B ${aB}: E ${EL}`)

    const eAt = (K: number[]): number => {
      const ek = coulombEngine(ball, u, K, count, 'vector')
      const v = coulombFilter(ek, level.v, EL, plan.kFilter)

      normalizePair(ek, v)

      return coulombRead(ek, v).phase
    }

    const base = eAt([0, 0, 0, 0])
    const coefficients = DIRS.map(d => {
      const e1 = eAt(d.map(x => x * KAPPA))
      const e2 = eAt(d.map(x => (x * KAPPA) / 2))

      return (
        (4 * ((e2 - base) / (KAPPA / 2) ** 2) -
          (e1 - base) / KAPPA ** 2) /
        3
      )
    })
    const a0 = coefficients[0]!
    const isotropy = Math.max(
      ...coefficients.map(a => Math.abs(a / a0 - 1)),
    )
    const Rstatic = C_STAR2 / (2 * a0 * base)

    log(`motion a_B ${aB}: R ${Rstatic}`)

    const dS = densityS(ball, w, plan.sTorus)
    // per beat: the member's m and the binding E_b / 2 (the formulas are E-SPN-0155's, per beat)
    const Eb = 2 * M0 - EL
    const RformulaStatic = staticR(m, Eb / 2)
    const darwinShift = (speed2: number): number =>
      darwinR(m, Eb / 2, dS.S, speed2) - staticR(m, Eb / 2)
    const Rfull = Rstatic + darwinShift(1)
    const RfullD5 = Rstatic + darwinShift(1.03125)

    log(`S a_B ${aB}: ${dS.S}`)

    return {
      aB,
      alpha,
      radius,
      sites: ball.points.length,
      count,
      EL,
      Eb,
      lambdaAbs: Math.hypot(...level.read.lambda),
      residual: level.read.residual,
      reads: level.reads,
      lost: held.lost,
      least: held.least,
      edge: sh.edge,
      mean: sh.mean,
      shares: blockShares(e, level.v),
      shellsHead: sh.shells.slice(0, 8),
      meanG: meanGreen(ball, table, w),
      coefficients,
      isotropy,
      Rstatic,
      S: dS.S,
      meanK2: dS.meanK2,
      wrapped: dS.wrapped,
      RformulaStatic,
      Rfull,
      RfullD5,
      EbContinuum,
      v: level.v,
      e,
    }
  }

  const main = pointAt(plan.main, plan.mainRadius)
  const H2 =
    main.lambdaAbs >= 1 - LAMBDA &&
    main.residual <= RESIDUAL &&
    Math.abs(main.lost) <= LOST &&
    main.least >= 1 - FIDELITY &&
    main.edge <= EDGE
  const H3 = main.isotropy <= ISOTROPY
  const H4 =
    Math.abs(main.Rstatic / main.RformulaStatic - 1) <= STATIC_BAND
  const H5 = Math.abs(main.Rfull - tanOver) <= FULL_BAND

  // ---------------- H1: the channels open at infinity ----------------
  let gMax = 0

  for (const w of weylDirections(plan.gScan)) {
    for (let k = 0.05; k < 3.2; k += 0.05) {
      gMax = Math.max(
        gMax,
        Math.hypot(...structureVector(w.map(x => x * k))) / 2,
      )
    }
  }

  const Smax = Math.acos(
    Math.cos(M0) - 2 * Math.cos(M0 / 2) ** 2 * gMax * gMax,
  )

  // the S D band at the largest total K the run uses, on the husk slice: E_S(K/2 + q) - E_S(q - K/2) over a q grid
  let sdWidth = 0

  for (const w of weylDirections(400)) {
    const q3 = [w[0]!, w[1]!, w[2]!]
    const n = Math.hypot(...q3)

    for (let k = 0; k <= 3.2; k += 0.1) {
      for (const d of DIRS) {
        const K = d.map(x => x * KAPPA)
        const q = [...q3.map(x => (x / n) * k), 0]

        sdWidth = Math.max(
          sdWidth,
          Math.abs(
            diracPhase(
              q.map((x, i) => x + K[i]! / 2),
              M0,
            ) -
              diracPhase(
                q.map((x, i) => x - K[i]! / 2),
                M0,
              ),
          ),
        )
      }
    }
  }

  const distance = (E: number, lo: number, hi: number): number => {
    let best = Infinity

    for (const shift of [-2 * Math.PI, 0, 2 * Math.PI]) {
      const x = E + shift

      best = Math.min(best, x < lo ? lo - x : x > hi ? x - hi : 0)
    }

    return best
  }

  const channelsOf = (
    E: number,
  ): { margin: number; at: string; bound: number } => {
    const bands: [string, number, number][] = [
      ['DD', -2 * Smax, -2 * M0],
      ['SD', -sdWidth, sdWidth],
      ['SF', Math.PI + M0, Math.PI + Smax],
      ['DF', Math.PI - Smax, Math.PI - M0],
      ['FF', 2 * Math.PI, 2 * Math.PI],
    ]

    let margin = Infinity
    let at = ''

    for (const [name, lo, hi] of bands) {
      const d = distance(E, lo, hi)

      if (d < margin) {
        margin = d
        at = name
      }
    }

    return { margin, at, bound: 2 * M0 - E }
  }

  const mainChannels = channelsOf(main.EL)

  // where the D D band, raised by alpha G(y) near contact, reaches the level (a local degeneracy, not a channel)
  const ddReach = (p: Point): number => {
    let reach = 0

    for (let r = 0; r <= 200; r += 0.25) {
      const G = r === 0 ? G0 : G0 - greenFar(G0, r, 0, 0)
      const lift = p.alpha * G
      const lo = -2 * Smax + lift
      const hi = -2 * M0 + lift

      if (distance(p.EL, lo, hi) === 0) {
        reach = r
      }
    }

    return reach
  }

  const H1 =
    mainChannels.margin >= MARGIN && mainChannels.bound >= BOUND

  log('H1')

  // ---------------- the doubled coupling ----------------
  const dbl = pointAt(plan.double, plan.doubleRadius)
  const doubleChannels = channelsOf(dbl.EL)
  const H6 =
    Math.abs(main.Rfull - tanOver) < Math.abs(dbl.Rfull - tanOver) &&
    main.Rstatic - tanOver < dbl.Rstatic - tanOver

  // ---------------- controls ----------------
  // C1: E-SPN-0162's string through setPairPhases equals the native engine bit for bit, three cycles, generic start
  let C1 = false

  {
    const ball = relBall(5)
    const tau = unitAngle(ringUnit(STRING[0], STRING[1]))
    const K = [0.31, -0.17, 0.52, 0.08]
    const native = pairEngine(ball, { u, tau, cap: 8, K })
    const mine = pairEngine(ball, { u, tau: 0, cap: 0, K })

    setPairPhases(
      mine,
      Array.from(ball.V, V => tau * Math.min(V, 8)),
    )

    const a = newPair(ball)

    let w = 0.5

    for (let k = 0; k < 256; k++) {
      w = (w + 0.6180339887498949) % 1
      a.re[k] = w - 0.5
      w = (w + 0.4142135623730951) % 1
      a.im[k] = w - 0.5
    }

    const b = clonePair(a)

    for (let c = 0; c < 3; c++) {
      pairCycle(native, a)
      pairCycle(mine, b)
    }

    C1 =
      a.re.every((x, i) => x === b.re[i]) &&
      a.im.every((x, i) => x === b.im[i])
  }

  // C2: the light off (alpha 0): from the main level, the free pair does not hold
  const ballFree = huskRelBall(plan.mainRadius)
  const eFree = coulombEngine(
    ballFree,
    u,
    [0, 0, 0, 0],
    { ...main.count, counts: new Int32Array(main.count.counts.length) },
    'vector',
  )
  const vFree = clonePair(main.v)

  normalizePair(eFree, vFree)

  const heldFree = holdOf(eFree, vFree, plan.hold)
  const C2 = heldFree.least < 1 - C2_FIDELITY

  // C3: the transverse exchange off (S = 0) gives the static R exactly
  const C3 = darwinR(m, main.Eb / 2, 0, 1) === staticR(m, main.Eb / 2)

  // ---------------- I3: the cross pieces are exact projectors (interior states, away from the ball's edge) ----------------
  let i3Adjoint = 0
  let i3Idem = 0
  let i3Norm = 0

  {
    const ball = huskRelBall(16)
    const e = coulombEngine(
      ball,
      u,
      [0.31, -0.17, 0.52, 0],
      coulombCounts(ball, table, alphaOf(plan.main), theta),
      'vector',
    )

    const gen = (seed: number): PairState => {
      const s = newPair(ball)

      let w = seed

      ball.points.forEach((p, i) => {
        if (Math.hypot(p[0]!, p[1]!, p[2]!) > 3) {
          return
        }

        for (let k = 0; k < 256; k++) {
          w = (w + 0.6180339887498949) % 1
          s.re[i * 256 + k] = w - 0.5
          w = (w + 0.4142135623730951) % 1
          s.im[i * 256 + k] = w - 0.5
        }
      })

      return s
    }

    const a = gen(0.1)
    const b = gen(0.7)

    for (const kind of ['SD', 'DS'] as const) {
      const embed = (s: PairState): PairState => {
        const p = crossProjection(e, s, kind)
        const out = newPair(ball)
        const off = kind === 'SD' ? 64 : 128

        for (let i = 0; i < ball.points.length; i++) {
          for (let k = 0; k < 64; k++) {
            out.re[i * 256 + off + k] = p.re[i * 64 + k]!
            out.im[i * 256 + off + k] = p.im[i * 64 + k]!
          }
        }

        return out
      }

      const x = inner(e, a, embed(b))
      const y = inner(e, embed(a), b)
      const scale = Math.sqrt(norm2(e, a) * norm2(e, b))
      const p1 = embed(a)
      const pp = embed(p1)

      i3Adjoint = Math.max(
        i3Adjoint,
        Math.hypot(x[0] - y[0], x[1] - y[1]) / scale,
      )

      for (let i = 0; i < pp.re.length; i++) {
        i3Idem = Math.max(
          i3Idem,
          Math.hypot(pp.re[i]! - p1.re[i]!, pp.im[i]! - p1.im[i]!),
        )
      }
    }

    const s = clonePair(a)
    const n0 = norm2(e, s)

    coulombCycle(e, s)
    i3Norm = Math.abs(norm2(e, s) / n0 - 1)
  }

  const I3 =
    i3Adjoint <= I3_TOLERANCE &&
    i3Idem <= I3_TOLERANCE &&
    i3Norm <= I3_NORM

  log('controls')

  const instrument = I1 && I2 && I3
  const controls = C1 && C2 && C3
  const hard = H0 && H1 && H2 && H3 && H4 && H5 && H6
  const status = !hard
    ? 'fail'
    : !instrument || !controls
      ? 'partial'
      : 'pass'
  const pointClaim = (p: Point): string =>
    `a_B ${p.aB} (alpha ${p.alpha.toFixed(3)}, ball ${p.radius}, ${p.sites} sites, count top ${p.count.top}, nearest threshold ${p.count.nearest.toExponential(2)}): E_L ${p.EL.toFixed(8)}, E_b ${p.Eb.toFixed(6)} (continuum ${p.EbContinuum.toFixed(6)}), |lambda| ${p.lambdaAbs.toFixed(10)}, residual ${p.residual.toExponential(2)} (after each filter ${p.reads.map(x => x.toExponential(2)).join(', ')}), lost ${p.lost.toExponential(2)} over ${plan.hold} cycles, least fidelity ${p.least.toFixed(10)}, edge ${p.edge.toExponential(2)}, mean r ${p.mean.toFixed(3)}, shares ${p.shares.map(x => x.toFixed(4)).join(' ')}, shells 0..7 ${p.shellsHead.map(x => x.toExponential(1)).join(' ')}, <G> ${p.meanG.toFixed(6)}; a ${p.coefficients.map(a => a.toFixed(10)).join(' ')} (isotropy ${p.isotropy.toExponential(2)}); R static ${p.Rstatic.toFixed(6)} against the formula ${p.RformulaStatic.toFixed(6)}; S ${p.S.toFixed(6)} (<k^2> ${p.meanK2.toFixed(5)}, wrapped ${p.wrapped.toExponential(2)}); R with the Darwin exchange ${p.Rfull.toFixed(6)} at one speed, ${p.RfullD5.toFixed(6)} on the D 5 column, against tan m / m ${tanOver.toFixed(6)}`

  return verdict({
    status,
    claim: `H0 ${H0} (${witness.map(w => `${w.kind} K ${w.K.join(',')}: gap ${w.gap.toExponential(2)} (inner ${w.gapInner.toExponential(2)}), weights ${w.weights.map(x => x.toFixed(12)).join('/')}, norm ${w.norms.map(x => x.toFixed(12)).join(' -> ')}`).join('; ')}); H1 ${H1} (main: least margin ${mainChannels.margin.toFixed(4)} at ${mainChannels.at}, below the S S threshold by ${mainChannels.bound.toFixed(6)}; S D width at the run's K ${sdWidth.toExponential(2)}; Smax ${Smax.toFixed(6)}; the D D band meets the level out to r ${ddReach(main)} (local); doubled: margin ${doubleChannels.margin.toFixed(4)} at ${doubleChannels.at}, bound ${doubleChannels.bound.toFixed(6)}, D D to r ${ddReach(dbl)}); H2 ${H2}; H3 ${H3}; H4 ${H4} (static R against the formula within ${STATIC_BAND}); H5 ${H5} (R with the Darwin exchange within ${FULL_BAND} of tan m / m); H6 ${H6} (the stronger coupling farther). MAIN ${pointClaim(main)}. STRONGER ${pointClaim(dbl)}. Instrument I1 ${I1} (${i1.toExponential(2)}) I2 ${I2} (member R ${RMember.toFixed(9)} vs ${tanOver.toFixed(9)}, mu ${mu.toFixed(6)}) I3 ${I3} (cross pieces: Gram adjointness ${i3Adjoint.toExponential(2)}, idempotence ${i3Idem.toExponential(2)}, norm over one cycle ${i3Norm.toExponential(2)}); the doubled coupling (a_B ${plan.main / 2}) would put ${((24 * Math.PI * G0) / (mu * (plan.main / 2))).toFixed(3)} rad a cycle at contact, above pi, which a pair phase cannot represent; controls C1 ${C1} (E-SPN-0162's string bit for bit) C2 ${C2} (light off: lost ${heldFree.lost.toExponential(2)}, least fidelity ${heldFree.least.toFixed(6)}) C3 ${C3}`,
    metrics: {
      H0: flag(H0),
      H1: flag(H1),
      H2: flag(H2),
      H3: flag(H3),
      H4: flag(H4),
      H5: flag(H5),
      H6: flag(H6),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      EL: main.EL,
      Eb: main.Eb,
      residual: main.residual,
      lost: main.lost,
      leastFidelity: main.least,
      edge: main.edge,
      margin: mainChannels.margin,
      isotropy: main.isotropy,
      Rstatic: main.Rstatic,
      RformulaStatic: main.RformulaStatic,
      S: main.S,
      Rfull: main.Rfull,
      RfullD5: main.RfullD5,
      doubleEb: dbl.Eb,
      doubleRstatic: dbl.Rstatic,
      doubleRfull: dbl.Rfull,
      doubleS: dbl.S,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      instrument: flag(instrument),
    },
    notes: `L2. Light m ${m.toFixed(6)} (M0 ${M0.toFixed(6)}), the Coulomb count in steps of ringUnit(${UNIT.join(', ')}) (angle ${theta.toFixed(9)}), G(0) ${G0.toFixed(9)}, mu ${mu.toFixed(6)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
