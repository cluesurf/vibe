// A LOVE AND A FEAR BOUND BY THE HUSK'S COULOMB LAW ON THE SWAP-COIN RULE: A HYDROGENIC LEVEL THAT MOVES FREELY?
// (E-SPN-0155). Under the candidate rule (the love sea, the 24-slot fermionic dock mixer, the swap coin, the ring
// Z[w][1/42]) every one-body excitation moves isotropically with one c* = c / 2 (E-SPN-0143, 0145), and every string
// tried failed or stalled at binding (E-SPN-0146 to 0153). Bound matter in 3d does not need confinement: atoms are held
// by an ordinary 1/r law, and the model's compact U(1) light holds the exact 1/(24 pi r) (E-FRC-0241). This file binds
// the love-fear pair of E-SPN-0146 (the exact particle-hole image of a hole pair on the love sea) with that law, as a
// STATIC STAND-IN (stage 1): a diagonal phase from the husk lattice's exact Green's function. The dynamical light
// (stage 2) is derived, not run (point 10).
//
// DERIVED BEFORE THE RUN (machinery: code/measure/husk-meson, code/measure/swap-string, code/measure/meson-pool; member
// eps from the midpoint as E-SPN-0147, a pair's eps the sum; coordinates are D4 coordinates, c = sqrt 2, c* = 1 / sqrt 2).
// 1. WHERE THE PAIR LIVES, AND WHICH GREEN'S FUNCTION. E-SPN-0146/0147 carry the pair in 4d. The D4 mesh's own root
//    Laplacian has a 4d Green's function, falling as 1/r^2, and -g / r^2 in 4d binds nothing below the fall-to-center
//    threshold 2 mu g = 1 (it is scale free): a bulk Coulomb law cannot bind at weak coupling at all. The husk light reads
//    column sums, and its static operator is the bulk's k4 = 0 block (E-FRC-0241 P1, P5), so its law depends on the husk
//    projection only; a pair on the infinite 4d mesh under it is free in depth and unbound. So the pair runs on the HUSK
//    QUOTIENT: the D4 mesh with depth period 2. A D4 point (a, b, c, d) there is fixed by (a, b, c), so the docks ARE the
//    husk lattice Z^3, and the 24 roots project onto its 12 face diagonals once and its 6 axis steps twice. Its root
//    Laplacian sum_(24 roots) (1 - cos k . rho) at k4 = 0 is EXACTLY E-FRC-0241's husk symbol, so the Coulomb law applied
//    is the Green's function of the very lattice the pair walks. It is the thinnest husk column (a deeper one adds depth-
//    excited member bands) and a member's momentum is (q, 0), q in [-pi, pi)^3. Stated as a stand-in.
// 2. THE POTENTIAL. V(y) = -alpha G(y), G the infinite husk Green's function, so V -> -alpha / (24 pi r) = -alpha' / r
//    (alpha' = alpha / (24 pi)); G(0) = 0.0528305 (husk-coulomb infiniteGreenZero), G(1, 0, 0) = 0.0125313, G(2, 0, 0) =
//    0.0066243 (1/(24 pi r): 0.0132629, 0.0066315). The regularization at contact is the lattice's own: V(0) = -3.983
//    alpha', 4.2 times V at the nearest dock. A float stand-in (G is transcendental), applied as the phase e^(-i s alpha
//    (G(0) - G(y))) a beat after the stream (s the singlet's sign), the constant alpha G(0) removed so the stores, which
//    carry no phase, sit with the contact sites; the true energy is the measured one minus alpha G(0).
// 3. CONTINUUM HYDROGEN. The member's band is S = arccos(cos m g(q)), g = (1/24) sum cos(q . rho) (closed form, checked
//    against the rule, I1): S = m + q^2 / (4 tan m) + ..., so the reduced mass is mu = tan m (inertia in units c*^2 = 1/2)
//    and, in 3d, E_b = mu alpha'^2 / 2, a_B = 1 / (mu alpha'), both members' R_walk = tan m / m. The path is labeled by the
//    continuum Bohr radius a_c: alpha = 24 pi / (tan m a_c).
// 4. R OF A STATICALLY BOUND PAIR. At total K, the members sit at K/2 +- q; with S = m + a2 q^2 + a4 q^4, the K^2
//    coefficient is a2 / 2 + a4 (1 + 2/3) <q^2>, so for relativistic members (a4 = -1/(8 M^3 c^2)) the inertia is 2M +
//    (5/3) T / c^2 with T = E_b (virial), against E = 2 m - E_b: R = (2 tan m + (5/3) E_b) / (2 m - E_b) ~ R_walk (1 +
//    E_b / 2m) + (5/6) E_b / m. A STATIC potential gives a composite HEAVIER than its energy: Lorentz needs 2M - E_b, and
//    the missing (8/3) E_b is the transverse (Darwin) exchange of the dynamical light. So on the stand-in R -> R_walk only
//    as E_b / m -> 0, and R -> 1 needs m -> 0 too.
// 5. THE CORE. The contact well against the relative band's single-dock binding threshold (NR: kinetic ~ eps_husk(q) /
//    (12 mu), threshold |V0| ~ 1 / (12 mu G(0))): the ratio is about 2.5 / a_B, so for a_B under about 2.5 the contact
//    alone binds and the level is a lattice core state, heavy to move. The single-channel model (point 9) at the heavy
//    member: a_c 2.5, 3, 3.5, 4, 5 give contact weight 0.53, 0.22, 0.074, 0.030, 0.009, E_b over continuum 2.8, 1.7, 1.34,
//    1.23, 1.11, R 3.17, 1.84, 1.55, ~1.45, ~1.40 (tmp/coul-probe2-model.log, -probe3.log). HYDROGENIC (E_b within 10% of
//    the continuum) NEEDS a_B >~ 5 DOCKS, and the tail decays as exp(-2 kappa r), kappa = sqrt(2 mu E_b): the ball must
//    reach ~16 / (2 kappa). An affordable ball (radius 44, 357k sites, 2.1e8 amplitudes a state) holds a_c up to ~3.5.
// 6. THE CHANNELS (the key derivation). The level at E = 2m - E_b (and its pi image, the beat alternating its contact map
//    with parity) leaks only through a two-member band OPEN AT INFINITY, where V = 0: a band crossing E near contact, where
//    V is large, is a local, closed degeneracy that carries nothing to infinity. With no string the channels at total K = 0
//    (E-SPN-0147 point 4 at delta = 0) are SS [2m, 2m + 2 kmax], SD {0}, SF- [0, kmax], SF+ [pi, pi + kmax], DD [-2m - 2
//    kmax, -2m], DF- [-2m - kmax, -2m], DF+ [pi - 2m - kmax, pi - 2m], F-F- {-2m}, F+F+ {2 pi - 2m}, F-F+ {pi - 2m}, kmax
//    = pi/2 - m + arcsin(cos m / 3). Then, for small E_b, E and E + pi avoid every one iff (pi + E_b) / 4 < m < pi / 2
//    (the floor is DF+'s top and F+F+ for the pi image, the ceiling SF+ and SF- wrapped): THE COULOMB LEVEL OF THE SWAP
//    COIN IS A TRUE BOUND STATE ONLY FOR HEAVY MEMBERS, R_walk > 4 / pi = 1.273. For 0.41 < m < pi/4 the level sits inside
//    DF+ (a D member moving, an F+ member flat), and for m < 0.62 inside SF- (an S member moving, an F- member flat): the
//    flat-band channel that sank E-SPN-0146 is open at every coupling, however weak, because it is open at infinity. The
//    premise that it closes when
//    |V| > 2m only within alpha / (2m) of contact tests a local crossing, not the channel. Whether the embedded level
//    leaks MEASURABLY depends on the coupling matrix element (the phase's gradient mixes S with the flat members at
//    momentum transfer ~ the S member's momentum at kinetic 2m), which is not derived here: PREDICTED to leak.
//    Heavy member (ringUnit(1, 4), m 0.857072, R_walk 1.347262): the nearest channel is DF+ (and F+F+ for E + pi), 0.205
//    at a_c 3, 0.239 at 3.5 (the open model's E; the rule's shallower level sits farther from it). Light member (m = pi/6, R_walk 1.102658) at a_c 4: E ~ 0.94, inside SF- [0,
//    1.340] and DF+ [0.754, 2.094].
// 7. ISOTROPY is symmetry: the quotient is cubic, and a cubic rank-2 tensor is a multiple of the identity, so the K^2
//    coefficient is isotropic by construction (L1); the gate checks the instrument, as in E-SPN-0147.
// 8. SPEED. The potential is a phase: it adds no hop, the stream takes each vibe one root a beat, and every member band is
//    under c* (E-SPN-0143); a composite's Hellmann-Feynman speed has no theorem, so C4 measures it.
// 9. THE PREDICTION'S MODEL. Two S-band members with the exact band and the exact lattice potential on a 64^3 torus of
//    relative coordinates, as a BEAT (floquetLevel: e^(-i V/2) e^(-i T) e^(-i V/2), the rule's phase form), filtered
//    from the Hamiltonian level; R from its E(K) at K = 0.04 and 0.02 along the axis. It leaves out the flipped channels
//    (evanescent) and the rule's contact map at y = 0 (the meeting, the collision and the store, replaced by A (x) A):
//    those are what the run tests. The Floquet form moves E by 0.005 from the Hamiltonian at a_c 3 (probe 3).
//    The model's numbers (the run prints them from the same code): heavy a_c 2.5, 3, 3.5: E_b 0.194 (Hamiltonian), 0.0815,
//    0.0474, R 3.17 (Hamiltonian), 1.839, 1.547; light a_c 4: E_b ~0.09, R ~1.64. THIS MODEL IS THE GATE'S REFERENCE,
//    fixed before probe 4, and PROBE 4 REFUTES IT (disclosed below): on the rule the contact site is nearly empty and the
//    level is far shallower, as if the contact map were a HARD CORE. The hard-core model (the contact site removed; a
//    READ, written after probe 4, gating nothing) is printed beside it: heavy a_c 2.5, 3, 3.5: E_b 0.0569, 0.0406,
//    0.0304, R 1.475, 1.440, 1.417 (probe 5). PREDICTED: every heavy level held; R 1% from the open model FAILS at
//    every path point (C3 fails); R falls along the path toward R_walk; the light member fails the hold (point 6).
// 10. STAGE 2, THE DYNAMICAL LIGHT: WHAT IT WOULD TAKE, NOT RUN. The static phase is the light's longitudinal part (the
//    rule's own flux energy equals (pi / D)(G(0) - G(r)) to 1e-9, E-FRC-0241 G3). What it lacks: (a) the transverse field,
//    whose O(v^2/c^2) exchange (the Darwin term) is exactly the missing (8/3) E_b of point 4 (the Coulomb-plus-Darwin
//    Lagrangian is Lorentz invariant to that order), so it is what would take R_static - R_walk toward the Lorentz value;
//    (b) retardation and self-energy, O(alpha^3). Exactly, the pair's state times the light's: in Coulomb gauge with at
//    most ONE transverse photon on a side-64 husk (2 x 64^3 = 5.2e5 modes), the gate ball's 2.7e8 amplitudes become 1.4e14
//    (2.2 PB), out of reach by 10^6; E-FRC-0252's Peierls coupling is one way (no back-action), and a classical
//    (permutation) light would write each matter branch's path into the field, so a stationary level needs the quantum
//    light (E-FRC-0230's Weyl pairs). Affordable next: the Darwin term as a second stated stand-in (a momentum-dependent
//    two-body piece), and the cubic group at K = 0 (48 elements) to reach a_B ~ 5 to 8 docks.
//
// GATES, fixed before the gate run (the plan: GATE_PLAN; the ball radius 44, the window 40; the heavy path a_c 2.5, 3,
// 3.5, the main point a_c 3.5; the light member at a_c 4).
//  THE HOLD WITNESS H (E-SPN-0148's; the absorbed weight and the edge set here from the hard-core model's tails, probe 5:
//  at a_c 3.5 the shells fall ~0.67 a dock, so ~1e-7 on the ball's two outermost): over 256 beats from the level, the
//  weight within husk radius 40 >= 1 - 1e-3 at every beat, the fidelity |<v|psi_t>|^2 >= 1 - 1e-3 at every even beat,
//  the weight absorbed at the ball's edge <= 1e-4 in all, and the level's two outermost shells <= 1e-6.
//  C1 A LEVEL HOLDS: the main point's level (the start: both members in their dock's uniform mode with the open model's
//     relative wave function; the filter S 64 at the model's phase, S 1024 and S 256 at the read phase) holds H.
//  C2 ISOTROPIC: its K^2 coefficient (K = 0.04 u and 0.02 u, Richardson, filter S 64) along the axis, face, body and a
//     generic direction within 1e-6 of the axis's (relative).
//  C3 R AGAINST THE MODEL, TRENDING DOWN: at every path point the level holds H and R = c*^2 / (2 a E) is within 1% of
//     the (open) model's R; and R falls strictly along the path as the binding lightens (a_c 2.5, 3, 3.5). The limit the model
//     derives is R_walk = tan m / m (point 4), not 1: the gate reads the trend, the verdict states the limit.
//  C4 NO PART EXCEEDS c*: the band followed along the axis and the face to |K| 0.4, 0.8, 1.2 (filter S 128); at every
//     followed point (|lambda2| >= 0.99, residual <= 1e-2) the Hellmann-Feynman speed (the 3d step) is at most c* (1 +
//     1e-6); the 0.4 point must be followed on both.
//  C5 THE VACUUM IS INERT: the exact rule at both members' units, 128 beats, on the D4 empty boxes (sides 4, 8), the D4
//     love sea (side 4), and the quotient's empty mesh and love sea (side 4): one branch equal to the vacuum with its exact
//     amplitude every beat, no charge (and on D4 no collision moves a value).
//  C6 LIGHTER MEMBERS: the light member's level at a_c 4 (the same procedure) holds H. PREDICTED TO FAIL (point 6).
// INSTRUMENT (a failure makes the verdict partial). I1 at both units: norm one exactly; the one-vibe matrix alike for
//  love and fear and both parities; the shape X (I + beta 1 1^T) to 1e-12; the empty factor S alone; the band equal to
//  the closed form (S, -S, 11 at -m, 11 at pi - m) on 64 Weyl momenta, 0 and (pi, pi, 0) to 1e-9; the contact maps
//  unitary on the 576 live states to 1e-12. I3 one beat of the rule on the side-4 quotient box (no potential; the
//  potential is the stand-in, not the rule) against the meson beat on the quotient ball, from every live contact state
//  and every slot pair at y = (-1, -1, 0) and (-1, 0, 0), both parities, both units: 1e-12, every division exact, no
//  stray branch. I4 the threaded beat with the potential on equals the one-thread beat (ball 6, K = (0.3, -0.1, 0.2), 4
//  beats): entries 1e-13, sums 1e-12. I5 the Green table (FFT tori 128 and 256, Richardson) against husk-coulomb's direct
//  mode sums at 8 points to 1e-11; the table against the closed form at its cube's face (|y|_max 16) to 1e-9; 24 pi r
//  G(r) within 2e-4 of 1 at r 6 to 20 on the axis, face and body. I6 Hellmann-Feynman against the central difference at
//  K 0.4 +- 0.02 on the axis to 1e-3. I7 the model: alpha 0 gives 2m to 1e-9; every Floquet level's residual <= 1e-6 and
//  every Lanczos drift <= 1e-10.
// CONTROLS (a failure makes the verdict partial). K1 the potential off: from the main point's start at its predicted
//  phase (S 256) no level holds H. K2 the potential's sign turned (repulsive): likewise. K3 H sees a beat: the level
//  mixed with 2e-3 of the start's remainder fails the fidelity clause.
// Verdict: partial if the instrument or a control fails; pass if C1 to C6 hold; fail otherwise.
// PREDICTED VERDICT: fail on C3 (the open model) and C6; C1, C2, C4, C5 hold.
//
// PROBES BEFORE THE GATE RUN, disclosed (the gates were written after probes 1 to 3 and revised after 4 and 5, as
// stated; none moved after the gate run began). tmp/coul-probe1.log: G(0), the FFT table against the direct sums (to
// 1e-14 inside r 12), the band closed form against the rule at four units (1.6e-15), the channel census, and the open
// model at a_B 1.5 and 2, where the level collapses onto contact (E_b 0.97 and 0.45 at the heavy member): the core.
// tmp/coul-probe2-model.log: the open model at a_c 2.5 to 5 at three members (point 5's numbers); -time40*.log: the
// threaded beat on a 268k-site ball takes 0.85 s with every site full. tmp/coul-probe3.log: the Floquet form against the
// Hamiltonian (E 0.005 apart at a_c 3), the N = 128 tails, the table against the closed form (5e-9 at r 40, so the cube
// was cut to 16). tmp/coul-smoke.log: every code path on a 20-ball with short filters (unconverged, gating nothing; I3
// on 3,456 starts a unit, 0 differ; the vacuum exact; isotropy 3e-9). tmp/coul-probe4-*.log: the model filter needs S
// 1024 (residual 1e-13); the table's face error grows with the cube (2.8e-10 at 16, 1.1e-9 at 20); and ON THE RULE, the
// heavy a_c 3 level (ball 28, the gate's filters) sits at E 1.67655640, |lambda2| 0.99999815, residual 4.5e-6, contact
// weight 2.7e-3, singlet share 0.971, mean radius 5.72, held 128 beats (window 0.99969, fidelity 0.99976): binding 0.0376
// against the open model's 0.0815. tmp/coul-probe5.log: the hard-core model, E 1.67357 at a_c 3 (0.003 from the rule).
// tmp/coul-probe4-engine35.log (started before the gate run, finished during it; nothing changed after it): at a_c 3.5
// on a 40-ball the rule's level sits at E 1.68602541 (binding 0.0281; hard core 0.0304, open 0.0474), |lambda2|
// 0.99999996, residual 8.2e-6, contact 2.1e-3, held 128 beats (window 0.999993, fidelity 0.999995, absorbed 5.2e-6).
// These probes moved the path from (3, 3.5, 4) on a 48-ball to (2.5, 3, 3.5) on a 44-ball, the witness's absorbed and
// edge clauses from 1e-6 and 1e-8 to 1e-4 and 1e-6 (the rule's level is more extended than the model the first values
// were read from), the filter lengths, and the cube, and made C3's prediction a failure.
//
// Depth L2: a two-body quantum walk on the husk lattice with a stated static Coulomb potential, the rule's own dock
// pieces read exactly and checked against the rule on a box. DETERMINISM: no random numbers; placed starts, filtered
// levels, Weyl momenta. NOTHING MOVES: the pieces hand values between slots of one dock, the stream takes each slot's
// value one dock along, the potential is a phase.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { singletKinematics, singletLevel, weylMomenta } from '@/code/measure/singlet-kinematics'
import { cyclePhases } from '@/code/measure/swap-cone'
import { infiniteGreenDifferences, infiniteGreenZero } from '@/code/measure/husk-coulomb'
import { shareSpace, threadEngine } from '@/code/measure/meson-pool'
import { ringScale, type RingUnit } from '@/code/rule/swap-mixer'
import {
  boxCheck,
  boxStarts,
  buildLevel,
  contactDockExact,
  contactUnitarity,
  CONTACT_STATES,
  emptyFactor,
  levelVelocity,
  mesonInner,
  mesonSpace,
  newFlow,
  normalizeMeson,
  overEmpty,
  ringUnit,
  serialEngine,
  setMomentum,
  singletShare,
  sparseOf,
  STORE_BASE,
  storeWeight,
  unitAngle,
  unitNormExact,
  vacuumRun,
  vibeDockExact,
  vibeShape,
  watchLevel,
  type MesonEngine,
  type MesonState,
  type Sparse,
  type VibeShape,
} from '@/code/measure/swap-string'
import {
  channelGap,
  coulombModel,
  floquetLevel,
  floquetSpace,
  greenAt,
  greenFar,
  huskBall,
  huskBoxCell,
  huskBoxTables,
  huskGreenTable,
  huskPoint,
  huskShells,
  huskVacuumRun,
  kmaxOf,
  meanRadius,
  modelStart,
  pairChannels,
  setPotential,
  singletEpsClosed,
  weightWithinRadius,
  type GreenTable,
} from '@/code/measure/husk-meson'

const C_STAR = Math.SQRT1_2
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8]
const GENERIC = [...GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW)), 0]
const DIRECTIONS: readonly { name: string; u: number[] }[] = [
  { name: 'axis', u: [1, 0, 0, 0] },
  { name: 'face', u: [s2, s2, 0, 0] },
  { name: 'body', u: [s3, s3, s3, 0] },
  { name: 'generic', u: GENERIC },
]
// the members: the heavy unit w^4 ((3 + w)/(3 + w^2)) (ringUnit(1, 4), m 0.857072, inside the closure window) and the
// light unit w^2 (ringUnit(0, 4), m = pi/6, E-SPN-0146 and 0147's member)
const HEAVY: readonly [number, number] = [1, 4]
const LIGHT: readonly [number, number] = [0, 4]

export type CoulombPlan = {
  ball: number
  window: number
  threads: number
  path: readonly number[]
  light: number
  sCoarse: number
  sFirst: number
  sSecond: number
  sMove: number
  sFollow: number
  sControl: number
  holdBeats: number
  vacuumBeats: number
  vacuumSides: readonly number[]
  modelN: number
  tailN: number
  modelS: number
  modelPasses: number
  greenL: number
  greenC: number
}

// the gate plan: the path of continuum Bohr radii a_c (the coupling alpha = 24 pi / (tan m a_c)), the main point its
// last (the lightest binding), the light member at its own a_c
export const GATE_PLAN: CoulombPlan = {
  ball: 44,
  window: 40,
  threads: 12,
  path: [2.5, 3, 3.5],
  light: 4,
  sCoarse: 64,
  sFirst: 1024,
  sSecond: 256,
  sMove: 64,
  sFollow: 128,
  sControl: 256,
  holdBeats: 256,
  vacuumBeats: 128,
  vacuumSides: [4, 8],
  modelN: 64,
  tailN: 128,
  modelS: 1024,
  modelPasses: 2,
  greenL: 128,
  greenC: 16,
}

const HOLD = 1e-3
const ABSORB = 1e-4
const EDGE = 1e-6
const KAPPA = 0.04
const ISOTROPY = 1e-6
const R_TOLERANCE = 0.01
const FOLLOW_K: readonly number[] = [0.4, 0.8, 1.2]
const FOLLOW_LAMBDA = 0.99
const FOLLOW_RESIDUAL = 1e-2
const SPEED_TOLERANCE = 1e-6
const FD_H = 0.02
const FD_TOLERANCE = 1e-3
const MIX = 2e-3
// every reading borrows at most two pooled states at once (filterMeson, readLevel, watchLevel, levelVelocity)
const POOL = 2
const BOX_SIDE = 4
const CHECK_BALL = 5
const THREAD_BALL = 6
const THREAD_BEATS = 4
const K_THREAD = [0.3, -0.1, 0.2, 0]
const MATRIX_TOLERANCE = 1e-12
const BAND_TOLERANCE = 1e-9
const ENTRY_TOLERANCE = 1e-12
const THREAD_TOLERANCE = 1e-13
const SUM_TOLERANCE = 1e-12
const GREEN_TOLERANCE = 1e-11
const FACE_TOLERANCE = 1e-9
const UNITY_TOLERANCE = 2e-4
const MODEL_RESIDUAL = 1e-6
const LANCZOS_DRIFT = 1e-10
const LANCZOS_STEPS = 260
const CALIBRATION_TOLERANCE = 1e-9
const BAND_MOMENTA = 64
const R_WALK_SCALES = [0.1, 0.2, 0.3, 0.4, 0.5]

const flag = (b: boolean): number => (b ? 1 : 0)
const norm3 = (v: readonly number[]): number => Math.hypot(v[0] as number, v[1] as number, v[2] as number)

type Member = {
  name: string
  u: RingUnit
  m: number
  sign: number
  mid: number
  shape: VibeShape
  contact: [Sparse, Sparse]
  live: number[]
  unitarity: number
  bandGap: number
  alike: boolean
  emptyOk: boolean
  Rwalk: number
  ok: boolean
}

// the member at a unit: the rule's one-vibe matrix (both parities, love and fear alike), its shape, its band against
// the closed form S = arccos(cos m g), D = -S, 11 F- at -m, 11 F+ at pi - m (on 3d momenta, q4 = 0), the empty factor,
// the contact maps and their unitarity, and R_walk
function memberAt(name: string, unit: readonly [number, number]): Member {
  const u = ringUnit(unit[0], unit[1])
  const same = (x: ReturnType<typeof vibeDockExact>, y: ReturnType<typeof vibeDockExact>): boolean => x.k === y.k && x.entries.every((row, i) => row.every((e, j) => e[0] === (y.entries[i] as [bigint, bigint][])[j]![0] && e[1] === (y.entries[i] as [bigint, bigint][])[j]![1]))
  const L0 = vibeDockExact(1, 0, u)
  const alike = same(L0, vibeDockExact(1, 1, u)) && same(L0, vibeDockExact(-1, 0, u)) && same(L0, vibeDockExact(-1, 1, u))
  const A = overEmpty(L0, u)
  const shape = vibeShape(A)
  const lv = singletLevel({ re: A.re, im: A.im }, DOCK_ROOTS, 12)
  const m = lv.m
  const memberEps = (ph: number): number => lv.sign * -wrap(ph - lv.midPhase)
  let bandGap = 0

  for (const q of [...weylMomenta(BAND_MOMENTA).map(k => k.slice(0, 3)), [0, 0, 0], [Math.PI, Math.PI, 0]]) {
    const rule = cyclePhases([{ re: A.re, im: A.im }], DOCK_ROOTS, [...q, 0])
      .map(memberEps)
      .sort((a, b) => a - b)
    const S = singletEpsClosed(m, q)
    const closed = [S, -S, ...Array<number>(11).fill(-m), ...Array<number>(11).fill(Math.PI - m)].map(wrap).sort((a, b) => a - b)

    for (let i = 0; i < 24; i++) bandGap = Math.max(bandGap, Math.abs(wrap((rule[i] as number) - (closed[i] as number))))
  }

  const empty = emptyFactor(u)
  const emptyOk = empty.alone && empty.a === ringScale(u) && empty.b === 0n && empty.k === 0
  const Cf = [overEmpty(contactDockExact(0, u), u), overEmpty(contactDockExact(1, u), u)]
  const live = [...Array(CONTACT_STATES).keys()].filter(i => i >= STORE_BASE || Math.floor(i / 24) !== i % 24)
  const unitarity = Math.max(...Cf.map(M => contactUnitarity(M, live)))
  const Rwalk = (C_STAR * C_STAR) / singletKinematics({ re: A.re, im: A.im }, DOCK_ROOTS, lv, [1, 0, 0, 0], R_WALK_SCALES).c2
  const ok = unitNormExact(u) && alike && shape.gap <= MATRIX_TOLERANCE && emptyOk && bandGap <= BAND_TOLERANCE && unitarity <= MATRIX_TOLERANCE

  return { name, u, m, sign: lv.sign, mid: lv.midPhase, shape, contact: [sparseOf(Cf[0] as (typeof Cf)[number]), sparseOf(Cf[1] as (typeof Cf)[number])], live, unitarity, bandGap, alike, emptyOk, Rwalk, ok }
}

type Prediction = {
  aC: number
  alpha: number
  alphaPrime: number
  V0: number
  V1: number
  EbContinuum: number
  hamiltonian: number
  lanczosDrift: number
  epsShifted: number
  E: number
  Eb: number
  a: number
  R: number
  residual: number
  contact: number
  meanR: number
  beyondWindow: number
  edgeShells: number
  nearest: { name: string; distance: number }
  piImage: { name: string; distance: number }
  psi: Float64Array
  hardCoreE: number
  hardCoreR: number
  hardCoreMeanR: number
}

// the prediction at one point: the Hamiltonian single-channel level (the start), the Floquet single-channel level at
// K = 0, kappa and kappa / 2 along the axis (the energy and the K^2 coefficient: R), the N = tailN level's tail beyond the
// window and on the ball's two outermost shells, and the channels at E and E + pi
function predict(member: Member, aC: number, table: GreenTable, plan: CoulombPlan): Prediction {
  const { m } = member
  const alphaPrime = 1 / (Math.tan(m) * aC)
  const alpha = 24 * Math.PI * alphaPrime
  const ham = coulombModel({ m, alpha, table, N: plan.modelN, K: [0, 0, 0], steps: LANCZOS_STEPS, start: aC })
  const eps: number[] = []
  let residual = 0

  for (const K of [
    [0, 0, 0],
    [KAPPA, 0, 0],
    [KAPPA / 2, 0, 0],
  ]) {
    const fs = floquetSpace({ m, alpha, table, N: plan.modelN, K })
    const lv = floquetLevel(fs, ham.psi, new Float64Array(ham.psi.length), ham.E, plan.modelS, plan.modelPasses)

    eps.push(lv.eps)
    residual = Math.max(residual, lv.residual)
  }

  const a = (16 * ((eps[2] as number) - (eps[0] as number)) - ((eps[1] as number) - (eps[0] as number))) / (3 * KAPPA * KAPPA)
  const E = (eps[0] as number) - alpha * table.g0
  const tail = coulombModel({ m, alpha, table, N: plan.tailN, K: [0, 0, 0], steps: LANCZOS_STEPS, start: aC })
  const channels = pairChannels(m)
  // READ, gating nothing: the hard-core model (the contact site removed), written after probe 4 found the rule's level
  // far shallower than the open model's
  const hcHam = coulombModel({ m, alpha, table, N: plan.modelN, K: [0, 0, 0], steps: LANCZOS_STEPS, start: aC + 2, hardCore: true })
  const hcEps = [
    [0, 0, 0],
    [KAPPA, 0, 0],
    [KAPPA / 2, 0, 0],
  ].map(K => floquetLevel(floquetSpace({ m, alpha, table, N: plan.modelN, K, hardCore: true }), hcHam.psi, new Float64Array(hcHam.psi.length), hcHam.E, plan.modelS, plan.modelPasses).eps)
  const hcA = (16 * ((hcEps[2] as number) - (hcEps[0] as number)) - ((hcEps[1] as number) - (hcEps[0] as number))) / (3 * KAPPA * KAPPA)
  const hcE = (hcEps[0] as number) - alpha * table.g0

  return {
    aC,
    alpha,
    alphaPrime,
    V0: -alpha * table.g0,
    V1: -alpha * (table.g0 - greenAt(table, 1, 0, 0)),
    EbContinuum: (Math.tan(m) * alphaPrime * alphaPrime) / 2,
    hamiltonian: ham.E - alpha * table.g0,
    lanczosDrift: Math.max(ham.converged, tail.converged),
    epsShifted: eps[0] as number,
    E,
    Eb: 2 * m - E,
    a,
    R: (C_STAR * C_STAR) / (2 * a * E),
    residual,
    contact: ham.shells[0] as number,
    meanR: ham.meanR,
    beyondWindow: tail.beyond(plan.window),
    edgeShells: (tail.shells[plan.ball] as number) + (tail.shells[plan.ball - 1] as number),
    nearest: channelGap(E, channels, ['SS']),
    piImage: channelGap(E + Math.PI, channels),
    psi: ham.psi,
    hardCoreE: hcE,
    hardCoreR: (C_STAR * C_STAR) / (2 * hcA * hcE),
    hardCoreMeanR: hcHam.meanR,
  }
}

export default experiment({
  id: 'spin/husk-coulomb-meson',
  code: 'E-SPN-0155',
  title: 'a love and a fear bound by the husk Coulomb law on the swap-coin rule (the static stand-in): not yet run',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return huskCoulombRun(GATE_PLAN)
  },
})

export function huskCoulombRun(plan: CoulombPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- I1, I2: the members ----------------
  const heavy = memberAt('heavy', HEAVY)
  const light = memberAt('light', LIGHT)
  const I1 = heavy.ok && light.ok

  log('I1 I2 members')

  // ---------------- I5: the Green's function ----------------
  const G0 = infiniteGreenZero('husk', 64).value
  const table = huskGreenTable(plan.greenL, plan.greenC, G0)
  const checkPoints = [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
    [2, 0, 0],
    [3, 2, 1],
    [6, 0, 0],
    [10, 4, 3],
    [12, 5, 0],
  ]
  const direct = infiniteGreenDifferences('husk', 64, checkPoints)
  const fftGap = Math.max(...checkPoints.map((p, i) => Math.abs(greenAt(table, p[0] as number, p[1] as number, p[2] as number) - (direct.value[i] as number))))
  const C = plan.greenC
  const facePoints = [
    [C, 0, 0],
    [C, C, 0],
    [C, C, C],
    [C, 7, 3],
    [C, -11, 5],
  ]
  const faceGap = Math.max(...facePoints.map(p => Math.abs(greenAt(table, p[0] as number, p[1] as number, p[2] as number) - greenFar(G0, p[0] as number, p[1] as number, p[2] as number))))
  let worstUnity = 0

  for (const d of [
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
  ]) {
    for (let n = 1; n <= 20; n++) {
      const p = d.map(x => x * n)
      const r = norm3(p)

      if (r < 6 || r > 20) continue
      worstUnity = Math.max(worstUnity, Math.abs(24 * Math.PI * r * (G0 - greenAt(table, p[0] as number, p[1] as number, p[2] as number)) - 1))
    }
  }

  const I5 = fftGap <= GREEN_TOLERANCE && faceGap <= FACE_TOLERANCE && worstUnity <= UNITY_TOLERANCE

  log('I5 green')

  // ---------------- the predictions and I7 ----------------
  const calibration = Math.max(...[heavy, light].map(mb => Math.abs(coulombModel({ m: mb.m, alpha: 0, table, N: plan.modelN, K: [0, 0, 0], steps: LANCZOS_STEPS, start: 3 }).E - 2 * mb.m)))
  const path = plan.path.map(aC => {
    const p = predict(heavy, aC, table, plan)

    log(`predict heavy a_c ${aC}`)

    return p
  })
  const lightPred = predict(light, plan.light, table, plan)
  const main = path[path.length - 1] as Prediction
  const I7 = calibration <= CALIBRATION_TOLERANCE && [...path, lightPred].every(p => p.residual <= MODEL_RESIDUAL && p.lanczosDrift <= LANCZOS_DRIFT)

  log('predictions')

  // ---------------- I3: the rule on the side-4 quotient box against the meson beat (no potential) ----------------
  const box = huskBoxTables(BOX_SIDE)
  const X = huskBoxCell(BOX_SIDE, 1, 1, 1)
  const Xf1 = huskBoxCell(BOX_SIDE, 2, 2, 1)
  const Xf2 = huskBoxCell(BOX_SIDE, 2, 1, 1)
  const boxFor = (mb: Member): { worst: number; differ: number; checked: number; inexact: number; stray: number } => {
    const checkSpace = mesonSpace(huskBall(CHECK_BALL), mb.shape, mb.contact, 0, [0, 0, 0, 0])
    const b1 = boxCheck(box, boxStarts(mb.live, X, Xf1, huskPoint(-1, -1, 0)), checkSpace, () => mb.u, ENTRY_TOLERANCE)
    const b2 = boxCheck(box, boxStarts([], X, Xf2, huskPoint(-1, 0, 0)), checkSpace, () => mb.u, ENTRY_TOLERANCE)

    return { worst: Math.max(b1.worst, b2.worst), differ: b1.differ + b2.differ, checked: b1.checked + b2.checked, inexact: b1.inexact + b2.inexact, stray: b1.stray + b2.stray }
  }
  const boxHeavy = boxFor(heavy)
  const boxLight = boxFor(light)
  const I3 = [boxHeavy, boxLight].every(b => b.differ === 0 && b.inexact === 0 && b.stray === 0)

  log('I3 box')

  // ---------------- I4: the threaded beat against the one-thread beat, the potential on ----------------
  let threadGap = 0
  let threadSums = 0
  {
    const raw = mesonSpace(huskBall(THREAD_BALL), heavy.shape, heavy.contact, 0, K_THREAD)

    setPotential(raw, table, main.alpha, heavy.sign)

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

      for (let k = 0; k < b.re.length; k++) threadGap = Math.max(threadGap, Math.abs((b.re[k] as number) - (d.re[k] as number)), Math.abs((b.im[k] as number) - (d.im[k] as number)))
      threadSums = Math.max(threadSums, Math.abs(l1 - l2) / Math.max(1, l1), Math.abs(f1.weight - f2.weight) / f1.weight, ...[0, 1, 2, 3].map(k => Math.abs((f1.v[k] as number) - (f2.v[k] as number)) / f1.weight))
      a.re.set(b.re)
      a.im.set(b.im)
      c.re.set(d.re)
      c.im.set(d.im)
    }

    thr.close()
  }
  const I4 = threadGap <= THREAD_TOLERANCE && threadSums <= SUM_TOLERANCE

  log('I4 threads')

  // ---------------- C5: the vacuum ----------------
  const vacuum = [heavy, light].flatMap(mb => [
    ...plan.vacuumSides.map(side => ({ member: mb.name, kind: `D4 side ${side} empty`, ...vacuumRun(mb.u, side, 0, plan.vacuumBeats) })),
    { member: mb.name, kind: `D4 side ${BOX_SIDE} love sea`, ...vacuumRun(mb.u, BOX_SIDE, 1, plan.vacuumBeats) },
    { member: mb.name, kind: `husk side ${BOX_SIDE} empty`, permutes: 0, ...huskVacuumRun(mb.u, BOX_SIDE, 0, plan.vacuumBeats) },
    { member: mb.name, kind: `husk side ${BOX_SIDE} love sea`, permutes: 0, ...huskVacuumRun(mb.u, BOX_SIDE, 1, plan.vacuumBeats) },
  ])
  const C5 = vacuum.every(v => v.exact && v.charged === 0 && v.permutes === 0)

  log('C5 vacuum')

  // ---------------- the engine: the heavy member on the gate ball ----------------
  const ball = huskBall(plan.ball)

  log(`ball ${plan.ball}: ${ball.points.length} sites`)

  type Held = { hold: ReturnType<typeof watchLevel>; shells: number[]; edge: number; holds: boolean }
  type Level = { v: MesonState; phase: number; eps: number; E: number; lambda: number; residual: number; coarseEps: number; firstEps: number }

  const run = (mb: Member, work: (engine: MesonEngine, tools: { phaseOf: (eps: number) => number; epsNear: (phase: number, ref: number) => number; witness: (v: MesonState) => Held; level: (p: Prediction) => Level; energyAt: (K: readonly number[], from: MesonState, phase: number, S: number, ref: number) => { eps: number; v: MesonState; lambda: number; residual: number } }) => void): void => {
    const space = shareSpace(mesonSpace(ball, mb.shape, mb.contact, 0, [0, 0, 0, 0]))
    const engine = threadEngine(space, plan.threads, POOL)
    const phaseOf = (eps: number): number => wrap(2 * mb.mid - mb.sign * eps)
    const epsNear = (phase: number, ref: number): number => ref + wrap(mb.sign * -wrap(phase - 2 * mb.mid) - ref)
    const witness = (v: MesonState): Held => {
      const hold = watchLevel(engine, v, plan.holdBeats, 0, s => weightWithinRadius(ball, s, plan.window))
      const shells = huskShells(ball, v)
      const edge = (shells[shells.length - 1] as number) + (shells[shells.length - 2] as number)

      return { hold, shells, edge, holds: hold.leastWindow >= 1 - HOLD && hold.leastFidelity >= 1 - HOLD && hold.absorbed <= ABSORB && edge <= EDGE }
    }
    const level = (p: Prediction): Level => {
      setPotential(space, table, p.alpha, mb.sign)
      setMomentum(space, [0, 0, 0, 0])

      const start = modelStart(ball, p.psi, plan.modelN)
      const coarse = buildLevel(engine, start, phaseOf(p.epsShifted), plan.sCoarse, 1)
      const first = buildLevel(engine, coarse.v, coarse.read.phase, plan.sFirst, 1)
      const second = buildLevel(engine, first.v, first.read.phase, plan.sSecond, 1)
      const eps = epsNear(second.read.phase, p.epsShifted)

      return { v: second.v, phase: second.read.phase, eps, E: eps - p.alpha * G0, lambda: Math.hypot(...second.read.lambda2), residual: second.read.residual, coarseEps: epsNear(coarse.read.phase, p.epsShifted) - p.alpha * G0, firstEps: epsNear(first.read.phase, p.epsShifted) - p.alpha * G0 }
    }
    const energyAt = (K: readonly number[], from: MesonState, phase: number, S: number, ref: number): { eps: number; v: MesonState; lambda: number; residual: number } => {
      setMomentum(space, K)

      const lv = buildLevel(engine, from, phase, S, 1)

      return { eps: epsNear(lv.read.phase, ref), v: lv.v, lambda: Math.hypot(...lv.read.lambda2), residual: lv.read.residual }
    }

    try {
      work(engine, { phaseOf, epsNear, witness, level, energyAt })
    } finally {
      engine.close()
    }
  }

  // the K^2 coefficient along a direction from a level: K = kappa u and kappa u / 2 against K = 0, Richardson
  type Disp = { name: string; a: number; d1: number; d2: number; lambda: number; residual: number }

  const results: {
    main?: { lv: Level; held: Held; share: number; stored: number; meanR: number; dispersion: Disp[]; isotropy: number; R: number; follow: { name: string; points: { K: number; eps: number; speed: number; followed: boolean; lambda: number; residual: number }[] }[]; hfGap: number; mixedFidelity: number; off: { eps: number; held: Held }; repulsive: { eps: number; held: Held } }
    path: { aC: number; lv: Level; held: Held; share: number; stored: number; meanR: number; a: number; R: number }[]
    light?: { lv: Level; held: Held; share: number; stored: number; meanR: number }
  } = { path: [] }

  run(heavy, (engine, t) => {
    const dispersionOf = (lv: Level, dirs: readonly { name: string; u: number[] }[]): { zero: number; list: Disp[] } => {
      const zero = t.energyAt([0, 0, 0, 0], lv.v, lv.phase, plan.sMove, lv.eps).eps
      const list = dirs.map(d => {
        const e1 = t.energyAt(
          d.u.map(x => x * KAPPA),
          lv.v,
          lv.phase,
          plan.sMove,
          lv.eps,
        )
        const e2 = t.energyAt(
          d.u.map(x => (x * KAPPA) / 2),
          lv.v,
          lv.phase,
          plan.sMove,
          lv.eps,
        )
        const d1 = e1.eps - zero
        const d2 = e2.eps - zero

        log(`dispersion ${d.name}`)

        return { name: d.name, a: (16 * d2 - d1) / (3 * KAPPA * KAPPA), d1, d2, lambda: Math.min(e1.lambda, e2.lambda), residual: Math.max(e1.residual, e2.residual) }
      })

      return { zero, list }
    }

    // ---- the main point (the lightest binding on the path): C1, C2, C4, I6, K1 to K3 ----
    {
      const lv = t.level(main)

      log('C1 level')

      const held = t.witness(lv.v)

      log('C1 witness')

      // K3: the witness sees a beat
      let mixedFidelity = 1
      {
        // a fresh start, used in place (a gate-ball state is 4.3 GB, so no copy is kept)
        const w = modelStart(ball, main.psi, plan.modelN)
        const o = mesonInner(lv.v, w)

        for (let k = 0; k < w.re.length; k++) {
          const vr = lv.v.re[k] as number
          const vi = lv.v.im[k] as number

          w.re[k] = (w.re[k] as number) - (o[0] * vr - o[1] * vi)
          w.im[k] = (w.im[k] as number) - (o[0] * vi + o[1] * vr)
        }
        normalizeMeson(w)

        for (let k = 0; k < w.re.length; k++) {
          w.re[k] = Math.sqrt(1 - MIX) * (lv.v.re[k] as number) + Math.sqrt(MIX) * (w.re[k] as number)
          w.im[k] = Math.sqrt(1 - MIX) * (lv.v.im[k] as number) + Math.sqrt(MIX) * (w.im[k] as number)
        }

        mixedFidelity = watchLevel(engine, w, plan.holdBeats, 0, s => weightWithinRadius(ball, s, plan.window)).leastFidelity
      }

      log('K3')

      const disp = dispersionOf(lv, DIRECTIONS)
      const a0 = (disp.list[0] as Disp).a
      const isotropy = Math.max(...disp.list.map(x => Math.abs(x.a / a0 - 1)))
      const R = (C_STAR * C_STAR) / (2 * a0 * lv.E)
      const follow = DIRECTIONS.slice(0, 2).map(d => {
        let from = lv.v
        const points: { K: number; eps: number; speed: number; followed: boolean; lambda: number; residual: number }[] = []

        for (const k of FOLLOW_K) {
          const guess = lv.eps + a0 * k * k
          const e = t.energyAt(
            d.u.map(x => x * k),
            from,
            t.phaseOf(guess),
            plan.sFollow,
            guess,
          )
          const vel = levelVelocity(engine, e.v)
          const followed = e.lambda >= FOLLOW_LAMBDA && e.residual <= FOLLOW_RESIDUAL

          points.push({ K: k, eps: e.eps - main.alpha * G0, speed: norm3(vel), followed, lambda: e.lambda, residual: e.residual })
          from = e.v
          log(`C4 ${d.name} ${k}`)
        }

        return { name: d.name, points }
      })
      // I6: Hellmann-Feynman against the central difference at K 0.4 along the axis
      let hfGap = NaN
      {
        const k = FOLLOW_K[0] as number
        const guess = lv.eps + a0 * k * k
        const at = t.energyAt([k, 0, 0, 0], lv.v, t.phaseOf(guess), plan.sFollow, guess)
        const vel = levelVelocity(engine, at.v)
        const up = t.energyAt([k + FD_H, 0, 0, 0], at.v, t.phaseOf(at.eps), plan.sFollow, at.eps)
        const down = t.energyAt([k - FD_H, 0, 0, 0], at.v, t.phaseOf(at.eps), plan.sFollow, at.eps)
        const slope = (up.eps - down.eps) / (2 * FD_H)

        hfGap = Math.abs(Math.abs(slope) - Math.abs(vel[0] as number)) / Math.abs(slope)
      }

      log('I6')

      // K1 and K2: the potential off, and the potential's sign turned (repulsive), from the same start at the main
      // point's predicted phase
      const control = (alpha: number): { eps: number; held: Held } => {
        setPotential(engine.space, table, alpha, heavy.sign)
        setMomentum(engine.space, [0, 0, 0, 0])

        const start = modelStart(ball, main.psi, plan.modelN)
        const shift = alpha * G0
        const c = buildLevel(engine, start, t.phaseOf(main.E + shift), plan.sControl, 1)

        return { eps: t.epsNear(c.read.phase, main.E + shift) - shift, held: t.witness(c.v) }
      }
      const off = control(0)

      log('K1')

      const repulsive = control(-main.alpha)

      log('K2')

      results.main = { lv, held, share: singletShare(ball, lv.v), stored: storeWeight(ball, lv.v), meanR: meanRadius(ball, lv.v), dispersion: disp.list, isotropy, R, follow, hfGap, mixedFidelity, off, repulsive }
    }

    // ---- the rest of the path: the level, the witness, the axis K^2 coefficient ----
    for (const p of path.slice(0, -1)) {
      const lv = t.level(p)
      const held = t.witness(lv.v)
      const disp = dispersionOf(lv, DIRECTIONS.slice(0, 1))
      const a = (disp.list[0] as Disp).a

      results.path.push({ aC: p.aC, lv, held, share: singletShare(ball, lv.v), stored: storeWeight(ball, lv.v), meanR: meanRadius(ball, lv.v), a, R: (C_STAR * C_STAR) / (2 * a * lv.E) })
      log(`path a_c ${p.aC}`)
    }
  })

  // ---- C6: the light member ----
  run(light, (_engine, t) => {
    const lv = t.level(lightPred)
    const held = t.witness(lv.v)

    results.light = { lv, held, share: singletShare(ball, lv.v), stored: storeWeight(ball, lv.v), meanR: meanRadius(ball, lv.v) }
    log('C6 light')
  })

  const M = results.main as NonNullable<typeof results.main>
  const Lt = results.light as NonNullable<typeof results.light>
  const mainPath = { aC: main.aC, lv: M.lv, held: M.held, share: M.share, stored: M.stored, meanR: M.meanR, a: (M.dispersion[0] as Disp).a, R: M.R }
  const pathAll = [...results.path, mainPath].sort((x, y) => x.aC - y.aC)
  const predOf = (aC: number): Prediction => path.find(p => p.aC === aC) as Prediction
  const C1 = M.held.holds
  const C2 = M.isotropy <= ISOTROPY
  const C3 = pathAll.every(p => p.held.holds && Math.abs(p.R / predOf(p.aC).R - 1) <= R_TOLERANCE) && pathAll.every((p, i) => i === 0 || p.R < (pathAll[i - 1] as typeof p).R)
  const speeds = M.follow.flatMap(f => f.points.filter(p => p.followed).map(p => p.speed))
  const topSpeed = speeds.length ? Math.max(...speeds) : NaN
  const C4 = M.follow.every(f => (f.points[0] as { followed: boolean }).followed) && speeds.every(s => s <= C_STAR * (1 + SPEED_TOLERANCE))
  const C6 = Lt.held.holds
  const K1 = !M.off.held.holds
  const K2 = !M.repulsive.held.holds
  const K3 = M.mixedFidelity < 1 - HOLD
  const I6 = M.hfGap <= FD_TOLERANCE
  const instrument = I1 && I3 && I4 && I5 && I6 && I7
  const controls = K1 && K2 && K3
  const status = !instrument || !controls ? 'partial' : C1 && C2 && C3 && C4 && C5 && C6 ? 'pass' : 'fail'
  const heldLine = (h: Held): string => `window ${h.hold.leastWindow.toFixed(6)}, fidelity ${h.hold.leastFidelity.toFixed(6)}, absorbed ${h.hold.absorbed.toExponential(2)}, edge ${h.edge.toExponential(2)}, holds ${h.holds}`
  const shellLine = (h: Held): string => h.shells.map(x => x.toExponential(1)).join(' ')
  const predLine = (p: Prediction): string =>
    `a_c ${p.aC}: alpha ${p.alpha.toFixed(4)} (alpha' ${p.alphaPrime.toFixed(5)}), V0 ${p.V0.toFixed(4)}, V(1) ${p.V1.toFixed(4)}, E ${p.E.toFixed(8)} (Hamiltonian ${p.hamiltonian.toFixed(8)}), E_b ${p.Eb.toFixed(6)} (continuum ${p.EbContinuum.toFixed(6)}), a ${p.a.toExponential(8)}, R ${p.R.toFixed(6)}, contact ${p.contact.toExponential(2)}, mean r ${p.meanR.toFixed(3)}, beyond the window ${p.beyondWindow.toExponential(2)}, edge shells ${p.edgeShells.toExponential(2)}, nearest ${p.nearest.name} ${p.nearest.distance.toFixed(4)}, pi image ${p.piImage.name} ${p.piImage.distance.toFixed(4)}, model residual ${p.residual.toExponential(1)}, Lanczos drift ${p.lanczosDrift.toExponential(1)}; read, the hard-core model: E ${p.hardCoreE.toFixed(8)}, R ${p.hardCoreR.toFixed(6)}, mean r ${p.hardCoreMeanR.toFixed(3)}`
  const levelLine = (lv: Level): string => `E ${lv.E.toFixed(8)} (coarse ${lv.coarseEps.toFixed(5)}, first ${lv.firstEps.toFixed(6)}), |lambda2| ${lv.lambda.toFixed(10)}, residual ${lv.residual.toExponential(2)}`

  return verdict({
    status,
    claim: `C1 ${C1} (the main level a_c ${main.aC}: ${levelLine(M.lv)} against the model ${main.E.toFixed(8)}; ${heldLine(M.held)}); C2 ${C2} (isotropy ${M.isotropy.toExponential(2)}); C3 ${C3} (${pathAll.map(p => `a_c ${p.aC}: E ${p.lv.E.toFixed(6)} R ${p.R.toFixed(5)} against the model ${predOf(p.aC).E.toFixed(6)}, ${predOf(p.aC).R.toFixed(5)} (read, hard core: ${predOf(p.aC).hardCoreE.toFixed(6)}, ${predOf(p.aC).hardCoreR.toFixed(5)}), holds ${p.held.holds}`).join('; ')}; R_walk ${heavy.Rwalk.toFixed(6)}); C4 ${C4} (top Hellmann-Feynman speed ${(topSpeed / C_STAR).toFixed(6)} c*); C5 ${C5}; C6 ${C6} (the light member at a_c ${plan.light}: ${levelLine(Lt.lv)} against the model ${lightPred.E.toFixed(8)}; ${heldLine(Lt.held)}); K1 ${K1} (off: eps ${M.off.eps.toFixed(5)}, ${heldLine(M.off.held)}); K2 ${K2} (repulsive: eps ${M.repulsive.eps.toFixed(5)}, ${heldLine(M.repulsive.held)}); K3 ${K3} (mixed start fidelity ${M.mixedFidelity.toFixed(6)})`,
    metrics: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      C5: flag(C5),
      C6: flag(C6),
      instrument: flag(instrument),
      I1: flag(I1),
      I3: flag(I3),
      I4: flag(I4),
      I5: flag(I5),
      I6: flag(I6),
      I7: flag(I7),
      K1: flag(K1),
      K2: flag(K2),
      K3: flag(K3),
      mHeavy: heavy.m,
      mLight: light.m,
      RwalkHeavy: heavy.Rwalk,
      RwalkLight: light.Rwalk,
      G0,
      mainE: M.lv.E,
      mainEPredicted: main.E,
      mainEb: 2 * heavy.m - M.lv.E,
      mainR: M.R,
      mainRPredicted: main.R,
      isotropy: M.isotropy,
      topSpeedOverCStar: topSpeed / C_STAR,
      hfGap: M.hfGap,
      mainLeastWindow: M.held.hold.leastWindow,
      mainLeastFidelity: M.held.hold.leastFidelity,
      mainAbsorbed: M.held.hold.absorbed,
      mainEdge: M.held.edge,
      mainShare: M.share,
      mainStored: M.stored,
      mainMeanRadius: M.meanR,
      lightE: Lt.lv.E,
      lightEPredicted: lightPred.E,
      lightLeastWindow: Lt.held.hold.leastWindow,
      lightLeastFidelity: Lt.held.hold.leastFidelity,
      lightAbsorbed: Lt.held.hold.absorbed,
      lightEdge: Lt.held.edge,
      fftGap,
      faceGap,
      worstUnity,
      threadGap,
      threadSums,
      calibration,
      seconds: (Date.now() - started) / 1000,
    },
    control: { K1: flag(K1), K2: flag(K2), K3: flag(K3), instrument: flag(instrument) },
    notes: `L2. Members: heavy ${unitAngle(heavy.u).toFixed(6)} m ${heavy.m.toFixed(6)} kmax ${kmaxOf(heavy.m).toFixed(6)} R_walk ${heavy.Rwalk.toFixed(6)} (tan m / m ${(Math.tan(heavy.m) / heavy.m).toFixed(6)}) band ${heavy.bandGap.toExponential(2)} contact unitarity ${heavy.unitarity.toExponential(2)}; light m ${light.m.toFixed(6)} kmax ${kmaxOf(light.m).toFixed(6)} R_walk ${light.Rwalk.toFixed(6)} band ${light.bandGap.toExponential(2)} contact unitarity ${light.unitarity.toExponential(2)}. Green: G0 ${G0.toFixed(12)}, FFT against the direct sums ${fftGap.toExponential(2)}, face ${faceGap.toExponential(2)}, 24 pi r G - 1 at r 6..20 ${worstUnity.toExponential(2)}. Model calibration (alpha 0 lowest against 2m) ${calibration.toExponential(2)}. Predictions: ${path.map(predLine).join('; ')}; light ${predLine(lightPred)}. I3: heavy ${boxHeavy.checked} starts worst ${boxHeavy.worst.toExponential(2)} differ ${boxHeavy.differ} inexact ${boxHeavy.inexact} stray ${boxHeavy.stray}; light ${boxLight.checked} worst ${boxLight.worst.toExponential(2)} differ ${boxLight.differ} inexact ${boxLight.inexact} stray ${boxLight.stray}. I4 entries ${threadGap.toExponential(2)} sums ${threadSums.toExponential(2)}. Main: share ${M.share.toFixed(4)}, stores ${M.stored.toExponential(2)}, mean radius ${M.meanR.toFixed(3)}; dispersion ${M.dispersion.map(x => `${x.name} a ${x.a.toExponential(9)} (|lambda2| >= ${x.lambda.toFixed(6)}, residual <= ${x.residual.toExponential(1)})`).join('; ')}; follow ${M.follow.map(f => `${f.name}: ${f.points.map(p => `K ${p.K} E ${p.eps.toFixed(6)} speed ${(p.speed / C_STAR).toFixed(6)} c*${p.followed ? '' : ' (not followed)'} (|lambda2| ${p.lambda.toFixed(5)}, residual ${p.residual.toExponential(1)})`).join(', ')}`).join('; ')}; shells ${shellLine(M.held)}. Path: ${results.path.map(p => `a_c ${p.aC}: ${levelLine(p.lv)}, ${heldLine(p.held)}, share ${p.share.toFixed(4)}, stores ${p.stored.toExponential(2)}, mean radius ${p.meanR.toFixed(3)}, a ${p.a.toExponential(8)}, R ${p.R.toFixed(6)}`).join('; ')}. Light: share ${Lt.share.toFixed(4)}, stores ${Lt.stored.toExponential(2)}, mean radius ${Lt.meanR.toFixed(3)}, shells ${shellLine(Lt.held)}. K1 shells ${shellLine(M.off.held)}. K2 shells ${shellLine(M.repulsive.held)}. Vacuum: ${vacuum.map(v => `${v.member} ${v.kind} exact ${v.exact} charged ${v.charged}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
