import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, cubicMesh } from '@/code/tool/mesh'
import { perturbationConeRadii } from '@/code/measure/light-cone'

// SP4, the light cone on the 24-direction coin. A local perturbation under the
// directional rule spreads as a finite causal cone, and we read its front speed out
// of the dynamics by differencing a perturbed run against the base run. The front
// advances at most one cell per beat (causal, a consistency check from the rule's
// locality) and exactly one cell per beat (ballistic, z = 1), far above the sqrt
// growth a diffusive process would give. The same holds on the 6-direction cubic
// cusp, so the cone is the rule's causal structure, not an artifact of one coin.
// L2, known physics (a ballistic light cone) reproduced on the D4 spin substrate.
export default experiment({
  id: 'relativity/light-cone-3434',
  title:
    'a finite ballistic light cone (z = 1) on the 24-direction {3,4,3,4} coin',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const beats = 6

    // The 24-direction D4 coin, the deterministic vacuum, two lattice SIZES for
    // robustness (never random seeds, the base is deterministic).
    const coneA = perturbationConeRadii({
      mesh: d4Mesh({ side: 9 }),
      beats,
    })

    const coneB = perturbationConeRadii({
      mesh: d4Mesh({ side: 11 }),
      beats,
    })

    const ballisticA = coneA.every(
      (radius, step) => radius === step + 1,
    )

    const ballisticB = coneB.every(
      (radius, step) => radius === step + 1,
    )

    const causal = coneA.every((radius, step) => radius <= step + 1)

    // The diffusive contrast: a random walk would reach only ~sqrt(beats). The
    // measured front is far above that, the signature of ballistic, not diffusive,
    // propagation.
    const finalRadius = coneA[coneA.length - 1] ?? 0
    const diffusiveReach = Math.sqrt(beats)
    const clearlyBallistic = finalRadius > 2 * diffusiveReach

    // The cross-substrate control: the same finite ballistic cone on the 6-direction
    // cubic cusp, so the result is the rule's, not specific to the 24-cell coin.
    const cubic = cubicMesh({ side: 13 })
    const cubicCone = perturbationConeRadii({ mesh: cubic, beats })
    const cubicBallistic = cubicCone.every(
      (radius, step) => radius === step + 1,
    )

    const d4 = d4Mesh({ side: 9 })

    const ok =
      ballisticA &&
      ballisticB &&
      causal &&
      clearlyBallistic &&
      cubicBallistic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a local perturbation under the directional rule spreads as a finite ballistic light cone, one cell per beat (z = 1), on the 24-direction coin and the 6-direction cubic cusp alike',
      metrics: {
        finalRadius,
        beats,
        diffusiveReach,
        d4Directions: d4.degree,
        cubicDirections: cubic.degree,
      },
      notes:
        'L2, known physics (a ballistic light cone) reproduced on the D4 coin. Causality (radius <= beat count) is a consistency check from the rule locality, not a discovery. The ballistic z = 1 (radius == beat count, far above the diffusive sqrt) is the measured signature, the same on both coins. This measures the front SPEED only. Full isotropy across directions, and the claim that 24 directions beat 12, is a separate measurement.',
    })
  },
})
