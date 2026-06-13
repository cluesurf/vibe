// The Bethe lattice (infinite regular tree) resolvent by the cavity recursion. On
// a tree the Green's function of the adjacency or the graph Laplacian has an exact
// per-step decay, so a bulk-mediated boundary correlator has a clean power-law
// exponent with no finite-patch artifact. Used for the holographic boundary
// correlator and the tree gravity propagator.

// The cavity decay mu(E): the resolvent of the adjacency on a Bethe lattice of
// coordination z (branching b = z - 1) at spectral parameter E decays by mu per
// tree step, where b mu^2 - E mu + 1 = 0. The Laplacian static (massless) point is
// E = z, giving the Coulomb decay per step (mu = 1 / b).
export function betheCavityDecay(input: {
  coordination: number
  energy: number
}): number {
  const branching = input.coordination - 1
  const energy = input.energy
  // At the band edge energy = 2 sqrt(branching) the discriminant is zero, but floating-point roundoff
  // can make it slightly negative, so clamp it before the square root.
  const disc = Math.max(0, energy * energy - 4 * branching)
  return (energy - Math.sqrt(disc)) / (2 * branching)
}

// The boundary correlator exponent alpha: a bulk-mediated correlator on the
// boundary of a Bethe lattice decays as 1 / r^alpha with alpha = 2 ln(1/mu)/ln(b),
// since boundary distance r grows as b^(tree-distance / 2). The massless point
// gives a universal alpha = 2.
export function betheBoundaryExponent(input: {
  coordination: number
  energy: number
}): number {
  const branching = input.coordination - 1
  const mu = betheCavityDecay(input)
  return (2 * Math.log(1 / mu)) / Math.log(branching)
}
