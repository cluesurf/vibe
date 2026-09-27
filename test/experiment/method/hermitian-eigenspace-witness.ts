// A witness for code/algebra/linear/eig-hermitian that cannot miss a degenerate eigenspace again.
//
// E-FRC-0178 found that eigHermitian returned eigenvectors that failed to span a degenerate eigenspace (it
// kept every second column of its real 2n embedding, and inside a degenerate eigenspace a kept pair could be
// v and i v), and that its conformance test had used no degenerate matrix. The solver now completes every
// cluster of equal eigenvalues by pivoted complex Gram-Schmidt, and the matrix sign is computed by scaled
// Newton iteration, which uses no eigenvectors at all.
//
// This experiment builds Hermitian matrices whose eigenstructure is KNOWN before the solver sees it:
// H = U diag(d) U^dagger with U a unitary (complex) or orthogonal (real) built with no random seed, as three
// sweeps of Givens rotations over every pair at Weyl-sequence angles (frac(k golden) for the angle, frac(k
// sqrt 2) for the phase; the shared code/tool/weyl.ts did not exist yet, so the generator is local), and d a
// spectrum with stated multiplicities, twofold through sixfold, both signs. The truth is
// then U itself: the projector onto each eigenvalue's eigenspace is U_c U_c^dagger over that eigenvalue's
// columns, and sign(H) = U sign(d) U^dagger. Nothing is compared with the solver's own output. Checked on
// every matrix:
//   1. eigenvalues equal d to 1e-10
//   2. the eigenvectors are orthonormal, max |V^dagger V - I| below 1e-12
//   3. span: per eigenvalue, the computed vectors assigned to it have numerical rank equal to its
//      multiplicity (pivoted elimination on their Gram matrix, pivot floor 1e-8), and their projector
//      sum |v><v| equals the true U_c U_c^dagger to 1e-10
//   4. V diag(values) V^dagger reconstructs H to 1e-12 times its scale
//   5. the Newton sign S satisfies |S^2 - I| below 1e-12 and equals U sign(d) U^dagger to 1e-12
//   6. the eigenvector sign (hermitianMatrixSignEigen) equals the Newton sign to 1e-12
// plus the E-FRC-0178 4 x 4 matrix (I + |u><u|, eigenvalues 1, 1, 1, 2) with its projectors built from u.
//
// Controls. Negative: the pre-fix algorithm, reimplemented here in ten lines (keep real column 2i), is run on
// the same matrices, and must be caught (rank deficit, or orthonormality off by more than 0.1) on the
// E-FRC-0178 matrix and on at least one conjugated degenerate matrix while passing every simple-spectrum matrix,
// so the witness is shown to see the defect and to see only it. The defect has two faces: the kept real
// columns are real-orthogonal but need not be complex-orthogonal (the E-FRC-0178 matrix, overlap 0.76, full
// rank), and in the extreme a kept pair is v and i v and a direction is missing. Refusal: an exactly singular matrix (diag(1, 0)) has no sign, and the Newton sign must
// throw rather than return one.
//
// Depth L1: numerical linear algebra, with the truth fixed before the solver runs.

import { makeComplexMatrix, makeDense, type ComplexMatrix } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import {
  eigHermitian,
  hermitianMatrixSignEigen,
  hermitianMatrixSignNewton,
  type HermitianEigen,
} from '@/code/algebra/linear/eig-hermitian'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SPECTRA: readonly (readonly number[])[] = [
  [-2, -2, -2, 1, 1, 1, 1, 3],
  [-1, -1, -1, -1, 2, 2, 2, 2],
  [-3, -3, -3, -1, -1, -1, -1, 0.5, 2, 2, 2, 2],
  [-1, -1, -1, 1, 1, 1],
  [-1.5, -1.5, 0.5, 0.5, 0.5, 0.5, 2, 2.5],
  [1, 1, 1, 1, 1, 1],
]
const SIMPLE_SPECTRA: readonly (readonly number[])[] = [
  [-2, -1, 0.5, 1, 3, 4],
  [-3.5, -2, -0.25, 0.75, 1.5, 2.5, 3, 5],
]
const STREAMS = [1, 2, 3]
const STREAM_STRIDE = 10000
const GIVENS_SWEEPS = 3
const GOLDEN = (Math.sqrt(5) - 1) / 2
const SQRT2 = Math.SQRT2 - 1
const VALUE_TOLERANCE = 1e-10
const ORTHONORMAL_TOLERANCE = 1e-12
const PROJECTOR_TOLERANCE = 1e-10
const RECONSTRUCTION_TOLERANCE = 1e-12
const SIGN_TOLERANCE = 1e-12
const DEFECT_THRESHOLD = 0.1
const RANK_FLOOR = 1e-8

type Truth = {
  readonly matrix: ComplexMatrix
  readonly values: readonly number[] // ascending
  readonly clusters: readonly { value: number; projector: ComplexMatrix; rank: number }[]
  readonly sign: ComplexMatrix
}

type Grade = {
  readonly valueError: number
  readonly orthonormalError: number
  readonly projectorError: number
  readonly rankError: number
  readonly reconstructionError: number
}

// frac(k alpha): the Weyl sequence of an irrational alpha, deterministic and equidistributed
function weyl(k: number, alpha: number): number {
  const x = k * alpha

  return x - Math.floor(x)
}

// A unitary (orthogonal when real) with no random seed: GIVENS_SWEEPS sweeps of complex Givens rotations
// over every pair (p, q), the k-th rotation at angle 2 pi frac(k GOLDEN) and, when complex, phase
// 2 pi frac(k SQRT2). A product of exact rotations is unitary to rounding and never ill-conditioned.
// `stream` offsets k so each matrix gets its own stretch of the sequence.
function weylUnitary(n: number, complex: boolean, stream: number): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    re[i * n + i] = 1
  }

  let k = stream * STREAM_STRIDE

  for (let sweep = 0; sweep < GIVENS_SWEEPS; sweep++) {
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        k++

        const theta = 2 * Math.PI * weyl(k, GOLDEN)
        const psi = complex ? 2 * Math.PI * weyl(k, SQRT2) : 0
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        const er = Math.cos(psi)
        const ei = Math.sin(psi)

        // U <- U G, G on columns p, q: col p' = c col p + s e^{i psi} col q, col q' = -s e^{-i psi} col p + c col q
        for (let a = 0; a < n; a++) {
          const pr = re[a * n + p] ?? 0
          const pi = im[a * n + p] ?? 0
          const qr = re[a * n + q] ?? 0
          const qi = im[a * n + q] ?? 0

          re[a * n + p] = c * pr + s * (er * qr - ei * qi)
          im[a * n + p] = c * pi + s * (er * qi + ei * qr)
          re[a * n + q] = c * qr - s * (er * pr + ei * pi)
          im[a * n + q] = c * qi - s * (er * pi - ei * pr)
        }
      }
    }
  }

  return { re, im }
}

// sum over the given columns of w_c |u_c><u_c|
function outer(u: { re: Float64Array; im: Float64Array }, n: number, columns: readonly number[], weights: readonly number[]): ComplexMatrix {
  const out = makeComplexMatrix({ rows: n, cols: n })

  columns.forEach((c, index) => {
    const w = weights[index] ?? 0

    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        const ar = u.re[a * n + c] ?? 0
        const ai = u.im[a * n + c] ?? 0
        const br = u.re[b * n + c] ?? 0
        const bi = u.im[b * n + c] ?? 0

        out.re[a * n + b] = (out.re[a * n + b] ?? 0) + w * (ar * br + ai * bi)
        out.im[a * n + b] = (out.im[a * n + b] ?? 0) + w * (ai * br - ar * bi)
      }
    }
  })

  return out
}

function truthFrom(u: { re: Float64Array; im: Float64Array }, spectrum: readonly number[]): Truth {
  const n = spectrum.length
  const all = spectrum.map((_, i) => i)
  const distinct = [...new Set(spectrum)].sort((a, b) => a - b)

  return {
    matrix: outer(u, n, all, spectrum),
    values: [...spectrum].sort((a, b) => a - b),
    clusters: distinct.map(value => {
      const columns = all.filter(i => spectrum[i] === value)

      return { value, rank: columns.length, projector: outer(u, n, columns, columns.map(() => 1)) }
    }),
    sign: outer(u, n, all, spectrum.map(v => Math.sign(v))),
  }
}

// the E-FRC-0178 matrix I + |u><u|: u normalized, completed to a unitary so the truth has the same form
function auditCase(): Truth {
  const raw = [
    [0.5, 0.1],
    [0.3, -0.4],
    [-0.2, 0.5],
    [0.1, 0.45],
  ]
  const n = raw.length
  const norm = Math.sqrt(raw.reduce((s, [a = 0, b = 0]) => s + a * a + b * b, 0))
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  raw.forEach(([a = 0, b = 0], i) => {
    re[i * n] = a / norm
    im[i * n] = b / norm
  })

  // complete column 0 to a unitary: three Weyl-unitary columns, orthonormalized against it below
  const rest = weylUnitary(n, true, 0)

  for (let c = 1; c < n; c++) {
    for (let a = 0; a < n; a++) {
      re[a * n + c] = rest.re[a * n + c] ?? 0
      im[a * n + c] = rest.im[a * n + c] ?? 0
    }
  }

  const u = { re, im }

  // re-orthonormalize columns 1..3 against column 0 and each other
  for (let c = 1; c < n; c++) {
    for (let pass = 0; pass < 2; pass++) {
      for (let p = 0; p < c; p++) {
        let dr = 0
        let di = 0

        for (let a = 0; a < n; a++) {
          dr += (re[a * n + p] ?? 0) * (re[a * n + c] ?? 0) + (im[a * n + p] ?? 0) * (im[a * n + c] ?? 0)
          di += (re[a * n + p] ?? 0) * (im[a * n + c] ?? 0) - (im[a * n + p] ?? 0) * (re[a * n + c] ?? 0)
        }

        for (let a = 0; a < n; a++) {
          const pr = re[a * n + p] ?? 0
          const pi = im[a * n + p] ?? 0

          re[a * n + c] = (re[a * n + c] ?? 0) - (dr * pr - di * pi)
          im[a * n + c] = (im[a * n + c] ?? 0) - (dr * pi + di * pr)
        }
      }
    }

    let length = 0

    for (let a = 0; a < n; a++) {
      length += (re[a * n + c] ?? 0) ** 2 + (im[a * n + c] ?? 0) ** 2
    }

    length = Math.sqrt(length)

    for (let a = 0; a < n; a++) {
      re[a * n + c] = (re[a * n + c] ?? 0) / length
      im[a * n + c] = (im[a * n + c] ?? 0) / length
    }
  }

  const truth = truthFrom(u, [2, 1, 1, 1])
  // the matrix itself exactly as E-FRC-0178 builds it
  const matrix = makeComplexMatrix({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const [ar = 0, ai = 0] = raw[i] ?? []
      const [br = 0, bi = 0] = raw[j] ?? []

      matrix.re[i * n + j] = (i === j ? 1 : 0) + (ar * br + ai * bi) / (norm * norm)
      matrix.im[i * n + j] = (ai * br - ar * bi) / (norm * norm)
    }
  }

  return { ...truth, matrix }
}

// the pre-fix eigHermitian: keep real column 2i of the embedding
function everySecondColumn(matrix: ComplexMatrix): HermitianEigen {
  const n = matrix.rows
  const m = makeDense({ rows: 2 * n, cols: 2 * n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      m.data[i * 2 * n + j] = matrix.re[i * n + j] ?? 0
      m.data[(n + i) * 2 * n + n + j] = matrix.re[i * n + j] ?? 0
      m.data[i * 2 * n + n + j] = -(matrix.im[i * n + j] ?? 0)
      m.data[(n + i) * 2 * n + j] = matrix.im[i * n + j] ?? 0
    }
  }

  const eig = eigSymmetric({ matrix: m })
  const values = Float64Array.from({ length: n }, (_, i) => eig.values[2 * i] ?? 0)
  const vectorsRe = new Float64Array(n * n)
  const vectorsIm = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let a = 0; a < n; a++) {
      vectorsRe[a * n + i] = eig.vectors[a * 2 * n + 2 * i] ?? 0
      vectorsIm[a * n + i] = eig.vectors[(n + a) * 2 * n + 2 * i] ?? 0
    }
  }

  return { values, vectorsRe, vectorsIm }
}

function maxDifference(a: ComplexMatrix, b: ComplexMatrix): number {
  let worst = 0

  for (let i = 0; i < a.re.length; i++) {
    worst = Math.max(worst, Math.hypot((a.re[i] ?? 0) - (b.re[i] ?? 0), (a.im[i] ?? 0) - (b.im[i] ?? 0)))
  }

  return worst
}

// the numerical rank of the given columns: pivoted elimination on their Gram matrix, pivots above RANK_FLOOR
function numericalRank(u: { re: Float64Array; im: Float64Array }, n: number, columns: readonly number[]): number {
  const k = columns.length
  const gr = new Float64Array(k * k)
  const gi = new Float64Array(k * k)

  columns.forEach((p, i) => {
    columns.forEach((q, j) => {
      for (let a = 0; a < n; a++) {
        const xr = u.re[a * n + p] ?? 0
        const xi = u.im[a * n + p] ?? 0
        const yr = u.re[a * n + q] ?? 0
        const yi = u.im[a * n + q] ?? 0

        gr[i * k + j] = (gr[i * k + j] ?? 0) + xr * yr + xi * yi
        gi[i * k + j] = (gi[i * k + j] ?? 0) + xr * yi - xi * yr
      }
    })
  })

  const done = new Array<boolean>(k).fill(false)

  let rank = 0

  for (let step = 0; step < k; step++) {
    let p = -1

    for (let i = 0; i < k; i++) {
      if (!done[i] && (p < 0 || (gr[i * k + i] ?? 0) > (gr[p * k + p] ?? 0))) {
        p = i
      }
    }

    const d = gr[p * k + p] ?? 0

    if (d <= RANK_FLOOR) {
      break
    }

    done[p] = true
    rank++

    // Schur complement: G_ij -= G_ip G_pj / G_pp
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        if (done[i] || done[j]) {
          continue
        }

        const ar = gr[i * k + p] ?? 0
        const ai = gi[i * k + p] ?? 0
        const br = gr[p * k + j] ?? 0
        const bi = gi[p * k + j] ?? 0

        gr[i * k + j] = (gr[i * k + j] ?? 0) - (ar * br - ai * bi) / d
        gi[i * k + j] = (gi[i * k + j] ?? 0) - (ar * bi + ai * br) / d
      }
    }
  }

  return rank
}

function grade(eig: HermitianEigen, truth: Truth): Grade {
  const n = truth.values.length
  const valueError = Math.max(...truth.values.map((v, i) => Math.abs((eig.values[i] ?? 0) - v)))

  let orthonormalError = 0

  for (let p = 0; p < n; p++) {
    for (let q = 0; q < n; q++) {
      let re = 0
      let im = 0

      for (let a = 0; a < n; a++) {
        const xr = eig.vectorsRe[a * n + p] ?? 0
        const xi = eig.vectorsIm[a * n + p] ?? 0
        const yr = eig.vectorsRe[a * n + q] ?? 0
        const yi = eig.vectorsIm[a * n + q] ?? 0

        re += xr * yr + xi * yi
        im += xr * yi - xi * yr
      }

      orthonormalError = Math.max(orthonormalError, Math.hypot(re - (p === q ? 1 : 0), im))
    }
  }

  const vectors = { re: eig.vectorsRe, im: eig.vectorsIm }

  let projectorError = 0
  let rankError = 0

  // assign each computed vector to the true eigenvalue nearest its computed value
  for (const cluster of truth.clusters) {
    const columns = Array.from({ length: n }, (_, i) => i).filter(i => {
      const nearest = truth.clusters.reduce((best, c) => (Math.abs(c.value - (eig.values[i] ?? 0)) < Math.abs(best.value - (eig.values[i] ?? 0)) ? c : best))

      return nearest === cluster
    })
    const p = outer(vectors, n, columns, columns.map(() => 1))

    projectorError = Math.max(projectorError, maxDifference(p, cluster.projector))
    rankError = Math.max(rankError, Math.abs(cluster.rank - numericalRank(vectors, n, columns)))
  }

  const rebuilt = outer(vectors, n, Array.from({ length: n }, (_, i) => i), Array.from(eig.values))
  const scale = Math.max(1, ...truth.values.map(Math.abs))
  const reconstructionError = maxDifference(rebuilt, truth.matrix) / scale

  return { valueError, orthonormalError, projectorError, rankError, reconstructionError }
}

function spans(g: Grade): boolean {
  return g.projectorError < PROJECTOR_TOLERANCE && g.rankError === 0
}

function sound(g: Grade): boolean {
  return (
    g.valueError < VALUE_TOLERANCE &&
    g.orthonormalError < ORTHONORMAL_TOLERANCE &&
    spans(g) &&
    g.reconstructionError < RECONSTRUCTION_TOLERANCE
  )
}

function defective(g: Grade): boolean {
  return g.rankError > 0 || g.orthonormalError > DEFECT_THRESHOLD
}

export default experiment({
  id: 'method/hermitian-eigenspace-witness',
  code: 'E-MTH-0011',
  title:
    'a witness for the Hermitian eigensolver built on matrices whose eigenspaces are known in advance: every degenerate eigenspace, threefold and fourfold, complex and real, is spanned by orthonormal eigenvectors, and the Newton matrix sign squares to the identity and agrees with the eigenvector sign, where the pre-fix solver fails the same checks on most degenerate matrices',
  category: 'method',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const degenerate: { name: string; truth: Truth }[] = [{ name: 'audit-4x4', truth: auditCase() }]
    const simple: { name: string; truth: Truth }[] = []

    let stream = 0

    for (const pass of STREAMS) {
      for (const complex of [true, false]) {
        SPECTRA.forEach((spectrum, index) => {
          stream++
          degenerate.push({ name: `${complex ? 'complex' : 'real'}-${index}-${pass}`, truth: truthFrom(weylUnitary(spectrum.length, complex, stream), spectrum) })
        })
        SIMPLE_SPECTRA.forEach((spectrum, index) => {
          stream++
          simple.push({ name: `${complex ? 'complex' : 'real'}-simple-${index}-${pass}`, truth: truthFrom(weylUnitary(spectrum.length, complex, stream), spectrum) })
        })
      }
    }

    const all = [...degenerate, ...simple]
    const failures: string[] = []
    const worst = { value: 0, orthonormal: 0, projector: 0, rank: 0, reconstruction: 0, signSquare: 0, signTruth: 0, signCross: 0 }

    let iterations = 0

    for (const { name, truth } of all) {
      const g = grade(eigHermitian({ matrix: truth.matrix }), truth)
      const newton = hermitianMatrixSignNewton({ matrix: truth.matrix })
      const signTruth = maxDifference(newton.sign, truth.sign)
      const signCross = maxDifference(newton.sign, hermitianMatrixSignEigen({ matrix: truth.matrix }))

      worst.value = Math.max(worst.value, g.valueError)
      worst.orthonormal = Math.max(worst.orthonormal, g.orthonormalError)
      worst.projector = Math.max(worst.projector, g.projectorError)
      worst.rank = Math.max(worst.rank, g.rankError)
      worst.reconstruction = Math.max(worst.reconstruction, g.reconstructionError)
      worst.signSquare = Math.max(worst.signSquare, newton.residual)
      worst.signTruth = Math.max(worst.signTruth, signTruth)
      worst.signCross = Math.max(worst.signCross, signCross)
      iterations = Math.max(iterations, newton.iterations)

      if (!sound(g) || newton.residual > SIGN_TOLERANCE || signTruth > SIGN_TOLERANCE || signCross > SIGN_TOLERANCE) {
        failures.push(name)
      }
    }

    // negative control: the pre-fix algorithm on the same matrices
    const oldAudit = grade(everySecondColumn(degenerate[0]!.truth.matrix), degenerate[0]!.truth)
    const oldGrades = degenerate.map(({ truth }) => grade(everySecondColumn(truth.matrix), truth))
    const oldDegenerateCaught = oldGrades.filter(defective).length
    const oldRankDeficient = oldGrades.filter(g => g.rankError > 0).length
    const oldSimpleSound = simple.filter(({ truth }) => sound(grade(everySecondColumn(truth.matrix), truth))).length

    // refusal: an exactly singular matrix has no sign
    const singular = makeComplexMatrix({ rows: 2, cols: 2 })

    singular.re[0] = 1

    let refused = false

    try {
      hermitianMatrixSignNewton({ matrix: singular })
    } catch {
      refused = true
    }

    const ok =
      failures.length === 0 &&
      defective(oldAudit) &&
      oldDegenerateCaught >= 2 &&
      oldSimpleSound === simple.length &&
      refused

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `on ${all.length} Hermitian matrices of known eigenstructure (${degenerate.length} with eigenvalues of multiplicity 2 to 6, complex and real, including the E-FRC-0178 4 x 4, and ${simple.length} with simple spectra) every eigenspace is spanned by orthonormal eigenvectors and the Newton sign is exact, while the pre-fix solver returns non-orthonormal or rank-deficient eigenvectors on ${oldDegenerateCaught} of the ${degenerate.length} degenerate matrices (${oldRankDeficient} of them rank-deficient, a missing direction) and on none of the simple ones`,
      metrics: {
        matrices: all.length,
        degenerateMatrices: degenerate.length,
        failures: failures.length,
        worstValueError: worst.value,
        worstOrthonormalError: worst.orthonormal,
        worstProjectorError: worst.projector,
        worstRankDeficit: worst.rank,
        worstReconstructionError: worst.reconstruction,
        worstSignSquaredError: worst.signSquare,
        worstSignVersusTruth: worst.signTruth,
        worstEigenVersusNewtonSign: worst.signCross,
        maxNewtonIterations: iterations,
      },
      control: {
        preFixAuditRankDeficit: oldAudit.rankError,
        preFixAuditProjectorError: oldAudit.projectorError,
        preFixAuditOrthonormalError: oldAudit.orthonormalError,
        preFixDegenerateCaught: oldDegenerateCaught,
        preFixRankDeficient: oldRankDeficient,
        preFixSimpleSound: oldSimpleSound,
        simpleMatrices: simple.length,
        singularRefused: refused ? 1 : 0,
      },
      notes: `L1. Truth is U, fixed before the solver runs, so no check reads the solver's own output back. Failing matrices: ${failures.length === 0 ? 'none' : failures.join(', ')}.`,
    })
  },
})
