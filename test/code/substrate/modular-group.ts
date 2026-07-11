// Conformance for code/substrate/modular-group: PSL(2,Z) as integer 2x2 matrices mod sign. Matrix multiply
// has the identity as a unit and is associative; the sign-normalization collapses M and -M; the relations
// S^2 = 1 and (ST)^3 = 1 hold in PSL; the embedded Cayley graph is symmetric and lands inside the disc; and
// continued fractions reach the expected rationals. Integer arithmetic is EXACT; coordinates to tolerance.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  IntegerMatrix,
  normalizeModularMatrix,
  multiplyIntegerMatrix,
  modularGraph,
  rationalFromContinuedFraction,
} from '@/code/substrate/modular-group'

const I: IntegerMatrix = [1, 0, 0, 1]
const S: IntegerMatrix = [0, -1, 1, 0]
const T: IntegerMatrix = [1, 1, 0, 1]

suite('substrate/modular-group: matrix arithmetic', [
  check(
    'the identity is a unit and multiplication is associative',
    () => {
      equal(
        multiplyIntegerMatrix(I, T).join(','),
        T.join(','),
        'I*T = T',
      )

      equal(
        multiplyIntegerMatrix(T, I).join(','),
        T.join(','),
        'T*I = T',
      )

      const a = multiplyIntegerMatrix(multiplyIntegerMatrix(S, T), S)
      const b = multiplyIntegerMatrix(S, multiplyIntegerMatrix(T, S))

      equal(a.join(','), b.join(','), '(ST)S = S(TS)')
    },
  ),
  check('sign-normalization collapses M and -M', () => {
    const negT: IntegerMatrix = [-1, -1, 0, -1]

    equal(
      normalizeModularMatrix(T),
      normalizeModularMatrix(negT),
      'T ~ -T',
    )
  }),
  check('S has order 2 and ST has order 3 in PSL(2,Z)', () => {
    const s2 = multiplyIntegerMatrix(S, S)

    equal(
      normalizeModularMatrix(s2),
      normalizeModularMatrix(I),
      'S^2 = 1',
    )

    const st = multiplyIntegerMatrix(S, T)
    const st3 = multiplyIntegerMatrix(multiplyIntegerMatrix(st, st), st)

    equal(
      normalizeModularMatrix(st3),
      normalizeModularMatrix(I),
      '(ST)^3 = 1',
    )

    // ST is not itself the identity (order is exactly 3, not 1).
    notOk(
      normalizeModularMatrix(st) === normalizeModularMatrix(I),
      'ST != 1',
    )
  }),
])

suite('substrate/modular-group: graph and continued fractions', [
  check(
    'the Cayley graph is symmetric and embedded inside the disc',
    () => {
      const g = modularGraph(60)

      ok(g.size > 1 && g.size <= 60, 'bounded size')

      const sets = g.neighbors.map(row => new Set(row))

      for (let i = 0; i < g.size; i++) {
        notOk(sets[i]!.has(i), `node ${i} has no self-loop`)

        for (const j of g.neighbors[i]!) {
          ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
        }
      }

      const coords = g.embedding!.coords

      for (let i = 0; i < g.size; i++) {
        const r = Math.hypot(coords[i * 2] ?? 0, coords[i * 2 + 1] ?? 0)

        ok(r < 1 + 1e-9, `node ${i} inside the unit disc`)
      }
    },
  ),
  check('continued fractions reach the right rationals', () => {
    equal(
      rationalFromContinuedFraction([2]).num,
      2,
      '[2] = 2/1 numerator',
    )

    equal(
      rationalFromContinuedFraction([2]).den,
      1,
      '[2] = 2/1 denominator',
    )

    const r = rationalFromContinuedFraction([1, 2])

    equal(r.num, 3, '[1;2] = 3/2 numerator')
    equal(r.den, 2, '[1;2] = 3/2 denominator')

    // all-ones continued fractions give consecutive Fibonacci ratios.
    const golden = rationalFromContinuedFraction([1, 1, 1, 1, 1])

    equal(golden.num, 8, '[1;1,1,1,1] = 8/5 numerator')
    equal(golden.den, 5, '[1;1,1,1,1] = 8/5 denominator')
  }),
])
