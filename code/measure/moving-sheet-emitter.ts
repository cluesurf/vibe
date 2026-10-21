// A moving emitter on the husk light (E-FRC-0314): a sheet of loop current that oscillates as a square wave
// while it steps along the husk x axis, run on the shaped husk integer light (code/rule/trit-husk-shaped), and
// the light it leaves read at fixed detector layers ahead of it and behind it.
//
// WHY A SHEET. The box is long in x and short across (sides `width`, even), and the husk rule is translation
// invariant, so a source the same on every layer across runs the plane-wave sector exactly as a wide box would
// (E-GRV-0070's reading of a short side). A plane front has no 1/r fall and no transverse images, so its arrival
// time is read without a near-field correction. A detector averages the shadow flux over its whole layer, which
// keeps only the plane part.
//
// THE SOURCE, a STAND-IN with a prescribed path. On every beat t the emitter's fine position is
// u = floor(t n_L / T) in units of 1 / n_L dock (T = `stepEvery`, 0 for a source at rest, n_L = `loops`), and it
// drives `current` crossings round n_L closed y loops (every +y link of the loop at layer x, height z): of
// them, u mod n_L sit at layer floor(u / n_L) + 1 and the rest at floor(u / n_L). Integer apportionment, no
// rounding: the plane part of the source is at u / n_L docks exactly. A closed loop moves no charge, so Gauss
// holds at every dock with no charge record, and the source
// carries no static field: before its first beat the light is empty, and every flux the detectors read was
// emitted by it. The sign of the current flips every P / 2 beats (P = `period`), +1 first. The light never
// tells the source how fast it moves: the source is a list of (beat, link, crossings), and the rule reads only
// that.
//
// Readings, floats from the exact integers (measurement only): per detector layer x_d, the shadow flux
// E~_y = E^ / q^L (code/rule/trit-kinetic fieldNumerators) averaged over the layer's +y links after every light
// beat, and the first beat on which any of those integer numerators is nonzero (the rule's own causal edge).

import { addCurrent, huskGeometryBox, makeHuskEngine } from '@/code/rule/trit-husk'
import {
  emptyShaped,
  makeShapedScratch,
  shapedArrays,
  shapedBeat,
  shapedBeatBack,
  type ShapedOptions,
} from '@/code/rule/trit-husk-shaped'
import { fieldNumerators, makeFieldScratch } from '@/code/rule/trit-kinetic'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export type SheetEmitterSpec = {
  // husk box sides: x is `length`, y and z are `width` (all even)
  length: number
  width: number
  depth: number
  levels: number
  // the square-wave period in beats (even)
  period: number
  // beats per dock step along +x; 0 is the source at rest
  stepEvery: number
  // crossings per beat on each link of a loop
  current: number
  // how many y loops carry the current, at z = 0, s, 2 s, .. with s = width / loops (loops divides width).
  // They share the source's fine position: of the `loops`, n sit one dock ahead, so the plane part of the
  // source moves in steps of 1 / loops dock instead of whole docks
  loops: number
  beats: number
  // detector layers, as signed x offsets from the source's start
  detectors: readonly number[]
}

export type SheetEmitterRun = {
  // per detector, the layer-averaged shadow flux E~_y after each beat t = 0 .. beats - 1
  traces: Float64Array[]
  // per detector, the first beat with a nonzero integer flux numerator on the layer (-1 if none)
  firstNonzero: number[]
  // the source's fine position at each beat, in units of 1 / loops dock
  positions: Int32Array
  // the largest |E~| on any link at any beat (the cyclic flux is exact while it stays below q / 2)
  largestFlux: number
  // with `reverse`, the run undone beat by beat (currents removed in reverse order) returned to the empty light
  reversed: boolean | undefined
}

// the source's fine position at beat t, in units of 1 / loops dock
export const emitterFinePosition = (input: {
  stepEvery: number
  loops: number
  t: number
}): number =>
  input.stepEvery > 0
    ? Math.floor((input.t * input.loops) / input.stepEvery)
    : 0

// the square wave's sign at beat t
export const emitterSign = (period: number, t: number): number =>
  Math.floor(t / (period / 2)) % 2 === 0 ? 1 : -1

export function runSheetEmitter(
  spec: SheetEmitterSpec,
  reverse = false,
): SheetEmitterRun {
  const { length, width, depth, levels } = spec
  const g = huskGeometryBox(length, width, width)
  const e = makeHuskEngine(g, depth)
  const s = emptyShaped(g, levels)
  const scratch = makeShapedScratch(g, levels)
  const f = makeFieldScratch(e)
  const options: ShapedOptions = { levels, cyclic: true }
  const scale = e.q ** levels
  const at = (a: number, b: number, c: number): number =>
    mod(a, length) + length * mod(b, width) + length * width * mod(c, width)
  const layerLinks = spec.detectors.map(d => {
    const out: number[] = []

    for (let z = 0; z < width; z++) {
      for (let y = 0; y < width; y++) {
        out.push(at(d, y, z) * 9 + 1)
      }
    }

    return out
  })
  const traces = spec.detectors.map(() => new Float64Array(spec.beats))
  const firstNonzero = spec.detectors.map(() => -1)
  const positions = new Int32Array(spec.beats)
  const applied: { link: number; j: number }[][] = []

  let largestFlux = 0

  const loops = spec.loops
  const spacing = width / loops

  if (!Number.isInteger(spacing)) {
    throw new Error('loops must divide width')
  }

  for (let t = 0; t < spec.beats; t++) {
    const u = emitterFinePosition({
      stepEvery: spec.stepEvery,
      loops,
      t,
    })
    const base = Math.floor(u / loops)
    const ahead = u - base * loops
    const j = spec.current * emitterSign(spec.period, t)
    const step: { link: number; j: number }[] = []

    positions[t] = u

    for (let n = 0; n < loops; n++) {
      const x = n < ahead ? base + 1 : base

      for (let y = 0; y < width; y++) {
        const link = at(x, y, n * spacing) * 9 + 1

        addCurrent(s, link, j)
        step.push({ link, j })
      }
    }

    applied.push(step)
    shapedBeat(e, s, scratch, options)
    fieldNumerators(e, s, options, f)

    for (let l = 0; l < g.huskLinks; l++) {
      largestFlux = Math.max(largestFlux, Math.abs(f.eHat[l]!) / scale)
    }

    layerLinks.forEach((links, k) => {
      let sum = 0
      let nonzero = false

      for (const l of links) {
        sum += f.eHat[l]!
        nonzero ||= f.eHat[l]! !== 0
      }

      traces[k]![t] = sum / links.length / scale

      if (nonzero && firstNonzero[k] === -1) {
        firstNonzero[k] = t
      }
    })
  }

  let reversed: boolean | undefined

  if (reverse) {
    for (let t = spec.beats - 1; t >= 0; t--) {
      shapedBeatBack(e, s, scratch, options)

      for (const { link, j } of applied[t]!) {
        addCurrent(s, link, -j)
      }
    }

    reversed = shapedArrays(s).every(a => a.every(v => v === 0))
  }

  return { traces, firstNonzero, positions, largestFlux, reversed }
}

// the beat (interpolated) at which |trace| first reaches `fraction` of its largest value over [from, to)
export function halfRiseBeat(input: {
  trace: Float64Array
  from: number
  to: number
  fraction: number
}): number {
  const { trace, from, fraction } = input
  const to = Math.min(input.to, trace.length)

  let peak = 0

  for (let t = from; t < to; t++) {
    peak = Math.max(peak, Math.abs(trace[t]!))
  }

  const level = fraction * peak

  for (let t = from; t < to; t++) {
    const here = Math.abs(trace[t]!)

    if (here >= level && peak > 0) {
      const before = t > from ? Math.abs(trace[t - 1]!) : 0

      return here === before ? t : t - 1 + (level - before) / (here - before)
    }
  }

  return Number.NaN
}

// the mean spacing of the trace's rises through zero over [from, to), with hysteresis: a rise counts only when
// the trace goes from below -h to above +h (h = `band` times the largest |trace| in the window), and its time is
// the last interpolated zero crossing on the way up. Small ripple near zero is not a rise
export function meanUpCrossingPeriod(input: {
  trace: Float64Array
  from: number
  to: number
  band: number
}): { period: number; crossings: number; times: number[] } {
  const { trace, from } = input
  const to = Math.min(input.to, trace.length)
  const times: number[] = []

  let peak = 0

  for (let t = from; t < to; t++) {
    peak = Math.max(peak, Math.abs(trace[t]!))
  }

  const h = input.band * peak

  let armed = false
  let zero = Number.NaN

  for (let t = from + 1; t < to; t++) {
    const a = trace[t - 1]!
    const b = trace[t]!

    if (b < -h) {
      armed = true
      zero = Number.NaN
    }

    if (armed && a < 0 && b >= 0) {
      zero = t - 1 + -a / (b - a)
    }

    if (armed && b > h && !Number.isNaN(zero)) {
      times.push(zero)
      armed = false
    }
  }

  return {
    period:
      times.length > 1
        ? (times[times.length - 1]! - times[0]!) / (times.length - 1)
        : Number.NaN,
    crossings: times.length,
    times,
  }
}

// THE ENVELOPE READER (E-FRC-0316), built so a growing or shrinking envelope cannot hide a rise. The trace is first
// smoothed by a centered boxcar of `smooth` beats (odd; no phase shift, and a ripple whose period is well under
// `smooth` is cut). A rise counts when the smoothed trace y goes from below -h(t) to above +h(t), where h(t) is `band`
// times the largest |y| over the trailing `window` beats [t - window, t] (local, not the whole record's), and its time is
// the last interpolated zero crossing of y on the way up. The period is the mean spacing of the rises; the spacings
// themselves are returned so a skipped rise (a spacing near twice the others) or a spurious one is visible.
export function envelopeRisePeriod(input: {
  trace: Float64Array
  from: number
  to: number
  smooth: number
  window: number
  band: number
}): { period: number; crossings: number; times: number[]; spacings: number[] } {
  const { trace, smooth, window, band } = input
  const to = Math.min(input.to, trace.length)
  const half = (smooth - 1) / 2

  if (!Number.isInteger(half) || half < 0) {
    throw new Error('smooth must be a positive odd number of beats')
  }

  const y = new Float64Array(trace.length)

  for (let t = 0; t < trace.length; t++) {
    let sum = 0
    let count = 0

    for (let s = t - half; s <= t + half; s++) {
      if (s >= 0 && s < trace.length) {
        sum += trace[s]!
        count++
      }
    }

    y[t] = sum / count
  }

  const times: number[] = []
  const start = input.from + half

  let armed = false
  let zero = Number.NaN

  for (let t = start + 1; t < to - half; t++) {
    let peak = 0

    for (let s = Math.max(start, t - window); s <= t; s++) {
      peak = Math.max(peak, Math.abs(y[s]!))
    }

    const h = band * peak
    const a = y[t - 1]!
    const b = y[t]!

    if (b < -h) {
      armed = true
      zero = Number.NaN
    }

    if (armed && a < 0 && b >= 0) {
      zero = t - 1 + -a / (b - a)
    }

    if (armed && b > h && !Number.isNaN(zero)) {
      times.push(zero)
      armed = false
    }
  }

  const spacings = times.slice(1).map((x, i) => x - times[i]!)

  return {
    period:
      times.length > 1
        ? (times[times.length - 1]! - times[0]!) / (times.length - 1)
        : Number.NaN,
    crossings: times.length,
    times,
    spacings,
  }
}
