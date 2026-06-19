// Hyperbolic isometries and geodesics in the Poincare ball or disk, the layer that ANIMATES a tessellation.
// Everything works directly on ball coordinates (the Scene's coordinate system), dimension-general, so the
// same code glides through a 2D tiling in the disk and a 3D honeycomb in the ball. The math is Mobius
// (gyrovector) addition, the standard model isometry, no hyperboloid lift needed.
//
// A static Scene plus a per-frame isometry equals an animation, transform every point, render, repeat. A
// geodesic glide flies along a line, the infinite zoom dives toward an ideal boundary point (the Escher
// effect), and a rotation spins the disk. The geodesic sampler also gives TRUE curved struts (arcs), since a
// hyperbolic geodesic is a circular arc in this model, not a straight chord.

import type { Scene, SceneEdge, Vec } from '@/code/render/scene'

function dot(a: Vec, b: Vec): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] ?? 0) * (b[i] ?? 0)
  return s
}

function norm(a: Vec): number {
  return Math.sqrt(dot(a, a))
}

function scale(a: Vec, k: number): Vec {
  return a.map(x => x * k)
}

export function negate(a: Vec): Vec {
  return a.map(x => -x)
}

// Mobius (gyrovector) addition a (+) x, the Poincare-ball isometry that moves the origin to a. Maps the ball
// into itself, so the result is always a valid ball point. Dimension-general.
export function mobiusAdd(a: Vec, x: Vec): Vec {
  const ax = dot(a, x)
  const aa = dot(a, a)
  const xx = dot(x, x)
  const denom = 1 + 2 * ax + aa * xx
  const ca = (1 + 2 * ax + xx) / (denom || 1e-12)
  const cx = (1 - aa) / (denom || 1e-12)
  const out: Vec = []
  for (let i = 0; i < x.length; i++)
    out.push(ca * (a[i] ?? 0) + cx * (x[i] ?? 0))
  return out
}

// gyrovector scalar multiplication s (x) v, the point a fraction s of the way along the geodesic from the
// origin toward v (in hyperbolic arc length). s = 0 gives the origin, s = 1 gives v.
export function gyroScale(v: Vec, s: number): Vec {
  const r = norm(v)
  if (r < 1e-12) return v.map(() => 0)
  const factor = Math.tanh(s * Math.atanh(Math.min(0.999999999, r))) / r
  return scale(v, factor)
}

// the hyperbolic distance from the origin to a ball point (so a point at distance d toward a unit direction u
// is gyroScale-free, it is tanh(d / 2) * u)
export function originDistance(p: Vec): number {
  return 2 * Math.atanh(Math.min(0.999999999, norm(p)))
}

// a ball point at hyperbolic distance d from the origin along the unit direction u
export function pointAt(u: Vec, d: number): Vec {
  const r = Math.tanh(d / 2)
  const un = norm(u)
  return un < 1e-12 ? u.map(() => 0) : scale(u, r / un)
}

// sample the geodesic from a to b at segments + 1 points (the true curved path in the model). Used both to
// draw curved struts and to interpolate motion.
export function geodesicPoints(
  a: Vec,
  b: Vec,
  segments: number,
): Vec[] {
  const d = mobiusAdd(negate(a), b)
  const out: Vec[] = []
  for (let k = 0; k <= segments; k++) {
    out.push(mobiusAdd(a, gyroScale(d, k / segments)))
  }
  return out
}

// the camera GLIDE, fly the viewpoint a hyperbolic distance `distance` toward the unit boundary direction
// `direction`. Returns a point transform that brings that-far-along the line to the centre. Growing the
// distance over frames flies forward, and as distance grows large it becomes the infinite zoom into the ideal
// point (the Escher dive).
export function glide(input: {
  direction: Vec
  distance: number
}): (p: Vec) => Vec {
  const a = pointAt(input.direction, input.distance)
  const back = negate(a)
  return (p: Vec) => mobiusAdd(back, p)
}

// a rotation of the disk about the origin by `angle`, in the plane of axes i and j (default the first two,
// the visible plane of a 2D tiling). Leaves other coordinates untouched.
export function rotateAboutOrigin(input: {
  angle: number
  i?: number
  j?: number
}): (p: Vec) => Vec {
  const { angle, i = 0, j = 1 } = input
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return (p: Vec) => {
    const out = p.slice()
    const pi = p[i] ?? 0
    const pj = p[j] ?? 0
    out[i] = c * pi - s * pj
    out[j] = s * pi + c * pj
    return out
  }
}

// apply a point transform to every edge endpoint, returning a new Scene. The animation primitive, one
// transformed Scene per frame.
export function transformScene(
  scene: Scene,
  fn: (p: Vec) => Vec,
): Scene {
  const edges: SceneEdge[] = scene.edges.map(e => ({
    a: fn(e.a),
    b: fn(e.b),
  }))
  return {
    dim: scene.dim,
    symbol: scene.symbol,
    edges,
    cellCount: scene.cellCount,
  }
}
