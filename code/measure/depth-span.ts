// Measurement for the spanned husk light (code/rule/depth-span-light): its speed, its shadow invariant, its gauge
// covariance, and its delay through the radion's own slab against the Newtonian count (the machinery of
// code/measure/depth-arena, E-GRV-0088 and 0089). Real numbers live here only.
//
// THE SHADOW. After a beat the state holds f_(t+1) (the counters) and f_t (the lags), f = sum_i C_i / M^i per
// triangle, in the units of U. In the A2 = Q A + r units the link takes the flux whole, so as in E-FRC-0214
//   A2~_(t+1) = Q A + r + C^T f_t,     E~_(t+1) = (S - C^T U_(t+1)) + C^T (f_(t+1) - f_t)
// and the linear light it runs is A2~'' = -C^T K C W Q^(-1) A2~, K = n_P p / q_P. Its leapfrog invariant is
//   I = sum_l (w_l / (4 Q_l)) E~_l^2 + sum_P (p n_P / (4 q_P)) B'(A2~_(t+1)) B'(A2~_(t+1) + E~_(t+1))
// with B' = C W Q^(-1) A2~ (the field in angle units, the angle part read centered as the rule reads it). On a
// uniform medium this is 1 / q times the invariant of code/measure/trit-shaped-light with kappa = 2 p / q^2 on A2,
// kept up to the last carry's residual; on a depth boundary the rule reads a link's remainder in the triangle's own
// radix, so there I is the TARGET's invariant and its drift measures that choice.
//
// DETERMINISM: every start is placed; nothing is drawn.

import { logLogSlope } from '@/code/measure/regression'
import { arenaField, fallRun, lightSurvey, restRate, REST_AMPS, REST_BEATS, REST_TERMS, FALL_AT, FALL_BEATS, FALL_WIDTH, type FallRun, type LightSurvey } from '@/code/measure/depth-arena'
import { RADION_DEPTH, LENS_AMP, LENS_DETECTORS, LENS_HALF_WIDTH, LENS_LINE, LENS_SOURCE_X } from '@/code/measure/radion'
import { AMP, HALF_WIDTH, LINE, SOURCE_X, dockAt, gaussViolations, halfMaxCentroid, noWraps, planarPacket, type Wraps } from '@/code/measure/varying-depth-light'
import { copySpan, emptySpan, makeSpanMedium, makeSpanScratch, sameSpan, spanBeat, spanBeatBack, spanFlux, spanRest, type SpanMedium, type SpanState } from '@/code/rule/depth-span-light'

const mod = (x: number, m: number): number => ((x % m) + m) % m

// the spanned light's speed on a uniform depth: sqrt(2 kappa / 3) with kappa = 2 / q^2
export const spanSpeed = (d: number): number => 2 / ((2 * d + 1) * Math.sqrt(3))

// the start of a plane packet (code/measure/varying-depth-light planarPacket), every remainder and counter 0
export function spanPacket(m: SpanMedium, levels: number, x0: number, amp: number, w: number): SpanState {
  const s = emptySpan(m, levels)

  s.angle.set(planarPacket(m, x0, amp, w).angle)

  return s
}

// the sum over a dock's 9 out-links of the exact link angle (A + r / Q)^2
export function spanDockWeight(m: SpanMedium, s: SpanState, dock: number): number {
  let v = 0

  for (let h = 0; h < 9; h++) {
    const l = dock * 9 + h

    v += (s.angle[l]! + s.remainder[l]! / m.span[l]!) ** 2
  }

  return v
}

export type SpanWork = { flux: Int32Array; now: Float64Array; next: Float64Array; ctNow: Float64Array; ctNext: Float64Array }

export const makeSpanWork = (m: SpanMedium): SpanWork => ({
  flux: new Int32Array(m.geometry.huskLinks),
  now: new Float64Array(m.geometry.triangles),
  next: new Float64Array(m.geometry.triangles),
  ctNow: new Float64Array(m.geometry.huskLinks),
  ctNext: new Float64Array(m.geometry.huskLinks),
})

function curlTReal(m: SpanMedium, x: Float64Array, out: Float64Array): void {
  const g = m.geometry

  out.fill(0)

  for (let p = 0; p < g.triangles; p++) {
    const v = x[p]!

    if (v === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! + g.triSigns[j]! * v
  }
}

// the shadow invariant I of the header
export function spanEnergy(m: SpanMedium, s: SpanState, work: SpanWork): number {
  const g = m.geometry
  const levels = s.upper.length + 1

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    let a = s.lag[p]! / big
    let b = s.counter[p]! / big
    let scale = big

    for (let i = 0; i < levels - 1; i++) {
      scale *= big
      a += s.upperLag[i]![p]! / scale
      b += s.upper[i]![p]! / scale
    }

    work.now[p] = a
    work.next[p] = b
  }

  curlTReal(m, work.now, work.ctNow)
  curlTReal(m, work.next, work.ctNext)
  spanFlux(m, s, work.flux)

  let e = 0

  for (let l = 0; l < g.huskLinks; l++) {
    const x = work.flux[l]! + work.ctNext[l]! - work.ctNow[l]!

    e += (g.weight[l % 9]! / (4 * m.span[l]!)) * x * x
  }

  for (let p = 0; p < g.triangles; p++) {
    const nb = 4 * m.triDepth[p]!
    let raw = 0
    let rest = 0
    let step = 0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const c = g.triSigns[j]! * g.weight[l % 9]!
      const q = m.span[l]!

      raw += c * s.angle[l]!
      rest += (c * (s.remainder[l]! + work.ctNow[l]!)) / q
      step += (c * (work.flux[l]! + work.ctNext[l]! - work.ctNow[l]!)) / q
    }

    const b0 = mod(raw + nb / 2, nb) - nb / 2 + rest

    e += ((m.p * g.multiplicity[p]!) / (4 * m.count[p]!)) * b0 * (b0 + step)
  }

  return e
}

export type SpanRun = {
  arrival: number[]
  weight: number[]
  wraps: Wraps
  gauss: number
  reversed: boolean
  // the shadow invariant every `every` beats (index 0 the start)
  energy: number[]
  seconds: number
}

// a packet forward `window` beats, the detectors read after each beat, then back to the start bit for bit
export function runSpan(m: SpanMedium, start: SpanState, detectors: readonly number[], window: number, every = 64): SpanRun {
  const t0 = Date.now()
  const levels = start.upper.length + 1
  const s = copySpan(start)
  const scratch = makeSpanScratch(m, levels)
  const work = makeSpanWork(m)
  const wraps = noWraps()
  const trace = detectors.map(() => new Float64Array(window + 1))
  const energy = [spanEnergy(m, s, work)]
  let gauss = gaussViolations(m, s)

  for (let t = 1; t <= window; t++) {
    spanBeat(m, s, scratch, levels, wraps)
    detectors.forEach((d, i) => {
      trace[i]![t] = spanDockWeight(m, s, d)
    })
    gauss += gaussViolations(m, s)

    if (t % every === 0) energy.push(spanEnergy(m, s, work))
  }

  for (let t = 0; t < window; t++) spanBeatBack(m, s, scratch, levels)

  return {
    arrival: trace.map(halfMaxCentroid),
    weight: trace.map(r => r.reduce((a, v) => a + v, 0)),
    wraps,
    gauss,
    reversed: sameSpan(s, start),
    energy,
    seconds: (Date.now() - t0) / 1000,
  }
}

export const energyDrift = (energy: readonly number[]): number => energy.reduce((a, v) => Math.max(a, Math.abs(v / energy[0]! - 1)), 0)

// ---------------------------------------------------------------------------------------------------------
// gauge covariance: the husk gauge map of E-FRC-0252 (axis angles move by 2 d eta, diagonals by d eta, so every
// plaquette field is unchanged), with a small eta so no gauged angle reaches its window

export const gaugeEta = (a: number, b: number, c: number): number => mod(3 * a + 5 * b + 7 * c + a * b, 3) - 1

export function gaugeShift(m: SpanMedium): Int32Array {
  const g = m.geometry
  const [sx, sy] = m.sides
  const eta = (y: number): number => gaugeEta(y % sx, Math.floor(y / sx) % sy, Math.floor(y / (sx * sy)))

  return Int32Array.from({ length: g.huskLinks }, (_, l) => (l % 9 < 3 ? 2 : 1) * (eta(g.huskNeighbour[l]!) - eta(Math.floor(l / 9))))
}

export type GaugeReading = { plaquette: number; covariantBeats: number; beats: number; shifted: number }

// the gauged and ungauged runs side by side: after every beat the gauged angles equal the ungauged plus the map
// (wrapped), and every other array is equal
export function gaugeReading(m: SpanMedium, start: SpanState, beats: number): GaugeReading {
  const g = m.geometry
  const levels = start.upper.length + 1
  const lambda = gaugeShift(m)
  const wrapped = (l: number, v: number): number => mod(v + m.linkWindow[l]! / 2, m.linkWindow[l]!) - m.linkWindow[l]! / 2
  let plaquette = 0

  for (let p = 0; p < g.triangles; p++) {
    let v = 0

    for (let j = p * 3; j < p * 3 + 3; j++) v += g.triSigns[j]! * g.weight[g.triLinks[j]! % 9]! * lambda[g.triLinks[j]!]!
    plaquette = Math.max(plaquette, Math.abs(v))
  }

  const a = copySpan(start)
  const b = copySpan(start)

  for (let l = 0; l < g.huskLinks; l++) b.angle[l] = wrapped(l, a.angle[l]! + lambda[l]!)

  const sa = makeSpanScratch(m, levels)
  const sb = makeSpanScratch(m, levels)
  let covariantBeats = 0

  for (let t = 1; t <= beats; t++) {
    spanBeat(m, a, sa, levels)
    spanBeat(m, b, sb, levels)

    const angles = a.angle.every((v, l) => b.angle[l] === wrapped(l, v + lambda[l]!))
    const ra = spanRest(a)
    const rb = spanRest(b)

    if (angles && ra.every((x, j) => x.every((v, i) => v === rb[j]![i]))) covariantBeats++
  }

  return { plaquette, covariantBeats, beats, shifted: lambda.reduce((c, v) => c + (v === 0 ? 0 : 1), 0) }
}

// ---------------------------------------------------------------------------------------------------------
// the rule and its prediction: fixed before the gated run

export const SPAN_LEVELS = 3
export const SPAN_DEPTHS: readonly number[] = [16, 20, 24, 28]
export const SPAN_NEAR = 60
export const SPAN_FAR = 100
// the window at depth D: the packet's front must pass the far detector, and the -x half must not come round
export const spanWindow = (d: number): number => Math.ceil(80 / spanSpeed(d))
export const GAUGE_BEATS = 256
// the stability bound: the leapfrog is stable for kappa lambda_max <= 4, lambda_max = 16 on the husk (E-FRC-0250)
export const HUSK_TOP = 16

export type SpanSpeed = { depth: number; speed: number; closed: number; run: SpanRun }

export type SpanRuleSurvey = {
  speeds: SpanSpeed[]
  speedSlope: number
  rest: { m: number; depth: number; rate: number; closed: number; reversed: boolean }[]
  restSlope: number[]
  uniformGauge: GaugeReading
  lensGauge: GaugeReading
  lens: SpanLensSurvey
  // the largest kappa lambda_max over every triangle of every medium run
  stability: number
  minDepth: number
  seconds: number
}

let ruleCache: SpanRuleSurvey | undefined

export function spanRuleSurvey(log?: (what: string) => void): SpanRuleSurvey {
  if (ruleCache) return ruleCache

  const started = Date.now()
  const speeds = SPAN_DEPTHS.map(depth => {
    const m = makeSpanMedium(LINE, () => depth)
    const run = runSpan(m, spanPacket(m, SPAN_LEVELS, SOURCE_X, AMP, HALF_WIDTH), [dockAt(m, SPAN_NEAR, 0, 0), dockAt(m, SPAN_FAR, 0, 0)], spanWindow(depth))

    log?.(`speed D ${depth} ${run.seconds}s`)

    return { depth, speed: (SPAN_FAR - SPAN_NEAR) / (run.arrival[1]! - run.arrival[0]!), closed: spanSpeed(depth), run }
  })
  const qs = SPAN_DEPTHS.map(d => 2 * d + 1)
  const rest = REST_TERMS.flatMap((m, i) => SPAN_DEPTHS.map(depth => ({ m, depth, ...restRate(depth, m, REST_AMPS[i]!, REST_BEATS, 'span') })))
  const m16 = makeSpanMedium(LINE, () => SPAN_DEPTHS[0]!)
  const uniformGauge = gaugeReading(m16, spanPacket(m16, SPAN_LEVELS, SOURCE_X, AMP, HALF_WIDTH), GAUGE_BEATS)
  const field = arenaField()
  const mLens = makeSpanMedium(LENS_LINE, x => field.depth[x]!)
  const lensGauge = gaugeReading(mLens, spanPacket(mLens, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH), GAUGE_BEATS)

  log?.(`gauge ${(Date.now() - started) / 1000}s`)

  const lens = spanLensSurvey(log)
  let stability = 0

  for (const m of [m16, mLens, ...SPAN_DEPTHS.map(d => makeSpanMedium([16, 2, 2], () => d))]) {
    const g = m.geometry

    for (let p = 0; p < g.triangles; p++) {
      let low = Infinity

      for (let j = p * 3; j < p * 3 + 3; j++) low = Math.min(low, m.span[g.triLinks[j]!]!)

      stability = Math.max(stability, ((2 * m.p) / (m.count[p]! * low)) * HUSK_TOP)
    }
  }

  ruleCache = {
    speeds,
    speedSlope: logLogSlope(
      qs,
      speeds.map(s => s.speed),
    ),
    rest,
    restSlope: REST_TERMS.map(m =>
      logLogSlope(
        qs,
        rest.filter(r => r.m === m).map(r => r.rate),
      ),
    ),
    uniformGauge,
    lensGauge,
    lens,
    stability,
    minDepth: Math.min(...SPAN_DEPTHS, ...field.depth),
    seconds: (Date.now() - started) / 1000,
  }

  return ruleCache
}

// ---------------------------------------------------------------------------------------------------------
// the slab: fixed before the gated run

export const SPAN_LENS_WINDOW = 3600

export type SpanLensSurvey = {
  depth: number[]
  uniform: SpanRun
  lens: SpanRun
  measuredDelay: number
  eikonalDelay: number
  closedCountDelay: number
  // the span lumps' measured over predicted fall, and the factor with that pull and with the closed pull
  fall: FallRun[]
  pullScale: number
  factor: number
  factorClosedPull: number
  closedFactor: number
  // E-GRV-0089's runs: the old husk light and the two control waves
  arena: LightSurvey
  seconds: number
}

let lensCache: SpanLensSurvey | undefined

export function spanLensSurvey(log?: (what: string) => void): SpanLensSurvey {
  if (lensCache) return lensCache

  const started = Date.now()
  const field = arenaField()
  const depth = field.depth
  const first = LENS_DETECTORS[0]!
  const last = LENS_DETECTORS[LENS_DETECTORS.length - 1]!
  const n = LENS_DETECTORS.length - 1
  const c0 = spanSpeed(RADION_DEPTH)
  const q0 = 2 * RADION_DEPTH + 1
  let eikonalDelay = 0
  let closedCountDelay = 0

  for (let x = first; x < last; x++) {
    eikonalDelay += 1 / spanSpeed(depth[x]!) - 1 / c0
    closedCountDelay += Math.log((2 * depth[x]! + 1) / q0) / 2 / c0
  }

  const m0 = makeSpanMedium(LENS_LINE, () => RADION_DEPTH)
  const mLens = makeSpanMedium(LENS_LINE, x => depth[x]!)
  const start = spanPacket(m0, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH)
  const detectors = LENS_DETECTORS.map(x => dockAt(m0, x, 0, 0))
  const uniform = runSpan(m0, start, detectors, SPAN_LENS_WINDOW)

  log?.(`span uniform ${uniform.seconds}s`)

  const lens = runSpan(mLens, start, detectors, SPAN_LENS_WINDOW)

  log?.(`span lens ${lens.seconds}s`)

  const fall = REST_TERMS.map((m, i) => fallRun(x => depth[x]!, 'span', FALL_AT, m, REST_AMPS[i]!, FALL_WIDTH, FALL_BEATS))
  const pullScale = fall.reduce((a, f) => a + f.g / f.gPredicted, 0) / fall.length
  const arena = lightSurvey(log)
  const measuredDelay = lens.arrival[n]! - lens.arrival[0]! - (uniform.arrival[n]! - uniform.arrival[0]!)

  lensCache = {
    depth,
    uniform,
    lens,
    measuredDelay,
    eikonalDelay,
    closedCountDelay,
    fall,
    pullScale,
    factor: measuredDelay / (pullScale * closedCountDelay),
    factorClosedPull: measuredDelay / closedCountDelay,
    closedFactor: eikonalDelay / closedCountDelay,
    arena,
    seconds: (Date.now() - started) / 1000,
  }

  return lensCache
}
