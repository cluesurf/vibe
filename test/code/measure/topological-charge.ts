// Conformance for code/measure/topological-charge: the Berg-Luscher signed solid angle
// of a spherical triangle. Three orthonormal unit vectors span exactly one octant of the
// sphere, solid angle 2pi/4 = pi/2, so each axis-triple reads +/- pi/2 by orientation.
// The eight octants tile the full sphere: their magnitudes sum to 4pi, the winding-number
// normalization. Degenerate (collinear) triangles read 0.

import { suite, check, close } from '@/test/code/harness'
import { sphericalTriangleArea } from '@/code/measure/topological-charge'

type V = [number, number, number]
const X: V = [1, 0, 0]
const Y: V = [0, 1, 0]
const Z: V = [0, 0, 1]
const TOL = 1e-12

suite('measure/topological-charge: spherical triangle', [
  // a.(b x c) = x.(y x z) = 1, denom = 1, area = 2 atan2(1,1) = pi/2 (one octant).
  check('an orthonormal octant subtends pi/2', () => {
    close(sphericalTriangleArea(X, Y, Z), Math.PI / 2, TOL)
  }),
  // Reversing the orientation flips the sign of the oriented area.
  check('reversed orientation flips the sign to -pi/2', () => {
    close(sphericalTriangleArea(X, Z, Y), -Math.PI / 2, TOL)
  }),
  // A degenerate (all-equal) triangle has zero numerator: solid angle 0.
  check('a collapsed triangle subtends 0', () => {
    close(sphericalTriangleArea(X, X, X), 0, TOL)
  }),
  // The eight axis-octants tile the sphere: each has |area| = pi/2, summing to 4pi, the
  // 4pi that divides the swept area into the integer skyrmion winding number.
  check('the eight octants tile to 4pi (winding normalization)', () => {
    const signs = [-1, 1]

    let total = 0

    for (const sx of signs) {
      for (const sy of signs) {
        for (const sz of signs) {
          total += Math.abs(
            sphericalTriangleArea([sx, 0, 0], [0, sy, 0], [0, 0, sz]),
          )
        }
      }
    }

    close(total, 4 * Math.PI, TOL)
  }),
])
