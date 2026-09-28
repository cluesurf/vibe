// A LOVE AND A FEAR ON THE EMPTY MESH UNDER THE SWAP-MIXED RULE, HELD BY A ROUTE-FREE STRING (E-SPN-0146).
// code/rule/swap-mixer is the rule (the ring mixer, the swap coin, the working beat with the 'none' veto on flat links),
// and code/measure/swap-sector reads its hole sectors on the LOVE SEA. On the love sea the Z3-neutral composite is three
// holes (a fear there is unmade into a store and two holes at its first collision, E-SPN-0132 B0, E-SPN-0145 X3b), a
// three-body problem in 4d. Under the particle-hole map a hole on the love sea is a love on the EMPTY mesh exactly
// (E-SPN-0145 X5a), and on the empty mesh a fear has no sea love on its line, so it is a free particle there with the
// love's own dock matrix (the mixer and the coin read held-or-not, never the value). So the love and the fear, charges
// +1 and -1 mod 3, are the Z3-neutral two-body composite of these kinematics, and this file carries it:
//
//   emptyOutcomes      the rule's own pieces (ringDockMixBranch, swapCoinBranch, meetBranch, collideVeto) run on ONE
//                      dock of the empty mesh, read as outcomes with Eisenstein numerators over ringScale 2^k. An empty
//                      dock takes the factor S = ringScale(u) and stays empty (checked, emptyFactor).
//   vibeDockExact      the one-vibe dock matrix of a lone love (or fear) over S 2^k.
//   contactDockExact   the dock map of a love and a fear at ONE dock: the 552 ordered slot pairs (love slot, fear
//                      slot) and the 24 stored pairs a love and a fear on one line make at the collision (the pair move
//                      with no veto; the store is released on the next collision and the two stream apart). Closed:
//                      every outcome is one of these 576 states (checked).
//   mesonBeat          one float beat at total momentum K in the relative coordinate y = x_love - x_fear on a D4 ball:
//                      A (x) A off contact, the contact map at y = 0, the stream (y -> y + r_l - r_f, the phase
//                      e^(-i K . (r_l + r_f) / 2); a store does not stream), then THE STRING: the phase e^(-i sigma V)
//                      with V = d4Steps(y), the fewest links joining the two docks in the whole mesh (any of the 24
//                      roots a link), a stored pair V = 0. Weight leaving the ball is absorbed and counted.
//   setMassString      THE MASS STRING (E-SPN-0147): both vibes at string length V take the one-vibe shape of the mixer
//                      unit u(V) (massUnits: a ring unit times a step unit to the power min(V, cap)), so the separation
//                      cost is carried by the mixer angle rather than a phase. Read, like the phase string, from both
//                      charges at once: route-free and not local.
//   radialWell         the NR 4d s-wave level of a potential W(x) with a position-dependent reduced mass (the prediction's
//                      solver; linearWell is its constant-mass, linear case); massStringPrediction E-SPN-0147's use of it.
//   setOddPhase        THE ODD-OCTET PIECE (E-SPN-0148, code/rule/odd-phase): both vibes' one-vibe matrix gains
//                      gamma Pi8, gamma = v - 1. The exact readings (emptyOutcomes, vibeDockExact, contactDockExact,
//                      boxOneBeat, vacuumRun) take the piece's unit v as an optional last argument; without it every
//                      path is E-SPN-0146's and E-SPN-0147's, entry for entry.
//
// THE STRING IS EXACT IN THE RING. sigma is the angle of a norm-one element s = num / den of Z[w][1/42] (a power of
// (3 + w) / (3 + w^2) times a unit), so the string's factor s^V is exact: on a finite box every branch is multiplied by
// num^V den^(Vmax - V) with one global den^Vmax, and the amplitudes stay Eisenstein integers over a stated scale. It is a
// diagonal phase in the configuration, so it moves nothing: the support front is the stream's, one root a beat, and the
// one-beat displacement operator U^dag x U - x is the stringless rule's exactly (the phase commutes with x).
//
// THE STRING IS ROUTE-FREE, SO IT IS NOT LOCAL (E-SPN-0131 point 4): V is read from both charges at once. It is the
// separation cost of the question, stated as that, not a register the rule holds.
//
// DETERMINISM: no random numbers. EXACT: the dock pieces (Z[w] over 2^k and S); the beat is float measurement of maps
// read exactly from the rule. NOTHING MOVES: the pieces hand values between slots of one dock; the stream takes each
// slot's value one dock along; the string is a phase.

import { collideVeto, meetBranch } from '@/code/rule/occupation-veto-knit'
import { lockedState, mergeBranches, sameConfiguration, type Branch, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { LINE_OF, LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { ringDockMixBranch, ringScale, swapCoinBranch, swapMixedBeat, type RingUnit } from '@/code/rule/swap-mixer'
import { oddPhaseBranch, oddPhasedBeat, oddScale } from '@/code/rule/odd-phase'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { seaConfiguration } from '@/code/measure/pauli-mixer'
import { cloneDock, d4Steps, eFloat, ePow, flatBoxTables, ROOTS, seaFactor, type Ball, type DockState, type Eis, type ExactMatrix, type Outcome } from '@/code/measure/swap-sector'
import { eisConj, eisMul, eisNorm, eisPow, eisValue } from '@/code/measure/swap-cone'

// ---- ring units ----

const UNITS: readonly Eis[] = [
  [1n, 0n],
  [1n, 1n],
  [0n, 1n],
  [-1n, 0n],
  [-1n, -1n],
  [0n, -1n],
]

// w^j ((3 + w) / (3 + w^2))^k (k may be negative) as num / den, den = 7^|k|: the norm-one elements of Z[w][1/42] a
// mixer or a string can hold
export function ringUnit(k: number, j: number): RingUnit {
  const p: Eis = [3n, 1n]
  const base = k >= 0 ? eisPow(eisMul(p, p), k) : eisPow(eisMul(eisConj(p), eisConj(p)), -k)
  const num = eisMul(base, UNITS[((j % 6) + 6) % 6] as Eis)

  return { num: [num[0], num[1]], den: 7n ** BigInt(Math.abs(k)) }
}

export const unitAngle = (u: RingUnit): number => {
  const [re, im] = eisValue([u.num[0], u.num[1]], u.den)

  return Math.atan2(im, re)
}

export const unitNormExact = (u: RingUnit): boolean => eisNorm([u.num[0], u.num[1]]) === u.den * u.den

// ---- one dock of the empty mesh ----

export const emptyDock = (): DockState => ({ vibe: new Int8Array(24), point: new Int8Array(24), open: new Uint8Array(24), store: new Int8Array(12), spoint: new Int8Array(12), sopen: new Uint8Array(12) })

export function emptyKey(s: DockState): string {
  let k = ''

  for (let d = 0; d < 24; d++) if (s.vibe[d] !== 0) k += `${d}:${s.vibe[d]}:${s.point[d]}:${s.open[d]};`
  k += '|'
  for (let l = 0; l < 12; l++) if (s.store[l] !== 0) k += `${l}:${s.store[l]}:${s.spoint[l]}:${s.sopen[l]};`

  return k
}

const ONE_DOCK: LockedTables = { cells: 1, collision: 'pass', veto: false, target: new Int32Array(24), source: new Int32Array(24), move: new Int8Array(216), back: new Int8Array(216) }

const OUTCOMES = new Map<string, Outcome[]>()

// the rule's pieces before the stream on one dock of the empty mesh (the mixer scaled by ringScale(u), with `v` the
// odd-octet piece of code/rule/odd-phase scaled by oddScale(v) (E-SPN-0148), the swap coin, the meetings, the collision
// of beat `beat`): outcomes with numerators over ringScale(u) (oddScale(v)) 2^k
export function emptyOutcomes(s: DockState, beat: number, u: RingUnit, v?: RingUnit): Outcome[] {
  const key = `${beat % 2}#${u.num.join(',')}/${u.den}${v ? `#odd${v.num.join(',')}/${v.den}` : ''}#${emptyKey(s)}`
  const hit = OUTCOMES.get(key)

  if (hit) return hit

  const br: Branch = { ...cloneDock(s), a: 1n, b: 0n, k: 0 }
  const ringed = mergeBranches(ringDockMixBranch(1, br, u, false))
  const mixed = v ? mergeBranches(ringed.flatMap(b => oddPhaseBranch(1, b, v, false))) : ringed
  const coined = mixed.flatMap(b => swapCoinBranch(1, b))
  const met = coined.flatMap(b => meetBranch(b, 1, false))

  for (const b of met) collideVeto('none', ONE_DOCK, b, beat, false)

  const out = mergeBranches(met).map(b => ({ state: { vibe: b.vibe, point: b.point, open: b.open, store: b.store, spoint: b.spoint, sopen: b.sopen }, a: b.a, b: b.b, k: b.k }))

  OUTCOMES.set(key, out)

  return out
}

// the per-dock scale of the pieces before the stream: ringScale(u), times oddScale(v) with the odd-octet piece
export const pieceScale = (u: RingUnit, v?: RingUnit): bigint => ringScale(u) * (v ? oddScale(v) : 1n)

// the empty dock's factor: required to be the empty dock alone, with amplitude S = pieceScale(u, v) (numerator over S: S)
export function emptyFactor(u: RingUnit, v?: RingUnit): { a: bigint; b: bigint; k: number; alone: boolean } {
  const o = emptyOutcomes(emptyDock(), 0, u, v)
  const o1 = emptyOutcomes(emptyDock(), 1, u, v)
  const alone = o.length === 1 && o1.length === 1 && emptyKey((o[0] as Outcome).state) === '|' && emptyKey((o1[0] as Outcome).state) === '|'

  return { a: (o[0] as Outcome).a, b: (o[0] as Outcome).b, k: (o[0] as Outcome).k, alone: alone && (o1[0] as Outcome).a === (o[0] as Outcome).a && (o1[0] as Outcome).b === (o[0] as Outcome).b }
}

// A[to][from] for a lone vibe (1 a love, -1 a fear) on an empty dock, numerators over S 2^k
export function vibeDockExact(vibe: 1 | -1, beat: number, u: RingUnit, v?: RingUnit): ExactMatrix {
  const found: { from: number; to: number; a: bigint; b: bigint; k: number }[] = []
  let kMax = 0

  for (let from = 0; from < 24; from++) {
    const s = emptyDock()

    s.vibe[from] = vibe
    s.open[from] = 1

    for (const o of emptyOutcomes(s, beat, u, v)) {
      const at = [...o.state.vibe].map((v, d) => (v !== 0 ? d : -1)).filter(d => d >= 0)

      if (at.length !== 1 || o.state.vibe[at[0] as number] !== vibe || [...o.state.store].some(x => x !== 0)) throw new Error('swap-string: a lone vibe left the one-vibe sector')

      found.push({ from, to: at[0] as number, a: o.a, b: o.b, k: o.k })
      kMax = Math.max(kMax, o.k)
    }
  }

  return assemble(24, found, kMax)
}

function assemble(n: number, found: readonly { from: number; to: number; a: bigint; b: bigint; k: number }[], kMax: number): ExactMatrix {
  const entries: Eis[][] = Array.from({ length: n }, () => Array.from({ length: n }, (): Eis => [0n, 0n]))

  for (const f of found) {
    const sc = 1n << BigInt(kMax - f.k)
    const e = (entries[f.to] as Eis[])[f.from] as Eis

    ;(entries[f.to] as Eis[])[f.from] = [e[0] + f.a * sc, e[1] + f.b * sc]
  }

  return { entries, k: kMax }
}

// ---- the contact states: a love at slot l and a fear at slot f (index l * 24 + f, l != f), or a stored pair on line L
// (index 576 + 2 L + (store > 0 ? 0 : 1); store > 0 means the love held the line's first slot) ----

export const CONTACT_STATES = 600
export const STORE_BASE = 576

export function contactState(i: number): DockState {
  const s = emptyDock()

  if (i < STORE_BASE) {
    const l = Math.floor(i / 24)
    const f = i % 24

    if (l === f) throw new Error('swap-string: a love and a fear cannot share a slot')

    s.vibe[l] = 1
    s.open[l] = 1
    s.vibe[f] = -1
    s.open[f] = 1

    return s
  }

  const L = (i - STORE_BASE) >> 1

  s.store[L] = (i - STORE_BASE) & 1 ? -1 : 1
  s.spoint[L] = 0
  s.sopen[L] = 3

  return s
}

// the index of a one-dock state holding one love and one fear, or one store with the dock's slots empty; -1 otherwise
export function contactIndex(s: DockState): number {
  let l = -1
  let f = -1
  let n = 0

  for (let d = 0; d < 24; d++) {
    const v = s.vibe[d] as number

    if (v === 0) continue
    n++
    if (v > 0) l = d
    else f = d
    if (s.point[d] !== 0 || s.open[d] !== 1) return -1
  }

  let stores = 0
  let L = -1

  for (let k = 0; k < 12; k++) {
    if (s.store[k] === 0) continue
    stores++
    L = k
  }

  if (n === 2 && l >= 0 && f >= 0 && stores === 0) return l * 24 + f
  if (n === 0 && stores === 1 && s.spoint[L] === 0 && s.sopen[L] === 3) return STORE_BASE + 2 * L + ((s.store[L] as number) > 0 ? 0 : 1)

  return -1
}

export const lineOfStore = (i: number): number => (i - STORE_BASE) >> 1
export const storeOnLine = (slotA: number, slotB: number): boolean => LINE_OF[slotA] === LINE_OF[slotB]
export const firstOfLine = (L: number): number => LINE_FIRSTS[L] as number

// the contact map C[to][from] over the 600 contact indices (the l == f indices are empty rows and columns),
// numerators over S 2^k, and a census of what the collision did
export type ContactExact = ExactMatrix & { stored: number; released: number; permuted: number }

export function contactDockExact(beat: number, u: RingUnit, v?: RingUnit): ContactExact {
  const found: { from: number; to: number; a: bigint; b: bigint; k: number }[] = []
  let kMax = 0
  let stored = 0
  let released = 0
  let permuted = 0

  for (let from = 0; from < CONTACT_STATES; from++) {
    if (from < STORE_BASE && Math.floor(from / 24) === from % 24) continue

    for (const o of emptyOutcomes(contactState(from), beat, u, v)) {
      const to = contactIndex(o.state)

      if (to < 0) throw new Error(`swap-string: a love and a fear at contact left the contact sector (from ${from}, beat ${beat})`)

      if (from < STORE_BASE && to >= STORE_BASE) stored++
      if (from >= STORE_BASE && to < STORE_BASE) released++
      found.push({ from, to, a: o.a, b: o.b, k: o.k })
      kMax = Math.max(kMax, o.k)
    }
  }

  // a slot pair that the mixer and coin alone would not have produced: counted by the caller from a comparison; here
  // the number of from-states whose outcome set is not a product of the one-vibe maps is left to the reading
  return { ...assemble(CONTACT_STATES, found, kMax), stored, released, permuted }
}

// ---- the prediction's two numbers ----

// the string length per Euclidean unit, d4Steps(y) / |y|, averaged over directions (a grid of the 4-ball of radius G,
// radially projected), with its least and largest values (1/sqrt 2 along a root, 1 along an axis)
export function stringKappa(G: number): { mean: number; least: number; most: number } {
  let sum = 0
  let n = 0
  let least = 9
  let most = 0

  for (let a = -G; a <= G; a++) {
    for (let b = -G; b <= G; b++) {
      for (let c = -G; c <= G; c++) {
        for (let d = -G; d <= G; d++) {
          const r = Math.hypot(a, b, c, d)

          if (r === 0 || r > G) continue

          const k = d4Steps([a / r, b / r, c / r, d / r])

          sum += k
          n++
          least = Math.min(least, k)
          most = Math.max(most, k)
        }
      }
    }
  }

  return { mean: sum / n, least, most }
}

// the lowest eigenvalue of -u'' + (3/4) u / x^2 + x u on (0, L), u(0) = u(L) = 0, N interior points (the 4d s-wave in a
// linear potential, in the units l = (2 mu F)^(-1/3) and F l), by Sturm-sequence bisection; `centrifugal` 0 gives the 3d
// s-wave, whose value is the Airy zero 2.338107 (the solver's check)
export function linearWell(L: number, N: number, centrifugal = 0.75): number {
  const h = L / (N + 1)
  const off2 = 1 / h ** 4
  const count = (e: number): number => {
    let k = 0
    let q = 0

    for (let i = 0; i < N; i++) {
      const x = (i + 1) * h
      const diag = 2 / (h * h) + centrifugal / (x * x) + x - e

      q = i === 0 ? diag : diag - off2 / (q === 0 ? 1e-300 : q)
      if (q < 0) k++
    }

    return k
  }
  let a = 0
  let b = 20

  for (let it = 0; it < 80; it++) {
    const mid = (a + b) / 2

    if (count(mid) >= 1) b = mid
    else a = mid
  }

  return (a + b) / 2
}

// the lowest level of -(1/2) (u' / mu)' + (centrifugal / (2 mu x^2)) u + W u = E u on (0, L), u(0) = u(L) = 0, N interior
// points (the 4d s-wave with a position-dependent reduced mass, in physical units; the symmetric difference keeps the
// operator hermitian), by Sturm-sequence bisection, with its normalized radial vector u (inverse iteration) and the
// grid step. With mu constant and W = F x it is linearWell's eps4 F l
export function radialWell(W: (x: number) => number, mu: (x: number) => number, L: number, N: number, centrifugal = 0.75): { E: number; u: Float64Array; h: number } {
  const h = L / (N + 1)
  const d = new Float64Array(N)
  const o = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    const x = (i + 1) * h
    const up = mu(x + h / 2)
    const down = mu(x - h / 2)

    d[i] = (1 / up + 1 / down) / (2 * h * h) + centrifugal / (2 * mu(x) * x * x) + W(x)
    o[i] = -1 / (2 * up * h * h)
  }

  const count = (e: number): number => {
    let k = 0
    let q = 0

    for (let i = 0; i < N; i++) {
      const di = (d[i] as number) - e

      q = i === 0 ? di : di - (o[i - 1] as number) ** 2 / (q === 0 ? 1e-300 : q)
      if (q < 0) k++
    }

    return k
  }
  let a = -20
  let b = 20

  for (let it = 0; it < 100; it++) {
    const mid = (a + b) / 2

    if (count(mid) >= 1) b = mid
    else a = mid
  }

  const E = (a + b) / 2
  let u = new Float64Array(N).fill(1)

  for (let it = 0; it < 6; it++) {
    const cp = new Float64Array(N)
    const dp = new Float64Array(N)
    const x = new Float64Array(N)
    const shift = E + 1e-9 * Math.max(1, Math.abs(E))

    for (let i = 0; i < N; i++) {
      const lower = i > 0 ? (o[i - 1] as number) : 0
      const den = (d[i] as number) - shift - lower * (i > 0 ? (cp[i - 1] as number) : 0)

      cp[i] = (i < N - 1 ? (o[i] as number) : 0) / den
      dp[i] = ((u[i] as number) - lower * (i > 0 ? (dp[i - 1] as number) : 0)) / den
    }
    for (let i = N - 1; i >= 0; i--) x[i] = (dp[i] as number) - (cp[i] as number) * (i < N - 1 ? (x[i + 1] as number) : 0)

    let n2 = 0

    for (let i = 0; i < N; i++) n2 += (x[i] as number) ** 2
    for (let i = 0; i < N; i++) x[i] = (x[i] as number) / Math.sqrt(n2)
    u = x
  }

  return { E, u, h }
}

// E-SPN-0147's mass-string prediction (its point 5 and 6, the same arithmetic in the same order): the NR 4d s-wave in the
// potential W = 4 (m(V) - m0), V = kappa x, m(V) = m0 + (tau / 2) min(V, cap), with the reduced mass `mu` (tan m(V(x))
// for the local mass); the binding, the rest energy 2 m0 + E_b, the kinetic part, the mean string length and the
// potential model's R = (1 / <1 / (2 tan m)> + 1.5 T) / E_rest
export function massStringPrediction(m0: number, tau: number, cap: number, kappa: number, L: number, N: number, local = true): { Eb: number; Erest: number; T: number; meanV: number; R: number } {
  const massAt = (x: number): number => m0 + (tau / 2) * Math.min(kappa * x, cap)
  const r = radialWell(x => 4 * (massAt(x) - m0), local ? x => Math.tan(massAt(x)) : () => Math.tan(m0), L, N)
  let W = 0
  let V = 0
  let inv = 0

  for (let i = 0; i < r.u.length; i++) {
    const x = (i + 1) * r.h
    const p = (r.u[i] as number) ** 2

    W += p * 4 * (massAt(x) - m0)
    V += p * kappa * x
    inv += p / (2 * Math.tan(massAt(x)))
  }

  const T = r.E - W
  const Erest = 2 * m0 + r.E

  return { Eb: r.E, Erest, T, meanV: V, R: (1 / inv + 1.5 * T) / Erest }
}

// ---- the rule itself on a periodic box of the empty mesh, one beat, against the meson beat ----

// a start: a love at (dock, slot) and a fear at (dock, slot), or a store at (dock, line, sign)
export type BoxStart = { love: [number, number]; fear: [number, number] } | { store: [number, number, number] }

// the key of a configuration holding one love and one fear, or one store, on the box: `L dock:slot F dock:slot` or
// `S dock:line:sign`; null for anything else
export function mesonKey(c: Configuration, cells: number): string | null {
  const loves: [number, number][] = []
  const fears: [number, number][] = []
  const stores: [number, number, number][] = []

  for (let i = 0; i < cells * 24; i++) {
    const v = c.vibe[i] as number

    if (v > 0) loves.push([Math.floor(i / 24), i % 24])
    else if (v < 0) fears.push([Math.floor(i / 24), i % 24])
  }
  for (let i = 0; i < cells * 12; i++) if (c.store[i] !== 0) stores.push([Math.floor(i / 12), i % 12, c.store[i] as number])

  if (loves.length === 1 && fears.length === 1 && stores.length === 0) return `L${(loves[0] as number[]).join(':')} F${(fears[0] as number[]).join(':')}`
  if (loves.length === 0 && fears.length === 0 && stores.length === 1) return `S${(stores[0] as number[]).join(':')}`

  return null
}

// one beat of the rule (code/rule/swap-mixer swapMixedBeat, veto 'none', flat links) from a start on the empty box:
// each branch's amplitude divided by S^cells (exactly by S^(cells - occupied docks) as integers, then as a float), keyed
// by mesonKey; `inexact` counts branches whose integers S^(cells - occupied) did not divide, `stray` branches that are
// not a meson configuration
export function boxOneBeat(tables: LockedTables, u: RingUnit, start: BoxStart, beat: number, v?: RingUnit): { amps: Map<string, [number, number]>; inexact: number; stray: number } {
  const cells = tables.cells
  const c = seaConfiguration(cells, 0)
  let occupied: number

  if ('store' in start) {
    const [x, L, sign] = start.store

    c.store[x * 12 + L] = sign
    c.spoint[x * 12 + L] = 0
    c.sopen[x * 12 + L] = 3
    occupied = 1
  } else {
    const [xl, l] = start.love
    const [xf, f] = start.fear

    c.vibe[xl * 24 + l] = 1
    c.open[xl * 24 + l] = 1
    c.vibe[xf * 24 + f] = -1
    c.open[xf * 24 + f] = 1
    occupied = xl === xf ? 1 : 2
  }

  const S = pieceScale(u, v)
  const div = S ** BigInt(cells - occupied)
  const out = v ? oddPhasedBeat('none', tables, lockedState(c), beat, u, v) : swapMixedBeat('none', tables, lockedState(c), beat, u)
  const amps = new Map<string, [number, number]>()
  let inexact = 0
  let stray = 0

  for (const br of out.branches) {
    const key = mesonKey(br, cells)

    if (key === null) {
      stray++
      continue
    }

    if (br.a % div !== 0n || br.b % div !== 0n) inexact++

    const [re, im] = eFloat(br.a / div, br.b / div)
    const scale = 1 / (Number(S) ** occupied * 2 ** br.k)
    const o = amps.get(key) ?? [0, 0]

    amps.set(key, [o[0] + re * scale, o[1] + im * scale])
  }

  return { amps, inexact, stray }
}

// the meson beat's one-beat image of the same start (K = 0, no string, on a ball large enough for one beat), keyed as
// mesonKey keys the box: the love's new dock is its start dock's neighbor along its new slot, the fear's likewise
export function modelOneBeat(space: MesonSpace, tables: LockedTables, start: BoxStart, startY: readonly number[], beat: number): Map<string, [number, number]> {
  const { ball } = space
  const n = ball.points.length
  const s = newMeson(ball)
  const o = newMeson(ball)

  if ('store' in start) {
    const [, L, sign] = start.store

    s.re[n * 576 + 2 * L + (sign > 0 ? 0 : 1)] = 1
  } else {
    const p = ball.index.get(startY.join(',')) as number

    s.re[p * 576 + start.love[1] * 24 + start.fear[1]] = 1
  }

  mesonBeat(space, s, o, beat)

  const amps = new Map<string, [number, number]>()
  const add = (key: string, re: number, im: number): void => {
    const x = amps.get(key) ?? [0, 0]

    amps.set(key, [x[0] + re, x[1] + im])
  }
  const xl = 'store' in start ? start.store[0] : start.love[0]
  const xf = 'store' in start ? start.store[0] : start.fear[0]

  for (let p = 0; p < n; p++) {
    for (let l = 0; l < 24; l++) {
      for (let f = 0; f < 24; f++) {
        const re = o.re[p * 576 + l * 24 + f] as number
        const im = o.im[p * 576 + l * 24 + f] as number

        if (re === 0 && im === 0) continue
        add(`L${Math.floor((tables.target[xl * 24 + l] as number) / 24)}:${l} F${Math.floor((tables.target[xf * 24 + f] as number) / 24)}:${f}`, re, im)
      }
    }
  }

  for (let j = 0; j < 24; j++) {
    const re = o.re[n * 576 + j] as number
    const im = o.im[n * 576 + j] as number

    if (re === 0 && im === 0) continue
    add(`S${xl}:${j >> 1}:${j & 1 ? -1 : 1}`, re, im)
  }

  return amps
}

// the largest |difference| between two keyed amplitude maps (a key missing on one side counts its full size)
export function ampGap(a: Map<string, [number, number]>, b: Map<string, [number, number]>): number {
  let gap = 0

  for (const [k, x] of a) {
    const y = b.get(k) ?? [0, 0]

    gap = Math.max(gap, Math.hypot(x[0] - y[0], x[1] - y[1]))
  }
  for (const [k, y] of b) if (!a.has(k)) gap = Math.max(gap, Math.hypot(y[0], y[1]))

  return gap
}

// ---- floats ----

export type CMat = { n: number; re: Float64Array; im: Float64Array }

// an exact matrix over S 2^k divided by the empty dock's factor S (pieceScale(u, v)), as floats
export function overEmpty(m: ExactMatrix, u: RingUnit, v?: RingUnit): CMat {
  const n = m.entries.length
  const S = Number(pieceScale(u, v))
  const scale = 2 ** -m.k / S
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const e = (m.entries[i] as Eis[])[j] as Eis
      const [zr, zi] = eFloat(e[0], e[1])

      re[i * n + j] = zr * scale
      im[i * n + j] = zi * scale
    }
  }

  return { n, re, im }
}

// the sparse columns of a float matrix: for each from, the (to, re, im) with a nonzero entry
export type Sparse = { n: number; cols: { to: Int32Array; re: Float64Array; im: Float64Array }[] }

export function sparseOf(m: CMat): Sparse {
  const cols: Sparse['cols'] = []

  for (let f = 0; f < m.n; f++) {
    const to: number[] = []
    const re: number[] = []
    const im: number[] = []

    for (let t = 0; t < m.n; t++) {
      const r = m.re[t * m.n + f] as number
      const i = m.im[t * m.n + f] as number

      if (r === 0 && i === 0) continue
      to.push(t)
      re.push(r)
      im.push(i)
    }

    cols.push({ to: Int32Array.from(to), re: Float64Array.from(re), im: Float64Array.from(im) })
  }

  return { n: m.n, cols }
}

// the one-vibe matrix's shape A = c X (I + beta 1 1^T): the coin X after the mixer's rank-one change on the uniform
// vector (a lone vibe's hop carries no fermion sign). Read off A and checked on all 576 entries
export type VibeShape = { c: [number, number]; beta: [number, number]; gap: number }

const OPP: readonly number[] = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] as number))))

export function vibeShape(A: CMat): VibeShape {
  const at = (t: number, f: number): [number, number] => [A.re[t * 24 + f] as number, A.im[t * 24 + f] as number]
  const cb = at(OPP[1] as number, 0)
  const d = at(OPP[0] as number, 0)
  const c: [number, number] = [d[0] - cb[0], d[1] - cb[1]]
  const c2 = c[0] * c[0] + c[1] * c[1]
  const beta: [number, number] = [(cb[0] * c[0] + cb[1] * c[1]) / c2, (cb[1] * c[0] - cb[0] * c[1]) / c2]
  let gap = 0

  for (let t = 0; t < 24; t++) {
    for (let f = 0; f < 24; f++) {
      const i = OPP[t] as number
      const mr = (i === f ? 1 : 0) + beta[0]
      const mi = beta[1]

      gap = Math.max(gap, Math.hypot((A.re[t * 24 + f] as number) - (c[0] * mr - c[1] * mi), (A.im[t * 24 + f] as number) - (c[0] * mi + c[1] * mr)))
    }
  }

  return { c, beta, gap }
}

// out = A v for A = c X (I + beta 1 1^T), 24 complex numbers at an offset and stride; the shape is row `row` of a
// table of (c re, c im, beta re, beta im). With the odd-octet piece (E-SPN-0148, odd = gamma = v - 1 nonzero) A = c X (I
// + beta 1 1^T + gamma Pi8), Pi8 w = (w - X w) / 2 - R (R^T w) / 12; with gamma = 0 the arithmetic is E-SPN-0146's, entry
// for entry
const ROOT_FLAT: Float64Array = Float64Array.from(ROOTS.flatMap(r => [...r]))

export function applyVibe(table: Float64Array, row: number, vr: Float64Array, vi: Float64Array, vo: number, stride: number, or: Float64Array, oi: Float64Array, oo: number, ostride: number, odd?: Float64Array): void {
  const c0 = table[4 * row] as number
  const c1 = table[4 * row + 1] as number
  const b0 = table[4 * row + 2] as number
  const b1 = table[4 * row + 3] as number
  let sr = 0
  let si = 0

  for (let e = 0; e < 24; e++) {
    sr += vr[vo + e * stride] as number
    si += vi[vo + e * stride] as number
  }

  const bsr = b0 * sr - b1 * si
  const bsi = b0 * si + b1 * sr
  const g0 = odd ? (odd[0] as number) : 0
  const g1 = odd ? (odd[1] as number) : 0

  if (g0 === 0 && g1 === 0) {
    for (let t = 0; t < 24; t++) {
      const i = OPP[t] as number
      const wr = (vr[vo + i * stride] as number) + bsr
      const wi = (vi[vo + i * stride] as number) + bsi

      or[oo + t * ostride] = c0 * wr - c1 * wi
      oi[oo + t * ostride] = c0 * wi + c1 * wr
    }

    return
  }

  // R^T v (four complex numbers)
  const qr = [0, 0, 0, 0]
  const qi = [0, 0, 0, 0]

  for (let e = 0; e < 24; e++) {
    const xr = vr[vo + e * stride] as number
    const xi = vi[vo + e * stride] as number

    for (let k = 0; k < 4; k++) {
      qr[k]! += (ROOT_FLAT[4 * e + k] as number) * xr
      qi[k]! += (ROOT_FLAT[4 * e + k] as number) * xi
    }
  }

  for (let t = 0; t < 24; t++) {
    const i = OPP[t] as number
    const xr = vr[vo + i * stride] as number
    const xi = vi[vo + i * stride] as number
    let pr = (xr - (vr[vo + t * stride] as number)) / 2
    let pi = (xi - (vi[vo + t * stride] as number)) / 2

    for (let k = 0; k < 4; k++) {
      pr -= ((ROOT_FLAT[4 * i + k] as number) * (qr[k] as number)) / 12
      pi -= ((ROOT_FLAT[4 * i + k] as number) * (qi[k] as number)) / 12
    }

    const wr = xr + bsr + g0 * pr - g1 * pi
    const wi = xi + bsi + g0 * pi + g1 * pr

    or[oo + t * ostride] = c0 * wr - c1 * wi
    oi[oo + t * ostride] = c0 * wi + c1 * wr
  }
}

// ---- the meson on a ball: sites x 576 ordered slot pairs (love, fear), and 24 stores at y = 0 after them ----

export type MesonState = { re: Float64Array; im: Float64Array }

export const mesonSize = (ball: Ball): number => ball.points.length * 576 + 24

export const newMeson = (ball: Ball): MesonState => ({ re: new Float64Array(mesonSize(ball)), im: new Float64Array(mesonSize(ball)) })

export type MesonSpace = {
  ball: Ball
  origin: number
  shape: VibeShape
  contact: [Sparse, Sparse]
  // THE MASS STRING (E-SPN-0147): the one-vibe shape both vibes take at a site, by the site's string length V: row V of
  // `shapes` (c re, c im, beta re, beta im; rows 0 .. radius), and `length` the string length of each site. With no mass
  // string every row is `shape`
  shapes: Float64Array
  length: Int32Array
  // THE ODD-OCTET PIECE (E-SPN-0148): gamma = v - 1 (re, im) of G8 = 1 + (v - 1) Pi8, the same at every site; (0, 0) is
  // no piece
  odd: Float64Array
  // the string's phase per site, and the stream's per slot pair at the current K (interleaved re, im)
  string: Float64Array
  stream: Float64Array
  // scratch
  tr: Float64Array
  ti: Float64Array
  mr: Float64Array
  mi: Float64Array
  vr: Float64Array
  vi: Float64Array
  // the stream's target site index per (site, l, f) pair of steps: step[p * 24 + l] then the opposite of f
  opp: readonly number[]
}

export const stringSteps = (y: readonly number[]): number => d4Steps(y)

// THE STRING'S SIGN. A level of a beat has no energy sign of its own: E = -phase is a convention. What makes V a COST is
// that it moves the composite's quasi-energy the way the constituents' kinetic energy does. code/measure/singlet-
// kinematics reads eps = sign (-(phase - mid)), eps(0) = +m, growing with |K| on the singlet's branch; a phase e^(-i s V)
// a beat moves eps by sign s V, so the string is a cost (raises eps with V, confining the branch's slow states) iff
// s = sign sigma. With the other sign it lowers eps with V, a hill: the slow pair rolls apart and only the Bloch
// oscillation of the bounded band holds it, at a distance set by the bandwidth, not by the rest energy.
export const stringSign = (singletSign: number, sigma: number): number => singletSign * sigma

// the space for one run: the ball, the one-vibe shape, the contact maps of both beat parities, the string's SIGNED angle
// (the phase e^(-i sigma V) a beat; 0 for no string; the sign that makes it a cost for the composite's branch is the
// caller's, see stringSign) and total momentum K
export function mesonSpace(ball: Ball, shape: VibeShape, contact: [Sparse, Sparse], sigma: number, K: readonly number[]): MesonSpace {
  const n = ball.points.length
  const string = new Float64Array(n * 2)

  ball.points.forEach((p, i) => {
    const ph = -sigma * stringSteps(p)

    string[2 * i] = Math.cos(ph)
    string[2 * i + 1] = Math.sin(ph)
  })

  const shapes = new Float64Array(4 * (ball.radius + 1))

  for (let V = 0; V <= ball.radius; V++) shapes.set([shape.c[0], shape.c[1], shape.beta[0], shape.beta[1]], 4 * V)

  const space: MesonSpace = {
    ball,
    origin: ball.index.get('0,0,0,0') as number,
    shape,
    contact,
    shapes,
    length: Int32Array.from(ball.points, p => stringSteps(p)),
    odd: new Float64Array(2),
    string,
    stream: new Float64Array(1152),
    tr: new Float64Array(n * 576),
    ti: new Float64Array(n * 576),
    mr: new Float64Array(576),
    mi: new Float64Array(576),
    vr: new Float64Array(CONTACT_STATES),
    vi: new Float64Array(CONTACT_STATES),
    opp: OPP,
  }

  setMomentum(space, K)

  return space
}

// the string's signed angle, in place (a threaded engine reads the same array)
export function setString(space: MesonSpace, sigma: number): void {
  space.ball.points.forEach((p, i) => {
    const ph = -sigma * stringSteps(p)

    space.string[2 * i] = Math.cos(ph)
    space.string[2 * i + 1] = Math.sin(ph)
  })
}

// THE MASS STRING (E-SPN-0147), in place: both vibes at string length V take the one-vibe shape shapes[min(V, last)]
// (a threaded engine reads the same table). One shape switches it off
export function setMassString(space: MesonSpace, shapes: readonly VibeShape[]): void {
  for (let V = 0; V <= space.ball.radius; V++) {
    const h = shapes[Math.min(V, shapes.length - 1)] as VibeShape

    space.shapes.set([h.c[0], h.c[1], h.beta[0], h.beta[1]], 4 * V)
  }
}

// THE ODD-OCTET PIECE (E-SPN-0148), in place: gamma = v - 1 for the unit v, or none (a threaded engine reads the same
// array)
export function setOddPhase(space: MesonSpace, v: RingUnit | null): void {
  if (!v) {
    space.odd[0] = 0
    space.odd[1] = 0

    return
  }

  const [re, im] = eisValue([v.num[0], v.num[1]], v.den)

  space.odd[0] = re - 1
  space.odd[1] = im
}

// the mass string's schedule: the mixer unit at string length V is base * step^min(V, cap), each a ring unit (k, j), so
// u(V) = ringUnit(base k + min(V, cap) step k, base j + min(V, cap) step j): exact, norm one, denominator 7^|k|
export function massUnits(base: readonly [number, number], step: readonly [number, number], cap: number, radius: number): RingUnit[] {
  return Array.from({ length: radius + 1 }, (_, V) => ringUnit(base[0] + Math.min(V, cap) * step[0], base[1] + Math.min(V, cap) * step[1]))
}

// the one-vibe shape at each unit (a love on an empty dock, beat parity 0; the caller checks both parities and the fear)
export const massShapes = (units: readonly RingUnit[]): VibeShape[] => units.map(u => vibeShape(overEmpty(vibeDockExact(1, 0, u), u)))

export function setMomentum(space: MesonSpace, K: readonly number[]): void {
  for (let l = 0; l < 24; l++) {
    for (let f = 0; f < 24; f++) {
      const r1 = ROOTS[l] as readonly number[]
      const r2 = ROOTS[f] as readonly number[]
      const ph = -(K.reduce((sum, x, k) => sum + x * ((r1[k] as number) + (r2[k] as number)), 0) / 2)

      space.stream[(l * 24 + f) * 2] = Math.cos(ph)
      space.stream[(l * 24 + f) * 2 + 1] = Math.sin(ph)
    }
  }
}

// the weight after the pieces and its center-of-mass step (r_l + r_f) / 2, summed (a store steps 0): for an eigenvector
// of the beat this is Hellmann-Feynman's d phase / dK = -<step>, so the level's group velocity is the mean step
export type CenterFlow = { weight: number; v: Float64Array }

export const newFlow = (): CenterFlow => ({ weight: 0, v: new Float64Array(4) })

// one beat of the meson: the pieces (A (x) A off contact, the contact map at y = 0), the stream, the string. Writes
// `out` (cleared here) and returns the weight absorbed at the ball's edge
export function mesonBeat(space: MesonSpace, s: MesonState, out: MesonState, beat: number, flow?: CenterFlow): number {
  const { ball, origin, shapes, length, tr, ti, mr, mi, vr, vi } = space
  const n = ball.points.length

  tr.fill(0)
  ti.fill(0)

  for (let p = 0; p < n; p++) {
    if (p === origin) continue

    const base = p * 576
    let empty = true

    for (let i = 0; i < 576; i++) {
      if (s.re[base + i] !== 0 || s.im[base + i] !== 0) {
        empty = false
        break
      }
    }

    if (empty) continue

    // A on the fear index (stride 1), then on the love index (stride 24), both at the site's string length's shape
    const row = length[p] as number

    for (let l = 0; l < 24; l++) applyVibe(shapes, row, s.re, s.im, base + l * 24, 1, mr, mi, l * 24, 1, space.odd)
    for (let f = 0; f < 24; f++) applyVibe(shapes, row, mr, mi, f, 24, tr, ti, base + f, 24, space.odd)
  }

  // contact: the 552 slot pairs at y = 0 and the 24 stores
  {
    const C = space.contact[beat % 2] as Sparse
    const base = origin * 576

    for (let i = 0; i < STORE_BASE; i++) {
      vr[i] = s.re[base + i] as number
      vi[i] = s.im[base + i] as number
    }

    for (let j = 0; j < 24; j++) {
      vr[STORE_BASE + j] = s.re[n * 576 + j] as number
      vi[STORE_BASE + j] = s.im[n * 576 + j] as number
    }

    const or = new Float64Array(CONTACT_STATES)
    const oi = new Float64Array(CONTACT_STATES)

    for (let f = 0; f < CONTACT_STATES; f++) {
      const xr = vr[f] as number
      const xi = vi[f] as number

      if (xr === 0 && xi === 0) continue

      const col = C.cols[f] as Sparse['cols'][number]

      for (let e = 0; e < col.to.length; e++) {
        const t = col.to[e] as number
        const cr = col.re[e] as number
        const ci = col.im[e] as number

        or[t]! += cr * xr - ci * xi
        oi[t]! += cr * xi + ci * xr
      }
    }

    for (let i = 0; i < STORE_BASE; i++) {
      tr[base + i] = or[i] as number
      ti[base + i] = oi[i] as number
    }

    vr.set(or)
    vi.set(oi)
  }

  // the stream and the string
  out.re.fill(0)
  out.im.fill(0)

  let lost = 0
  const phase = space.stream
  const step = ball.step

  for (let p = 0; p < n; p++) {
    for (let l = 0; l < 24; l++) {
      const q1 = step[p * 24 + l] as number

      for (let f = 0; f < 24; f++) {
        const i = p * 576 + l * 24 + f
        const xr = tr[i] as number
        const xi = ti[i] as number

        if (xr === 0 && xi === 0) continue

        if (flow) {
          const w = xr * xr + xi * xi
          const r1 = ROOTS[l] as readonly number[]
          const r2 = ROOTS[f] as readonly number[]

          flow.weight += w
          for (let k = 0; k < 4; k++) flow.v[k] = (flow.v[k] as number) + (w * ((r1[k] as number) + (r2[k] as number))) / 2
        }

        const q = q1 < 0 ? -1 : (step[q1 * 24 + (OPP[f] as number)] as number)

        if (q < 0) {
          lost += xr * xr + xi * xi
          continue
        }

        const c = phase[(l * 24 + f) * 2] as number
        const sn = phase[(l * 24 + f) * 2 + 1] as number
        const zr = xr * c - xi * sn
        const zi = xr * sn + xi * c
        const gr = space.string[2 * q] as number
        const gi = space.string[2 * q + 1] as number
        const j = q * 576 + l * 24 + f

        out.re[j] = (out.re[j] as number) + zr * gr - zi * gi
        out.im[j] = (out.im[j] as number) + zr * gi + zi * gr
      }
    }
  }

  // a store does not stream, and its string length is 0
  for (let j = 0; j < 24; j++) {
    out.re[n * 576 + j] = vr[STORE_BASE + j] as number
    out.im[n * 576 + j] = vi[STORE_BASE + j] as number
    if (flow) flow.weight += (vr[STORE_BASE + j] as number) ** 2 + (vi[STORE_BASE + j] as number) ** 2
  }

  return lost
}

// ---- readings of a meson state ----

export const mesonInner = (a: MesonState, b: MesonState): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    const ar = a.re[k] as number
    const ai = a.im[k] as number
    const br = b.re[k] as number
    const bi = b.im[k] as number

    r += ar * br + ai * bi
    i += ar * bi - ai * br
  }

  return [r, i]
}

export const mesonWeight = (s: MesonState): number => mesonInner(s, s)[0]

// the weight at string length at most `within` (a store counts at 0)
export function weightWithin(ball: Ball, s: MesonState, within: number): number {
  let w = 0
  const n = ball.points.length

  ball.points.forEach((p, i) => {
    if (stringSteps(p) > within) return
    for (let j = 0; j < 576; j++) w += (s.re[i * 576 + j] as number) ** 2 + (s.im[i * 576 + j] as number) ** 2
  })
  for (let j = 0; j < 24; j++) w += (s.re[n * 576 + j] as number) ** 2 + (s.im[n * 576 + j] as number) ** 2

  return w
}

// the weight at each string length 0 .. radius (stores at 0)
export function stringProfile(ball: Ball, s: MesonState): number[] {
  const out = new Array<number>(ball.radius + 1).fill(0)
  const n = ball.points.length

  ball.points.forEach((p, i) => {
    let w = 0

    for (let j = 0; j < 576; j++) w += (s.re[i * 576 + j] as number) ** 2 + (s.im[i * 576 + j] as number) ** 2
    out[stringSteps(p)]! += w
  })
  for (let j = 0; j < 24; j++) out[0]! += (s.re[n * 576 + j] as number) ** 2 + (s.im[n * 576 + j] as number) ** 2

  return out
}

export function scaleMeson(s: MesonState, f: number): void {
  for (let k = 0; k < s.re.length; k++) {
    s.re[k] = (s.re[k] as number) * f
    s.im[k] = (s.im[k] as number) * f
  }
}

export const cloneMeson = (s: MesonState): MesonState => ({ re: Float64Array.from(s.re), im: Float64Array.from(s.im) })

// a start: both vibes in their dock's singlet mode (every slot pair alike, the two slots distinct at y = 0), with the
// weight exp(-(V / ell)^(3/2)) on string length V (the linear well's tail), normalized; no store
export function mesonStart(ball: Ball, ell: number): MesonState {
  const s = newMeson(ball)
  const origin = ball.index.get('0,0,0,0') as number

  ball.points.forEach((p, i) => {
    const a = Math.exp(-((stringSteps(p) / ell) ** 1.5))

    for (let l = 0; l < 24; l++) for (let f = 0; f < 24; f++) if (i !== origin || l !== f) s.re[i * 576 + l * 24 + f] = a
  })

  normalizeMeson(s)

  return s
}

// the weight on each site's uniform slot pair (both vibes in the dock's singlet mode), summed
export function singletShare(ball: Ball, v: MesonState): number {
  let w = 0

  for (let i = 0; i < ball.points.length; i++) {
    let r = 0
    let im = 0

    for (let j = 0; j < 576; j++) {
      r += v.re[i * 576 + j] as number
      im += v.im[i * 576 + j] as number
    }
    w += (r * r + im * im) / 576
  }

  return w
}

export const storeWeight = (ball: Ball, v: MesonState): number => {
  let w = 0
  const n = ball.points.length

  for (let j = 0; j < 24; j++) w += (v.re[n * 576 + j] as number) ** 2 + (v.im[n * 576 + j] as number) ** 2

  return w
}

export function normalizeMeson(s: MesonState): number {
  const w = mesonWeight(s)

  scaleMeson(s, 1 / Math.sqrt(w))

  return w
}

// ---- the level: the beat alternates its contact map with the beat's parity (the collision's order), so the beat is
// periodic in TWO beats and a level is an eigenvector of U2 = U(1) U(0). Its phase per beat is half U2's, on the branch
// that the one-beat Rayleigh quotient <v|U(0) v> picks ----

// THE ENGINE: what beats a state. The one-thread engine is mesonBeat on fresh states; code/measure/meson-pool runs the
// same beat on worker threads over a pool of shared states (checked against this one by the caller)
export type MesonEngine = {
  space: MesonSpace
  // a state the engine can beat; give it back when done
  borrow(): MesonState
  give(s: MesonState): void
  beat(s: MesonState, out: MesonState, beat: number, flow?: CenterFlow): number
  close(): void
  threads: number
}

export function serialEngine(space: MesonSpace): MesonEngine {
  return {
    space,
    borrow: () => newMeson(space.ball),
    give: () => undefined,
    beat: (s, out, beat, flow) => mesonBeat(space, s, out, beat, flow),
    close: () => undefined,
    threads: 1,
  }
}

// an engine state holding a copy of v
function borrowed(engine: MesonEngine, v: MesonState): MesonState {
  const s = engine.borrow()

  s.re.set(v.re)
  s.im.set(v.im)

  return s
}

// two beats from parity 0, in place through a scratch state; returns the weight absorbed
export function twoBeats(engine: MesonEngine, s: MesonState, scratch: MesonState): number {
  const a = engine.beat(s, scratch, 0)
  const b = engine.beat(scratch, s, 1)

  return a + b
}

const BH = [0.35875, 0.48829, 0.14128, 0.01168]

// the Blackman-Harris window over S points (sidelobes under -92 dB)
export const blackmanHarris = (s: number, S: number): number => {
  const x = (2 * Math.PI * s) / (S - 1)

  return (BH[0] as number) - (BH[1] as number) * Math.cos(x) + (BH[2] as number) * Math.cos(2 * x) - (BH[3] as number) * Math.cos(3 * x)
}

// v = sum_(s < S) w_s e^(-i phase2 s) U2^s psi, normalized: the part of psi at U2's phase phase2, within the window's
// main lobe (half width 8 pi / S in phase2)
export function filterMeson(engine: MesonEngine, psi: MesonState, phase2: number, S: number): MesonState {
  const v = newMeson(engine.space.ball)
  const s = borrowed(engine, psi)
  const scratch = engine.borrow()

  for (let t = 0; t < S; t++) {
    if (t > 0) twoBeats(engine, s, scratch)

    const w = blackmanHarris(t, S)
    const c = Math.cos(-phase2 * t) * w
    const sn = Math.sin(-phase2 * t) * w

    for (let k = 0; k < v.re.length; k++) {
      const xr = s.re[k] as number
      const xi = s.im[k] as number

      if (xr === 0 && xi === 0) continue
      v.re[k] = (v.re[k] as number) + xr * c - xi * sn
      v.im[k] = (v.im[k] as number) + xr * sn + xi * c
    }
  }

  engine.give(s)
  engine.give(scratch)
  normalizeMeson(v)

  return v
}

// the level's quotients: lambda2 = <v|U2 v> (|lambda2| < 1 by the absorbed weight and the residual), the residual
// |U2 v - lambda2 v|, the one-beat quotient lambda1 = <v|U(0) v>, and the phase per beat: half arg lambda2 on the
// branch nearest arg lambda1
export type LevelRead = { lambda2: [number, number]; residual: number; lambda1: [number, number]; phase: number }

export function readLevel(engine: MesonEngine, v: MesonState): LevelRead {
  const zero = borrowed(engine, v)
  const one = engine.borrow()

  engine.beat(zero, one, 0)

  const lambda1 = mesonInner(v, one)

  engine.beat(one, zero, 1)

  const two = zero
  const lambda2 = mesonInner(v, two)
  let r = 0

  for (let k = 0; k < v.re.length; k++) {
    const er = (two.re[k] as number) - (lambda2[0] * (v.re[k] as number) - lambda2[1] * (v.im[k] as number))
    const ei = (two.im[k] as number) - (lambda2[0] * (v.im[k] as number) + lambda2[1] * (v.re[k] as number))

    r += er * er + ei * ei
  }

  engine.give(zero)
  engine.give(one)

  const half = Math.atan2(lambda2[1], lambda2[0]) / 2
  const p1 = Math.atan2(lambda1[1], lambda1[0])
  const wrapped = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x))
  const phase = Math.abs(wrapped(half - p1)) <= Math.abs(wrapped(half + Math.PI - p1)) ? half : wrapped(half + Math.PI)

  return { lambda2, residual: Math.sqrt(r), lambda1, phase }
}

// a level from a start: the filter at the guessed phase per beat, then again from its output at the read phase
// (`passes` in all); the vector and its reading
export function buildLevel(engine: MesonEngine, start: MesonState, phase: number, S: number, passes = 2): { v: MesonState; read: LevelRead } {
  let v = filterMeson(engine, start, 2 * phase, S)
  let read = readLevel(engine, v)

  for (let p = 1; p < passes; p++) {
    v = filterMeson(engine, v, 2 * read.phase, S)
    read = readLevel(engine, v)
  }

  return { v, read }
}

// THE HOLD WITNESS: from the level v, `beats` beats; the least weight at string length <= window (stores included) at
// any beat, the least fidelity |<v|psi_t>|^2 at the even beats (the level's period), and the weight absorbed
export type Hold = { leastWindow: number; leastFidelity: number; absorbed: number; fidelity: number[] }

// `within`, when given, reads the window weight in place of the string-length window (E-SPN-0155's husk radius)
export function watchLevel(engine: MesonEngine, v: MesonState, beats: number, window: number, within?: (s: MesonState) => number): Hold {
  let a = borrowed(engine, v)
  let b = engine.borrow()
  let absorbed = 0
  let leastWindow = 1
  let leastFidelity = 1
  const fidelity: number[] = []

  for (let t = 0; t < beats; t++) {
    absorbed += engine.beat(a, b, t)
    ;[a, b] = [b, a]
    leastWindow = Math.min(leastWindow, within ? within(a) : weightWithin(engine.space.ball, a, window))

    if ((t + 1) % 2 === 0) {
      const f = mesonInner(v, a)
      const x = f[0] * f[0] + f[1] * f[1]

      fidelity.push(x)
      leastFidelity = Math.min(leastFidelity, x)
    }
  }

  engine.give(a)
  engine.give(b)

  return { leastWindow, leastFidelity, absorbed, fidelity }
}

// the level's group velocity by Hellmann-Feynman: the weight-mean center-of-mass step (r_l + r_f) / 2 over its two
// beats, per beat (coordinate units). For U2 v = lambda2 v, d phase2 / dK = -(step 0 + step 1), so the per-beat
// phase's slope is minus this and E = -phase moves with it
export function levelVelocity(engine: MesonEngine, v: MesonState): number[] {
  const f0 = newFlow()
  const f1 = newFlow()
  const zero = borrowed(engine, v)
  const one = engine.borrow()

  engine.beat(zero, one, 0, f0)
  engine.beat(one, zero, 1, f1)
  engine.give(zero)
  engine.give(one)

  return [0, 1, 2, 3].map(k => ((f0.v[k] as number) / f0.weight + (f1.v[k] as number) / f1.weight) / 2)
}

// ---- the checks E-SPN-0146 and E-SPN-0147 share ----

// the largest |C^dag C - I| entry of a contact map over its live states (a unitarity check on the 576 live states)
export function contactUnitarity(M: CMat, live: readonly number[]): number {
  let worst = 0

  for (const a of live) {
    for (const b of live) {
      let r = 0
      let im = 0

      for (let t = 0; t < M.n; t++) {
        const ar = M.re[t * M.n + a] as number
        const ai = -(M.im[t * M.n + a] as number)
        const br = M.re[t * M.n + b] as number
        const bi = M.im[t * M.n + b] as number

        r += ar * br - ai * bi
        im += ar * bi + ai * br
      }
      worst = Math.max(worst, Math.hypot(r - (a === b ? 1 : 0), im))
    }
  }

  return worst
}

// the one-beat box starts: every live contact state (a love and a fear at dock X, or a store there, y = 0), and every
// slot pair with the love at X and the fear at Xf (relative position y)
export function boxStarts(live: readonly number[], X: number, Xf: number, y: readonly number[]): { start: BoxStart; y: number[] }[] {
  const starts: { start: BoxStart; y: number[] }[] = []

  for (const i of live) starts.push({ start: i < STORE_BASE ? { love: [X, Math.floor(i / 24)], fear: [X, i % 24] } : { store: [X, (i - STORE_BASE) >> 1, (i - STORE_BASE) & 1 ? -1 : 1] }, y: [0, 0, 0, 0] })
  for (let l = 0; l < 24; l++) for (let f = 0; f < 24; f++) starts.push({ start: { love: [X, l], fear: [Xf, f] }, y: [...y] })

  return starts
}

// one beat of the rule (swapMixedBeat on the empty box at the unit a start's string length reads, unitOf(V)) against the
// meson beat of `space` from every start, both parities: the worst entry, how many differ beyond `tolerance`, and the
// rule's inexact divisions and stray branches
export function boxCheck(box: LockedTables, starts: readonly { start: BoxStart; y: number[] }[], space: MesonSpace, unitOf: (V: number) => RingUnit, tolerance: number, v?: RingUnit): { worst: number; differ: number; checked: number; inexact: number; stray: number } {
  let worst = 0
  let differ = 0
  let checked = 0
  let inexact = 0
  let stray = 0

  for (const beat of [0, 1]) {
    for (const { start, y } of starts) {
      const r = boxOneBeat(box, unitOf(stringSteps(y)), start, beat, v)
      const g = ampGap(r.amps, modelOneBeat(space, box, start, y, beat))

      worst = Math.max(worst, g)
      if (g > tolerance) differ++
      inexact += r.inexact
      stray += r.stray
      checked++
    }
  }

  return { worst, differ, checked, inexact, stray }
}

// the vacuum under the exact rule at unit u for `beats` beats: the empty box (sea 0) or the love sea (sea 1) of a side.
// exact: one branch equal to the vacuum with amplitude S^cells (F^cells) every beat; charged: slots that differ from the
// vacuum's value; permutes: dock-beats where the collision's permutation moves a value onto a slot of another value (a
// formal permutation of equal values, which the bounce table returns on empty and full docks, changes nothing)
export function vacuumRun(u: RingUnit, side: number, sea: number, beats: number, v?: RingUnit): { side: number; sea: number; cells: number; exact: boolean; permutes: number; charged: number } {
  const tab = flatBoxTables(side)
  const c0 = seaConfiguration(tab.cells, sea)
  // a full dock takes the ring mixer's sea factor and, with the odd-octet piece, 12 num^8 (det G8 = v^8 over its scale)
  const oddFull: [bigint, bigint] = v ? eisMul([12n, 0n], eisPow([v.num[0], v.num[1]], 8)) : [1n, 0n]
  const factor = sea === 0 ? ([pieceScale(u, v) ** BigInt(tab.cells), 0n] as [bigint, bigint]) : ePow(eisMul(seaFactor(u), oddFull), tab.cells)
  const perm = new Int32Array(24)
  let s: LockedState = lockedState(c0)
  let exact = true
  let permutes = 0
  let charged = 0

  for (let t = 0; t < beats; t++) {
    s = v ? oddPhasedBeat('none', tab, s, t, u, v) : swapMixedBeat('none', tab, s, t, u)

    const br = s.branches[0] as Branch

    if (s.branches.length !== 1 || !sameConfiguration(br, c0) || br.k !== 0 || br.a !== factor[0] || br.b !== factor[1]) {
      exact = false
      break
    }

    for (let i = 0; i < tab.cells * 24; i++) if (br.vibe[i] !== c0.vibe[i]) charged++
    for (let x = 0; x < tab.cells; x++) if (bouncePermutation(BOUNCE_TABLE, 'pass', br.vibe, x * 24, perm) !== 0 && [...perm].some((to, d) => br.vibe[x * 24 + to] !== br.vibe[x * 24 + d])) permutes++

    br.a = 1n
    br.b = 0n
  }

  return { side, sea, cells: tab.cells, exact, permutes, charged }
}

// THE TAIL READING of a level's string profile: the successive ratios r(V) = w(V + 1) / w(V) from V = `from` while
// w(V) >= `floor` (under it the float's noise floor sets the ratio); `rises` counts the V where r(V + 1) > (1 + slack)
// r(V) (a bound state's tail falls ever faster; an outgoing tail's ratio climbs back toward a constant); `edge` the
// weight on the two outermost shells
export function profileTail(profile: readonly number[], from: number, floor: number, slack: number): { ratios: number[]; rises: number; edge: number } {
  const ratios: number[] = []

  for (let V = from; V + 1 < profile.length && (profile[V] as number) >= floor; V++) ratios.push((profile[V + 1] as number) / (profile[V] as number))

  let rises = 0

  for (let k = 1; k < ratios.length; k++) if ((ratios[k] as number) > (1 + slack) * (ratios[k - 1] as number)) rises++

  const n = profile.length

  return { ratios, rises, edge: (profile[n - 1] as number) + (profile[n - 2] as number) }
}
