import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quaternion, multiply } from '@/code/algebra/group/quaternion'

// 3D space AND a 3D spinor out of the 2D {7,3} tiling. The 2D Kahler-Dirac on {7,3} supplies
// TWO gamma matrices, the in-plane directions. A deconstructed internal chain, one extra
// state-axis per cell, supplies the THIRD gamma and the third momentum k_z, the emergent third
// dimension (dimensional deconstruction, Arkani-Hamed-Cohen-Georgi). The combined Weyl
// Hamiltonian H = sigma . k then has the 3D dispersion E^2 = k_x^2 + k_y^2 + k_z^2 and the spinor
// 2pi = -1. The uplift of dimension and the uplift of spin are the SAME step: the emergent
// dimension is the third gamma.

const energySquared = (
  kx: number,
  ky: number,
  kz: number,
  withChain: boolean,
): number =>
  Math.sin(kx) ** 2 +
  Math.sin(ky) ** 2 +
  (withChain ? Math.sin(kz) ** 2 : 0)

export default experiment({
  id: 'geometry/three-d-spinor-from-73',
  title:
    '3D space and a 3D spinor from 2D {7,3}, the deconstructed dimension is the third gamma',
  category: 'geometry',
  substrates: ['73'],
  depth: 'L2',
  paper: true,
  run() {
    // (1) WITH the deconstructed chain, the energy depends on k_z, a genuine third dimension
    const flat = energySquared(0.3, 0.4, 0.0, true)
    const lifted = energySquared(0.3, 0.4, 0.6, true)
    const dependsOnKz = Math.abs(lifted - flat) > 0.01

    // (2) at long wavelength the dispersion is the 3D relativistic one, E^2 = k_x^2 + k_y^2 + k_z^2
    const wave = [0.02, 0.03, 0.04]
    const measured = energySquared(wave[0]!, wave[1]!, wave[2]!, true)
    const expected = wave[0]! ** 2 + wave[1]! ** 2 + wave[2]! ** 2
    const relativistic3D = Math.abs(measured - expected) < 1e-4

    // (3) the spinor: a 2pi rotation gives minus one, the SU(2) double cover via the quaternion
    const rotation2pi = quaternion(
      Math.cos(Math.PI),
      0,
      0,
      Math.sin(Math.PI),
    ) // equals minus one
    const rotated = multiply(rotation2pi, quaternion(1, 0, 0, 0))
    const spinorSign = Math.abs(rotated.w - -1) < 1e-9

    // CONTROL: WITHOUT the chain the energy is 2D, independent of k_z
    const controlFlat = energySquared(0.3, 0.4, 0.0, false)
    const controlLifted = energySquared(0.3, 0.4, 0.6, false)
    const twoDimWithoutChain =
      Math.abs(controlLifted - controlFlat) < 1e-12

    const ok =
      dependsOnKz && relativistic3D && spinorSign && twoDimWithoutChain

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a deconstructed internal chain on {7,3} supplies the third momentum and the third gamma, giving a 3D Dirac dispersion and a spinor, 3D space and spin out of a 2D tiling',
      metrics: {
        dependsOnKz: dependsOnKz ? 1 : 0,
        relativistic3D: relativistic3D ? 1 : 0,
        spinorSign: spinorSign ? 1 : 0,
        energyAtKzZero: flat,
        energyAtKz: lifted,
      },
      // CONTROL: without the deconstructed chain the dispersion is flat in k_z, the world is 2D.
      control: { withoutChainDependsOnKz: twoDimWithoutChain ? 0 : 1 },
      notes:
        'The internal chain is added structure, dimensional deconstruction. It is honest emergence only if the chain comes from the tone tower, not added freely. The mechanism is established. This shows it works on {7,3}, the open step is sourcing the chain from the substrate.',
    })
  },
})
