// CAN A DOCK PIECE LIFT THE SWAP COIN'S F- MULTIPLET OFF PI AND LEAVE THE MOVING PAIR ALONE (E-SPN-0148)? E-SPN-0147
// (swap-mass-string) bound the love-fear meson cleanly with a mass string but read two costs it traced to the 11 flat
// F- states pinned at phase pi: the closure window exists only for heavy members (m0 > arctan(1/3)), and R = 1.568 with
// 31% of the level off the singlet slot pattern, read as frozen flat-member weight. The proposed piece (b): move F- off
// pi, leave S and D (so gamma = 0 survives). This file derives what dock-local pieces can do, and runs the nearest one.
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/odd-phase, code/rule/odd-phase, code/measure/swap-string; K in D4
// coordinates; U(K) = T(K) P, T = diag(e^(-i K . r_d)) the stream, P the one-vibe dock matrix; member eps as E-SPN-0147).
// 1. THE BAND-SUM RULE (a theorem, L1). For ANY K-independent 24 x 24 P (every dock-local piece composed: coin, mixers,
//    anything), tr U(K) = sum_d P_dd e^(-i K . r_d) has no constant Fourier term (no root is 0), so over the zone the 24
//    eigenvalues e^(i phi_b(K)) sum to zero on average: <sum_b e^(i phi_b)> = 0.
//    COROLLARY, THE NO-GO FOR (b) AS POSED. At the swap point the bands are S and D (span(z, T z)), 11 F+ at +1 and 11
//    F- at -1. The pair's midpoint mu is fixed and sin w = sin(theta/2) g(K) with <g> = 0, so <lambda_S + lambda_D> =
//    2 i e^(i mu) <sin w> = 0. A piece that leaves S, D and F+ as they are leaves the other 11 eigenvalues a zone-mean sum
//    of -11, and eleven numbers of modulus one averaging to -1 are each -1 almost everywhere: F- STAYS AT PI. This holds
//    for every dock-local unitary: rank-one or not, W(F4)-covariant or not, Pauli-blocked or not, in any ring. With F+
//    kept and any pair of fixed midpoint (gamma = 0), |sum_(F-) (mu_j + 1)| = 2 |<sin w>| <= 2, so one F- multiplet can
//    sit at most 2 arcsin(1/11) = 0.182 from pi, and only if the pair itself changes so that <sin w> != 0 (never in the
//    swap form). Moving F- needs F+ or the pair to move with it.
// 2. COVARIANCE. The commutant of W(F4) on the 24 roots is five-dimensional (E-SPN-0141's census): Pi1 (uniform), Pi2,
//    Pi9 (the traceless quadratics (r . a)^2) in the line-even sector, Pi4 (the vector irrep a . r) and Pi8 in the
//    line-odd sector; a covariant dock unitary after the coin is X sum_k e^(i phi_k) Pi_k. D's rest state is the K -> 0
//    limit of P- z, proportional to (K . r): it lies in Pi4, which is irreducible, so a covariant piece is one phase on
//    all of Pi4 and THE THREE Pi4 STATES ORTHOGONAL TO D'S REST DIRECTION ARE DEGENERATE WITH D AT REST, for every
//    covariant piece: at least 3 of the 11 F- stay at D's rest phase. T(K)'s n-th order term is a degree-n polynomial in
//    r, which reaches Pi1 + Pi4 at n = 1, Pi1 + Pi9 at 2, Pi4 + Pi8 at 3 and Pi2 first at 4. So the singlet's K^2 term (R)
//    sees Pi1 and Pi4 only; the massless pair's K^2 term (gamma) sees Pi1, Pi4, Pi9, where a covariant piece acts as a
//    coin whose odd-to-even phase is pi + phi4 - phi9, so gamma = cot((pi + phi9 - phi4) / 2) / 8 in this file's reading
//    (E-SPN-0143's coin formula; a love, masslessPair); Pi8 enters the singlet at K^6 and Pi2 at K^8. THE COVARIANT PIECES
//    THAT KEEP R AND gamma = 0 ARE e^(i phi8) ON Pi8 AND e^(i phi2) ON Pi2 (with the mixer angle and a global phase).
// 3. THE CANDIDATES. (A) THE ODD-OCTET PHASE G8 = 1 + (v - 1) Pi8 (code/rule/odd-phase), v = e^(-i alpha) = (8 + 5 w^2) /
//    7, alpha = arccos(11/14): covariant; exact in Z[w][1/42] (12 Pi8 = 6 (I - X) - R R^T is an integer matrix);
//    Pauli-blocked (an empty dock takes 1, a full dock det G8 = v^8, a global phase); it keeps R exactly through K^4 and
//    gamma = 0; at rest it moves the 8 Pi8 states from pi to pi - alpha = 2.474646 (member eps -m0 - alpha), leaves D and
//    3 F- at pi; away from rest the moved octet is not flat (the band-sum's compensation). Why -alpha: at +alpha (and at
//    +0.2) the octet sits at member eps -m0 + alpha, and S + octet channels cross the E-SPN-0147 level at every string
//    length (probe 3); at -alpha the nearest pair channel other than S + S sits 0.135 from the level. (B) THE PROPOSAL,
//    a second rank-one mixer on the line-odd uniform vector y (sign +1 on a line's first slot, -1 on its second, / sqrt
//    24), at the same angle -alpha: not covariant (y y^T picks one half of every line; 7/9 of y is in Pi4), it lifts ONE
//    F- at rest, and at first order in K it couples S and D to y: anisotropic c0, gamma != 0, R broken.
// 4. THE WINDOW DOES NOT OPEN. E-SPN-0147's closure window (pi - 2 m0, 2 pi - 2 m0 - 2 kmax(m0)) has as its floor D at
//    rest plus an F+ state at rest, i.e. exactly D(0) + Pi9(0) = (-m0) + (pi - m0) in member eps. With gamma = 0 the
//    Pi9-to-Pi4 phase is fixed (point 2), so THAT CHANNEL SITS AT pi - 2 m0 FOR EVERY COVARIANT gamma = 0 PIECE, and the
//    ceiling is D's own wrap. Piece A keeps the 3 F- flats at D's rest phase (point 2; flat, probe 2), so S + those
//    flats sweep [0, 2 delta_cap + kmax(m_cap)] and D + the F+ flats sweep [pi - 2 m0 - kmax, pi - 2 m0] as before: the
//    window is E-SPN-0147's, and the piece can only add channels. At the lighter in-ring point m0 = 0.190126 (u =
//    ringUnit(-1, 4), under arctan(1/3) = 0.3218) the window is empty (floor 2.7614 over ceiling 2.4743): no lighter
//    member binds under A. NO TREND TOWARD LIGHT MEMBERS EXISTS for any covariant gamma = 0 piece.
// 5. THE COMPOSITE WITH A ON. The piece changes S only at K^6 and keeps every channel 0.135 from the level: the level
//    should hold with eps within 1e-3 of 2.265323 and be isotropic (the first anisotropy of a W(F4)-invariant dispersion
//    is K^6). R: no derived mechanism moves it (the piece acts on states the level reaches only evanescently): PREDICTED
//    R = 1.57 +- 0.03, outside 1 +- 0.01. The READ of where the level's weight sits (pairContent: per member, the weight
//    off span(z, T(p) z), the moving pair's span at every mixer angle, so it is the same reading at every string length):
//    E-SPN-0147's 0.31 off the singlet slot pattern counts D's own (K . r) component, which is moving; the weight on flat
//    members is only evanescent (no flat channel is open), predicted under 0.1 per member.
//
// PREDICTED: I0 to I6 hold; W1 FAILS for both pieces (A on the F- clause alone: 4 states at pi at rest; B on gamma, R and
// the F- clause); W2 holds; W3 holds its level, isotropic, and FAILS on R; W4 FAILS; W5 holds (bit for bit); C1 and C2
// hold. Verdict fail, as the theorem says.
//
// GATES, fixed before the gate run.
//  W1 ONE BODY, per piece (A read off the rule, B the float model: the rule's no-piece matrix times the rank-one), at the
//     massive point (u0 = w^2, m0 = pi/6) and the massless (u = -1): (a) |gamma| / c* <= 1e-9 along the axis, face, body
//     and generic directions (masslessPair, kappa 0.01, the massless multiplet at pi); (b) the top Hellmann-Feynman
//     speed over every band, over 4,096 Weyl momenta and 20 radial ones (|K| 1e-3 to 1 on the four directions), is at
//     most c* (1 + 1e-6) at both points; (c) the singlet's m equals pi/6 to 1e-9 and |R - tan(m)/m| <= 1e-9 along the
//     four directions (R = c*^2 / c^2 from singletKinematics, the partner the multiplet at pi); (d) F- MOVED: at K = 0
//     exactly one state (D) sits at pi (to 1e-9). A piece passes W1 when (a) to (d) hold; W1 holds when a piece passes.
//  W2 THE VACUUM IS INERT, K NEVER FIRES: the exact rule with A (oddPhasedBeat) on the empty box (sides 4 and 8) and the
//     love sea (side 4), 128 beats, at u(0), u(1), u(10): one branch equal to the vacuum with amplitude (ringScale
//     oddScale)^cells (empty) or (F 12 num^8)^cells (sea), no charge, and the collision moves no value.
//  W3 THE E-SPN-0147 COMPOSITE WITH A ON (its point, ball 15, its Z1 filter procedure and start): the hold witness H
//     (fixed here, replacing the tail clause that misread a closed channel's shoulder): over 256 beats from the level
//     the weight within string length 14 >= 1 - 1e-3 at every beat, the fidelity >= 1 - 1e-3 at every even beat, the
//     weight absorbed at the ball's edge <= 1e-9 in all, and the level's two outermost shells w(14) + w(15) <= 1e-6;
//     AND isotropic: the K^2 coefficient (E-SPN-0147's Z2: K = 0.04 u and 0.02 u, Richardson, filter S 64) along the four
//     directions within 1e-6 of the axis's (relative); AND |R - 1| <= 0.01.
//  W4 LIGHTER MEMBERS BIND: at m0 = 0.190126 (u = ringUnit(-1, 4)) with A on, the mass string of the same step (2 sigma
//     a link) capped at 14 (the last cap under m = pi/2), the level from W3's procedure at E-SPN-0147's NR prediction
//     for this point holds by H.
//  W5 CONTROL, THE PIECE OFF REPRODUCES E-SPN-0147 BIT FOR BIT: with no piece, the same procedure on the same ball and
//     thread count gives eps === 2.265323205134809, |lambda2| === 1.0000000000126374 and singlet share ===
//     0.6861710791962495 (E-SPN-0147's recorded floats).
// INSTRUMENT (a failure makes the verdict partial). I0 the band-sum rule on every dock read here (the base, A, B and the
//  R1 variants, massive and massless): |zone mean of tr U| <= 1e-12 and |zone mean of the eigenvalue sum| <= 1e-10 on a
//  4^4 grid. I1 12 Pi8 is an integer matrix with (12 Pi8)^2 = 12 (12 Pi8), trace 96, (12 Pi8) R = 0, (12 Pi8) 1 = 0, X
//  (12 Pi8) = (12 Pi8) X = -(12 Pi8) and g (12 Pi8) g^-1 = 12 Pi8 for all 1,152 elements of W(F4), exactly; v has norm
//  one exactly; and at every V = 0 .. 10 the rule's one-vibe matrix with A (love and fear, both parities) equals the
//  covariant model X (e^(i theta(V)) Pi1 + Pi2 + Pi9 + Pi4 + v Pi8) to 1e-12. I2 the contact maps with A are unitary on
//  the 576 live states to 1e-12 and equal the no-piece maps (which the runs use) to 1e-15. I3 one beat of the rule with A
//  on the side-4 empty box against the meson beat with A, from a fixed subset of the V 0 and V 1 starts (every 25th live
//  contact state and every 12th slot pair), both parities: 1e-12, every division exact, no stray branch. I4 the threaded
//  beat with A equals the one-thread beat (5-ball, K = (0.3, -0.1, 0.2, 0.05), 4 beats): entries 1e-13, sums 1e-12. I5 the
//  pairContent reading: a z (x) z state gives 0 off span on both members to 1e-12, and Parseval to 1e-9 (set from the smoke's 2.3e-11, a float
//  sum of 576 x 2^20 squares, before the gate run).
// CONTROLS (a failure makes the verdict partial). C1 H can fail: E-SPN-0146's phase-string level (no mass string, no
//  piece: start exp(-(V/2.5)^1.5), S 256 at its predicted phase, S 128 at the read phase) fails H. C2 the flat reading
//  can see a flat off {0, pi}: the covariant piece e^(i alpha) on Pi8 and on Pi2 (at u0) has a flat band at least 1e-3
//  from both 0 and pi on the 64-momentum sample (probe 2).
// READ, gating nothing: R1 the covariant table (Pi2 alpha, Pi9 0.2, Pi4 0.2, Pi8 +-alpha): flats, m, R - tan m / m,
//  gamma against cot((pi + phi9 - phi4) / 2) / 8, top speeds. R2 pairContent of the W5 level and the W3 level. R3 W4's
//  point with the piece OFF.
// Verdict: partial if the instrument or a control fails; pass if W1 to W5 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/flip-probe1.log: every candidate keeps the zone
//  mean of the eigenvalue sum at 1e-16; the rank-one on y at five angles leaves 10 + 10 flats and changes S, D at every
//  momentum; phases on Pi8, Pi4, Pi2, Pi9 turn the moved states dispersive, never flat at a new phase, except (probe 2)
//  the pair (Pi8 alpha, Pi2 alpha), which holds one flat at -2.4746. tmp/flip-probe2.log: the covariant table (R1's
//  prediction: R kept by every variant, gamma 0 unless phi9 != phi4, -0.0722 and +0.0722 at Pi9 and Pi4 pi/3, -0.0125
//  and +0.0125 at 0.2; top speed over 1,024 momenta 1.43 and 1.70 c* at Pi8 2 pi/3 and pi, 0.75 and 0.74 c* at +-alpha).
//  tmp/flip-probe3.log: the channel census of point 3 (Pi8 +0.2 and +alpha cross the level, -alpha keeps 0.135, -pi/3
//  6.5e-4). tmp/flip-probe4.log: A and B one-body over 4,096 momenta (A: R - tan m / m under 1.1e-12, gamma / c* under
//  3.5e-11, top 0.738 and 0.989 c*; B: c0 0.707, 0.553, 0.577, 0.768 c*, gamma / c* -0.21 to -0.35, R off by 0.29 to
//  0.59). tmp/flip-smoke.log: the rule's matrix with A against the covariant model (1.1e-16); 30 box starts, both
//  parities, worst 1.2e-16 (5.5 s a rule beat, which set I3's subset), and the model with the piece OFF against the rule
//  with it ON differs on 40 of 60 (worst 0.40); the vacuum exact on side 4, empty and sea; the calibration state off
//  span -5.4e-16 on both members, Parseval 2.3e-11 (which set I5's Parseval tolerance); the gate ball holds 231,361
//  sites; one pairContent takes 250 s. tmp/flip-vac.log: the side-8 vacuum with A at 0.02 to 0.09 s a beat.
//
// FIRST RUN (tmp/flip-exp-run1.log, 7,919 s, 12 threads): FAIL on W1, W3 (R) and W4, as predicted. The instrument and
//  both controls hold; W2 and W5 hold. No gate moved and none was rerun. Two predictions were wrong (the level's eps and
//  R under A), and the reading that motivated (b) is refuted (R2).
//  - W1 FAILS for both pieces. A passes (a) to (c) and fails (d) alone: at rest 4 states at pi (D and the three Pi4
//    states, as derived), 8 at 2.474646 = pi - alpha, 11 at 0, S at -2.094395; m 0.523598776, R - tan m/m under 3.1e-12
//    in four directions, gamma / c* under 3.6e-11, top speed 0.737944 c* (massive) and 0.99999994 c* (massless, reached
//    at |K| 1e-3), flats 3 at pi and 3 at 0. B fails (a), (c) and (d): 11 at pi, c0 0.707, 0.553, 0.577, 0.768 c*
//    (anisotropic), gamma / c* -0.21 to -0.35, R off tan m/m by 0.29 to 0.59; its speed holds (0.717 and 0.980 c*).
//  - I0: the band sum and the trace average to under 7e-16 on every dock read (base, A, B and the five R1 variants).
//  - R1, read: gamma / c* at Pi9 0.2 and Pi4 0.2 is -1.774e-2 and +1.774e-2, the derived cot((pi + phi9 - phi4)/2)/8 to
//    four digits; Pi2 and Pi8 keep gamma at 1e-11 and R at 1e-9; Pi9 and Pi4 break the speed (1.0038 c* massless).
//  - W2 holds: sides 4 and 8 empty and the side-4 love sea at u(0), u(1), u(10), 128 beats, one branch, exact.
//  - W5 holds BIT FOR BIT: eps 2.265323205134809, |lambda2| 1.0000000000126374, share 0.6861710791962495, and the hold
//    (window 1.000000, absorbed 1.8e-18, edge 1.6e-16), the same floats E-SPN-0147 recorded.
//  - W3 FAILS ON R ALONE. With A on the level holds under H (window and fidelity 1 - 3e-11 and 4e-11, absorbed 9.0e-11,
//    edge 2.2e-11), isotropic to 5.5e-9, at eps 2.218440 (predicted within 1e-3 of 2.265323: WRONG by 0.047, lower), R
//    1.39567 (predicted 1.57 +- 0.03: WRONG, 0.17 lower), K^2 coefficient 0.080744 against 0.070376 without the piece.
//    Its tail is longer (w(15) 2.3e-12 against 2.2e-18): the moved octet's channel is nearer the level than without it.
//  - R2 REFUTES THE READING THAT MOTIVATED (b): E-SPN-0147's level has 0.00156 of each member off span(z, T(p) z), the
//    moving pair's span; with A, 0.00732. E-SPN-0147's 31% off the singlet slot pattern is D's own (K . r) component,
//    which moves, not frozen flat weight. So R = 1.568 is not a flat-admixture effect, and a piece that moved F- could
//    not have fixed it by removing flat weight: there is almost none. A still lowers R by 0.17 with 0.6% of the weight
//    off the span, so R is set by how the moving pair's own content responds to K, not by a frozen fraction.
//  - W4 FAILS: at m0 = 0.190126 (window (2.7613, 2.4746), empty) the filter lands on no level (eps -1.236, |lambda2|
//    0.991, residual 1.7e-2), keeps 0.095 of the window, absorbs 0.90; R3 with the piece off also finds none (fidelity
//    0.027, residual 2.2e-2). No lighter member binds, with or without A, as derived.
//  - C1 holds: E-SPN-0146's level fails H (absorbed 4.33e-3, fidelity 0.979730, its recorded numbers). C2 holds: the
//    (Pi8 alpha, Pi2 alpha) piece has a flat at -2.474646. I1 to I5 hold (I3: 144 box beats, worst 1.2e-16; I4 entries 0).
// NEXT. (b) as posed is closed by theorem, and its motive is gone: the flat content of the level is 0.16%. The R excess
//  lives in the moving pair itself, so the next question is R's own model: why the composite's K^2 coefficient (0.0704,
//  0.0807 with A) sits below the members' 1 / (2 tan m) weighting, and why a piece that acts on the singlet only at K^6
//  moves it by 15%. The heavy-member bound is structural for any covariant gamma = 0 dock piece (point 4); lighter
//  members need a piece outside the band-sum rule's reach: a two-beat schedule, whose cycle trace keeps the constant
//  term sum_d (P2)_(d,-d) (P1)_(-d,d), or a link-level piece.
//
// Depth L1 (the band-sum rule and the covariance argument are mathematics) and L2 (the band kinematics of a coined
// quantum walk and a two-body walk with a position-dependent mass, read off the rule). DETERMINISM: no random numbers;
// Weyl momenta, grids, placed starts. NOTHING MOVES: the pieces hand values between slots of one dock, the stream takes
// each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { rootIndex } from '@/code/measure/crossing-lines'
import { centerOf } from '@/code/measure/wall-reading'
import {
  DOCK_ROOTS,
  multipletsOf,
  wrap,
  type CMatrix,
  type Multiplet,
} from '@/code/measure/dock-mixer'
import {
  fastestBand,
  masslessPair,
  singletKinematics,
  singletLevel,
  weylMomenta,
} from '@/code/measure/singlet-kinematics'
import { weylF4 } from '@/code/measure/covariant-coin'
import { d4Ball, flatBoxTables } from '@/code/measure/swap-sector'
import {
  bandSumMean,
  covariantDock,
  covariantProjectors,
  flatBands,
  lineSideVector,
  pairContent,
  traceMean,
  withRankOne,
} from '@/code/measure/odd-phase'
import { shareSpace, threadEngine } from '@/code/measure/meson-pool'
import { ODD_OCTET_12 } from '@/code/rule/odd-phase'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  boxCheck,
  boxStarts,
  buildLevel,
  contactDockExact,
  contactUnitarity,
  CONTACT_STATES,
  levelVelocity,
  linearWell,
  massShapes,
  massStringPrediction,
  massUnits,
  mesonSpace,
  mesonStart,
  newFlow,
  overEmpty,
  ringUnit,
  serialEngine,
  setMassString,
  setMomentum,
  setOddPhase,
  setString,
  singletShare,
  sparseOf,
  STORE_BASE,
  storeWeight,
  stringKappa,
  stringProfile,
  unitAngle,
  unitNormExact,
  vacuumRun,
  vibeDockExact,
  watchLevel,
  type MesonEngine,
  type MesonState,
} from '@/code/measure/swap-string'

const C_STAR = Math.SQRT2 / 2
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRECTIONS: readonly { name: string; u: number[] }[] = [
  { name: 'axis', u: [1, 0, 0, 0] },
  { name: 'face', u: [s2, s2, 0, 0] },
  { name: 'body', u: [s3, s3, s3, 0] },
  { name: 'generic', u: GENERIC },
]
// E-SPN-0147's point (the mixer w^2, the step +2 sigma a link, cap 10), the massless unit -1, the odd-octet unit
// e^(-i alpha), the lighter point and its cap, E-SPN-0146's phase string
const MIXER: readonly [number, number] = [0, 4]
const STEP: readonly [number, number] = [-6, 4]
const CAP = 10
const MASSLESS: readonly [number, number] = [0, 3]
const ODD: readonly [number, number] = [-1, 0]
const LIGHT: readonly [number, number] = [-1, 4]
const LIGHT_CAP = 14
const STRING: readonly [number, number] = [3, 4]

export type OddPhasePlan = {
  ball: number
  window: number
  sCoarse: number
  sFirst: number
  sSecond: number
  sMove: number
  holdBeats: number
  threads: number
  vacuumBeats: number
  vacuumSides: readonly number[]
  momenta: number
  liveStride: number
  pairStride: number
  box: number
  light: boolean
}

export const GATE_PLAN: OddPhasePlan = {
  ball: 15,
  window: 14,
  sCoarse: 64,
  sFirst: 256,
  sSecond: 128,
  sMove: 64,
  holdBeats: 256,
  threads: 12,
  vacuumBeats: 128,
  vacuumSides: [4, 8],
  momenta: 4096,
  liveStride: 25,
  pairStride: 12,
  box: 32,
  light: true,
}

// E-SPN-0147's recorded floats (tmp/mstr-exp-run1.log)
const RECORDED_EPS = 2.265323205134809
const RECORDED_LAMBDA = 1.0000000000126374
const RECORDED_SHARE = 0.6861710791962495
const ELL = 2
const ELL_PHASE = 2.5
const HOLD = 1e-3
const ABSORB = 1e-9
const EDGE = 1e-6
const KAPPA = 0.04
const ISOTROPY = 1e-6
const R_TOLERANCE = 0.01
const GAMMA_TOLERANCE = 1e-9
const SPEED_TOLERANCE = 1e-6
const R_EXACT = 1e-9
const LEVEL_TOLERANCE = 1e-9
const PAIR_KAPPA = 0.01
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const FLAT_SAMPLE = 64
const FLAT_TOLERANCE = 1e-8
const FLAT_OFF = 1e-3
const GRID = 4
const GRID_OFFSET = [0.1, 0.2, 0.3, 0.4]
const TRACE_TOLERANCE = 1e-12
const SUM_TOLERANCE = 1e-10
const MATRIX_TOLERANCE = 1e-12
const CONTACT_SAME = 1e-15
const ENTRY_TOLERANCE = 1e-12
const THREAD_TOLERANCE = 1e-13
const THREAD_SUMS = 1e-12
const CALIBRATION = 1e-12
// Parseval sums 576 x 2^20 squares in float: the smoke read 2.3e-11, so this tolerance was set at 1e-9 before the run
const PARSEVAL = 1e-9
const BOX_SIDE = 4
const CHECK_BALL = 4
const POOL = 3
const KAPPA_GRID = 24
const WELL_L = 24
const WELL_N = 24000
const RADIAL_L = 22
const RADIAL_N = 20000
const K_THREAD = [0.3, -0.1, 0.2, 0.05]
const THREAD_BALL = 5
const THREAD_BEATS = 4

const flag = (b: boolean): number => (b ? 1 : 0)
const R = DOCK_ROOTS

export default experiment({
  id: 'spin/swap-odd-phase',
  code: 'E-SPN-0148',
  title:
    'no dock-local piece lifts the swap coin F- multiplet off pi alone, and the frozen flat weight it was meant to remove is not there, fail (W1, W3 on R, W4): over the zone the 24 bands of any dock-local beat sum to zero (the trace has no constant Fourier term), so with S, D and F+ kept F- is pinned at pi for every piece, covariant or not; under W(F4) covariance D rests in the irreducible Pi4, pinning three F- to it, gamma = cot((pi + phi9 - phi4)/2)/8 (read to four digits), and the D + Pi9 channel keeps the closure floor at pi - 2 m0; the nearest piece, the odd-octet phase e^(-i alpha) on Pi8 (exact in Z[w][1/42], Pauli-blocked, vacuum exact), keeps R = tan m/m to 3e-12, gamma to 4e-11 and every speed under c*, moves 8 F- to pi - alpha, and on the E-SPN-0147 meson holds a level at eps 2.218440, isotropic to 5.5e-9, with R 1.396 (from 1.568); the E-SPN-0147 level carries only 0.16% of each member off the moving pair span, so its R excess is not flat admixture; below arctan(1/3) no level forms with or without the piece; the piece off reproduces E-SPN-0147 bit for bit',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return swapOddPhaseRun(GATE_PLAN)
  },
})

// one piece's one-body reading at the massive and the massless point
type OneBody = {
  name: string
  restAtPi: number
  restPhases: string
  m: number
  tanRatio: number
  R: number[]
  gamma: number[]
  c0: number[]
  top: number
  topMassless: number
  flats: { phase: number; count: number }[]
  trace: number
  sum: number
  traceZ: number
  sumZ: number
  pass: { a: boolean; b: boolean; c: boolean; d: boolean; all: boolean }
}

// the K = 0 multiplet holding D's rest state (at pi + phi4: pi for every piece but R1's Pi4 row)
const atRestOf = (
  ms: readonly Multiplet[],
  dRest: number,
): Multiplet | undefined =>
  ms.find(x => Math.abs(wrap(x.center - dRest)) <= LEVEL_TOLERANCE)

function oneBody(
  name: string,
  P: CMatrix,
  Pz: CMatrix,
  m0: number,
  momenta: readonly (readonly number[])[],
  dRest = Math.PI,
): OneBody {
  const ms = multipletsOf(P, R)
  const atPi = atRestOf(ms, dRest)
  const restAtPi = atPi ? atPi.size : 0
  const lv = singletLevel(P, R, restAtPi)
  const Rs = DIRECTIONS.map(
    d =>
      (C_STAR * C_STAR) / singletKinematics(P, R, lv, d.u, SCALES).c2,
  )
  const tanRatio = Math.tan(lv.m) / lv.m
  const msZ = multipletsOf(Pz, R)
  const atPiZ = atRestOf(msZ, dRest)
  const pairs = DIRECTIONS.map(d =>
    masslessPair(Pz, R, atPiZ ? atPiZ.size : -1, d.u, PAIR_KAPPA),
  )
  const top = fastestBand(P, R, momenta).speed / C_STAR
  const topMassless = fastestBand(Pz, R, momenta).speed / C_STAR
  const flats = flatBands(
    P,
    momenta.slice(0, FLAT_SAMPLE),
    FLAT_TOLERANCE,
  )
  const t = traceMean(P, GRID, GRID_OFFSET)
  const s = bandSumMean(P, GRID, GRID_OFFSET)
  const tz = traceMean(Pz, GRID, GRID_OFFSET)
  const sz = bandSumMean(Pz, GRID, GRID_OFFSET)
  const gamma = pairs.map(x => x.gamma / C_STAR)
  const a = gamma.every(g => Math.abs(g) <= GAMMA_TOLERANCE)
  const b =
    top <= 1 + SPEED_TOLERANCE && topMassless <= 1 + SPEED_TOLERANCE
  const c =
    Math.abs(lv.m - m0) <= LEVEL_TOLERANCE &&
    Rs.every(r => Math.abs(r - tanRatio) <= R_EXACT)
  const d = restAtPi === 1

  return {
    name,
    restAtPi,
    restPhases: ms
      .map(x => `${x.center.toFixed(6)}x${x.size}`)
      .join(' '),
    m: lv.m,
    tanRatio,
    R: Rs,
    gamma,
    c0: pairs.map(x => x.c0 / C_STAR),
    top,
    topMassless,
    flats,
    trace: Math.hypot(...t),
    sum: Math.hypot(...s),
    traceZ: Math.hypot(...tz),
    sumZ: Math.hypot(...sz),
    pass: { a, b, c, d, all: a && b && c && d },
  }
}

// the hold witness H
type Held = {
  eps: number
  lambda: number
  residual: number
  window: number
  fidelity: number
  absorbed: number
  edge: number
  share: number
  stored: number
  profile: number[]
  holds: boolean
}

export function swapOddPhaseRun(plan: OddPhasePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const p = covariantProjectors()
  const u0 = ringUnit(MIXER[0], MIXER[1])
  const uz = ringUnit(MASSLESS[0], MASSLESS[1])
  const v = ringUnit(ODD[0], ODD[1])
  const alphaV = unitAngle(v)
  const theta0 = unitAngle(u0)
  const m0 = Math.PI / 6
  const radial = DIRECTIONS.flatMap(d =>
    RADII.map(r => d.u.map(x => x * r)),
  )
  const momenta = [...weylMomenta(plan.momenta), ...radial]

  // ---------------- I1: Pi8 exactly, the unit, the rule's matrices with A against the covariant model ----------------
  const Q = ODD_OCTET_12
  const qq = (i: number, j: number): number => (Q[i] as number[])[j]!

  let pi8Exact = true

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      let sq = 0

      for (let k = 0; k < 24; k++) {
        sq += qq(i, k) * qq(k, j)
      }

      if (sq !== 12 * qq(i, j)) {
        pi8Exact = false
      }

      if (
        qq(OPPOSITE[i]!, j) !== -qq(i, j) ||
        qq(i, OPPOSITE[j]!) !== -qq(i, j)
      ) {
        pi8Exact = false
      }
    }

    let row = 0

    for (let j = 0; j < 24; j++) {
      row += qq(i, j)
    }

    if (row !== 0) {
      pi8Exact = false
    }

    for (let k = 0; k < 4; k++) {
      let r = 0

      for (let j = 0; j < 24; j++) {
        r += qq(i, j) * (R[j] as number[])[k]!
      }

      if (r !== 0) {
        pi8Exact = false
      }
    }
  }

  const traceQ = Q.reduce((s, row, i) => s + row[i]!, 0)
  const group = weylF4()
  const covariant = group.every(g =>
    Q.every((row, i) => row.every((x, j) => qq(g[i]!, g[j]!) === x)),
  )
  const units = massUnits(MIXER, STEP, CAP, Math.max(plan.ball, CAP))
  const perAngle = units.slice(0, CAP + 1).map((u, V) => {
    const M = covariantDock(p, [unitAngle(u), 0, 0, 0, alphaV])

    let worst = 0

    for (const [vibe, beat] of [
      [1, 0],
      [1, 1],
      [-1, 0],
      [-1, 1],
    ] as const) {
      const A = overEmpty(vibeDockExact(vibe, beat, u, v), u, v)

      for (let i = 0; i < 576; i++) {
        worst = Math.max(
          worst,
          Math.hypot(A.re[i]! - M.re[i]!, A.im[i]! - M.im[i]!),
        )
      }
    }

    return { V, worst }
  })
  const I1 =
    pi8Exact &&
    traceQ === 96 &&
    covariant &&
    group.length === 1152 &&
    unitNormExact(v) &&
    perAngle.every(x => x.worst <= MATRIX_TOLERANCE)

  log('I1')

  // ---------------- W1 and I0: the one-body readings ----------------
  const A0 = overEmpty(vibeDockExact(1, 0, u0), u0)
  const Az = overEmpty(vibeDockExact(1, 0, uz), uz)
  const PA = overEmpty(vibeDockExact(1, 0, u0, v), u0, v)
  const PAz = overEmpty(vibeDockExact(1, 0, uz, v), uz, v)
  const y = lineSideVector()
  const base = oneBody('base', A0, Az, m0, momenta)

  log('W1 base')

  const pieceA = oneBody('A odd octet', PA, PAz, m0, momenta)

  log('W1 A')

  const pieceB = oneBody(
    'B rank-one on y',
    withRankOne(A0, y, alphaV),
    withRankOne(Az, y, alphaV),
    m0,
    momenta,
  )

  log('W1 B')

  const W1 = pieceA.pass.all || pieceB.pass.all

  // R1: the covariant table, and C2
  const variants: {
    name: string
    phases: number[]
    massless: number[]
  }[] = [
    {
      name: 'Pi2 alpha',
      phases: [theta0, -alphaV, 0, 0, 0],
      massless: [Math.PI, -alphaV, 0, 0, 0],
    },
    {
      name: 'Pi9 0.2',
      phases: [theta0, 0, 0.2, 0, 0],
      massless: [Math.PI, 0, 0.2, 0, 0],
    },
    {
      name: 'Pi4 0.2',
      phases: [theta0 + 0.2, 0, 0, 0.2, 0],
      massless: [Math.PI + 0.2, 0, 0, 0.2, 0],
    },
    {
      name: 'Pi8 +alpha',
      phases: [theta0, 0, 0, 0, -alphaV],
      massless: [Math.PI, 0, 0, 0, -alphaV],
    },
    {
      name: 'Pi8 alpha Pi2 alpha',
      phases: [theta0, -alphaV, 0, 0, -alphaV],
      massless: [Math.PI, -alphaV, 0, 0, -alphaV],
    },
  ]
  const variantMomenta = weylMomenta(1024)
  const table = variants.map(x => {
    const r = oneBody(
      x.name,
      covariantDock(p, x.phases),
      covariantDock(p, x.massless),
      m0,
      variantMomenta,
      Math.PI + x.phases[3]!,
    )
    const gammaPredicted =
      1 /
      Math.tan((Math.PI + x.phases[2]! - x.phases[3]!) / 2) /
      8 /
      C_STAR

    return { ...r, gammaPredicted }
  })
  const c2Row = table[table.length - 1]!
  const C2 = c2Row.flats.some(
    f =>
      Math.abs(wrap(f.phase)) >= FLAT_OFF &&
      Math.abs(wrap(f.phase - Math.PI)) >= FLAT_OFF,
  )
  const I0 = [base, pieceA, pieceB, ...table].every(
    x =>
      x.trace <= TRACE_TOLERANCE &&
      x.traceZ <= TRACE_TOLERANCE &&
      x.sum <= SUM_TOLERANCE &&
      x.sumZ <= SUM_TOLERANCE,
  )

  log('R1 C2 I0')

  // ---------------- I2: the contact maps with A against the no-piece maps (the runs use the no-piece maps) ----------------
  const live = [...Array(CONTACT_STATES).keys()].filter(
    i => i >= STORE_BASE || Math.floor(i / 24) !== i % 24,
  )
  const contactPlain = [0, 1].map(b =>
    overEmpty(contactDockExact(b, u0), u0),
  )
  const contactOdd = [0, 1].map(b =>
    overEmpty(contactDockExact(b, u0, v), u0, v),
  )
  const unitarity = Math.max(
    ...contactOdd.map(M => contactUnitarity(M, live)),
  )

  let contactGap = 0

  contactOdd.forEach((M, b) => {
    const P0 = contactPlain[b]!

    for (let i = 0; i < M.re.length; i++) {
      contactGap = Math.max(
        contactGap,
        Math.hypot(M.re[i]! - P0.re[i]!, M.im[i]! - P0.im[i]!),
      )
    }
  })

  const contact: [
    ReturnType<typeof sparseOf>,
    ReturnType<typeof sparseOf>,
  ] = [sparseOf(contactPlain[0]!), sparseOf(contactPlain[1]!)]
  const I2 = unitarity <= MATRIX_TOLERANCE && contactGap <= CONTACT_SAME

  log('I2')

  // ---------------- I3: the rule with A on the side-4 box against the meson beat with A ----------------
  const shapes = massShapes(units)
  const shape0 = shapes[0]!
  const box = flatBoxTables(BOX_SIDE)
  const X = centerOf(BOX_SIDE)
  const Xf1 = Math.floor(
    box.target[X * 24 + rootIndex([1, 1, 0, 0])]! / 24,
  )
  const checkSpace = mesonSpace(
    d4Ball(CHECK_BALL),
    shape0,
    contact,
    0,
    [0, 0, 0, 0],
  )

  setMassString(checkSpace, shapes)
  setOddPhase(checkSpace, v)

  const liveSubset = live.filter((_, i) => i % plan.liveStride === 0)
  const pairSubset = boxStarts([], X, Xf1, [-1, -1, 0, 0]).filter(
    (_, i) => i % plan.pairStride === 0,
  )
  const unitOf = (V: number): (typeof units)[number] =>
    units[Math.min(V, units.length - 1)]!
  const box0 = boxCheck(
    box,
    boxStarts(liveSubset, X, X, [0, 0, 0, 0]).slice(
      0,
      liveSubset.length,
    ),
    checkSpace,
    unitOf,
    ENTRY_TOLERANCE,
    v,
  )
  const box1 = boxCheck(
    box,
    pairSubset,
    checkSpace,
    unitOf,
    ENTRY_TOLERANCE,
    v,
  )
  const I3 =
    box0.differ + box1.differ === 0 &&
    box0.inexact + box1.inexact === 0 &&
    box0.stray + box1.stray === 0

  log('I3')

  // ---------------- I4: threaded against one thread, A on ----------------
  let threadGap = 0
  let threadSums = 0

  {
    const raw = mesonSpace(
      d4Ball(THREAD_BALL),
      shape0,
      contact,
      0,
      K_THREAD,
    )

    setMassString(raw, shapes)
    setOddPhase(raw, v)

    const sp = shareSpace(raw)
    const ser = serialEngine(sp)
    const thr = threadEngine(sp, plan.threads, POOL)
    const a = ser.borrow()
    const b = ser.borrow()
    const c = thr.borrow()
    const d = thr.borrow()
    const g = 0.6180339887498949

    for (let k = 0; k < a.re.length; k++) {
      a.re[k] = ((k * g) % 1) - 0.5
      a.im[k] = ((k * g * g) % 1) - 0.5
    }

    c.re.set(a.re)
    c.im.set(a.im)

    for (let t = 0; t < THREAD_BEATS; t++) {
      const f1 = newFlow()
      const f2 = newFlow()
      const l1 = ser.beat(a, b, t, f1)
      const l2 = thr.beat(c, d, t, f2)

      for (let k = 0; k < b.re.length; k++) {
        threadGap = Math.max(
          threadGap,
          Math.abs(b.re[k]! - d.re[k]!),
          Math.abs(b.im[k]! - d.im[k]!),
        )
      }

      threadSums = Math.max(
        threadSums,
        Math.abs(l1 - l2) / Math.max(1, l1),
        Math.abs(f1.weight - f2.weight) / f1.weight,
        ...[0, 1, 2, 3].map(
          k => Math.abs(f1.v[k]! - f2.v[k]!) / f1.weight,
        ),
      )
      a.re.set(b.re)
      a.im.set(b.im)
      c.re.set(d.re)
      c.im.set(d.im)
    }

    thr.close()
  }

  const I4 = threadGap <= THREAD_TOLERANCE && threadSums <= THREAD_SUMS

  log('I4')

  // ---------------- W2: the vacuum under the exact rule with A ----------------
  const vacuum = [0, 1, CAP].flatMap(V =>
    [
      ...plan.vacuumSides.map(side => ({ side, sea: 0 })),
      { side: BOX_SIDE, sea: 1 },
    ].map(({ side, sea }) => ({
      V,
      ...vacuumRun(units[V]!, side, sea, plan.vacuumBeats, v),
    })),
  )
  const W2 = vacuum.every(
    x => x.exact && x.permutes === 0 && x.charged === 0,
  )

  log('W2')

  // ---------------- the gate ball ----------------
  const ball = d4Ball(plan.ball)

  // I5: the momentum-space reading on a calibration state (z (x) z at every site, a Gaussian in y)
  let calibration = { loveOff: NaN, fearOff: NaN, parseval: NaN }

  {
    const s: MesonState = {
      re: new Float64Array(ball.points.length * 576 + 24),
      im: new Float64Array(ball.points.length * 576 + 24),
    }
    const origin = ball.index.get('0,0,0,0')!

    let w = 0

    ball.points.forEach((q, i) => {
      if (i === origin) {
        return
      }

      const a = Math.exp(-q.reduce((t, x) => t + x * x, 0) / 8)

      for (let e = 0; e < 576; e++) {
        s.re[i * 576 + e] = a
      }

      w += 576 * a * a
    })

    for (let k = 0; k < s.re.length; k++) {
      s.re[k] = s.re[k]! / Math.sqrt(w)
    }

    calibration = pairContent(ball, s, plan.box)
  }

  const I5 =
    Math.abs(calibration.loveOff) <= CALIBRATION &&
    Math.abs(calibration.fearOff) <= CALIBRATION &&
    calibration.parseval <= PARSEVAL

  log(`I5; ball ${plan.ball}: ${ball.points.length} sites`)

  const level1 = singletLevel(A0, R, 12)
  const mid = level1.midPhase
  const sign = level1.sign
  const phaseOf = (eps: number): number => wrap(2 * mid - sign * eps)
  const epsOf = (phase: number): number => sign * -wrap(phase - 2 * mid)
  const kap = stringKappa(KAPPA_GRID)
  const tau = unitAngle(ringUnit(STEP[0], STEP[1]))
  const pred = massStringPrediction(
    level1.m,
    tau,
    CAP,
    kap.mean,
    RADIAL_L,
    RADIAL_N,
  )
  const space = shareSpace(
    mesonSpace(ball, shape0, contact, 0, [0, 0, 0, 0]),
  )

  setMassString(space, shapes)

  const engine: MesonEngine = threadEngine(space, plan.threads, POOL)

  const hold = (
    eng: MesonEngine,
    lv: {
      v: MesonState
      read: {
        phase: number
        lambda2: [number, number]
        residual: number
      }
    },
    eps: (phase: number) => number,
  ): Held => {
    const h = watchLevel(eng, lv.v, plan.holdBeats, plan.window)
    const profile = stringProfile(ball, lv.v)
    const n = profile.length
    const edge = profile[n - 1]! + profile[n - 2]!

    return {
      eps: eps(lv.read.phase),
      lambda: Math.hypot(...lv.read.lambda2),
      residual: lv.read.residual,
      window: h.leastWindow,
      fidelity: h.leastFidelity,
      absorbed: h.absorbed,
      edge,
      share: singletShare(ball, lv.v),
      stored: storeWeight(ball, lv.v),
      profile,
      holds:
        h.leastWindow >= 1 - HOLD &&
        h.leastFidelity >= 1 - HOLD &&
        h.absorbed <= ABSORB &&
        edge <= EDGE,
    }
  }

  const procedure = (
    eng: MesonEngine,
    predictedPhase: number,
  ): { v: MesonState; read: ReturnType<typeof buildLevel>['read'] } => {
    const start = mesonStart(ball, ELL)
    const coarse = buildLevel(
      eng,
      start,
      predictedPhase,
      plan.sCoarse,
      1,
    )
    const first = buildLevel(
      eng,
      coarse.v,
      coarse.read.phase,
      plan.sFirst,
      1,
    )

    return buildLevel(eng, first.v, first.read.phase, plan.sSecond, 1)
  }

  // ---------------- W5: the piece off reproduces E-SPN-0147 ----------------
  const off = procedure(engine, phaseOf(pred.Erest))
  const offHeld = hold(engine, off, epsOf)
  const W5 =
    offHeld.eps === RECORDED_EPS &&
    offHeld.lambda === RECORDED_LAMBDA &&
    offHeld.share === RECORDED_SHARE

  log('W5')

  const offContent = pairContent(ball, off.v, plan.box)

  log('R2 off')

  // ---------------- W3: the E-SPN-0147 composite with A on ----------------
  setOddPhase(space, v)

  const on = procedure(engine, phaseOf(pred.Erest))
  const onHeld = hold(engine, on, epsOf)

  log('W3 hold')

  const energyAt = (
    K: readonly number[],
    from: MesonState,
    phase: number,
  ): number => {
    setMomentum(space, K)

    return epsOf(
      buildLevel(engine, from, phase, plan.sMove, 1).read.phase,
    )
  }

  const zero = energyAt([0, 0, 0, 0], on.v, on.read.phase)
  const dispersion = DIRECTIONS.map(d => {
    const d1 =
      energyAt(
        d.u.map(x => x * KAPPA),
        on.v,
        on.read.phase,
      ) - zero
    const d2 =
      energyAt(
        d.u.map(x => (x * KAPPA) / 2),
        on.v,
        on.read.phase,
      ) - zero

    log(`W3 ${d.name}`)

    return { name: d.name, a: (16 * d2 - d1) / (3 * KAPPA * KAPPA) }
  })

  setMomentum(space, [0, 0, 0, 0])

  const a0 = dispersion[0]!.a
  const isotropy = Math.max(
    ...dispersion.map(x => Math.abs(x.a / a0 - 1)),
  )
  const Rcomposite = (C_STAR * C_STAR) / (2 * a0 * onHeld.eps)
  const W3 =
    onHeld.holds &&
    isotropy <= ISOTROPY &&
    Math.abs(Rcomposite - 1) <= R_TOLERANCE
  const onVelocity = levelVelocity(engine, on.v)
  const onContent = pairContent(ball, on.v, plan.box)

  log('R2 on')

  // ---------------- C1: E-SPN-0146's phase-string level fails H ----------------
  const sigma = Math.abs(unitAngle(ringUnit(STRING[0], STRING[1])))

  setOddPhase(space, null)
  setMassString(space, [shape0])
  setString(space, sign * sigma)

  const eps4 = linearWell(WELL_L, WELL_N)
  const Fphase = sigma * kap.mean
  const predPhaseString =
    2 * level1.m +
    eps4 * Fphase * (1 / (2 * Math.tan(level1.m) * Fphase)) ** (1 / 3)

  let c1Held: Held

  {
    const s0 = mesonStart(ball, ELL_PHASE)
    const f = buildLevel(
      engine,
      s0,
      phaseOf(predPhaseString),
      plan.sFirst,
      1,
    )

    c1Held = hold(
      engine,
      buildLevel(engine, f.v, f.read.phase, plan.sSecond, 1),
      epsOf,
    )
  }

  const C1 = !c1Held.holds

  engine.close()
  log('C1')

  // ---------------- W4: the lighter point, A on (and R3, A off) ----------------
  const uL = ringUnit(LIGHT[0], LIGHT[1])
  const AL = overEmpty(vibeDockExact(1, 0, uL), uL)
  const levelL = singletLevel(AL, R, 12)
  const kmaxOf = (m: number): number =>
    Math.PI / 2 - m + Math.asin(Math.cos(m) / 3)
  const windowL = {
    floor: Math.PI - 2 * levelL.m,
    ceiling: 2 * Math.PI - 2 * levelL.m - 2 * kmaxOf(levelL.m),
  }
  const predL = massStringPrediction(
    levelL.m,
    tau,
    LIGHT_CAP,
    kap.mean,
    RADIAL_L,
    RADIAL_N,
  )

  let lightOn: Held | null = null
  let lightOff: Held | null = null

  const unitsL = massUnits(
    LIGHT,
    STEP,
    LIGHT_CAP,
    Math.max(plan.ball, LIGHT_CAP),
  )
  const capAngle = unitAngle(unitsL[LIGHT_CAP]!)
  const mCapL =
    (capAngle < 0 ? capAngle + 2 * Math.PI : capAngle) / 2 - Math.PI / 2

  if (plan.light) {
    const shapesL = massShapes(unitsL)
    const contactL: [
      ReturnType<typeof sparseOf>,
      ReturnType<typeof sparseOf>,
    ] = [
      sparseOf(overEmpty(contactDockExact(0, uL), uL)),
      sparseOf(overEmpty(contactDockExact(1, uL), uL)),
    ]
    const spaceL = shareSpace(
      mesonSpace(ball, shapesL[0]!, contactL, 0, [0, 0, 0, 0]),
    )

    setMassString(spaceL, shapesL)
    setOddPhase(spaceL, v)

    const engineL = threadEngine(spaceL, plan.threads, POOL)
    const phaseL = (eps: number): number =>
      wrap(2 * levelL.midPhase - levelL.sign * eps)
    const epsL = (phase: number): number =>
      levelL.sign * -wrap(phase - 2 * levelL.midPhase)

    lightOn = hold(
      engineL,
      procedure(engineL, phaseL(predL.Erest)),
      epsL,
    )
    log('W4')
    setOddPhase(spaceL, null)
    lightOff = hold(
      engineL,
      procedure(engineL, phaseL(predL.Erest)),
      epsL,
    )
    engineL.close()
    log('R3')
  }

  const W4 = lightOn?.holds ?? false
  const instrument = I0 && I1 && I2 && I3 && I4 && I5
  const controls = C1 && C2
  const status =
    !instrument || !controls
      ? 'partial'
      : W1 && W2 && W3 && W4 && W5
        ? 'pass'
        : 'fail'
  const bodyLine = (b: OneBody): string =>
    `${b.name}: rest ${b.restPhases} (${b.restAtPi} at pi); m ${b.m.toFixed(9)}, R - tan m/m ${b.R.map(r => (r - b.tanRatio).toExponential(2)).join(' ')}; massless c0 ${b.c0.map(x => x.toFixed(6)).join(' ')} c*, gamma/c* ${b.gamma.map(x => x.toExponential(2)).join(' ')}; top ${b.top.toFixed(6)} c*, massless ${b.topMassless.toFixed(6)} c*; flats ${b.flats.map(f => `${f.phase.toFixed(6)}x${f.count}`).join(' ') || 'none'}; band sum ${b.sum.toExponential(1)} / ${b.sumZ.toExponential(1)}, trace ${b.trace.toExponential(1)} / ${b.traceZ.toExponential(1)}; clauses a ${b.pass.a} b ${b.pass.b} c ${b.pass.c} d ${b.pass.d}`
  const heldLine = (h: Held | null): string =>
    h
      ? `eps ${h.eps.toFixed(6)}, |lambda2| ${h.lambda.toFixed(10)}, residual ${h.residual.toExponential(2)}, window ${h.window.toFixed(6)}, fidelity ${h.fidelity.toFixed(9)}, absorbed ${h.absorbed.toExponential(2)}, edge ${h.edge.toExponential(2)}, singlet share ${h.share.toFixed(4)}, stores ${h.stored.toExponential(2)}, holds ${h.holds}; profile ${h.profile.map(x => x.toExponential(1)).join(' ')}`
      : 'not run'
  const contentLine = (c: ReturnType<typeof pairContent>): string =>
    `off the moving span: love ${c.loveOff.toFixed(5)}, fear ${c.fearOff.toFixed(5)} (stores ${c.stores.toExponential(2)}, Parseval ${c.parseval.toExponential(1)})`

  return verdict({
    status,
    claim: `W1 ${W1} (A ${pieceA.pass.all}: ${pieceA.restAtPi} states at pi at rest; B ${pieceB.pass.all}: gamma ${pieceB.pass.a}, speed ${pieceB.pass.b}, R ${pieceB.pass.c}, F- ${pieceB.pass.d}); W2 ${W2}; W3 ${W3} (holds ${onHeld.holds} at eps ${onHeld.eps.toFixed(6)}, isotropy ${isotropy.toExponential(2)}, R ${Rcomposite.toFixed(5)}); W4 ${W4} (m0 ${levelL.m.toFixed(6)}, window (${windowL.floor.toFixed(4)}, ${windowL.ceiling.toFixed(4)}): ${heldLine(lightOn)}); W5 ${W5} (eps ${offHeld.eps}, |lambda2| ${offHeld.lambda}, share ${offHeld.share}); C1 ${C1} (E-SPN-0146's level: absorbed ${c1Held.absorbed.toExponential(2)}, fidelity ${c1Held.fidelity.toFixed(6)}); C2 ${C2}; R2 E-SPN-0147's level ${contentLine(offContent)}, with A ${contentLine(onContent)}`,
    metrics: {
      W1: flag(W1),
      W2: flag(W2),
      W3: flag(W3),
      W4: flag(W4),
      W5: flag(W5),
      instrument: flag(instrument),
      I0: flag(I0),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      I4: flag(I4),
      I5: flag(I5),
      C1: flag(C1),
      C2: flag(C2),
      alpha: -alphaV,
      restAtPiA: pieceA.restAtPi,
      restAtPiB: pieceB.restAtPi,
      topA: pieceA.top,
      topMasslessA: pieceA.topMassless,
      gammaMaxA: Math.max(...pieceA.gamma.map(Math.abs)),
      gammaMaxB: Math.max(...pieceB.gamma.map(Math.abs)),
      RdefectA: Math.max(
        ...pieceA.R.map(r => Math.abs(r - pieceA.tanRatio)),
      ),
      RdefectB: Math.max(
        ...pieceB.R.map(r => Math.abs(r - pieceB.tanRatio)),
      ),
      offEps: offHeld.eps,
      onEps: onHeld.eps,
      onWindow: onHeld.window,
      onFidelity: onHeld.fidelity,
      onAbsorbed: onHeld.absorbed,
      onEdge: onHeld.edge,
      onShare: onHeld.share,
      isotropy,
      R: Rcomposite,
      inertiaCoefficient: a0,
      lightEps: lightOn ? lightOn.eps : NaN,
      lightFidelity: lightOn ? lightOn.fidelity : NaN,
      lightAbsorbed: lightOn ? lightOn.absorbed : NaN,
      offLoveOff: offContent.loveOff,
      offFearOff: offContent.fearOff,
      onLoveOff: onContent.loveOff,
      onFearOff: onContent.fearOff,
      c1Absorbed: c1Held.absorbed,
      contactUnitarity: unitarity,
      contactGap,
      boxWorst: Math.max(box0.worst, box1.worst),
      threadGap,
      threadSums,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      instrument: flag(instrument),
    },
    notes: `L1 and L2. The unit v = e^(-i alpha), alpha ${(-alphaV).toFixed(6)}. I1: 12 Pi8 exact ${pi8Exact}, trace ${traceQ}, W(F4)-invariant ${covariant} over ${group.length}; the rule with A against the covariant model per V: ${perAngle.map(x => x.worst.toExponential(1)).join(' ')}. W1: ${bodyLine(base)} | ${bodyLine(pieceA)} | ${bodyLine(pieceB)}. R1: ${table.map(r => `${bodyLine(r)}; gamma/c* derived ${r.gammaPredicted.toExponential(3)}`).join(' | ')}. I2: unitarity ${unitarity.toExponential(2)}, against the no-piece maps ${contactGap.toExponential(2)}. I3: V 0 ${box0.checked} starts, worst ${box0.worst.toExponential(2)}, ${box0.differ} differ, ${box0.inexact} inexact, ${box0.stray} stray; V 1 ${box1.checked} starts, worst ${box1.worst.toExponential(2)}, ${box1.differ} differ, ${box1.inexact} inexact, ${box1.stray} stray. I4: entries ${threadGap.toExponential(2)}, sums ${threadSums.toExponential(2)}. I5: ${JSON.stringify(calibration)}. W2: ${vacuum.map(x => `u(${x.V}) side ${x.side} ${x.sea ? 'sea' : 'empty'} exact ${x.exact} permutes ${x.permutes} charged ${x.charged}`).join('; ')}. Prediction: E_rest ${pred.Erest.toFixed(6)}, light point E_rest ${predL.Erest.toFixed(6)} (m_cap ${mCapL.toFixed(6)}). W5 level: ${heldLine(offHeld)}. W3 level: ${heldLine(onHeld)}; K^2 coefficients ${dispersion.map(x => `${x.name} ${x.a.toExponential(9)}`).join(', ')}; velocity at rest ${onVelocity.map(x => x.toExponential(1)).join(' ')}. C1 level: ${heldLine(c1Held)}. W4 level (A on): ${heldLine(lightOn)}. R3 (A off): ${heldLine(lightOff)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
