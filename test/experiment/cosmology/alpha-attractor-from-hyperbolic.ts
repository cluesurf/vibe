// Frontier 5, Core 3 advance: derive the inflaton SHAPE CLASS from the mesh being hyperbolic, not
// assume it. E-CSM-0046 showed a plateau resolves the tensor tension but used the Starobinsky form.
// This upgrades that: the plateau class is the alpha-attractor class, and here the attractor
// behavior is MEASURED by slow-roll integration, not quoted from the closed-form formulas.
//
// The structural fact (Kallosh and Linde, the alpha-attractors): an inflaton whose FIELD-SPACE is
// HYPERBOLIC (constant negative curvature) is an alpha-attractor, with canonical potential
//   V = V0 tanh^2(phi / sqrt(6 alpha)),
// where alpha is set by the field-space curvature (alpha = 1 is Starobinsky). The vibe substrate
// is a HYPERBOLIC {3,4,3,4} mesh. If the inflaton is a modulus of that mesh, so its field-space
// inherits the mesh hyperbolic geometry, the inflaton is an alpha-attractor.
//
// Measured here by actual slow-roll integration on that potential (the same deterministic
// integrator pattern as E-CSM-0046): for each alpha in 0.5 to 8, the end of inflation is found
// from epsilon = 1 and the observables are read 55 e-folds back. The results:
//   1. n_s is the SAME across a factor of 16 in alpha (spread under 5e-4), agrees with the
//      attractor value 1 - 2/N, and matches the Planck central value 0.9649 within 0.005. So the
//      spectral index is a measured attractor property, independent of alpha.
//   2. r SCALES with alpha: each doubling of alpha roughly doubles r (ratio between 1.7 and 2.05,
//      the attractor r = 12 alpha / N^2 up to higher-order corrections at larger alpha), and the
//      observational bound r < 0.06 with the measured r-per-alpha slope allows alpha up to about
//      15, so any order-one mesh curvature is allowed (alpha = 1 gives the measured r about
//      0.004, the E-CSM-0046 number).
// The control is the quadratic potential run through the SAME integrator: a non-attractor with
// r about 0.14, above the bound, so the attractor class is genuinely distinct.
//
// HONEST scope: the slow-roll integration is a real measurement on the stated potential (Tier A
// established inflation machinery), and the alpha-attractor / hyperbolic-field-space equivalence
// is a known theorem. The Tier-B step is the IDENTIFICATION of the inflaton field-space with the
// mesh hyperbolic geometry (the inflaton as a mesh modulus), which is motivated by the mesh being
// hyperbolic but not derived from the mesh dynamics. And alpha itself, the curvature
// normalisation from the specific {3,4,3,4} structure, is the one remaining number. So this
// measures the attractor behavior of the shape CLASS and the robust n_s, not the exact r.
//
// Grade L2: the attractor behavior (n_s independent of alpha, r scaling with alpha) measured by
// slow-roll integration on the alpha-attractor potential, with the quadratic potential
// (non-attractor, measured r about 0.14) as the computed foil.

import {
  type SlowRollPotential as Potential,
  slowRollEnd as findEnd,
  slowRollObservables as observables,
} from '@/code/dynamics/slow-roll'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const N_PIVOT = 55 // e-folds at the observable pivot

// the alpha-attractor canonical potential V = tanh^2(phi / sqrt(6 alpha)) (V0 = 1, it cancels
// in the slow-roll observables)
function attractorPotential(alpha: number): Potential {
  const b = 1 / Math.sqrt(6 * alpha)

  return phi => {
    const th = Math.tanh(b * phi)
    const sech2 = 1 - th * th

    return {
      V: th * th,
      Vp: 2 * b * th * sech2,
      Vpp: 2 * b * b * sech2 * (sech2 - 2 * th * th),
    }
  }
}

// the non-attractor foil (E-CSM-0044)
const quadratic: Potential = phi => ({
  V: 0.5 * phi * phi,
  Vp: phi,
  Vpp: 1,
})

// the field value where slow-roll ends (epsilon = 1), searching downward from a plateau guess
// integrate targetN e-folds back (to larger phi) from the end, return n_s and r there
export default experiment({
  id: 'cosmology/alpha-attractor-from-hyperbolic',
  code: 'E-CSM-0047',
  title:
    'slow-roll integration on the alpha-attractor potential V = tanh^2(phi/sqrt(6 alpha)) measures the attractor: n_s is the same across alpha from 0.5 to 8 (spread under 5e-4), agrees with 1 - 2/N, and matches Planck, while r roughly doubles per doubling of alpha, so if the inflaton field-space inherits the mesh hyperbolic geometry the spectral index is a robust measured prediction and alpha (bounded near 15 by r < 0.06) is the one remaining input',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // slow-roll observables MEASURED across alpha (a factor of 16)
    const alphas = [0.5, 1, 2, 4, 8]
    const results = alphas.map(alpha => {
      const pot = attractorPotential(alpha)
      const phiEnd = findEnd(pot, 3 * Math.sqrt(6 * alpha))

      return observables(pot, phiEnd, N_PIVOT)
    })

    const nsValues = results.map(o => o.ns)
    const rValues = results.map(o => o.r)
    const nsSpread = Math.max(...nsValues) - Math.min(...nsValues)
    const nsAtAlpha1 = nsValues[1]!
    const rAtAlpha1 = rValues[1]!
    const nsAttractorFormula = 1 - 2 / N_PIVOT

    // r-scaling: the ratio of measured r under each doubling of alpha
    const rDoublingRatios = rValues
      .slice(1)
      .map((r, i) => r / rValues[i]!)

    // the alpha bound from the CMB r limit, using the measured r at alpha = 1
    const alphaMaxFromBound = 0.06 / rAtAlpha1

    // the computed foil: the quadratic potential through the same integrator
    const quad = observables(quadratic, findEnd(quadratic, 6), N_PIVOT)

    // 1. n_s is robust: the measured values agree across alpha (the attractor, measured).
    const nsRobust = nsSpread < 5e-4

    // 2. the measured n_s agrees with the attractor value 1 - 2/N and matches Planck.
    const nsMatchesFormula =
      Math.abs(nsAtAlpha1 - nsAttractorFormula) < 1e-3

    const nsMatchesPlanck = Math.abs(nsAtAlpha1 - 0.9649) < 0.005

    // 3. r scales with alpha: each doubling of alpha roughly doubles the measured r.
    const rScalesWithAlpha = rDoublingRatios.every(
      ratio => ratio > 1.7 && ratio < 2.05,
    )

    // 4. the Starobinsky point (alpha = 1) gives a measured r below the bound.
    const rStarobinskyBelowBound = rAtAlpha1 < 0.06 && rAtAlpha1 > 0.001

    // 5. any order-one mesh curvature is allowed by the r bound.
    const orderOneAllowed = alphaMaxFromBound > 5

    // 6. the foil: the quadratic (non-attractor) is in tension, r above the bound.
    const quadraticInTension = quad.r > 0.06

    const solved =
      nsRobust &&
      nsMatchesFormula &&
      nsMatchesPlanck &&
      rScalesWithAlpha &&
      rStarobinskyBelowBound &&
      orderOneAllowed &&
      quadraticInTension

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'slow-roll integration on the alpha-attractor potential V = tanh^2(phi / sqrt(6 alpha)), the canonical potential of a hyperbolic field-space, measures the attractor directly: across alpha from 0.5 to 8 the measured n_s values agree to better than 5e-4, agree with the attractor value 1 - 2/N to better than 1e-3, and match the Planck central value 0.9649 within 0.005, while the measured r roughly doubles with each doubling of alpha (ratios between 1.7 and 2.05) and the measured r at alpha = 1 is about 0.004, below the observational bound 0.06 which allows alpha up to about 15, and the quadratic potential run through the same integrator gives r about 0.14 above the bound (the non-attractor foil), so if the inflaton field-space inherits the mesh hyperbolic geometry the spectral index is a robust measured prediction and alpha is the one remaining input',
      metrics: {
        nsSpreadAcrossAlpha: Number(nsSpread.toExponential(2)),
        nsAtAlpha1: Number(nsAtAlpha1.toFixed(4)),
        nsAttractorFormula: Number(nsAttractorFormula.toFixed(4)),
        planckNs: 0.9649,
        rAtAlphaHalf: Number(rValues[0]!.toFixed(4)),
        rAtAlpha1: Number(rAtAlpha1.toFixed(4)),
        rAtAlpha8: Number(rValues[4]!.toFixed(4)),
        rDoublingRatioMin: Number(
          Math.min(...rDoublingRatios).toFixed(3),
        ),
        rDoublingRatioMax: Number(
          Math.max(...rDoublingRatios).toFixed(3),
        ),
        alphaMaxFromBound: Number(alphaMaxFromBound.toFixed(1)),
      },
      control: {
        // the quadratic potential, run through the SAME slow-roll integrator, is a
        // non-attractor: its r is about 0.14, above the bound, and there is no alpha to vary.
        // So the measured alpha-independence of n_s and the alpha-scaling of r are properties
        // of the hyperbolic (attractor) potential class, not of the integrator.
        quadraticNs: Number(quad.ns.toFixed(4)),
        quadraticR: Number(quad.r.toFixed(4)),
        attractorRAtAlpha1: Number(rAtAlpha1.toFixed(4)),
      },
      notes:
        'L2. The attractor behavior is now MEASURED by slow-roll integration (the E-CSM-0046 integrator pattern) on the alpha-attractor potential V = tanh^2(phi / sqrt(6 alpha)), not quoted from the closed-form n_s = 1 - 2/N and r = 12 alpha / N^2: the end of inflation is found from epsilon = 1 and the observables are read 55 e-folds back, for alpha in 0.5 to 8. The measured n_s spread across alpha is under 5e-4, the measured n_s agrees with 1 - 2/N to better than 1e-3, and each doubling of alpha scales the measured r by 1.8 to 2.0 (the small drift below 2 at larger alpha is the known higher-order correction to r = 12 alpha / N^2). Tier B (unchanged): the identification of the inflaton field-space with the mesh hyperbolic geometry (the inflaton as a mesh modulus), motivated by the mesh being hyperbolic but not derived from the mesh dynamics, and alpha (the curvature normalisation from {3,4,3,4}) is the one remaining number. The quadratic foil through the same integrator gives r about 0.14 (E-CSM-0044 tension). The remaining step is computing alpha from the specific {3,4,3,4} field-space curvature, which would turn r into a sharp number.',
    })
  },
})
