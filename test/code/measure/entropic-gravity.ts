// Conformance for code/measure/entropic-gravity: the Verlinde force law and the helper
// geometry/fit functions. The force/potential exponents follow algebraically from the
// screen-bit exponent, and the Newtonian classifier is "nearest integer is 2" with the
// audit-fixed boundary at the half-integer 2.5 (default tolerance 0.5). The log-log fit
// and ball volume are checked on inputs with an exact closed form.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  verlindeForceLaw,
  logLogExponent,
  ballRegion,
} from '@/code/measure/entropic-gravity'

const TOL = 1e-9

suite('measure/entropic-gravity: Verlinde law', [
  // Area law: N ~ r^2 gives force r^-2 and potential r^-1 (Newton), Newtonian true.
  check('the area law (exponent 2) is Newtonian', () => {
    const r = verlindeForceLaw({ bitExponent: 2 })

    equal(r.forceExponent, 2)
    equal(r.potentialExponent, 1)
    equal(r.isNewtonian, true)
  }),
  // Volume law: N ~ r^3 gives the wrong r^-3 force, not Newtonian.
  check('the volume law (exponent 3) is not Newtonian', () => {
    const r = verlindeForceLaw({ bitExponent: 3 })

    equal(r.forceExponent, 3)
    equal(r.potentialExponent, 2)
    equal(r.isNewtonian, false)
  }),
  // The default tolerance is exactly 0.5, the area/volume midpoint after the audit fix:
  // 2.4 is closer to 2 (Newtonian), 2.6 is closer to 3 (not).
  check('2.4 is Newtonian, 2.6 is not (boundary at 2.5)', () => {
    equal(verlindeForceLaw({ bitExponent: 2.4 }).isNewtonian, true)
    equal(verlindeForceLaw({ bitExponent: 2.6 }).isNewtonian, false)
  }),
  // The boundary point 2.5 sits at |2.5 - 2| = 0.5, which is NOT strictly less than 0.5:
  // exactly the midpoint is classified as not Newtonian.
  check('the exact midpoint 2.5 is not Newtonian', () => {
    equal(verlindeForceLaw({ bitExponent: 2.5 }).isNewtonian, false)
  }),
  check('a stricter tolerance can reject a 2.4 exponent', () => {
    // The default 0.5 band accepts 2.4 (|2.4 - 2| = 0.4 < 0.5).
    equal(verlindeForceLaw({ bitExponent: 2.4 }).isNewtonian, true)
    // A stricter band rejects it (0.4 is not < 0.3).
    equal(
      verlindeForceLaw({ bitExponent: 2.4, tolerance: 0.3 })
        .isNewtonian,
      false,
    )
  }),
])

suite('measure/entropic-gravity: log-log exponent', [
  // A pure power law value = r^2 has log-log slope exactly 2.
  check('a clean r^2 law fits to exponent 2', () => {
    close(logLogExponent([1, 2, 3, 4], [1, 4, 9, 16]), 2, TOL)
  }),
  check('a clean r^3 law fits to exponent 3', () => {
    close(logLogExponent([1, 2, 3, 4], [1, 8, 27, 64]), 3, TOL)
  }),
  // A 1/r falloff has a NEGATIVE log-log slope -1 (the sign that distinguishes a decaying
  // potential from a growing one).
  check('a 1/r falloff fits to exponent -1 (sign is correct)', () => {
    close(logLogExponent([1, 2, 4, 8], [1, 0.5, 0.25, 0.125]), -1, TOL)
  }),
])

suite('measure/entropic-gravity: ball volume', [
  // Radius 0 encloses only the centre cell.
  check('radius 0 ball is a single cell', () => {
    equal(ballRegion({ side: 3, radius: 0 }).length, 1)
  }),
  // Radius 1 on side 3 encloses the centre plus its 6 face neighbours (dx^2+dy^2+dz^2<=1).
  check(
    'radius 1 ball holds the centre and its 6 face neighbours',
    () => {
      equal(ballRegion({ side: 3, radius: 1 }).length, 7)
    },
  ),
])
