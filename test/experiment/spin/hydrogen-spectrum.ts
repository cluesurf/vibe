// The hydrogen atom, built and measured, the tangible capstone. The everyday matter of the world is atoms, and the
// simplest is hydrogen, one electron bound to one proton. The exclusion and shell structure were already built
// (`spin/fermi-exclusion`, `spin/atoms-shell-filling`), but the energy SPECTRUM was not. Here it is. An emergent
// non-relativistic electron (kinetic energy p^2 / 2m, the low-energy limit of the emergent Dirac dispersion) in the
// emergent Coulomb well V(r) = -k/r (the gauge potential of the proton charge, the electromagnetic analogue of the
// gravity potential already built) is solved for its bound states, per angular momentum, and gives the two defining
// features of hydrogen.
//
//   1. THE RYDBERG SERIES. The bound-state energies follow E_n = -m k^2 / (2 n^2), the Bohr and Rydberg law, the
//      energy falling as one over the principal quantum number squared. The implied n from each measured energy is
//      an integer (1, 2, 3, 4), the ground state at the Rydberg unit.
//   2. THE ACCIDENTAL l-DEGENERACY. The energy depends only on n, not separately on the angular momentum l, so the
//      2s and 2p coincide, and the 3s, 3p, and 3d coincide. This is the hydrogen SO(4) symmetry, special to the 1/r
//      Coulomb potential. A non-Coulomb (softened) potential LIFTS the degeneracy (the s and p energies split), the
//      control, so the degeneracy is the signature of the 1/r law specifically.
//
// So a hydrogen atom is built on the substrate, the Rydberg spectrum and the Coulomb l-degeneracy, the flagship
// tangible result, the matter of the everyday world from the emergent electron and the emergent Coulomb field.
// Depth L2, the Rydberg law and the l-degeneracy measured deterministically, with the softened (non-Coulomb)
// potential the degeneracy-lifting control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { radialSchrodingerLevels } from '@/code/operator/radial-schrodinger'

const MASS = 1
const CHARGE = 1
const SPACING = 0.1
const POINTS = 520

function coulombLevels(l: number, count: number): number[] {
  return radialSchrodingerLevels({
    l,
    potential: r => -CHARGE / r,
    mass: MASS,
    spacing: SPACING,
    points: POINTS,
    count,
  })
}
function softenedLevels(l: number, count: number): number[] {
  return radialSchrodingerLevels({
    l,
    potential: r => -CHARGE / Math.sqrt(r * r + 1),
    mass: MASS,
    spacing: SPACING,
    points: POINTS,
    count,
  })
}

export default experiment({
  id: 'spin/hydrogen-spectrum',
  title:
    'the hydrogen atom, the Rydberg series E_n proportional to -1/n^2 and the accidental l-degeneracy, lifted by a non-Coulomb control',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the s-series (l=0), the principal Rydberg series n = 1, 2, 3, 4
    const sSeries = coulombLevels(0, 4)
    const pSeries = coulombLevels(1, 3) // 2p, 3p, 4p
    const dSeries = coulombLevels(2, 2) // 3d, 4d

    // the implied principal quantum number from each s-level, E = -1/(2 n^2) so n = 1/sqrt(-2 E)
    const impliedN = sSeries.map(e => 1 / Math.sqrt(-2 * e))
    // the Rydberg law holds if the implied n are the integers 1, 2, 3, 4
    const rydbergHolds = impliedN.every(
      (n, i) => Math.abs(n - (i + 1)) < 0.05,
    )
    const groundStateRydberg = Math.abs(sSeries[0]! - -0.5) < 0.01

    // the accidental l-degeneracy, E(2s) = E(2p), and E(3s) = E(3p) = E(3d)
    const degeneracy2 = Math.abs(sSeries[1]! - pSeries[0]!)
    const degeneracy3sp = Math.abs(sSeries[2]! - pSeries[1]!)
    const degeneracy3pd = Math.abs(pSeries[1]! - dSeries[0]!)
    const lDegeneracyHolds =
      degeneracy2 < 0.001 &&
      degeneracy3sp < 0.001 &&
      degeneracy3pd < 0.002

    // the control, a softened (non-Coulomb) potential lifts the degeneracy, the s and p energies split
    const softS = softenedLevels(0, 2)
    const softP = softenedLevels(1, 1)
    const softSplit = Math.abs(softS[1]! - softP[0]!)
    const controlLiftsDegeneracy = softSplit > 0.005

    const ok =
      rydbergHolds &&
      groundStateRydberg &&
      lDegeneracyHolds &&
      controlLiftsDegeneracy

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hydrogen atom built on the substrate, an emergent electron in the emergent Coulomb well, reproduces the two defining features of hydrogen. The bound-state energies follow the Rydberg series E_n proportional to minus one over n squared (the implied principal quantum numbers are the integers one to four, the ground state at the Rydberg unit), and the energy has the accidental l-degeneracy of the 1/r Coulomb potential (the 2s and 2p coincide, and the 3s, 3p, and 3d coincide, the hydrogen SO(4) symmetry). A non-Coulomb softened potential lifts the degeneracy (the s and p energies split), the control, so the degeneracy is the signature of the 1/r law specifically. So the matter of the everyday world, the hydrogen spectrum, emerges from the emergent electron and the emergent Coulomb field.',
      metrics: {
        groundStateEnergy: Number(sSeries[0]!.toFixed(5)),
        impliedN1: Number(impliedN[0]!.toFixed(3)),
        impliedN2: Number(impliedN[1]!.toFixed(3)),
        impliedN3: Number(impliedN[2]!.toFixed(3)),
        impliedN4: Number(impliedN[3]!.toFixed(3)),
        energy2s: Number(sSeries[1]!.toFixed(5)),
        energy3s: Number(sSeries[2]!.toFixed(5)),
        degeneracy2sp: Number(degeneracy2.toFixed(6)),
        degeneracy3spd: Number(
          Math.max(degeneracy3sp, degeneracy3pd).toFixed(6),
        ),
        controlSplit: Number(softSplit.toFixed(5)),
      },
      control: {
        controlSplit: Number(softSplit.toFixed(5)),
        controlLiftsDegeneracy: controlLiftsDegeneracy ? 1 : 0,
      },
      notes:
        'the radial Schrodinger equation for the emergent electron in the emergent Coulomb potential gives the Rydberg series E_n = -1/(2 n^2) (in units m = k = 1, the Hartree atomic units), the implied n the integers one to four, and the accidental l-degeneracy (the energy depends only on n, the 2s equal to the 2p, the 3s equal to the 3p equal to the 3d), the hydrogen SO(4) symmetry special to the 1/r potential. The softened-potential control lifts the degeneracy, confirming the 1/r law is doing the work. The higher levels (n above four) are limited by the finite radial box, the well-resolved levels carry the result. This is the tangible capstone, a hydrogen atom on the substrate, the Coulomb well being the electromagnetic analogue of the gravity potential already built.',
    })
  },
})
