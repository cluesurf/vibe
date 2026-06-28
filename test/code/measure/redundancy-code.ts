// Conformance for code/measure/redundancy-code: the majority-vote holographic redundancy code.
// recoverByMajority returns 1 iff at least half the boundary bits are 1 (ties round to 1). A
// connected erasure of fraction f flips round(f * size) sites; below half the logical bit survives,
// above half it is lost. Every expected value is the majority count worked out by hand.

import { suite, check, equal } from '@/test/code/harness'
import {
  recoverByMajority,
  corruptConnectedRegion,
} from '@/code/measure/redundancy-code'

suite('measure/redundancy-code: recoverByMajority', [
  check('all-ones recovers 1, all-zeros recovers 0', () => {
    equal(recoverByMajority([1, 1, 1, 1]), 1)
    equal(recoverByMajority([0, 0, 0, 0]), 0)
  }),
  check('strict majority decides', () => {
    equal(recoverByMajority([1, 1, 0]), 1) // 2 of 3
    equal(recoverByMajority([1, 0, 0]), 0) // 1 of 3
  }),
  check('a tie rounds up to 1 (ones*2 >= length)', () => {
    equal(recoverByMajority([1, 0]), 1)
    equal(recoverByMajority([1, 1, 0, 0]), 1)
  }),
])

suite('measure/redundancy-code: corruptConnectedRegion threshold', [
  check('30% erasure of a 10-site code keeps the logical bit recoverable', () => {
    const boundary = corruptConnectedRegion({ size: 10, fraction: 0.3, logical: 1 })
    // 3 sites flipped to 0, 7 remain 1 -> majority recovers 1.
    equal(boundary.filter(b => b === 1).length, 7)
    equal(recoverByMajority(boundary), 1)
  }),
  check('60% erasure crosses the distance and loses the bit', () => {
    const boundary = corruptConnectedRegion({ size: 10, fraction: 0.6, logical: 1 })
    // 6 flipped to 0, only 4 remain 1 -> majority recovers 0.
    equal(boundary.filter(b => b === 1).length, 4)
    equal(recoverByMajority(boundary), 0)
  }),
  check('exactly half erased is still recovered (tie -> 1)', () => {
    const boundary = corruptConnectedRegion({ size: 8, fraction: 0.5, logical: 1 })
    equal(boundary.filter(b => b === 1).length, 4)
    equal(recoverByMajority(boundary), 1)
  }),
  check('a logical 0 is symmetric: light corruption keeps it 0', () => {
    const boundary = corruptConnectedRegion({ size: 10, fraction: 0.3, logical: 0 })
    equal(boundary.filter(b => b === 1).length, 3)
    equal(recoverByMajority(boundary), 0)
  }),
])
