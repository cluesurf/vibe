// The screened (massive) graph-Laplacian Green's function: the solution phi of
// (D - A + m^2) phi = delta_start on a plain neighbor list. The mass term m^2 makes
// the operator non-singular (Yukawa-screened), so a simple fixed-point Jacobi
// iteration converges: phi[i] <- (delta[i] + sum_{j ~ i} phi[j]) / (deg(i) + m^2).
// The unscreened 1/r Coulomb tail survives at distances below the screening length,
// where a radial fit recovers the gravity falloff exponent.

export function screenedGreensFunction(input: {
  neighbors: readonly (readonly number[])[]
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

// A clamped-source leaky random walk on a CSR graph: the source is pinned to 1 each step, every
// other cell pushes a fraction (1 - leak) of its mass equally to its neighbours, and the leak is
// lost. After many steps the stationary occupancy is the screened (massive) boundary propagator;
// its radial falloff is the gravity-law probe. Returns the per-node occupancy.
export function clampedLeakyDiffusion(input: {
  offsets: ArrayLike<number>
  adjacency: ArrayLike<number>
  nodeCount: number
  source: number
  leak: number
  iterations: number
}): Float64Array {
  const {
    offsets: off,
    adjacency: adj,
    nodeCount: N,
    source: src,
    leak,
    iterations,
  } = input

  let p = new Float64Array(N)

  p[src] = 1

  let np = new Float64Array(N)

  for (let t = 0; t < iterations; t++) {
    np.fill(0)
    np[src] = 1

    for (let i = 0; i < N; i++) {
      const pi = p[i]!

      if (!pi) continue

      const d = off[i + 1]! - off[i]!
      const sh = ((1 - leak) * pi) / d

      for (let q = off[i]!; q < off[i + 1]!; q++)
        np[adj[q]!] = np[adj[q]!]! + sh
    }

    const tmp = p

    p = np
    np = tmp
  }

  return p
}
