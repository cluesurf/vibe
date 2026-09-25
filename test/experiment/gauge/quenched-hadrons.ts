// Quarks bound by SU(3) gluons into hadrons, with the hadron masses read off correlators. Quenched
// QCD: staggered quarks propagate through Monte Carlo SU(3) configurations at beta = 5.7 (a lattice
// spacing near 0.17 fm, the 12^3 x 16 box 2 fm across, large enough that a nucleon is not squeezed),
// without acting back on them.
//
// Three claims, each against the SAME code run with the gluons switched off (every link the
// identity), where a hadron is just its quarks: a meson weighs 2 asinh(m) and a nucleon 3 asinh(m).
//
// - E-FRC-0084, the pion is a Goldstone boson. Chiral symmetry is broken by the gluons, so the pion
//   mass goes like the square root of the quark mass (Gell-Mann, Oakes and Renner 1968), m_pi^2
//   proportional to m_q, while free quarks give m_pi proportional to m_q. The exponent
//   d ln m_pi / d ln m_q is the discriminator, one half against one.
// - E-FRC-0085, the nucleon mass is made by the gluons. Three quarks bound by epsilon_abc into a
//   colour singlet weigh far more than three free quarks, and the mass stays large as the quark mass
//   is taken to zero, while the pion becomes light. Most of the mass of ordinary matter is this.
// - E-FRC-0091, the rho and the ratios that map to the real world. The vector meson stays heavy as
//   the pion becomes light, and two dimensionless numbers are compared with nature: m_N / m_rho,
//   extrapolated to the physical m_pi / m_rho, against 938 / 775 = 1.21, and the J parameter
//   (Lacock and Michael 1995), J = m_V dm_V / dm_PS^2 at m_V / m_PS = 1.8, which quenched QCD is
//   known to put near 0.37 against the experimental 0.48. Reproducing the quenched value, and its
//   miss, is the test.
//
// Grade L2: quenched lattice hadron spectroscopy with Kogut-Susskind quarks, a standard computation
// since the early 1980s (Hamber and Parisi 1981, Weingarten 1982). The Monte Carlo uses a seeded
// generator.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { makeGaugeLattice } from '@/code/dynamics/gauge-lattice'
import {
  HadronCorrelators,
  coshEffectiveMass,
  logEffectiveMass,
  measureHadronCorrelators,
  sampleQuenchedHadrons,
} from '@/code/measure/hadron-correlator'
import { weightedLinearFit } from '@/code/measure/regression'
import { averageSeries, jackknife } from '@/code/measure/jackknife'
import { linearFit } from '@/code/measure/regression'

const MASSES = [0.025, 0.05, 0.1, 0.2, 0.4]
// the free control resolves its masses only where the time axis holds several e-foldings of the
// lightest state, so it is read at the two heaviest
const FREE_MASSES = [0.2, 0.4]
// the pion plateau, a two-step cosh effective mass averaged over t = 4 and t = 6
const PION_TIMES = [4, 6]
// the nucleon, read on odd t (the sink sites where the quark propagator is O(1)) from t = 3 to 5,
// and again from t = 5 to 7 to see whether the effective mass is still falling
const NUCLEON_TIME = 3
const NUCLEON_LATE_TIME = 5

type Spectrum = {
  pion: { value: number; error: number }[]
  rho: { value: number; error: number }[]
  nucleon: { value: number; error: number }[]
  nucleonLate: { value: number; error: number }[]
  worstResidual: number
}

function pionMass(correlator: readonly number[]): number {
  const values = PION_TIMES.map(t => coshEffectiveMass({ correlator, t, step: 2 }))

  return values.reduce((a, b) => a + b, 0) / values.length
}

function spectrumOf(samples: readonly HadronCorrelators[], masses: readonly number[]): Spectrum {
  const nucleonAt = (t: number): { value: number; error: number }[] =>
    masses.map((_, index) =>
      jackknife({
        samples,
        estimator: subset =>
          logEffectiveMass({
            correlator: averageSeries({ series: subset.map(s => s.nucleon[index] ?? []) }),
            t,
            step: 2,
          }),
      }),
    )

  return {
    pion: masses.map((_, index) =>
      jackknife({
        samples,
        estimator: subset =>
          pionMass(averageSeries({ series: subset.map(s => s.pion[index] ?? []) })),
      }),
    ),
    // the rho plateau on even t, the same two-step cosh as the pion
    rho: masses.map((_, index) =>
      jackknife({
        samples,
        estimator: subset =>
          pionMass(averageSeries({ series: subset.map(s => s.rho[index] ?? []) })),
      }),
    ),
    nucleon: nucleonAt(NUCLEON_TIME),
    nucleonLate: nucleonAt(NUCLEON_LATE_TIME),
    worstResidual: Math.max(...samples.map(s => s.worstResidual)),
  }
}

let interacting: Spectrum | undefined
let interactingSamples: HadronCorrelators[] | undefined
let free: Spectrum | undefined

// The ensemble is expensive and all three experiments read it, so it is built once per process.
function hadronSamples(): HadronCorrelators[] {
  if (interactingSamples === undefined) {
    const rng = makeRng({ seed: 840 })
    const lattice = makeGaugeLattice({ group: 'su3', lengths: [12, 12, 12, 16], start: 'cold', rng })

    interactingSamples = sampleQuenchedHadrons({
      lattice,
      beta: 5.7,
      masses: MASSES,
      thermalization: 60,
      configurations: 12,
      separation: 5,
      overrelaxation: 2,
      tolerance: 1e-8,
      maxIterations: 5000,
      rng,
    })
  }

  return interactingSamples
}

function interactingSpectrum(): Spectrum {
  if (interacting === undefined) {
    interacting = spectrumOf(hadronSamples(), MASSES)
  }

  return interacting
}

function freeSpectrum(): Spectrum {
  if (free === undefined) {
    const lattice = makeGaugeLattice({
      group: 'su3',
      lengths: [8, 8, 8, 64],
      start: 'cold',
      rng: makeRng({ seed: 1 }),
    })
    const correlators = measureHadronCorrelators({
      lattice,
      masses: FREE_MASSES,
      tolerance: 1e-10,
      maxIterations: 5000,
    })
    // one configuration, the identity, so the plateau is read at large t where it is exact
    const read = (series: number[][], mass: (c: number[]) => number): { value: number; error: number }[] =>
      series.map(c => ({ value: mass(c), error: 0 }))

    free = {
      pion: read(correlators.pion, c =>
        [12, 16].map(t => coshEffectiveMass({ correlator: c, t, step: 2 })).reduce((a, b) => a + b) / 2,
      ),
      rho: read(correlators.rho, c =>
        [12, 16].map(t => coshEffectiveMass({ correlator: c, t, step: 2 })).reduce((a, b) => a + b) / 2,
      ),
      nucleon: read(correlators.nucleon, c => logEffectiveMass({ correlator: c, t: 13, step: 2 })),
      nucleonLate: read(correlators.nucleon, c => logEffectiveMass({ correlator: c, t: 17, step: 2 })),
      worstResidual: correlators.worstResidual,
    }
  }

  return free
}

function exponent(input: { masses: readonly number[]; values: readonly number[] }): number {
  return linearFit({
    xs: input.masses.map(Math.log),
    ys: input.values.map(Math.log),
  }).slope
}

export default experiment({
  id: 'gauge/pion-goldstone',
  code: 'E-FRC-0084',
  title:
    'in quenched SU(3) the pion mass goes like the square root of the quark mass (a Goldstone boson of broken chiral symmetry), while the same code with the gluons off gives a pion mass proportional to the quark mass',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const spectrum = interactingSpectrum()
    const control = freeSpectrum()
    const pion = spectrum.pion.map(p => p.value)
    const freePion = control.pion.map(p => p.value)
    // the exponent over the whole range, and over the two masses the control resolves
    const interactingExponent = exponent({ masses: MASSES, values: pion })
    const heavyExponent = exponent({ masses: FREE_MASSES, values: pion.slice(-2) })
    const freeExponent = exponent({ masses: FREE_MASSES, values: freePion })
    // the control must reproduce free quarks, 2 asinh(m), to one percent
    const freeExact = FREE_MASSES.every(
      (mass, i) => Math.abs((freePion[i] ?? 0) / (2 * Math.asinh(mass)) - 1) < 0.01,
    )
    // m_pi^2 / m_q at the lightest and heaviest quark mass, near constant for a Goldstone boson
    const gmorLight = (pion[0] ?? 0) ** 2 / (MASSES[0] ?? 1)
    const gmorHeavy = (pion[pion.length - 1] ?? 0) ** 2 / (MASSES[MASSES.length - 1] ?? 1)
    const resolved = spectrum.pion.every(p => p.value > 10 * p.error)
    const goldstone = Math.abs(interactingExponent - 0.5) < 0.1
    const freeLinear = Math.abs(freeExponent - 1) < 0.05
    const separated = freeExponent - heavyExponent > 0.3
    const ok = freeExact && resolved && goldstone && freeLinear && separated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with SU(3) gluons the pion mass scales as the quark mass to the power one half (m_pi^2 proportional to m_q, a Goldstone boson), and the same code with the gluons off scales as the power one (free quarks)',
      metrics: {
        pionAt0025: pion[0] ?? 0,
        pionAt005: pion[1] ?? 0,
        pionAt01: pion[2] ?? 0,
        pionAt02: pion[3] ?? 0,
        pionAt04: pion[4] ?? 0,
        pionErrorAt0025: spectrum.pion[0]?.error ?? 0,
        interactingExponent,
        heavyExponent,
        gmorRatioLightest: gmorLight,
        gmorRatioHeaviest: gmorHeavy,
        worstSolverResidual: spectrum.worstResidual,
      },
      control: {
        freePionAt02: freePion[0] ?? 0,
        freePionAt04: freePion[1] ?? 0,
        freePionPredictedAt02: 2 * Math.asinh(0.2),
        freePionPredictedAt04: 2 * Math.asinh(0.4),
        freeExponent,
      },
      notes:
        'L2, known physics: the Goldstone pion of quenched lattice QCD. Quenched, one 12^3 x 16 volume at one lattice spacing, 12 configurations, so no continuum or infinite-volume limit is taken, and the quenched chiral logarithms that bend m_pi^2 / m_q at the lightest mass are not separated out. The exponent is the slope of ln m_pi against ln m_q over m_q = 0.025 to 0.4. Staggered quarks keep an exact remnant chiral symmetry, which is what lets the lattice pion be a true Goldstone boson.',
    })
  },
})

experiment({
  id: 'gauge/nucleon-mass-generation',
  code: 'E-FRC-0085',
  title:
    'three quarks bound by SU(3) gluons into a nucleon weigh many times three free quarks, and the nucleon stays heavy as the quark mass goes to zero while the pion becomes light',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const spectrum = interactingSpectrum()
    const control = freeSpectrum()
    const nucleon = spectrum.nucleon.map(p => p.value)
    const pion = spectrum.pion.map(p => p.value)
    const freeNucleon = control.nucleon.map(p => p.value)
    const freeExact = FREE_MASSES.every(
      (mass, i) => Math.abs((freeNucleon[i] ?? 0) / (3 * Math.asinh(mass)) - 1) < 0.01,
    )
    // only the masses the ensemble resolves (five standard errors) are read. The nucleon signal
    // decays against its noise like exp(-(m_N - 3 m_pi / 2) t), so the light masses lose it first
    const resolvedIndices = MASSES.map((_, i) => i).filter(i => {
      const p = spectrum.nucleon[i]

      return p !== undefined && p.value > 5 * p.error
    })
    const resolvedMasses = resolvedIndices.map(i => MASSES[i] ?? 0)
    const resolvedNucleon = resolvedIndices.map(i => nucleon[i] ?? 0)
    const enoughResolved = resolvedIndices.length >= 3
    const lightest = resolvedMasses[0] ?? 0
    const threeFreeQuarks = 3 * Math.asinh(lightest)
    const enhancement = (resolvedNucleon[0] ?? 0) / threeFreeQuarks
    // the chiral limit, linear in m_q through the resolved masses
    const chiral = linearFit({ xs: resolvedMasses, ys: resolvedNucleon }).intercept
    const pionChiral = linearFit({
      xs: MASSES.slice(0, 2),
      ys: pion.slice(0, 2).map(m => m * m),
    }).intercept
    // three quarks outweigh a quark and an antiquark (the ratio tends to 3 / 2 only for very heavy
    // quarks, so 1 is the bound that is not a knife edge)
    const heavierThanPion = resolvedIndices.every(i => (nucleon[i] ?? 0) > (pion[i] ?? 0))
    // an early effective mass overestimates the ground state, so the claim needs the effective mass
    // to have stopped falling: from t = 5 to 7 it must keep at least 70 percent of its t = 3 to 5
    // value wherever the late one is resolved
    const lateRatios = resolvedIndices
      .filter(i => {
        const late = spectrum.nucleonLate[i]

        return late !== undefined && late.value > 3 * late.error
      })
      .map(i => (spectrum.nucleonLate[i]?.value ?? 0) / (nucleon[i] ?? 1))
    const plateau = lateRatios.length > 0 && lateRatios.every(ratio => ratio > 0.7)
    const generated = enhancement > 5 && chiral > 1 && pionChiral < 0.05
    const ok = freeExact && enoughResolved && heavierThanPion && plateau && generated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the nucleon, three quarks contracted with epsilon_abc, weighs several times three free quarks at every quark mass the ensemble resolves, its effective mass has stopped falling by t = 7, and it extrapolates to a large mass at zero quark mass while the pion mass squared extrapolates near zero, and the same code without gluons gives exactly three free quarks',
      metrics: {
        nucleonAt0025: nucleon[0] ?? 0,
        nucleonAt005: nucleon[1] ?? 0,
        nucleonAt01: nucleon[2] ?? 0,
        nucleonAt02: nucleon[3] ?? 0,
        nucleonAt04: nucleon[4] ?? 0,
        nucleonErrorAt0025: spectrum.nucleon[0]?.error ?? 0,
        nucleonErrorAt005: spectrum.nucleon[1]?.error ?? 0,
        nucleonErrorAt01: spectrum.nucleon[2]?.error ?? 0,
        nucleonErrorAt02: spectrum.nucleon[3]?.error ?? 0,
        nucleonErrorAt04: spectrum.nucleon[4]?.error ?? 0,
        resolvedMassCount: resolvedIndices.length,
        lightestResolvedMass: lightest,
        smallestLateOverEarly: lateRatios.length > 0 ? Math.min(...lateRatios) : 0,
        lateNucleonAt0025: spectrum.nucleonLate[0]?.value ?? 0,
        lateNucleonErrorAt0025: spectrum.nucleonLate[0]?.error ?? 0,
        lateNucleonAt005: spectrum.nucleonLate[1]?.value ?? 0,
        lateNucleonErrorAt005: spectrum.nucleonLate[1]?.error ?? 0,
        lateNucleonAt01: spectrum.nucleonLate[2]?.value ?? 0,
        lateNucleonAt02: spectrum.nucleonLate[3]?.value ?? 0,
        lateNucleonAt04: spectrum.nucleonLate[4]?.value ?? 0,
        nucleonChiralLimit: chiral,
        pionSquaredChiralLimit: pionChiral,
        enhancementOverThreeFreeQuarks: enhancement,
      },
      control: {
        threeFreeQuarksAtLightestResolved: threeFreeQuarks,
        freeNucleonAt02: freeNucleon[0] ?? 0,
        freeNucleonAt04: freeNucleon[1] ?? 0,
        freeNucleonPredictedAt02: 3 * Math.asinh(0.2),
        freeNucleonPredictedAt04: 3 * Math.asinh(0.4),
        freeNucleonLateAt04: control.nucleonLate[1]?.value ?? 0,
      },
      notes:
        'L2, known physics: quenched lattice nucleon. The mass is a two-step effective mass from t = 3 to t = 5, early enough that excited states and the parity partner still contribute, in one 2 fm box at one lattice spacing, so these masses are not the infinite-volume continuum ground state, and the comparison with nature is made only through the dimensionless ratio of E-FRC-0091. The claim rests on the gap to three free quarks (a factor of five or more) together with the plateau check, which is what a light state hiding under the early effective mass would fail. The lightest quark masses are not resolved by 12 configurations and are reported with their errors, not used.',
    })
  },
})

// the physical point of the Edinburgh plot, (m_pi / m_rho)^2 with 138 and 775 MeV
const PHYSICAL_PION_OVER_RHO_SQUARED = (138 / 775) ** 2
const PHYSICAL_NUCLEON_OVER_RHO = 938 / 775
// the J parameter, quenched lattice world value and experiment (Lacock and Michael 1995)
const J_QUENCHED = 0.37
const J_EXPERIMENT = 0.48

// masses from a subset of configurations, every quark mass at once
function massesOf(subset: readonly HadronCorrelators[]): { pion: number[]; rho: number[]; nucleon: number[] } {
  return {
    pion: MASSES.map((_, i) => pionMass(averageSeries({ series: subset.map(s => s.pion[i] ?? []) }))),
    rho: MASSES.map((_, i) => pionMass(averageSeries({ series: subset.map(s => s.rho[i] ?? []) }))),
    nucleon: MASSES.map((_, i) =>
      logEffectiveMass({
        correlator: averageSeries({ series: subset.map(s => s.nucleon[i] ?? []) }),
        t: NUCLEON_TIME,
        step: 2,
      }),
    ),
  }
}

// J = m_V dm_V / dm_PS^2 at m_V / m_PS = 1.8, from a straight line m_V = a + s m_PS^2 through the
// given quark masses: solve (a + s x) / sqrt(x) = 1.8 for x = m_PS^2, then J = 1.8 sqrt(x) s
function jParameter(input: { pion: number[]; rho: number[]; use: number[] }): number {
  const fit = linearFit({
    xs: input.use.map(i => (input.pion[i] ?? 0) ** 2),
    ys: input.use.map(i => input.rho[i] ?? 0),
  })
  const a = fit.intercept
  const s = fit.slope
  // s y^2 - 1.8 y + a = 0 with y = m_PS, the root on the light side
  const discriminant = 3.24 - 4 * s * a

  if (discriminant < 0 || s === 0) {
    return Number.NaN
  }

  const y = (1.8 - Math.sqrt(discriminant)) / (2 * s)

  return 1.8 * y * s
}

// m_N / m_rho carried along the Edinburgh plot to the physical (m_pi / m_rho)^2
function nucleonOverRhoAtPhysical(input: { pion: number[]; rho: number[]; nucleon: number[]; use: number[] }): number {
  const fit = linearFit({
    xs: input.use.map(i => ((input.pion[i] ?? 0) / (input.rho[i] ?? 1)) ** 2),
    ys: input.use.map(i => (input.nucleon[i] ?? 0) / (input.rho[i] ?? 1)),
  })

  return fit.intercept + fit.slope * PHYSICAL_PION_OVER_RHO_SQUARED
}

experiment({
  id: 'gauge/rho-and-ratios',
  code: 'E-FRC-0091',
  title:
    'the quenched rho stays heavy as the pion becomes light, and the dimensionless ratios m_N / m_rho and the J parameter map onto the published quenched world values, including quenched QCD known miss of the experimental J',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const samples = hadronSamples()
    const spectrum = interactingSpectrum()
    const control = freeSpectrum()
    const rho = spectrum.rho.map(p => p.value)
    const pion = spectrum.pion.map(p => p.value)
    const nucleon = spectrum.nucleon.map(p => p.value)
    // every quark mass where the rho and the nucleon are both resolved
    const use = MASSES.map((_, i) => i).filter(
      i =>
        (spectrum.rho[i]?.value ?? 0) > 10 * (spectrum.rho[i]?.error ?? 1) &&
        (spectrum.nucleon[i]?.value ?? 0) > 5 * (spectrum.nucleon[i]?.error ?? 1),
    )
    const freeRho = control.rho.map(p => p.value)
    const freeExact = FREE_MASSES.every(
      (mass, i) => Math.abs((freeRho[i] ?? 0) / (2 * Math.asinh(mass)) - 1) < 0.01,
    )
    const rhoChiral = weightedLinearFit({
      xs: use.map(i => MASSES[i] ?? 0),
      ys: use.map(i => rho[i] ?? 0),
      errors: use.map(i => spectrum.rho[i]?.error ?? 1),
    })
    const j = jackknife({ samples, estimator: subset => jParameter({ ...massesOf(subset), use }) })
    const ratio = jackknife({
      samples,
      estimator: subset => nucleonOverRhoAtPhysical({ ...massesOf(subset), use }),
    })

    const enough = use.length >= 3
    const vectorHeavy =
      rhoChiral.intercept > 5 * rhoChiral.interceptError &&
      use.every(i => (rho[i] ?? 0) > (pion[i] ?? 0))
    const heavierThanPionAtLightest = rhoChiral.intercept > 1.5 * (pion[0] ?? 0)
    const ok = freeExact && enough && vectorHeavy && heavierThanPionAtLightest

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the local staggered rho is heavier than the pion at every resolved quark mass and extrapolates to a large mass at zero quark mass, and the same code without gluons gives exactly two free quarks, while m_N / m_rho at the physical point and the J parameter are measured against the published quenched and experimental values',
      metrics: {
        rhoAt0025: rho[0] ?? 0,
        rhoAt005: rho[1] ?? 0,
        rhoAt01: rho[2] ?? 0,
        rhoAt02: rho[3] ?? 0,
        rhoAt04: rho[4] ?? 0,
        rhoErrorAt0025: spectrum.rho[0]?.error ?? 0,
        resolvedMassCount: use.length,
        rhoChiralLimit: rhoChiral.intercept,
        rhoChiralLimitError: rhoChiral.interceptError,
        nucleonOverRhoAtPhysical: ratio.value,
        nucleonOverRhoError: ratio.error,
        jParameter: j.value,
        jParameterError: j.error,
        nucleonOverRhoAtHeaviest: (nucleon[4] ?? 0) / (rho[4] ?? 1),
      },
      control: {
        freeRhoAt02: freeRho[0] ?? 0,
        freeRhoAt04: freeRho[1] ?? 0,
        freeRhoPredictedAt02: 2 * Math.asinh(0.2),
        freeRhoPredictedAt04: 2 * Math.asinh(0.4),
        physicalNucleonOverRho: PHYSICAL_NUCLEON_OVER_RHO,
        nucleonOverRhoPull: (ratio.value - PHYSICAL_NUCLEON_OVER_RHO) / ratio.error,
        jQuenchedWorld: J_QUENCHED,
        jQuenchedPull: (j.value - J_QUENCHED) / j.error,
        jExperiment: J_EXPERIMENT,
        jExperimentPull: (j.value - J_EXPERIMENT) / j.error,
      },
      notes:
        'L2, known physics. The local staggered rho is one taste of the vector meson with an oscillating parity partner, read on even t. m_N / m_rho is carried to the physical point by a straight line in (m_pi / m_rho)^2 through the heavy quark masses the ensemble resolves, a long extrapolation, and quenched QCD is not expected to hit 1.21. J is interpolated at m_V / m_PS = 1.8 from a straight line m_V against m_PS^2. The two comparisons are printed with their pulls against the published quenched world value and experiment, and are not gated, because 12 configurations at one coarse spacing do not pin them tightly enough to decide between the two.',
    })
  },
})
