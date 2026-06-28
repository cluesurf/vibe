// Conformance for code/measure/superfluid. The Landau critical velocity is min_k omega(k)/k: a linear
// (sound) dispersion omega = c k gives v_c = c (finite, superfluid), a quadratic omega = k^2 gives
// v_c -> 0 (normal). The vortex circulation around a winding-m defect is exactly 2*pi*m
// (Onsager-Feynman). Each is re-derived from the closed form.

import { suite, check, close } from '@/test/code/harness'
import {
  landauCriticalVelocity,
  vortexCirculation,
} from '@/code/measure/superfluid'

suite('measure/superfluid: landauCriticalVelocity', [
  check('a linear dispersion omega = 2k gives critical velocity 2', () => {
    close(landauCriticalVelocity({ dispersion: k => 2 * k }), 2, 1e-12)
  }),
  check('a quadratic dispersion omega = k^2 gives v_c at the smallest k', () => {
    // min of (k^2)/k = k is at the first sample k = kMax/steps = pi/2000.
    close(
      landauCriticalVelocity({ dispersion: k => k * k }),
      Math.PI / 2000,
      1e-9,
    )
  }),
])

suite('measure/superfluid: vortexCirculation', [
  check('a winding-1 vortex circulates by 2*pi', () => {
    close(vortexCirculation({ winding: 1 }), 2 * Math.PI, 1e-9)
  }),
  check('a winding-3 vortex circulates by 6*pi', () => {
    close(vortexCirculation({ winding: 3 }), 6 * Math.PI, 1e-9)
  }),
  check('a winding -2 vortex circulates by -4*pi', () => {
    close(vortexCirculation({ winding: -2 }), -4 * Math.PI, 1e-9)
  }),
  check('a zero-winding loop circulates by 0', () => {
    close(vortexCirculation({ winding: 0 }), 0, 1e-12)
  }),
])
