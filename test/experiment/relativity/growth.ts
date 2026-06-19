// P3 under growth: does the both-worlds substrate survive an expanding mesh?
// The static result showed a hyperbolic random graph has exponential reach,
// Lorentz isotropy, and greedy navigability at once. Here we grow the mesh: the
// disc radius increases with ln(N) so the density stays constant (Vibe Theory's
// eternal expansion), and we re-measure the three properties at each size. If they
// persist across the growth, the result lifts from a one-shot construction to a
// stable, growing vibe mesh. See note/questions/roadmap.md (A2).
// Run: npx tsx code/experiment/p3-growth.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { meanDegree } from '@/code/tool/graph'
import {
  ballGrowth,
  geometricUnsaturatedGrowthRatio,
} from '@/code/measure/dimension'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import {
  greedyRoutingSuccess,
  routingWithBacktrack,
} from '@/code/measure/navigation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Geometric mean of successive ball-count ratios in the unsaturated regime. For
// exponential reach this is well above 1; for polynomial growth it tends to 1.
// More robust than a boolean at constant density, where the disc saturates fast.
function growthRatio(input: {
  growth: Uint32Array
  total: number
}): number {
  return geometricUnsaturatedGrowthRatio(input)
}

interface Row {
  size: number
  radius: number
  meanDegree: number
  growthRatio: number
  anisotropy: number
  greedy: number
  backtrack: number
}

function snapshot(input: { size: number; base: number }): Row {
  // Grow the radius with ln(N) to hold density (and so mean degree) constant. The
  // base radius 5.7 reproduces the both-worlds density (mean degree ~11) at the
  // smallest size, and grows to 7.0 at N=1500, matching the static study.
  const radius = 5.7 + Math.log(input.size / input.base)
  const rng = makeRng({ seed: 4000 + input.size })
  const graph = hyperbolicGraph({
    count: input.size,
    radius,
    connectThreshold: 3.0,
    rng,
  })
  // Average the growth ratio over several centers so one boundary node does not
  // skew the finite-size estimate.
  let ratioSum = 0
  let ratioCount = 0
  for (let c = 0; c < 6; c++) {
    const center = c === 0 ? 0 : rng.nextInt({ max: graph.size })
    const growth = ballGrowth({
      substrate: graph,
      center,
      maxRadius: 14,
    })
    const ratio = growthRatio({ growth, total: graph.size })
    if (ratio > 0) {
      ratioSum += ratio
      ratioCount += 1
    }
  }
  const meanGrowthRatio = ratioCount > 0 ? ratioSum / ratioCount : 0
  const iso = lorentzIsotropy({ substrate: graph, samples: 400, rng })
  const greedy = greedyRoutingSuccess({ graph, trials: 400, rng })
  const backtrack = routingWithBacktrack({ graph, trials: 400, rng })
  return {
    size: input.size,
    radius,
    meanDegree: meanDegree(graph),
    growthRatio: meanGrowthRatio,
    anisotropy: iso.anisotropy,
    greedy: greedy.successRate,
    backtrack: backtrack.successRate,
  }
}

export default experiment({
  id: 'relativity/growth',
  title:
    'an expanding hyperbolic mesh keeps exponential reach, isotropy, and navigability',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const base = 400
    const sizes = [400, 800, 1600, 3200]
    const rows = sizes.map(size => snapshot({ size, base }))
    const allReach = rows.every(r => r.growthRatio > 1.5)
    const allIsotropic = rows.every(r => r.anisotropy < 0.25)
    const allNavigable = rows.every(r => r.backtrack > 0.95)
    const ok = allReach && allIsotropic && allNavigable
    const last = rows[rows.length - 1]!
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hyperbolic mesh grown at constant density keeps exponential reach, low Lorentz anisotropy, and high routing success at every size',
      metrics: {
        largestSize: last.size,
        largestGrowthRatio: last.growthRatio,
        largestAnisotropy: last.anisotropy,
        largestBacktrack: last.backtrack,
      },
      notes:
        'L2, the both-worlds hyperbolic-graph result extended across lattice SIZE (the deterministic-friendly robustness axis). The growth ratio above 1.5 is the exponential-reach control against polynomial growth tending to 1. The graph is built from random point placement at fixed seeds, so reach and isotropy are statistical properties of the ensemble, not of the deterministic base rule.',
    })
  },
})
