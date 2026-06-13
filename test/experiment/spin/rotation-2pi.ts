import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  quaternion,
  multiply,
  equals,
  negate,
  binaryTetrahedral,
} from '@/code/algebra/group/quaternion'
import {
  rotateSpinorTimes,
  rotateVectorTimes,
} from '@/code/algebra/group/rotation'

// SP1, the decisive spin test. The 24 directions of the {3,4,3,4} coin are the
// binary tetrahedral group 2T, the double cover of the tetrahedral rotation group.
// A 180-degree rotation generator g (so g squared is -1) composed twice is a full
// 2pi rotation: the identity on a vector, but minus one on a spinor, and only 4pi
// returns the spinor. This spin-half double cover is exactly what the 12 directions
// of {5,3,4} cannot carry (they split 1 + 3 + 3' + 5, no spinor rep). One run gates
// the whole 24-cell substrate.
export default defineExperiment({
  id: 'spin/rotation-2pi',
  title: 'a spinor on the 24-cell coin gains a minus sign at 2pi, returning only at 4pi',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const coin = binaryTetrahedral()

    // A 180-degree rotation generator. The quaternion i is one of the 24 coin
    // directions, and left multiplication by it permutes the 24, so rotating by it
    // is a genuine symmetry of the coin, not an outside operation.
    const g = quaternion(0, 1, 0, 0)
    const inCoin = coin.some((direction) => equals(direction, g))
    const permutesCoin = coin.every((direction) =>
      coin.some((other) => equals(multiply(g, direction), other)),
    )

    // A second, independent generator: an order-6 element (a 120-degree vector
    // rotation), so three of them make 2pi. It traces the same 2pi loop a different
    // way, so the sign is not an artifact of one generator.
    const omega = quaternion(-0.5, 0.5, 0.5, 0.5) // a primitive cube root of unity
    const h = negate(omega) // order 6: h cubed is -1

    // The spinor: spin-up, rotated by 2pi and 4pi via each generator.
    const psi = quaternion(1, 0, 0, 0)
    const spinorTwoPi = rotateSpinorTimes(g, psi, 2)
    const spinorFourPi = rotateSpinorTimes(g, psi, 4)
    const spinorTwoPiAlternate = rotateSpinorTimes(h, psi, 3)
    const spinorFlipsAt2pi = equals(spinorTwoPi, negate(psi))
    const spinorReturnsAt4pi = equals(spinorFourPi, psi)
    const alternateFlipsAt2pi = equals(spinorTwoPiAlternate, negate(psi))

    // The vector: a 3-vector off the rotation axis, rotated by 2pi (g twice). A 2pi
    // rotation returns a vector to itself, the contrast that makes the spinor sign a
    // genuine double-cover signature and not a global phase.
    const vector = quaternion(0, 0, 1, 0)
    const vectorTwoPi = rotateVectorTimes(g, vector, 2)
    const vectorReturnsAt2pi = equals(vectorTwoPi, vector)

    const ok =
      inCoin &&
      permutesCoin &&
      spinorFlipsAt2pi &&
      spinorReturnsAt4pi &&
      alternateFlipsAt2pi &&
      vectorReturnsAt2pi

    // The headline number: the spinor's overlap with its start after 2pi, which is
    // -1 for a spinor and +1 for a labeled vector.
    const spinorOverlapAt2pi =
      spinorTwoPi.w * psi.w +
      spinorTwoPi.x * psi.x +
      spinorTwoPi.y * psi.y +
      spinorTwoPi.z * psi.z

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a spinor excitation on the 24-cell coin picks up a minus sign under a 2pi rotation and returns only at 4pi, the spin-half double cover, while a vector returns at 2pi',
      metrics: {
        spinorOverlapAt2pi,
        vectorReturnsAt2pi: vectorReturnsAt2pi ? 1 : 0,
        coinDirections: coin.length,
      },
      notes:
        'L1, known math. This is the algebra-layer unit test that the coin rotation group (the binary tetrahedral group) carries the spinor rep with the 2pi sign, which the 12-direction {5,3,4} coin cannot. It is NOT evidence that spin emerges from the dynamics. The L3 target, a spinor wavepacket carrying the sign while it propagates under the directional rule, is SP2 (spin/weyl-propagation).',
    })
  },
})
