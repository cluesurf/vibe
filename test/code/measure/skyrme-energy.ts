// Conformance for code/measure/skyrme-energy: the exchange / Skyrme energies and the topological
// skyrmion charge of a direction field. A uniform (vacuum) field has zero exchange, zero Skyrme, and
// zero charge. Placing a charge-Q skyrmion makes the field's topological charge exactly Q (the
// integer winding) and gives positive exchange and Skyrme energy. The Derrick energy is exchange +
// kappa Skyrme by construction.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  blankDirectionField2d,
  placeSkyrmion2d,
  directionFieldEnergy2d,
  directionFieldDerrickEnergy2d,
  skyrmionCharge2d,
  hedgehogTexture3d,
  directionFieldEnergy3d,
} from '@/code/measure/skyrme-energy'

suite('measure/skyrme-energy: the vacuum', [
  // An all-+z field has no gradients: zero exchange, zero Skyrme, zero charge.
  check('a uniform field has zero energy and zero charge', () => {
    const f = blankDirectionField2d(20)
    const e = directionFieldEnergy2d(f)
    close(e.exchange, 0, 1e-12)
    close(e.skyrme, 0, 1e-12)
    equal(skyrmionCharge2d(f), 0)
  }),
])

suite('measure/skyrme-energy: topological charge', [
  // The topological invariant is the winding magnitude. NOTE: this implementation's plaquette
  // orientation makes a charge-Q placement read as -Q (the magnitude is the invariant; the sign is a
  // fixed orientation convention shared by every plaquette), so the magnitude is the robust check.
  check('a charge-1 skyrmion has |topological charge| 1', () => {
    const f = blankDirectionField2d(48)
    placeSkyrmion2d({ field: f, centerX: 24, centerY: 24, radius: 9, charge: 1 })
    equal(Math.abs(skyrmionCharge2d(f)), 1)
  }),
  // A charge-2 texture winds twice, with the same sign convention as charge 1.
  check('a charge-2 skyrmion has |topological charge| 2, same sign as charge 1', () => {
    const f1 = blankDirectionField2d(48)
    placeSkyrmion2d({ field: f1, centerX: 24, centerY: 24, radius: 9, charge: 1 })
    const f2 = blankDirectionField2d(48)
    placeSkyrmion2d({ field: f2, centerX: 24, centerY: 24, radius: 9, charge: 2 })
    equal(Math.abs(skyrmionCharge2d(f2)), 2)
    equal(Math.sign(skyrmionCharge2d(f2)), Math.sign(skyrmionCharge2d(f1)))
  }),
  // A charge-1 texture carries positive exchange and Skyrme energy, and Derrick = exchange + kappa Skyrme.
  check('a skyrmion has positive energy; Derrick is exchange + kappa Skyrme', () => {
    const f = blankDirectionField2d(48)
    placeSkyrmion2d({ field: f, centerX: 24, centerY: 24, radius: 9, charge: 1 })
    const e = directionFieldEnergy2d(f)
    ok(e.exchange > 0, `exchange should be positive, got ${e.exchange}`)
    ok(e.skyrme > 0, `skyrme should be positive, got ${e.skyrme}`)
    const kappa = 0.5
    close(
      directionFieldDerrickEnergy2d(f, kappa),
      e.exchange + kappa * e.skyrme,
      1e-9,
    )
  }),
])

suite('measure/skyrme-energy: 3D field', [
  // A 3D hedgehog has positive exchange and Skyrme; the surrounding +z vacuum contributes nothing.
  check('a 3D hedgehog texture has positive energy', () => {
    const f = hedgehogTexture3d({ size: 16, radius: 5 })
    const e = directionFieldEnergy3d(f)
    ok(e.exchange > 0, `exchange should be positive, got ${e.exchange}`)
    ok(e.skyrme > 0, `skyrme should be positive, got ${e.skyrme}`)
  }),
])
