// Conformance for code/dynamics/ginzburg-landau: gradient flow of a complex order parameter on a ring.
// Invariants:
//   - a unit-modulus winding-w field has |psi| = 1 everywhere.
//   - the Dirichlet energy of a uniform field is 0; a winding field has strictly positive energy.
//   - GRADIENT FLOW DESCENDS ENERGY: relaxing a defect/anti-defect pair lowers the energy.
//   - DETERMINISM (no RNG).

import { suite, check, close, ok, equal } from '@/test/code/harness'
import {
  ringFieldWithWinding,
  ringDefectPair,
  ringFieldEnergy,
  relaxRingField,
  Complex2,
} from '@/code/dynamics/ginzburg-landau'

suite('dynamics/ginzburg-landau: field construction', [
  check('a winding field is unit modulus everywhere', () => {
    const field = ringFieldWithWinding(32, 2)

    for (const z of field) {
      close(Math.hypot(z.re, z.im), 1, 1e-12, 'unit modulus')
    }
  }),
  check(
    'uniform field has zero Dirichlet energy; a winding field has positive energy',
    () => {
      const uniform: Complex2[] = Array.from({ length: 16 }, () => ({
        re: 1,
        im: 0,
      }))

      close(ringFieldEnergy(uniform), 0, 1e-12, 'uniform energy = 0')
      ok(
        ringFieldEnergy(ringFieldWithWinding(16, 1)) > 0,
        'winding energy > 0',
      )
    },
  ),
])

suite('dynamics/ginzburg-landau: gradient flow', [
  check(
    'relaxation lowers the energy of a defect/anti-defect pair',
    () => {
      const field = ringDefectPair(48)
      const e0 = ringFieldEnergy(field)
      const relaxed = relaxRingField({ field, steps: 500, dt: 0.05 })
      ok(ringFieldEnergy(relaxed) < e0, 'energy descended')
    },
  ),
  check('energy is monotone non-increasing along the flow', () => {
    const field = ringDefectPair(40)
    const samples: number[] = []
    relaxRingField({
      field,
      steps: 400,
      dt: 0.05,
      sampleEvery: 50,
      onSample: f => samples.push(ringFieldEnergy(f)),
    })

    for (let i = 1; i < samples.length; i++) {
      ok(
        samples[i]! <= samples[i - 1]! + 1e-9,
        `non-increasing at ${i}`,
      )
    }
  }),
])

suite('dynamics/ginzburg-landau: determinism', [
  check('two relaxations agree', () => {
    const a = relaxRingField({
      field: ringDefectPair(32),
      steps: 100,
      dt: 0.05,
    })

    const b = relaxRingField({
      field: ringDefectPair(32),
      steps: 100,
      dt: 0.05,
    })

    for (let i = 0; i < a.length; i++) {
      equal(a[i]!.re, b[i]!.re, `re ${i}`)
      equal(a[i]!.im, b[i]!.im, `im ${i}`)
    }
  }),
])
