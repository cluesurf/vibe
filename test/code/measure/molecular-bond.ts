// Conformance for code/measure/molecular-bond: the H2+ molecular ion. The bonding state has a
// minimum below the dissociation limit (-1/2 Hartree); the antibonding state is purely repulsive
// (no minimum, energy above -1/2); dropping the resonance integral removes the bond. The simple
// (exponent one) and variational scans must reproduce the documented equilibrium geometry and well
// depths (simple ~2.5 Bohr / ~1.8 eV; variational zeta ~1.24, ~2.0 Bohr, ~2.35 eV).

import { suite, check, close, ok } from '@/test/code/harness'
import {
  hydrogenMolecularIonBondingEnergy,
  hydrogenMolecularIonAntibondingEnergy,
  hydrogenMolecularIonVariationalBond,
  hydrogenMolecularIonSimpleBond,
} from '@/code/measure/molecular-bond'

const DISSOCIATION = -0.5 // separated H atom + bare proton, in Hartree

suite('measure/molecular-bond: bonding vs antibonding', [
  // The bonding state is below the separated-atom limit at the equilibrium region (a bound molecule).
  check('the bonding state is bound (below -1/2 Hartree)', () => {
    ok(
      hydrogenMolecularIonBondingEnergy({ separation: 2.5 }) < DISSOCIATION,
      'bonding energy at 2.5 Bohr should be below -0.5',
    )
  }),
  // The antibonding state is repulsive: it lies above the dissociation limit (no bond).
  check('the antibonding state is not bound (above -1/2 Hartree)', () => {
    ok(
      hydrogenMolecularIonAntibondingEnergy(2.5) > DISSOCIATION,
      'antibonding energy should be above -0.5',
    )
  }),
  // Removing the resonance (shared-electron) integral destroys the bond.
  check('dropping the resonance integral removes the bond', () => {
    const withK = hydrogenMolecularIonBondingEnergy({ separation: 2.5 })
    const withoutK = hydrogenMolecularIonBondingEnergy({
      separation: 2.5,
      includeResonance: false,
    })
    ok(withoutK > withK, `no-resonance ${withoutK} should be above bonding ${withK}`)
    ok(withoutK > DISSOCIATION, 'no-resonance state should not be bound')
  }),
])

suite('measure/molecular-bond: bond geometry', [
  // Fixed exponent one: minimum near 2.5 Bohr, well depth near 1.8 eV.
  check('the simple bond is near 2.5 Bohr and 1.8 eV', () => {
    const b = hydrogenMolecularIonSimpleBond()
    close(b.equilibriumSeparation, 2.5, 0.15)
    close(b.dissociationEnergyEv, 1.8, 0.25)
  }),
  // Variational: optimal exponent ~1.24, separation ~2.0 Bohr, dissociation ~2.35 eV.
  check('the variational bond contracts to zeta ~1.24 at ~2.0 Bohr', () => {
    const v = hydrogenMolecularIonVariationalBond()
    close(v.effectiveCharge, 1.24, 0.05)
    close(v.equilibriumSeparation, 2.0, 0.1)
    close(v.dissociationEnergyEv, 2.35, 0.2)
  }),
  // The variational bond is deeper (more dissociation energy) than the fixed-exponent one.
  check('the variational bond is deeper than the simple bond', () => {
    const v = hydrogenMolecularIonVariationalBond()
    const s = hydrogenMolecularIonSimpleBond()
    ok(
      v.dissociationEnergyEv > s.dissociationEnergyEv,
      `variational ${v.dissociationEnergyEv} should exceed simple ${s.dissociationEnergyEv}`,
    )
  }),
])
