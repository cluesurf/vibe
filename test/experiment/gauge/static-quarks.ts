// The static quark potential, the scale it sets, and the lightest glueball, from two SU(3) ensembles
// with APE-smeared spatial links (the smearing lifts the overlap with the flux tube and the glueball,
// never touches time, so every correlator is still one of the true transfer matrix).
//
// - E-FRC-0087, the potential. V(R) from static Wilson loops at beta 5.7 on 10^4 (1.7 fm), fit to the
//   Cornell form V0 - e G(R) + sigma R with G the lattice Coulomb term. The string tension must be
//   positive (confinement), the Coulomb coefficient must be compatible with pi / 12, the zero-point
//   energy of a vibrating string (Luscher 1981), and the ground state must be isolated (V from T = 2
//   and T = 3 agree). Control: the U(1) photon in its Coulomb phase through the same code has no
//   string tension.
// - E-FRC-0088, the scale. The Sommer scale r0, defined by r0^2 F(r0) = 1.65 (r0 near 0.5 fm), at
//   beta 5.7 and 5.9, against the published Necco-Sommer values 2.938 and 4.48. The ratio says how
//   fast the lattice spacing shrinks as beta rises. Two-loop running in the bare coupling predicts a
//   much slower shrink (the known failure of asymptotic scaling here), and two-loop running in the
//   coupling read off the measured plaquette (the E-scheme) must reproduce it.
// - E-FRC-0089, the glueball. The 0++ operator (smeared spatial plaquettes per time slice) at three
//   smearing depths, and the variational ground state of its correlator matrix: a mass gap in a
//   theory of massless gluons, in units of r0, against the continuum value m r0 = 4.21 (Morningstar
//   and Peardon 1999).
//
// Grade L2: textbook lattice results reproduced. The ensembles come from the seeded heatbath, the
// sampling stand-in for the thermal ensemble (E-FRC-0092 shows the deterministic dynamics reaches the
// same ensemble). Errors are binned jackknife over configurations.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  GaugeGroup,
  makeGaugeLattice,
  sampleGaugeEnsemble,
} from '@/code/dynamics/gauge-lattice'
import { apeSmear } from '@/code/dynamics/gauge-smearing'
import {
  averagePlaquette,
  connectedCorrelatorMatrix,
  connectedSliceCorrelator,
  spatialPlaquetteSlices,
  staticWilsonLoops,
} from '@/code/measure/lattice-gauge-observable'
import { generalizedEigenvalues } from '@/code/algebra/linear/generalized-eigen'
import { averageSeries, jackknife } from '@/code/measure/jackknife'
import {
  latticeCoulomb,
  neccoSommerScale,
  potentialAt,
  sommerScale,
} from '@/code/measure/static-potential'
import { weightedLeastSquares } from '@/code/measure/regression'

const MAX_R = 5
const MAX_T = 5
// the effective energy is read from T = 3 to 4, the ground-state plateau is checked against T = 2 to 3
const PLATEAU_T = 3
const BIN = 4
const LUSCHER = Math.PI / 12
// the continuum scalar glueball, m r0 = 4.21 +- 0.11 (Morningstar and Peardon 1999)
const GLUEBALL_R0 = 4.21

// loops from 12 smearing steps, the glueball operator at 4, 12 and 24 steps (the variational basis),
// and the unsmeared plaquette, which defines the E-scheme coupling
type Sample = { loops: number[]; glue: number[][]; plaquette: number }

const ensembles = new Map<string, Sample[]>()

function ensemble(input: {
  group: GaugeGroup
  beta: number
  measurements: number
  seed: number
}): Sample[] {
  const key = `${input.group} ${input.beta}`
  const cached = ensembles.get(key)

  if (cached !== undefined) {
    return cached
  }

  const rng = makeRng({ seed: input.seed })
  const lattice = makeGaugeLattice({ group: input.group, lengths: [10, 10, 10, 10], start: 'cold', rng })
  const samples = sampleGaugeEnsemble({
    lattice,
    beta: input.beta,
    thermalization: 40,
    measurements: input.measurements,
    separation: 2,
    overrelaxation: 2,
    rng,
    measure: current => {
      // one smearing sequence, read at three depths along the way
      const light = apeSmear({ lattice: current, alpha: 0.5, iterations: 4 })
      const medium = apeSmear({ lattice: light, alpha: 0.5, iterations: 8 })
      const heavy = apeSmear({ lattice: medium, alpha: 0.5, iterations: 12 })

      return {
        loops: staticWilsonLoops({ spatial: medium, temporal: current, maxR: MAX_R, maxT: MAX_T + 1 }).flat(),
        glue: [light, medium, heavy].map(level => spatialPlaquetteSlices({ lattice: level })),
        plaquette: averagePlaquette({ lattice: current }),
      }
    },
  })

  ensembles.set(key, samples)

  return samples
}

const COULOMB = Array.from({ length: MAX_R }, (_, i) => latticeCoulomb({ r: i + 1 }))

function table(samples: readonly Sample[]): number[][] {
  const mean = averageSeries({ series: samples.map(s => s.loops) })
  const width = MAX_T + 2

  return Array.from({ length: MAX_R + 1 }, (_, r) =>
    Array.from({ length: width }, (__, t) => mean[r * width + t] ?? 1),
  )
}

// The plateau, chosen by the data: the earliest T >= PLATEAU_T at which the effective energy has
// stopped falling, V(T) and V(T + 1) agreeing within two standard errors at every R. A finer lattice
// needs a later T for the same physical time, and a fixed T there reads excited states into V at
// large R, which inflates sigma and shrinks r0. Cached per ensemble.
const plateaus = new Map<readonly Sample[], number>()

function plateauOf(samples: readonly Sample[]): number {
  const cached = plateaus.get(samples)

  if (cached !== undefined) {
    return cached
  }

  let chosen = MAX_T - 1

  for (let t = PLATEAU_T; t < MAX_T; t++) {
    const settled = Array.from({ length: MAX_R }, (_, i) => i).every(i => {
      const at = (time: number) => (s: readonly Sample[]): number =>
        potentialAt({ table: table(s), t: time, maxR: MAX_R })[i] ?? 0
      const early = jackknife({ samples, estimator: at(t), binSize: BIN })
      const late = jackknife({ samples, estimator: at(t + 1), binSize: BIN })

      return Math.abs(early.value - late.value) < 2 * Math.hypot(early.error, late.error)
    })

    if (settled) {
      chosen = t
      break
    }
  }

  plateaus.set(samples, chosen)

  return chosen
}

// Cornell parameters [V0, e, sigma] from the potential on the plateau of `full`, the whole ensemble,
// so every jackknife subset reads the same T
function cornell(samples: readonly Sample[], full: readonly Sample[] = samples): number[] {
  const v = potentialAt({ table: table(samples), t: plateauOf(full), maxR: MAX_R })
  const fit = weightedLeastSquares({
    rows: v.map((_, i) => [1, -(COULOMB[i] ?? 0), i + 1]),
    ys: v,
    errors: v.map(() => 1),
  })

  return fit.coefficients
}

function scaleOn(full: readonly Sample[]) {
  return (samples: readonly Sample[]): number => {
    const [, e = 0, sigma = 1] = cornell(samples, full)

    return sommerScale({ coulomb: e, tension: sigma })
  }
}

function pull(a: { value: number; error: number }, b: number): number {
  return (a.value - b) / a.error
}

const strong = (): Sample[] => ensemble({ group: 'su3', beta: 5.7, measurements: 80, seed: 870 })
// the second coupling for the scale, far enough from 5.7 that the ratio of spacings is resolved
const HIGH_BETA = 5.9

export default experiment({
  id: 'gauge/static-potential',
  code: 'E-FRC-0087',
  title:
    'the SU(3) static potential rises linearly (a string tension) with a Coulomb coefficient compatible with the pi / 12 of a vibrating string, while the U(1) photon through the same code has no string tension',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const samples = strong()
    const photon = ensemble({ group: 'u1', beta: 1.5, measurements: 60, seed: 871 })
    const coefficient = (index: number, full: readonly Sample[]) => (s: readonly Sample[]): number =>
      cornell(s, full)[index] ?? 0
    const e = jackknife({ samples, estimator: coefficient(1, samples), binSize: BIN })
    const sigma = jackknife({ samples, estimator: coefficient(2, samples), binSize: BIN })
    const photonSigma = jackknife({ samples: photon, estimator: coefficient(2, photon), binSize: BIN })
    const plateau = plateauOf(samples)
    // the ground state is isolated: V from T = 2 to 3 and from T = 3 to 4 agree at every R <= 3
    const plateauPulls = [1, 2, 3].map(r => {
      const at = (t: number) => (s: readonly Sample[]): number =>
        potentialAt({ table: table(s), t, maxR: MAX_R })[r - 1] ?? 0
      const early = jackknife({ samples, estimator: at(plateau), binSize: BIN })
      const late = jackknife({ samples, estimator: at(plateau + 1), binSize: BIN })

      return (early.value - late.value) / Math.hypot(early.error, late.error)
    })
    const potential = potentialAt({ table: table(samples), t: plateau, maxR: MAX_R })

    const confines = sigma.value > 5 * sigma.error
    const luscher = Math.abs(pull(e, LUSCHER)) < 3 && e.value > 0
    const isolated = plateauPulls.every(p => Math.abs(p) < 3)
    const photonFree = Math.abs(photonSigma.value) < 3 * photonSigma.error + 0.1 * sigma.value
    const ok = confines && luscher && isolated && photonFree

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'at beta 5.7 the static potential rises linearly with a string tension resolved at more than five standard errors and a Coulomb coefficient compatible with pi / 12, with the ground state isolated by the smearing, while the U(1) photon has no string tension',
      metrics: {
        potentialAtR1: potential[0] ?? 0,
        potentialAtR3: potential[2] ?? 0,
        potentialAtR5: potential[4] ?? 0,
        stringTension: sigma.value,
        stringTensionError: sigma.error,
        coulombCoefficient: e.value,
        coulombCoefficientError: e.error,
        luscherValue: LUSCHER,
        luscherPull: pull(e, LUSCHER),
        largestPlateauPull: Math.max(...plateauPulls.map(Math.abs)),
        plateauTime: plateau,
      },
      control: {
        photonStringTension: photonSigma.value,
        photonStringTensionError: photonSigma.error,
      },
      notes:
        'L2, known physics. The fit runs over R = 1 to 5 with the lattice Coulomb term, uncorrelated, with jackknife errors. At R of 1 to 5 lattice spacings (0.17 to 0.85 fm) the Coulomb coefficient mixes the long-distance string value pi / 12 with the short-distance one-gluon exchange, so compatibility with pi / 12 is a consistency check and not a clean measurement of the Luscher term, which needs R well above 0.5 fm and far larger boxes.',
    })
  },
})

experiment({
  id: 'gauge/scale-setting',
  code: 'E-FRC-0088',
  title:
    'the Sommer scale r0 / a at beta 5.7 and 5.9 matches the published Necco-Sommer values, and two-loop running reproduces how fast the spacing shrinks once the coupling is read off the plaquette, where the bare coupling falls short',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const lowSamples = strong()
    const highSamples = ensemble({ group: 'su3', beta: HIGH_BETA, measurements: 80, seed: 872 })
    const low = jackknife({ samples: lowSamples, estimator: scaleOn(lowSamples), binSize: BIN })
    const high = jackknife({ samples: highSamples, estimator: scaleOn(highSamples), binSize: BIN })
    const publishedLow = neccoSommerScale({ beta: 5.7 })
    const publishedHigh = neccoSommerScale({ beta: HIGH_BETA })
    const ratio = {
      value: high.value / low.value,
      error: (high.value / low.value) * Math.hypot(high.error / high.value, low.error / low.value),
    }
    const publishedRatio = publishedHigh / publishedLow
    // two-loop running, a Lambda = (b0 g^2)^(-b1 / 2 b0^2) exp(-1 / (2 b0 g^2)), in two couplings:
    // the bare g^2 = 6 / beta, and the E-scheme g^2_E = 3 (1 - P) read off the measured plaquette,
    // which at tree level is the same number (1 - P = C_F g^2 / 4 with C_F = 4/3) and absorbs the
    // large lattice tadpole corrections the bare coupling carries (Parisi 1980)
    const b0 = 11 / (16 * Math.PI ** 2)
    const b1 = 102 / (16 * Math.PI ** 2) ** 2
    const spacing = (g2: number): number =>
      (b0 * g2) ** (-b1 / (2 * b0 * b0)) * Math.exp(-1 / (2 * b0 * g2))
    const bareRatio = spacing(6 / 5.7) / spacing(6 / HIGH_BETA)
    const plaquetteOf = (s: readonly Sample[]): number =>
      s.reduce((sum, x) => sum + x.plaquette, 0) / s.length
    const schemeRatio = spacing(3 * (1 - plaquetteOf(lowSamples))) / spacing(3 * (1 - plaquetteOf(highSamples)))

    const matchesLow = Math.abs(pull(low, publishedLow)) < 3
    const matchesHigh = Math.abs(pull(high, publishedHigh)) < 3
    const shrinks = ratio.value > 1 + 3 * ratio.error
    // the E-scheme two-loop prediction agrees with the measured ratio, the bare one is further off
    const schemePull = pull(ratio, schemeRatio)
    const barePull = pull(ratio, bareRatio)
    const schemeWorks = Math.abs(schemePull) < 3 && Math.abs(schemeRatio / publishedRatio - 1) < 0.08
    const ok = matchesLow && matchesHigh && shrinks && schemeWorks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'r0 / a from the Cornell fit agrees with the published Necco-Sommer scale at beta 5.7 and 5.9, the spacing shrinks between them by the published ratio, and two-loop running reproduces that ratio once the coupling is read off the measured plaquette (E-scheme) while the bare coupling falls well short',
      metrics: {
        r0At57: low.value,
        r0At57Error: low.error,
        r0At59: high.value,
        r0At59Error: high.error,
        spacingRatio: ratio.value,
        spacingRatioError: ratio.error,
        pullAt57: pull(low, publishedLow),
        pullAt59: pull(high, publishedHigh),
        plateauTimeAt57: plateauOf(lowSamples),
        plateauTimeAt59: plateauOf(highSamples),
        plaquetteAt57: plaquetteOf(lowSamples),
        plaquetteAt59: plaquetteOf(highSamples),
        eSchemeTwoLoopRatio: schemeRatio,
        eSchemePull: schemePull,
      },
      control: {
        publishedAt57: publishedLow,
        publishedAt59: publishedHigh,
        publishedRatio,
        bareTwoLoopRatio: bareRatio,
        barePull,
      },
      notes:
        'L2, known physics: scale setting with the Sommer scale, and the E-scheme remedy for asymptotic scaling. The published values are the reference, never an input. The bare two-loop ratio is known to undershoot at these couplings (the lattice coupling carries large tadpole terms), and its pull is reported, not gated. 10^4 at beta 5.9 is 2.2 r0 across, enough for r0 but not for a long-distance potential.',
    })
  },
})

experiment({
  id: 'gauge/scalar-glueball',
  code: 'E-FRC-0089',
  title:
    'pure SU(3) gauge theory has a mass gap: the 0++ glueball correlator decays exponentially with a mass m r0 compatible with the continuum 4.21',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const samples = strong()

    // the variational mass: the largest generalized eigenvalue of C(1) against C(0) over the three
    // smearing levels is exp(-m) for the ground state, with the excited states projected out
    const variational = (s: readonly Sample[]): number => {
      const slices = s.map(x => x.glue)
      const lambda = generalizedEigenvalues({
        a: connectedCorrelatorMatrix({ slices, t: 1 }),
        b: connectedCorrelatorMatrix({ slices, t: 0 }),
      })

      return -Math.log(Math.max(...lambda))
    }

    // the single-operator effective mass at the middle smearing level, for comparison
    const single = (s: readonly Sample[]): number => {
      const c = connectedSliceCorrelator({ slices: s.map(x => x.glue[1] ?? []) })

      return Math.log((c[0] ?? 0) / (c[1] ?? 1))
    }

    const mass = jackknife({ samples, estimator: variational, binSize: BIN })
    const singleMass = jackknife({ samples, estimator: single, binSize: BIN })
    const r0 = jackknife({ samples, estimator: scaleOn(samples), binSize: BIN })
    const massR0 = {
      value: mass.value * r0.value,
      error: mass.value * r0.value * Math.hypot(mass.error / mass.value, r0.error / r0.value),
    }

    const gapped = mass.value > 5 * mass.error
    const matches = Math.abs(pull(massR0, GLUEBALL_R0)) < 3
    // a variational bound lies at or below any single operator effective mass
    const bounded = mass.value <= singleMass.value + 2 * singleMass.error
    const ok = gapped && matches && bounded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 0++ correlator matrix over three smearing levels gives a variational ground-state mass resolved at more than five standard errors, at or below the single-operator effective mass, with m r0 compatible with the continuum scalar glueball 4.21',
      metrics: {
        glueballMass: mass.value,
        glueballMassError: mass.error,
        glueballMassR0: massR0.value,
        glueballMassR0Error: massR0.error,
        singleOperatorMass: singleMass.value,
        singleOperatorMassError: singleMass.error,
      },
      control: {
        continuumMassR0: GLUEBALL_R0,
        pull: pull(massR0, GLUEBALL_R0),
      },
      notes:
        'L2, known physics, and the least precise of these results. Only t = 0 to 1 is resolved by 80 configurations, so even the variational mass holds some excited state (the variational method only projects within the three-operator basis), at one coarse lattice spacing where the scalar glueball is known to dip below its continuum value. Compatibility with 4.21 is a consistency check within its errors. The r0 is this ensemble own, from the E-FRC-0087 fit.',
    })
  },
})
