// P29: dark energy in 4D with the smeared kernel (closing P19).
// P19 measured the SHARP 4D Benincasa-Dowker action and found the fluctuation problem
// (the implied Lambda grows with volume, the wrong sign for the everpresent Lambda).
// P10 showed that in 2D the SMEARED (nonlocal) action tames this so the implied Lambda
// SHRINKS with volume, the everpresent direction. Here we use the now-implemented 4D
// smeared kernel and check the same: does smearing tame the 4D fluctuation so that the
// implied Lambda shrinks with the spacetime 4-volume, the dark-energy behaviour?
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p29-dark-energy-smeared.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { benincasaDowkerAction, smearedBenincasaDowker, Action } from '@/code/dynamics/action'
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

function fluctuationExponent(input: { action: Action; sizes: number[]; repeats: number }): {
  stds: number[]
  exponent: number
} {
  const stds = input.sizes.map((nn) => {
    const samples: number[] = []
    for (let r = 0; r < input.repeats; r++) {
      const poset = sprinkleMinkowski({ dimension: 4, count: nn, rng: makeRng({ seed: nn * 1000 + r }) })
      samples.push(input.action.value({ poset }))
    }
    return std(samples)
  })
  return { stds, exponent: logLogSlope(input.sizes, stds) }
}

export function darkEnergySmeared4D(input: { sizes: number[]; repeats: number; epsilon: number }): {
  sharpExponent: number
  smearedExponent: number
  sharpLambda: number
  smearedLambda: number
} {
  const sharp = fluctuationExponent({
    action: benincasaDowkerAction({ epsilon: 1, dimension: 4 }),
    sizes: input.sizes,
    repeats: input.repeats,
  })
  const smeared = fluctuationExponent({
    action: smearedBenincasaDowker({ epsilon: input.epsilon, dimension: 4 }),
    sizes: input.sizes,
    repeats: input.repeats,
  })
  return {
    sharpExponent: sharp.exponent,
    smearedExponent: smeared.exponent,
    sharpLambda: sharp.exponent - 1,
    smearedLambda: smeared.exponent - 1,
  }
}

export default defineExperiment({
  id: 'cosmology/dark-energy-smeared',
  title: '4D smeared kernel tames the fluctuation (toward everpresent Lambda)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = darkEnergySmeared4D({ sizes: [64, 128, 256, 512], repeats: 20, epsilon: 0.3 })
    const ok = r.smearedExponent < r.sharpExponent && Number.isFinite(r.smearedExponent)
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 4D smeared kernel pushes the action-fluctuation exponent below the sharp value, toward the everpresent shrinking',
      metrics: { sharpExponent: r.sharpExponent, smearedExponent: r.smearedExponent },
    })
  },
})
