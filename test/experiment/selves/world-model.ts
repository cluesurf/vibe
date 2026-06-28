// E1 of the observer chunk, the self as a model-builder. A central self is driven by a structured sectored
// environment, and its deep interior integrates that drive through the beat. The interior then carries
// predictive mutual information about the FUTURE of the environment, about a tenth of a bit at one beat
// ahead, which a time-shuffled environment lacks (the predictive information needs real temporal structure)
// and which a no-dynamics control lacks (the interior cannot build the model without the integrating
// dynamics). So a self comes to carry a predictive model of its world from the base alone. Depth L2, a
// measured predictive mutual information on the statistical self-kit, with two controls. Spec: note
// theory-v0.8.0/experiments/05-observer-and-inner-experience.md (E1). The integrated-information rung (E2) is
// already covered by selves/integrated-information.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quantileLabels } from '@/code/coarse/transition-matrix'
import { drivenSelf } from '@/code/coarse/driven-self'
import {
  mutualInformationBits,
  crossJointCounts,
} from '@/code/measure/statistics'
import { timeShuffle } from '@/code/coarse/surrogate'

const L = 64
const beats = 4000
const bins = 3
// one beat ahead, the predictive horizon.
const lag = 1

// the interior must carry at least this much predictive information, and beat both controls by this much. The
// measured value is near 0.1 bits and both controls are near zero, so the bounds sit clear of the knife edge.
const MIN_BITS = 0.04

function predictiveInformation(
  interior: number[],
  environment: number[],
): number {
  const a = quantileLabels({ series: interior, bins })
  const b = quantileLabels({ series: environment, bins })

  return mutualInformationBits(
    crossJointCounts({ seriesA: a, seriesB: b, stateCount: bins, lag }),
  )
}

export default experiment({
  id: 'selves/world-model',
  code: 'E-SLF-0153',
  title:
    'a self interior carries predictive information about its future environment, the controls do not',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const live = drivenSelf({
      L,
      beats,
      seed: 777,
      withDynamics: true,
      sectors: 2,
      interiorRadius: 6,
      cohesion: 0.4,
    })

    const dead = drivenSelf({
      L,
      beats,
      seed: 777,
      withDynamics: false,
      sectors: 2,
      interiorRadius: 6,
      cohesion: 0.4,
    })

    const selfMI = predictiveInformation(
      live.interior,
      live.environment,
    )

    // control one, the time-shuffled environment, destroys the temporal structure the model reads.
    const shuffledEnvironment = quantileLabels({
      series: live.environment,
      bins,
    })

    const shuffledMI = mutualInformationBits(
      crossJointCounts({
        seriesA: quantileLabels({ series: live.interior, bins }),
        seriesB: timeShuffle({
          trajectory: shuffledEnvironment,
          seed: 99,
        }),
        stateCount: bins,
        lag,
      }),
    )

    // control two, the same self with the dynamics off, so the interior never integrates the drive.
    const noDynamicsMI = predictiveInformation(
      dead.interior,
      dead.environment,
    )

    const gainOverShuffled = selfMI - shuffledMI
    const gainOverNoDynamics = selfMI - noDynamicsMI
    const ok =
      selfMI > MIN_BITS &&
      gainOverShuffled > MIN_BITS &&
      gainOverNoDynamics > MIN_BITS

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self interior carries predictive mutual information about the future of its structured environment, near a tenth of a bit one beat ahead, while a time-shuffled environment and a no-dynamics control carry none, so the self builds a predictive model of its world through the integrating dynamics',
      metrics: {
        selfMI,
        shuffledMI,
        noDynamicsMI,
        gainOverShuffled,
        gainOverNoDynamics,
      },
      control: { shuffledMI, noDynamicsMI },
      notes:
        'the predictive information is the mutual information in bits between the binned interior state at time t and the binned environment at t+1, the two controls isolate it from finite-sample noise and from a trivial undriven interior',
    })
  },
})
