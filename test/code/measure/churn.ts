// Conformance for code/measure/churn. The churn count is the number of cells whose tone changes
// from one beat to the next under the second-order reversible wave next[i] = (sum_{j~i} cur[j] -
// prev[i]) mod q, summed over the run. We hand-run the wave on a 2-node graph and count the changes
// directly, so the test pins the count to the recurrence, not to itself.

import { suite, check, equal } from '@/test/code/harness'
import { churnCount } from '@/code/measure/churn'

// Two nodes, each the other's only neighbor.
const twoNode = [[1], [0]] as const

suite('measure/churn: churnCount', [
  // prev=[0,0], cur=[1,0], q=3.
  // step 0: i=0 -> (cur[1]-prev[0]) = (0-0) = 0; 0 != cur[0]=1 -> change.
  //         i=1 -> (cur[0]-prev[1]) = (1-0) = 1; 1 != cur[1]=0 -> change.
  // total after 1 step = 2.
  check('one step on a 2-node graph counts 2 changes', () => {
    equal(
      churnCount({
        neighbors: twoNode,
        initial: Int8Array.from([1, 0]),
        steps: 1,
        modulus: 3,
      }),
      2,
    )
  }),
  // step 1: prev=[1,0], cur=[0,1].
  //   i=0 -> (cur[1]-prev[0]) = (1-1) = 0; 0 == cur[0]=0 -> no change.
  //   i=1 -> (cur[0]-prev[1]) = (0-0) = 0; 0 != cur[1]=1 -> change.
  // cumulative = 2 + 1 = 3.
  check('two steps accumulate to 3 changes', () => {
    equal(
      churnCount({
        neighbors: twoNode,
        initial: Int8Array.from([1, 0]),
        steps: 2,
        modulus: 3,
      }),
      3,
    )
  }),
  check('a frozen (all-zero) field never changes, churn 0', () => {
    equal(
      churnCount({
        neighbors: twoNode,
        initial: Int8Array.from([0, 0]),
        steps: 10,
        modulus: 3,
      }),
      0,
    )
  }),
])
