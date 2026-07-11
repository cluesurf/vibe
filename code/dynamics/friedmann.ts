// The Friedmann-Lemaitre cosmological dynamics, integrated forward with RK4. A flat universe with
// several perfect-fluid components (each with density rho_i and equation-of-state w_i) obeys
//   da/dt = a H,   H = sqrt(rho_total)            (Friedmann, time-time, units 8 pi G / 3 = 1)
//   d rho_i/dt = -3 H (1 + w_i) rho_i              (continuity, per component)
// We integrate the time-time equation plus continuity only. The independent acceleration (space-space)
// equation a''/a = -(1/2)(rho + 3p) then holds along the trajectory because the nonlinear Bianchi
// identity ties the over-determined system together, so a(t) emerges rather than being plugged in.

export type FluidComponent = { rho: number; w: number }

function hubble(rhos: number[]): number {
  let tot = 0

  for (const r of rhos) {
    tot += r
  }

  return Math.sqrt(Math.max(0, tot))
}

// One RK4 step of [a, rho_0, rho_1, ...]. Returns the new scale factor and component densities.
export function friedmannStep(input: {
  a: number
  rhos: number[]
  comps: FluidComponent[]
  dt: number
}): { a: number; rhos: number[] } {
  const { a, rhos, comps, dt } = input

  const deriv = (rs: number[]): { da: number; dr: number[] } => {
    const h = hubble(rs)

    return {
      da: a * h,
      dr: rs.map((r, i) => -3 * h * (1 + (comps[i]?.w ?? 0)) * r),
    }
  }

  const k1 = deriv(rhos)
  const k2 = deriv(rhos.map((r, i) => r + 0.5 * dt * (k1.dr[i] ?? 0)))
  const k3 = deriv(rhos.map((r, i) => r + 0.5 * dt * (k2.dr[i] ?? 0)))
  const k4 = deriv(rhos.map((r, i) => r + dt * (k3.dr[i] ?? 0)))

  return {
    a: a + (dt / 6) * (k1.da + 2 * k2.da + 2 * k3.da + k4.da),
    rhos: rhos.map(
      (r, i) =>
        r +
        (dt / 6) *
          ((k1.dr[i] ?? 0) +
            2 * (k2.dr[i] ?? 0) +
            2 * (k3.dr[i] ?? 0) +
            (k4.dr[i] ?? 0)),
    ),
  }
}

// Integrate the Friedmann + continuity system from t0 to tMax, returning the time series of the scale
// factor and the total density and pressure (the latter two for checking the acceleration equation).
export function integrateFriedmann(input: {
  comps: FluidComponent[]
  a0: number
  t0: number
  tMax: number
  dt: number
}): { t: number[]; a: number[]; rho: number[]; p: number[] } {
  const t: number[] = []
  const a: number[] = []
  const rhoTot: number[] = []
  const pTot: number[] = []

  let av = input.a0
  let rhos = input.comps.map(c => c.rho)
  let time = input.t0

  while (time <= input.tMax) {
    let rt = 0
    let pt = 0

    rhos.forEach((r, i) => {
      rt += r
      pt += (input.comps[i]?.w ?? 0) * r
    })
    t.push(time)
    a.push(av)
    rhoTot.push(rt)
    pTot.push(pt)

    const next = friedmannStep({
      a: av,
      rhos,
      comps: input.comps,
      dt: input.dt,
    })

    av = next.a
    rhos = next.rhos
    time += input.dt
  }

  return { t, a, rho: rhoTot, p: pTot }
}

// Deceleration parameter q = -a'' a / a'^2 at index i of a sampled scale factor a(t), with the
// derivatives taken by central differences at uniform step dt. q > 0 is decelerating expansion,
// q < 0 accelerating.
export function decelerationParameter(input: {
  a: readonly number[]
  index: number
  dt: number
}): number {
  const { a, index: i, dt } = input
  const aPrev = a[i - 1] ?? 0
  const aCur = a[i] ?? 1
  const aNext = a[i + 1] ?? 0
  const adot = (aNext - aPrev) / (2 * dt)
  const addot = (aNext - 2 * aCur + aPrev) / (dt * dt)

  return (-addot * aCur) / Math.max(1e-12, adot * adot)
}
