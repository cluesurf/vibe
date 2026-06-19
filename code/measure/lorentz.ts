// Lorentz isotropy: the decisive P3 test. A regular lattice singles out preferred
// axes; a Poisson sprinkling does not. We look at the directions of nearest links
// projected onto the first two spatial axes and measure how concentrated those
// directions are at discrete angles, via angular Fourier order parameters. A
// square lattice has a strong 4-fold component; a sprinkling has none.

import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import { coordOf } from '@/code/tool/embedding'
import { makeRng, Rng } from '@/code/tool/rng'
import { latticeDispersion } from '@/code/measure/dispersion'
import { groupSpeedAnisotropy } from '@/code/measure/group-speed'
import { nearestLinkHarmonicAnisotropy } from '@/code/measure/isotropy'

const PREFERRED_FRAME_THRESHOLD = 0.25
// Angular harmonics to probe. A lattice concentrates direction at a few discrete
// angles, raising one of these order parameters toward 1. Isotropy keeps them 0.
const HARMONICS = [2, 3, 4, 6]

// Measure directional anisotropy of nearest links. Requires an embedding with at
// least two spatial axes (Lorentzian needs d >= 3, Riemannian d >= 2). With
// fewer spatial axes direction is degenerate, so we report an isotropic null.
export function lorentzIsotropy(input: {
  substrate: Substrate
  samples: number
  rng: Rng
}): { preferredFrame: boolean; anisotropy: number } {
  const embedding = input.substrate.embedding
  if (!embedding) {
    return { preferredFrame: false, anisotropy: 0 }
  }
  const dim = embedding.dimension
  // Spatial axes: skip the time axis only for a Lorentzian embedding.
  const spatialStart = embedding.signature === 'lorentzian' ? 1 : 0
  const spatialCount = dim - spatialStart
  if (spatialCount < 2) {
    // One spatial axis cannot reveal a preferred direction.
    return { preferredFrame: false, anisotropy: 0 }
  }

  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  const size = input.substrate.size
  if (size === 0) {
    return { preferredFrame: false, anisotropy: 0 }
  }

  // Running sums of cos(m theta) and sin(m theta) for each harmonic m.
  const cosSum = new Array<number>(HARMONICS.length).fill(0)
  const sinSum = new Array<number>(HARMONICS.length).fill(0)
  let used = 0

  const sampleCount = Math.min(input.samples, size)
  for (let s = 0; s < sampleCount; s++) {
    const node = input.rng.nextInt({ max: size })
    const row = adjacency[node] ?? new Uint32Array(0)
    if (row.length === 0) {
      continue
    }
    // Nearest link by spatial distance gives the strongest directional cue.
    let nearest = -1
    let nearestDistance = Infinity
    for (let k = 0; k < row.length; k++) {
      const neighbor = row[k] ?? 0
      let sumSquares = 0
      for (let axis = spatialStart; axis < dim; axis++) {
        const delta =
          coordOf(embedding, { element: neighbor, axis }) -
          coordOf(embedding, { element: node, axis })
        sumSquares += delta * delta
      }
      if (sumSquares > 1e-18 && sumSquares < nearestDistance) {
        nearestDistance = sumSquares
        nearest = neighbor
      }
    }
    if (nearest < 0) {
      continue
    }
    // Angle in the plane of the first two spatial axes.
    const ax0 =
      coordOf(embedding, { element: nearest, axis: spatialStart }) -
      coordOf(embedding, { element: node, axis: spatialStart })
    const ax1 =
      coordOf(embedding, { element: nearest, axis: spatialStart + 1 }) -
      coordOf(embedding, { element: node, axis: spatialStart + 1 })
    if (ax0 === 0 && ax1 === 0) {
      continue
    }
    const theta = Math.atan2(ax1, ax0)
    for (let h = 0; h < HARMONICS.length; h++) {
      const m = HARMONICS[h] ?? 1
      cosSum[h] = (cosSum[h] ?? 0) + Math.cos(m * theta)
      sinSum[h] = (sinSum[h] ?? 0) + Math.sin(m * theta)
    }
    used++
  }

  if (used === 0) {
    return { preferredFrame: false, anisotropy: 0 }
  }

  // Anisotropy is the strongest angular order parameter |<e^{i m theta}>|.
  let anisotropy = 0
  for (let h = 0; h < HARMONICS.length; h++) {
    const c = (cosSum[h] ?? 0) / used
    const si = (sinSum[h] ?? 0) / used
    const magnitude = Math.sqrt(c * c + si * si)
    if (magnitude > anisotropy) {
      anisotropy = magnitude
    }
  }

  return {
    preferredFrame: anisotropy > PREFERRED_FRAME_THRESHOLD,
    anisotropy,
  }
}

// Lattice scalar dispersion omega(k) = sqrt(sum 4 sin^2(k_i/2)), the square-lattice
// nearest-neighbour dispersion. The continuum is omega = |k| (speed 1, isotropic).
const SQUARE_DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
function omega(kx: number, ky: number): number {
  return Math.sqrt(
    latticeDispersion({
      directions: SQUARE_DIRECTIONS,
      wave: [kx, ky],
    }),
  )
}

// Group-speed anisotropy at a fixed momentum magnitude: (max - min) / mean over
// directions. Zero is perfectly Lorentz-safe, large is strong LIV.
export function latticeAnisotropy(kMag: number): {
  meanSpeed: number
  anisotropy: number
} {
  return groupSpeedAnisotropy({ omega, kMag, samples: 24 })
}

function sprinklePoints(input: {
  count: number
  rng: Rng
}): { x: number; y: number }[] {
  return Array.from({ length: input.count }, () => ({
    x: input.rng.next(),
    y: input.rng.next(),
  }))
}
function latticePoints(side: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < side; i++) {
    for (let j = 0; j < side; j++) {
      pts.push({ x: i / side, y: j / side })
    }
  }
  return pts
}

export function lorentzSafety(): { sprinkle: number; lattice: number } {
  const sprinkle = nearestLinkHarmonicAnisotropy({
    points: sprinklePoints({ count: 900, rng: makeRng({ seed: 1 }) }),
  })
  const lattice = nearestLinkHarmonicAnisotropy({
    points: latticePoints(30),
  })
  return { sprinkle, lattice }
}
