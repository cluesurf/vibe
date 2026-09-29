// IS THE HOPF MAP THE HUSK READING OF A 4D MOTION'S 3D DIRECTION? (E-SPN-0158). E-SPN-0152 fixed an isometry from the
// 24 D4 roots onto the 24 Hurwitz units, 2 q = (r0 + r1, r0 - r1, r2 + r3, r2 - r3). Under the Hopf map q -> q i conj(q)
// the 24 units land on the six octahedron corners, and the dock's three frames look like the three 3d axes. E-SPN-0156
// found instead that a line's geometric shadow on the true {3,4,3,4} husk takes 18 directions, not 6. At most one of the
// two can be the physical reading. Which one, and under each, is the measured motion isotropic in 3d?
//
// DERIVED BEFORE THE RUN (machinery: code/measure/hopf-reading).
// (a) THE DECOMPOSITION. With M the isometry above (|M x|^2 = |x|^2 / 2), the Hopf map on any 4d vector is the quadratic
//     form H(x) = (M x) i conj(M x) = ((x0^2 + x1^2 - x2^2 - x3^2) / 2, x0 x2 - x1 x3, -(x0 x3 + x1 x2)), |H(x)| = |x|^2 / 2,
//     H(-x) = H(x). On a root it is the corner of the root's support pair: {01} -> +i, {23} -> -i, {02} -> sign(r0 r2) j,
//     {13} -> -sign(r1 r3) j, {03} -> -sign(r0 r3) k, {12} -> -sign(r1 r2) k. At a unit q the space splits as
//     R^4 = <q> + <q i> + <q j, q k>, and the differential dH_q(y) = y i conj(q) + q i conj(y) sends q -> 2 H(q) (radial, the
//     base point itself), q i -> 0 (THE FIBER, a pure phase), q j -> -2 q k conj(q), q k -> 2 q j conj(q): it is twice an
//     isometry of the fiber's complement onto R^3, |dH_q(y)|^2 = 4 (|y|^2 - <y, q i>^2). In root coordinates the fiber of
//     the unit of root d is the LINE of the root of q_d i. So there are three candidate readings of a displacement x:
//       HOPF     H(x), quadratic and EVEN: a vibe running along its line and the same vibe running back read the same
//                base point, so H is an orientation reading, never a velocity; on a root it is the corner.
//       HOPF-D   dH_q(x), linear and odd: an orthogonal projection (times 2) along the fiber, a ROOT line, then a turn.
//                On the 24 roots at q = 1: the fiber line to 0, its frame's other three lines to the three axes (length
//                2), the other 16 roots to the cube's 8 body diagonals (twice each, length sqrt 3).
//       SHADOW   G_u(x) = x - (x . u) u, the husk's horizontal projection at a dock whose cusp lies along u. The cusp is an
//                ideal vertex of the 24-cell dock, and with the facet normals at the roots the vertices lie along the 24
//                units of the dual lattice D4* (+-e_i, (+-1/2)^4): a SHORT root of F4, where HOPF-D projects along a LONG
//                one. On the roots: the 12 with r . u = 0 are horizontal and shadow on the cuboctahedron (6 face
//                diagonals, length sqrt 2), the 12 with r . u = +-1 are tilted and shadow on the octahedron (3 axes, each
//                reached by 4 roots, length 1). The flat box's husk is G_u at u = e3.
// (b) SHADOW AGAINST HOPF, line by line. A frame is 4 mutually orthogonal lines; along any u in D4* exactly two of them are
//     tilted and shadow on ONE axis, and two are horizontal and shadow on the two face diagonals orthogonal to that axis.
//     And the frames are exactly the Hopf preimages of the three axes (L1, H1). So at every layer dock the 9 undirected
//     shadow axes (3 cube axes, 6 face diagonals: E-SPN-0156's 18 directed directions) REFINE the three Hopf axes: a line's
//     Hopf axis is a function of its shadow axis. The SIGNED corner is not a function of the directed shadow: along u = e0
//     the roots (1, 0, 1, 0) and (-1, 0, 1, 0) both shadow on +e2 and land on +j and -j; nor is the directed shadow a
//     function of the corner (a corner's two lines shadow on an axis and on a diagonal, or on two diagonals). The shadow
//     is odd (x -> -x reverses it) and the Hopf map is even, so no identification of the two 3d spaces can make them agree
//     on directed motion. Whether ONE identification of frames with chart axes holds at every layer dock (the dock frames
//     differ by the antipodal transport, which permutes frames) is not derived: reported (H2g).
// (c) ISOTROPY, by case (R: the root level, a distribution over slots; V: group velocities; W: the wave's classes).
//     THEOREM: a linear map of a 4d set whose |x|^4-weighted fourth moment is isotropic is isotropic in 3d through fourth
//     order (P^(x4) of the 4d isotropic tensor is the 3d isotropic tensor). The 24 roots are a 5-design, so SHADOW and
//     HOPF-D read the uniform 24 with A2 = A4 = 0 EXACTLY. HOPF sends them to the 6 corners, 4 each: A2 = 0, A4 = 7/12, and
//     since any weights on the six corners give A4 = 3/8 + (5/8) sum_a W_a^2 >= 7/12, HOPF reads EVERY root-level
//     distribution anisotropic at fourth order: the octahedron is a 3-design, not a 4-design.
//       R uniform 24 (the singlet as K -> 0; the wave's 24 equal classes): SHADOW 0, 0 (every u); HOPF-D 0, 0 with null
//         share 1/12 (every q); HOPF 0, 7/12.
//       R uniform frame (the frame hole: its 8 bands' slot weights sum to one on each frame slot): the frame's 4d second
//         moment is 4 I, so SHADOW and HOPF-D read A2 = 0; SHADOW A4 = 3/5 at every u (weights 2/10 on one axis, 4/10 on
//         each diagonal, all orthogonal); HOPF-D A4 = 7/12, null 1/4, for the 8 q in the frame (the octahedron) and A4 =
//         7/27, null 0, for the 16 outside it (the cube); HOPF A2 = 1, A4 = 1: ONE AXIS.
//       R measured singlet (the massless swap pair of E-SPN-0143, its two moving bands at |K| 0.05 over the 120 unit
//         directions of 2I): uniform to O(K), so within 0.02 of the uniform-24 row.
//       V singlet: v = c0 K / |K| + O(K^5) with the 2I directions an 11-design: every reading isotropic, A2 and A4 at most
//         1e-3 (HOPF's moments to fourth order are polynomials of degree 8 in v, inside the design's 11).
//       V frame (E-SPN-0136's F2 point, 8 bands over 1,024 Weyl momenta): the velocities fill the frame's cross-polytope,
//         whose support is anisotropic in every reading: SHADOW at e3 is E-SPN-0136's box (0.707 c on the axes, 0.5 c on
//         e13, spread about 2); HOPF: along its axis i the corner is reached at the roots (1) and along j at most
//         2 (a d + b c) <= 1/2 over the cross-polytope, spread about 2; HOPF-D: an octahedron or a cube, spread sqrt 3.
//       W (E-SPN-0157's charge wave: class d displaced along r_d; frozen share = classes whose reading is perpendicular to
//         the wave vector): SHADOW 1/2, 1/4, 1/4, 1/6 on axis, face, body, (2,1,0) at every u (the box's measured floors);
//         HOPF 2/3, 1/3, 0, 1/3; HOPF-D 1/4, 1/2, 1/12, 1/6. Anisotropic in every reading: a class moves along one fixed
//         direction or not at all under ANY reading that is a function of the class, so no reading removes the line law's
//         frozen share. The box's frozen classes land on the Hopf corners: axis -i x4, +-j and +-k x2 each; face -i x4 and
//         +i x2; body +i, -j, +k x2 each; (2,1,0) -i x4 (so the box's wave directions are not Hopf directions).
// SO, PREDICTED: H1 holds (exact); H2 FAILS as an identity (signs disagree, parity differs) while H2r (refine at the axis
// level, dock by dock) holds; H3 holds; H4 FAILS: every measured case (singlet isotropic, frame anisotropic, waves
// anisotropic) reads the same way in both families, so the measured kinematics cannot choose the reading. What decides
// is H2 and the root level: the true mesh's husk IS the shadow, linear and odd, and the Hopf map agrees with it only on
// which frame a line belongs to.
//
// GATES, fixed before the first run, never moved.
//  H1 (exact, doubled integer quaternions) every root lands on a corner, 4 on each, forming the circle {q, q i, -q, -q i};
//     the preimage of each axis is a frame (3 of 3, and the three frames are the three cosets of Q8); the 12 lines give 12
//     distinct integer rotations of determinant 1, R_q R_p = R_(q p) on all 144 pairs, orders 1 x 1, 2 x 3, 3 x 8, each
//     keeping the tetrahedron {(1,1,1), (1,-1,-1), (-1,1,-1), (-1,-1,1)}, and the corner of q is R_q's first column; the
//     differential on all 576 pairs is integral, dH_q(q) = 2 H(q), dH_q(y) = 0 exactly for y = +-(the root of q i), and
//     |dH_q(y)|^2 = 4 (|y|^2 / 2 - <M y, q i>^2); and frames = axes holds under all 192 elements of W(D4) relabeling the
//     roots (any isometry keeps it).
//  H2 (the true mesh, the 63 cusp-layer docks to skin 3, 12 lines each) the Hopf reading IS the husk reading of
//     direction: at every dock the signed corner is a function of the directed shadow over the 24 slots, and the
//     directed shadow a function of the corner. PREDICTED TO FAIL. Reported with it, each a boolean: H2r (refine) at every
//     dock the 12 shadows fall on 9 undirected axes, lines sharing an axis share a frame, and each frame's two tilted lines
//     share one axis while its two horizontal lines lie on axes orthogonal to it and to each other (PREDICTED TO HOLD);
//     H2g (global) the number of distinct frame -> chart axis maps over the 63 docks, and whether the frame (or the
//     corner) is a function of the chart axis (direction) over all 756 lines at once.
//  H3 (the moments against (c)) every exact row of (c) (R uniform 24, R uniform frame, W) equals its derived value to
//     1e-12 in every reading (24 shadows, HOPF, 24 HOPF-D); the measured singlet slot weights read within 0.02 of the
//     uniform-24 row; V singlet A2 and A4 at most 1e-3 in every reading; V frame support spread at least 1.05 in every
//     reading.
//  H4 a reading family agrees with every measured case when, for every member: V singlet A2 and A4 at most 1e-3
//     (isotropic), V frame support spread at least 1.05 or A4 at least 0.05 (anisotropic), W frozen share spread over the
//     four directions at least 0.05 (anisotropic). H4 holds when EXACTLY ONE of SHADOW and HOPF agrees (the measured cases
//     choose). PREDICTED TO FAIL (both agree). HOPF-D is reported beside them.
// INSTRUMENT (a failure makes the verdict partial): the two root tables agree; frameMatrix at the working point equals the
//  rule's ruleFrameMatrix to 1e-12; every layer dock's cusp is a unit of D4* (root-coordinate error below 1e-9), a line is
//  tilted (2 layer docks) exactly when r . u != 0 on all 756, the chart Gram of each dock's 12 shadows equals the Gram of
//  the normalized G_u(r) to 1e-6, and the 756 lines give E-SPN-0156's 18 directed directions; every shadow reading has an
//  orthonormal cubic frame; the singlet has 2 moving bands at each of the 120 momenta, at most c0 = c / 2 (1 + 1e-9) and at
//  least 0.49 c; the box reads the frame hole's top speed on e13 in [0.45, 0.5 + 1e-9] c and on e1 in [0.65, 0.7072] c
//  (E-SPN-0136); the frame hole's exact walk keeps its norm 256^t from every start.
// CONTROL C1: a Weyl permutation of the 24 labels (weylPermutation, start 1), not an isometry, must BREAK frames = axes
//  (fewer than 3 axes whose preimage is a frame); a failure makes the verdict partial.
// REPORTED, gating nothing: V dock mixer (E-SPN-0140's D4 point, 24 bands over 512 momenta) and the frame hole's exact
//  displacement at beat 8 averaged over its 8 start slots (the D level), each through every reading; the Hopf corners of
//  E-SPN-0157's frozen classes.
// Verdict: partial if the instrument or C1 fails; pass if H1 to H4 hold; fail otherwise.
//
// PROBE BEFORE THE GATE RUN, disclosed (written after the gates above): one smoke of every code path on a reduced plan
//  (skin 1: 7 layer docks; 64 frame momenta, 16 dock momenta, 3 walk beats; tmp/hopf-smoke.ts, tmp/hopf-smoke.log, 2 s).
//  It read the gated quantities on that plan: H1 and C1 as derived, H2 false (0 of 7 docks agree, 28 directed shadows
//  with two corners), H2r true on 7 of 7, one frame -> chart axis map over the 7 docks, every cusp of type +-e_i, H3's
//  exact rows exact, the singlet isotropic in every reading, the frame spread 1.41 to 2.08, H4 false (all three families
//  agree), every instrument in range. Nothing was changed after it: no gate, threshold or reading.
//
// RESULT (run 1, tmp/hopf-exp-run1.log, 10 s), recorded after the run; no gate moved. FAIL on H2 and H4, as predicted.
//  H1, H2r, H3, C1 and every instrument hold.
//  - H1: 24 roots on the 6 corners, 4 each, each set the circle {q, q i, -q, -q i}; the 3 axes pull back to the 3 frames,
//    which are the 3 cosets of Q8; the 12 lines give 12 integer rotations of determinant 1 with orders 1 x 1, 2 x 3,
//    3 x 8, a homomorphism on 144 pairs, each keeping the tetrahedron, the corner their first column; the differential is
//    integral on 576 pairs, 2 H(q) at q, 0 exactly on the fiber line, of norm 4 (|y|^2 / 2 - <M y, q i>^2); all 192
//    W(D4) relabelings keep frames = axes. C1: the Weyl relabeling pulls back 0 of 3 axes to a frame (and keeps 1 of 12
//    lines antipodal).
//  - H2 FAILS: signed corner and directed shadow agree at 0 of 63 layer docks; 252 directed shadows (4 a dock) carry two
//    corners. H2r holds at 63 of 63: 9 undirected shadow axes at every dock, each on one frame, each frame one tilted
//    axis plus two orthogonal diagonals. H2g: ONE frame -> chart axis map at all 63 docks (frame f shadows its tilted
//    lines on chart axis f), and the frame is a function of the undirected chart axis over all 756 lines; the corner is
//    not a function of the chart direction. Every one of the 63 local cusps is of type +-e_i (none (+-1/2)^4). Instrument:
//    tilted exactly when r . u != 0 on 756 of 756, chart Gram equal to the G_u Gram to 2.0e-13, 18 directed directions.
//  - H3 holds. R uniform 24: shadow and HOPF-D 0, 0 (HOPF-D null 1/12), HOPF 0, 0.583333 = 7/12. R uniform frame: shadow
//    0, 3/5 at all 24 u; HOPF 1, 1; HOPF-D 0 with A4 7/12 (null 1/4) inside the frame and 7/27 outside. Measured singlet
//    slot weights: the uniform row to 1e-6. V singlet (240 moving points, 2 a momentum, 0.499922 c): A2 and A4 below 1e-6
//    in every reading. V frame (8,192 points): support spread shadow 1.765 to 1.785 (box tops 0.707 on the axes, 0.4999
//    on e13 and e23), HOPF 2.254, HOPF-D 1.546 to 1.575; A2 shadow 2e-5 to 1e-4 but HOPF 0.346; A4 shadow 0.199 to 0.213,
//    HOPF 0.349, HOPF-D 0.080 to 0.240. Waves: shadow 1/2, 1/4, 1/4, 1/6; HOPF 2/3, 1/3, 0, 1/3; HOPF-D 1/4, 1/2, 1/12,
//    1/6, exactly.
//  - H4 FAILS: shadow, HOPF and HOPF-D each read the singlet isotropic, the frame and the waves anisotropic. The measured
//    kinematics cannot choose the reading.
//  - Reported. V dock (E-SPN-0140's D4 point, 12,288 points): shadow A2 at most 7.6e-4, A4 at most 4.0e-4 (the W(F4)
//    covariance, up to sampling), spread 1.355 to 1.364; HOPF A2 1.7e-4 but A4 0.080, spread 1.311: the quadratic map
//    reads a W(F4)-invariant velocity distribution anisotropic at fourth order (its fourth moments are degree-8
//    polynomials, and W(F4) has a degree-8 invariant). D frame at beat 8 over the 8 starts: shadow A2 0, A4 0.233,
//    spread 2; HOPF A2 0.388, A4 0.307, spread 2.83; HOPF-D spread sqrt 3. E-SPN-0157's frozen classes on the corners:
//    axis -i x4, +-j x2, +-k x2; face +i x2, -i x4; body +i, -j, +k x2 each; (2,1,0) -i x4.
//  WHAT IT MEANS. The husk reading on the true mesh is the shadow G_u, linear and odd, and the box's husk is one of its
//  24 cases. The Hopf map agrees with it on exactly one thing: which frame a line belongs to, and on the true mesh that
//  frame -> axis correspondence is even global (one map at all 63 docks). It disagrees on signs (0 of 63 docks), on parity
//  (H is even, so it cannot read a velocity), and at the root level, where it collapses the 24 roots (a 4d 5-design)
//  onto 6 corners and so can never read anything isotropic at fourth order (floor 7/12). No earlier verdict changes:
//  every reading keeps the singlet isotropic and the frame mixer and the line waves anisotropic; the Hopf reading makes
//  the frame mixer MORE anisotropic (one axis at the root level), never less. The motion problem stands as E-SPN-0156 and
//  E-SPN-0157 left it: a mover must spread over all 24 roots (the singlet does), and on the true husk it must do so
//  collectively, since a lone line's shadow is bounded.
//
// Depth L1 (H1: the Hopf fibration of 2T, a known fact; H2: the cusp geometry of the 24-cell) and L2 (H3: the rule's own
// dock matrices read through each map). DETERMINISM: no random numbers; the momenta are Weyl sequences and 2I's units,
// the control permutation a Weyl shuffle. NOTHING MOVES: a reading maps each root a slot hands along to a 3d direction.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { ROOTS } from '@/code/measure/swap-sector'
import {
  binaryIcosahedral,
  rootToDoubled,
  qmul,
} from '@/code/measure/hurwitz-gauge'
import {
  rootReflection,
  composePermutations,
} from '@/code/measure/hyperbolic-lines'
import {
  bandSlots,
  dockMatrix,
  rootTablesAgree,
  DOCK_ROOTS,
} from '@/code/measure/dock-mixer'
import {
  eNorm,
  exactWalk,
  frameMatrix,
  frameRoots,
  matrixGap,
  ruleFrameMatrix,
} from '@/code/measure/frame-cone'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import { rootIndex } from '@/code/measure/crossing-lines'
import { lineFrame } from '@/code/measure/frame-meson'
import {
  FRAME_OF_SLOT,
  FRAME_SLOTS,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { rootsD4 as labelRoots } from '@/code/algebra/group/root-system'
import { labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { weylPermutation } from '@/code/tool/weyl'
import {
  CORNER_NAMES,
  CORNERS,
  doubledDifferential,
  doubledHopf,
  dualUnits,
  frozenShare,
  hopfCorner,
  hopfDifferentialReading,
  hopfReading,
  isDualUnit,
  layerShadows,
  readingMoments,
  rotationOfDoubled,
  shadowReading,
  supportSpread,
  SUPPORT_DIRECTIONS,
  WAVE_DIRECTIONS,
  type Point3,
  type Reading,
} from '@/code/measure/hopf-reading'

export type HopfPlan = {
  skin: number
  frameMomenta: number
  dockMomenta: number
  walkBeats: number
  kappa: number
}

export const GATE_PLAN: HopfPlan = {
  skin: 3,
  frameMomenta: 1024,
  dockMomenta: 512,
  walkBeats: 8,
  kappa: 0.05,
}

const EXACT = 1e-12
const MEASURED_SINGLET = 0.02
const ISO = 1e-3
const SPREAD = 1.05
const ANISO = 0.05
const GRAM = 1e-6
const C = Math.SQRT2
const WORKING = (2 * Math.PI) / 3
const SWAP_N = 2 / 3
const FRAME_N = 64
const DOCK_N = 4096
const TETRA = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
]

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)
const key = (q: readonly number[]): string => q.join(',')
const matMul3 = (a: number[][], b: number[][]): number[][] =>
  [0, 1, 2].map(r =>
    [0, 1, 2].map(c =>
      [0, 1, 2].reduce((s, k) => s + a[r]![k]! * b[k]![c]!, 0),
    ),
  )
const det3 = (m: number[][]): number =>
  m[0]![0]! * (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!) -
  m[0]![1]! * (m[1]![0]! * m[2]![2]! - m[1]![2]! * m[2]![0]!) +
  m[0]![2]! * (m[1]![0]! * m[2]![1]! - m[1]![1]! * m[2]![0]!)
const isIdentity3 = (m: number[][]): boolean =>
  m.every((row, r) => row.every((x, c) => x === (r === c ? 1 : 0)))

// frames = axes for a labelling of the slots by roots: how many of the three axes pull back to exactly one frame
function framesAreAxes(labelled: readonly (readonly number[])[]): {
  axes: number
  corners: boolean
} {
  const corner = labelled.map(r => hopfCorner(r))
  const frames = FRAME_SLOTS.map(ss =>
    [...ss].sort((a, b) => a - b).join(','),
  )

  let axes = 0

  for (let a = 0; a < 3; a++) {
    const pre = corner
      .map((c, d) => (c >= 0 && Math.floor(c / 2) === a ? d : -1))
      .filter(d => d >= 0)

    if (pre.length === 8 && frames.includes(pre.join(','))) {
      axes++
    }
  }

  return { axes, corners: corner.every(c => c >= 0) }
}

type ReadStats = {
  name: string
  family: Reading['family']
  A2: number
  A4: number
  nullShare: number
  spread: number
  top: number[]
}

function readAll(
  readings: readonly Reading[],
  data: readonly { w: number; x: readonly number[] }[],
  withSupport: boolean,
): ReadStats[] {
  return readings.map(r => {
    const pts: Point3[] = data.map(p => ({ w: p.w, x: r.read(p.x) }))
    const m = readingMoments(pts)
    const s = withSupport
      ? supportSpread(pts, SUPPORT_DIRECTIONS)
      : { top: [], spread: Number.NaN }

    return {
      name: r.name,
      family: r.family,
      A2: m.A2,
      A4: m.A4,
      nullShare: m.nullShare,
      spread: s.spread,
      top: s.top,
    }
  })
}

const range = (xs: readonly number[]): string =>
  `${Math.min(...xs).toFixed(6)}..${Math.max(...xs).toFixed(6)}`

export default experiment({
  id: 'spin/hopf-husk-reading',
  code: 'E-SPN-0158',
  title:
    'the Hopf map is not the husk reading of a 4d motion, fail (H2, H4): exactly, the 24 roots land on the 6 octahedron corners in circles {q, qi, -q, -qi}, the three frames are the preimages of the three axes (the Q8 cosets, kept by all 192 W(D4) relabelings and broken by a Weyl relabeling) and the 12 lines are the 12 rotations of T; on the true mesh the husk shadow at each of 63 cusp-layer docks is the projection along its cusp (a unit of D4*, Gram to 2e-13), whose 9 shadow axes refine the 3 Hopf axes at 63 of 63 docks with one frame-to-axis map for all, but signed corner and directed shadow agree at 0 of 63 (the Hopf map is even, the shadow odd); the Hopf map reads every root distribution with fourth-order anisotropy at least 7/12 (the uniform 24, a 4d 5-design, reads 0 in every linear reading), and a W(F4)-covariant band 0.080; yet every reading keeps the singlet isotropic (A4 below 1e-6) and the frame mixer (spread 1.55 to 2.25) and the line waves (frozen shares 1/2, 1/4, 1/4, 1/6 in the shadow, 2/3, 1/3, 0, 1/3 in Hopf) anisotropic, so the measured cases cannot choose and no earlier verdict changes',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return hopfReadingRun(GATE_PLAN)
  },
})

export function hopfReadingRun(plan: HopfPlan) {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const f6 = (x: number): string => x.toFixed(6)
  const LR = labelRoots()

  // ---------------- H1: the algebra, exact ----------------
  const doubled = ROOTS.map(r => rootToDoubled(r))
  const corner = ROOTS.map(r => hopfCorner(r))
  const perCorner = CORNERS.map((_, c) =>
    corner.map((x, d) => (x === c ? d : -1)).filter(d => d >= 0),
  )
  const circles = perCorner.every(ds => {
    if (ds.length !== 4) {
      return false
    }

    const Q = doubled[ds[0]!]!
    const Qi = qmul(Q, [0, 1, 0, 0])
    const want = new Set(
      [Q, Qi, Q.map(x => -x), Qi.map(x => -x)].map(key),
    )

    return ds.every(d => want.has(key(doubled[d]!))) && want.size === 4
  })
  const fa = framesAreAxes(ROOTS)
  const q8 = ROOTS.map((_, d) => d).filter(
    d => doubled[d]!.filter(x => x !== 0).length === 1,
  )
  const index = new Map(doubled.map((q, d) => [key(q), d]))
  const cosets = new Set(
    ROOTS.map((_, d) =>
      q8
        .map(
          e =>
            index.get(
              key(qmul(doubled[d]!, doubled[e]!).map(x => x / 2)),
            )!,
        )
        .sort((a, b) => a - b)
        .join(','),
    ),
  )
  const frameKeys = FRAME_SLOTS.map(ss =>
    [...ss].sort((a, b) => a - b).join(','),
  )
  const cosetsAreFrames =
    cosets.size === 3 && [...cosets].every(c => frameKeys.includes(c))
  // lines = T
  const rot = LINE_FIRSTS.map(f => rotationOfDoubled(doubled[f]!))
  const rotKeys = new Set(rot.map(r => key(r.R.flat())))

  let homomorphism = true

  for (const f of LINE_FIRSTS) {
    for (const g of LINE_FIRSTS) {
      const P = qmul(doubled[f]!, doubled[g]!).map(x => x / 2)
      const lhs = rotationOfDoubled(P).R
      const rhs = matMul3(
        rotationOfDoubled(doubled[f]!).R,
        rotationOfDoubled(doubled[g]!).R,
      )

      if (key(lhs.flat()) !== key(rhs.flat())) {
        homomorphism = false
      }
    }
  }

  const orders = rot.map(r => {
    let m = r.R

    for (let n = 1; n <= 6; n++) {
      if (isIdentity3(m)) {
        return n
      }

      m = matMul3(m, r.R)
    }

    return -1
  })
  const census = [1, 2, 3].map(o => orders.filter(x => x === o).length)
  const tetraSet = new Set(TETRA.map(key))
  const keepsTetra = rot.every(r =>
    TETRA.every(v =>
      tetraSet.has(key([0, 1, 2].map(i => dot(r.R[i]!, v)))),
    ),
  )
  const cornerIsColumn = LINE_FIRSTS.every((f, l) =>
    [0, 1, 2].every(
      i =>
        (rot[l] as { R: number[][] }).R[i]![0] ===
        (CORNERS[corner[f]!] as number[])[i],
    ),
  )
  const linesAreT =
    rot.every(r => r.exact && det3(r.R) === 1) &&
    rotKeys.size === 12 &&
    homomorphism &&
    census.join(',') === '1,3,8' &&
    keepsTetra &&
    cornerIsColumn

  // the differential
  let diffIntegral = true
  let diffRadial = true
  let diffFiber = true
  let diffNorm = true

  for (let q = 0; q < 24; q++) {
    const Q = doubled[q]!
    const QI = qmul(Q, [0, 1, 0, 0])
    const fiber = index.get(key(QI))!

    for (let y = 0; y < 24; y++) {
      const Y = doubled[y]!
      const N = doubledDifferential(Q, Y)

      if (N.real !== 0 || N.imag.some(x => x % 4 !== 0)) {
        diffIntegral = false
      }

      const dh = N.imag.map(x => x / 4)

      if (
        y === q &&
        key(dh) !== key(doubledHopf(Q).imag.map(x => x / 2))
      ) {
        diffRadial = false
      }

      const zero = dh.every(x => x === 0)
      const onFiber = y === fiber || y === OPPOSITE[fiber]

      if (zero !== onFiber) {
        diffFiber = false
      }

      // |dh|^2 = |Y|^2 - (Y . QI)^2 / 4 (the doubled form of 4 (|y|^2 / 2 - <M y, q i>^2))
      if (4 * dot(dh, dh) !== 4 * dot(Y, Y) - dot(Y, QI) ** 2) {
        diffNorm = false
      }
    }
  }

  // W(D4): every relabeling by the group generated by the root reflections keeps frames = axes
  const group = new Map<string, Int32Array>([
    [
      key(Array.from({ length: 24 }, (_, d) => d)),
      Int32Array.from({ length: 24 }, (_, d) => d),
    ],
  ])
  const gens = Array.from({ length: 24 }, (_, k) => rootReflection(k))

  for (const g of group.values()) {
    for (const h of gens) {
      const p = composePermutations(h, g)
      const k = key(Array.from(p))

      if (!group.has(k)) {
        group.set(k, p)
      }
    }

    if (group.size > 2000) {
      break
    }
  }

  const wd4Keeps = [...group.values()].filter(
    p => framesAreAxes(Array.from(p, d => LR[d]!)).axes === 3,
  ).length
  const H1 =
    corner.every(c => c >= 0) &&
    perCorner.every(ds => ds.length === 4) &&
    circles &&
    fa.axes === 3 &&
    cosetsAreFrames &&
    linesAreT &&
    diffIntegral &&
    diffRadial &&
    diffFiber &&
    diffNorm &&
    group.size === 192 &&
    wd4Keeps === 192

  log(
    `H1 ${H1}: corners ${perCorner.map(ds => ds.length).join(',')}, circles ${circles}, frames=axes ${fa.axes}/3, cosets ${cosetsAreFrames}, T ${linesAreT} (orders ${census.join(',')}, homomorphism ${homomorphism}, tetra ${keepsTetra}, column ${cornerIsColumn}), differential ${diffIntegral}/${diffRadial}/${diffFiber}/${diffNorm}, W(D4) ${group.size} keeps ${wd4Keeps}`,
  )

  // C1: a Weyl relabeling breaks it
  const perm = weylPermutation({ size: 24, start: 1 })
  const scrambled = perm.map(d => ROOTS[d] as number[])
  const c1Read = framesAreAxes(scrambled)
  const c1Lines = LINE_FIRSTS.filter(
    f =>
      key(scrambled[f]!.map(x => -x)) === key(scrambled[OPPOSITE[f]!]!),
  ).length
  const C1 = c1Read.axes < 3

  log(
    `C1 ${C1}: scrambled frames=axes ${c1Read.axes}/3, lines kept antipodal ${c1Lines}/12`,
  )

  // ---------------- H2: the true mesh ----------------
  const coin = labelledCoin()
  const layer = layerShadows(coin, plan.skin)

  let cuspsDual = 0
  let rootErr = 0
  let tiltAgree = 0
  let gramWorst = 0
  let refineDocks = 0
  let agreeDocks = 0
  let axesNine = 0
  let signedCollisions = 0

  const mapKeys = new Set<string>()
  const directed: number[][] = []
  const globalFrameOfAxis = new Map<string, Set<number>>()
  const globalCornerOfDir = new Map<string, Set<number>>()
  const cuspTypes = new Map<string, number>()
  const dirKey = (v: readonly number[]): string =>
    v.map(x => (Math.abs(x) < 1e-9 ? 0 : x).toFixed(6)).join(',')

  const axisKey = (v: readonly number[]): string => {
    const lead = v.findIndex(x => Math.abs(x) > 1e-9)

    return dirKey(v[lead]! < 0 ? v.map(x => -x) : v)
  }

  for (const dock of layer.docks) {
    const u = dock.cusp

    if (isDualUnit(u)) {
      cuspsDual++
    }

    cuspTypes.set(
      u.filter(x => Math.abs(x) > 1e-9).length === 1 ? 'e_i' : 'half',
      (cuspTypes.get(
        u.filter(x => Math.abs(x) > 1e-9).length === 1 ? 'e_i' : 'half',
      ) ?? 0) + 1,
    )
    rootErr = Math.max(rootErr, dock.rootError)

    const g = dock.lines.map(l => {
      const r = LR[l.slot]!
      const s = r.map((x, k) => x - dot(r, u) * u[k]!)
      const n = Math.hypot(...s)

      return s.map(x => x / n)
    })

    dock.lines.forEach((l, i) => {
      const tilted = Math.abs(dot(LR[l.slot]!, u)) > 1e-9

      if (tilted === (l.onLayer === 2)) {
        tiltAgree++
      }

      dock.lines.forEach(
        (m, j) =>
          (gramWorst = Math.max(
            gramWorst,
            Math.abs(dot(l.direction, m.direction) - dot(g[i]!, g[j]!)),
          )),
      )
    })

    // undirected axes and frames
    const axes: number[][] = []
    const axisOf = dock.lines.map(l => {
      let a = axes.findIndex(
        b => Math.abs(Math.abs(dot(b, l.direction)) - 1) < 1e-9,
      )

      if (a < 0) {
        axes.push(l.direction)
        a = axes.length - 1
      }

      return a
    })
    const frameOf = dock.lines.map(l => FRAME_OF_SLOT[l.slot]!)
    const axisFrame = axes.map(
      (_, a) => new Set(frameOf.filter((_, i) => axisOf[i] === a)),
    )

    let frameShape = true

    const frameAxis: number[] = []

    for (let F = 0; F < 3; F++) {
      const mine = dock.lines
        .map((l, i) => ({ l, i }))
        .filter(({ i }) => frameOf[i] === F)
      const tilted = mine.filter(({ l }) => l.onLayer === 2)
      const flat = mine.filter(({ l }) => l.onLayer !== 2)

      if (
        tilted.length !== 2 ||
        flat.length !== 2 ||
        axisOf[tilted[0]!.i] !== axisOf[tilted[1]!.i]
      ) {
        frameShape = false
        frameAxis.push(-1)
        continue
      }

      const a = tilted[0]!.l.direction
      const b = flat[0]!.l.direction
      const c = flat[1]!.l.direction

      if (
        !(
          Math.abs(dot(a, b)) < 1e-9 &&
          Math.abs(dot(a, c)) < 1e-9 &&
          Math.abs(dot(b, c)) < 1e-9
        )
      ) {
        frameShape = false
      }

      frameAxis.push(
        a.reduce(
          (m, x, k) => (Math.abs(x) > Math.abs(a[m]!) ? k : m),
          0,
        ),
      )
    }

    if (axes.length === 9) {
      axesNine++
    }

    if (
      axes.length === 9 &&
      axisFrame.every(s => s.size === 1) &&
      frameShape
    ) {
      refineDocks++
    }

    mapKeys.add(frameAxis.join(','))

    // signed: over the 24 slots, directed shadow <-> corner
    const slots = dock.lines.flatMap(l => [
      { d: l.slot, dir: l.direction },
      { d: OPPOSITE[l.slot]!, dir: l.direction.map(x => -x) },
    ])
    const cornersOfDir = new Map<string, Set<number>>()
    const dirsOfCorner = new Map<number, Set<string>>()

    for (const s of slots) {
      const c = hopfCorner(LR[s.d]!)
      const k = dirKey(s.dir)

      if (!cornersOfDir.has(k)) {
        cornersOfDir.set(k, new Set())
      }

      cornersOfDir.get(k)!.add(c)

      if (!dirsOfCorner.has(c)) {
        dirsOfCorner.set(c, new Set())
      }

      dirsOfCorner.get(c)!.add(k)

      if (!globalCornerOfDir.has(k)) {
        globalCornerOfDir.set(k, new Set())
      }

      globalCornerOfDir.get(k)!.add(c)

      if (!directed.some(v => dirKey(v) === k)) {
        directed.push(s.dir)
      }
    }

    dock.lines.forEach((l, i) => {
      const k = axisKey(l.direction)

      if (!globalFrameOfAxis.has(k)) {
        globalFrameOfAxis.set(k, new Set())
      }

      globalFrameOfAxis.get(k)!.add(frameOf[i]!)
    })

    const collisions = [...cornersOfDir.values()].filter(
      s => s.size > 1,
    ).length

    signedCollisions += collisions

    if (
      collisions === 0 &&
      [...dirsOfCorner.values()].every(s => s.size === 1)
    ) {
      agreeDocks++
    }
  }

  const nDocks = layer.docks.length
  const nLines = nDocks * 12
  const H2 = agreeDocks === nDocks
  const H2r = refineDocks === nDocks
  const globalFrameFunction = [...globalFrameOfAxis.values()].every(
    s => s.size === 1,
  )
  const globalCornerFunction = [...globalCornerOfDir.values()].every(
    s => s.size === 1,
  )
  const I2 =
    cuspsDual === nDocks &&
    rootErr < 1e-9 &&
    tiltAgree === nLines &&
    gramWorst <= GRAM &&
    directed.length === 18 &&
    layer.axesError < 1e-9

  log(
    `H2 ${H2} (agree ${agreeDocks}/${nDocks}, signed collisions ${signedCollisions}); H2r ${H2r} (${refineDocks}/${nDocks}, 9 axes at ${axesNine}); H2g maps ${mapKeys.size} [${[...mapKeys].join(' | ')}], frame of chart axis global ${globalFrameFunction} (${globalFrameOfAxis.size} axes), corner of chart direction global ${globalCornerFunction}; I2 ${I2}: cusps dual ${cuspsDual}, types ${JSON.stringify([...cuspTypes])}, root error ${rootErr.toExponential(2)}, tilt ${tiltAgree}/${nLines}, Gram ${gramWorst.toExponential(2)}, directed ${directed.length}`,
  )

  // ---------------- H3: the readings ----------------
  const shadows = dualUnits().map(u =>
    shadowReading(u, `shadow ${u.join(' ')}`),
  )
  const box = shadowReading([0, 0, 0, 1], 'box')
  const hopf = hopfReading()
  const hopfD = Array.from({ length: 24 }, (_, q) =>
    hopfDifferentialReading(q),
  )
  const all: Reading[] = [...shadows, hopf, ...hopfD]
  const axesOk = [...shadows, box].every(r => r.axesOk)
  const B = rootIndex([1, 1, 0, 0])
  const F = lineFrame(B)
  const frameSet = new Set(FRAME_SLOTS[F])
  const uniform24 = ROOTS.map(r => ({ w: 1, x: r }))
  const uniformFrame = [...frameSet].map(d => ({
    w: 1,
    x: ROOTS[d] as number[],
  }))
  const r24 = readAll(all, uniform24, false)
  const rFrame = readAll(all, uniformFrame, false)
  const qInFrame = (name: string): boolean =>
    frameSet.has(Number(name.split(' ')[1]))
  const near = (x: number, y: number, tol = EXACT): boolean =>
    Math.abs(x - y) <= tol
  const exact24 = r24.every(s =>
    s.family === 'hopf'
      ? near(s.A2, 0) && near(s.A4, 7 / 12)
      : near(s.A2, 0) &&
        near(s.A4, 0) &&
        near(s.nullShare, s.family === 'shadow' ? 0 : 1 / 12),
  )
  const exactFrame = rFrame.every(s => {
    if (s.family === 'hopf') {
      return near(s.A2, 1) && near(s.A4, 1)
    }

    if (s.family === 'shadow') {
      return near(s.A2, 0) && near(s.A4, 3 / 5)
    }

    return qInFrame(s.name)
      ? near(s.A2, 0) && near(s.A4, 7 / 12) && near(s.nullShare, 1 / 4)
      : near(s.A2, 0) && near(s.A4, 7 / 27) && near(s.nullShare, 0)
  })
  const wavePredicted: Record<Reading['family'], number[]> = {
    shadow: [1 / 2, 1 / 4, 1 / 4, 1 / 6],
    hopf: [2 / 3, 1 / 3, 0, 1 / 3],
    'hopf-differential': [1 / 4, 1 / 2, 1 / 12, 1 / 6],
  }
  const waves = [...all, box].map(r => {
    const pts = uniform24.map(p => ({ w: 1, x: r.read(p.x) }))

    return {
      name: r.name,
      family: r.family,
      frozen: WAVE_DIRECTIONS.map(d => frozenShare(pts, d.n)),
    }
  })
  const exactWave = waves.every(w =>
    w.frozen.every((x, i) => near(x, wavePredicted[w.family][i]!)),
  )

  log(
    `H3 exact: uniform 24 ${exact24}, uniform frame ${exactFrame}, waves ${exactWave}`,
  )

  // V singlet: the massless swap pair
  const Ps = dockMatrix(Math.PI, SWAP_N, true)
  const dirs2I = binaryIcosahedral().quat!
  const singletV: { w: number; x: number[] }[] = []
  const singletSlots = new Float64Array(24)
  const movingCounts = new Set<number>()

  let singletTop = 0
  let singletLow = Infinity

  for (const n of dirs2I) {
    const b = bandSlots(
      Ps,
      DOCK_ROOTS,
      n.map(x => x * plan.kappa),
    )

    let moving = 0

    b.velocity.forEach((v, i) => {
      const s = Math.hypot(...v)

      if (s <= 1e-6) {
        return
      }

      moving++
      singletTop = Math.max(singletTop, s / C)
      singletLow = Math.min(singletLow, s / C)
      singletV.push({ w: 1, x: v })

      const w = b.weight[i]!
      const tot = w.reduce((a, x) => a + x, 0)

      w.forEach((x, q) => (singletSlots[q]! += x / tot))
    })
    movingCounts.add(moving)
  }

  const singletR = readAll(
    all,
    ROOTS.map((r, q) => ({ w: singletSlots[q]!, x: r })),
    false,
  )
  const singletVS = readAll(all, singletV, false)
  const measuredSinglet = singletR.every(
    (s, i) =>
      Math.abs(s.A2 - r24[i]!.A2) <= MEASURED_SINGLET &&
      Math.abs(s.A4 - r24[i]!.A4) <= MEASURED_SINGLET,
  )
  const singletIso = singletVS.every(s => s.A2 <= ISO && s.A4 <= ISO)

  log(
    `V singlet: ${singletV.length} moving band points, moving per K ${[...movingCounts].join(',')}, speed ${f6(singletLow)}..${f6(singletTop)} c; iso ${singletIso}; measured R ${measuredSinglet}`,
  )

  // V frame: E-SPN-0136's F2 point
  const Pf = frameMatrix(WORKING, FRAME_N, true)
  const fRoots = frameRoots(F)
  const frameV: { w: number; x: number[] }[] = []

  for (const K of weylMomenta(plan.frameMomenta)) {
    for (const v of bandSlots(Pf, fRoots, K).velocity) {
      frameV.push({ w: 1, x: v })
    }
  }

  const frameVS = readAll([...all, box], frameV, true)
  const frameAniso = frameVS.every(s => s.spread >= SPREAD)
  const boxFrame = frameVS[frameVS.length - 1]!
  const boxE13 = boxFrame.top[4]! / C
  const boxE1 = boxFrame.top[0]! / C

  log(
    `V frame: ${frameV.length} points, aniso ${frameAniso}; box top ${boxFrame.top.map(x => f6(x / C)).join(' ')}`,
  )

  const H3 =
    exact24 &&
    exactFrame &&
    exactWave &&
    measuredSinglet &&
    singletIso &&
    frameAniso

  // ---------------- H4 ----------------
  const agrees = (family: Reading['family']): boolean =>
    singletVS
      .filter(s => s.family === family)
      .every(s => s.A2 <= ISO && s.A4 <= ISO) &&
    frameVS
      .filter(s => s.family === family)
      .every(s => s.spread >= SPREAD || s.A4 >= ANISO) &&
    waves
      .filter(w => w.family === family)
      .every(
        w => Math.max(...w.frozen) - Math.min(...w.frozen) >= ANISO,
      )
  const agreeShadow = agrees('shadow')
  const agreeHopf = agrees('hopf')
  const agreeHopfD = agrees('hopf-differential')
  const H4 = agreeShadow !== agreeHopf

  log(
    `H4 ${H4}: shadow ${agreeShadow}, hopf ${agreeHopf}, hopf-d ${agreeHopfD}`,
  )

  // ---------------- reported: dock mixer V, frame displacement D, the wave's frozen corners ----------------
  const Pd = dockMatrix(WORKING, DOCK_N, true)
  const dockV: { w: number; x: number[] }[] = []

  for (const K of weylMomenta(plan.dockMomenta)) {
    for (const v of bandSlots(Pd, DOCK_ROOTS, K).velocity) {
      dockV.push({ w: 1, x: v })
    }
  }

  const dockVS = readAll([...all, box], dockV, true)

  log('V dock')

  const Pr = ruleFrameMatrix(F, true)
  const ruleGap = matrixGap(Pr, frameMatrix(WORKING, 1, true))
  const disp = new Map<string, { v: number[]; w: number }>()

  let normsExact = true

  for (let s0 = 0; s0 < 8; s0++) {
    exactWalk(Pr, fRoots, s0, plan.walkBeats, (t, sites) => {
      if (t !== plan.walkBeats) {
        return
      }

      let total = 0n

      const unit = 256n ** BigInt(t)

      for (const s of sites.values()) {
        let w = 0n

        for (const a of s.amp) {
          w += eNorm(a)
        }

        total += w

        const k = s.v.join(',')
        const o = disp.get(k) ?? { v: s.v, w: 0 }

        o.w += Number(w) / Number(unit) / 8
        disp.set(k, o)
      }

      if (total !== unit) {
        normsExact = false
      }
    })
  }

  const dispData = [...disp.values()].map(d => ({ w: d.w, x: d.v }))
  const dispS = readAll([...all, box], dispData, true)

  log('D frame')

  const frozenCorners = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [2, 1, 0, 0],
  ].map(m => {
    const hist = CORNER_NAMES.map(() => 0)

    ROOTS.forEach(r => {
      if (dot(r, m) === 0) {
        hist[hopfCorner(r)]!++
      }
    })

    return `${m.join('')}: ${CORNER_NAMES.map((n, i) =>
      hist[i] ? `${n} x${hist[i]}` : '',
    )
      .filter(Boolean)
      .join(' ')}`
  })

  // ---------------- instrument and verdict ----------------
  const I1 =
    rootTablesAgree() &&
    ROOTS.every((r, d) => key(r) === key(LR[d]!)) &&
    ruleGap <= EXACT &&
    axesOk &&
    normsExact
  const Isinglet =
    movingCounts.size === 1 &&
    movingCounts.has(2) &&
    singletTop <= 0.5 * (1 + 1e-9) &&
    singletLow >= 0.49
  const Ibox =
    boxE13 >= 0.45 &&
    boxE13 <= 0.5 + 1e-9 &&
    boxE1 >= 0.65 &&
    boxE1 <= 0.7072
  const instrument = I1 && I2 && Isinglet && Ibox
  const status =
    !instrument || !C1
      ? 'partial'
      : H1 && H2 && H3 && H4
        ? 'pass'
        : 'fail'
  const fam = (
    xs: readonly ReadStats[],
    family: Reading['family'],
    f: (s: ReadStats) => number,
  ): string => range(xs.filter(s => s.family === family).map(f))
  const famLine = (
    label: string,
    xs: readonly ReadStats[],
    support: boolean,
  ): string =>
    `${label}: shadow A2 ${fam(xs, 'shadow', s => s.A2)} A4 ${fam(xs, 'shadow', s => s.A4)}${support ? ` spread ${fam(xs, 'shadow', s => s.spread)}` : ''}; hopf A2 ${fam(xs, 'hopf', s => s.A2)} A4 ${fam(xs, 'hopf', s => s.A4)}${support ? ` spread ${fam(xs, 'hopf', s => s.spread)}` : ''}; hopf-d A2 ${fam(xs, 'hopf-differential', s => s.A2)} A4 ${fam(xs, 'hopf-differential', s => s.A4)} null ${fam(xs, 'hopf-differential', s => s.nullShare)}${support ? ` spread ${fam(xs, 'hopf-differential', s => s.spread)}` : ''}`

  const boxOf = (xs: readonly ReadStats[]): string => {
    const s = xs.find(x => x.name === 'box')!

    return `box A2 ${f6(s.A2)} A4 ${f6(s.A4)} spread ${f6(s.spread)}`
  }

  const hopfTop = (xs: readonly ReadStats[]): string =>
    xs
      .find(x => x.family === 'hopf')!
      .top.map(f6)
      .join(' ')
  const metrics: Record<string, number> = {
    H1: H1 ? 1 : 0,
    H2: H2 ? 1 : 0,
    H2r: H2r ? 1 : 0,
    H3: H3 ? 1 : 0,
    H4: H4 ? 1 : 0,
    C1: C1 ? 1 : 0,
    instrument: instrument ? 1 : 0,
    I1: I1 ? 1 : 0,
    I2: I2 ? 1 : 0,
    Isinglet: Isinglet ? 1 : 0,
    Ibox: Ibox ? 1 : 0,
    layerDocks: nDocks,
    agreeDocks,
    refineDocks,
    signedCollisions,
    frameAxisMaps: mapKeys.size,
    globalFrameFunction: globalFrameFunction ? 1 : 0,
    globalCornerFunction: globalCornerFunction ? 1 : 0,
    directedDirections: directed.length,
    gramWorst,
    c1Axes: c1Read.axes,
    c1Lines,
    wd4Keeps,
    agreeShadow: agreeShadow ? 1 : 0,
    agreeHopf: agreeHopf ? 1 : 0,
    agreeHopfD: agreeHopfD ? 1 : 0,
    singletTop,
    boxE13,
    boxE1,
    seconds: (Date.now() - started) / 1000,
  }

  return verdict({
    status,
    claim: `H1 ${H1} (24 roots on the 6 corners 4 each in circles {q, qi, -q, -qi}; frames = axes ${fa.axes}/3 = the Q8 cosets; lines = the 12 rotations of T; the differential kills exactly the fiber line; W(D4) keeps it on ${wd4Keeps}/${group.size}; a Weyl relabeling breaks it, ${c1Read.axes}/3); H2 ${H2} (signed corner and directed shadow agree at ${agreeDocks} of ${nDocks} layer docks, ${signedCollisions} directed shadows carry two corners); H2r ${H2r} (the 9 shadow axes refine the 3 Hopf axes at ${refineDocks} of ${nDocks} docks); H2g ${mapKeys.size} frame-to-axis maps over the docks, frame a function of the chart axis globally ${globalFrameFunction}; H3 ${H3} (exact rows ${exact24}/${exactFrame}/${exactWave}, measured singlet ${measuredSinglet}, V singlet isotropic ${singletIso}, V frame anisotropic ${frameAniso}); H4 ${H4} (agree with every measured case: shadow ${agreeShadow}, hopf ${agreeHopf}, hopf-d ${agreeHopfD}); C1 ${C1}; instrument ${instrument}`,
    metrics,
    control: { C1: C1 ? 1 : 0, instrument: instrument ? 1 : 0 },
    notes: `L1 and L2. Cusp types over the layer docks ${JSON.stringify([...cuspTypes])}; frame -> chart axis maps ${[...mapKeys].join(' | ')}. ${famLine('R uniform 24', r24, false)}. ${famLine('R uniform frame', rFrame, false)}. ${famLine('R measured singlet', singletR, false)}. ${famLine('V singlet', singletVS, false)}. ${famLine('V frame', frameVS, true)}; ${boxOf(frameVS)}; box top ${boxFrame.top.map(x => f6(x / C)).join(' ')} c; hopf top ${hopfTop(frameVS)}. ${famLine('V dock (reported)', dockVS, true)}; ${boxOf(dockVS)}; hopf top ${hopfTop(dockVS)}. ${famLine(`D frame beat ${plan.walkBeats} (reported)`, dispS, true)}; ${boxOf(dispS)}. Waves (frozen share axis/face/body/generic): shadow ${waves
      .find(w => w.family === 'shadow')!
      .frozen.map(f6)
      .join('/')}, hopf ${waves
      .find(w => w.family === 'hopf')!
      .frozen.map(f6)
      .join('/')}, hopf-d ${waves
      .find(w => w.family === 'hopf-differential')!
      .frozen.map(f6)
      .join(
        '/',
      )}. Box-wave frozen classes on the Hopf corners: ${frozenCorners.join('; ')}. Rule frame matrix gap ${ruleGap.toExponential(2)}; singlet speed ${f6(singletLow)}..${f6(singletTop)} c. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
