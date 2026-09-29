// CAN A CLIFFORD REGISTER GIVE A LIGHT MEMBER A SPINOR PARTNER, AND CLOSE THE CHANNELS E-SPN-0159 FOUND OPEN?
// (E-SPN-0160). E-SPN-0159 proved that on the 24 slots alone the singlet's first-order partner is the irreducible vector
// Pi4, so three transverse states rest at D's phase in every covariant schedule and S + transverse reaches the composite
// threshold. It named the escape: members carrying a register on which the pieces act as Clifford generators, so the
// singlet's partner is a spinor. This file derives the register, the partner and the schedule, runs them on the rule's
// own stream at the light point, and censuses the channels.
//
// DERIVED BEFORE THE RUN (code/measure/spinor-register; K in D4 coordinates, c = sqrt 2; eps from the S-D midpoint,
// signed so S rests at +M; M the cycle's half gap, m = M / 2 per beat; the light point u = ringUnit(-1, 4), m 0.190126,
// E-SPN-0159's).
// 1. A TWO-COMPONENT SPINOR REGISTER CANNOT BE EXACT (L1, argued). The 2T units hold Q8 = {+-1, +-i, +-j, +-k}. A unitary
//    2 x 2 matrix over Q(w) with determinant one is [[a, b], [-conj b, conj a]], a = u0 + v0 sqrt(-3), b = u1 +
//    v1 sqrt(-3): the norm-one elements of the quaternion algebra (-3, -1)_Q (norm u0^2 + 3 v0^2 + u1^2 + 3 v1^2), which
//    is ramified at 3 and infinity. Two anticommuting elements of square -1 inside it would make it (-1, -1)_Q, ramified
//    at 2 and infinity. So no unitary 2-dimensional spinor register has entries in Z[w][1/42]. A REAL register can be
//    exact: the quaternions H with the Hurwitz units acting by left multiplication are signed-permutation and half-integer
//    matrices. With W(F4)'s reflections (which swap left and right multiplication) the least such register is the even
//    Clifford algebra Cl+(4) = wedge^0 + wedge^2 + wedge^4 = H + H, 8 components, on which W(F4) acts by minors: a
//    genuine representation with dyadic entries. A member's one-vibe space is then 24 x 8 = 192.
// 2. THE PARTNER. The singlet sector is S = Pi1 (x) Cl+ (rank 8). The stream's first order sends z (x) w to the Pi4
//    function K (x) w: the whole of Pi4 (x) Cl+ (rank 32). Phi(a (x) w) = gamma(a) w = a ^ w + iota_a w maps it onto the
//    odd forms, equivariantly, with Phi Phi^dag = 4 (sum_i gamma_i^2 = 4). So D = range(Phi^dag), Q_D = Phi^dag Phi / 4
//    (rank 8, 48 Q_D an integer matrix), is a covariant partner with |Q_D X_K psi|^2 = |K|^2 / 8 on S and Q_D X_K Q_S
//    X_K Q_D = |K|^2 / 8 Q_D: a CLIFFORD partner, no transverse state on either side.
// 3. THE CAPTURE THEOREM (L1). A partner with no transverse states needs dim D = dim S, and then Q_D captures exactly
//    dim D / (4 dim S) = 1/4 of |X_K S|^2 = |K|^2 / 2, at every direction (T1 reads 1/4 to 1e-12). The contrast of a
//    covariant piece is at most 2, as on the 24 slots, so THE SINGLET'S SPEED IS HALF THE SLOT WALK'S: c* = c / 4, not
//    c / 2. A Clifford partner costs a factor 2 in the light speed, in 4d, for any register and any schedule whose
//    partner sector is covariant.
// 4. THE SCHEDULE, EXACT. Beat 1 is the mixer u on S, beat 2 the mixer conj(u) on D, each after the swap coin X (which
//    acts on even forms as the identity): G1 = 1 + (u - 1) Q_S, G2 = 1 + (conj u - 1) Q_D, and (E-SPN-0159 point 1)
//    U = T G2 T^dag G1. Then W = S + T D is invariant: U psi = u (psi + (conj u - 1) T Q_D T^dag psi) for psi in S, and
//    on T D, G1 adds only Q_S T D in S and T G2 T^dag adds only T D. On the complement U = 1: for v perp S and T^dag v perp
//    D, G1 v = v and T Q_D T^dag v = 0. So EXACTLY 176 BANDS ARE FLAT AT PHASE 0 at every K, and W is 16-dimensional.
//    In W, with M_K = Q_D T^dag on S, the Pi4 part of T^dag (z (x) w) is i s(K) (x) w, s(K) = sum_r r sin(K . r) / sqrt
//    288 (real: the roots come in +- pairs), so M_K^dag M_K = |s|^2 / 4 on S and M_K M_K^dag = |s|^2 / 4 on D at EVERY K,
//    not only to first order. W is eight copies of one 2 x 2 walk: with e^(i alpha) = u, e^(i beta) = conj u (alpha =
//    pi + M, beta = pi - M, midpoint pi), cos E = cos M - 2 sin(alpha / 2) sin(beta / 2) g^2 = cos M - 2 cos^2(M / 2) g^2,
//    g = |s(K)| / 2, S at pi + E and D at pi - E.
// 5. WHAT IT KEEPS. gamma = 0 exactly (S and D symmetric about the midpoint at every K). Small K: s = K / sqrt 2 - (2 /
//    sqrt 288) |K|^2 K + O(K^5) (the 4-design, E-SPN-0159 I5), isotropic through K^3, so the K^2 coefficient is
//    isotropic. Per beat e^2 = m^2 + c^2 K^2 with c^2 = M cos(M / 2) / (16 sin(M / 2)); the massless twin (u = -1) has
//    c0^2 = 1/8, c0 = 1 / (2 sqrt 2) = c / 4; so R = c0^2 / c^2 = 2 tan(M / 2) / M = tan m / m EXACTLY, as on the slots.
//    The top speed: on the axis g = sin k / (2 sqrt 2) and the massless speed is cos k / sqrt 2 / sqrt(1 - sin^2 k / 8)
//    per cycle, at most c0 (at k = 0); PREDICTED at most c0 everywhere (F1 d). Every flat band has speed 0.
// 6. THE CHANNELS (E-SPN-0159 point 3). The flats sit at eps pi (phase 0, the midpoint pi). S + D = 0 at every q (point
//    5), so its distance below the threshold is 2 M; F + F = 2 pi, also 2 M below; D + D is at most -2 M, 4 M below. S + F
//    = pi + S with S in [M, Smax] reaches 2 M (mod 2 pi) only if S = 2 M + pi, never for a light member. D + F = pi + D
//    with D in [-Smax, -M] reaches 2 M iff D = 2 M - pi: it stays clear iff 2 M - pi < -Smax, which needs BOTH 3 M < pi
//    (D's rest, -M, above 2 M - pi) and Smax < pi - 2 M. So the window is B* = 2 M exactly in the region m < pi/6 per
//    beat with Smax < pi - 2 M, and at 3 M = pi (m = pi/6) D + F touches the threshold at rest: B* = 0 there. g is at
//    most 0.367 (probe 1), so Smax = 0.838 at the light point, against pi - 2 M = 2.381. PREDICTED: no crossing and B* =
//    2 M exactly (the Dirac value, C4's 2 in units of M) at the light point; at pi/6, the boundary, B* = 0 up to the
//    sampling (D + F leaves the threshold from rest). (THIS POINT WAS CORRECTED BEFORE THE GATE RUN: the first
//    version checked only S + F against Smax and predicted B* = 2 M at pi/6 too; the smoke run, tmp/spr-smoke.log, read
//    B* 1.2e-5 at pi/6 with the pair (flat -pi, D -pi/3), which is D + F at the threshold, and the region was derived
//    again.) The heavy member (2 M = 3.43 > pi) is outside this region and is read, not predicted. The
//    continuum cluster of S and this D is four Dirac multiplets: B* = 2, no crossing (N1); with the whole vector as the
//    partner (the no-register pin inside the register space) it opens (C6), and so does the lattice schedule with
//    Q_V = Pi4 (x) 1 in place of Q_D (C7).
// 7. WHAT IS NOT DECIDED HERE. (i) The hold: a two-body register meson carries 192^2 = 36,864 slot pairs per site, 64
//    times E-SPN-0147's, and is not run; F3's hold and F4 are undecided. (ii) The flats decouple from the moving block
//    exactly for one member in any mixer field, but NOT under a pair interaction (E-SPN-0159 point 6 (ii): the other
//    member's mixer depends on this member's position, which breaks the dock-wise condition on T^dag v). The census is
//    the kinematic statement: with the flats at eps pi, S + F and D + F sit far from 2 M, so a composite at 2 M - B
//    (B < 2 M) has no flat channel to decay into, whatever couples them. (iii) THE MANY-BODY RULE WITH REGISTERS IS NOT
//    WRITTEN: F2 is a Fock-level check (the empty box and the full sea are fixed by one-body unitaries, the full sea
//    with factor det G1 det G2 = u^8 conj(u)^8 = 1 exactly), and "K never fires" has no content without the many-body
//    collision.
// 8. THE COST AND THE NEXT STEP. Everything E-SPN-0159 kept is kept except the light speed, which halves (point 3). One
//    c* survives (every moving band is the one Dirac band, every other band is flat), but at c / 4; every earlier reading
//    calibrated on c* = c / 2 would have to be read again at c / 4 if the register rule replaced the slot rule. The next
//    step is the hold: the mass string on a register meson, or a reduction of it to the moving block.
//
// PREDICTED: F1 a to e hold, F1 f FAILS (c0 = c / 4, the capture theorem); F2 holds (Fock level); F3 (a) holds (B* = 2 M,
// no crossing) and (b) holds (B* near 0 at the boundary pi/6); the hold is not run; F4 is not read; N1 and T1 hold. The instrument and
// every control hold. Verdict PARTIAL: the census closes for a light member for the first time, at the price of half the
// light speed, and the binding itself is not yet tested.
//
// GATES, fixed before the gate run.
//  F1 ONE BODY, the schedule at the light point and its massless twin u = -1: (a) EXACT: u norm one exactly; 24 Q_S and
//     48 Q_D (and 12 Q_V) idempotent integer matrices, traces 8, 8 (32), Q_S Q_D = 0, each commuting with all 1,152
//     elements of W(F4) (generated by the four simple reflections, the group order checked), all in exact arithmetic;
//     (b) BANDS AS DERIVED: at K = 0 multiplets 8 + 8 + 176 at theta, -theta and 0; over 64 Weyl momenta exactly one flat
//     level, 176 bands at phase 0 (1e-8), and the other 16 on pi +- E(K), eight each (1e-10); (c) gamma AND ONE LIGHT
//     SPEED: the massless twin's pair (four directions, kappa 0.01, 16 states) |gamma| / c0 <= 1e-9 and |c0 / (c / 4) -
//     1| <= 1e-9; (d) SPEED: the top speed per beat over 4,096 Weyl momenta and 20 radial ones at most c / 4 (1 + 1e-6),
//     massive and massless, from the derived band (the instrument I2 checks it against the full cycle's
//     Hellmann-Feynman speeds); (e) THE SINGLET: along the four directions |R - tan m / m| <= 1e-9 (R = (c / 4)^2 / c^2)
//     and the K^2 coefficients within 1e-6 of the axis's; (f) c* = c / 2 KEPT: |c0 / (c / 2) - 1| <= 1e-9.
//  F2 THE VACUUM, FOCK LEVEL: det G1 det G2 = u^8 conj(u)^8 equal to one exactly (Eisenstein integers), for the light
//     point, pi/6 and u = -1 (with (a)'s exact projectors this fixes the empty box and the full sea).
//  F3 THE CHANNELS CLOSE FOR A LIGHT MEMBER: (a) the light point's census (4 directions x 600 steps to 3 pi, 256 Weyl
//     momenta, the 192 bands) has no crossing and B* >= 1e-3, and B* = 2 M to 1e-6 (derived); (b) THE BOUNDARY AS
//     DERIVED: at pi/6 (3 M = pi) no crossing and B* < 1e-3, the nearest pair a flat and a D-side band (the heavy member,
//     ringUnit(1, 4), has 2 M > pi, outside point 6's region, and is a READ); (c) THE HOLD (E-SPN-0147's mass string on a register meson under E-SPN-0148's
//     witness): not run here.
//  F4 R FOR THAT COMPOSITE: read only on a level from F3 (c); none here.
//  N1 THE CONTINUUM CLUSTER of S (+1) and D (-1) with A_u = X_u in their bases (3 directions, p to 29.7 in 149 steps):
//     no crossing and B* = 2 to 1e-9.
//  T1 THE CAPTURE: over 64 Weyl directions |Q_D X_u Q_S|^2 / |X_u Q_S|^2 = 1/4 and both Clifford conditions to 1e-12;
//     the vector partner's share 1 (1e-12).
// INSTRUMENT (a failure makes the verdict partial). I1 the generic readers (the root table an argument) on DOCK_ROOTS
//  reproduce code/measure/two-beat pairCensus, cycleFlats, frameR and cycleMasslessPair, and familyCensus, bit for bit
//  on E-SPN-0159's light candidate and the Dirac family. I2 the derived speed equals the full cycle's Hellmann-Feynman
//  top speed at 8 momenta (both beats' states, code/measure/swap-cone cycleBand) to 1e-6, massive.
// CONTROLS (a failure makes the verdict partial). C1 to C5 are E-SPN-0159's, read through this file's generic readers
//  where they censor: C1 the one-beat schedule reproduces E-SPN-0143 bit for bit (the same floats as E-SPN-0159 C1). C2
//  the doubled one-beat at the heavy member has no crossing and B* / 2 within 1e-3 of E-SPN-0155's distance. C3 the
//  doubled one-beat at the light point has crossings. C4 the ideal Dirac multiplet has B* = 2 to 1e-9. C5 the far-sector
//  cluster (c14 alone) first crosses within one step of p = 4. And two for this file: C6 THE PIN REAPPEARS IN THE
//  REGISTER SPACE: the cluster of S with the whole vector Pi4 (x) Cl+ as partner has crossings; C7 THE LATTICE PIN: the
//  schedule with Q_V in place of Q_D at the light point (3 directions x 300 steps) has crossings.
// READ, gating nothing: the heavy member's census, g's largest value and Smax at each mass, c0 / c, the flat level's
// phase.
// Verdict: fail if F1 (a to e), F2, F3 (a) or (b), N1 or T1 fails; partial if the instrument or a control fails, or if
// all of those hold but F1 (f), the hold or F4 does not; pass if everything holds.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/spr-probe1.log: the Clifford identity (gap 0), the
//  three projectors exact (idempotent, traces 8, 8, 32, Q_S Q_D = 0, Q_D Q_V = 12 Q_D), the group (1,152, every slot map
//  a permutation), covariance of all three under all 1,152 elements, the capture 0.250000000000000 on 4 directions
//  (Clifford sides 1e-17), the vector's 1, the Clifford cluster B* 2 - 6e-14 with no crossing, the vector cluster 576
//  crossings, the Dirac family through familyCensusN equal to familyCensus as JSON, and the lattice cycle at 4 momenta:
//  176 flat at 0, 8 at pi + E and 8 at pi - E, to 1.2e-15, 75 ms an eigensolve; g's largest value 0.3668 on a scan
//  (Smax 0.838 against pi - 2 M = 2.381). tmp/spr-smoke.log: every code path on a small plan (66 s; unconverged,
//  gating nothing): F1 a to e, F2, F3 (a) (B* 0.760502413 = 2 M, no crossing), N1, T1, I1, I2 and C2 to C7 held, F1 (f)
//  failed as predicted (c0 / c 0.2500000000006), C1 matched every recorded float but top / c, which needs the gate's
//  4,096 momenta (as in E-SPN-0159's smoke run), and pi/6 read B* 1.2e-5, which corrected point 6 and F3 (b) as stated
//  there. The heavy member read B* 0.573390, the doubled one-beat slot walk's own heavy value.
//
// FIRST RUN (tmp/spr-exp-run1.log, 662 s): PARTIAL, as predicted: every hard gate, the instrument and all seven controls
//  hold; F1 (f) fails (c0 = c / 4) and the hold and F4 are not run. No gate moved and none was rerun.
//  - F1: 1,152 group elements, ranks 8, 8, 32, every projector idempotent and covariant exactly; multiplets 8 at
//    +-2.761341447 and 176 at 0; over 64 momenta exactly 176 flat at 0 and 8 + 8 on pi +- E(K), worst 2.4e-15; massless
//    pairs of 16, c0 / (c / 4) 1 to 8e-12, |gamma| / c0 at most 2.6e-11; top speed 0.607 of c / 4 massive, 0.9999996
//    massless (reached as K -> 0); R - tan m / m at most 8.0e-12, K^2 coefficients isotropic to 1.1e-11.
//  - F2: u^8 conj(u)^8 = 1 exactly at the light point, pi/6 and u = -1.
//  - F3 (a): at m 0.190126, 192 bands, 4 x 600 steps and 256 momenta: NO CROSSING, B* 0.760502413 = 2 M to 4e-16, the
//    nearest pair S and D at |q| 2.01 (S + D = 0 at every q). (b): pi/6, B* 4.8e-8 with no crossing, nearest pair a flat
//    at -pi and D at -pi/3 (D + F at the threshold from rest), as derived. Heavy (read): B* 0.573390, no crossing.
//  - N1: the Clifford cluster B* 2 - 6e-14, no crossing. T1: capture 1/4 to 7.8e-16 on 64 directions, both Clifford
//    conditions to 1.9e-17, the vector's share 1.
//  - I1: the generic readers equal code/measure/two-beat's bit for bit; I2: the derived speed equals the full cycle's
//    Hellmann-Feynman speed to 1.2e-16.
//  - C1 bit for bit (top / c 0.48817847622126725). C2: B* / 2 0.286695 against 0.286695. C3: 168 crossings. C4: 2 -
//    5e-14. C5: 4.186 (step 0.199). C6: the whole-vector cluster 576 crossings, first at p 1.59. C7: the lattice schedule
//    with Pi4 (x) 1 as partner, 2,112 crossings, the first at |q| 0.817 (S at 1.142 = 3 M against a flat at -M): the
//    E-SPN-0159 pin, reproduced inside the register space.
// NEXT. (1) The hold: the mass string on a register meson (36,864 slot pairs a site), or its reduction to the moving
//  block S + T D (16 states a member, 256 pairs a site: the flats decouple for one member but not under a pair
//  interaction, point 7 (ii), so the reduction needs its own witness). (2) The light speed: c / 4 is forced for any
//  covariant partner with no transverse state (point 3); whether the model can afford it (one c* for everything, but
//  half the earlier one) is a model question, not a lattice one. (3) The many-body rule with registers (point 7 (iii)).
//
// Depth L1 (the Q8 obstruction, the Clifford partner, the capture theorem and the exact invariant block are
// mathematics) and L2 (the bands and channels of a coined two-beat walk with a register, read off exact pieces).
// DETERMINISM: no random numbers; Weyl sequences, grids and fixed paths. NOTHING MOVES: the pieces hand values between
// slots (and register components) of one dock, the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  bandAt,
  dockMatrix,
  DOCK_ROOTS,
  wrap,
  type CMatrix,
} from '@/code/measure/dock-mixer'
import {
  masslessPair,
  singletKinematics,
  singletLevel,
  weylMomenta,
} from '@/code/measure/singlet-kinematics'
import {
  cycleBand,
  cycleMultiplets,
  cyclePhases,
  cycleSinglet,
  eisConj,
  eisMul,
  eisPow,
  fastestCycleBand,
  ringAngle,
  type Eis,
} from '@/code/measure/swap-cone'
import {
  covariantDock,
  covariantProjectors,
} from '@/code/measure/odd-phase'
import { channelGap, pairChannels } from '@/code/measure/husk-meson'
import {
  ringUnit,
  unitAngle,
  unitNormExact,
} from '@/code/measure/swap-string'
import { type RingUnit } from '@/code/rule/swap-mixer'
import {
  clusterCensus,
  covariantPhases,
  cycleFlats,
  cycleMasslessPair,
  diracFamily,
  familyCensus,
  frameR,
  pairCensus,
  radialPaths,
  restFrame,
  type Census,
  type Frame,
} from '@/code/measure/two-beat'
import {
  capture,
  clusterFamily,
  commutesExactly,
  cycleFlatsN,
  cycleMasslessPairN,
  diracPhase,
  diracSpeed,
  f4Group,
  familyCensusN,
  frameRN,
  matMul,
  MODES,
  pairCensusN,
  partnerProjector48,
  rangeBasis,
  REGISTER_ROOTS,
  registerPiece,
  sameMatrix,
  scaled,
  singletProjector24,
  structureVector,
  trace,
  vectorProjector12,
  weylDirections,
} from '@/code/measure/spinor-register'

const C = Math.SQRT2
const C_HALF = C / 2
const C_QUARTER = C / 4
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRS: readonly number[][] = [
  [1, 0, 0, 0],
  [s2, s2, 0, 0],
  [s3, s3, s3, 0],
  GENERIC,
]
const SCAN_DIRS: readonly number[][] = [
  [1, 0, 0, 0],
  [s3, s3, s3, 0],
  GENERIC,
]
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const LIGHT: readonly [number, number] = [-1, 4]
const SIXTH: readonly [number, number] = [0, 4]
const MASSLESS: readonly [number, number] = [0, 3]
const HEAVY: readonly [number, number] = [1, 4]
const PRIME: Eis = [3n, 1n]
const REC = {
  mStar: 0.04677803444110118,
  topOverC: 0.48817847622126725,
  RStar: 1.0007300338253453,
  c0OverC: 0.5000000000011358,
  schedM: 0.26179938779914924,
  schedR: 1.1026577908486987,
  schedTopOverC: 0.4037221140226534,
}
const SWAP_N = 2 / 3
const FLAT_TOLERANCE = 1e-8
const BAND_TOLERANCE = 1e-10
const GAMMA_TOLERANCE = 1e-9
const SPEED_TOLERANCE = 1e-6
const R_EXACT = 1e-9
const ISOTROPY = 1e-6
const WINDOW = 1e-3
const BSTAR_TOLERANCE = 1e-6
const PAIR_KAPPA = 0.01
const CAPTURE_TOLERANCE = 1e-12
const HF_TOLERANCE = 1e-6
const C2_TOLERANCE = 1e-3
const DIRAC_TOLERANCE = 1e-9

export type SpinorPlan = {
  momenta: number
  flatSample: number
  censusSteps: number
  scanSteps: number
  clusterSteps: number
  clusterP: number
  captureDirections: number
  hfMomenta: number
  checkSteps: number
  weylExtra: number
}

export const GATE_PLAN: SpinorPlan = {
  momenta: 4096,
  flatSample: 64,
  censusSteps: 600,
  scanSteps: 300,
  clusterSteps: 149,
  clusterP: 29.7,
  captureDirections: 64,
  hfMomenta: 8,
  checkSteps: 120,
  weylExtra: 256,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/spinor-register',
  code: 'E-SPN-0160',
  title:
    'a Clifford register closes the flat-band channels for a light member (m < pi/6), partial (the light speed halves; the hold is not run):a two-component spinor register cannot be exact over Z[w][1/42] (Q8 would make the algebra (-3,-1), ramified at 3, into (-1,-1)), so a member carries the even Clifford algebra Cl+(4) = H + H (8 components, W(F4) acting by minors); the partner D = Phi^dag Phi / 4 of the odd forms is covariant and exactly Clifford, and a two-beat schedule (the mixer u on the singlet, then conj u on D) makes span(S, T D) eight copies of one exact 2 x 2 walk, cos E = cos M - 2 cos^2(M/2) g^2, with the other 176 bands flat at eps pi at every K; gamma = 0, R = tan m/m and isotropy are kept exactly, the census has no crossing and B* = 2M (the Dirac value) at m 0.190126, closing exactly at the derived boundary m = pi/6 where D + F touches the threshold, the whole-vector partner reopens it, and by the capture theorem (a partner with no transverse state takes exactly 1/4 of the stream) the light speed is c/4, not c/2',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return spinorRegisterRun(GATE_PLAN)
  },
})

const unitValue = (u: RingUnit): [number, number] => {
  const t = unitAngle(u)

  return [Math.cos(t), Math.sin(t)]
}

// the schedule: beat 1 the mixer u on Q, beat 2 the mixer conj u on Q2
const schedule = (
  qS: Float64Array,
  q2: Float64Array,
  u: [number, number],
): CMatrix[] => [registerPiece(qS, u), registerPiece(q2, [u[0], -u[1]])]

// u^8 conj(u)^8 over den^16 equal to one, in Eisenstein integers
function fullSeaExact(u: RingUnit): boolean {
  const num: Eis = [u.num[0], u.num[1]]
  const product = eisMul(eisPow(num, 8), eisPow(eisConj(num), 8))

  return product[0] === u.den ** 16n && product[1] === 0n
}

const sameCensus = (a: Census, b: Census): boolean =>
  a.Bstar === b.Bstar &&
  a.crossings === b.crossings &&
  a.first.q === b.first.q &&
  a.pair[0] === b.pair[0] &&
  a.pair[1] === b.pair[1] &&
  a.at.every((x, i) => x === b.at[i])

export function spinorRegisterRun(plan: SpinorPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const uL = ringUnit(LIGHT[0], LIGHT[1])
  const u6 = ringUnit(SIXTH[0], SIXTH[1])
  const uZ = ringUnit(MASSLESS[0], MASSLESS[1])
  const uH = ringUnit(HEAVY[0], HEAVY[1])
  const thetaL = unitAngle(uL)
  const mOf = (u: RingUnit): number => wrap(unitAngle(u) - Math.PI) / 2
  const mL = mOf(uL)
  const m6 = mOf(u6)
  const mH = mOf(uH)
  const weyl = weylMomenta(plan.momenta)
  const check = weylMomenta(plan.flatSample)
  const radial = DIRS.flatMap(u => RADII.map(r => u.map(x => x * r)))
  const censusPaths = radialPaths(DIRS, 3 * Math.PI, plan.censusSteps)
  const scanPaths = radialPaths(SCAN_DIRS, 3 * Math.PI, plan.scanSteps)

  // ---------------- F1 (a): the exact algebra ----------------
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const V12 = vectorProjector12()
  const group = f4Group()
  const groupOk =
    group.length === 1152 &&
    group.every(
      g =>
        [...g.slots].every(s => s >= 0) && new Set(g.slots).size === 24,
    )
  const idempotent =
    sameMatrix(
      matMul(S24, S24),
      S24.map(x => 24 * x),
    ) &&
    sameMatrix(
      matMul(D48, D48),
      D48.map(x => 48 * x),
    ) &&
    sameMatrix(
      matMul(V12, V12),
      V12.map(x => 12 * x),
    )
  const ranks = [trace(S24) / 24, trace(D48) / 48, trace(V12) / 12]
  const orthogonal = matMul(S24, D48).every(x => x === 0)
  const covariant = group.every(
    g =>
      commutesExactly(g, S24) &&
      commutesExactly(g, D48) &&
      commutesExactly(g, V12),
  )
  const F1a =
    unitNormExact(uL) &&
    unitNormExact(uZ) &&
    groupOk &&
    idempotent &&
    ranks.join(',') === '8,8,32' &&
    orthogonal &&
    covariant

  log('F1 a')

  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const qV = scaled(V12, 12)
  const PL = schedule(qS, qD, unitValue(uL))
  const PZ = schedule(qS, qD, unitValue(uZ))
  const ML = 2 * mL

  // ---------------- F1 (b): the bands ----------------
  const multiplets = cycleMultiplets(PL, REGISTER_ROOTS)
  const multipletLine = multiplets
    .map(x => `${x.center.toFixed(9)}x${x.size}`)
    .sort()
    .join(' ')
  const at0 = (phase: number): number =>
    multiplets
      .filter(x => Math.abs(wrap(x.center - phase)) <= FLAT_TOLERANCE)
      .reduce((s, x) => s + x.size, 0)
  const restOk =
    multiplets.length === 3 &&
    at0(thetaL) === 8 &&
    at0(-thetaL) === 8 &&
    at0(0) === 176
  const flats = cycleFlatsN(PL, check, FLAT_TOLERANCE, REGISTER_ROOTS)

  let bandGap = 0
  let bandCounts = true

  for (const K of check) {
    const ph = cyclePhases(PL, REGISTER_ROOTS, K)
    const E = diracPhase(K, ML)
    const up = ph.filter(
      x => Math.abs(wrap(x - Math.PI - E)) <= BAND_TOLERANCE,
    ).length
    const down = ph.filter(
      x => Math.abs(wrap(x - Math.PI + E)) <= BAND_TOLERANCE,
    ).length
    const flat = ph.filter(
      x => Math.abs(wrap(x)) <= FLAT_TOLERANCE,
    ).length

    if (up !== 8 || down !== 8 || flat !== 176) {
      bandCounts = false
    }

    bandGap = Math.max(
      bandGap,
      ...ph.map(x =>
        Math.min(
          Math.abs(wrap(x)),
          Math.abs(wrap(x - Math.PI - E)),
          Math.abs(wrap(x - Math.PI + E)),
        ),
      ),
    )
  }

  const F1b =
    restOk &&
    flats.length === 1 &&
    Math.abs(wrap((flats[0] as { phase: number }).phase)) <=
      FLAT_TOLERANCE &&
    (flats[0] as { count: number }).count === 176 &&
    bandCounts

  log('F1 b')

  // ---------------- F1 (c), (f): the massless twin ----------------
  const pairs = DIRS.map(u =>
    cycleMasslessPairN(PZ, Math.PI, u, PAIR_KAPPA, REGISTER_ROOTS),
  )
  const F1c = pairs.every(
    x =>
      x.size === 16 &&
      Math.abs(x.gamma) / C_QUARTER <= GAMMA_TOLERANCE &&
      Math.abs(x.c0 / C_QUARTER - 1) <= GAMMA_TOLERANCE,
  )
  const F1f = pairs.every(
    x => Math.abs(x.c0 / C_HALF - 1) <= GAMMA_TOLERANCE,
  )

  log('F1 c f')

  // ---------------- F1 (d): the top speed (derived band) and I2 ----------------
  const speedMomenta = [...weyl, ...radial]
  const top =
    Math.max(...speedMomenta.map(K => diracSpeed(K, ML))) / C_QUARTER
  const topZ =
    Math.max(...speedMomenta.map(K => diracSpeed(K, 0))) / C_QUARTER
  const F1d = top <= 1 + SPEED_TOLERANCE && topZ <= 1 + SPEED_TOLERANCE

  let hfGap = 0

  for (const K of weyl.slice(0, plan.hfMomenta)) {
    const hf = Math.max(
      ...cycleBand(PL, REGISTER_ROOTS, K).velocity.map(v =>
        Math.hypot(...v),
      ),
    )

    hfGap = Math.max(hfGap, Math.abs(hf - diracSpeed(K, ML)))
  }

  const I2 = hfGap <= HF_TOLERANCE

  log('F1 d, I2')

  // ---------------- F1 (e): the singlet ----------------
  const frameL = restFrame(thetaL, -thetaL, ML)
  const fits = DIRS.map(u =>
    frameRN(PL, frameL, thetaL, u, C_QUARTER, SCALES, REGISTER_ROOTS),
  )
  const tanL = Math.tan(mL) / mL
  const isotropy = Math.max(
    ...fits.map(x =>
      Math.abs(x.c2 / (fits[0] as { c2: number }).c2 - 1),
    ),
  )
  const F1e =
    fits.every(x => Math.abs(x.R - tanL) <= R_EXACT) &&
    isotropy <= ISOTROPY
  const F1core = F1a && F1b && F1c && F1d && F1e

  log('F1 e')

  // ---------------- F2: the vacuum, Fock level ----------------
  const F2 = [uL, u6, uZ].every(fullSeaExact) && F1a

  // ---------------- F3: the channels ----------------
  const censusAt = (
    u: RingUnit,
    m: number,
    paths: number[][][],
    extra: number[][],
  ): Census => {
    const theta = unitAngle(u)

    return pairCensusN(
      schedule(qS, qD, unitValue(u)),
      restFrame(theta, -theta, 2 * m),
      paths,
      extra,
      REGISTER_ROOTS,
    )
  }

  const censusL = censusAt(
    uL,
    mL,
    censusPaths,
    weyl.slice(0, plan.weylExtra),
  )
  const F3a =
    censusL.crossings === 0 &&
    censusL.Bstar >= WINDOW &&
    Math.abs(censusL.Bstar - 2 * ML) <= BSTAR_TOLERANCE

  log('F3 a')

  const census6 = censusAt(
    u6,
    m6,
    censusPaths,
    weyl.slice(0, plan.weylExtra),
  )
  const censusH = censusAt(
    uH,
    mH,
    censusPaths,
    weyl.slice(0, plan.weylExtra),
  )
  const boundaryPair =
    census6.pair.some(
      x => Math.abs(Math.abs(x) - Math.PI) <= FLAT_TOLERANCE,
    ) &&
    census6.pair.some(
      x => x < 0 && Math.abs(Math.abs(x) - Math.PI) > FLAT_TOLERANCE,
    )
  const F3b =
    census6.crossings === 0 && census6.Bstar < WINDOW && boundaryPair
  const F3 = false
  const F4 = false

  log('F3 b')

  // ---------------- N1, T1, C6: the clusters and the capture ----------------
  const SB = rangeBasis(qS)
  const DB = rangeBasis(qD)
  const VB = rangeBasis(qV)
  const clifford = clusterFamily(SB, DB, SCAN_DIRS, 2 * Math.SQRT2)
  const cliffordCensus = familyCensusN(
    clifford.B,
    clifford.As,
    plan.clusterP,
    plan.clusterSteps,
    clifford.n,
  )
  const N1 =
    cliffordCensus.crossings === 0 &&
    Math.abs(cliffordCensus.Bstar - 2) <= DIRAC_TOLERANCE
  const vector = clusterFamily(SB, VB, SCAN_DIRS, 2 * Math.SQRT2)
  const vectorCensus = familyCensusN(
    vector.B,
    vector.As,
    plan.clusterP,
    plan.clusterSteps,
    vector.n,
  )
  const C6 = vectorCensus.crossings > 0
  const captures = weylDirections(plan.captureDirections).map(u =>
    capture(qS, qD, u),
  )
  const captureGap = Math.max(
    ...captures.map(c => Math.abs(c.share - 0.25)),
  )
  const cliffordSides = Math.max(
    ...captures.map(c => Math.max(c.sideS, c.sideD)),
  )
  const vectorShare = capture(qS, qV, GENERIC).share
  const T1 =
    captureGap <= CAPTURE_TOLERANCE &&
    cliffordSides <= CAPTURE_TOLERANCE &&
    Math.abs(vectorShare - 1) <= CAPTURE_TOLERANCE

  log('N1 T1 C6')

  // ---------------- C7: the lattice pin ----------------
  const PV = schedule(qS, qV, unitValue(uL))
  const censusV = pairCensusN(PV, frameL, scanPaths, [], REGISTER_ROOTS)
  const C7 = censusV.crossings > 0

  log('C7')

  // ---------------- I1: the generic readers against code/measure/two-beat ----------------
  const p = covariantProjectors()
  const oct = ringUnit(2, 0)
  const cand = [
    covariantDock(p, [thetaL, 0, 0, 0, 0]),
    covariantDock(p, [thetaL, 0, 0, 0, unitAngle(oct)]),
  ]
  const candRest = restFrame(4 * mL, 0, 2 * mL)
  const checkPaths = radialPaths(
    SCAN_DIRS,
    3 * Math.PI,
    plan.checkSteps,
  )
  const readersSame =
    sameCensus(
      pairCensus(cand, candRest, checkPaths, check.slice(0, 16)),
      pairCensusN(
        cand,
        candRest,
        checkPaths,
        check.slice(0, 16),
        DOCK_ROOTS,
      ),
    ) &&
    JSON.stringify(
      cycleFlats(cand, check.slice(0, 16), FLAT_TOLERANCE),
    ) ===
      JSON.stringify(
        cycleFlatsN(
          cand,
          check.slice(0, 16),
          FLAT_TOLERANCE,
          DOCK_ROOTS,
        ),
      ) &&
    DIRS.every(
      u =>
        JSON.stringify(
          frameR(cand, candRest, 4 * mL, u, C_HALF, SCALES),
        ) ===
        JSON.stringify(
          frameRN(
            cand,
            candRest,
            4 * mL,
            u,
            C_HALF,
            SCALES,
            DOCK_ROOTS,
          ),
        ),
    ) &&
    DIRS.every(u => {
      const one = covariantDock(p, [Math.PI, 0, 0, 0, 0])

      return (
        JSON.stringify(
          cycleMasslessPair([one, one], 0, u, PAIR_KAPPA),
        ) ===
        JSON.stringify(
          cycleMasslessPairN([one, one], 0, u, PAIR_KAPPA, DOCK_ROOTS),
        )
      )
    })
  const dirac = diracFamily(SCAN_DIRS)
  const diracCensus = familyCensus(
    dirac.B,
    dirac.As,
    plan.clusterP,
    plan.clusterSteps,
  )
  const diracSame =
    JSON.stringify(diracCensus) ===
    JSON.stringify(
      familyCensusN(
        dirac.B,
        dirac.As,
        plan.clusterP,
        plan.clusterSteps,
        24,
      ),
    )
  const I1 = readersSame && diracSame

  log('I1')

  // ---------------- C1 to C5: E-SPN-0159's controls ----------------
  const star = ringAngle(PRIME, 3)
  const thetaStar = Math.PI + star.delta
  const P0 = dockMatrix(Math.PI, SWAP_N, true)
  const c0Slots = masslessPair(
    P0,
    DOCK_ROOTS,
    13,
    DIRS[0]!,
    PAIR_KAPPA,
  ).c0
  const mainMomenta = [...weyl, ...radial]
  const sideMomenta = [...weyl.slice(0, 1024), ...radial]

  let starTop = 0

  for (const hole of [true, false]) {
    const P = dockMatrix(thetaStar, SWAP_N, hole)

    for (const K of mainMomenta) {
      starTop = Math.max(
        starTop,
        ...bandAt(P, DOCK_ROOTS, K).velocity.map(x => Math.hypot(...x)),
      )
    }
  }

  const PS = dockMatrix(thetaStar, SWAP_N, true)
  const levelS = singletLevel(PS, DOCK_ROOTS, 12)
  const starR =
    (c0Slots * c0Slots) /
    singletKinematics(PS, DOCK_ROOTS, levelS, DIRS[0]!, SCALES).c2
  const starCycleR =
    (c0Slots * c0Slots) /
    cycleSinglet([PS], DOCK_ROOTS, DIRS[0]!, SCALES).c2
  const sched = [
    dockMatrix(Math.PI, SWAP_N, true),
    dockMatrix((4 * Math.PI) / 3, SWAP_N, true),
  ]
  const schedTop = fastestCycleBand(
    sched,
    DOCK_ROOTS,
    sideMomenta,
  ).speed
  const schedFit = cycleSinglet(sched, DOCK_ROOTS, DIRS[0]!, SCALES)
  const c1 = {
    m: levelS.m,
    top: starTop / C,
    R: starR,
    cycleR: starCycleR,
    c0: c0Slots / C,
    schedM: schedFit.m,
    schedR: (c0Slots * c0Slots) / schedFit.c2,
    schedTop: schedTop / C,
  }
  const C1 =
    c1.m === REC.mStar &&
    c1.top === REC.topOverC &&
    c1.R === REC.RStar &&
    c1.cycleR === REC.RStar &&
    c1.c0 === REC.c0OverC &&
    c1.schedM === REC.schedM &&
    c1.schedR === REC.schedR &&
    c1.schedTop === REC.schedTopOverC

  log('C1')

  const thetaH = unitAngle(uH)
  const oneH = covariantDock(p, [thetaH, 0, 0, 0, 0])
  const restH = restFrameOfOneBeat(oneH, mH)
  const slotsH = pairCensusN(
    [oneH, oneH],
    restH,
    censusPaths,
    weyl.slice(0, plan.weylExtra),
    DOCK_ROOTS,
  )
  const heavyGap = Math.min(
    channelGap(2 * mH, pairChannels(mH), ['SS']).distance,
    channelGap(2 * mH + Math.PI, pairChannels(mH), ['SS']).distance,
  )
  const C2 =
    slotsH.crossings === 0 &&
    Math.abs(slotsH.Bstar / 2 - heavyGap) <= C2_TOLERANCE
  const oneL = covariantDock(p, [thetaL, 0, 0, 0, 0])
  const slotsL = pairCensusN(
    [oneL, oneL],
    restFrameOfOneBeat(oneL, mL),
    censusPaths,
    [],
    DOCK_ROOTS,
  )
  const C3 = slotsL.crossings > 0
  const C4 =
    diracCensus.crossings === 0 &&
    Math.abs(diracCensus.Bstar - 2) <= DIRAC_TOLERANCE
  const far = clusterCensus(
    p,
    [1, -1, -1, -1, -1],
    [1, 0, 0, 0],
    SCAN_DIRS,
    plan.clusterP,
    plan.clusterSteps,
  )
  const step = plan.clusterP / plan.clusterSteps
  const C5 = far.crossings > 0 && Math.abs(far.first - 4) <= step

  log('C2 to C5')

  // ---------------- reads ----------------
  let gMax = 0

  for (const u of weylDirections(2000)) {
    for (let k = 0.05; k < 3.2; k += 0.05) {
      gMax = Math.max(
        gMax,
        Math.hypot(...structureVector(u.map(x => x * k))) / 2,
      )
    }
  }

  const smax = (m: number): number =>
    Math.acos(Math.cos(2 * m) - 2 * Math.cos(m) ** 2 * gMax * gMax)

  const instrument = I1 && I2
  const controls = C1 && C2 && C3 && C4 && C5 && C6 && C7
  const hard = F1core && F2 && F3a && F3b && N1 && T1
  const status = !hard
    ? 'fail'
    : !instrument || !controls || !F1f || !F3 || !F4
      ? 'partial'
      : 'pass'
  const censusLine = (c: Census): string =>
    `B* ${c.Bstar.toFixed(9)}, crossings ${c.crossings}${c.crossings > 0 ? `, first at |q| ${c.first.q.toFixed(4)} (pair eps ${c.first.pair.map(x => x.toFixed(4)).join(', ')})` : ''}, nearest below at |q| ${Math.hypot(...c.at).toFixed(4)} (pair ${c.pair.map(x => x.toFixed(4)).join(', ')})`

  return verdict({
    status,
    claim: `F1 a ${F1a} b ${F1b} (multiplets ${multipletLine}; band gap ${bandGap.toExponential(2)}) c ${F1c} d ${F1d} (top ${top.toFixed(6)}, massless ${topZ.toFixed(6)} of c/4) e ${F1e} f ${F1f} (c0 / (c/2) ${((pairs[0] as { c0: number }).c0 / C_HALF).toFixed(10)}); F2 ${F2} (Fock level); F3 a ${F3a} (${censusLine(censusL)}, 2M ${(2 * ML).toFixed(9)}) b ${F3b} (pi/6 B* ${census6.Bstar.toFixed(9)} x${census6.crossings}, heavy B* ${censusH.Bstar.toFixed(9)} x${censusH.crossings}), hold not run; F4 not read; N1 ${N1} (B* ${cliffordCensus.Bstar}, crossings ${cliffordCensus.crossings}); T1 ${T1} (capture gap ${captureGap.toExponential(2)}, sides ${cliffordSides.toExponential(2)}, vector ${vectorShare}); instrument I1 ${I1} I2 ${I2} (HF gap ${hfGap.toExponential(2)}); controls C1 ${C1} C2 ${C2} C3 ${C3} C4 ${C4} C5 ${C5} C6 ${C6} C7 ${C7}`,
    metrics: {
      F1: flag(F1core && F1f),
      F1a: flag(F1a),
      F1b: flag(F1b),
      F1c: flag(F1c),
      F1d: flag(F1d),
      F1e: flag(F1e),
      F1f: flag(F1f),
      F2: flag(F2),
      F3: flag(F3),
      F3a: flag(F3a),
      F3b: flag(F3b),
      F4: flag(F4),
      N1: flag(N1),
      T1: flag(T1),
      instrument: flag(instrument),
      I1: flag(I1),
      I2: flag(I2),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      C5: flag(C5),
      C6: flag(C6),
      C7: flag(C7),
      mLight: mL,
      c0OverC: (pairs[0] as { c0: number }).c0 / C,
      gammaMax: Math.max(
        ...pairs.map(x => Math.abs(x.gamma) / C_QUARTER),
      ),
      RdefectMax: Math.max(...fits.map(x => Math.abs(x.R - tanL))),
      isotropy,
      top,
      topMassless: topZ,
      bandGap,
      censusBstar: censusL.Bstar,
      censusCrossings: censusL.crossings,
      bstar6: census6.Bstar,
      bstarHeavy: censusH.Bstar,
      captureGap,
      cliffordSides,
      clusterBstar: cliffordCensus.Bstar,
      vectorClusterCrossings: vectorCensus.crossings,
      latticeVectorCrossings: censusV.crossings,
      hfGap,
      gMax,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      C5: flag(C5),
      C6: flag(C6),
      C7: flag(C7),
      instrument: flag(instrument),
    },
    notes: `L1 and L2. ${MODES} modes a member. Light u = ringUnit(${LIGHT.join(', ')}) m ${mL.toFixed(6)} (2M ${(2 * ML).toFixed(6)}), pi/6 m ${m6.toFixed(6)}, heavy m ${mH.toFixed(6)}. F1: group ${group.length}, ranks ${ranks.join(' ')}, idempotent ${idempotent}, covariant ${covariant}; multiplets ${multipletLine}; flats ${flats.map(f => `${f.phase.toExponential(2)}x${f.count}`).join(' ')}; band gap ${bandGap.toExponential(2)}; massless pairs ${pairs.map(x => `size ${x.size} c0/(c/4) ${(x.c0 / C_QUARTER).toFixed(12)} gamma ${(x.gamma / C_QUARTER).toExponential(2)}`).join(', ')}; R - tan m/m ${fits.map(x => (x.R - tanL).toExponential(2)).join(' ')} (tan m/m ${tanL.toFixed(9)}), K^2 ${fits.map(x => x.c2.toFixed(12)).join(' ')}. F3: light ${censusLine(censusL)}; pi/6 ${censusLine(census6)} (4m ${(4 * m6).toFixed(9)}); heavy ${censusLine(censusH)} (4m ${(4 * mH).toFixed(9)}). Reads: g max ${gMax.toFixed(6)}, Smax light ${smax(mL).toFixed(4)} pi/6 ${smax(m6).toFixed(4)} heavy ${smax(mH).toFixed(4)}. N1 ${cliffordCensus.Bstar} x${cliffordCensus.crossings}; C6 vector cluster ${vectorCensus.crossings} crossings (first p ${vectorCensus.first}); C7 lattice vector ${censusLine(censusV)}. C1: m ${c1.m}, top/c ${c1.top}, R ${c1.R}, cycle R ${c1.cycleR}, c0/c ${c1.c0}; schedule m ${c1.schedM}, R ${c1.schedR}, top/c ${c1.schedTop}. C2 heavy slots ${censusLine(slotsH)}, B*/2 ${(slotsH.Bstar / 2).toFixed(6)} against ${heavyGap.toFixed(6)}. C3 light slots ${slotsL.crossings} crossings. C4 Dirac ${diracCensus.Bstar}. C5 far first ${far.first.toFixed(4)} (step ${step.toFixed(4)}). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

// the doubled one-beat's rest frame, as E-SPN-0159 reads it (the S and Pi4 rest phases, half gap 2 m)
function restFrameOfOneBeat(one: CMatrix, m: number): Frame {
  const rest = covariantPhases([one, one], covariantProjectors())

  return restFrame(rest[0]!, rest[3]!, 2 * m)
}
