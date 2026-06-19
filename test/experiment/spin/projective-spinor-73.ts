import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  specialLinear,
  centre,
  identityModP,
  minusIdentityModP,
  multiplyModP,
  equalsModP,
} from '@/code/algebra/group/special-linear'

// {7,3}'s (2,3,7) triangle symmetry has the finite quotient PSL(2,7), the Klein-quartic
// group of order 168. Its Schur multiplier is Z2 and its double cover is SL(2,7), order 336,
// where minus the identity is a nontrivial central element that acts as minus one in the
// defining 2-dimensional rep, the spinor sign. So {7,3} has its own spinor double cover,
// exactly parallel to 2I for {5,3,4} and 2T for {3,4,3,4}, the spinor in the projective rep.

export default experiment({
  id: 'spin/projective-spinor-73',
  title:
    'the {7,3} symmetry PSL(2,7) has a spinor double cover SL(2,7), spin in the projective rep',
  category: 'spin',
  substrates: ['73'],
  depth: 'L1',
  paper: true,
  run() {
    const prime = 7
    const group = specialLinear(prime)
    const order = group.length // expect 336 = 7 (49 - 1)

    // the centre is {I, -I}, order 2, and PSL = SL / centre has order 168
    const middle = centre(prime)
    const centreOrder = middle.length
    const projectiveOrder = order / centreOrder

    // minus the identity is central, distinct from the identity, the lift the spinor sign turns on
    const minusOne = minusIdentityModP(prime)
    const minusIsCentral =
      !equalsModP(minusOne, identityModP()) &&
      middle.some(element => equalsModP(element, minusOne))

    // MEASURED spinor action: -I applied to a basis vector is minus that vector over F_p
    const reduce = (value: number): number =>
      ((value % prime) + prime) % prime
    const minusOneTimesE0 = multiplyModP(minusOne, [1, 0, 0, 0], prime) // acts on the first column
    const actsAsMinusOne =
      minusOneTimesE0[0] === reduce(-1) && minusOneTimesE0[2] === 0

    const isSpinorCover =
      order === 336 &&
      centreOrder === 2 &&
      projectiveOrder === 168 &&
      minusIsCentral &&
      actsAsMinusOne

    return verdict({
      status: isSpinorCover ? 'pass' : 'fail',
      claim:
        'PSL(2,7), the {7,3} Klein-quartic symmetry, has the spinor double cover SL(2,7) (order 336 over 168), the spinor in the projective rep',
      metrics: {
        specialLinearOrder: order,
        centreOrder,
        projectiveOrder,
        minusIdentityCentral: minusIsCentral ? 1 : 0,
        minusIdentityActsAsMinusOne: actsAsMinusOne ? 1 : 0,
      },
      // CONTROL: PSL(2,7) (the rotation-like quotient) has no minus one, no spinor, the cover SL(2,7) does.
      control: {
        projectiveGroupOrder: projectiveOrder,
        spinorSignInProjectiveGroup: 0,
      },
      notes:
        'PSL(2,7) is the integer-spin quotient. SL(2,7) is the spinor double cover. The open dynamical question is whether the {7,3} cell transport realizes SL(2,7) rather than PSL(2,7).',
    })
  },
})
