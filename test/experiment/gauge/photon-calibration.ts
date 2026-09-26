// Light measured against its exact answer. E-FRC-0179 derived the linear symbol of the leapfrog U(1) sector,
// 4 sin^2(omega / 2) = kappa lambda(k), with lambda the curl-curl eigenvalue (the husk photon at m1 = (1,0,0)
// on the 12^3 husk: lambda 0.18137, omega 0.10554 at kappa = 2 pi 80 / 8192). E-FRC-0165 and E-FRC-0169
// read light out of a hot field with three estimators and failed three gates: the lagged estimator read the
// husk photon 8 percent above a renormalized prediction, the fitted m^2 was 0.117 of its reference, and the
// love-fear flux residual at r = 1 was 0.132. Those failures stand. This experiment asks how much of each is
// the estimator, how much the rule, and how much the reference, by measuring where the answer is known.
//
// Gates, fixed before the run. N = 8192, K = 80, kappa = 2 pi K / N, the D4 box side 12 (husk 12^3) unless
// stated.
// A. The estimators on the exactly linear leapfrog (code/measure/photon-symbol, floating point, f(B) =
//    kappa B, no modulus), from the same hashed start as E-FRC-0165 and E-FRC-0169 (beta 3), each protocol
//    exactly as those experiments ran it: the bulk protocol of E-FRC-0165 A (D4 side 8, modes (1,0,0,0) and
//    (2,0,0,0), 500 beats settling and 3,000 measured, track (0,0,1,0)) and the husk protocol of E-FRC-0169 A
//    (side 12 projected, m1 and m2, 300 and 2,000, track (0,0,1)). All three estimators on both: the
//    difference estimator (<|dE|^2> / <|E|^2>), the lagged estimator (lag 3), the time-domain first zero.
//    The linear rule's answer is the symbol's, so each reading's ratio to the exact photon frequency minus 1
//    is that estimator's bias, reported, with its light-branch count and fitted m^2.
//    A1 the linear run carries the exact frequencies: a plane wave in the linear rule, read by the three-point
//       recurrence cos omega = <x_t (x_(t+1) + x_(t-1))> / (2 <x_t^2>), reproduces the symbol to 1e-9 (the
//       control that makes every bias below the estimator's own)
// B. Light through the cold vacuum, the E-FRC-0164 integer rule (round(K sin(2 pi B / N))): a standing
//    plane wave of one symbol eigenvector, A = round(a Re(v e^(i k . x))) with E = 0, rounded symmetrically,
//    300 beats, its frequency read by the three-point recurrence on the flux projected onto v (the husk: the
//    column-summed flux onto P v). a is set so the largest plaquette |B| of the unrounded wave is a target:
//    B1 the dead zone: at target 6 the rule's force table is zero on every plaquette (|B| <= 8), so the flux
//       stays exactly 0 and the angles exactly still on all 300 beats: no light below the threshold
//    B2 at target 256 (kappa |B| up to 16, 2 pi |B| / N up to 0.2), husk m1: each of the 2 depth-even photons
//       within 1 percent of the symbol's omega; the depth-odd photon's husk field exactly 0 on every beat.
//       2 polarizations on the husk
//    B3 the husk dispersion at target 256: m = (2,0,0), (3,0,0), (2,2,1), within 1 percent of the symbol
//    B4 the bulk: k along the depth, n = (0,0,-1,1), each of the 3 bulk photons within 1 percent
//    The sweep at m1, targets 64 and 1024, is reported beside B2 (the rounding and the sine at either end)
// C. The linear force. An integer table can be linear only with an integer slope: f(B) = K' centered(B), a
//    kappa of K' >= 1. By E-FRC-0179, kappa lambda_max = K' 16 > 4, so the symbol has blocks with trace below
//    -2 and eigenvalues off the unit circle. So the prediction, fixed here: no integer K' gives a stable
//    exactly linear leapfrog on this lattice, and no integer K' gives the E-FRC-0164 light (kappa 0.0614).
//    C1 K' = 1 on the D4 box side 6 from one unit of flux: the integer I = E.E + (CA).(CA) + (CE).(CA),
//       the leapfrog's exact invariant, is constant to the unit on every beat before the first wrap
//       (|C A| reaching N / 2), and the first wrap comes within 10 beats (growth up to the symbol's largest
//       |eigenvalue|, reported); after it I is not conserved
//    C2 the rounded linear force f(B) = round(kappa centered(B)), the E-FRC-0164 kappa without the sine:
//       the husk m1 photon at target 256 within 1 percent of the symbol (the same light)
//    C3 heating: from the E-FRC-0165 hashed start (D4 side 8, beta 3), 500 beats settling then 2,000, the
//       shadow energy's relative drift between the first and last 200 beats of the window, for the sine table
//       and the rounded linear table. Prediction: the rounding, present in both, is what heats, so the ratio of
//       the two drifts lies in 0.5 to 2. Wraps of B across N / 2 are counted and reported
// D. The love and fear on the husk, the E-FRC-0169 C protocol (e = 64, husk r = 1 to 4, 4,000 beats, the
//    projected flux averaged over beats 400 to 4,000), against huskCoulomb, which E-FRC-0179 showed is exactly
//    the husk lattice Green's function and the projection of the bulk Coulomb field:
//    D1 the linear rule: the residual ||P<E> - E_C|| / ||P E_string - E_C|| under 0.01 at every r, r = 1
//       included: the lattice Green's function is the relaxed field of the rule's linear part, core and all
//    D2 the integer rule at r = 2, 3, 4: the husk energy of the averaged field within 5 percent of the lattice
//       Coulomb energy (the r >= 2 residuals were already seen in E-FRC-0169 and are reproduced, not gated)
//    D3 the integer rule: halving the averaging window (beats 2,200 to 4,000) raises the residual by 1.2 to 1.7
//       at every r: what is left is noise in a finite time average of a thermalized transverse field
//       (falling as T^-1/2), not a static departure from the lattice Coulomb field
//    The r = 1 residual, its share on the links at the two charges, and its dependence on e (16, 64, 256)
//    are reported
//
// Depth L2: the free lattice photon and its lattice Coulomb field, used as exact references to calibrate the
// measurements of E-FRC-0165 and E-FRC-0169.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addHashedCurl,
  emptyPhotonState,
  lastKick,
  makePhotonRule,
  photonBeatInPlace,
  photonEnergy,
  photonLatticeD4,
  placePairAlong,
  plaquetteField,
  type PhotonLattice,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'
import {
  accumulate,
  accumulateCross,
  difference,
  leapfrogOmega,
  linearWaveEigenvalues,
  makeCorrelator,
  modeFrequencies,
  modeReader,
  plaquetteWaveMatrix,
  type Correlator,
  type ModeFrequencies,
  type ModeVector,
} from '@/code/measure/photon-modes'
import { bulkModeOfHusk, columnSum, HUSK_VECTORS, huskCoulomb, huskEnergy, makeHusk, projectLinks, type Husk } from '@/code/measure/photon-husk'
import {
  centered,
  eigenvalues,
  eigenvector,
  huskSymbol,
  leapfrogBlock,
  liftEven,
  liftOdd,
  linearForceTable,
  makeLinearLeapfrog,
  roundedLinearForceTable,
  withForce,
} from '@/code/measure/photon-symbol'

const SIDE = 12
const N = 8192
const K = 80
const KAPPA = (2 * Math.PI * K) / N
const BETA = 3
const LAG = 3
const DOUBLING = [1.6, 2.1] as const
const WAVE_BEATS = 300
const WINDOW_TARGET = 256
const CHARGE = 64

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const cut = leapfrogOmega(KAPPA, 12) / 2
const q = (w: number): number => 4 * Math.sin(w / 2) ** 2
const symmetricRound = (x: number): number => Math.sign(x) * Math.round(Math.abs(x))
const modulo = (x: number, m: number): number => ((x % m) + m) % m

type Vector = { re: Float64Array; im: Float64Array }

// A. the estimators

type Probe = {
  read: (field: ArrayLike<number>) => ModeVector
  diff0: Correlator
  diff1: Correlator
  last: ModeVector | undefined
  lag0: Correlator
  lag1: Correlator
  history: ModeVector[]
}

function makeProbe(lattice: PhotonLattice, n: readonly number[]): Probe {
  const f = lattice.firsts.length
  const reader = modeReader(lattice, n)

  return {
    read: field => reader.read(field),
    diff0: makeCorrelator(f),
    diff1: makeCorrelator(f),
    last: undefined,
    lag0: makeCorrelator(f),
    lag1: makeCorrelator(f),
    history: [],
  }
}

// both accumulations, each exactly as its experiment ran it
function feed(p: Probe, v: ModeVector): void {
  if (p.last) {
    accumulate(p.diff0, v)
    accumulate(p.diff1, difference(v, p.last))
  }

  p.last = v
  accumulate(p.lag0, v)

  const past = p.history.length >= LAG ? p.history[p.history.length - LAG] : undefined

  if (past) {
    accumulateCross(p.lag1, v, past)
  }

  p.history.push(v)

  if (p.history.length > LAG) {
    p.history.shift()
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

function lightBranches(at1: ModeFrequencies, at2: ModeFrequencies): number[] {
  return at1.omega.flatMap((w, i) => {
    const ratio = (at2.omega[i] ?? 0) / w

    return w < cut && ratio >= DOUBLING[0] && ratio <= DOUBLING[1] ? [i] : []
  })
}

function hashedStart(rule: PhotonRule): PhotonState {
  const s = emptyPhotonState(rule)
  const target = (rule.k * rule.n) / (2 * Math.PI * BETA)

  addHashedCurl(rule, s, Math.max(1, Math.round(Math.sqrt((3 * target) / 4))), 5.3)

  return s
}

type Readings = { probes: Probe[]; series: number[][] }

// the linear rule from the hashed start, reading `modes` of view(flux) on `lattice`
function linearRun(
  bulk: PhotonLattice,
  lattice: PhotonLattice,
  view: (flux: Float64Array) => ArrayLike<number>,
  input: { settle: number; beats: number; modes: number[][]; track: readonly number[] },
): Readings {
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false })
  const start = hashedStart(rule)
  const angle = new Float64Array(bulk.links)
  const flux = Float64Array.from(start.flux)
  const linear = makeLinearLeapfrog(bulk, KAPPA)
  const probes = input.modes.map(n => makeProbe(lattice, n))
  const series: number[][] = []

  for (let t = 0; t < input.settle + input.beats; t++) {
    linear.beat(angle, flux)

    if (t < input.settle) {
      continue
    }

    const field = view(flux)

    probes.forEach((p, i) => {
      const v = p.read(field)

      feed(p, v)

      if (i === 0) {
        series.push([v.re.reduce((a, x, j) => a + x * (input.track[j] ?? 0), 0), v.im.reduce((a, x, j) => a + x * (input.track[j] ?? 0), 0)])
      }
    })
  }

  return { probes, series }
}

function estimate(prefix: string, readings: Readings, exact: readonly number[], lambdas: readonly [number, number]): Record<string, number> {
  const [p1, p2] = readings.probes as [Probe, Probe]
  const exactMean = mean(exact)
  const out: Record<string, number> = { [`${prefix}ExactPhotonMean`]: exactMean }

  for (const [name, at1, at2] of [
    ['Difference', modeFrequencies({ c0: p1.diff0, c1: p1.diff1, tolerance: 1e-9 }), modeFrequencies({ c0: p2.diff0, c1: p2.diff1, tolerance: 1e-9 })],
    ['Lagged', modeFrequencies({ c0: p1.lag0, c1: p1.lag1, lag: LAG, tolerance: 1e-9 }), modeFrequencies({ c0: p2.lag0, c1: p2.lag1, lag: LAG, tolerance: 1e-9 })],
  ] as const) {
    const light = lightBranches(at1, at2)
    const w1 = mean(light.map(i => at1.omega[i] ?? 0))
    const w2 = mean(light.map(i => at2.omega[i] ?? 0))
    const slope = (q(w2) - q(w1)) / (lambdas[1] - lambdas[0])
    const mass2 = q(w1) - slope * lambdas[0]
    // the lowest reading at m1 against the lowest exact photon, whatever the count
    const lowest = at1.omega[0] ?? 0

    out[`${prefix}${name}LightBranches`] = light.length
    out[`${prefix}${name}NullDirections`] = at1.nullDirections
    out[`${prefix}${name}Omega`] = w1
    out[`${prefix}${name}Bias`] = w1 / exactMean - 1
    out[`${prefix}${name}LowestBias`] = lowest / (exact[0] ?? 1) - 1
    out[`${prefix}${name}MassSquaredOverM1`] = mass2 / q(w1)
    out[`${prefix}${name}Doubling`] = w2 / w1
  }

  const tau0 = firstZero(readings.series, 80)

  out[`${prefix}DirectOmega`] = Math.PI / (2 * tau0)
  out[`${prefix}DirectBias`] = Math.PI / (2 * tau0) / exactMean - 1

  return out
}

function sectionA(bulk12: PhotonLattice, husk: Husk): Record<string, number> {
  // E-FRC-0165's bulk protocol
  const bulk8 = photonLatticeD4({ side: 8 })
  const bulkModes = [
    [1, 0, 0, 0],
    [2, 0, 0, 0],
  ]
  const bulkRun = linearRun(bulk8, bulk8, f => f, { settle: 500, beats: 3000, modes: bulkModes, track: bulk8.firsts.map(d => bulk8.vectors[d]?.[2] ?? 0) })
  const bulkExact = eigenvalues(plaquetteWaveMatrix(bulk8, bulkModes[0] ?? [])).slice(1, 4).map(l => leapfrogOmega(KAPPA, l))
  const bulkLambdas = [linearWaveEigenvalues(bulk8, bulkModes[0] ?? [])[1] ?? 0, linearWaveEigenvalues(bulk8, bulkModes[1] ?? [])[1] ?? 0] as const

  // E-FRC-0169's husk protocol
  const huskModes = [
    [1, 0, 0],
    [2, 0, 0],
  ]
  const huskRun = linearRun(bulk12, husk.lattice, f => projectLinks(husk, f), { settle: 300, beats: 2000, modes: huskModes, track: HUSK_VECTORS.map(u => u[2] ?? 0) })
  const huskExact = eigenvalues(huskSymbol(husk, plaquetteWaveMatrix(bulk12, bulkModeOfHusk(huskModes[0] ?? []))).hermitian)
    .slice(1, 3)
    .map(l => leapfrogOmega(KAPPA, l))
  const huskLambdas = [linearWaveEigenvalues(bulk12, bulkModeOfHusk(huskModes[0] ?? []))[1] ?? 0, linearWaveEigenvalues(bulk12, bulkModeOfHusk(huskModes[1] ?? []))[1] ?? 0] as const

  return {
    ...estimate('aBulk', bulkRun, bulkExact, bulkLambdas),
    aBulkExactPhoton1: bulkExact[0] ?? 0,
    aBulkExactPhoton3: bulkExact[2] ?? 0,
    ...estimate('aHusk', huskRun, huskExact, huskLambdas),
  }
}

// B and C. plane waves

// the phase of every bulk link for the bulk mode n: 2 pi n . c / side + k . r_a / 2
function bulkPhase(bulk: PhotonLattice, n: readonly number[]): Float64Array {
  const f = bulk.firsts.length
  const k = bulk.wave.map(row => ((2 * Math.PI) / bulk.side) * row.reduce((s, w, j) => s + w * (n[j] ?? 0), 0))
  const half = bulk.firsts.map(d => (bulk.vectors[d] ?? []).reduce((s, e, i) => s + e * (k[i] ?? 0), 0) / 2)
  const out = new Float64Array(bulk.links)

  for (let x = 0; x < bulk.cells; x++) {
    let s = 0

    for (let i = 0; i < bulk.dimension; i++) {
      s += (n[i] ?? 0) * (bulk.coordinates[x * bulk.dimension + i] ?? 0)
    }

    for (let a = 0; a < f; a++) {
      out[x * f + a] = (2 * Math.PI * s) / bulk.side + (half[a] ?? 0)
    }
  }

  return out
}

// the phase of every bulk link for the husk mode m, from the husk coordinates alone, so that it is exactly
// the same on a link and its depth mirror: 2 pi (m . y + m . u_a / 2) / side
function huskPhase(husk: Husk, m: readonly number[]): Float64Array {
  const bulk = husk.bulk
  const f = bulk.firsts.length
  const side = husk.side
  const out = new Float64Array(bulk.links)

  for (let x = 0; x < bulk.cells; x++) {
    const col = husk.column[x] ?? 0
    const y = [col % side, Math.floor(col / side) % side, Math.floor(col / (side * side))]

    for (let a = 0; a < f; a++) {
      const u = HUSK_VECTORS[husk.shadow[a] ?? 0] ?? [0, 0, 0]
      const s = (m[0] ?? 0) * (2 * (y[0] ?? 0) + (u[0] ?? 0)) + (m[1] ?? 0) * (2 * (y[1] ?? 0) + (u[1] ?? 0)) + (m[2] ?? 0) * (2 * (y[2] ?? 0) + (u[2] ?? 0))

      out[x * f + a] = (Math.PI * s) / side
    }
  }

  return out
}

// the angles of a standing wave Re(v e^(i phase)) scaled so its largest unrounded plaquette |B| is `target`
function launch(rule: PhotonRule, phase: Float64Array, v: Vector, target: number): { state: PhotonState; amplitude: number; peak: number } {
  const lattice = rule.lattice
  const f = lattice.firsts.length
  const size = lattice.plaquetteSize
  const wave = Float64Array.from(phase, (phi, l) => (v.re[l % f] ?? 0) * Math.cos(phi) - (v.im[l % f] ?? 0) * Math.sin(phi))

  let top = 0

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    let b = 0

    for (let j = 0; j < size; j++) {
      b += (lattice.plaquetteSigns[p * size + j] ?? 0) * (wave[lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
    }

    top = Math.max(top, Math.abs(b))
  }

  const amplitude = target / top
  const state = emptyPhotonState(rule)

  for (let l = 0; l < lattice.links; l++) {
    state.angle[l] = modulo(symmetricRound(amplitude * (wave[l] ?? 0)), rule.n)
  }

  let peak = 0

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    peak = Math.max(peak, Math.abs(centered(plaquetteField(rule, state.angle, p), rule.n)))
  }

  return { state, amplitude, peak }
}

// cos omega = Re sum conj(x_t)(x_(t+1) + x_(t-1)) / (2 sum |x_t|^2) over t = 1 .. T - 1, x_0 = 0 the flux
// before the first beat
function threePoint(series: readonly [number, number][]): number {
  let num = 0
  let den = 0

  for (let t = 1; t + 1 < series.length; t++) {
    const [a, b] = series[t] ?? [0, 0]
    const [c, d] = series[t + 1] ?? [0, 0]
    const [e, g] = series[t - 1] ?? [0, 0]

    num += a * (c + e) + b * (d + g)
    den += 2 * (a * a + b * b)
  }

  return Math.acos(Math.max(-1, Math.min(1, num / den)))
}

type WaveReading = { omega: number; linearOmega: number; frozenBeats: number; stillBeats: number; huskMaxAbs: number; amplitude: number; peak: number }

// run a launched wave through the rule and, from the same integer start, through the linear rule; read the
// flux's projection x_t = conj(p) . (mode n of view(flux)) every beat
function runWave(input: {
  rule: PhotonRule
  phase: Float64Array
  v: Vector
  target: number
  readLattice: PhotonLattice
  n: readonly number[]
  p: Vector
  view: (flux: ArrayLike<number>) => ArrayLike<number>
  husk?: Husk
}): WaveReading {
  const { rule } = input
  const { state, amplitude, peak } = launch(rule, input.phase, input.v, input.target)
  const reader = modeReader(input.readLattice, input.n)
  const project = (field: ArrayLike<number>): [number, number] => {
    const r = reader.read(input.view(field))

    let re = 0
    let im = 0

    for (let a = 0; a < r.re.length; a++) {
      // conj(p_a) r_a
      re += (input.p.re[a] ?? 0) * (r.re[a] ?? 0) + (input.p.im[a] ?? 0) * (r.im[a] ?? 0)
      im += (input.p.re[a] ?? 0) * (r.im[a] ?? 0) - (input.p.im[a] ?? 0) * (r.re[a] ?? 0)
    }

    return [re, im]
  }
  const initial = Int32Array.from(state.angle)
  const series: [number, number][] = [[0, 0]]

  let frozenBeats = 0
  let stillBeats = 0
  let huskMaxAbs = 0

  for (let t = 0; t < WAVE_BEATS; t++) {
    photonBeatInPlace(rule, state, t)
    series.push(project(state.flux))
    frozenBeats += state.flux.every(e => e === 0) ? 1 : 0
    stillBeats += state.angle.every((x, l) => x === initial[l]) ? 1 : 0

    if (input.husk) {
      huskMaxAbs = Math.max(huskMaxAbs, ...Array.from(projectLinks(input.husk, state.flux), Math.abs))
    }
  }

  const angle = Float64Array.from(initial, x => centered(x, rule.n))
  const flux = new Float64Array(rule.lattice.links)
  const linear = makeLinearLeapfrog(rule.lattice, KAPPA)
  const linearSeries: [number, number][] = [[0, 0]]

  for (let t = 0; t < WAVE_BEATS; t++) {
    linear.beat(angle, flux)
    linearSeries.push(project(flux))
  }

  return {
    omega: frozenBeats === WAVE_BEATS ? 0 : threePoint(series),
    linearOmega: threePoint(linearSeries),
    frozenBeats,
    stillBeats,
    huskMaxAbs,
    amplitude,
    peak,
  }
}

type Photon = { v: Vector; p: Vector; omega: number }

// the depth-even photons (rank 1, 2 of the husk symbol) and the depth-odd photon at the husk mode m
function huskPhotons(husk: Husk, m: readonly number[]): { even: Photon[]; odd: Photon } {
  const symbol = huskSymbol(husk, plaquetteWaveMatrix(husk.bulk, bulkModeOfHusk(m)))
  const toHusk = (v: Vector): Vector => {
    const re = new Float64Array(HUSK_VECTORS.length)
    const im = new Float64Array(HUSK_VECTORS.length)

    v.re.forEach((x, a) => (re[husk.shadow[a] ?? 0] = (re[husk.shadow[a] ?? 0] ?? 0) + x))
    v.im.forEach((x, a) => (im[husk.shadow[a] ?? 0] = (im[husk.shadow[a] ?? 0] ?? 0) + x))

    return { re, im }
  }
  const even = [1, 2].map(rank => {
    const e = eigenvector(symbol.hermitian, rank)
    const v = liftEven(husk, e.re, e.im)

    return { v, p: toHusk(v), omega: leapfrogOmega(KAPPA, e.value) }
  })
  const o = eigenvector(symbol.odd, 0)
  const v = liftOdd(husk, symbol.pairs, o.re, o.im)

  // the odd photon is read in the bulk, since its husk image is zero
  return { even, odd: { v, p: v, omega: leapfrogOmega(KAPPA, o.value) } }
}

function huskWave(rule: PhotonRule, husk: Husk, m: readonly number[], photon: Photon, target: number): WaveReading {
  return runWave({ rule, phase: huskPhase(husk, m), v: photon.v, target, readLattice: husk.lattice, n: m, p: photon.p, view: f => projectLinks(husk, f), husk })
}

function sectionB(bulk: PhotonLattice, husk: Husk): Record<string, number> & { ok: number; okA1: number } {
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false })
  const out: Record<string, number> = {}
  const m1 = [1, 0, 0]
  const at1 = huskPhotons(husk, m1)
  const record = (tag: string, w: WaveReading, exact: number): void => {
    out[`${tag}Omega`] = w.omega
    out[`${tag}OverSymbol`] = w.omega / exact - 1
    out[`${tag}LinearOverSymbol`] = w.linearOmega / exact - 1
    out[`${tag}Peak`] = w.peak
    out[`${tag}Amplitude`] = w.amplitude
  }

  let linearWorst = 0

  // B1 the dead zone
  const dead = huskWave(rule, husk, m1, at1.even[0]!, 6)

  out['bDeadPeak'] = dead.peak
  out['bDeadFrozenBeats'] = dead.frozenBeats
  out['bDeadStillBeats'] = dead.stillBeats

  // B2 m1, the polarizations and the sweep
  const window: number[] = []

  at1.even.forEach((photon, i) => {
    const w = huskWave(rule, husk, m1, photon, WINDOW_TARGET)

    record(`bM1Even${i + 1}`, w, photon.omega)
    window.push(Math.abs(w.omega / photon.omega - 1))
    linearWorst = Math.max(linearWorst, Math.abs(w.linearOmega / photon.omega - 1))
  })

  const odd = runWave({
    rule,
    phase: huskPhase(husk, m1),
    v: at1.odd.v,
    target: WINDOW_TARGET,
    readLattice: bulk,
    n: bulkModeOfHusk(m1),
    p: at1.odd.v,
    view: f => f,
    husk,
  })

  record('bM1OddBulk', odd, at1.odd.omega)
  linearWorst = Math.max(linearWorst, Math.abs(odd.linearOmega / at1.odd.omega - 1))
  out['bM1OddHuskMaxAbs'] = odd.huskMaxAbs
  out['bM1SymbolOmega'] = at1.even[0]?.omega ?? 0
  out['bM1OddSymbolOmega'] = at1.odd.omega

  for (const target of [64, 1024]) {
    const w = huskWave(rule, husk, m1, at1.even[0]!, target)

    record(`bM1Sweep${target}`, w, at1.even[0]?.omega ?? 1)
  }

  // B3 the husk dispersion
  for (const m of [
    [2, 0, 0],
    [3, 0, 0],
    [2, 2, 1],
  ]) {
    const photon = huskPhotons(husk, m).even[0]!
    const w = huskWave(rule, husk, m, photon, WINDOW_TARGET)
    const tag = `bM${m.join('')}`

    record(tag, w, photon.omega)
    out[`${tag}SymbolOmega`] = photon.omega
    window.push(Math.abs(w.omega / photon.omega - 1))
    linearWorst = Math.max(linearWorst, Math.abs(w.linearOmega / photon.omega - 1))
  }

  // B4 the bulk, k along the depth
  const depth = [0, 0, -1, 1]
  const values = eigenvalues(plaquetteWaveMatrix(bulk, depth))
  const phase = bulkPhase(bulk, depth)

  for (let rank = 1; rank <= 3; rank++) {
    const e = eigenvector(plaquetteWaveMatrix(bulk, depth), rank)
    const omega = leapfrogOmega(KAPPA, values[rank] ?? 0)
    const w = runWave({ rule, phase, v: e, target: WINDOW_TARGET, readLattice: bulk, n: depth, p: e, view: f => f })

    record(`bDepthPhoton${rank}`, w, omega)
    out[`bDepthPhoton${rank}SymbolOmega`] = omega
    window.push(Math.abs(w.omega / omega - 1))
    linearWorst = Math.max(linearWorst, Math.abs(w.linearOmega / omega - 1))
  }

  out['bLinearControlWorst'] = linearWorst
  out['bWorstWindowError'] = Math.max(...window)

  const ok =
    dead.peak <= 8 &&
    dead.frozenBeats === WAVE_BEATS &&
    dead.stillBeats === WAVE_BEATS &&
    odd.huskMaxAbs === 0 &&
    Math.max(...window) < 0.01 &&
    linearWorst < 1e-9

  return { ...out, ok: ok ? 1 : 0, okA1: linearWorst < 1e-9 ? 1 : 0 }
}

// C. the linear force

function invariant(rule: PhotonRule, flux: ArrayLike<number>, b: Float64Array): number {
  const { lattice } = rule
  const size = lattice.plaquetteSize

  let total = 0

  for (let l = 0; l < lattice.links; l++) {
    total += (flux[l] ?? 0) * (flux[l] ?? 0)
  }

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    let ce = 0

    for (let j = 0; j < size; j++) {
      ce += (lattice.plaquetteSigns[p * size + j] ?? 0) * (flux[lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
    }

    total += (b[p] ?? 0) * (b[p] ?? 0) + ce * (b[p] ?? 0)
  }

  return total
}

function curlOf(lattice: PhotonLattice, field: ArrayLike<number>): Float64Array {
  const size = lattice.plaquetteSize
  const out = new Float64Array(lattice.plaquetteCount)

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    let b = 0

    for (let j = 0; j < size; j++) {
      b += (lattice.plaquetteSigns[p * size + j] ?? 0) * (field[lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
    }

    out[p] = b
  }

  return out
}

// the shadow energy of a rule, whatever its table: 1/2 E(-) . E(+) + the potential of the table, V(B) the sum
// of the table from 0 (the discrete antiderivative, sum over 0 < j <= |B| of |f(j)|), and the temperature
function shadow(rule: PhotonRule, s: PhotonState, potential: Float64Array): number {
  const kicked = lastKick(rule, s)

  let e = 0

  for (let l = 0; l < s.flux.length; l++) {
    e += ((s.flux[l] ?? 0) * ((s.flux[l] ?? 0) + (kicked[l] ?? 0))) / 2
  }

  for (let p = 0; p < rule.lattice.plaquetteCount; p++) {
    e += potential[plaquetteField(rule, s.angle, p)] ?? 0
  }

  return e
}

// V(B) = integral of the linear interpolation of the table from 0 to the centered B
function tablePotential(rule: PhotonRule): Float64Array {
  const n = rule.n
  const up = new Float64Array(n / 2 + 1)

  for (let j = 1; j <= n / 2; j++) {
    up[j] = (up[j - 1] ?? 0) + ((rule.force[j - 1] ?? 0) + (rule.force[j] ?? 0)) / 2
  }

  return Float64Array.from({ length: n }, (_, b) => up[Math.abs(centered(b, n))] ?? 0)
}

function heating(rule: PhotonRule): { drift: number; wraps: number; start: number; end: number } {
  const s = hashedStart(rule)
  const potential = tablePotential(rule)
  const samples: number[] = []
  const size = rule.lattice.plaquetteSize

  let previous = new Int32Array(rule.lattice.plaquetteCount)
  let wraps = 0

  for (let t = 0; t < 2500; t++) {
    photonBeatInPlace(rule, s, t)

    const b = new Int32Array(rule.lattice.plaquetteCount)

    for (let p = 0; p < rule.lattice.plaquetteCount; p++) {
      let sum = 0

      for (let j = 0; j < size; j++) {
        sum += (rule.lattice.plaquetteSigns[p * size + j] ?? 0) * (s.angle[rule.lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
      }

      b[p] = centered(sum, rule.n)

      if (t > 0 && Math.abs((b[p] ?? 0) - (previous[p] ?? 0)) > rule.n / 2) {
        wraps += 1
      }
    }

    previous = b

    if (t >= 500 && t % 10 === 0) {
      samples.push(shadow(rule, s, potential))
    }
  }

  const start = mean(samples.slice(0, 20))
  const end = mean(samples.slice(-20))

  return { drift: (end - start) / mean(samples), wraps, start, end }
}

function sectionC(bulk: PhotonLattice, husk: Husk): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}

  // C1 the exactly linear integer table, K' = 1
  const small = photonLatticeD4({ side: 6 })
  const exact = withForce(makePhotonRule({ lattice: small, n: N, k: 0, capacity: 0, hop: false }), linearForceTable(N, 1))
  const lambdaMax = Math.max(...Array.from({ length: 6 ** 4 }, (_, i) => Math.max(...eigenvalues(plaquetteWaveMatrix(small, [0, 1, 2, 3].map(j => Math.floor(i / 6 ** j) % 6))))))
  const growth = leapfrogBlock(1, lambdaMax).growth
  const s = emptyPhotonState(exact)
  const unwrapped = new Float64Array(small.links)

  s.flux[0] = 1

  const i0 = invariant(exact, s.flux, curlOf(small, unwrapped))

  let wrap = -1
  let conserved = true
  let brokenAfter = false
  let lastRatio = 0
  let normBefore = 1

  for (let t = 0; t < 30; t++) {
    for (let l = 0; l < small.links; l++) {
      unwrapped[l] = (unwrapped[l] ?? 0) + (s.flux[l] ?? 0)
    }

    photonBeatInPlace(exact, s, t)

    const b = curlOf(small, unwrapped)
    const wrapped = b.some(x => Math.abs(x) >= N / 2)

    if (wrapped && wrap < 0) {
      wrap = t
    }

    if (wrap < 0) {
      conserved = conserved && invariant(exact, s.flux, b) === i0

      const norm = Math.sqrt(s.flux.reduce((a, e) => a + e * e, 0))

      lastRatio = norm / normBefore
      normBefore = norm
    } else {
      const bc = Float64Array.from({ length: small.plaquetteCount }, (_, p) => centered(plaquetteField(exact, s.angle, p), N))

      brokenAfter = brokenAfter || invariant(exact, s.flux, bc) !== i0
    }
  }

  out['cLambdaMaxSide6'] = lambdaMax
  out['cExactLinearKappaLambdaMax'] = lambdaMax
  out['cExactLinearGrowthPerBeat'] = growth
  out['cExactLinearInvariant'] = i0
  out['cExactLinearConservedBeforeWrap'] = conserved ? 1 : 0
  out['cExactLinearFirstWrapBeat'] = wrap
  out['cExactLinearNormRatioLastBeforeWrap'] = lastRatio
  out['cExactLinearBrokenAfterWrap'] = brokenAfter ? 1 : 0
  out['cSmallestIntegerKappaOverE164'] = 1 / KAPPA

  // C2 the rounded linear table, the same light
  const rounded = withForce(makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false }), roundedLinearForceTable(N, KAPPA))
  const photon = huskPhotons(husk, [1, 0, 0]).even[0]!
  const w = huskWave(rounded, husk, [1, 0, 0], photon, WINDOW_TARGET)

  out['cRoundedM1Omega'] = w.omega
  out['cRoundedM1OverSymbol'] = w.omega / photon.omega - 1

  // C3 heating on the D4 box side 8
  const bulk8 = photonLatticeD4({ side: 8 })
  const sine = heating(makePhotonRule({ lattice: bulk8, n: N, k: K, capacity: 0, hop: false }))
  const flat = heating(withForce(makePhotonRule({ lattice: bulk8, n: N, k: K, capacity: 0, hop: false }), roundedLinearForceTable(N, KAPPA)))
  const ratio = Math.abs(flat.drift) / Math.abs(sine.drift)

  out['cSineShadowDrift'] = sine.drift
  out['cSineWraps'] = sine.wraps
  out['cSineShadowStart'] = sine.start
  out['cRoundedShadowDrift'] = flat.drift
  out['cRoundedWraps'] = flat.wraps
  out['cRoundedShadowStart'] = flat.start
  out['cDriftRatio'] = ratio

  const ok = conserved && wrap >= 0 && wrap < 10 && brokenAfter && Math.abs(w.omega / photon.omega - 1) < 0.01 && ratio >= 0.5 && ratio <= 2

  return { ...out, ok: ok ? 1 : 0 }
}

// D. the love and fear

type Pair = { residual: number; residualLate: number; energy: number; coulomb: number; coreShare: number }

function pairRun(bulk: PhotonLattice, husk: Husk, r: number, charge: number, linear: boolean): Pair {
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false, charge })
  const root = (v: number[]): number => bulk.vectors.findIndex(x => x.every((y, i) => y === v[i]))
  const up = root([1, 0, 0, 1])
  const down = root([1, 0, 0, -1])
  const s = emptyPhotonState(rule)

  placePairAlong(rule, s, 0, Array.from({ length: r }, (_, i) => (i % 2 === 0 ? up : down)), 1)

  const stringFlux = projectLinks(husk, s.flux)
  const columns = columnSum(husk, s.vibe)
  const coulomb = huskCoulomb(husk, Float64Array.from(columns, x => x * charge))
  const all = new Float64Array(stringFlux.length)
  const late = new Float64Array(stringFlux.length)
  const settle = 400
  const beats = 4000
  const half = 2200
  const angle = new Float64Array(bulk.links)
  const flux = Float64Array.from(s.flux)
  const step = makeLinearLeapfrog(bulk, KAPPA)

  for (let t = 0; t < beats; t++) {
    if (linear) {
      step.beat(angle, flux)
    } else {
      photonBeatInPlace(rule, s, t)
    }

    if (t >= settle) {
      const p = projectLinks(husk, linear ? flux : s.flux)

      for (let i = 0; i < p.length; i++) {
        all[i] = (all[i] ?? 0) + (p[i] ?? 0) / (beats - settle)

        if (t >= half) {
          late[i] = (late[i] ?? 0) + (p[i] ?? 0) / (beats - half)
        }
      }
    }
  }

  const norm = (g: (i: number) => number, keep: (i: number) => boolean = () => true): number => {
    let sum = 0

    for (let i = 0; i < all.length; i++) {
      sum += keep(i) ? g(i) ** 2 : 0
    }

    return Math.sqrt(sum)
  }
  const h = HUSK_VECTORS.length
  const charged = new Set(Array.from(columns, (x, y) => (x !== 0 ? y : -1)).filter(y => y >= 0))
  const core = (i: number): boolean => charged.has(Math.floor(i / h)) || charged.has(husk.lattice.neighbour[Math.floor(i / h) * husk.lattice.degree + 2 * (i % h)] ?? -1)
  const scale = norm(i => (stringFlux[i] ?? 0) - (coulomb.flux[i] ?? 0))
  const residual = norm(i => (all[i] ?? 0) - (coulomb.flux[i] ?? 0))

  return {
    residual: residual / scale,
    residualLate: norm(i => (late[i] ?? 0) - (coulomb.flux[i] ?? 0)) / scale,
    energy: huskEnergy(all),
    coulomb: coulomb.energy,
    coreShare: norm(i => (all[i] ?? 0) - (coulomb.flux[i] ?? 0), core) ** 2 / residual ** 2,
  }
}

function sectionD(bulk: PhotonLattice, husk: Husk): Record<string, number> & { ok: number; okD1: number; okD2: number; okD3: number } {
  const out: Record<string, number> = {}

  let linearOk = true
  let energyOk = true
  let windowOk = true

  for (const r of [1, 2, 3, 4]) {
    const lin = pairRun(bulk, husk, r, CHARGE, true)
    const int = pairRun(bulk, husk, r, CHARGE, false)
    const growth = int.residualLate / int.residual

    out[`dR${r}LinearResidual`] = lin.residual
    out[`dR${r}LinearResidualLate`] = lin.residualLate
    out[`dR${r}LinearEnergyOverCoulomb`] = lin.energy / lin.coulomb
    out[`dR${r}IntegerResidual`] = int.residual
    out[`dR${r}IntegerResidualLate`] = int.residualLate
    out[`dR${r}IntegerWindowGrowth`] = growth
    out[`dR${r}IntegerEnergyOverCoulomb`] = int.energy / int.coulomb
    out[`dR${r}IntegerCoreShare`] = int.coreShare
    out[`dR${r}Coulomb`] = int.coulomb
    linearOk = linearOk && lin.residual < 0.01
    energyOk = energyOk && (r === 1 || Math.abs(int.energy / int.coulomb - 1) < 0.05)
    windowOk = windowOk && growth >= 1.2 && growth <= 1.7
  }

  for (const charge of [16, 256]) {
    const int = pairRun(bulk, husk, 1, charge, false)

    out[`dR1Charge${charge}IntegerResidual`] = int.residual
    out[`dR1Charge${charge}IntegerResidualLate`] = int.residualLate
  }

  return { ...out, okD1: linearOk ? 1 : 0, okD2: energyOk ? 1 : 0, okD3: windowOk ? 1 : 0, ok: linearOk && energyOk && windowOk ? 1 : 0 }
}

export default experiment({
  id: 'gauge/photon-calibration',
  code: 'E-FRC-0180',
  title:
    "light measured against its exact answer: each hot-field estimator of E-FRC-0165 and E-FRC-0169 calibrated on the linear rule, a coherent plane wave through the cold vacuum at the derived symbol's frequency with 2 polarizations on the husk and a dead zone below which nothing moves, the exactly linear integer force shown unstable at every integer slope, and the love-fear field's residual traced to the rule rather than to its lattice reference",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const bulk = photonLatticeD4({ side: SIDE })
    const husk = makeHusk(bulk)
    const a = sectionA(bulk, husk)
    const b = sectionB(bulk, husk)
    const c = sectionC(bulk, husk)
    const d = sectionD(bulk, husk)
    const sections = [b.okA1, b.ok, c.ok, d.ok]
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => !key.startsWith('ok')))

    return verdict({
      status: sections.every(x => x === 1) ? 'pass' : sections.some(x => x === 1) ? 'partial' : 'fail',
      claim:
        "on the linear rule the estimators of E-FRC-0165 and E-FRC-0169 read the known photon with the biases reported; a coherent plane wave through the cold vacuum of the integer rule does not move below |B| = 8 and above it runs at the derived symbol's frequency within 1 percent on the bulk and the husk, where the depth-odd photon leaves no field and 2 polarizations remain; no integer slope makes the linear force stable, while the rounded linear force carries the same light and heats as the sine does; and the linear rule relaxes a love and a fear onto the husk lattice Green's function at every r, so the integer rule's residual is its own",
      metrics: { ...strip(a), ...strip(b), ...strip(c), ...strip(d), sectionA1: b.okA1, sectionB: b.ok, sectionC: c.ok, sectionD1: d.okD1, sectionD2: d.okD2, sectionD3: d.okD3 },
      notes:
        'L2, deterministic. Section A reports biases and has one gate (A1, the linear control). The E-FRC-0165 and E-FRC-0169 gate failures stand as recorded there; this experiment measures what caused them.',
    })
  },
})
