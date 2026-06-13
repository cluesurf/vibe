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
import { defineExperiment } from '@/test/scaffold/suite'
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

// Causal depth of each element: the length of the longest chain ending at it. CSG
// labels are topological (a precedes b implies a < b), so a single forward pass
// works. Depth is the discrete proper time from the beginning.
function depths(poset: Poset): Int32Array {
  const n = poset.size
  const d = new Int32Array(n).fill(1)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (getBit(poset.future, { row: j, col: i }) && (d[j] ?? 0) + 1 > (d[i] ?? 0)) {
        d[i] = (d[j] ?? 0) + 1
      }
    }
  }
  return d
}

// Spatial slice widths: how many elements sit at each causal depth. A slice is a
// time-slice of the universe, its width the spatial size at that moment.
function sliceWidths(poset: Poset): number[] {
  const d = depths(poset)
  const maxDepth = d.reduce((a, b) => Math.max(a, b), 0)
  const widths = new Array(maxDepth + 1).fill(0)
  for (let i = 0; i < poset.size; i++) {
    widths[d[i] ?? 0] += 1
  }
  return widths.slice(1) // depth 0 is unused
}

export function csgCosmology(input: { size: number; p: number; seed: number }): {
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
  const ks = [Math.floor(n / 8), Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n]
  const relationGrowth = ks.map((k) => ({ k, relations: prefixRelations(poset, k) }))
  let arrowMonotone = true
  for (let i = 1; i < relationGrowth.length; i++) {
    if ((relationGrowth[i]?.relations ?? 0) < (relationGrowth[i - 1]?.relations ?? 0)) {
      arrowMonotone = false
    }
  }

  // Spatial slice widths versus proper-time depth, and the height (total proper
  // time, the age of the universe).
  const widths = sliceWidths(poset)
  const half = Math.floor(widths.length / 2)
  const mean = (arr: number[]): number => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
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

export default defineExperiment({
  id: 'cosmology/p13-cosmology',
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
      metrics: { arrowMonotone: r.arrowMonotone ? 1 : 0, dimension: r.dimension },
    })
  },
})
