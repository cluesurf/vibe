// Conformance for code/measure/front-speed.
//   - rangeAnisotropy is (max - min) / mean, with the documented fallback of 1 for < 2 speeds.
//   - differenceRmsWidthRing is the RMS periodic distance of the disagreeing cells from the centre.
//   - directionalFrontDistances bins each activated cell to its nearest probe direction by angle and
//     records the farthest Poincare distance reached. The expected hyperbolic distance is derived in
//     closed form: d((0,0),(1/2,0)) = acosh(5/3) = ln 3.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  rangeAnisotropy,
  differenceRmsWidthRing,
  directionalFrontDistances,
} from '@/code/measure/front-speed'

const TIGHT = 1e-9
const LN3 = Math.log(3)

suite('measure/front-speed: rangeAnisotropy', [
  check('uniform speeds give anisotropy 0', () => {
    const out = rangeAnisotropy([1, 1, 1])
    close(out.meanSpeed, 1, TIGHT)
    close(out.anisotropy, 0, TIGHT)
  }),
  check('speeds [1, 3] give mean 2, anisotropy (3-1)/2 = 1', () => {
    const out = rangeAnisotropy([1, 3])
    close(out.meanSpeed, 2, TIGHT)
    close(out.anisotropy, 1, TIGHT)
  }),
  check(
    'fewer than two speeds returns the fallback anisotropy 1',
    () => {
      equal(rangeAnisotropy([5]).anisotropy, 1)
    },
  ),
])

suite('measure/front-speed: differenceRmsWidthRing', [
  check(
    'two disagreements at periodic distance 2 give RMS width 2',
    () => {
      // L=10, center 0, differ at x=2 (dist 2) and x=8 (dist min(8,2)=2) -> sqrt((4+4)/2)=2.
      const a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      const b = [0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
      close(
        differenceRmsWidthRing({ a, b, length: 10, center: 0 }),
        2,
        TIGHT,
      )
    },
  ),
  check('identical states give width 0', () => {
    const a = [1, 2, 3]
    close(
      differenceRmsWidthRing({ a, b: [1, 2, 3], length: 3, center: 0 }),
      0,
      TIGHT,
    )
  }),
])

suite('measure/front-speed: directionalFrontDistances', [
  check(
    'each activated cell goes to its nearest direction; distance is ln 3',
    () => {
      const coords = [
        [0, 0],
        [0.5, 0],
        [0, 0.5],
      ]

      const directions = [
        [1, 0],
        [0, 1],
      ]

      const front = directionalFrontDistances({
        coords,
        directions,
        center: 0,
        activated: () => true,
      })

      close(front[0]!, LN3, 1e-9) // +x cell
      close(front[1]!, LN3, 1e-9) // +y cell
    },
  ),
  check('an unreached direction keeps front distance 0', () => {
    const coords = [
      [0, 0],
      [0.5, 0],
      [0, 0.5],
    ]

    const directions = [
      [1, 0],
      [0, 1],
    ]

    // only the +x cell (index 1) is activated
    const front = directionalFrontDistances({
      coords,
      directions,
      center: 0,
      activated: i => i === 1,
    })

    close(front[0]!, LN3, 1e-9)
    equal(front[1], 0)
  }),
])
