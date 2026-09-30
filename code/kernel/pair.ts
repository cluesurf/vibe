// THE REGISTER PAIR CYCLE ON A KERNEL: register-ball-reduced's ballCycle and register-reduced's reducedCycle (the same
// two beats, plus the vector form's cross pieces), their Gram metric, inner product, filter and autocorrelation, each
// written as the same sequence of steps the engine runs, with every loop a kernel primitive. code/kernel/
//
// The engines' tables are flattened once (pairTablesOfBall, pairTablesOfReduced) into the kernel's PairTables. A step
// here does exactly what the engine's step does to exactly the same arrays, in the same order, so on the js backend it
// is the engine restated, and on every other backend it is byte for byte the engine (task/kernel/check.ts runs both and
// compares every byte of the state after whole cycles). The engine's own scratch fields (e.t) are reused, so a fast
// engine takes no more memory than a plain one.
//
// Only types are imported from the engines, so an engine can import this file without a cycle.

import type { Kernel, PairOp, PairTables } from '@/code/kernel/types'
import type { BallEngine } from '@/code/measure/register-ball-reduced'
import { blackmanHarris, type SparseEight } from '@/code/measure/register-meson'
import type { ReducedEngine } from '@/code/measure/register-reduced'

const PAIR = 64
const SITE = 256
const NR = 24
const A = 0
const B = 64
const X = 128
const D = 192

export type PairState = { re: Float64Array; im: Float64Array }

export type FastPair = {
  k: Kernel
  op: PairOp
  N: number
  u: readonly [number, number]
  beta1: Float64Array
  beta2: Float64Array
  // register-reduced's vector form: the cross pieces' factor per representative (null: the scalar or ball cycle)
  cross: Float64Array | null
  orbit: Float64Array
  // the engine's twelve scratch fields, N * 64 each
  t: Float64Array[]
  partRe: Float64Array
  partIm: Float64Array
  // the inner product's two Gram states, made on first use
  gram?: PairState[]
}

// ---- the tables ----

function pack(mats: readonly SparseEight[]): { off: Int32Array; row: Int8Array; col: Int8Array; val: Float64Array } {
  const off = new Int32Array(NR + 1)

  let n = 0

  mats.forEach((m, d) => {
    off[d] = n
    n += m.val.length
  })
  off[NR] = n

  const row = new Int8Array(n)
  const col = new Int8Array(n)
  const val = new Float64Array(n)

  mats.forEach((m, d) => {
    row.set(m.row, off[d])
    col.set(m.col, off[d])
    val.set(m.val, off[d])
  })

  return { off, row, col, val }
}

export function pairTablesOfBall(e: BallEngine): PairTables {
  const s = e.s
  const els = s.group.elements
  const src = new Int16Array(els.length * 4 * PAIR)
  const sgn = new Int8Array(els.length * 4 * PAIR)

  els.forEach((el, g) => {
    for (let t = 0; t < 4; t++) {
      src.set(el.src[t]!, (g * 4 + t) * PAIR)
      sgn.set(el.sgn[t]!, (g * 4 + t) * PAIR)
    }
  })

  const c = pack(e.C)
  const ct = pack(e.CT)

  return {
    plusRep: Int32Array.from(s.plusRep),
    plusG: Int32Array.from(s.plusG),
    minusRep: Int32Array.from(s.minusRep),
    minusG: Int32Array.from(s.minusG),
    src,
    sgn,
    off: c.off,
    row: c.row,
    col: c.col,
    val: c.val,
    offT: ct.off,
    rowT: ct.row,
    colT: ct.col,
    valT: ct.val,
    halfRe: Float64Array.from(e.halfRe),
    halfIm: Float64Array.from(e.halfIm),
  }
}

export function pairTablesOfReduced(e: ReducedEngine): PairTables {
  const s = e.s
  const f = e.flat

  return {
    plusRep: Int32Array.from(s.plusRep),
    plusG: Int32Array.from(s.plusG),
    minusRep: Int32Array.from(s.minusRep),
    minusG: Int32Array.from(s.minusG),
    src: Int16Array.from(f.src),
    sgn: Int8Array.from(f.sgn),
    off: Int32Array.from(f.off),
    row: Int8Array.from(f.row),
    col: Int8Array.from(f.col),
    val: Float64Array.from(f.val),
    offT: Int32Array.from(f.offT),
    rowT: Int8Array.from(f.rowT),
    colT: Int8Array.from(f.colT),
    valT: Float64Array.from(f.valT),
    halfRe: Float64Array.from(e.halfRe),
    halfIm: Float64Array.from(e.halfIm),
  }
}

// the scratch fields: the engine's own, or (a backend with its own memory) twelve of the backend's, so no call copies
const scratch = (k: Kernel, own: Float64Array[], N: number): Float64Array[] =>
  k.alloc ? Array.from({ length: 12 }, () => k.alloc!(N * PAIR)) : own

// a per-representative array, on the backend's memory when it has one
const perRep = (k: Kernel, N: number, from?: Float64Array): Float64Array => {
  const out = k.alloc ? k.alloc(N) : new Float64Array(N)

  if (from) {
    out.set(from)
  }

  return out
}

export function fastBall(e: BallEngine, k: Kernel): FastPair {
  const N = e.s.count

  return {
    k,
    op: k.pairOp(pairTablesOfBall(e)),
    N,
    u: e.params.u,
    beta1: k.alloc ? perRep(k, 2 * N, e.beta1) : e.beta1,
    beta2: k.alloc ? perRep(k, 2 * N, e.beta2) : e.beta2,
    cross: null,
    orbit: e.s.orbit,
    t: scratch(k, e.t, N),
    partRe: perRep(k, N),
    partIm: perRep(k, N),
  }
}

export function fastReduced(e: ReducedEngine, k: Kernel): FastPair {
  const N = e.s.count
  const cross = e.form === 'vector' ? e.cross : null

  return {
    k,
    op: k.pairOp(pairTablesOfReduced(e)),
    N,
    u: e.u,
    beta1: k.alloc ? perRep(k, 2 * N, e.beta1) : e.beta1,
    beta2: k.alloc ? perRep(k, 2 * N, e.beta2) : e.beta2,
    cross: cross && k.alloc ? perRep(k, 2 * N, cross) : cross,
    orbit: e.s.orbit,
    t: scratch(k, e.t, N),
    partRe: perRep(k, N),
    partIm: perRep(k, N),
  }
}

// ---- the cycle ----

type T12 = [
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
  Float64Array,
]

// ballCycle's (and register-reduced beats') two beats, in place
function fastBeats(f: FastPair, st: PairState): void {
  const { k, op } = f
  const [ur, ui] = f.u
  const [t1r, t1i, t2r, t2i, er, ei, , , fr, fi, gr, gi] = f.t as T12

  k.conv(op, st.re, st.im, X, SITE, 2, t1r, t1i, 1, false)
  k.conv(op, st.re, st.im, B, SITE, 1, t2r, t2i, 2, false)
  k.conv(op, st.re, st.im, D, SITE, 3, er, ei, 2, false)
  k.conv(op, er, ei, 0, PAIR, 2, fr, fi, 1, false)
  k.conv(op, st.re, st.im, D, SITE, 3, gr, gi, 1, false)
  k.pairBeat(st.re, st.im, t1r, t1i, t2r, t2i, fr, fi, gr, gi, er, ei, f.beta1, ur - 1, ui, 0)

  k.conv(op, st.re, st.im, B, SITE, 1, t1r, t1i, 1, true)
  k.conv(op, st.re, st.im, X, SITE, 2, t2r, t2i, 2, true)
  k.conv(op, st.re, st.im, A, SITE, 0, er, ei, 2, true)
  k.conv(op, er, ei, 0, PAIR, 1, fr, fi, 1, true)
  k.conv(op, st.re, st.im, A, SITE, 0, gr, gi, 1, true)
  k.pairBeat(st.re, st.im, t1r, t1i, t2r, t2i, fr, fi, er, ei, gr, gi, f.beta2, ur - 1, -ui, 192)
}

// register-reduced crossPiece (projection and update fused)
function fastCross(f: FastPair, st: PairState, kind: 'SD' | 'DS'): void {
  const { k, op } = f
  const [t1r, t1i, t2r, t2i, t3r, t3i, t4r, t4i] = f.t as T12

  if (kind === 'SD') {
    k.conv(op, st.re, st.im, D, SITE, 3, t1r, t1i, 1, false)
    k.conv(op, st.re, st.im, A, SITE, 0, t2r, t2i, 2, true)
    k.conv(op, st.re, st.im, X, SITE, 2, t3r, t3i, 1, false)
    k.conv(op, t3r, t3i, 0, PAIR, 0, t4r, t4i, 2, true)
    k.crossApply(st.re, st.im, t1r, t1i, t2r, t2i, t4r, t4i, f.cross!, B)
  } else {
    k.conv(op, st.re, st.im, A, SITE, 0, t1r, t1i, 1, true)
    k.conv(op, st.re, st.im, D, SITE, 3, t2r, t2i, 2, false)
    k.conv(op, st.re, st.im, B, SITE, 1, t3r, t3i, 1, true)
    k.conv(op, t3r, t3i, 0, PAIR, 3, t4r, t4i, 2, false)
    k.crossApply(st.re, st.im, t1r, t1i, t2r, t2i, t4r, t4i, f.cross!, X)
  }
}

// ONE CYCLE, in place: ballCycle, or reducedCycle (the beats, then P_SD and P_DS in the vector form)
export function fastCycle(f: FastPair, st: PairState): void {
  fastBeats(f, st)

  if (f.cross) {
    fastCross(f, st, 'SD')
    fastCross(f, st, 'DS')
  }
}

// ---- the metric ----

// zeros for an array like `a`: on the backend's memory when it has one, else on the same kind of buffer as `a`
// (register-reduced keeps its states on shared memory for its worker pool)
const zerosLike = (k: Kernel | null, a: Float64Array): Float64Array =>
  k?.alloc
    ? k.alloc(a.length)
    : a.buffer instanceof SharedArrayBuffer
      ? new Float64Array(new SharedArrayBuffer(a.byteLength))
      : new Float64Array(a.length)

const cloneF64 = (k: Kernel | null, a: Float64Array): Float64Array => {
  const out = zerosLike(k, a)

  out.set(a)

  return out
}

export const cloneState = (x: PairState): PairState => ({ re: cloneF64(null, x.re), im: cloneF64(null, x.im) })

// a copy of a state that the fast engine's backend reads with no copy (for a backend with its own memory; for the
// others, a plain copy)
export const adopt = (f: FastPair, x: PairState): PairState => ({ re: cloneF64(f.k, x.re), im: cloneF64(f.k, x.im) })

// G st into two given states (g1 and g2 are overwritten; the result is g2): ballGram's steps, its clones written as
// copies into the given arrays, which are the same values
function gramInto(f: FastPair, st: PairState, g1: PairState, g2: PairState): PairState {
  const { k, op } = f
  const [xr, xi, yr, yi] = f.t as T12

  g1.re.set(st.re)
  g1.im.set(st.im)
  k.conv(op, st.re, st.im, X, SITE, 2, xr, xi, 1, false)
  k.blockAdd(g1.re, g1.im, xr, xi, A)
  k.conv(op, st.re, st.im, D, SITE, 3, xr, xi, 1, false)
  k.blockAdd(g1.re, g1.im, xr, xi, B)
  k.conv(op, st.re, st.im, A, SITE, 0, xr, xi, 1, true)
  k.blockAdd(g1.re, g1.im, xr, xi, X)
  k.conv(op, st.re, st.im, B, SITE, 1, xr, xi, 1, true)
  k.blockAdd(g1.re, g1.im, xr, xi, D)
  g2.re.set(g1.re)
  g2.im.set(g1.im)
  k.conv(op, g1.re, g1.im, B, SITE, 1, yr, yi, 2, false)
  k.blockAdd(g2.re, g2.im, yr, yi, A)
  k.conv(op, g1.re, g1.im, D, SITE, 3, yr, yi, 2, false)
  k.blockAdd(g2.re, g2.im, yr, yi, X)
  k.conv(op, g1.re, g1.im, A, SITE, 0, yr, yi, 2, true)
  k.blockAdd(g2.re, g2.im, yr, yi, B)
  k.conv(op, g1.re, g1.im, X, SITE, 2, yr, yi, 2, true)
  k.blockAdd(g2.re, g2.im, yr, yi, D)

  return g2
}

// G st: member 1 then member 2, ballGram and reducedGram (a new state, as they return)
export const fastGram = (f: FastPair, st: PairState): PairState => gramInto(f, st, adopt(f, st), adopt(f, st))

// <a | G b>, the orbit-weighted sum: the local products per representative on the kernel, then summed here in order.
// The Gram goes into two states the fast engine keeps, so an autocorrelation of thousands of lags allocates nothing
export function fastInner(f: FastPair, a: PairState, b: PairState): [number, number] {
  f.gram ??= [adopt(f, b), adopt(f, b)]

  const gb = gramInto(f, b, f.gram[0]!, f.gram[1]!)

  f.k.blockInner(a.re, a.im, gb.re, gb.im, f.partRe, f.partIm)

  let re = 0
  let im = 0

  for (let i = 0; i < f.N; i++) {
    const w = f.orbit[i]!

    re += w * f.partRe[i]!
    im += w * f.partIm[i]!
  }

  return [re, im]
}

export const fastNorm2 = (f: FastPair, st: PairState): number => fastInner(f, st, st)[0]

// ballFilter and reducedFilter: v = sum_s w(s) e^(-i phase s) U^s psi (Blackman-Harris over S cycles)
export function fastFilter(f: FastPair, psi: PairState, phase: number, S: number): PairState {
  const out: PairState = { re: zerosLike(f.k, psi.re), im: zerosLike(f.k, psi.im) }
  const st = adopt(f, psi)

  for (let k = 0; k < S; k++) {
    const w = blackmanHarris(k, S)

    f.k.axpy(out.re, out.im, st.re, st.im, w * Math.cos(-phase * k), w * Math.sin(-phase * k))
    fastCycle(f, st)
  }

  return out
}

// reducedRead and ballRead: lambda = <v | G U v> / <v | G v> and the residual |U v - lambda v|_G / |v|_G
export function fastRead(
  f: FastPair,
  v: PairState,
): { lambda: [number, number]; phase: number; residual: number } {
  const n = fastNorm2(f, v)
  const Uv = adopt(f, v)

  fastCycle(f, Uv)

  const [lr, li] = fastInner(f, v, Uv).map(x => x / n) as [number, number]
  const r = adopt(f, Uv)

  f.k.axpy(r.re, r.im, v.re, v.im, -lr, -li)

  return {
    lambda: [lr, li],
    phase: Math.atan2(li, lr),
    residual: Math.sqrt(fastNorm2(f, r) / n),
  }
}

// register-reduced autocorrelation: c_l = <v | G U^l v>, l = 0 .. N
export function fastAutocorrelation(f: FastPair, v: PairState, N: number): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(N + 1)
  const im = new Float64Array(N + 1)
  const st = adopt(f, v)

  for (let l = 0; l <= N; l++) {
    const [r, i] = fastInner(f, v, st)

    re[l] = r
    im[l] = i

    if (l < N) {
      fastCycle(f, st)
    }
  }

  return { re, im }
}
