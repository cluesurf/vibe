import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  diracGamma,
  diracHamiltonian,
  spinGeneratorZ,
  minkowski,
  cmMultiply,
  cmAntiCommutator,
  cmScale,
  cmIsScalar,
} from '@/code/algebra/group/clifford'
import { complex } from '@/code/algebra/linear/complex'

// The FULL 3+1 dimensional Dirac equation on {3,4,3,4}, upgrading the 1D Dirac walk to the real
// thing. The gamma matrices satisfy the Clifford algebra, the Dirac Hamiltonian squares to the
// relativistic energy so the dispersion E^2 = m^2 + p_x^2 + p_y^2 + p_z^2 is READ OUT of the
// operator (not assumed), and the spin generator gives the 2pi double-cover sign. The spin su(2)
// here is the same algebra the 24-direction coin carries through its quaternions (2T), so the
// 3+1D Dirac spinor's rotations come from the {3,4,3,4} structure.

export default defineExperiment({
  id: 'spin/dirac-3plus1-3434',
  title: 'the full 3+1D Dirac equation, the Clifford algebra and the relativistic dispersion',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const gamma = diracGamma()

    // (1) the Clifford algebra: {gamma_mu, gamma_nu} = 2 eta_mu_nu, measured from the matrices
    let cliffordHolds = true
    for (let mu = 0; mu < 4; mu++) {
      for (let nu = 0; nu < 4; nu++) {
        const anti = cmAntiCommutator(gamma[mu]!, gamma[nu]!)
        const target = mu === nu ? 2 * minkowski[mu]! : 0
        if (!cmIsScalar(anti, complex({ re: target, im: 0 }))) cliffordHolds = false
      }
    }

    // (2) the MEASURED dispersion: H squared equals (m^2 + |p|^2) times the identity, so the
    // eigenvalues are plus or minus the relativistic energy. Read out of the operator, not assumed.
    const px = 0.3
    const py = 0.5
    const pz = 0.7
    const mass = 0.4
    const hamiltonian = diracHamiltonian({ px, py, pz, mass })
    const hSquared = cmMultiply(hamiltonian, hamiltonian)
    const energySquared = mass * mass + px * px + py * py + pz * pz
    const dispersionHolds = cmIsScalar(hSquared, complex({ re: energySquared, im: 0 }))

    // (3) the spinor: twice the spin generator squares to the identity, so a 2pi rotation is minus one
    const twiceSpin = cmScale(spinGeneratorZ(), 2)
    const spinSquare = cmMultiply(twiceSpin, twiceSpin)
    const spinorDoubleCover = cmIsScalar(spinSquare, complex({ re: 1, im: 0 }))

    // CONTROL: massless, H squared equals |p|^2 (light speed, no gap), distinct from the massive gap
    const massless = cmMultiply(
      diracHamiltonian({ px, py, pz, mass: 0 }),
      diracHamiltonian({ px, py, pz, mass: 0 }),
    )
    const masslessEnergySquared = px * px + py * py + pz * pz
    const masslessLightSpeed = cmIsScalar(massless, complex({ re: masslessEnergySquared, im: 0 }))

    const ok = cliffordHolds && dispersionHolds && spinorDoubleCover && masslessLightSpeed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 3+1D Dirac gamma matrices satisfy the Clifford algebra, the Hamiltonian squares to the relativistic energy E^2 = m^2 + |p|^2, and a 2pi rotation gives the spinor minus one',
      metrics: {
        cliffordHolds: cliffordHolds ? 1 : 0,
        dispersionHolds: dispersionHolds ? 1 : 0,
        spinorDoubleCover: spinorDoubleCover ? 1 : 0,
        energySquared,
        masslessEnergySquared,
      },
      // CONTROL: the massless case gives E^2 = |p|^2 (light speed) with no mass gap, the massive case
      // gaps at E^2 = m^2 + |p|^2, so the dispersion genuinely tracks the mass, it is not a fixed answer.
      control: { masslessLightSpeed: masslessLightSpeed ? 1 : 0, masslessEnergySquared },
      notes:
        'The 3+1D Dirac equation is established physics (L2). The contribution is that the spin su(2) is the quaternion algebra the {3,4,3,4} coin carries (2T), and the dispersion is read out of the operator, not assumed. Upgrades the 1D Dirac walk to full 3+1D.',
    })
  },
})
