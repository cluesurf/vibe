// The molecular bond, the hydrogen molecular ion H2+, the simplest molecule (two protons sharing one electron) and
// the prototype of the covalent bond. In atomic units (energy Hartree, length Bohr), the electron is described by the
// bonding combination of a 1s orbital on each proton, and the bond exists because the electron is SHARED between the
// two centers (the resonance integral), which lowers the energy below a separated hydrogen atom plus a bare proton.
//
// The closed-form two-center integrals for two 1s orbitals of exponent one at separation w (Bohr):
//   - overlap            S(w) = e^-w (1 + w + w^2/3)
//   - Coulomb            j(w) = 1/w - e^-2w (1 + 1/w)      = <A| 1/r_B |A>
//   - resonance          k(w) = e^-w (1 + w)               = <A| 1/r_A |B>
// The bonding energy (electronic plus the nuclear repulsion 1/R) is E_+(R) = -1/2 + 1/R - (j + k)/(1 + S), and the
// antibonding energy is E_-(R) = -1/2 + 1/R - (j - k)/(1 - S). The bonding state has a minimum (a bound molecule), the
// antibonding state is purely repulsive (no bond). Setting the resonance integral k to zero removes the bond, the
// proof that the shared electron is what binds.
//
// A single fixed exponent (one) places the minimum at about 2.5 Bohr with a well depth of about 1.8 eV, the right
// order. Letting the orbital exponent zeta vary (the electron contracts toward the bond) and minimizing over both the
// exponent and the separation gives the variational bond, the optimal exponent about 1.24, the equilibrium separation
// 2.0 Bohr (the observed value), and the dissociation energy about 2.35 eV (the observed 2.79, the residual being the
// known limitation of the single-exponent orbital, which omits the polarization of the orbital along the bond).

const HARTREE_IN_EV = 27.211

function overlap(w: number): number {
  return Math.exp(-w) * (1 + w + (w * w) / 3)
}

function coulombIntegral(w: number): number {
  return 1 / w - Math.exp(-2 * w) * (1 + 1 / w)
}

function resonanceIntegral(w: number): number {
  return Math.exp(-w) * (1 + w)
}

// the bonding-orbital total energy (Hartree) at internuclear separation R (Bohr), exponent one. With
// includeResonance false the resonance integral is dropped (the no-bond control).
export function hydrogenMolecularIonBondingEnergy(input: {
  separation: number
  includeResonance?: boolean
}): number {
  const r = input.separation
  const k = input.includeResonance === false ? 0 : resonanceIntegral(r)
  return -0.5 + 1 / r - (coulombIntegral(r) + k) / (1 + overlap(r))
}

// the antibonding-orbital total energy (Hartree), the repulsive state with no bond
export function hydrogenMolecularIonAntibondingEnergy(
  separation: number,
): number {
  const r = separation
  return (
    -0.5 +
    1 / r -
    (coulombIntegral(r) - resonanceIntegral(r)) / (1 - overlap(r))
  )
}

// the unit-exponent kinetic and electron-nuclear expectations of the bonding state as functions of w = zeta R, used
// to scale to a variable orbital exponent (kinetic scales as zeta^2, the electron-nuclear attraction as zeta)
function bondingKinetic(w: number): number {
  return (
    (0.5 * (1 - overlap(w)) + resonanceIntegral(w)) / (1 + overlap(w))
  )
}

function bondingElectronNuclear(w: number): number {
  return (
    (-1 - coulombIntegral(w) - 2 * resonanceIntegral(w)) /
    (1 + overlap(w))
  )
}

// the variational bond, minimizing the H2+ bonding energy over both the orbital exponent zeta and the separation R.
// E(zeta, R) = zeta^2 t(w) + zeta (v(w) + 1/w) with w = zeta R. Returns the optimal exponent, the equilibrium
// separation (Bohr), the minimum energy (Hartree), and the dissociation energy (eV, the depth below the separated
// hydrogen atom at -1/2 Hartree).
export function hydrogenMolecularIonVariationalBond(): {
  effectiveCharge: number
  equilibriumSeparation: number
  minimumEnergy: number
  dissociationEnergyEv: number
} {
  let best = {
    effectiveCharge: 0,
    equilibriumSeparation: 0,
    minimumEnergy: Number.POSITIVE_INFINITY,
  }
  for (let w = 0.5; w < 6; w += 0.0005) {
    const t = bondingKinetic(w)
    const v = bondingElectronNuclear(w)
    const zeta = -(v + 1 / w) / (2 * t) // the exponent that minimizes the energy at fixed w
    if (zeta <= 0) continue
    const energy = zeta * zeta * t + zeta * (v + 1 / w)
    if (energy < best.minimumEnergy) {
      best = {
        effectiveCharge: zeta,
        equilibriumSeparation: w / zeta,
        minimumEnergy: energy,
      }
    }
  }
  return {
    effectiveCharge: best.effectiveCharge,
    equilibriumSeparation: best.equilibriumSeparation,
    minimumEnergy: best.minimumEnergy,
    dissociationEnergyEv: (-0.5 - best.minimumEnergy) * HARTREE_IN_EV,
  }
}

// the simple (fixed exponent one) bonding minimum, scanned over separation
export function hydrogenMolecularIonSimpleBond(): {
  equilibriumSeparation: number
  dissociationEnergyEv: number
} {
  let best = {
    equilibriumSeparation: 0,
    energy: Number.POSITIVE_INFINITY,
  }
  for (let r = 0.5; r < 6; r += 0.0005) {
    const e = hydrogenMolecularIonBondingEnergy({ separation: r })
    if (e < best.energy) best = { equilibriumSeparation: r, energy: e }
  }
  return {
    equilibriumSeparation: best.equilibriumSeparation,
    dissociationEnergyEv: (-0.5 - best.energy) * HARTREE_IN_EV,
  }
}
