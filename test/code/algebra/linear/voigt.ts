// Conformance for code/algebra/linear/voigt: the orthonormal Voigt encoding of a
// symmetric 3x3 tensor as a 6-vector. The defining property is energy preservation:
// the Euclidean inner product of the 6-vectors equals the Frobenius inner product of
// the tensors, which forces the sqrt(2) weighting on the off-diagonal entries. We
// check the explicit encoding, the round-trip, the inner-product identity, and that
// materializing the identity operator yields the 6x6 identity.

import { suite, check, close, closeArray } from '@/test/code/harness'
import {
  symmetricTensorToVoigt,
  voigtToSymmetricTensor,
  operatorToVoigtMatrix,
} from '@/code/algebra/linear/voigt'

const R2 = Math.SQRT2

function frobenius(a: number[][], b: number[][]): number {
  let s = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      s += a[i]![j]! * b[i]![j]!
    }
  }

  return s
}

function euclid(a: number[], b: number[]): number {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += a[i]! * b[i]!
  }

  return s
}

const S = [
  [1, 2, 3],
  [2, 4, 5],
  [3, 5, 6],
]

const T = [
  [7, 1, 0],
  [1, 8, 2],
  [0, 2, 9],
]

suite('algebra/linear/voigt: encoding and round-trip', [
  check(
    'the encoding is (xx, yy, zz, sqrt2*xy, sqrt2*xz, sqrt2*yz)',
    () => {
      closeArray(
        symmetricTensorToVoigt(S),
        [1, 4, 6, R2 * 2, R2 * 3, R2 * 5],
        1e-12,
        'explicit Voigt vector',
      )
    },
  ),
  check('voigtToSymmetricTensor inverts symmetricTensorToVoigt', () => {
    const back = voigtToSymmetricTensor(symmetricTensorToVoigt(S))

    for (let i = 0; i < 3; i++) {
      closeArray(back[i]!, S[i]!, 1e-12, `row ${i}`)
    }
  }),
])

suite('algebra/linear/voigt: energy preservation', [
  check(
    'Euclidean inner product of vectors = Frobenius inner product of tensors',
    () => {
      const lhs = euclid(
        symmetricTensorToVoigt(S),
        symmetricTensorToVoigt(T),
      )

      close(lhs, frobenius(S, T), 1e-9, '<voigt S, voigt T> = <S, T>_F')
    },
  ),
  check('self inner product equals the Frobenius norm squared', () => {
    const v = symmetricTensorToVoigt(S)
    close(euclid(v, v), frobenius(S, S), 1e-9, '|voigt S|^2 = |S|_F^2')
  }),
])

suite('algebra/linear/voigt: operator materialization', [
  check('the identity operator becomes the 6x6 identity', () => {
    const m = operatorToVoigtMatrix(tensor => tensor)

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        close(
          m.data[r * 6 + c]!,
          r === c ? 1 : 0,
          1e-12,
          `M[${r}][${c}]`,
        )
      }
    }
  }),
  check('the scaling operator t -> 2t becomes 2 * identity', () => {
    const m = operatorToVoigtMatrix(tensor =>
      tensor.map(row => row.map(x => 2 * x)),
    )

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        close(
          m.data[r * 6 + c]!,
          r === c ? 2 : 0,
          1e-12,
          `M[${r}][${c}]`,
        )
      }
    }
  }),
])
