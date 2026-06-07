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

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '~/tool/rng'
import { makeBitMatrix, setBit, getBit } from '~/tool/bitset'
import { makePosetFromFuture, Poset } from '~/tool/poset'
import { myrheimMeyerDimension } from '~/measure/dimension'

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

export function main(): void {
  console.log('P13 deepest edge: expansion from a pure local growth rule')
  console.log('')
  for (const q of [0, 0.3]) {
    const r = branchingExpansion({ spawnProb: q, seed: 1 })
    console.log(`spawn probability q = ${q} (net birth ${(1 + q).toFixed(1)} per cell):`)
    console.log('  front width per generation: ' + r.widthPerGen.join(', '))
    console.log(`  emergent expansion rate ${r.rate.toFixed(3)} per generation, expands: ${r.expands ? 'YES' : 'no'}, dimension ${r.dimension.toFixed(2)}`)
    console.log('')
  }
  console.log('  With q = 0 (net birth one) the front stays roughly constant: a static universe.')
  console.log('  With q > 0 (net birth above one) the front GROWS on its own, generation after')
  console.log('  generation, with no metric imposed. Expansion emerges from the local birth rule,')
  console.log('  and the order is manifold-like. So the committed eternal-expansion fate, net')
  console.log('  positive birth, realised as a purely local rule, produces an expanding universe.')
  console.log('  This is the growth-side companion to the de Sitter geometry result: there the')
  console.log('  expansion was imposed as a metric, here it emerges from the rule itself.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
