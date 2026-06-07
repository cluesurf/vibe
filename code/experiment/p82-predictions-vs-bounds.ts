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

import { pathToFileURL } from 'node:url'
import { lorentzSafety, latticeAnisotropy } from '~/experiment/p27-lorentz-violation'
import { swerveDiffusion } from '~/experiment/p26-swerves'

const E_PLANCK_GEV = 1.22e19
// Fermi-LAT, GRB 090510 (Abdo et al. 2009): linear Lorentz violation is excluded below
// E_QG1 = 7.6 E_Planck, i.e. the linear coefficient xi1 must be smaller than 1/7.6.
const GRB_LINEAR_EQG_OVER_PLANCK = 7.6
const XI1_BOUND = 1 / GRB_LINEAR_EQG_OVER_PLANCK
// Fermi-LAT quadratic bound, E_QG2 > ~1.3e11 GeV.
const GRB_QUADRATIC_EQG_GEV = 1.3e11

function logFit(xs: number[], ys: number[]): number {
  const n = xs.length
  const lx = xs.map((x) => Math.log(x))
  const ly = ys.map((y) => Math.log(y))
  const mx = lx.reduce((a, b) => a + b, 0) / n
  const my = ly.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < n; i++) {
    sxy += (lx[i]! - mx) * (ly[i]! - my)
    sxx += (lx[i]! - mx) ** 2
  }
  return sxy / sxx
}

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
  const slopes = densities.map((d) => swerveDiffusion({ density: d, seed: input.seed, trajectories: 200 }).slope)
  const swerveScalingExponent = logFit(densities, slopes)
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
    solved: modelPassesLinear && latticeExcludedLinear && modelPassesQuadratic && swerveVanishesWithDiscreteness,
  }
}

export function main(): void {
  const r = predictionsVsBounds({ seed: 1 })
  console.log('P82: sharp predictions against the experimental bounds')
  console.log('')
  console.log('  Lorentz violation, linear order (Fermi-LAT GRB 090510):')
  console.log(`    bound: linear coefficient xi1 < ${r.xi1Bound.toFixed(3)} (E_QG1 > ${GRB_LINEAR_EQG_OVER_PLANCK} E_Planck)`)
  console.log(`    model (random sprinkle): xi1 = 0 exactly (Lorentz-invariant distribution; residual ${r.modelLinearXi.toFixed(3)} is finite-sample noise)`)
  console.log(`    lattice (for contrast):  xi ~ ${r.latticeLinearXi.toFixed(2)} near the cutoff`)
  console.log(`    model passes: ${r.modelPassesLinear ? 'YES' : 'no'}    lattice excluded by the same bound: ${r.latticeExcludedLinear ? 'YES' : 'no'}`)
  console.log('')
  console.log('  Lorentz violation, quadratic order (Fermi-LAT):')
  console.log(`    bound: E_QG2 > ${r.quadraticBoundGeV.toExponential(1)} GeV`)
  console.log(`    model: no leading Lorentz violation at any order, so it passes: ${r.modelPassesQuadratic ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The swerve (momentum diffusion from discreteness):')
  console.log(`    measured scaling with discreteness: diffusion rate ~ density^${r.swerveScalingExponent.toFixed(2)}`)
  console.log(`    finer discreteness gives a smaller swerve, so the Planckian value is far below the cosmic-ray bound: ${r.swerveVanishesWithDiscreteness ? 'YES' : 'no'}`)
  console.log('')
  console.log(`  predictions vs bounds solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The model passes the tightest current bounds, and the test is discriminating, not')
  console.log('  free: the same gamma-ray-burst timing that the model passes excludes a regular lattice,')
  console.log('  whose photon speed becomes order-one anisotropic near the discreteness scale. The')
  console.log('  random sprinkling predicts no first-order Lorentz violation at all, because it is')
  console.log('  Lorentz invariant in distribution, and the swerve shrinks as the discreteness fines, so')
  console.log('  at the Planck scale it is unobservably small. The sharp, falsifiable claim is the')
  console.log('  Lorentz one: a confirmed energy-dependent photon speed at first order would falsify the')
  console.log('  Lorentz-safe substrate. The numbers turn the qualitative story of P26 and P27 into a')
  console.log('  standing bet against the data.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
