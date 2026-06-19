// E3 of the observer chunk, structural attention. A self does not weight all of its inputs equally. Driven by
// two input sectors of the same size and position, one carrying a slowly-varying (meaningful) signal and one
// carrying fast noise, the self's interior comes to carry far more mutual information with the slow sector
// than with the fast one. The integrating beat low-passes, so the self attends to the persistent signal and
// filters out the noise, an emergent, measured allocation of attention rather than an added module. Depth L2,
// a measured per-sector mutual information with two controls (the fast sector of equal size, and a no-dynamics
// run). Spec: note theory-v0.8.0/experiments/05-observer-and-inner-experience.md (E3).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quantileLabels } from '@/code/coarse/transition-matrix'
import { drivenSelf } from '@/code/coarse/driven-self'
import {
  mutualInformationBits,
  crossJointCounts,
} from '@/code/measure/statistics'

const L = 64
const beats = 4000
const bins = 3

// the slow (meaningful) sector must be attended this much, the fast (noise) sector must stay below it, and
// the slow attention must exceed the fast by this gap. The measured values are near 0.45 and 0.003.
const SLOW_MIN = 0.1
const FAST_MAX = 0.05

function attention(interior: number[], signal: number[]): number {
  const a = quantileLabels({ series: interior, bins })
  const b = quantileLabels({ series: signal, bins })

  return mutualInformationBits(
    crossJointCounts({
      seriesA: a,
      seriesB: b,
      stateCount: bins,
      lag: 0,
    }),
  )
}

export default experiment({
  id: 'selves/structural-attention',
  title:
    'a self attends to its slow meaningful input far above an equal-size fast-noise input',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const driver = {
      L,
      beats,
      seed: 777,
      sectors: 2,
      interiorRadius: 6,
      cohesion: 0.4,
      flipProbabilities: [0.03, 0.4],
    }
    const live = drivenSelf({ ...driver, withDynamics: true })
    const dead = drivenSelf({ ...driver, withDynamics: false })

    const slowAttention = attention(
      live.interior,
      live.sectorSignals[0]!,
    )
    const fastAttention = attention(
      live.interior,
      live.sectorSignals[1]!,
    )
    const noDynamicsSlow = attention(
      dead.interior,
      dead.sectorSignals[0]!,
    )

    const ok =
      slowAttention > SLOW_MIN &&
      fastAttention < FAST_MAX &&
      slowAttention - fastAttention > SLOW_MIN &&
      noDynamicsSlow < FAST_MAX

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self interior carries far more mutual information with a slowly-varying meaningful input sector than with an equal-size fast-noise sector, and none without the dynamics, so the integrating self allocates structural attention to the persistent signal and filters out the noise',
      metrics: {
        slowAttention,
        fastAttention,
        attentionRatio: slowAttention / Math.max(fastAttention, 1e-6),
        noDynamicsSlow,
      },
      control: { fastAttention, noDynamicsSlow },
      notes:
        'the two sectors are the same size and geometry, only their signal timescale differs, so the asymmetry is attention to the meaningful over the noisy, not a geometric artifact',
    })
  },
})
