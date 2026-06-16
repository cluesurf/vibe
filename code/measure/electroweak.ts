// Electroweak boson masses from the Higgs mechanism. When the Higgs gets a vacuum value the gauge bosons gain mass
// from the Higgs kinetic term, the W and Z become massive and the photon stays massless. The tree-level relation is
// M_W / M_Z = cos(theta_W), set by the weak mixing angle, and the rho parameter rho = M_W^2 / (M_Z^2 cos^2(theta_W))
// is one for a Higgs in the SU(2) DOUBLET (the custodial symmetry), but not for other representations. For a Higgs
// of weak isospin T with the vacuum value in its T_3 component, rho = (T(T+1) - T_3^2) / (2 T_3^2), which is one for
// the doublet (T = 1/2, T_3 = 1/2) and one half for a triplet (T = 1, T_3 = 1), so the observed rho = 1 forces the
// doublet.

// the custodial rho parameter for a Higgs of weak isospin T with the vacuum in its T_3 component
export function custodialRho(input: { isospin: number; isospinComponent: number }): number {
  const t = input.isospin
  const t3 = input.isospinComponent
  return (t * (t + 1) - t3 * t3) / (2 * t3 * t3)
}

// the tree-level W to Z mass ratio from the weak mixing angle, M_W / M_Z = cos(theta_W) = sqrt(1 - sin^2(theta_W))
export function wToZMassRatio(sin2ThetaW: number): number {
  return Math.sqrt(1 - sin2ThetaW)
}
