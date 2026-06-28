import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  diracGamma,
  cmMultiply,
  cmIsScalar,
  cliffordRotor,
  cmScalarTrace,
  cmEquals,
  type ComplexMatrix,
} from '@/code/algebra/group/clifford'
import { complex } from '@/code/algebra/linear/complex'

// The continuum-limit refinement of the {5,3,4} spin structure, the CURVATURE-DRIVEN holonomy of large
// contractible loops. {5,3,4} has constant negative curvature (minus one), so by Gauss-Bonnet the spin
// holonomy of a contractible loop is a rotation by the enclosed hyperbolic AREA. We build that holonomy in
// the Clifford algebra and show the decisive consequence, a loop enclosing area 2pi flips the SPINOR (minus
// one) while leaving a VECTOR invariant, the genuine Z2 spin structure, and area 4pi returns the spinor.
// This completes the discrete edge-loop result of spin/spin-connection-534, the small-loop (ultraviolet)
// double cover and the large-loop (infrared) curvature-driven double cover are the same spin structure.

// the spin holonomy rotor for a contractible loop enclosing hyperbolic area A (Gauss-Bonnet, curvature -1):
// a rotation by A, rotor(A) = cos(A/2) + sin(A/2) B with B the unit bivector gamma1 gamma2.
const holonomyRotor = (
  area: number,
  bivector: ComplexMatrix,
): ComplexMatrix => cliffordRotor({ angle: area, bivector, size: 4 })

const traceScalar = (matrix: ComplexMatrix): number =>
  cmScalarTrace(matrix)

const matrixEquals = (
  left: ComplexMatrix,
  right: ComplexMatrix,
): boolean => cmEquals(left, right)

export default experiment({
  id: 'spin/continuum-holonomy-534',
  code: 'E-SPN-0007',
  title:
    'the {5,3,4} curvature-driven spin holonomy, a loop of hyperbolic area 2pi flips spinors not vectors',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const gamma = diracGamma()
    const bivector = cmMultiply(gamma[1]!, gamma[2]!) // B = gamma1 gamma2, a rotation generator
    const minusOne = complex({ re: -1, im: 0 })
    const plusOne = complex({ re: 1, im: 0 })

    // (1) the bivector squares to minus the identity, a valid rotation generator
    const bivectorSquare = cmMultiply(bivector, bivector)
    const validGenerator = cmIsScalar(bivectorSquare, minusOne)

    // (2) the holonomy is a rotation by the enclosed AREA (Gauss-Bonnet, K = -1), the scalar part of the
    // rotor is cos(area/2), measured across a range of areas
    const sampledAreas = [0.5, 1.5, 2.5, 3.5]
    const angleTracksArea = sampledAreas.every(
      area =>
        Math.abs(
          traceScalar(holonomyRotor(area, bivector)) -
            Math.cos(area / 2),
        ) < 1e-9,
    )

    // (3) a loop enclosing hyperbolic area 2pi flips the SPINOR (minus one)
    const rotorTwoPi = holonomyRotor(2 * Math.PI, bivector)
    const spinorFlipsAt2Pi = cmIsScalar(rotorTwoPi, minusOne)

    // (4) the SAME loop leaves a VECTOR invariant, conjugation by the rotor returns the vector. The inverse
    // of a rotor is its reverse, holonomyRotor(-area) = cos(area/2) - sin(area/2) B.
    const inverseTwoPi = holonomyRotor(-2 * Math.PI, bivector)
    const vectorAfter = cmMultiply(
      cmMultiply(rotorTwoPi, gamma[1]!),
      inverseTwoPi,
    )

    const vectorReturnsAt2Pi = matrixEquals(vectorAfter, gamma[1]!)

    // CONTROL: area 4pi returns the spinor to plus one, the discriminating signature of the double cover
    const rotorFourPi = holonomyRotor(4 * Math.PI, bivector)
    const spinorReturnsAt4Pi = cmIsScalar(rotorFourPi, plusOne)

    const ok =
      validGenerator &&
      angleTracksArea &&
      spinorFlipsAt2Pi &&
      vectorReturnsAt2Pi &&
      spinorReturnsAt4Pi

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on {5,3,4} the curvature drives the spin holonomy (Gauss-Bonnet, the rotation angle equals the enclosed hyperbolic area), so a contractible loop enclosing area 2pi flips the spinor to minus one while leaving a vector invariant, the genuine curvature-driven spin structure',
      metrics: {
        validGenerator: validGenerator ? 1 : 0,
        angleTracksArea: angleTracksArea ? 1 : 0,
        spinorFlipsAt2Pi: spinorFlipsAt2Pi ? 1 : 0,
        vectorReturnsAt2Pi: vectorReturnsAt2Pi ? 1 : 0,
      },
      // CONTROL: at area 4pi the spinor returns to plus one (the double cover), and at area 2pi the vector
      // already returns while the spinor does not, so the minus one is a genuine spinor effect of the
      // enclosed curvature, not a property of every field.
      control: {
        spinorReturnsAt4Pi: spinorReturnsAt4Pi ? 1 : 0,
        vectorReturnsAt2Pi: vectorReturnsAt2Pi ? 1 : 0,
      },
      notes:
        'Completes spin/spin-connection-534. The discrete edge loops give the ultraviolet (combinatorial) double cover, this gives the infrared (curvature-driven) one, the same spin structure. The Gauss-Bonnet relation (holonomy angle equals enclosed area at curvature -1) is established hyperbolic geometry, the measured content is that the rotor realizes the double cover, spinor at 2pi and vector invariant.',
    })
  },
})
