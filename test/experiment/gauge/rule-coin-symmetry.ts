// Does the committed rule keep any discrete piece of SU(3) colour on the coin? An exact SU(3) is
// continuous, but a lattice rule could still keep a finite skeleton of it: a Z3 (the center of SU(3),
// which turns a triplet by a cube root of unity) or an S3 (its Weyl group, which permutes the three
// colours). Either needs an exact symmetry of order three.
//
// The measurement is exhaustive and exact. Every element of the 24-cell symmetry group W(F4) (order
// 1152, built as the closure of the 48 F4 root reflections acting on the 24 coin directions), combined
// with every one of the 36 line relabellings of the tone (any S3 relabelling on each end of a line),
// combined with every shift of the beat by 0 to 23, is tested as a symmetry of the full 24-beat
// turning schedule: sigma C_t sigma^-1 = C_{t + shift} at every beat, checked block by block on every
// local state of every interaction block (coin-symmetry, collision-anatomy). That is 1152 x 36 x 24,
// just under a million candidates, and the orders of the ones that hold are read off.
//
// Controls, which must come out differently: pure streaming keeps all of W(F4) (1152 elements, with
// elements of order 3) under the identity relabelling, and the previous committed knit (the same 9-state
// table on every line, no schedule) keeps a smaller group that still has elements of order 3, so the
// measure can find a Z3 when one is there.
//
// Depth L2: an exact structural measurement of the committed schedule, not a run through beat on a
// mesh (the dynamical relabelling test is E-FRC-0093). No random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  lineWeave,
  pairCollision,
  passThrough,
  turningWeave,
} from '@/code/rule/collision'
import {
  ScheduleSymmetry,
  scheduleAnatomy,
  scheduleSymmetries,
  symmetryOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import { lineRelabellings } from '@/code/check/tone-permutation-symmetry'

const PERIOD = 24

function orderCounts(input: {
  symmetries: readonly ScheduleSymmetry[]
  period: number
  opposite: readonly number[]
}): Map<number, number> {
  const counts = new Map<number, number>()

  for (const symmetry of input.symmetries) {
    const order = symmetryOrder({
      symmetry,
      period: input.period,
      opposite: input.opposite,
    })

    counts.set(order, (counts.get(order) ?? 0) + 1)
  }

  return counts
}

// elements whose order is a multiple of three (their powers include an element of order exactly 3)
function divisibleByThree(counts: Map<number, number>): number {
  return [...counts]
    .filter(([order]) => order % 3 === 0)
    .reduce((sum, [, n]) => sum + n, 0)
}

export default experiment({
  id: 'gauge/rule-coin-symmetry',
  code: 'E-FRC-0095',
  title:
    'the committed turning schedule is exactly symmetric under nothing but the identity among all 1152 x 36 x 24 combinations of a 24-cell element, a tone relabelling and a beat shift, so it keeps no Z3 center and no S3 Weyl skeleton of SU(3), while pure streaming keeps all of W(F4) and the previous knit keeps a group with order-3 elements',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const opposite = meshOpposites(d4Mesh({ side: 3 }))
    const permutations = weylF4DirectionPermutations({
      directions: rootsD4(),
    })
    const relabellings = lineRelabellings()
    const committed = scheduleSymmetries({
      anatomy: scheduleAnatomy({
        schedule: turningWeave({ opposite }),
        period: PERIOD,
        degree: 24,
      }),
      permutations,
      opposite,
      relabellings,
    })
    const committedOrders = orderCounts({
      symmetries: committed,
      period: PERIOD,
      opposite,
    })

    const staticWeave = scheduleSymmetries({
      anatomy: scheduleAnatomy({
        schedule: () => lineWeave({ opposite }),
        period: 1,
        degree: 24,
      }),
      permutations,
      opposite,
      relabellings,
    })
    const previousKnit = scheduleSymmetries({
      anatomy: scheduleAnatomy({
        schedule: () => pairCollision({ opposite }),
        period: 1,
        degree: 24,
      }),
      permutations,
      opposite,
      relabellings,
    })
    const previousOrders = orderCounts({
      symmetries: previousKnit,
      period: 1,
      opposite,
    })
    const streaming = scheduleSymmetries({
      anatomy: scheduleAnatomy({
        schedule: () => passThrough,
        period: 1,
        degree: 24,
      }),
      permutations,
      opposite,
    })
    const streamingOrders = orderCounts({
      symmetries: streaming,
      period: 1,
      opposite,
    })

    const groupIsComplete = permutations.length === 1152
    const committedTrivial =
      committed.length === 1 && (committedOrders.get(1) ?? 0) === 1
    const noOrderThree = divisibleByThree(committedOrders) === 0
    const detectorFindsOrderThree =
      streaming.length === 1152 &&
      divisibleByThree(streamingOrders) > 0 &&
      divisibleByThree(previousOrders) > 0
    const ok =
      groupIsComplete &&
      committedTrivial &&
      noOrderThree &&
      detectorFindsOrderThree

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'over every 24-cell element, every tone relabelling on the two ends of a line and every beat shift, the committed 24-beat turning schedule is exactly symmetric under the identity alone, so it keeps no order-three symmetry, neither the Z3 center nor the S3 Weyl group of SU(3), while pure streaming keeps all 1152 elements of W(F4) and the previous knit keeps order-three elements the same measure finds',
      metrics: {
        candidatesTested:
          permutations.length * relabellings.length * PERIOD,
        committedSymmetries: committed.length,
        committedOrderThreeOrMultiple:
          divisibleByThree(committedOrders),
        staticWeaveSymmetries: staticWeave.length,
      },
      control: {
        weylF4Order: permutations.length,
        streamingSymmetries: streaming.length,
        streamingOrderThreeOrMultiple:
          divisibleByThree(streamingOrders),
        previousKnitSymmetries: previousKnit.length,
        previousKnitOrderThreeOrMultiple:
          divisibleByThree(previousOrders),
      },
      notes:
        "L2, an exact exhaustive structural measurement with no random numbers. Symmetries that also reverse time (the CPT of the committed rule is one) and symmetries that act differently on different cells are outside it, since neither can be the internal colour group of a single cell. The symmetry breaking has two sources that the controls separate: the oriented clock (the pair table is not symmetric under swapping a line's two ends, which already cuts W(F4) down for the previous knit) and the turning schedule with its single swapped couple, which removes the rest. Within these symmetries, no finite subgroup of SU(3) with an element of order three can act on the coin.",
    })
  },
})
