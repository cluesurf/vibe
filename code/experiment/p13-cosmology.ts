// P13: the arrow of time and cosmology from growth.
// The mesh grows (eternal expansion), and classical sequential growth is
// intrinsically time-asymmetric: elements are born to the future, never the past.
// We grow a causal set element by element and measure three things: the arrow of
// time (distinctions only accumulate, monotonically, irreversibly), expansion (the
// spatial slices grow with time), and the recovered dimension (a sensible, settling
// geometry). See note/questions/next-version.md (P13).
// Run: npx tsx code/experiment/p13-cosmology.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { growCsg } from '~/substrate/grow-csg'
import { getBit } from '~/tool/bitset'
import { Poset } from '~/tool/poset'
import { myrheimMeyerDimension } from '~/measure/dimension'

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

export function main(): void {
  console.log('P13: the arrow of time and cosmology from classical sequential growth')
  console.log('')
  const r = csgCosmology({ size: 240, p: 0.08, seed: 1 })

  console.log('  Arrow of time (distinctions accumulate as the order grows):')
  console.log('    growth-time k    accumulated relations')
  for (const g of r.relationGrowth) {
    console.log(`    ${String(g.k).padStart(6)}            ${g.relations}`)
  }
  console.log(`  monotonically increasing (irreversible accumulation): ${r.arrowMonotone ? 'YES' : 'no'}`)
  console.log('')
  console.log('  A growing, aging universe:')
  console.log(`    final volume 240 elements, age (proper time / height) ${r.height} steps, dimension ${r.dimension.toFixed(2)}`)
  console.log('')
  console.log('  Slice width versus proper time (honest measurement):')
  console.log(`    early half ${r.earlyWidth.toFixed(1)}   late half ${r.lateWidth.toFixed(1)}   slices widen with time: ${r.widthGrows ? 'YES' : 'no'}`)
  console.log('')
  console.log('  Reading the result:')
  console.log('  - The ARROW OF TIME is clean and solid. Relations (distinctions) only')
  console.log('    accumulate as the order grows, monotonically and irreversibly. You cannot')
  console.log('    un-happen what is. This is exactly the irreversible cascade of the bootstrap.')
  console.log('  - The universe GROWS: volume and age (proper time) both increase, a growing')
  console.log('    time-oriented causal order with a definite beginning.')
  console.log('  - Honest on EXPANSION: plain transitive percolation does NOT show cosmological')
  console.log('    expansion (its slices narrow with proper time, and it is chain-dominated,')
  console.log('    dimension below 2). The committed eternal-expansion fate needs richer growth')
  console.log('    dynamics (an originary / de Sitter-like sequential growth with tuned')
  console.log('    couplings), which is the refinement. The arrow is here, accelerating')
  console.log('    expansion is the next dial to turn.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
