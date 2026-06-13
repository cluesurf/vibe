import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  binaryIcosahedral,
  multiply,
  conjugate,
  quaternion,
  quaternionKey,
  type Quaternion,
} from '@/code/algebra/group/quaternion'

// {5,3,4}'s icosahedral rotation symmetry A5 has Schur multiplier Z2, so it has a genuine
// spinor double cover, the binary icosahedral group 2I (the 600-cell, order 120). The 12
// face-directions carry no spinor in the LINEAR permutation rep (1 plus 3 plus 3' plus 5),
// but the PROJECTIVE rep is a spinor, exactly as 2T (order 24) is the spin coin of {3,4,3,4}.
// So the {5,3,4} hyperbolic bulk CAN carry spin, in the projective rep, and the no-spinor
// result was only about the direction rep.

const rotationKey = (value: Quaternion): string => {
  const basis = [quaternion(0, 1, 0, 0), quaternion(0, 0, 1, 0), quaternion(0, 0, 0, 1)]
  return basis
    .map((axis) => {
      const rotated = multiply(multiply(value, axis), conjugate(value))
      return [rotated.x, rotated.y, rotated.z].map((part) => Math.round(part * 1e4)).join(',')
    })
    .join(';')
}

export default defineExperiment({
  id: 'spin/icosian-double-cover-534',
  title: 'the icosahedral symmetry of {5,3,4} has a spinor double cover 2I, spin in the projective rep',
  category: 'spin',
  substrates: ['534'],
  depth: 'L1',
  paper: true,
  run() {
    const group = binaryIcosahedral()
    const keys = new Set(group.map(quaternionKey))

    // (1) the 120 icosians form a group under quaternion multiplication, the binary icosahedral 2I
    const order = group.length
    const closed = group.every((left) =>
      group.every((right) => keys.has(quaternionKey(multiply(left, right)))),
    )

    // (2) conjugation collapses the 120 quaternions onto the rotations, 2-to-1, the double cover
    const rotations = new Set(group.map(rotationKey))
    const rotationOrder = rotations.size
    const minusOne = quaternion(-1, 0, 0, 0)
    const hasMinusOne = keys.has(quaternionKey(minusOne))
    const twoToOne = rotationKey(quaternion(1, 0, 0, 0)) === rotationKey(minusOne)

    const isSpinorCover =
      order === 120 && closed && rotationOrder === 60 && hasMinusOne && twoToOne

    return verdict({
      status: isSpinorCover ? 'pass' : 'fail',
      claim:
        'A5, the icosahedral symmetry of {5,3,4}, has the spinor double cover 2I (order 120 over 60), so spin lives in the projective representation',
      metrics: {
        groupOrder: order,
        rotationOrder,
        ratio: order / rotationOrder,
        closed: closed ? 1 : 0,
        hasMinusOne: hasMinusOne ? 1 : 0,
      },
      // CONTROL: the rotation group A5 (order 60) is the integer-spin quotient, it has no minus one,
      // so the quotient carries no spinor, the 2-to-1 cover is exactly the spinor.
      control: { rotationGroupOrder: rotationOrder, spinorSignInRotationGroup: 0 },
      notes:
        'The linear permutation rep of the 12 directions has no spinor (p190). The spinor lives in the PROJECTIVE rep, realized by 2I. The open dynamical question is whether the {5,3,4} cell transport carries the Z2 cocycle, realizing 2I rather than A5.',
    })
  },
})
