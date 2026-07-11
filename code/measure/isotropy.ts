// Angular isotropy measures, the rotational half of Lorentz invariance. Given a set of unit directions
// (e.g. endpoints of random walks, wave-front normals) and a fixed set of probe axes, measure how
// direction-dependent the order-p angular moment is. Zero means isotropic (every axis sees the same), and a
// large value means a preferred direction survives. The rank-p moment test, core to the isotropy and
// Lorentz-restoration experiments.

import { dot } from '@/code/algebra/vector'
import { jacobiEigenvalues3 } from '@/code/algebra/linear/eig-jacobi'

// Light-cone front isotropy: the coefficient of variation of the embedding radius of
// the BFS front at graph distance R from a start cell. A round (isotropic) cone has
// all front cells at nearly the same embedded radius, so the coefficient is small; a
// faceted (anisotropic) cone spreads the radii, so it is large. Returns -1 when the
// front has too few cells (under 4) to estimate. Lower is rounder.
export function frontCoefficientOfVariation(input: {
  neighbors: number[][]
  coords: number[][]
  start: number
  radius: number
}): number {
  const { neighbors, coords, start, radius } = input
  const N = neighbors.length
  const dist = new Int32Array(N).fill(-1)

  dist[start] = 0

  let fr = [start]

  for (let r = 0; r < radius; r++) {
    const nf: number[] = []

    for (const u of fr) {
      for (const w of neighbors[u]!) {
        if (dist[w] === -1) {
          dist[w] = r + 1
          nf.push(w)
        }
      }
    }

    fr = nf
  }

  const c = coords[start]!
  const radii = fr.map(i =>
    Math.sqrt(coords[i]!.reduce((s, x, k) => s + (x - c[k]!) ** 2, 0)),
  )

  if (radii.length < 4) {
    return -1
  }

  const mean = radii.reduce((a, b) => a + b, 0) / radii.length
  const sd = Math.sqrt(
    radii.reduce((a, r) => a + (r - mean) ** 2, 0) / radii.length,
  )

  return Math.round((sd / mean) * 1000) / 1000
}

// Anisotropy of the order-p angular moment <(n . u)^order> across the probe axes u, for the directions n.
// Returns (max - min) / mean of the per-axis moment, 0 = isotropic.
export function angularAnisotropy(input: {
  directions: number[][]
  axes: number[][]
  order: number
}): number {
  const { directions, axes, order } = input

  if (directions.length === 0) {
    return 0
  }

  const vals = axes.map(u => {
    let s = 0

    for (const n of directions) {
      s += Math.pow(dot(n, u), order)
    }

    return s / directions.length
  })

  const mn = Math.min(...vals)
  const mx = Math.max(...vals)
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length

  return mean > 0 ? (mx - mn) / mean : 0
}

// Systematic angular anisotropy of a binned angular profile (one value per angular
// bin around a circle). Takes the strongest angular Fourier harmonic among the given
// orders, normalized by the total. A preferred-axis pattern (a lattice's 4-fold)
// shows up as a large harmonic, while disorder noise has no systematic harmonic and
// averages away. Default orders {2, 3, 4, 6} cover the common lattice symmetries.
export function harmonicAnisotropy(input: {
  profile: ArrayLike<number>
  orders?: number[]
}): number {
  const profile = input.profile
  const orders = input.orders ?? [2, 3, 4, 6]
  const bins = profile.length

  let total = 0

  for (let b = 0; b < bins; b++) {
    total += profile[b] ?? 0
  }

  if (total <= 0) {
    return 0
  }

  let worst = 0

  for (const m of orders) {
    let re = 0
    let im = 0

    for (let b = 0; b < bins; b++) {
      const theta = (2 * Math.PI * (b + 0.5)) / bins

      re += (profile[b] ?? 0) * Math.cos(m * theta)
      im += (profile[b] ?? 0) * Math.sin(m * theta)
    }

    const mag = Math.hypot(re, im) / total

    if (mag > worst) {
      worst = mag
    }
  }

  return worst
}

// Directional anisotropy of the nearest-neighbour link directions of a 2D point set,
// as the magnitude of the order-`harmonic` angular Fourier component (default the
// 4-fold component for square lattices), normalised by the number of points. Each
// point's link is the direction to its single nearest other point. A lattice has a
// strong preferred-axis harmonic; a Poisson sprinkle averages to near zero.
export function nearestLinkHarmonicAnisotropy(input: {
  points: { x: number; y: number }[]
  harmonic?: number
}): number {
  const { points } = input
  const harmonic = input.harmonic ?? 4

  let re = 0
  let im = 0
  let n = 0

  for (let i = 0; i < points.length; i++) {
    let best = -1
    let bestD = Infinity

    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        continue
      }

      const dx = (points[j]?.x ?? 0) - (points[i]?.x ?? 0)
      const dy = (points[j]?.y ?? 0) - (points[i]?.y ?? 0)
      const d = dx * dx + dy * dy

      if (d < bestD) {
        bestD = d
        best = j
      }
    }

    if (best >= 0) {
      const dx = (points[best]?.x ?? 0) - (points[i]?.x ?? 0)
      const dy = (points[best]?.y ?? 0) - (points[i]?.y ?? 0)
      const ang = Math.atan2(dy, dx)

      re += Math.cos(harmonic * ang)
      im += Math.sin(harmonic * ang)
      n += 1
    }
  }

  return n > 0 ? Math.hypot(re, im) / n : 0
}

// The one-step diffusion tensor of a symmetric walk and its eigenvalue anisotropy.
// Over the given sample cells, the covariance of the UNIT neighbour-displacement
// directions (so radial scale variation cancels) is accumulated into a 3x3 tensor.
// Its three eigenvalues are equal when transport is isotropic (an invariant rank-2
// tensor of an irreducible point group is a multiple of the identity), so the
// anisotropy (max - min) / mean of the eigenvalues is the rotational-invariance
// measure. Returns the sorted eigenvalues, the anisotropy, and the displacement
// count used.
export function diffusionTensorAnisotropy(input: {
  coords: number[][]
  neighbors: readonly (readonly number[])[]
  cells: number[]
}): { eigenvalues: number[]; anisotropy: number; count: number } {
  const { coords, neighbors, cells } = input
  const cov = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  let count = 0

  for (const ci of cells) {
    const cc = coords[ci]!

    for (const w of neighbors[ci] ?? []) {
      const d = [
        coords[w]![0]! - cc[0]!,
        coords[w]![1]! - cc[1]!,
        coords[w]![2]! - cc[2]!,
      ]

      const len = Math.hypot(d[0]!, d[1]!, d[2]!)

      if (len < 1e-9) {
        continue
      }

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          cov[i]![j]! += (d[i]! / len) * (d[j]! / len)
        }
      }

      count++
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      cov[i]![j]! /= count
    }
  }

  const eig = jacobiEigenvalues3(cov).sort((a, b) => a - b)
  const meanEig = (eig[0]! + eig[1]! + eig[2]!) / 3
  const anisotropy = meanEig > 0 ? (eig[2]! - eig[0]!) / meanEig : 1

  return { eigenvalues: eig, anisotropy, count }
}

// Anisotropy of a direction set from its front support function h(u) = max_d (d . u)
// over random unit probe directions u. The support function is the distance the
// convex front reaches in direction u; its coefficient of variation (std / mean)
// over many random u is the anisotropy (0 = perfectly isotropic, the front is a
// sphere). Each direction's contribution is normalised by the common direction norm.
// Probe directions are drawn as random unit vectors (Box-Muller per axis) from the
// supplied generator, so the result is reproducible at a fixed seed.
export function supportFunctionAnisotropy(input: {
  directions: number[][]
  rng: { next: () => number }
  samples?: number
}): number {
  const { directions, rng } = input
  const samples = input.samples ?? 4000
  const dimension = directions[0]?.length ?? 0
  const norm = Math.hypot(...(directions[0] ?? []))
  const supports: number[] = []

  for (let t = 0; t < samples; t++) {
    const gaussian = new Array<number>(dimension).fill(0).map(() => {
      const u1 = rng.next() || 1e-9
      const u2 = rng.next()

      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    })

    const gaussianNorm = Math.hypot(...gaussian)
    const u = gaussian.map(x => x / gaussianNorm)

    let best = -Infinity

    for (const d of directions) {
      let s = 0

      for (let i = 0; i < dimension; i++) {
        s += d[i]! * u[i]!
      }

      if (s > best) {
        best = s
      }
    }

    supports.push(best / norm)
  }

  const mean = supports.reduce((a, b) => a + b, 0) / supports.length
  const variance =
    supports.reduce((a, b) => a + (b - mean) ** 2, 0) / supports.length

  return Math.sqrt(variance) / mean
}

// Order-4 angular moments of a direction set: the diagonal sum d_x^4 and the mixed sum d_x^2 d_y^2
// over the first two components. A set isotropic to order 4 satisfies diagonal = 3 * mixed (the
// continuum identity for the 4th moment), so |diagonal - 3 * mixed| measures the residual order-4
// anisotropy. Inputs may be raw lattice vectors (all of equal length) or unit directions.
export function directionFourthMoments(directions: number[][]): {
  diagonal: number
  mixed: number
  anisotropy: number
} {
  let diagonal = 0
  let mixed = 0

  for (const d of directions) {
    diagonal += (d[0] ?? 0) ** 4
    mixed += (d[0] ?? 0) ** 2 * (d[1] ?? 0) ** 2
  }

  return { diagonal, mixed, anisotropy: Math.abs(diagonal - 3 * mixed) }
}
