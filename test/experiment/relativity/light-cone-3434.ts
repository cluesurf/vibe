// The light cone on the 24-direction {3,4,3,4} coin: a finite, ballistic maximum speed,
// and a causal interacting rule that respects it.
//
// Two facts, kept apart honestly. First, the maximum signal speed (the light cone) is one
// cell per beat: a free tone streams ballistically, so the front advances exactly the beat
// count (z = 1), far above the square-root reach of a diffusive process. This is measured
// on the 24-direction coin and on the 6-direction cubic cusp alike, so it is the rule's
// causal structure, not an artifact of one coin. Second, the FULL interacting rule is
// causal: a local perturbation of the deterministic vacuum never spreads faster than one
// cell per beat (radius at most the beat count), the locality bound. The interacting
// perturbation does NOT itself saturate the cone (it is reabsorbed into the vacuum's own
// create-move dynamics rather than propagating), which is why the clean propagating
// massless mode is the free-streaming tone; a fully interacting propagating light-cone mode
// needs a second conserved quantity (the momentum current), an open frontier. L2, the
// ballistic light cone reproduced on the D4 coin, with the causal bound on the full rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, cubicMesh } from '@/code/tool/mesh'
import {
  streamingConeRadii,
  perturbationConeRadii,
} from '@/code/measure/light-cone'

export default experiment({
  id: 'relativity/light-cone-3434',
  title:
    'a finite ballistic light cone (z = 1) on the 24-direction {3,4,3,4} coin, with a causal interacting rule',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const beats = 6

    // the free-streaming light cone on the 24-direction coin, the maximum signal speed.
    // The mesh side exceeds the beat count so the front stays interior; two sizes for
    // robustness (deterministic, never random seeds).
    const coneA = streamingConeRadii({ mesh: d4Mesh({ side: 15 }), beats })
    const coneB = streamingConeRadii({ mesh: d4Mesh({ side: 17 }), beats })

    const ballisticA = coneA.every((radius, step) => radius === step + 1)
    const ballisticB = coneB.every((radius, step) => radius === step + 1)

    // the same ballistic cone on the 6-direction cubic cusp, so the light cone is the
    // rule's, not specific to the 24-cell coin
    const cubicCone = streamingConeRadii({
      mesh: cubicMesh({ side: 15 }),
      beats,
    })

    const cubicBallistic = cubicCone.every(
      (radius, step) => radius === step + 1,
    )

    // the diffusive contrast: a random walk reaches only about the square root of the beat
    // count, the measured front is far above that
    const finalRadius = coneA[coneA.length - 1] ?? 0
    const diffusiveReach = Math.sqrt(beats)
    const clearlyBallistic = finalRadius > 2 * diffusiveReach

    // the full interacting rule is causal: a vacuum perturbation never spreads faster than
    // one cell per beat (radius at most the beat count), the locality bound
    const perturbationCone = perturbationConeRadii({
      mesh: d4Mesh({ side: 9 }),
      beats,
    })

    const causal = perturbationCone.every(
      (radius, step) => radius <= step + 1,
    )

    const ok =
      ballisticA &&
      ballisticB &&
      cubicBallistic &&
      clearlyBallistic &&
      causal

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the maximum signal speed on the 24-direction {3,4,3,4} coin is one cell per beat: a free tone streams ballistically so the front advances exactly the beat count (z = 1), far above the diffusive square root, the same on the 6-direction cubic cusp. The full interacting rule is causal, a vacuum perturbation never exceeds one cell per beat. The perturbation does not itself saturate the cone (it is reabsorbed rather than propagating), so the clean propagating massless mode is the free-streaming tone',
      metrics: {
        finalRadius,
        beats,
        diffusiveReach: Number(diffusiveReach.toFixed(2)),
        d4Directions: d4Mesh({ side: 9 }).degree,
        cubicDirections: cubicMesh({ side: 15 }).degree,
        perturbationFrontMax: Math.max(...perturbationCone),
      },
      control: {
        diffusiveReach: Number(diffusiveReach.toFixed(2)),
        perturbationStaysCausal: causal ? 1 : 0,
      },
      notes:
        'L2, the ballistic light cone reproduced on the D4 coin. The free-streaming front equals the beat count exactly (z = 1) on a mesh large enough that the front stays interior (side > beats). Causality (the interacting perturbation never exceeds the beat count) is the locality bound on the full rule. The interacting perturbation oscillates and is reabsorbed (it does not saturate the cone), the honest signature that a fully interacting propagating massless mode needs a second conserved quantity, an open frontier separate from the light-cone speed established here.',
    })
  },
})
