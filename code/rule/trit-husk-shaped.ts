// The husk integer light with its carries shaped to any depth (E-FRC-0214): the wave form of E-FRC-0185 /
// 0205 applied level after level, so the carry noise that heats the light after a charge's hop falls by q^2
// per level. One level is exactly code/rule/trit-husk's fastBeat.
//
// WHERE THE HEATING COMES FROM (derived before any run). The wave form pays the kick
//   q k = n p B + D_(t+1) - 2 D_t + D_(t-1) + V,     V = floor((s + R + h) / q),  s = n p (C W C^T D_t)_P
// with D the carried counter (d = D / q) and R the spatial counter's remainder, both in -h .. h, h = D (the
// depth), q = 2h + 1. Writing V = s / q + (R_t - R_(t+1)) / q, the shadow
//   A~_(t+1) = A_(t+1) + C^T d_t,   U~_t = U_t - (d_t - d_(t-1)) + R_t / q^2
// runs the linear leapfrog's kick exactly, and its drift is
//   A~_(t+1) - A~_t = S - C^T U~_t + C^T R_t / q^2
// The last term is not a difference, so it does not telescope: every beat it pushes the shadow angle by up
// to 1 / (2q) per triangle wherever the counters are awake, the shadow angle random-walks, and the light's
// energy grows linearly in time and in the awake volume, at a rate of order (pi / D) kappa / q^2 ~ D^-4. A
// unit hop wakes the counters along its whole radiated front while its own field is small, so the noise
// dominates it (E-FRC-0211: 61 times linear at D = 16). A free wave heats at the same volume rate
// (tmp/hop-probe5.log: side 8, D 16, energy 317 -> 364 in 400 beats): the hop is not the cause.
//
// THE FIX: shape the spatial carry as the first one, and repeat. With L levels, counters C_1 .. C_L (each
// with its lag) and one final first-order remainder R:
//   W_(L+1) = floor((s_L + R + h) / q),  R <- s_L + R - q W_(L+1)
//   for i = L .. 2:  q W_i = s_(i-1) + C_i(t+1) - 2 C_i(t) + C_i(t-1) + W_(i+1)
//   q k = n p B + C_1(t+1) - 2 C_1(t) + C_1(t-1) + W_2
// with s_i = n p (C W C^T C_i(t))_P. Each C_i(t+1) is the unique value in -h .. h that makes the line an
// identity (a window of q integers holds one multiple of q). The carried fraction is f = sum C_i / q^i, and
//   k = (n p / q)(B + C W C^T f_t) + (f_(t+1) - 2 f_t + f_(t-1)) + (R_t - R_(t+1)) / q^(L+1)
// so the shadow A~ = A + C^T f_t, U~ = U - (f_t - f_(t-1)) + R / q^(L+1) runs the linear leapfrog with a drift
// residual C^T R / q^(L+1), bounded by 1 / (2 q^L) per triangle. The heating falls by q^2 per level.
//
// THE CYCLIC POTENTIAL (option). The potential column is a window of n_P D; a static magnetic field drives U
// by n p B / q every beat forever (dE = 0 needs only C^T dU = 0), so U reaches its window and wraps, and a
// wrap jumps the flux by (2 n_P D + 1) C^T on three links (E-FRC-0213: 20,887 wraps in 1,200 beats around one
// static loop). With `cyclic`, every potential is a cycling number mod q (a column of D trits, as a counter)
// and the flux is read centered mod q, E = centered(S - C^T U): a wrap of U by q changes nothing the rule
// reads. The electric flux is then Z_q, exact while every |E| < q / 2.
//
// Counters per husk triangle: 2 L + 1, each a cycling number in -h .. h, the range of a column of h = D trits
// (the thermometer code of code/rule/trit-column).
//
// Integers only: no float, no trig, no rounding.

import type { HuskLightState } from '@/code/rule/trit-column'
import type { HuskEngine, HuskGeometry } from '@/code/rule/trit-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

// the husk state with the shaped levels. `counter` and `lag` are level 1, `upper[i]` and `upperLag[i]` are
// level i + 2, and `spatial` holds the final remainder R
export type ShapedState = HuskLightState & {
  readonly upper: Int32Array[]
  readonly upperLag: Int32Array[]
}

export type ShapedOptions = { levels: number; cyclic: boolean }

export function emptyShaped(geometry: HuskGeometry, levels: number): ShapedState {
  const n = geometry.triangles

  return {
    angle: new Int32Array(geometry.huskLinks),
    potential: new Int32Array(n),
    counter: new Int32Array(n),
    lag: new Int32Array(n),
    spatial: new Int32Array(n),
    string: new Int32Array(geometry.huskLinks),
    upper: Array.from({ length: levels - 1 }, () => new Int32Array(n)),
    upperLag: Array.from({ length: levels - 1 }, () => new Int32Array(n)),
  }
}

export function copyShaped(s: ShapedState): ShapedState {
  return {
    angle: Int32Array.from(s.angle),
    potential: Int32Array.from(s.potential),
    counter: Int32Array.from(s.counter),
    lag: Int32Array.from(s.lag),
    spatial: Int32Array.from(s.spatial),
    string: Int32Array.from(s.string),
    upper: s.upper.map(a => Int32Array.from(a)),
    upperLag: s.upperLag.map(a => Int32Array.from(a)),
  }
}

// every array of a shaped state, for comparisons
export function shapedArrays(s: ShapedState): Int32Array[] {
  return [s.angle, s.potential, s.counter, s.lag, s.spatial, s.string, ...s.upper, ...s.upperLag]
}

// scratch for one engine, allocated once
export type ShapedScratch = { flux: Int32Array; field: Int32Array; curl: Int32Array[]; s: Int32Array[] }

export function makeShapedScratch(geometry: HuskGeometry, levels: number): ShapedScratch {
  return {
    flux: new Int32Array(geometry.huskLinks),
    field: new Int32Array(geometry.triangles),
    curl: Array.from({ length: levels }, () => new Int32Array(geometry.huskLinks)),
    s: Array.from({ length: levels }, () => new Int32Array(geometry.triangles)),
  }
}

function curlWeighted(g: HuskGeometry, x: Int32Array, p: number): number {
  const b = p * 3
  const l0 = g.triLinks[b]!
  const l1 = g.triLinks[b + 1]!
  const l2 = g.triLinks[b + 2]!

  return g.triSigns[b]! * g.weight[l0 % 9]! * x[l0]! + g.triSigns[b + 1]! * g.weight[l1 % 9]! * x[l1]! + g.triSigns[b + 2]! * g.weight[l2 % 9]! * x[l2]!
}

// out = C^T x
function curlT(g: HuskGeometry, x: Int32Array, out: Int32Array): void {
  out.fill(0)

  for (let p = 0; p < g.triangles; p++) {
    const v = x[p]!

    if (v === 0) continue

    const b = p * 3

    for (let j = b; j < b + 3; j++) {
      const l = g.triLinks[j]!

      out[l] = out[l]! + g.triSigns[j]! * v
    }
  }
}

// out = S - C^T U, centered mod q when the potential is cyclic
export function shapedFlux(engine: HuskEngine, s: HuskLightState, cyclic: boolean, out: Int32Array): void {
  const g = engine.geometry

  out.set(s.string)

  for (let p = 0; p < g.triangles; p++) {
    const u = s.potential[p]!

    if (u === 0) continue

    const b = p * 3

    for (let j = b; j < b + 3; j++) {
      const l = g.triLinks[j]!

      out[l] = out[l]! - g.triSigns[j]! * u
    }
  }

  if (cyclic) {
    const q = engine.q
    const h = engine.depth

    for (let l = 0; l < g.huskLinks; l++) out[l] = mod(out[l]! + h, q) - h
  }
}

function fields(engine: HuskEngine, s: ShapedState, out: Int32Array): void {
  const g = engine.geometry
  const nb = engine.nb
  const half = nb / 2

  for (let p = 0; p < g.triangles; p++) out[p] = mod(curlWeighted(g, s.angle, p) + half, nb) - half
}

// the level-i counters (i = 1 .. L) at time t, in the state as it stands
const levelNow = (s: ShapedState, i: number): Int32Array => (i === 1 ? s.counter : s.upper[i - 2]!)
const levelLag = (s: ShapedState, i: number): Int32Array => (i === 1 ? s.lag : s.upperLag[i - 2]!)

function potentialWrap(engine: HuskEngine, cyclic: boolean, n: number, u: number): number {
  const h = engine.depth

  if (cyclic) return mod(u + h, engine.q) - h

  const w = n * h

  return mod(u + w, 2 * w + 1) - w
}

// one beat, in place
export function shapedBeat(engine: HuskEngine, s: ShapedState, scratch: ShapedScratch, options: ShapedOptions): void {
  const g = engine.geometry
  const { depth: h, p: pp, q } = engine
  const levels = options.levels

  shapedFlux(engine, s, options.cyclic, scratch.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const n = l % 9 < 3 ? 4 * h : 2 * h

    s.angle[l] = mod(s.angle[l]! + scratch.flux[l]! + n / 2, n) - n / 2
  }

  fields(engine, s, scratch.field)

  // every level's spatial term, read before any counter changes
  for (let i = 1; i <= levels; i++) {
    const curl = scratch.curl[i - 1]!
    const out = scratch.s[i - 1]!

    curlT(g, levelNow(s, i), curl)

    for (let p = 0; p < g.triangles; p++) out[p] = g.multiplicity[p]! * pp * curlWeighted(g, curl, p)
  }

  for (let p = 0; p < g.triangles; p++) {
    // the last level: a first-order carry of s_L / q
    const top = scratch.s[levels - 1]![p]!
    let w = floorDiv(top + s.spatial[p]! + h, q)

    s.spatial[p] = top + s.spatial[p]! - q * w

    // levels L .. 2
    for (let i = levels; i >= 2; i--) {
      const now = levelNow(s, i)
      const lag = levelLag(s, i)
      const rest = scratch.s[i - 2]![p]! - 2 * now[p]! + lag[p]! + w
      const v = floorDiv(rest + h, q)

      lag[p] = now[p]!
      now[p] = q * v - rest
      w = v
    }

    // level 1: the kick
    const n = g.multiplicity[p]!
    const rest = n * pp * scratch.field[p]! - 2 * s.counter[p]! + s.lag[p]! + w
    const k = floorDiv(rest + h, q)

    s.lag[p] = s.counter[p]!
    s.counter[p] = q * k - rest
    s.potential[p] = potentialWrap(engine, options.cyclic, n, s.potential[p]! + k)
  }
}

// the inverse of shapedBeat
export function shapedBeatBack(engine: HuskEngine, s: ShapedState, scratch: ShapedScratch, options: ShapedOptions): void {
  const g = engine.geometry
  const { depth: h, p: pp, q } = engine
  const levels = options.levels

  fields(engine, s, scratch.field)

  // the forward step read every C_i(t), which are now the lags
  for (let i = 1; i <= levels; i++) {
    const curl = scratch.curl[i - 1]!
    const out = scratch.s[i - 1]!

    curlT(g, levelLag(s, i), curl)

    for (let p = 0; p < g.triangles; p++) out[p] = g.multiplicity[p]! * pp * curlWeighted(g, curl, p)
  }

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
    s.potential[p] = potentialWrap(engine, options.cyclic, n, s.potential[p]! - k)
  }

  shapedFlux(engine, s, options.cyclic, scratch.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const n = l % 9 < 3 ? 4 * h : 2 * h

    s.angle[l] = mod(s.angle[l]! - scratch.flux[l]! + n / 2, n) - n / 2
  }
}
