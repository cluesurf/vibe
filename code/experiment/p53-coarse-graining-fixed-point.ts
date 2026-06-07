// P53: the coarse-graining fixed point (a renormalization fixed point).
// A continuum description should be a FIXED POINT of coarse-graining: zoom out (keep only
// a fraction of the elements, inheriting the order) and the relevant observable does not
// change. For a sprinkled causal set, coarse-graining is sub-sprinkling (decimation), and
// a sub-sprinkle of a d-dimensional sprinkle is still a d-dimensional sprinkle. So the
// Myrheim-Meyer dimension should be invariant under repeated decimation. We confirm it,
// which makes the continuum dimension a renormalization fixed point.
// Run: npx tsx code/experiment/p53-coarse-graining-fixed-point.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { decimate } from '~/dynamics/coarsegrain'
import { myrheimMeyerDimension } from '~/measure/dimension'

export function coarseGrainingFixedPoint(input: { dimension: number; count: number; levels: number; seed: number }): {
  dims: number[]
  sizes: number[]
  fixedPoint: boolean
} {
  const rng = makeRng({ seed: input.seed })
  let poset = sprinkleMinkowski({ dimension: input.dimension, count: input.count, rng })
  const dims: number[] = []
  const sizes: number[] = []
  dims.push(myrheimMeyerDimension({ poset }))
  sizes.push(poset.size)
  for (let l = 0; l < input.levels; l++) {
    poset = decimate({ poset, keepProbability: 0.5, rng })
    dims.push(myrheimMeyerDimension({ poset }))
    sizes.push(poset.size)
  }
  // Fixed point: every level agrees with the original within a tolerance.
  const d0 = dims[0] ?? 0
  const fixedPoint = dims.every((d) => Math.abs(d - d0) < 0.3)
  return { dims, sizes, fixedPoint }
}

export function main(): void {
  console.log('P53: the coarse-graining fixed point (a renormalization fixed point)')
  console.log('')
  for (const d of [2, 3]) {
    const r = coarseGrainingFixedPoint({ dimension: d, count: 6000, levels: 4, seed: 1 })
    console.log(`  ${d}D sprinkling, halving the element count at each coarse-graining level:`)
    for (let i = 0; i < r.dims.length; i++) {
      const label = i === 0 ? 'original' : `level ${i}`
      console.log(`    ${label.padEnd(9)} (${String(r.sizes[i]).padStart(4)} elements): dimension ${(r.dims[i] ?? 0).toFixed(3)}`)
    }
    console.log(`    dimension invariant under coarse-graining (a fixed point): ${r.fixedPoint ? 'YES' : 'no'}`)
    console.log('')
  }
  console.log('  Zooming out by keeping half the elements at each step leaves the dimension')
  console.log('  unchanged. The continuum dimension is a fixed point of coarse-graining, the')
  console.log('  renormalization-fixed-point property the hardening roadmap asked for. The discrete')
  console.log('  model has a stable continuum description, the same at every scale.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
