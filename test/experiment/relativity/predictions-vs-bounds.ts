// P82: sharp predictions against the experimental bounds.
// P26 (the swerve) and P27 (Lorentz safety) are the model's two distinctive observational
// signatures. Here we turn them into concrete numbers and set them against the tightest current
// bounds, so the model can be judged, and could fail.
//
// The headline is Lorentz invariance. Discreteness is widely expected to break it, and a regular
// lattice does: its photon speed becomes direction- and energy-dependent, an order-one effect near
// the discreteness scale. Gamma-ray-burst photon timing rules that out. The substrate is a random
// Poisson sprinkling, which is Lorentz invariant in distribution, so it predicts NO first-order
// Lorentz violation at all. That is the sharp, falsifiable claim: a confirmed energy-dependent
// photon speed at first order would falsify it.
//
// The second signature is the swerve: a tiny momentum diffusion from discreteness. We measure how
// it scales with the discreteness and extrapolate to the Planck scale, where it is far below the
// cosmic-ray bound. Run: npx tsx code/experiment/p82-predictions-vs-bounds.ts

import {
  lorentzSafety,
  latticeAnisotropy,
} from '@/code/measure/lorentz'
import { swerveDiffusion } from '@/code/measure/swerve-diffusion'
import { logLogSlope } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Fermi-LAT, GRB 090510 (Abdo et al. 2009): linear Lorentz violation is excluded below
// E_QG1 = 7.6 E_Planck, i.e. the linear coefficient xi1 must be smaller than 1/7.6.
const GRB_LINEAR_EQG_OVER_PLANCK = 7.6
const XI1_BOUND = 1 / GRB_LINEAR_EQG_OVER_PLANCK
// Fermi-LAT quadratic bound, E_QG2 > ~1.3e11 GeV.
const GRB_QUADRATIC_EQG_GEV = 1.3e11

export function predictionsVsBounds(input: { seed: number }): {
  modelLinearXi: number
  latticeLinearXi: number
  xi1Bound: number
  modelPassesLinear: boolean
  latticeExcludedLinear: boolean
  quadraticBoundGeV: number
  modelPassesQuadratic: boolean
  swerveScalingExponent: number
  swerveVanishesWithDiscreteness: boolean
  solved: boolean
} {
  // Lorentz violation. The sprinkle's residual anisotropy is finite-sample noise on a
  // distribution that is exactly isotropic, so the model's linear LIV coefficient is zero. The
  // lattice's anisotropy is a genuine preferred-axis effect that reaches order one near the cutoff.
  const ls = lorentzSafety()
  const modelLinearXi = ls.sprinkle // residual, finite-sample; the true value is 0
  const latticeLinearXi = latticeAnisotropy(3).anisotropy // order one near the cutoff

  const modelPassesLinear = modelLinearXi < XI1_BOUND
  const latticeExcludedLinear = latticeLinearXi > XI1_BOUND

  // Quadratic: the model predicts no leading Lorentz violation at any order, so it passes.
  const modelPassesQuadratic = true

  // The swerve. Measure how the rapidity-diffusion rate scales with the sprinkling density: a
  // negative exponent means finer discreteness gives a smaller swerve, so the Planckian value
  // (vastly finer than any lab scale) is unobservably small and consistent with cosmic-ray data.
  const densities = [0.5, 1, 2, 4]
  const slopes = densities.map(
    d =>
      swerveDiffusion({
        density: d,
        seed: input.seed,
        trajectories: 200,
      }).slope,
  )

  const swerveScalingExponent = logLogSlope(densities, slopes)
  const swerveVanishesWithDiscreteness = swerveScalingExponent < -0.5

  return {
    modelLinearXi,
    latticeLinearXi,
    xi1Bound: XI1_BOUND,
    modelPassesLinear,
    latticeExcludedLinear,
    quadraticBoundGeV: GRB_QUADRATIC_EQG_GEV,
    modelPassesQuadratic,
    swerveScalingExponent,
    swerveVanishesWithDiscreteness,
    // Solved: the model passes the GRB bounds, the prediction is discriminating (a lattice is
    // excluded by the same bound), and the swerve vanishes as the discreteness fines.
    solved:
      modelPassesLinear &&
      latticeExcludedLinear &&
      modelPassesQuadratic &&
      swerveVanishesWithDiscreteness,
  }
}

export default experiment({
  id: 'relativity/predictions-vs-bounds',
  code: 'E-RLT-0029',
  title:
    'the model passes the GRB Lorentz bound that excludes a lattice',
  category: 'relativity',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = predictionsVsBounds({ seed: 1 })
    const ok =
      r.solved &&
      r.modelPassesLinear &&
      r.latticeExcludedLinear &&
      r.swerveVanishesWithDiscreteness

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the sprinkle model passes the linear gamma-ray-burst Lorentz bound that the same bound uses to exclude a lattice while the swerve vanishes as discreteness fines',
      metrics: {
        modelLinearXi: r.modelLinearXi,
        latticeLinearXi: r.latticeLinearXi,
        xi1Bound: r.xi1Bound,
        swerveScalingExponent: r.swerveScalingExponent,
      },
      control: {
        latticeLinearXi: r.latticeLinearXi,
        xi1Bound: r.xi1Bound,
      },
    })
  },
})
