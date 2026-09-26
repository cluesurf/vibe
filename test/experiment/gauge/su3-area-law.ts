// Color confinement in four-dimensional SU(3), the gauge theory of the strong force with no quarks.
// A Wilson loop W(R, T) is the amplitude for a static quark and antiquark created R apart, held for
// time T and annihilated. If the energy between them grows linearly with R (a string), the loop
// falls as exp(-sigma R T), an AREA law, and the Creutz ratio chi(R, R), which cancels the perimeter
// and corner terms, levels off at the string tension sigma. If the force is Coulombic, chi(R, R)
// falls away with R.
//
// The discriminating number is chi(3, 3) / chi(2, 2). A Coulomb force gives about a quarter to a
// third (chi ~ 1 / R^2), a string gives close to one. The same number is read from three runs.
//
// - SU(3) at beta = 5.7, a lattice spacing near 0.17 fm on which the 8^4 box is 1.4 fm across,
//   larger than the confinement scale. The claim.
// - U(1) at beta = 1.5, the Coulomb phase of compact electrodynamics (above its transition at 1.01),
//   the photon. The control that must NOT confine.
// - SU(3) at beta = 12, the same group at weak coupling, where the same 8^4 box is far smaller than
//   the confinement scale and the short-distance force is Coulombic. The control that shows
//   confinement is a property of the dynamics at long distance, not of the group.
//
// Grade L2: textbook lattice QCD (Wilson 1974, Creutz 1980), reproduced from the Wilson action with
// nothing else put in. The Monte Carlo draws from a seeded generator, so each number is a sample
// estimate over an ensemble, with a jackknife error.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import {
  GaugeGroup,
  makeGaugeLattice,
  sampleGaugeEnsemble,
} from '@/code/dynamics/gauge-lattice'
import {
  creutzRatioFromTable,
  wilsonLoopTable,
} from '@/code/measure/lattice-gauge-observable'
import { jackknife } from '@/code/measure/jackknife'

// hbar c in GeV fm, and the phenomenological string tension sqrt(sigma) = 0.44 GeV, used only to
// print the lattice spacing the measured tension implies. Neither enters a pass criterion.
const HBAR_C = 0.1973
const SQRT_STRING_TENSION = 0.44

function creutzStudy(input: {
  group: GaugeGroup
  beta: number
  seed: number
}): {
  chi22: number
  chi22Error: number
  chi33: number
  chi33Error: number
  ratio: number
  ratioError: number
} {
  const rng = makeWeyl({ start: input.seed })
  const lattice = makeGaugeLattice({
    group: input.group,
    lengths: [8, 8, 8, 8],
    start: 'cold',
    rng,
  })
  const tables = sampleGaugeEnsemble({
    lattice,
    beta: input.beta,
    thermalization: 40,
    measurements: 40,
    separation: 2,
    overrelaxation: 1,
    rng,
    measure: current => wilsonLoopTable({ lattice: current, max: 3 }),
  })
  const meanTable = (samples: readonly number[][][]): number[][] =>
    [0, 1, 2, 3].map(r =>
      [0, 1, 2, 3].map(
        t =>
          samples.reduce(
            (sum, table) => sum + (table[r]?.[t] ?? 0),
            0,
          ) / samples.length,
      ),
    )
  const chi = (samples: readonly number[][][], r: number): number =>
    creutzRatioFromTable({ table: meanTable(samples), r, t: r })
  const chi22 = jackknife({
    samples: tables,
    estimator: s => chi(s, 2),
  })
  const chi33 = jackknife({
    samples: tables,
    estimator: s => chi(s, 3),
  })
  const ratio = jackknife({
    samples: tables,
    estimator: s => chi(s, 3) / chi(s, 2),
  })

  return {
    chi22: chi22.value,
    chi22Error: chi22.error,
    chi33: chi33.value,
    chi33Error: chi33.error,
    ratio: ratio.value,
    ratioError: ratio.error,
  }
}

export default experiment({
  id: 'gauge/su3-area-law',
  code: 'E-FRC-0080',
  title:
    '4D SU(3) gluons confine: the Creutz ratio levels off into a string tension at beta 5.7, while the U(1) photon and weakly coupled SU(3) in the same box fall off like a Coulomb force',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const strong = creutzStudy({ group: 'su3', beta: 5.7, seed: 80 })
    const photon = creutzStudy({ group: 'u1', beta: 1.5, seed: 81 })
    const weak = creutzStudy({ group: 'su3', beta: 12, seed: 82 })

    // the string tension is resolved: chi(3, 3) is positive by more than five standard errors
    const tensionResolved = strong.chi33 > 5 * strong.chi33Error
    // an area law: chi levels off, the ratio three standard errors above the Coulomb ceiling
    const COULOMB_CEILING = 0.5
    const levelsOff =
      strong.ratio - 3 * strong.ratioError > COULOMB_CEILING
    // both controls fall off: their ratio three standard errors below the same ceiling
    const photonFalls =
      photon.ratio + 3 * photon.ratioError < COULOMB_CEILING
    const weakFalls = weak.ratio + 3 * weak.ratioError < COULOMB_CEILING
    const ok = tensionResolved && levelsOff && photonFalls && weakFalls
    const spacing =
      (HBAR_C * Math.sqrt(strong.chi33)) / SQRT_STRING_TENSION

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in 4D SU(3) lattice gauge theory at beta 5.7 the Creutz ratio levels off (chi(3,3) / chi(2,2) near one, an area law and a string tension), while the U(1) photon and SU(3) at weak coupling in the same 8^4 box fall off like a Coulomb force',
      metrics: {
        su3Chi22: strong.chi22,
        su3Chi22Error: strong.chi22Error,
        su3Chi33: strong.chi33,
        su3Chi33Error: strong.chi33Error,
        su3Ratio: strong.ratio,
        su3RatioError: strong.ratioError,
        impliedSpacingUpperBoundFermi: spacing,
      },
      control: {
        photonChi22: photon.chi22,
        photonChi33: photon.chi33,
        photonRatio: photon.ratio,
        photonRatioError: photon.ratioError,
        weakSu3Chi22: weak.chi22,
        weakSu3Chi33: weak.chi33,
        weakSu3Ratio: weak.ratio,
        weakSu3RatioError: weak.ratioError,
      },
      notes:
        'L2, known physics: Wilson-action SU(3) confinement reproduced on the lattice (Wilson 1974, Creutz 1980). chi(3,3) is the string tension in lattice units only up to the Coulomb part still present at R = 3, so it is an upper bound on sigma a^2. The implied spacing uses sqrt(sigma) = 0.44 GeV as an external scale and is printed, not tested. Monte Carlo from a seeded generator, jackknife errors over 40 configurations.',
    })
  },
})
