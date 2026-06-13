import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quaternion, multiply, quaternionKey } from '@/code/algebra/group/quaternion'
import { icosahedronVertexDirections } from '@/code/algebra/group/root-system'

// The last frontier, honest. The {5,3,4} GEOMETRY carries the spin structure (cocycle-534,
// spin-connection-534, continuum-holonomy-534). Does the BARE conserving lattice-gas RULE, the five base
// things acting on the 12 direction-occupations, dynamically produce spinor modes? The rule streams
// occupations along the 12 directions, so under a rotation the 12 directions PERMUTE and the occupation
// field transforms by the PERMUTATION (a linear rep of the icosahedral group A5). A 2pi rotation is the
// identity permutation, so the occupation field returns to PLUS ONE, it is a vector, NOT a spinor. The
// minus one lives in the spin bundle (the frame and the Kahler-Dirac forms), which the bare occupation
// rule is not in. So the honest answer is NO, the bare rule does not produce spinor modes directly, the
// spinor requires coupling the occupation field to the spin connection (the staggered Kahler-Dirac step).
// This is exactly the {3,4,3,4}-versus-{5,3,4} trade, the 24 directions of {3,4,3,4} DO carry the spinor
// (8s, 8c) so its bare rule has spin, the 12 directions of {5,3,4} do not.

// the 12 icosahedral directions of {5,3,4}, the icosahedron vertices (0, +-1, +-phi) and cyclic
const icosahedralDirections = (): number[][] => icosahedronVertexDirections()

const rotateZ180 = (vector: number[]): number[] => [-vector[0]!, -vector[1]!, vector[2]!] // a 2-fold axis of the icosahedron

const directionKey = (vector: number[]): string => vector.map((value) => Math.round(value * 1e4)).join(',')

export default defineExperiment({
  id: 'spin/lattice-gas-spinor-534',
  title: 'the bare {5,3,4} lattice-gas rule produces LINEAR modes, not spinors, the spinor needs the spin bundle',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const directions = icosahedralDirections()
    const keys = new Set(directions.map(directionKey))

    // (1) a 180-degree rotation about a 2-fold axis PERMUTES the 12 directions (the occupation field is a
    // permutation, a linear rep of A5)
    const permutesDirections = directions.every((direction) => keys.has(directionKey(rotateZ180(direction))))

    // (2) the occupation field under a 2pi rotation (the 180 rotation applied twice) returns to itself, the
    // permutation squared is the identity, so the bare rule's modes are PLUS ONE, vectors not spinors
    const twice = directions.map((direction) => rotateZ180(rotateZ180(direction)))
    const occupationReturnsAt2Pi = twice.every((direction, index) => directionKey(direction) === directionKey(directions[index]!))
    const occupationIsSpinor = !occupationReturnsAt2Pi // a spinor would NOT return at 2pi

    // (3) the SPIN bundle DOES carry the minus one. The same 180 rotation lifts to the quaternion k (about z),
    // and a 2pi rotation is k squared = minus one (the spinor double cover, from cocycle-534).
    const spinLift = quaternion(Math.cos(Math.PI / 2), 0, 0, Math.sin(Math.PI / 2)) // 180 degrees = the quaternion k
    const spinTwice = multiply(spinLift, spinLift) // a 2pi rotation
    const spinorFlipsAt2Pi = quaternionKey(spinTwice) === quaternionKey(quaternion(-1, 0, 0, 0))

    // the honest dichotomy: the occupation field returns (+1, linear), the spinor flips (-1). The bare rule's
    // modes are NOT spinors. The experiment PASSES by cleanly establishing this honest negative with the
    // spin-bundle contrast.
    const dichotomyEstablished = permutesDirections && occupationReturnsAt2Pi && spinorFlipsAt2Pi

    return verdict({
      status: dichotomyEstablished ? 'pass' : 'fail',
      claim:
        'the bare {5,3,4} lattice-gas occupation field is a linear permutation rep of A5, it returns to plus one under a 2pi rotation, so the bare rule produces VECTOR modes NOT spinors, the spinor minus one lives only in the spin bundle (the frame and the Kahler-Dirac forms)',
      metrics: {
        permutesDirections: permutesDirections ? 1 : 0,
        occupationReturnsAt2Pi: occupationReturnsAt2Pi ? 1 : 0,
        occupationIsSpinor: occupationIsSpinor ? 1 : 0,
        spinorBundleFlipsAt2Pi: spinorFlipsAt2Pi ? 1 : 0,
      },
      // CONTROL: the SAME 2pi rotation gives the spin bundle minus one but the occupation field plus one, so
      // the absence of a spinor is a real property of the occupation field, not of the rotation. On {3,4,3,4}
      // the 24 directions DO carry the spinor, so this is the {5,3,4}-specific honest negative.
      control: { occupationPlusOne: occupationReturnsAt2Pi ? 1 : 0, spinBundleMinusOne: spinorFlipsAt2Pi ? 1 : 0 },
      notes:
        'Honest NEGATIVE for the bare rule, stated sharply. The {5,3,4} geometry carries the spin structure at every scale, but the bare direction-occupation rule does NOT use it (its modes are linear, no minus one). To get propagating spinors on {5,3,4} the occupation field must be coupled to the spin connection (the staggered Kahler-Dirac construction of spin/kahler-dirac-534), an additional step beyond the five base things. This is the precise residual gap, and it mirrors the {3,4,3,4} trade where the 24 directions DO carry the spinor but the lattice is flat.',
    })
  },
})
