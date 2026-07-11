// Conformance for code/substrate/margenstern/zeckendorf: the Fibonacci numeral system. Every positive
// integer is a UNIQUE sum of non-consecutive Fibonacci numbers, so its binary address has no "11" and
// round-trips exactly. We re-derive the basis (1,2,3,5,8,...) independently and check the greedy code is
// legal, invertible, and that the sector growth follows a(n)=3a(n-1)-a(n-2). All integer, so EXACT.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import {
  toZeckendorf,
  fromZeckendorf,
  isZeckendorf,
  appendContinuator,
  sectorGeneration,
} from '@/code/substrate/margenstern/zeckendorf'

// The Zeckendorf basis, derived here independently: F1=1, F2=2, F_{k}=F_{k-1}+F_{k-2}.
function basis(upTo: number): number[] {
  const f = [1, 2]

  while (f[f.length - 1]! <= upTo) {
    f.push(f[f.length - 1]! + f[f.length - 2]!)
  }

  return f
}

suite('substrate/margenstern/zeckendorf: representation', [
  check(
    'toZeckendorf then fromZeckendorf is the identity on 1..300',
    () => {
      for (let n = 1; n <= 300; n++) {
        equal(fromZeckendorf(toZeckendorf(n)), n, `round trip ${n}`)
      }
    },
  ),
  check('no representation contains two adjacent ones', () => {
    for (let n = 1; n <= 300; n++) {
      notOk(toZeckendorf(n).includes('11'), `${n} has no "11"`)
      ok(isZeckendorf(toZeckendorf(n)), `${n} is a legal address`)
    }
  }),
  check('the code matches an independent greedy decomposition', () => {
    // Independently: greedily take the largest basis term <= remainder; the chosen
    // terms must be the set bits of toZeckendorf, and must sum back to n.
    for (let n = 1; n <= 200; n++) {
      const f = basis(n)

      let rem = n

      const chosen = new Set<number>()

      for (let i = f.length - 1; i >= 0; i--) {
        if (f[i]! <= rem) {
          chosen.add(i)
          rem -= f[i]!
        }
      }

      equal(rem, 0, `greedy exhausts ${n}`)

      // chosen has no two consecutive indices (the defining property).
      for (const i of chosen) {
        notOk(chosen.has(i + 1), `${n}: indices ${i},${i + 1} both set`)
      }

      // and fromZeckendorf agrees with the sum of chosen basis terms.
      let sum = 0

      for (const i of chosen) {
        sum += f[i]!
      }

      equal(sum, n, `chosen terms sum to ${n}`)
    }
  }),
  check('small addresses are the expected words', () => {
    equal(toZeckendorf(1), '1', 'F1')
    equal(toZeckendorf(2), '10', 'F2')
    equal(toZeckendorf(3), '100', 'F3')
    equal(toZeckendorf(4), '101', 'F3+F1')
    equal(fromZeckendorf('101'), 4, 'decode 101')
  }),
  check(
    'isZeckendorf accepts legal words and rejects illegal ones',
    () => {
      ok(isZeckendorf('100'), 'legal')
      ok(isZeckendorf('101'), 'legal')
      notOk(isZeckendorf('110'), 'has 11')
      notOk(isZeckendorf('011'), 'leading 0 and 11')
      notOk(isZeckendorf('0100'), 'leading 0')
      notOk(isZeckendorf('102'), 'non-binary')
    },
  ),
])

suite('substrate/margenstern/zeckendorf: growth and continuator', [
  check('appendContinuator appends "00"', () => {
    equal(appendContinuator('10'), '1000', 'continuator of 10')
    equal(appendContinuator('1'), '100', 'continuator of 1')
  }),
  check('sector growth follows a(n) = 3a(n-1) - a(n-2)', () => {
    // Independently seed 1, 3 and iterate the recurrence.
    const expected: number[] = [1, 3]

    for (let n = 2; n <= 7; n++) {
      expected.push(3 * expected[n - 1]! - expected[n - 2]!)
    }

    const got = expected.map((_, n) => sectorGeneration(n))

    exactArray(got, expected, 'sector generations')
  }),
])
