// Le Sage shadow gravity, the geometry of the mutual shadow. A body bathed in an isotropic flux of fast carriers
// is pushed equally from all sides, no net force. A second body screens the flux it intercepts, casting a shadow,
// so the first body feels a net push TOWARD the second, the deficit equal to the solid angle the second subtends.
// A body of radius a at distance r subtends a solid angle proportional to (a / r) squared, so the shadow force
// falls as 1 / r squared, Newton's law. This is the Le Sage mechanism. The flux must be ISOTROPIC for this, which
// is what a re-isotropizing bath supplies. A DIRECTIONAL (columnar) flux instead casts a shadow of fixed cross
// section, distance-independent, which is the bare lattice-gas negative.

// Deterministic near-uniform directions on the unit sphere, the Fibonacci-sphere construction. No randomness.
export function fibonacciSphereDirections(count: number): number[][] {
  const directions: number[][] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * i + 1) / count
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    directions.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius])
  }
  return directions
}

// The fraction of an isotropic flux from the origin that a body of radius `bodyRadius` at distance `bodyDistance`
// along the x axis intercepts, the body's solid angle over the full sphere. This is the Le Sage shadow deficit, and
// it scales as 1 / bodyDistance squared. The push toward the body is proportional to it.
export function isotropicShadowFraction(input: {
  directions: ReadonlyArray<ReadonlyArray<number>>
  bodyDistance: number
  bodyRadius: number
}): number {
  const r = input.bodyDistance
  const a2 = input.bodyRadius * input.bodyRadius
  let blocked = 0
  for (const u of input.directions) {
    // projection of the body center (r,0,0) onto the ray direction u
    const projection = u[0]! * r
    if (projection <= 0) continue
    // squared perpendicular distance from the body center to the ray
    const px = r - projection * u[0]!
    const py = -projection * u[1]!
    const pz = -projection * u[2]!
    if (px * px + py * py + pz * pz < a2) blocked++
  }
  return blocked / input.directions.length
}

// The fraction of a DIRECTIONAL parallel beam (traveling along x, uniform over a disk of radius `beamRadius` in the
// transverse plane) that a body of radius `bodyRadius` at distance `bodyDistance` intercepts. The body blocks its
// own cross section regardless of distance, so this is distance-INDEPENDENT, the bare columnar shadow. The
// `steps` set the transverse sampling resolution (deterministic grid).
export function directionalShadowFraction(input: {
  bodyRadius: number
  beamRadius: number
  steps?: number
}): number {
  const steps = input.steps ?? 200
  const a2 = input.bodyRadius * input.bodyRadius
  const beam2 = input.beamRadius * input.beamRadius
  let blocked = 0
  let total = 0
  for (let iy = -steps; iy <= steps; iy++) {
    for (let iz = -steps; iz <= steps; iz++) {
      const y = (iy / steps) * input.beamRadius
      const z = (iz / steps) * input.beamRadius
      if (y * y + z * z > beam2) continue
      total++
      if (y * y + z * z < a2) blocked++
    }
  }
  return total === 0 ? 0 : blocked / total
}

// The Le Sage drag, the fatal flaw of pushing gravity. A body moving at velocity `velocity` (in units of the
// carrier speed) through an isotropic flux sees the flux aberrated, more carriers head-on than behind, so it feels
// a net backward force. Each carrier arriving from inward direction d delivers momentum along -d, and the
// interception rate is enhanced by (1 + velocity * d_x) for motion along x. The net longitudinal force is the
// average of -(1 + velocity * d_x) * d_x over the sphere, which is -velocity / 3 (since the mean of d_x is zero and
// the mean of d_x squared is one third). This is FIRST ORDER in velocity, so it cannot be made negligible, it is
// the irreducible drag that rules Le Sage gravity out as a fundamental mechanism. Returns the net longitudinal
// force (negative is drag).
export function leSageDrag(input: {
  directions: ReadonlyArray<ReadonlyArray<number>>
  velocity: number
}): number {
  let force = 0
  for (const d of input.directions) {
    const dx = d[0]!
    force += -(1 + input.velocity * dx) * dx
  }
  return force / input.directions.length
}

// The power-law exponent of a quantity against distance, fit in log-log space.
export function distanceExponent(distances: ReadonlyArray<number>, values: ReadonlyArray<number>): number {
  const xs = distances.map((d) => Math.log(d))
  const ys = values.map((v) => Math.log(v))
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length
  let cov = 0
  let varX = 0
  for (let i = 0; i < xs.length; i++) {
    cov += (xs[i]! - meanX) * (ys[i]! - meanY)
    varX += (xs[i]! - meanX) ** 2
  }
  return cov / varX
}
