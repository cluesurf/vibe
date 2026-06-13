// P2 / P6 exact test: the true uniform measure, by enumeration.
// The sampler does not reproduce the uniform measure, so we enumerate every
// causal set on N elements and compute the EXACT Boltzmann average of the order
// parameter at each beta, including beta = 0 (the true uniform / entropic
// average). This removes all sampling doubt. We ask: starting from the true
// uniform ensemble, does the smeared action drive the average toward manifold-like
// orders? See note/questions/p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p2-exact.ts

import { pathToFileURL } from 'node:url'
import { smearedBenincasaDowker } from '@/code/dynamics/action'
import { exactCausalSetAverages } from '@/code/dynamics/exact-enumeration'
import { orderStatistics } from '@/code/measure/order-stats'

export function main(): void {
  const betas = [0, 0.5, 1, 2, 4]
  const action = smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 })
  const observers = [
    ({ poset }: { poset: import('@/code/tool/poset').Poset }) => orderStatistics({ poset }).heightRatio,
    ({ poset }: { poset: import('@/code/tool/poset').Poset }) => orderStatistics({ poset }).mmDimension,
    ({ poset }: { poset: import('@/code/tool/poset').Poset }) =>
      orderStatistics({ poset }).heightRatio > 1 ? 1 : 0,
  ]

  for (const size of [6, 7]) {
    const result = exactCausalSetAverages({ size, betas, action, observers })
    console.log(`Exact enumeration, N=${size}: ${result.count} causal sets`)
    console.log('  beta   <height ratio>   <MM dim>   manifold fraction')
    for (let b = 0; b < betas.length; b++) {
      const m = result.means[b] ?? [0, 0, 0]
      console.log(
        `  ${(betas[b] ?? 0).toFixed(1).padStart(4)}  ${(m[0] ?? 0).toFixed(3).padStart(13)}  ${(m[1] ?? 0).toFixed(3).padStart(9)}  ${((m[2] ?? 0) * 100).toFixed(0).padStart(15)}%`,
      )
    }
    console.log('')
  }
  console.log('  beta=0 is the exact uniform (entropic) average. Rising beta shows the')
  console.log('  smeared action effect on the TRUE measure, with no sampling bias.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
