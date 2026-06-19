// Complex Hermitian eigendecomposition, built by embedding the n-by-n Hermitian
// matrix H = A + iB (A real symmetric, B real antisymmetric) as the 2n-by-2n real
// symmetric matrix [[A, -B], [B, A]] and reusing the real Jacobi solver. Each
// complex eigenvalue appears twice in the embedding; for an embedded eigenvector
// (u; w), the complex eigenvector is u + i w. Used to build the matrix sign for
// the overlap operator and to count its zero modes (the lattice index theorem).

import {
  ComplexMatrix,
  makeComplexMatrix,
  makeDense,
} from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

export interface HermitianEigen {
  readonly values: Float64Array // n, ascending
  readonly vectorsRe: Float64Array // n*n, [a*n + i] = Re component a of eigvec i
  readonly vectorsIm: Float64Array
}

export function eigHermitian(input: {
  matrix: ComplexMatrix
}): HermitianEigen {
  const n = input.matrix.rows
  const m = makeDense({ rows: 2 * n, cols: 2 * n })
  const set = (r: number, c: number, x: number): void => {
    m.data[r * 2 * n + c] = x
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = input.matrix.re[i * n + j] ?? 0
      const b = input.matrix.im[i * n + j] ?? 0
      set(i, j, a) // top-left A
      set(n + i, n + j, a) // bottom-right A
      set(i, n + j, -b) // top-right -B
      set(n + i, j, b) // bottom-left B
    }
  }

  const eig = eigSymmetric({ matrix: m })
  const values = new Float64Array(n)
  const vectorsRe = new Float64Array(n * n)
  const vectorsIm = new Float64Array(n * n)
  const twoN = 2 * n
  for (let i = 0; i < n; i++) {
    // Take one column of each degenerate pair (columns 2i, 2i+1 share eigenvalue).
    const col = 2 * i
    values[i] = eig.values[col] ?? 0
    for (let a = 0; a < n; a++) {
      // component a of complex eigenvector = top half + i * bottom half.
      vectorsRe[a * n + i] = eig.vectors[a * twoN + col] ?? 0
      vectorsIm[a * n + i] = eig.vectors[(n + a) * twoN + col] ?? 0
    }
  }

  return { values, vectorsRe, vectorsIm }
}

// The matrix sign of a Hermitian matrix: sum_i sign(lambda_i) |v_i><v_i|.
export function hermitianMatrixSign(input: {
  matrix: ComplexMatrix
}): ComplexMatrix {
  const n = input.matrix.rows
  const eig = eigHermitian({ matrix: input.matrix })
  const out = makeComplexMatrix({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    const lambda = eig.values[i] ?? 0
    const s = lambda > 0 ? 1 : lambda < 0 ? -1 : 0
    if (s === 0) {
      continue
    }

    for (let a = 0; a < n; a++) {
      const va = eig.vectorsRe[a * n + i] ?? 0
      const vaIm = eig.vectorsIm[a * n + i] ?? 0
      for (let b = 0; b < n; b++) {
        const vb = eig.vectorsRe[b * n + i] ?? 0
        const vbIm = eig.vectorsIm[b * n + i] ?? 0
        // |v><v|_{ab} = v_a * conj(v_b)
        const re = va * vb + vaIm * vbIm
        const im = vaIm * vb - va * vbIm
        out.re[a * n + b] = (out.re[a * n + b] ?? 0) + s * re
        out.im[a * n + b] = (out.im[a * n + b] ?? 0) + s * im
      }
    }
  }

  return out
}

// Count eigenvalues of a Hermitian matrix below a tolerance (the near-zero modes).
export function countNearZeroEigenvalues(input: {
  matrix: ComplexMatrix
  tolerance: number
}): number {
  const eig = eigHermitian({ matrix: input.matrix })
  let count = 0
  for (let i = 0; i < eig.values.length; i++) {
    if (Math.abs(eig.values[i] ?? 0) < input.tolerance) {
      count += 1
    }
  }

  return count
}
