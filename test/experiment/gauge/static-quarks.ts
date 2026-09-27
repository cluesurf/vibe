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
// - E-FRC-0089, the glueball. A mass gap in a theory of massless gluons. The first version read the
//   variational ground state of smeared spatial plaquettes at 4, 12 and 24 APE steps on the 80
//   configurations above, from t = 0 to 1 only, and gave m a = 1.25 +- 0.13, m r0 = 4.05 +- 0.50,
//   compatible with the continuum 4.21. That basis was smeared too far: the overlap C(1) / C(0) falls
//   as the smearing deepens past four steps, so its t = 0 to 1 mass still held excited states. It is
//   now read from a dedicated ensemble of 400 configurations on the same 10^4 box, one update apart,
//   with a twelve-operator basis (APE depth 1, 2, 4 and 7, times 1 x 1, 1 x 2 and 2 x 2 spatial
//   loops, all 0++). The generalized eigenproblem at t = 0, 1 fixes the ground-state vector once,
//   and the projected correlator is read at t = 0 to 1 and again at t = 1 to 2, where it must agree:
//   the plateau. The precise mass lands where the published Wilson-action lattice mass at beta 5.7
//   sits (a m = 0.974 +- 0.029, Teper 1998, Table 18), which is m r0 near 2.85 with the published
//   r0, well below the continuum 4.21 (Morningstar and Peardon 1999). That is the known scalar dip of
//   the Wilson action at a = 0.17 fm (Hasenbusch and Necco 2004 put the lattice artifact there near
//   40 percent). So the claim is now the one the data supports: the gap matches the lattice value at
//   this coupling, and the continuum value is reported with its pull and not gated, because one
//   coarse spacing cannot reach it.
//
// Grade L2: textbook lattice results reproduced. The ensembles come from the seeded heatbath, the
// sampling stand-in for the thermal ensemble (E-FRC-0092 shows the deterministic dynamics reaches the
// same ensemble). Errors are binned jackknife over configurations.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
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
import {
  projectedCorrelator,
  spatialLoopSlices,
} from '@/code/measure/glueball-basis'

const MAX_R = 5
const MAX_T = 5
// the effective energy is read from T = 3 to 4, the ground-state plateau is checked against T = 2 to 3
const PLATEAU_T = 3
const BIN = 4
const LUSCHER = Math.PI / 12
// the continuum scalar glueball, m r0 = 4.21 +- 0.11 (Morningstar and Peardon 1999)
const GLUEBALL_R0 = 4.21
// the Wilson-action scalar glueball at beta 5.7 in lattice units, a m = 0.974 +- 0.029 (the
// compilation of Teper 1998, hep-th/9812187, Table 18, the first of its two beta 5.7 rows; the other
// is 0.90 +- 0.04, from a different source)
const GLUEBALL_LATTICE_57 = 0.974
const GLUEBALL_LATTICE_57_ERROR = 0.029
// the glueball basis: APE depths times spatial loop shapes, twelve 0++ operators
const GLUE_DEPTHS = [1, 2, 4, 7]
const GLUE_SHAPES = [
  [1, 1],
  [1, 2],
  [2, 2],
]
const GLUE_CONFIGURATIONS = 400
// measurements one update apart are correlated: in a trial ensemble the t = 1 to 2 error grew from
// 0.22 at bins of 20 to 0.27 at bins of 40, so the bins are 40 long (10 bins, which leaves the error
// itself uncertain by about a quarter)
const GLUE_BIN = 40

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

  const rng = makeWeyl({ start: input.seed })
  const lattice = makeGaugeLattice({
    group: input.group,
    lengths: [10, 10, 10, 10],
    start: 'cold',
    rng,
  })
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
      const light = apeSmear({
        lattice: current,
        alpha: 0.5,
        iterations: 4,
      })
      const medium = apeSmear({
        lattice: light,
        alpha: 0.5,
        iterations: 8,
      })
      const heavy = apeSmear({
        lattice: medium,
        alpha: 0.5,
        iterations: 12,
      })

      return {
        loops: staticWilsonLoops({
          spatial: medium,
          temporal: current,
          maxR: MAX_R,
          maxT: MAX_T + 1,
        }).flat(),
        glue: [light, medium, heavy].map(level =>
          spatialPlaquetteSlices({ lattice: level }),
        ),
        plaquette: averagePlaquette({ lattice: current }),
      }
    },
  })

  ensembles.set(key, samples)

  return samples
}

const COULOMB = Array.from({ length: MAX_R }, (_, i) =>
  latticeCoulomb({ r: i + 1 }),
)

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
    const settled = Array.from({ length: MAX_R }, (_, i) => i).every(
      i => {
        const at =
          (time: number) =>
          (s: readonly Sample[]): number =>
            potentialAt({ table: table(s), t: time, maxR: MAX_R })[i] ??
            0
        const early = jackknife({
          samples,
          estimator: at(t),
          binSize: BIN,
        })
        const late = jackknife({
          samples,
          estimator: at(t + 1),
          binSize: BIN,
        })

        return (
          Math.abs(early.value - late.value) <
          2 * Math.hypot(early.error, late.error)
        )
      },
    )

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
function cornell(
  samples: readonly Sample[],
  full: readonly Sample[] = samples,
): number[] {
  const v = potentialAt({
    table: table(samples),
    t: plateauOf(full),
    maxR: MAX_R,
  })
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

const strong = (): Sample[] =>
  ensemble({ group: 'su3', beta: 5.7, measurements: 80, seed: 870 })
// the second coupling for the scale, far enough from 5.7 that the ratio of spacings is resolved
const HIGH_BETA = 5.9

// The dedicated glueball ensemble at beta 5.7 on the same 10^4 box: per configuration, the twelve
// operators [depth x shape][t]. Built once per process.
let glueSamples: number[][][] | undefined

function glueballEnsemble(): number[][][] {
  if (glueSamples === undefined) {
    const rng = makeWeyl({ start: 873 })
    const lattice = makeGaugeLattice({
      group: 'su3',
      lengths: [10, 10, 10, 10],
      start: 'cold',
      rng,
    })

    glueSamples = sampleGaugeEnsemble({
      lattice,
      beta: 5.7,
      thermalization: 40,
      measurements: GLUE_CONFIGURATIONS,
      separation: 1,
      overrelaxation: 2,
      rng,
      measure: current => {
        const operators: number[][] = []
        let smeared = current
        let done = 0

        for (const depth of GLUE_DEPTHS) {
          smeared = apeSmear({
            lattice: smeared,
            alpha: 0.5,
            iterations: depth - done,
          })
          done = depth

          for (const [width = 1, height = 1] of GLUE_SHAPES) {
            operators.push(
              spatialLoopSlices({ lattice: smeared, width, height }),
            )
          }
        }

        return operators
      },
    })
  }

  return glueSamples
}

// the effective mass ln(c(t) / c(t + 1)) of the basis projected on its variational ground state
function projectedMass(t: number) {
  return (s: readonly number[][][]): number => {
    const c = projectedCorrelator({
      slices: s,
      t0: 0,
      t1: 1,
      maxT: t + 1,
    })

    return Math.log((c[t] ?? 0) / (c[t + 1] ?? 1))
  }
}

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
    const photon = ensemble({
      group: 'u1',
      beta: 1.5,
      measurements: 60,
      seed: 871,
    })
    const coefficient =
      (index: number, full: readonly Sample[]) =>
      (s: readonly Sample[]): number =>
        cornell(s, full)[index] ?? 0
    const e = jackknife({
      samples,
      estimator: coefficient(1, samples),
      binSize: BIN,
    })
    const sigma = jackknife({
      samples,
      estimator: coefficient(2, samples),
      binSize: BIN,
    })
    const photonSigma = jackknife({
      samples: photon,
      estimator: coefficient(2, photon),
      binSize: BIN,
    })
    const plateau = plateauOf(samples)
    // the ground state is isolated: V from T = 2 to 3 and from T = 3 to 4 agree at every R <= 3
    const plateauPulls = [1, 2, 3].map(r => {
      const at =
        (t: number) =>
        (s: readonly Sample[]): number =>
          potentialAt({ table: table(s), t, maxR: MAX_R })[r - 1] ?? 0
      const early = jackknife({
        samples,
        estimator: at(plateau),
        binSize: BIN,
      })
      const late = jackknife({
        samples,
        estimator: at(plateau + 1),
        binSize: BIN,
      })

      return (
        (early.value - late.value) / Math.hypot(early.error, late.error)
      )
    })
    const potential = potentialAt({
      table: table(samples),
      t: plateau,
      maxR: MAX_R,
    })

    const confines = sigma.value > 5 * sigma.error
    const luscher = Math.abs(pull(e, LUSCHER)) < 3 && e.value > 0
    const isolated = plateauPulls.every(p => Math.abs(p) < 3)
    const photonFree =
      Math.abs(photonSigma.value) <
      3 * photonSigma.error + 0.1 * sigma.value
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
    const highSamples = ensemble({
      group: 'su3',
      beta: HIGH_BETA,
      measurements: 80,
      seed: 872,
    })
    const low = jackknife({
      samples: lowSamples,
      estimator: scaleOn(lowSamples),
      binSize: BIN,
    })
    const high = jackknife({
      samples: highSamples,
      estimator: scaleOn(highSamples),
      binSize: BIN,
    })
    const publishedLow = neccoSommerScale({ beta: 5.7 })
    const publishedHigh = neccoSommerScale({ beta: HIGH_BETA })
    const ratio = {
      value: high.value / low.value,
      error:
        (high.value / low.value) *
        Math.hypot(high.error / high.value, low.error / low.value),
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
    const schemeRatio =
      spacing(3 * (1 - plaquetteOf(lowSamples))) /
      spacing(3 * (1 - plaquetteOf(highSamples)))

    const matchesLow = Math.abs(pull(low, publishedLow)) < 3
    const matchesHigh = Math.abs(pull(high, publishedHigh)) < 3
    const shrinks = ratio.value > 1 + 3 * ratio.error
    // the E-scheme two-loop prediction agrees with the measured ratio, the bare one is further off
    const schemePull = pull(ratio, schemeRatio)
    const barePull = pull(ratio, bareRatio)
    const schemeWorks =
      Math.abs(schemePull) < 3 &&
      Math.abs(schemeRatio / publishedRatio - 1) < 0.08
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
    'pure SU(3) gauge theory has a mass gap: the variational 0++ glueball mass, on a plateau from t = 0 to 2, matches the published Wilson-action lattice mass at beta 5.7, and sits below the continuum m r0 = 4.21 by the known scalar dip of a coarse lattice',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const samples = strong()
    const glue = glueballEnsemble()

    // the twelve-operator basis, projected once on its ground state at t = 0, 1
    const mass = jackknife({
      samples: glue,
      estimator: projectedMass(0),
      binSize: GLUE_BIN,
    })
    const plateauMass = jackknife({
      samples: glue,
      estimator: projectedMass(1),
      binSize: GLUE_BIN,
    })
    const lateMass = jackknife({
      samples: glue,
      estimator: projectedMass(2),
      binSize: GLUE_BIN,
    })
    // the best single operator of the basis (depth 4, 2 x 2), which a variational mass may not exceed
    const bestSingle = GLUE_SHAPES.length * 2 + 2
    const singleMass = jackknife({
      samples: glue,
      estimator: s => {
        const c = connectedSliceCorrelator({
          slices: s.map(x => x[bestSingle] ?? []),
        })

        return Math.log((c[0] ?? 0) / (c[1] ?? 1))
      },
      binSize: GLUE_BIN,
    })
    const r0 = jackknife({
      samples,
      estimator: scaleOn(samples),
      binSize: BIN,
    })
    const inR0 = (m: { value: number; error: number }) => ({
      value: m.value * r0.value,
      error:
        m.value *
        r0.value *
        Math.hypot(m.error / m.value, r0.error / r0.value),
    })
    const massR0 = inR0(mass)
    const plateauMassR0 = inR0(plateauMass)

    // the first version, kept as a control: three plaquette operators at 4, 12 and 24 APE steps on
    // the 80 configurations of E-FRC-0087, t = 0 to 1
    const firstBasis = (s: readonly Sample[]): number => {
      const slices = s.map(x => x.glue)
      // the largest generalized eigenvalue of C(1) against C(0) is exp(-m) for the ground state
      const lambda = generalizedEigenvalues({
        a: connectedCorrelatorMatrix({ slices, t: 1 }),
        b: connectedCorrelatorMatrix({ slices, t: 0 }),
      })

      return -Math.log(Math.max(...lambda))
    }
    const firstMass = jackknife({
      samples,
      estimator: firstBasis,
      binSize: BIN,
    })
    const firstMassR0 = inR0(firstMass)
    const lattice = {
      value: GLUEBALL_LATTICE_57,
      error: GLUEBALL_LATTICE_57_ERROR,
    }
    const latticePull =
      (mass.value - lattice.value) / Math.hypot(mass.error, lattice.error)
    const plateauPull =
      (mass.value - plateauMass.value) /
      Math.hypot(mass.error, plateauMass.error)

    const gapped = mass.value > 5 * mass.error
    // the plateau: the projected correlator is resolved from t = 1 to 2 and agrees with t = 0 to 1
    const plateau =
      plateauMass.value > 3 * plateauMass.error && Math.abs(plateauPull) < 2
    // a variational bound lies at or below any single operator effective mass
    const bounded =
      mass.value <= singleMass.value + 2 * singleMass.error
    const matches = Math.abs(latticePull) < 3
    const ok = gapped && plateau && bounded && matches

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 0++ correlator matrix over twelve operators (four smearing depths, three loop shapes) gives a variational ground-state mass resolved at more than five standard errors, on a plateau (t = 1 to 2 resolved at three standard errors and agreeing with t = 0 to 1 within two), at or below the best single operator, and compatible with the published Wilson-action lattice mass a m = 0.974 +- 0.029 at beta 5.7, with m r0 against the continuum 4.21 reported and not gated',
      metrics: {
        glueballMass: mass.value,
        glueballMassError: mass.error,
        glueballMassR0: massR0.value,
        glueballMassR0Error: massR0.error,
        plateauMassT1To2: plateauMass.value,
        plateauMassT1To2Error: plateauMass.error,
        plateauMassR0: plateauMassR0.value,
        plateauMassR0Error: plateauMassR0.error,
        plateauPull,
        lateMassT2To3: lateMass.value,
        lateMassT2To3Error: lateMass.error,
        singleOperatorMass: singleMass.value,
        singleOperatorMassError: singleMass.error,
        r0: r0.value,
        r0Error: r0.error,
        configurations: glue.length,
      },
      control: {
        publishedLatticeMassAt57: GLUEBALL_LATTICE_57,
        publishedLatticeMassAt57Error: GLUEBALL_LATTICE_57_ERROR,
        latticePull,
        continuumMassR0: GLUEBALL_R0,
        continuumPull: pull(massR0, GLUEBALL_R0),
        firstBasisMass: firstMass.value,
        firstBasisMassError: firstMass.error,
        firstBasisMassR0: firstMassR0.value,
        firstBasisMassR0Error: firstMassR0.error,
      },
      notes:
        'L2, known physics. 400 configurations of 10^4 at beta 5.7, one update apart, binned by 40. The mass is the t = 0 to 1 effective mass of the correlator projected on the variational ground state, and the t = 1 to 2 mass is the plateau check (t = 2 to 3 is reported, and is noise at this statistics). Quoting the t = 1 to 2 mass itself to the same precision as the t = 0 to 1 one would take roughly ten times the configurations, several hours here. The first version of this experiment read a basis smeared to 4, 12 and 24 steps from t = 0 to 1 and gave m a = 1.25 +- 0.13, m r0 = 4.05 +- 0.50: the heavy smearing lost overlap and left excited states in, and that version, recomputed here, is the firstBasis control. At a = 0.17 fm the Wilson action puts the scalar glueball far below its continuum value (the scalar dip, about 40 percent, Hasenbusch and Necco 2004), so the comparison that tests this code is the published lattice mass at the same coupling, in lattice units with no scale needed, and the continuum pull measures the dip, not an error. The r0 is the E-FRC-0087 ensemble own.',
    })
  },
})
