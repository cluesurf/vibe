// Does light exist in the knit's U(1) link sector? The leapfrog of code/rule/photon-links (E-FRC-0164), each
// link an angle in Z_8192 and an integer flux with Gauss's law exact, run from a hashed transverse flux, and
// every number read from the beats themselves: the frequency of each mode is 4 sin^2(omega / 2) = <|dE|^2> /
// <|E|^2>, the generalized eigenproblem of the flux's time-averaged correlators (code/measure/photon-modes),
// with the Gauss-pinned direction left out. No random numbers. N = 8192 and K = 80 (kappa = 2 pi K / N =
// 0.0614) are the E-FRC-0164 choices, fixed from stability and rounding before any of this was run. The
// temperature is read from the flux, T = sum E^2 / (links - docks), and beta = K N / (2 pi T) is the
// coupling of the thermal field, the classical ensemble of H = sum E^2 / 2 + (K N / 2 pi) sum (1 - cos B).
//
// Two geometries. The D4 box is the bulk substrate the knit's gauge experiments run on, the algorithmic
// structure and not physical space. It has four dimensions, so a free photon in the bulk substrate has
// 4 - 1 = 3 polarizations and the Coulomb field of a charge falls as 1 / r^2 there. Physics is read on the
// husk, the 3D horosphere surface of the {3,4,3,4} tessellation. The cubic torus stands in for that flat 3D
// surface, where a photon has 2 and the field falls as 1 / r. The predictions are the geometry's, fixed
// here before the run.
//
// Gates, all fixed before the run:
// A. Light on the D4 box, side 8, beta near 3 (the flux curl of plaquette integers within
//    a = sqrt(3 T / 4), T = K N / (2 pi 3)), 500 beats settling then 3,000 measured. Modes n1 = (1,0,0,0),
//    k = 2 pi / 8 along an axis, n2 = 2 n1, and n1' = (0,1,0,0), k along a root:
//    A1 Gauss's law pins exactly 1 of the 12 flux directions at every mode (the longitudinal one: C0 below
//       1e-9 of its largest eigenvalue): the longitudinal non-mode
//    A2 light: exactly 3 branches at n1 below the cut (half the massive gap, leapfrog omega of lambda 12)
//       whose frequency doubles within 1.6 to 2.1 at n2. The other 8 branches are the massive lattice modes
//    A3 massless: fitting 4 sin^2(omega / 2) = m^2 + s lambda(k) through n1 and n2 on the photon branch,
//       |m^2| < 0.05 of its value at n1
//    A4 the speed: the photon frequency at n1 within 5 percent of the linear leapfrog frequency with the
//       coupling renormalized by the thermal plaquette, kappa <cos B>
//    A5 a second method: the first zero of the time autocorrelation of one transverse polarization at n1,
//       omega = pi / (2 tau0), within 10 percent of A's photon frequency
//    A6 the cubic torus, side 12, at the same kappa and beta: 1 pinned direction and 2 light branches
// B. Isotropy of light, side 12, at |k| = 2 pi 3 / 12 = pi / 2, the smallest shell holding two orbits of the
//    full symmetry W(F4) of the D4 box: k along (3,0,0,0) (and its images (3/2)^4, (0,3,0,0)) and along
//    (2,2,1,0) (and (5/2,3/2,1/2,1/2), (1,0,2,2)). W(F4) has no invariant of degree 4, so light on the D4
//    lattice is isotropic through order k^4, where the cubic lattice's is not. Gates: the mean photon
//    frequency differs between the two orbits by under 1 percent on the D4 box, and by over 3 percent
//    on the cubic torus between (3,0,0) and (2,2,1)
// C. The phase, and the confinement transition, in the temperature, K and N: the D4 box side 6, from
//    beta = 4 down to 0.25 in 9 steps, 800 beats settling and 1,200 measured, for (N, K) = (8192, 80),
//    (2048, 20) (the same kappa) and (8192, 40) (half the kappa). Light is counted as in A at n1 = (1,0,0,0)
//    and n2 = (2,0,0,0):
//    C1 each (N, K) has a point with 3 light branches (the Coulomb phase) and a point with none
//    C2 the transition, the beta interval between the lowest-temperature point without all 3 branches and
//       the point before it, overlaps across the three (N, K): the phase is set by beta = K N / (2 pi T)
//    C3 in the Coulomb points the temperature drifts by under 10 percent over the window
// D. The static potential between a love and a fear.
//    D1 the Wilson loops of A's thermal field, r x t rectangles along two orthogonal roots, r and t up to 3,
//       against the free massless photon, ln W = -S / (2 beta'), S = J^T M^+ J computed from the lattice's
//       own curl-curl operator: a one-parameter fit has r^2 at least 0.99, beta' beta^-1 <cos B>^-1 is
//       within 15 percent of 1, and an added area (confining) term contributes under 10 percent of ln W at
//       3 x 3. The static potential V(r) = ln(W(r, 2) / W(r, 3)) is reported beside the photon's
//    D2 a static love and fear, e = 64 flux units per vibe, on the empty D4 box side 8 at separations 1 to 4
//       along a root, and on the cubic torus side 12 at 1 to 6 along an axis, started joined by a straight
//       string of flux, 2,500 beats: the flux averaged over beats 500 to 2,500 is the Coulomb field
//       (||<E> - E_L|| under 0.1 of ||E_string - E_L||, E_L solved from Gauss's law), its energy is within
//       5 percent of the Coulomb energy, and V(4) / V(1) < 2 where a string would give 4. The Coulomb energy's
//       falloff exponent p in V = a - b / r^p (r = 2 to 4) is larger on the D4 box than on the cubic torus
//       by at least 0.5 (4D against 3D)
// E. The demon form of E-FRC-0164 (exact energy, no drift), D4 side 6, as A: no light branch
//
// Depth L2: Hamiltonian compact U(1) lattice gauge theory (Kogut and Susskind 1975), its classical
// thermal field, the free-photon Wilson loop and the lattice Coulomb field are all textbook. What is
// measured is that these integer beats carry them, on the knit's own lattice.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addHashedCurl,
  coulombFlux,
  emptyPhotonState,
  fillHashedDemons,
  magneticSum,
  makePhotonRule,
  pathAngle,
  pathLinks,
  photonBeatInPlace,
  photonLatticeCubic,
  photonLatticeD4,
  placePair,
  rectangle,
  setHashedAngles,
  type PhotonLattice,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'
import {
  accumulate,
  difference,
  leapfrogOmega,
  linearWaveEigenvalues,
  loopAction,
  makeCorrelator,
  modeFrequencies,
  modeReader,
  waveVector,
  type Correlator,
  type ModeFrequencies,
  type ModeVector,
} from '@/code/measure/photon-modes'

const N = 8192
const K = 80
const CHARGE = 64
// the demon form's demons, filled hashed up to this, near twice the working temperature per link
const DEMON_CAPACITY = 1 << 17
const WORKING_BETA = 3
const GAUSS_TOLERANCE = 1e-9
const DOUBLING = [1.6, 2.1] as const
const SCAN_BETAS = [4, 2.8, 2, 1.4, 1, 0.7, 0.5, 0.35, 0.25]
const SCAN_SETS = [
  [8192, 80],
  [2048, 20],
  [8192, 40],
] as const
const LOOP_ROOTS = [
  [0, 1],
  [20, 21],
  [4, 5],
] as const

const kappaOf = (rule: PhotonRule): number => (2 * Math.PI * rule.k) / rule.n
const betaOf = (rule: PhotonRule, t: number): number => (rule.k * rule.n) / (2 * Math.PI * t)
const cutOf = (rule: PhotonRule): number => leapfrogOmega(kappaOf(rule), 12) / 2
const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

function temperature(rule: PhotonRule, s: PhotonState): number {
  let sum = 0

  for (let l = 0; l < s.flux.length; l++) {
    sum += (s.flux[l] ?? 0) * (s.flux[l] ?? 0)
  }

  return sum / (rule.lattice.links - rule.lattice.cells + 1)
}

// a thermal start at a target beta: angles 0, the flux the curl of plaquette integers within sqrt(3 T / 4)
function thermalStart(rule: PhotonRule, beta: number, mode: 'leapfrog' | 'demon' = 'leapfrog'): PhotonState {
  const s = emptyPhotonState(rule)
  const target = (rule.k * rule.n) / (2 * Math.PI * beta)

  addHashedCurl(rule, s, Math.max(1, Math.round(Math.sqrt((3 * target) / 4))), 5.3)

  if (mode === 'demon') {
    setHashedAngles(rule, s, 512, 3.7)
    fillHashedDemons(s, rule.capacity, 2.9)
  }

  return s
}

type Probe = { n: number[]; c0: Correlator; c1: Correlator; last: ModeVector | undefined; read: (f: ArrayLike<number>) => ModeVector }

type Thermal = {
  modes: ModeFrequencies[]
  temperatures: number[]
  meanCos: number
  series: ModeVector[]
  loops: Map<string, number[]>
}

// settle, then measure: mode correlators every beat, the temperature every beat, the plaquette and Wilson
// loops every `every` beats
function thermal(
  rule: PhotonRule,
  s: PhotonState,
  input: { settle: number; measure: number; modes: number[][]; every?: number; loops?: [string, number[]][]; track?: { mode: number; weights: number[] } },
): Thermal {
  const every = input.every ?? 10
  const probes: Probe[] = input.modes.map(n => {
    const reader = modeReader(rule.lattice, n)

    return { n, c0: makeCorrelator(rule.lattice.firsts.length), c1: makeCorrelator(rule.lattice.firsts.length), last: undefined, read: f => reader.read(f) }
  })
  const temperatures: number[] = []
  const cosines: number[] = []
  const series: ModeVector[] = []
  const loops = new Map<string, number[]>((input.loops ?? []).map(([key]) => [key, []]))

  for (let t = 0; t < input.settle + input.measure; t++) {
    photonBeatInPlace(rule, s, t)

    if (t < input.settle) {
      continue
    }

    temperatures.push(temperature(rule, s))

    probes.forEach((p, i) => {
      const v = p.read(s.flux)

      if (p.last) {
        accumulate(p.c0, v)
        accumulate(p.c1, difference(v, p.last))
      }

      p.last = v

      if (input.track && input.track.mode === i) {
        const w = input.track.weights

        series.push({
          re: Float64Array.of(v.re.reduce((a, x, j) => a + x * (w[j] ?? 0), 0)),
          im: Float64Array.of(v.im.reduce((a, x, j) => a + x * (w[j] ?? 0), 0)),
        })
      }
    })

    if ((t - input.settle) % every === 0) {
      cosines.push(magneticSum(rule, s.angle).meanCos)

      for (const [key, dirs] of input.loops ?? []) {
        let sum = 0

        for (let x = 0; x < rule.lattice.cells; x++) {
          sum += Math.cos((2 * Math.PI * pathAngle(rule, s.angle, x, dirs)) / rule.n)
        }

        loops.get(key)?.push(sum / rule.lattice.cells)
      }
    }
  }

  return {
    modes: probes.map(p => modeFrequencies({ c0: p.c0, c1: p.c1, tolerance: GAUSS_TOLERANCE })),
    temperatures,
    meanCos: mean(cosines),
    series,
    loops,
  }
}

// light branches: sorted frequencies below the cut at n1 whose partner at n2 is 1.6 to 2.1 times higher
function lightBranches(rule: PhotonRule, at1: ModeFrequencies, at2: ModeFrequencies): number[] {
  const cut = cutOf(rule)

  return at1.omega.flatMap((w, i) => {
    const ratio = (at2.omega[i] ?? 0) / w

    return w < cut && ratio >= DOUBLING[0] && ratio <= DOUBLING[1] ? [i] : []
  })
}

// the first zero of Re <P(t + tau) P(t)*>, linearly interpolated
function firstZero(series: readonly ModeVector[], maxLag: number): number {
  const r = (tau: number): number => {
    let sum = 0

    for (let t = 0; t + tau < series.length; t++) {
      const a = series[t + tau]
      const b = series[t]

      sum += (a?.re[0] ?? 0) * (b?.re[0] ?? 0) + (a?.im[0] ?? 0) * (b?.im[0] ?? 0)
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

function sectionA(): Record<string, number> & { ok: number } {
  const d4 = photonLatticeD4({ side: 8 })
  const rule = makePhotonRule({ lattice: d4, n: N, k: K, capacity: 0, hop: false })
  const modes = [
    [1, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 1, 0, 0],
  ]
  const k1 = waveVector(d4, modes[0] ?? [])
  // transverse polarization (0, 0, 1, 0), read on the 12 links as e_a . epsilon
  const weights = d4.firsts.map(d => d4.vectors[d]?.[2] ?? 0)
  const shapes: [string, number[]][] = []

  for (const [a, b] of LOOP_ROOTS) {
    for (let r = 1; r <= 3; r++) {
      for (let t = 1; t <= 3; t++) {
        shapes.push([`${a}:${b}:${r}:${t}`, rectangle(d4, a, r, b, t)])
      }
    }
  }

  const run = thermal(rule, thermalStart(rule, WORKING_BETA), { settle: 500, measure: 3000, modes, loops: shapes, every: 5, track: { mode: 0, weights } })
  const temperature = mean(run.temperatures)
  const beta = betaOf(rule, temperature)
  const drift = Math.abs((run.temperatures[run.temperatures.length - 1] ?? 0) - (run.temperatures[0] ?? 0)) / temperature
  const [m1, m2, mr] = run.modes as [ModeFrequencies, ModeFrequencies, ModeFrequencies]
  const light = lightBranches(rule, m1, m2)
  const photon1 = mean(light.map(i => m1.omega[i] ?? 0))
  const photon2 = mean(light.map(i => m2.omega[i] ?? 0))
  const photonRoot = mean(light.map(i => mr.omega[i] ?? 0))
  const lambda1 = linearWaveEigenvalues(d4, modes[0] ?? [])[1] ?? 0
  const lambda2 = linearWaveEigenvalues(d4, modes[1] ?? [])[1] ?? 0
  const lambdaRoot = linearWaveEigenvalues(d4, modes[2] ?? [])[1] ?? 0
  const q = (w: number): number => 4 * Math.sin(w / 2) ** 2
  const slope = (q(photon2) - q(photon1)) / (lambda2 - lambda1)
  const mass2 = q(photon1) - slope * lambda1
  const predicted = leapfrogOmega(kappaOf(rule) * run.meanCos, lambda1)
  const bare = leapfrogOmega(kappaOf(rule), lambda1)
  const tau0 = firstZero(run.series, 60)
  const direct = Math.PI / (2 * tau0)
  const kNorm = Math.hypot(...k1)

  // the cubic torus at the same kappa and beta
  const cube = photonLatticeCubic({ side: 12 })
  const cubeRule = makePhotonRule({ lattice: cube, n: N, k: K, capacity: 0, hop: false })
  const cubeRun = thermal(cubeRule, thermalStart(cubeRule, WORKING_BETA), {
    settle: 500,
    measure: 3000,
    modes: [
      [1, 0, 0],
      [2, 0, 0],
    ],
  })
  const [c1, c2] = cubeRun.modes as [ModeFrequencies, ModeFrequencies]
  const cubeLight = lightBranches(cubeRule, c1, c2)

  // D1: Wilson loops against the free photon
  const lnW = new Map<string, number>()

  for (const [key] of shapes) {
    lnW.set(key, Math.log(mean(run.loops.get(key) ?? [])))
  }

  const action = new Map<string, number>()

  for (let r = 1; r <= 3; r++) {
    for (let t = r; t <= 3; t++) {
      const s = loopAction(d4, pathLinks(d4, 0, rectangle(d4, 0, r, 1, t)))

      action.set(`${r}:${t}`, s)
      action.set(`${t}:${r}`, s)
    }
  }

  const points: { s: number; lnw: number; area: number }[] = []

  for (const [a, b] of LOOP_ROOTS) {
    for (let r = 1; r <= 3; r++) {
      for (let t = 1; t <= 3; t++) {
        points.push({ s: action.get(`${r}:${t}`) ?? 0, lnw: lnW.get(`${a}:${b}:${r}:${t}`) ?? 0, area: r * t })
      }
    }
  }

  // one parameter: ln W = -c S, c = 1 / (2 beta')
  const c = -points.reduce((sum, p) => sum + p.lnw * p.s, 0) / points.reduce((sum, p) => sum + p.s * p.s, 0)
  const meanLn = mean(points.map(p => p.lnw))
  const r2 = 1 - points.reduce((sum, p) => sum + (p.lnw + c * p.s) ** 2, 0) / points.reduce((sum, p) => sum + (p.lnw - meanLn) ** 2, 0)
  const betaPrime = 1 / (2 * c)
  // two parameters: ln W = -coulomb S - sigma area
  const sss = points.reduce((sum, p) => sum + p.s * p.s, 0)
  const ssa = points.reduce((sum, p) => sum + p.s * p.area, 0)
  const saa = points.reduce((sum, p) => sum + p.area * p.area, 0)
  const sls = -points.reduce((sum, p) => sum + p.lnw * p.s, 0)
  const sla = -points.reduce((sum, p) => sum + p.lnw * p.area, 0)
  const det = sss * saa - ssa * ssa
  const coulomb = (sls * saa - sla * ssa) / det
  const sigma = (sss * sla - ssa * sls) / det
  const s33 = action.get('3:3') ?? 0
  const areaShare = Math.abs(sigma * 9) / Math.abs(coulomb * s33 + sigma * 9)
  const lnw = (r: number, t: number): number => mean(LOOP_ROOTS.map(([a, b]) => lnW.get(`${a}:${b}:${r}:${t}`) ?? 0))
  const potential = [1, 2, 3].map(r => lnw(r, 2) - lnw(r, 3))
  const potentialPhoton = [1, 2, 3].map(r => c * ((action.get(`${r}:3`) ?? 0) - (action.get(`${r}:2`) ?? 0)))
  // equipartition: 11 transverse flux directions per dock over 32 triangles, so <theta^2> beta = 11 / 32
  const triangleAction = 11 / 32
  const rootIndex = (v: number[]): number => d4.vectors.findIndex(r => r.every((x, i) => x === v[i]))
  const triangle = [rootIndex([1, 1, 0, 0]), rootIndex([-1, 0, 1, 0]), rootIndex([0, -1, -1, 0])]

  const okA =
    [m1, m2, mr].every(m => m.nullDirections === 1) &&
    light.length === 3 &&
    Math.abs(mass2) < 0.05 * q(photon1) &&
    Math.abs(photon1 / predicted - 1) < 0.05 &&
    Math.abs(direct / photon1 - 1) < 0.1 &&
    [c1, c2].every(m => m.nullDirections === 1) &&
    cubeLight.length === 2 &&
    drift < 0.1
  const okD1 = r2 >= 0.99 && Math.abs(betaPrime / (beta * run.meanCos) - 1) < 0.15 && areaShare < 0.1

  return {
    ok: okA && okD1 ? 1 : 0,
    aTemperature: temperature,
    aBeta: beta,
    aTemperatureDrift: drift,
    aMeanCos: run.meanCos,
    aNullDirectionsN1: m1.nullDirections,
    aNullDirectionsN2: m2.nullDirections,
    aNullDirectionsRoot: mr.nullDirections,
    aLightBranches: light.length,
    aPhotonOmegaN1: photon1,
    aPhotonOmegaN2: photon2,
    aPhotonOmegaRoot: photonRoot,
    aPhotonDoubling: photon2 / photon1,
    aPhotonSplitN1: Math.max(...light.map(i => m1.omega[i] ?? 0)) - Math.min(...light.map(i => m1.omega[i] ?? 0)),
    aMassiveLowestN1: m1.omega[3] ?? 0,
    aCut: cutOf(rule),
    aMassSquaredOverN1: mass2 / q(photon1),
    aPredictedOmegaN1: predicted,
    aBareOmegaN1: bare,
    aOmegaOverPredicted: photon1 / predicted,
    aSpeed: photon1 / kNorm,
    aPredictedSpeed: predicted / kNorm,
    aRootSpeed: photonRoot / Math.hypot(...waveVector(d4, modes[2] ?? [])),
    aRootPredicted: leapfrogOmega(kappaOf(rule) * run.meanCos, lambdaRoot),
    aDirectTau0: tau0,
    aDirectOmega: direct,
    aDirectOverPhoton: direct / photon1,
    aCubicNullDirections: c1.nullDirections,
    aCubicLightBranches: cubeLight.length,
    aCubicPhotonOmega: mean(cubeLight.map(i => c1.omega[i] ?? 0)),
    aCubicBeta: betaOf(cubeRule, mean(cubeRun.temperatures)),
    d1CoulombR2: r2,
    d1BetaPrime: betaPrime,
    d1BetaPrimeOverBetaCos: betaPrime / (beta * run.meanCos),
    d1AreaShareAt3x3: areaShare,
    d1Sigma: sigma,
    d1TriangleActionOverExpected: loopAction(d4, pathLinks(d4, 0, triangle)) / triangleAction,
    d1LnW11: lnw(1, 1),
    d1LnW33: lnw(3, 3),
    d1PotentialR1: potential[0] ?? 0,
    d1PotentialR2: potential[1] ?? 0,
    d1PotentialR3: potential[2] ?? 0,
    d1PhotonPotentialR1: potentialPhoton[0] ?? 0,
    d1PhotonPotentialR2: potentialPhoton[1] ?? 0,
    d1PhotonPotentialR3: potentialPhoton[2] ?? 0,
  }
}

function orbitOmega(lattice: PhotonLattice, beta: number, orbits: number[][][], branches: number, settle: number, measure: number): number[] {
  const rule = makePhotonRule({ lattice, n: N, k: K, capacity: 0, hop: false })
  const run = thermal(rule, thermalStart(rule, beta), { settle, measure, modes: orbits.flat() })
  let at = 0

  return orbits.map(orbit =>
    mean(
      orbit.map(() => {
        const m = run.modes[at++]

        return mean((m?.omega ?? []).slice(0, branches))
      }),
    ),
  )
}

function sectionB(): Record<string, number> & { ok: number } {
  const d4 = photonLatticeD4({ side: 12 })
  // n for k = (3,0,0,0), (3/2)^4, (0,3,0,0) and k = (2,2,1,0), (5/2,3/2,1/2,1/2), (1,0,2,2), in units of 2 pi / 12
  const orbitA = [
    [3, 0, 0, 0],
    [0, 0, 0, 3],
    [-3, 3, 0, 0],
  ]
  const orbitB = [
    [0, 1, 1, 1],
    [1, 1, 0, 1],
    [1, -2, 0, 4],
  ]
  const [wA = 0, wB = 0] = orbitOmega(d4, WORKING_BETA, [orbitA, orbitB], 3, 300, 1500)
  const cube = photonLatticeCubic({ side: 12 })
  const [cA = 0, cB = 0] = orbitOmega(
    cube,
    WORKING_BETA,
    [
      [
        [3, 0, 0],
        [0, 3, 0],
        [0, 0, 3],
      ],
      [
        [2, 2, 1],
        [1, 2, 2],
        [2, 1, 2],
      ],
    ],
    2,
    300,
    1500,
  )
  const norms = [...orbitA, ...orbitB].map(n => Math.hypot(...waveVector(d4, n)))
  const linear = (lattice: PhotonLattice, n: number[], branches: number): number => mean(linearWaveEigenvalues(lattice, n).slice(1, 1 + branches))
  const d4Anisotropy = wB / wA - 1
  const cubicAnisotropy = cB / cA - 1

  return {
    ok: Math.abs(d4Anisotropy) < 0.01 && Math.abs(cubicAnisotropy) > 0.03 ? 1 : 0,
    bD4OmegaAxisOrbit: wA,
    bD4OmegaOtherOrbit: wB,
    bD4Anisotropy: d4Anisotropy,
    bD4LinearLambdaRatio: linear(d4, orbitB[0] ?? [], 3) / linear(d4, orbitA[0] ?? [], 3),
    bCubicOmegaAxis: cA,
    bCubicOmegaOther: cB,
    bCubicAnisotropy: cubicAnisotropy,
    bCubicLinearLambdaRatio: linear(cube, [2, 2, 1], 2) / linear(cube, [3, 0, 0], 2),
    bKNormSpread: Math.max(...norms) - Math.min(...norms),
  }
}

type ScanPoint = { beta: number; light: number; meanCos: number; drift: number }

function sectionC(): Record<string, number> & { ok: number } {
  const d4 = photonLatticeD4({ side: 6 })
  const metrics: Record<string, number> = {}
  const intervals: [number, number][] = []

  let ok = true

  SCAN_SETS.forEach(([n, k], set) => {
    const rule = makePhotonRule({ lattice: d4, n, k, capacity: 0, hop: false })
    const points: ScanPoint[] = SCAN_BETAS.map(target => {
      const run = thermal(rule, thermalStart(rule, target), {
        settle: 800,
        measure: 1200,
        modes: [
          [1, 0, 0, 0],
          [2, 0, 0, 0],
        ],
      })
      const temperature = mean(run.temperatures)
      const [m1, m2] = run.modes as [ModeFrequencies, ModeFrequencies]

      return {
        beta: betaOf(rule, temperature),
        light: lightBranches(rule, m1, m2).length,
        meanCos: run.meanCos,
        drift: Math.abs((run.temperatures[run.temperatures.length - 1] ?? 0) - (run.temperatures[0] ?? 0)) / temperature,
      }
    })

    points.forEach((p, i) => {
      metrics[`c${n}k${k}Point${i}Beta`] = p.beta
      metrics[`c${n}k${k}Point${i}Light`] = p.light
      metrics[`c${n}k${k}Point${i}MeanCos`] = p.meanCos
      metrics[`c${n}k${k}Point${i}Drift`] = p.drift
    })

    const sorted = [...points].sort((a, b) => b.beta - a.beta)
    const lost = sorted.findIndex(p => p.light < 3)
    const high = lost > 0 ? (sorted[lost - 1]?.beta ?? Number.NaN) : Number.NaN
    const low = lost > 0 ? (sorted[lost]?.beta ?? Number.NaN) : Number.NaN

    intervals.push([low, high])
    metrics[`c${n}k${k}TransitionLow`] = low
    metrics[`c${n}k${k}TransitionHigh`] = high
    metrics[`c${n}k${k}Set`] = set
    ok =
      ok &&
      points.some(p => p.light === 3) &&
      points.some(p => p.light === 0) &&
      points.filter(p => p.light === 3).every(p => p.drift < 0.1)
  })

  const overlap = Math.max(...intervals.map(([low]) => low)) <= Math.min(...intervals.map(([, high]) => high))

  metrics['cIntervalsOverlap'] = overlap ? 1 : 0

  return { ...metrics, ok: ok && overlap ? 1 : 0 }
}

type Charges = { residual: number[]; energy: number[]; coulomb: number[]; string: number[] }

function charges(lattice: PhotonLattice, direction: number, separations: number[]): Charges {
  const rule = makePhotonRule({ lattice, n: N, k: K, capacity: 0, hop: false, charge: CHARGE })
  const out: Charges = { residual: [], energy: [], coulomb: [], string: [] }

  for (const r of separations) {
    const s = emptyPhotonState(rule)

    placePair(rule, s, 0, direction, r, 1)

    const initial = Float64Array.from(s.flux)
    const coulomb = coulombFlux(rule, s.vibe)
    const average = new Float64Array(lattice.links)
    const settle = 500
    const beats = 2500

    for (let t = 0; t < beats; t++) {
      photonBeatInPlace(rule, s, t)

      if (t >= settle) {
        for (let l = 0; l < lattice.links; l++) {
          average[l] = (average[l] ?? 0) + (s.flux[l] ?? 0) / (beats - settle)
        }
      }
    }

    const norm = (f: (l: number) => number): number => {
      let sum = 0

      for (let l = 0; l < lattice.links; l++) {
        sum += f(l) ** 2
      }

      return sum
    }

    out.residual.push(Math.sqrt(norm(l => (average[l] ?? 0) - (coulomb[l] ?? 0)) / norm(l => (initial[l] ?? 0) - (coulomb[l] ?? 0))))
    out.energy.push(norm(l => average[l] ?? 0) / 2)
    out.coulomb.push(norm(l => coulomb[l] ?? 0) / 2)
    out.string.push(norm(l => initial[l] ?? 0) / 2)
  }

  return out
}

// p in V = a - b / r^p through three points, by bisection on the ratio (V3 - V2) / (V2 - V1)
function falloff(v: readonly number[], r: readonly number[]): number {
  const [r1 = 2, r2 = 3, r3 = 4] = r
  const [v1 = 0, v2 = 0, v3 = 0] = v
  const target = (v3 - v2) / (v2 - v1)
  const shape = (p: number): number => (r2 ** -p - r3 ** -p) / (r1 ** -p - r2 ** -p)

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

function sectionD2(): Record<string, number> & { ok: number } {
  const d4 = charges(photonLatticeD4({ side: 8 }), 0, [1, 2, 3, 4])
  const cube = charges(photonLatticeCubic({ side: 12 }), 0, [1, 2, 3, 4, 5, 6])
  const pD4 = falloff(d4.coulomb.slice(1, 4), [2, 3, 4])
  const pCube = falloff(cube.coulomb.slice(1, 4), [2, 3, 4])
  const good = (c: Charges): boolean =>
    c.residual.every(x => x < 0.1) && c.energy.every((e, i) => Math.abs(e / (c.coulomb[i] ?? 1) - 1) < 0.05) && (c.energy[3] ?? 0) / (c.energy[0] ?? 1) < 2
  const metrics: Record<string, number> = {}

  for (const [name, c] of [
    ['d2D4', d4],
    ['d2Cubic', cube],
  ] as const) {
    c.residual.forEach((x, i) => {
      metrics[`${name}R${i + 1}Residual`] = x
      metrics[`${name}R${i + 1}Energy`] = c.energy[i] ?? 0
      metrics[`${name}R${i + 1}Coulomb`] = c.coulomb[i] ?? 0
      metrics[`${name}R${i + 1}String`] = c.string[i] ?? 0
    })
  }

  return { ...metrics, d2D4Falloff: pD4, d2CubicFalloff: pCube, ok: good(d4) && good(cube) && pD4 - pCube >= 0.5 ? 1 : 0 }
}

function sectionE(): Record<string, number> & { ok: number } {
  const d4 = photonLatticeD4({ side: 6 })
  const rule = makePhotonRule({ lattice: d4, mode: 'demon', n: N, k: K, capacity: DEMON_CAPACITY, hop: false })
  const run = thermal(rule, thermalStart(rule, WORKING_BETA, 'demon'), {
    settle: 300,
    measure: 1000,
    modes: [
      [1, 0, 0, 0],
      [2, 0, 0, 0],
    ],
  })
  const [m1, m2] = run.modes as [ModeFrequencies, ModeFrequencies]
  const light = lightBranches(rule, m1, m2)

  return {
    ok: light.length === 0 ? 1 : 0,
    eDemonLightBranches: light.length,
    eDemonLowestOmegaN1: m1.omega[0] ?? 0,
    eDemonLowestOmegaN2: m2.omega[0] ?? 0,
    eDemonNullDirections: m1.nullDirections,
    eDemonMeanCos: run.meanCos,
  }
}

export default experiment({
  id: 'gauge/photon-light',
  code: 'E-FRC-0165',
  title:
    "light in the knit's U(1) link sector: the leapfrog of Z_8192 angles and integer flux carries a massless transverse wave on the D4 box (the bulk substrate, not physical space), 3 polarizations in the bulk substrate with the longitudinal one pinned by Gauss's law, at the speed the renormalized coupling predicts and isotropic through order k^4, a Coulomb phase whose Wilson loops are the free photon's, lost at a beta = K N / (2 pi T) shared across K and N, and a static love and fear whose flux relaxes to the Coulomb field of the four-dimensional bulk substrate, not a string",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const a = sectionA()
    const b = sectionB()
    const c = sectionC()
    const d2 = sectionD2()
    const e = sectionE()
    const sections = { a: a.ok, b: b.ok, c: c.ok, d2: d2.ok, e: e.ok }
    const all = Object.values(sections).every(x => x === 1)
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => key !== 'ok'))

    return verdict({
      status: all ? 'pass' : Object.values(sections).some(x => x === 1) ? 'partial' : 'fail',
      claim:
        "on the D4 box the leapfrog carries light: 3 transverse branches whose frequency doubles with k, massless, at the speed of the plaquette-renormalized coupling, the longitudinal direction pinned by Gauss's law and 8 massive lattice branches above, with 2 branches on the cubic torus; light isotropic between two symmetry orbits at |k| = pi / 2 where the cubic torus is not; a Coulomb phase whose Wilson loops follow the free photon, lost at a beta shared by three (N, K); and a static love and fear whose averaged flux is the Coulomb field, falling faster on the 4D bulk box than on the 3D control, while the exact-energy demon form carries no light",
      metrics: { ...strip(a), ...strip(b), ...strip(c), ...strip(d2), ...strip(e), sectionA: a.ok, sectionB: b.ok, sectionC: c.ok, sectionD2: d2.ok, sectionE: e.ok },
      control: {
        cubicLightBranches: a['aCubicLightBranches'] ?? -1,
        cubicAnisotropy: b['bCubicAnisotropy'] ?? -1,
        demonLightBranches: e['eDemonLightBranches'] ?? -1,
      },
      notes:
        'L2, exact integers, deterministic, no random numbers: every average is over the beats of one run. The gates were fixed before the run. The model is classical: its thermal field is the classical ensemble of compact U(1), so its Wilson loops read like those of Euclidean 4D compact U(1) and its real charges feel the Coulomb field of the 4D bulk substrate. The D4 box is the substrate, not physical space: physical light is read on the husk, the 3D horosphere surface, for which the cubic torus is the stand-in here. Real charges cannot confine classically here, since the kicks add only curls and leave the Coulomb field of the charges as it is. First run, 2026-09-25, status partial, and the failures stand: (A) the frequency estimator 4 sin^2(omega / 2) = <|dE|^2> / <|E|^2> reads the photon 13 percent above the renormalized prediction (0.171 against 0.151) and counts 2 light branches, not 3, because the beat-to-beat difference also picks up the broadband anharmonic part of the force, while the time-domain zero crossing of one transverse polarization reads 0.155, within 2.3 percent of the prediction; (C) that counter found light at every scan point, down to <cos B> = 0.27, so it cannot locate the transition, and no scan point lost light; (D1) the Wilson loops fit the free photon with r^2 0.93 at a beta 1.6 times the electric one, since a nearly linear leapfrog does not share energy across k within 3,500 beats, though the loop potential stays flat (no area term: sigma -0.014); (D2) on the D4 box the averaged energy sits 7 to 10 percent above the Coulomb energy, the residual oscillation of 2,000 beats, against the 5 percent gate, while the flux residual is under 0.082 at every separation and V(4) / V(1) is 1.12.',
    })
  },
})
