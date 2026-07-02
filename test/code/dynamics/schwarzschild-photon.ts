// Conformance for code/dynamics/schwarzschild-photon: strong-field photon orbits / the black-hole shadow.
// Invariants:
//   - SHADOW RADIUS closed form b_c = (3 sqrt 3 / 2) r_s.
//   - the orbit-DERIVED capture threshold (measuredShadowRadius) equals that closed form.
//   - WEAK FIELD: for large impact parameter b the deflection -> 2 r_s / b (the factor-of-two bending).
//   - CAPTURE: a photon with b below the shadow has no turning point (deflection is null).

import { suite, check, close, ok, equal } from '@/test/code/harness'
import {
  schwarzschildPhotonDeflection,
  photonSphereShadowRadius,
  measuredShadowRadius,
} from '@/code/dynamics/schwarzschild-photon'

suite('dynamics/schwarzschild-photon: shadow radius', [
  check('the closed-form shadow radius is (3 sqrt 3 / 2) r_s', () => {
    close(
      photonSphereShadowRadius(1),
      (3 * Math.sqrt(3)) / 2,
      1e-12,
      'r_s = 1',
    )
    close(
      photonSphereShadowRadius(2),
      3 * Math.sqrt(3),
      1e-12,
      'r_s = 2',
    )
  }),
  check(
    'the orbit-derived capture threshold matches the closed form',
    () => {
      const rs = 1
      const measured = measuredShadowRadius({ schwarzschildRadius: rs })
      close(
        measured,
        photonSphereShadowRadius(rs),
        5e-3,
        'measured == closed form',
      )
    },
  ),
])

suite('dynamics/schwarzschild-photon: weak field and capture', [
  check(
    'large impact parameter gives the weak-field deflection ~ 2 r_s / b',
    () => {
      const rs = 1
      const b = 400
      const def = schwarzschildPhotonDeflection({
        impactParameter: b,
        schwarzschildRadius: rs,
      })

      ok(def !== null, 'photon escapes at large b')
      close(
        def!,
        (2 * rs) / b,
        ((2 * rs) / b) * 0.05,
        'weak-field 2 r_s / b',
      )
    },
  ),
  check('a photon below the shadow radius is captured (null)', () => {
    const rs = 1
    const bc = photonSphereShadowRadius(rs)
    equal(
      schwarzschildPhotonDeflection({
        impactParameter: bc * 0.8,
        schwarzschildRadius: rs,
      }),
      null,
      'captured below the shadow',
    )
    ok(
      schwarzschildPhotonDeflection({
        impactParameter: bc * 1.5,
        schwarzschildRadius: rs,
      }) !== null,
      'escapes above the shadow',
    )
  }),
])
