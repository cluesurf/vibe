// A coherent self steers its world to its goal. A fragmented self of the same parts cannot. So integration
// amplifies agency, and alignment is the ally of freedom, not its rival ([alignment 02]).
//
// A self acts through several sub-policies (sub-selves), each writing toward its own target each beat on a shared
// world that decays. We compare the same self two ways:
//   - integrated: every sub-policy aims at the goal, so they reinforce and the world reaches it.
//   - fragmented: the sub-policies aim at opposed targets, so they overwrite each other and the world is torn.
// We measure the final distance to the goal. The integrated self gets there, the fragmented one (the control)
// does not. Same parts, same total effort, opposite outcome, the difference is coherence.
//
// L3 with a control, a model of integration as the source of agency, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { multiAgentTrajectory } from '@/code/model/trajectory'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function integrationAgency(input: {
  m: number
  parts: number
}): { integratedFinal: number; fragmentedFinal: number } {
  const plus = new Int8Array(input.m).fill(1)
  const minus = new Int8Array(input.m).fill(-1)
  const effort = Math.round(input.m / 4)

  // integrated: every sub-policy aims at the goal (all plus)
  const integrated = multiAgentTrajectory({
    m: input.m,
    beats: 80,
    effort,
    targets: Array.from({ length: input.parts }, () => plus),
  })

  // fragmented: sub-policies aim at opposed targets
  const fragmented = multiAgentTrajectory({
    m: input.m,
    beats: 80,
    effort,
    targets: Array.from({ length: input.parts }, (_, j) =>
      j % 2 === 0 ? plus : minus,
    ),
  })

  return {
    integratedFinal: integrated.finalDistance,
    fragmentedFinal: fragmented.finalDistance,
  }
}

export default experiment({
  id: 'selves/integration-amplifies-agency',
  code: 'E-SLF-0063',
  title:
    'a coherent self reaches its goal while a fragmented self of the same parts cannot, so integration amplifies agency',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const sizes = [180, 240, 360]
    const runs = sizes.map(m => integrationAgency({ m, parts: 6 }))

    const integratedReaches = runs.every(r => r.integratedFinal < 0.3)
    const fragmentedFails = runs.every(r => r.fragmentedFinal > 0.5)
    const wideGap = runs.every(
      r => r.fragmentedFinal - r.integratedFinal > 0.3,
    )

    const ok = integratedReaches && fragmentedFails && wideGap

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with identical parts and effort, the self whose sub-policies agree reaches its goal while the self whose sub-policies oppose cannot, so a unified self is a strong cause and a divided self cancels itself, integration amplifies agency',
      metrics: {
        integratedFinal: last.integratedFinal,
      },
      control: {
        fragmentedFinal: last.fragmentedFinal,
      },
      notes:
        'L3 model. alignment is the ally of freedom, an integrated self has more impact than a fragmented one. not a base-emergence claim',
    })
  },
})
