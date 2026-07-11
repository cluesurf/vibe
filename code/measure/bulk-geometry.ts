// The geometry a walker feels moving through the bulk: the isometry a physical step realizes, how
// fast two "straight ahead" walks diverge, and the curvature read from a walked triangle. All in
// the upper-half-plane model of the hyperbolic plane (curvature minus one), where the flat physical
// slice is a horocycle (a horizontal line) and a physical step along it is a parabolic translation
// z to z + t.

// The upper-half-plane hyperbolic distance between two points.
export function upperHalfPlaneDistance(input: {
  x1: number
  y1: number
  x2: number
  y2: number
}): number {
  const { x1, y1, x2, y2 } = input

  return Math.acosh(
    1 + ((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / (2 * y1 * y2),
  )
}

// A parabolic translation (a physical step along the horocycle): z to z + shift. Returns the moved
// point. This is the exact bulk isometry a physical 3D step realizes.
export function parabolicStep(input: {
  x: number
  y: number
  shift: number
}): { x: number; y: number } {
  return { x: input.x + input.shift, y: input.y }
}

// The transverse separation of two unit-speed geodesics that leave a common point at a small angle
// dtheta, after each has been walked arc length s. In the bulk this is sinh(s) times dtheta (the
// Jacobi field, exponential spreading at rate one, the curvature); on the flat slice it is s times
// dtheta (linear). Returns the exact bulk separation.
export function geodesicSeparation(input: {
  arcLength: number
  angle: number
}): number {
  const { arcLength, angle } = input

  return Math.acosh(
    Math.cosh(arcLength) * Math.cosh(arcLength) -
      Math.sinh(arcLength) * Math.sinh(arcLength) * Math.cos(angle),
  )
}

// The flat-slice separation of the same two straight walks: linear in the arc length.
export function flatSeparation(input: {
  arcLength: number
  angle: number
}): number {
  return 2 * input.arcLength * Math.sin(input.angle / 2)
}

// An interior angle of a hyperbolic triangle from its three side lengths, by the hyperbolic law of
// cosines. `opposite` is the side across from the angle. This is the SIDE-LENGTH route to the
// angle, using only paced distances.
export function angleFromSides(input: {
  opposite: number
  adjacentA: number
  adjacentB: number
}): number {
  const { opposite, adjacentA, adjacentB } = input
  const cosine =
    (Math.cosh(adjacentA) * Math.cosh(adjacentB) -
      Math.cosh(opposite)) /
    (Math.sinh(adjacentA) * Math.sinh(adjacentB))

  return Math.acos(Math.max(-1, Math.min(1, cosine)))
}

// The tangent direction at point p of the geodesic from p toward q in the upper half plane. The
// geodesic is a vertical line (when the x-coordinates match) or a semicircle centered on the real
// axis; the tangent is perpendicular to the radius from that center, oriented toward q.
function geodesicTangent(input: {
  px: number
  py: number
  qx: number
  qy: number
}): { dx: number; dy: number } {
  const { px, py, qx, qy } = input

  if (Math.abs(px - qx) < 1e-12) {
    // vertical geodesic: tangent points up or down toward q
    return { dx: 0, dy: qy > py ? 1 : -1 }
  }

  // centre of the semicircle on the real axis
  const centre =
    (px * px + py * py - (qx * qx + qy * qy)) / (2 * (px - qx))

  const radiusX = px - centre
  const radiusY = py

  // the two perpendiculars to the radius; choose the one pointing toward q along the arc
  const optionX = -radiusY
  const optionY = radiusX
  const towardQ = (qx - px) * optionX + (qy - py) * optionY

  const sign = towardQ >= 0 ? 1 : -1
  const magnitude = Math.hypot(optionX, optionY)

  return {
    dx: (sign * optionX) / magnitude,
    dy: (sign * optionY) / magnitude,
  }
}

// The interior angle at vertex p of the triangle p, q, r, measured from the geodesic tangent
// directions at p (the angle a walker turns through). Because the upper half plane is conformal
// this Euclidean angle between tangents IS the hyperbolic angle, an INDEPENDENT route to the angle
// from the side-length law of cosines.
export function angleFromTangents(input: {
  px: number
  py: number
  qx: number
  qy: number
  rx: number
  ry: number
}): number {
  const { px, py, qx, qy, rx, ry } = input
  const toQ = geodesicTangent({ px, py, qx, qy })
  const toR = geodesicTangent({ px, py, qx: rx, qy: ry })
  const dot = toQ.dx * toR.dx + toQ.dy * toR.dy

  return Math.acos(Math.max(-1, Math.min(1, dot)))
}

// The angle deficit of an equilateral hyperbolic triangle of the given side length from the LAW OF
// COSINES (side lengths only): pi minus the sum of its three interior angles. By Gauss-Bonnet at
// curvature minus one this equals the triangle area.
export function triangleDeficit(sideLength: number): number {
  const angle = angleFromSides({
    opposite: sideLength,
    adjacentA: sideLength,
    adjacentB: sideLength,
  })

  return Math.PI - 3 * angle
}

// The holonomy of a closed geodesic circle of radius r: parallel-transporting a vector once around
// it rotates the vector by an angle equal to the enclosed area, so walking a loop returns you with
// a rotated frame, not the identity. Computed from the geodesic curvature (coth r) times the
// circumference (2 pi sinh r), minus the 2 pi of a flat turn, by Gauss-Bonnet. This equals the area
// 2 pi (cosh r - 1), which the companion integration confirms independently.
export function circleHolonomy(radius: number): number {
  const geodesicCurvature = 1 / Math.tanh(radius)
  const circumference = 2 * Math.PI * Math.sinh(radius)

  return geodesicCurvature * circumference - 2 * Math.PI
}

// The area enclosed by a geodesic circle of radius r, by direct numerical integration of the area
// element sinh(rho) d rho d phi over the disk. An independent route to compare against the holonomy.
export function circleAreaIntegrated(input: {
  radius: number
  steps: number
}): number {
  const { radius, steps } = input

  let radial = 0

  for (let i = 0; i < steps; i++) {
    const rho = ((i + 0.5) / steps) * radius

    radial += Math.sinh(rho) * (radius / steps)
  }

  return 2 * Math.PI * radial
}

// The frame angle after walking the same loop `repetitions` times: the holonomy accumulates, so the
// angle is repetitions times the single-loop holonomy, taken modulo a full turn (the frame lives on
// a circle). Repetition precesses the frame, and it returns to the start only when the accumulated
// angle is a whole number of turns.
export function accumulatedFrameAngle(input: {
  holonomy: number
  repetitions: number
}): number {
  const total = input.holonomy * input.repetitions
  const twoPi = 2 * Math.PI
  const wrapped = ((total % twoPi) + twoPi) % twoPi

  return wrapped
}
