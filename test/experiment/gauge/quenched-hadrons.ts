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
//   color singlet weigh far more than three free quarks, and the mass stays large as the quark mass
//   is taken to zero, while the pion becomes light. Most of the mass of ordinary matter is this.
// - E-FRC-0091, the rho and the ratios that map to the real world. The vector meson stays heavy as
//   the pion becomes light, and two dimensionless numbers are compared with nature: m_N / m_rho,
//   extrapolated to the physical m_pi / m_rho, against 938 / 775 = 1.21, and the J parameter
//   (Lacock and Michael 1995), J = m_V dm_V / dm_PS^2 at m_V / m_PS = 1.8, which quenched QCD is
//   known to put near 0.37 against the experimental 0.48. Reproducing the quenched value, and its
//   miss, is the test.
//   The first version extrapolated m_N / m_rho through the three heavy masses on the nucleon
//   plateau and gave 1.98 +- 0.17 against nature's 1.21. That number stays (nucleonOverRhoAtPhysical).
//   Added since: three more quark masses in the same multi-shift solve, so the Edinburgh plot, m_N /
//   m_rho against (m_pi / m_rho)^2, has eight points, a line through every plateau point carried to
//   the physical (m_pi / m_rho)^2 = 0.033 with a jackknife error and a fit-range error, the same line
//   with the nucleon read later (t = 5 to 7), and the published quenched continuum values (CP-PACS
//   with Wilson quarks, MILC with staggered) beside it. The added masses cost little because a
//   heavier shift converges inside the lightest one's iterations. Nature's ratio needs light
//   quarks, a continuum limit and sea quarks, none of which a quenched 2 fm box at one spacing has,
//   so the ratio is reported and not gated, and the trend the plot shows is reported as measured.
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
// three more quark masses for the Edinburgh plot of E-FRC-0091, solved in the same multi-shift
// inversion (a heavier shift costs a few vector updates per iteration, not a new solve), appended
// so the five above keep their indices and their values
const EDINBURGH_EXTRA = [0.075, 0.15, 0.3]
const SOLVED_MASSES = [...MASSES, ...EDINBURGH_EXTRA]
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
  const values = PION_TIMES.map(t =>
    coshEffectiveMass({ correlator, t, step: 2 }),
  )

  return values.reduce((a, b) => a + b, 0) / values.length
}

function spectrumOf(
  samples: readonly HadronCorrelators[],
  masses: readonly number[],
): Spectrum {
  const nucleonAt = (t: number): { value: number; error: number }[] =>
    masses.map((_, index) =>
      jackknife({
        samples,
        estimator: subset =>
          logEffectiveMass({
            correlator: averageSeries({
              series: subset.map(s => s.nucleon[index] ?? []),
            }),
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
          pionMass(
            averageSeries({
              series: subset.map(s => s.pion[index] ?? []),
            }),
          ),
      }),
    ),
    // the rho plateau on even t, the same two-step cosh as the pion
    rho: masses.map((_, index) =>
      jackknife({
        samples,
        estimator: subset =>
          pionMass(
            averageSeries({
              series: subset.map(s => s.rho[index] ?? []),
            }),
          ),
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
    const lattice = makeGaugeLattice({
      group: 'su3',
      lengths: [12, 12, 12, 16],
      start: 'cold',
      rng,
    })

    interactingSamples = sampleQuenchedHadrons({
      lattice,
      beta: 5.7,
      masses: SOLVED_MASSES,
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
  interacting ??= spectrumOf(hadronSamples(), MASSES)

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
    const read = (
      series: number[][],
      mass: (c: number[]) => number,
    ): { value: number; error: number }[] =>
      series.map(c => ({ value: mass(c), error: 0 }))

    free = {
      pion: read(
        correlators.pion,
        c =>
          [12, 16]
            .map(t => coshEffectiveMass({ correlator: c, t, step: 2 }))
            .reduce((a, b) => a + b) / 2,
      ),
      rho: read(
        correlators.rho,
        c =>
          [12, 16]
            .map(t => coshEffectiveMass({ correlator: c, t, step: 2 }))
            .reduce((a, b) => a + b) / 2,
      ),
      nucleon: read(correlators.nucleon, c =>
        logEffectiveMass({ correlator: c, t: 13, step: 2 }),
      ),
      nucleonLate: read(correlators.nucleon, c =>
        logEffectiveMass({ correlator: c, t: 17, step: 2 }),
      ),
      worstResidual: correlators.worstResidual,
    }
  }

  return free
}

// The quark masses whose nucleon effective mass sits on a plateau: resolved at five standard errors
// from t = 3 to 5, resolved at three from t = 5 to 7, and the two agreeing within three standard
// errors. An effective mass that is still falling is not a ground state, and reading one as a mass
// overstates it. At the lightest quenched quark masses the nucleon correlator is known to be
// distorted (the quenched hairpin diagrams have no dynamical-quark loops to cancel them), which is
// where the plateau is lost.
function nucleonPlateau(spectrum: Spectrum): number[] {
  return MASSES.map((_, i) => i).filter(i => {
    const early = spectrum.nucleon[i]
    const late = spectrum.nucleonLate[i]

    if (early === undefined || late === undefined) {
      return false
    }

    return (
      early.value > 5 * early.error &&
      late.value > 3 * late.error &&
      Math.abs(early.value - late.value) <
        3 * Math.hypot(early.error, late.error)
    )
  })
}

function exponent(input: {
  masses: readonly number[]
  values: readonly number[]
}): number {
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
    const interactingExponent = exponent({
      masses: MASSES,
      values: pion,
    })
    const heavyExponent = exponent({
      masses: FREE_MASSES,
      values: pion.slice(-2),
    })
    const freeExponent = exponent({
      masses: FREE_MASSES,
      values: freePion,
    })
    // the control must reproduce free quarks, 2 asinh(m), to one percent
    const freeExact = FREE_MASSES.every(
      (mass, i) =>
        Math.abs((freePion[i] ?? 0) / (2 * Math.asinh(mass)) - 1) <
        0.01,
    )
    // m_pi^2 / m_q at the lightest and heaviest quark mass, near constant for a Goldstone boson
    const gmorLight = (pion[0] ?? 0) ** 2 / (MASSES[0] ?? 1)
    const gmorHeavy =
      (pion[pion.length - 1] ?? 0) ** 2 /
      (MASSES[MASSES.length - 1] ?? 1)
    const resolved = spectrum.pion.every(p => p.value > 10 * p.error)
    const goldstone = Math.abs(interactingExponent - 0.5) < 0.1
    const freeLinear = Math.abs(freeExponent - 1) < 0.05
    const separated = freeExponent - heavyExponent > 0.3
    const ok =
      freeExact && resolved && goldstone && freeLinear && separated

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
      (mass, i) =>
        Math.abs((freeNucleon[i] ?? 0) / (3 * Math.asinh(mass)) - 1) <
        0.01,
    )
    // only the masses on a plateau are read (nucleonPlateau), the others are reported
    const resolvedIndices = nucleonPlateau(spectrum)
    const excluded = MASSES.map((_, i) => i).filter(
      i => !resolvedIndices.includes(i),
    )
    const resolvedMasses = resolvedIndices.map(i => MASSES[i] ?? 0)
    const resolvedNucleon = resolvedIndices.map(i => nucleon[i] ?? 0)
    const enoughResolved = resolvedIndices.length >= 3
    const lightest = resolvedMasses[0] ?? 0
    const threeFreeQuarks = 3 * Math.asinh(lightest)
    const enhancement = (resolvedNucleon[0] ?? 0) / threeFreeQuarks
    // the chiral limit, linear in m_q through the resolved masses
    const chiral = linearFit({
      xs: resolvedMasses,
      ys: resolvedNucleon,
    }).intercept
    const pionChiral = linearFit({
      xs: MASSES.slice(0, 2),
      ys: pion.slice(0, 2).map(m => m * m),
    }).intercept
    // three quarks outweigh a quark and an antiquark (the ratio tends to 3 / 2 only for very heavy
    // quarks, so 1 is the bound that is not a knife edge)
    const heavierThanPion = resolvedIndices.every(
      i => (nucleon[i] ?? 0) > (pion[i] ?? 0),
    )
    const lateRatios = resolvedIndices.map(
      i => (spectrum.nucleonLate[i]?.value ?? 0) / (nucleon[i] ?? 1),
    )
    // the plateau is a property of the heavy end: the masses that fail it are the lightest ones
    const excludedAreLightest = excluded.every(i =>
      resolvedIndices.every(j => j > i),
    )
    const generated = enhancement > 5 && chiral > 1 && pionChiral < 0.05
    const ok =
      freeExact &&
      enoughResolved &&
      heavierThanPion &&
      excludedAreLightest &&
      generated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the nucleon, three quarks contracted with epsilon_abc, weighs several times three free quarks at every quark mass where its effective mass sits on a plateau (t = 3 to 5 against 5 to 7), those masses are the heavy end, and it extrapolates to a large mass at zero quark mass while the pion mass squared extrapolates near zero, and the same code without gluons gives exactly three free quarks',
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
        smallestLateOverEarlyOnPlateau:
          lateRatios.length > 0 ? Math.min(...lateRatios) : 0,
        excludedMassCount: excluded.length,
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
        'L2, known physics: quenched lattice nucleon. The mass is a two-step effective mass from t = 3 to t = 5, early enough that excited states and the parity partner still contribute, in one 2 fm box at one lattice spacing, so these masses are not the infinite-volume continuum ground state, and the comparison with nature is made only through the dimensionless ratio of E-FRC-0091. The claim rests on the gap to three free quarks (a factor of five or more) at the masses where the effective mass has stopped falling. At the two lightest quark masses it has not (from t = 5 to 7 it drops to about 0.4 and 0.7 of its t = 3 to 5 value), the quenched distortion of light baryons, so those two are reported with the late values and not used.',
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
function massesOf(subset: readonly HadronCorrelators[]): {
  pion: number[]
  rho: number[]
  nucleon: number[]
} {
  return {
    pion: MASSES.map((_, i) =>
      pionMass(
        averageSeries({ series: subset.map(s => s.pion[i] ?? []) }),
      ),
    ),
    rho: MASSES.map((_, i) =>
      pionMass(
        averageSeries({ series: subset.map(s => s.rho[i] ?? []) }),
      ),
    ),
    nucleon: MASSES.map((_, i) =>
      logEffectiveMass({
        correlator: averageSeries({
          series: subset.map(s => s.nucleon[i] ?? []),
        }),
        t: NUCLEON_TIME,
        step: 2,
      }),
    ),
  }
}

// J = m_V dm_V / dm_PS^2 at m_V / m_PS = 1.8, from a straight line m_V = a + s m_PS^2 through the
// given quark masses: solve (a + s x) / sqrt(x) = 1.8 for x = m_PS^2, then J = 1.8 sqrt(x) s
function jParameter(input: {
  pion: number[]
  rho: number[]
  use: number[]
}): number {
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
function nucleonOverRhoAtPhysical(input: {
  pion: number[]
  rho: number[]
  nucleon: number[]
  use: number[]
}): number {
  const fit = linearFit({
    xs: input.use.map(
      i => ((input.pion[i] ?? 0) / (input.rho[i] ?? 1)) ** 2,
    ),
    ys: input.use.map(
      i => (input.nucleon[i] ?? 0) / (input.rho[i] ?? 1),
    ),
  })

  return fit.intercept + fit.slope * PHYSICAL_PION_OVER_RHO_SQUARED
}

// The published quenched m_N / m_rho in the continuum, with m_rho = 768.4 MeV setting the scale:
// Wilson quarks 878(25) MeV (CP-PACS, Aoki et al. 2003, hep-lat/0206009) and staggered quarks
// 964(35) MeV (MILC, as quoted there). Both at the physical pion mass, both after a continuum limit
// this single coarse spacing does not take.
const CP_PACS_NUCLEON_OVER_RHO = 878 / 768.4
const CP_PACS_NUCLEON_OVER_RHO_ERROR = 25 / 768.4
const MILC_NUCLEON_OVER_RHO = 964 / 768.4
const MILC_NUCLEON_OVER_RHO_ERROR = 35 / 768.4

// One Edinburgh-plot point per solved quark mass, from a subset of configurations: x = (m_pi /
// m_rho)^2, and y = m_N / m_rho with the nucleon read early (t = 3 to 5) and late (t = 5 to 7).
function edinburghOf(subset: readonly HadronCorrelators[]): {
  x: number[]
  y: number[]
  yLate: number[]
  nucleon: number[]
  nucleonLate: number[]
} {
  const mean = (kind: 'pion' | 'rho' | 'nucleon', i: number): number[] =>
    averageSeries({ series: subset.map(s => s[kind][i] ?? []) })
  const points = SOLVED_MASSES.map((_, i) => {
    const pion = pionMass(mean('pion', i))
    const rho = pionMass(mean('rho', i))
    const nucleon = logEffectiveMass({
      correlator: mean('nucleon', i),
      t: NUCLEON_TIME,
      step: 2,
    })
    const nucleonLate = logEffectiveMass({
      correlator: mean('nucleon', i),
      t: NUCLEON_LATE_TIME,
      step: 2,
    })

    return {
      x: (pion / rho) ** 2,
      y: nucleon / rho,
      yLate: nucleonLate / rho,
      nucleon,
      nucleonLate,
    }
  })

  return {
    x: points.map(p => p.x),
    y: points.map(p => p.y),
    yLate: points.map(p => p.yLate),
    nucleon: points.map(p => p.nucleon),
    nucleonLate: points.map(p => p.nucleonLate),
  }
}

// a straight line through the chosen Edinburgh points, its value at the physical point and slope
function edinburghLine(input: {
  x: number[]
  y: number[]
  use: number[]
}): { atPhysical: number; slope: number } {
  const fit = linearFit({
    xs: input.use.map(i => input.x[i] ?? 0),
    ys: input.use.map(i => input.y[i] ?? 0),
  })

  return {
    atPhysical: fit.intercept + fit.slope * PHYSICAL_PION_OVER_RHO_SQUARED,
    slope: fit.slope,
  }
}

experiment({
  id: 'gauge/rho-and-ratios',
  code: 'E-FRC-0091',
  title:
    'the quenched rho stays heavy as the pion becomes light, the J parameter maps onto the published quenched world value including its known miss of experiment, and m_N / m_rho is carried to the physical point along an eight-mass Edinburgh plot and reported against the quenched continuum values, not gated',
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
    // the rho and J read every mass where the rho is resolved, and m_N / m_rho only the masses where
    // the nucleon also sits on its plateau
    const use = MASSES.map((_, i) => i).filter(
      i =>
        (spectrum.rho[i]?.value ?? 0) >
        10 * (spectrum.rho[i]?.error ?? 1),
    )
    const nucleonUse = use.filter(i =>
      nucleonPlateau(spectrum).includes(i),
    )
    const freeRho = control.rho.map(p => p.value)
    const freeExact = FREE_MASSES.every(
      (mass, i) =>
        Math.abs((freeRho[i] ?? 0) / (2 * Math.asinh(mass)) - 1) < 0.01,
    )
    const rhoChiral = weightedLinearFit({
      xs: use.map(i => MASSES[i] ?? 0),
      ys: use.map(i => rho[i] ?? 0),
      errors: use.map(i => spectrum.rho[i]?.error ?? 1),
    })
    const j = jackknife({
      samples,
      estimator: subset => jParameter({ ...massesOf(subset), use }),
    })
    const ratio = jackknife({
      samples,
      estimator: subset =>
        nucleonOverRhoAtPhysical({
          ...massesOf(subset),
          use: nucleonUse,
        }),
    })

    // The Edinburgh plot over all eight solved quark masses, lightest first. A point enters the line
    // when its nucleon sits on the plateau of nucleonPlateau (early and late resolved and agreeing).
    const order = SOLVED_MASSES.map((_, i) => i).sort(
      (a, b) => (SOLVED_MASSES[a] ?? 0) - (SOLVED_MASSES[b] ?? 0),
    )
    const pointError = (
      pick: (e: ReturnType<typeof edinburghOf>) => number[],
      i: number,
    ) =>
      jackknife({
        samples,
        estimator: subset => pick(edinburghOf(subset))[i] ?? 0,
      })
    const points = order.map(i => ({
      mass: SOLVED_MASSES[i] ?? 0,
      index: i,
      x: pointError(e => e.x, i),
      y: pointError(e => e.y, i),
      yLate: pointError(e => e.yLate, i),
      nucleon: pointError(e => e.nucleon, i),
      nucleonLate: pointError(e => e.nucleonLate, i),
    }))
    const onPlateau = points
      .filter(
        p =>
          p.nucleon.value > 5 * p.nucleon.error &&
          p.nucleonLate.value > 3 * p.nucleonLate.error &&
          Math.abs(p.nucleon.value - p.nucleonLate.value) <
            3 * Math.hypot(p.nucleon.error, p.nucleonLate.error),
      )
      .map(p => p.index)
    const line = (
      pick: (e: ReturnType<typeof edinburghOf>) => number[],
      chosen: number[],
      part: 'atPhysical' | 'slope',
    ) =>
      jackknife({
        samples,
        estimator: subset => {
          const e = edinburghOf(subset)

          return edinburghLine({ x: e.x, y: pick(e), use: chosen })[part]
        },
      })
    const edinburgh = line(e => e.y, onPlateau, 'atPhysical')
    const edinburghSlope = line(e => e.y, onPlateau, 'slope')
    // the lightest three plateau masses alone, the shortest extrapolation
    const lightestThree = line(e => e.y, onPlateau.slice(0, 3), 'atPhysical')
    // the nucleon read late, t = 5 to 7, through the same plateau points, so the two lines differ only
    // in when the nucleon is read. The masses off the plateau stay out, as in E-FRC-0085: there the
    // late nucleon collapses (to 0.71 at m_q = 0.025), and letting them in carries the late line to
    // 0.90 +- 0.24, below nature, which is the distortion and not a ratio.
    const edinburghLate = line(e => e.yLate, onPlateau, 'atPhysical')
    const edinburghLateSlope = line(e => e.yLate, onPlateau, 'slope')
    // the spread over the choice of points, a systematic error on the extrapolation
    const fitRangeSpread = Math.max(
      Math.abs(lightestThree.value - edinburgh.value),
      Math.abs(ratio.value - edinburgh.value),
    )
    const edinburghTotalError = Math.hypot(edinburgh.error, fitRangeSpread)
    const label = (mass: number): string => String(mass).replace('.', '')
    const edinburghMetrics = Object.fromEntries(
      points.flatMap(p => [
        [`edinburghXAt${label(p.mass)}`, p.x.value],
        [`edinburghYAt${label(p.mass)}`, p.y.value],
        [`edinburghYErrorAt${label(p.mass)}`, p.y.error],
        [`edinburghYLateAt${label(p.mass)}`, p.yLate.value],
      ]),
    )

    const enough = use.length >= 3
    const vectorHeavy =
      rhoChiral.intercept > 5 * rhoChiral.interceptError &&
      use.every(i => (rho[i] ?? 0) > (pion[i] ?? 0))
    const heavierThanPionAtLightest =
      rhoChiral.intercept > 1.5 * (pion[0] ?? 0)
    const ok =
      freeExact && enough && vectorHeavy && heavierThanPionAtLightest

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the local staggered rho is heavier than the pion at every resolved quark mass and extrapolates to a large mass at zero quark mass, and the same code without gluons gives exactly two free quarks, while m_N / m_rho at the physical point (from an Edinburgh plot over eight quark masses, with a statistical and a fit-range error) and the J parameter are measured against the published quenched and experimental values and not gated',
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
        edinburghPointCount: points.length,
        edinburghPlateauCount: onPlateau.length,
        ...edinburghMetrics,
        edinburghAtPhysical: edinburgh.value,
        edinburghAtPhysicalError: edinburgh.error,
        edinburghFitRangeSpread: fitRangeSpread,
        edinburghAtPhysicalTotalError: edinburghTotalError,
        edinburghSlope: edinburghSlope.value,
        edinburghSlopeError: edinburghSlope.error,
        edinburghLightestThree: lightestThree.value,
        edinburghLightestThreeError: lightestThree.error,
        edinburghLateNucleon: edinburghLate.value,
        edinburghLateNucleonError: edinburghLate.error,
        edinburghLateNucleonSlope: edinburghLateSlope.value,
        edinburghLateNucleonSlopeError: edinburghLateSlope.error,
      },
      control: {
        freeRhoAt02: freeRho[0] ?? 0,
        freeRhoAt04: freeRho[1] ?? 0,
        freeRhoPredictedAt02: 2 * Math.asinh(0.2),
        freeRhoPredictedAt04: 2 * Math.asinh(0.4),
        physicalNucleonOverRho: PHYSICAL_NUCLEON_OVER_RHO,
        nucleonOverRhoPull:
          (ratio.value - PHYSICAL_NUCLEON_OVER_RHO) / ratio.error,
        jQuenchedWorld: J_QUENCHED,
        jQuenchedPull: (j.value - J_QUENCHED) / j.error,
        jExperiment: J_EXPERIMENT,
        jExperimentPull: (j.value - J_EXPERIMENT) / j.error,
        physicalPionOverRhoSquared: PHYSICAL_PION_OVER_RHO_SQUARED,
        cpPacsQuenchedContinuum: CP_PACS_NUCLEON_OVER_RHO,
        cpPacsQuenchedContinuumError: CP_PACS_NUCLEON_OVER_RHO_ERROR,
        cpPacsPull:
          (edinburgh.value - CP_PACS_NUCLEON_OVER_RHO) /
          Math.hypot(edinburghTotalError, CP_PACS_NUCLEON_OVER_RHO_ERROR),
        milcStaggeredQuenchedContinuum: MILC_NUCLEON_OVER_RHO,
        milcStaggeredQuenchedContinuumError: MILC_NUCLEON_OVER_RHO_ERROR,
        milcPull:
          (edinburgh.value - MILC_NUCLEON_OVER_RHO) /
          Math.hypot(edinburghTotalError, MILC_NUCLEON_OVER_RHO_ERROR),
        edinburghPhysicalPull:
          (edinburgh.value - PHYSICAL_NUCLEON_OVER_RHO) / edinburghTotalError,
      },
      notes:
        'L2, known physics. The local staggered rho is one taste of the vector meson with an oscillating parity partner, read on even t. m_N / m_rho is carried to the physical point by a straight line in (m_pi / m_rho)^2 through the heavy quark masses the ensemble resolves, a long extrapolation, and quenched QCD is not expected to hit 1.21. J is interpolated at m_V / m_PS = 1.8 from a straight line m_V against m_PS^2. The two comparisons are printed with their pulls against the published quenched world value and experiment, and are not gated, because 12 configurations at one coarse spacing do not pin them tightly enough to decide between the two. The Edinburgh plot adds three quark masses (0.075, 0.15, 0.3) to the same multi-shift solve, eight points from (m_pi / m_rho)^2 = 0.75 down to about 0.3, and fits a line through every point whose nucleon is on its plateau. Its error adds the jackknife error to the spread over the choice of points (the lightest three alone, and the three original heavy masses). Nature is 1.21, and the quenched continuum is 1.143 +- 0.033 with Wilson quarks (CP-PACS 2003) and 1.255 +- 0.046 with staggered quarks (MILC, 964 +- 35 MeV over 768.4). What the plot shows is that the trend does NOT move toward the physical point here: with the nucleon read at t = 3 to 5 the ratio rises as the quarks get lighter (the slope in x is negative). The nucleon read at t = 5 to 7 lies lower at every light mass and flattens or reverses that slope, so the rise is the t = 3 to 5 nucleon still holding excited states, most at the lightest quarks, in one box at one coarse spacing. A larger version was measured outside the suite: the same ensemble to 36 configurations (2,660 s under load, against about 836 s for 12) puts every mass on the plateau and gives 1.95 +- 0.21 with slope -0.42 +- 0.37 from the early nucleon, and 1.46 +- 0.35 with slope +0.35 +- 0.60 from the late one, so more configurations sharpen the points but do not by themselves turn the early trend.',
    })
  },
})
