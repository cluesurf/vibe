// The chiral condensate: gluons break chiral symmetry at low temperature and restore it above the
// deconfinement temperature. The order parameter is Sigma(m) = (1 / V) Re Tr M^-1 for staggered
// quarks of mass m, and the question is its chiral limit Sigma(0). A symmetry that is broken
// spontaneously leaves a condensate as the quark mass is switched off. An unbroken one leaves
// Sigma proportional to m, going to zero.
//
// Everything at the same bare coupling, beta = 5.7, so the lattice spacing is the same and only the
// temperature changes:
//
// - cold: an 8^3 x 8 box, T = 1 / (8a) near 145 MeV, below the pure-gauge T_c (on N_t = 8 the
//   deconfinement beta is near 6.06, far above 5.7). The claim: Sigma(0) is nonzero.
// - hot: an 8^3 x 2 box, T = 1 / (2a) near 580 MeV, deconfined (E-FRC-0082), in the real center
//   sector. The claim: Sigma(0) is zero, chiral symmetry restored.
// - free: every link the identity, where the estimator must reproduce the exact momentum sum. The
//   control that the stochastic trace measures what it says.
//
// Grade L2: quenched chiral symmetry breaking and its restoration above T_c (Kogut, Stone, Wyld et
// al. 1983 onward), reproduced. The trace uses no noise: it is the propagator diagonal at fixed
// source sites (translation invariance of the ensemble makes every site equivalent). The gauge
// configurations come from the seeded heatbath, the sampling stand-in for the thermal ensemble.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  gaugeUpdate,
  makeGaugeLattice,
} from '@/code/dynamics/gauge-lattice'
import { makeStaggeredOperator } from '@/code/operator/staggered-fermion'
import { siteAt } from '@/code/tool/hypercubic'
import {
  freeStaggeredCondensate,
  pointSourceCondensate,
} from '@/code/measure/chiral-condensate'
import { polyakovLoop } from '@/code/measure/lattice-gauge-observable'
import { jackknife } from '@/code/measure/jackknife'
import { linearFit } from '@/code/measure/regression'

const BETA = 5.7
const MASSES = [0.01, 0.02, 0.04, 0.08]
// the chiral limit is a straight line through the three lightest masses
const CHIRAL_MASSES = 3

type Condensate = {
  // per configuration, per mass, the propagator diagonal averaged over the source sites
  samples: number[][]
  polyakov: number
  worstResidual: number
}

function condensateRun(input: {
  lengths: number[]
  configurations: number
  seed: number
}): Condensate {
  const rng = makeRng({ seed: input.seed })
  const lattice = makeGaugeLattice({
    group: 'su3',
    lengths: input.lengths,
    start: 'cold',
    rng,
  })
  const samples: number[][] = []
  const [lx = 1, ly = 1, lz = 1, lt = 1] = input.lengths
  // four fixed sources, spread over the box
  const half = (length: number): number => Math.floor(length / 2)
  const sources = [
    [0, 0, 0, 0],
    [half(lx), half(ly), half(lz), half(lt)],
    [half(lx), 0, half(lz), 0],
    [0, half(ly), 0, half(lt)],
  ].map(coordinates =>
    siteAt({ lattice: lattice.geometry, coordinates }),
  )

  let polyakov = 0
  let worstResidual = 0

  for (let k = 0; k < 60; k++) {
    gaugeUpdate({ lattice, beta: BETA, overrelaxation: 2, rng })
  }

  for (let c = 0; c < input.configurations; c++) {
    for (let k = 0; k < 5; k++) {
      gaugeUpdate({ lattice, beta: BETA, overrelaxation: 2, rng })
    }

    const result = pointSourceCondensate({
      operator: makeStaggeredOperator({ lattice }),
      masses: MASSES,
      sites: sources,
      tolerance: 1e-8,
      maxIterations: 8000,
    })

    samples.push(result.values)
    polyakov +=
      Math.hypot(...polyakovLoop({ lattice })) / input.configurations
    worstResidual = Math.max(worstResidual, result.worstResidual)
  }

  return { samples, polyakov, worstResidual }
}

function chiralLimit(samples: readonly number[][]): number {
  const mean = MASSES.map(
    (_, i) =>
      samples.reduce((sum, s) => sum + (s[i] ?? 0), 0) / samples.length,
  )

  return linearFit({
    xs: MASSES.slice(0, CHIRAL_MASSES),
    ys: mean.slice(0, CHIRAL_MASSES),
  }).intercept
}

export default experiment({
  id: 'gauge/chiral-condensate',
  code: 'E-FRC-0086',
  title:
    'quenched SU(3) breaks chiral symmetry below T_c (the condensate survives the chiral limit) and restores it above T_c at the same coupling (the condensate goes to zero with the quark mass)',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const cold = condensateRun({
      lengths: [8, 8, 8, 8],
      configurations: 8,
      seed: 860,
    })
    const hot = condensateRun({
      lengths: [8, 8, 8, 2],
      configurations: 8,
      seed: 861,
    })
    const coldLimit = jackknife({
      samples: cold.samples,
      estimator: chiralLimit,
    })
    const hotLimit = jackknife({
      samples: hot.samples,
      estimator: chiralLimit,
    })

    // the estimator on the free field, against the exact momentum sum at every mass. The free field
    // is exactly translation invariant, so one source site must reproduce the sum to solver precision
    const freeLengths = [8, 8, 8, 8]
    const free = pointSourceCondensate({
      operator: makeStaggeredOperator({
        lattice: makeGaugeLattice({
          group: 'su3',
          lengths: freeLengths,
          start: 'cold',
          rng: makeRng({ seed: 1 }),
        }),
      }),
      masses: MASSES,
      sites: [0],
      tolerance: 1e-12,
      maxIterations: 4000,
    })
    const freeMeasured = free.values
    const freeExact = MASSES.map(mass =>
      freeStaggeredCondensate({
        lengths: freeLengths,
        colours: 3,
        mass,
      }),
    )
    const freeWorst = Math.max(
      ...freeMeasured.map((value, i) =>
        Math.abs(value / (freeExact[i] ?? 1) - 1),
      ),
    )

    const estimatorExact = freeWorst < 1e-6
    const phases = cold.polyakov < 0.1 && hot.polyakov > 0.3
    const broken = coldLimit.value > 5 * coldLimit.error
    const restored =
      Math.abs(hotLimit.value) <
      3 * hotLimit.error + 0.02 * coldLimit.value
    const ok = estimatorExact && phases && broken && restored

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'at beta 5.7 the staggered chiral condensate extrapolates to a nonzero value at zero quark mass in the confined box (T below T_c) and to zero in the deconfined box (T above T_c), with the noise-free point-source estimator reproducing the exact free-quark condensate to solver precision',
      metrics: {
        coldChiralLimit: coldLimit.value,
        coldChiralLimitError: coldLimit.error,
        hotChiralLimit: hotLimit.value,
        hotChiralLimitError: hotLimit.error,
        coldSigmaAt001:
          cold.samples.reduce((s, x) => s + (x[0] ?? 0), 0) /
          cold.samples.length,
        hotSigmaAt001:
          hot.samples.reduce((s, x) => s + (x[0] ?? 0), 0) /
          hot.samples.length,
        coldPolyakov: cold.polyakov,
        hotPolyakov: hot.polyakov,
        worstSolverResidual: Math.max(
          cold.worstResidual,
          hot.worstResidual,
        ),
      },
      control: {
        freeSigmaAt001: freeMeasured[0] ?? 0,
        freeSigmaExactAt001: freeExact[0] ?? 0,
        freeSigmaAt008: freeMeasured[3] ?? 0,
        freeSigmaExactAt008: freeExact[3] ?? 0,
        freeWorstRelativeError: freeWorst,
      },
      notes:
        'L2, known physics: quenched chiral symmetry breaking and its restoration in the deconfined phase. Quenched, one small volume per temperature, so the quenched chiral logarithms and the finite-volume turnover of Sigma at m V Sigma of order one (here m V Sigma is near 13 at the lightest mass in the cold box) are not resolved, and the chiral limit is a straight line through m = 0.01 to 0.04. The hot box sits in the real center sector, where quenched chiral restoration happens. The condensate is per staggered field (four tastes) and not converted to a continuum scheme.',
    })
  },
})
