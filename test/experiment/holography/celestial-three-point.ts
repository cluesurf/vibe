// Celestial holography seed: a boundary three-point function of primaries with
// distinct weights transforms covariantly under a substrate boost, each point
// carrying its own conformal weight. This is the discrete seed of Pasterski's
// result that a celestial three-point amplitude reduces to the unique 2D CFT
// three-point function.
//
// The conformal three-point of primaries of weights D1, D2, D3 has the fixed
// form G3 = prod |x_ij|^(-(Di + Dj - Dk)). Under a boost with per-point conformal
// factor Omega_i it must satisfy G3(boost) * Omega1^D1 Omega2^D2 Omega3^D3 = G3.
// A non-conformal three-point form (wrong exponents) does not, the control.
//
// Depth L2. This reproduces the conformal three-point transformation on the
// substrate boundary, the seed of a celestial three-point, not a scattering
// amplitude, which would presuppose emergent Lorentzian spacetime.

import {
  normalize,
  norm,
  scale,
  sub,
  type Vec,
} from '@/code/algebra/vector'
import {
  ballIsometry,
  ballBoundaryConformalFactor,
} from '@/code/geometry/mobius'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const THREE_DIRECTIONS: Vec[] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
]

const WEIGHTS = [0.5, 1, 1.5]
const BOOST_AXIS: Vec = [1, 0, 0, -1]
const BOOST_RADIUS = 0.55

function chord(a: Vec, b: Vec): number {
  return norm(sub(a, b))
}

// the conformal three-point with pair exponents gamma_ij, one per pair
function threePoint(p: Vec[], gamma: [number, number, number]): number {
  return (
    chord(p[0]!, p[1]!) ** -gamma[0] *
    chord(p[1]!, p[2]!) ** -gamma[1] *
    chord(p[0]!, p[2]!) ** -gamma[2]
  )
}

export default experiment({
  id: 'holography/celestial-three-point',
  code: 'E-HLG-0165',
  title:
    'a boundary three-point of primaries transforms as a celestial three-point under a substrate boost',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const p = THREE_DIRECTIONS.map(normalize)
    const [d1, d2, d3] = WEIGHTS as [number, number, number]
    // the conformal pair exponents: gamma_12 = D1 + D2 - D3, and cyclic
    const gamma: [number, number, number] = [
      d1 + d2 - d3,
      d2 + d3 - d1,
      d1 + d3 - d2,
    ]

    const axis = scale(normalize(BOOST_AXIS), BOOST_RADIUS)
    const boost = ballIsometry(axis)
    const moved = p.map(boost)
    const omega = p.map(x => ballBoundaryConformalFactor(axis, x))

    const g = threePoint(p, gamma)
    const gMoved = threePoint(moved, gamma)
    const covariant =
      gMoved * omega[0]! ** d1 * omega[1]! ** d2 * omega[2]! ** d3

    const residual = Math.abs(covariant - g) / Math.abs(g)

    // control: a non-conformal three-point form (equal exponents) does not
    // carry the right per-point weights, so it fails the same covariance
    const flat: [number, number, number] = [1, 1, 1]
    const gFlat = threePoint(p, flat)
    const gFlatMoved = threePoint(moved, flat)
    const covariantFlat =
      gFlatMoved * omega[0]! ** d1 * omega[1]! ** d2 * omega[2]! ** d3

    const controlResidual =
      Math.abs(covariantFlat - gFlat) / Math.abs(gFlat)

    const ok = residual < 1e-9 && controlResidual > 1e-2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the conformal three-point of weights one half, one, three halves transforms covariantly under a substrate boost with each point carrying its own weight, while a flat-exponent form does not',
      metrics: {
        residual,
        weight1: d1,
        weight2: d2,
        weight3: d3,
      },
      control: { nonConformalResidual: controlResidual },
    })
  },
})
