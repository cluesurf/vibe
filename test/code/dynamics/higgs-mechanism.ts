// Conformance for code/dynamics/higgs-mechanism: the Mexican-hat potential closed forms (pure algebra).
//   - vacuum v = sqrt(mu2 / 2 lambda) for mu2 > 0, else 0.
//   - the Higgs mass squared V''(v) = -2 mu2 + 12 lambda v^2 = 4 mu2 in the broken phase, 0 in the symmetric.
//   - the gauge boson mass m = g v.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  mexicanHatVacuum,
  higgsBosonMassSquared,
  gaugeBosonMass,
} from '@/code/dynamics/higgs-mechanism'

suite('dynamics/higgs-mechanism: vacuum', [
  check('broken phase vacuum v = sqrt(mu2 / 2 lambda)', () => {
    close(mexicanHatVacuum(2, 0.5), Math.sqrt(2 / 1), 1e-12, 'v')
    close(mexicanHatVacuum(8, 1), 2, 1e-12, 'v = 2')
  }),
  check('symmetric phase (mu2 <= 0) has v = 0', () => {
    equal(mexicanHatVacuum(-1, 0.5), 0, 'v = 0')
    equal(mexicanHatVacuum(0, 0.5), 0, 'v = 0 at mu2 = 0')
  }),
])

suite('dynamics/higgs-mechanism: masses', [
  check('the Higgs mass squared is 4 mu2 in the broken phase', () => {
    for (const [mu2, lambda] of [[2, 0.5], [8, 1], [3, 0.25]] as const) {
      close(higgsBosonMassSquared(mu2, lambda), 4 * mu2, 1e-12, `m_H^2 = 4 mu2 (${mu2})`)
    }
  }),
  check('the symmetric phase has zero curvature contribution from v', () => {
    // mu2 <= 0: v = 0, so m_H^2 = -2 mu2 (>= 0)
    close(higgsBosonMassSquared(-3, 0.5), 6, 1e-12, 'm_H^2 = -2 mu2 symmetric')
  }),
  check('the gauge boson mass is g v', () => {
    close(gaugeBosonMass(0.65, 2), 1.3, 1e-12, 'm = g v')
  }),
])
