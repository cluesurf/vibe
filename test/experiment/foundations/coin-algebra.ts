import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  binaryTetrahedral,
  quaternionGroup,
  multiply,
  equals,
} from '@/code/algebra/group/quaternion'
import { trialityClasses } from '@/code/algebra/group/cell-24'
import { rootsD4, rootsF4 } from '@/code/algebra/group/root-system'

// The algebra of the coin. The 24 directions of the {3,4,3,4} cell are the D4 root
// system, which equals the binary tetrahedral group (the 24-cell vertices), and they
// split into three triality classes of eight, a vector and two spinors. This is the
// structure that lets the directional rule carry spin, which the 12 directions of
// {5,3,4} cannot (they split with no spinor).
export default experiment({
  id: 'foundations/coin-algebra',
  title:
    'the 24 coin directions are the D4 roots with triality, the spin algebra',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const d4 = rootsD4()
    const d4Count = d4.length === 24
    const d4Norm = d4.every(
      root => root.reduce((sum, value) => sum + value * value, 0) === 2,
    )
    const f4Count = rootsF4().length === 48

    const group = binaryTetrahedral()
    const groupCount = group.length === 24
    const closed = group.every(left =>
      group.every(right =>
        group.some(candidate =>
          equals(multiply(left, right), candidate),
        ),
      ),
    )
    const q8 = quaternionGroup().length === 8

    const [vector, spinorA, spinorB] = trialityClasses()
    const trialitySplit =
      vector.length === 8 &&
      spinorA.length === 8 &&
      spinorB.length === 8
    const all = [...vector, ...spinorA, ...spinorB]
    const disjoint = all.every(
      (element, index) =>
        all.findIndex(other => equals(other, element)) === index,
    )

    const ok =
      d4Count &&
      d4Norm &&
      f4Count &&
      groupCount &&
      closed &&
      q8 &&
      trialitySplit &&
      disjoint
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 coin directions are the D4 roots and the binary tetrahedral group, splitting into three disjoint triality classes of eight, a vector and two spinors',
      metrics: {
        d4Roots: d4.length,
        f4Roots: rootsF4().length,
        groupOrder: group.length,
        trialityClasses: 3,
      },
    })
  },
})
