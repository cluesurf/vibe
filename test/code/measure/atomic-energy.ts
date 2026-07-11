// Conformance for code/measure/atomic-energy: the two-electron 1s energy E(zeta) = zeta^2 - 2 Z zeta
// + (5/8) zeta. The variational minimum is the vertex of this parabola at zeta = Z - 5/16 with value
// -(Z - 5/16)^2, an independent closed form. The perturbative (zeta = Z) and no-repulsion controls
// are checked, and the variational energy must be a deeper bound than perturbation but above the
// repulsion-free -Z^2.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  twoElectronEnergy,
  optimalScreenedCharge,
  heliumVariationalEnergy,
  heliumPerturbativeEnergy,
  hartreeToEv,
} from '@/code/measure/atomic-energy'

const TOL = 1e-12

suite('measure/atomic-energy: two-electron energy', [
  // Z=2, zeta=2: 4 - 8 + 1.25 = -2.75.
  check(
    'the perturbative (zeta = Z) energy for helium is -2.75',
    () => {
      close(
        twoElectronEnergy({ nuclearCharge: 2, trialCharge: 2 }),
        -2.75,
        TOL,
      )
      close(heliumPerturbativeEnergy(2), -2.75, TOL)
    },
  ),
  // No repulsion: 4 - 8 = -4 (the control, far too deep).
  check(
    'dropping the repulsion gives -4 (the no-repulsion control)',
    () => {
      close(
        twoElectronEnergy({
          nuclearCharge: 2,
          trialCharge: 2,
          withRepulsion: false,
        }),
        -4,
        TOL,
      )
    },
  ),
])

suite('measure/atomic-energy: variational minimum', [
  // The optimal screened charge minimizes E(zeta): zeta = Z - 5/16.
  check('the optimal screened charge is Z - 5/16', () => {
    close(optimalScreenedCharge(2), 2 - 5 / 16, TOL)
  }),
  // The minimum value of zeta^2 + (-2Z + 5/8) zeta is -(Z - 5/16)^2.
  check('the variational energy is -(Z - 5/16)^2', () => {
    for (const Z of [1, 2, 3])
      close(heliumVariationalEnergy(Z), -((Z - 5 / 16) ** 2), TOL)
  }),
  // The variational bound is deeper than perturbation but above the repulsion-free -Z^2.
  check(
    'variational sits below perturbative and above the no-repulsion control',
    () => {
      const v = heliumVariationalEnergy(2)
      const p = heliumPerturbativeEnergy(2)

      ok(v < p, `variational ${v} should be below perturbative ${p}`)
      ok(v > -4, `variational ${v} should be above the no-repulsion -4`)
    },
  ),
])

suite('measure/atomic-energy: unit conversion', [
  check('one Hartree is 27.211 eV', () => {
    close(hartreeToEv(1), 27.211, TOL)
    close(hartreeToEv(-2), -54.422, TOL)
  }),
])
