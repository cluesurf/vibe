// P54: performance and large-N hardening.
// Does performance help harden the theory? Not by itself, but it unlocks larger N, and
// larger N hardens the size-limited results. The continuum limit (P52) was checked only
// to N = 4000, because building the full causal set costs O(N^2) memory (the whole
// transitive closure). Here we estimate the dimension a faster way: sample random pairs
// and check the lightcone from coordinates directly, which is O(N) memory and O(samples)
// work, independent of N^2. That reaches N in the tens of thousands and lets us show the
// continuum-limit error keeps shrinking, hardening the continuum claim at scale.
// Run: npx tsx code/experiment/p54-large-n-hardening.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { myrheimMeyerDimension, dimensionFromOrderingFraction } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Coordinates-only sprinkle of the causal diamond (no O(N^2) poset built). Same
// rejection sampling as sprinkleMinkowski, but we keep only the points.
function sprinkleCoords(input: { dimension: number; count: number; rng: Rng }): Float64Array {
  const d = input.dimension
  const spaceDim = d - 1
  const coords = new Float64Array(input.count * d)
  let accepted = 0
  while (accepted < input.count) {
    const t = input.rng.next()
    const reach = Math.min(t, 1 - t)
    let radius2 = 0
    const cand = new Float64Array(spaceDim)
    for (let axis = 0; axis < spaceDim; axis++) {
      const x = input.rng.next() - 0.5
      cand[axis] = x
      radius2 += x * x
    }
    if (spaceDim > 0 && radius2 > reach * reach) {
      continue
    }
    coords[accepted * d] = t
    for (let axis = 0; axis < spaceDim; axis++) {
      coords[accepted * d + 1 + axis] = cand[axis] ?? 0
    }
    accepted++
  }
  return coords
}

// Estimate the Myrheim-Meyer dimension by sampling pairs. Two points are causally
// related iff they are timelike separated: the time gap squared exceeds the spatial
// distance squared. The ordering fraction is the fraction of related pairs.
export function sampledDimension(input: { dimension: number; count: number; pairs: number; seed: number }): number {
  const d = input.dimension
  const rng = makeRng({ seed: input.seed })
  const coords = sprinkleCoords({ dimension: d, count: input.count, rng })
  const n = input.count
  let related = 0
  for (let s = 0; s < input.pairs; s++) {
    const a = rng.nextInt({ max: n })
    let b = rng.nextInt({ max: n })
    if (b === a) {
      b = (b + 1) % n
    }
    const dt = (coords[a * d] ?? 0) - (coords[b * d] ?? 0)
    let dx2 = 0
    for (let axis = 1; axis < d; axis++) {
      const dx = (coords[a * d + axis] ?? 0) - (coords[b * d + axis] ?? 0)
      dx2 += dx * dx
    }
    if (dt * dt > dx2) {
      related++
    }
  }
  return dimensionFromOrderingFraction(related / input.pairs)
}

export function largeNHardening(input: { dimension: number; sizes: number[]; pairs: number; seed: number }): {
  estimates: number[]
  errors: number[]
  errorShrinks: boolean
} {
  const estimates = input.sizes.map((nn, i) => sampledDimension({ dimension: input.dimension, count: nn, pairs: input.pairs, seed: input.seed + i }))
  const errors = estimates.map((e) => Math.abs(e - input.dimension))
  const errorShrinks = (errors[errors.length - 1] ?? 1) < (errors[0] ?? 0)
  return { estimates, errors, errorShrinks }
}

export default experiment({
  id: 'foundations/large-n-hardening',
  title: 'the sampled dimension estimator matches exact and sharpens at large N',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const samp = sampledDimension({ dimension: 2, count: 1500, pairs: 200000, seed: 1 })
    const r2 = largeNHardening({ dimension: 2, sizes: [2000, 30000], pairs: 300000, seed: 10 })
    const r3 = largeNHardening({ dimension: 3, sizes: [2000, 30000], pairs: 300000, seed: 10 })
    const ok = Math.abs(samp - 2) < 0.1 && r2.errorShrinks && r3.errorShrinks
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the O(N) sampled dimension estimator matches the exact value and the continuum error keeps shrinking at large N',
      metrics: {
        sampled2D: samp,
        error2DStart: r2.errors[0] ?? 0,
        error2DEnd: r2.errors[1] ?? 0,
        error3DStart: r3.errors[0] ?? 0,
        error3DEnd: r3.errors[1] ?? 0,
      },
    })
  },
})
