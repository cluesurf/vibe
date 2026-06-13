// P6: a computable Lorentzian path integral (2D).
// Run the causal-set Monte Carlo in 2D and report the mean recovered dimension
// of the sampled orders, the tractable end of the sum over histories.
// Run: npx tsx code/experiment/p6-path-integral.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { benincasaDowkerAction } from '@/code/dynamics/action'
import { sampleCausalSets } from '@/code/dynamics/mcmc'
import { myrheimMeyerDimension } from '@/code/measure/dimension'

export function main(): { meanDimension: number; acceptance: number } {
  const rng = makeRng({ seed: 11 })
  const action = benincasaDowkerAction({ epsilon: 1, dimension: 2 })
  const r = sampleCausalSets({
    size: 48,
    action,
    beta: 1,
    steps: 6000,
    rng,
    observe: ({ poset }) => myrheimMeyerDimension({ poset }),
  })
  console.log('P6 2D path integral (sum over histories)')
  console.log('  mean recovered dimension:', r.meanObservable.toFixed(3))
  console.log('  acceptance rate         :', r.acceptanceRate.toFixed(3))
  return { meanDimension: r.meanObservable, acceptance: r.acceptanceRate }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
