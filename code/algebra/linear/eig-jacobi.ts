// Symmetric real eigensolver by the cyclic Jacobi method. Robust, dependency
// free, for small dense matrices (state-space Hamiltonians, Lanczos tridiagonals).

import { DenseMatrix } from '@/code/algebra/linear/dense'

export interface EigenResult {
  readonly values: Float64Array // ascending
  // eigenvectors as columns: vectors[i * n + j] is component i of eigenvector j
  readonly vectors: Float64Array
}

export function eigSymmetric(input: { matrix: DenseMatrix }): EigenResult {
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
