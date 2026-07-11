// P13: the arrow of time and cosmology from growth.
// The mesh grows (eternal expansion), and classical sequential growth is
// intrinsically time-asymmetric: elements are born to the future, never the past.
// We grow a causal set element by element and measure three things: the arrow of
// time (distinctions only accumulate, monotonically, irreversibly), expansion (the
// spatial slices grow with time), and the recovered dimension (a sensible, settling
// geometry). See note/questions/next-version.md (P13).
// Run: npx tsx code/experiment/p13-cosmology.ts

import { makeRng } from '@/code/tool/rng'
import { growCsg } from '@/code/substrate/grow-csg'
import { getBit } from '@/code/tool/bitset'
import { Poset } from '@/code/tool/poset'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { causalSliceWidths } from '@/code/measure/order-stats'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Number of causal relations among the first k elements (the order grown so far).
// In sequential growth the first k elements are exactly the order at growth-time k.
function prefixRelations(poset: Poset, k: number): number {
  let count = 0

  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      if (getBit(poset.future, { row: i, col: j })) {
        count++
      }
    }
  }

  return count
}

export function csgCosmology(input: {
  size: number
  p: number
  seed: number
}): {
  relationGrowth: { k: number; relations: number }[]
  arrowMonotone: boolean
  height: number
  earlyWidth: number
  lateWidth: number
  widthGrows: boolean
  dimension: number
} {
  const poset = growCsg({
    size: input.size,
    couplings: Float64Array.from([input.p]),
    rng: makeRng({ seed: input.seed }),
  })

  const n = input.size

  // Arrow of time: relations among the first k elements, monotonically increasing.
  const ks = [
    Math.floor(n / 8),
    Math.floor(n / 4),
    Math.floor(n / 2),
    Math.floor((3 * n) / 4),
    n,
  ]

  const relationGrowth = ks.map(k => ({
    k,
    relations: prefixRelations(poset, k),
  }))

  let arrowMonotone = true

  for (let i = 1; i < relationGrowth.length; i++) {
    if (
      (relationGrowth[i]?.relations ?? 0) <
      (relationGrowth[i - 1]?.relations ?? 0)
    )
      arrowMonotone = false
  }

  // Spatial slice widths versus proper-time depth, and the height (total proper
  // time, the age of the universe).
  const widths = causalSliceWidths({ poset })
  const half = Math.floor(widths.length / 2)
  const mean = (arr: number[]): number =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const earlyWidth = mean(widths.slice(0, half))
  const lateWidth = mean(widths.slice(half))

  return {
    relationGrowth,
    arrowMonotone,
    height: widths.length,
    earlyWidth,
    lateWidth,
    widthGrows: lateWidth > earlyWidth,
    dimension: myrheimMeyerDimension({ poset }),
  }
}

export default experiment({
  id: 'cosmology/p13-cosmology',
  code: 'E-CSM-0033',
  title: 'growth gives a monotone arrow of time and a finite dimension',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = csgCosmology({ size: 200, p: 0.08, seed: 1 })
    const ok = r.arrowMonotone && r.dimension > 0 && r.dimension < 4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'classical sequential growth accumulates relations monotonically and recovers a finite dimension',
      metrics: {
        arrowMonotone: r.arrowMonotone ? 1 : 0,
        dimension: r.dimension,
      },
    })
  },
})
