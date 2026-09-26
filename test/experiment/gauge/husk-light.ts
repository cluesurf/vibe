// Light on the husk. The leapfrog U(1) sector of code/rule/photon-links runs in the 4D bulk (the D4 box), and
// the physical field is its projection onto the husk, the cubic horosphere of the {3,4,3,4} cusp: each husk
// link the sum over the depth column of the bulk links between two columns (code/measure/photon-husk,
// E-FRC-0168). On the periodic box that is the bulk field's k4 = 0 part, so the husk sees the bulk light
// whose wave vector lies in the husk, through a map that keeps 2 of its 3 polarizations. Every frequency is
// read from the beats (code/measure/photon-modes), now with the lagged estimator: the Hermitian part of
// <E(t) E(t - 3)^dagger> is cos(3 omega) <E E^dagger> on each motion. E-FRC-0165's beat-to-beat estimator
// read 13 percent fast on the bulk, where its own time-domain check was within 2.3 percent, so the
// estimator is changed here, before any husk data, and the time-domain check kept.
//
// Gates, fixed before the run. N = 8192, K = 80 (E-FRC-0164), the bulk box side 12 (husk 12^3):
// A. A thermal bulk at beta near 3 (the flux curl of plaquette integers within sqrt(3 T / 4), T =
//    K N / (2 pi 3)), 300 beats settling, 2,000 measured. Husk modes m1 = (1,0,0) and m2 = (2,0,0), in units of
//    2 pi / 12:
//    A1 husk Gauss's law pins exactly 1 of the 9 husk flux directions at m1 and m2
//    A2 polarizations: exactly 2 light branches at m1 (below half the massive gap, frequency doubling within
//       1.6 to 2.1 at m2)
//    A3 massless: fitting 4 sin^2(omega / 2) = m^2 + s lambda through m1 and m2 (lambda the bulk photon
//       eigenvalue at (m, 0)), |m^2| under 0.05 of its value at m1
//    A4 the speed: the husk photon frequency at m1 within 5 percent of the leapfrog frequency with kappa
//       renormalized by the thermal plaquette, kappa <cos B>
//    A5 the time-domain check: the first zero of the autocorrelation of one transverse husk polarization at
//       m1, omega = pi / (2 tau0), within 10 percent of A's frequency
// B. Isotropy on the husk, from A's run, at |k| = pi / 2: husk wave vectors (3,0,0), (0,3,0), (0,0,3) against
//    (2,2,1), (1,2,2), (2,1,2). The husk lattice is cubic, but its light is the bulk's at k4 = 0, which W(F4)
//    makes isotropic through order k^4. Gates: the mean of the 2 light branches differs between the two sets
//    by under 1 percent, and on the plain cubic torus (side 12, same kappa, beta and estimator) by over 3
//    percent
// C. The static potential between a love and a fear on the husk. The empty bulk box side 12, e = 64 flux
//    units per vibe, a love at the husk dock 0 (depth 0) and a fear at husk separation r = 1, 2, 3, 4 along a
//    husk axis (bulk path alternating the roots (1,0,0,1) and (1,0,0,-1)), joined by a string of flux, 4,000
//    beats, the projected flux averaged over beats 400 to 4,000:
//    C1 it is the husk's Coulomb field: ||P<E> - E_C|| under 0.1 of ||P E_string - E_C||, E_C solved on the
//       husk from the column charges with its own weighted Laplacian
//    C2 not a string: U(4) / U(1) under 2, U the husk energy 1/2 sum (P<E>)^2 / w, where a string gives 4
//    C3 the falloff: p in U = a - b / r^p through r = 2, 3, 4 lies in 0.5 to 2 for the husk (1 / r), and is
//       smaller by at least 0.5 than for the bulk's own Coulomb energy of the same charges
//
// Depth L2: free lattice electrodynamics, projected. What is measured is that the beats carry it, and that
// the projection turns the bulk's 3 polarizations into 2 and its 4D falloff into 3D.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addHashedCurl,
  coulombFlux,
  emptyPhotonState,
  magneticSum,
  makePhotonRule,
  photonBeatInPlace,
  photonLatticeCubic,
  photonLatticeD4,
  placePairAlong,
  type PhotonLattice,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'
import {
  accumulate,
  accumulateCross,
  leapfrogOmega,
  linearWaveEigenvalues,
  makeCorrelator,
  modeFrequencies,
  modeReader,
  waveVector,
  type Correlator,
  type ModeFrequencies,
  type ModeVector,
} from '@/code/measure/photon-modes'
import { bulkModeOfHusk, columnSum, HUSK_VECTORS, huskCoulomb, huskEnergy, makeHusk, projectLinks, type Husk } from '@/code/measure/photon-husk'

const SIDE = 12
const N = 8192
const K = 80
const CHARGE = 64
const BETA = 3
const LAG = 3
const DOUBLING = [1.6, 2.1] as const
const ORBIT_A = [
  [3, 0, 0],
  [0, 3, 0],
  [0, 0, 3],
]
const ORBIT_B = [
  [2, 2, 1],
  [1, 2, 2],
  [2, 1, 2],
]

const kappaOf = (rule: PhotonRule): number => (2 * Math.PI * rule.k) / rule.n
const cutOf = (rule: PhotonRule): number => leapfrogOmega(kappaOf(rule), 12) / 2
const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

function thermalStart(rule: PhotonRule): PhotonState {
  const s = emptyPhotonState(rule)
  const target = (rule.k * rule.n) / (2 * Math.PI * BETA)

  addHashedCurl(rule, s, Math.max(1, Math.round(Math.sqrt((3 * target) / 4))), 5.3)

  return s
}

type Probe = { c0: Correlator; lagged: Correlator; history: ModeVector[]; read: (f: ArrayLike<number>) => ModeVector }

type Run = { modes: ModeFrequencies[]; meanCos: number; beta: number; series: number[][] }

// run the rule, reading `modes` of the field `view(state)` on `lattice` every beat after settling
function measure(
  rule: PhotonRule,
  lattice: PhotonLattice,
  view: (s: PhotonState) => ArrayLike<number>,
  input: { settle: number; beats: number; modes: number[][]; track?: number[] },
): Run {
  const s = thermalStart(rule)
  const f = lattice.firsts.length
  const probes: Probe[] = input.modes.map(n => {
    const reader = modeReader(lattice, n)

    return { c0: makeCorrelator(f), lagged: makeCorrelator(f), history: [], read: field => reader.read(field) }
  })
  const series: number[][] = []
  const cosines: number[] = []
  const temperatures: number[] = []

  for (let t = 0; t < input.settle + input.beats; t++) {
    photonBeatInPlace(rule, s, t)

    if (t < input.settle) {
      continue
    }

    const field = view(s)

    probes.forEach((p, i) => {
      const v = p.read(field)

      accumulate(p.c0, v)

      const past = p.history[p.history.length - LAG]

      if (p.history.length >= LAG && past) {
        accumulateCross(p.lagged, v, past)
      }

      p.history.push(v)

      if (p.history.length > LAG) {
        p.history.shift()
      }

      if (i === 0 && input.track) {
        const w = input.track

        series.push([v.re.reduce((a, x, j) => a + x * (w[j] ?? 0), 0), v.im.reduce((a, x, j) => a + x * (w[j] ?? 0), 0)])
      }
    })

    if ((t - input.settle) % 10 === 0) {
      cosines.push(magneticSum(rule, s.angle).meanCos)
      temperatures.push(s.flux.reduce((a, b) => a + b * b, 0) / (rule.lattice.links - rule.lattice.cells + 1))
    }
  }

  return {
    modes: probes.map(p => modeFrequencies({ c0: p.c0, c1: p.lagged, lag: LAG, tolerance: 1e-9 })),
    meanCos: mean(cosines),
    beta: (rule.k * rule.n) / (2 * Math.PI * mean(temperatures)),
    series,
  }
}

function firstZero(series: readonly number[][], maxLag: number): number {
  const r = (tau: number): number => {
    let sum = 0

    for (let t = 0; t + tau < series.length; t++) {
      sum += (series[t + tau]?.[0] ?? 0) * (series[t]?.[0] ?? 0) + (series[t + tau]?.[1] ?? 0) * (series[t]?.[1] ?? 0)
    }

    return sum / Math.max(1, series.length - tau)
  }

  let previous = r(0)

  for (let tau = 1; tau <= maxLag; tau++) {
    const value = r(tau)

    if (value <= 0) {
      return tau - 1 + previous / (previous - value)
    }

    previous = value
  }

  return Number.NaN
}

function lightBranches(rule: PhotonRule, at1: ModeFrequencies, at2: ModeFrequencies): number[] {
  return at1.omega.flatMap((w, i) => {
    const ratio = (at2.omega[i] ?? 0) / w

    return w < cutOf(rule) && ratio >= DOUBLING[0] && ratio <= DOUBLING[1] ? [i] : []
  })
}

function sectionAB(): Record<string, number> & { okA: number; okB: number } {
  const bulk = photonLatticeD4({ side: SIDE })
  const husk = makeHusk(bulk)
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false })
  const modes = [[1, 0, 0], [2, 0, 0], ...ORBIT_A, ...ORBIT_B]
  // a transverse polarization at m1: epsilon = (0, 0, 1), read on the 9 husk directions as u_h . epsilon
  const track = HUSK_VECTORS.map(u => u[2] ?? 0)
  const run = measure(rule, husk.lattice, s => projectLinks(husk, s.flux), { settle: 300, beats: 2000, modes, track })
  const [m1, m2] = run.modes as [ModeFrequencies, ModeFrequencies]
  const light = lightBranches(rule, m1, m2)
  const w1 = mean(light.map(i => m1.omega[i] ?? 0))
  const w2 = mean(light.map(i => m2.omega[i] ?? 0))
  const lambda = (m: number[]): number => linearWaveEigenvalues(bulk, bulkModeOfHusk(m))[1] ?? 0
  const q = (w: number): number => 4 * Math.sin(w / 2) ** 2
  const slope = (q(w2) - q(w1)) / (lambda([2, 0, 0]) - lambda([1, 0, 0]))
  const mass2 = q(w1) - slope * lambda([1, 0, 0])
  const predicted = leapfrogOmega(kappaOf(rule) * run.meanCos, lambda([1, 0, 0]))
  const tau0 = firstZero(run.series, 80)
  const direct = Math.PI / (2 * tau0)
  const kNorm = Math.hypot(...waveVector(husk.lattice, [1, 0, 0]))
  const orbitMean = (from: number): number => mean(run.modes.slice(from, from + 3).map(m => mean(m.omega.slice(0, 2))))
  const huskA = orbitMean(2)
  const huskB = orbitMean(5)

  // the plain cubic torus, same kappa, beta and estimator
  const cube = photonLatticeCubic({ side: SIDE })
  const cubeRule = makePhotonRule({ lattice: cube, n: N, k: K, capacity: 0, hop: false })
  const cubeRun = measure(cubeRule, cube, s => s.flux, { settle: 300, beats: 2000, modes: [...ORBIT_A, ...ORBIT_B] })
  const cubeMean = (from: number): number => mean(cubeRun.modes.slice(from, from + 3).map(m => mean(m.omega.slice(0, 2))))
  const cubeA = cubeMean(0)
  const cubeB = cubeMean(3)

  const okA =
    m1.nullDirections === 1 &&
    m2.nullDirections === 1 &&
    light.length === 2 &&
    Math.abs(mass2) < 0.05 * q(w1) &&
    Math.abs(w1 / predicted - 1) < 0.05 &&
    Math.abs(direct / w1 - 1) < 0.1
  const okB = Math.abs(huskB / huskA - 1) < 0.01 && Math.abs(cubeB / cubeA - 1) > 0.03

  return {
    okA: okA ? 1 : 0,
    okB: okB ? 1 : 0,
    aBeta: run.beta,
    aMeanCos: run.meanCos,
    aNullDirectionsM1: m1.nullDirections,
    aNullDirectionsM2: m2.nullDirections,
    aLightBranches: light.length,
    aOmegaM1: w1,
    aOmegaM2: w2,
    aDoubling: w2 / w1,
    aBranchesM1: m1.omega.length,
    aLowestMassiveM1: m1.omega[2] ?? 0,
    aCut: cutOf(rule),
    aMassSquaredOverM1: mass2 / q(w1),
    aPredictedOmegaM1: predicted,
    aOmegaOverPredicted: w1 / predicted,
    aSpeed: w1 / kNorm,
    aPredictedSpeed: predicted / kNorm,
    aDirectTau0: tau0,
    aDirectOmega: direct,
    aDirectOverLagged: direct / w1,
    bHuskOmegaAxes: huskA,
    bHuskOmegaOther: huskB,
    bHuskAnisotropy: huskB / huskA - 1,
    bHuskLinearRatio: lambda(ORBIT_B[0] ?? []) / lambda(ORBIT_A[0] ?? []),
    bCubicOmegaAxes: cubeA,
    bCubicOmegaOther: cubeB,
    bCubicAnisotropy: cubeB / cubeA - 1,
    bCubicBeta: cubeRun.beta,
  }
}

// p in U = a - b / r^p through three points
function falloff(u: readonly number[]): number {
  const [u2 = 0, u3 = 0, u4 = 0] = u
  const target = (u4 - u3) / (u3 - u2)
  const shape = (p: number): number => (3 ** -p - 4 ** -p) / (2 ** -p - 3 ** -p)

  let lo = 0.05
  let hi = 8

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2

    if (shape(mid) > target) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

function sectionC(): Record<string, number> & { okC: number } {
  const bulk = photonLatticeD4({ side: SIDE })
  const husk: Husk = makeHusk(bulk)
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false, charge: CHARGE })
  const root = (v: number[]): number => bulk.vectors.findIndex(r => r.every((x, i) => x === v[i]))
  const up = root([1, 0, 0, 1])
  const down = root([1, 0, 0, -1])
  const metrics: Record<string, number> = {}
  const measured: number[] = []
  const bulkCoulomb: number[] = []

  let ok = true

  for (const r of [1, 2, 3, 4]) {
    const s = emptyPhotonState(rule)

    placePairAlong(rule, s, 0, Array.from({ length: r }, (_, i) => (i % 2 === 0 ? up : down)), 1)

    const stringFlux = projectLinks(husk, s.flux)
    const charge = Float64Array.from(columnSum(husk, s.vibe), q => q * CHARGE)
    const coulomb = huskCoulomb(husk, charge)
    const bulkField = coulombFlux(rule, s.vibe)
    const average = new Float64Array(stringFlux.length)
    const settle = 400
    const beats = 4000

    for (let t = 0; t < beats; t++) {
      photonBeatInPlace(rule, s, t)

      if (t >= settle) {
        const p = projectLinks(husk, s.flux)

        for (let i = 0; i < p.length; i++) {
          average[i] = (average[i] ?? 0) + (p[i] ?? 0) / (beats - settle)
        }
      }
    }

    const norm = (g: (i: number) => number): number => {
      let sum = 0

      for (let i = 0; i < average.length; i++) {
        sum += g(i) ** 2
      }

      return Math.sqrt(sum)
    }
    const residual = norm(i => (average[i] ?? 0) - (coulomb.flux[i] ?? 0)) / norm(i => (stringFlux[i] ?? 0) - (coulomb.flux[i] ?? 0))
    const energy = huskEnergy(average)

    measured.push(energy)
    bulkCoulomb.push(bulkField.reduce((a, e) => a + e * e, 0) / 2)
    ok = ok && residual < 0.1
    metrics[`cR${r}Residual`] = residual
    metrics[`cR${r}HuskEnergy`] = energy
    metrics[`cR${r}HuskCoulomb`] = coulomb.energy
    metrics[`cR${r}HuskString`] = huskEnergy(stringFlux)
    metrics[`cR${r}BulkCoulomb`] = bulkCoulomb[bulkCoulomb.length - 1] ?? 0
  }

  const pHusk = falloff(measured.slice(1))
  const pBulk = falloff(bulkCoulomb.slice(1))
  const ratio = (measured[3] ?? 0) / (measured[0] ?? 1)

  return {
    ...metrics,
    cHuskEnergyRatio41: ratio,
    cHuskFalloff: pHusk,
    cBulkFalloff: pBulk,
    okC: ok && ratio < 2 && pHusk >= 0.5 && pHusk <= 2 && pBulk - pHusk >= 0.5 ? 1 : 0,
  }
}

export default experiment({
  id: 'gauge/husk-light',
  code: 'E-FRC-0169',
  title:
    "light on the husk: the bulk U(1) leapfrog projected onto the cubic horosphere of the {3,4,3,4} cusp carries 2 massless polarizations with the longitudinal one pinned by Gauss's law, at the speed of the plaquette-renormalized coupling, isotropic where the plain cubic lattice is not, and a love and a fear whose projected flux relaxes to the husk's Coulomb field, falling as 1 / r where the bulk's falls faster",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const ab = sectionAB()
    const c = sectionC()
    const sections = [ab.okA, ab.okB, c.okC]
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => !key.startsWith('ok')))

    return verdict({
      status: sections.every(x => x === 1) ? 'pass' : sections.some(x => x === 1) ? 'partial' : 'fail',
      claim:
        "projected onto the 12^3 husk, the bulk leapfrog shows 2 light branches at the smallest husk wave vector, massless, with the longitudinal flux pinned by the husk's Gauss's law, at the renormalized leapfrog speed, isotropic to under 1 percent between two cubic-inequivalent directions at |k| = pi / 2 where the plain cubic torus differs by over 3 percent, and a static love and fear whose projected flux relaxes to the husk's Coulomb field with an energy falling as about 1 / r, slower than the bulk's",
      metrics: { ...strip(ab), ...strip(c), sectionA: ab.okA, sectionB: ab.okB, sectionC: c.okC },
      control: {
        cubicAnisotropy: ab['bCubicAnisotropy'] ?? -1,
        bulkFalloff: c['cBulkFalloff'] ?? -1,
      },
      notes:
        'L2, exact integers, deterministic. The husk field is a projection: the column sum is the bulk field at k4 = 0, so husk light is the bulk light whose wave vector lies in the husk, with its depth-polarized branch killed by the projection (E-FRC-0168). The flat box models the cusp region. The hyperbolic bulk would weight the column by the warp factor, which is not modeled. First run, 2026-09-25, status partial, and the failures stand: (A) 2 light branches, 1 pinned direction and a doubling of 1.89 all pass, but the lagged estimator still reads the photon 8.1 percent above the renormalized prediction (0.1107 against 0.1024) and gives m^2 at 0.117 of its value at m1, against gates of 5 percent and 0.05, while the time-domain zero crossing reads 0.1015, within 0.9 percent of the prediction; (C) the flux residual is 0.132 at r = 1 against a gate of 0.1 (0.090, 0.075, 0.066 at r = 2 to 4), the other two C gates pass.',
    })
  },
})
