// Conformance for code/measure/nuclear-binding: the Bethe-Weizsacker semi-empirical mass formula.
// One nucleus (Fe-56) is reassembled by hand from the model's own constants to verify the term
// structure (signs, the A^2/3 surface, Z(Z-1)/A^1/3 Coulomb, (A-2Z)^2/A asymmetry, even-even
// pairing). The decisive physics check is that the binding curve PEAKS in the iron region only when
// the Coulomb term is on; turning it off removes the peak and the maximum runs to the heaviest mass.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import {
  nuclearBindingEnergy,
  bindingCurvePeak,
} from '@/code/measure/nuclear-binding'

// the same model constants the module defines, used to reassemble one nucleus independently
const VOLUME = 15.75
const SURFACE = 17.8
const COULOMB = 0.711
const ASYMMETRY = 23.7
const PAIRING = 11.18

suite('measure/nuclear-binding: term assembly', [
  // Fe-56, Z=26, N=30 (even-even): reassemble B by hand from the SEMF terms.
  check('Fe-56 binding matches a hand-assembled SEMF', () => {
    const A = 56
    const Z = 26
    const expected =
      VOLUME * A -
      SURFACE * Math.pow(A, 2 / 3) -
      (COULOMB * Z * (Z - 1)) / Math.cbrt(A) -
      (ASYMMETRY * (A - 2 * Z) ** 2) / A +
      PAIRING / Math.sqrt(A) // even-even pairing is positive

    close(
      nuclearBindingEnergy({ massNumber: A, protonNumber: Z }),
      expected,
      1e-9,
    )
  }),
  // Odd-odd N-14? Use Z=7, N=7 (A=14): pairing is negative.
  check('an odd-odd nucleus carries negative pairing', () => {
    const A = 14
    const Z = 7
    const expected =
      VOLUME * A -
      SURFACE * Math.pow(A, 2 / 3) -
      (COULOMB * Z * (Z - 1)) / Math.cbrt(A) -
      (ASYMMETRY * (A - 2 * Z) ** 2) / A -
      PAIRING / Math.sqrt(A) // odd-odd pairing is negative

    close(
      nuclearBindingEnergy({ massNumber: A, protonNumber: Z }),
      expected,
      1e-9,
    )
  }),
  // The Coulomb term lowers the binding for Z > 1: B(with) < B(without).
  check('the Coulomb term reduces the binding energy', () => {
    const withC = nuclearBindingEnergy({
      massNumber: 56,
      protonNumber: 26,
    })

    const withoutC = nuclearBindingEnergy({
      massNumber: 56,
      protonNumber: 26,
      includeCoulomb: false,
    })

    ok(withC < withoutC, `${withC} should be below ${withoutC}`)
    close(withoutC - withC, (COULOMB * 26 * 25) / Math.cbrt(56), 1e-9)
  }),
])

suite('measure/nuclear-binding: the iron peak', [
  // With Coulomb on, the most-bound nucleus is in the iron region (A ~ 56-62) at ~8.8 MeV/nucleon.
  check('the binding curve peaks in the iron region', () => {
    const peak = bindingCurvePeak({ maxMass: 250 })

    ok(
      peak.massNumber >= 50 && peak.massNumber <= 65,
      `iron peak should be A in [50,65], got ${peak.massNumber}`,
    )
    close(peak.bindingPerNucleon, 8.8, 0.3)
  }),
  // Turning off Coulomb removes the decline: the maximum runs to the heaviest mass scanned.
  check('without Coulomb the peak runs to the heaviest mass', () => {
    const peak = bindingCurvePeak({
      maxMass: 250,
      includeCoulomb: false,
    })

    equal(peak.massNumber, 250)
  }),
])
