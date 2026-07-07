// The curvature of a slice, read from discrete ball growth. Our three-dimensional physical space is
// a horospherical slice of the four-dimensional hyperbolic bulk, and a horosphere of hyperbolic
// space is exactly flat Euclidean space, while a geodesic slice through the same point stays
// hyperbolic. The signature is ball growth: on a flat slice the number of cells within radius r
// grows polynomially as r cubed (zero curvature), while on the geodesic bulk it grows exponentially
// in r (negative curvature). Counting balls on the actual cubic lattice (the flat horosphere) and
// the branching bulk tree (the geodesic slice) reads the curvature of each directly.

// The number of cells within graph radius r of the origin on the three-dimensional cubic lattice
// (the flat horosphere): the L1 ball, which grows as the cube of r.
export function cubicBallCount(radius: number): number {
  let count = 0

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      for (let z = -radius; z <= radius; z++) {
        if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= radius) {
          count++
        }
      }
    }
  }

  return count
}

// The number of cells within radius r of the root on a balanced tree of branching b (the geodesic
// bulk slice): 1 + b + b^2 + ... + b^r, which grows exponentially in r.
export function treeBallCount(input: {
  branching: number
  radius: number
}): number {
  const { branching, radius } = input

  let count = 1
  let level = 1

  for (let r = 1; r <= radius; r++) {
    level *= branching
    count += level
  }

  return count
}

// The polynomial growth exponent (the log-log slope of ball count against radius). Near three for
// the flat cubic horosphere; large and rising for the exponential bulk (no fixed polynomial
// degree).
export function polynomialExponent(input: {
  countSmall: number
  countLarge: number
  radiusSmall: number
  radiusLarge: number
}): number {
  const { countSmall, countLarge, radiusSmall, radiusLarge } = input

  return (
    (Math.log(countLarge) - Math.log(countSmall)) /
    (Math.log(radiusLarge) - Math.log(radiusSmall))
  )
}

// The exponential growth rate (the log-linear slope of ball count against radius). Near log(b) for
// the exponential bulk; near zero for the flat horosphere (polynomial, not exponential).
export function exponentialRate(input: {
  countSmall: number
  countLarge: number
  radiusSmall: number
  radiusLarge: number
}): number {
  const { countSmall, countLarge, radiusSmall, radiusLarge } = input

  return (
    (Math.log(countLarge) - Math.log(countSmall)) /
    (radiusLarge - radiusSmall)
  )
}
