// Slow-roll inflaton dynamics, integrated with RK4. A scalar field phi in a potential V drives the
// expansion of a flat FRW universe (units 8 pi G = 1):
//   H = sqrt( (1/2 phidot^2 + V(phi)) / 3 ),   phiddot = -3 H phidot - V'(phi),   dln a/dt = H.
// While phi is large the potential dominates and the universe inflates (equation of state near -1).
// The caller supplies V and V' and reads the slow-roll exit and e-fold count from the trajectory.

// The Hubble rate from the field's kinetic plus potential energy density.
export function inflatonHubble(input: {
  phi: number
  phidot: number
  potential: (phi: number) => number
}): number {
  return Math.sqrt(Math.max(0, (0.5 * input.phidot * input.phidot + input.potential(input.phi)) / 3))
}

// One RK4 step of (phi, phidot) under the inflaton equation of motion. Returns the advanced field and
// its velocity. The Hubble friction -3 H phidot uses the instantaneous H at each stage.
export function inflatonStep(input: {
  phi: number
  phidot: number
  potential: (phi: number) => number
  potentialSlope: (phi: number) => number
  dt: number
}): { phi: number; phidot: number } {
  const { potential, potentialSlope, dt } = input
  const deriv = (p: number, pd: number): { dp: number; dpd: number } => {
    const h = inflatonHubble({ phi: p, phidot: pd, potential })
    return { dp: pd, dpd: -3 * h * pd - potentialSlope(p) }
  }
  const k1 = deriv(input.phi, input.phidot)
  const k2 = deriv(input.phi + 0.5 * dt * k1.dp, input.phidot + 0.5 * dt * k1.dpd)
  const k3 = deriv(input.phi + 0.5 * dt * k2.dp, input.phidot + 0.5 * dt * k2.dpd)
  const k4 = deriv(input.phi + dt * k3.dp, input.phidot + dt * k3.dpd)
  return {
    phi: input.phi + (dt / 6) * (k1.dp + 2 * k2.dp + 2 * k3.dp + k4.dp),
    phidot: input.phidot + (dt / 6) * (k1.dpd + 2 * k2.dpd + 2 * k3.dpd + k4.dpd),
  }
}
