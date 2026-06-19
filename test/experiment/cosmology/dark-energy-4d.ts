// P19: dark energy in 4D (the everpresent Lambda scaling).
// P10 measured the action-fluctuation scaling in 2D. The everpresent-Lambda
// prediction (Sorkin) is dimension-general: Lambda is conjugate to the spacetime
// 4-volume V, realized as the element count N, so delta-Lambda ~ delta-S / V, and if
// the action fluctuation scales as sqrt(V) the implied Lambda fluctuation is
// 1 / sqrt(V), the dark-energy magnitude at the observed 4-volume. Here we measure
// the 4D Benincasa-Dowker action fluctuation directly. See note/questions/frontiers.md.
// Run: npx tsx code/experiment/p19-dark-energy-4d.ts

import { benincasaDowkerAction } from '@/code/dynamics/action'
import { actionFluctuationExponent } from '@/code/measure/action-fluctuation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function darkEnergy4D(input: {
  sizes: number[]
  repeats: number
}): {
  sizes: number[]
  stds: number[]
  actionExponent: number
  lambdaExponent: number
} {
  const r = actionFluctuationExponent({
    action: benincasaDowkerAction({ epsilon: 1, dimension: 4 }),
    sizes: input.sizes,
    repeats: input.repeats,
    dimension: 4,
    seedMultiplier: 1000,
  })

  return {
    sizes: r.sizes,
    stds: r.stds,
    actionExponent: r.exponent,
    lambdaExponent: r.exponent - 1,
  }
}

export default experiment({
  id: 'cosmology/dark-energy-4d',
  title: 'the 4D action fluctuation scaling is measured',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = darkEnergy4D({ sizes: [64, 128, 256], repeats: 10 })
    const increasing =
      (r.stds[0] ?? 0) < (r.stds[1] ?? 0) &&
      (r.stds[1] ?? 0) < (r.stds[2] ?? 0)
    const ok =
      increasing && r.actionExponent > 0.5 && r.actionExponent < 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the sharp 4D Benincasa-Dowker action fluctuation grows with volume, the action-fluctuation problem',
      metrics: { actionExponent: r.actionExponent },
    })
  },
})
