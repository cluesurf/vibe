// Dynamical quarks break the string. With quarks that act back on the gluons, a static quark can pull
// an antiquark out of the vacuum and bind it, so its free energy is finite and the Polyakov loop,
// P = exp(-F_q / T), is nonzero at any temperature. Quenched, P is zero in the confined phase
// (E-FRC-0082). The same fact seen from the gauge side: the quark determinant weights the three
// center sectors of SU(3) unequally, where the pure gauge action cannot tell them apart.
//
// Four staggered tastes of mass 0.1 (one staggered field) on N_t = 2 boxes at beta 4.2, simulated by
// Hybrid Monte Carlo: deterministic reversible dynamics between a refresh of the momenta and the
// pseudofermion, the only draws, with an exact accept step.
//
// - Screening: with quarks, Re P is the same on 4^3 x 2 and 6^3 x 2. Quenched, the residual |P| is
//   noise and falls like 1 / sqrt(V), by (6/4)^(3/2) = 1.84 between the two boxes.
// - The sector weight, exactly: for thermalized dynamical configurations, the change of ln det K
//   under a center rotation of the time links, computed by dense Cholesky. It must be far below zero.
//   The pure gauge action changes by exactly zero under the same rotation.
// - The determinant is checked against the large-mass (hopping) expansion, which fixes m^2 times the
//   same change to a Polyakov-loop sum as m grows.
// - HMC is checked by the exact identity <exp(-Delta H)> = 1 (Creutz 1988).
//
// Grade L2: the explicit center-symmetry breaking by dynamical quarks and the screening of a static
// charge (string breaking in its thermal form), reproduced. The HMC refresh uses the seeded
// generator, the sampling stand-in for the thermal ensemble. N_t = 2 is the coarsest thermal
// lattice, so no statement about the hadronic phase or the continuum is made.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import {
  GaugeLattice,
  centerTransformTimeSlice,
  cloneGaugeLattice,
  gaugeUpdate,
  makeGaugeLattice,
} from '@/code/dynamics/gauge-lattice'
import {
  evenLogDeterminant,
  hmcTrajectory,
  hoppingWindingTerm,
} from '@/code/dynamics/dynamical-staggered'
import { wilsonAction } from '@/code/dynamics/gauge-molecular-dynamics'
import { makeStaggeredOperator } from '@/code/operator/staggered-fermion'
import { polyakovLoop } from '@/code/measure/lattice-gauge-observable'
import { jackknife } from '@/code/measure/jackknife'

const BETA = 4.2
const MASS = 0.1
const BIN = 5

type Run = {
  realPart: { value: number; error: number }
  modulus: { value: number; error: number }
  acceptance: number
  creutz: { value: number; error: number }
  configurations: GaugeLattice[]
}

function run(input: {
  spatial: number
  dynamical: boolean
  trajectories: number
  seed: number
}): Run {
  const rng = makeWeyl({ start: input.seed })
  const lattice = makeGaugeLattice({
    group: 'su3',
    lengths: [input.spatial, input.spatial, input.spatial, 2],
    start: 'hot',
    rng,
  })

  // a pure-gauge warm-up, so the first HMC trajectory does not start from an extreme state
  for (let k = 0; k < 20; k++) {
    gaugeUpdate({ lattice, beta: BETA, overrelaxation: 1, rng })
  }

  const loops: [number, number][] = []
  const boltzmann: number[] = []
  const configurations: GaugeLattice[] = []

  let accepted = 0

  for (let k = 0; k < input.trajectories; k++) {
    const result = hmcTrajectory({
      lattice,
      beta: BETA,
      mass: input.dynamical ? MASS : null,
      step: 0.04,
      steps: 25,
      tolerance: 1e-10,
      rng,
    })

    if (k < 20) {
      continue
    }

    accepted += result.accepted ? 1 : 0
    boltzmann.push(Math.exp(-result.deltaH))
    loops.push(polyakovLoop({ lattice }))

    if (k % 10 === 0) {
      configurations.push(cloneGaugeLattice({ lattice }))
    }
  }

  const count = loops.length
  const mean = (list: readonly number[]): number =>
    list.reduce((a, b) => a + b, 0) / list.length

  return {
    realPart: jackknife({
      samples: loops,
      estimator: s => mean(s.map(p => p[0])),
      binSize: BIN,
    }),
    modulus: jackknife({
      samples: loops,
      estimator: s => mean(s.map(p => Math.hypot(p[0], p[1]))),
      binSize: BIN,
    }),
    acceptance: accepted / count,
    creutz: jackknife({
      samples: boltzmann,
      estimator: mean,
      binSize: BIN,
    }),
    configurations,
  }
}

function logDeterminantShift(input: {
  lattice: GaugeLattice
  mass: number
}): number {
  const rotated = cloneGaugeLattice({ lattice: input.lattice })

  centerTransformTimeSlice({ lattice: rotated, slice: 0, k: 1 })

  return (
    evenLogDeterminant({
      operator: makeStaggeredOperator({ lattice: rotated }),
      mass: input.mass,
    }) -
    evenLogDeterminant({
      operator: makeStaggeredOperator({ lattice: input.lattice }),
      mass: input.mass,
    })
  )
}

export default experiment({
  id: 'gauge/dynamical-quarks',
  code: 'E-FRC-0090',
  title:
    'dynamical quarks break the string: with quarks the Polyakov loop is real, nonzero and independent of the volume, and the quark determinant weights the center sectors of SU(3) unequally, where the pure gauge theory gives zero and exact degeneracy',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const dynamicalSmall = run({
      spatial: 4,
      dynamical: true,
      trajectories: 100,
      seed: 900,
    })
    const dynamicalLarge = run({
      spatial: 6,
      dynamical: true,
      trajectories: 80,
      seed: 901,
    })
    const quenchedSmall = run({
      spatial: 4,
      dynamical: false,
      trajectories: 160,
      seed: 902,
    })
    const quenchedLarge = run({
      spatial: 6,
      dynamical: false,
      trajectories: 160,
      seed: 903,
    })

    // the exact sector weight on the thermalized dynamical configurations of the small box
    const shifts = dynamicalSmall.configurations.map(lattice =>
      logDeterminantShift({ lattice, mass: MASS }),
    )
    const meanShift = shifts.reduce((a, b) => a + b, 0) / shifts.length
    const gaugeShift = Math.max(
      ...dynamicalSmall.configurations.map(lattice => {
        const rotated = cloneGaugeLattice({ lattice })

        centerTransformTimeSlice({ lattice: rotated, slice: 0, k: 1 })

        return Math.abs(
          wilsonAction({ lattice: rotated, beta: BETA }) -
            wilsonAction({ lattice, beta: BETA }),
        )
      }),
    )

    // the determinant against the hopping expansion, at a mass large enough for the leading term
    const probe =
      dynamicalSmall.configurations[0] ??
      makeGaugeLattice({
        group: 'su3',
        lengths: [4, 4, 4, 2],
        start: 'cold',
        rng: makeWeyl({ start: 1 }),
      })
    const heavy = 64
    const rotatedProbe = cloneGaugeLattice({ lattice: probe })

    centerTransformTimeSlice({ lattice: rotatedProbe, slice: 0, k: 1 })

    const hoppingPrediction =
      hoppingWindingTerm({ lattice: rotatedProbe }) -
      hoppingWindingTerm({ lattice: probe })
    const hoppingMeasured =
      heavy *
      heavy *
      logDeterminantShift({ lattice: probe, mass: heavy })
    const hoppingAgreement = hoppingMeasured / hoppingPrediction - 1

    const volumeRatio =
      dynamicalLarge.realPart.value / dynamicalSmall.realPart.value
    const quenchedRatio =
      quenchedSmall.modulus.value / quenchedLarge.modulus.value

    const screened =
      dynamicalSmall.realPart.value >
        10 * dynamicalSmall.realPart.error &&
      dynamicalLarge.realPart.value >
        10 * dynamicalLarge.realPart.error &&
      Math.abs(volumeRatio - 1) < 0.15
    const quenchedVanishes = quenchedRatio > 1.4 && quenchedRatio < 2.4
    const sectorsSplit =
      meanShift < -5 && shifts.every(s => s < 0) && gaugeShift < 1e-9
    const determinantExact = Math.abs(hoppingAgreement) < 0.05
    const hmcExact =
      [dynamicalSmall, dynamicalLarge].every(
        r => Math.abs(r.creutz.value - 1) < 3 * r.creutz.error + 0.02,
      ) &&
      dynamicalSmall.acceptance > 0.7 &&
      dynamicalLarge.acceptance > 0.7
    const ok =
      screened &&
      quenchedVanishes &&
      sectorsSplit &&
      determinantExact &&
      hmcExact

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with four staggered tastes of dynamical quarks the Polyakov loop is real and nonzero with the same value on 4^3 x 2 and 6^3 x 2 (a screened, finite-energy static quark), a center rotation lowers the quark determinant by a factor exp(-|shift|) computed exactly, and the quenched loop instead falls like 1 / sqrt(V) with the sectors exactly degenerate',
      metrics: {
        dynamicalRealPSmall: dynamicalSmall.realPart.value,
        dynamicalRealPSmallError: dynamicalSmall.realPart.error,
        dynamicalRealPLarge: dynamicalLarge.realPart.value,
        dynamicalRealPLargeError: dynamicalLarge.realPart.error,
        dynamicalVolumeRatio: volumeRatio,
        meanLogDeterminantShift: meanShift,
        largestLogDeterminantShift: Math.max(...shifts),
        hoppingAgreement,
        acceptanceSmall: dynamicalSmall.acceptance,
        acceptanceLarge: dynamicalLarge.acceptance,
        creutzEqualitySmall: dynamicalSmall.creutz.value,
        creutzEqualityLarge: dynamicalLarge.creutz.value,
      },
      control: {
        quenchedModulusSmall: quenchedSmall.modulus.value,
        quenchedModulusLarge: quenchedLarge.modulus.value,
        quenchedVolumeRatio: quenchedRatio,
        quenchedVolumeRatioPredicted: 1.5 ** 1.5,
        gaugeActionShiftUnderRotation: gaugeShift,
      },
      notes:
        'L2, known physics. Four staggered tastes without rooting (one staggered field), quark mass 0.1 in lattice units, N_t = 2 at beta 4.2. At N_t = 2 the temperature is 1 / (2a), so this is the screening of a static charge at the coarsest thermal lattice, not the zero-temperature string breaking of the static potential, which needs large Wilson loops and was out of reach. The large Re P also means the quarks may have pushed this box into its deconfined phase, which the claim does not need: it is about the volume dependence and the sector weights, both of which hold either way. The hopping check uses one configuration at mass 64, where the next order is below one percent.',
    })
  },
})
