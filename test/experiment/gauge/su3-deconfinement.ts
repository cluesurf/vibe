// Quarks are confined at low temperature and freed above a critical one, and the three colours show
// up as three equivalent hot vacua. SU(3) gauge theory on an L^3 x 2 lattice, whose short periodic
// time axis sets a temperature T = 1 / (2a), so raising beta shrinks a and heats the system.
//
// The Polyakov loop P, the trace of the time-like links winding once around the thermal circle, is
// exp(-F_q / T) with F_q the free energy of one isolated static quark.
//
// - Confined: P averages to zero, an isolated quark costs infinite free energy. On a finite box the
//   residual |P| is pure noise and must fall as 1 / sqrt(V). Measured on 6^3 and 8^3, the ratio must
//   be near (8 / 6)^(3/2) = 1.54, the proof that P really is zero and not merely small.
// - Deconfined: |P| is of order one, and the phase of P lands on one of the three center elements
//   exp(2 pi i k / 3) of SU(3). The Wilson action cannot tell the three apart, so a start in each
//   sector must stay in it with the same |P| and the same plaquette.
// - The transition is located by bisection on beta. The published N_t = 2 value is close to 5.09.
//
// Grade L2: the deconfinement transition of pure SU(3) gauge theory is textbook lattice QCD
// (McLerran and Svetitsky 1981, Kuti, Polonyi and Szlachanyi 1981), reproduced here from the Wilson
// action. Monte Carlo from a seeded generator.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  centerTransformTimeSlice,
  linkSlot,
  makeGaugeLattice,
  sampleGaugeEnsemble,
} from '@/code/dynamics/gauge-lattice'
import { setIdentity } from '@/code/algebra/group/unitary-matrix'
import {
  averagePlaquette,
  polyakovLoop,
} from '@/code/measure/lattice-gauge-observable'
import { bisectThreshold } from '@/code/tool/bisect'
import { neccoSommerScale } from '@/code/measure/static-potential'

type Thermal = {
  modulus: number
  // the phase of the ensemble-mean Polyakov loop, in units of 2 pi / 3
  sectorPhase: number
  plaquette: number
}

// 'mixed' is the two-phase start of a first-order transition: the half of the box with x < L / 2
// ordered (every link the identity), the other half disordered. Above the transition the ordered
// half takes over, below it the disordered one, so neither phase is favoured by where the run
// began, and the hysteresis of a hot or cold start (which grows with the volume) is gone.
function thermalRun(input: {
  beta: number
  spatial: number
  start: 'cold' | 'hot' | 'mixed'
  sector: number
  seed: number
  measurements?: number
  time?: number
}): Thermal {
  const rng = makeRng({ seed: input.seed })
  const lattice = makeGaugeLattice({
    group: 'su3',
    lengths: [input.spatial, input.spatial, input.spatial, input.time ?? 2],
    start: input.start === 'mixed' ? 'hot' : input.start,
    rng,
  })

  if (input.start === 'mixed') {
    for (let site = 0; site < lattice.geometry.sites; site++) {
      if (site % input.spatial < input.spatial / 2) {
        for (let mu = 0; mu < lattice.geometry.dim; mu++) {
          setIdentity({ n: lattice.n, out: linkSlot({ lattice, site, mu }) })
        }
      }
    }
  }

  centerTransformTimeSlice({ lattice, slice: 0, k: input.sector })

  const samples = sampleGaugeEnsemble({
    lattice,
    beta: input.beta,
    thermalization: input.time === undefined ? 30 : 100,
    measurements: input.measurements ?? 50,
    separation: 1,
    overrelaxation: 2,
    rng,
    measure: current => ({
      loop: polyakovLoop({ lattice: current }),
      plaquette: averagePlaquette({ lattice: current }),
    }),
  })
  const count = samples.length
  const re = samples.reduce((sum, s) => sum + s.loop[0], 0) / count
  const im = samples.reduce((sum, s) => sum + s.loop[1], 0) / count

  return {
    modulus:
      samples.reduce((sum, s) => sum + Math.hypot(s.loop[0], s.loop[1]), 0) /
      count,
    sectorPhase: Math.atan2(im, re) / ((2 * Math.PI) / 3),
    plaquette: samples.reduce((sum, s) => sum + s.plaquette, 0) / count,
  }
}

// the distance of a phase (in units of 2 pi / 3) from the center element k, wrapped onto the circle
function sectorDistance(input: { phase: number; k: number }): number {
  const difference = (((input.phase - input.k) % 3) + 4.5) % 3 - 1.5

  return Math.abs(difference)
}

const DECONFINED_MODULUS = 0.2
const PUBLISHED_CRITICAL_BETA = 5.09

export default experiment({
  id: 'gauge/su3-deconfinement',
  code: 'E-FRC-0082',
  title:
    'SU(3) at finite temperature deconfines near beta 5.09 on N_t = 2, the Polyakov loop vanishing like 1 / sqrt(V) below and settling in one of three equivalent center sectors above',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    let seed = 820

    const bracket = bisectThreshold({
      low: 4.6,
      high: 5.6,
      steps: 4,
      isAbove: beta =>
        thermalRun({ beta, spatial: 8, start: 'hot', sector: 0, seed: seed++ })
          .modulus > DECONFINED_MODULUS,
    })
    const criticalBeta = (bracket.low + bracket.high) / 2
    const sectors = [0, 1, 2].map(k =>
      thermalRun({ beta: 5.6, spatial: 8, start: 'cold', sector: k, seed: 840 + k }),
    )
    const melted = [0, 1, 2].map(k =>
      thermalRun({ beta: 4.6, spatial: 8, start: 'cold', sector: k, seed: 850 + k }),
    )
    // the residual |P| of a confined box is noise, so its volume scaling gets three times the samples
    const small = thermalRun({
      beta: 4.6,
      spatial: 6,
      start: 'hot',
      sector: 0,
      seed: 860,
      measurements: 150,
    })
    const large = thermalRun({
      beta: 4.6,
      spatial: 8,
      start: 'hot',
      sector: 0,
      seed: 861,
      measurements: 150,
    })
    const volumeRatio = small.modulus / large.modulus

    const transitionFound =
      bracket.switched &&
      Math.abs(criticalBeta - PUBLISHED_CRITICAL_BETA) < 0.15
    const sectorPhaseError = Math.max(
      ...sectors.map((s, k) => sectorDistance({ phase: s.sectorPhase, k })),
    )
    const moduli = sectors.map(s => s.modulus)
    const plaquettes = sectors.map(s => s.plaquette)
    const moduliSpread = (Math.max(...moduli) - Math.min(...moduli)) / Math.max(...moduli)
    const plaquetteSpread = Math.max(...plaquettes) - Math.min(...plaquettes)
    const threeVacua =
      sectorPhaseError < 0.05 &&
      moduli.every(m => m > DECONFINED_MODULUS) &&
      moduliSpread < 0.05 &&
      plaquetteSpread < 0.005
    const confinedEverywhere = melted.every(m => m.modulus < DECONFINED_MODULUS / 2)
    const vanishesWithVolume = volumeRatio > 1.2 && volumeRatio < 1.9
    const ok = transitionFound && threeVacua && confinedEverywhere && vanishesWithVolume

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'SU(3) on 8^3 x 2 deconfines between the measured bracket around beta 5.09: below it the Polyakov loop is zero (its residual falls like 1 / sqrt(V)) and every center-sector start melts into the symmetric phase, above it the loop settles in one of three center sectors with equal magnitude and plaquette',
      metrics: {
        criticalBetaLow: bracket.low,
        criticalBetaHigh: bracket.high,
        criticalBeta,
        publishedCriticalBeta: PUBLISHED_CRITICAL_BETA,
        deconfinedModulus: moduli[0] ?? 0,
        sectorPhaseError,
        moduliSpread,
        plaquetteSpread,
      },
      control: {
        confinedModulusSector0: melted[0]?.modulus ?? 0,
        confinedModulusSector1: melted[1]?.modulus ?? 0,
        confinedModulusSector2: melted[2]?.modulus ?? 0,
        confinedModulusSmallBox: small.modulus,
        confinedModulusLargeBox: large.modulus,
        volumeRatio,
        volumeRatioPredicted: (8 / 6) ** 1.5,
      },
      notes:
        'L2, known physics: the pure-gauge SU(3) deconfinement transition (first order, Z_3 center symmetry breaking), reproduced from the Wilson action. The transition beta on a finite 8^3 box is a pseudo-critical value and a first-order transition can hold a hot start in the confined phase for some sweeps, so the bracket is compared to the published infinite-volume N_t = 2 value only to 0.15 in beta. Pure gauge theory has no dynamical quarks, so the center symmetry is exact and the three sectors are exactly degenerate, which real QCD with light quarks breaks.',
    })
  },
})

// the published N_t = 4 transition (Boyd et al. 1996) and T_c r0 (Necco and Sommer 2002)
const PUBLISHED_BETA_NT4 = 5.6925
const PUBLISHED_TC_R0 = 0.7498
// hbar c in MeV fm, and r0 = 0.5 fm, only to print T_c in MeV
const HBAR_C_MEV_FM = 197.327
const R0_FM = 0.5

experiment({
  id: 'gauge/deconfinement-temperature',
  code: 'E-FRC-0098',
  title:
    'the SU(3) deconfinement temperature in physical units: on N_t = 4 the transition sits at the published beta 5.69, and with the Sommer scale T_c r0 comes out at the published 0.75, near 300 MeV',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    let seed = 980

    // |P| halfway between the confined (about 0.03) and deconfined (about 0.15 and up) values on
    // N_t = 4, where the loop is smaller than on N_t = 2 because the static quark is heavier in T units
    const threshold = 0.09
    const transition = (spatial: number, low: number, high: number, steps: number) =>
      bisectThreshold({
        low,
        high,
        steps,
        isAbove: beta =>
          thermalRun({ beta, spatial, time: 4, start: 'mixed', sector: 0, seed: seed++, measurements: 60 })
            .modulus > threshold,
      })
    const small = transition(8, 5.5, 5.9, 5)
    const large = transition(12, 5.6, 5.8, 4)
    const middle = (b: { low: number; high: number }): number => (b.low + b.high) / 2
    const halfWidth = (b: { low: number; high: number }): number => (b.high - b.low) / 2
    // a first-order transition shifts as 1 / V on a finite box, beta_c(L) = beta_c - h / L^3, so two
    // volumes carry it to infinite volume
    const v8 = 8 ** 3
    const v12 = 12 ** 3
    const criticalBeta = (v12 * middle(large) - v8 * middle(small)) / (v12 - v8)
    const criticalError = Math.hypot(
      (v12 / (v12 - v8)) * halfWidth(large),
      (v8 / (v12 - v8)) * halfWidth(small),
    )
    // T = 1 / (N_t a), so T_c r0 = (r0 / a at beta_c) / N_t, with r0 / a from the published scale
    const tcR0 = neccoSommerScale({ beta: criticalBeta }) / 4
    const publishedNt4 = neccoSommerScale({ beta: PUBLISHED_BETA_NT4 }) / 4
    const tcMev = (tcR0 * HBAR_C_MEV_FM) / R0_FM

    const found = small.switched && large.switched && Math.abs(criticalBeta - PUBLISHED_BETA_NT4) < 3 * criticalError + 0.005
    const shiftsUp = middle(large) >= middle(small)
    const physical = Math.abs(tcR0 - publishedNt4) < 0.03
    const ok = found && shiftsUp && physical

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the N_t = 4 deconfinement transition, located by bisection on 8^3 and 12^3 boxes and carried to infinite volume by its first-order 1 / V shift, sits at the published beta 5.6925, and converted with the Sommer scale gives the published N_t = 4 value of T_c r0, near 285 MeV for r0 = 0.5 fm',
      metrics: {
        criticalBetaSmallBox: middle(small),
        criticalBetaLargeBox: middle(large),
        criticalBetaInfiniteVolume: criticalBeta,
        criticalBetaError: criticalError,
        tcR0,
        tcMev,
      },
      control: {
        publishedCriticalBeta: PUBLISHED_BETA_NT4,
        publishedTcR0AtNt4: publishedNt4,
        publishedTcR0Continuum: PUBLISHED_TC_R0,
      },
      notes:
        'L2, known physics: the pure-gauge deconfinement temperature. The measured quantity is the transition coupling on two volumes. The conversion to T_c r0 uses the published Necco-Sommer r0 / a (E-FRC-0088 measures r0 / a at 5.7 as 3.2 +- 0.2, consistent with it), and to MeV the convention r0 = 0.5 fm. At N_t = 4 the lattice T_c r0 sits about four percent below the continuum 0.7498, a cutoff effect of this coarse thermal lattice, so the gate is against the N_t = 4 value and the continuum one is printed. Pure-gauge T_c is near 300 MeV, higher than the roughly 155 MeV crossover of real QCD with light quarks.',
    })
  },
})
