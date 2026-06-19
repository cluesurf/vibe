// Flavor mixing from the mass hierarchy. When two fermion families have hierarchical masses, the mixing angle that
// rotates between them is set by the SQUARE ROOT of their mass ratio (the Gatto-Sartori-Tonin relation, the generic
// consequence of a hierarchical mass matrix whose off-diagonal entries are of order the geometric mean of the
// diagonal ones). So a STEEP hierarchy (the quarks) gives SMALL mixing, and a MILD hierarchy (the neutrinos) gives
// LARGE mixing. This is the link between the mass spectrum and the mixing pattern.
//
//   - The Cabibbo angle, tan(theta_C) = sqrt(m_down / m_strange), gives |V_us| about 0.22, the observed quark mixing.
//   - The quark mixing is hierarchical, |V_us| > |V_cb| > |V_ub|, scaling as powers of the Cabibbo parameter
//     (the Wolfenstein structure lambda, lambda^2, lambda^3), reflecting the steep quark-mass hierarchy.
//   - The lepton (neutrino) mixing is LARGE because the neutrino masses are nearly degenerate (a mild hierarchy from
//     the seesaw), the opposite regime from the quarks.

// the mixing angle (radians) between two families from the square root of their mass ratio, tan(theta) = sqrt(m_light
// / m_heavy), the Gatto-Sartori-Tonin relation
export function mixingAngleFromMassRatio(input: {
  lightMass: number
  heavyMass: number
}): number {
  return Math.atan(Math.sqrt(input.lightMass / input.heavyMass))
}

// the mixing-matrix element |V| = sin(theta) for the angle from the mass ratio
export function mixingElementFromMassRatio(input: {
  lightMass: number
  heavyMass: number
}): number {
  return Math.sin(mixingAngleFromMassRatio(input))
}

// the Wolfenstein hierarchy, the three off-diagonal scales as powers of the Cabibbo parameter lambda, [lambda,
// lambda^2, lambda^3] for [|V_us|, |V_cb|, |V_ub|]
export function wolfensteinHierarchy(lambda: number): {
  vus: number
  vcb: number
  vub: number
} {
  return {
    vus: lambda,
    vcb: lambda * lambda,
    vub: lambda * lambda * lambda,
  }
}
