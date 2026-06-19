// Strong-field photon orbits in the Schwarzschild geometry, the black-hole shadow. The Schwarzschild metric is the
// nonlinear completion of the weak-field potential (the substrate gives the 1/r potential and the gravity-gravitates
// nonlinearity, and the static nonlinear solution is Schwarzschild). A photon's orbit obeys (du/dphi)^2 = 1/b^2 -
// u^2 + r_s u^3, with u = 1/r and r_s the Schwarzschild radius. The deflection is the integral of du over the square
// root, doubled, minus pi. In the WEAK field (large impact parameter b) it gives 2 r_s / b = 4 G M / b, the
// factor-of-two light bending. As b approaches the photon sphere it DIVERGES (the photon orbits many times, strong-
// field lensing), and below the critical b_c = (3 sqrt 3 / 2) r_s there is no turning point, the photon is CAPTURED,
// crossing the horizon into the interior, the black-hole shadow.

// the photon-orbit turning point, the smallest positive root u_max of f(u) = 1/b^2 - u^2 + r_s u^3 in (0, 1/r_s),
// or null if there is none (the photon is captured, it reaches the horizon)
function turningPoint(
  impactParameter: number,
  schwarzschildRadius: number,
): number | null {
  const b = impactParameter
  const rs = schwarzschildRadius
  const f = (u: number): number => 1 / (b * b) - u * u + rs * u * u * u
  const steps = 200000
  const uHorizon = 1 / rs
  let previous = f(1e-6)
  let uPrevious = 1e-6
  for (let i = 1; i <= steps; i++) {
    const u = (i / steps) * uHorizon
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

      return (lo + hi) / 2
    }

    previous = value
    uPrevious = u
  }

  return null
}

// the deflection angle (radians) of a photon with impact parameter `impactParameter` in the Schwarzschild geometry
// of radius `schwarzschildRadius`, or null if the photon is CAPTURED (impact parameter below the shadow radius). The
// integral is taken with the substitution u = u_max - w^2 to tame the inverse-square-root turning-point singularity.
export function schwarzschildPhotonDeflection(input: {
  impactParameter: number
  schwarzschildRadius: number
}): number | null {
  const b = input.impactParameter
  const rs = input.schwarzschildRadius
  const uMax = turningPoint(b, rs)
  if (uMax === null) {
    return null
  }

  const f = (u: number): number => 1 / (b * b) - u * u + rs * u * u * u
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

    integral += ((2 * wi) / Math.sqrt(value)) * (w / samples)
  }

  return 2 * integral - Math.PI
}

// the exact photon-sphere shadow radius, the critical impact parameter below which a photon is captured,
// b_c = (3 sqrt 3 / 2) r_s
export function photonSphereShadowRadius(
  schwarzschildRadius: number,
): number {
  return ((3 * Math.sqrt(3)) / 2) * schwarzschildRadius
}

// the measured capture threshold, the largest impact parameter (bisected) for which the photon is captured, which
// equals the shadow radius. Confirms the shadow radius from the orbit dynamics rather than the closed form.
export function measuredShadowRadius(input: {
  schwarzschildRadius: number
}): number {
  const rs = input.schwarzschildRadius
  let captured = 1.5 * rs
  let escapes = 4 * rs
  for (let k = 0; k < 50; k++) {
    const mid = (captured + escapes) / 2
    if (
      schwarzschildPhotonDeflection({
        impactParameter: mid,
        schwarzschildRadius: rs,
      }) === null
    ) {
      captured = mid
    } else {
      escapes = mid
    }
  }

  return (captured + escapes) / 2
}
