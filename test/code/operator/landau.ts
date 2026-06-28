// Conformance for code/operator/landau: the Landau problem in the oscillator-ladder basis.
// Re-derivable facts (analytic Landau spectra):
//   - Scalar (Klein-Gordon) energy-squared operator pi^2 + m^2 has eigenvalues m^2 + qB(2n+1),
//     the scalar Landau levels (NO zero mode). The lowest few match the closed form.
//   - The Dirac operator is Hermitian (real part symmetric, imaginary part antisymmetric).
//   - Its eigenvalues squared are the relativistic Landau levels m^2 + 2 qB n, INCLUDING a
//     zero mode at E^2 = m^2 (the n=0 spin-aligned level), each level appearing as a +/- pair.
//   - g = 2 fingerprint: scalar lowest level minus Dirac lowest level squared equals qB exactly
//     (the spin magnetic moment), the gap the spinless particle lacks.

import { suite, check, close } from '@/test/code/harness'
import {
  diracLandauHamiltonian,
  scalarLandauSquared,
} from '@/code/operator/landau'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'

const qB = 0.3
const mass = 0.5
const levels = 14

const scalarSpec = (): number[] =>
  Array.from(eigSymmetric({ matrix: scalarLandauSquared({ levels, fieldStrength: qB, mass }) }).values).sort(
    (a, b) => a - b,
  )

const diracSpec = (): number[] =>
  Array.from(eigHermitian({ matrix: diracLandauHamiltonian({ levels, fieldStrength: qB, mass }) }).values).sort(
    (a, b) => a - b,
  )

suite('operator/landau: scalar Landau levels', [
  check('eigenvalues are m^2 + qB(2n+1) (no zero mode)', () => {
    const s = scalarSpec()
    // truncation of the ladder basis contaminates the top half; the lowest 6 of 14 are exact.
    for (let n = 0; n < 6; n++) {
      close(s[n] ?? NaN, mass * mass + qB * (2 * n + 1), 1e-6, `scalar level ${n}`)
    }
  }),
])

suite('operator/landau: Dirac Landau levels', [
  check('the Dirac Hamiltonian is Hermitian (re symmetric, im antisymmetric)', () => {
    const h = diracLandauHamiltonian({ levels, fieldStrength: qB, mass })
    const n = h.rows
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        close(h.re[i * n + j] ?? 0, h.re[j * n + i] ?? 0, 0, `re symmetric [${i}][${j}]`)
        close(h.im[i * n + j] ?? 0, -(h.im[j * n + i] ?? 0), 0, `im antisymmetric [${i}][${j}]`)
      }
    }
  }),
  check('eigenvalues squared are the relativistic levels m^2 + 2 qB n (with a zero mode at m^2)', () => {
    const squared = diracSpec()
      .map(e => e * e)
      .sort((a, b) => a - b)
    // levels appear as +/- pairs, so distinct values are at even indices 0, 2, 4, ...
    for (let n = 0; n < 4; n++) {
      close(squared[2 * n] ?? NaN, mass * mass + 2 * qB * n, 1e-6, `relativistic level ${n}`)
    }
  }),
])

suite('operator/landau: g = 2 magnetic moment', [
  check('scalar lowest minus Dirac lowest squared equals qB', () => {
    const scalarLowest = scalarSpec()[0] ?? NaN
    const diracLowestSquared = Math.min(...diracSpec().map(e => e * e))
    close(scalarLowest - diracLowestSquared, qB, 1e-6, 'spin magnetic-moment gap = qB')
  }),
])
