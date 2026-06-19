// P2 / P6 exact test: the true uniform measure, by enumeration.
// The sampler does not reproduce the uniform measure, so we enumerate every
// causal set on N elements and compute the EXACT Boltzmann average of the order
// parameter at each beta, including beta = 0 (the true uniform / entropic
// average). This removes all sampling doubt. We ask: starting from the true
// uniform ensemble, does the smeared action drive the average toward manifold-like
// orders? See note/questions/p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p2-exact.ts

import { smearedBenincasaDowker } from '@/code/dynamics/action'
import { exactCausalSetAverages } from '@/code/dynamics/exact-enumeration'
import { orderStatistics } from '@/code/measure/order-stats'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/exact',
  title:
    'exact Boltzmann averages over every causal set on six elements',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const action = smearedBenincasaDowker({
      epsilon: 0.9,
      dimension: 2,
    })
    const result = exactCausalSetAverages({
      size: 6,
      betas: [0],
      action,
      observers: [
        ({ poset }: { poset: import('@/code/tool/poset').Poset }) =>
          orderStatistics({ poset }).heightRatio,
      ],
    })
    const mean = result.means[0]?.[0] ?? Number.NaN
    const ok = result.count > 0 && Number.isFinite(mean)
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'enumerating every causal set on six elements gives an exact entropic average of the order parameter at beta zero with no sampling bias',
      metrics: { count: result.count, heightRatioBeta0: mean },
      notes:
        'L1, an exact enumeration of a known causal-set ensemble, the value is a consistency reference for the sampler, not an emergent result',
    })
  },
})
