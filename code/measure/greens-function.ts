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
      for (const j of neighbors[i]!) s += phi[j]!
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
    const r = Math.round(Math.sqrt(coords[i]!.reduce((a, x, k) => a + (x - c[k]!) ** 2, 0)))
    if (r < 1 || r > rmax) continue
    sums[r] = (sums[r] ?? 0) + phi[i]!
    cnts[r] = (cnts[r] ?? 0) + 1
  }
  const pts: [number, number][] = []
  for (let r = 1; r <= rmax; r++) {
    if (cnts[r] && sums[r]! > 0) pts.push([Math.log(r), Math.log(sums[r]! / cnts[r]!)])
  }
  if (pts.length < 3) return NaN
  const n = pts.length
  const sx = pts.reduce((a, p) => a + p[0], 0)
  const sy = pts.reduce((a, p) => a + p[1], 0)
  const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0)
  const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0)
  return Math.round(-((n * sxy - sx * sy) / (n * sxx - sx * sx)) * 100) / 100
}
