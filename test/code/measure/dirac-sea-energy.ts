// Conformance for code/measure/dirac-sea-energy: the sum of negative eigenvalues (the filled sea).
// seaEnergyFromEigenvalues is a direct hand-summed negative filter; diracSeaEnergy diagonalizes a
// real symmetric matrix with a KNOWN spectrum (a diagonal matrix and the Pauli-X with eigenvalues
// +/-1) and must return the same negative sum.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  seaEnergyFromEigenvalues,
  diracSeaEnergy,
} from '@/code/measure/dirac-sea-energy'

const TOL = 1e-9

suite('measure/dirac-sea-energy: negative-eigenvalue sum', [
  // -3 + -1 = -4; the zero and positives are excluded.
  check('sums only the negative eigenvalues', () => {
    equal(seaEnergyFromEigenvalues([-3, -1, 0, 2, 5]), -4)
  }),
  check('an all-positive spectrum has zero sea energy', () => {
    equal(seaEnergyFromEigenvalues([1, 2, 3]), 0)
  }),
])

suite('measure/dirac-sea-energy: diagonalized Hamiltonian', [
  // Diagonal diag(-5, 2, -1): eigenvalues are the diagonal, sea = -6.
  check('a diagonal Hamiltonian sums its negative entries', () => {
    close(
      diracSeaEnergy({
        hamiltonian: [
          [-5, 0, 0],
          [0, 2, 0],
          [0, 0, -1],
        ],
      }),
      -6,
      TOL,
    )
  }),
  // Pauli-X [[0,1],[1,0]] has eigenvalues +1, -1, so sea energy -1.
  check('the off-diagonal Pauli-X sea energy is -1', () => {
    close(
      diracSeaEnergy({
        hamiltonian: [
          [0, 1],
          [1, 0],
        ],
      }),
      -1,
      TOL,
    )
  }),
  // A positive-definite matrix (2 I) has no negative eigenvalues.
  check('a positive-definite Hamiltonian has zero sea energy', () => {
    close(
      diracSeaEnergy({
        hamiltonian: [
          [2, 0],
          [0, 2],
        ],
      }),
      0,
      TOL,
    )
  }),
])
