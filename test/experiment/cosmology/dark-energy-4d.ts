// P19: dark energy in 4D (the everpresent Lambda scaling).
// P10 measured the action-fluctuation scaling in 2D. The everpresent-Lambda
// prediction (Sorkin) is dimension-general: Lambda is conjugate to the spacetime
// 4-volume V, realized as the element count N, so delta-Lambda ~ delta-S / V, and if
// the action fluctuation scales as sqrt(V) the implied Lambda fluctuation is
// 1 / sqrt(V), the dark-energy magnitude at the observed 4-volume. Here we measure
// the 4D Benincasa-Dowker action fluctuation directly. See note/questions/frontiers.md.
// Run: npx tsx code/experiment/p19-dark-energy-4d.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { benincasaDowkerAction } from '@/code/dynamics/action'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function std(xs: number[]): number {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length)
}

function logLogSlope(xs: number[], ys: number[]): number {
  const lx = xs.map((x) => Math.log(x))
  const ly = ys.map((y) => Math.log(y))
  const n = lx.length
  const mx = lx.reduce((a, b) => a + b, 0) / n
  const my = ly.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += ((lx[i] ?? 0) - mx) * ((ly[i] ?? 0) - my)
    den += ((lx[i] ?? 0) - mx) * ((lx[i] ?? 0) - mx)
  }
  return den === 0 ? 0 : num / den
}

export function darkEnergy4D(input: { sizes: number[]; repeats: number }): {
  sizes: number[]
  stds: number[]
  actionExponent: number
  lambdaExponent: number
} {
  const action = benincasaDowkerAction({ epsilon: 1, dimension: 4 })
  const stds: number[] = []
  for (const nn of input.sizes) {
    const samples: number[] = []
    for (let r = 0; r < input.repeats; r++) {
      const poset = sprinkleMinkowski({ dimension: 4, count: nn, rng: makeRng({ seed: nn * 1000 + r }) })
      samples.push(action.value({ poset }))
    }
    stds.push(std(samples))
  }
  const actionExponent = logLogSlope(input.sizes, stds)
  return { sizes: input.sizes, stds, actionExponent, lambdaExponent: actionExponent - 1 }
}

export default defineExperiment({
  id: 'cosmology/dark-energy-4d',
  title: 'the 4D action fluctuation scaling is measured',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = darkEnergy4D({ sizes: [64, 128, 256], repeats: 10 })
    const increasing = (r.stds[0] ?? 0) < (r.stds[1] ?? 0) && (r.stds[1] ?? 0) < (r.stds[2] ?? 0)
    const ok = increasing && r.actionExponent > 0.5 && r.actionExponent < 2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the sharp 4D Benincasa-Dowker action fluctuation grows with volume, the action-fluctuation problem',
      metrics: { actionExponent: r.actionExponent },
    })
  },
})
