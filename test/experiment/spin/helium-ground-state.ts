// AUDIT 2026-08-31: regraded from L3 to L1. this experiment is the textbook helium variational energy E(z) = z^2 - 2Zz + 5z/8, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L1. Not a consequence of the {3,4,3,4} base.
// Helium, the simplest multi-electron atom, the ground-state energy with electron-electron repulsion. Hydrogen
// (`spin/hydrogen-spectrum`) is one electron in the nuclear well, a clean closed-form spectrum. Helium is the first
// step beyond, TWO electrons, and the new physics is the mutual REPULSION between them, the reason atoms are not just
// independent particles in a well. We compute the helium ground-state energy three ways and compare to the observed
// -2.9037 Hartree (the negative of the total binding of both electrons).
//
//   - THE VARIATIONAL ENERGY. Two 1s electrons screen the nucleus for each other, so each sees an effective charge
//     zeta = Z - 5/16 = 1.6875 rather than the bare Z = 2. The variational energy at this optimal screened charge is
//     -2.848 Hartree, a rigorous UPPER BOUND within 1.9 percent of the observed -2.9037, a clean quantitative match.
//   - THE PERTURBATIVE ENERGY. Treating the repulsion as a first-order correction (no screening, zeta = Z) gives
//     -2.75 Hartree, in the right ballpark (about 5 percent high), the cruder estimate.
//   - THE IONIZATION ENERGY. Removing one electron leaves the hydrogenic ion He+ at -2 Hartree, so the first
//     ionization energy is the difference, about 0.85 to 0.90 Hartree (23 to 25 eV), near the observed 24.59 eV.
//   - THE CONTROL, NO REPULSION. Dropping the electron-electron repulsion gives -4 Hartree, 38 percent too deep, so
//     the repulsion term is exactly what brings the energy to the observed value, the electrons genuinely push apart.
//
// So helium's ground-state energy is a quantitative composite prediction, the variational screened-charge energy
// within 2 percent of the observed value and the ionization energy near 24.6 eV, with the no-repulsion energy (far
// too deep) the control that shows the electron-electron repulsion is essential. Depth L3, the energies computed
// deterministically in closed form, with the no-repulsion energy the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  hartreeToEv,
  heliumPerturbativeEnergy,
  heliumVariationalEnergy,
  optimalScreenedCharge,
  twoElectronEnergy,
} from '@/code/measure/atomic-energy'

// the observed helium ground-state energy (Hartree) and first ionization energy (eV)
const OBSERVED_ENERGY = -2.9037
const OBSERVED_IONIZATION_EV = 24.59
// the hydrogenic He+ energy (Hartree), -Z^2 / 2 with Z = 2
const HE_PLUS_ENERGY = -2

export default experiment({
  id: 'spin/helium-ground-state',
  code: 'E-SPN-0017',
  title:
    'helium ground-state energy from the screened two-electron variational treatment, within 2 percent of observed, the no-repulsion energy the control',
  category: 'spin',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const Z = 2

    // the variational energy at the optimal screened charge, a rigorous upper bound
    const screenedCharge = optimalScreenedCharge(Z)
    const variational = heliumVariationalEnergy(Z)
    const variationalError =
      Math.abs(variational - OBSERVED_ENERGY) /
      Math.abs(OBSERVED_ENERGY)

    const variationalAccurate = variationalError < 0.03
    const isUpperBound = variational > OBSERVED_ENERGY // variational energy is above the true ground state

    // the perturbative energy (no screening), in the right ballpark
    const perturbative = heliumPerturbativeEnergy(Z)
    const perturbativeBallpark =
      Math.abs(perturbative - OBSERVED_ENERGY) /
        Math.abs(OBSERVED_ENERGY) <
      0.08

    // the first ionization energy, the difference from the hydrogenic He+
    const ionizationHartree = HE_PLUS_ENERGY - variational
    const ionizationEv = hartreeToEv(ionizationHartree)
    const ionizationNear = ionizationEv > 20 && ionizationEv < 27

    // the control, no electron-electron repulsion, far too deep
    const noRepulsion = twoElectronEnergy({
      nuclearCharge: Z,
      trialCharge: Z,
      withRepulsion: false,
    })

    const noRepulsionError =
      Math.abs(noRepulsion - OBSERVED_ENERGY) /
      Math.abs(OBSERVED_ENERGY)

    const controlTooDeep = noRepulsionError > 0.3

    const ok =
      variationalAccurate &&
      isUpperBound &&
      perturbativeBallpark &&
      ionizationNear &&
      controlTooDeep

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'helium, the simplest two-electron atom, has its ground-state energy fixed by the electron-electron repulsion. Each 1s electron screens the nucleus for the other, so it sees an effective charge Z - 5/16 = 1.6875 rather than the bare 2, and the variational energy at this screened charge is -2.848 Hartree, a rigorous upper bound within 1.9 percent of the observed -2.9037. The first ionization energy (the difference from the hydrogenic He+ at -2 Hartree) is about 24 eV, near the observed 24.59 eV. The control is to drop the electron-electron repulsion, which gives -4 Hartree, 38 percent too deep, so the repulsion term is exactly what brings the energy to the observed value, the electrons genuinely push apart.',
      metrics: {
        screenedCharge: Number(screenedCharge.toFixed(4)),
        variationalEnergy: Number(variational.toFixed(4)),
        observedEnergy: OBSERVED_ENERGY,
        variationalErrorPercent: Number(
          (variationalError * 100).toFixed(2),
        ),
        perturbativeEnergy: Number(perturbative.toFixed(4)),
        ionizationEv: Number(ionizationEv.toFixed(2)),
        observedIonizationEv: OBSERVED_IONIZATION_EV,
        noRepulsionEnergy: Number(noRepulsion.toFixed(4)),
      },
      control: {
        noRepulsionEnergy: Number(noRepulsion.toFixed(4)),
        controlTooDeep: controlTooDeep ? 1 : 0,
      },
      notes:
        'AUDIT 2026-08-31: this experiment is the textbook helium variational energy E(z) = z^2 - 2Zz + 5z/8, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L1. Not a consequence of the {3,4,3,4} base. ' +
        'the two-electron energy is E(zeta) = zeta^2 - 2 Z zeta + (5/8) zeta in Hartree, the kinetic energy, the nuclear attraction, and the electron-electron repulsion expectation for two 1s orbitals. The perturbative value (zeta = Z = 2) is -2.75 Hartree, and minimizing over zeta gives the screened charge zeta = Z - 5/16 = 1.6875 and the variational energy -2.848 Hartree, a rigorous upper bound 1.9 percent above the observed -2.9037 (the small residual is the correlation energy, the part beyond the independent-orbital ansatz). The ionization energy is the variational energy minus the hydrogenic He+ energy (-2 Hartree), about 23 to 25 eV near the observed 24.59. The no-repulsion control (-4 Hartree, both electrons in the bare Z = 2 well) is 38 percent too deep, so the electron-electron repulsion is the essential new physics beyond hydrogen. This is the multi-electron-atom row of the per-particle verification, the helium ground state with repulsion, the quantitative companion to the qualitative shell filling (`spin/atoms-shell-filling`).',
    })
  },
})
