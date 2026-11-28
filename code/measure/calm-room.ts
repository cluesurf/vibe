// CALM ROOM (B3 refiled by the grounding decision). B1's cluster and bath on a closed
// ring of L docks, the start lifted beside L - W calm docks, read as a long-time level over a window set by the ring's
// light-crossing time. Everything runs on code/measure/cold-line.ts's closed engines (B1's rule, nothing changed) and
// code/measure/cone-line.ts's sparse open line for the before-the-wrap check.
//
// THE WINDOW. A love moves one dock a beat, so it crosses a ring of L docks once in L beats. The level is read at the
// L + 1 beats t = f L + f j (j = 0..L), the window [f L, 2 f L] after f light-crossing times (f 8 in the gate, 4 in the
// smoke). It is set from the ring alone, never from a reading.
//
// THE LEVEL IS REACHED when the mean of the first ceil((L + 1) / 2) window reads and the mean of the last ceil((L + 1)
// / 2) agree within the gate's tolerance (they share the middle read when L is even).
//
// T-0024a: lineBeat passes the phase and coin over its INPUT in place, so every run here beats its own copy of a start.

import {
  emptyAmp,
  lineBeat,
  lineBeatBack,
  lovesOutside,
  maxDifference,
  boundCount,
  type Amp,
  type LineEngine,
  type LineReader,
} from '@/code/measure/cold-line'
import {
  agreeWith,
  coneBeat,
  coneStore,
  type ConeStore,
} from '@/code/measure/cone-line'

// the norm with compensated (Kahan) summation: on 2e8 amplitudes a plain sum's own roundoff can reach the norm bar
export function normKahan(a: Amp): number {
  let s = 0
  let c = 0

  for (let u = 0; u < a.re.length; u++) {
    const y = a.re[u]! * a.re[u]! + a.im[u]! * a.im[u]! - c
    const t = s + y

    c = t - s - y
    s = t
  }

  return s
}

export const copyAmp = (a: Amp): Amp => ({
  re: Float64Array.from(a.re),
  im: Float64Array.from(a.im),
})

// the window's read beats on a ring of L at factor f
export function windowBeats(L: number, f: number): number[] {
  return Array.from({ length: L + 1 }, (_, j) => f * L + f * j)
}

export type WindowStats = {
  mean: number
  first: number
  last: number
  // |first - last|
  drift: number
}

// the window's mean and its two halves (each ceil(m / 2) reads of the m window reads)
export function windowStats(values: readonly number[]): WindowStats {
  const m = values.length

  if (m === 0) {
    throw new Error('calm-room: an empty window')
  }

  const h = Math.ceil(m / 2)
  const avg = (xs: readonly number[]): number =>
    xs.reduce((s, x) => s + x, 0) / xs.length
  const first = avg(values.slice(0, h))
  const last = avg(values.slice(m - h))

  return { mean: avg(values), first, last, drift: Math.abs(first - last) }
}

export type RingRun = {
  // read beat -> F
  reads: Map<number, number>
  normOff: number
  // the expected loves outside docks [span[0], span[1]] at the last beat (NaN without a span)
  outside: number
  seconds: number
}

// a dense run of `beats` beats from a COPY of `start`, F read at every beat `readAt` names (and at 0); `observe` sees
// the state after each beat
export function ringRun(input: {
  e: LineEngine
  start: Amp
  rd: LineReader
  beats: number
  readAt: (t: number) => boolean
  observe?: (t: number, a: Amp) => void
  span?: readonly [number, number]
}): RingRun {
  const { e, start, rd, beats, readAt, observe, span } = input
  const started = Date.now()

  let a = copyAmp(start)
  let b = emptyAmp(a.re.length)
  let normOff = Math.abs(normKahan(a) - 1)

  const reads = new Map<number, number>([[0, boundCount(e, rd, a)]])

  for (let t = 1; t <= beats; t++) {
    lineBeat(e, a, b, true)
    ;[a, b] = [b, a]
    normOff = Math.max(normOff, Math.abs(normKahan(a) - 1))

    if (observe) {
      observe(t, a)
    }

    if (readAt(t)) {
      reads.set(t, boundCount(e, rd, a))
    }
  }

  const outside = span ? lovesOutside(e, a, span[0], span[1]) : NaN

  return { reads, normOff, outside, seconds: (Date.now() - started) / 1000 }
}

// `beats` beats forward and back (split coin) from a copy of `start`: the largest amplitude difference from the start
export function ringReversal(e: LineEngine, start: Amp, beats: number): number {
  let a = copyAmp(start)
  let b = emptyAmp(a.re.length)

  for (let t = 0; t < beats; t++) {
    lineBeat(e, a, b, true)
    ;[a, b] = [b, a]
  }

  for (let t = 0; t < beats; t++) {
    lineBeatBack(e, a, b, true)
    ;[a, b] = [b, a]
  }

  return maxDifference(a, start)
}

// the first beat at which a love of a start spanning docks [o, o + width - 1] can wrap a ring of L
export const wrapBeat = (L: number, o: number, width: number): number =>
  Math.min(o + 1, L - o - width + 1)

// the sparse open line in lockstep with a dense ring run: sparse dock x + shift is ring dock x
export type Lockstep = {
  observe: (t: number, a: Amp) => void
  // the largest difference (amplitude, or the square root of dense weight the sparse store does not hold) at each
  // compared beat, and at the start
  diffs: number[]
  start: number
}

export function lockstep(input: {
  e: LineEngine
  dense: Amp
  sparse: ConeStore
  shift: number
  // compare beats 1..until
  until: number
}): Lockstep {
  const { e, dense, shift, until } = input
  const diffOf = (g: { worst: number; missing: number }): number =>
    Math.max(g.worst, Math.sqrt(g.missing))

  let s = input.sparse
  let s2 = coneStore(s.n, s.line, s.cap)

  const diffs: number[] = []
  const out: Lockstep = {
    observe: (t, a) => {
      if (t > until) {
        return
      }

      coneBeat(s, s2, true)
      ;[s, s2] = [s2, s]
      diffs.push(diffOf(agreeWith(s, e, a, shift)))
    },
    diffs,
    start: diffOf(agreeWith(s, e, dense, shift)),
  }

  return out
}
