// Poisson sprinkling of a causal diamond in d-dimensional Minkowski space.
// Uniform-by-volume sampling makes the process Poisson, hence Lorentz invariant:
// the thing a regular lattice cannot be.

import { Rng } from '~/core/rng'
import { Embedding, ManifoldSpec } from '~/core/embedding'
import { Poset, makePosetFromRelation } from '~/core/poset'

// Sample points uniformly in the causal diamond (Alexandrov interval) between
// (0, 0, ...) and (1, 0, ...). The diamond is the set of points with
// |x| <= min(t, 1 - t) in space, for t in [0, 1]. We sample t and a space point
// in the ball of radius min(t, 1 - t), uniform by volume in (d - 1) space.
//
// If halfDiamond is set we keep only the lower future cone of the origin
// (t in [0, 1], |x| <= t), a single light cone rather than the double diamond.
export function sprinkleMinkowski(input: {
  dimension: number
  count: number
  rng: Rng
  halfDiamond?: boolean
}): Poset {
  const d = input.dimension
  const n = input.count
  const spaceDim = d - 1
  const coords = new Float64Array(n * d)

  // Rejection sampling for a true uniform-by-volume (Poisson) sprinkle: draw a
  // candidate uniformly in the bounding box t in [0,1], each space coord in
  // [-0.5, 0.5], and accept iff it lies inside the diamond (spatial radius <=
  // min(t, 1-t), or <= t for a half diamond). Uniform-in-time sampling would
  // distort the density and the recovered dimension.
  let accepted = 0
  while (accepted < n) {
    const t = input.rng.next()
    const reach = input.halfDiamond ? t : Math.min(t, 1 - t)
    let radius2 = 0
    const candidate = new Float64Array(spaceDim)
    for (let axis = 0; axis < spaceDim; axis++) {
      const x = input.rng.next() - 0.5
      candidate[axis] = x
      radius2 += x * x
    }
    if (spaceDim > 0 && radius2 > reach * reach) {
      continue
    }
    coords[accepted * d] = t
    for (let axis = 0; axis < spaceDim; axis++) {
      coords[accepted * d + 1 + axis] = candidate[axis] ?? 0
    }
    accepted++
  }

  // Sort element indices by time coordinate so a precedes b implies a is earlier.
  const order: number[] = []
  for (let i = 0; i < n; i++) {
    order.push(i)
  }
  order.sort((x, y) => (coords[x * d] ?? 0) - (coords[y * d] ?? 0))

  const sorted = new Float64Array(n * d)
  for (let newIndex = 0; newIndex < n; newIndex++) {
    const oldIndex = order[newIndex] ?? 0
    for (let axis = 0; axis < d; axis++) {
      sorted[newIndex * d + axis] = coords[oldIndex * d + axis] ?? 0
    }
  }

  const manifold: ManifoldSpec = { form: 'minkowski', dimension: d }
  const embedding: Embedding = {
    form: 'embedding',
    dimension: d,
    signature: 'lorentzian',
    coords: sorted,
    manifold,
  }

  // a precedes b iff the separation is future timelike or null:
  // dt > 0 and dt^2 - |dx|^2 >= 0. Indices already time-sorted so a < b means
  // a is no later than b, but we still require strict dt > 0.
  const precedes = (pair: { a: number; b: number }): boolean => {
    const dt = (sorted[pair.b * d] ?? 0) - (sorted[pair.a * d] ?? 0)
    if (dt <= 0) {
      return false
    }
    let space2 = 0
    for (let axis = 1; axis < d; axis++) {
      const dx = (sorted[pair.b * d + axis] ?? 0) - (sorted[pair.a * d + axis] ?? 0)
      space2 += dx * dx
    }
    return dt * dt - space2 >= 0
  }

  return makePosetFromRelation({ size: n, precedes, embedding })
}

// Uniform point in the n-ball of given radius. dimension may be 0 (a point),
// 1 (a segment), or higher. Uses Gaussian-on-sphere times a radial scale.
function sampleBall(input: {
  dimension: number
  radius: number
  rng: Rng
}): Float64Array {
  const dim = input.dimension
  const out = new Float64Array(dim)
  if (dim <= 0 || input.radius <= 0) {
    return out
  }
  // Direction: normalized Gaussian vector. Magnitude: radius * u^(1/dim) for
  // uniform-by-volume radial density.
  let norm2 = 0
  for (let i = 0; i < dim; i++) {
    const g = input.rng.nextGaussian()
    out[i] = g
    norm2 += g * g
  }
  const norm = Math.sqrt(norm2)
  if (norm === 0) {
    return out
  }
  const radial = input.radius * Math.pow(input.rng.next(), 1 / dim)
  const scale = radial / norm
  for (let i = 0; i < dim; i++) {
    out[i] = (out[i] ?? 0) * scale
  }
  return out
}
