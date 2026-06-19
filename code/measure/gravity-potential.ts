// Closed-form static gravitational potentials, the weak-field falloff laws used to compare
// substrate dimensionality. A bare 3D substrate gives the pure Newtonian 1/r potential at every
// scale. A 4D bulk with one compact extra dimension of size L (a braneworld) sums the Kaluza-Klein
// modes into a clean closed form that is 4D (1/r^2 force) at short range r << L and 3D (1/r^2 force,
// 1/r potential) at long range r >> L. The crossover scale equals the size of the extra dimension.

// Pure 1/r potential of a bare 3D substrate (matter fills all three dimensions).
export function newtonianPotential3D(radius: number): number {
  return 1 / (4 * Math.PI * radius)
}

// Brane potential felt on a 3D slice of a 4D bulk with a compact extra dimension of size L,
// the Kaluza-Klein mode sum: G(r) = 1 / (4 pi L r (1 - exp(-2 pi r / L))).
export function branePotential(input: {
  radius: number
  extraDimension: number
}): number {
  const { radius, extraDimension: L } = input
  return (
    1 /
    (4 *
      Math.PI *
      L *
      radius *
      (1 - Math.exp((-2 * Math.PI * radius) / L)))
  )
}

// Weak-field photon deflection by a point mass M at impact parameter b (G = c = 1). The transverse
// deflection integrand of the potential Phi = -M/r is d_perp Phi = M b / (x^2 + b^2)^(3/2), integrated
// along the nearly straight path. A Newtonian particle feels only the time term (angle 2M/b); a photon
// in the full metric feels both the time AND space terms, so the GR angle is twice that (4M/b).
export function weakFieldLightDeflection(input: {
  mass: number
  impact: number
  pathHalfLength?: number
  step?: number
}): { grAngle: number; newtonAngle: number; ratio: number } {
  const { mass: M, impact: b } = input
  const L = input.pathHalfLength ?? 4000 * b
  const dx = input.step ?? b / 200
  let integral = 0
  for (let x = -L; x <= L; x += dx)
    integral += ((M * b) / (x * x + b * b) ** 1.5) * dx
  return { grAngle: 2 * integral, newtonAngle: integral, ratio: 2 }
}
