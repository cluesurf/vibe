// P13 deepest edge: cosmological expansion from a PURE LOCAL GROWTH RULE.
// The de Sitter result imposes an expanding metric. Here expansion instead EMERGES
// from a local DETERMINISTIC birth rule, with no metric put in by hand and no
// randomness. Each cell of the current spatial front spawns one child, plus a second
// child on a deterministic golden-ratio criterion (cell k spawns a second when
// frac(k * phi) < q, which selects exactly a fraction q of cells with no seed). A net
// birth above one (q > 0) is the committed eternal-expansion fate of the bootstrap
// (distinctions only accumulate) realised as a local rule. Each child is born to the
// future of the front cells within a fixed comoving horizon (the discrete light cone),
// so the order is 1+1 manifold-like. We test that the front grows on its own and the
// order is manifold-like. See note/questions/next-version.md (P13).

import { growBranchingOrder } from '@/code/substrate/branching-order'
import { geometricGrowthRatio } from '@/code/measure/shells'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function branchingExpansion(input: {
  spawnFraction: number
}): {
  widthPerGen: number[]
  rate: number
  expands: boolean
  dimension: number
} {
  const { poset, widthPerGen } = growBranchingOrder({
    generations: 11,
    initialWidth: 5,
    spawnFraction: input.spawnFraction,
    horizon: 0.2,
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
  code: 'E-CSM-0027',
  title:
    'net-positive DETERMINISTIC birth gives emergent expansion (static control at q=0)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const stat = branchingExpansion({ spawnFraction: 0 })
    const grow = branchingExpansion({ spawnFraction: 0.3 })
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
        'a net-positive local DETERMINISTIC (golden-ratio) birth rule makes the spatial front expand on its own while net-zero birth stays static, with no randomness',
      metrics: { growRate: grow.rate, growDimension: grow.dimension },
      control: { staticRate: stat.rate },
    })
  },
})
