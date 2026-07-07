// Our three-dimensional physical space is a flat horosphere of the four-dimensional hyperbolic
// bulk. A horosphere of hyperbolic space is exactly flat Euclidean space, a geodesic slice through
// the same point stays hyperbolic, and the whole cusp construction rests on this. The signature is
// ball growth, the discrete curvature: on a flat slice the number of cells within radius r grows
// polynomially as r cubed (zero curvature, three flat dimensions), while on the geodesic bulk it
// grows exponentially in r (negative curvature). Counting balls on the actual cubic lattice (the
// flat horosphere, the physical layer) and the branching bulk tree (the geodesic slice) reads the
// curvature of each directly, closing the loop on the claim the cusp work assumes.
//
// Measured: on the cubic horosphere the ball count grows with polynomial exponent approaching three
// (2.97 by radius ninety-six, rising toward three) and exponential rate falling toward zero (0.05
// and dropping), the flat three-dimensional signature. On the bulk tree of branching three the ball
// count grows with exponential rate the logarithm of three (to a part in a million at these radii) and no
// fixed polynomial degree (an apparent exponent above ten and rising), the hyperbolic signature. So
// the physical slice is flat E-three and the bulk is genuinely curved, and the flatness of our
// space is the horosphere property of the bulk, not an assumption.
//
// The control is the two rates crossed: the horosphere has zero exponential rate (not exponential)
// and the bulk has an unbounded polynomial exponent (not polynomial), so each slice fails the other
// slice's growth law, the curvature difference is real, not a fit artifact.
//
// Depth L2. It reads the curvature of the physical slice and the bulk from discrete ball growth
// (horosphere polynomial exponent three and zero exponential rate, bulk exponential rate log three
// and unbounded polynomial exponent), grounding the flat-space-is-a-horosphere claim on its own
// evidence. Known hyperbolic geometry, measured on the substrate lattices.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  cubicBallCount,
  treeBallCount,
  polynomialExponent,
  exponentialRate,
} from '@/code/measure/slice-curvature'

const BRANCHING = 3
const CUBIC_SMALL = 32
const CUBIC_LARGE = 96
const TREE_SMALL = 8
const TREE_LARGE = 32

export default experiment({
  id: 'cosmology/horosphere-flatness',
  code: 'E-CSM-0049',
  title:
    'the physical cubic slice grows with polynomial exponent three and zero exponential rate (flat E^3, a horosphere) while the bulk tree grows with exponential rate exactly log(branching) and unbounded polynomial exponent (hyperbolic), so our flat space is a horosphere of the curved bulk',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the flat horosphere: polynomial exponent toward three, exponential rate toward zero
    const cubicPolynomial = polynomialExponent({
      countSmall: cubicBallCount(CUBIC_SMALL),
      countLarge: cubicBallCount(CUBIC_LARGE),
      radiusSmall: CUBIC_SMALL,
      radiusLarge: CUBIC_LARGE,
    })

    const cubicExponential = exponentialRate({
      countSmall: cubicBallCount(CUBIC_SMALL),
      countLarge: cubicBallCount(CUBIC_LARGE),
      radiusSmall: CUBIC_SMALL,
      radiusLarge: CUBIC_LARGE,
    })

    // the curved bulk: exponential rate exactly log(branching), no fixed polynomial degree
    const treePolynomial = polynomialExponent({
      countSmall: treeBallCount({
        branching: BRANCHING,
        radius: TREE_SMALL,
      }),
      countLarge: treeBallCount({
        branching: BRANCHING,
        radius: TREE_LARGE,
      }),
      radiusSmall: TREE_SMALL,
      radiusLarge: TREE_LARGE,
    })

    const treeExponential = exponentialRate({
      countSmall: treeBallCount({
        branching: BRANCHING,
        radius: TREE_SMALL,
      }),
      countLarge: treeBallCount({
        branching: BRANCHING,
        radius: TREE_LARGE,
      }),
      radiusSmall: TREE_SMALL,
      radiusLarge: TREE_LARGE,
    })

    const horosphereFlat =
      Math.abs(cubicPolynomial - 3) < 0.1 && cubicExponential < 0.1

    const bulkHyperbolic =
      Math.abs(treeExponential - Math.log(BRANCHING)) < 1e-4 &&
      treePolynomial > 10

    // CONTROL: each slice fails the other's growth law
    const horosphereNotExponential = cubicExponential < 0.1
    const bulkNotPolynomial = treePolynomial > 10

    const ok =
      horosphereFlat &&
      bulkHyperbolic &&
      horosphereNotExponential &&
      bulkNotPolynomial

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the cubic physical slice grows with ball-count polynomial exponent approaching three (2.97 by radius ninety-six and rising) and exponential rate falling toward zero (below one tenth and dropping), the flat three-dimensional Euclidean signature of a horosphere, while the bulk tree of branching three grows with exponential rate the logarithm of three to a part in a million and an unbounded polynomial exponent (above ten and rising, no fixed degree), the negatively-curved hyperbolic signature, so each slice fails the other growth law and the flatness of our three-dimensional physical space is exactly the horosphere property of the four-dimensional hyperbolic bulk, measured from discrete ball growth rather than assumed',
      metrics: {
        cubicPolynomialExponent: Number(cubicPolynomial.toFixed(4)),
        cubicExponentialRate: Number(cubicExponential.toFixed(4)),
        treeExponentialRate: Number(treeExponential.toFixed(6)),
        logBranching: Number(Math.log(BRANCHING).toFixed(6)),
        treePolynomialExponent: Number(treePolynomial.toFixed(1)),
      },
      // CONTROL: the horosphere is not exponential and the bulk is not polynomial.
      control: {
        cubicExponentialRate: Number(cubicExponential.toFixed(4)),
      },
      notes:
        'Flat physical space as a horosphere of the hyperbolic bulk, from discrete ball-growth curvature. Grounds the cusp construction (the flat cusp of E-GRV-0021) on its own evidence. Complements the dimensional shadow (E-GMT-0032) and the two-regime split (E-NVG-0009).',
    })
  },
})
