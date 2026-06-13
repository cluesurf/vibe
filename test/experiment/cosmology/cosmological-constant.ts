// P10: the cosmological constant (Sorkin's everpresent Lambda).
// In causal set theory the spacetime volume V is realized as the element count N,
// and Lambda is conjugate to V. The action S estimates the curvature-plus-Lambda
// term, so S ~ Lambda * V, and the fluctuation of Lambda is delta-Lambda ~
// delta-S / V. If delta-S scales as sqrt(V) (the Poisson volume fluctuation), then
// delta-Lambda ~ 1/sqrt(V), Sorkin's everpresent Lambda, which at the observed
// 4-volume gives the dark-energy magnitude. We measure the scaling exponent of the
// action fluctuation across sprinklings. See note/questions/next-version.md (P10).
// Run: npx tsx code/experiment/p10-cosmological-constant.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { benincasaDowkerAction, smearedBenincasaDowker, Action } from '@/code/dynamics/action'
import { logLogSlope } from '@/code/measure/regression'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function stdAndMean(xs: number[]): { mean: number; std: number } {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const variance = xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / xs.length
  return { mean, std: Math.sqrt(variance) }
}

function actionFluctuation(input: { action: Action; sizes: number[]; repeats: number }): {
  sizes: number[]
  stds: number[]
  exponent: number
} {
  const stds: number[] = []
  for (const n of input.sizes) {
    const samples: number[] = []
    for (let r = 0; r < input.repeats; r++) {
      const poset = sprinkleMinkowski({ dimension: 2, count: n, rng: makeRng({ seed: n * 100 + r }) })
      samples.push(input.action.value({ poset }))
    }
    stds.push(stdAndMean(samples).std)
  }
  return { sizes: input.sizes, stds, exponent: logLogSlope(input.sizes, stds) }
}

export default defineExperiment({
  id: 'cosmology/cosmological-constant',
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
