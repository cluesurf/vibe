// Mobius transformations of the Poincare ball, the isometries of hyperbolic
// space. The ball isometry taking the origin to a point a is the hyperbolic
// translation (the analog of a Lorentz boost). Restricted to the boundary
// sphere it is a conformal map, which is the discrete seed of the celestial
// fact that the isometry group of the space acts conformally on its boundary.
// Coordinates are Poincare-ball points, built on the real-vector kit.

import { type Vec, add, dot, scale, sub } from '@/code/algebra/vector'

// The ball isometry that sends 0 to a (|a| < 1), a hyperbolic translation.
//   T_a(x) = ((1 - |a|^2) x + (|x|^2 + 2 <a,x> + 1) a) / (|a|^2 |x|^2 + 2 <a,x> + 1)
// It maps the closed ball to itself and the boundary sphere to the boundary
// sphere, and away from a rotation it genuinely deforms chordal distances while
// preserving the conformal cross-ratio.
export function ballIsometry(a: Vec): (x: Vec) => Vec {
  const a2 = dot(a, a)

  return (x: Vec): Vec => {
    const x2 = dot(x, x)
    const ax = dot(x, a)
    const denominator = a2 * x2 + 2 * ax + 1
    const numerator = add(scale(x, 1 - a2), scale(a, x2 + 2 * ax + 1))

    return scale(numerator, 1 / denominator)
  }
}

// The conformal factor of the boundary map induced by ballIsometry(a), at a
// boundary point x with |x| = 1. On the boundary the denominator of the
// isometry is |x + a|^2, so the factor is
//   Omega(x) = (1 - |a|^2) / |x + a|^2
// It is the local stretch the boundary conformal map applies, and it satisfies
// the Mobius identity |T x - T y|^2 = Omega(x) Omega(y) |x - y|^2. Computed here
// independently of that identity, so a test of the identity is not circular.
export function ballBoundaryConformalFactor(a: Vec, x: Vec): number {
  const a2 = dot(a, a)
  const s = sub(x, scale(a, -1))

  return (1 - a2) / dot(s, s)
}
