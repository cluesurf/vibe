// The molecular bond, the hydrogen molecular ion H2+, the simplest molecule and the prototype of the covalent bond.
// After hydrogen (one electron in one well, `spin/hydrogen-spectrum`) and helium (two electrons in one well,
// `spin/helium-ground-state`), the next composite is the first MOLECULE, one electron shared between TWO protons. The
// new physics is the BOND, the electron lowers its energy by spreading over both centers, and the question is whether
// the substrate's bound-state arithmetic produces a stable molecule with the observed bond length and dissociation
// energy.
//
//   - THE BOND FORMS. The bonding orbital (the symmetric combination of a 1s orbital on each proton) has a clear
//     energy minimum at a finite separation, a bound molecule, while the antibonding orbital (the antisymmetric
//     combination) is purely repulsive, no minimum, the control that shows the bond is specific to the shared,
//     symmetric state.
//   - THE BOND IS THE SHARED ELECTRON. The bond comes from the resonance integral, the electron amplitude that links
//     the two centers. Removing it (the no-resonance control) destroys the bond entirely, so the molecule is held
//     together by the electron being shared, not by any classical attraction.
//   - THE QUANTITATIVE BOND. Letting the orbital contract toward the bond (a variational orbital exponent) gives an
//     equilibrium separation of 2.00 Bohr (the observed value) and a dissociation energy of about 2.35 eV (the
//     observed 2.79, the residual being the known single-exponent-orbital limitation, which omits the polarization of
//     the orbital along the bond axis). The optimal exponent is about 1.24, the electron contracting from the
//     free-atom value of one.
//
// So the simplest molecule is a quantitative composite prediction, a stable H2+ bond at the observed 2.00-Bohr length
// and the right-magnitude dissociation energy, formed by the shared electron (the resonance integral), with the
// repulsive antibonding state and the no-resonance no-bond case the controls. Depth L3, the bond length and energy
// computed deterministically in closed form, with the antibonding and no-resonance cases the controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  hydrogenMolecularIonAntibondingEnergy,
  hydrogenMolecularIonBondingEnergy,
  hydrogenMolecularIonVariationalBond,
} from '@/code/measure/molecular-bond'

// the observed H2+ equilibrium bond length (Bohr) and dissociation energy (eV)
const OBSERVED_BOND_LENGTH = 2.0
const OBSERVED_DISSOCIATION_EV = 2.79
// the separated-atom energy (Hartree), one hydrogen atom plus a bare proton
const DISSOCIATION_LIMIT = -0.5

export default experiment({
  id: 'spin/molecular-bond',
  title:
    'the H2+ molecular bond, a stable molecule at the observed 2.0-Bohr length from the shared electron, the antibonding and no-resonance cases the controls',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    // the variational bond, the equilibrium separation and dissociation energy with a contracting orbital
    const bond = hydrogenMolecularIonVariationalBond()
    const bondLengthMatches =
      Math.abs(bond.equilibriumSeparation - OBSERVED_BOND_LENGTH) < 0.1
    const dissociationRightMagnitude =
      bond.dissociationEnergyEv > 0.7 * OBSERVED_DISSOCIATION_EV &&
      bond.dissociationEnergyEv < 1.1 * OBSERVED_DISSOCIATION_EV
    const electronContracts =
      bond.effectiveCharge > 1 && bond.effectiveCharge < 1.5

    // the bond is bound, the bonding energy at equilibrium is below the separated-atom limit
    const bondingAtEquilibrium = hydrogenMolecularIonBondingEnergy({
      separation: bond.equilibriumSeparation,
    })
    const isBound = bondingAtEquilibrium < DISSOCIATION_LIMIT

    // the control, the antibonding orbital is purely repulsive, no minimum below the dissociation limit
    let antibondingMin = Number.POSITIVE_INFINITY
    for (let r = 0.6; r < 8; r += 0.01) {
      antibondingMin = Math.min(
        antibondingMin,
        hydrogenMolecularIonAntibondingEnergy(r),
      )
    }
    const antibondingRepulsive =
      antibondingMin > DISSOCIATION_LIMIT - 1e-3

    // the control, removing the resonance integral destroys the bond (no minimum below the dissociation limit)
    let noResonanceMin = Number.POSITIVE_INFINITY
    for (let r = 0.6; r < 10; r += 0.01) {
      noResonanceMin = Math.min(
        noResonanceMin,
        hydrogenMolecularIonBondingEnergy({
          separation: r,
          includeResonance: false,
        }),
      )
    }
    const noResonanceNoBond = noResonanceMin > DISSOCIATION_LIMIT - 1e-3

    const ok =
      bondLengthMatches &&
      dissociationRightMagnitude &&
      electronContracts &&
      isBound &&
      antibondingRepulsive &&
      noResonanceNoBond

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hydrogen molecular ion H2+, the simplest molecule, is a stable bond formed by the shared electron. The bonding orbital (the symmetric combination of a 1s orbital on each proton) has an energy minimum at the observed equilibrium separation of 2.00 Bohr, with a dissociation energy of about 2.35 eV (the observed 2.79, the residual being the known single-exponent-orbital limitation). The optimal orbital exponent is about 1.24, the electron contracting from the free-atom value of one. The antibonding orbital is purely repulsive (no bond, the control), and removing the resonance integral (the shared-electron amplitude) destroys the bond entirely (the second control), so the molecule is held together precisely by the electron being shared between the two centers.',
      metrics: {
        effectiveCharge: Number(bond.effectiveCharge.toFixed(3)),
        equilibriumSeparation: Number(
          bond.equilibriumSeparation.toFixed(3),
        ),
        observedBondLength: OBSERVED_BOND_LENGTH,
        dissociationEnergyEv: Number(
          bond.dissociationEnergyEv.toFixed(3),
        ),
        observedDissociationEv: OBSERVED_DISSOCIATION_EV,
        bondingEnergyAtEquilibrium: Number(
          bondingAtEquilibrium.toFixed(4),
        ),
        antibondingMinimum: Number(antibondingMin.toFixed(4)),
        noResonanceMinimum: Number(noResonanceMin.toFixed(4)),
      },
      control: {
        antibondingMinimum: Number(antibondingMin.toFixed(4)),
        antibondingRepulsive: antibondingRepulsive ? 1 : 0,
        noResonanceNoBond: noResonanceNoBond ? 1 : 0,
      },
      notes:
        'the bonding energy is E_+(R) = -1/2 + 1/R - (j + k)/(1 + S) with the closed-form two-center integrals (overlap S, Coulomb j, resonance k) for 1s orbitals. A fixed exponent of one gives a minimum at about 2.5 Bohr and a depth of about 1.8 eV, the right order, and letting the exponent vary (the electron contracting to about 1.24) gives the equilibrium separation 2.00 Bohr (the observed value) and the dissociation energy about 2.35 eV (the observed 2.79, the residual being the orbital polarization the single-exponent ansatz omits). The antibonding energy E_-(R) = -1/2 + 1/R - (j - k)/(1 - S) is purely repulsive (the control), and dropping the resonance integral k destroys the bond (the second control), so the bond is the shared, symmetric electron. This is the molecular row of the per-particle verification, the first covalent bond, after hydrogen and helium.',
    })
  },
})
