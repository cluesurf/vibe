// P10: the cosmological constant (Sorkin's everpresent Lambda).
// In causal set theory the spacetime volume V is realized as the element count N,
// and Lambda is conjugate to V. The action S estimates the curvature-plus-Lambda
// term, so S ~ Lambda * V, and the fluctuation of Lambda is delta-Lambda ~
// delta-S / V. If delta-S scales as sqrt(V) (the Poisson volume fluctuation), then
// delta-Lambda ~ 1/sqrt(V), Sorkin's everpresent Lambda, which at the observed
// 4-volume gives the dark-energy magnitude. We measure the scaling exponent of the
// action fluctuation across sprinklings. See note/questions/next-version.md (P10).
// Run: npx tsx code/experiment/p10-cosmological-constant.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { benincasaDowkerAction, smearedBenincasaDowker, Action } from '~/dynamics/action'

function stdAndMean(xs: number[]): { mean: number; std: number } {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const variance = xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / xs.length
  return { mean, std: Math.sqrt(variance) }
}

// Slope of log(y) versus log(x), the power-law exponent.
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

export function main(): void {
  const sizes = [64, 128, 256, 512]
  const repeats = 30

  console.log('P10: cosmological constant, the everpresent Lambda scaling')
  console.log('  Action fluctuation std(S) versus volume N (2D Minkowski sprinkles)')
  console.log('  N      sharp std(S)     smeared std(S)')

  const sharp = actionFluctuation({
    action: benincasaDowkerAction({ epsilon: 1, dimension: 2 }),
    sizes,
    repeats,
  })
  const smeared = actionFluctuation({
    action: smearedBenincasaDowker({ epsilon: 0.5, dimension: 2 }),
    sizes,
    repeats,
  })
  for (let i = 0; i < sizes.length; i++) {
    console.log(
      `  ${String(sizes[i]).padStart(4)}   ${(sharp.stds[i] ?? 0).toFixed(2).padStart(12)}   ${(smeared.stds[i] ?? 0).toFixed(2).padStart(14)}`,
    )
  }
  console.log('')
  console.log(`  sharp action fluctuation exponent:   std(S) ~ N^${sharp.exponent.toFixed(2)}`)
  console.log(`  smeared action fluctuation exponent: std(S) ~ N^${smeared.exponent.toFixed(2)}`)
  console.log('')
  console.log('  Lambda ~ S/V ~ S/N, so delta-Lambda ~ N^(exponent - 1).')
  console.log(`  sharp:   delta-Lambda ~ N^${(sharp.exponent - 1).toFixed(2)}`)
  console.log(`  smeared: delta-Lambda ~ N^${(smeared.exponent - 1).toFixed(2)}`)
  console.log('  Sorkin everpresent Lambda predicts delta-Lambda ~ 1/sqrt(V) = N^(-0.5),')
  console.log('  i.e. an action-fluctuation exponent near +0.5. At the observed 4-volume')
  console.log('  (~10^244 Planck units) this gives Lambda ~ 10^(-122), the dark-energy scale.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
