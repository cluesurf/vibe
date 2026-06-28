// Conformance for code/measure/crystallographic: the Cartan-integer test 2(a.b)/(b.b) in Z for every
// ordered pair. Cubic axes and the A2 hexagonal roots pass (a real root system), while pentagonal
// (5-fold) and heptagonal (7-fold) directions fail (a golden-ratio / 7-fold non-integer appears).

import { suite, check, equal } from '@/test/code/harness'
import { directionsAreCrystallographic } from '@/code/measure/crystallographic'

suite('measure/crystallographic: integer (root-system) directions', [
  // Cubic axes: every Cartan integer is 0 or +/-2.
  check('the cubic axes are crystallographic', () => {
    const axes = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ]
    equal(directionsAreCrystallographic(axes), true)
  }),
  // The A2 root system (60/120 degrees): Cartan integers -1 and 2, all integral.
  check('the A2 hexagonal roots are crystallographic', () => {
    const a2 = [
      [1, 0],
      [-1, 0],
      [-0.5, Math.sqrt(3) / 2],
      [0.5, -Math.sqrt(3) / 2],
    ]
    equal(directionsAreCrystallographic(a2), true)
  }),
])

suite('measure/crystallographic: non-crystallographic directions', [
  // Pentagon: 2 cos(72 deg) = (sqrt5 - 1)/2 ~ 0.618, not an integer.
  check('pentagonal (5-fold) directions are not crystallographic', () => {
    const pent = [
      [1, 0],
      [Math.cos((2 * Math.PI) / 5), Math.sin((2 * Math.PI) / 5)],
    ]
    equal(directionsAreCrystallographic(pent), false)
  }),
  // Heptagon: 2 cos(2 pi / 7) ~ 1.247, not an integer.
  check('heptagonal (7-fold) directions are not crystallographic', () => {
    const hept = [
      [1, 0],
      [Math.cos((2 * Math.PI) / 7), Math.sin((2 * Math.PI) / 7)],
    ]
    equal(directionsAreCrystallographic(hept), false)
  }),
])
