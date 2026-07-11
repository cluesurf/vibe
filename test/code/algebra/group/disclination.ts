// Conformance for code/algebra/group/disclination: spin from a topological defect in
// a director (headless axis) field. Transporting around a winding-w disclination is a
// frame rotation by 2 pi w. A vector sees a multiple of 2 pi (returns to itself), while
// a spinor sees the double-cover lift exp(-i 2 pi w S_z) = (-1)^w. Every expected value
// is computed from this (-1)^w law, re-derived independently, not asserted by the code.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  directorLoop,
  spinorHolonomy,
  disclinationHolonomy,
  collectiveModeOverlap,
} from '@/code/algebra/group/disclination'
import { cmIsScalar } from '@/code/algebra/group/clifford'
import { complex } from '@/code/algebra/linear/complex'

const STEPS = 12

suite(
  'algebra/group/disclination: the director loop advances by 2 pi w',
  [
    check('the loop has `steps` angles starting at 0', () => {
      const angles = directorLoop({ winding: 1, steps: STEPS })

      equal(angles.length, STEPS, 'one angle per site')
      close(angles[0]!, 0, 1e-12, 'starts at 0')
    }),
    check('the per-step advance is 2 pi w / steps', () => {
      const w = 3
      const angles = directorLoop({ winding: w, steps: STEPS })

      for (let k = 0; k < STEPS; k++) {
        close(
          angles[k]!,
          (2 * Math.PI * w * k) / STEPS,
          1e-12,
          'advance k',
        )
      }
    }),
  ],
)

suite('algebra/group/disclination: spinor holonomy = (-1)^w', [
  check('odd winding gives the -I holonomy', () => {
    for (const w of [1, 3, 5]) {
      const H = spinorHolonomy({ winding: w, steps: STEPS })

      ok(cmIsScalar(H, complex({ re: -1, im: 0 })), `H = -I for w=${w}`)
    }
  }),
  check('even winding gives the +I holonomy', () => {
    for (const w of [0, 2, 4]) {
      const H = spinorHolonomy({ winding: w, steps: STEPS })

      ok(cmIsScalar(H, complex({ re: 1, im: 0 })), `H = +I for w=${w}`)
    }
  }),
])

suite(
  'algebra/group/disclination: both representations of the holonomy',
  [
    check('w=1: spinor flips (-1), vector returns to itself', () => {
      const h = disclinationHolonomy({ winding: 1, steps: STEPS })

      equal(h.spinorIsMinusOne, true, 'spinor = -1')
      equal(h.spinorIsPlusOne, false, 'spinor != +1')
      equal(
        h.vectorReturnsToSelf,
        true,
        'vector invisible to the defect',
      )
    }),
    check('w=2: spinor +1, vector returns', () => {
      const h = disclinationHolonomy({ winding: 2, steps: STEPS })

      equal(h.spinorIsPlusOne, true, 'spinor = +1')
      equal(h.spinorIsMinusOne, false, 'spinor != -1')
      equal(h.vectorReturnsToSelf, true, 'vector returns')
    }),
    check('w=0: trivial defect, spinor +1', () => {
      const h = disclinationHolonomy({ winding: 0, steps: STEPS })

      equal(h.spinorIsPlusOne, true, 'spinor = +1')
      equal(h.vectorReturnsToSelf, true, 'vector returns')
    }),
  ],
)

suite('algebra/group/disclination: collective-mode overlap is (-1)^w', [
  check('odd winding gives overlap -1 for every mode', () => {
    for (const mode of [0, 1, 2, 3, 5]) {
      close(
        collectiveModeOverlap({ winding: 1, steps: STEPS, mode }),
        -1,
        1e-9,
        `mode ${mode} overlap = -1`,
      )
    }
  }),
  check('even winding gives overlap +1 for every mode', () => {
    for (const mode of [0, 1, 2, 3, 5]) {
      close(
        collectiveModeOverlap({ winding: 2, steps: STEPS, mode }),
        1,
        1e-9,
        `mode ${mode} overlap = +1`,
      )
    }
  }),
])
