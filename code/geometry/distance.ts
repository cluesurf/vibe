// The one hyperbolic distance, in its two equivalent forms. Every builder and
// every measure that needs a hyperbolic distance calls these, so the formula is
// defined once. The forms agree, they are the same metric written in different
// coordinates.
//
//   Poincare disk or ball:  cosh(d) = 1 + 2 |u - v|^2 / ((1 - |u|^2)(1 - |v|^2))
//   Polar (native radius):  cosh(d) = cosh(r1) cosh(r2) - sinh(r1) sinh(r2) cos(theta1 - theta2)
//
// The hot graph builders precompute the per-point terms (1 - |x|^2, or cosh and
// sinh of the radius) and call the *Pre variants below, so the shared formula
// costs nothing over the old inline expressions.

function squaredNorm(point: number[]): number {
  let sum = 0
  for (let index = 0; index < point.length; index++) {
    const value = point[index] ?? 0
    sum += value * value
  }
  return sum
}

function squaredDistance(left: number[], right: number[]): number {
  let sum = 0
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index++) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0)
    sum += difference * difference
  }
  return sum
}

// cosh of the hyperbolic distance between two Poincare disk or ball points, from
// the precomputed pieces. `differenceSquared` is |u - v|^2, and `oneMinusLeft`
// and `oneMinusRight` are (1 - |u|^2) and (1 - |v|^2).
export function poincareCoshFromParts(
  differenceSquared: number,
  oneMinusLeft: number,
  oneMinusRight: number,
): number {
  return 1 + (2 * differenceSquared) / (oneMinusLeft * oneMinusRight)
}

// cosh of the hyperbolic distance between two Poincare disk or ball points.
export function poincareCosh(left: number[], right: number[]): number {
  return poincareCoshFromParts(
    squaredDistance(left, right),
    1 - squaredNorm(left),
    1 - squaredNorm(right),
  )
}

// The hyperbolic distance between two Poincare disk or ball points.
export function poincareDistance(left: number[], right: number[]): number {
  return Math.acosh(poincareCosh(left, right))
}

// cosh of the hyperbolic distance from native polar coordinates, with the radius
// terms precomputed. `coshLeft`/`sinhLeft` are cosh(r1)/sinh(r1), and
// `angleBetween` is theta1 - theta2.
export function polarCoshFromParts(
  coshLeft: number,
  sinhLeft: number,
  coshRight: number,
  sinhRight: number,
  angleBetween: number,
): number {
  return coshLeft * coshRight - sinhLeft * sinhRight * Math.cos(angleBetween)
}
