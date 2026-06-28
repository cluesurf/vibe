// Conformance for code/dynamics/optical-ray: gravity as a refractive (clock-rate) well, the eikonal ray.
// Invariants:
//   - NO WELL, NO BENDING: strength 0 is a uniform index, so the ray passes straight (deflection 0).
//   - WEAK FIELD: the deflection is ~ -2 strength / impactParameter (negative = toward the mass), the
//     1/b lensing law.
//   - DETERMINISM.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import { refractiveDeflection } from '@/code/dynamics/optical-ray'

suite('dynamics/optical-ray: refractive deflection', [
  check('a uniform index (strength 0) bends nothing', () => {
    close(refractiveDeflection({ impactParameter: 10, strength: 0 }), 0, 1e-9, 'straight ray')
  }),
  check('a weak well bends the ray toward the mass by ~ 2 strength / b', () => {
    const b = 20
    const strength = 1
    const def = refractiveDeflection({ impactParameter: b, strength })
    ok(def < 0, 'bends toward the mass (negative)')
    close(def, -(2 * strength) / b, (2 * strength) / b * 0.15, 'weak-field 2 k / b')
  }),
  check('the deflection is deterministic', () => {
    const run = (): number => refractiveDeflection({ impactParameter: 15, strength: 0.5 })
    equal(run(), run(), 'reproducible')
  }),
])
