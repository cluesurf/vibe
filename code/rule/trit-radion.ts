// The radion (E-GRV-0079, 0080): a wave rule for the husk column's depth, sourced by content. A STAND-IN
// construction: E-GRV-0071 found that nothing in the model makes the depth read any state, so this rule is new
// machinery given by hand, not an emergent field. It is the simplest even-spin (spin 0) field the husk can hold.
//
// THE FIELD. phi on every husk dock: the column's depth less its mean, an integer count of depth levels. It is
// carried as phi plus a fraction held in L counters (E-FRC-0214's shaped carry, level for level), so the shadow
//   x = phi + C_1 / Q + C_2 / Q^2 + ... + C_L / Q^L
// runs the linear leapfrog
//   x_(t+1) - 2 x_t + x_(t-1) = - kappa (A x)_t + sigma rho          (1)
// with A the husk graph Laplacian (A x)_y = sum over the 18 links at y of g (x_y - x_z), g = 2 on an axis and 1 on
// a face diagonal (the light's own metric, code/measure/trit-hop-light G_METRIC: its Green's function is the one
// E-FRC-0241 read, G(r) -> 1 / (24 pi r)), rho the content of each dock (love plus fear), and
//   kappa = a / Q,  sigma = b / Q,  a = b = 2,  Q = 9 (2D + 1) = 3^2 q
// WHY THIS KAPPA. A has the long-wave symbol 6 k^2, so (1) carries waves at c_s = sqrt(6 kappa) = 2 / sqrt(3 (2D + 1)),
// which is the light's c(D) exactly (E-GRV-0070): the depth's own waves run at the speed of the light it sets. The
// light's kick divides by q = 2D + 1; this one divides by 9 q, a counter of q values with two trits more. Stability:
// kappa A has top eigenvalue at most kappa 48 (Gershgorin: 18 links of g <= 2, twice) = 32 / (3 (2D + 1)) < 4 for
// every D >= 1, so the leapfrog is stable and its invariant is positive (code/measure/radion).
// WHY b = a. Then the static solution of (1) is A x = rho, x = G * rho with G = A^-1 the husk Green's function:
// a WELL (x > 0 where content sits), the sign convention asked for.
//
// THE INTEGER RULE (every value an integer, no rounding: each division's remainder is CARRIED). With H = (Q - 1) / 2
// and every counter in -H .. H, s_i = - a (A C_i)_t read before any counter changes:
//   top:          W_(L+1) = floor((s_L + R + H) / Q),  R <- s_L + R - Q W_(L+1)
//   i = L .. 2:   Q W_i + C_i(t+1) = s_(i-1) + 2 C_i(t) - C_i(t-1) + W_(i+1)
//   level 1:      Q k + C_1(t+1) = - a (A phi)_t + b rho + 2 C_1(t) - C_1(t-1) + W_2,  phi_(t+1) = 2 phi_t - phi_(t-1) + k
// each C(t+1) the one value in -H .. H that makes its line an identity (a window of Q integers holds one multiple of
// Q). Summing the lines, Q (x_(t+1) - 2 x_t + x_(t-1)) = - a A x_t + b rho + (R_t - R_(t+1)) / Q^L: (1) exactly, up
// to a residual (R_t - R_(t+1)) / Q^(L+1), at most 1 / Q^L per dock per beat. One level leaves 1 / Q.
//
// REVERSIBLE: every line is solved backwards the same way (the lag is the one value in its window), so the beat is a
// bijection on the integer state; beatBack is its inverse, checked bit for bit by the callers.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by
// the rule; a source's hop is a scheduled change of rho.

import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type RadionMesh = {
  readonly sides: readonly [number, number, number]
  readonly docks: number
  // the 9 out-link neighbors of each dock (the husk directions of code/rule/trit-column)
  readonly neighbour: Int32Array
}

// the link weight g of husk direction h: 2 on an axis, 1 on a face diagonal (G_METRIC)
export const radionWeight = (h: number): number => (h < 3 ? 2 : 1)

export function radionMesh(sides: readonly [number, number, number]): RadionMesh {
  const [sx, sy, sz] = sides
  const docks = sx * sy * sz
  const neighbour = new Int32Array(docks * 9)

  for (let y = 0; y < docks; y++) {
    const a = y % sx
    const b = Math.floor(y / sx) % sy
    const c = Math.floor(y / (sx * sy))

    for (let h = 0; h < 9; h++) {
      const u = TRIT_HUSK_VECTORS[h]!

      neighbour[y * 9 + h] = mod(a + u[0]!, sx) + sx * mod(b + u[1]!, sy) + sx * sy * mod(c + u[2]!, sz)
    }
  }

  return { sides, docks, neighbour }
}

export type RadionRule = { readonly depth: number; readonly a: number; readonly b: number; readonly q: number; readonly h: number; readonly levels: number }

export function radionRule(depth: number, levels: number): RadionRule {
  const q = 9 * (2 * depth + 1)

  return { depth, a: 2, b: 2, q, h: (q - 1) / 2, levels }
}

// phi and its lag, the counters of every level and their lags, and the final remainder
export type RadionState = {
  readonly phi: Int32Array
  readonly phiLag: Int32Array
  readonly counter: Int32Array[]
  readonly counterLag: Int32Array[]
  readonly rest: Int32Array
}

export function emptyRadion(mesh: RadionMesh, levels: number): RadionState {
  const n = mesh.docks

  return {
    phi: new Int32Array(n),
    phiLag: new Int32Array(n),
    counter: Array.from({ length: levels }, () => new Int32Array(n)),
    counterLag: Array.from({ length: levels }, () => new Int32Array(n)),
    rest: new Int32Array(n),
  }
}

export function copyRadion(s: RadionState): RadionState {
  return {
    phi: Int32Array.from(s.phi),
    phiLag: Int32Array.from(s.phiLag),
    counter: s.counter.map(c => Int32Array.from(c)),
    counterLag: s.counterLag.map(c => Int32Array.from(c)),
    rest: Int32Array.from(s.rest),
  }
}

export const radionArrays = (s: RadionState): Int32Array[] => [s.phi, s.phiLag, ...s.counter, ...s.counterLag, s.rest]

export const sameRadion = (a: RadionState, b: RadionState): boolean => {
  const x = radionArrays(a)
  const y = radionArrays(b)

  return x.every((v, i) => v.every((w, j) => w === y[i]![j]))
}

// out = A x (integers)
export function laplacian(mesh: RadionMesh, x: Int32Array, out: Int32Array): void {
  out.fill(0)

  for (let y = 0; y < mesh.docks; y++) {
    const xy = x[y]!

    for (let h = 0; h < 9; h++) {
      const z = mesh.neighbour[y * 9 + h]!
      const e = radionWeight(h) * (xy - x[z]!)

      out[y] = out[y]! + e
      out[z] = out[z]! - e
    }
  }
}

export type RadionScratch = { lap: Int32Array; s: Int32Array[] }

export function radionScratch(mesh: RadionMesh, levels: number): RadionScratch {
  return { lap: new Int32Array(mesh.docks), s: Array.from({ length: levels }, () => new Int32Array(mesh.docks)) }
}

// the spatial terms s_i = - a A C_i of the counters given (now forward, lag backward)
function spatial(mesh: RadionMesh, rule: RadionRule, counters: readonly Int32Array[], scratch: RadionScratch): void {
  for (let i = 0; i < rule.levels; i++) {
    laplacian(mesh, counters[i]!, scratch.s[i]!)

    const s = scratch.s[i]!

    for (let y = 0; y < mesh.docks; y++) s[y] = -rule.a * s[y]!
  }
}

// one beat, in place; rho is the content of every dock
export function radionBeat(mesh: RadionMesh, rule: RadionRule, s: RadionState, rho: Int32Array, scratch: RadionScratch): void {
  const { a, b, q, h, levels } = rule

  spatial(mesh, rule, s.counter, scratch)
  laplacian(mesh, s.phi, scratch.lap)

  for (let y = 0; y < mesh.docks; y++) {
    const top = scratch.s[levels - 1]![y]!
    let w = floorDiv(top + s.rest[y]! + h, q)

    s.rest[y] = top + s.rest[y]! - q * w

    for (let i = levels - 1; i >= 1; i--) {
      const now = s.counter[i]!
      const lag = s.counterLag[i]!
      const rest = scratch.s[i - 1]![y]! + 2 * now[y]! - lag[y]! + w
      const v = floorDiv(rest + h, q)

      lag[y] = now[y]!
      now[y] = rest - q * v
      w = v
    }

    const rest = -a * scratch.lap[y]! + b * rho[y]! + 2 * s.counter[0]![y]! - s.counterLag[0]![y]! + w
    const k = floorDiv(rest + h, q)

    s.counterLag[0]![y] = s.counter[0]![y]!
    s.counter[0]![y] = rest - q * k

    const next = 2 * s.phi[y]! - s.phiLag[y]! + k

    s.phiLag[y] = s.phi[y]!
    s.phi[y] = next
  }
}

// the inverse of radionBeat (rho as it was on that beat)
export function radionBeatBack(mesh: RadionMesh, rule: RadionRule, s: RadionState, rho: Int32Array, scratch: RadionScratch): void {
  const { a, b, q, h, levels } = rule

  // the forward beat read phi_t and C_i(t), which are now the lags
  spatial(mesh, rule, s.counterLag, scratch)
  laplacian(mesh, s.phiLag, scratch.lap)

  for (let y = 0; y < mesh.docks; y++) {
    const top = scratch.s[levels - 1]![y]!
    const r = s.rest[y]! - top
    let w = floorDiv(h - r, q)

    s.rest[y] = r + q * w

    for (let i = levels - 1; i >= 1; i--) {
      const now = s.counter[i]!
      const lag = s.counterLag[i]!
      const x = scratch.s[i - 1]![y]! + 2 * lag[y]! + w - now[y]!
      const v = floorDiv(x + h, q)

      now[y] = lag[y]!
      lag[y] = x - q * v
      w = v
    }

    const phiNext = s.phi[y]!
    const phiNow = s.phiLag[y]!
    const x = -a * scratch.lap[y]! + b * rho[y]! + 2 * s.counterLag[0]![y]! + w - s.counter[0]![y]! - q * (phiNext - 2 * phiNow)
    const prev = floorDiv(x + h, q)

    s.counter[0]![y] = s.counterLag[0]![y]!
    s.counterLag[0]![y] = x - q * prev
    s.phi[y] = phiNow
    s.phiLag[y] = prev
  }
}
