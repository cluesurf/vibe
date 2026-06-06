// P19: dark energy in 4D (the everpresent Lambda scaling).
// P10 measured the action-fluctuation scaling in 2D. The everpresent-Lambda
// prediction (Sorkin) is dimension-general: Lambda is conjugate to the spacetime
// 4-volume V, realized as the element count N, so delta-Lambda ~ delta-S / V, and if
// the action fluctuation scales as sqrt(V) the implied Lambda fluctuation is
// 1 / sqrt(V), the dark-energy magnitude at the observed 4-volume. Here we measure
// the 4D Benincasa-Dowker action fluctuation directly. See note/questions/frontiers.md.
// Run: npx tsx code/experiment/p19-dark-energy-4d.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { benincasaDowkerAction } from '~/dynamics/action'

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

export function main(): void {
  console.log('P19: dark energy in 4D, the everpresent Lambda scaling')
  console.log('')
  const r = darkEnergy4D({ sizes: [64, 128, 256, 512], repeats: 20 })
  console.log('  N      std(S) of the 4D Benincasa-Dowker action')
  for (let i = 0; i < r.sizes.length; i++) {
    console.log(`  ${String(r.sizes[i]).padStart(4)}   ${(r.stds[i] ?? 0).toFixed(2)}`)
  }
  console.log('')
  console.log(`  action fluctuation: std(S) ~ N^${r.actionExponent.toFixed(2)}`)
  console.log(`  implied Lambda fluctuation: delta-Lambda ~ N^${r.lambdaExponent.toFixed(2)}`)
  console.log('  Sorkin everpresent Lambda predicts delta-Lambda ~ 1/sqrt(V) = N^(-0.5).')
  console.log('')
  console.log('  Reading the result. The implied exponent is positive (about +0.16), so the')
  console.log('  SHARP 4D Benincasa-Dowker action shows the known fluctuation problem: its')
  console.log('  fluctuation grows faster than the volume, less severely than in 2D (+0.47 there)')
  console.log('  but still the wrong sign for the everpresent Lambda. This matches P10: the sharp')
  console.log('  action has the fluctuation problem, and only the SMEARED (nonlocal) action tames')
  console.log('  it so the implied Lambda shrinks with volume. We showed that in 2D (P10,')
  console.log('  delta-Lambda ~ N^-0.29). The 4D smeared kernel (the 4D nonlocal smearing function')
  console.log('  of Benincasa-Dowker) is the next implementation step to recover the everpresent')
  console.log('  1/sqrt(V) in four dimensions. The mechanism is in hand, the 4D smearing is the gap.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
