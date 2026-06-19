// Analog (acoustic / sonic) horizon kinematics. An effective wave-speed profile that falls to zero
// at a horizon radius behaves like a black-hole horizon: an ingoing null ray freezes there, its
// distance to the horizon shrinking exponentially in time, and the freeze rate is the surface
// gravity kappa = (d/dr) c at the horizon. From kappa the Hawking temperature is kappa / (2 pi).

import { linearFit } from '@/code/measure/regression'

// Effective radial wave speed with a horizon at `horizon` where it vanishes and saturates to 1 far
// out: c(r) = tanh(gradient * (r - horizon)) for r > horizon, else 0. The slope at the horizon is
// the surface gravity (= gradient, since tanh'(0) = 1).
export function tanhHorizonSpeed(input: {
  radius: number
  horizon: number
  gradient: number
}): number {
  if (input.radius <= input.horizon) {
    return 0
  }
  return Math.tanh(input.gradient * (input.radius - input.horizon))
}

// Surface gravity from a dynamical ingoing null ray dr/dt = -c(r). Near the horizon c ~ kappa (r -
// horizon), so (r - horizon) ~ exp(-kappa t); kappa is fit from the late-time exponential tail.
export function rayFreezeSurfaceGravity(input: {
  horizon: number
  gradient: number
  start: number
  step?: number
  maxSteps?: number
  gapWindow?: number
  tailSamples?: number
}): number {
  const { horizon, gradient, start } = input
  const dt = input.step ?? 0.002
  const maxSteps = input.maxSteps ?? 400000
  const gapWindow = input.gapWindow ?? 0.15
  const tailSamples = input.tailSamples ?? 3000
  let r = start
  let t = 0
  const times: number[] = []
  const logGaps: number[] = []
  for (let i = 0; i < maxSteps && r - horizon > 1e-7; i++) {
    r -= tanhHorizonSpeed({ radius: r, horizon, gradient }) * dt
    t += dt
    const gap = r - horizon
    if (gap < gapWindow && gap > 1e-6) {
      times.push(t)
      logGaps.push(Math.log(gap))
    }
  }
  const tailStart = Math.max(0, times.length - tailSamples)
  return -linearFit({
    xs: times.slice(tailStart),
    ys: logGaps.slice(tailStart),
  }).slope
}
