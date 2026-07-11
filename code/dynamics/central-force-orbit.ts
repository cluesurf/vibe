// Planar orbits under a central gravitational force in d spatial dimensions, integrated with RK4. The
// Gauss law makes gravity an inverse-(d-1) power force, so the acceleration of a test mass is a = -r /
// |r|^d. Integrating a perturbed-circular orbit and tracking its periapsis exposes Ehrenfest's and
// Bertrand's results: orbits are bound and stable only for d < 4, and closed (no precession) only for
// the inverse-square law d = 3. Returns whether the orbit stayed bound, whether it closed, and the
// perihelion precession per orbit (zero for a closed ellipse).

// Acceleration under gravity in d spatial dimensions (force magnitude 1 / |r|^(d-1)).
export function centralForceAcceleration(
  x: number,
  y: number,
  dimension: number,
): [number, number] {
  const r = Math.hypot(x, y)
  const f = -1 / Math.pow(r, dimension)

  return [f * x, f * y]
}

export function integrateCentralForceOrbit(input: {
  dimension: number
  initialSpeed?: number
  dt?: number
  maxSteps?: number
}): {
  stable: boolean
  closed: boolean
  precessionPerOrbit: number
  orbits: number
} {
  const d = input.dimension
  const dt = input.dt ?? 0.0005
  const maxSteps = input.maxSteps ?? 400000

  let x = 1
  let y = 0
  let vx = 0
  let vy = input.initialSpeed ?? 0.8 // below circular speed, so an ellipse, to expose precession

  const deriv = (
    s: [number, number, number, number],
  ): [number, number, number, number] => {
    const [px, py, pvx, pvy] = s
    const [ax, ay] = centralForceAcceleration(px, py, d)

    return [pvx, pvy, ax, ay]
  }

  let cumAngle = 0
  let prevTheta = Math.atan2(y, x)
  let rPrev = Math.hypot(x, y)
  let rPrevPrev = rPrev
  let rMin = rPrev
  let rMax = rPrev

  const periapsisAngles: number[] = []

  for (let step = 0; step < maxSteps; step++) {
    const s: [number, number, number, number] = [x, y, vx, vy]
    const k1 = deriv(s)
    const k2 = deriv([
      x + (dt / 2) * k1[0],
      y + (dt / 2) * k1[1],
      vx + (dt / 2) * k1[2],
      vy + (dt / 2) * k1[3],
    ])

    const k3 = deriv([
      x + (dt / 2) * k2[0],
      y + (dt / 2) * k2[1],
      vx + (dt / 2) * k2[2],
      vy + (dt / 2) * k2[3],
    ])

    const k4 = deriv([
      x + dt * k3[0],
      y + dt * k3[1],
      vx + dt * k3[2],
      vy + dt * k3[3],
    ])

    x += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
    y += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    vx += (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
    vy += (dt / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])

    const r = Math.hypot(x, y)

    rMin = Math.min(rMin, r)
    rMax = Math.max(rMax, r)

    if (r > 20 || r < 0.05) {
      return {
        stable: false,
        closed: false,
        precessionPerOrbit: NaN,
        orbits: 0,
      } // escaped or plunged
    }

    // unwrap cumulative angle
    const theta = Math.atan2(y, x)

    let dtheta = theta - prevTheta

    if (dtheta > Math.PI) dtheta -= 2 * Math.PI

    if (dtheta < -Math.PI) dtheta += 2 * Math.PI

    cumAngle += dtheta
    prevTheta = theta

    // periapsis: local minimum of r
    if (rPrev < rPrevPrev && rPrev <= r && periapsisAngles.length < 12)
      periapsisAngles.push(cumAngle)

    rPrevPrev = rPrev
    rPrev = r
  }

  // precession per orbit from consecutive periapsis angles
  const advances: number[] = []

  for (let i = 1; i < periapsisAngles.length; i++) {
    advances.push(
      (periapsisAngles[i] ?? 0) - (periapsisAngles[i - 1] ?? 0),
    )
  }

  const meanAdvance = advances.length
    ? advances.reduce((a, b) => a + b, 0) / advances.length
    : NaN

  const precessionPerOrbit = meanAdvance - 2 * Math.PI
  const stable = rMax / rMin < 6 // stayed in a bounded band
  const closed =
    stable &&
    Number.isFinite(precessionPerOrbit) &&
    Math.abs(precessionPerOrbit) < 0.15

  return { stable, closed, precessionPerOrbit, orbits: advances.length }
}
