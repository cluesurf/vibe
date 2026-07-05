// Conformance for code/dynamics/clock-winding: a clock (Z_n) field on a ring and its topological winding.
// Invariants:
//   - makeTwist of `turns` turns has winding exactly `turns` (clockWinding is an exact integer).
//   - the reversible second-order clock wave is EXACTLY reversible (mod n).
//   - at fine resolution the winding is CONSERVED under evolution (no phase slip).
//   - DETERMINISM.

import { suite, check, equal, exactArray } from '@/test/code/harness'
import {
  clockWinding,
  stepClockRing,
  makeTwist,
  ClockRing,
} from '@/code/dynamics/clock-winding'

const size = 60
const states = 240

suite('dynamics/clock-winding: winding number', [
  check('makeTwist has winding equal to its turn count', () => {
    for (const turns of [0, 1, 2, 3]) {
      const ring = makeTwist({ size, states, turns })
      equal(
        clockWinding(ring.curr, states),
        turns,
        `winding = ${turns}`,
      )
    }
  }),
])

suite('dynamics/clock-winding: reversibility and conservation', [
  check('the clock wave is exactly reversible (mod n)', () => {
    const ring0 = makeTwist({ size, states, turns: 2 })
    // perturb so prev != curr (give it some velocity), staying in range
    ring0.prev[10] = (ring0.prev[10]! + 1) % states

    const prev0 = ring0.prev.slice()
    const after = stepClockRing(ring0)
    const reversed: ClockRing = {
      prev: after.curr,
      curr: after.prev,
      size,
      states,
    }

    const back = stepClockRing(reversed)
    exactArray(back.curr, prev0, 'recovered the previous slice')
  }),
  check(
    'the winding is conserved under evolution at fine resolution',
    () => {
      let ring = makeTwist({ size, states, turns: 1 })

      const w0 = clockWinding(ring.curr, states)

      for (let t = 0; t < 100; t++) {
        ring = stepClockRing(ring)
        equal(
          clockWinding(ring.curr, states),
          w0,
          `winding held at step ${t}`,
        )
      }
    },
  ),
])

suite('dynamics/clock-winding: determinism', [
  check('two evolutions agree', () => {
    const run = (): Int32Array => {
      let ring = makeTwist({ size, states, turns: 2 })

      for (let t = 0; t < 30; t++) {
        ring = stepClockRing(ring)
      }

      return ring.curr
    }

    exactArray(run(), run(), 'deterministic')
  }),
])
