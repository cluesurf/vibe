// A dense complex vector stored as split real and imaginary Float64Arrays, the
// layout the iterative spectral methods want (Lanczos, the kernel polynomial): a
// matrix-vector product writes straight into typed arrays with no per-element
// object churn. The scalar Complex in complex.ts is for interchange; this is for
// the hot loop.

export interface Cx {
  re: Float64Array
  im: Float64Array
}

export function newCx(dim: number): Cx {
  return { re: new Float64Array(dim), im: new Float64Array(dim) }
}

// The real part of the Hermitian inner product <a|b>, the sum of a* . b. Real
// because the spectral methods only need real moments of a Hermitian operator.
export function dotR(a: Cx, b: Cx, dim: number): number {
  let sum = 0
  for (let i = 0; i < dim; i++) {
    sum += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!
  }

  return sum
}
