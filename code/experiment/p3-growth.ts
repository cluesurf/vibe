// P3 under growth: does the both-worlds substrate survive an expanding mesh?
// The static result showed a hyperbolic random graph has exponential reach,
// Lorentz isotropy, and greedy navigability at once. Here we grow the mesh: the
// disc radius increases with ln(N) so the density stays constant (Vibe Theory's
// eternal expansion), and we re-measure the three properties at each size. If they
// persist across the growth, the result lifts from a one-shot construction to a
// stable, growing vibe mesh. See note/questions/roadmap.md (A2).
// Run: npx tsx code/experiment/p3-growth.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { Graph } from '~/tool/graph'
import { ballGrowth } from '~/measure/dimension'
import { lorentzIsotropy } from '~/measure/lorentz'
import { greedyRoutingSuccess, routingWithBacktrack } from '~/measure/navigation'

function meanDegree(graph: Graph): number {
  let total = 0
  for (let i = 0; i < graph.size; i++) {
    total += (graph.neighbors[i] ?? new Uint32Array(0)).length
  }
  return total / Math.max(1, graph.size)
}

// Geometric mean of successive ball-count ratios in the unsaturated regime. For
// exponential reach this is well above 1; for polynomial growth it tends to 1.
// More robust than a boolean at constant density, where the disc saturates fast.
function growthRatio(input: { growth: Uint32Array; total: number }): number {
  let logSum = 0
  let count = 0
  for (let r = 0; r + 1 < input.growth.length; r++) {
    const cur = input.growth[r] ?? 0
    const next = input.growth[r + 1] ?? 0
    if (cur > 1 && cur < 0.6 * input.total && next > cur) {
      logSum += Math.log(next / cur)
      count += 1
    }
  }
  return count > 0 ? Math.exp(logSum / count) : 0
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
    const growth = ballGrowth({ substrate: graph, center, maxRadius: 14 })
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

export function main(): void {
  const base = 400
  const sizes = [400, 800, 1600, 3200]
  console.log('P3 under growth: an expanding hyperbolic mesh (density held constant)')
  console.log('  size   radius  meanDeg  growthRatio  anisotropy  greedy   backtrack')
  const rows = sizes.map((size) => snapshot({ size, base }))
  for (const r of rows) {
    console.log(
      `  ${String(r.size).padStart(4)}   ${r.radius.toFixed(2).padStart(5)}  ${r.meanDegree.toFixed(1).padStart(6)}  ${r.growthRatio.toFixed(2).padStart(10)}  ${r.anisotropy.toFixed(3).padStart(9)}  ${(r.greedy * 100).toFixed(0).padStart(5)}%  ${(r.backtrack * 100).toFixed(0).padStart(8)}%`,
    )
  }
  const allReach = rows.every((r) => r.growthRatio > 1.5)
  const allIsotropic = rows.every((r) => r.anisotropy < 0.25)
  const allNavigable = rows.every((r) => r.backtrack > 0.95)
  console.log('')
  console.log(`  reach exponential (growth ratio > 1.5):  ${allReach ? 'YES' : 'no'}`)
  console.log(`  Lorentz-safe (anisotropy < 0.25):        ${allIsotropic ? 'YES' : 'no'}`)
  console.log(`  navigable (backtrack > 95%):             ${allNavigable ? 'YES' : 'no'}`)
  console.log('')
  console.log(
    `  both-worlds property survives growth: ${allReach && allIsotropic && allNavigable ? 'YES' : 'no'}`,
  )
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
