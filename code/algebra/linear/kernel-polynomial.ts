// The kernel polynomial method: approximate a spectral function of a large
// Hermitian operator by its Chebyshev moments, using only matrix-vector products
// (never the dense matrix). The operator must be scaled so its spectrum lies in
// [-1, 1]; spectralBound gives the scale. Combined with a stochastic trace this
// estimates traces of spectral functions, like Tr|H| for a Dirac-sea energy.

import { Cx, newCx, dotR } from '@/code/algebra/linear/complex-vector'
import { makeRng } from '@/code/tool/rng'

// A Hermitian operator as a matrix-vector product: writes H applied to `input`
// into `output`.
export type HermitianOperator = (input: Cx, output: Cx) => void

// The Chebyshev coefficients of |x| on [-1, 1]: c0 = 2/pi, c_{2k} =
// -(4/pi)(-1)^k/(4k^2 - 1), odd coefficients zero. The series that turns moments
// into an estimate of Tr|H|.
export function absoluteValueCoefficients(count: number): number[] {
  const coefficients = new Array<number>(count).fill(0)
  coefficients[0] = 2 / Math.PI

  for (let k = 1; 2 * k < count; k++) {
    coefficients[2 * k] = ((-4 / Math.PI) * (-1) ** k) / (4 * k * k - 1)
  }

  return coefficients
}

// The Jackson kernel, which damps the Gibbs oscillation a non-smooth target (like
// |x| at zero) would otherwise produce in a finite Chebyshev expansion.
export function jacksonKernel(count: number): number[] {
  const kernel = new Array<number>(count).fill(0)
  const np = count + 1

  for (let n = 0; n < count; n++) {
    kernel[n] =
      ((np - n) * Math.cos((Math.PI * n) / np) +
        Math.sin((Math.PI * n) / np) / Math.tan(Math.PI / np)) /
      np
  }

  return kernel
}

// The Chebyshev moments mu_n = <probe| T_n(H/scale) |probe> for n = 0..count-1,
// by the Chebyshev three-term recurrence, matrix-vector products only.
export function chebyshevMoments(input: {
  operator: HermitianOperator
  scale: number
  probe: Cx
  count: number
  dim: number
}): Float64Array {
  const { operator, scale, probe, count, dim } = input
  const mu = new Float64Array(count)

  let t0: Cx = { re: probe.re.slice(), im: probe.im.slice() }
  let t1 = newCx(dim)
  operator(t0, t1)

  for (let i = 0; i < dim; i++) {
    t1.re[i]! /= scale
    t1.im[i]! /= scale
  }

  mu[0] = dotR(probe, t0, dim)
  mu[1] = dotR(probe, t1, dim)

  let tn = newCx(dim)

  const product = newCx(dim)

  for (let n = 2; n < count; n++) {
    operator(t1, product)

    for (let i = 0; i < dim; i++) {
      tn.re[i] = (2 * product.re[i]!) / scale - t0.re[i]!
      tn.im[i] = (2 * product.im[i]!) / scale - t0.im[i]!
    }

    mu[n] = dotR(probe, tn, dim)

    const swap = t0
    t0 = t1
    t1 = tn
    tn = swap
  }

  return mu
}

// The largest eigenvalue of H^2 by power iteration, the spectral bound used to
// scale H into [-1, 1] before the Chebyshev expansion.
export function spectralBound(input: {
  operator: HermitianOperator
  dim: number
}): number {
  const { operator, dim } = input
  const v = newCx(dim)
  const rng = makeRng({ seed: 1 })

  for (let i = 0; i < dim; i++) {
    v.re[i] = rng.next() - 0.5
  }

  let norm = Math.sqrt(dotR(v, v, dim))

  for (let i = 0; i < dim; i++) {
    v.re[i]! /= norm
  }

  const applied = newCx(dim)
  const twice = newCx(dim)

  let lambda = 0

  for (let iteration = 0; iteration < 50; iteration++) {
    operator(v, applied)
    operator(applied, twice)
    lambda = dotR(v, twice, dim)
    norm = Math.sqrt(dotR(twice, twice, dim))

    for (let i = 0; i < dim; i++) {
      v.re[i] = twice.re[i]! / norm
      v.im[i] = twice.im[i]! / norm
    }
  }

  return lambda
}
