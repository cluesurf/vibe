// E1b of the observer chunk, the non-self control for the model-builder (E1). The bound self carries
// predictive information about its environment (E1, selves/world-model). Here we ask whether it is the
// BINDING into a self that builds the richer model, not mere exposure to the drive. A bound self (cohesion
// on) carries clearly more predictive mutual information about the future environment than an unbound gas
// (cohesion off, same drive), so integration into a self genuinely improves the world-model. The contrast is
// modest, binding gives roughly one and a half to two times the predictive information, because even an
// unbound region partially integrates the drive through ordinary hopping. Depth L2, a measured self-versus-gas
// contrast. Spec: note theory-v0.8.0/experiments/05-observer-and-inner-experience.md (E1, the non-self
// control). The deeper act-to-persist half (the self ACTING on its model to maintain itself) needs agency the
// passive self-kit lacks, an open frontier.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quantileLabels } from '@/code/coarse/transition-matrix'
import { drivenSelf } from '@/code/coarse/driven-self'
import { mutualInformationBits, crossJointCounts } from '@/code/measure/statistics'

const L = 64
const beats = 4000
const bins = 3
const lag = 1

// the bound self must carry this much predictive information, exceed the gas by this ratio, and exceed it by
// this absolute margin. The measured values are near 0.105 (bound) and 0.059 (gas), robust across size with a
// ratio of 1.3 to 1.8.
const MIN_BITS = 0.04
const MIN_RATIO = 1.15
const MIN_DIFFERENCE = 0.01

function predictiveInformation(cohesion: number): number {
  const series = drivenSelf({ L, beats, seed: 777, withDynamics: true, sectors: 2, interiorRadius: 6, cohesion })
  const a = quantileLabels({ series: series.interior, bins })
  const b = quantileLabels({ series: series.environment, bins })
  return mutualInformationBits(crossJointCounts({ seriesA: a, seriesB: b, stateCount: bins, lag }))
}

export default experiment({
  id: 'selves/binding-improves-model',
  title: 'a bound self carries more predictive information about its environment than an unbound gas',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const boundMI = predictiveInformation(0.4)
    const gasMI = predictiveInformation(0.0)

    const ok =
      boundMI > MIN_BITS && boundMI > gasMI * MIN_RATIO && boundMI - gasMI > MIN_DIFFERENCE

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a bound self carries clearly more predictive mutual information about the future environment than an unbound gas under the same drive, so it is the integration into a self that builds the richer world-model, not mere exposure',
      metrics: {
        boundMI,
        gasMI,
        ratio: boundMI / Math.max(gasMI, 1e-6),
        difference: boundMI - gasMI,
      },
      control: { gasMI },
      notes:
        'the gas still partially integrates the drive through ordinary hopping, so the contrast is modest (binding gives roughly 1.5 to 1.8 times the predictive information), it is an honest non-self control, not a clean zero',
    })
  },
})
