// Conformance for code/measure/leggett-garg. The two-time correlator of sigma_z under an R_y(theta)
// rotation is exactly cos(theta) (re-derived here, not read off the impl), the macrorealist bound on
// K = C12 + C23 - C13 is 1, and the quantum maximum is 3/2 at theta = pi/3, where
// K(theta) = 2 cos(theta) - cos(2 theta) peaks (d/dtheta = 0 -> cos theta = 1/2).

import { suite, check, close, equal } from '@/test/code/harness'
import {
  temporalCorrelator,
  leggettGarg,
} from '@/code/measure/leggett-garg'

const TIGHT = 1e-12

suite('measure/leggett-garg: temporalCorrelator equals cos(theta)', [
  check('C(0) = 1', () => close(temporalCorrelator(0), 1, TIGHT)),
  check('C(pi/3) = cos(pi/3) = 1/2', () =>
    close(temporalCorrelator(Math.PI / 3), 0.5, TIGHT),
  ),
  check('C(pi/2) = cos(pi/2) = 0', () =>
    close(temporalCorrelator(Math.PI / 2), 0, TIGHT),
  ),
  check('C(pi) = -1', () =>
    close(temporalCorrelator(Math.PI), -1, TIGHT),
  ),
  check('matches cos(theta) at a scattering of angles', () => {
    for (const theta of [0.3, 0.9, 1.7, 2.4, 3.0]) {
      close(temporalCorrelator(theta), Math.cos(theta), TIGHT)
    }
  }),
])

suite('measure/leggett-garg: the inequality', [
  check('macrorealist bound is exactly 1', () => {
    equal(leggettGarg().classicalBound, 1)
  }),
  check('quantum maximum reaches 3/2 at theta = pi/3', () => {
    const out = leggettGarg({ steps: 360 })

    // K(pi/3) = 2 cos(pi/3) - cos(2 pi/3) = 2*(1/2) - (-1/2) = 3/2.
    close(out.quantumMax, 1.5, 1e-9)
    close(out.bestTheta, Math.PI / 3, 0.02)
  }),
])
