// P10: the cosmological constant (Sorkin's everpresent Lambda).
// In causal set theory the spacetime volume V is realized as the element count N,
// and Lambda is conjugate to V. The action S estimates the curvature-plus-Lambda
// term, so S ~ Lambda * V, and the fluctuation of Lambda is delta-Lambda ~
// delta-S / V. If delta-S scales as sqrt(V) (the Poisson volume fluctuation), then
// delta-Lambda ~ 1/sqrt(V), Sorkin's everpresent Lambda, which at the observed
// 4-volume gives the dark-energy magnitude. We measure the scaling exponent of the
// action fluctuation across sprinklings. See note/questions/next-version.md (P10).
// Run: npx tsx code/experiment/p10-cosmological-constant.ts

import { smearedBenincasaDowker, Action } from '@/code/dynamics/action'
import { actionFluctuationExponent } from '@/code/measure/action-fluctuation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function actionFluctuation(input: {
  action: Action
  sizes: number[]
  repeats: number
}): {
  sizes: number[]
  stds: number[]
  exponent: number
} {
  return actionFluctuationExponent({
    action: input.action,
    sizes: input.sizes,
    repeats: input.repeats,
    dimension: 2,
    seedMultiplier: 100,
  })
}

export default experiment({
  id: 'cosmology/cosmological-constant',
  code: 'E-CSM-0006',
  title:
    'the action fluctuation scales as the square root of volume, the everpresent-Lambda law',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const smeared = actionFluctuation({
      action: smearedBenincasaDowker({ epsilon: 0.5, dimension: 2 }),
      sizes: [64, 128, 256, 512],
      repeats: 30,
    })

    const exponent = smeared.exponent
    const deltaLambdaExp = exponent - 1
    const ok = Math.abs(exponent - 0.5) < 0.25

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the smeared causal-set action fluctuation grows about as the square root of the element count, giving a delta-Lambda that falls as one over the square root of volume',
      metrics: { exponent, deltaLambdaExp },
      notes:
        'L2, this reproduces Sorkin everpresent cosmological-constant scaling on Minkowski sprinklings, a known causal-set result. It uses seeded random sprinklings, so it is a statistical scaling, not a property of the deterministic base rule.',
    })
  },
})
