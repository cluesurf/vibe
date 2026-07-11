// Conformance for code/measure/order-stats: posetHeight, orderStatistics, and
// causalSliceWidths on causal orders whose structure is fully known. A total chain of N
// has height N, ordering fraction 1, and slice widths all 1. A "star" order (0 below
// everything) has height 2 and slices 1,3. An antichain has height 1.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
} from '@/test/code/harness'
import {
  posetHeight,
  orderStatistics,
  causalSliceWidths,
} from '@/code/measure/order-stats'
import { makePosetFromRelation, Poset } from '@/code/tool/poset'

// A poset from an explicit, transitively-closed set of ordered pairs (a < b).
function posetFromPairs(
  size: number,
  pairs: [number, number][],
): Poset {
  const set = new Set(pairs.map(([a, b]) => a * size + b))

  return makePosetFromRelation({
    size,
    precedes: ({ a, b }) => set.has(a * size + b),
  })
}

// A total chain 0 < 1 < ... < n-1 (all pairs related, already closed).
function chain(n: number): Poset {
  const pairs: [number, number][] = []

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) pairs.push([a, b])
  }

  return posetFromPairs(n, pairs)
}

// A star: element 0 below all others, the rest mutually incomparable.
function star(n: number): Poset {
  const pairs: [number, number][] = []

  for (let b = 1; b < n; b++) pairs.push([0, b])

  return posetFromPairs(n, pairs)
}

suite('measure/order-stats: posetHeight', [
  check('a chain of 5 has height 5', () => {
    equal(posetHeight({ poset: chain(5) }), 5)
  }),
  check('a star of 4 has height 2 (0 then one leaf)', () => {
    equal(posetHeight({ poset: star(4) }), 2)
  }),
  check('an antichain of 5 has height 1', () => {
    equal(posetHeight({ poset: posetFromPairs(5, []) }), 1)
  }),
])

suite('measure/order-stats: orderStatistics', [
  check(
    'a chain of 5: ordering fraction 1, height 5, ratio sqrt5, dimension ~ 1',
    () => {
      const out = orderStatistics({ poset: chain(5) })

      close(out.orderingFraction, 1, 1e-12)
      equal(out.height, 5)
      close(out.heightRatio, 5 / Math.sqrt(5), 1e-12)
      close(out.mmDimension, 1, 1e-2)
    },
  ),
  check(
    'a star of 4 has ordering fraction 1/2 and dimension ~ 2',
    () => {
      const out = orderStatistics({ poset: star(4) })

      close(out.orderingFraction, 0.5, 1e-12)
      equal(out.height, 2)
      close(out.mmDimension, 2, 1e-2)
    },
  ),
])

suite('measure/order-stats: causalSliceWidths', [
  check('a chain of 4 has slice widths 1,1,1,1', () => {
    exactArray(causalSliceWidths({ poset: chain(4) }), [1, 1, 1, 1])
  }),
  check(
    'a star of 4 has slice widths 1,3 (root, then the three leaves)',
    () => {
      exactArray(causalSliceWidths({ poset: star(4) }), [1, 3])
    },
  ),
])
