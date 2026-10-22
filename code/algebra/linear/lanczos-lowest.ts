// THE LOWEST EIGENVALUE OF A LARGE COMPLEX HERMITIAN OPERATOR BY PLAIN LANCZOS, MATRIX FREE (E-QTM-0181).
//
// The three-term recurrence keeps three vectors whatever the dimension (eig-lanczos-restart keeps `steps` vectors and
// is real; eig-lanczos-complex folds the spectrum for the values nearest zero). Every `check` steps the tridiagonal T
// is diagonalized (tridiagonalEigenvalues), its lowest eigenvector y found by inverse iteration, and the run stops
// when the Ritz residual estimate beta_m |y_m| falls under the tolerance. Without reorthogonalization a converged
// Ritz value can repeat (a ghost), which leaves the lowest VALUE correct; the vector option (for small operators)
// stores the basis, reorthogonalizes fully and returns the Ritz vector.
//
// DETERMINISM: the start vector is the caller's; no random numbers.

import { tridiagonalEigenvalues } from '@/code/algebra/linear/eig-hermitian-tridiagonal'
import { newCx, type Cx } from '@/code/algebra/linear/complex-vector'

export type LanczosLowest = {
  value: number
  residual: number
  steps: number
  vector?: Cx
}

// the lowest eigenvector of the tridiagonal (d, e) at its eigenvalue lambda, by three inverse iterations (Thomas)
function tridiagonalVector(
  d: Float64Array,
  e: Float64Array,
  lambda: number,
): Float64Array {
  const n = d.length
  const scale = Math.max(1, Math.abs(lambda))
  const shift = lambda - 1e-11 * scale
  let y = new Float64Array(n).fill(1)
  const c = new Float64Array(n)
  const z = new Float64Array(n)

  for (let pass = 0; pass < 3; pass++) {
    // solve (T - shift) x = y
    let b0 = d[0]! - shift

    c[0] = n > 1 ? e[0]! / b0 : 0
    z[0] = y[0]! / b0

    for (let i = 1; i < n; i++) {
      const b = d[i]! - shift - e[i - 1]! * c[i - 1]!

      c[i] = i < n - 1 ? e[i]! / b : 0
      z[i] = (y[i]! - e[i - 1]! * z[i - 1]!) / b
      b0 = b
    }

    void b0

    const x = new Float64Array(n)

    x[n - 1] = z[n - 1]!

    for (let i = n - 2; i >= 0; i--) {
      x[i] = z[i]! - c[i]! * x[i + 1]!
    }

    let norm = 0

    for (let i = 0; i < n; i++) {
      norm += x[i]! * x[i]!
    }

    norm = Math.sqrt(norm)

    for (let i = 0; i < n; i++) {
      x[i] = x[i]! / norm
    }

    y = x
  }

  return y
}

export function lanczosLowest(input: {
  dimension: number
  apply: (x: Cx, out: Cx) => void
  start: Cx
  tolerance: number
  maxSteps: number
  check?: number
  vector?: boolean
  log?: (line: string) => void
}): LanczosLowest {
  const { dimension: n, apply, tolerance, maxSteps } = input
  const check = input.check ?? 10
  const keep = input.vector === true
  const basis: Cx[] = []
  let prev = newCx(n)
  let q = newCx(n)
  let w = newCx(n)

  let norm = 0

  for (let i = 0; i < n; i++) {
    norm += input.start.re[i]! ** 2 + input.start.im[i]! ** 2
  }

  norm = Math.sqrt(norm)

  for (let i = 0; i < n; i++) {
    q.re[i] = input.start.re[i]! / norm
    q.im[i] = input.start.im[i]! / norm
  }

  const alpha: number[] = []
  const beta: number[] = []
  let value = NaN
  let residual = Infinity
  let y = new Float64Array(0)

  for (let step = 0; step < maxSteps; step++) {
    if (keep) {
      basis.push({ re: Float64Array.from(q.re), im: Float64Array.from(q.im) })
    }

    apply(q, w)

    let a = 0

    for (let i = 0; i < n; i++) {
      a += q.re[i]! * w.re[i]! + q.im[i]! * w.im[i]!
    }

    alpha.push(a)

    const bPrev = step > 0 ? beta[step - 1]! : 0

    for (let i = 0; i < n; i++) {
      w.re[i] = w.re[i]! - a * q.re[i]! - bPrev * prev.re[i]!
      w.im[i] = w.im[i]! - a * q.im[i]! - bPrev * prev.im[i]!
    }

    if (keep) {
      for (let pass = 0; pass < 2; pass++) {
        for (const v of basis) {
          let sr = 0
          let si = 0

          for (let i = 0; i < n; i++) {
            sr += v.re[i]! * w.re[i]! + v.im[i]! * w.im[i]!
            si += v.re[i]! * w.im[i]! - v.im[i]! * w.re[i]!
          }

          for (let i = 0; i < n; i++) {
            w.re[i] = w.re[i]! - (sr * v.re[i]! - si * v.im[i]!)
            w.im[i] = w.im[i]! - (sr * v.im[i]! + si * v.re[i]!)
          }
        }
      }
    }

    let b = 0

    for (let i = 0; i < n; i++) {
      b += w.re[i]! ** 2 + w.im[i]! ** 2
    }

    b = Math.sqrt(b)
    beta.push(b)

    const m = alpha.length
    const last = step === maxSteps - 1 || b === 0

    if ((m % check === 0 && m >= 2) || last) {
      const d = Float64Array.from(alpha)
      const e = Float64Array.from(beta.slice(0, m - 1))

      value = Math.min(...tridiagonalEigenvalues(d, e))
      y = tridiagonalVector(d, e, value)
      residual = b * Math.abs(y[m - 1]!)
      input.log?.(`lanczos step ${m}: value ${value} residual ${residual.toExponential(2)}`)

      if (residual <= tolerance || b === 0) {
        break
      }
    }

    const swap = prev

    prev = q
    q = w
    w = swap

    for (let i = 0; i < n; i++) {
      q.re[i] = q.re[i]! / b
      q.im[i] = q.im[i]! / b
    }
  }

  const out: LanczosLowest = { value, residual, steps: alpha.length }

  if (keep) {
    const v = newCx(n)

    for (let j = 0; j < y.length; j++) {
      const s = y[j]!
      const bj = basis[j]!

      for (let i = 0; i < n; i++) {
        v.re[i] = v.re[i]! + s * bj.re[i]!
        v.im[i] = v.im[i]! + s * bj.im[i]!
      }
    }

    out.vector = v
  }

  return out
}
