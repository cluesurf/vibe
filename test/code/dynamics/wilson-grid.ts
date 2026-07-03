// Conformance for code/dynamics/wilson-grid: the U(1) Wilson lattice action on a periodic L^3 lattice.
// Invariants:
//   - gridPlaquettes has exactly 3 L^3 plaquettes (three orientations per site).
//   - a FLAT connection (theta = 0) has zero Wilson and Maxwell action.
//   - SMALL-FIELD LIMIT: the Wilson action -> the Maxwell action as the field shrinks, since
//     1 - cos(F) -> F^2 / 2. The ratio Maxwell/Wilson approaches 1.

import { suite, check, close, equal, ok } from '@/test/code/harness'
import {
  gridPlaquettes,
  gridWilsonAction,
  gridMaxwellAction,
} from '@/code/dynamics/wilson-grid'

suite('dynamics/wilson-grid: plaquette enumeration', [
  check('there are 3 L^3 plaquettes', () => {
    equal(gridPlaquettes(2).length, 3 * 8, 'L=2')
    equal(gridPlaquettes(3).length, 3 * 27, 'L=3')
  }),
])

suite('dynamics/wilson-grid: actions', [
  check('a flat connection has zero action', () => {
    const L = 3
    const plaqs = gridPlaquettes(L)
    const theta = new Float64Array(3 * L * L * L) // all zero
    close(gridWilsonAction(theta, plaqs), 0, 1e-12, 'Wilson = 0')
    close(gridMaxwellAction(theta, plaqs), 0, 1e-12, 'Maxwell = 0')
  }),
  check(
    'the Wilson action approaches the Maxwell action in the small-field limit',
    () => {
      const L = 3
      const plaqs = gridPlaquettes(L)
      const n = 3 * L * L * L
      // a deterministic field pattern, scaled small
      const make = (eps: number): Float64Array =>
        Float64Array.from(
          { length: n },
          (_, i) => eps * Math.sin(i * 1.3 + 0.7),
        )

      const ratio = (eps: number): number => {
        const theta = make(eps)

        return (
          gridMaxwellAction(theta, plaqs) /
          gridWilsonAction(theta, plaqs)
        )
      }

      ok(
        Math.abs(ratio(1e-2) - 1) < Math.abs(ratio(1e-1) - 1),
        'ratio improves as the field shrinks',
      )
      close(ratio(1e-3), 1, 1e-4, 'Maxwell/Wilson -> 1')
    },
  ),
])
