// Conformance for code/algebra/octonion: the 8-dimensional normed division algebra.
// Rather than restating the internal Fano table (which would be circular), the
// expected behaviour is checked against the DEFINING properties of the octonions:
// each imaginary unit squares to -1, distinct imaginary units anticommute, the
// algebra is alternative (but NOT associative), and the norm is multiplicative.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import {
  Octonion,
  OCTONION_DIM,
  octonionUnit,
  octonionOne,
  octonionReal,
  octonionAdd,
  octonionMultiply,
  octonionConjugate,
  octonionNormSquared,
  octonionEquals,
  octonionScale,
} from '@/code/algebra/octonion'

const negate = (a: Octonion): Octonion => octonionScale(a, -1)

const unit = octonionUnit

suite('algebra/octonion: imaginary units', [
  check('the algebra is 8-dimensional', () => {
    equal(OCTONION_DIM, 8, 'octonions have 8 real dimensions')
  }),
  check('each imaginary unit squares to -1', () => {
    for (let k = 1; k < 8; k++) {
      exactArray(
        octonionMultiply(unit(k), unit(k)),
        octonionReal(-1),
        `e${k}^2 = -1`,
      )
    }
  }),
  check('e0 is the multiplicative identity', () => {
    const x: Octonion = [1, 2, 3, 4, 5, 6, 7, 8]
    ok(
      octonionEquals(octonionMultiply(octonionOne(), x), x),
      'e0 x = x',
    )
    ok(
      octonionEquals(octonionMultiply(x, octonionOne()), x),
      'x e0 = x',
    )
  }),
  check(
    'distinct imaginary units anticommute: e_i e_j = -(e_j e_i)',
    () => {
      for (let i = 1; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          ok(
            octonionEquals(
              octonionMultiply(unit(i), unit(j)),
              negate(octonionMultiply(unit(j), unit(i))),
            ),
            `e${i} e${j} = -(e${j} e${i})`,
          )
        }
      }
    },
  ),
  check(
    'the product of two distinct imaginary units is a unit imaginary octonion',
    () => {
      for (let i = 1; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          const product = octonionMultiply(unit(i), unit(j))
          ok(
            Math.abs(octonionNormSquared(product) - 1) < 1e-12,
            `|e${i} e${j}| = 1`,
          )
          equal(product[0]!, 0, 'product has no real part')
        }
      }
    },
  ),
])

suite('algebra/octonion: alternative but not associative', [
  check('the octonions are alternative: (xx)y = x(xy)', () => {
    const x: Octonion = [0, 1, 0, 2, 0, 1, 1, 0]
    const y: Octonion = [1, 0, 2, 0, 1, 0, 1, 3]
    const xx = octonionMultiply(x, x)
    ok(
      octonionEquals(
        octonionMultiply(xx, y),
        octonionMultiply(x, octonionMultiply(x, y)),
      ),
      '(xx)y = x(xy)',
    )
  }),
  check('NON-associative: (e1 e2) e4 != e1 (e2 e4)', () => {
    // {1, 2, 4} is not a Fano line, so the associator must be nonzero.
    const left = octonionMultiply(
      octonionMultiply(unit(1), unit(2)),
      unit(4),
    )

    const right = octonionMultiply(
      unit(1),
      octonionMultiply(unit(2), unit(4)),
    )

    notOk(
      octonionEquals(left, right),
      '(e1 e2) e4 differs from e1 (e2 e4)',
    )
    // For three orthogonal imaginary units off a common line the two associations
    // are exact negatives: (xy)z = -x(yz).
    ok(
      octonionEquals(left, negate(right)),
      '(e1 e2) e4 = -(e1 (e2 e4))',
    )
    ok(
      Math.abs(octonionNormSquared(left) - 1) < 1e-12,
      'each side is a unit',
    )
  }),
  check(
    'associativity DOES hold on a common Fano line (e1 e2) e3 = e1 (e2 e3)',
    () => {
      // {1, 2, 3} is a quaternionic Fano line, so this triple associates.
      const left = octonionMultiply(
        octonionMultiply(unit(1), unit(2)),
        unit(3),
      )

      const right = octonionMultiply(
        unit(1),
        octonionMultiply(unit(2), unit(3)),
      )

      ok(
        octonionEquals(left, right),
        'a quaternionic triple associates',
      )
    },
  ),
])

suite('algebra/octonion: norm, conjugate, division algebra', [
  check('x conjugate(x) = |x|^2 (a real octonion)', () => {
    const x: Octonion = [1, 2, 0, 1, 3, 0, 1, 2]
    const product = octonionMultiply(x, octonionConjugate(x))
    const expected = octonionReal(octonionNormSquared(x))
    ok(octonionEquals(product, expected), 'x x* = |x|^2 e0')
    // and the reverse order agrees
    ok(
      octonionEquals(
        octonionMultiply(octonionConjugate(x), x),
        expected,
      ),
      'x* x = |x|^2 e0',
    )
  }),
  check('the norm is multiplicative: |xy|^2 = |x|^2 |y|^2', () => {
    const pairs: [Octonion, Octonion][] = [
      [
        [1, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 2, 0, 1, 1, 1, 0],
      ],
      [
        [2, 0, 1, 3, 0, 1, 2, 0],
        [1, 2, 0, 1, 1, 0, 1, 1],
      ],
    ]

    for (const [x, y] of pairs) {
      equal(
        octonionNormSquared(octonionMultiply(x, y)),
        octonionNormSquared(x) * octonionNormSquared(y),
        'composition algebra: |xy|^2 = |x|^2 |y|^2',
      )
    }
  }),
  check('conjugation is an anti-homomorphism: (xy)* = y* x*', () => {
    const x: Octonion = [1, 2, 0, 1, 0, 1, 1, 0]
    const y: Octonion = [0, 1, 1, 0, 2, 0, 1, 1]
    ok(
      octonionEquals(
        octonionConjugate(octonionMultiply(x, y)),
        octonionMultiply(octonionConjugate(y), octonionConjugate(x)),
      ),
      '(xy)* = y* x*',
    )
  }),
  check('addition is component-wise', () => {
    exactArray(
      octonionAdd(unit(1), octonionScale(unit(2), 3)),
      [0, 1, 3, 0, 0, 0, 0, 0],
      'e1 + 3 e2',
    )
  }),
])
