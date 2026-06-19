import { graphLaplacianGreensFunction as _glgf } from '@/code/operator/graph-laplacian'
import { neighborDistances as _ndist } from '@/code/tool/graph'
import { linearFit as _lfit } from '@/code/measure/regression'
// The lattice Green's-function (static potential) falloff exponent under DIRICHLET
// boundary conditions. We solve (D - A) phi = delta_center by Jacobi iteration on a
// graph whose nodes each have a fixed coordination `degree` (missing neighbours count
// as phi = 0, the Dirichlet boundary), bin the potential by integer radial distance
// from the centre, and fit log(phi) against log(r) over a small-r window. The negated
// slope is the falloff exponent: a 3D continuum recovers the 1/r law (exponent near 1)
// once the box is large enough. Distinct from graphLaplacianGreensFunction, which uses
// a neutralizing background rather than a Dirichlet boundary.

// Solve (D - A) phi = delta_center by Jacobi sweeps with a fixed degree (the Dirichlet
// boundary, missing edges contribute zero). Returns the potential field.
export function dirichletGreensFunction(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  center: number
  degree: number
  iterations?: number
}): Float64Array {
  const { neighbors, center, degree } = input
  const iterations = input.iterations ?? 800
  const n = neighbors.length
  const phi = new Float64Array(n)
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < n; i++) {
      let s = i === center ? 1 : 0
      for (const j of neighbors[i]!) {
        s += phi[j]!
      }

      phi[i] = s / degree
    }
  }

  return phi
}

// The Dirichlet Green's-function falloff exponent on a coordinate graph, fit over
// radii 1..rmax. Returns NaN when fewer than three radial bins carry signal. Rounded
// to two decimals to match the convergence thresholds it feeds.
export function greensFunctionExponent(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  coords: number[][]
  center: number
  degree: number
  rmax: number
  iterations?: number
}): number {
  const { neighbors, coords, center, rmax } = input
  const phi = dirichletGreensFunction({
    neighbors,
    center,
    degree: input.degree,
    iterations: input.iterations,
  })
  const c = coords[center]!
  const sums: number[] = []
  const cnts: number[] = []
  for (let i = 0; i < neighbors.length; i++) {
    const r = Math.round(
      Math.sqrt(
        coords[i]!.reduce((a, x, k) => a + (x - c[k]!) ** 2, 0),
      ),
    )
    if (r < 1 || r > rmax) {
      continue
    }

    sums[r] = (sums[r] ?? 0) + phi[i]!
    cnts[r] = (cnts[r] ?? 0) + 1
  }

  const pts: [number, number][] = []
  for (let r = 1; r <= rmax; r++) {
    if (cnts[r] && sums[r]! > 0) {
      pts.push([Math.log(r), Math.log(sums[r]! / cnts[r]!)])
    }
  }

  if (pts.length < 3) {
    return NaN
  }

  const n = pts.length
  const sx = pts.reduce((a, p) => a + p[0], 0)
  const sy = pts.reduce((a, p) => a + p[1], 0)
  const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0)
  const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0)

  return (
    Math.round(-((n * sxy - sx * sy) / (n * sxx - sx * sx)) * 100) / 100
  )
}

// Classify how the discrete Laplacian Green function (the gravitational potential from a point source) decays on
// a graph, between two radii. Returns the exponential-fit and power-law-fit R^2 and slopes. On a flat lattice the
// power law (Newton 1/r^(d-2)) wins, on a negatively-curved bulk the exponential (the curvature's spectral gap,
// a screened short-range potential) wins. The fundamental measure for curved-bulk gravity.
export function greensDecayClass(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  size: number
  center: number
  rlo: number
  rhi: number
}): {
  expR2: number
  expRate: number
  powR2: number
  powSlope: number
  exponential: boolean
  points: number
} {
  const G = _glgf({ neighbors: input.neighbors, center: input.center })
  const dist = _ndist({
    neighbors: input.neighbors,
    size: input.size,
    source: input.center,
  })
  const r: number[] = []
  const lr: number[] = []
  const lg: number[] = []
  for (let rr = input.rlo; rr <= input.rhi; rr++) {
    let s = 0
    let k = 0
    for (let i = 0; i < input.size; i++) {
      if (dist[i] === rr && G[i]! > 1e-12) {
        s += G[i]!
        k++
      }
    }

    if (k > 0) {
      r.push(rr)
      lr.push(Math.log(rr))
      lg.push(Math.log(s / k))
    }
  }

  const e = _lfit({ xs: r, ys: lg })
  const p = _lfit({ xs: lr, ys: lg })

  return {
    expR2: e.r2,
    expRate: e.slope,
    powR2: p.r2,
    powSlope: p.slope,
    exponential: e.r2 > p.r2,
    points: r.length,
  }
}
