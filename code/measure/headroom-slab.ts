// E-GRV-0093's slab under the headroom medium (test/experiment/gravity/headroom-slab): the kept energy of the light
// whose two metric parts run at the register's room (code/rule/depth-span-light makeHeadroomSpanMedium), its run, and
// the survey that places the radion's slab as a room staircase. Real numbers live here only; the rule holds integers.
//
// THE KEPT ENERGY. The headroom rule's header states the linear leapfrog its shadow runs, in the A2 = R A + r units
// (R = q0 C, M = R^2, K = diag(k_l), G = diag(n_P p k_P / M)):
//   a_(t+1) = a_t + K e_t,        e_(t+1) = e_t - C^T G C W a_(t+1)
// with a~ = A2 + K C^T f_t and e~ = S - C^T U + C^T (f_(t+1) - f_t) (f the carried fraction of the shaped levels, as in
// code/measure/depth-span). Eliminating e gives a'' = -K C^T G C W a, whose operator is self-adjoint in the weight
// S = W K^(-1) (S K C^T G C W = W C^T G C W, symmetric). For any such leapfrog x_(t+1) - 2 x_t + x_(t-1) = -A x_t the
// quantity |x_(t+1) - x_t|_S^2 + <x_(t+1), A x_t>_S is conserved exactly (its difference over one beat is
// <-A x_t, x_(t+1) - x_(t-1)>_S + <x_(t+1) - x_(t-1), A x_t>_S = 0). Here x_(t+1) - x_t = K e_t, so
//   I = sum_l w_l k_l e~_l^2 + sum_P (n_P p k_P / M) b_P(a~_(t+1)) b_P(a~_(t+1) + K e~_(t+1)),    b = C W a~
// read on the state after a beat (the pairing of code/measure/depth-span spanEnergy: e~ the flux the next beat takes,
// the angle part centered as the rule reads it). It is the medium's electromagnetic energy with permittivity C / k_l
// and permeability C / k_P: the rate weights are the medium, not a correction. It differs from spanEnergy's reading
// of the same state in two places, the weights k_l and k_P and the carried fraction's k_l (the headroom rule's spatial
// terms carry diag(k_l)), so spanEnergy is not this light's invariant even at uniform room. It is kept up to the last
// shaped level's residual (M^3 ~ 2.6e23 at D0 16, C 243) and the doubles' rounding, while no value crosses a window.
// There is NO radix choice at a boundary between two rooms: every divisor is R, which is why E-GRV-0093's 3.8 percent
// drift (a link's remainder read in its triangle's radix) should have no counterpart here.
//
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { arenaField } from '@/code/measure/depth-arena'
import { makeSpanWork, runSpan, spanDockWeight, spanEnergy, spanPacket, spanSpeed, SPAN_LENS_WINDOW, SPAN_LEVELS, type SpanRun, type SpanWork } from '@/code/measure/depth-span'
import { roomRestRate } from '@/code/measure/headroom-horizon'
import { LENS_AMP, LENS_DETECTORS, LENS_HALF_WIDTH, LENS_LINE, LENS_SOURCE_X, RADION_DEPTH } from '@/code/measure/radion'
import { dockAt, gaussViolations, halfMaxCentroid, noWraps, type Wraps } from '@/code/measure/varying-depth-light'
import { copySpan, makeHeadroomSpanMedium, makeSpanMedium, makeSpanScratch, sameSpan, spanBeat, spanBeatBack, spanFlux, type SpanMedium, type SpanState } from '@/code/rule/depth-span-light'

const mod = (x: number, m: number): number => ((x % m) + m) % m

function curlTReal(m: SpanMedium, x: Float64Array, out: Float64Array): void {
  const g = m.geometry

  out.fill(0)

  for (let p = 0; p < g.triangles; p++) {
    const v = x[p]!

    if (v === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! + g.triSigns[j]! * v
  }
}

// the kept energy I of the header, normalized by 1 / (4 R C)
export function headroomEnergy(m: SpanMedium, s: SpanState, work: SpanWork): number {
  const rate = m.rate

  if (!rate) throw new Error('headroomEnergy: the medium has no room rates (makeHeadroomSpanMedium)')

  const g = m.geometry
  const levels = s.upper.length + 1
  const radix = m.span[0]!

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

    e += g.weight[l % 9]! * rate.link[l]! * x * x
  }

  for (let p = 0; p < g.triangles; p++) {
    const nb = 4 * m.triDepth[p]!
    let raw = 0
    let rest = 0
    let step = 0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const c = g.triSigns[j]! * g.weight[l % 9]!
      const k = rate.link[l]!

      raw += c * s.angle[l]!
      rest += c * (s.remainder[l]! + k * work.ctNow[l]!)
      step += c * k * (work.flux[l]! + work.ctNext[l]! - work.ctNow[l]!)
    }

    const b0 = radix * (mod(raw + nb / 2, nb) - nb / 2) + rest

    e += ((m.p * g.multiplicity[p]! * rate.tri[p]!) / m.square[p]!) * b0 * (b0 + step)
  }

  return e / (4 * radix * rate.base)
}

export type HeadroomRun = {
  arrival: number[]
  weight: number[]
  wraps: Wraps
  gauss: number
  reversed: boolean
  // the kept energy every `every` beats (index 0 the start), and beside it spanEnergy's reading of the same states
  // (the invariant with every rate weight left out), which is not this medium's energy where k varies
  energy: number[]
  unweighted: number[]
  seconds: number
}

// code/measure/depth-span runSpan's run with the headroom medium's kept energy: a packet forward `window` beats, the
// detectors read after each beat, then back to the start bit for bit
export function runHeadroom(m: SpanMedium, start: SpanState, detectors: readonly number[], window: number, every: number): HeadroomRun {
  const t0 = Date.now()
  const levels = start.upper.length + 1
  const s = copySpan(start)
  const scratch = makeSpanScratch(m, levels)
  const work = makeSpanWork(m)
  const wraps = noWraps()
  const trace = detectors.map(() => new Float64Array(window + 1))
  const energy = [headroomEnergy(m, s, work)]
  const unweighted = [spanEnergy(m, s, work)]
  let gauss = gaussViolations(m, s)

  for (let t = 1; t <= window; t++) {
    spanBeat(m, s, scratch, levels, wraps)
    detectors.forEach((d, i) => {
      trace[i]![t] = spanDockWeight(m, s, d)
    })
    gauss += gaussViolations(m, s)

    if (t % every === 0) {
      energy.push(headroomEnergy(m, s, work))
      unweighted.push(spanEnergy(m, s, work))
    }
  }

  for (let t = 0; t < window; t++) spanBeatBack(m, s, scratch, levels)

  return {
    arrival: trace.map(halfMaxCentroid),
    weight: trace.map(r => r.reduce((a, v) => a + v, 0)),
    wraps,
    gauss,
    reversed: sameSpan(s, start),
    energy,
    unweighted,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the slab: fixed before the gated run

// E-GRV-0122's register, and its matter (REST_TERM, REST_AMP, REST_BEATS as there)
export const SLAB_BASE = 243
export const SLAB_EVERY = 64
export const SLAB_REST_TERM = 3
export const SLAB_REST_AMP = 100000
export const SLAB_REST_BEATS = 8192

// THE ROOM STAIRCASE. E-GRV-0093's light ran at index q / q0 on each dock (q = 2 D + 1, D the radion's depth); the
// headroom light runs at index C / k, and k <= C, so full room goes to the SHALLOWEST dock on the ring (the sink side of
// the field is shallower than D0): k = round(C q_top / q), q_top the ring's least count. The reference is the room at
// D0, k0 = round(C q_top / q0), where E-GRV-0093's uniform run sat, so the slab's index over the reference is k0 / k,
// E-GRV-0093's q / q0 to within the rounding, 1 / (2 k) (disclosed; every reading uses the rooms the medium holds)
export const slabRoom = (depth: number, base: number, top: number): number => Math.round((base * top) / (2 * depth + 1))

export type SlabInterval = { x: number; k: number }

export type HeadroomSlabSurvey = {
  depth: number[]
  room: number[]
  // q_top, the ring's least count, and k0, the reference room at D0
  top: number
  reference: number
  // the room steps: docks x with room(x) != room(x + 1), over the ring and between the first and last detector
  steps: number
  pathSteps: number
  // the intervals [x, x + 1] from the first detector to the last, each at the room its links read (the smaller end)
  intervals: SlabInterval[]
  uniform: HeadroomRun
  lens: HeadroomRun
  // E-GRV-0093's own medium on the same slab, packet, detectors and window
  control: SpanRun
  measuredDelay: number
  eikonalDelay: number
  // the Newtonian count with matter's closed clock sqrt(h), and with its MEASURED rest rate per room
  closedCount: number
  clockCount: number
  rest: { k: number; rate: number; closed: number; reversed: boolean }[]
  c0: number
  seconds: number
}

let cache: HeadroomSlabSurvey | undefined

export function headroomSlabSurvey(log?: (what: string) => void): HeadroomSlabSurvey {
  if (cache) return cache

  const started = Date.now()
  const depth = arenaField().depth
  const top = 2 * Math.min(...depth) + 1
  const room = depth.map(d => slabRoom(d, SLAB_BASE, top))
  const reference = slabRoom(RADION_DEPTH, SLAB_BASE, top)
  const [sx] = LENS_LINE
  const first = LENS_DETECTORS[0]!
  const last = LENS_DETECTORS[LENS_DETECTORS.length - 1]!
  const n = LENS_DETECTORS.length - 1
  // the reference light's speed: the full-room speed c0 (the D0 light's) times k0 / C
  const c0 = (spanSpeed(RADION_DEPTH) * reference) / SLAB_BASE
  const intervals: SlabInterval[] = []

  for (let x = first; x < last; x++) intervals.push({ x, k: Math.min(room[x]!, room[x + 1]!) })

  log?.(`field ${(Date.now() - started) / 1000}s`)

  const flat = makeHeadroomSpanMedium(LENS_LINE, RADION_DEPTH, SLAB_BASE, () => reference)
  const slab = makeHeadroomSpanMedium(LENS_LINE, RADION_DEPTH, SLAB_BASE, x => room[x]!)
  const start = spanPacket(flat, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH)
  const detectors = LENS_DETECTORS.map(x => dockAt(flat, x, 0, 0))
  const uniform = runHeadroom(flat, start, detectors, SPAN_LENS_WINDOW, SLAB_EVERY)

  log?.(`headroom uniform ${uniform.seconds}s`)

  const lens = runHeadroom(slab, start, detectors, SPAN_LENS_WINDOW, SLAB_EVERY)

  log?.(`headroom slab ${lens.seconds}s`)

  // the control, built exactly as code/measure/depth-span spanLensSurvey builds E-GRV-0093's lens run
  const m0 = makeSpanMedium(LENS_LINE, () => RADION_DEPTH)
  const mLens = makeSpanMedium(LENS_LINE, x => depth[x]!)
  const control = runSpan(mLens, spanPacket(m0, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH), LENS_DETECTORS.map(x => dockAt(m0, x, 0, 0)), SPAN_LENS_WINDOW, SLAB_EVERY)

  log?.(`control ${control.seconds}s`)

  const rooms = [...new Set([reference, ...intervals.map(iv => iv.k)])].sort((a, b) => b - a)
  const rest = rooms.map(k => roomRestRate(k, SLAB_BASE, RADION_DEPTH, SLAB_REST_TERM, SLAB_REST_AMP, SLAB_REST_BEATS))
  const rateOf = (k: number): number => rest.find(r => r.k === k)!.rate

  log?.(`rest rates ${(Date.now() - started) / 1000}s`)

  let eikonalDelay = 0
  let closedCount = 0
  let clockCount = 0

  for (const iv of intervals) {
    eikonalDelay += (reference / iv.k - 1) / c0
    closedCount += Math.log(reference / iv.k) / 2 / c0
    clockCount += Math.log(rateOf(reference) / rateOf(iv.k)) / c0
  }

  const stepAt = (x: number): boolean => room[x]! !== room[(x + 1) % sx]!

  cache = {
    depth,
    room,
    top,
    reference,
    steps: room.reduce((c, _, x) => c + (stepAt(x) ? 1 : 0), 0),
    pathSteps: intervals.reduce((c, iv) => c + (stepAt(iv.x) ? 1 : 0), 0),
    intervals,
    uniform,
    lens,
    control,
    measuredDelay: lens.arrival[n]! - lens.arrival[0]! - (uniform.arrival[n]! - uniform.arrival[0]!),
    eikonalDelay,
    closedCount,
    clockCount,
    rest,
    c0,
    seconds: (Date.now() - started) / 1000,
  }

  return cache
}

// THE POST READING (written after the gated run, gating nothing). The gated window, E-GRV-0093's 3,600 beats, was sized
// for a light at c0; the reference here runs at c0 k0 / C, so the slab's packet reached x = 120 at 3,593.7 of 3,600
// beats and its half-maximum centroid there was cut short. This runs the reference and the slab again over the window
// scaled by C / k0, the same distance in the reference light's own time, so the -x half still does not come round
export type HeadroomSlabPost = { window: number; uniform: HeadroomRun; lens: HeadroomRun; measuredDelay: number; seconds: number }

let postCache: HeadroomSlabPost | undefined

export function headroomSlabPost(s: HeadroomSlabSurvey, log?: (what: string) => void): HeadroomSlabPost {
  if (postCache) return postCache

  const started = Date.now()
  const n = LENS_DETECTORS.length - 1
  const window = Math.ceil((SPAN_LENS_WINDOW * SLAB_BASE) / s.reference)
  const flat = makeHeadroomSpanMedium(LENS_LINE, RADION_DEPTH, SLAB_BASE, () => s.reference)
  const slab = makeHeadroomSpanMedium(LENS_LINE, RADION_DEPTH, SLAB_BASE, x => s.room[x]!)
  const start = spanPacket(flat, SPAN_LEVELS, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH)
  const detectors = LENS_DETECTORS.map(x => dockAt(flat, x, 0, 0))
  const uniform = runHeadroom(flat, start, detectors, window, SLAB_EVERY)

  log?.(`post uniform ${uniform.seconds}s`)

  const lens = runHeadroom(slab, start, detectors, window, SLAB_EVERY)

  log?.(`post slab ${lens.seconds}s`)

  postCache = {
    window,
    uniform,
    lens,
    measuredDelay: lens.arrival[n]! - lens.arrival[0]! - (uniform.arrival[n]! - uniform.arrival[0]!),
    seconds: (Date.now() - started) / 1000,
  }

  return postCache
}
