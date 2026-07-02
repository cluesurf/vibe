// Conformance for code/algebra/group/so8-triality: the three 8-dimensional reps of
// SO(8) on the D4 coordinates and the Hadamard/2 triality step. Re-derived facts:
// 8v is the 8 signed axes, 8s/8c are the 16 half-integer vectors split by parity
// (8 each), and the Hadamard/2 map sends 8v -> 8s. Because H^2 = 4 I, the map
// H/2 is an involution, so it is the single step 8v <-> 8s, not the full 3-cycle.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  vectorRep8,
  spinorRepEven8,
  spinorRepOdd8,
  applyTriality,
  vectorSetKey,
  vectorSetsEqual,
} from '@/code/algebra/group/so8-triality'

const normSquared = (v: number[]): number =>
  v.reduce((s, x) => s + x * x, 0)

suite('algebra/group/so8-triality: the three 8-dim reps', [
  check('8v: 8 distinct signed unit axes', () => {
    const v = vectorRep8()
    equal(v.length, 8, '8 vectors')
    equal(vectorSetKey(v).size, 8, 'distinct')

    for (const x of v) {
      equal(normSquared(x), 1, '8v vector is a signed unit axis')
    }
  }),
  check('8s: 8 even-parity half-integer vectors of norm^2 = 1', () => {
    const s = spinorRepEven8()
    equal(s.length, 8, '8 even-parity weights')

    for (const x of s) {
      ok(Math.abs(normSquared(x) - 1) < 1e-12, '8s vector norm^2 = 1')
      equal(
        x.filter(c => c < 0).length % 2,
        0,
        'even number of minus signs',
      )
    }
  }),
  check('8c: 8 odd-parity half-integer vectors of norm^2 = 1', () => {
    const c = spinorRepOdd8()
    equal(c.length, 8, '8 odd-parity weights')

    for (const x of c) {
      ok(Math.abs(normSquared(x) - 1) < 1e-12, '8c vector norm^2 = 1')
      equal(
        x.filter(coord => coord < 0).length % 2,
        1,
        'odd number of minus signs',
      )
    }
  }),
  check(
    '8s and 8c are disjoint and together are the 16 half-integer vectors',
    () => {
      const sKeys = vectorSetKey(spinorRepEven8())
      const cKeys = vectorSetKey(spinorRepOdd8())
      ok(
        [...sKeys].every(k => !cKeys.has(k)),
        '8s and 8c disjoint',
      )
      equal(
        new Set([...sKeys, ...cKeys]).size,
        16,
        '8s + 8c = 16 (+-1/2)^4 vectors',
      )
    },
  ),
])

suite('algebra/group/so8-triality: the Hadamard/2 triality step', [
  check('triality maps 8v onto 8s', () => {
    ok(
      vectorSetsEqual(applyTriality(vectorRep8()), spinorRepEven8()),
      'H/2 . 8v = 8s',
    )
  }),
  check(
    'triality is an involution here (H^2 = 4I), so 8s maps back to 8v',
    () => {
      ok(
        vectorSetsEqual(applyTriality(spinorRepEven8()), vectorRep8()),
        'H/2 . 8s = 8v',
      )
    },
  ),
  check('applying the step twice is the identity on 8v', () => {
    ok(
      vectorSetsEqual(
        applyTriality(applyTriality(vectorRep8())),
        vectorRep8(),
      ),
      '(H/2)^2 = identity on the set',
    )
  }),
])
