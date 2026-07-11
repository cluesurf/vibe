// Conformance for code/dynamics/inflaton: slow-roll inflaton dynamics (RK4). Invariants:
//   - inflatonHubble = sqrt((1/2 phidot^2 + V)/3).
//   - de SITTER FIXED POINT: a flat potential (V constant, V' = 0) with phidot = 0 is a fixed point, the
//     field stays put and H stays constant.
//   - a nonzero slope rolls the field downhill (phidot moves opposite the slope).
//   - DETERMINISM.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import { inflatonHubble, inflatonStep } from '@/code/dynamics/inflaton'

suite('dynamics/inflaton: Hubble rate', [
  check('inflatonHubble matches sqrt((1/2 phidot^2 + V)/3)', () => {
    const potential = (phi: number): number => 2 * phi * phi
    const h = inflatonHubble({ phi: 3, phidot: 0.5, potential })
    const expected = Math.sqrt((0.5 * 0.25 + 2 * 9) / 3)

    close(h, expected, 1e-12, 'Hubble closed form')
  }),
])

suite('dynamics/inflaton: de Sitter fixed point', [
  check('a flat potential with phidot 0 is a fixed point', () => {
    const V0 = 5
    const potential = (): number => V0
    const potentialSlope = (): number => 0

    let phi = 2
    let phidot = 0

    const dt = 0.01
    const H0 = inflatonHubble({ phi, phidot, potential })

    for (let t = 0; t < 200; t++) {
      const next = inflatonStep({
        phi,
        phidot,
        potential,
        potentialSlope,
        dt,
      })

      phi = next.phi
      phidot = next.phidot
    }

    close(phi, 2, 1e-9, 'field stays put')
    close(phidot, 0, 1e-9, 'velocity stays 0')
    close(
      inflatonHubble({ phi, phidot, potential }),
      H0,
      1e-9,
      'H stays constant (de Sitter)',
    )
  }),
  check(
    'a positive slope rolls the field downhill (phidot < 0)',
    () => {
      const potential = (phi: number): number => phi * phi
      const potentialSlope = (phi: number): number => 2 * phi
      const next = inflatonStep({
        phi: 1,
        phidot: 0,
        potential,
        potentialSlope,
        dt: 0.01,
      })

      ok(next.phidot < 0, 'rolls down (phidot negative)')
    },
  ),
])

suite('dynamics/inflaton: determinism', [
  check('two identical steps agree', () => {
    const potential = (phi: number): number => phi * phi
    const potentialSlope = (phi: number): number => 2 * phi
    const a = inflatonStep({
      phi: 4,
      phidot: -0.1,
      potential,
      potentialSlope,
      dt: 0.02,
    })

    const b = inflatonStep({
      phi: 4,
      phidot: -0.1,
      potential,
      potentialSlope,
      dt: 0.02,
    })

    equal(a.phi, b.phi, 'phi')
    equal(a.phidot, b.phidot, 'phidot')
  }),
])
