// Symmetric real eigensolver by the cyclic Jacobi method. Robust, dependency
// free, for small dense matrices (state-space Hamiltonians, Lanczos tridiagonals).

import { DenseMatrix } from '@/code/algebra/linear/dense'

// Eigenvalues only of a 3x3 symmetric matrix, cyclic Jacobi on the single
// largest off-diagonal per sweep. The lightweight covariance/diffusion-tensor
// shape the geometry experiments use (max-abs convergence, 60 sweeps, no
// eigenvectors). Returns the three diagonal values after rotation, unsorted.
export function jacobiEigenvalues3(matrix: number[][]): number[] {
  const a = matrix.map(r => r.slice())

  for (let sweep = 0; sweep < 60; sweep++) {
    let p = 0
    let q = 1
    let max = 0

    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if (Math.abs(a[i]![j]!) > max) {
          max = Math.abs(a[i]![j]!)
          p = i
          q = j
        }
      }
    }

    if (max < 1e-14) {
      break
    }

    const app = a[p]![p]!
    const aqq = a[q]![q]!
    const apq = a[p]![q]!
    const phi = 0.5 * Math.atan2(2 * apq, aqq - app)
    const c = Math.cos(phi)
    const s = Math.sin(phi)

    for (let k = 0; k < 3; k++) {
      const akp = a[k]![p]!
      const akq = a[k]![q]!
      a[k]![p] = c * akp - s * akq
      a[k]![q] = s * akp + c * akq
    }

    for (let k = 0; k < 3; k++) {
      const apk = a[p]![k]!
      const aqk = a[q]![k]!
      a[p]![k] = c * apk - s * aqk
      a[q]![k] = s * apk + c * aqk
    }
  }

  return [a[0]![0]!, a[1]![1]!, a[2]![2]!]
}

// Eigenvalues only of an n x n symmetric matrix, cyclic Jacobi over all off-diagonal
// pairs per sweep, returned ascending. The eigenvalues-only sibling of eigSymmetric
// (no eigenvectors), for spectra where only the levels and their degeneracies matter
// (e.g. a Cayley-graph adjacency spectrum decomposing into irrep bands).
export function jacobiEigenvalues(
  matrix: number[][],
  sweeps = 60,
  tolerance = 1e-9,
): number[] {
  const n = matrix.length
  const a = matrix.map(r => r.slice())

  for (let sweep = 0; sweep < sweeps; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += a[p]![q]! * a[p]![q]!
      }
    }

    if (off < tolerance) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p]![q]!

        if (Math.abs(apq) < 1e-12) {
          continue
        }

        const phi = 0.5 * Math.atan2(2 * apq, a[q]![q]! - a[p]![p]!)
        const c = Math.cos(phi)
        const s = Math.sin(phi)

        for (let k = 0; k < n; k++) {
          const kp = a[k]![p]!
          const kq = a[k]![q]!
          a[k]![p] = c * kp - s * kq
          a[k]![q] = s * kp + c * kq
        }

        for (let k = 0; k < n; k++) {
          const pk = a[p]![k]!
          const qk = a[q]![k]!
          a[p]![k] = c * pk - s * qk
          a[q]![k] = s * pk + c * qk
        }
      }
    }
  }

  return Array.from({ length: n }, (_, i) => a[i]![i]!).sort(
    (x, y) => x - y,
  )
}

export interface EigenResult {
  readonly values: Float64Array // ascending
  // eigenvectors as columns: vectors[i * n + j] is component i of eigenvector j
  readonly vectors: Float64Array
}

export function eigSymmetric(input: {
  matrix: DenseMatrix
}): EigenResult {
  const n = input.matrix.rows
  const a = Float64Array.from(input.matrix.data)
  const v = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    v[i * n + i] = 1
  }

  const at = (r: number, c: number): number => a[r * n + c] ?? 0

  const setA = (r: number, c: number, x: number): void => {
    a[r * n + c] = x
  }

  const maxSweeps = 100

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += at(p, q) * at(p, q)
      }
    }

    if (off < 1e-24) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = at(p, q)

        if (Math.abs(apq) < 1e-300) {
          continue
        }

        const app = at(p, p)
        const aqq = at(q, q)
        const phi = 0.5 * Math.atan2(2 * apq, aqq - app)
        const c = Math.cos(phi)
        const s = Math.sin(phi)

        for (let k = 0; k < n; k++) {
          const akp = at(k, p)
          const akq = at(k, q)
          setA(k, p, c * akp - s * akq)
          setA(k, q, s * akp + c * akq)
        }

        for (let k = 0; k < n; k++) {
          const apk = at(p, k)
          const aqk = at(q, k)
          setA(p, k, c * apk - s * aqk)
          setA(q, k, s * apk + c * aqk)
        }

        for (let k = 0; k < n; k++) {
          const vkp = v[k * n + p] ?? 0
          const vkq = v[k * n + q] ?? 0
          v[k * n + p] = c * vkp - s * vkq
          v[k * n + q] = s * vkp + c * vkq
        }
      }
    }
  }

  const pairs: Array<{ value: number; col: number }> = []

  for (let i = 0; i < n; i++) {
    pairs.push({ value: at(i, i), col: i })
  }

  pairs.sort((x, y) => x.value - y.value)

  const values = new Float64Array(n)
  const vectors = new Float64Array(n * n)

  for (let j = 0; j < n; j++) {
    const pair = pairs[j]

    if (!pair) {
      continue
    }

    values[j] = pair.value

    for (let i = 0; i < n; i++) {
      vectors[i * n + j] = v[i * n + pair.col] ?? 0
    }
  }

  return { values, vectors }
}
