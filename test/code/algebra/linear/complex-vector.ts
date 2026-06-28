// Conformance for code/algebra/linear/complex-vector: the split re/im dense complex
// vector and the real part of the Hermitian inner product. Re<a|b> = sum
// (a.re*b.re + a.im*b.im), which is the real part of conj(a) . b. Self-dot is the
// squared 2-norm.

import { suite, check, equal } from '@/test/code/harness'
import { newCx, dotR } from '@/code/algebra/linear/complex-vector'

function cx(re: number[], im: number[]) {
  return { re: Float64Array.from(re), im: Float64Array.from(im) }
}

suite('algebra/linear/complex-vector: real Hermitian inner product', [
  check('newCx is zero-filled', () => {
    const v = newCx(3)
    equal(v.re.length, 3, 're length')
    equal(v.im.length, 3, 'im length')
    equal(dotR(v, v, 3), 0, 'zero vector self-dot = 0')
  }),
  check('dotR sums a.re*b.re + a.im*b.im', () => {
    // a = (1, 2+i), b = (3+5i, 4+6i) over dim 2
    // re parts: 1*3 + 2*4 = 11 ; im parts: 0*5 + 1*6 = 6 ; total 17
    const a = cx([1, 2], [0, 1])
    const b = cx([3, 4], [5, 6])
    equal(dotR(a, b, 2), 17, 'Re<a|b> = 17')
  }),
  check('self-dot is the squared norm (|3+4i|^2 = 25)', () => {
    const a = cx([3], [4])
    equal(dotR(a, a, 1), 25, '|a|^2 = 25')
  }),
  check('dotR is symmetric in the real-part sense', () => {
    const a = cx([1, -2], [3, 4])
    const b = cx([5, 6], [-7, 8])
    equal(dotR(a, b, 2), dotR(b, a, 2), 'Re<a|b> = Re<b|a>')
  }),
])
