// P2 / P6 down-payment: parallel tempering to resolve the metastability.
// The warm-start study found two basins separated by a persistent gap, but at one
// chain and N about 70 the gap is partly slow mixing. Parallel tempering lets
// configurations migrate across a beta ladder and escape basins, so the order
// parameter and its fluctuations report true equilibrium. We look for a
// susceptibility peak (the transition) and coexistence (samples split between a
// layered and a manifold mode at the transition beta). See p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p2-tempering.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { smearedBenincasaDowker } from '~/dynamics/action'
import { parallelTempering } from '~/dynamics/parallel-tempering'
import { orderStatistics } from '~/measure/order-stats'

const SIZE = 48

function mean(xs: number[]): number {
  if (xs.length === 0) {
    return 0
  }
  let s = 0
  for (const x of xs) {
    s += x
  }
  return s / xs.length
}

function variance(xs: number[]): number {
  const m = mean(xs)
  let s = 0
  for (const x of xs) {
    s += (x - m) * (x - m)
  }
  return xs.length > 0 ? s / xs.length : 0
}

export function main(): void {
  // A finer ladder, concentrated at low beta where the action changes fastest, to
  // raise the swap acceptance.
  const betas = [0.1, 0.2, 0.35, 0.55, 0.8, 1.1, 1.5, 2.0]
  const action = smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 })
  const result = parallelTempering({
    size: SIZE,
    betas,
    action,
    sweeps: 800,
    movesPerSweep: 30,
    observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
    rng: makeRng({ seed: 21 }),
  })

  console.log(`P2/P6 parallel tempering (N=${SIZE}, smeared action eps=0.9)`)
  console.log(`  swap acceptance: ${(result.swapAcceptance * 100).toFixed(0)}%`)
  console.log('  beta   mean hr   susceptibility   manifold fraction (hr>1)')
  let peakBeta = 0
  let peakChi = -1
  for (let r = 0; r < betas.length; r++) {
    const samples = result.samplesByBeta[r] ?? []
    const m = mean(samples)
    const chi = variance(samples)
    const manifoldFrac =
      samples.length > 0
        ? samples.filter((x) => x > 1).length / samples.length
        : 0
    if (chi > peakChi) {
      peakChi = chi
      peakBeta = betas[r] ?? 0
    }
    console.log(
      `  ${(betas[r] ?? 0).toFixed(1).padStart(4)}  ${m.toFixed(2).padStart(7)}  ${chi.toFixed(3).padStart(13)}  ${(manifoldFrac * 100).toFixed(0).padStart(20)}%`,
    )
  }

  // Coexistence test: histogram the order parameter at the peak-susceptibility
  // beta. Two separated modes (low and high hr) is the first-order signature.
  let peakIndex = 0
  for (let r = 0; r < betas.length; r++) {
    if ((betas[r] ?? 0) === peakBeta) {
      peakIndex = r
    }
  }
  const peakSamples = result.samplesByBeta[peakIndex] ?? []
  const low = peakSamples.filter((x) => x < 0.8).length / Math.max(1, peakSamples.length)
  const mid = peakSamples.filter((x) => x >= 0.8 && x <= 1.3).length / Math.max(1, peakSamples.length)
  const high = peakSamples.filter((x) => x > 1.3).length / Math.max(1, peakSamples.length)
  console.log('')
  console.log(`  susceptibility peaks at beta=${peakBeta.toFixed(1)}`)
  console.log(
    `  order-parameter histogram there: layered(hr<0.8) ${(low * 100).toFixed(0)}%, middle ${(mid * 100).toFixed(0)}%, manifold(hr>1.3) ${(high * 100).toFixed(0)}%`,
  )
  const bimodal = low > 0.15 && high > 0.15 && mid < low + high
  console.log(`  coexistence (two modes both populated): ${bimodal ? 'YES' : 'no'}`)
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
