// Angular isotropy measures, the rotational half of Lorentz invariance. Given a set of unit directions
// (e.g. endpoints of random walks, wave-front normals) and a fixed set of probe axes, measure how
// direction-dependent the order-p angular moment is. Zero means isotropic (every axis sees the same), and a
// large value means a preferred direction survives. The rank-p moment test, core to the isotropy and
// Lorentz-restoration experiments.

import { dot } from '@/code/algebra/vector'

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
