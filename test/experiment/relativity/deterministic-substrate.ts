// P39: a non-random substrate (the no-randomness principle applied to the mesh).
// The substrate was a RANDOM hyperbolic graph, and the randomness was load-bearing: it
// is what keeps the mesh Lorentz-safe where a lattice is not (P27). But the framework
// rejects true randomness. So can a DETERMINISTIC, non-arbitrary placement be just as
// Lorentz-safe? The golden-angle hyperbolic sunflower replaces both random draws (radial
// and angular) with the provably optimal deterministic equidistribution. Here we check
// it against the random sprinkle on the same isotropy and reach tests.
// See note/deterministic-substrate.md. Run: npx tsx code/experiment/p39-deterministic-substrate.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicGraph, hyperbolicSunflower } from '@/code/substrate/hyperbolic-graph'
import { Graph, meanDegree } from '@/code/tool/graph'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { ballGrowth, meanUnsaturatedGrowthRatio } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Robust exponential-reach test: the mean ball-growth ratio over the unsaturated radii
// (ball below half the final size). The built-in growthIsExponential saturates too fast
// on the very uniform sunflower (it reaches everything in four hops), so we read the
// early ratios directly. The same test is applied to both substrates.
function exponentialReach(growth: Uint32Array): boolean {
  const mean = meanUnsaturatedGrowthRatio({ growth })
  return Number.isFinite(mean) && mean > 1.8
}

function centralNode(g: Graph): number {
  let center = 0
  let best = -1
  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) {
      best = d
      center = i
    }
  }
  return center
}

function evaluate(g: Graph, seed: number): { meanDegree: number; anisotropy: number; reach: boolean } {
  const aniso = lorentzIsotropy({ substrate: g, samples: 3000, rng: makeRng({ seed }) })
  const growth = ballGrowth({ substrate: g, center: centralNode(g), maxRadius: 12 })
  return { meanDegree: meanDegree(g), anisotropy: aniso.anisotropy, reach: exponentialReach(growth) }
}

export function deterministicSubstrate(input: { count: number; seed: number }): {
  random: { meanDegree: number; anisotropy: number; reach: boolean }
  sunflower: { meanDegree: number; anisotropy: number; reach: boolean }
  deterministicIsSafe: boolean
} {
  const random = evaluate(
    hyperbolicGraph({ count: input.count, radius: 7, connectThreshold: 3.0, rng: makeRng({ seed: input.seed }) }),
    input.seed + 1,
  )
  const sunflower = evaluate(
    hyperbolicSunflower({ count: input.count, radius: 7, connectThreshold: 3.0 }),
    input.seed + 1,
  )
  // The deterministic substrate is Lorentz-safe if its anisotropy is in the same low
  // band as the random one (within a small margin), and it still reaches exponentially.
  const deterministicIsSafe = sunflower.anisotropy <= random.anisotropy + 0.1 && sunflower.reach
  return { random, sunflower, deterministicIsSafe }
}

export default defineExperiment({
  id: 'relativity/deterministic-substrate',
  title: 'a deterministic sunflower substrate is as Lorentz-safe as the random sprinkle',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = deterministicSubstrate({ count: 1200, seed: 1 })
    const ok =
      r.deterministicIsSafe && r.sunflower.anisotropy < 0.15 && r.sunflower.reach
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the non-random golden-angle sunflower has the same low Lorentz anisotropy as the random sprinkle with exponential reach',
      metrics: {
        sunflowerAnisotropy: r.sunflower.anisotropy,
        randomAnisotropy: r.random.anisotropy,
        sunflowerReaches: r.sunflower.reach ? 1 : 0,
      },
      control: { randomAnisotropy: r.random.anisotropy },
    })
  },
})
