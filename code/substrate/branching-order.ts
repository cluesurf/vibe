// A 1+1 causal set grown by a pure local branching rule, with no metric imposed. Each cell of the
// current spatial front spawns one child, plus a second child on a DETERMINISTIC quasiperiodic
// criterion, so a net birth above one makes the front expand on its own (cosmological expansion from a
// local birth rule). The extra births are placed by the golden-ratio (Weyl-equidistributed) sequence:
// cell k spawns a second child when frac(k * phi) < spawnFraction, which selects exactly a fraction
// spawnFraction of cells with NO randomness, giving a net birth rate 1 + spawnFraction. Each child is
// born to the future of the previous front's cells within a fixed comoving horizon (the discrete light
// cone) and inherits their past, so the order is manifold-like (dimension near 2). Fully deterministic
// (a fixed rule, never a seed). Returns the order and the front width per generation.

import { makeBitMatrix, setBit, getBit } from '@/code/tool/bitset'
import { makePosetFromFuture, Poset } from '@/code/tool/poset'

const GOLDEN = (1 + Math.sqrt(5)) / 2

export function growBranchingOrder(input: {
  generations: number
  initialWidth: number
  spawnFraction: number
  horizon: number
}): { poset: Poset; widthPerGen: number[] } {
  // First pass: decide how many cells each generation has, from the local spawn rule. The extra child
  // is spawned on the deterministic golden-ratio criterion, which selects a fraction spawnFraction of
  // cells with no randomness (Weyl equidistribution of frac(k * phi)).
  const widths: number[] = [input.initialWidth]

  let cellIndex = 0

  for (let g = 0; g < input.generations; g++) {
    let next = 0

    const w = widths[g] ?? 0

    for (let c = 0; c < w; c++) {
      const frac = (cellIndex * GOLDEN) % 1

      next += 1 + (frac < input.spawnFraction ? 1 : 0)
      cellIndex++
    }

    widths.push(Math.max(1, next))
  }

  const total = widths.reduce((a, b) => a + b, 0)

  // Global index and comoving position (in [0,1)) of cell c in generation g.
  const startOf: number[] = []

  let acc = 0

  for (const width of widths) {
    startOf.push(acc)
    acc += width ?? 0
  }

  const posOf = (g: number, c: number): number =>
    (c + 0.5) / (widths[g] ?? 1)

  const future = makeBitMatrix({ rows: total, cols: total })

  // Each generation's cells are born to the future of the previous generation's cells within the
  // comoving horizon, inheriting their past (transitive closure).
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
            if (getBit(future, { row: a, col: parent }))
              setBit(future, { row: a, col: child })
          }

          hasParent = true
        }
      }

      // Guarantee connectivity: attach to the nearest previous cell if the horizon caught none (can
      // happen at the edges of a narrow early front).
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
          if (getBit(future, { row: a, col: parent }))
            setBit(future, { row: a, col: child })
        }
      }
    }
  }

  return {
    poset: makePosetFromFuture({ size: total, future }),
    widthPerGen: widths,
  }
}
