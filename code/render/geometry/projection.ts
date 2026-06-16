// The projection MODEL system, one master representation, many views. The hyperboloid (Minkowski) model is the
// truth, a point of hyperbolic space is a point on the upper sheet of the hyperboloid in Lorentzian space.
// EVERY familiar picture (the Poincare disk, the Klein disk, the upper half-plane, the band, the Gans plane) is
// just a different map OFF that hyperboloid. So we keep one Scene and render it in any model by choosing the
// map, exactly like HyperRogue's applymodel. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md
// and the Hyperbolic-Honeycombs notes.
//
// Our Scene stores Poincare-ball coordinates (the neutral, bounded form). applyModel lifts a ball point to the
// hyperboloid and projects it back down under the chosen model, so the master representation really is the
// hyperboloid, the ball is just where the geometry/isometry math is most convenient.

import type { Vec } from '@/code/render/scene'

export type ProjectionModel =
  | 'poincare' // the conformal disk, angles true, the boundary is a circle (the default)
  | 'klein' // the Beltrami-Klein disk, geodesics are straight chords, angles distorted
  | 'gans' // orthographic projection of the hyperboloid, the whole plane, geodesics are hyperbola-like
  | 'half-plane' // the upper half-plane (2D), a Cayley transform of the disk, conformal
  | 'band' // the conformal band/strip (2D), the hyperbolic Mercator, a horocyclic flow runs straight
  | 'azimuthal-equidistant' // distances FROM the center are true, geodesics through the center are straight
  | 'equal-area' // the Lambert azimuthal, area is true (a region's painted area matches its hyperbolic area)
  | 'inverted' // the disk turned inside out, the boundary maps to the center, the center to infinity

// lift a Poincare-ball point to the hyperboloid (the master model), x[0] timelike, x[1..] spacelike
export function liftToHyperboloid(ball: Vec): Vec {
  let r2 = 0
  for (const c of ball) r2 += c * c
  const denom = (1 - r2) || 1e-12
  const x: Vec = [(1 + r2) / denom]
  for (const c of ball) x.push((2 * c) / denom)
  return x
}

// project a Poincare-ball point to plane coordinates under a model. Dimension-general for poincare / klein /
// gans (they act coordinate-wise off the hyperboloid). half-plane and band are 2D maps (they use the complex
// structure of the disk) and fall back to poincare in higher dimensions.
export function applyModel(ball: Vec, model: ProjectionModel): Vec {
  let r2 = 0
  for (const c of ball) r2 += c * c
  switch (model) {
    case 'poincare':
      return ball.slice()
    case 'klein': {
      const s = 2 / (1 + r2) // x_i / x_0 on the hyperboloid = gnomonic projection from the origin
      return ball.map((c) => c * s)
    }
    case 'gans': {
      const s = 2 / ((1 - r2) || 1e-12) // the spacelike hyperboloid coordinates themselves, dropped flat
      return ball.map((c) => c * s)
    }
    case 'half-plane':
      return ball.length === 2 ? halfPlane(ball) : ball.slice()
    case 'band':
      return ball.length === 2 ? band(ball) : ball.slice()
    case 'azimuthal-equidistant': {
      // plot at radius = the true hyperbolic distance d = 2 atanh(r), direction preserved
      const r = Math.sqrt(r2)
      if (r < 1e-9) return ball.slice()
      const d = 2 * Math.atanh(Math.min(0.999999, r))
      const s = d / r
      return ball.map((c) => c * s)
    }
    case 'equal-area': {
      // the Lambert azimuthal radius 2 sinh(d/2) = 2 r / sqrt(1 - r^2), preserving area
      const s = 2 / Math.sqrt((1 - r2) || 1e-12)
      return ball.map((c) => c * s)
    }
    case 'inverted': {
      // turn the disk inside out, p -> p / |p|^2, so the boundary collapses to the center
      if (r2 < 1e-9) return ball.map(() => 0)
      return ball.map((c) => c / r2)
    }
  }
}

// is the model bounded by the unit disk (a fixed circular frame) or unbounded (needs fit-to-content)?
export function modelIsBounded(model: ProjectionModel): boolean {
  return model === 'poincare' || model === 'klein'
}

// the upper half-plane, the Cayley transform w = i (1 + z) / (1 - z) of the disk point z = x + i y. The disk
// center maps to i, the boundary to the real axis, conformally.
function halfPlane(ball: Vec): Vec {
  const x = ball[0] ?? 0
  const y = ball[1] ?? 0
  const r2 = x * x + y * y
  const denom = ((1 - x) * (1 - x) + y * y) || 1e-12
  // (1 + z)/(1 - z) = ((1 - r2) + i 2y) / denom, then multiply by i to send the disk to the upper half-plane
  return [(-2 * y) / denom, (1 - r2) / denom]
}

// the conformal band, w = (2/pi) ln((1 + z)/(1 - z)), mapping the disk to the horizontal strip |Im| < 1. The
// hyperbolic analogue of the Mercator projection.
function band(ball: Vec): Vec {
  const x = ball[0] ?? 0
  const y = ball[1] ?? 0
  const denom = ((1 - x) * (1 - x) + y * y) || 1e-12
  const qx = (1 - x * x - y * y) / denom // real part of (1+z)/(1-z)
  const qy = (2 * y) / denom // imaginary part
  const magnitude = Math.sqrt(qx * qx + qy * qy) || 1e-12
  const k = 2 / Math.PI
  return [k * Math.log(magnitude), k * Math.atan2(qy, qx)]
}
