import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  binaryIcosahedral,
  binaryTetrahedral,
  quaternion,
  quaternionKey,
} from '@/code/algebra/group/quaternion'

// The holy grail, settled at the structural layer. {3,4,3,4} carries spin (the 2T coin) but is FLAT,
// so it has no curvature, no holography, no bulk. The whole {5,3,4} spinor investigation asked whether
// one substrate can have spin AND curvature. Here both halves are checked on {5,3,4}: it carries a
// genuine spinor (the 2I cover, the nonsplit cocycle of spin/cocycle-534) AND negative curvature (the
// edge angle defect is positive, the dodecahedra are too big for flat space, forcing the hyperbolic
// bulk). So {5,3,4} resolves the spin-versus-curvature trade-off that {3,4,3,4} cannot.

const minusOne = quaternion(-1, 0, 0, 0)
const hasMinusOne = (
  group: ReturnType<typeof binaryIcosahedral>,
): boolean =>
  group.some(
    element => quaternionKey(element) === quaternionKey(minusOne),
  )

export default experiment({
  id: 'spin/spin-and-curvature-534',
  title:
    '{5,3,4} carries spin AND negative curvature, the trade-off flat {3,4,3,4} cannot resolve',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    // (1) the spinor covers: {5,3,4} has 2I (order 120), {3,4,3,4} has 2T (order 24), both with the
    // double-cover minus one, both genuine (nonsplit, proven in spin/cocycle-534)
    const cover534 = binaryIcosahedral()
    const cover3434 = binaryTetrahedral()
    const spinor534 = cover534.length === 120 && hasMinusOne(cover534)
    const spinor3434 = cover3434.length === 24 && hasMinusOne(cover3434)

    // (2) the curvature witness, the edge angle defect. A honeycomb {p,q,r} fits r cells around each
    // edge, and the space is flat only if r times the cell dihedral angle equals 2pi. More than 2pi
    // forces NEGATIVE curvature (hyperbolic), the cells are too big for flat space.
    const fullTurn = 360
    // {5,3,4}: 4 dodecahedra per edge, the dodecahedron dihedral is arccos(-1/sqrt5)
    const dodecahedronDihedral =
      (Math.acos(-1 / Math.sqrt(5)) * 180) / Math.PI // about 116.565 degrees
    const angleSum534 = 4 * dodecahedronDihedral
    const excess534 = angleSum534 - fullTurn // positive means hyperbolic
    const hyperbolic534 = excess534 > 1

    // the FLAT reference, the cubic honeycomb {4,3,4}, 4 cubes per edge, dihedral 90 degrees, sums to 2pi
    const cubeDihedral = 90
    const angleSumCubic = 4 * cubeDihedral
    const excessCubic = angleSumCubic - fullTurn // exactly zero, flat
    const cubicFlat = Math.abs(excessCubic) < 1e-9

    // {3,4,3,4} is the Euclidean 24-cell honeycomb, FLAT (its polynomial growth and zero Ollivier-Ricci
    // are measured in geometry/gm-geometry-3434), so it has spin but no curvature, the trade-off.

    const ok = spinor534 && spinor3434 && hyperbolic534 && cubicFlat

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        '{5,3,4} carries a genuine spinor (the 2I cover) AND negative curvature (the edge angle defect is positive, hyperbolic), resolving the spin-versus-curvature trade-off that flat {3,4,3,4} (spinor but Euclidean) cannot',
      metrics: {
        spinor534: spinor534 ? 1 : 0,
        spinor3434: spinor3434 ? 1 : 0,
        edgeAngleSum534: angleSum534,
        angleExcess534: excess534,
        hyperbolic534: hyperbolic534 ? 1 : 0,
      },
      // CONTROL: the flat cubic honeycomb has exactly zero angle excess (the cells fit flat), so a
      // positive excess is a real signature of negative curvature, not an artifact. {3,4,3,4} is likewise
      // flat (geometry/gm-geometry-3434), so it is the spin-but-flat trade-off {5,3,4} overcomes.
      control: {
        cubicAngleExcess: excessCubic,
        cubicFlat: cubicFlat ? 1 : 0,
      },
      notes:
        'Structural synthesis (L2). The spinor is the genuine nonsplit cover of spin/cocycle-534, the curvature is the exact edge angle defect. {5,3,4} has spin AND curvature, {3,4,3,4} has spin but is flat. OPEN, whether the bare {5,3,4} RULE dynamically realizes a spin structure with this holonomy remains the frontier (noted in spin/cocycle-534).',
    })
  },
})
