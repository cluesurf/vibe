// Conformance for code/algebra/linear/complex: the scalar complex arithmetic used
// at the API boundary. Hand-checked against the field axioms: (a+bi)(c+di) expanded,
// i*i = -1, conjugation flips the imaginary part, and |z|^2 = z * conj(z) is real.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  complex,
  cAdd,
  cMul,
  cConj,
  cAbs,
  cArg,
  cFromPhase,
  cScale,
  cAbs2,
} from '@/code/algebra/linear/complex'

const i = complex({ re: 0, im: 1 })

suite('algebra/linear/complex: field arithmetic', [
  check('addition is componentwise', () => {
    const z = cAdd(complex({ re: 1, im: 2 }), complex({ re: 3, im: 4 }))
    equal(z.re, 4, 're')
    equal(z.im, 6, 'im')
  }),
  check('multiplication matches the hand expansion (1+2i)(3+4i) = -5+10i', () => {
    // 3 + 4i + 6i + 8i^2 = 3 + 10i - 8 = -5 + 10i
    const z = cMul(complex({ re: 1, im: 2 }), complex({ re: 3, im: 4 }))
    equal(z.re, -5, 're')
    equal(z.im, 10, 'im')
  }),
  check('i * i = -1', () => {
    const z = cMul(i, i)
    equal(z.re, -1, 're = -1')
    equal(z.im, 0, 'im = 0')
  }),
  check('conjugation negates only the imaginary part', () => {
    const z = cConj(complex({ re: 3, im: 4 }))
    equal(z.re, 3, 're unchanged')
    equal(z.im, -4, 'im negated')
  }),
  check('abs is the hypotenuse; abs2 is its square', () => {
    close(cAbs(complex({ re: 3, im: 4 })), 5, 1e-12, '|3+4i| = 5')
    equal(cAbs2(complex({ re: 3, im: 4 })), 25, '|3+4i|^2 = 25')
  }),
  check('|z|^2 = Re(z * conj(z)) and the product is purely real', () => {
    const z = complex({ re: 3, im: 4 })
    const p = cMul(z, cConj(z))
    equal(p.re, cAbs2(z), 'Re(z conj z) = |z|^2')
    equal(p.im, 0, 'z conj z is real')
  }),
  check('scale multiplies both parts', () => {
    const z = cScale(complex({ re: 1, im: 2 }), 3)
    equal(z.re, 3, 're')
    equal(z.im, 6, 'im')
  }),
])

suite('algebra/linear/complex: phase and argument', [
  check('arg of 1+i is pi/4, of i is pi/2', () => {
    close(cArg(complex({ re: 1, im: 1 })), Math.PI / 4, 1e-12, 'arg(1+i)')
    close(cArg(i), Math.PI / 2, 1e-12, 'arg(i)')
  }),
  check('cFromPhase lands on the unit circle at the right angle', () => {
    const z = cFromPhase({ phase: Math.PI / 3 })
    close(z.re, Math.cos(Math.PI / 3), 1e-12, 're = cos')
    close(z.im, Math.sin(Math.PI / 3), 1e-12, 'im = sin')
    close(cAbs(z), 1, 1e-12, 'on the unit circle')
  }),
])
