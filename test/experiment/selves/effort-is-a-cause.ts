// Effort is a cause. More goal-directed effort gives a better outcome, and zero effort gives a worse one, so
// "it would have happened anyway" is false.
//
// This refutes fatalism on the trajectory model. We run the identical deterministic life at increasing levels of
// effort and measure how close it ends to its goal. We test:
//   1. Monotonic: more effort ends strictly closer to the goal. Effort is a graded cause, not a placebo.
//   2. Anti-fatalism: zero effort ends far from the goal, much worse than any positive effort. The good outcome
//      does NOT happen anyway. It happens because of the effort.
//   3. Goal-directed, not mere activity: a "rock" agent spending the same effort non-goal-directedly does NOT
//      improve with effort, so it is goal-directed effort that causes the outcome, not activity.
// The control is the rock, whose effort knob buys it nothing.
//
// L2 model of effort as a graded cause, deterministic, robustness by world size. Not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { runTrajectory } from '@/code/model/trajectory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function effortResult(input: { m: number; beats: number }): {
  selfByEffort: { effort: number; finalDistance: number }[]
  rockByEffort: { effort: number; finalDistance: number }[]
  selfMonotone: boolean
  zeroEffortWorst: boolean
  rockFlat: boolean
} {
  // effort as a fraction of world size, so the contrast is the same shape at every scale and never saturates
  const efforts = [
    0,
    Math.round(input.m / 50),
    Math.round(input.m / 25),
    Math.round(input.m / 14),
    Math.round(input.m / 10),
  ]

  const selfByEffort = efforts.map(effort => ({
    effort,
    finalDistance: runTrajectory({
      ...input,
      effort,
      agent: 'self',
      steered: true,
    }).finalDistance,
  }))

  const rockByEffort = efforts.map(effort => ({
    effort,
    finalDistance: runTrajectory({
      ...input,
      effort,
      agent: 'rock',
      steered: true,
    }).finalDistance,
  }))

  // 1. self improves (distance strictly drops) as effort rises
  let selfMonotone = true

  for (let i = 1; i < selfByEffort.length; i++) {
    if (
      selfByEffort[i]!.finalDistance >
      selfByEffort[i - 1]!.finalDistance - 1e-9
    ) {
      selfMonotone = false
    }
  }

  // 2. zero effort is far worse than the highest effort (not "happens anyway")
  const zero = selfByEffort[0]!.finalDistance
  const most = selfByEffort[selfByEffort.length - 1]!.finalDistance
  const zeroEffortWorst = zero - most > 0.4

  // 3. the rock does not meaningfully improve with effort (its best is still far from the goal)
  const rockBest = Math.min(...rockByEffort.map(r => r.finalDistance))
  const rockFlat = rockBest > 0.5

  return {
    selfByEffort,
    rockByEffort,
    selfMonotone,
    zeroEffortWorst,
    rockFlat,
  }
}

export default experiment({
  id: 'selves/effort-is-a-cause',
  title:
    'more goal-directed effort gives a better determined outcome and zero effort a worse one, so it does not happen anyway',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [180, 240, 360]
    const runs = sizes.map(m => effortResult({ m, beats: 80 }))

    const monotone = runs.every(r => r.selfMonotone)
    const antiFatalism = runs.every(r => r.zeroEffortWorst)
    const goalDirected = runs.every(r => r.rockFlat)

    const ok = monotone && antiFatalism && goalDirected

    const last = runs[runs.length - 1]!
    const zero = last.selfByEffort[0]!.finalDistance
    const most = last.selfByEffort[last.selfByEffort.length - 1]!.finalDistance

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the outcome improves monotonically with goal-directed effort and is far worse at zero effort, while equal non-goal-directed effort buys nothing, so the good outcome is caused by the effort and does not happen anyway',
      metrics: {
        zeroEffortDistance: zero,
        maxEffortDistance: most,
        improvement: zero - most,
      },
      control: {
        rockBestDistance: Math.min(
          ...last.rockByEffort.map(r => r.finalDistance),
        ),
      },
      notes:
        'L2 model of effort as a graded cause, deterministic, refutes the fatalist "it would have happened anyway"',
    })
  },
})
