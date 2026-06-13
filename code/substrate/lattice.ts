// The regular lattice control. For the Lorentzian case it is the integer-lattice
// causal order, which running measure/lorentz on should show a preferred frame:
// the failure mode the Butterfield-Dowker argument exploits. The riemannian case
// is the undirected nearest-neighbor hypercubic mesh, a Euclidean comparison.

import { Embedding, ManifoldSpec } from '@/code/tool/embedding'
import { Substrate } from '@/code/tool/substrate'
import { Poset, makePosetFromRelation } from '@/code/tool/poset'
import { makeGraph } from '@/code/tool/graph'

export function lattice(input: {
  dimension: number
  extent: number
  signature: 'lorentzian' | 'riemannian'
}): Substrate {
  const d = input.dimension
  const extent = input.extent
  const size = Math.pow(extent, d)

  // Enumerate integer lattice points of [0..extent)^d in row-major order, then
  // build their coordinates. coordinate 0 is the time axis.
  const coordsInt: number[][] = []
  for (let index = 0; index < size; index++) {
    const point: number[] = []
    let rest = index
    for (let axis = 0; axis < d; axis++) {
      point.push(rest % extent)
      rest = Math.floor(rest / extent)
    }
    coordsInt.push(point)
  }

  if (input.signature === 'lorentzian') {
    return latticeLorentzian({ dimension: d, size, coordsInt })
  }
  return latticeRiemannian({ dimension: d, extent, size, coordsInt })
}

function latticeLorentzian(input: {
  dimension: number
  size: number
  coordsInt: number[][]
}): Poset {
  const d = input.dimension
  const size = input.size

  // Sort element indices by time coordinate (axis 0) so a precedes b only when a
  // is no later than b.
  const order: number[] = []
  for (let i = 0; i < size; i++) {
    order.push(i)
  }
  order.sort((x, y) => {
    const tx = input.coordsInt[x]?.[0] ?? 0
    const ty = input.coordsInt[y]?.[0] ?? 0
    return tx - ty
  })

  const coords = new Float64Array(size * d)
  const sortedInt: number[][] = []
  for (let newIndex = 0; newIndex < size; newIndex++) {
    const oldIndex = order[newIndex] ?? 0
    const point = input.coordsInt[oldIndex] ?? []
    sortedInt.push(point)
    for (let axis = 0; axis < d; axis++) {
      coords[newIndex * d + axis] = point[axis] ?? 0
    }
  }

  const manifold: ManifoldSpec = { form: 'minkowski', dimension: d }
  const embedding: Embedding = {
    form: 'embedding',
    dimension: d,
    signature: 'lorentzian',
    coords,
    manifold,
  }

  // Diamond-lattice causal order: b is in the forward light cone of a iff the
  // time advance is at least the L1-norm of the space displacement and strictly
  // positive: dt >= sum |dx| and dt > 0.
  const precedes = (pair: { a: number; b: number }): boolean => {
    const pa = sortedInt[pair.a] ?? []
    const pb = sortedInt[pair.b] ?? []
    const dt = (pb[0] ?? 0) - (pa[0] ?? 0)
    if (dt <= 0) {
      return false
    }
    let l1 = 0
    for (let axis = 1; axis < d; axis++) {
      l1 += Math.abs((pb[axis] ?? 0) - (pa[axis] ?? 0))
    }
    return dt >= l1
  }

  return makePosetFromRelation({ size, precedes, embedding })
}

function latticeRiemannian(input: {
  dimension: number
  extent: number
  size: number
  coordsInt: number[][]
}) {
  const d = input.dimension
  const extent = input.extent
  const size = input.size

  const coords = new Float64Array(size * d)
  for (let i = 0; i < size; i++) {
    const point = input.coordsInt[i] ?? []
    for (let axis = 0; axis < d; axis++) {
      coords[i * d + axis] = point[axis] ?? 0
    }
  }

  // Strides for converting a coordinate vector back to its row-major index.
  const stride: number[] = []
  let s = 1
  for (let axis = 0; axis < d; axis++) {
    stride.push(s)
    s *= extent
  }

  const neighbors: number[][] = []
  for (let i = 0; i < size; i++) {
    const point = input.coordsInt[i] ?? []
    const row: number[] = []
    for (let axis = 0; axis < d; axis++) {
      const c = point[axis] ?? 0
      if (c + 1 < extent) {
        row.push(i + (stride[axis] ?? 0))
      }
      if (c - 1 >= 0) {
        row.push(i - (stride[axis] ?? 0))
      }
    }
    neighbors.push(row)
  }

  const manifold: ManifoldSpec = { form: 'minkowski', dimension: d }
  const embedding: Embedding = {
    form: 'embedding',
    dimension: d,
    signature: 'riemannian',
    coords,
    manifold,
  }

  return makeGraph({ size, directed: false, neighbors, embedding })
}
