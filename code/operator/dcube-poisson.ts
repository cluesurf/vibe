// The discrete Poisson Green's function on a flat d-cube of side L: solve (-Laplacian) x = delta
// with a unit point source at the center and Dirichlet (x = 0) boundary, by conjugate gradient.
// The Laplacian is the plain d-dimensional nearest-neighbour stencil (2d on the diagonal, -1 to
// each in-bounds neighbour), not a substrate adjacency, so the falloff of the solution is the
// established lattice Newton law (1/r in 3D, log r in 2D). Returns the solution and the
// index <-> coordinate maps. d is 2 or 3.
export function dCubePoissonGreens(input: {
  side: number
  dimension: number
  iterations?: number
  tolerance?: number
}): { x: Float64Array; idx: (c: number[]) => number; coord: (i: number) => number[] } {
  const L = input.side
  const d = input.dimension
  const iterations = input.iterations ?? 4000
  const tol = input.tolerance ?? 1e-7
  const N = d === 3 ? L * L * L : L * L
  const idx = (c: number[]): number => d === 3 ? (c[2]! * L + c[1]!) * L + c[0]! : c[1]! * L + c[0]!
  const coord = (i: number): number[] => d === 3 ? [i % L, ((i / L) | 0) % L, (i / (L * L)) | 0] : [i % L, (i / L) | 0]
  const lap = (p: Float64Array, o: Float64Array): void => {
    for (let i = 0; i < N; i++) {
      const c = coord(i); let v = 2 * d * p[i]!
      for (let k = 0; k < d; k++) for (const s of [-1, 1]) { const cc = c.slice(); cc[k]! += s; if (cc[k]! >= 0 && cc[k]! < L) v -= p[idx(cc)]! }
      o[i] = v
    }
  }
  const dot = (a: Float64Array, b: Float64Array): number => { let s = 0; for (let i = 0; i < N; i++) s += a[i]! * b[i]!; return s }
  const b = new Float64Array(N); const c0 = d === 3 ? [L >> 1, L >> 1, L >> 1] : [L >> 1, L >> 1]; b[idx(c0)] = 1
  const x = new Float64Array(N), r = b.slice(), p = b.slice(), Ap = new Float64Array(N)
  let rs = dot(r, r)
  for (let it = 0; it < iterations; it++) {
    lap(p, Ap); const al = rs / dot(p, Ap)
    for (let i = 0; i < N; i++) { x[i]! += al * p[i]!; r[i]! -= al * Ap[i]! }
    const rs2 = dot(r, r); if (Math.sqrt(rs2) < tol) break
    const be = rs2 / rs; for (let i = 0; i < N; i++) p[i] = r[i]! + be * p[i]!; rs = rs2
  }
  return { x, idx, coord }
}
