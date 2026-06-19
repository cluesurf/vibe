// Atomic ground-state energies for the multi-electron atom, in Hartree atomic units (the Rydberg is one half
// Hartree, one Hartree is 27.211 eV). The hydrogen atom is one electron in the nuclear well, but helium is TWO
// electrons, and the new physics is the electron-electron REPULSION, the reason the independent-particle picture is
// only a starting point. For two 1s electrons of a trial nuclear charge zeta around a nucleus of charge Z, the
// energy is the sum of two hydrogenic kinetic-plus-attraction terms and the mutual repulsion,
//
//   E(zeta) = zeta^2 - 2 Z zeta + (5/8) zeta   (Hartree),
//
// where zeta^2 is the kinetic energy of the two electrons, -2 Z zeta the nuclear attraction, and (5/8) zeta the
// electron-electron repulsion expectation. Setting zeta = Z (no screening) gives the first-order perturbative
// energy, and minimizing over zeta gives the variational energy with the optimal screened charge zeta = Z - 5/16,
// a rigorous upper bound to the true ground state. Dropping the (5/8) zeta term is the NO-REPULSION control, which
// gives -4 Hartree for helium, far too deep, so the repulsion term is what brings the energy to the observed value.

const HARTREE_IN_EV = 27.211

// the two-electron 1s ground-state energy (Hartree) for a trial charge zeta around a nucleus of charge Z, with or
// without the electron-electron repulsion term
export function twoElectronEnergy(input: {
  nuclearCharge: number
  trialCharge: number
  withRepulsion?: boolean
}): number {
  const z = input.nuclearCharge
  const zeta = input.trialCharge
  const repulsion = input.withRepulsion === false ? 0 : (5 / 8) * zeta
  return zeta * zeta - 2 * z * zeta + repulsion
}

// the optimal variational screened charge, zeta = Z - 5/16 (minimizes the two-electron energy)
export function optimalScreenedCharge(nuclearCharge: number): number {
  return nuclearCharge - 5 / 16
}

// the variational ground-state energy (Hartree), the energy at the optimal screened charge, a rigorous upper bound
export function heliumVariationalEnergy(nuclearCharge: number): number {
  return twoElectronEnergy({
    nuclearCharge,
    trialCharge: optimalScreenedCharge(nuclearCharge),
  })
}

// the first-order perturbative energy (Hartree), zeta = Z (no screening)
export function heliumPerturbativeEnergy(
  nuclearCharge: number,
): number {
  return twoElectronEnergy({
    nuclearCharge,
    trialCharge: nuclearCharge,
  })
}

export function hartreeToEv(hartree: number): number {
  return hartree * HARTREE_IN_EV
}
