// Angular isotropy measures, the rotational half of Lorentz invariance. Given a set of unit directions
// (e.g. endpoints of random walks, wave-front normals) and a fixed set of probe axes, measure how
// direction-dependent the order-p angular moment is. Zero means isotropic (every axis sees the same), and a
// large value means a preferred direction survives. The rank-p moment test, core to the isotropy and
// Lorentz-restoration experiments.

import { dot } from '@/code/algebra/vector'

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
    for (const u of fr) for (const w of neighbors[u]!) if (dist[w] === -1) { dist[w] = r + 1; nf.push(w) }
    fr = nf
  }
  const c = coords[start]!
  const radii = fr.map((i) => Math.sqrt(coords[i]!.reduce((s, x, k) => s + (x - c[k]!) ** 2, 0)))
  if (radii.length < 4) return -1
  const mean = radii.reduce((a, b) => a + b, 0) / radii.length
  const sd = Math.sqrt(radii.reduce((a, r) => a + (r - mean) ** 2, 0) / radii.length)
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
  if (directions.length === 0) return 0
  const vals = axes.map((u) => {
    let s = 0
    for (const n of directions) s += Math.pow(dot(n, u), order)
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
