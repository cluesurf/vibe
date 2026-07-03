// Conformance for code/operator/graviton: the graviton operator assembled from the linearized
// Einstein pipeline into the 6x6 Voigt matrix on symmetric 3-tensors, then diagonalized. The
// facts come OUT of the derived operator, none imposed:
//   - The physical spectrum has exactly TWO modes at eigenvalue (1/2)|k|^2 (the graviton
//     polarizations), reported as gravitonModes.
//   - The reported graviton eigenvalue equals (1/2)|k|^2.
//   - Pure-gauge perturbations are annihilated, so the diffeo residual is ~0.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import { gravitonFromAction } from '@/code/operator/graviton'

suite('operator/graviton: spectrum from the derived operator', [
  check('exactly two graviton modes at eigenvalue (1/2)|k|^2', () => {
    for (const k of [
      [0.3, -0.5, 0.7],
      [1, 0, 0],
      [0.6, 0.6, 0.6],
    ]) {
      const result = gravitonFromAction({ k })
      const k2 = (k[0] ?? 0) ** 2 + (k[1] ?? 0) ** 2 + (k[2] ?? 0) ** 2
      equal(result.gravitonModes, 2, `graviton modes for k=${String(k)}`)
      close(
        result.gravitonEigenvalue,
        0.5 * k2,
        1e-12,
        `graviton eigenvalue for k=${String(k)}`,
      )
      // the reported eigenvalue must actually appear in the spectrum.
      ok(
        result.eigenvalues.some(
          v => Math.abs(v - 0.5 * k2) < 1e-6 * (1 + k2),
        ),
        `eigenvalue present for k=${String(k)}`,
      )
    }
  }),
  check(
    'pure-gauge perturbations are annihilated (diffeo residual ~ 0)',
    () => {
      const result = gravitonFromAction({ k: [0.3, -0.5, 0.7] })
      close(result.diffeoResidual, 0, 1e-9, 'diffeo residual')
    },
  ),
  check(
    'all eigenvalues are finite (the Einstein operator is indefinite: the conformal mode is negative)',
    () => {
      const result = gravitonFromAction({ k: [0.3, -0.5, 0.7] })

      for (const v of result.eigenvalues) {
        ok(Number.isFinite(v), 'finite eigenvalue')
      }

      // the trace (conformal) sector carries a negative eigenvalue -1/2|k|^2, so the operator is
      // NOT positive semidefinite; the two physical graviton modes are the positive +1/2|k|^2 pair.
      const k2 = 0.3 ** 2 + 0.5 ** 2 + 0.7 ** 2
      ok(
        result.eigenvalues.some(v => v < -1e-9),
        'the conformal mode gives a negative eigenvalue',
      )
      ok(
        Math.min(...result.eigenvalues) > -0.5 * k2 - 1e-6,
        'bounded below by -1/2|k|^2',
      )
    },
  ),
])
