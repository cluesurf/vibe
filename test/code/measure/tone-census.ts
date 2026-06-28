// Conformance for code/measure/tone-census. totalCharge is the signed sum (the conserved quantity);
// liveCount is the number of nonzero (non-peace) cells. Both are exact integer tallies.

import { suite, check, equal } from '@/test/code/harness'
import { totalCharge, liveCount } from '@/code/measure/tone-census'

suite('measure/tone-census: totalCharge and liveCount', [
  check('signed sum and nonzero count of a mixed buffer', () => {
    // [1,-1,1,0]: charge 1, live cells 3.
    const t = Int8Array.from([1, -1, 1, 0])
    equal(totalCharge(t), 1)
    equal(liveCount(t), 3)
  }),
  check('a vacuum buffer has zero charge and zero life', () => {
    const t = Int8Array.from([0, 0, 0, 0])
    equal(totalCharge(t), 0)
    equal(liveCount(t), 0)
  }),
  check('a balanced buffer has zero charge but full life', () => {
    const t = Int8Array.from([1, -1, 1, -1])
    equal(totalCharge(t), 0)
    equal(liveCount(t), 4)
  }),
])
