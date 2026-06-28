// PUSH on the spin rung. The 24 directions of the cell are the binary tetrahedral group, the double cover of the
// rotation group. This is why the cell carries spin natively: a spinor transforms by left quaternion
// multiplication, where a full 2-pi turn (the quaternion -1) acts as MINUS the identity, and only a 4-pi turn
// returns. A vector transforms by conjugation, where the same -1 acts as the identity. Showing this gap
// concretely moves the spin rung from "the directions carry spinors structurally" to "the spin-one-half double
// cover acts on the cell". CONTROL: the vector representation, where the same 2-pi element is the identity, so
// the minus sign is genuinely the spinor double cover and not a global sign convention.

import {
  binaryTetrahedralGroup,
  isClosedUnderMultiplication,
  spinorAction,
  vectorAction,
  quaternionsClose,
  Quaternion,
} from '@/code/algebra/binary-tetrahedral'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'spin/spinor-double-cover',
  code: 'E-SPN-0042',
  title:
    "the cell's 24 directions form the binary tetrahedral double cover, so a 2-pi turn negates a spinor and leaves a vector fixed (spin one-half realized on the coin)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const group = binaryTetrahedralGroup()
    const isGroup = isClosedUnderMultiplication(group)

    const one: Quaternion = [1, 0, 0, 0]
    const minusOne: Quaternion = [-1, 0, 0, 0]
    const i: Quaternion = [0, 1, 0, 0]
    const testVector: Quaternion = [0, 1, 0.5, -0.5]

    // the 2-pi rotation is the quaternion -1. On a spinor (left multiplication) it acts as minus the identity.
    const spinorAt2pi = spinorAction(minusOne, one)
    const spinorNegated = quaternionsClose(spinorAt2pi, [-1, 0, 0, 0])

    // on a vector (conjugation) the same 2-pi element is the identity.
    const vectorAt2pi = vectorAction(minusOne, testVector)
    const vectorFixed = quaternionsClose(vectorAt2pi, testVector)

    // an order-four element: i squared is -1 (the spinor sees -I at a 360-degree turn), i to the fourth returns.
    const i2 = spinorAction(i, i)
    const i4 = spinorAction(i2, i2)
    const spinorReturnsAt4pi = quaternionsClose(i4, one)
    const spinorNegatedAt2piTurn = quaternionsClose(i2, [-1, 0, 0, 0])
    // the same 360-degree turn (i squared) leaves a vector fixed: vectors return at 2-pi, spinors need 4-pi.
    const vectorAtFullTurn = vectorAction(i2, testVector)
    const vectorReturnsAt2pi = quaternionsClose(vectorAtFullTurn, testVector)

    const ok =
      isGroup &&
      group.length === 24 &&
      spinorNegated &&
      vectorFixed &&
      spinorNegatedAt2piTurn &&
      spinorReturnsAt4pi &&
      vectorReturnsAt2pi

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the cell's 24 directions are the binary tetrahedral group (order 24, closed under multiplication), the double cover of the rotation group: a 2-pi rotation acts as minus the identity on a spinor (left multiplication) but as the identity on a vector (conjugation), and a spinor returns only after a 4-pi turn, so spin one-half is realized concretely on the coin rather than imposed by hand",
      metrics: {
        groupOrder: group.length,
        isGroup: isGroup ? 1 : 0,
        spinorNegatedAt2pi: spinorNegated ? 1 : 0,
        spinorReturnsAt4pi: spinorReturnsAt4pi ? 1 : 0,
      },
      control: {
        vectorFixedAt2pi: vectorFixed ? 1 : 0,
        vectorReturnsAt2pi: vectorReturnsAt2pi ? 1 : 0,
      },
      notes:
        'L2, a finite-group computation on the 24 unit quaternions. The spinor representation is left multiplication, the vector representation is conjugation. The 2-pi element is the quaternion -1. The spinor sees -I and only returns at 4-pi, the vector sees the identity at 2-pi. The control is the vector representation, which fixes the same element, so the minus sign is the genuine spin-one-half double cover and not a sign convention. This pushes the spin rung from structural (the directions carry spinor reps) to acted (the double cover operates).',
    })
  },
})
