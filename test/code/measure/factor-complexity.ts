// Conformance for code/measure/factor-complexity. Every expected value is re-derived from the
// definition of factor (subword) complexity, p(n) = the number of distinct length-n factors, and
// from textbook facts: a periodic word has bounded complexity, a Sturmian (Fibonacci) word has the
// exact complexity p(n) = n + 1.

import {
  suite,
  check,
  equal,
  exactArray,
  ok,
  notOk,
} from '@/test/code/harness'
import {
  factorComplexity,
  factorComplexityProfile,
  aboveComplexityLine,
  differenceSignSequence,
} from '@/code/measure/factor-complexity'

// The infinite Fibonacci word, built independently here by the standard morphism 0 -> 01, 1 -> 0.
// It is Sturmian, so by the Morse-Hedlund / Sturmian theorem its factor complexity is exactly
// p(n) = n + 1.
function fibonacciWord(iterations: number): number[] {
  let word: number[] = [0]

  for (let i = 0; i < iterations; i++) {
    const next: number[] = []

    for (const c of word) {
      if (c === 0) {
        next.push(0, 1)
      } else {
        next.push(0)
      }
    }

    word = next
  }

  return word
}

suite('measure/factor-complexity: factorComplexity', [
  check(
    'a period-2 word [0,1,0,1,0,1] has p(n)=2 for n>=1 (bounded)',
    () => {
      const w = [0, 1, 0, 1, 0, 1]
      equal(factorComplexity(w, 1), 2)
      equal(factorComplexity(w, 2), 2)
      equal(factorComplexity(w, 3), 2)
    },
  ),
  check('a constant word has exactly one factor of each length', () => {
    equal(factorComplexity([5, 5, 5, 5], 1), 1)
    equal(factorComplexity([5, 5, 5, 5], 2), 1)
  }),
  check('the Fibonacci (Sturmian) word has p(n) = n + 1', () => {
    const w = fibonacciWord(12) // length F_14 = 377, ample for n up to ~8

    for (let n = 1; n <= 8; n++) {
      equal(factorComplexity(w, n), n + 1, `p(${n})`)
    }
  }),
  check('degenerate windows return 0', () => {
    equal(factorComplexity([1, 2, 3], 0), 0)
    equal(factorComplexity([1, 2, 3], 5), 0) // window longer than the word
  }),
])

suite('measure/factor-complexity: profile and complexity line', [
  check('the profile lists p(1..maxN)', () => {
    exactArray(
      factorComplexityProfile(fibonacciWord(12), 5),
      [2, 3, 4, 5, 6],
    )
  }),
  check('aboveComplexityLine is p(n) > n', () => {
    // period-2 word: p(1)=2>1 true, but p(2)=2 not > 2 false.
    ok(aboveComplexityLine([0, 1, 0, 1, 0, 1], 1))
    notOk(aboveComplexityLine([0, 1, 0, 1, 0, 1], 2))
  }),
])

suite('measure/factor-complexity: differenceSignSequence', [
  check('signs of successive differences', () => {
    // diffs of [1,3,2,2,5] are +2,-1,0,+3 -> signs +1,-1,0,+1.
    exactArray(differenceSignSequence([1, 3, 2, 2, 5]), [1, -1, 0, 1])
  }),
])
