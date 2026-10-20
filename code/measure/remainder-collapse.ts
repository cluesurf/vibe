// A CONTINUUM-LIMIT COLLAPSE OF THE REGISTER PAIR'S REMAINDER (E-MTR-0028).
//
// The remainder r = R_full - R_reference of a bound pair is read at several member masses m and Bohr radii a_B. The
// continuum limit holds the pair's own physics fixed, X = m a_B (its internal speed is 1 / (mu a_B), so X fixes it),
// while the lattice spacing falls against both lengths, m -> 0 and a_B -> infinity. The collapse form is
//
//   r(m, a_B) = C + B (tan m / m - 1) / a_B
//
// the member's lattice inertia excess over Dirac's (tan m / m - 1, about m^2 / 3) times the inverse Bohr radius. At
// fixed X the second term is about X^2 / (3 a_B^3), so it vanishes in the limit and C is the continuum remainder.
//
// fitRemainderCollapse is an ordinary least-squares fit of C and B (code/measure/regression weightedLeastSquares with
// unit weights), its parameter errors scaled by the residual variance over the degrees of freedom, so a fit with one
// spare point reports its own scatter. predictRemainder evaluates the fitted form.

import { weightedLeastSquares } from '@/code/measure/regression'

export type CollapsePoint = { m: number; aB: number; remainder: number }

export type CollapseFit = {
  continuum: number
  slope: number
  continuumError: number
  slopeError: number
  rms: number
  freedom: number
}

// the member's lattice inertia excess over the inverse Bohr radius, the collapse form's lattice term
export function memberArtifact(input: { m: number; aB: number }): number {
  return (Math.tan(input.m) / input.m - 1) / input.aB
}

export function fitRemainderCollapse(
  points: readonly CollapsePoint[],
): CollapseFit {
  const rows = points.map(p => [1, memberArtifact(p)])
  const ys = points.map(p => p.remainder)
  const fit = weightedLeastSquares({
    rows,
    ys,
    errors: points.map(() => 1),
  })
  const freedom = points.length - 2
  const scale = freedom > 0 ? Math.sqrt(fit.chi2 / freedom) : Number.NaN

  return {
    continuum: fit.coefficients[0] ?? Number.NaN,
    slope: fit.coefficients[1] ?? Number.NaN,
    continuumError: (fit.errors[0] ?? Number.NaN) * scale,
    slopeError: (fit.errors[1] ?? Number.NaN) * scale,
    rms: Math.sqrt(fit.chi2 / points.length),
    freedom,
  }
}

export function predictRemainder(
  fit: CollapseFit,
  input: { m: number; aB: number },
): number {
  return fit.continuum + fit.slope * memberArtifact(input)
}
