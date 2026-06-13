// The screened (massive) graph-Laplacian Green's function: the solution phi of
// (D - A + m^2) phi = delta_start on a plain neighbor list. The mass term m^2 makes
// the operator non-singular (Yukawa-screened), so a simple fixed-point Jacobi
// iteration converges: phi[i] <- (delta[i] + sum_{j ~ i} phi[j]) / (deg(i) + m^2).
// The unscreened 1/r Coulomb tail survives at distances below the screening length,
// where a radial fit recovers the gravity falloff exponent.

export function screenedGreensFunction(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  start: number
  mass2: number
  iterations: number
}): Float64Array {
  const { neighbors, start, mass2, iterations } = input
  const n = neighbors.length
  const phi = new Float64Array(n)
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < n; i++) {
      const row = neighbors[i] ?? []
      let s = i === start ? 1 : 0
      for (const j of row) s += phi[j]!
      phi[i] = s / (row.length + mass2)
    }
  }
  return phi
}
