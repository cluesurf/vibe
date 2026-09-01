// AUDIT 2026-08-31: regraded from L3 to L2. this experiment is a trajectory model, with no substrate or rule in it. Honest depth L2, which is what the notes below already said in words while the depth field said L3.
// The same deterministic life, steered versus unsteered, ends in a different place. That gap is the impact.
//
// This makes "you have an impact on your life" blaringly obvious and exact. We run the identical self from the
// identical start, once with its steering applied (it lives its choices) and once with its steering cut (it
// deliberates but cannot act). The world decays toward the vacuum on its own, so doing nothing does not reach
// the goal. We test:
//   1. Determinism: each run replays bit for bit. There is no randomness. (R = 0.)
//   2. Impact: the steered life ends far closer to the goal than the unsteered one. The steering MADE A
//      DIFFERENCE, measured as the gap between the two determined trajectories.
//   3. Agency, not mere activity: a "rock" agent that acts with the same effort but not goal-directedly does NOT
//      close the gap. So the impact comes from the goal-directed decision, not from writing something.
//   4. Compounding: the gap grows over the life, it is not a one-beat blip.
// Controls: the ablated (unsteered) run and the rock run, both of which should fail to reach the goal.
//
// L3 with controls, a model of agency as counterfactual impact, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { runTrajectory, steeringImpact } from '@/code/model/trajectory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function steeringResult(input: { m: number; beats: number }): {
  replayExact: boolean
  steeredFinal: number
  ablatedFinal: number
  rockFinal: number
  impact: number
  gapEarly: number
  gapLate: number
} {
  const effort = Math.round(input.m / 8)

  // 1. determinism: the steered life replays identically
  const a = runTrajectory({
    ...input,
    effort,
    agent: 'self',
    steered: true,
  })

  const b = runTrajectory({
    ...input,
    effort,
    agent: 'self',
    steered: true,
  })

  const replayExact = a.distanceOverTime.every(
    (d, i) => d === b.distanceOverTime[i],
  )

  // 2 and 4. impact and compounding (self steered vs self ablated)
  const self = steeringImpact({ ...input, effort, agent: 'self' })
  // the gap opens up over the life, compare a few beats in (still near the start) to the end
  const gapEarly =
    self.gapOverTime[Math.min(3, self.gapOverTime.length - 1)] ?? 0

  const gapLate = self.gapOverTime[self.gapOverTime.length - 1] ?? 0

  // 3. agency vs mere activity: a rock acts with the same effort but not goal-directedly
  const rock = runTrajectory({
    ...input,
    effort,
    agent: 'rock',
    steered: true,
  })

  return {
    replayExact,
    steeredFinal: self.steeredFinal,
    ablatedFinal: self.ablatedFinal,
    rockFinal: rock.finalDistance,
    impact: self.impact,
    gapEarly,
    gapLate,
  }
}

export default experiment({
  id: 'selves/steering-changes-the-trajectory',
  code: 'E-SLF-0129',
  title:
    'the same deterministic life steered versus unsteered ends in a different place, and that gap is the impact',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [180, 240, 360]
    const runs = sizes.map(m => steeringResult({ m, beats: 80 }))

    const deterministic = runs.every(r => r.replayExact)
    // the steered life reaches the goal (low distance) while the unsteered one stays far (near 1)
    const realImpact = runs.every(
      r =>
        r.impact > 0.4 &&
        r.steeredFinal < 0.35 &&
        r.ablatedFinal > 0.85,
    )

    // goal-directed steering beats mere activity by a wide margin
    const agencyNotActivity = runs.every(
      r => r.rockFinal > r.steeredFinal + 0.3,
    )

    // the gap grows over the life
    const compounding = runs.every(r => r.gapLate > r.gapEarly + 0.1)

    const ok =
      deterministic && realImpact && agencyNotActivity && compounding

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a steered life ends far closer to its goal than the identical unsteered life, the gap grows over time, and a non-goal-directed agent of equal effort does not close it, so the impact is the goal-directed decision',
      metrics: {
        steeredFinal: last.steeredFinal,
        impact: last.impact,
        gapLate: last.gapLate,
      },
      control: {
        ablatedFinal: last.ablatedFinal,
        rockFinal: last.rockFinal,
      },
      notes:
        'AUDIT 2026-08-31: this experiment is a trajectory model, with no substrate or rule in it. Honest depth L2, which is what the notes below already said in words while the depth field said L3. ' +
        'L3 model of agency as counterfactual impact. determinism holds (replay exact), the steering is what makes the difference, this is not a base-substrate emergence claim',
    })
  },
})
