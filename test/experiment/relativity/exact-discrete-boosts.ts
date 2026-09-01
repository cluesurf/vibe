// Exact Lorentz structure on the lattice, the clever route. A regular lattice cannot carry the
// full continuous Lorentz group (its point group is finite), so the usual verdict is that
// discreteness and relativity only reconcile approximately. But in light-cone coordinates the
// lattice admits EXACT integer boosts (u, v) to (lambda u, v / lambda) with rapidity ln(lambda),
// and the light sector realizes them exactly, in three measured pieces.
//
// First, the massless walk dispersion is omega = k EXACTLY at every momentum in the zone, to
// machine precision even at large k: the light sector has NO Lorentz-violating lattice correction
// anywhere, not merely at small momentum. Second, the integer boost maps solutions to solutions
// exactly: contracting a chiral profile by lambda and evolving for beats over lambda steps equals
// evolving for beats steps and then contracting, to machine precision, the boost equivariance of
// rigid chiral transport with time rescaled by the boost factor. Third, the rapidities of
// composed integer boosts, n ln 2 + m ln 3, fill the rapidity line densely (the two logarithms
// are incommensurable), with the largest gap shrinking monotonically as the boost range grows, so
// the exact discrete subgroup is dense in the boost group, indistinguishable from continuous at
// any finite resolution.
//
// The control is the massive sector: the massive dispersion deviates from the continuum
// relativistic form by finite lattice corrections at large momentum, the deformed
// (doubly-special) regime already measured (E-RLT-0010). So the exact Lorentz structure is
// specifically a property of the light sector, and the mass is what deforms it, matching the
// physics that null structure is conformal and rigid.
//
// Depth L2. It establishes exact (machine-precision) boost structure in the light sector: exact
// null dispersion across the zone, exact solution-to-solution boost mapping, and a dense discrete
// boost subgroup, against the massive deformation control. The known impossibility (finite point
// group) is evaded by the light-cone route, not contradicted: the exactness lives in the null
// sector, and the massive sector carries the deformation.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { omegaFromDynamics } from '@/code/dynamics/walk-dispersion'
import {
  boostEquivarianceDefect,
  rapidityMaxGap,
} from '@/code/measure/discrete-boost'

const ZONE_MOMENTA = [0.3, 1.0, 2.0, 2.8]
const MASS = 0.4
const RANGES = [3, 6, 12, 24]

export default experiment({
  id: 'relativity/exact-discrete-boosts',
  code: 'E-RLT-0042',
  title:
    'the light sector carries exact Lorentz structure: omega = k with no correction anywhere in the zone, integer light-cone boosts map solutions to solutions exactly, and their rapidities are dense, while the mass deforms it',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // exact null dispersion across the whole zone, not just small k
    let worstNullError = 0

    for (const k of ZONE_MOMENTA) {
      worstNullError = Math.max(
        worstNullError,
        Math.abs(omegaFromDynamics({ k, mass: 0 }) - k),
      )
    }

    // exact boost equivariance of chiral transport (lambda 2, integer times)
    const defect = boostEquivarianceDefect({
      size: 256,
      lambda: 2,
      beats: 10,
      center: 60,
      width: 50,
    })

    // dense rapidities: the largest gap shrinks monotonically with the boost range
    const gaps = RANGES.map(range => rapidityMaxGap({ range, span: 2 }))

    let shrinking = true

    for (let i = 1; i < gaps.length; i++) {
      if (gaps[i]! >= gaps[i - 1]!) {
        shrinking = false
      }
    }

    // CONTROL: the massive dispersion carries finite lattice corrections at large momentum
    let massiveDeviation = 0

    for (const k of [0.3, 1.0, 2.0]) {
      massiveDeviation = Math.max(
        massiveDeviation,
        Math.abs(
          omegaFromDynamics({ k, mass: MASS }) -
            Math.sqrt(k * k + MASS * MASS),
        ),
      )
    }

    const nullExact = worstNullError < 1e-12
    const boostExact = defect < 1e-12
    const dense = shrinking && gaps[gaps.length - 1]! < 0.05
    const massDeforms = massiveDeviation > 0.01

    const ok = nullExact && boostExact && dense && massDeforms

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the massless walk dispersion is omega = k to machine precision at every momentum tested across the zone (no Lorentz-violating lattice correction anywhere in the light sector), the integer light-cone boost maps solutions to solutions exactly (contracting a chiral profile and evolving for the rescaled time equals evolving then contracting, defect at machine epsilon), and the rapidities of composed integer boosts n ln 2 + m ln 3 fill the boost group densely (the largest gap shrinking monotonically to under five hundredths over the tested range), so the light sector carries an exact, dense, discrete Lorentz boost structure on the lattice, while the massive dispersion deviates from the continuum relativistic form by finite corrections (the deformed doubly-special regime), so the mass is what deforms the symmetry and the null structure is exactly relativistic',
      metrics: {
        worstNullError: Number(worstNullError.toExponential(2)),
        boostDefect: Number(defect.toExponential(2)),
        rapidityGapAtRange3: Number(gaps[0]!.toFixed(4)),
        rapidityGapAtRange24: Number(gaps[gaps.length - 1]!.toFixed(4)),
        massiveDeviation: Number(massiveDeviation.toFixed(4)),
      },
      // CONTROL: the massive sector deviates from the continuum form, the deformation is real.
      control: {
        massiveDeviation: Number(massiveDeviation.toFixed(4)),
      },
      notes:
        'The light-cone route to exact lattice Lorentz structure: integer boosts (u,v) to (lambda u, v/lambda), dense rapidities n ln 2 + m ln 3, exact null dispersion. The finite-point-group obstruction applies to the full group on the sites, not to the null sector. The massive deformation is E-RLT-0010. Causal sets reach Lorentz invariance by random sprinkling instead, sacrificing regularity.',
    })
  },
})
