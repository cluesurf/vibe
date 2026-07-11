// Conformance for code/measure/sound-wave. The independently-checkable helpers are coinLines (the
// opposite-direction line pairs of a coin) and firstMinimumTime (the index of the first minimum of a
// contrast trace). The full charge-density-wave setup and stripe contrast run over a Mesh and the
// lattice-gas beat (dynamics orchestration), so they are not re-run here.

import { suite, check, equal } from '@/test/code/harness'
import { coinLines, firstMinimumTime } from '@/code/measure/sound-wave'

suite('measure/sound-wave: coinLines', [
  check(
    'pairs each direction with its opposite, canonical low-first',
    () => {
      // opposite=[1,0,3,2] -> lines [0,1] and [2,3].
      const lines = coinLines([1, 0, 3, 2])

      equal(lines.length, 2)
      equal(lines[0]![0], 0)
      equal(lines[0]![1], 1)
      equal(lines[1]![0], 2)
      equal(lines[1]![1], 3)
    },
  ),
  check('a self-opposite slot (rest) forms no line', () => {
    // opposite=[1,0,2]: dir 2 is its own opposite, excluded.
    const lines = coinLines([1, 0, 2])

    equal(lines.length, 1)
    equal(lines[0]![0], 0)
    equal(lines[0]![1], 1)
  }),
])

suite('measure/sound-wave: firstMinimumTime', [
  check(
    'returns the index of the first minimum before the rise',
    () => {
      // [5,3,1,2,4]: falls to index 2 then rises -> first minimum at t=2.
      equal(firstMinimumTime([5, 3, 1, 2, 4]), 2)
    },
  ),
  check('a monotone-decreasing trace minimizes at the end', () => {
    equal(firstMinimumTime([5, 4, 3, 2, 1]), 4)
  }),
  check('a trace that only rises has its minimum at t=0', () => {
    equal(firstMinimumTime([1, 2, 3]), 0)
  }),
])
