// The crystallographic (root-system) integer test on a set of direction vectors. A set of
// directions can carry a root system / gauge group only if the Cartan integers 2(a.b)/(b.b)
// are integers for every ordered pair. Icosahedral or heptagonal directions fail this (a
// golden-ratio or 7-fold non-integer appears), so they form no root system. Returns true only
// when every pair passes the integer test (within tolerance).

import { dot } from '@/code/algebra/vector'

export function directionsAreCrystallographic(
  directions: ReadonlyArray<number[]>,
  tolerance: number = 1e-6,
): boolean {
  for (const a of directions) {
    for (const b of directions) {
      const r = (2 * dot(a, b)) / dot(b, b)
      if (Math.abs(r - Math.round(r)) > tolerance) {
        return false
      }
    }
  }

  return true
}
