// Conformance for code/measure/acoustic-horizon: the analog-horizon kinematics. The tanh speed
// profile vanishes inside the horizon and its slope at the horizon is the surface gravity (tanh'(0) =
// 1, so kappa = gradient). The ingoing-ray freeze-rate estimator must recover that same gradient as
// the surface gravity off the late-time exponential approach (r - horizon ~ exp(-kappa t)).

import { suite, check, close } from '@/test/code/harness'
import {
  tanhHorizonSpeed,
  rayFreezeSurfaceGravity,
} from '@/code/measure/acoustic-horizon'

suite('measure/acoustic-horizon: speed profile', [
  // Zero inside the horizon, tanh(gradient * (r - horizon)) outside.
  check('the profile vanishes inside and is tanh outside', () => {
    close(
      tanhHorizonSpeed({ radius: 0.5, horizon: 1, gradient: 0.5 }),
      0,
      1e-12,
    )

    close(
      tanhHorizonSpeed({ radius: 1, horizon: 1, gradient: 0.5 }),
      0,
      1e-12,
    )

    close(
      tanhHorizonSpeed({ radius: 3, horizon: 1, gradient: 0.5 }),
      Math.tanh(1),
      1e-12,
    )
  }),
  // The slope at the horizon equals the gradient (surface gravity = gradient).
  check('the slope at the horizon is the gradient', () => {
    const eps = 1e-5
    const slope =
      tanhHorizonSpeed({ radius: 1 + eps, horizon: 1, gradient: 0.5 }) /
      eps

    close(slope, 0.5, 1e-3)
  }),
])

suite('measure/acoustic-horizon: ray freeze surface gravity', [
  // The ingoing ray freezes exponentially; the fit recovers kappa = gradient.
  check('the freeze rate recovers the surface gravity', () => {
    const kappa = rayFreezeSurfaceGravity({
      horizon: 1,
      gradient: 0.5,
      start: 2,
    })

    close(kappa, 0.5, 0.05)
  }),
  check('a steeper gradient gives a larger surface gravity', () => {
    const kappa = rayFreezeSurfaceGravity({
      horizon: 1,
      gradient: 0.8,
      start: 2,
    })

    close(kappa, 0.8, 0.08)
  }),
])
