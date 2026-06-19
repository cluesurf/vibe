// P13 deepest edge: cosmological expansion from a PURE LOCAL GROWTH RULE.
// The de Sitter result imposes an expanding metric. Here expansion instead EMERGES
// from a local stochastic birth rule, with no metric put in by hand. Each cell of
// the current spatial front spawns one child, plus a second child with probability
// q. A net birth above one (q > 0) is the committed eternal-expansion fate of the
// bootstrap (distinctions only accumulate) realised as a local rule. Each child is
// born to the future of the front cells within a fixed comoving horizon (the
// discrete light cone), so the order is 1+1 manifold-like. We test that the front
// grows on its own and the order is manifold-like. See note/questions/next-version.md
// (P13). Run: npx tsx code/experiment/p13-growth-expansion.ts

import { makeRng } from '@/code/tool/rng'
import { growBranchingOrder } from '@/code/substrate/branching-order'
import { geometricGrowthRatio } from '@/code/measure/shells'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function branchingExpansion(input: {
  spawnProb: number
  seed: number
}): {
  widthPerGen: number[]
  rate: number
  expands: boolean
  dimension: number
} {
  const { poset, widthPerGen } = growBranchingOrder({
    generations: 11,
    initialWidth: 5,
    spawnProb: input.spawnProb,
    horizon: 0.2,
    rng: makeRng({ seed: input.seed }),
  })
  const rate = geometricGrowthRatio(widthPerGen)

  return {
    widthPerGen,
    rate,
    expands:
      (widthPerGen[widthPerGen.length - 1] ?? 0) >
      2 * (widthPerGen[0] ?? 0),
    dimension: myrheimMeyerDimension({ poset }),
  }
}

export default experiment({
  id: 'cosmology/growth-expansion',
  title:
    'net-positive birth gives emergent expansion (static control at q=0)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const stat = branchingExpansion({ spawnProb: 0, seed: 1 })
    const grow = branchingExpansion({ spawnProb: 0.3, seed: 1 })
    const ok =
      !stat.expands &&
      Math.abs(stat.rate - 1) < 0.05 &&
      grow.expands &&
      grow.rate > 1.2 &&
      grow.rate < 1.45 &&
      grow.dimension > 1 &&
      grow.dimension < 3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a net-positive local birth rule makes the spatial front expand on its own while net-zero birth stays static',
      metrics: { growRate: grow.rate, growDimension: grow.dimension },
      control: { staticRate: stat.rate },
    })
  },
})
