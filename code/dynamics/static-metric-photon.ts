// Deriving the Schwarzschild metric from the bare dynamics by the self-consistent bootstrap, gravity gravitates,
// and the photon deflection on a general static metric. The substrate gives the weak-field potential (the 3A
// entropic 1/r) and the gravity-gravitates nonlinearity (the field sources its own energy). Made self-consistent,
// that nonlinearity RESUMS the spatial metric to the full Schwarzschild form, no metric assumed. The bootstrap is
// the fixed-point iteration B = 1 + (r_s/r) B (the spatial curvature sourced by the mass plus its own curvature
// energy at the previous order), whose fixed point is B = 1/(1 - r_s/r), the resummed g_rr, and A = 1/B = 1 - r_s/r
// is g_tt, Schwarzschild. The photon deflection on a general static metric (A, B) then follows, and the spatial part
// B contributes exactly HALF the light bending (without it the deflection is the time-only 2 G M / b, with it the
// full 4 G M / b, the factor of two).

// The self-consistent bootstrap of the spatial metric at radius scaled by x = r_s / r, returning the sequence of
// iterates B_n (B_{n+1} = 1 + x B_n, starting at 1), which converges to 1/(1 - x), the resummed g_rr.
export function spatialMetricBootstrap(input: {
  x: number
  iterations: number
}): number[] {
  const trail: number[] = []
  let b = 1
  for (let n = 0; n < input.iterations; n++) {
    b = 1 + input.x * b
    trail.push(b)
  }
  return trail
}

// The photon deflection (radians) on the derived static metric A(u) = 1 - r_s u, B(u) the spatial metric (the
// resummed 1/A for the full geometry, or 1 for the time-only control), with u = 1/r and impact parameter b. The
// orbit obeys (du/dphi)^2 = (1/B)(1/(A b^2) - u^2), the turning point is where u^2 A(u) = 1/b^2, and the deflection
// is 2 times the integral of sqrt(B)/sqrt(1/(A b^2) - u^2) minus pi. Returns null if the photon is captured.
export function staticMetricPhotonDeflection(input: {
  schwarzschildRadius: number
  impactParameter: number
  spatialMetric: 'full' | 'flat'
}): number | null {
  const rs = input.schwarzschildRadius
  const b = input.impactParameter
  const aOf = (u: number): number => 1 - rs * u
  const bOf = (u: number): number =>
    input.spatialMetric === 'full' ? 1 / (1 - rs * u) : 1
  const f = (u: number): number => 1 / (aOf(u) * b * b) - u * u

  // the turning point, the first positive root of f in (0, 1/r_s)
  let uMax: number | null = null
  let previous = f(1e-6)
  let uPrevious = 1e-6
  const steps = 200000
  for (let i = 1; i <= steps; i++) {
    const u = (i / steps) * (0.999 / rs)
    const value = f(u)
    if (previous > 0 && value <= 0) {
      let lo = uPrevious
      let hi = u
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2
        if (f(mid) > 0) {
          lo = mid
        } else {
          hi = mid
        }
      }
      uMax = (lo + hi) / 2
      break
    }
    previous = value
    uPrevious = u
  }
  if (uMax === null) {
    return null
  }

  const w = Math.sqrt(uMax)
  const samples = 20000
  let integral = 0
  for (let i = 0; i < samples; i++) {
    const wi = ((i + 0.5) / samples) * w
    const u = uMax - wi * wi
    const value = f(u)
    if (value <= 0) {
      continue
    }
    integral +=
      ((2 * wi * Math.sqrt(bOf(u))) / Math.sqrt(value)) * (w / samples)
  }
  return 2 * integral - Math.PI
}
