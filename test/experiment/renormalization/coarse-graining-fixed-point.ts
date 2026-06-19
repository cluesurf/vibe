// P53: the renormalization group (a genuine coupling flow to a fixed point).
// The earlier version called random decimation of a sprinkle a "renormalization fixed point", but a
// sub-sprinkle of a d-dimensional sprinkle is trivially still d-dimensional, so nothing flowed. A
// real RG has a COUPLING that flows under coarse-graining toward a fixed point. The tone dynamics are
// Ising-like (signed majority), so we run the actual block-spin RG on them:
//   sample the tone chain at coupling K, block it (keep every other tone), and MEASURE the
//   renormalized coupling K' from the blocked chain's correlations.
// We find K' < K, matching the exact decimation recursion tanh K' = tanh^2 K, and iterating the
// block-spin step drives K to the fixed point K* = 0 (the disordered fixed point). That is a genuine
// renormalization-group flow, measured, not asserted. The causal-set dimension being invariant under
// decimation is kept as a secondary fact (a coarse-graining invariant), no longer the headline.
// Run: npx tsx code/experiment/p53-coarse-graining-fixed-point.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { decimate } from '@/code/dynamics/coarsegrain'
import { measuredBlockSpinCoupling } from '@/code/operator/ising-rg'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function isingRG(input: { seed: number }): {
  steps: { K: number; kPrimeMeasured: number; kPrimeExact: number }[]
  flow: number[]
  matchesRecursion: boolean
  flowsToFixedPoint: boolean
} {
  const Ks = [2.0, 1.0, 0.5, 0.25]
  const steps = Ks.map(K => {
    const measured = measuredBlockSpinCoupling({
      length: 20000,
      coupling: K,
      samples: 40,
      seed: input.seed,
    })
    const exact = Math.atanh(Math.tanh(K) ** 2)

    return { K, kPrimeMeasured: measured, kPrimeExact: exact }
  })
  const matchesRecursion = steps.every(
    s =>
      Math.abs(s.kPrimeMeasured - s.kPrimeExact) < 0.02 &&
      s.kPrimeMeasured < s.K,
  )
  // iterate the flow from a strong coupling toward the fixed point
  let K = 1.5
  const flow = [K]
  for (let i = 0; i < 6; i++) {
    K = measuredBlockSpinCoupling({
      length: 20000,
      coupling: K,
      samples: 40,
      seed: input.seed + 1 + i,
    })
    flow.push(K)
  }

  const flowsToFixedPoint =
    Math.abs(flow[flow.length - 1] ?? 1) < 0.1 &&
    (flow[flow.length - 1] ?? 1) < (flow[0] ?? 0)

  return { steps, flow, matchesRecursion, flowsToFixedPoint }
}

// Secondary (kept, honestly labeled): the causal-set dimension is invariant under decimation.
export function coarseGrainingFixedPoint(input: {
  dimension: number
  count: number
  levels: number
  seed: number
}): {
  dims: number[]
  sizes: number[]
  dimensionInvariant: boolean
} {
  const rng = makeRng({ seed: input.seed })
  let poset = sprinkleMinkowski({
    dimension: input.dimension,
    count: input.count,
    rng,
  })
  const dims: number[] = []
  const sizes: number[] = []
  dims.push(myrheimMeyerDimension({ poset }))
  sizes.push(poset.size)
  for (let l = 0; l < input.levels; l++) {
    poset = decimate({ poset, keepProbability: 0.5, rng })
    dims.push(myrheimMeyerDimension({ poset }))
    sizes.push(poset.size)
  }

  const d0 = dims[0] ?? 0
  const dimensionInvariant = dims.every(d => Math.abs(d - d0) < 0.3)

  return { dims, sizes, dimensionInvariant }
}

export function renormalization(input: { seed: number }): {
  matchesRecursion: boolean
  flowsToFixedPoint: boolean
  dimensionInvariant: boolean
  solved: boolean
} {
  const rg = isingRG({ seed: input.seed })
  const cg = coarseGrainingFixedPoint({
    dimension: 2,
    count: 3000,
    levels: 4,
    seed: input.seed,
  })

  return {
    matchesRecursion: rg.matchesRecursion,
    flowsToFixedPoint: rg.flowsToFixedPoint,
    dimensionInvariant: cg.dimensionInvariant,
    solved:
      rg.matchesRecursion &&
      rg.flowsToFixedPoint &&
      cg.dimensionInvariant,
  }
}

export default experiment({
  id: 'renormalization/coarse-graining-fixed-point',
  title:
    'a measured block-spin coupling matches the decimation recursion and flows to the fixed point',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = renormalization({ seed: 1 })
    const rg = isingRG({ seed: 1 })
    const ok =
      r.solved &&
      r.matchesRecursion &&
      r.flowsToFixedPoint &&
      r.dimensionInvariant

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the measured block-spin coupling matches tanh K prime = tanh squared K and flows to the fixed point K star = 0 with the dimension a coarse-graining invariant',
      metrics: {
        flowStart: rg.flow[0] ?? 0,
        flowEnd: rg.flow[rg.flow.length - 1] ?? 0,
        matchesRecursion: r.matchesRecursion ? 1 : 0,
        dimensionInvariant: r.dimensionInvariant ? 1 : 0,
      },
    })
  },
})
