// Hyperbolic graphs: hyperbolic (so exponential reach) and Lorentz-safe (so no
// preferred frame). Two builders share the same connect-and-embed step:
//   hyperbolicGraph     random sprinkle (the original both-worlds candidate, P3)
//   hyperbolicSunflower deterministic golden-angle placement (the non-random version)
// Both sprinkle the hyperbolic disc by the hyperbolic area measure, then connect by
// hyperbolic proximity. See note/deterministic-substrate.md.

import { Rng } from '@/code/tool/rng'
import { Embedding, ManifoldSpec } from '@/code/tool/embedding'
import { polarCoshFromParts } from '@/code/geometry/distance'
import { Graph, makeGraph } from '@/code/tool/graph'

// Connect points (given radial r and angular theta) by hyperbolic proximity, embed in
// the Poincare disc, and return the graph. Shared by both builders.
function connectAndEmbed(input: {
  r: Float64Array
  theta: Float64Array
  connectThreshold: number
}): Graph {
  const n = input.r.length
  const { r, theta } = input

  // Connect by hyperbolic proximity using the hyperbolic law of cosines:
  // cosh(d) = cosh(r1) cosh(r2) - sinh(r1) sinh(r2) cos(theta1 - theta2).
  const coshThreshold = Math.cosh(input.connectThreshold)
  const neighbors: number[][] = []

  for (let i = 0; i < n; i++) neighbors.push([])

  const coshR = new Float64Array(n)
  const sinhR = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    coshR[i] = Math.cosh(r[i] ?? 0)
    sinhR[i] = Math.sinh(r[i] ?? 0)
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dTheta = (theta[i] ?? 0) - (theta[j] ?? 0)
      const coshD = polarCoshFromParts(
        coshR[i] ?? 0,
        sinhR[i] ?? 0,
        coshR[j] ?? 0,
        sinhR[j] ?? 0,
        dTheta,
      )

      if (coshD < coshThreshold) {
        neighbors[i]?.push(j)
        neighbors[j]?.push(i)
      }
    }
  }

  // Poincare-disc embedding: x = tanh(r/2) cos(theta), y = tanh(r/2) sin(theta).
  const dimension = 2
  const coords = new Float64Array(n * dimension)

  for (let i = 0; i < n; i++) {
    const rho = Math.tanh((r[i] ?? 0) / 2)

    coords[i * dimension] = rho * Math.cos(theta[i] ?? 0)
    coords[i * dimension + 1] = rho * Math.sin(theta[i] ?? 0)
  }

  const manifold: ManifoldSpec = {
    form: 'hyperbolic',
    dimension: 2,
    curvature: -1,
  }

  const embedding: Embedding = {
    form: 'embedding',
    dimension,
    signature: 'riemannian',
    coords,
    manifold,
  }

  return makeGraph({ size: n, directed: false, neighbors, embedding })
}

// The radial inverse-CDF of the hyperbolic area measure (density proportional to
// sinh(r) on [0, R]): r = arccosh(1 + u (cosh R - 1)) for u in [0, 1].
function radiusFromHeight(u: number, coshRminus1: number): number {
  return Math.acosh(1 + u * coshRminus1)
}

export function hyperbolicGraph(input: {
  count: number
  radius: number
  connectThreshold: number
  rng: Rng
}): Graph {
  const n = input.count
  const coshRminus1 = Math.cosh(input.radius) - 1
  const r = new Float64Array(n)
  const theta = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    r[i] = radiusFromHeight(input.rng.next(), coshRminus1)
    theta[i] = input.rng.next() * 2 * Math.PI
  }

  return connectAndEmbed({
    r,
    theta,
    connectThreshold: input.connectThreshold,
  })
}

// The van der Corput radical inverse of i in a base, a deterministic low-discrepancy
// fraction in [0, 1). Used to build the Halton point set.
function radicalInverse(i: number, base: number): number {
  let f = 1
  let r = 0
  let n = i

  while (n > 0) {
    f /= base
    r += f * (n % base)
    n = Math.floor(n / base)
  }

  return r
}

// A second working non-random substrate: the Halton(2, 3) sequence mapped onto the disc.
// The base-2 radical inverse drives the area inverse-CDF for the radius, the base-3 one
// the angle. Deterministic, low-discrepancy, aperiodic, isotropic, like the sunflower
// but from a different deterministic generator.
export function hyperbolicHalton(input: {
  count: number
  radius: number
  connectThreshold: number
}): Graph {
  const n = input.count
  const coshRminus1 = Math.cosh(input.radius) - 1
  const r = new Float64Array(n)
  const theta = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    r[i] = radiusFromHeight(radicalInverse(i + 1, 2), coshRminus1)
    theta[i] = 2 * Math.PI * radicalInverse(i + 1, 3)
  }

  return connectAndEmbed({
    r,
    theta,
    connectThreshold: input.connectThreshold,
  })
}

// Reflect a set of Poincare-disc points across the geodesic through p1 and p2. In the
// Poincare model a geodesic through two interior points is the circular arc orthogonal
// to the unit circle, and hyperbolic reflection across it is inversion in that circle.
function reflectAcross(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  pts: { x: number; y: number }[],
): { x: number; y: number }[] {
  // Orthogonal circle (center c, radius^2 rho2): 2 p_i . c = |p_i|^2 + 1.
  const a1 = 2 * p1.x
  const b1 = 2 * p1.y
  const d1 = p1.x * p1.x + p1.y * p1.y + 1
  const a2 = 2 * p2.x
  const b2 = 2 * p2.y
  const d2 = p2.x * p2.x + p2.y * p2.y + 1
  const det = a1 * b2 - a2 * b1

  if (Math.abs(det) < 1e-12) {
    // The geodesic is a diameter (a straight line through the origin). Reflect across
    // the line through the origin in the direction of p1.
    const phi = Math.atan2(p1.y, p1.x)
    const c2 = Math.cos(2 * phi)
    const s2 = Math.sin(2 * phi)

    return pts.map(z => ({
      x: c2 * z.x + s2 * z.y,
      y: s2 * z.x - c2 * z.y,
    }))
  }

  const cx = (d1 * b2 - d2 * b1) / det
  const cy = (a1 * d2 - a2 * d1) / det
  const rho2 = cx * cx + cy * cy - 1

  return pts.map(z => {
    const dx = z.x - cx
    const dy = z.y - cy
    const s = rho2 / (dx * dx + dy * dy)

    return { x: cx + s * dx, y: cy + s * dy }
  })
}

// A regular {p, q} hyperbolic tessellation (p-gons, q around each vertex), the Schlafli
// tilings of Margenstern's work (for example {5,4} or {7,3}). Built deterministically by
// reflecting the central polygon across its edges, breadth-first, to a given depth. Note
// this is a REGULAR tiling: it keeps a discrete rotational symmetry, so it is a useful
// comparison for whether regularity costs Lorentz invariance.
export function hyperbolicTiling(input: {
  p: number
  q: number
  depth: number
  connectThreshold: number
  maxVertices?: number
}): Graph {
  const { p, q } = input
  // Central polygon circumradius: cosh(R_c) = cos(pi/q) / sin(pi/p), then Euclidean
  // Poincare radius r0 = tanh(R_c / 2).
  const coshRc = Math.cos(Math.PI / q) / Math.sin(Math.PI / p)
  const r0 = Math.tanh(Math.acosh(coshRc) / 2)
  const central: { x: number; y: number }[] = []

  for (let k = 0; k < p; k++) {
    const ang = (2 * Math.PI * k) / p

    central.push({ x: r0 * Math.cos(ang), y: r0 * Math.sin(ang) })
  }

  const key = (x: number, y: number): string =>
    `${Math.round(x * 1e5)},${Math.round(y * 1e5)}`

  const vertexKeys = new Set<string>()
  const vx: number[] = []
  const vy: number[] = []

  const addVertex = (z: { x: number; y: number }): void => {
    const k = key(z.x, z.y)

    if (!vertexKeys.has(k)) {
      vertexKeys.add(k)
      vx.push(z.x)
      vy.push(z.y)
    }
  }

  central.forEach(addVertex)

  const seenPoly = new Set<string>()

  const polyKey = (poly: { x: number; y: number }[]): string => {
    let cx = 0
    let cy = 0

    for (const z of poly) {
      cx += z.x
      cy += z.y
    }

    return key(cx / poly.length, cy / poly.length)
  }

  seenPoly.add(polyKey(central))

  const cap = input.maxVertices ?? 4000

  let frontier: { x: number; y: number }[][] = [central]

  for (let d = 0; d < input.depth && vx.length < cap; d++) {
    const next: { x: number; y: number }[][] = []

    for (const poly of frontier) {
      if (vx.length >= cap) break

      for (let i = 0; i < poly.length; i++) {
        const a = poly[i]!
        const b = poly[(i + 1) % poly.length]!
        const reflected = reflectAcross(a, b, poly)
        const pk = polyKey(reflected)

        if (!seenPoly.has(pk)) {
          seenPoly.add(pk)
          reflected.forEach(addVertex)
          next.push(reflected)
        }
      }
    }

    frontier = next
  }

  // Convert Poincare-disc coordinates to (hyperbolic radius, angle) for the shared
  // connect-and-embed step. Hyperbolic radius from Euclidean: r = 2 atanh(|z|).
  const n = vx.length
  const r = new Float64Array(n)
  const theta = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    const mag = Math.min(0.999999, Math.hypot(vx[i] ?? 0, vy[i] ?? 0))

    r[i] = 2 * Math.atanh(mag)
    theta[i] = Math.atan2(vy[i] ?? 0, vx[i] ?? 0)
  }

  return connectAndEmbed({
    r,
    theta,
    connectThreshold: input.connectThreshold,
  })
}

// The deterministic, non-arbitrary version. The radius uses stratified heights
// u_i = (i + 1/2)/n through the same area inverse-CDF (zero randomness, exact
// area-equidistribution). The angle uses the golden angle, theta_i = 2*pi*frac(i*phi),
// the lowest-discrepancy aperiodic placement, so no spokes and no lattice. No rng.
export function hyperbolicSunflower(input: {
  count: number
  radius: number
  connectThreshold: number
}): Graph {
  const n = input.count
  const coshRminus1 = Math.cosh(input.radius) - 1
  // Golden ratio conjugate, the most irrational rotation number.
  const phiInv = (Math.sqrt(5) - 1) / 2
  const r = new Float64Array(n)
  const theta = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n

    r[i] = radiusFromHeight(u, coshRminus1)

    const frac = (i * phiInv) % 1

    theta[i] = 2 * Math.PI * frac
  }

  return connectAndEmbed({
    r,
    theta,
    connectThreshold: input.connectThreshold,
  })
}
