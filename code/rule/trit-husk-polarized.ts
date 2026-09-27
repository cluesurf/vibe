// The shaped husk light driven by a FRACTIONAL string (E-FRC-0221, 0222): a source that is not whole crossings,
// such as the expectation of a spread quantum charge, enters the integer light without rounding and without
// the whole-unit impulses that heat it.
//
// THE PROBLEM. The light's source is the string S on each husk link, the column sum of whole crossings. The
// expectation of a quantum charge's string, S*, is a fraction on every link (a spread charge moves a little
// of itself across many links at once). A string that jumps by a whole unit where S* passes a threshold is a
// sequence of unit impulses (a classical point charge, E-FRC-0216: each crossing radiates about 16 r times
// the binding).
//
// THE CONSTRUCTION, derived before any run. Hold S* at resolution q^-L as the integer X = floor(q^L S*) (the
// count of thresholds of size q^-L it has passed: a threshold count, never a rounding). Keep the integer
// string S and a bucket Gamma per husk link, with
//   q^L (S_t - S*_t) = Gamma_t - Gamma_(t-1),    Gamma in -H .. H,  H = (q^L - 1) / 2
// so the string's departure from S* is a FIRST DIFFERENCE of a bounded bucket. The load is the wave form's
// counter again: Gamma_t = 2 Gamma_(t-1) - Gamma_(t-2) + q^L n_t - (X_t - X_(t-1)), S_t = S_(t-1) + n_t, with
// n_t the unique integer that puts Gamma_t in its window (q^L odd, so the window holds one multiple of q^L).
// Then with g = Gamma / q^L the drift A_(t+1) = A_t + S_t - C^T U_t gives
//   A^_(t+1) = A_(t+1) - g_t   runs   A^_(t+1) - A^_t = S*_t - C^T U_t
// exactly: the whole-unit jumps of S telescope. The kick reads B = C W A, so it must read C W (A - g_t): the
// bucket's base-q digits G_1 .. G_L (g = sum G_i q^-i, each G_i in -h .. h) enter the shaped kick's spatial
// terms beside the counters,
//   s_i = n_P p (C W (C^T C_i - G_i))_P
// which is the counters' own form, so the level machinery of code/rule/trit-husk-shaped pays them unchanged,
// and the shadow A~ = A + C^T f_t - g_t, U~ = U - (f_t - f_(t-1)) runs the linear leapfrog driven by S*
// (up to the last level's residual, as before). Gauss's law on the integers is exact by construction
// (div (S - C^T U) = div S, the charge the string records), and in the shadow div S* is the source's charge.
//
// REVERSIBLE. The load given (X_t - X_(t-1)) is the counter's recursion, undone by the window on Gamma_(t-2).
// The light beat is shapedBeat with the bucket's digits added, undone by its inverse. The caller supplies the
// source increment on the way back.
//
// Integers only: no float, no trig, no rounding.

import type { HuskEngine } from '@/code/rule/trit-husk'
import { emptyShaped, shapedFlux, type ShapedState } from '@/code/rule/trit-husk-shaped'
import type { HuskGeometry } from '@/code/rule/trit-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type PolarizedState = ShapedState & {
  // per husk link: the bucket Gamma_t and Gamma_(t-1), in units q^-L
  readonly bucket: Int32Array
  readonly bucketLag: Int32Array
}

export function emptyPolarized(geometry: HuskGeometry, levels: number): PolarizedState {
  return { ...emptyShaped(geometry, levels), bucket: new Int32Array(geometry.huskLinks), bucketLag: new Int32Array(geometry.huskLinks) }
}

export function copyPolarized(s: PolarizedState): PolarizedState {
  return {
    angle: Int32Array.from(s.angle),
    potential: Int32Array.from(s.potential),
    counter: Int32Array.from(s.counter),
    lag: Int32Array.from(s.lag),
    spatial: Int32Array.from(s.spatial),
    string: Int32Array.from(s.string),
    upper: s.upper.map(a => Int32Array.from(a)),
    upperLag: s.upperLag.map(a => Int32Array.from(a)),
    bucket: Int32Array.from(s.bucket),
    bucketLag: Int32Array.from(s.bucketLag),
  }
}

export function polarizedArrays(s: PolarizedState): Int32Array[] {
  return [s.angle, s.potential, s.counter, s.lag, s.spatial, s.string, ...s.upper, ...s.upperLag, s.bucket, s.bucketLag]
}

// q^L, and the bucket window H
export const bucketScale = (engine: HuskEngine, levels: number): number => engine.q ** levels

// the source the state holds: X_t = q^L S_t - Gamma_t + Gamma_(t-1)
export function loadedSource(engine: HuskEngine, s: PolarizedState, levels: number, out: Int32Array): void {
  const scale = bucketScale(engine, levels)

  for (let l = 0; l < out.length; l++) out[l] = scale * s.string[l]! - s.bucket[l]! + s.bucketLag[l]!
}

export type LoadTally = { crossings: number; carried: number; maxBucket: number }

// load the next source X_t (per husk link) given the one the state holds; returns crossings made
export function load(engine: HuskEngine, s: PolarizedState, levels: number, next: Int32Array, tally?: LoadTally): void {
  const scale = bucketScale(engine, levels)
  const half = (scale - 1) / 2

  for (let l = 0; l < next.length; l++) {
    const now = scale * s.string[l]! - s.bucket[l]! + s.bucketLag[l]!
    const drive = 2 * s.bucket[l]! - s.bucketLag[l]! - (next[l]! - now)
    // Gamma_t = drive + scale n in -half .. half
    const n = -floorDiv(drive + half, scale)
    const gamma = drive + scale * n

    s.bucketLag[l] = s.bucket[l]!
    s.bucket[l] = gamma
    s.string[l] = s.string[l]! + n

    if (tally) {
      if (n !== 0) {
        tally.crossings++
        tally.carried += Math.abs(n)
      }

      tally.maxBucket = Math.max(tally.maxBucket, Math.abs(gamma))
    }
  }
}

// the inverse of load: `previous` is X_(t-1), the source before the load
export function unload(engine: HuskEngine, s: PolarizedState, levels: number, previous: Int32Array): void {
  const scale = bucketScale(engine, levels)
  const half = (scale - 1) / 2

  for (let l = 0; l < previous.length; l++) {
    const now = scale * s.string[l]! - s.bucket[l]! + s.bucketLag[l]!
    // Gamma_(t-2) = 2 Gamma_(t-1) - Gamma_t + q^L n - (X_t - X_(t-1)), in -half .. half
    const drive = 2 * s.bucketLag[l]! - s.bucket[l]! - (now - previous[l]!)
    const n = -floorDiv(drive + half, scale)
    const older = drive + scale * n

    s.bucket[l] = s.bucketLag[l]!
    s.bucketLag[l] = older
    s.string[l] = s.string[l]! - n
  }
}

// the bucket's balanced base-q digits, G_1 (most significant) .. G_L, per husk link
export function bucketDigits(engine: HuskEngine, s: PolarizedState, levels: number, out: Int32Array[]): void {
  const q = engine.q
  const h = engine.depth

  for (let l = 0; l < s.bucket.length; l++) {
    let x = s.bucket[l]!

    for (let i = levels; i >= 1; i--) {
      const r = mod(x + h, q) - h

      out[i - 1]![l] = r
      x = (x - r) / q
    }

    if (x !== 0) throw new Error('a bucket left its window')
  }
}

export type PolarizedScratch = { flux: Int32Array; field: Int32Array; curl: Int32Array[]; s: Int32Array[]; digits: Int32Array[] }

export function makePolarizedScratch(geometry: HuskGeometry, levels: number): PolarizedScratch {
  return {
    flux: new Int32Array(geometry.huskLinks),
    field: new Int32Array(geometry.triangles),
    curl: Array.from({ length: levels }, () => new Int32Array(geometry.huskLinks)),
    s: Array.from({ length: levels }, () => new Int32Array(geometry.triangles)),
    digits: Array.from({ length: levels }, () => new Int32Array(geometry.huskLinks)),
  }
}

function curlWeighted(g: HuskGeometry, x: Int32Array, p: number): number {
  const b = p * 3
  const l0 = g.triLinks[b]!
  const l1 = g.triLinks[b + 1]!
  const l2 = g.triLinks[b + 2]!

  return g.triSigns[b]! * g.weight[l0 % 9]! * x[l0]! + g.triSigns[b + 1]! * g.weight[l1 % 9]! * x[l1]! + g.triSigns[b + 2]! * g.weight[l2 % 9]! * x[l2]!
}

// out = C^T x - digit
function curlTMinus(g: HuskGeometry, x: Int32Array, digit: Int32Array, out: Int32Array): void {
  for (let l = 0; l < out.length; l++) out[l] = -digit[l]!

  for (let p = 0; p < g.triangles; p++) {
    const v = x[p]!

    if (v === 0) continue

    const b = p * 3

    for (let j = b; j < b + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! + g.triSigns[j]! * v
  }
}

const levelNow = (s: ShapedState, i: number): Int32Array => (i === 1 ? s.counter : s.upper[i - 2]!)
const levelLag = (s: ShapedState, i: number): Int32Array => (i === 1 ? s.lag : s.upperLag[i - 2]!)

function fields(engine: HuskEngine, s: ShapedState, out: Int32Array): void {
  const g = engine.geometry
  const nb = engine.nb

  for (let p = 0; p < g.triangles; p++) out[p] = mod(curlWeighted(g, s.angle, p) + nb / 2, nb) - nb / 2
}

function spatialTerms(engine: HuskEngine, s: PolarizedState, scratch: PolarizedScratch, levels: number, lagged: boolean): void {
  const g = engine.geometry

  bucketDigits(engine, s, levels, scratch.digits)

  for (let i = 1; i <= levels; i++) {
    const curl = scratch.curl[i - 1]!
    const out = scratch.s[i - 1]!

    curlTMinus(g, lagged ? levelLag(s, i) : levelNow(s, i), scratch.digits[i - 1]!, curl)

    for (let p = 0; p < g.triangles; p++) out[p] = g.multiplicity[p]! * engine.p * curlWeighted(g, curl, p)
  }
}

// one beat of the light, in place (the load is separate)
export function polarizedBeat(engine: HuskEngine, s: PolarizedState, scratch: PolarizedScratch, levels: number): void {
  const g = engine.geometry
  const { depth: h, p: pp, q } = engine

  shapedFlux(engine, s, false, scratch.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const n = l % 9 < 3 ? 4 * h : 2 * h

    s.angle[l] = mod(s.angle[l]! + scratch.flux[l]! + n / 2, n) - n / 2
  }

  fields(engine, s, scratch.field)
  spatialTerms(engine, s, scratch, levels, false)

  for (let p = 0; p < g.triangles; p++) {
    const top = scratch.s[levels - 1]![p]!
    let w = floorDiv(top + s.spatial[p]! + h, q)

    s.spatial[p] = top + s.spatial[p]! - q * w

    for (let i = levels; i >= 2; i--) {
      const now = levelNow(s, i)
      const lag = levelLag(s, i)
      const rest = scratch.s[i - 2]![p]! - 2 * now[p]! + lag[p]! + w
      const v = floorDiv(rest + h, q)

      lag[p] = now[p]!
      now[p] = q * v - rest
      w = v
    }

    const n = g.multiplicity[p]!
    const rest = n * pp * scratch.field[p]! - 2 * s.counter[p]! + s.lag[p]! + w
    const k = floorDiv(rest + h, q)

    s.lag[p] = s.counter[p]!
    s.counter[p] = q * k - rest

    const win = n * h

    s.potential[p] = mod(s.potential[p]! + k + win, 2 * win + 1) - win
  }
}

export function polarizedBeatBack(engine: HuskEngine, s: PolarizedState, scratch: PolarizedScratch, levels: number): void {
  const g = engine.geometry
  const { depth: h, p: pp, q } = engine

  fields(engine, s, scratch.field)
  spatialTerms(engine, s, scratch, levels, true)

  for (let p = 0; p < g.triangles; p++) {
    const top = scratch.s[levels - 1]![p]!
    const r = s.spatial[p]!
    let w = floorDiv(top - r + h, q)

    s.spatial[p] = r - top + q * w

    for (let i = levels; i >= 2; i--) {
      const now = levelNow(s, i)
      const lag = levelLag(s, i)
      const y = now[p]! + scratch.s[i - 2]![p]! - 2 * lag[p]! + w
      const v = floorDiv(y + h, q)

      now[p] = lag[p]!
      lag[p] = q * v - y
      w = v
    }

    const n = g.multiplicity[p]!
    const y = s.counter[p]! + n * pp * scratch.field[p]! - 2 * s.lag[p]! + w
    const k = floorDiv(y + h, q)

    s.counter[p] = s.lag[p]!
    s.lag[p] = q * k - y

    const win = n * h

    s.potential[p] = mod(s.potential[p]! - k + win, 2 * win + 1) - win
  }

  shapedFlux(engine, s, false, scratch.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const n = l % 9 < 3 ? 4 * h : 2 * h

    s.angle[l] = mod(s.angle[l]! - scratch.flux[l]! + n / 2, n) - n / 2
  }
}
