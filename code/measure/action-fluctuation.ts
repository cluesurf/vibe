// The scaling of a causal-set action's fluctuation with spacetime volume. For each element count the
// action is evaluated over independent Minkowski sprinklings and its standard deviation taken, then the
// log-log slope of std versus count is the fluctuation exponent. Sorkin's everpresent-Lambda picture:
// Lambda is conjugate to the 4-volume V (realized as the count N), so delta-Lambda ~ delta-S / V, and a
// sqrt(V) action fluctuation gives delta-Lambda ~ 1 / sqrt(V), the dark-energy magnitude. The exponent
// minus one is the implied Lambda-fluctuation exponent.

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { Action } from '@/code/dynamics/action'
import { logLogSlope } from '@/code/measure/regression'

export function actionFluctuationExponent(input: {
  action: Action
  sizes: ReadonlyArray<number>
  repeats: number
  dimension: number
  seedMultiplier?: number
}): { sizes: number[]; stds: number[]; exponent: number } {
  const seedMultiplier = input.seedMultiplier ?? 1000
  const stds: number[] = []

  for (const n of input.sizes) {
    const samples: number[] = []

    for (let r = 0; r < input.repeats; r++) {
      const poset = sprinkleMinkowski({
        dimension: input.dimension,
        count: n,
        rng: makeRng({ seed: n * seedMultiplier + r }),
      })

      samples.push(input.action.value({ poset }))
    }

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    const variance =
      samples.reduce((a, b) => a + (b - mean) * (b - mean), 0) /
      samples.length

    stds.push(Math.sqrt(variance))
  }

  return {
    sizes: [...input.sizes],
    stds,
    exponent: logLogSlope([...input.sizes], stds),
  }
}
