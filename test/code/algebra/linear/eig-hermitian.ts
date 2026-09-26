// Conformance for code/algebra/linear/eig-hermitian: the complex Hermitian
// eigendecomposition via the real 2n embedding. Checked on matrices with a known
// spectrum: a real-symmetric matrix embedded as Hermitian keeps its real spectrum
// {1,3}; the Pauli Y matrix [[0,-i],[i,0]] has eigenvalues {-1,+1}. The full
// eigenstructure is verified by reconstruction H = sum_i lambda_i |v_i><v_i| (which
// folds in both eigenvalue and eigenvector correctness), and the matrix sign of a
// matrix whose eigenvalues are already +/-1 must equal the matrix itself.
//
// Degenerate spectra (added after E-FRC-0178, whose defect this suite missed because it used none): the
// E-FRC-0178 4 x 4 matrix I + |u><u| (eigenvalues 1, 1, 1, 2), and D (2 I - J) D^dagger with J the 4 x 4
// all-ones matrix and D a diagonal of phases (eigenvalues -2, 2, 2, 2, known sign D (I - J / 2) D^dagger).
// On both: eigenvectors orthonormal to 1e-12, reconstruction exact, sign squared the identity, and the
// Newton sign equal to the eigenvector sign and to the closed form. The full witness, with random unitary
// conjugations and multiplicities up to six, is E-MTH-0011 (test/experiment/method/hermitian-eigenspace-witness).

import { suite, check, equal, closeArray, ok, throws } from '@/test/code/harness'
import {
  eigHermitian,
  hermitianMatrixSign,
  hermitianMatrixSignEigen,
  hermitianMatrixSignNewton,
  countNearZeroEigenvalues,
  type HermitianEigen,
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

function maxDifference(a: ComplexMatrix, b: ComplexMatrix): number {
  let worst = 0

  for (let i = 0; i < a.re.length; i++) {
    worst = Math.max(worst, Math.hypot(a.re[i]! - b.re[i]!, a.im[i]! - b.im[i]!))
  }

  return worst
}

function orthonormalError(eig: HermitianEigen, n: number): number {
  let worst = 0

  for (let p = 0; p < n; p++) {
    for (let q = 0; q < n; q++) {
      let re = 0
      let im = 0

      for (let a = 0; a < n; a++) {
        const xr = eig.vectorsRe[a * n + p]!
        const xi = eig.vectorsIm[a * n + p]!
        const yr = eig.vectorsRe[a * n + q]!
        const yi = eig.vectorsIm[a * n + q]!

        re += xr * yr + xi * yi
        im += xr * yi - xi * yr
      }

      worst = Math.max(worst, Math.hypot(re - (p === q ? 1 : 0), im))
    }
  }

  return worst
}

function squareMinusIdentity(s: ComplexMatrix): number {
  const n = s.rows

  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        re += s.re[i * n + k]! * s.re[k * n + j]! - s.im[i * n + k]! * s.im[k * n + j]!
        im += s.re[i * n + k]! * s.im[k * n + j]! + s.im[i * n + k]! * s.re[k * n + j]!
      }

      worst = Math.max(worst, Math.hypot(re - (i === j ? 1 : 0), im))
    }
  }

  return worst
}

// the E-FRC-0178 matrix I + |u><u|, eigenvalues 1, 1, 1, 2
function auditMatrix(): ComplexMatrix {
  const u = [
    [0.5, 0.1],
    [0.3, -0.4],
    [-0.2, 0.5],
    [0.1, 0.45],
  ]
  const norm2 = u.reduce((s, [a = 0, b = 0]) => s + a * a + b * b, 0)
  const m = makeComplexMatrix({ rows: 4, cols: 4 })

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const [ar = 0, ai = 0] = u[i] ?? []
      const [br = 0, bi = 0] = u[j] ?? []

      m.re[i * 4 + j] = (i === j ? 1 : 0) + (ar * br + ai * bi) / norm2
      m.im[i * 4 + j] = (ai * br - ar * bi) / norm2
    }
  }

  return m
}

const PHASES = [0, 0.7, -1.9, 2.6]

// D (c I + d J) D^dagger, D = diag(e^{i phase}): entry (a, b) = (c [a = b] + d) e^{i (phase_a - phase_b)}
function phasedAllOnes(c: number, d: number): ComplexMatrix {
  const m = makeComplexMatrix({ rows: 4, cols: 4 })

  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      const t = PHASES[a]! - PHASES[b]!
      const x = (a === b ? c : 0) + d

      m.re[a * 4 + b] = x * Math.cos(t)
      m.im[a * 4 + b] = x * Math.sin(t)
    }
  }

  return m
}

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
  check('Newton sign(Y) = Y and equals the eigenvector sign', () => {
    const y = hermitianFrom(ZERO2, [
      [0, -1],
      [1, 0],
    ])
    const newton = hermitianMatrixSignNewton({ matrix: y })

    closeArray(Array.from(newton.sign.im), [0, -1, 1, 0], 1e-14, 'Im Newton sign = Y.im')
    ok(maxDifference(newton.sign, hermitianMatrixSignEigen({ matrix: y })) < 1e-14, 'Newton = eigen sign')
  }),
  check('Newton sign refuses an exactly singular matrix', () => {
    throws(() => hermitianMatrixSignNewton({ matrix: hermitianFrom([[1, 0], [0, 0]], ZERO2) }), 'sign(diag(1, 0)) must throw')
  }),
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

suite('algebra/linear/eig-hermitian: degenerate eigenspaces', [
  check('E-FRC-0178 4 x 4 (1, 1, 1, 2): orthonormal eigenvectors that reconstruct H', () => {
    const m = auditMatrix()
    const eig = eigHermitian({ matrix: m })
    const r = reconstruct(eig, 4)

    closeArray(eig.values, [1, 1, 1, 2], 1e-12, 'spectrum')
    ok(orthonormalError(eig, 4) < 1e-12, `orthonormal to 1e-12, got ${orthonormalError(eig, 4)}`)

    for (let a = 0; a < 4; a++) {
      closeArray(r.re[a]!, Array.from(m.re.slice(a * 4, a * 4 + 4)), 1e-12, `Re row ${a}`)
      closeArray(r.im[a]!, Array.from(m.im.slice(a * 4, a * 4 + 4)), 1e-12, `Im row ${a}`)
    }
  }),
  check('E-FRC-0178 4 x 4: sign is the identity, by Newton and by eigenvectors', () => {
    const m = auditMatrix()
    const identity = phasedAllOnes(1, 0)

    ok(maxDifference(hermitianMatrixSign({ matrix: m }), identity) < 1e-12, 'Newton sign = I')
    ok(maxDifference(hermitianMatrixSignEigen({ matrix: m }), identity) < 1e-12, 'eigen sign = I')
  }),
  check('D (2 I - J) D^dagger (-2, 2, 2, 2): threefold complex eigenspace spanned, sign = D (I - J / 2) D^dagger', () => {
    const m = phasedAllOnes(2, -1)
    const eig = eigHermitian({ matrix: m })
    const expected = phasedAllOnes(1, -0.5)
    const newton = hermitianMatrixSign({ matrix: m })

    closeArray(eig.values, [-2, 2, 2, 2], 1e-12, 'spectrum')
    ok(orthonormalError(eig, 4) < 1e-12, `orthonormal to 1e-12, got ${orthonormalError(eig, 4)}`)
    ok(maxDifference(newton, expected) < 1e-12, 'Newton sign = closed form')
    ok(maxDifference(hermitianMatrixSignEigen({ matrix: m }), expected) < 1e-12, 'eigen sign = closed form')
    ok(squareMinusIdentity(newton) < 1e-12, 'sign squared = I')
  }),
])
