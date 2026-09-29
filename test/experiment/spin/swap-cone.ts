// ONE LIMITING SPEED FOR EVERY EXCITATION OF THE DOCK MIXER? (E-SPN-0143). E-SPN-0142 (singlet-relativity) found the
// dock mixer's isolated singlet relativistic at small K with a massless speed c0 = c / 2 exactly (the rms of u . r over
// a 4d 2-design; c = sqrt 2, one root a beat, the stream's speed), but with three things that break one c: the massless
// pair is E = +-c0 K + gamma K^2, gamma = cot(phi / 2) / 8; the heavy bands reach 0.564 c; and a lineon along its line
// moves at cos(phi / 2) c. The question: is there a coin zeta = e^(i phi) and a mixer angle theta, in Z[w][1/6] or a stated
// minimal extension, where EVERY excitation shares one limiting speed c*, none exceeds it at any momentum, the massless
// mode has no gamma, and a light massive singlet still exists? And where does a light mass come from if the swap coin pins
// theta near pi?
//
// DERIVED BEFORE THE RUNS (E = -phase; K in D4 coordinates; the machinery is code/measure/dock-mixer, code/measure/
// singlet-kinematics and code/measure/swap-cone).
// 1. THE MAXIMUM SPEED IS A CONVEX BOUND. By Hellmann-Feynman every band's velocity is sum_q |psi_q|^2 r_q, a point of the
//    24-cell, so |v| <= c, with equality only for an eigenvector on one slot: P e_d proportional to e_d, which needs the
//    coin to keep (zeta = 1) and the mixer to be the identity (theta = 0). So today NOTHING under the mixer reaches c: the
//    stream's one root a beat is reached only by the bare stream (zeta = 1, theta = 0) and, at any theta, by the exact
//    walk's support front (the straight path P_dd != 0), which carries weight |P_dd|^(2t). A SUM RULE: over the 24
//    bands, sum_b (u . v_b)^2 <= tr (u . V)^2 = sum_d (u . r_d)^2 = 12, so the band rms of u . v is at most c / 2 = c0 in
//    every direction. c0 is the most the bands can share; a band above it must be paid for by a band below.
// 2. EVERY COIN BUT THE SWAP FAILS. (a) The lineon: per line U0 = S C is a 1d Dirac walk, cos W = cos(phi / 2) cos k, top
//    speed cos(phi / 2) c at k = pi / 2, above c0 for phi < 2 pi / 3. (b) The massless pair: E_+ = c0 K + gamma K^2 has
//    speed c0 + 2 gamma K > c0 for gamma > 0 (phi < pi), and E_- the same for phi > pi. So at every phi != pi the massless
//    point theta = phi breaks U1, and a massive point's top speed tends to the massless one as m -> 0: no c* holds for the
//    whole family. gamma = 0 needs cot(phi / 2) = 0: phi = pi, zeta = -1, C = the line swap X (integer entries).
// 3. THE SWAP COIN IS EXACTLY SOLVABLE (code/measure/swap-cone). Per line S X = [[0, e^(-ik)], [e^(ik), 0]] has
//    eigenvalues +1 and -1 at EVERY K, and the mixer is a rank-one change, so 11 states stay at +1 and 11 at -1 for every
//    K (22 FLAT bands, zero velocity: the lineon bounces in place), and two bands move, on span(P+ z, P- z):
//        sin w = sin(theta / 2) g(K),   g(K) = (1/24) sum_d cos(K . r_d),   the pair w and pi - w.
//    The pair's midpoint is fixed at every K, so gamma = 0 EXACTLY (U2). The love is the mirror (-g), with the same speeds.
// 4. THE THEOREM (U1). v = sin(theta / 2) grad g / cos w, and Cauchy-Schwarz on the 2-design (sum_d (u . r_d)^2 = 12):
//        |grad g|^2 <= (1/48) sum_d sin^2(K . r_d) = (1 - <cos^2>) / 2 <= (1 - g^2) / 2      (Jensen: <cos^2> >= g^2),
//    so |v| <= sin(theta / 2) sqrt(1 - g^2) / (sqrt 2 sqrt(1 - sin^2(theta / 2) g^2)) <= sin(theta / 2) c0 <= c0.
//    Equality needs every cos(K . r_d) equal and sin(K . r_d) proportional to u . r_d, which no unit u allows unless every
//    sin is 0, i.e. K in the dual lattice (g = 1, K = 0 mod the zone). So at the swap coin EVERY band moves strictly slower
//    than c0 = c / 2, approaching it only as K -> 0 at theta = pi; the massive pair's top speed is below cos(m) c0. One
//    limiting speed c* = c0 = c / 2, and the stream's c is a microscopic bound only (point 1).
// 5. THE MASS AT THE SWAP COIN. theta = pi + 2 m (m the rest energy): sin(theta / 2) = cos m, cos(w - pi/2) = cos m g, and
//    g = 1 - K^2 / 4 + K^4 / 48 = cos(c0 K) + K^4 / 96, so the singlet's inertia is 2 tan m and
//        R = inertia c0^2 / m = tan(m) / m   (EXACT at the swap coin: there is no A' path, cot(phi / 2) = 0),
//        c_eff = c0 sqrt(m cot m),   eta = d m^2 / c^4 = -m^2 / 12 (from the K^4 / 96, isotropic: g is W(F4) invariant).
//    R within 1 percent needs m <= 0.172.
// 6. THE RING PINS THETA. The mixer's hop (e^(i theta) - 1) / 24 is in a ring only if e^(i theta) is. The norm-one
//    elements of Q(w) are x / conj(x) (Hilbert 90); in Z[w][1/6] x can hold only 2 (inert) and 1 - w (ramified, and
//    (1 - w) / (1 - w^2) is a unit), so e^(i theta) is a sixth root of unity: theta in (pi/3) Z, m in {pi/6, pi/3, pi/2}
//    at the swap coin, and the lightest in-ring singlet has R = tan(pi/6) / (pi/6) = 1.102658. FAIL of U3 in the ring.
// 7. A SCHEDULE CANNOT MAKE THE KICK LIGHT (U4a). At K = 0 the stream is the identity and the coin and mixer share the
//    eigenvector z, so any in-ring schedule's rest phase per cycle is a sum of in-ring angles, in (pi/3) Z. For theta1 = pi,
//    theta2 = pi + 2 mu alternating, the swap coin gives exactly (U0^2 = I, two rank-one gates on psi and U0 psi)
//        cos W = cos((theta1 + theta2) / 2) + 2 sin(theta1/2) sin(theta2/2) (1 - g^2),
//    and with W = pi - W': cos W' = cos mu (2 g^2 - 1), 2 g^2 - 1 = cos(2 c0 K) + O(K^4): the one-beat walk with rest
//    phase mu PER CYCLE and the momentum doubled. Its per-beat mass
//    is mu / 2 (pi / 12 at theta2 = 4 pi / 3), but R = tan(mu) / mu = 1.102658, not the naive tan(pi/12)/(pi/12) = 1.0236:
//    the dispersion is self-similar, so the Lorentz defect is set by the angle of the kick, not by how often it comes.
//    Speeds stay below c0 (|v| <= |grad g| / sqrt(1 - g^2)) and the pair's midpoint is fixed. So U4a keeps U1 and U2 and
//    fails U3. A staggered sea (a two-sublattice mass) is not tested: the D4 root graph has triangles (r1 + r2 = r3), so
//    it is not bipartite and no staggering keeps W(F4).
// 8. THE MINIMAL EXTENSION (U4b). Any norm-one element outside the units needs a split prime inverted; the least is 7 =
//    N(3 + w). u = (3 + w)^2 / 7 = (8 + 5 w) / 7 has angle alpha = arccos(11 / 14) = 0.666946, not a rational multiple of
//    pi (u is not an algebraic integer, so not a root of unity), so the angles k alpha + j pi / 3 are dense: every mass is
//    reachable in Z[w][1/42], with 7^k in the denominator. k = 3: e^(i theta*) = -(360 + 37 w) / 343, theta* = pi +
//    0.093556, m* = 0.046778, R* = 1.000730. k = 2: m = 0.143348, R = 1.006906. The coin (X) and the mixer's 1/24 are in the
//    ring already. (The cyclotomic route Z[zeta_24] gives m = pi / 24 but only multiples of pi / 12, and a degree-4
//    extension of the field.)
//
// PREDICTED (the chosen point: zeta = -1 (n = 2/3), e^(i theta*) = -(360 + 37 w) / 343):
//   U1 hole and love under c0 on every sampled K (the Weyl sample's top 0.488 c, the derived ceiling cos(m*) c0 = 0.49945 c),
//      the massless theta = pi under c0, approaching it as K -> 0 (1 - K^2 / 16 at leading order);
//   U2 gamma = 0 (float noise), the pair's midpoint fixed; U3 12 + 11 + 1, R = 1.000730, c_eff = 0.499818 c,
//      eta = -1.8e-4; U4a R = 1.102658 (FAIL), top speed under c0; U4b exact norms 7^(2k), 24 distinct angles, the k = 2
//      point holds U1 to U3 (R 1.006906).
// PREDICTED VERDICT: fail, on U4a only: inside Z[w][1/6] no in-ring angle or one-kick schedule gives a light relativistic
//   singlet; with 1/7 inverted every gate holds.
//
// GATES, fixed before the gate run.
//  U1 at the chosen point and at the massless swap point (theta = pi): the top group speed over every band of the hole AND
//     the love, over 4,096 Weyl momenta plus 20 radial ones (|K| 1e-3 to 1 on the axis, face, body and generic
//     directions), is at most c0 (1 + 1e-6), c0 the measured speed of the massless swap pair.
//  U2 the massless swap pair's gamma (kappa 0.01, Richardson, four directions): |gamma| / c0 <= 1e-9; and at the chosen
//     point, over the U1 momenta, 22 phases sit on the K = 0 flat levels (to 1e-9) and the moving pair's midpoint stays at
//     its K = 0 value to 1e-9.
//  U3 at the chosen point the hole's K = 0 multiplets are 12 + 11 + 1, the singlet's partner is the 12, and
//     |R - 1| <= 0.01 along all four directions (R = c0^2 / c^2 from the node fit, scales 0.1 .. 0.5 m).
//  U4a the in-ring schedule theta1 = pi, theta2 = 4 pi / 3 (swap coin) keeps U1 (1,024 Weyl + 20 radial, per beat), the
//     midpoint of U2, and U3 (1 + 23 at K = 0, |R - 1| <= 0.01, the cycle's per-beat fit).
//  U4b the extension is exact and tunable, and keeps U1 to U3: the numerator of (3 + w)^(2k) times each unit has norm
//     7^(2k) exactly for k = 1 .. 24, the 24 least angles are distinct (to 1e-9) and the least m among them is at most
//     pi / 96; and at the k = 2 point U1 (hole and love, 1,024 Weyl + 20 radial), U2's midpoint and U3 hold.
// INSTRUMENT (a failure makes the verdict partial): the Hellmann-Feynman top speed at the chosen point equals the closed
//  form (swapPairSpeed) at every U1 momentum to 1e-9, hole and love; the third fastest band is below 1e-9 (the 22 flat);
//  Hellmann-Feynman against a central difference to 1e-6 at two K; the cycle fit (N = 1) equals singletKinematics' c^2 to
//  1e-12 relative; the schedule's top speed equals swapScheduleSpeed to 1e-9; the ring angle at theta* reads the float
//  angle it names (cos, sin) to 1e-15.
// CONTROLS (a failure makes the verdict partial):
//  C1 U1 can fail: E-SPN-0142's point (n = 1, theta = 2 pi / 3 + pi / 24) tops c0 (1 + 1e-6) (derived: yes; 0.564 c).
//  C2 U2 can fail: at n = 1 the massless gamma equals cot(pi / 3) / 8 to 1e-6 relative.
//  C3 U3 can fail: at the in-ring theta = 4 pi / 3 (swap coin) |R - 1| > 0.01 (derived 0.102658).
//  C4 the flat reading can fail: at phi = 11 pi / 12 (n = 8 / 11, theta = phi + pi / 24) the third fastest band tops 1e-3.
// REPORTED, gating nothing: the (phi, m) plane (phi pi/6, pi/3, 2pi/3, 5pi/6, 11pi/12, pi; m 0, pi/192, pi/48, pi/12):
//  the top speed over 1,024 Weyl momenta, the lineon's cos(phi / 2), gamma / c0, R; the bare stream (n = 4096, theta 0);
//  the straight-path amplitude |P_BB| at theta* (the front at c); the lemma's two ratios over the U1 momenta; the
//  massless swap speed on the radial set; the ring table to k = 24; a period-3 schedule (pi, pi, 4 pi / 3).
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/univ-probe1.log: the ring table to k = 8 (k 3: 360 + 37 w over 343, m
//  0.046778, R 1.000730; k 2: m 0.143348); at theta* the HF top speed 0.488178 c equal to the closed form to 1e-15, hole
//  and love, the third band 6e-16; the fit R 1.000730, eta -1.83e-4, the cycle fit equal to singletKinematics; massless
//  swap c0 = 0.5 c, gamma -4e-12; the schedule 1 + 23, per-beat m 0.261799 = pi/12, R 1.102658, top 0.3973 c (closed
//  form equal); in-ring 4 pi / 3 R 1.102658; the plane: top speed 0.964, 0.862, 0.571, 0.517, 0.504, 0.495 c at m = 0
//  for phi pi/6 .. pi, and BELOW c0 at 5 pi/6 m pi/12 (0.473) and 11 pi/12 m pi/48 (0.495): massive points near the swap
//  can sit under c0 on the sample, but their massless limit does not (point 2). tmp/univ-probe2.log: the ring table to
//  k = 24 (least m 0.003013 at k 11, then 0.006027 at k 22), which set the tunability ceiling pi / 96 = 0.0327 with room;
//  the massless swap speed on the radial set 0.49999997 c at 1e-3 down to 0.466 c at 1; 22 flat phases and a fixed
//  midpoint at three K. No other threshold was set or moved after a probe.
//
// FIRST RUN (tmp/univ-exp-run1.log, 148 s): FAIL on U2, U4a and U4b. U4a failed as derived. U2 and U4b failed on a
//  READING DEFECT: the midpoint drift read exactly pi (3.141592653589793) at the chosen point, the schedule and the k = 2
//  point. Two phases on a circle have two midpoints pi apart, and the vector-sum midpoint jumps to the other one once the
//  pair spreads past pi (w and pi - w at large K). The fix reads the midpoint modulo pi (pairDrift), which still sees any
//  real drift below pi / 2. The tolerance (1e-9) and every other gate are unchanged. Every other number in run 1 equals
//  run 2.
// SECOND RUN (tmp/univ-exp-run2.log, 161 s): FAIL on U4a only, as derived. U1, U2, U3, U4b, the instrument and every
//  control hold. No threshold moved.
//  - U1: at theta* = pi + 0.093556 the top speed over 4,116 momenta, hole and love, is 0.488178 c. At theta = pi it is
//    0.49999997 c, reached at |K| = 1e-3, and c0 = 0.5000000000 c. The radial set reads 0.49999997, 0.4999969, 0.49969,
//    0.4972 and 0.466 c at |K| 1e-3 to 1, the derived 1 - K^2/16 approach from below. The lemma's two ratios top out at
//    1.0000000005 (float cancellation at |K| 1e-3) and 0.99999988.
//  - U2: gamma / c0 7.6e-12. At the chosen point 22 phases sit on the flat levels at every momentum (0 misses) and the
//    pair's midpoint drift is 4.3e-13.
//  - U3: 12 + 11 + 1 with the partner the 12. m 0.046778, R 1.000730 along all four directions (derived tan m / m
//    1.000730), c_eff 0.499818 c, eta -1.826e-4 (derived -m^2/12 = -1.82e-4), isotropic to every printed digit.
//  - U4a: the schedule's K = 0 levels are 1 + 23 with per-beat m 0.261799 = pi/12. R reads 1.102658 in every direction,
//    which is tan(pi/6)/(pi/6), not the naive 1.0236. Its top speed is 0.4037 c and its midpoint drift 2.4e-15. FAIL.
//    The period-3 schedule (pi, pi, 4pi/3) has per-beat m pi/18 and the same R 1.102658: the self-similarity again.
//  - U4b: the norms are exactly 7^(2k) for k 1 to 24 and the 24 angles are distinct. The least m is 0.003013 at k 11
//    (then 0.006027 at k 22). At k = 2: m 0.143348, R 1.006906, top 0.4630 c, midpoint fixed.
//  - Controls: n = 1 tops at 0.5638 c; gamma at n = 1 is 0.0721688 = cot(pi/3)/8; the in-ring R at 4pi/3 is 1.102658; at
//    phi = 11pi/12 the third band moves at 0.1293 c.
//  - Reported: the plane. Every phi < pi row's massless point is OVER c0 (0.964, 0.862, 0.571, 0.517, 0.504 c), and so is
//    every massive row at m <= pi/192 (and pi/48 for phi <= 5pi/6). Massive rows near the swap coin fall under c0 on the
//    sample (5pi/6 at m pi/12: 0.473; 11pi/12 at m pi/48: 0.495), but their massless limit does not. At phi = pi every row
//    is under c0. R depends on m alone, tan m / m, at every phi. The bare stream (n 4096, theta 0) moves at 0.99999997 c.
//    At theta* the front at c carries |P_BB| = 0.0832 a beat (weight 6.9e-3).
//
// Depth: L1 (the sum rule, the lemma and the Hilbert 90 ring argument are mathematics) and L2 (the band kinematics of a
// coined quantum walk). The swap coin's float dock matrix is not checked against a rule implementation: the rule's
// coinBranch carries only n = 1 (E-SPN-0140 checked dockMatrix there). DETERMINISM: no random numbers; the momenta are a
// fixed additive recurrence. NOTHING MOVES: the coin and the mixer hand a value to another slot of the same dock; the
// stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootIndex } from '@/code/measure/crossing-lines'
import {
  bandAt,
  dockMatrix,
  DOCK_ROOTS,
  eigenphases,
  velocityGap,
  wrap,
} from '@/code/measure/dock-mixer'
import {
  fastestBand,
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
  eisValue,
  fastestCycleBand,
  ringAngle,
  structureFunction,
  swapPairSpeed,
  swapScheduleSpeed,
  type Eis,
} from '@/code/measure/swap-cone'

const C = Math.SQRT2
const SWAP_N = 2 / 3
const PRIME: Eis = [3n, 1n]
const K_STAR = 3
const K_SECOND = 2
const K_TUNE = 24
const TUNE_CEILING = Math.PI / 96
const MOMENTA = 4096
const SIDE_MOMENTA = 1024
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const SPEED_TOLERANCE = 1e-6
const GAMMA_CEILING = 1e-9
const FLAT_TOLERANCE = 1e-9
const MIDPOINT_TOLERANCE = 1e-9
const R_TOLERANCE = 0.01
const PAIR_KAPPA = 0.01
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const CLOSED_TOLERANCE = 1e-9
const VELOCITY_TOLERANCE = 1e-6
const FIT_TOLERANCE = 1e-12
const ANGLE_TOLERANCE = 1e-15
const DISTINCT_TOLERANCE = 1e-9
const GAMMA_CONTROL_TOLERANCE = 1e-6
const FLAT_CONTROL_FLOOR = 1e-3
const STREAM_N = 4096
const STREAM_MOMENTA = 256
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
const PLANE_PHI: readonly number[] = [
  Math.PI / 6,
  Math.PI / 3,
  (2 * Math.PI) / 3,
  (5 * Math.PI) / 6,
  (11 * Math.PI) / 12,
  Math.PI,
]
const PLANE_M: readonly number[] = [
  0,
  Math.PI / 192,
  Math.PI / 48,
  Math.PI / 12,
]

const coinN = (phi: number): number => (2 * Math.PI) / (3 * phi)
const radial = DIRS.flatMap(u => RADII.map(r => u.map(x => x * r)))

// the pair's circular midpoint drift and the K where the flat count is not 22 (a crossing within the tolerance)
function pairDrift(
  phasesAt: (K: readonly number[]) => number[],
  flat: readonly number[],
  mid0: number,
  momenta: readonly (readonly number[])[],
): { drift: number; miss: number } {
  let drift = 0
  let miss = 0

  for (const K of momenta) {
    const moving = phasesAt(K).filter(p =>
      flat.every(c => Math.abs(wrap(p - c)) > FLAT_TOLERANCE),
    )

    if (moving.length !== 2) {
      miss++
      continue
    }

    const [a, b] = moving as [number, number]
    const mid = Math.atan2(
      Math.sin(a) + Math.sin(b),
      Math.cos(a) + Math.cos(b),
    )

    // two points on a circle have two midpoints, pi apart; the vector sum picks the one on the shorter arc, which
    // switches when the pair spreads past pi, so the midpoint is read modulo pi (a real drift under pi / 2 still shows)
    drift = Math.max(
      drift,
      Math.min(
        Math.abs(wrap(mid - mid0)),
        Math.abs(wrap(mid - mid0 - Math.PI)),
      ),
    )
  }

  return { drift, miss }
}

type OnePoint = {
  top: number
  closedGap: number
  third: number
  drift: number
  miss: number
  sizes: string
  partnerSize: number
  m: number
  R: number[]
  c2: number[]
  eta: number[]
}

// U1, U2's midpoint and U3 for the one-beat swap coin at theta, hole and love; c0 the massless speed
function readPoint(
  theta: number,
  c0: number,
  momenta: readonly (readonly number[])[],
): OnePoint {
  let top = 0
  let closedGap = 0
  let third = 0

  for (const hole of [true, false]) {
    const P = dockMatrix(theta, SWAP_N, hole)

    for (const K of momenta) {
      const s = bandAt(P, DOCK_ROOTS, K)
        .velocity.map(v => Math.hypot(...v))
        .sort((x, y) => y - x)

      top = Math.max(top, s[0]!)
      third = Math.max(third, s[2]!)
      closedGap = Math.max(
        closedGap,
        Math.abs(s[0]! - swapPairSpeed(theta, K)),
      )
    }
  }

  const P = dockMatrix(theta, SWAP_N, true)
  const level = singletLevel(P, DOCK_ROOTS, 12)
  const flat = level.multiplets
    .filter(x => x.size > 1)
    .map(x => x.center)
  const { drift, miss } = pairDrift(
    K => eigenphases(P, DOCK_ROOTS, K),
    flat,
    level.midPhase,
    momenta,
  )
  const sizes = level.multiplets
    .map(x => x.size)
    .sort((a, b) => a - b)
    .join('+')

  if (level.single < 0 || level.partner < 0 || level.m < 1e-9) {
    return {
      top,
      closedGap,
      third,
      drift,
      miss,
      sizes,
      partnerSize: 0,
      m: 0,
      R: [],
      c2: [],
      eta: [],
    }
  }

  const k = DIRS.map(u =>
    singletKinematics(P, DOCK_ROOTS, level, u, SCALES),
  )

  return {
    top,
    closedGap,
    third,
    drift,
    miss,
    sizes,
    partnerSize: level.multiplets[level.partner]!.size,
    m: level.m,
    R: k.map(x => (c0 * c0) / x.c2),
    c2: k.map(x => x.c2),
    eta: k.map(x => x.eta),
  }
}

const rOk = (R: readonly number[]): boolean =>
  R.length === DIRS.length &&
  R.every(x => Math.abs(x - 1) <= R_TOLERANCE)
const worst = (R: readonly number[]): number =>
  R.length ? Math.max(...R.map(x => Math.abs(x - 1))) : NaN

export default experiment({
  id: 'spin/swap-cone',
  code: 'E-SPN-0143',
  title:
    'the swap coin gives the dock mixer one limiting speed c/2 with no gamma, but its light mass needs 1/7, fail (U4a): at zeta = -1 the coin is the line swap, 22 of 24 one-body bands are exactly flat and the moving pair obeys sin w = sin(theta/2) g(K), so gamma = 0 (7.6e-12) and by Cauchy-Schwarz on the 2-design every band moves strictly under c0 = c/2 (top 0.488 c at theta*, 0.49999997 c massless at |K| 1e-3), and every other coin fails (the massless pair tops c0 by 2 gamma K: 0.571 c at n = 1); in Z[w][1/6] e^(i theta) is a sixth root of unity (Hilbert 90), so the lightest singlet has R = tan(pi/6)/(pi/6) = 1.102658, and alternating in-ring angles (pi, 4pi/3) halves the mass per beat but leaves R 1.102658 exactly (the kick sets R, not its rate); inverting 7 = N(3 + w) gives dense angles k arccos(11/14): at e^(i theta*) = -(360 + 37 w)/343 the singlet is 12 + 11 + 1 with m 0.046778 and R 1.000730, eta -1.8e-4, and k = 2 (R 1.006906) and k = 11 (m 0.0030) follow; the stream moves at c only bare (0.99999997 c at n 4096, theta 0)',
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
    const weyl = weylMomenta(MOMENTA)
    const mainMomenta = [...weyl, ...radial]
    const sideMomenta = [...weyl.slice(0, SIDE_MOMENTA), ...radial]

    // ---------------- the ring: exact norms, the chosen angle, tunability ----------------
    const table = Array.from({ length: K_TUNE }, (_, i) =>
      ringAngle(PRIME, i + 1),
    )
    const normsExact = table.every(r => r.normExact)
    const deltas = table.map(r => Math.abs(r.delta))
    const distinct = deltas.every((d, i) =>
      deltas.every(
        (e, j) => i === j || Math.abs(d - e) > DISTINCT_TOLERANCE,
      ),
    )
    const leastM = Math.min(...deltas) / 2
    const leastK = deltas.indexOf(Math.min(...deltas)) + 1
    const star = table[K_STAR - 1]!
    const second = table[K_SECOND - 1]!
    const thetaStar = Math.PI + star.delta
    const thetaSecond = Math.PI + second.delta
    const [cr, ci] = eisValue(star.numerator, star.den)
    const angleGap = Math.max(
      Math.abs(cr - Math.cos(star.delta)),
      Math.abs(ci - Math.sin(star.delta)),
    )

    log('ring')

    // ---------------- c0: the massless swap pair, and U2's gamma ----------------
    const P0 = dockMatrix(Math.PI, SWAP_N, true)
    const pair0 = DIRS.map(u =>
      masslessPair(P0, DOCK_ROOTS, 13, u, PAIR_KAPPA),
    )
    const c0 = (pair0[0] as { c0: number }).c0
    const gammaOverC0 = Math.max(
      ...pair0.map(p => Math.abs(p.gamma) / p.c0),
    )

    log('c0')

    // ---------------- U1, U2, U3 at the chosen point; U1 at the massless point ----------------
    const at = readPoint(thetaStar, c0, mainMomenta)

    log('chosen point')

    let masslessTop = 0

    for (const hole of [true, false]) {
      masslessTop = Math.max(
        masslessTop,
        fastestBand(
          dockMatrix(Math.PI, SWAP_N, hole),
          DOCK_ROOTS,
          mainMomenta,
        ).speed,
      )
    }

    const masslessRadial = radial.map(
      K =>
        Math.max(
          ...bandAt(P0, DOCK_ROOTS, K).velocity.map(v =>
            Math.hypot(...v),
          ),
        ) / C,
    )

    log('massless point')

    const U1 =
      at.top <= c0 * (1 + SPEED_TOLERANCE) &&
      masslessTop <= c0 * (1 + SPEED_TOLERANCE)
    const U2 =
      gammaOverC0 <= GAMMA_CEILING &&
      at.drift <= MIDPOINT_TOLERANCE &&
      at.miss === 0
    const U3 =
      at.sizes === '1+11+12' && at.partnerSize === 12 && rOk(at.R)

    // ---------------- U4a: the in-ring schedule ----------------
    const PA = dockMatrix(Math.PI, SWAP_N, true)
    const PB = dockMatrix((4 * Math.PI) / 3, SWAP_N, true)
    const schedule = [PA, PB]
    const schedTop = fastestCycleBand(
      schedule,
      DOCK_ROOTS,
      sideMomenta,
    ).speed
    const schedClosed = Math.max(
      ...sideMomenta.map(K =>
        Math.abs(
          Math.max(
            ...cycleBand(schedule, DOCK_ROOTS, K).velocity.map(v =>
              Math.hypot(...v),
            ),
          ) - swapScheduleSpeed(Math.PI, (4 * Math.PI) / 3, K),
        ),
      ),
    )
    const schedMs = cycleMultiplets(schedule, DOCK_ROOTS)
    const schedSizes = schedMs
      .map(x => x.size)
      .sort((a, b) => a - b)
      .join('+')
    const schedFlat = schedMs.filter(x => x.size > 1).map(x => x.center)
    const schedSingle = schedMs.find(x => x.size === 1)
    const schedMid0 =
      schedSingle && schedFlat.length === 1
        ? schedFlat[0]! + wrap(schedSingle.center - schedFlat[0]!) / 2
        : NaN
    const schedDrift = pairDrift(
      K => cyclePhases(schedule, DOCK_ROOTS, K),
      schedFlat,
      schedMid0,
      sideMomenta,
    )
    const schedFit = DIRS.map(u =>
      cycleSinglet(schedule, DOCK_ROOTS, u, SCALES),
    )
    const schedR = schedFit.map(x => (c0 * c0) / x.c2)
    const U4a =
      schedTop <= c0 * (1 + SPEED_TOLERANCE) &&
      schedDrift.drift <= MIDPOINT_TOLERANCE &&
      schedDrift.miss === 0 &&
      schedSizes === '1+23' &&
      rOk(schedR)
    const PT = dockMatrix(Math.PI, SWAP_N, true)
    const triple = DIRS.slice(0, 1).map(u =>
      cycleSinglet([PT, PT, PB], DOCK_ROOTS, u, SCALES),
    )[0]!

    log('U4a')

    // ---------------- U4b: the extension ----------------
    const sec = readPoint(thetaSecond, c0, sideMomenta)
    const secU =
      sec.top <= c0 * (1 + SPEED_TOLERANCE) &&
      sec.drift <= MIDPOINT_TOLERANCE &&
      sec.miss === 0 &&
      sec.sizes === '1+11+12' &&
      sec.partnerSize === 12 &&
      rOk(sec.R)
    const U4b = normsExact && distinct && leastM <= TUNE_CEILING && secU

    log('U4b')

    // ---------------- instrument ----------------
    const PS = dockMatrix(thetaStar, SWAP_N, true)
    const velGap = Math.max(
      ...[
        [0.31, -1.07, 0.73, 2.03],
        [0.02, 0.01, -0.03, 0.015],
      ].flatMap(K => DIRS.map(u => velocityGap(PS, DOCK_ROOTS, K, u))),
    )
    const level = singletLevel(PS, DOCK_ROOTS, 12)
    const fitGap = Math.max(
      ...DIRS.map(u =>
        Math.abs(
          cycleSinglet([PS], DOCK_ROOTS, u, SCALES).c2 /
            singletKinematics(PS, DOCK_ROOTS, level, u, SCALES).c2 -
            1,
        ),
      ),
    )
    const instrument =
      at.closedGap <= CLOSED_TOLERANCE &&
      at.third <= CLOSED_TOLERANCE &&
      velGap <= VELOCITY_TOLERANCE &&
      fitGap <= FIT_TOLERANCE &&
      schedClosed <= CLOSED_TOLERANCE &&
      angleGap <= ANGLE_TOLERANCE

    log('instrument')

    // ---------------- controls ----------------
    const phi1 = (2 * Math.PI) / 3
    const c1Top = fastestBand(
      dockMatrix(phi1 + Math.PI / 24, 1, true),
      DOCK_ROOTS,
      weyl.slice(0, SIDE_MOMENTA),
    ).speed
    const C1 = c1Top > c0 * (1 + SPEED_TOLERANCE)
    const g1 = masslessPair(
      dockMatrix(phi1, 1, true),
      DOCK_ROOTS,
      13,
      DIRS[0]!,
      PAIR_KAPPA,
    ).gamma
    const g1Derived = 1 / Math.tan(phi1 / 2) / 8
    const C2 = Math.abs(g1 / g1Derived - 1) <= GAMMA_CONTROL_TOLERANCE
    const PR = dockMatrix((4 * Math.PI) / 3, SWAP_N, true)
    const lr = singletLevel(PR, DOCK_ROOTS, 12)
    const ringR = DIRS.map(
      u =>
        (c0 * c0) / singletKinematics(PR, DOCK_ROOTS, lr, u, SCALES).c2,
    )
    const C3 = lr.single >= 0 && Math.abs(ringR[0]! - 1) > R_TOLERANCE
    const phi4 = (11 * Math.PI) / 12
    const P4 = dockMatrix(phi4 + Math.PI / 24, coinN(phi4), true)

    let third4 = 0

    for (const K of weyl.slice(0, SIDE_MOMENTA)) {
      third4 = Math.max(
        third4,
        bandAt(P4, DOCK_ROOTS, K)
          .velocity.map(v => Math.hypot(...v))
          .sort((x, y) => y - x)[2]!,
      )
    }

    const C4 = third4 > FLAT_CONTROL_FLOOR

    log('controls')

    // ---------------- reported: the plane, the stream, the front, the lemma ----------------
    const plane = PLANE_PHI.map(phi => {
      const n = coinN(phi)
      const g = masslessPair(
        dockMatrix(phi, n, true),
        DOCK_ROOTS,
        13,
        DIRS[0]!,
        PAIR_KAPPA,
      )
      const cells = PLANE_M.map(m => {
        const P = dockMatrix(phi + 2 * m, n, true)
        const top = fastestBand(
          P,
          DOCK_ROOTS,
          weyl.slice(0, SIDE_MOMENTA),
        ).speed

        let R = NaN

        if (m > 0) {
          const l = singletLevel(P, DOCK_ROOTS, 12)

          if (l.single >= 0 && l.partner >= 0) {
            R =
              (c0 * c0) /
              singletKinematics(P, DOCK_ROOTS, l, DIRS[0]!, SCALES).c2
          }
        }

        return `m ${m.toFixed(4)}: top ${(top / C).toFixed(4)} c ${top <= c0 * (1 + SPEED_TOLERANCE) ? 'under' : 'OVER'} c0${m > 0 ? `, R ${R.toFixed(5)}` : ''}`
      })

      return `phi ${(phi / Math.PI).toFixed(4)} pi (n ${n.toFixed(4)}): lineon ${Math.cos(phi / 2).toFixed(4)} c, gamma/c0 ${(g.gamma / g.c0).toExponential(3)}; ${cells.join('; ')}`
    })

    log('plane')

    const stream =
      fastestBand(
        dockMatrix(0, STREAM_N, true),
        DOCK_ROOTS,
        weyl.slice(0, STREAM_MOMENTA),
      ).speed / C
    const B = rootIndex([1, 1, 0, 0])
    const front = Math.hypot(PS.re[B * 24 + B]!, PS.im[B * 24 + B]!)

    let lemmaA = 0
    let lemmaB = 0

    for (const K of mainMomenta) {
      const f = structureFunction(K)
      const grad2 = f.grad.reduce((s, x) => s + x * x, 0)
      const mid = (1 - f.meanCos2) / 2

      lemmaA = Math.max(lemmaA, grad2 / mid)
      lemmaB = Math.max(lemmaB, mid / ((1 - f.g * f.g) / 2))
    }

    // ---------------- verdict ----------------
    const controls = C1 && C2 && C3 && C4
    const status =
      !instrument || !controls
        ? 'partial'
        : U1 && U2 && U3 && U4a && U4b
          ? 'pass'
          : 'fail'
    const cEff = Math.sqrt(at.c2[0]!) / C
    const flag = (b: boolean): number => (b ? 1 : 0)
    const metrics: Record<string, number> = {
      U1: flag(U1),
      U2: flag(U2),
      U3: flag(U3),
      U4a: flag(U4a),
      U4b: flag(U4b),
      instrument: flag(instrument),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      thetaStar,
      mStar: at.m,
      c0OverC: c0 / C,
      topOverC: at.top / C,
      masslessTopOverC: masslessTop / C,
      gammaOverC0,
      midpointDrift: at.drift,
      flatMiss: at.miss,
      RStar: at.R[0]!,
      RWorst: worst(at.R),
      cEffOverC: cEff,
      etaStar: at.eta[0]!,
      schedTopOverC: schedTop / C,
      schedM: (schedFit[0] as { m: number }).m,
      schedR: schedR[0]!,
      schedDrift: schedDrift.drift,
      tripleR: (c0 * c0) / triple.c2,
      tripleM: triple.m,
      secondM: sec.m,
      secondR: sec.R[0]!,
      secondTopOverC: sec.top / C,
      leastM,
      leastK,
      ringR: ringR[0]!,
      c1TopOverC: c1Top / C,
      gammaN1: g1,
      thirdN811: third4 / C,
      streamOverC: stream,
      frontAmplitude: front,
      lemmaA,
      lemmaB,
      closedGap: at.closedGap,
      thirdBand: at.third,
      velocityGap: velGap,
      fitGap,
      schedClosed,
      angleGap,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `U1 ${U1} (theta* ${thetaStar.toFixed(6)}: top ${(at.top / C).toFixed(6)} c, massless ${(masslessTop / C).toFixed(8)} c, against c0 ${(c0 / C).toFixed(10)} c); U2 ${U2} (gamma/c0 ${gammaOverC0.toExponential(2)}, midpoint drift ${at.drift.toExponential(2)}, ${at.miss} misses); U3 ${U3} (multiplets ${at.sizes}, partner ${at.partnerSize}, m ${at.m.toFixed(6)}, R ${at.R.map(x => x.toFixed(6)).join(' ')}, c_eff ${cEff.toFixed(6)} c, eta ${at.eta[0]!.toExponential(3)}); U4a ${U4a} (schedule pi, 4pi/3: ${schedSizes}, per-beat m ${(schedFit[0] as { m: number }).m.toFixed(6)}, R ${schedR.map(x => x.toFixed(6)).join(' ')}, top ${(schedTop / C).toFixed(6)} c, drift ${schedDrift.drift.toExponential(2)}); U4b ${U4b} (norms exact ${normsExact}, distinct ${distinct}, least m ${leastM.toFixed(6)} at k ${leastK}; k 2: m ${sec.m.toFixed(6)}, R ${sec.R.map(x => x.toFixed(6)).join(' ')}, top ${(sec.top / C).toFixed(6)} c); controls C1 ${C1} (n 1 top ${(c1Top / C).toFixed(4)} c), C2 ${C2} (gamma ${g1.toFixed(7)} against ${g1Derived.toFixed(7)}), C3 ${C3} (in-ring R ${ringR[0]!.toFixed(6)}), C4 ${C4} (phi 11pi/12 third band ${(third4 / C).toFixed(4)} c)`,
      metrics,
      control: {
        C1: flag(C1),
        C2: flag(C2),
        C3: flag(C3),
        C4: flag(C4),
        instrument: flag(instrument),
      },
      notes: `L1/L2. Plane (top over ${SIDE_MOMENTA} Weyl momenta, hole): ${plane.join(' | ')}. Chosen point e^(i theta*) = -(${star.numerator.join(' + ')} w) / ${star.den}; ring table (k: m): ${table.map(r => `${r.k}: ${(Math.abs(r.delta) / 2).toFixed(6)}`).join(', ')}. Massless swap speed on the radial set (axis, face, body, generic at |K| ${RADII.join(', ')}): ${masslessRadial.map(x => x.toFixed(9)).join(' ')} c. Period-3 schedule (pi, pi, 4pi/3): ${triple.sizes.join('+')}, per-beat m ${triple.m.toFixed(6)}, R ${((c0 * c0) / triple.c2).toFixed(6)}. Chosen point along axis/face/body/generic: c^2 ${at.c2.map(x => x.toFixed(10)).join(' ')}, eta ${at.eta.map(x => x.toExponential(3)).join(' ')}. Bare stream (n ${STREAM_N}, theta 0): top ${stream.toFixed(8)} c. Front: |P_BB| at theta* ${front.toFixed(6)} (weight ${(front * front).toExponential(3)} a beat at c). Lemma over the U1 momenta: max |grad g|^2 / ((1 - <cos^2>)/2) ${lemmaA.toFixed(9)}, max ((1 - <cos^2>)/2) / ((1 - g^2)/2) ${lemmaB.toFixed(9)}. In-ring 4pi/3 R ${ringR.map(x => x.toFixed(6)).join(' ')}. Instrument: closed form ${at.closedGap.toExponential(2)}, third band ${at.third.toExponential(2)}, velocity ${velGap.toExponential(2)}, fit ${fitGap.toExponential(2)}, schedule closed form ${schedClosed.toExponential(2)}, angle ${angleGap.toExponential(2)}. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
