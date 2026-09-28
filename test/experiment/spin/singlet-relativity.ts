// DOES THE DOCK MIXER'S SINGLET OBEY SPECIAL RELATIVITY, AND AT WHICH c? (E-SPN-0142). E-SPN-0140 (dock-mixer) mixed
// all 24 slots of a dock with M = exp(i theta N_U) on the love sea: the sea is inert, a hole stays one hole, and the
// MEAN band of each K = 0 multiplet is isotropic through K^4, but each branch of a multiplet is warped at K^2. The
// argument tested here: a NONDEGENERATE branch has no direction-dependent term below K^6, because W(F4) maps the Bloch
// matrix to a conjugate and a W(F4)-invariant function of K has only the degrees 2, 6, 8, 12 (the roots are a spherical
// 5-design). So at an angle where the mixer's own mode (the staggered z for a hole, the uniform u for a love) is an
// isolated level, that branch is a candidate particle. Is its kinematics relativistic, E^2 = m^2 + c^2 K^2, and is its
// c the c of everything else that moves in 3d under the rule (a love under the same mixer, a meson, the spin-2 field of
// E-GRV-0141)?
//
// DERIVED BEFORE THE RUNS (E = -phase, K in the D4 coordinates, a root has length sqrt 2 and c = sqrt 2 per beat is the
// stream's one root a beat; the machinery is code/measure/dock-mixer and code/measure/singlet-kinematics).
// 1. THE LEVELS. The hole's dock matrix is P = zeta^11 C_n e^(i theta) (I + (e^(-i theta) - 1) z z^T / 24), zeta =
//    e^(i phi), phi = 2 pi / (3 n) the coin angle. Up to the global phase zeta^11 e^(i theta): the 12 line-symmetric states
//    S at phase 0, the 11 antisymmetric states orthogonal to z (A') at phi, z alone at phi - theta. The love's (C_n m):
//    11 symmetric states orthogonal to u at 0, the 12 antisymmetric at phi, u at theta.
// 2. THE WINDOW. z is a singlet for every theta off 0 and phi (mod 2 pi). It lies OUTSIDE the arc between S and A', so it
//    borders the widest gap of the K = 0 spectrum (a band edge), exactly for theta in (phi, 2 pi): at n = 1, theta in
//    (2 pi / 3, 2 pi). For theta in (0, phi) it sits between S and A' (an interior level). Writing theta = phi + 2 m, the
//    singlet's partner is S (below: X z is line-symmetric, since z is antisymmetric on every line and r_b = -r_a), its
//    gap 2 m, and its rest energy m = |wrap(theta - phi)| / 2 measured from the midpoint. The love is the mirror:
//    U_love(K) = conj(Z U_hole(-K) Z) up to a phase (Z maps S <-> the love's antisymmetric 12 and z <-> u, and Z X Z = X),
//    so its branch is the hole's reflected in energy, with the same m and the same c. That is L1.
// 3. THE CURVATURE (second order, exact). For U = e^(-i X) P and a nondegenerate eigenvector v, the unitary perturbation
//    series gives E(K) - E(0) = (1/2) sum_(w != v) |<w| X |v>|^2 cot(alpha_w / 2), alpha_w = phase(w) - phase(v),
//    X = diag(K . r_d). X z lies wholly in S with |X z^|^2 = sum_d (K . r_d)^2 / 24 = K^2 / 2 (a 2-design), so
//        eps(K) = m + (1/4) cot(m) K^2 + O(K^4),   m(theta) = |wrap(theta - phi)| / 2,
//    and with eps^2 = m^2 + c^2 K^2 + d K^4: c^2 = 2 m a = m cot(m) / 2. The massless pair (theta = phi) moves at
//    c0 = |X z^| / K = 1/sqrt 2 coordinate units a beat, EXACTLY c / 2, independent of theta and n: the singlet is spread
//    over the 24 roots, and its speed is the root mean square of u . r over a 4d 2-design, |r| / sqrt 4. So
//        c_eff(theta) / c = sqrt(m cot m) / 2 -> 1/2,   R := (inertia) (c0^2) / (rest energy) = c0^2 / c^2 = tan(m) / m.
//    Relativity (R = 1) holds to m^2 / 3: the particle must be light against the beat.
// 4. THE K^4 TERM. A two-level Floquet walk cos E = cos m cos(c0 K) is Lorentz to eta = d m^2 / c^4 = -m^4 / 45 (series,
//    by hand). The one path the two-level walk misses is z -> S -> A' -> S -> z: the partner s1 = X z / |X z| is pushed
//    by A' by beta K^2, beta = (1/2) |P_A' X s1^|^2 / K^2 cot(phi / 2) = (1/4) cot(phi / 2) (|X s1^|^2 = K^2 by the
//    4-design sum (K . r)^4 = 12 K^4, half of it back on z), which moves the pair's midpoint and gives
//        d = beta c0^2 / (2 m),   eta = beta m (1 + O(m)),   beta = 1 / (4 sqrt 3) = 0.1443 at n = 1.
//    So E^2 is Lorentz at K ~ m only to O(m), and at K >> m (the ultra-relativistic regime, still K << 1) the same path
//    leaves eps = c0 K + (beta / 2) K^2: a speed shift LINEAR in K. At the massless point the pair is
//        E_+- = +-c0 K + gamma K^2,   gamma = beta / 2 = cot(phi / 2) / 8 = 0.07217 (n = 1), gamma / c0 = 0.1021,
//    a first-order (Planck-suppressed only once) violation of E = c K. It vanishes only when cot(phi / 2) = 0: a coin with
//    zeta = -1 (n = 2/3, the pure swap), where the K = 0 spectrum (0, pi, and z) is symmetric under E -> -E.
// 5. UNIVERSALITY. The love under the same mixer has c_eff = c / 2 exactly as the hole (item 2). A meson cannot form: on
//    a one-content sea the piece (M = Gamma(m), the second-quantized one-body mixer), the coin (Gamma(C) on each line) and
//    the stream (a slot permutation) are all quasi-free, and the meeting, the pair move and K need two contents or a
//    store (E-SPN-0140 derivation 3), so excitations do not interact and no bound state exists. E-GRV-0141 derived the
//    spin-2 field's TT speed equal to the c of the spacetime slide x^0 = c t, the light's c, and the rule's only light
//    cone is the stream's: one root a beat (E-SPN-0140 D5 read it exactly). So matter's c_eff = c / 2 is HALF the c
//    gravity was built with: a physical contradiction as the rule stands.
//
// PREDICTED (n = 1; the chosen point theta* = 2 pi / 3 + pi / 24, m* = pi / 48 = 0.06545, edge, gap pi / 24 = 0.1309):
//   c_eff* / c = 0.499643, R* = 1.001430, eta* = beta m* (1 + O(m)) ~ 0.0094, gamma / c0 = 0.1021, love = hole,
//   c0 / c = 0.5. Scan (m, c_eff / c, R): pi/96 0.49991 1.00036; pi/24 0.49857 1.00575; pi/12 0.49423 1.02349; theta pi
//   (m pi/6) 0.47616 1.10266; 4 pi/3 (pi/3) 0.38878 1.65399; 5 pi/3 (pi/2) c_eff 0, R infinite (cot m = 0: no K^2 term);
//   theta pi/3 an interior singlet (m pi/6, not an edge); theta = phi no singlet (13 + 11). At n = 4 the same m and
//   c_eff with beta = cot(pi/12)/4 = 0.933 (eta ~ 0.061, gamma 0.4665); at n = 2/3 beta = 0 (eta ~ -m^4/45, gamma 0).
//
// GATES, fixed before the gate run (the chosen point theta*, n = 1).
//  S1 the hole's multiplets at K = 0 are exactly 12 + 11 + 1; the singlet's gap to its nearest level is at least
//     2 m* (1 - 1e-9) (stated: pi / 24 = 0.1309) and it borders the widest gap of the K = 0 spectrum (a band edge).
//  S2 its inverse mass tensor (4 x 4, Richardson, kappa = m* / 32) is isotropic to 1e-6 relative; its energy along face,
//     body and a generic husk direction minus along the axis grows as K^6 (log2 of the ratio between 0.2 m* and 0.1 m* in
//     [5.8, 6.2] for all three), and face/body is the degree-6 invariant's 2.25 to 1 percent. (L1: forced by W(F4).)
//  S3 relativistic kinematics:
//     S3a the inertia from the K^2 curvature equals the rest energy over c0^2 (c0 the massless pair's speed, measured at
//         theta = phi): |R - 1| <= 0.01;
//     S3b the isotropic K^4 part of eps^2 against the Lorentz value 0: |eta| <= 0.05 along all four directions;
//     S3c both vanish as the particle gets light: between m = pi/48 and pi/96, log2 of the ratio of |R - 1| in [1.8, 2.2]
//         and of |eta| in [0.8, 1.2];
//     S3d the massless pair is E = c0 |K| with no K^2 term: |gamma| / c0 <= 1e-3 (kappa 0.01, Richardson).
//  S4 universality:
//     S4a the love under the same mixer at theta*: its m equals the hole's to 1e-9 and its c^2 to 1e-6 relative (L1);
//     S4b c0 equals the cone speed c (the stream's one root a beat, measured from the rule's exact walk), which is the
//         light's c that E-GRV-0141's slide carries: |c0 / c - 1| <= 0.01.
// PREDICTED VERDICT: fail, on S3d (gamma / c0 = 0.102) and S4b (c0 / c = 0.5); S1, S2, S3a, S3b, S3c, S4a hold.
// INSTRUMENT (a failure makes the verdict partial): the float dock matrix equals the rule's (ruleDockMatrix, the piece
//  then the coin) at the working point to 1e-12; Hellmann-Feynman equals a central difference to 1e-6 at theta*; the fit
//  is stable (c^2 from the node set at half the scale agrees to 1e-8 relative, d to 1e-3 relative); the exact walk
//  reaches exactly t along a root for t = 1 .. 4 and the straight path's amplitude P*_BB is nonzero at theta*.
// CONTROLS (a failure makes the verdict partial):
//  C1 a 3-design cone gives K^4: E-SPN-0130's frame mixer's love singlet (8 roots, a cross-polytope) at theta*: the
//     face-minus-axis slope between 0.2 m* and 0.1 m* in [3.8, 4.2] (S2's reading can fail).
//  C2 a heavy particle is not relativistic: at theta = 4 pi / 3 (m = pi / 3) |R - 1| > 0.5 (S3a's reading can fail).
//  C3 at theta = phi there is no singlet (multiplets 13 + 11), so S1's reading can fail.
//  C4 the cause of gamma: at the swap coin (n = 2/3, zeta = -1) the massless pair has |gamma| / c0 <= 1e-6.
// REPORTED, gating nothing: the scan over theta and n; the fastest band of the hole and of the love at theta* over 1,024
// deterministic momenta (Hellmann-Feynman), against c_eff; the derived against the measured numbers.
//
// PROBE BEFORE THE GATE RUN, disclosed: tmp/sing-probe1.log (m = pi/96, pi/48, pi/24): m, c^2 and eta read the same on
// two node sets and four directions; eta 4.55e-3, 8.78e-3, 1.64e-2 against beta m 4.72e-3, 9.45e-3, 1.89e-2; the tensor
// defect 2e-10 at kappa m/16 .. m/64; the K^6 slope 5.92 between 0.4 m and 0.2 m, 5.98 between 0.2 m and 0.1 m, and noise
// below 0.1 m; c0 = 0.70710678 and gamma = 0.0721688 at n = 1, 0.4665 at n = 4, 5e-12 at n = 2/3; the frame control's
// slope 3.98; the fastest band 0.560 c over 256 momenta. The probe fixed the K^6 kappas (0.2 m and 0.1 m) and the node
// sets; no threshold was set or moved after it. (tmp/sing-predict.log evaluates item 3's closed forms; its two-level eta
// column is float noise, superseded by the series -m^4 / 45 above.)
//
// FIRST RUN (tmp/sing-exp-run1.log, 4.8 s): FAIL on S3d and S4b, as derived; S1, S2, S3a, S3b, S3c, S4a, the instrument
// and every control hold. No gate moved.
//  - S1: 12 + 11 + 1, m 0.065450 (derived pi/48), gap 0.130900, a band edge.
//  - S2: tensor -7.628526 I (the phase curvature, -(1/2) cot m) to 3.7e-10; K^6 slopes 5.982, 5.984, 5.982; face/body
//    2.2535. eta and c^2 agree over the four directions to 1.4e-9.
//  - S3: c_eff 0.499643 c and R 1.001430, both the derived values to 6 digits; eta 8.78e-3 (beta m = 9.45e-3, the O(m)
//    remainder -7 percent); slopes R 2.002, eta 0.948. Massless c0 = 0.50000000 c in all four directions, gamma
//    0.0721688 = cot(pi/3) / 8, gamma / c0 0.1021: FAIL. n = 4 gives gamma 0.46651 (derived 0.46651), n = 2/3 gives 5e-12.
//  - S4: the love equals the hole (m to 5e-16, c^2 to 2e-11); c0 / c 0.500000 against the cone's 1 root a beat: FAIL.
//  - Controls: the frame love's anisotropy slope 3.984 (K^4); R 1.6540 at 4 pi/3; no singlet at phi (13 + 11); the swap
//    coin's gamma / c0 7.6e-12.
//  - Reported: the scan's m, c_eff and R equal the derived values in every row to 6 digits (theta 5 pi/3 has c^2 = 0, so
//    its R and eta are the fit's noise over zero); eta grows with m (2.9e-2 at pi/12, 4.8e-2 at pi, 9.9e-2 at 4 pi/3)
//    and with the coin's beta (4.9e-2 at n = 4, -3.6e-4 at n = 2/3); the edge flag reads false at 4 pi/3 and at
//    n = 2/3, where the K = 0 spectrum has two equal widest gaps. The fastest band over 1,024 momenta moves at 0.564 c
//    (hole and love alike), faster than c_eff: the heavy branches, a gap of order 1 away, are not bound by c / 2.
//
// Depth: L1 (S2, S4a and the curvature and speed formulas are symmetry and perturbation theory) and L2 (the kinematics
// of a coined quantum walk's band). DETERMINISM: no random numbers; the momenta are a fixed additive recurrence. NOTHING
// MOVES: the mixer and the coin hand a value to another slot of the same dock; the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootIndex } from '@/code/measure/crossing-lines'
import { d4Steps, frameMatrix, frameRoots } from '@/code/measure/frame-cone'
import { lineFrame } from '@/code/measure/frame-meson'
import { dockMatrix, DOCK_ROOTS, exactDockWalk, exactGap, meanTensors, ruleDockMatrix, tensorDefect, velocityGap, type CMatrix } from '@/code/measure/dock-mixer'
import { fastestBand, masslessPair, singletAnisotropy, singletKinematics, singletLevel, weylMomenta, type Roots, type SingletLevel } from '@/code/measure/singlet-kinematics'

const PHI = (2 * Math.PI) / 3
const M_STAR = Math.PI / 48
const THETA_STAR = PHI + 2 * M_STAR
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const SCALES_HALF: readonly number[] = SCALES.map(s => s / 2)
const TENSOR_DIVISOR = 32
const SIX: readonly [number, number] = [0.2, 0.1]
const SLOPE_RANGE: readonly [number, number] = [5.8, 6.2]
const FOUR_RANGE: readonly [number, number] = [3.8, 4.2]
const PATTERN_TOLERANCE = 0.01
const ISOTROPY_TOLERANCE = 1e-6
const GAP_SLACK = 1e-9
const R_TOLERANCE = 0.01
const ETA_CEILING = 0.05
const R_SLOPE: readonly [number, number] = [1.8, 2.2]
const ETA_SLOPE: readonly [number, number] = [0.8, 1.2]
const LIGHT_MASSES: readonly [number, number] = [Math.PI / 48, Math.PI / 96]
const PAIR_KAPPA = 0.01
const GAMMA_CEILING = 1e-3
const SWAP_GAMMA_CEILING = 1e-6
const LOVE_M_TOLERANCE = 1e-9
const LOVE_C_TOLERANCE = 1e-6
const SPEED_TOLERANCE = 0.01
const HEAVY_R_FLOOR = 0.5
const FIT_C_TOLERANCE = 1e-8
const FIT_D_TOLERANCE = 1e-3
const MATRIX_TOLERANCE = 1e-12
const VELOCITY_TOLERANCE = 1e-6
const WALK_BEATS = 4
const MOMENTA = 1024
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
const DIRS = FOUR.map(d => d.u)
const SCAN: readonly { name: string; theta: number; n: number }[] = [
  { name: 'theta pi/3 (interior)', theta: Math.PI / 3, n: 1 },
  { name: 'theta phi (massless)', theta: PHI, n: 1 },
  { name: 'm pi/96', theta: PHI + Math.PI / 48, n: 1 },
  { name: 'm pi/48 (theta*)', theta: THETA_STAR, n: 1 },
  { name: 'm pi/24', theta: PHI + Math.PI / 12, n: 1 },
  { name: 'm pi/12', theta: PHI + Math.PI / 6, n: 1 },
  { name: 'theta pi (m pi/6)', theta: Math.PI, n: 1 },
  { name: 'theta 4pi/3 (m pi/3)', theta: (4 * Math.PI) / 3, n: 1 },
  { name: 'theta 5pi/3 (m pi/2)', theta: (5 * Math.PI) / 3, n: 1 },
  { name: 'n 4, m pi/48', theta: Math.PI / 6 + Math.PI / 24, n: 4 },
  { name: 'n 2/3, m pi/48', theta: Math.PI + Math.PI / 24, n: 2 / 3 },
]

const C = Math.SQRT2
const relative = (x: number, y: number): number => Math.abs(x - y) / Math.abs(y)

type Reading = { level: SingletLevel; c2: number[]; d: number[]; eta: number[]; R: number }

// the relativistic reading of the singlet of P along the four directions, R against the massless c0
function readSinglet(P: CMatrix, roots: Roots, c0: number, scales: readonly number[] = SCALES): Reading {
  const level = singletLevel(P, roots, 12)

  if (level.single < 0 || level.partner < 0) return { level, c2: [], d: [], eta: [], R: NaN }

  const k = DIRS.map(u => singletKinematics(P, roots, level, u, scales))
  const c2 = k.map(x => x.c2)

  return { level, c2, d: k.map(x => x.d), eta: k.map(x => x.eta), R: (c0 * c0) / (c2[0] as number) }
}

export default experiment({
  id: 'spin/singlet-relativity',
  code: 'E-SPN-0142',
  title:
    "the dock mixer's isolated singlet is a relativistic particle at small K but moves at c/2 with a first-order speed shift, fail (S3d, S4b): at theta = 2pi/3 + pi/24 (n = 1) the hole's staggered mode is a nondegenerate band edge (12 + 11 + 1, gap pi/24), its inverse mass tensor isotropic to 4e-10 and its first anisotropy K^6 (slopes 5.98, face/body 2.2535); its rest energy m = pi/48, c_eff = 0.499643 c and inertia equal to m / c0^2 to tan(m)/m = 1.00143, the K^4 departure from E^2 = m^2 + c^2 K^2 eta = 0.0088, both vanishing as m -> 0 (slopes 2.00 and 0.95); but the massless pair (theta = phi) is E = +-c0 K + gamma K^2 with c0 = 0.5000000 c exactly and gamma = cot(phi/2)/8 = 0.0722 (0.4665 at n = 4, 0 at the swap coin n = 2/3), a speed shift linear in K, and c0 is half the stream's cone c that E-GRV-0141's graviton moves at, while the love under the same mixer is the hole's mirror (the same m and c to 2e-11) and the heavy bands reach 0.564 c; a frame mixer's singlet (a 3-design) is anisotropic at K^4 (slope 3.98) and at theta = 4pi/3 R = 1.654",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const B = rootIndex([1, 1, 0, 0])

    // ---------------- instrument ----------------
    const gapRule = exactGap(ruleDockMatrix(true), dockMatrix(PHI, 1, true), 48)
    const PS = dockMatrix(THETA_STAR, 1, true)
    const velGap = Math.max(
      ...[
        [0.31, -1.07, 0.73, 2.03],
        [0.02, 0.01, -0.03, 0.015],
      ].flatMap(K => FOUR.map(d => velocityGap(PS, DOCK_ROOTS, K, d.u))),
    )
    const reach: number[] = []
    const rB = DOCK_ROOTS[B] as readonly number[]
    const along: number[] = []

    exactDockWalk(ruleDockMatrix(true), DOCK_ROOTS, B, WALK_BEATS, (t, sites) => {
      let r = 0
      let a = -Infinity

      for (const site of sites.values()) {
        r = Math.max(r, d4Steps(site.v))
        a = Math.max(a, site.v.reduce((s, x, k) => s + x * (rB[k] as number), 0) / 2)
      }

      reach.push(r)
      along.push(a)
    })

    const straight = Math.hypot(PS.re[B * 24 + B] as number, PS.im[B * 24 + B] as number)
    const coneOk = reach.every((r, i) => r === i + 1) && along.every((a, i) => a === i + 1) && straight > 1e-3
    // the cone speed: the walk's reach along the root per beat, times the root's length
    const cCone = ((along[WALK_BEATS - 1] as number) / WALK_BEATS) * C

    log('instrument')

    // ---------------- the massless pair (c0, gamma) ----------------
    const pairs = [1, 4, 2 / 3].map(n => {
      const P = dockMatrix((2 * Math.PI) / (3 * n), n, true)
      const r = FOUR.map(d => masslessPair(P, DOCK_ROOTS, 13, d.u, PAIR_KAPPA))

      return { n, c0: r.map(x => x.c0), gamma: r.map(x => x.gamma), size: (r[0] as { size: number }).size }
    })
    const pair1 = pairs[0] as (typeof pairs)[number]
    const c0 = pair1.c0[0] as number
    const gammaOverC = Math.max(...pair1.gamma.map(g => Math.abs(g) / c0))
    const swap = pairs[2] as (typeof pairs)[number]
    const swapGamma = Math.max(...swap.gamma.map((g, j) => Math.abs(g) / (swap.c0[j] as number)))

    log('pair')

    // ---------------- S1, S2, S3 at theta* ----------------
    const star = readSinglet(PS, DOCK_ROOTS, c0)
    const half = readSinglet(PS, DOCK_ROOTS, c0, SCALES_HALF)
    const fitC = Math.max(...star.c2.map((x, j) => relative(half.c2[j] as number, x)))
    const fitD = Math.max(...star.d.map((x, j) => relative(half.d[j] as number, x)))
    const L = star.level
    const sizes = L.multiplets.map(x => x.size).sort((a, b) => a - b)
    const S1 = sizes.join(',') === '1,11,12' && L.gap >= 2 * M_STAR * (1 - GAP_SLACK) && L.edge
    const tensor = tensorDefect((meanTensors(PS, DOCK_ROOTS, L.multiplets, M_STAR / TENSOR_DIVISOR)[L.single] as number[][]))
    const anisA = singletAnisotropy(PS, DOCK_ROOTS, L, DIRS, SIX[0] * M_STAR)
    const anisB = singletAnisotropy(PS, DOCK_ROOTS, L, DIRS, SIX[1] * M_STAR)
    const slopes = anisA.map((x, j) => Math.log2(x / (anisB[j] as number)))
    const faceBody = (anisB[0] as number) / (anisB[1] as number)
    const S2 = tensor.defect <= ISOTROPY_TOLERANCE && slopes.every(x => x >= SLOPE_RANGE[0] && x <= SLOPE_RANGE[1]) && Math.abs(faceBody / 2.25 - 1) <= PATTERN_TOLERANCE
    const S3a = Math.abs(star.R - 1) <= R_TOLERANCE
    const S3b = star.eta.every(x => Math.abs(x) <= ETA_CEILING)
    const light = LIGHT_MASSES.map(m => readSinglet(dockMatrix(PHI + 2 * m, 1, true), DOCK_ROOTS, c0))
    const rSlope = Math.log2(Math.abs((light[0] as Reading).R - 1) / Math.abs((light[1] as Reading).R - 1))
    const etaSlope = Math.log2(Math.abs((light[0] as Reading).eta[0] as number) / Math.abs((light[1] as Reading).eta[0] as number))
    const S3c = rSlope >= R_SLOPE[0] && rSlope <= R_SLOPE[1] && etaSlope >= ETA_SLOPE[0] && etaSlope <= ETA_SLOPE[1]
    const S3d = gammaOverC <= GAMMA_CEILING
    const S3 = S3a && S3b && S3c && S3d

    log('S1 S2 S3')

    // ---------------- S4: the love, and the cone ----------------
    const PL = dockMatrix(THETA_STAR, 1, false)
    const love = readSinglet(PL, DOCK_ROOTS, c0)
    const loveM = Math.abs(love.level.m - L.m)
    const loveC = Math.max(...love.c2.map((x, j) => relative(x, star.c2[j] as number)))
    const S4a = love.level.single >= 0 && loveM <= LOVE_M_TOLERANCE && loveC <= LOVE_C_TOLERANCE
    const cRatio = c0 / cCone
    const S4b = Math.abs(cRatio - 1) <= SPEED_TOLERANCE
    const S4 = S4a && S4b
    const momenta = weylMomenta(MOMENTA)
    const fastHole = fastestBand(PS, DOCK_ROOTS, momenta)
    const fastLove = fastestBand(PL, DOCK_ROOTS, momenta)

    log('S4')

    // ---------------- controls ----------------
    const fRoots = frameRoots(lineFrame(B))
    const PF = frameMatrix(THETA_STAR, 1, false)
    const LF = singletLevel(PF, fRoots, 4)
    const fA = singletAnisotropy(PF, fRoots, LF, DIRS, SIX[0] * M_STAR)
    const fB = singletAnisotropy(PF, fRoots, LF, DIRS, SIX[1] * M_STAR)
    const frameSlope = Math.log2((fA[0] as number) / (fB[0] as number))
    const C1 = LF.single >= 0 && frameSlope >= FOUR_RANGE[0] && frameSlope <= FOUR_RANGE[1]
    const heavy = readSinglet(dockMatrix((4 * Math.PI) / 3, 1, true), DOCK_ROOTS, c0)
    const C2 = Math.abs(heavy.R - 1) > HEAVY_R_FLOOR
    const atPhi = singletLevel(dockMatrix(PHI, 1, true), DOCK_ROOTS, 12)
    const C3 = atPhi.single < 0 && atPhi.multiplets.map(x => x.size).sort((a, b) => a - b).join(',') === '11,13'
    const C4 = swapGamma <= SWAP_GAMMA_CEILING

    log('controls')

    // ---------------- the scan (reported) ----------------
    const scan = SCAN.map(row => {
      const P = dockMatrix(row.theta, row.n, true)
      const r = readSinglet(P, DOCK_ROOTS, c0)
      const phi = (2 * Math.PI) / (3 * row.n)
      const mPred = Math.abs(Math.atan2(Math.sin(row.theta - phi), Math.cos(row.theta - phi))) / 2

      if (r.level.single < 0 || r.level.m < 1e-9) return `${row.name}: multiplets ${r.level.multiplets.map(x => x.size).join('+')}, no singlet`

      const cEff = Math.sqrt(Math.max(r.c2[0] as number, 0)) / C
      const cPred = Math.sqrt((mPred / Math.tan(mPred)) / 2) / C
      const etaSpread = Math.max(...r.eta) - Math.min(...r.eta)

      return `${row.name}: m ${r.level.m.toFixed(6)} (${mPred.toFixed(6)}), edge ${r.level.edge}, gap ${r.level.gap.toFixed(4)}, c_eff/c ${cEff.toFixed(6)} (${cPred.toFixed(6)}), R ${r.R.toPrecision(7)} (${(Math.tan(mPred) / mPred).toPrecision(7)}), eta ${(r.eta[0] as number).toExponential(3)} (spread over directions ${etaSpread.toExponential(1)})`
    })

    log('scan')

    // ---------------- verdict ----------------
    const instrument = gapRule <= MATRIX_TOLERANCE && velGap <= VELOCITY_TOLERANCE && fitC <= FIT_C_TOLERANCE && fitD <= FIT_D_TOLERANCE && coneOk
    const controls = C1 && C2 && C3 && C4
    const status = !instrument || !controls ? 'partial' : S1 && S2 && S3 && S4 ? 'pass' : 'fail'
    const cStar = Math.sqrt(star.c2[0] as number) / C
    const metrics: Record<string, number> = {
      S1: S1 ? 1 : 0,
      S2: S2 ? 1 : 0,
      S3: S3 ? 1 : 0,
      S3a: S3a ? 1 : 0,
      S3b: S3b ? 1 : 0,
      S3c: S3c ? 1 : 0,
      S3d: S3d ? 1 : 0,
      S4: S4 ? 1 : 0,
      S4a: S4a ? 1 : 0,
      S4b: S4b ? 1 : 0,
      instrument: instrument ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      C3: C3 ? 1 : 0,
      C4: C4 ? 1 : 0,
      m: L.m,
      gap: L.gap,
      cEffOverC: cStar,
      R: star.R,
      eta: star.eta[0] as number,
      rSlope,
      etaSlope,
      tensorA: tensor.a,
      tensorDefect: tensor.defect,
      slopeFace: slopes[0] as number,
      slopeBody: slopes[1] as number,
      slopeGeneric: slopes[2] as number,
      faceBody,
      c0OverC: c0 / C,
      gammaOverC0: gammaOverC,
      gamma: pair1.gamma[0] as number,
      gammaN4: (pairs[1] as (typeof pairs)[number]).gamma[0] as number,
      swapGamma,
      loveM,
      loveC,
      cRatio,
      cCone,
      fastHole: fastHole.speed / C,
      fastLove: fastLove.speed / C,
      frameSlope,
      heavyR: heavy.R,
      gapRule,
      velocityGap: velGap,
      fitC,
      fitD,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `S1 ${S1} (multiplets ${sizes.join('+')}, m ${L.m.toFixed(6)}, gap ${L.gap.toFixed(6)} against ${(2 * M_STAR).toFixed(6)}, band edge ${L.edge}); S2 ${S2} (tensor ${tensor.a.toFixed(6)} I to ${tensor.defect.toExponential(1)}, K^6 slopes ${slopes.map(x => x.toFixed(3)).join('/')}, face/body ${faceBody.toFixed(4)}); S3 ${S3} (S3a ${S3a}: R ${star.R.toFixed(6)}, c_eff ${cStar.toFixed(6)} c; S3b ${S3b}: eta ${star.eta.map(x => x.toExponential(3)).join(' ')}; S3c ${S3c}: slopes R ${rSlope.toFixed(3)}, eta ${etaSlope.toFixed(3)}; S3d ${S3d}: massless c0 ${(c0 / C).toFixed(8)} c, gamma ${(pair1.gamma[0] as number).toFixed(7)}, gamma/c0 ${gammaOverC.toFixed(5)}); S4 ${S4} (S4a ${S4a}: love m off ${loveM.toExponential(1)}, c^2 off ${loveC.toExponential(1)}; S4b ${S4b}: c0 / c ${cRatio.toFixed(6)}, the cone ${(cCone / C).toFixed(6)} c); controls C1 ${C1} (frame slope ${frameSlope.toFixed(3)}), C2 ${C2} (R at 4pi/3 ${heavy.R.toFixed(4)}), C3 ${C3} (theta phi ${atPhi.multiplets.map(x => x.size).join('+')}), C4 ${C4} (swap-coin gamma/c0 ${swapGamma.toExponential(1)})`,
      metrics,
      control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, C3: C3 ? 1 : 0, C4: C4 ? 1 : 0, instrument: instrument ? 1 : 0 },
      notes: `L1/L2. Scan (measured (derived)): ${scan.join('; ')}. Massless pairs: ${pairs.map(p => `n ${p.n.toFixed(3)} multiplet ${p.size}, c0 ${p.c0.map(x => (x / C).toFixed(8)).join(' ')} c, gamma ${p.gamma.map(x => x.toExponential(4)).join(' ')}`).join('; ')}. theta* along axis/face/body/generic: c^2 ${star.c2.map(x => x.toFixed(10)).join(' ')}, d ${star.d.map(x => x.toFixed(5)).join(' ')}. Love at theta*: multiplets ${love.level.multiplets.map(x => x.size).join('+')}, edge ${love.level.edge}, c^2 ${love.c2.map(x => x.toFixed(10)).join(' ')}, eta ${love.eta.map(x => x.toExponential(3)).join(' ')}. Fastest band over ${MOMENTA} momenta: hole ${(fastHole.speed / C).toFixed(5)} c at ${fastHole.at.map(x => x.toFixed(3)).join(',')}, love ${(fastLove.speed / C).toFixed(5)} c, against c_eff ${cStar.toFixed(5)} c. Instrument: rule matrix ${gapRule.toExponential(2)}, velocity ${velGap.toExponential(2)}, fit c^2 ${fitC.toExponential(2)} d ${fitD.toExponential(2)}, walk reach ${reach.join(' ')} along ${along.join(' ')}, straight amplitude ${straight.toFixed(6)}. Frame control multiplets ${LF.multiplets.map(x => x.size).join('+')}, anisotropy face/body/generic slopes ${fA.map((x, j) => Math.log2(x / (fB[j] as number)).toFixed(3)).join(' ')}. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
