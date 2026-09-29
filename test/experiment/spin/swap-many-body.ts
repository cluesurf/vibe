// DO THE SWAP COIN'S ONE-BODY RESULTS SURVIVE ONCE VIBES INTERACT (E-SPN-0145)? E-SPN-0143 (swap-cone) found, in a one-body
// float model, that the swap coin (zeta = -1, n = 2/3, the line swap X) with the fermionic 24-slot dock mixer on the love
// sea gives every one-body excitation one top speed c* = c/2, gamma = 0, 22 of 24 bands flat (lineons bounce in place),
// and one moving singlet pair, relativistic with R = tan(m)/m; the light mass needs Z[w][1/42], u* = -(360 + 37 w)/343. Its
// caveat: the float dock matrix was never read off a rule, because coinBranch carries only n = 1. Here the rule is built
// (code/rule/swap-mixer: swapCoinBranch, ringDockMixBranch at u*, swapMixedBeat = the mixer, the coin, the working beat of
// code/rule/occupation-veto-knit with the 'none' veto on flat links), exact in Z[w] over 2^k with the global scale
// 8,232^cells a beat, and its few-excitation sectors are read (code/measure/swap-sector).
//
// DERIVED BEFORE THE RUN.
// 1. THE RING. |360 + 37 w|^2 = 129,600 - 13,320 + 1,369 = 117,649 = 343^2, so u* has norm one; the mixer's entries times
//    S = 24 * 343 = 8,232 are Eisenstein integers (keep 24 den + n (num - den), hop sign (num - den), full dock 24 num).
//    The swap coin has integer entries (cross 1, keep 0, a full open line det X = -1): no branch splits at the coin.
// 2. THE ONE-HOLE SECTOR IS E-SPN-0143's MODEL. On a love dock with one hole the mixer is det(m) Z conj(m) Z on the hole
//    and the coin crosses it, so the rule's dock matrix (mixer then coin) is zeta^11 C e^(i theta) (I + (e^(-i theta) -
//    1) z z^T / 24) = dockMatrix(theta*, 2/3, hole) exactly; the meeting adds w for each of the 11 full like lines (w^11,
//    a constant), the collision is the identity (one single line: no contact), the sea's docks give F = 24 num each (u,
//    det X^12 = 1, w^12 = 1). So X1a's numbers are E-SPN-0143's: 12 + 11 + 1, m* = 0.046778, R = 1.000730, c_eff =
//    0.499818 c, 22 flat bands, top speed 0.4882 c. In the shaped form A = c X (I + beta z z^T), c = e^(i pi/3).
// 3. HOW A SPEED IS READ FROM THE EXACT WALK. Every beat the stream takes every slot one root, so the SUPPORT of a lone
//    hole's walk reaches exactly t root steps (the front at c), carried by the straight path with |A_BB| = |beta| =
//    0.0832 a beat (weight 6.9e-3^t): that is the stream's microscopic step, which every vibe takes every beat, not the
//    speed of an excitation. The excitation's speed is how fast its WEIGHT spreads: asymptotically x/t is distributed on
//    the group velocities (all under 0.4882 c), so the weight beyond the cone |x| > (c/2) t + c must fall with t, and the
//    1e-3 directional front along any direction must sit under (c/2) t. Read on the float walk of the rule's own A.
// 4. THE SEA IS INERT (X2). Every dock full, one content, point 0 on flat links: the mixer is the phase u, each line's
//    coin det X = -1, each meeting w, no single line (no contact K, no pair move), the stream a bijection: one branch,
//    amplitude exactly F^cells a beat, and the collision permutes nothing. Every piece keeps the number of holes, so the
//    one- and two-hole sectors are closed.
// 5. WHAT TWO HOLES FEEL (X3). Every piece but the stream acts inside one dock, so two holes on different docks evolve as
//    A (x) A exactly: the ONLY interaction is at contact (one dock), through (a) the meeting: an empty line (both holes on
//    one line, 12 of 276 contact pairs) loses one w where two half lines lose two; (b) the contact K, which fires on a
//    dock with two single lines when the momentum table holds their momentum: on every pair at inner product 0 (72) and
//    -1 (96), never at +1 (96) or -2 (12); (c) the statistics: the mixer's hop carries the fermion sign of the other hole
//    between, the stream none (the superposed rule as E-SPN-0140 ran it). Once apart the holes are free, and a free
//    hole's asymptotic speed is a one-body group velocity, under c/2 (X1). So a charge can outrun c/2 only as a COMPOSITE
//    that stays at contact and whose total-momentum band E(K) is steep. At total momentum K the pair lives on the
//    relative coordinate: weight that stays near contact is either frozen (both holes on flat bands: phases c^2 (+-1),
//    independent of K, speed 0) or bound or resonant (a phase that moves with K). The reading: the Hann periodogram of the
//    state near contact over beats 129 .. 256 at K0 and K0 + 0.2 u, its peaks matched, speed |d phase| / 0.2 / sqrt 2.
// 6. A FEAR IS NOT A PARTICLE HERE. The 'none' veto unmakes any love-fear line at the first collision: a fear in the sea
//    becomes a STORE (which never streams) and two holes on its line. The two holes stream apart one root each way, and the
//    swap coin bounces them back to the store's dock two beats later, where, if the mixer hopped neither, the line is
//    empty at the pair move and the store makes the fear again on its own slot; the fear streams one root along its slot
//    and is unmade there at the next collision. So the fear WALKS one root per completed two-beat cycle: its charge is at
//    most floor((t - 1)/2) roots from its start after t beats, at c/2 exactly when every cycle completes, and each cycle
//    completes with the weight of both holes being kept (about 0.49). A STORED PAIR is invisible to a lone hole: the mixer
//    and coin read vibes only, the pair move makes only on an empty line (two holes), so a stored pair beside one hole is
//    frozen and changes nothing.
// 7. NO BOUND COMPOSITE (X4), derived. On flat links every point is 0 and every piece is dock-local, so two separated
//    holes cost nothing per unit of separation: there is no string (no tension, no confinement). A bound state can come
//    only from the contact pieces, and it must live in a continuum that covers the whole circle (the one-hole pair's
//    phases w in [-0.34, 1.52] and pi - w, plus the flat levels, sum to every phase), so a contact-bound level is
//    embedded and generically decays. The hole-fear meson cannot exist as a mover (point 6). PREDICTED: no class keeps
//    more weight near contact than two free holes do; the empty-line pair shows a resonance that decays.
// 8. GRAVITY (X5). The hole's dock matrix is a phase times Z conj(P_love) Z (the love on the empty mesh: mixer m, the coin
//    X, no full line), and Z commutes with the stream, so a hole's Born weight on the love sea equals a love's on the empty
//    mesh at every slot and beat (E-GRV-0144's sign, now for this rule). The charge register (hole 1, fear 4, store 2) is
//    kept by every piece dock by dock (the pair move trades fear 4 + love 0 for store 2 + two holes 1 + 1); the asked
//    occupation register breaks only where a pair is unmade, as E-GRV-0144 found. E-GRV-0141's slide enters c only as a
//    residue, so it can be re-read with the slide at c* = c/2 (the residue (p + 1)/2): the TT speed is tied to the slide's
//    c at every c, so a slide carried at c* puts the graviton at c*. Which c the slide carries is not settled by the algebra.
//
// PREDICTED: X1, X2, X3, X5 hold; X4 fails (no bound composite; derivation 7).
//
// GATES, fixed before the gate run.
//  X1a the rule's one-hole dock matrix (mixer then coin, over 8,232) equals dockMatrix(theta*, 2/3, hole) to 1e-12; the full
//      pre-stream operator (meeting and collision too) equals w^11 times it at every entry (exact, both beat parities); the
//      rule's superposed run of one hole on the flat side-4 sea equals the sparse sum (swap-sector exactBeat) at every
//      branch exactly for 3 beats; and from the rule's matrix: K = 0 multiplets 1 + 11 + 12 with the singlet's partner the
//      12, the singlet's m, R (axis, face, body, generic) and c_eff within 1e-9 of the float model's, the third fastest
//      band at most 1e-9 over 1,024 Weyl momenta, the top speed over those and 20 radial momenta at most c/2 (1 + 1e-6).
//  X1b the exact walk of the rule's matrix (Z[w] over 8,232^t) holds amplitude at D4 distance t and none beyond for t = 1 .. 6
//      with its norm exactly 8,232^(2t); on the float walk (ball 16) the 1e-3 front along each of 9 directions is at most
//      (c/2) t at every even t from 8 to 16, and the weight beyond |x| > (c/2) t + c falls: W(16) < W(8) < W(4), W(16) <= 1e-4.
//  X2  the flat love sea (sides 4 and 8) under the exact rule for 128 beats is one branch equal to the sea with amplitude
//      exactly F^cells every beat, and the collision permutes nothing on any dock of any beat.
//  X3  (a) at K0 = 0 and K0 = (0.6, 0.2, -0.1, 0.4), for a start on each of the 4 contact classes (root inner product 0,
//      -2, 1, -1), every Hann peak of weight >= 0.01 near contact (ball 4, 256 beats) has a partner within 0.05 rad at
//      K0 + 0.2 u (u = e1 and the face (e1 + e2)/sqrt 2) and a secant speed at most c/2; (b) a lone fear's charge (fear or
//      store) is at most floor((t - 1)/2) roots from its start on every configuration for t = 1 .. 3, and a hole and fear's
//      at 0 roots for t = 1, 2; (c) a stored pair leaves a lone hole's dock outcomes unchanged for all 24 slots x 12 lines.
//  X4  some contact class keeps at least 0.01 more weight in the ball than two free holes at beat 256, at ball radius 4
//      and 5 (it holds), and its strongest peak off the frozen phases moves: along e1 and the face its inertia
//      M = 0.04 / (2 |d phase|) agrees within 5 percent, and M c*^2 / E = 1 within 5 percent, E = |phase - arg c^2|.
//  X5  (a) a hole on the flat side-4 sea and a love on the empty mesh have equal Born weight at every slot for 3 beats;
//      (b) the charge register is constant on every branch of every exact box run and is kept by every dock outcome the
//      sums met; (c) E-GRV-0141's Y2 holds with the slide at c = 1/2 over both primes.
// INSTRUMENT (a failure makes the verdict partial): u* is ringAngle((3 + w), 3) times -1; F = 24 num; A and B are the same
//  on both beat parities; A has the shape c X (I + beta z z^T) to 1e-12; B is unitary to 1e-12; the fast pair beat equals
//  the dense one to 1e-12 over 4 beats; flatBoxTables(4) equals contactFresh with flat links; the one-beat map of all 276
//  contact pairs at both parities (side 2) and of a neighbor pair, a hole and fear and a hole and stored pair (side 4)
//  equals the sparse sum exactly, and a lone fear's 2 beats (side 4); one beat forward and back returns a hole exactly
//  (amplitude S^(2 cells)); Hellmann-Feynman against a central difference on A to 1e-6.
// CONTROLS (a failure makes the verdict partial).
//  C1 X1a can fail: the rule's matrix against the n = 1 float model at theta* differs by more than 0.1.
//  C2 X2's census can fail: on a dock with two holes at inner product 0 the collision permutes (contactActs, 168 pairs).
//  C3 the peak reading sees motion: the one-hole Bloch beat at K0 = (0.6, 0.2, -0.1, 0.4) and K0 + 0.2 e1 gives the moving
//     pair's peaks at the eigenphases' secant speed to 1e-4 and the flat peaks at speed under 1e-6 (matched within 0.3 rad,
//     the control's own window: a one-hole band moves up to 0.14 rad over the step; set after run 1, see below).
//  C4 the free reference holds its frozen weight: two free holes keep (1 - moving)^2 within 0.02 at beat 256, moving the
//     start slot's weight on the moving pair averaged over 2,048 Weyl momenta.
//  C5 X5c can fail: the slide at c = 1/2 read with the tie at 1 leaves gamma + mu nonzero (rank 1).
// Verdict: partial if the instrument or a control fails; pass if X1 to X5 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (tmp/mbody-probe1 .. 8, and tmp/mbody-slide): the matrices (gap 4.9e-15, all = w^11
// mixer-coin, m 0.046778, R 1.000730); B unitary 2.4e-15, K on 168 pairs; the pair runs at ball 4 (the rule keeps 0.73
// (inner 0), 0.33 (inner -2), 0.79 (inner 1), 0.81 (inner -1) at beat 128 against the free 0.85, the frozen peaks at
// 2.0944 and -1.0472 unmoved by K, the empty-line pair's peak at 1.638 moving 0.008 rad over 0.8 in K and decaying, kept
// 0.086 at beat 512 at ball 4 and 0.095 at ball 6); the ball-16 walk (W 2.7e-4 at 4 falling to 7.3e-5 at 16, the 1e-3
// front at most 0.50 c at t = 4 and 0.375 c from t = 8); the side-4 box against the sparse sum (one hole 3 beats 0 off), the
// side-2 contact check (552 of 552), a side-2 multi-beat check that failed by aliasing (x + r = x - r on side 2, so it
// was dropped for side 4 one-beat checks); the fear's sparse run (store at beat 1 and 2, fear at -r_B with 0.49 at beat
// 3); the slide at c = 1/2 (Y2 on both primes). The probes fixed the kappa-free readings above (ball 4, 256 beats, the Hann
// window, weight floor 0.01, the W thresholds); no threshold was moved after the gate run.
//
// FIRST RUN (tmp/mbody-exp-run1.log, 935 s): partial, on two READING DEFECTS. (1) X2's census counted a dock whenever
//  bouncePermutation returned nonzero, and it returns 2 on any dock of full lines even when every like line passes (its
//  permutation is then the identity): 32,768 and 524,288 "permuting" dock-beats on the untouched seas. The fix counts a dock
//  only when the permutation moves a slot. (2) C3 matched the one-hole bands within X3a's 0.05 rad, but a one-hole band
//  moves up to 0.14 rad over the 0.2 step, so the moving peaks went unmatched (NaN). The control got its own window, 0.3.
//  No gate threshold moved; every other number of run 1 equals run 2's.
// SECOND RUN (tmp/mbody-exp-run2.log, 643 s): partial on C3 alone, a third reading defect in the control: its peak floor
//  1e-6 admitted the Hann sidelobes (1e-4 to 1e-6 of a main peak), which were matched as moving bands (gap 0.397 c). The
//  floor is set to 1e-3 (tmp/mbody-c3.log: the peaks sit on the eigenphases to 1e-5; the moving pair at 0.1224 and 0.0089).
//  X1, X2, X3, X5 hold, X4 fails, as predicted.
// THIRD RUN (tmp/mbody-exp-run3.log, 682 s): FAIL on X4 alone, as predicted; the instrument and every control hold. No
//  gate threshold moved in any run.
//  - X1a: the rule's matrix equals the float model to 4.9e-15, the full operator is w^11 times it (0 off, both parities),
//    the side-4 box run equals the sparse sum at 24 / 576 / 3,768 branches (0 off); 1 + 11 + 12, m 0.046778, R 1.000730
//    along all four directions, c_eff 0.499818 c, the third band 4.5e-16, top 0.488178 c: E-SPN-0143 read off the rule.
//  - X1b: the support reaches exactly t (the straight path 0.0832 a beat), norm exact; the weight beyond (c/2) t + c is
//    2.65e-4, 1.25e-4, 7.29e-5 at t 4, 8, 16; the 1e-3 front along 9 directions is at most 0.375 c (t 8), 0.332 c (t 16).
//  - X2: sides 4 and 8, 128 beats: one branch, the sea, amplitude F^cells exactly each beat, 0 docks permuted.
//  - X3: contact classes (ball 4, beat 256; free = two distinguishable free holes): inner 0 keeps 0.716 against 0.846,
//    inner -2 (the empty line) 0.188 against 0.844, inner 1 0.774 against 0.846, inner -1 0.794 against 0.846. So the
//    interaction UNFREEZES part of the frozen lineon weight (0.05 to 0.66 of it by beat 256), and the released holes leave
//    as free holes, under c/2. What stays is frozen: its peaks sit on arg(+-c^2) = 2.0944, -1.0472 and do not move with K
//    (1e-8 to 4e-5 c); the fastest retained peak is a weak inner-0 satellite at 1.894 moving 0.022 c; the empty line's
//    resonance at 1.638 moves 0.004 to 0.008 c and decays. A lone fear's charge is 0, 0, 1 roots out at t 1, 2, 3 (the
//    walker's first step, weight 0.491), a hole and fear's 0, 0; a stored pair changes nothing for a lone hole (0 off).
//  - X4: no class holds more than two free holes (0 of 4, at ball 4 and ball 5), so there is no bound composite to move.
//  - X5: the hole's Born weight equals the empty-mesh love's at 24 / 576 / 3,768 slots (0 off); the charge register is
//    kept on every branch and by all 1,185 met dock states (the occupation register breaks at 2, the unmaking docks); the
//    slide at c/2 gives mu 1, (mu, gamma) 1, gamma + c*^2 mu 0 on both primes, and its tie read at 1 fails (rank 1).
//  - Controls: the n = 1 model differs by 0.500; K acts on 168 pairs; the Bloch peaks give the eigenphase secant to 1.2e-6;
//    two free holes keep 0.846 against (1 - 0.0834)^2 = 0.840; the slide control fails as it must.
//
// DETERMINISM: no random numbers; momenta are fixed or an additive recurrence. EXACT: the rule and every box comparison in
// Z[w]; the band and pair readings are floats of maps whose entries are read exactly from the rule. NOTHING MOVES: the
// pieces hand values between slots of one dock; the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { flatLinks, tablesOn } from '@/code/measure/link-holonomy'
import {
  placeInSea,
  seaConfiguration,
} from '@/code/measure/pauli-mixer'
import { rootIndex } from '@/code/measure/crossing-lines'
import {
  bandAt,
  dockMatrix,
  DOCK_ROOTS,
  eigenphases,
  exactDockWalk,
  velocityGap,
  wrap,
  type CMatrix,
  type EisB,
} from '@/code/measure/dock-mixer'
import {
  fastestBand,
  singletKinematics,
  singletLevel,
  weylMomenta,
} from '@/code/measure/singlet-kinematics'
import { ringAngle } from '@/code/measure/swap-cone'
import { slideTied } from '@/code/measure/slide-speed'
import { primeBelow } from '@/code/algebra/linear/modular-linear'
import {
  complexEigenvalues,
  complexEigenvector,
} from '@/code/algebra/linear/complex-eigen'
import {
  d4BoxCell,
  d4BoxCoordinates,
  d4Coordinates,
  d4Vector,
} from '@/code/substrate/d4-box-integer'
import {
  lockedState,
  sameConfiguration,
  type Branch,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  ringScale,
  swapMixedBeat,
  swapMixedBeatBack,
  SWAP_ANGLE,
} from '@/code/rule/swap-mixer'
import {
  BOUNCE_TABLE,
  bouncePermutation,
} from '@/code/rule/bounce-pair-knit'
import {
  blochPeaks,
  compareWithRule,
  configKey,
  contactActs,
  d4Ball,
  d4Steps,
  dockOutcomes,
  eFloat,
  eNorm,
  ePow,
  exactBeat,
  flatBoxTables,
  floatBeat,
  holeBeatFast,
  holeDockExact,
  holeShape,
  markedConfig,
  metDocks,
  pairBeat,
  pairBeatDense,
  pairDockExact,
  PAIRS,
  pairRun,
  pairStart,
  peakSpeeds,
  relativeFloat,
  ROOTS,
  seaDock,
  seaFactor,
  unitarityGap,
  type Config,
  type DockState,
  type ExactSum,
  type FloatSum,
  type Peak,
} from '@/code/measure/swap-sector'

const C = Math.SQRT2
const C_STAR = C / 2
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const FOUR: readonly number[][] = [
  [1, 0, 0, 0],
  [s2, s2, 0, 0],
  [s3, s3, s3, 0],
  GENERIC,
]
const NINE: readonly { name: string; u: number[] }[] = [
  { name: 'e1', u: [1, 0, 0, 0] },
  { name: 'e4', u: [0, 0, 0, 1] },
  { name: 'e12', u: [s2, s2, 0, 0] },
  { name: '-e12', u: [-s2, -s2, 0, 0] },
  { name: 'e1-2', u: [s2, -s2, 0, 0] },
  { name: 'e34', u: [0, 0, s2, s2] },
  { name: 'e123', u: [s3, s3, s3, 0] },
  { name: 'half', u: [0.5, 0.5, 0.5, 0.5] },
  { name: 'generic', u: GENERIC },
]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const MATRIX_TOLERANCE = 1e-12
const READ_TOLERANCE = 1e-9
const SPEED_TOLERANCE = 1e-6
const BOX_SIDE = 4
const BOX_BEATS = 3
const SEA_SIDES: readonly number[] = [4, 8]
const SEA_BEATS = 128
const WALK_BEATS = 6
const BALL_BEATS = 16
const FRONT_QUANTILE = 1e-3
const W_CEILING = 1e-4
const PAIR_RADIUS = 4
const PAIR_RADIUS_CHECK = 5
const PAIR_BEATS = 256
const PAIR_WINDOW = 128
const PEAK_FLOOR = 0.01
const PEAK_MATCH = 0.05
const DELTA = 0.2
const K_GENERIC = [0.6, 0.2, -0.1, 0.4]
const HOLD_MARGIN = 0.01
const INERTIA_TOLERANCE = 0.05
const FEAR_BEATS = 3
const HOLE_FEAR_BEATS = 2
const FREE_TOLERANCE = 0.02
const C3_TOLERANCE = 1e-4
const C3_WINDOW = 0.3
const C3_FLOOR = 1e-3
const WEYL_FLAT = 2048

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)
const flag = (b: boolean): number => (b ? 1 : 0)

// the charge register per slot (hole 1, fear 4) and per store (2) of a whole configuration
function chargeRegister(c: Configuration): number {
  let r = 0

  for (const v of c.vibe) {
    r += v === 0 ? 1 : v < 0 ? 4 : 0
  }

  for (const x of c.store) {
    if (x !== 0) {
      r += 2
    }
  }

  return r
}

const dockRegister = (
  d: DockState,
  kind: 'occupation' | 'charge',
): number => {
  let r = 0

  for (let i = 0; i < 24; i++) {
    r +=
      d.vibe[i] === 0 ? 1 : kind === 'charge' && d.vibe[i]! < 0 ? 4 : 0
  }

  for (let i = 0; i < 12; i++) {
    if (d.store[i] !== 0) {
      r += 2
    }
  }

  return r
}

type Mark = {
  d: readonly number[]
  slot?: number
  vibe?: number
  line?: number
  store?: number
}

// a start on the flat box sea and the same start on the infinite lattice (positions x0 + d)
function boxStart(
  sea: Configuration,
  side: number,
  x0: readonly number[],
  marks: readonly Mark[],
): { rule: Configuration; engine: Config } {
  const c = placeInSea(sea, [])
  const engineMarks = marks.map(m => ({
    x: x0.map((v, k) => v + m.d[k]!),
    slot: m.slot,
    vibe: m.vibe,
    line: m.line,
    store: m.store,
  }))
  const cfg = markedConfig(engineMarks)

  for (const d of cfg.docks) {
    const cell = d4BoxCellOf(d.x, side)

    for (let q = 0; q < 24; q++) {
      c.vibe[cell * 24 + q] = d.s.vibe[q]!
      c.point[cell * 24 + q] = d.s.point[q]!
      c.open[cell * 24 + q] = d.s.open[q]!
    }

    for (let l = 0; l < 12; l++) {
      c.store[cell * 12 + l] = d.s.store[l]!
      c.spoint[cell * 12 + l] = d.s.spoint[l]!
      c.sopen[cell * 12 + l] = d.s.sopen[l]!
    }
  }

  return { rule: c, engine: cfg }
}

const d4BoxCellOf = (x: readonly number[], side: number): number =>
  d4BoxCell({ coordinates: d4Coordinates(x), side })

export default experiment({
  id: 'spin/swap-many-body',
  code: 'E-SPN-0145',
  title:
    "the swap coin and ring mixer as a rule keep one limiting speed c/2 once holes interact, but bind nothing, fail (X4): the rule's one-hole matrix is E-SPN-0143's float model to 4.9e-15 (m 0.046778, R 1.000730, c_eff 0.499818 c, 22 flat bands, top 0.488 c, the box run equal to the sparse sum at 3,768 branches), the love sea stays one branch with amplitude F^cells for 128 beats and nothing collides; a lone hole's support front moves at c on a 0.083-a-beat straight path while its weight beyond (c/2) t + c falls to 7.3e-5 and its 1e-3 front sits at 0.33 c; two holes interact only at contact (the empty line's meeting phase, the contact K on 168 of 276 pairs, the mixer's hop sign), which releases 0.05 to 0.66 of the frozen lineon weight as free holes, while what stays is frozen at arg(+-c^2) and moves at most 0.022 c; the empty-line pair is a decaying resonance; a fear is unmade into a static store and two holes that the swap coin brings back, so it walks one root per completed two-beat cycle (c/2 at most); no contact class keeps more weight than two free holes, since flat links carry no string; the hole's Born weight equals the empty-mesh love's exactly, the charge register is kept dock by dock, and E-GRV-0141's slide carried at c/2 ties the graviton to c/2",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const B = rootIndex([1, 1, 0, 0])
    const rB = ROOTS[B]!

    // ---------------- instrument: the ring and the dock matrices ----------------
    const ring = ringAngle([3n, 1n], 3)
    const ringOk =
      ring.numerator[0] === -SWAP_ANGLE.num[0] &&
      ring.numerator[1] === -SWAP_ANGLE.num[1] &&
      ring.den === SWAP_ANGLE.den &&
      ring.normExact
    const thetaStar = Math.PI + ring.delta
    const F = seaFactor()
    const fOk =
      F[0] === 24n * SWAP_ANGLE.num[0] &&
      F[1] === 24n * SWAP_ANGLE.num[1]
    const mc = holeDockExact(0, SWAP_ANGLE, 'mixer-coin')
    const all0 = holeDockExact(0)
    const all1 = holeDockExact(1)
    const b0 = pairDockExact(0)
    const b1 = pairDockExact(1)
    const sameExact = (
      x: { entries: [bigint, bigint][][]; k: number },
      y: { entries: [bigint, bigint][][]; k: number },
    ): boolean =>
      x.k === y.k &&
      x.entries.every((row, i) =>
        row.every(
          (e, j) =>
            e[0] === y.entries[i]![j]![0] &&
            e[1] === y.entries[i]![j]![1],
        ),
      )
    const parityOk = sameExact(all0, all1) && sameExact(b0, b1)

    let w11Off = 0

    all0.entries.forEach((row, i) =>
      row.forEach((e, j) => {
        const m = (mc.entries[i] as [bigint, bigint][])[j]!
        // w^11 = w^2 = -1 - w
        const z: [bigint, bigint] = [-m[0] + m[1], -m[0]]

        if (
          z[0] * 2n ** BigInt(all0.k) !== e[0] * 2n ** BigInt(mc.k) ||
          z[1] * 2n ** BigInt(all0.k) !== e[1] * 2n ** BigInt(mc.k)
        ) {
          w11Off++
        }
      }),
    )

    const over = (
      m: { entries: [bigint, bigint][][]; k: number },
      P: CMatrix,
    ): number => {
      let gap = 0

      const den = 8232 * 2 ** m.k

      m.entries.forEach((row, i) =>
        row.forEach((e, j) => {
          const [x, y] = eFloat(e[0], e[1])

          gap = Math.max(
            gap,
            Math.hypot(
              x / den - P.re[i * 24 + j]!,
              y / den - P.im[i * 24 + j]!,
            ),
          )
        }),
      )

      return gap
    }

    const PF = dockMatrix(thetaStar, 2 / 3, true)
    const matrixGap = over(mc, PF)
    const oldCoinGap = over(mc, dockMatrix(thetaStar, 1, true))
    const C1 = oldCoinGap > 0.1
    const A = relativeFloat(all0)
    const Bm = relativeFloat(b0)
    const shape = holeShape(A)
    const bUnitary = unitarityGap(Bm)

    log('matrices')

    // ---------------- X1a: the one-hole readings from the rule's matrix ----------------
    const PA: CMatrix = { re: A.re, im: A.im }
    const levelA = singletLevel(PA, DOCK_ROOTS, 12)
    const levelF = singletLevel(PF, DOCK_ROOTS, 12)
    const kinA = FOUR.map(u =>
      singletKinematics(PA, DOCK_ROOTS, levelA, u, SCALES),
    )
    const kinF = FOUR.map(u =>
      singletKinematics(PF, DOCK_ROOTS, levelF, u, SCALES),
    )
    const RA = kinA.map(k => (C_STAR * C_STAR) / k.c2)
    const RF = kinF.map(k => (C_STAR * C_STAR) / k.c2)
    const readGap = Math.max(
      Math.abs(levelA.m - levelF.m),
      ...RA.map((r, i) => Math.abs(r - RF[i]!)),
      ...kinA.map(
        (k, i) =>
          Math.abs(
            Math.sqrt(k.c2) - Math.sqrt((kinF[i] as { c2: number }).c2),
          ) / C,
      ),
    )
    const sizes = levelA.multiplets
      .map(x => x.size)
      .sort((a, b) => a - b)
      .join('+')
    const partnerSize =
      levelA.partner >= 0
        ? (levelA.multiplets[levelA.partner] as { size: number }).size
        : 0
    const weyl = weylMomenta(1024)
    const radial = FOUR.flatMap(u => RADII.map(r => u.map(x => x * r)))

    let third = 0

    for (const K of weyl) {
      third = Math.max(
        third,
        bandAt(PA, DOCK_ROOTS, K)
          .velocity.map(v => Math.hypot(...v))
          .sort((a, b) => b - a)[2]!,
      )
    }

    const top = fastestBand(PA, DOCK_ROOTS, [...weyl, ...radial]).speed
    const velGap = Math.max(
      ...FOUR.map(u =>
        velocityGap(PA, DOCK_ROOTS, [0.31, -1.07, 0.73, 2.03], u),
      ),
    )

    log('X1a readings')

    // ---------------- the side-4 box: the rule against the sparse sum ----------------
    const X = centerOf(BOX_SIDE)
    const box = flatBoxTables(BOX_SIDE)
    const fr = contactFresh(BOX_SIDE, 'pass', X)
    const ref = tablesOn(fr.weave, 'pass', flatLinks(fr.weave))

    let tablesDiff = 0

    for (let i = 0; i < ref.target.length; i++) {
      if (ref.target[i] !== box.target[i]) {
        tablesDiff++
      }
    }

    for (let i = 0; i < ref.move.length; i++) {
      if (ref.move[i] !== box.move[i] || ref.back[i] !== box.back[i]) {
        tablesDiff++
      }
    }

    const cells = box.cells
    const sea = seaConfiguration(cells, 1)
    const x0 = d4Vector(d4BoxCoordinates({ cell: X, side: BOX_SIDE }))
    const ZERO = [0, 0, 0, 0]

    let chargeBranchOff = 0

    const runBox = (
      marks: readonly Mark[],
      beats: number,
    ): {
      off: number
      aliased: number
      branches: number[]
      last: LockedState
    } => {
      const st = boxStart(sea, BOX_SIDE, x0, marks)

      let s: LockedState = lockedState(st.rule)
      let e: ExactSum = new Map([
        [
          configKey(st.engine),
          { c: st.engine, amp: { a: 1n, b: 0n, k: 0 } },
        ],
      ])

      const r0 = chargeRegister(st.rule)

      let off = 0
      let aliased = 0

      const branches: number[] = []

      for (let t = 0; t < beats; t++) {
        s = swapMixedBeat('none', box, s, t)
        e = exactBeat(e, t, cells)

        const cmp = compareWithRule(s.branches, e, BOX_SIDE)

        off += cmp.off
        aliased += cmp.aliased
        branches.push(s.branches.length)

        for (const br of s.branches) {
          if (chargeRegister(br) !== r0) {
            chargeBranchOff++
          }
        }
      }

      return { off, aliased, branches, last: s }
    }

    const holeRun = runBox([{ d: ZERO, slot: B, vibe: 0 }], BOX_BEATS)

    log('box hole')

    const oneBeat = [
      {
        name: 'neighbors',
        marks: [
          { d: ZERO, slot: 0, vibe: 0 },
          { d: rB, slot: 6, vibe: 0 },
        ],
      },
      {
        name: 'hole and fear',
        marks: [
          { d: ZERO, slot: B, vibe: 0 },
          { d: rB, slot: B, vibe: -1 },
        ],
      },
      {
        name: 'hole and stored pair',
        marks: [
          { d: ZERO, slot: B, vibe: 0 },
          { d: rB, line: 3, store: 1 },
        ],
      },
    ].map(r => ({ name: r.name, ...runBox(r.marks, 1) }))
    const fearBox = runBox([{ d: rB, slot: B, vibe: -1 }], 2)

    log('box starts')

    // every contact pair, one beat, both parities, on side 2 (one beat cannot alias there: the two holes leave on
    // different slots)
    const box2 = flatBoxTables(2)
    const sea2 = seaConfiguration(box2.cells, 1)
    const x02 = d4Vector(
      d4BoxCoordinates({ cell: centerOf(2), side: 2 }),
    )

    let contactOff = 0
    let contactChecked = 0

    for (const [p, q] of PAIRS) {
      for (const beat of [0, 1]) {
        const st = boxStart(sea2, 2, x02, [
          { d: ZERO, slot: p, vibe: 0 },
          { d: ZERO, slot: q, vibe: 0 },
        ])
        const s = swapMixedBeat(
          'none',
          box2,
          lockedState(st.rule),
          beat,
        )
        const e = exactBeat(
          new Map([
            [
              configKey(st.engine),
              { c: st.engine, amp: { a: 1n, b: 0n, k: 0 } },
            ],
          ]),
          beat,
          box2.cells,
        )
        const cmp = compareWithRule(s.branches, e, 2)

        contactOff += cmp.off + cmp.aliased
        contactChecked++

        for (const br of s.branches) {
          if (chargeRegister(br) !== 2) {
            chargeBranchOff++
          }
        }
      }
    }

    log('contact pairs')

    // one beat forward and back
    const holeStart = boxStart(sea, BOX_SIDE, x0, [
      { d: ZERO, slot: B, vibe: 0 },
    ]).rule
    const back = swapMixedBeatBack(
      'none',
      box,
      swapMixedBeat('none', box, lockedState(holeStart), 0),
      0,
    )
    const reverseOk =
      back.branches.length === 1 &&
      sameConfiguration(back.branches[0]!, holeStart) &&
      back.branches[0]!.a ===
        ringScale(SWAP_ANGLE) ** BigInt(2 * cells) *
          (1n << BigInt(back.branches[0]!.k)) &&
      back.branches[0]!.b === 0n

    log('reverse')

    // ---------------- X5a: the hole against a love on the empty mesh ----------------
    const loveRun: LockedState[] = []

    let sl: LockedState = lockedState(
      placeInSea(seaConfiguration(cells, 0), [
        { dock: X, slot: B, vibe: 1 },
      ]),
    )
    let sh: LockedState = lockedState(holeStart)
    let signOff = 0

    const signSlots: number[] = []

    for (let t = 0; t < BOX_BEATS; t++) {
      sl = swapMixedBeat('none', box, sl, t)
      sh = swapMixedBeat('none', box, sh, t)
      loveRun.push(sl)

      const field = (
        s: LockedState,
        find: (b: Branch) => number,
      ): Map<number, bigint> => {
        const m = new Map<number, bigint>()
        const K = Math.max(...s.branches.map(b => b.k))

        for (const b of s.branches) {
          m.set(
            find(b),
            (m.get(find(b)) ?? 0n) +
              eNorm([b.a, b.b]) * (1n << BigInt(2 * (K - b.k))),
          )
        }

        return m
      }

      const fh = field(sh, b => b.vibe.findIndex(v => v === 0))
      const fl = field(sl, b => b.vibe.findIndex(v => v === 1))

      for (const [k, v] of fh) {
        if (fl.get(k) !== v) {
          signOff++
        }
      }

      signOff += Math.abs(fh.size - fl.size)
      signSlots.push(fh.size)
    }

    const X5a = signOff === 0

    log('X5a')

    // ---------------- X1b: the exact walk and the float ball ----------------
    const reach: number[] = []
    const normOk: boolean[] = []

    exactDockWalk(
      all0.entries as EisB[][],
      DOCK_ROOTS,
      B,
      WALK_BEATS,
      (t, sites) => {
        let r = 0
        let total = 0n

        for (const site of sites.values()) {
          r = Math.max(r, d4Steps(site.v))

          for (const a of site.amp) {
            total += eNorm(a)
          }
        }

        reach.push(r)
        normOk.push(total === 8232n ** BigInt(2 * t))
      },
    )

    const straight =
      Math.hypot(
        ...eFloat(...(all0.entries[B] as [bigint, bigint][])[B]!),
      ) / 8232
    const ball = d4Ball(BALL_BEATS)
    const o = ball.index.get('0,0,0,0')!

    let hs = {
      re: new Float64Array(ball.points.length * 24),
      im: new Float64Array(ball.points.length * 24),
    }

    const fronts: { t: number; worst: number; per: number[] }[] = []
    const W = new Map<number, number>()

    hs.re[o * 24 + B] = 1

    for (let t = 1; t <= BALL_BEATS; t++) {
      hs = holeBeatFast(ball, shape, hs).next

      const w = ball.points.map((_, i) => {
        let x = 0

        for (let d = 0; d < 24; d++) {
          x += hs.re[i * 24 + d]! ** 2 + hs.im[i * 24 + d]! ** 2
        }

        return x
      })

      W.set(
        t,
        ball.points.reduce(
          (a, p, i) =>
            Math.hypot(...p) > (t + 2) / C + 1e-9 ? a + w[i]! : a,
          0,
        ),
      )

      if (t % 2 === 0 && t >= 8) {
        const per = NINE.map(({ u }) => {
          const pr = ball.points
            .map((p, i) => ({ x: dot(p, u), w: w[i]! }))
            .sort((a, b) => b.x - a.x)

          let acc = 0

          for (const q of pr) {
            acc += q.w

            if (acc >= FRONT_QUANTILE) {
              return q.x / t / C
            }
          }

          return 0
        })

        fronts.push({ t, worst: Math.max(...per), per })
      }
    }

    const w4 = W.get(4)!
    const w8 = W.get(8)!
    const w16 = W.get(16)!
    const X1b =
      reach.every((r, i) => r === i + 1) &&
      normOk.every(Boolean) &&
      fronts.every(f => f.worst <= 0.5) &&
      w16 < w8 &&
      w8 < w4 &&
      w16 <= W_CEILING
    const X1a =
      matrixGap <= MATRIX_TOLERANCE &&
      w11Off === 0 &&
      holeRun.off === 0 &&
      holeRun.aliased === 0 &&
      sizes === '1+11+12' &&
      partnerSize === 12 &&
      readGap <= READ_TOLERANCE &&
      third <= READ_TOLERANCE &&
      top <= C_STAR * (1 + SPEED_TOLERANCE)

    log('X1b')

    // ---------------- X2: the seas ----------------
    const perm = new Int32Array(24)
    const seas = SEA_SIDES.map(side => {
      const tab = flatBoxTables(side)
      const s0 = seaConfiguration(tab.cells, 1)
      const Fc = ePow(F, tab.cells)

      let s: LockedState = lockedState(s0)
      let exact = true
      let permutes = 0

      for (let t = 0; t < SEA_BEATS; t++) {
        s = swapMixedBeat('none', tab, s, t)

        const br = s.branches[0]!

        if (
          s.branches.length !== 1 ||
          !sameConfiguration(br, s0) ||
          br.k !== 0 ||
          br.a !== Fc[0] ||
          br.b !== Fc[1]
        ) {
          exact = false
          break
        }

        // a dock counts when the collision's permutation moves a slot (bouncePermutation returns 2 on a dock of full
        // lines even when every like line passes, so its return code alone is not the reading)
        for (let x = 0; x < tab.cells; x++) {
          if (
            bouncePermutation(
              BOUNCE_TABLE,
              'pass',
              br.vibe,
              x * 24,
              perm,
            ) !== 0 &&
            perm.some((to, d) => to !== d)
          ) {
            permutes++
          }
        }

        // the amplitude was checked exactly; the next beat starts from 1 again
        br.a = 1n
        br.b = 0n
      }

      return { side, cells: tab.cells, exact, permutes }
    })
    const X2 = seas.every(r => r.exact && r.permutes === 0)
    const kActs = PAIRS.filter(([p, q]) => contactActs(p, q)).length
    const C2 = contactActs(0, 1) && kActs > 0

    log('X2')

    // ---------------- X3a, X4: two holes at total momentum K ----------------
    const classes = new Map<number, [number, number]>()

    for (const [p, q] of PAIRS) {
      const ip = dot(ROOTS[p] as number[], ROOTS[q] as number[])

      if (!classes.has(ip)) {
        classes.set(ip, [p, q])
      }
    }

    const reps = [...classes].map(([inner, pq]) => ({
      inner,
      p: pq[0],
      q: pq[1],
    }))
    const ball4 = d4Ball(PAIR_RADIUS)
    const ball5 = d4Ball(PAIR_RADIUS_CHECK)
    const U2 = [
      { name: 'e1', u: [1, 0, 0, 0] },
      { name: 'face', u: [s2, s2, 0, 0] },
    ]
    const bases = [
      { name: '0', K: [0, 0, 0, 0] },
      { name: 'g', K: K_GENERIC },
    ]
    const run = (
      b: typeof ball4,
      K: number[],
      p: number,
      q: number,
      free: boolean,
      peaks: boolean,
    ) =>
      pairRun({
        ball: b,
        h: shape,
        B: free ? null : Bm,
        K,
        p,
        q,
        T: PAIR_BEATS,
        checkpoints: [128, 256],
        M: PAIR_WINDOW,
        floor: peaks ? PEAK_FLOOR : -1,
      })
    const pairReads = reps.map(rep => {
      const perBase = bases.map(base => {
        const r0 = run(ball4, base.K, rep.p, rep.q, false, true)
        const free = run(ball4, base.K, rep.p, rep.q, true, false)
        const shifted = U2.map(({ name, u }) => {
          const r1 = run(
            ball4,
            base.K.map((x, k) => x + DELTA * u[k]!),
            rep.p,
            rep.q,
            false,
            true,
          )

          return {
            name,
            speeds: peakSpeeds(r0.peaks, r1.peaks, DELTA, PEAK_MATCH),
            peaks: r1.peaks,
          }
        })

        return {
          base: base.name,
          kept: r0.kept,
          freeKept: free.kept,
          peaks: r0.peaks,
          shifted,
        }
      })
      const check = run(ball5, [0, 0, 0, 0], rep.p, rep.q, false, false)
      const checkFree = run(
        ball5,
        [0, 0, 0, 0],
        rep.p,
        rep.q,
        true,
        false,
      )

      log(`pair class ${rep.inner}`)

      return {
        ...rep,
        perBase,
        check: check.kept,
        checkFree: checkFree.kept,
      }
    })
    const allSpeeds = pairReads.flatMap(r =>
      r.perBase.flatMap(b =>
        b.shifted.flatMap(s =>
          s.speeds.filter(x => x.weight >= PEAK_FLOOR),
        ),
      ),
    )
    const X3a =
      allSpeeds.length > 0 &&
      allSpeeds.every(s => Number.isFinite(s.speed) && s.speed <= 0.5)
    const topPeakSpeed = Math.max(...allSpeeds.map(s => s.speed))
    const frozenPhase = 2 * Math.atan2(shape.c[1], shape.c[0])
    const offFrozen = (p: Peak): boolean =>
      Math.min(
        Math.abs(wrap(p.phase - frozenPhase)),
        Math.abs(wrap(p.phase - frozenPhase - Math.PI)),
      ) > 1e-3
    const held = pairReads.filter(r => {
      const b0r = r.perBase[0]!

      return (
        b0r.kept[1]! - b0r.freeKept[1]! >= HOLD_MARGIN &&
        r.check[1]! - r.checkFree[1]! >= HOLD_MARGIN
      )
    })

    let X4 = false

    const x4Notes: string[] = []

    for (const r of held) {
      const b0r = r.perBase[0]!
      const strongest = b0r.peaks
        .filter(offFrozen)
        .sort((a, b) => b.weight - a.weight)[0]

      if (!strongest) {
        continue
      }

      const inert = b0r.shifted.map(s => {
        const m = s.speeds.find(x => x.phase === strongest.phase)
        const dphi = m ? m.speed * DELTA * C : NaN

        return (DELTA * DELTA) / (2 * dphi)
      })
      const E = Math.abs(wrap(strongest.phase - frozenPhase))
      const iso =
        Math.abs(inert[0]! / inert[1]! - 1) <= INERTIA_TOLERANCE
      const einstein =
        Math.abs((inert[0]! * C_STAR * C_STAR) / E - 1) <=
        INERTIA_TOLERANCE

      x4Notes.push(
        `class ${r.inner}: peak ${strongest.phase.toFixed(5)}, inertia ${inert.map(x => x.toFixed(3)).join('/')}, E ${E.toFixed(4)}`,
      )

      if (iso && einstein) {
        X4 = true
      }
    }

    log('X3a X4')

    // ---------------- C3: the peak reading on the one-hole Bloch beat ----------------
    // the floor sits above the Hann sidelobes (under 1e-3 of a peak), which run 2 read as moving peaks
    const pk0 = blochPeaks(
      A,
      K_GENERIC,
      B,
      PAIR_BEATS,
      PAIR_WINDOW,
      C3_FLOOR,
    )
    const K1 = K_GENERIC.map((x, k) => x + DELTA * (k === 0 ? 1 : 0))
    const pk1 = blochPeaks(A, K1, B, PAIR_BEATS, PAIR_WINDOW, C3_FLOOR)
    const e0 = eigenphases(PA, DOCK_ROOTS, K_GENERIC)
    const e1 = eigenphases(PA, DOCK_ROOTS, K1)
    const cPhase = Math.atan2(shape.c[1], shape.c[0])
    const flatPhase = (p: number): boolean =>
      Math.min(
        Math.abs(wrap(p - cPhase)),
        Math.abs(wrap(p - cPhase - Math.PI)),
      ) < 1e-6
    const movingE0 = e0.filter(p => !flatPhase(p))

    let c3Gap = 0
    let c3Flat = 0

    // the control's own window: a one-hole band moves up to 0.49 c sqrt 2 0.2 = 0.14 rad over the step, past X3a's 0.05
    for (const s of peakSpeeds(pk0, pk1, DELTA, C3_WINDOW)) {
      if (flatPhase(s.phase)) {
        c3Flat = Math.max(c3Flat, s.speed)
        continue
      }

      const near0 = movingE0.reduce(
        (b, p) =>
          Math.abs(wrap(p - s.phase)) < Math.abs(wrap(b - s.phase))
            ? p
            : b,
        movingE0[0]!,
      )
      const near1 = e1.reduce(
        (b, p) =>
          Math.abs(wrap(p - near0)) < Math.abs(wrap(b - near0)) ? p : b,
        e1[0]!,
      )

      c3Gap = Math.max(
        c3Gap,
        Math.abs(s.speed - Math.abs(wrap(near1 - near0)) / DELTA / C),
      )
    }

    const C3 =
      movingE0.length === 2 &&
      pk0.filter(p => !flatPhase(p.phase)).length === 2 &&
      c3Gap <= C3_TOLERANCE &&
      c3Flat <= 1e-6

    // ---------------- C4: the free reference against the frozen weight ----------------
    let moving = 0

    for (const K of weylMomenta(WEYL_FLAT)) {
      const ure = new Float64Array(576)
      const uim = new Float64Array(576)

      for (let r = 0; r < 24; r++) {
        const ph = -dot(ROOTS[r] as number[], K)

        for (let q = 0; q < 24; q++) {
          ure[r * 24 + q] =
            Math.cos(ph) * A.re[r * 24 + q]! -
            Math.sin(ph) * A.im[r * 24 + q]!

          uim[r * 24 + q] =
            Math.cos(ph) * A.im[r * 24 + q]! +
            Math.sin(ph) * A.re[r * 24 + q]!
        }
      }

      const ev = complexEigenvalues({ re: ure, im: uim, n: 24 })

      ev.re.forEach((x, i) => {
        const y = ev.im[i]!

        if (flatPhase(Math.atan2(y, x))) {
          return
        }

        const v = complexEigenvector({
          re: ure,
          im: uim,
          n: 24,
          value: [x, y],
        })
        const nrm = v.re.reduce(
          (a, r2, k) => a + r2 * r2 + v.im[k]! ** 2,
          0,
        )

        moving += (v.re[B]! ** 2 + v.im[B]! ** 2) / nrm
      })
    }

    moving /= WEYL_FLAT

    const frozen2 = (1 - moving) ** 2
    const C4 = pairReads.every(
      r =>
        Math.abs(r.perBase[0]!.freeKept[1]! - frozen2) <=
        FREE_TOLERANCE,
    )

    log('C3 C4')

    // ---------------- X3b, X3c: a fear, a hole and fear, a hole and a stored pair ----------------
    const charges = (c: Config, from: readonly number[]): number => {
      let r = 0

      for (const d of c.docks) {
        const has =
          [...d.s.vibe].some(v => v < 0) ||
          [...d.s.store].some(v => v !== 0)

        if (has) {
          r = Math.max(r, d4Steps(d.x.map((v, k) => v - from[k]!)))
        }
      }

      return r
    }

    const fearRun = (
      marks: Parameters<typeof markedConfig>[0],
      beats: number,
    ): { reach: number[]; fearFront: number[] } => {
      const c0 = markedConfig(marks)

      let s: FloatSum = new Map([
        [configKey(c0), { c: c0, re: 1, im: 0 }],
      ])

      const reachOut: number[] = []
      const fearFront: number[] = []

      for (let t = 0; t < beats; t++) {
        s = floatBeat(s, t)

        let r = 0
        let front = 0

        for (const { c, re, im } of s.values()) {
          const d = charges(c, rB)

          r = Math.max(r, d)

          if (d >= 1) {
            front += re * re + im * im
          }
        }

        reachOut.push(r)
        fearFront.push(front)
      }

      return { reach: reachOut, fearFront }
    }

    const fear = fearRun(
      [{ x: [...rB], slot: B, vibe: -1 }],
      FEAR_BEATS,
    )
    const holeFear = fearRun(
      [
        { x: ZERO, slot: B, vibe: 0 },
        { x: [...rB], slot: B, vibe: -1 },
      ],
      HOLE_FEAR_BEATS,
    )
    const X3b =
      fear.reach.every((r, i) => r <= Math.floor(i / 2)) &&
      holeFear.reach.every(r => r === 0)

    let storeOff = 0

    for (let h = 0; h < 24; h++) {
      const plain = seaDock()

      plain.vibe[h] = 0
      plain.open[h] = 0

      for (let l = 0; l < 12; l++) {
        const stored = seaDock()

        stored.vibe[h] = 0
        stored.open[h] = 0
        stored.store[l] = 1
        stored.sopen[l] = 3

        for (const beat of [0, 1]) {
          const a = dockOutcomes(plain, beat)
          const b = dockOutcomes(stored, beat)

          if (a.length !== b.length) {
            storeOff++
          } else {
            a.forEach((x, i) => {
              const y = b[i]!

              if (
                x.a !== y.a ||
                x.b !== y.b ||
                x.k !== y.k ||
                x.state.vibe.some((v, d) => v !== y.state.vibe[d]) ||
                y.state.store[l] !== 1 ||
                y.state.store.some((v, m) => m !== l && v !== 0)
              ) {
                storeOff++
              }
            })
          }
        }
      }
    }

    const X3c = storeOff === 0
    const X3 = X3a && X3b && X3c

    log('X3b X3c')

    // ---------------- X5b, X5c ----------------
    let dockChargeOff = 0
    let dockOccupationOff = 0
    let met = 0

    for (const { input, out } of metDocks()) {
      met++

      for (const x of out) {
        if (
          dockRegister(x.state, 'charge') !==
          dockRegister(input, 'charge')
        ) {
          dockChargeOff++
        }

        if (
          dockRegister(x.state, 'occupation') !==
          dockRegister(input, 'occupation')
        ) {
          dockOccupationOff++
        }
      }
    }

    const primes = [primeBelow(2 ** 25), primeBelow(2 ** 24)]
    const slides = primes.map(p => slideTied((p + 1) / 2, p))
    const slideControl = primes.map(p => slideTied((p + 1) / 2, p, 1))
    const X5b = chargeBranchOff === 0 && dockChargeOff === 0
    const X5c = slides.every(s => s.speedAtC)
    const C5 = slideControl.every(s => s.tied === 1)
    const X5 = X5a && X5b && X5c

    log('X5')

    // ---------------- instrument: the fast pair beat against the dense one ----------------
    let fastGap = 0

    {
      let a = pairStart(ball4, 0, 1)
      let b = pairStart(ball4, 0, 1)

      for (let t = 0; t < 4; t++) {
        a = pairBeat(ball4, shape, Bm, K_GENERIC, a).next
        b = pairBeatDense(ball4, { A, B: Bm }, K_GENERIC, b).next

        for (let i = 0; i < a.re.length; i++) {
          fastGap = Math.max(
            fastGap,
            Math.abs(a.re[i]! - b.re[i]!),
            Math.abs(a.im[i]! - b.im[i]!),
          )
        }
      }
    }

    const instrument =
      ringOk &&
      fOk &&
      parityOk &&
      shape.gap <= MATRIX_TOLERANCE &&
      bUnitary <= MATRIX_TOLERANCE &&
      fastGap <= MATRIX_TOLERANCE &&
      tablesDiff === 0 &&
      contactOff === 0 &&
      oneBeat.every(r => r.off === 0 && r.aliased === 0) &&
      fearBox.off === 0 &&
      fearBox.aliased === 0 &&
      reverseOk &&
      velGap <= 1e-6
    const controls = C1 && C2 && C3 && C4 && C5
    const X1 = X1a && X1b
    const status =
      !instrument || !controls
        ? 'partial'
        : X1 && X2 && X3 && X4 && X5
          ? 'pass'
          : 'fail'

    // ---------------- the report ----------------
    const classLine = pairReads
      .map(r => {
        const b0r = r.perBase[0]!
        const bg = r.perBase[1]!

        return `inner ${r.inner} (${r.p},${r.q}, K ${contactActs(r.p, r.q) ? 'acts' : 'never'}): kept at 128/256 K0 ${b0r.kept.map(x => x.toFixed(4)).join('/')} (free ${b0r.freeKept.map(x => x.toFixed(4)).join('/')}), g ${bg.kept.map(x => x.toFixed(4)).join('/')} (free ${bg.freeKept.map(x => x.toFixed(4)).join('/')}), ball 5 ${r.check.map(x => x.toFixed(4)).join('/')} (free ${r.checkFree.map(x => x.toFixed(4)).join('/')}); peaks K0 ${b0r.peaks.map(p => `${p.phase.toFixed(5)}:${p.weight.toFixed(4)}`).join(' ')}; speeds ${r.perBase.map(b => `${b.base}: ${b.shifted.map(s => `${s.name} ${s.speeds.map(x => `${x.phase.toFixed(4)}->${x.speed.toExponential(2)}`).join(' ')}`).join('; ')}`).join(' | ')}`
      })
      .join(' || ')
    const metrics: Record<string, number> = {
      X1: flag(X1),
      X1a: flag(X1a),
      X1b: flag(X1b),
      X2: flag(X2),
      X3: flag(X3),
      X3a: flag(X3a),
      X3b: flag(X3b),
      X3c: flag(X3c),
      X4: flag(X4),
      X5: flag(X5),
      X5a: flag(X5a),
      X5b: flag(X5b),
      X5c: flag(X5c),
      instrument: flag(instrument),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      C5: flag(C5),
      matrixGap,
      oldCoinGap,
      mSinglet: levelA.m,
      RAxis: RA[0]!,
      cEffOverC: Math.sqrt((kinA[0] as { c2: number }).c2) / C,
      readGap,
      thirdBand: third,
      topOverC: top / C,
      straightPath: straight,
      W4: w4,
      W8: w8,
      W16: w16,
      frontWorst: Math.max(...fronts.map(f => f.worst)),
      topPeakSpeed,
      heldClasses: held.length,
      fearFront3: fear.fearFront[FEAR_BEATS - 1]!,
      moving,
      frozen2,
      c3Gap,
      shapeGap: shape.gap,
      bUnitary,
      fastGap,
      contactOff,
      chargeBranchOff,
      dockChargeOff,
      dockOccupationOff,
      signOff,
      kActs,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `X1 ${X1} (X1a ${X1a}: rule matrix vs float ${matrixGap.toExponential(2)}, w^11 off ${w11Off}, box one hole ${holeRun.branches.join('/')} branches ${holeRun.off} off; ${sizes}, partner ${partnerSize}, m ${levelA.m.toFixed(6)}, R ${RA.map(x => x.toFixed(6)).join(' ')}, c_eff ${(Math.sqrt((kinA[0] as { c2: number }).c2) / C).toFixed(6)} c, read gap ${readGap.toExponential(2)}, third band ${third.toExponential(2)}, top ${(top / C).toFixed(6)} c; X1b ${X1b}: exact reach ${reach.join(' ')} (straight path ${straight.toFixed(5)} a beat), W(4, 8, 16) ${w4.toExponential(2)} ${w8.toExponential(2)} ${w16.toExponential(2)}, 1e-3 fronts ${fronts.map(f => `${f.t}: ${f.worst.toFixed(4)}`).join(', ')} c); X2 ${X2} (${seas.map(r => `side ${r.side} (${r.cells} docks) exact ${r.exact}, collision permutes ${r.permutes}`).join('; ')}); X3 ${X3} (X3a ${X3a}: top retained-peak speed ${topPeakSpeed.toExponential(2)} c over ${allSpeeds.length} matched peaks; X3b ${X3b}: lone fear charge reach ${fear.reach.join(' ')} roots (front weight ${fear.fearFront.map(x => x.toFixed(4)).join(' ')}), hole and fear ${holeFear.reach.join(' ')}; X3c ${X3c}: stored pair ${storeOff} off); X4 ${X4} (classes holding more than free: ${held.length}${x4Notes.length ? `; ${x4Notes.join('; ')}` : ''}); X5 ${X5} (X5a ${X5a}: hole vs empty-mesh love ${signSlots.join('/')} slots, ${signOff} off; X5b ${X5b}: charge register ${chargeBranchOff} branches off, ${dockChargeOff} of ${met} met docks' outcomes off (occupation ${dockOccupationOff}); X5c ${X5c}: slide at c/2 ${slides.map(s => `mu ${s.mu} pair ${s.pair} tied ${s.tied} face ${s.faceTied}`).join(', ')}); controls C1 ${C1} (${oldCoinGap.toFixed(3)}), C2 ${C2} (K acts on ${kActs} pairs), C3 ${C3} (${c3Gap.toExponential(2)}), C4 ${C4} (free kept vs (1 - ${moving.toFixed(4)})^2 = ${frozen2.toFixed(4)}), C5 ${C5}`,
      metrics,
      control: {
        C1: flag(C1),
        C2: flag(C2),
        C3: flag(C3),
        C4: flag(C4),
        C5: flag(C5),
        instrument: flag(instrument),
      },
      notes: `L1/L2. Pair classes (ball ${PAIR_RADIUS}, ${PAIR_BEATS} beats, Hann over the last ${PAIR_WINDOW}, peak floor ${PEAK_FLOOR}, delta ${DELTA}): ${classLine}. Frozen phases arg(c^2) ${frozenPhase.toFixed(5)} and minus pi. Fronts per direction (${NINE.map(n => n.name).join(', ')}): ${fronts.map(f => `t ${f.t}: ${f.per.map(x => x.toFixed(3)).join(' ')}`).join('; ')}. Box starts one beat: ${oneBeat.map(r => `${r.name} ${r.branches.join('/')} branches ${r.off} off`).join('; ')}; lone fear 2 beats ${fearBox.branches.join('/')} branches ${fearBox.off} off; contact pairs ${contactChecked} one-beat checks ${contactOff} off; tables ${tablesDiff} off; reverse ${reverseOk}. A = c X (I + beta z z^T): c ${shape.c.map(x => x.toFixed(9)).join(',')}, beta ${shape.beta.map(x => x.toFixed(9)).join(',')}, shape gap ${shape.gap.toExponential(2)}; B unitary ${bUnitary.toExponential(2)}; fast pair beat ${fastGap.toExponential(2)}; velocity ${velGap.toExponential(2)}. Slide control (tie at 1): ${slideControl.map(s => s.tied).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
