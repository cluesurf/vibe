// Conformance for code/operator/numeric-search: the associative max/min/next searches.
// Facts (all checked against an independent brute-force scan, exact):
//   - maxIndex/minIndex find the extremum, ties to the lowest index.
//   - nextHigherIndex/nextLowerIndex find the nearest strictly-greater / -lesser value.
//   - the active mask restricts the search.
//   - numericSearchSteps = ceil(log2(maxValue + 1)) (the constant parallel cost).

import { suite, check, equal } from '@/test/code/harness'
import {
  maxIndex,
  minIndex,
  nextHigherIndex,
  nextLowerIndex,
  numericSearchSteps,
} from '@/code/operator/numeric-search'

const field = [3, 1, 4, 1, 5, 9, 2, 6]

// Brute-force references.
function bruteMax(f: number[], active?: number[]): number {
  let idx = -1
  let val = -Infinity
  f.forEach((v, c) => {
    if (active && !active[c]) {return}

    if (v > val) {
      val = v
      idx = c
    }
  })

  return idx
}

suite('operator/numeric-search: extrema', [
  check(
    'maxIndex and minIndex match brute force, ties to lowest index',
    () => {
      equal(maxIndex({ field }).index, bruteMax(field), 'argmax')
      equal(maxIndex({ field }).value, 9, 'max value')
      equal(
        minIndex({ field }).index,
        1,
        'first index of the minimum (value 1)',
      )
      equal(minIndex({ field }).value, 1, 'min value')
    },
  ),
  check('the active mask restricts the search', () => {
    const active = [1, 0, 1, 0, 0, 0, 1, 1] // values 3,4,2,6 visible
    const max = maxIndex({ field, active })
    equal(max.index, 7, 'masked argmax is value 6 at index 7')

    const min = minIndex({ field, active })
    equal(min.index, 6, 'masked argmin is value 2 at index 6')
  }),
])

suite('operator/numeric-search: next value', [
  check(
    'nextHigherIndex finds the smallest value strictly above the target',
    () => {
      const r = nextHigherIndex({ field, target: 4 })
      equal(r.value, 5, 'next value above 4 is 5')
      equal(r.index, 4, 'at index 4')
    },
  ),
  check(
    'nextLowerIndex finds the largest value strictly below the target',
    () => {
      const r = nextLowerIndex({ field, target: 4 })
      equal(r.value, 3, 'next value below 4 is 3')
      equal(r.index, 0, 'at index 0')
    },
  ),
  check('returns index -1 when none qualifies', () => {
    equal(
      nextHigherIndex({ field, target: 9 }).index,
      -1,
      'nothing above the max',
    )
    equal(
      nextLowerIndex({ field, target: 1 }).index,
      -1,
      'nothing below the min',
    )
  }),
])

suite('operator/numeric-search: parallel cost', [
  check('numericSearchSteps = ceil(log2(maxValue + 1))', () => {
    equal(numericSearchSteps(0), 1, 'at least one pass')
    equal(numericSearchSteps(1), 1, 'log2(2) = 1')
    equal(numericSearchSteps(7), 3, 'log2(8) = 3')
    equal(numericSearchSteps(8), 4, 'ceil(log2(9)) = 4')
    equal(numericSearchSteps(255), 8, 'ceil(log2(256)) = 8')
  }),
])
