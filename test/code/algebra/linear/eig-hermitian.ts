// Conformance for code/algebra/linear/eig-hermitian: the complex Hermitian
// eigendecomposition via the real 2n embedding. Checked on matrices with a known
// spectrum: a real-symmetric matrix embedded as Hermitian keeps its real spectrum
// {1,3}; the Pauli Y matrix [[0,-i],[i,0]] has eigenvalues {-1,+1}. The full
// eigenstructure is verified by reconstruction H = sum_i lambda_i |v_i><v_i| (which
// folds in both eigenvalue and eigenvector correctness), and the matrix sign of a
// matrix whose eigenvalues are already +/-1 must equal the matrix itself.

import {
  suite,
  check,
  equal,
  closeArray,
} from '@/test/code/harness'
import {
  eigHermitian,
  hermitianMatrixSign,
  countNearZeroEigenvalues,
} from '@/code/algebra/linear/eig-hermitian'
import {
  ComplexMatrix,
  makeComplexMatrix,
} from '@/code/algebra/linear/dense'

function hermitianFrom(re: number[][], im: number[][]): ComplexMatrix {
  const n = re.length
  const m = makeComplexMatrix({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      m.re[i * n + j] = re[i]![j]!
      m.im[i * n + j] = im[i]![j]!
    }
  }

  return m
}

// Reconstruct H_{ab} = sum_i lambda_i v_a^(i) conj(v_b^(i)) from an eigendecomposition.
function reconstruct(
  eig: {
    values: Float64Array
    vectorsRe: Float64Array
    vectorsIm: Float64Array
  },
  n: number,
): { re: number[][]; im: number[][] } {
  const re: number[][] = []
  const im: number[][] = []

  for (let a = 0; a < n; a++) {
    re.push(new Array<number>(n).fill(0))
    im.push(new Array<number>(n).fill(0))

    for (let b = 0; b < n; b++) {
      let sr = 0
      let si = 0

      for (let i = 0; i < n; i++) {
        const va = eig.vectorsRe[a * n + i]!
        const vaI = eig.vectorsIm[a * n + i]!
        const vb = eig.vectorsRe[b * n + i]!
        const vbI = eig.vectorsIm[b * n + i]!
        const lam = eig.values[i]!
        // v_a * conj(v_b) = (va + i vaI)(vb - i vbI)
        sr += lam * (va * vb + vaI * vbI)
        si += lam * (vaI * vb - va * vbI)
      }

      re[a]![b] = sr
      im[a]![b] = si
    }
  }

  return { re, im }
}

const ZERO2 = [
  [0, 0],
  [0, 0],
]

suite('algebra/linear/eig-hermitian: known spectra', [
  check(
    'real-symmetric embedded as Hermitian keeps spectrum {1,3}',
    () => {
      const eig = eigHermitian({
        matrix: hermitianFrom(
          [
            [2, 1],
            [1, 2],
          ],
          ZERO2,
        ),
      })

      closeArray(eig.values, [1, 3], 1e-9, 'real Hermitian spectrum')
    },
  ),
  check('Pauli Y [[0,-i],[i,0]] has eigenvalues {-1, +1}', () => {
    const eig = eigHermitian({
      matrix: hermitianFrom(ZERO2, [
        [0, -1],
        [1, 0],
      ]),
    })

    closeArray(eig.values, [-1, 1], 1e-9, 'Pauli-Y spectrum')
  }),
  check('reconstruction sum lambda |v><v| recovers Pauli Y', () => {
    const Yre = ZERO2
    const Yim = [
      [0, -1],
      [1, 0],
    ]

    const eig = eigHermitian({ matrix: hermitianFrom(Yre, Yim) })
    const r = reconstruct(eig, 2)

    for (let a = 0; a < 2; a++) {
      closeArray(r.re[a]!, Yre[a]!, 1e-8, `Re row ${a}`)
      closeArray(r.im[a]!, Yim[a]!, 1e-8, `Im row ${a}`)
    }
  }),
])

suite('algebra/linear/eig-hermitian: matrix sign and zero modes', [
  check('sign(Y) = Y because Y already has eigenvalues +/-1', () => {
    const Yim = [
      [0, -1],
      [1, 0],
    ]

    const sign = hermitianMatrixSign({
      matrix: hermitianFrom(ZERO2, Yim),
    })

    closeArray(Array.from(sign.re), [0, 0, 0, 0], 1e-8, 'Re sign = 0')
    // flat [Y_00, Y_01, Y_10, Y_11].im = [0, -1, 1, 0]
    closeArray(
      Array.from(sign.im),
      [0, -1, 1, 0],
      1e-8,
      'Im sign = Y.im',
    )
  }),
  check(
    'countNearZeroEigenvalues finds the single zero mode of diag(1,0)',
    () => {
      const m = hermitianFrom(
        [
          [1, 0],
          [0, 0],
        ],
        ZERO2,
      )

      equal(
        countNearZeroEigenvalues({ matrix: m, tolerance: 1e-6 }),
        1,
        'one eigenvalue below 1e-6',
      )
    },
  ),
  check('a positive-definite matrix has no near-zero modes', () => {
    const m = hermitianFrom(
      [
        [2, 1],
        [1, 2],
      ],
      ZERO2,
    )

    equal(
      countNearZeroEigenvalues({ matrix: m, tolerance: 1e-6 }),
      0,
      'spectrum {1,3} has none below 1e-6',
    )
  }),
])
