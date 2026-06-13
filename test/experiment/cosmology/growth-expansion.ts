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

import { makeRng, Rng } from '@/code/tool/rng'
import { makeBitMatrix, setBit, getBit } from '@/code/tool/bitset'
import { makePosetFromFuture, Poset } from '@/code/tool/poset'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Grow a 1+1 causal set by local branching. Returns the order and the spatial width
// (front size) per generation.
function growBranching(input: {
  generations: number
  initialWidth: number
  spawnProb: number
  horizon: number
  rng: Rng
}): { poset: Poset; widthPerGen: number[] } {
  // First pass: decide how many cells each generation has, from the local spawn rule.
  const widths: number[] = [input.initialWidth]
  for (let g = 0; g < input.generations; g++) {
    let next = 0
    const w = widths[g] ?? 0
    for (let c = 0; c < w; c++) {
      next += 1 + (input.rng.next() < input.spawnProb ? 1 : 0)
    }
    widths.push(Math.max(1, next))
  }
  const total = widths.reduce((a, b) => a + b, 0)

  // Global index and comoving position (in [0,1)) of cell c in generation g.
  const startOf: number[] = []
  let acc = 0
  for (let g = 0; g < widths.length; g++) {
    startOf.push(acc)
    acc += widths[g] ?? 0
  }
  const posOf = (g: number, c: number): number => ((c + 0.5) / (widths[g] ?? 1))

  const future = makeBitMatrix({ rows: total, cols: total })
  // Each generation's cells are born to the future of the previous generation's
  // cells within the comoving horizon, inheriting their past (transitive closure).
  for (let g = 1; g < widths.length; g++) {
    const wPrev = widths[g - 1] ?? 0
    const wCur = widths[g] ?? 0
    for (let c = 0; c < wCur; c++) {
      const child = (startOf[g] ?? 0) + c
      const p = posOf(g, c)
      let hasParent = false
      for (let d = 0; d < wPrev; d++) {
        if (Math.abs(posOf(g - 1, d) - p) <= input.horizon) {
          const parent = (startOf[g - 1] ?? 0) + d
          setBit(future, { row: parent, col: child })
          // Inherit the parent's past (already transitively closed).
          for (let a = 0; a < parent; a++) {
            if (getBit(future, { row: a, col: parent })) {
              setBit(future, { row: a, col: child })
            }
          }
          hasParent = true
        }
      }
      // Guarantee connectivity: attach to the nearest previous cell if the horizon
      // caught none (can happen at the edges of a narrow early front).
      if (!hasParent && wPrev > 0) {
        let best = 0
        let bestD = Infinity
        for (let d = 0; d < wPrev; d++) {
          const dist = Math.abs(posOf(g - 1, d) - p)
          if (dist < bestD) {
            bestD = dist
            best = d
          }
        }
        const parent = (startOf[g - 1] ?? 0) + best
        setBit(future, { row: parent, col: child })
        for (let a = 0; a < parent; a++) {
          if (getBit(future, { row: a, col: parent })) {
            setBit(future, { row: a, col: child })
          }
        }
      }
    }
  }
  return { poset: makePosetFromFuture({ size: total, future }), widthPerGen: widths }
}

// Geometric mean growth ratio of the front across generations (the expansion rate).
function expansionRate(widths: number[]): number {
  let logSum = 0
  let count = 0
  for (let g = 1; g < widths.length; g++) {
    const a = widths[g - 1] ?? 1
    const b = widths[g] ?? 1
    if (a > 0 && b > 0) {
      logSum += Math.log(b / a)
      count += 1
    }
  }
  return count > 0 ? Math.exp(logSum / count) : 1
}

export function branchingExpansion(input: { spawnProb: number; seed: number }): {
  widthPerGen: number[]
  rate: number
  expands: boolean
  dimension: number
} {
  const { poset, widthPerGen } = growBranching({
    generations: 11,
    initialWidth: 5,
    spawnProb: input.spawnProb,
    horizon: 0.2,
    rng: makeRng({ seed: input.seed }),
  })
  const rate = expansionRate(widthPerGen)
  return {
    widthPerGen,
    rate,
    expands: (widthPerGen[widthPerGen.length - 1] ?? 0) > 2 * (widthPerGen[0] ?? 0),
    dimension: myrheimMeyerDimension({ poset }),
  }
}

export default defineExperiment({
  id: 'cosmology/growth-expansion',
  title: 'net-positive birth gives emergent expansion (static control at q=0)',
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
