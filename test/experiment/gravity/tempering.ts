// P2 / P6 down-payment: parallel tempering to resolve the metastability.
// The warm-start study found two basins separated by a persistent gap, but at one
// chain and N about 70 the gap is partly slow mixing. Parallel tempering lets
// configurations migrate across a beta ladder and escape basins, so the order
// parameter and its fluctuations report true equilibrium. We look for a
// susceptibility peak (the transition) and coexistence (samples split between a
// layered and a manifold mode at the transition beta). See p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p2-tempering.ts

import { makeRng } from '@/code/tool/rng'
import { smearedBenincasaDowker } from '@/code/dynamics/action'
import { parallelTempering } from '@/code/dynamics/parallel-tempering'
import { orderStatistics } from '@/code/measure/order-stats'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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

export default defineExperiment({
  id: 'gravity/tempering',
  title: 'parallel tempering finds a susceptibility peak and order-parameter coexistence in the causal-set action',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const betas = [0.1, 0.2, 0.35, 0.55, 0.8, 1.1, 1.5, 2.0]
    const action = smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 })
    const result = parallelTempering({
      size: SIZE,
      betas,
      action,
      sweeps: 150,
      movesPerSweep: 15,
      observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
      rng: makeRng({ seed: 21 }),
    })

    let peakBeta = 0
    let peakChi = -1
    let peakIndex = 0
    for (let r = 0; r < betas.length; r++) {
      const samples = result.samplesByBeta[r] ?? []
      const chi = variance(samples)
      if (chi > peakChi) {
        peakChi = chi
        peakBeta = betas[r] ?? 0
        peakIndex = r
      }
    }
    const peakSamples = result.samplesByBeta[peakIndex] ?? []
    const denom = Math.max(1, peakSamples.length)
    const low = peakSamples.filter((x) => x < 0.8).length / denom
    const mid =
      peakSamples.filter((x) => x >= 0.8 && x <= 1.3).length / denom
    const high = peakSamples.filter((x) => x > 1.3).length / denom
    const bimodal = low > 0.15 && high > 0.15 && mid < low + high

    return verdict({
      status: peakChi > 0 && bimodal ? 'pass' : 'partial',
      claim:
        'parallel tempering across a beta ladder shows a susceptibility peak and a two-mode order-parameter histogram, the signature of a first-order layered-to-manifold transition',
      metrics: {
        peakBeta,
        peakSusceptibility: peakChi,
        swapAcceptance: result.swapAcceptance,
        layeredFraction: low,
        middleFraction: mid,
        manifoldFraction: high,
      },
      notes:
        'L2 known physics (a Monte Carlo first-order transition reproduced on the causal-set action). This is a STATISTICAL ensemble claim, not a deterministic-rule property, it relies on a seeded random Metropolis schedule and random swap proposals (seed 21). Robustness would need varying SIZE, not seeds. The susceptibility peak and the bimodal histogram are the measured signatures, but there is no negative-substrate control here.',
    })
  },
})
