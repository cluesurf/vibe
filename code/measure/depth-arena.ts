// Measurement for the depth arena (E-GRV-0088, 0089): the radion's depth (code/rule/trit-radion) as the one number
// that sets how the husk light AND a slow lump move, read against the Newtonian falling-light count. Real numbers live
// here only.
//
// THE FIELD. As E-GRV-0080's C3: a sheet of content 1 per dock at x = LENS_SHEET, its sink sheet half the line away,
// on the 256 x 2 x 2 line, the radion run from zero field for LENS_BEATS and Hann-averaged (code/measure/radion
// staticRun), the depth D0 + the half-level count of the average (halfLevelCount). The coupling is the count: b = a,
// so a column's depth outflow in the light's link metric equals its content, one depth level (one bulk dock of its
// column, which holds D) per unit of content.
//
// THE LIGHT. E-GRV-0070's husk rule with per-column depth (code/measure/varying-depth-light), its plane packet and
// half-maximum arrivals, as E-GRV-0080 ran it. And, for the forms of code/rule/depth-clock-wave, a massless wave of
// that form (m = 0) placed as a bump at rest and read by the half-maximum centroid of its energy density at the
// detector docks, so each form's light and lump are read by one rule.
//
// THE LUMP. A wave of code/rule/depth-clock-wave with a rest term: a packet placed at rest (the lag equal to the start)
// and read by the centroid of its leapfrog energy density, fitted to x0 + v0 t + g t^2 / 2. The prediction is the
// lattice ray law: with u = (a S(k) + m_y) / (4 Q_y) and S(k) = 12 (1 - cos k) on states uniform in y and z, the rest
// rate is theta_0 = 2 asin sqrt(u_0) and
//   g = - (3 a / Q) (d ln u_0 / dx) / (1 - u_0)
// (from dx/dt = d theta / dk, dk/dt = - d theta / dx at k = 0). In the continuum (u_0 -> 0) this is
// -(c^2 / 2) d ln u_0 / dx, which for the clock and metric forms is (c^2 / 2) d ln q / dx: toward depth, the same for
// every m up to the lattice's 1 / (1 - u_0).
//
// THE NEWTONIAN COUNT. A slow lump falls as g = -c^2 grad ln N, N its rest rate over the far value, so its potential
// is Phi = c0^2 ln N at the reference speed c0, and the index a potential alone gives light (Newton's falling-light
// count, to first order in Phi) is n_N = 1 - Phi / c0^2 = 1 - ln N. For the clock and metric forms ln N = -(1/2)
// ln(q / q0); the count uses the lump's MEASURED pull, ln N scaled by the measured over the predicted fall (the mean of
// the two lumps). The factor is the measured light delay over the count's delay, sum over the path of (n_N - 1) / c0.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by
// the rule.

import { logLogSlope, quadraticFit } from '@/code/measure/regression'
import {
  halfLevelCount,
  newTally,
  RADION_DEPTH,
  RADION_LEVELS,
  rhoOf,
  staticRun,
  LENS_AMP,
  LENS_BEATS,
  LENS_DETECTORS,
  LENS_HALF_WIDTH,
  LENS_LINE,
  LENS_SHEET,
  LENS_SOURCE_X,
  LENS_WINDOW,
  type Source,
} from '@/code/measure/radion'
import {
  AMP,
  dockAt,
  HALF_WIDTH,
  halfMaxCentroid,
  LINE,
  LINE_WINDOW,
  lightSpeed,
  makeMedium,
  planarPacket,
  runPacket,
  SOURCE_X,
  type Run,
} from '@/code/measure/varying-depth-light'
import {
  clockWaveBeat,
  clockWaveBeatBack,
  clockWaveFrom,
  clockWaveRule,
  emptyClockWave,
  sameClockWave,
  type ClockWaveRule,
  type ClockWaveState,
  type WaveForm,
} from '@/code/rule/depth-clock-wave'
import {
  radionMesh,
  radionRule,
  radionWeight,
  type RadionMesh,
} from '@/code/rule/trit-radion'

const Q0 = 2 * RADION_DEPTH + 1
const wrap = (x: number, n: number): number => ((x % n) + n) % n

// ---------------------------------------------------------------------------------------------------------
// the field

export type ArenaField = {
  content: number
  field: number[]
  depth: number[]
  reversed: boolean
}

let fieldCache: ArenaField | undefined

export function arenaField(): ArenaField {
  if (fieldCache) {
    return fieldCache
  }

  const content = 1
  const mesh = radionMesh(LENS_LINE)
  const [sx, sy, sz] = LENS_LINE
  const sources: Source[] = []

  for (let z = 0; z < sz; z++) {
    for (let y = 0; y < sy; y++) {
      sources.push({
        at: [LENS_SHEET, y, z],
        to: [LENS_SHEET + sx / 2, y, z],
        units: content,
      })
    }
  }

  const tally = newTally()
  const run = staticRun(
    mesh,
    radionRule(RADION_DEPTH, RADION_LEVELS),
    rhoOf(mesh, sources),
    LENS_BEATS,
    tally,
  )
  const field = Array.from({ length: sx }, (_, x) => run.mean[x]!)

  fieldCache = {
    content,
    field,
    depth: field.map(v => RADION_DEPTH + halfLevelCount(v)),
    reversed: tally.reversed,
  }

  return fieldCache
}

// ---------------------------------------------------------------------------------------------------------
// the wave's readers

// the leapfrog energy density of each dock on the state's last two beats (the link term shared half and half)
export function clockWaveDensity(
  mesh: RadionMesh,
  rule: ClockWaveRule,
  s: ClockWaveState,
): Float64Array {
  const e = new Float64Array(mesh.docks)

  for (let y = 0; y < mesh.docks; y++) {
    const v = s.now[y]! - s.lag[y]!

    e[y] =
      e[y]! +
      (rule.inertia[y]! * v * v) / 2 +
      (rule.rest[y]! * s.now[y]! * s.lag[y]!) / 2

    for (let h = 0; h < 9; h++) {
      const z = mesh.neighbour[y * 9 + h]!
      const link =
        (rule.a *
          radionWeight(h) *
          (s.now[y]! - s.now[z]!) *
          (s.lag[y]! - s.lag[z]!)) /
        4

      e[y] = e[y]! + link
      e[z] = e[z]! + link
    }
  }

  return e
}

// a bump at rest: X = floor(amp (w^2 - d^2)^2 / w^4) for |x - x0| < w, uniform in y and z, the lag equal
export function restingLump(
  mesh: RadionMesh,
  x0: number,
  amp: number,
  w: number,
): ClockWaveState {
  const s = emptyClockWave(mesh)
  const sx = mesh.sides[0]
  const w4 = w ** 4

  for (let y = 0; y < mesh.docks; y++) {
    const d = (y % sx) - x0

    if (Math.abs(d) < w) {
      const v = amp * (w * w - d * d) ** 2
      const f = (v - wrap(v, w4)) / w4

      s.now[y] = f
      s.lag[y] = f
    }
  }

  return s
}

export type FallRun = {
  form: WaveForm
  m: number
  amp: number
  at: number
  // the energy centroid along x after every beat (index 0 the start)
  centroid: number[]
  g: number
  v0: number
  fitR2: number
  // the lattice ray-law prediction, weighted by the start's energy, and its continuum form -(c^2 / 2) d ln u_0 / dx
  gPredicted: number
  gContinuum: number
  energyDrift: number
  reversed: boolean
}

export function fallRun(
  depthOf: (x: number) => number,
  form: WaveForm,
  x0: number,
  m: number,
  amp: number,
  w: number,
  beats: number,
): FallRun {
  const mesh = radionMesh(LENS_LINE)
  const sx = LENS_LINE[0]
  const rule = clockWaveRule(
    mesh,
    y => depthOf(y % sx),
    m,
    form,
    RADION_DEPTH,
  )
  const start = restingLump(mesh, x0, amp, w)
  const s = clockWaveFrom(start)
  const lap = new Int32Array(mesh.docks)

  const centroidOf = (e: Float64Array): number => {
    let ex = 0
    let es = 0

    for (let y = 0; y < mesh.docks; y++) {
      ex += e[y]! * (y % sx)
      es += e[y]!
    }

    return ex / es
  }

  const total = (e: Float64Array): number =>
    e.reduce((a, v) => a + v, 0)
  const e0 = clockWaveDensity(mesh, rule, s)
  const centroid = [centroidOf(e0)]

  let eLast = total(e0)

  // the prediction from the depth map (uniform in y and z): u_0 and Q per x
  const inertiaAt = (x: number): number => rule.inertia[wrap(x, sx)]!
  const u0 = (x: number): number =>
    rule.rest[wrap(x, sx)]! / (4 * inertiaAt(x))

  let gw = 0
  let gc = 0
  let wsum = 0

  for (let y = 0; y < mesh.docks; y++) {
    const x = y % sx
    const dlnu = (Math.log(u0(x + 1)) - Math.log(u0(x - 1))) / 2
    const lead = (3 * rule.a) / inertiaAt(x)

    gw += (e0[y]! * -lead * dlnu) / (1 - u0(x))
    gc += e0[y]! * -lead * dlnu
    wsum += e0[y]!
  }

  for (let t = 1; t <= beats; t++) {
    clockWaveBeat(mesh, rule, s, lap)

    const e = clockWaveDensity(mesh, rule, s)

    centroid.push(centroidOf(e))
    eLast = total(e)
  }

  for (let t = 0; t < beats; t++) {
    clockWaveBeatBack(mesh, rule, s, lap)
  }

  const fit = quadraticFit({
    xs: centroid.map((_, t) => t),
    ys: centroid,
  })

  return {
    form,
    m,
    amp,
    at: x0,
    centroid,
    g: 2 * fit.a,
    v0: fit.b,
    fitR2: fit.r2,
    gPredicted: gw / wsum,
    gContinuum: gc / wsum,
    energyDrift: eLast / total(e0) - 1,
    reversed: sameClockWave(s, start),
  }
}

export type WaveArrival = {
  arrival: number[]
  weight: number[]
  reversed: boolean
}

// a massless bump of a form, at rest at x0, read at the detector docks by the half-maximum centroid of its energy
// density (the -x half is kept out of the window by the caller's sizes)
export function waveArrival(
  depthOf: (x: number) => number,
  form: WaveForm,
  x0: number,
  amp: number,
  w: number,
  detectors: readonly number[],
  window: number,
): WaveArrival {
  const mesh = radionMesh(LENS_LINE)
  const sx = LENS_LINE[0]
  const rule = clockWaveRule(
    mesh,
    y => depthOf(y % sx),
    0,
    form,
    RADION_DEPTH,
  )
  const start = restingLump(mesh, x0, amp, w)
  const s = clockWaveFrom(start)
  const lap = new Int32Array(mesh.docks)
  const trace = detectors.map(() => new Float64Array(window + 1))

  for (let t = 1; t <= window; t++) {
    clockWaveBeat(mesh, rule, s, lap)

    const e = clockWaveDensity(mesh, rule, s)

    detectors.forEach((x, i) => {
      trace[i]![t] = e[x]!
    })
  }

  for (let t = 0; t < window; t++) {
    clockWaveBeatBack(mesh, rule, s, lap)
  }

  return {
    arrival: trace.map(halfMaxCentroid),
    weight: trace.map(r => r.reduce((a, v) => a + v, 0)),
    reversed: sameClockWave(s, start),
  }
}

// the rest rate of the uniform lump at one depth: the clock form (or the span form, whose closed rate is the same) on
// a small box with every dock equal, the upward zero
// crossings of X (placed linearly between beats) over `beats`, and 2 pi over their mean spacing; and the reversal
export function restRate(
  depth: number,
  m: number,
  amp: number,
  beats: number,
  form: WaveForm = 'clock',
): { rate: number; closed: number; reversed: boolean } {
  const mesh = radionMesh([4, 2, 2])
  const rule = clockWaveRule(mesh, () => depth, m, form, RADION_DEPTH)

  return {
    ...ruleRestRate(mesh, rule, amp, beats),
    closed: Math.acos(1 - m / (2 * 9 * (2 * depth + 1))),
  }
}

// the rest rate of a uniform lump under any wave rule on a small uniform mesh: upward zero crossings of X at dock 0
// (placed linearly between beats), 2 pi over their mean spacing; and the reversal, bit for bit
export function ruleRestRate(
  mesh: RadionMesh,
  rule: ClockWaveRule,
  amp: number,
  beats: number,
): { rate: number; reversed: boolean } {
  const s = emptyClockWave(mesh)

  s.now.fill(amp)
  s.lag.fill(amp)

  const start = clockWaveFrom(s)
  const lap = new Int32Array(mesh.docks)
  const ups: number[] = []

  let before = s.now[0]!

  for (let t = 1; t <= beats; t++) {
    clockWaveBeat(mesh, rule, s, lap)

    const now = s.now[0]!

    if (before < 0 && now >= 0) {
      ups.push(t - 1 + -before / (now - before))
    }

    before = now
  }

  for (let t = 0; t < beats; t++) {
    clockWaveBeatBack(mesh, rule, s, lap)
  }

  const period = (ups[ups.length - 1]! - ups[0]!) / (ups.length - 1)

  return {
    rate: (2 * Math.PI) / period,
    reversed: sameClockWave(s, start),
  }
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0088: the prediction. Fixed before the gated run

export const LIGHT_DEPTHS: readonly number[] = [16, 20, 24, 28]
export const REST_TERMS: readonly number[] = [3, 12]
export const REST_AMPS: readonly number[] = [100000, 300000]
export const REST_BEATS = 4096
export const COLUMN_TERM = 1
export const FALL_AT = 154
// the other side of the sheet, where the field rises toward +x (depth 18 there, 24 .. 72 clear of the kinks at the
// sheet and the sink): the pull must point the other way
export const MIRROR_AT = 48
export const FALL_WIDTH = 24
export const FALL_BEATS = 480

export type LightSpeed = {
  depth: number
  speed: number
  closed: number
  run: Run
}

export type RestReading = {
  m: number
  depth: number
  rate: number
  closed: number
  reversed: boolean
}

export type PredictionSurvey = {
  light: LightSpeed[]
  rest: RestReading[]
  lightSlope: number
  restSlope: number[]
  field: ArenaField
  fall: FallRun[]
  uniform: FallRun
  column: FallRun
  mirror: FallRun
  seconds: number
}

let predictionCache: PredictionSurvey | undefined

export function predictionSurvey(
  log?: (what: string) => void,
): PredictionSurvey {
  if (predictionCache) {
    return predictionCache
  }

  const started = Date.now()
  const light = LIGHT_DEPTHS.map(depth => {
    const m = makeMedium(LINE, () => depth)
    const run = runPacket(
      m,
      planarPacket(m, SOURCE_X, AMP, HALF_WIDTH),
      [dockAt(m, 60, 0, 0), dockAt(m, 100, 0, 0)],
      LINE_WINDOW,
    )

    log?.(`light D ${depth} ${(Date.now() - started) / 1000}s`)

    return {
      depth,
      speed: 40 / (run.arrival[1]! - run.arrival[0]!),
      closed: lightSpeed(depth),
      run,
    }
  })
  const rest = REST_TERMS.flatMap((m, i) =>
    LIGHT_DEPTHS.map(depth => ({
      m,
      depth,
      ...restRate(depth, m, REST_AMPS[i]!, REST_BEATS),
    })),
  )
  const qs = LIGHT_DEPTHS.map(d => 2 * d + 1)
  const lightSlope = logLogSlope(
    qs,
    light.map(l => l.speed),
  )
  const restSlope = REST_TERMS.map(m =>
    logLogSlope(
      qs,
      rest.filter(r => r.m === m).map(r => r.rate),
    ),
  )
  const field = arenaField()
  const depthOf = (x: number): number => field.depth[x]!

  log?.(`field ${(Date.now() - started) / 1000}s`)

  const fall = REST_TERMS.map((m, i) =>
    fallRun(
      depthOf,
      'clock',
      FALL_AT,
      m,
      REST_AMPS[i]!,
      FALL_WIDTH,
      FALL_BEATS,
    ),
  )
  const uniform = fallRun(
    () => RADION_DEPTH,
    'clock',
    FALL_AT,
    REST_TERMS[1]!,
    REST_AMPS[1]!,
    FALL_WIDTH,
    FALL_BEATS,
  )
  const column = fallRun(
    depthOf,
    'column',
    FALL_AT,
    COLUMN_TERM,
    REST_AMPS[1]!,
    FALL_WIDTH,
    FALL_BEATS,
  )
  const mirror = fallRun(
    depthOf,
    'clock',
    MIRROR_AT,
    REST_TERMS[1]!,
    REST_AMPS[1]!,
    FALL_WIDTH,
    FALL_BEATS,
  )

  log?.(`fall ${(Date.now() - started) / 1000}s`)

  predictionCache = {
    light,
    rest,
    lightSlope,
    restSlope,
    field,
    fall,
    uniform,
    column,
    mirror,
    seconds: (Date.now() - started) / 1000,
  }

  return predictionCache
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0089: the light through the field, against the lump's own pull. Fixed before the gated run

export const WAVE_AMP = 100000
export const WAVE_WIDTH = 8

export type FactorReading = {
  // the light: the husk light for 'husk', the massless wave of the form otherwise
  light: 'husk' | WaveForm
  measuredDelay: number
  eikonalDelay: number
  // the count with the lump's measured pull, with the closed pull, and the lump's measured over predicted fall
  countDelay: number
  closedCountDelay: number
  pullScale: number
  factor: number
  // the parameter-free factor: the eikonal over the closed count on this staircase
  closedFactor: number
  fall: FallRun[]
  reversed: boolean
  arrivals: number[]
  uniformArrivals: number[]
}

export type LightSurvey = {
  field: ArenaField
  husk: FactorReading
  clock: FactorReading
  metric: FactorReading
  huskU0: Run
  huskLens: Run
  seconds: number
}

let lightCache: LightSurvey | undefined

export function lightSurvey(log?: (what: string) => void): LightSurvey {
  if (lightCache) {
    return lightCache
  }

  const started = Date.now()
  const field = arenaField()
  const depthOf = (x: number): number => field.depth[x]!
  const first = LENS_DETECTORS[0]!
  const last = LENS_DETECTORS[LENS_DETECTORS.length - 1]!
  const c0 = lightSpeed(RADION_DEPTH)
  const n = LENS_DETECTORS.length - 1

  // the lump's pull in a form, and the closed count sum (n_N - 1) / c0 with ln N = -(1/2) ln(q / q0)
  const falls = (
    form: WaveForm,
  ): { fall: FallRun[]; pullScale: number } => {
    const fall = REST_TERMS.map((m, i) =>
      fallRun(
        depthOf,
        form,
        FALL_AT,
        m,
        REST_AMPS[i]!,
        FALL_WIDTH,
        FALL_BEATS,
      ),
    )

    return {
      fall,
      pullScale:
        fall.reduce((a, f) => a + f.g / f.gPredicted, 0) / fall.length,
    }
  }

  let closedCountDelay = 0

  const index = { husk: 0, clock: 0, metric: 0 }

  for (let x = first; x < last; x++) {
    const s = (2 * field.depth[x]! + 1) / Q0

    closedCountDelay += Math.log(s) / 2 / c0
    index.husk += 1 / lightSpeed(field.depth[x]!) - 1 / c0
    index.clock += (Math.sqrt(s) - 1) / c0
    index.metric += (s - 1) / c0
  }

  const reading = (
    light: 'husk' | WaveForm,
    measuredDelay: number,
    eikonalDelay: number,
    pull: { fall: FallRun[]; pullScale: number },
    reversed: boolean,
    arrivals: number[],
    uniformArrivals: number[],
  ): FactorReading => ({
    light,
    measuredDelay,
    eikonalDelay,
    countDelay: pull.pullScale * closedCountDelay,
    closedCountDelay,
    pullScale: pull.pullScale,
    factor: measuredDelay / (pull.pullScale * closedCountDelay),
    closedFactor: eikonalDelay / closedCountDelay,
    fall: pull.fall,
    reversed,
    arrivals,
    uniformArrivals,
  })

  // the husk light, against the clock form's lump
  const m0 = makeMedium(LENS_LINE, () => RADION_DEPTH)
  const start = planarPacket(
    m0,
    LENS_SOURCE_X,
    LENS_AMP,
    LENS_HALF_WIDTH,
  )
  const detectors = LENS_DETECTORS.map(x => dockAt(m0, x, 0, 0))
  const huskU0 = runPacket(m0, start, detectors, LENS_WINDOW)
  const huskLens = runPacket(
    makeMedium(LENS_LINE, x => field.depth[x]!),
    start,
    detectors,
    LENS_WINDOW,
  )
  const clockPull = falls('clock')

  log?.(`husk ${(Date.now() - started) / 1000}s`)

  const husk = reading(
    'husk',
    huskLens.arrival[n]! -
      huskLens.arrival[0]! -
      (huskU0.arrival[n]! - huskU0.arrival[0]!),
    index.husk,
    clockPull,
    huskU0.reversed &&
      huskLens.reversed &&
      huskU0.gauss === 0 &&
      huskLens.gauss === 0,
    huskLens.arrival,
    huskU0.arrival,
  )

  // each form's own massless wave, against its own lump
  const formReading = (
    form: WaveForm,
    pull: { fall: FallRun[]; pullScale: number },
  ): FactorReading => {
    const u = waveArrival(
      () => RADION_DEPTH,
      form,
      LENS_SOURCE_X,
      WAVE_AMP,
      WAVE_WIDTH,
      LENS_DETECTORS,
      LENS_WINDOW,
    )
    const l = waveArrival(
      depthOf,
      form,
      LENS_SOURCE_X,
      WAVE_AMP,
      WAVE_WIDTH,
      LENS_DETECTORS,
      LENS_WINDOW,
    )

    return reading(
      form,
      l.arrival[n]! - l.arrival[0]! - (u.arrival[n]! - u.arrival[0]!),
      form === 'metric' ? index.metric : index.clock,
      pull,
      u.reversed && l.reversed,
      l.arrival,
      u.arrival,
    )
  }

  const clock = formReading('clock', clockPull)

  log?.(`clock ${(Date.now() - started) / 1000}s`)

  const metric = formReading('metric', falls('metric'))

  log?.(`metric ${(Date.now() - started) / 1000}s`)

  lightCache = {
    field,
    husk,
    clock,
    metric,
    huskU0,
    huskLens,
    seconds: (Date.now() - started) / 1000,
  }

  return lightCache
}
