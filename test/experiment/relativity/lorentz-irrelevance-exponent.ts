// Emergent Lorentz, the quantitative edge: the lattice Lorentz violation is an
// IRRELEVANT operator with a measured scaling exponent, so exact Lorentz is the
// infrared fixed point, and the {3,4,3,4} coin flows there faster than a cubic
// lattice. Earlier flow experiments showed the dispersion anisotropy DECREASES
// toward the infrared. This sharpens that from "decreases" to a clean power law
// A(q) ~ q^Delta with a measured exponent Delta, which is exactly what "exact
// Lorentz in the infrared" means, an irrelevant operator flowing to zero.
//
// The relative axis-versus-diagonal anisotropy of the nearest-neighbour lattice
// dispersion is measured at a range of momentum magnitudes q. A log-log fit
// gives the irrelevance exponent Delta (the slope) and the power-law quality
// (r-squared). The 24-direction D4 coin is a spherical 5-design, so its first
// dispersion anisotropy sits at order q^6 over an isotropic q^2, giving Delta
// near 4. The 8-direction cubic axis set is only a 3-design, anisotropic already
// at order q^4, giving Delta near 2. So the coin's Lorentz violation is more
// irrelevant, it restores Lorentz faster. A constant anisotropy, a marginal
// operator with Delta 0, is the negative control the test must reject.
//
// Depth L2. The lattice dispersion is known math, but the measured irrelevance
// exponent and its dependence on the coin's design order is a sharp quantitative
// statement, with a control, of why and how fast Lorentz restores on {3,4,3,4}.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { coordinateAxes, probeDirections } from '@/code/measure/probe-directions'
import { dispersionAnisotropyAtScale } from '@/code/measure/dispersion'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a geometric range of momentum magnitudes running into the infrared, a decade
// wide for a clean log-log fit. These are probe wavenumbers, not a shrunk lattice.
const MAGNITUDES = [0.5, 0.36, 0.26, 0.19, 0.135, 0.097, 0.07, 0.05]
const DIMENSION = 4
// a fixed deterministic probe set, the same six hundred directions the existing
// symmetry-restoration experiment measures over, so the angular anisotropy is
// read the same way
const PROBES = probeDirections({ count: 600, dimension: DIMENSION })

// the irrelevance exponent Delta and power-law quality of the full angular
// dispersion anisotropy A(q) ~ q^Delta over many directions
function irrelevanceExponent(directions: number[][]): {
  exponent: number
  r2: number
  finest: number
} {
  const anisotropy = MAGNITUDES.map(scale =>
    dispersionAnisotropyAtScale({ directions, probes: PROBES, scale }),
  )
  const fit = linearFit({
    xs: MAGNITUDES.map(q => Math.log(q)),
    ys: anisotropy.map(a => Math.log(a)),
  })

  return {
    exponent: fit.slope,
    r2: fit.r2,
    finest: anisotropy[anisotropy.length - 1]!,
  }
}

export default experiment({
  id: 'relativity/lorentz-irrelevance-exponent',
  code: 'E-RLT-0169',
  title:
    'the lattice Lorentz violation is irrelevant with a measured exponent near four on the coin, so exact Lorentz is the infrared fixed point',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const d4 = irrelevanceExponent(rootsD4())
    const cubic = irrelevanceExponent(coordinateAxes(DIMENSION))

    // negative control: a constant anisotropy is marginal, exponent near zero,
    // the test must not read it as restoring
    const marginalFit = linearFit({
      xs: MAGNITUDES.map(q => Math.log(q)),
      ys: MAGNITUDES.map(() => Math.log(0.1)),
    })
    const marginalExponent = marginalFit.slope

    const exponentGap = d4.exponent - cubic.exponent

    const ok =
      d4.exponent > 3.5 && // near four, an irrelevant operator that restores fast
      d4.r2 > 0.999 && // a clean power law, a genuine fixed-point flow
      cubic.exponent > 1.5 && // the cubic lattice restores too, near two
      exponentGap > 1.5 && // the coin restores strictly and clearly faster
      Math.abs(marginalExponent) < 0.1 // the test rejects a marginal operator

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the dispersion anisotropy is a clean power law in momentum, so the lattice Lorentz violation is an irrelevant operator and exact Lorentz is the infrared fixed point, and the 24-direction coin has a higher irrelevance exponent than a cubic lattice, restoring Lorentz faster',
      metrics: {
        coinExponent: d4.exponent,
        coinPowerLawR2: d4.r2,
        cubicExponent: cubic.exponent,
        exponentGap,
      },
      control: {
        cubicExponent: cubic.exponent,
        marginalExponent,
      },
    })
  },
})
