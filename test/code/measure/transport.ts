// Conformance for code/measure/transport: the Sinkhorn-regularized W1 distance between
// two uniform distributions. We pin it on cases with a known optimum: identical supports
// (cost 0), a single cell (cost = the one entry), and an all-equal cost (the plan must
// move the whole unit mass at that cost). The entropic blur means small tolerances, kept
// tight by using a small eps.

import { suite, check, close } from '@/test/code/harness'
import { sinkhornW1 } from '@/code/measure/transport'

suite('measure/transport: sinkhorn W1', [
  // One support point each: all mass sits at (0,0), so W1 is exactly the lone cost 5.
  // The plan entry converges to the unit mass regardless of eps.
  check('single-cell transport is the only cost', () => {
    close(sinkhornW1([[5]], 0.1, 200), 5, 1e-6)
  }),
  // Total transported mass is 1 and every cost is 1, so W1 = 1 for ANY feasible plan,
  // exactly, independent of the entropic regularization.
  check('a uniform cost gives W1 = 1 (total mass is 1)', () => {
    close(sinkhornW1([[1, 1], [1, 1]], 0.5, 300), 1, 1e-9)
  }),
  // Identical distributions over the same line: the optimal map is the identity, cost 0.
  // Small eps drives the entropic estimate to 0.
  check('matching identical distributions costs ~0', () => {
    const cost = [
      [0, 1, 2],
      [1, 0, 1],
      [2, 1, 0],
    ]
    close(sinkhornW1(cost, 0.02, 4000), 0, 5e-3)
  }),
  // A forced unit shift: cost |i-j| with the only cheap diagonal removed by a constant
  // offset still respects total mass. Here a pure off-by-one cost [[1,2],[2,1]] has
  // optimal value 1 (identity matching picks the two diagonal 1s, each carrying 0.5).
  check('off-diagonal-penalized 2x2 routes along the cheap diagonal', () => {
    close(sinkhornW1([[1, 2], [2, 1]], 0.02, 3000), 1, 5e-3)
  }),
])
