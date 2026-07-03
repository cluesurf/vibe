// Conformance for code/algebra/group/special-linear: SL(2,p), its centre, and the
// projective quotient PSL(2,p). Every expected number is re-derived from finite-group
// theory: |SL(2,p)| = p(p^2 - 1), |Z(SL(2,p))| = gcd(2, p-1), and
// |PSL(2,p)| = |SL|/|Z|, giving the famous orders PSL(2,7) = 168 and PSL(2,5) = 60.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  specialLinear,
  identityModP,
  minusIdentityModP,
  multiplyModP,
  equalsModP,
  centre,
  type MatrixModP,
} from '@/code/algebra/group/special-linear'

const reduce = (v: number, p: number): number => ((v % p) + p) % p

const detModP = (m: MatrixModP, p: number): number =>
  reduce(m[0] * m[3] - m[1] * m[2], p)

const key = (m: MatrixModP): string => m.join(',')

// |SL(2,p)| = p(p^2 - 1), independently.
const orderSL = (p: number): number => p * (p * p - 1)

suite('algebra/group/special-linear: SL(2,p) order and determinants', [
  check('|SL(2,p)| = p(p^2 - 1) for p = 2,3,5,7', () => {
    for (const p of [2, 3, 5, 7]) {
      equal(specialLinear(p).length, orderSL(p), `|SL(2,${p})|`)
    }

    // the named orders
    equal(orderSL(2), 6, '|SL(2,2)| = 6')
    equal(orderSL(3), 24, '|SL(2,3)| = 24')
    equal(orderSL(5), 120, '|SL(2,5)| = 120')
    equal(orderSL(7), 336, '|SL(2,7)| = 336')
  }),
  check('every listed matrix has determinant 1 mod p', () => {
    for (const p of [2, 3, 5, 7]) {
      for (const m of specialLinear(p)) {
        equal(detModP(m, p), 1, `det = 1 mod ${p}`)
      }
    }
  }),
  check('all listed matrices are distinct', () => {
    for (const p of [2, 3, 5, 7]) {
      const group = specialLinear(p)
      equal(
        new Set(group.map(key)).size,
        group.length,
        `distinct mod ${p}`,
      )
    }
  }),
])

suite('algebra/group/special-linear: group axioms', [
  check(
    'identity acts as the identity; the group is closed (p = 3)',
    () => {
      const p = 3
      const group = specialLinear(p)
      const present = new Set(group.map(key))
      const id = identityModP()
      equal(detModP(id, p), 1, 'identity has det 1')

      for (const m of group) {
        ok(equalsModP(multiplyModP(id, m, p), m), 'I m = m')
        ok(equalsModP(multiplyModP(m, id, p), m), 'm I = m')

        for (const n of group) {
          ok(
            present.has(key(multiplyModP(m, n, p))),
            'closed under product',
          )
        }
      }
    },
  ),
  check('multiplication is associative (sample, p = 5)', () => {
    const p = 5
    const g = specialLinear(p)

    for (let i = 0; i < g.length; i += 7) {
      const a = g[i]!
      const b = g[(i * 3 + 1) % g.length]!
      const c = g[(i * 5 + 2) % g.length]!
      ok(
        equalsModP(
          multiplyModP(multiplyModP(a, b, p), c, p),
          multiplyModP(a, multiplyModP(b, c, p), p),
        ),
        '(ab)c = a(bc)',
      )
    }
  }),
])

suite('algebra/group/special-linear: centre and PSL(2,p)', [
  check('centre is {I, -I} for odd p, {I} for p = 2', () => {
    // |Z(SL(2,p))| = gcd(2, p-1): 1 for p=2, else 2.
    equal(centre(2).length, 1, '|Z(SL(2,2))| = 1')

    for (const p of [3, 5, 7]) {
      equal(centre(p).length, 2, `|Z(SL(2,${p}))| = 2`)
    }
  }),
  check(
    '-I has det 1, lies in the centre, and differs from I for odd p',
    () => {
      for (const p of [3, 5, 7]) {
        const minus = minusIdentityModP(p)
        equal(
          detModP(minus, p),
          1,
          '-I has det 1 (= (p-1)^2 = 1 mod p)',
        )

        const centreKeys = new Set(centre(p).map(key))
        ok(centreKeys.has(key(minus)), '-I is central')
        ok(!equalsModP(minus, identityModP()), '-I != I for odd p')
      }
    },
  ),
  check('|PSL(2,p)| = |SL|/|Z|: 168, 60, 12 for p = 7, 5, 3', () => {
    const psl = (p: number): number =>
      specialLinear(p).length / centre(p).length

    equal(psl(7), 168, '|PSL(2,7)| = 168 (Klein quartic / (2,3,7))')
    equal(psl(5), 60, '|PSL(2,5)| = 60 = A5')
    equal(psl(3), 12, '|PSL(2,3)| = 12 = A4')
    equal(psl(2), 6, '|PSL(2,2)| = 6 = S3 (centre is trivial)')
  }),
])
