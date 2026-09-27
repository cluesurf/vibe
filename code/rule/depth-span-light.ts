// The spanned husk light: the husk light of code/measure/varying-depth-light with its carries shaped in levels
// (code/rule/trit-husk-shaped, E-FRC-0214), changed in ONE place. A deeper column has more docks, and that is two
// things, not one: more to MOVE (the kick divides by the column's count q = 2D + 1, already in the rule) and more to
// SPAN (a link across deeper columns is longer, and a longer link couples more weakly, as a longer spring is softer:
// its stiffness divided by the count it spans, missing until now). This rule adds the second.
//
// WHICH COUNT A LINK READS. A link joins two columns y and z; its count is their MEAN, Q_l = (q_y + q_z) / 2 =
// D_y + D_z + 1, an integer for any two depths (both counts are odd). It is symmetric in the two ends, so a link
// read from either end has one stiffness, and it is exactly q on a uniform medium. (The start column alone, as the
// angle windows use, is a half-step shift; the larger or smaller of the two is symmetric too but not the count of
// the docks the link spans.) Q_l is even where D_y + D_z is odd, and its remainder window is then -Q/2 .. Q/2 - 1:
// a choice of representative, disclosed, which breaks A -> -A only in the last carry on a depth boundary.
//
// WHERE THE DIVISION SITS, AND WHY IT IS GAUGE COVARIANT. Linearized, the light is A'' = -C^T K C W A with K =
// n_P p / q_P on triangles and W the link weight (1 axis, 2 diagonal). The change is W -> W / Q_l. Put on the kick
// (the field reads C W Q^(-1) A), a gauge map A -> A + lambda with W lambda = 2 grad eta would move the field by
// 2 C Q^(-1) grad eta, which is not 0 where Q varies: that placement is covariant only under a gauge map rescaled
// per link. Put on the DRIFT, it is covariant under the unchanged map: the link's register takes the flux divided
// by its count,
//   A~_(t+1) = A~_t + (S - C^T U~_t) / Q_l,      U~_(t+1) = U~_t + (n_P p / q_P) (C W A~_(t+1))_P
// and the kick reads the field C W A as before. The two placements are one operator up to the diagonal change of
// variables A2 = Q A (Q^(-1) C^T K C W and C^T K C W Q^(-1) are similar), so they are one medium: permittivity and
// permeability both proportional to q, an impedance-matched medium of index q, which is what the scalar wave of
// ds^2 = -(q0 / q) dt^2 + (q / q0) dx^2 is (code/rule/depth-clock-wave, metric form). kappa = 2 p / q^2.
//
// THE INTEGER RULE. Per link the register is a pair (A_l, r_l), the angle and a remainder in the window of Q_l: the
// mixed-radix digits of A2_l = Q_l A_l + r_l, which takes the flux whole each beat:
//   y = r_l + e_l,  c = floor((y + floor(Q_l / 2)) / Q_l),  r_l <- y - Q_l c,  A_l <- wrap(A_l + c)
// with e = S - C^T U. This division is EXACT: the shadow A~ = A + r / Q runs A~_(t+1) = A~_t + e / Q with nothing
// dropped (A2 is a plain sum of the fluxes). The angle windows 4D (axis), 2D (diagonal) and the field modulus 4D_P
// are the medium's, as before.
// The kick needs the field of the shadow, (C W A~)_P = (C W A)_P + (C W r / Q)_P. A triangle's three links can
// hold different counts on a depth boundary, so the kick reads each link's remainder in the TRIANGLE's own radix:
// its numerator is
//   N_P = n_P p (q_P B_P + (C W r)_P),     B_P = centered(C W A)_P mod 4 D_P
// divided by M_P = q_P^2, exactly as E-FRC-0214's shaped kick divides n_P p B_P by q (every level's counter in the
// window of M_P, half width h_M = (M_P - 1) / 2, the spatial term s_i = n_P p (C W C^T C_i)_P). On a uniform medium
// N_P = n_P p (C W A2)_P and the rule IS E-FRC-0214's shaped light run on A2 with q replaced by q^2: its shadow runs
// the linear leapfrog with kappa = 2 p / q^2 up to the last carry's residual, at most 1 / (2 M^L) per triangle. On a
// boundary triangle a link of count Q_l is read as if its count were q_P: a bounded error of at most
// |Q_l - q_P| / (2 q_P) in the angle it reads per link, each beat, not accumulated (the same kind as
// code/measure/varying-depth-light item 1, whose neighbor counters are also read in the triangle's own radix here).
// Making it exact needs a counter of modulus lcm(q_P, Q_l, Q_l') q_P: not a column's range, so not done.
// A counter level's window M_P = q^2 is two digits of range q: two columns of D trits, not one.
//
// REVERSIBLE. Every step is invertible given what it reads: the kick's levels as E-FRC-0214's (a window of M_P
// integers holds one multiple of M_P), and the link step because, given e (the potential restored first) and the new
// remainder r', the old remainder r = r' + Q c - e lies in the window of Q, so c = ceil((e - r' - floor(Q / 2)) /
// Q) is the unique quotient. spanBeatBack is the inverse, checked bit for bit by the callers.
// GAUSS. The flux S - C^T U is untouched, so its divergence is the charge for any U, as before.
//
// Integers only: no float, no rounding. DETERMINISM: nothing is drawn. NOTHING MOVES: each value takes its new value
// by the rule.

import type { HuskLightState } from '@/code/rule/trit-column'
import { makeMedium, type Medium, type Wraps } from '@/code/measure/varying-depth-light'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type SpanMedium = Medium & {
  // per link: Q_l = D_y + D_z + 1, the mean count of the two columns it joins
  readonly span: Int32Array
  // per triangle: q_P and M_P = q_P^2
  readonly count: Int32Array
  readonly square: Int32Array
}

export function makeSpanMedium(sides: readonly [number, number, number], depthAt: (x: number, y: number, z: number) => number, p = 1): SpanMedium {
  const base = makeMedium(sides, depthAt, p)
  const g = base.geometry
  const span = Int32Array.from({ length: g.huskLinks }, (_, l) => base.dockDepth[Math.floor(l / 9)]! + base.dockDepth[g.huskNeighbour[l]!]! + 1)
  const count = Int32Array.from(base.triDepth, d => 2 * d + 1)
  const square = Int32Array.from(count, q => q * q)

  return { ...base, span, count, square }
}

// the light's state with the shaped levels and the per-link remainder
export type SpanState = HuskLightState & {
  readonly upper: Int32Array[]
  readonly upperLag: Int32Array[]
  readonly remainder: Int32Array
}

export function emptySpan(m: SpanMedium, levels: number): SpanState {
  const g = m.geometry
  const n = g.triangles

  return {
    angle: new Int32Array(g.huskLinks),
    potential: new Int32Array(n),
    counter: new Int32Array(n),
    lag: new Int32Array(n),
    spatial: new Int32Array(n),
    string: new Int32Array(g.huskLinks),
    upper: Array.from({ length: levels - 1 }, () => new Int32Array(n)),
    upperLag: Array.from({ length: levels - 1 }, () => new Int32Array(n)),
    remainder: new Int32Array(g.huskLinks),
  }
}

export function copySpan(s: SpanState): SpanState {
  return {
    angle: Int32Array.from(s.angle),
    potential: Int32Array.from(s.potential),
    counter: Int32Array.from(s.counter),
    lag: Int32Array.from(s.lag),
    spatial: Int32Array.from(s.spatial),
    string: Int32Array.from(s.string),
    upper: s.upper.map(a => Int32Array.from(a)),
    upperLag: s.upperLag.map(a => Int32Array.from(a)),
    remainder: Int32Array.from(s.remainder),
  }
}

// every array of the state but the angle, for comparisons
export const spanRest = (s: SpanState): Int32Array[] => [s.potential, s.counter, s.lag, s.spatial, s.string, s.remainder, ...s.upper, ...s.upperLag]

export const sameSpan = (a: SpanState, b: SpanState): boolean => a.angle.every((v, i) => v === b.angle[i]) && spanRest(a).every((x, j) => x.every((v, i) => v === spanRest(b)[j]![i]))

export type SpanScratch = { flux: Int32Array; numerator: Int32Array; curl: Int32Array[]; spatial: Int32Array[] }

export function makeSpanScratch(m: SpanMedium, levels: number): SpanScratch {
  const g = m.geometry

  return {
    flux: new Int32Array(g.huskLinks),
    numerator: new Int32Array(g.triangles),
    curl: Array.from({ length: levels }, () => new Int32Array(g.huskLinks)),
    spatial: Array.from({ length: levels }, () => new Int32Array(g.triangles)),
  }
}

// out = S - C^T U
export function spanFlux(m: SpanMedium, s: SpanState, out: Int32Array): void {
  const g = m.geometry

  out.set(s.string)

  for (let p = 0; p < g.triangles; p++) {
    const u = s.potential[p]!

    if (u === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! - g.triSigns[j]! * u
  }
}

function curlWeighted(m: SpanMedium, x: Int32Array, p: number): number {
  const g = m.geometry
  const b = p * 3
  const l0 = g.triLinks[b]!
  const l1 = g.triLinks[b + 1]!
  const l2 = g.triLinks[b + 2]!

  return g.triSigns[b]! * g.weight[l0 % 9]! * x[l0]! + g.triSigns[b + 1]! * g.weight[l1 % 9]! * x[l1]! + g.triSigns[b + 2]! * g.weight[l2 % 9]! * x[l2]!
}

function curlT(m: SpanMedium, x: Int32Array, out: Int32Array): void {
  const g = m.geometry

  out.fill(0)

  for (let p = 0; p < g.triangles; p++) {
    const v = x[p]!

    if (v === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! + g.triSigns[j]! * v
  }
}

// the kick's numerator N_P = n_P p (q_P centered(C W A)_P + (C W r)_P), and the spatial terms of every level from
// the given counters (the counters now on the way forward, the lags on the way back)
function numerators(m: SpanMedium, s: SpanState, scratch: SpanScratch, levels: number, which: 'now' | 'lag', wraps?: Wraps): void {
  const g = m.geometry
  const pp = m.p

  for (let p = 0; p < g.triangles; p++) {
    const nb = 4 * m.triDepth[p]!
    const raw = curlWeighted(m, s.angle, p)
    const b = mod(raw + nb / 2, nb) - nb / 2

    if (wraps && b !== raw) wraps.field++
    scratch.numerator[p] = g.multiplicity[p]! * pp * (m.count[p]! * b + curlWeighted(m, s.remainder, p))
  }

  for (let i = 1; i <= levels; i++) {
    const c = which === 'now' ? (i === 1 ? s.counter : s.upper[i - 2]!) : i === 1 ? s.lag : s.upperLag[i - 2]!
    const curl = scratch.curl[i - 1]!
    const out = scratch.spatial[i - 1]!

    curlT(m, c, curl)

    for (let p = 0; p < g.triangles; p++) out[p] = g.multiplicity[p]! * pp * curlWeighted(m, curl, p)
  }
}

const levelNow = (s: SpanState, i: number): Int32Array => (i === 1 ? s.counter : s.upper[i - 2]!)
const levelLag = (s: SpanState, i: number): Int32Array => (i === 1 ? s.lag : s.upperLag[i - 2]!)

// one beat, in place
export function spanBeat(m: SpanMedium, s: SpanState, scratch: SpanScratch, levels: number, wraps?: Wraps): void {
  const g = m.geometry

  spanFlux(m, s, scratch.flux)

  // the link step: A2 = Q A + r takes the flux whole
  for (let l = 0; l < g.huskLinks; l++) {
    const q = m.span[l]!
    const y = s.remainder[l]! + scratch.flux[l]!
    const c = floorDiv(y + (q >> 1), q)

    s.remainder[l] = y - q * c

    if (c === 0) continue

    const n = m.linkWindow[l]!
    const raw = s.angle[l]! + c
    const v = mod(raw + n / 2, n) - n / 2

    if (wraps && v !== raw) wraps.angle++
    s.angle[l] = v
  }

  numerators(m, s, scratch, levels, 'now', wraps)

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    const h = (big - 1) / 2
    const top = scratch.spatial[levels - 1]![p]!
    let w = floorDiv(top + s.spatial[p]! + h, big)

    s.spatial[p] = top + s.spatial[p]! - big * w

    for (let i = levels; i >= 2; i--) {
      const now = levelNow(s, i)
      const lag = levelLag(s, i)
      const rest = scratch.spatial[i - 2]![p]! - 2 * now[p]! + lag[p]! + w
      const v = floorDiv(rest + h, big)

      lag[p] = now[p]!
      now[p] = big * v - rest
      w = v
    }

    const rest = scratch.numerator[p]! - 2 * s.counter[p]! + s.lag[p]! + w
    const k = floorDiv(rest + h, big)

    s.lag[p] = s.counter[p]!
    s.counter[p] = big * k - rest

    const window = g.multiplicity[p]! * h
    const raw = s.potential[p]! + k
    const u = mod(raw + window, 2 * window + 1) - window

    if (wraps && u !== raw) wraps.potential++
    s.potential[p] = u
  }
}

// the inverse beat
export function spanBeatBack(m: SpanMedium, s: SpanState, scratch: SpanScratch, levels: number): void {
  const g = m.geometry

  numerators(m, s, scratch, levels, 'lag')

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    const h = (big - 1) / 2
    const top = scratch.spatial[levels - 1]![p]!
    const r = s.spatial[p]!
    let w = floorDiv(top - r + h, big)

    s.spatial[p] = r - top + big * w

    for (let i = levels; i >= 2; i--) {
      const now = levelNow(s, i)
      const lag = levelLag(s, i)
      const y = now[p]! + scratch.spatial[i - 2]![p]! - 2 * lag[p]! + w
      const v = floorDiv(y + h, big)

      now[p] = lag[p]!
      lag[p] = big * v - y
      w = v
    }

    const y = s.counter[p]! + scratch.numerator[p]! - 2 * s.lag[p]! + w
    const k = floorDiv(y + h, big)

    s.counter[p] = s.lag[p]!
    s.lag[p] = big * k - y

    const window = g.multiplicity[p]! * h

    s.potential[p] = mod(s.potential[p]! - k + window, 2 * window + 1) - window
  }

  spanFlux(m, s, scratch.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const q = m.span[l]!
    const e = scratch.flux[l]!
    const after = s.remainder[l]!
    const c = floorDiv(e - after - (q >> 1) + q - 1, q)

    s.remainder[l] = after + q * c - e

    if (c === 0) continue

    const n = m.linkWindow[l]!

    s.angle[l] = mod(s.angle[l]! - c + n / 2, n) - n / 2
  }
}
