// Lorentz isotropy: the decisive P3 test. A regular lattice singles out a
// preferred direction (high anisotropy); a Poisson sprinkling does not. We
// measure the directional distribution of nearest links in the embedding and
// report the normalized variance of that distribution as the anisotropy.
// See testbed/04-measurements.md.

import { Substrate, undirectedAdjacency } from '~/core/substrate'
import { coordOf } from '~/core/embedding'
import { Rng } from '~/core/rng'

const PREFERRED_FRAME_THRESHOLD = 0.25

// Spatial axes are 1..d-1 (axis 0 is time in a Lorentzian embedding). For a
// Riemannian embedding all axes are spatial; we still skip axis 0 to keep one
// canonical projection axis, but fall back to all axes when d <= 1.
function spatialDirection(input: {
  coords: (axis: number) => number
  fromAxis: number
  toAxis: number
}): number[] {
  const direction: number[] = []
  for (let axis = input.fromAxis; axis < input.toAxis; axis++) {
    direction.push(input.coords(axis))
  }
  return direction
}

// Variance of a list of unit vectors across each axis. For a perfectly isotropic
// distribution the per-axis means cancel and the spread is uniform; a preferred
// direction concentrates the unit vectors, raising the squared mean direction.
// We report the squared length of the mean unit vector, normalized to [0,1]:
// 0 = directions cancel (isotropic), 1 = all directions aligned.
function meanResultantLength(directions: number[][]): number {
  if (directions.length === 0) {
    return 0
  }
  const first = directions[0]
  const dim = first ? first.length : 0
  if (dim === 0) {
    return 0
  }
  const mean = new Array<number>(dim).fill(0)
  for (const direction of directions) {
    for (let axis = 0; axis < dim; axis++) {
      mean[axis] = (mean[axis] ?? 0) + (direction[axis] ?? 0)
    }
  }
  let squared = 0
  for (let axis = 0; axis < dim; axis++) {
    const value = (mean[axis] ?? 0) / directions.length
    squared += value * value
  }
  return squared
}

// Measure directional anisotropy of nearest links. Requires an embedding; if the
// substrate has no coordinates we cannot define a direction, so we report a
// perfectly isotropic null result with preferredFrame false.
export function lorentzIsotropy(input: {
  substrate: Substrate
  samples: number
  rng: Rng
}): { preferredFrame: boolean; anisotropy: number } {
  const embedding = input.substrate.embedding
  if (!embedding) {
    // No embedding: directions are undefined, so we cannot detect a frame.
    return { preferredFrame: false, anisotropy: 0 }
  }
  const dim = embedding.dimension
  // Spatial axes are 1..d-1 in Lorentzian signature; use all axes if d <= 1.
  const fromAxis = dim > 1 ? 1 : 0
  const toAxis = dim

  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  const size = input.substrate.size
  if (size === 0) {
    return { preferredFrame: false, anisotropy: 0 }
  }

  const directions: number[][] = []
  const sampleCount = Math.min(input.samples, size)
  for (let s = 0; s < sampleCount; s++) {
    const node = input.rng.nextInt({ max: size })
    const row = adjacency[node] ?? new Uint32Array(0)
    if (row.length === 0) {
      continue
    }
    // The nearest link by spatial distance gives the strongest directional cue.
    let nearest = -1
    let nearestDistance = Infinity
    for (let k = 0; k < row.length; k++) {
      const neighbor = row[k] ?? 0
      let sumSquares = 0
      for (let axis = fromAxis; axis < toAxis; axis++) {
        const delta =
          coordOf(embedding, { element: neighbor, axis }) -
          coordOf(embedding, { element: node, axis })
        sumSquares += delta * delta
      }
      if (sumSquares < nearestDistance) {
        nearestDistance = sumSquares
        nearest = neighbor
      }
    }
    if (nearest < 0 || nearestDistance <= 0) {
      continue
    }
    const length = Math.sqrt(nearestDistance)
    const direction = spatialDirection({
      coords: (axis) =>
        (coordOf(embedding, { element: nearest, axis }) -
          coordOf(embedding, { element: node, axis })) /
        length,
      fromAxis,
      toAxis,
    })
    directions.push(direction)
  }

  const anisotropy = meanResultantLength(directions)
  return {
    preferredFrame: anisotropy > PREFERRED_FRAME_THRESHOLD,
    anisotropy,
  }
}
