// Confinement in three-dimensional SU(2), carried to the continuum. In three dimensions the gauge
// coupling g^2 has the units of a mass, so the string tension in units of it, sqrt(sigma) / g^2, is
// one pure number with a continuum value, 0.3353(18) (Teper 1998). On the lattice beta = 4 / (a g^2),
// so each coupling gives beta sqrt(sigma a^2) / 4, which must approach that number as the lattice
// spacing goes to zero, linearly in 1 / beta at these couplings. A mapping from lattice numbers to a
// continuum one, the step a finite lattice result never takes on its own.
//
// The string tension at each beta comes from the static potential: loops with APE-smeared spatial
// links on a 16^3 box, V(R) fit to V0 + sigma R + c ln R over R = 2 to 6: in three dimensions the
// short-distance force of one gluon is logarithmic, and a 1 / R term in its place leaks the log's
// curvature into sigma (it read 13 percent high that way).
//
// The control is the continuum limit itself: were the tension a lattice artifact rather than
// confinement, beta sqrt(sigma a^2) would run to zero or diverge as beta grows, not settle.
//
// Grade L2: textbook 3D SU(2) confinement and its continuum scaling, reproduced. The ensembles come
// from the seeded heatbath, the sampling stand-in for the thermal ensemble.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { makeGaugeLattice, sampleGaugeEnsemble } from '@/code/dynamics/gauge-lattice'
import { apeSmear } from '@/code/dynamics/gauge-smearing'
import { staticWilsonLoops } from '@/code/measure/lattice-gauge-observable'
import { averageSeries, jackknife } from '@/code/measure/jackknife'
import { potentialAt } from '@/code/measure/static-potential'
import { weightedLeastSquares, weightedLinearFit } from '@/code/measure/regression'

const LENGTH = 16
const MAX_R = 6
const MAX_T = 5
const PLATEAU_T = 3
const BETAS = [5, 7, 9]
// sqrt(sigma) / g^2 in the continuum, 3D SU(2) (Teper, Phys. Rev. D 59 (1999) 014512)
const CONTINUUM = 0.3353

function tensionAt(input: { beta: number; seed: number }): { value: number; error: number } {
  const rng = makeRng({ seed: input.seed })
  const lattice = makeGaugeLattice({ group: 'su2', lengths: [LENGTH, LENGTH, LENGTH], start: 'cold', rng })
  const samples = sampleGaugeEnsemble({
    lattice,
    beta: input.beta,
    thermalization: 60,
    measurements: 120,
    separation: 2,
    overrelaxation: 2,
    rng,
    measure: current =>
      staticWilsonLoops({
        spatial: apeSmear({ lattice: current, alpha: 0.5, iterations: 10 }),
        temporal: current,
        maxR: MAX_R,
        maxT: MAX_T + 1,
      }).flat(),
  })
  const width = MAX_T + 2

  const sigma = (subset: readonly number[][]): number => {
    const mean = averageSeries({ series: subset })
    const table = Array.from({ length: MAX_R + 1 }, (_, r) =>
      Array.from({ length: width }, (__, t) => mean[r * width + t] ?? 1),
    )
    const v = potentialAt({ table, t: PLATEAU_T, maxR: MAX_R }).slice(1)
    // in three dimensions the one-gluon exchange is logarithmic, V ~ c ln R, not c / R
    const fit = weightedLeastSquares({
      rows: v.map((_, i) => [1, i + 2, Math.log(i + 2)]),
      ys: v,
      errors: v.map(() => 1),
    })

    return fit.coefficients[1] ?? 0
  }

  return jackknife({ samples, estimator: sigma, binSize: 4 })
}

export default experiment({
  id: 'gauge/confinement',
  code: 'E-FRC-0007',
  title:
    '3D SU(2) confines with a string tension that, measured in units of the coupling at three lattice spacings, extrapolates to the continuum sqrt(sigma) / g^2 = 0.335',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const points = BETAS.map((beta, index) => {
      const sigma = tensionAt({ beta, seed: 70 + index })
      const scaled = (beta * Math.sqrt(Math.max(sigma.value, 0))) / 4
      const error = (beta / 4) * (sigma.error / (2 * Math.sqrt(Math.max(sigma.value, 1e-12))))

      return { beta, sigma, scaled, error }
    })
    const extrapolation = weightedLinearFit({
      xs: points.map(p => 1 / p.beta),
      ys: points.map(p => p.scaled),
      errors: points.map(p => p.error),
    })
    const continuumPull = (extrapolation.intercept - CONTINUUM) / extrapolation.interceptError

    const confines = points.every(p => p.sigma.value > 5 * p.sigma.error)
    const shrinks = points.every((p, i) => i === 0 || p.sigma.value < (points[i - 1]?.sigma.value ?? 0))
    const continuum = Math.abs(continuumPull) < 3 && extrapolation.chi2 < 9
    const ok = confines && shrinks && continuum

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in 3D SU(2) the string tension is resolved at every coupling, shrinks in lattice units as the spacing shrinks, and beta sqrt(sigma a^2) / 4 extrapolated linearly in 1 / beta reaches the continuum sqrt(sigma) / g^2 = 0.3353',
      metrics: {
        stringTensionAt5: points[0]?.sigma.value ?? 0,
        stringTensionAt7: points[1]?.sigma.value ?? 0,
        stringTensionAt9: points[2]?.sigma.value ?? 0,
        stringTensionErrorAt5: points[0]?.sigma.error ?? 0,
        stringTensionErrorAt7: points[1]?.sigma.error ?? 0,
        stringTensionErrorAt9: points[2]?.sigma.error ?? 0,
        scaledAt5: points[0]?.scaled ?? 0,
        scaledAt7: points[1]?.scaled ?? 0,
        scaledAt9: points[2]?.scaled ?? 0,
        continuumExtrapolation: extrapolation.intercept,
        continuumExtrapolationError: extrapolation.interceptError,
        extrapolationChi2: extrapolation.chi2,
      },
      control: {
        publishedContinuum: CONTINUUM,
        continuumPull,
      },
      notes:
        'L2, known physics: 3D SU(2) confinement and its continuum limit. The potential is fit over R = 2 to 6 on a 16^3 box as V0 + sigma R + c ln R, the logarithm being the three-dimensional Coulomb force, and the string correction pi / (24 R) is left to c, so only sigma is used. The published continuum value is the reference, never an input. Rewritten 2026-09-25 from a Metropolis Creutz-ratio test with no control.',
    })
  },
})
