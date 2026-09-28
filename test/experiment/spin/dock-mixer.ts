// THE DOCK-WIDE PAULI-BLOCKED MIXER (E-SPN-0140). note/research/vibe/roadmap/remaining-pieces.md, "Gravity's sign and the
// mixer's cone (E-GRV-0144, E-SPN-0136)": the frame mixer of E-SPN-0130 moves a hole only among its frame's 4 lines, so
// even massless its velocity reaches only 0.5 c along other frames' roots. The fix proposed there: a fermionic mixer over
// ALL 24 slots of a dock, M = exp(i theta N_U), U uniform. On the love sea every dock is full, so M is a phase there; a
// hole then hops among all 24 roots, the 24-cell, a spherical 5-design. Does its band become isotropic through K^4, and
// does a massless hole move at an isotropic c?
//
// THE PIECE (code/measure/dock-mixer). M = 1 + (e^(i theta) - 1) N_U, N_U = (1/24) sum_(i, j) c_i^dag c_j over the dock's
// 24 modes in the knit's mode order: on n vibes of one content it keeps with 1 + (e^(i theta) - 1) n / 24 or moves ONE vibe
// to one empty slot with (e^(i theta) - 1) / 24 times the fermion sign (hopSign); a dock of two contents is left alone
// (E-SPN-0096's gate, kept). Then the coin, then the working beat, on FLAT links (the candidate rule, E-SPN-0132).
//
// DERIVED BEFORE THE RUNS.
// 1. WHICH 24-SLOT MIXERS ARE COVARIANT AND EXACT. A covariant unitary is sum_j mu_j E_j over the commutant's idempotents;
//    in Z[w][1/2] each mu_j is a sixth root of unity (2 is inert in Z[w], so a unit-modulus element is a unit), and the
//    coefficient of each orbital is sum_j mu_j m_j P_k(j) / (24 v_k), which needs its numerator divisible by 3. For W(F4)
//    E-SPN-0094 found 216 of 7,776 in the ring and none reaching inner +-1. The run repeats that census with one generic
//    routine and extends it to W(D4) (192 elements, 7 orbitals, 6^7 = 279,936 choices): the probe (tmp/dock24-probe1.log)
//    found 7,776 in the ring and again NONE with an inner +-1 coefficient. So no mixer covariant under W(D4) or W(F4) and
//    exact in Z[w][1/2] moves a vibe to a root at 60 or 120 degrees: every exact one stays in the frame. The uniform mixer
//    is covariant under all 24! permutations, and its hop (e^(i theta) - 1) / 24 needs (w - 1) / 3 at theta = 2 pi / 3,
//    outside the ring for every sixth root theta (a root of unity is never 1 mod 3). It is exact in Z[w][1/6]: the ONE new
//    number is 1/3. The run carries exact branches with a global 3 per dock per beat (dockMixBranch scale3).
// 2. UNITARY, REVERSIBLE, A PHASE ON FULL OR EMPTY DOCKS. N_U has eigenvalues 0 and 1, so M = 1 + (e^(i theta) - 1) N_U is
//    unitary, M^-1 = M^dag = the same with -theta; a hop's amplitude and sign are symmetric in its two occupations (hopSign
//    counts the modes strictly between, the same set before and after), so M is symmetric and its adjoint is its entrywise
//    conjugate. On a full dock N_U = 1 (no empty slot to hop to), M = e^(i theta) = det m; on an empty dock M = 1. Checked
//    exactly in Z[w] over 24 on the sectors n = 0, 1, 2, 3, 21, 22, 23, 24 (2 x 2,024 + 2 x 276 + 2 x 24 + 2 states).
// 3. NO CASCADE, BY COUNTING. On the flat love sea with one hole: the piece keeps each dock's count and content (a full
//    dock takes a phase, the hole's dock of 23 loves stays 23 loves); the coin keeps each line's count (the hole's line
//    holds one vibe, the other 11 are full and take det C); the meeting, the pair move and K need two singles or a fear or
//    a store, none of which a one-hole sea holds (E-SPN-0130: K fires 0 times on seas); the stream moves every slot. So
//    one beat maps "the sea minus one slot" into itself, the footprint is exactly 1 at every beat of every branch, and
//    the induction closes. The run checks the one-beat step EXHAUSTIVELY (keyed: every dock, slot and beat parity;
//    superposed: every slot at 8 docks) and over 128 beats. The pair move and stream keep the sea stationary for the same
//    reason: nothing in a full, store-free, one-content sea is a single, a fear or a store, and on flat links every point
//    stays 0, so every dock stays one content (E-SPN-0130 showed working links split the points; here there are none).
// 4. THE HOLE'S BAND. In the hole basis Gamma(m) = det(m) Z conj(m) Z, Z = (-1)^(mode index): the hole's mixer phases
//    the STAGGERED vector z, antisymmetric on every line. The coin on the hole's line is C itself and each full line gives
//    zeta. So P_hole = zeta^11 C_n e^(i theta) (I + (e^(-i theta) - 1) z z^T / 24), and at K = 0 (C: symmetric 1,
//    antisymmetric zeta) its phases are, up to zeta^11 e^(i theta):
//        12 symmetric states at 1,   11 antisymmetric states orthogonal to z at zeta,   z alone at zeta e^(-i theta).
//    At the working point (n = 1, theta = 2 pi / 3 = arg zeta) z falls on the symmetric 12: multiplets 13 and 11. Else 12,
//    1, 11. A multiplet's MEAN phase is a W(F4)-invariant function of K (W(F4) maps the Bloch matrix to a conjugate, since
//    C and m are covariant, and the hole's is the vibe's conjugated by Z), and W(F4) has invariants only in degrees 2, 6,
//    8, 12, so the mean is a|K|^2 + b|K|^4 + (c|K|^6 + e I_6(K)) + ...: ISOTROPIC THROUGH K^4, its mean inverse mass tensor
//    a multiple of I, and its first anisotropy at K^6 in the one pattern a degree-6 invariant can have, sum_d (u . r_d)^6,
//    which is E-SPN-0126's M_6 (3/4 axis, 9/8 face, 11/12 body): (face - axis) / (body - axis) = (3/8) / (1/6) = 2.25
//    exactly. This is the 5-design statement, and it holds for any W(F4)-covariant rule (so it is L1, not evidence).
//    BUT A MULTIPLET'S BRANCHES ARE NOT ISOTROPIC. To second order the 11 antisymmetric states see Q diag(c (K . r_l)^2) Q,
//    Q the projector off z's line vector: along the axis e1, six lines have (K . r)^2 = K^2 and six have 0, so the 11
//    branches are {0 x 5, c/2, c x 5}; along a root (the face diagonal) three lines are orthogonal, so only 2 are flat.
//    The branch spectrum differs by direction at order K^2 (warped bands, as a cubic crystal's heavy and light holes). In
//    the 13-fold at the working point z couples at FIRST order to the 12 symmetric states with (K . r_l) / sqrt 12, so two
//    branches are LINEAR, E = +-|K| / sqrt 2 by the 2-design sum_l (K . r_l)^2 = 6 |K|^2: an isotropic massless pair at
//    speed c / 2, and 11 flat at first order.
// 5. THE MASSLESS GROUP VELOCITY. As n -> infinity the coin goes to I and the 23 modes off z sit at one phase; to first order
//    in K the group velocity along u of each branch is an eigenvalue of Q D Q, D = diag(u . r_d) (Hellmann-Feynman in the
//    degenerate space; theta drops out, and the hole's z gives the same spectrum as the uniform vector since Z D Z = D).
//    Along e1: d = +1 (6), 0 (12), -1 (6), so 1 is an eigenvalue 5 times: top speed 1 / sqrt 2 c = 0.7071 c. Along a root
//    (e12): d = sqrt 2 (1), 1/sqrt 2 (8), 0 (6), ...; the secular equation gives lambda^2 = 1 + sqrt3/2, top speed
//    (1 + sqrt 3) / (2 sqrt 2) = 0.9659 c. Along the body diagonal e123: 2/sqrt 3 three times, top sqrt(2/3) = 0.8165 c.
//    The root mean square over the 23 is sqrt(tr (Q D Q)^2 / 23) / sqrt 2 = sqrt(11/23) / sqrt 2 = 0.4890 c in EVERY
//    direction (the 2-design): the isotropic part is c/2, the top speed ranges 0.707 to 0.966 c. More generally, by
//    Hellmann-Feynman on U(K) = S(K) P for ANY dock matrix P, the group velocity is a convex mix of the 24 roots, so along u
//    it is at most the 24-cell's support h(u) / sqrt 2: 1 along a root, 1 / sqrt 2 along an axis (the inradius). No
//    dock-local mixer, at any theta and mass, gives an isotropic c; the best isotropic speed is c / sqrt 2.
// 6. THE CONE. Every beat moves the hole exactly one root, so its D4 dock distance after t beats is at most t, and t r_d is
//    reached only by the straight path, amplitude (P_dd)^t, nonzero (P_dd = zeta^11 C_keep e^(i theta) (1 + (e^(-i theta)
//    - 1)/24) != 0 for n = 1). So the reach is exactly t, and along u the support reaches t h(u) / sqrt 2 c.
// SO: D1, D2, D5 and the mean half of D3 hold by derivation; the branch half of D3 fails at K^2 (item 4); D4 fails at every
// theta (item 5: 0.707 to 0.966 c, spread 1.366).
//
// GATES, fixed before the first run (as the brief gives them; D3 split into the two readings its words allow).
//  D1 the love sea is exactly inert: on the flat side-4 and side-8 love seas, 128 beats of the exact superposed rule (the
//     piece unscaled, which throws on a partial dock, then coinedVetoBeat 'none') keep ONE branch equal to the start bit for
//     bit with amplitude a unit, and 128 keyed beats (the piece then starBeat) differ from the piece-off sea at 0 docks.
//  D2 no cascade: (a) the one-beat step maps the flat side-4 sea minus one slot to a sea minus one slot (no store, every
//     vibe a love at point 0, open) for EVERY dock, slot and beat parity keyed, and every slot at 8 docks superposed (0
//     failures); (b) keyed runs of a hole on the flat side-8 sea over 4 paths and 128 beats keep a footprint of at most 1
//     dock against the sea; (c) every branch of the superposed side-4 run holds exactly one hole at every beat.
//  D3 the band at the working point (theta 2 pi/3, n = 1), for every K = 0 multiplet of more than one state:
//     D3a (the mean) its mean inverse mass tensor (4 x 4, Richardson at kappa 0.02) is isotropic to 1e-6 relative, and its
//         mean band's anisotropy over the husk directions face, body and generic grows as K^6: log2 of the ratio between
//         kappa 0.1 and 0.05 in [5.8, 6.2] for each (no K^4 term);
//     D3b (each branch) the sorted branch curvatures (offset / kappa^2 at kappa 0.02) agree over axis, face, body and
//         generic to 1e-6 relative.
//     D3 = D3a and D3b. PREDICTED: D3a holds, D3b fails (item 4).
//  D4 the massless limit: at n = 4096 (mass pi/12288) and kappa 0.02, for theta 2 pi/3, pi/3 and pi/12, the top group
//     speed over the bands along axis e1, face e12, body e123 and a generic husk direction is at least 0.98 c in each AND
//     its largest over its smallest is at most 1.02. PREDICTED: fails at every theta (item 5).
//  D5 the causal reach: the exact walk of the rule's own dock matrix (hole, working point, Z[w] over 48) holds a nonzero
//     amplitude at D4 distance t and none beyond for t = 1 .. 6, its norm exact (48^(2t)), and along each of the seven
//     husk directions of E-SPN-0136 plus the generic one its support reaches exactly t times the 24-cell's bound.
// INSTRUMENT (a failure makes the verdict partial): the two root tables agree; the Fock sectors above are unitary and
//  symmetric (0 entries off in M^dag M = I, exact), a full dock takes w and an empty one 1; the rule's dock matrices
//  (dockMixBranch scaled then coinBranch) equal the float forms to 1e-12 (hole and vibe); the rule's superposed run of a
//  hole on the flat side-4 sea equals the folded exact walk at every branch for 3 beats, up to 3^(cells t) and one unit per
//  beat; Hellmann-Feynman equals a central difference to 1e-6; this file's band routine equals E-SPN-0136's on the frame's
//  8 x 8 to 1e-12 (phases) and 1e-9 (velocities); the generic census reproduces E-SPN-0094 on W(F4) (216 in the ring, 0 at
//  inner +-1) with both eigenvalue tables exact; and the K^6 pattern of each mean at kappa 0.05 is the degree-6 invariant's
//  to 1 percent (face/body 2.25, generic/face (M_6(g) - 3/4) / (3/8)), as symmetry forces.
// CONTROLS (a failure makes the verdict partial).
//  C1 E-SPN-0136's frame mixer reproduces its 0.5 c: code/measure/frame-cone topSpeeds of the frame hole at n = 64, theta
//     2 pi/3, along e13 lies in [0.49, 0.5 + 1e-9].
//  C2 theta = 0 gives the lineon: the exact walk of the rule's coin alone (no mixer) stays on the hole's line for 8 beats (0
//     sites off it) and reaches t, and the top speed along the line is cos(pi/(3n)) to 1e-6 at n = 1, 4, 64.
//  C3 the working vacuum cascades once matter is in it: a lone love in the working (partly filled) vacuum of side 8 under
//     the keyed piece differs from the piece's vacuum at more than half the docks by beat 128 on each of 2 paths, against at
//     most 16 docks with the piece off. (The probe found the working vacuum ALONE gated on 0 docks: its partial docks all
//     hold loves and fears, so the content gate, not Pauli, keeps it still; that is reported, and the control asks the
//     question E-SPN-0121 and E-SPN-0130 asked, a love in it.)
//  C4 the fermion sign is needed: without it M^dag M = I fails on the sectors 2, 3, 21, 22 and 23 and holds on 0, 1, 24.
// Verdict: partial if the instrument or a control fails; pass if D1 to D5 hold; fail otherwise.
// PREDICTED: fail on D3 (D3b) and D4; D1, D2, D3a, D5 and every control hold.
//
// PROBES BEFORE THE GATE RUN, disclosed: tmp/dock24-probe1.log (matrices agree to 1.9e-15; multiplets 13 + 11 at the
// working point; tensors isotropic to 5e-10; the W(D4) census; D4's speeds 0.7070, 0.9654, 0.8165, 0.9082 against the
// derived 0.7071, 0.9659, 0.8165, 0.9086; 0 one-content partial docks in 64 beats of the working vacuum), tmp/dock24-probe2
// (a love in the working vacuum fills 4,094 of 4,096 docks by beat 64, 6 or 7 without the piece; a hole's footprint 1,
// 10 to 19 mesh lines), tmp/dock24-probe3 (K^6 slopes and patterns; the branch spectra). The probes fixed C3's wording and
// the kappas of the K^6 readings; no gate threshold was changed after them.
//
// FIRST RUN (tmp/dock24-exp-run2.log, 72 s; run1 was a compile error, a duplicated name, and executed nothing): FAIL on
// D3 (D3b) and D4, as derived; D1, D2, D3a, D5, the instrument and every control hold. No gate moved.
//  - Census: W(F4) 216 of 7,776 in Z[w][1/2], W(D4) 7,776 of 279,936 (7 orbitals, multiplicities 3,4,2,3,8,3,1), 0 of
//    either reaching inner +-1. Fock: 0 entries off on every sector; unsigned 75,900 to 1,402,632 off on n = 2 to 22 and
//    552 on n = 23. Matrices 1.9e-15; the rule's run equals the folded walk at 24, 576, 3,768 branches.
//  - D1: one branch equal to the start, a unit amplitude, 128 beats at sides 4 and 8; keyed 0 docks off; K 0.
//  - D2: 0 of 12,288 keyed and 0 of 384 superposed one-beat steps leave the one-hole sector; footprints 1 1 1 1.
//  - D3: multiplets 13 + 11; mean tensors -0.244264 I and 0.288675 I to 5e-10; K^6 slopes 5.987 to 5.989; patterns
//    2.2491 and 0.65458 (2.25, 0.65443). Branches warped: flat branches axis/face/body/generic 6/3/3/0 and 5/2/2/0,
//    spread 0.46 of the largest in the 11. The 13's linear pair moves at 0.49949 c in all four directions.
//  - D4: 0.7070, 0.9654, 0.8164, 0.9082 c at 2 pi/3 (spread 1.365), the same to 0.006 at pi/3 and pi/12; derived
//    0.7071, 0.9659, 0.8165, 0.9086; rms 0.489 c everywhere.
//  - D5: reach 1 .. 6, norm exact, the husk reach t times the 24-cell's bound to 9e-16.
//  - Controls: frame e13 0.49992 c; theta 0 on its line, top cos(pi/3n) to 1e-16; the working vacuum alone is gated on
//    0 docks, a love in it fills 4,094 of 4,096 (6 or 7 without the piece); unsigned Fock fails.
//  - Robustness: at theta pi/3 the mixer's own mode is a singleton with an isotropic band (tensor to 7e-9, K^6 slope
//    5.99); at n = 4 the means stay isotropic (4e-7) with slopes 5.92 to 6.00.
//  - A hole hops on only 9 to 18 of 128 beats (the hop weight is 23/192, against the frame mixer's 21/64) and touches 10
//    to 19 mesh lines, fewer than the frame mixer's 30 to 39.
//
// Depth L1 (the census, the Fock checks, the cone, the counting proof: exact) and L2 (the band: a coined quantum walk).
// DETERMINISM: no random numbers; every keyed choice is the key's integer. NOTHING MOVES: the piece and the coin hand a
// value to another slot of the same dock; the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { fullPathKey, meshLines, pathOffset, weylDocks, type PathKey } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { lineFrame } from '@/code/measure/frame-meson'
import { placeVibes } from '@/code/measure/two-hub-bound'
import { newFermionTally, placeInSea, seaConfiguration } from '@/code/measure/pauli-mixer'
import { flatLinks, tablesOn } from '@/code/measure/link-holonomy'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { starBeat, type KEvent } from '@/code/measure/hub-star'
import { bandPoint, d4Steps, frameMatrix, frameRoots, momentumOf, topSpeeds } from '@/code/measure/frame-cone'
import { weylF4 } from '@/code/measure/covariant-coin'
import {
  asymmetry,
  bandAt,
  bNorm,
  composeOff,
  derivedMasslessSpeeds,
  dockConeBound,
  dockFockColumns,
  dockMatrix,
  dockMixBranch,
  dockTrack,
  DOCK_ROOTS,
  exactDockWalk,
  exactGap,
  foldDockWalk,
  keyedDockMix,
  meanTensors,
  multipletPhases,
  multipletsOf,
  pairClasses,
  ringCensus,
  rootTablesAgree,
  ruleDockMatrix,
  schemeTable,
  sixthMoment,
  speedsAt,
  tensorDefect,
  UNITS_B,
  velocityGap,
  weylD4Of,
  wrap,
  type EisB,
  type Multiplet,
} from '@/code/measure/dock-mixer'
import { coinBranch, coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { cloneConfiguration, lockedState, mergeBranches, norm, sameConfiguration, type Branch, type Configuration, type LockedState } from '@/code/rule/doublet-locked-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'

const WORKING_THETA = (2 * Math.PI) / 3
const THETAS: readonly { name: string; theta: number }[] = [
  { name: '2pi/3', theta: WORKING_THETA },
  { name: 'pi/3', theta: Math.PI / 3 },
  { name: 'pi/12', theta: Math.PI / 12 },
]
const LIGHT_N = 4096
const KAPPA = 0.02
const KAPPA_SIX: readonly [number, number] = [0.1, 0.05]
const SLOPE_RANGE: readonly [number, number] = [5.8, 6.2]
const PATTERN_TOLERANCE = 0.01
const ISOTROPY_TOLERANCE = 1e-6
const SPEED_FLOOR = 0.98
const SPREAD_CEILING = 1.02
const MATRIX_TOLERANCE = 1e-12
const VELOCITY_TOLERANCE = 1e-6
const WALK_BEATS = 6
const LINE_BEATS = 8
const CHECK_SIDE = 4
const CHECK_BEATS = 3
const SEA_SIDES: readonly number[] = [4, 8]
const SEA_BEATS = 128
const TRACK_SIDE = 8
const TRACK_BEATS = 128
const TRACK_PATHS = 4
const CASCADE_PATHS = 2
const CASCADE_OFF_CEILING = 16
const SUPERPOSED_DOCKS = 8
const LINE_COINS: readonly number[] = [1, 4, 64]
const FRAME_N = 64
const SECTORS: readonly number[] = [0, 1, 2, 3, 21, 22, 23, 24]
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const FOUR: readonly { name: string; u: number[] }[] = [
  { name: 'axis', u: [1, 0, 0, 0] },
  { name: 'face', u: [s2, s2, 0, 0] },
  { name: 'body', u: [s3, s3, s3, 0] },
  { name: 'generic', u: GENERIC },
]
const HUSK: readonly { name: string; u: number[] }[] = [
  { name: 'e1', u: [1, 0, 0, 0] },
  { name: 'e2', u: [0, 1, 0, 0] },
  { name: 'e3', u: [0, 0, 1, 0] },
  { name: 'e12', u: [s2, s2, 0, 0] },
  { name: 'e13', u: [s2, 0, s2, 0] },
  { name: 'e23', u: [0, s2, s2, 0] },
  { name: 'e123', u: [s3, s3, s3, 0] },
  { name: 'generic', u: GENERIC },
]

const bMul = (x: EisB, y: EisB): EisB => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]
const mean = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] as number), 0)

// every slot of a configuration a sea love (1, point 0, open) or a hole, and no store: the count of holes, or -1 if not
function seaHoles(c: Configuration): number {
  let holes = 0

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] === 0) holes++
    else if (c.vibe[i] !== 1 || c.point[i] !== 0 || c.open[i] !== 1) return -1
  }

  for (let s = 0; s < c.store.length; s++) if (c.store[s] !== 0) return -1

  return holes
}

export default experiment({
  id: 'spin/dock-mixer',
  code: 'E-SPN-0140',
  title:
    "a dock-wide Pauli-blocked mixer keeps the love sea exactly and a hole bounded, but a hole's bands are warped and no massless hole moves at an isotropic c, fail (D3b, D4): M = exp(i theta N_U) over all 24 slots is unitary, symmetric and w on a full dock (0 entries off on sectors 0 to 3 and 21 to 24; unsigned it fails on 2 to 23), but needs 1/3, since of 279,936 W(D4) and 7,776 W(F4) unit choices 7,776 and 216 lie in Z[w][1/2] and 0 reach a root at inner +-1; the flat love sea stays one branch equal to its start for 128 beats (sides 4 and 8), the one-beat step keeps a lone hole a lone hole on 12,288 keyed and 384 superposed checks and its footprint stays 1 for 128 beats, and the exact walk reaches exactly t with the 24-cell as its cone; the working point's multiplets (13 + 11) have mean inverse mass tensors -0.2443 I and +0.2887 I isotropic to 5e-10 and a mean band isotropic through K^4 (anisotropy slope 5.99, the degree-6 pattern 2.249 against 2.25), the 5-design result, but the branches are warped at K^2 (5 or 6 flat along an axis, 2 or 3 along a root) and the only isotropic branches are a linear pair at 0.4995 c; massless (n = 4096) the top speed is 0.707 c on an axis, 0.965 c on a root, 0.816 c on the body diagonal at every theta (spread 1.36, derived 0.7071, 0.9659, 0.8165), bounded by the 24-cell for any dock-local mixer, with an isotropic rms of 0.489 c; the frame mixer's 0.4999 c, theta 0's lineon (cos(pi/3n)) and a love's cascade of the working vacuum (4,094 of 4,096 docks against 6) are reproduced",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const B = rootIndex([1, 1, 0, 0])

    // ---------------- instrument ----------------
    const rootsAgree = rootTablesAgree()
    const fock = SECTORS.map(n => {
      const f = dockFockColumns(n, true, false)
      const a = dockFockColumns(n, true, true)
      const uf = dockFockColumns(n, false, false)
      const ua = dockFockColumns(n, false, true)
      const keep = f.columns[0]![0]![1]

      return { n, states: f.states.length, off: composeOff(a.columns, f.columns), asym: asymmetry(f.columns), unsignedOff: composeOff(ua.columns, uf.columns), keep }
    })
    const fockOk = fock.every(r => r.off === 0 && r.asym === 0)
    const fullKeep = fock.find(r => r.n === 24)!.keep
    const emptyKeep = fock.find(r => r.n === 0)!.keep
    const phasesOk = fullKeep[0] === 0 && fullKeep[1] === 24 && emptyKeep[0] === 24 && emptyKeep[1] === 0
    const C4 = fock.every(r => ([0, 1, 24].includes(r.n) ? r.unsignedOff === 0 : r.unsignedOff > 0))

    log('fock')

    const Ph = ruleDockMatrix(true)
    const Pv = ruleDockMatrix(false)
    const PW = dockMatrix(WORKING_THETA, 1, true)
    const gapHole = exactGap(Ph, PW, 48)
    const gapVibe = exactGap(Pv, dockMatrix(WORKING_THETA, 1, false), 48)

    // the rule's superposed run of a hole on the flat side-4 sea against the folded exact walk (D2c read here too)
    const X4 = centerOf(CHECK_SIDE)
    const fr4 = contactFresh(CHECK_SIDE, 'pass', X4)
    const flat4 = tablesOn(fr4.weave, 'pass', flatLinks(fr4.weave))
    const sea4 = seaConfiguration(fr4.cells, 1)
    const walks: Map<string, EisB>[] = []

    exactDockWalk(Ph, DOCK_ROOTS, B, CHECK_BEATS, (t, sites) => (walks[t] = foldDockWalk(sites, CHECK_SIDE, X4)))

    let s: LockedState = lockedState(placeInSea(sea4, [{ dock: X4, slot: B, vibe: 0 }]))
    const runBeats: string[] = []
    let runOk = true
    let oneHoleEveryBranch = true

    for (let t = 0; t < CHECK_BEATS; t++) {
      s = { branches: mergeBranches(s.branches.flatMap(b => dockMixBranch(fr4.cells, b, false, true))) }
      s = coinedVetoBeat('none', flat4, s, t)

      const w = walks[t + 1] as Map<string, EisB>
      const T = 48n ** BigInt(t + 1)
      const three = 3n ** BigInt(fr4.cells * (t + 1))

      for (const br of s.branches) if (seaHoles(br) !== 1) oneHoleEveryBranch = false

      const unit = UNITS_B.findIndex(u =>
        s.branches.every(br => {
          let where = ''

          for (let i = 0; i < br.vibe.length; i++) if (br.vibe[i] === 0) where = `${Math.floor(i / 24)},${i % 24}`

          const want = bMul(u, w.get(where) ?? [0n, 0n])
          const scale = 1n << BigInt(br.k)

          return br.a * T === want[0] * three * scale && br.b * T === want[1] * three * scale
        }),
      )
      const same = unit >= 0 && s.branches.length === w.size

      runOk = runOk && same
      runBeats.push(`${s.branches.length}/${w.size} unit ${unit}`)
    }

    log('rule run')

    const velGap = Math.max(
      ...[
        [0.31, -1.07, 0.73, 2.03],
        [1.9, 0.2, -2.6, 0.45],
        [-0.8, 2.2, 1.3, -0.1],
      ].flatMap(K => FOUR.map(d => velocityGap(PW, DOCK_ROOTS, K, d.u))),
    )

    // this file's band routine against E-SPN-0136's on the frame's 8 x 8
    const F = lineFrame(B)
    const fRoots = frameRoots(F)
    const Pf = frameMatrix(WORKING_THETA, 1, true)
    let builderPhase = 0
    let builderVelocity = 0

    for (const k of [
      [0.4, -1.1, 0.7, 2.2],
      [1.3, 0.5, -2.1, 0.9],
    ]) {
      const K = momentumOf(fRoots, k)
      const mine = bandAt(Pf, fRoots, K)
      const theirs = bandPoint(Pf, fRoots, K)
      const a = [...mine.phase].sort((x, y) => x - y)
      const b = [...theirs.phase].sort((x, y) => x - y)

      a.forEach((x, i) => (builderPhase = Math.max(builderPhase, Math.abs(x - (b[i] as number)))))
      for (const d of FOUR) {
        const va = mine.velocity.map(v => dot(v, d.u)).sort((x, y) => x - y)
        const vb = theirs.velocity.map(v => dot(v, d.u)).sort((x, y) => x - y)

        va.forEach((x, i) => (builderVelocity = Math.max(builderVelocity, Math.abs(x - (vb[i] as number)))))
      }
    }

    // the ring census (derivation 1)
    const F4 = weylF4()
    const WD4 = weylD4Of(F4)
    const census = [
      { name: 'W(F4)', group: F4 },
      { name: 'W(D4)', group: WD4 },
    ].map(({ name, group }) => {
      const pc = pairClasses(group)
      const tb = schemeTable(pc)

      return { name, order: group.length, classes: pc.count, multiplicity: tb.multiplicity, exact: tb.exact, commutative: tb.commutative, ring: ringCensus(pc, tb) }
    })
    const f4 = census[0]!
    const d4 = census[1]!
    const censusOk = f4.ring.tried === 7776 && f4.ring.inRing === 216 && f4.ring.reachInnerOne === 0 && census.every(c => c.exact && c.commutative)

    log('census')

    // ---------------- D3: the band at the working point ----------------
    const msW = multipletsOf(PW, DOCK_ROOTS)
    const multi = msW.map((m, i) => ({ m, i })).filter(x => x.m.size > 1)
    const tensors = meanTensors(PW, DOCK_ROOTS, msW, KAPPA)
    const tensorRead = multi.map(({ i }) => tensorDefect(tensors[i] as number[][]))
    const sixOf = (P: typeof PW, ms: readonly Multiplet[], k: number): number[][] => FOUR.map(d => multipletPhases(P, DOCK_ROOTS, d.u.map(x => x * k), ms).map(mean))
    const anis = (P: typeof PW, ms: readonly Multiplet[], idx: number, k: number): number[] => {
      const f = sixOf(P, ms, k)

      return [1, 2, 3].map(j => ((f[j] as number[])[idx] as number) - ((f[0] as number[])[idx] as number))
    }
    const slopes = multi.map(({ i }) => {
      const a = anis(PW, msW, i, KAPPA_SIX[0])
      const b = anis(PW, msW, i, KAPPA_SIX[1])

      return a.map((x, j) => Math.log2(x / (b[j] as number)))
    })
    const genericRatio = (sixthMoment(GENERIC) - 0.75) / 0.375
    const patternOf = (d: number[]): { faceBody: number; genericFace: number; off: number } => {
      const faceBody = (d[0] as number) / (d[1] as number)
      const genericFace = (d[2] as number) / (d[0] as number)

      return { faceBody, genericFace, off: Math.max(Math.abs(faceBody / 2.25 - 1), Math.abs(genericFace / genericRatio - 1)) }
    }
    const patterns = multi.map(({ i }) => patternOf(anis(PW, msW, i, KAPPA_SIX[1])))
    const patternOk = patterns.every(p => p.off <= PATTERN_TOLERANCE)
    const D3a = tensorRead.every(r => r.defect <= ISOTROPY_TOLERANCE) && slopes.every(sl => sl.every(x => x >= (SLOPE_RANGE[0] as number) && x <= (SLOPE_RANGE[1] as number)))
    const branches = multi.map(({ i }) => FOUR.map(d => (multipletPhases(PW, DOCK_ROOTS, d.u.map(x => x * KAPPA), msW)[i] as number[]).map(x => x / (KAPPA * KAPPA))))
    const branchDefect = branches.map(lists => {
      const scale = Math.max(...lists.flat().map(Math.abs))
      let off = 0

      lists.forEach(l => l.forEach((x, j) => (off = Math.max(off, Math.abs(x - ((lists[0] as number[])[j] as number))))))

      return off / scale
    })
    const flatBranches = branches.map(lists => lists.map(l => l.filter(x => Math.abs(x) < 1e-3).length))
    const D3b = branchDefect.every(x => x <= ISOTROPY_TOLERANCE)
    const D3 = D3a && D3b
    // the linear pair at the working point: its speed along each direction over c
    const pairSpeed = FOUR.map(d => {
      const k = 0.01
      const top = Math.max(...multi.flatMap(({ i }) => multipletPhases(PW, DOCK_ROOTS, d.u.map(x => x * k), msW)[i] as number[]))

      return top / k / Math.SQRT2
    })

    // robustness readings off the working point: theta pi/3 (the mixer's own mode alone) and n = 4
    const robust = [
      { name: 'theta pi/3', P: dockMatrix(Math.PI / 3, 1, true) },
      { name: 'n 4', P: dockMatrix(WORKING_THETA, 4, true) },
    ].map(({ name, P }) => {
      const ms = multipletsOf(P, DOCK_ROOTS)
      const tens = meanTensors(P, DOCK_ROOTS, ms, KAPPA).map(A => tensorDefect(A))
      const slope = ms.map((_, i) => {
        const a = anis(P, ms, i, 0.05)
        const b = anis(P, ms, i, 0.025)

        return Math.min(...a.map((x, j) => Math.log2(x / (b[j] as number))))
      })

      return { name, sizes: ms.map(m => m.size), tensor: tens, slope }
    })

    log('D3')

    // ---------------- D4: the massless limit ----------------
    const skip = wrap((12 * 2 * Math.PI) / (3 * LIGHT_N))
    const speeds = THETAS.map(({ name, theta }) => {
      const P = dockMatrix(theta, LIGHT_N, true)
      const read = FOUR.map(d => speedsAt(P, DOCK_ROOTS, d.u, KAPPA, skip))
      const top = read.map(r => r.top)

      return { name, top, rms: read.map(r => r.rms), least: Math.min(...top), spread: Math.max(...top) / Math.min(...top) }
    })
    const derived = FOUR.map(d => derivedMasslessSpeeds(d.u))
    const derivedGap = Math.max(...speeds.flatMap(r => r.top.map((x, j) => Math.abs(x - (derived[j] as { top: number }).top))))
    const D4 = speeds.every(r => r.least >= SPEED_FLOOR && r.spread <= SPREAD_CEILING)

    log('D4')

    // ---------------- D5: the exact cone ----------------
    const reach: number[] = []
    const normExact: boolean[] = []
    const alongOff: number[] = []
    const siteCount: number[] = []
    const huskCone = HUSK.map(h => dockConeBound(h.u))

    exactDockWalk(Ph, DOCK_ROOTS, B, WALK_BEATS, (t, sites) => {
      let r = 0
      let total = 0n
      const along = HUSK.map(() => -Infinity)

      for (const site of sites.values()) {
        r = Math.max(r, d4Steps(site.v))
        for (const a of site.amp) total += bNorm(a)
        HUSK.forEach((h, i) => (along[i] = Math.max(along[i] as number, dot(site.v, h.u) / Math.SQRT2)))
      }

      reach.push(r)
      normExact.push(total === 2304n ** BigInt(t))
      alongOff.push(Math.max(...HUSK.map((_, i) => Math.abs((along[i] as number) - t * (huskCone[i] as number)))))
      siteCount.push(sites.size)
    })

    const D5 = reach.every((r, i) => r === i + 1) && normExact.every(Boolean) && alongOff.every(x => x <= 1e-12)

    log('D5')

    // ---------------- D1: the sea is inert ----------------
    const seaRuns = SEA_SIDES.map(side => {
      const X = centerOf(side)
      const fr = contactFresh(side, 'pass', X)
      const flat = tablesOn(fr.weave, 'pass', flatLinks(fr.weave))
      const sea = seaConfiguration(fr.cells, 1)
      let st: LockedState = lockedState(sea)
      let exact = true
      let maxBranches = 1

      for (let t = 0; t < SEA_BEATS; t++) {
        st = { branches: mergeBranches(st.branches.flatMap(b => dockMixBranch(fr.cells, b, false, false))) }
        st = coinedVetoBeat('none', flat, st, t)
        maxBranches = Math.max(maxBranches, st.branches.length)

        const br = st.branches[0] as Branch

        if (st.branches.length !== 1 || !sameConfiguration(br, sea) || br.k !== 0 || norm(br.a, br.b) !== 1n) exact = false
      }

      const keyed = dockTrack({ tables: flat, start: sea, reference: sea, key: fullPathKey(pathOffset(0)), threshold: THRESHOLD_BORN, beats: SEA_BEATS, on: true, referenceOn: false })

      return { side, cells: fr.cells, exact, maxBranches, keyedMax: Math.max(...keyed.footprint), blocked: keyed.tally.blockedFull, kEvents: keyed.kEvents }
    })
    const D1 = seaRuns.every(r => r.exact && r.keyedMax === 0)

    log('D1')

    // ---------------- D2: no cascade ----------------
    // (a) the one-beat step, keyed at every dock, slot and parity; superposed at every slot of 8 docks
    let keyedFailures = 0
    let keyedChecked = 0
    const key0 = fullPathKey(pathOffset(0))
    const events: KEvent[] = []
    const tally = newFermionTally()

    for (let x = 0; x < fr4.cells; x++) {
      for (let d = 0; d < 24; d++) {
        for (let t = 0; t < 2; t++) {
          const a = placeInSea(sea4, [{ dock: x, slot: d, vibe: 0 }])
          const b = cloneConfiguration(a)

          keyedDockMix(flat4, a, key0, t, true, tally)
          starBeat(flat4, a, b, key0, THRESHOLD_BORN, t, events)
          keyedChecked++
          if (seaHoles(b) !== 1) keyedFailures++
        }
      }
    }

    let superFailures = 0
    let superChecked = 0
    let superBranches = 0

    for (const x of weylDocks(fr4.cells, SUPERPOSED_DOCKS)) {
      for (let d = 0; d < 24; d++) {
        for (let t = 0; t < 2; t++) {
          let st: LockedState = lockedState(placeInSea(sea4, [{ dock: x, slot: d, vibe: 0 }]))

          st = { branches: mergeBranches(st.branches.flatMap(b => dockMixBranch(fr4.cells, b, false, true))) }
          st = coinedVetoBeat('none', flat4, st, t)
          superChecked++
          superBranches += st.branches.length
          if (st.branches.some(br => seaHoles(br) !== 1)) superFailures++
        }
      }
    }

    log('D2 step')

    // (b) keyed runs on the flat side-8 sea
    const X8 = centerOf(TRACK_SIDE)
    const fr8 = contactFresh(TRACK_SIDE, 'pass', X8)
    const flat8 = tablesOn(fr8.weave, 'pass', flatLinks(fr8.weave))
    const sea8 = seaConfiguration(fr8.cells, 1)
    const lines8 = meshLines(flat8)
    const keyOf = (path: number): PathKey => fullPathKey(pathOffset(path))
    const holeRuns = Array.from({ length: TRACK_PATHS }, (_, path) => {
      const start = placeInSea(sea8, [{ dock: X8, slot: B, vibe: 0 }])
      const on = dockTrack({ tables: flat8, start, reference: sea8, key: keyOf(path), threshold: THRESHOLD_BORN, beats: TRACK_BEATS, on: true, lines: lines8 })
      const off = dockTrack({ tables: flat8, start, reference: sea8, key: keyOf(path), threshold: THRESHOLD_BORN, beats: TRACK_BEATS, on: false, lines: lines8 })

      return { max: Math.max(...on.footprint), lines: on.linesTouched, linesOff: off.linesTouched, moved: on.tally.moved, gated: on.tally.gated, k: on.kEvents }
    })
    const D2 = keyedFailures === 0 && superFailures === 0 && holeRuns.every(r => r.max <= 1) && oneHoleEveryBranch

    log('D2')

    // ---------------- controls ----------------
    // C1: E-SPN-0136's frame mixer along e13
    const e13 = HUSK.find(h => h.name === 'e13')!.u
    const frameE13 = topSpeeds(frameMatrix(WORKING_THETA, FRAME_N, true), fRoots, [e13], 8).speed[0] as number
    const C1 = frameE13 >= 0.49 && frameE13 <= 0.5 + 1e-9

    log('C1')

    // C2: theta = 0, the rule's coin alone on a one-hole dock, exact over 2
    const P0: EisB[][] = Array.from({ length: 24 }, () => Array.from({ length: 24 }, (): EisB => [0n, 0n]))

    for (let q = 0; q < 24; q++) {
      const br: Branch = { vibe: new Int8Array(24).fill(1), point: new Int8Array(24), open: new Uint8Array(24).fill(1), store: new Int8Array(12), spoint: new Int8Array(12), sopen: new Uint8Array(12), a: 1n, b: 0n, k: 0 }

      br.vibe[q] = 0
      br.open[q] = 0
      for (const o of coinBranch(1, br, false)) {
        const r = Array.from({ length: 24 }, (_, d) => d).find(d => o.vibe[d] === 0) as number
        const scale = 1n << BigInt(1 - o.k)
        const old = (P0[r] as EisB[])[q] as EisB

        ;(P0[r] as EisB[])[q] = [old[0] + o.a * scale, old[1] + o.b * scale]
      }
    }

    let offLine = 0
    const lineReach: number[] = []
    const rB = DOCK_ROOTS[B] as readonly number[]

    exactDockWalk(P0, DOCK_ROOTS, B, LINE_BEATS, (t, sites) => {
      let r = 0

      for (const site of sites.values()) {
        r = Math.max(r, d4Steps(site.v))

        const m = dot(site.v, rB) / 2

        if (!site.v.every((x, k) => x === m * (rB[k] as number))) offLine++
        site.amp.forEach((a, q) => {
          if ((a[0] !== 0n || a[1] !== 0n) && LINE_OF[q] !== LINE_OF[B]) offLine++
        })
      }

      lineReach.push(r)
    })

    const lineDir = rB.map(x => x / Math.SQRT2)
    const lineTop = LINE_COINS.map(n => {
      const P = dockMatrix(0, n, true)
      const along = (k: number): number => Math.max(...bandAt(P, DOCK_ROOTS, lineDir.map(x => x * k)).velocity.map(v => dot(v, lineDir))) / Math.SQRT2
      let best = { k: 0, s: -Infinity }

      for (let i = 1; i < 400; i++) {
        const k = (i / 400) * (Math.PI / Math.SQRT2) * 2
        const x = along(k)

        if (x > best.s) best = { k, s: x }
      }

      let step = (Math.PI / Math.SQRT2) * 2 / 400

      while (step > 1e-9) {
        const up = along(best.k + step)
        const down = along(best.k - step)

        if (up > best.s) best = { k: best.k + step, s: up }
        else if (down > best.s) best = { k: best.k - step, s: down }
        else step /= 2
      }

      return { n, top: best.s, want: Math.cos(Math.PI / (3 * n)) }
    })
    const lineGap = Math.max(...lineTop.map(r => Math.abs(r.top - r.want)))
    const C2 = offLine === 0 && lineReach.every((r, i) => r === i + 1) && lineGap <= 1e-6

    log('C2')

    // C3: a lone love in the working vacuum
    const vac8 = wordVacuum(fr8, fr8.store)
    const cascade = Array.from({ length: CASCADE_PATHS }, (_, path) => {
      const love = placeVibes(vac8, [{ dock: X8, slot: B, vibe: 1 }])
      const on = dockTrack({ tables: fr8.tables, start: love, reference: vac8, key: keyOf(path), threshold: THRESHOLD_BORN, beats: TRACK_BEATS, on: true })
      const off = dockTrack({ tables: fr8.tables, start: love, reference: vac8, key: keyOf(path), threshold: THRESHOLD_BORN, beats: TRACK_BEATS, on: false })
      const alone = dockTrack({ tables: fr8.tables, start: vac8, reference: vac8, key: keyOf(path), threshold: THRESHOLD_BORN, beats: TRACK_BEATS, on: true, referenceOn: false })

      return { on: on.footprint[TRACK_BEATS - 1] as number, off: off.footprint[TRACK_BEATS - 1] as number, gated: on.tally.gated, kOn: on.kEvents, kOff: off.kEvents, aloneGated: alone.tally.gated, aloneMax: Math.max(...alone.footprint) }
    })
    const C3 = cascade.every(r => r.on > fr8.cells / 2 && r.off <= CASCADE_OFF_CEILING)

    log('C3')

    // ---------------- verdict ----------------
    const instrument = rootsAgree && fockOk && phasesOk && gapHole <= MATRIX_TOLERANCE && gapVibe <= MATRIX_TOLERANCE && runOk && velGap <= VELOCITY_TOLERANCE && builderPhase <= 1e-12 && builderVelocity <= 1e-9 && censusOk && patternOk
    const controls = C1 && C2 && C3 && C4
    const status = !instrument || !controls ? 'partial' : D1 && D2 && D3 && D4 && D5 ? 'pass' : 'fail'
    const f4d = (x: number): string => x.toFixed(4)
    const metrics: Record<string, number> = {
      D1: D1 ? 1 : 0,
      D2: D2 ? 1 : 0,
      D3: D3 ? 1 : 0,
      D3a: D3a ? 1 : 0,
      D3b: D3b ? 1 : 0,
      D4: D4 ? 1 : 0,
      D5: D5 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      C3: C3 ? 1 : 0,
      C4: C4 ? 1 : 0,
      gapHole,
      gapVibe,
      velocityGap: velGap,
      builderPhase,
      builderVelocity,
      d4Order: d4.order,
      d4Classes: d4.classes,
      d4InRing: d4.ring.inRing,
      d4ReachInnerOne: d4.ring.reachInnerOne,
      f4InRing: f4.ring.inRing,
      f4ReachInnerOne: f4.ring.reachInnerOne,
      derivedGap,
      frameE13,
      lineGap,
      keyedFailures,
      superFailures,
      seconds: (Date.now() - started) / 1000,
    }

    multi.forEach(({ m }, j) => {
      metrics[`tensor_${m.size}_a`] = (tensorRead[j] as { a: number }).a
      metrics[`tensor_${m.size}_defect`] = (tensorRead[j] as { defect: number }).defect
      metrics[`branchDefect_${m.size}`] = branchDefect[j] as number
      ;(slopes[j] as number[]).forEach((x, k) => (metrics[`slope_${m.size}_${(FOUR[k + 1] as { name: string }).name}`] = x))
      metrics[`pattern_${m.size}_faceBody`] = (patterns[j] as { faceBody: number }).faceBody
      metrics[`pattern_${m.size}_genericFace`] = (patterns[j] as { genericFace: number }).genericFace
    })
    speeds.forEach(r => {
      metrics[`D4_${r.name}_least`] = r.least
      metrics[`D4_${r.name}_spread`] = r.spread
      FOUR.forEach((d, j) => (metrics[`top_${r.name}_${d.name}`] = r.top[j] as number))
    })
    FOUR.forEach((d, j) => {
      metrics[`derived_${d.name}`] = (derived[j] as { top: number }).top
      metrics[`pair_${d.name}`] = pairSpeed[j] as number
    })

    return verdict({
      status,
      claim: `D1 ${D1} (the flat love sea, sides ${SEA_SIDES.join(' and ')}, ${SEA_BEATS} beats: ${seaRuns.map(r => `side ${r.side} one branch equal to the start with a unit amplitude ${r.exact}, keyed ${r.keyedMax} docks off, ${r.blocked} blocked dock-beats, K ${r.kEvents}`).join('; ')}); D2 ${D2} (one-beat step: keyed ${keyedFailures} of ${keyedChecked} off, superposed ${superFailures} of ${superChecked} off; keyed side-${TRACK_SIDE} footprints ${holeRuns.map(r => r.max).join(' ')} over ${TRACK_BEATS} beats; superposed one hole per branch ${oneHoleEveryBranch}); D3 ${D3} (multiplets ${msW.map(m => m.size).join(' + ')}; D3a ${D3a}: mean tensors ${tensorRead.map(r => `${r.a.toFixed(6)} I to ${r.defect.toExponential(1)}`).join(', ')}, K^6 slopes ${slopes.map(sl => sl.map(x => x.toFixed(3)).join('/')).join(', ')}; D3b ${D3b}: branch spread ${branchDefect.map(x => x.toFixed(3)).join(', ')} of the largest, flat branches axis/face/body/generic ${flatBranches.map(f => f.join('/')).join(', ')}); D4 ${D4} (n ${LIGHT_N}, kappa ${KAPPA}: ${speeds.map(r => `theta ${r.name} top ${r.top.map(f4d).join(' ')} c, least ${f4d(r.least)}, spread ${f4d(r.spread)}`).join('; ')}; derived ${derived.map(d => f4d(d.top)).join(' ')}); D5 ${D5} (exact reach ${reach.join(' ')}, norm exact ${normExact.every(Boolean)}, along the husk off ${Math.max(...alongOff).toExponential(1)}); controls C1 ${C1} (frame e13 ${frameE13.toFixed(5)} c), C2 ${C2} (off line ${offLine}, line top ${lineTop.map(r => r.top.toFixed(6)).join(' ')}), C3 ${C3} (a love in the working vacuum ${cascade.map(r => `${r.on} on, ${r.off} off`).join('; ')} of ${fr8.cells}), C4 ${C4}`,
      metrics,
      control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, C3: C3 ? 1 : 0, C4: C4 ? 1 : 0, instrument: instrument ? 1 : 0 },
      notes: `L1/L2. Census: ${census.map(c => `${c.name} order ${c.order}, ${c.classes} orbitals, multiplicities ${c.multiplicity.join(',')}, exact ${c.exact}, ${c.ring.inRing} of ${c.ring.tried} unit choices in Z[w][1/2], ${c.ring.reachInnerOne} reach inner +-1, ${c.ring.mixLines} leave the line (by inner ${JSON.stringify(c.ring.perInner)})`).join('; ')}. Fock: ${fock.map(r => `n ${r.n} (${r.states}) off ${r.off} asym ${r.asym} unsigned off ${r.unsignedOff}`).join(', ')}; full keep ${fullKeep.join(',')}/24, empty ${emptyKeep.join(',')}/24. Rule run (branches/walk, unit): ${runBeats.join(', ')}. Matrix gaps ${gapHole.toExponential(2)} (hole), ${gapVibe.toExponential(2)} (vibe); velocity ${velGap.toExponential(2)}; builder ${builderPhase.toExponential(2)}, ${builderVelocity.toExponential(2)}. D3 patterns at kappa ${KAPPA_SIX[1]}: ${patterns.map(p => `face/body ${p.faceBody.toFixed(5)} (2.25), generic/face ${p.genericFace.toFixed(5)} (${genericRatio.toFixed(5)})`).join('; ')}; branches (offset/kappa^2 at ${KAPPA}, axis || face || body || generic): ${branches.map(lists => lists.map(l => l.map(x => x.toFixed(3)).join(' ')).join(' || ')).join(' ### ')}. The linear pair at the working point, speed over c: ${pairSpeed.map(x => x.toFixed(5)).join(' ')}. Robustness: ${robust.map(r => `${r.name}: multiplets ${r.sizes.join('+')}, tensor defects ${r.tensor.map(x => `${x.a.toFixed(4)}:${x.defect.toExponential(1)}`).join(' ')}, least K^6 slope ${r.slope.map(x => x.toFixed(2)).join(' ')}`).join('; ')}. D4 rms over c: ${speeds.map(r => `${r.name} ${r.rms.map(f4d).join(' ')}`).join('; ')} (derived ${derived.map(d => f4d(d.rms)).join(' ')}); derived gap ${derivedGap.toExponential(2)}. D5 sites ${siteCount.join(' ')}, husk cone ${huskCone.map(f4d).join(' ')}. D2 keyed hole runs: lines ${holeRuns.map(r => r.lines).join(' ')} (piece off ${holeRuns.map(r => r.linesOff).join(' ')}), hops ${holeRuns.map(r => r.moved).join(' ')} of ${holeRuns.map(r => r.gated).join(' ')} gated beats, K ${holeRuns.map(r => r.k).join(' ')}; superposed step branches ${superBranches}. C2 line reach ${lineReach.join(' ')}, top ${lineTop.map(r => `n ${r.n} ${r.top.toFixed(8)} vs ${r.want.toFixed(8)}`).join(', ')}. C3: gated ${cascade.map(r => r.gated).join(' ')}, K ${cascade.map(r => `${r.kOn}/${r.kOff}`).join(' ')}, the vacuum alone gated ${cascade.map(r => r.aloneGated).join(' ')} and ${cascade.map(r => r.aloneMax).join(' ')} docks off. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
