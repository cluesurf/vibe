// P38: emergent spatial geometry (deepening the capstone).
// P13 showed expansion emerges from growth and that de Sitter slices grow with time,
// but it did not measure the geometry OF a slice. Here we take a coexisting "now" slice
// of the grown causal order, a thin antichain band, build its spatial-neighbor graph,
// and measure its spatial dimension. For a d-dimensional spacetime the slice is a
// (d-1)-dimensional space, so the test is whether the slice dimension comes out near
// d-1: about 1 for a 2D spacetime, about 2 for a 3D one.
// See note/the-model.md. Run: npx tsx code/experiment/p38-emergent-spatial-geometry.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { ballGrowthDimension } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Spatial Euclidean distance between two sprinkled elements (ignoring the time axis 0).
function spatialDistance(
  coords: Float64Array,
  d: number,
  a: number,
  b: number,
): number {
  let s = 0

  for (let axis = 1; axis < d; axis++) {
    const delta =
      (coords[a * d + axis] ?? 0) - (coords[b * d + axis] ?? 0)

    s += delta * delta
  }

  return Math.sqrt(s)
}

export function sliceDimension(input: {
  dimension: number
  count: number
  seed: number
}): {
  sliceSize: number
  meanDegree: number
  spatialDimension: number
} {
  const d = input.dimension
  const poset = sprinkleMinkowski({
    dimension: d,
    count: input.count,
    rng: makeRng({ seed: input.seed }),
  })

  const coords = poset.embedding?.coords ?? new Float64Array(0)

  // Time coordinates, to pick a thin band near the median (a coexisting slice).
  const times: number[] = []

  for (let i = 0; i < poset.size; i++) {
    times.push(coords[i * d] ?? 0)
  }

  const sorted = [...times].sort((a, b) => a - b)
  const lo = sorted[Math.floor(sorted.length * 0.48)] ?? 0
  const hi = sorted[Math.floor(sorted.length * 0.52)] ?? 0
  const slice: number[] = []

  for (let i = 0; i < poset.size; i++) {
    if ((times[i] ?? 0) >= lo && (times[i] ?? 0) <= hi) {
      slice.push(i)
    }
  }

  // A spatial radius giving a locally connected slice graph: a few times the typical
  // nearest-neighbor spacing in the (d-1)-dimensional slice.
  const spatialExtent = 2
  const spacing =
    spatialExtent / Math.pow(Math.max(1, slice.length), 1 / (d - 1))

  const radius = 1.3 * spacing

  // Build the spatial-neighbor graph on the slice (indices into `slice`).
  const local = new Map<number, number>()
  slice.forEach((g, i) => local.set(g, i))
  const neighbors: number[][] = slice.map(() => [])

  for (let i = 0; i < slice.length; i++) {
    for (let j = i + 1; j < slice.length; j++) {
      if (spatialDistance(coords, d, slice[i]!, slice[j]!) <= radius) {
        neighbors[i]!.push(j)
        neighbors[j]!.push(i)
      }
    }
  }

  let degSum = 0

  for (const row of neighbors) {
    degSum += row.length
  }

  // Centers: the most-connected slice nodes (interior, not on the slice boundary).
  const order = neighbors
    .map((row, i) => [i, row.length] as const)
    .sort((a, b) => b[1] - a[1])

  const centers = order.slice(0, 12).map(([i]) => i)
  const spatialDimension = ballGrowthDimension({
    neighbors,
    centers,
    maxRadius: d === 2 ? 6 : 4,
  })

  return {
    sliceSize: slice.length,
    meanDegree: degSum / Math.max(1, slice.length),
    spatialDimension,
  }
}

export default experiment({
  id: 'cosmology/emergent-spatial-geometry',
  title: 'slice dimension below spacetime, rising by ~1 (d-1 trend)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const two = sliceDimension({ dimension: 2, count: 2000, seed: 1 })
    const three = sliceDimension({ dimension: 3, count: 3000, seed: 1 })
    const ok =
      three.spatialDimension > two.spatialDimension &&
      two.spatialDimension < 2 &&
      three.spatialDimension < 3 &&
      three.spatialDimension - two.spatialDimension > 0.4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a coexisting slice has a spatial dimension below the spacetime dimension, rising by about one from 2D to 3D',
      metrics: {
        sliceDimension2d: two.spatialDimension,
        sliceDimension3d: three.spatialDimension,
        rise: three.spatialDimension - two.spatialDimension,
      },
    })
  },
})
