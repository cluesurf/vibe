// The discrete Poisson equation -nabla^2 Phi = source solved by Jacobi relaxation on a neighbor-list
// lattice with Dirichlet boundaries. Interior cells (full coordination) update to the average of their
// neighbors plus the local source, boundary cells (deg below the interior degree) are clamped to zero.
// On a cubic lattice this relaxes to the lattice Green's function, which falls as 1/r in 3D (Newtonian
// gravity, the weak-field Poisson limit). Returns the relaxed potential field.

export function latticePoissonJacobi(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  source: Float64Array
  interiorDegree: number
  iterations: number
  sourceCoefficient?: number
}): Float64Array {
  const { neighbors, source, interiorDegree, iterations } = input
  const coefficient = input.sourceCoefficient ?? 4 * Math.PI
  const n = neighbors.length
  let phi = new Float64Array(n)
  const isBoundary = (i: number): boolean => (neighbors[i]?.length ?? 0) < interiorDegree
  for (let it = 0; it < iterations; it++) {
    const next = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      if (isBoundary(i)) {
        next[i] = 0
        continue
      }
      const row = neighbors[i] ?? []
      let s = 0
      for (const j of row) s += phi[j] ?? 0
      next[i] = (s + coefficient * (source[i] ?? 0)) / row.length
    }
    phi = next
  }
  return phi
}
