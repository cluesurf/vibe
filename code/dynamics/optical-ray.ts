// Gravity as time dilation, the optical metric. A mass that slows the local clock rate (the beat or growth rate)
// is, for a passing ray, a region of higher refractive index, since a slower clock means more proper path per
// step. A ray bends TOWARD higher index (Fermat's principle), so it bends toward the mass, the gravitational
// deflection. This is the optical-mechanical analogy, gravity read as a varying clock rate rather than a force.
// The clock-rate well is n(r) = 1 + strength / sqrt(r^2 + soft^2), the refractive index, whose gradient is the
// gravitational pull. A ray is traced by the eikonal equation, the tangent turns toward the transverse gradient of
// n, dT/ds = (grad n - (grad n . T) T) / n. A UNIFORM rate field (constant n) has no gradient and bends nothing,
// the wake's uniform growth is no local force.

// The deflection angle (radians) of a ray that enters traveling along +x at transverse offset `impactParameter`,
// passing a clock-rate well of depth `strength` (softened by `soft`) centered at the origin. The ray is integrated
// from x = -halfWidth to x = +halfWidth. A NEGATIVE deflection (for a positive impact parameter) means the ray
// bent toward the mass, the attractive gravitational deflection. In the weak field the deflection is 2 * strength
// / impactParameter, the 1/b lensing law.
export function refractiveDeflection(input: {
  impactParameter: number
  strength: number
  soft?: number
  halfWidth?: number
  step?: number
}): number {
  const soft = input.soft ?? 0.5
  const halfWidth = input.halfWidth ?? 200
  const ds = input.step ?? 0.01
  const k = input.strength

  let x = -halfWidth
  let y = input.impactParameter
  let tx = 1
  let ty = 0

  const index = (px: number, py: number): number =>
    1 + k / Math.sqrt(px * px + py * py + soft * soft)

  const gradient = (px: number, py: number): [number, number] => {
    const r2 = px * px + py * py + soft * soft
    const f = -k / (r2 * Math.sqrt(r2))

    return [f * px, f * py]
  }

  const maxSteps = Math.ceil((2 * halfWidth) / ds) + 10

  for (let s = 0; s < maxSteps; s++) {
    const n = index(x, y)
    const [gx, gy] = gradient(x, y)
    const gdotT = gx * tx + gy * ty

    tx += ((gx - gdotT * tx) / n) * ds
    ty += ((gy - gdotT * ty) / n) * ds

    const norm = Math.hypot(tx, ty)

    tx /= norm
    ty /= norm
    x += tx * ds
    y += ty * ds

    if (x > halfWidth) {
      break
    }
  }

  return Math.atan2(ty, tx)
}

// A ray crossing a planar clock-rate boundary. The index profile is a smoothed step along x,
// n(x) = nearIndex + (farIndex - nearIndex) * (1 + tanh(x / width)) / 2, uniform in y, so the only
// gradient is along the boundary normal. The ray enters at angle `incidence` (radians from the +x
// normal) in the near medium and is traced by the same eikonal law as refractiveDeflection. Returned
// is the outgoing travel angle from the normal, and whether the ray crossed at all (beyond the
// critical angle, going from slow clock to fast, the gradient turns the ray back, total internal
// reflection).
export function boundaryRefraction(input: {
  nearIndex: number
  farIndex: number
  incidence: number
  width?: number
  halfWidth?: number
  step?: number
}): { crossed: boolean; outgoing: number } {
  const { nearIndex, farIndex, incidence } = input
  const width = input.width ?? 2
  const halfWidth = input.halfWidth ?? 60
  const ds = input.step ?? 0.005

  const index = (px: number): number =>
    nearIndex + ((farIndex - nearIndex) * (1 + Math.tanh(px / width))) / 2

  const slope = (px: number): number => {
    const c = Math.cosh(px / width)

    return (farIndex - nearIndex) / (2 * width * c * c)
  }

  let x = -halfWidth
  let tx = Math.cos(incidence)
  let ty = Math.sin(incidence)

  // near the critical angle the crossing ray grazes nearly parallel to the boundary, so the path
  // budget must be generous or a slow crosser is miscounted as reflected
  const maxSteps = Math.ceil((80 * halfWidth) / ds)

  for (let s = 0; s < maxSteps; s++) {
    const n = index(x)
    const gx = slope(x)
    const gdotT = gx * tx

    tx += ((gx - gdotT * tx) / n) * ds
    ty += ((0 - gdotT * ty) / n) * ds

    const norm = Math.hypot(tx, ty)

    tx /= norm
    ty /= norm
    x += tx * ds

    if (x > halfWidth || x < -3 * halfWidth) {
      break
    }
  }

  return { crossed: x > halfWidth, outgoing: Math.atan2(ty, tx) }
}

// The rotating well, the frame-dragging analog. The clock-rate well n(r) now ROTATES: the medium
// moves azimuthally with speed spin * r inside the core radius and spin * core^2 / r outside (the
// rigid core with the irrotational tail, the analog of a spinning mass's exterior). A ray in a
// moving medium is carried by the flow with the Fresnel drag coefficient (1 - 1/n^2), the
// first-order velocity addition, so a prograde ray and a retrograde ray at the same impact
// parameter deflect by different amounts, the Lense-Thirring asymmetry. With spin zero this
// reduces exactly to refractiveDeflection.
export function draggedDeflection(input: {
  impactParameter: number
  strength: number
  spin: number
  core?: number
  soft?: number
  halfWidth?: number
  step?: number
}): number {
  const soft = input.soft ?? 0.5
  const core = input.core ?? 4
  const halfWidth = input.halfWidth ?? 200
  const ds = input.step ?? 0.01
  const k = input.strength
  const spin = input.spin

  let x = -halfWidth
  let y = input.impactParameter
  let tx = 1
  let ty = 0

  const index = (px: number, py: number): number =>
    1 + k / Math.sqrt(px * px + py * py + soft * soft)

  const gradient = (px: number, py: number): [number, number] => {
    const r2 = px * px + py * py + soft * soft
    const f = -k / (r2 * Math.sqrt(r2))

    return [f * px, f * py]
  }

  // the azimuthal flow, rigid inside the core, falling as 1/r outside
  const flow = (px: number, py: number): [number, number] => {
    const r = Math.hypot(px, py)
    const speed = r <= core ? spin * r : (spin * core * core) / r

    if (r === 0) {
      return [0, 0]
    }

    return [(-py / r) * speed, (px / r) * speed]
  }

  const maxSteps = Math.ceil((4 * halfWidth) / ds)

  for (let s = 0; s < maxSteps; s++) {
    const n = index(x, y)
    const [gx, gy] = gradient(x, y)
    const gdotT = gx * tx + gy * ty

    tx += ((gx - gdotT * tx) / n) * ds
    ty += ((gy - gdotT * ty) / n) * ds

    const norm = Math.hypot(tx, ty)

    tx /= norm
    ty /= norm

    // the Fresnel drag: the flow carries the ray with coefficient 1 - 1/n^2
    const [ux, uy] = flow(x, y)
    const drag = 1 - 1 / (n * n)

    x += (tx + drag * ux) * ds
    y += (ty + drag * uy) * ds

    if (x > halfWidth) {
      break
    }
  }

  return Math.atan2(ty, tx)
}
