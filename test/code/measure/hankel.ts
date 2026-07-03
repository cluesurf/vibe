// Conformance for code/measure/hankel. The Hankel matrix of a sequence is H[i][j] = C(i+j); the
// spectral-positivity test reads its minimum eigenvalue. We check the matrix layout exactly and the
// eigenvalues against hand-diagonalizable cases (a diagonal matrix, the symmetric [[1,2],[2,1]] whose
// eigenvalues are 1 +/- 2). A positive moment sequence (all-ones = moment of a single mass) is PSD.

import {
  suite,
  check,
  equal,
  close,
  closeArray,
} from '@/test/code/harness'
import {
  hankelMatrix,
  symmetricEigenvalues,
  symmetricMinEigenvalue,
  hankelMinEigenvalue,
} from '@/code/measure/hankel'

const TOL = 1e-9

const ascending = (xs: number[]): number[] =>
  [...xs].sort((a, b) => a - b)

suite('measure/hankel: hankelMatrix', [
  check('H[i][j] = sequence[i+j]', () => {
    // sequence 1..5, size 2 -> 3x3 with anti-diagonal-constant structure.
    const h = hankelMatrix({ sequence: [1, 2, 3, 4, 5], size: 2 })
    equal(h.length, 3)
    closeArray(h[0]!, [1, 2, 3], 0)
    closeArray(h[1]!, [2, 3, 4], 0)
    closeArray(h[2]!, [3, 4, 5], 0)
  }),
])

suite('measure/hankel: eigenvalues', [
  check('eigenvalues of a diagonal matrix are its diagonal', () => {
    closeArray(
      ascending(
        symmetricEigenvalues([
          [2, 0],
          [0, 3],
        ]),
      ),
      [2, 3],
      TOL,
    )
  }),
  check('[[1,2],[2,1]] has eigenvalues 1 +/- 2 = {-1, 3}', () => {
    closeArray(
      ascending(
        symmetricEigenvalues([
          [1, 2],
          [2, 1],
        ]),
      ),
      [-1, 3],
      TOL,
    )
    close(
      symmetricMinEigenvalue([
        [1, 2],
        [2, 1],
      ]),
      -1,
      TOL,
    )
  }),
])

suite('measure/hankel: hankelMinEigenvalue', [
  check(
    'a positive moment sequence (all ones) is PSD: min eig ~ 0',
    () => {
      // C(r)=1 for all r is the moment of a single mass at m=0, so H is rank-1 PSD (min eig 0).
      const v = hankelMinEigenvalue({
        sequence: [1, 1, 1, 1, 1],
        size: 2,
      })

      close(v, 0, TOL)
    },
  ),
  check('a non-PSD sequence reads a negative min eigenvalue', () => {
    // sequence [1,2,1], size 1 -> H=[[1,2],[2,1]], min eig -1, normalized by C(0)=1.
    close(
      hankelMinEigenvalue({ sequence: [1, 2, 1], size: 1 }),
      -1,
      TOL,
    )
  }),
])
