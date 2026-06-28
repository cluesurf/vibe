// Conformance for code/substrate/margenstern/numeration: a positional code in a grid's own growth basis.
// encode/decode must be exact inverses, the greedy digits must reconstruct the value, the Fibonacci basis
// is rebuilt independently from a recurrence, and a degenerate basis must be rejected. Integer, so EXACT.

import { suite, check, equal, ok, throws, exactArray } from '@/test/code/harness'
import {
  makeNumeration,
  recurrenceBasis,
  growthBasis,
} from '@/code/substrate/margenstern/numeration'

suite('substrate/margenstern/numeration: encode/decode round trip', [
  check('the Fibonacci numeration inverts on 0..300', () => {
    const num = makeNumeration({ basis: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233] })
    for (let n = 0; n <= 300; n++) {
      equal(num.decode(num.encode(n)), n, `round trip ${n}`)
    }
  }),
  check('greedy digits times basis sum to the value', () => {
    const basis = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    const num = makeNumeration({ basis })
    for (let n = 1; n <= 100; n++) {
      const digits = num.encode(n)
      let sum = 0
      const len = digits.length
      for (let i = 0; i < len; i++) {
        sum += digits[i]! * basis[len - 1 - i]!
      }
      equal(sum, n, `digits reconstruct ${n}`)
    }
  }),
  check('Fibonacci greedy digits never exceed 1', () => {
    // Greedy on the Fibonacci basis is the Zeckendorf code, whose alphabet is {0,1}.
    const num = makeNumeration({ basis: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89] })
    equal(num.maxDigit(89), 1, 'max Fibonacci digit')
  }),
  check('a mixed-radix-like basis still inverts', () => {
    // Powers of two: a standard place-value system, digits {0,1}.
    const num = makeNumeration({ basis: [1, 2, 4, 8, 16, 32] })
    equal(num.encode(11).join(''), '1011', 'binary of 11')
    equal(num.decode([1, 0, 1, 1]), 11, 'decode binary 11')
    equal(num.maxDigit(63), 1, 'binary max digit')
  }),
  check('encode(0) is [0] and a basis must start at 1', () => {
    const num = makeNumeration({ basis: [1, 2, 4] })
    exactArray(num.encode(0), [0], 'zero')
    equal(num.decode([0]), 0, 'decode zero')
    throws(() => makeNumeration({ basis: [2, 3, 5] }), 'basis must start at 1')
  }),
])

suite('substrate/margenstern/numeration: building the basis', [
  check('recurrenceBasis with Fibonacci coefficients rebuilds Fibonacci', () => {
    const got = recurrenceBasis({ coefficients: [1, 1], seeds: [1, 2], terms: 10 })
    exactArray(got, [1, 2, 3, 5, 8, 13, 21, 34, 55, 89], 'Fibonacci basis')
  }),
  check('recurrenceBasis for a {p,4} grid matches the splitting recurrence', () => {
    // {5,4}: coefficients [p-2,-1] = [3,-1], seeds [1, p-2] = [1, 3].
    const expected: number[] = [1, 3]
    for (let n = 2; n < 8; n++) {
      expected.push(3 * expected[n - 1]! - expected[n - 2]!)
    }
    const got = recurrenceBasis({ coefficients: [3, -1], seeds: [1, 3], terms: 8 })
    exactArray(got, expected, '{5,4} basis')
  }),
  check('growthBasis keeps the strictly increasing prefix', () => {
    exactArray(growthBasis([1, 5, 15, 40, 105]), [1, 5, 15, 40, 105], 'growth')
    // a non-increasing tail is dropped (basis must strictly increase).
    const b = growthBasis([3, 3, 5, 4, 9])
    for (let i = 1; i < b.length; i++) {
      ok(b[i]! > b[i - 1]!, 'strictly increasing')
    }
  }),
])
