// The Z_N quantum double, the deconfined topological phase of the gauged ternary tone. When the discrete Z_N tone
// symmetry is gauged, the result is a Z_N lattice gauge theory whose deconfined phase is the Z_N toric code (Kitaev's
// quantum double D(Z_N)), a topologically ordered phase with anyonic excitations. The signatures of DECONFINEMENT
// (topological order) are exact and computable from the lattice topology alone.
//
//   - THE GROUND-STATE DEGENERACY IS A TOPOLOGICAL INVARIANT. On a closed surface of genus g, the toric-code
//     ground-state degeneracy is N^(2g), independent of the lattice size. It follows from counting the independent
//     stabilizers, one redundancy among the vertex (star) operators and one among the plaquette operators on each
//     handle, so the number of logical qudits is E - (V - 1) - (F - 1) = 2 - (V - E + F) = 2 - chi = 2g, the Euler
//     characteristic. A torus (g = 1) gives N^2, a sphere (g = 0) gives 1 (no topological order), a genus-2 surface
//     gives N^4. The degeneracy being a topological invariant (size-independent, depending only on the surface) IS
//     the deconfinement order parameter.
//   - THE ANYONS. The deconfined phase has N^2 anyon types (the Z_N electric charge times the Z_N magnetic flux), with
//     the mutual braiding phase of an electric charge e around a magnetic flux m equal to 2 pi e m / N. For Z_3 the
//     elementary braiding is 2 pi / 3, the fractional statistics.
//   - THE TOTAL QUANTUM DIMENSION AND THE TOPOLOGICAL ENTANGLEMENT ENTROPY. The total quantum dimension is
//     D = sqrt(sum of d_a^2) = N for the abelian Z_N (every anyon has quantum dimension one), so the topological
//     entanglement entropy is gamma = log D = log N, a nonzero universal constant that vanishes in any trivial
//     (confined) phase.
//
// A trivial or confined phase has none of these, the ground state is unique on every surface (degeneracy 1), there
// are no anyons, and the topological entanglement entropy is zero, the control.

// the number of independent stabilizers and the logical-qudit count from a cell complex, the toric-code ground-state
// degeneracy N^(logical qudits) = N^(2 - chi) where chi = V - E + F is the Euler characteristic
export function toricCodeGroundStateDegeneracy(input: {
  toneStates: number
  vertices: number
  edges: number
  faces: number
}): number {
  const euler = input.vertices - input.edges + input.faces
  const logicalQudits = 2 - euler // = 2g for a closed orientable surface

  return Math.round(input.toneStates ** logicalQudits)
}

// a square-lattice cell complex of side L on a closed orientable surface of the given genus. The torus (genus 1) is
// the periodic L-by-L square lattice (V = L^2, E = 2 L^2, F = L^2). A higher genus adds handles, each handle raising
// the edge count by one relative to the face/vertex balance so that chi = 2 - 2g.
export function squareLatticeCellCounts(input: {
  side: number
  genus: number
}): {
  vertices: number
  edges: number
  faces: number
} {
  const l = input.side
  // base torus counts
  const vertices = l * l

  let edges = 2 * l * l

  const faces = l * l

  // adjust the edge count so the Euler characteristic is 2 - 2g (the genus enters through the topology, the torus is
  // genus 1, each extra handle lowers chi by 2)
  edges += 2 * (input.genus - 1)

  return { vertices, edges, faces }
}

// the number of anyon types in the Z_N quantum double, the electric charge times the magnetic flux
export function anyonTypeCount(toneStates: number): number {
  return toneStates * toneStates
}

// the mutual braiding phase (radians) of an electric charge e around a magnetic flux m in the Z_N quantum double
export function mutualBraidingPhase(input: {
  electricCharge: number
  magneticFlux: number
  toneStates: number
}): number {
  return (
    (2 * Math.PI * input.electricCharge * input.magneticFlux) /
    input.toneStates
  )
}

// the total quantum dimension D = sqrt(sum d_a^2) = N for the abelian Z_N (all anyons have quantum dimension one)
export function totalQuantumDimension(toneStates: number): number {
  return Math.sqrt(anyonTypeCount(toneStates))
}

// the topological entanglement entropy gamma = log D = log N
export function topologicalEntanglementEntropy(
  toneStates: number,
): number {
  return Math.log(totalQuantumDimension(toneStates))
}
