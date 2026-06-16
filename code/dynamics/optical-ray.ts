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

  const index = (px: number, py: number): number => 1 + k / Math.sqrt(px * px + py * py + soft * soft)
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
    if (x > halfWidth) break
  }
  return Math.atan2(ty, tx)
}
