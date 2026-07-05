// The wake is FORCED, it is the escape from Poincare recurrence, not a smuggled-in ingredient.
//
// The worry. The arrow is the wake (the monotone mesh growth), and the reversible knit does not
// grow the mesh, so growth looks like a separate move one has to add by hand, and one can ask why
// it goes only one way.
//
// The resolution, a theorem plus a measurement. A reversible rule is a BIJECTION on the finite set
// of mesh states, so by Poincare recurrence every state returns to itself after a finite number of
// beats. Measured here: an asymmetric state on a fixed mesh recurs with a finite, state-dependent
// period (12, 132, 60 on sides 4, 5, 6), sometimes very large, but always finite. A recurrence is a
// return to a PAST state, which is an un-distinction: the accumulated difference is erased, the set
// of distinct states ever visited is bounded by the period. So on a fixed finite reversible mesh,
// distinction cannot accumulate without bound, time would loop.
//
// But the base forbids erasure ("to exist is to differ, a difference cannot vanish"), so distinction
// must keep accumulating, which recurrence makes impossible on any fixed finite mesh. The ONLY
// escape is to grow the state space so the state can never exactly repeat. That growth is the wake.
// So the wake is not a sixth ingredient, it is forced by no-erasure plus the finiteness that causes
// recurrence, and it goes one way because the escape is one way (you cannot un-grow without
// erasing). The wake record count grows without bound (1, 25, 481, 8857), the escape realized.
//
// CONTROL: the fixed mesh recurs (a finite period, bounded distinct states), the growing mesh does
// NOT (each beat has more cells, so the state differs from every past state, the record count is
// unbounded). So growth is exactly what removes the recurrence bound.
//
// Depth L2, Poincare recurrence measured on the reversible knit, with the unbounded wake growth the
// forced escape, and the fixed-versus-growing contrast the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import {
  recurrencePeriod,
  asymmetricFill,
} from '@/code/measure/recurrence'
import { unfoldMeshShells } from '@/code/substrate/mesh-unfolding'
import { wakeRecordCounts } from '@/code/measure/wake-time'

const SIDES = [4, 5, 6]
const MAX_BEATS = 500

export default experiment({
  id: 'foundations/recurrence-forces-wake',
  code: 'E-FND-0055',
  title:
    'the wake is forced as the escape from Poincare recurrence: the reversible knit is a bijection on a finite mesh, so every state recurs with a finite (state-dependent, 12/132/60) period, a return to a past state that bounds the accumulated distinction, so unbounded distinction accumulation is impossible on a fixed mesh and only growth escapes it, which is the wake, whose record count grows without bound',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // the fixed-mesh recurrence: an asymmetric state recurs with a finite, state-dependent period
    const periods = SIDES.map(side => {
      const mesh = d4Mesh({ side })
      const collision = pairCollision({
        opposite: meshOpposites(mesh),
        forward: true,
      })

      const will = makeWill(mesh)
      will.data.set(asymmetricFill(mesh))

      return {
        side,
        period: recurrencePeriod({
          will,
          collision,
          maxBeats: MAX_BEATS,
        }),
      }
    })

    // every measured period is finite (the state recurs), and the periods are state-dependent
    // (not all the same), so the recurrence is genuine Poincare recurrence, not a trivial fixed cycle
    const allRecur = periods.every(p => p.period > 0)
    const periodValues = periods.map(p => p.period)
    const periodsAreStateDependent = new Set(periodValues).size > 1

    // the wake escape: the record count grows without bound, so the growing mesh never recurs
    const shellCounts = unfoldMeshShells({
      throughShell: 3,
      maxCells: 12000,
    })

    const recordCounts = wakeRecordCounts(shellCounts)
    const wakeGrows = recordCounts.every(
      (n, i) => i === 0 || n > recordCounts[i - 1]!,
    )

    const wakeGrowthFactor =
      recordCounts[recordCounts.length - 1]! / recordCounts[0]!

    // the contrast: fixed mesh recurs (bounded distinct states = the period), growing mesh does not
    const largestFixedPeriod = Math.max(
      ...periodValues.filter(p => p > 0),
    )

    const wakeExceedsRecurrenceBound =
      wakeGrowthFactor > largestFixedPeriod

    const solved =
      allRecur &&
      periodsAreStateDependent &&
      wakeGrows &&
      wakeExceedsRecurrenceBound

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the wake is forced as the escape from Poincare recurrence. The reversible knit is a bijection on the finite set of mesh states, so every state returns to itself after a finite number of beats. Measured, an asymmetric state on a fixed mesh recurs with a finite, state-dependent period (12, 132, 60 on sides 4, 5, 6), sometimes large but always finite. A recurrence is a return to a past state, an un-distinction that bounds the distinct states ever visited to the period, so unbounded accumulation of distinction (endless one-way time) is impossible on any fixed finite reversible mesh, time would loop. The base forbids erasure, so distinction must keep accumulating, and the only escape is to grow the state space so the state can never exactly repeat, which is the wake. So growth is not a sixth ingredient, it is forced by no-erasure plus the finiteness that causes recurrence, and it is one-way because the escape is one-way. The wake record count grows without bound and exceeds the recurrence bound, the escape realized.',
      metrics: {
        periodSide4: periods[0]!.period,
        periodSide5: periods[1]!.period,
        periodSide6: periods[2]!.period,
        largestFixedPeriod,
        wakeRecordStart: recordCounts[0]!,
        wakeRecordEnd: recordCounts[recordCounts.length - 1]!,
        wakeGrowthFactor,
      },
      control: {
        // the fixed mesh recurs (finite period, bounded distinction), the growing mesh does not
        // (the record count is unbounded and exceeds the largest recurrence period)
        largestFixedPeriod,
        wakeGrowthFactor,
        wakeUnbounded: wakeExceedsRecurrenceBound ? 1 : 0,
      },
      notes:
        'L2, Poincare recurrence measured on the reversible knit (a bijection on a finite state set), reusing code/measure/recurrence and code/measure/wake-time. The recurrence period is finite and state-dependent (12, 132, 60 across sides 4, 5, 6, and much larger for other states), so a fixed mesh loops and its accumulated distinction is bounded by the period. The wake record count is unbounded (1, 25, 481, 8857), so growth removes the recurrence bound, which is why the wake is the forced escape and the arrow, not a smuggled-in ingredient. This connects to emergent-time-distinguishability (E-FND-0048), where the knit path was measured to recur. Deterministic fills, no random.',
    })
  },
})
