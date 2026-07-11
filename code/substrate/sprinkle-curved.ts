// Sprinkling curved spacetimes for P5 (does geometry recover uniquely) and the
// curved cases. Sample by proper volume, build the causal order, attach the given
// manifold.
//
// First version: the causal test is the flat Minkowski light-cone test, applied
// in the appropriate frame.
//
//   - wave-burst: a transverse-traceless gravitational wave is a weak field, so
//     the causal ORDER is well approximated by the flat one. This is exactly the
//     Butterfield-Dowker point: the order alone barely changes, yet a sprinkling
//     can still tell the wave from Minkowski where a regular complex cannot.
//     APPROXIMATION: we use the flat causal test with no metric correction.
//   - desitter: de Sitter is conformal to (a patch of) Minkowski, and causal
//     structure is conformally invariant, so the flat causal test in conformal
//     coordinates is exact for the order. APPROXIMATION: we sample uniformly in
//     the conformal box rather than reweighting by the de Sitter proper volume.
//   - hyperbolic: treated as a Riemannian (spacelike) slab; we apply the flat
//     timelike test on coordinate 0 as a stand-in causal direction.

import { Rng } from '@/code/tool/rng'
import { Embedding, ManifoldSpec } from '@/code/tool/embedding'
import { Poset, makePosetFromRelation } from '@/code/tool/poset'

export function sprinkleCurved(input: {
  manifold: ManifoldSpec
  count: number
  rng: Rng
}): Poset {
  const d = input.manifold.dimension
  const n = input.count
  const spaceDim = d - 1
  const coords = new Float64Array(n * d)

  // Sample as in a 2D-style Minkowski causal diamond generalized to d dims:
  // t in [0, 1], space in the ball of radius min(t, 1 - t), uniform by volume.
  // For the conformal de Sitter case these are conformal coordinates; for the
  // wave-burst case they are the flat background coordinates.
  for (let i = 0; i < n; i++) {
    const t = input.rng.next()
    const reach = Math.min(t, 1 - t)
    const space = sampleBall({
      dimension: spaceDim,
      radius: reach,
      rng: input.rng,
    })

    coords[i * d] = t

    for (let axis = 0; axis < spaceDim; axis++) {
      coords[i * d + 1 + axis] = space[axis] ?? 0
    }
  }

  // Sort by time so a precedes b only if a is earlier.
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

  const embedding: Embedding = {
    form: 'embedding',
    dimension: d,
    signature: 'lorentzian',
    coords: sorted,
    manifold: input.manifold,
  }

  // Flat future-timelike-or-null causal test in the (conformal / background)
  // coordinates: dt > 0 and dt^2 - |dx|^2 >= 0.
  const precedes = (pair: { a: number; b: number }): boolean => {
    const dt = (sorted[pair.b * d] ?? 0) - (sorted[pair.a * d] ?? 0)

    if (dt <= 0) {
      return false
    }

    let space2 = 0

    for (let axis = 1; axis < d; axis++) {
      const dx =
        (sorted[pair.b * d + axis] ?? 0) -
        (sorted[pair.a * d + axis] ?? 0)

      space2 += dx * dx
    }

    return dt * dt - space2 >= 0
  }

  return makePosetFromRelation({ size: n, precedes, embedding })
}

// Uniform point in the n-ball of given radius, by volume.
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
