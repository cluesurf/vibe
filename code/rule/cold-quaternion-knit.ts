// The cold quaternion knit (E-RLT-0054): the quaternion knit's Q8 structure (code/rule/quaternion-knit,
// E-RLT-0051) on a cold vacuum with a kinetic threshold (the idea of code/rule/cold-weave, E-FLD-0032).
//
// The quaternion knit clocks its vacuum: every calm couple becomes a like pair on each of its two lines
// (four tones out of nothing) and back, every three beats, and a lone tone breaks that clock and dresses
// without bound (E-RLT-0051, E-CMP-0015). Here the clock is PAID and the vacuum is COLD:
//
//   E   = sum over tones of (1 + store) + sum of the couple counters
//   P   = sum over tones of the root
//   P_E = sum over tones of (1 + store) times the root
//
// Every tone carries a kinetic store (a whole number at least 0, zero on every calm slot) that streams and
// moves with it; every couple of every dock has a counter (a whole number at least 0) that stays in the
// dock. The beat at every dock and every beat is C = T E B E T, with
//
// - B, the paid couple clock. On a couple whose four slots all hold store 0, at level L = (tones on the
//   couple) + counter, the couple's table T (QUATERNION_TABLES, read in the couple's Q8 frame) is followed
//   to the FIRST state of its cycle that the level can pay for (at most L tones), and the counter keeps the
//   rest. That first-return map is a bijection on each level, so B is a bijection; it keeps E, charge and
//   both line momenta (T does), and with an empty counter a calm couple stays calm: the vacuum is cold. A
//   couple any of whose tones carries kinetic energy is left alone, as the cold weave's clock is.
// - E, the quaternion knit's exchange of two lone like tones on the eight free lines, taken only when the
//   two tones' stores are equal (e_u + e_v = e_w + e_x, so P_E is kept exactly then), stores moving with
//   the tones. An involution.
// - T, THE THRESHOLD. Q8 permutes the six couples in two orbits, four couples joining the frozen frame to
//   the frame e1 +- e3, e2 +- e4, and two lying in the frame e1 +- e4, e2 +- e3. Each couple c of the first
//   orbit has a payer line A(c) on the second orbit's lines, A a Q8-equivariant bijection (PAYERS). When A(c)
//   holds a like pair head on (sign s on both slots), each with a store of at least 2, and c is calm, c
//   becomes the vacuum's first clock state X_s (the like pair (s, s) on its plus line and (-s, -s) on its
//   minus line, in its frame), with stores 0, and each payer store gives up 2. The reverse: A(c) holding the
//   same like pair and c holding X_s with stores 0, c is calmed and each payer store gains 2. The two
//   classes map into each other, so each couple's move is an involution; no move reads what another
//   writes (payers sit on second-orbit lines, which no threshold writes, and distinct couples have distinct
//   payers), so they commute and T is an involution. It keeps E (four units of kinetic energy become four
//   masses), charge, P, P_E and every line momentum. Two tones that bring less than two units each make
//   nothing, and a lone tone never pays (P_E would move).
// The second orbit's couples have no single payer line their stabilizer fixes, so they make nothing from
// kinetic energy; their clock runs only on what their counters receive from annihilation.
//
// CPT: negating every tone (stores and counters kept) maps T and E to themselves and B to its inverse (the
// tables are N J with J an involution, and the first return of the inverse table is the inverse of the
// first return), so N C N = C^-1 at the identity coin map. Q8 (with its tone twist) commutes with every
// move by construction, checked in E-RLT-0054 on random states with stores and counters.
//
// The lone tone makes nothing, structurally: a threshold needs a like pair head on, B with an empty counter
// is the table restricted to states of at most one tone, which T keeps within the tone's own line momentum
// class, and E needs two tones.
//
// ROLE POINTS AND TOKENS (optional labels, for local color and the fear beat of E-RLT-0055). Every slot
// holds a role point; its weight is the tone, or on a calm slot its side sign. Every move keeps the side sum
// D and the charge, hence the number of +1 weights in the dock, and carries labels by the one rule that keeps
// every label's weight: a slot whose weight is unchanged keeps its label, and the slots whose weight turns
// from +1 to -1 swap labels, in frame order, with those turning from -1 to +1 (in E, a moved tone's label goes
// with it). The rule depends only on the states before and after, so the backward move undoes it.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { type Mesh } from '@/code/tool/mesh'
import {
  EXCHANGE_LINES,
  QUATERNION_COUPLES,
  QUATERNION_TABLES,
  coupleFrames,
  coupleState,
  coupleTones,
  forcedFunctionals,
  invertCoupleTable,
  quaternionGroup,
  twistOf,
} from '@/code/rule/quaternion-knit'
import { rotationMaps, scatterDock, scatterMoves, type ScatterMeeting, type ScatterSet } from '@/code/rule/cold-scatter'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
const FIRSTS: number[] = []
const LINE_OF: number[] = []

ROOTS.forEach((_, d) => {
  if (d < (OPPOSITE[d] ?? d)) {
    LINE_OF[d] = FIRSTS.length
    LINE_OF[OPPOSITE[d] ?? d] = FIRSTS.length
    FIRSTS.push(d)
  }
})

export const COLD_SIDE: readonly number[] = ROOTS.map((_, d) => (d < (OPPOSITE[d] ?? d) ? 1 : -1))
export const COLD_FIRSTS: readonly number[] = FIRSTS
export const COLD_LINE_OF: readonly number[] = LINE_OF
export const COLD_OPPOSITE: readonly number[] = OPPOSITE

const FRAMES = coupleFrames()
export const COUPLE_ORBIT: readonly number[] = FRAMES.map(f => f.orbit)

// the couple each line belongs to
export const COUPLE_OF_LINE: readonly number[] = (() => {
  const out = new Array<number>(12).fill(-1)

  QUATERNION_COUPLES.forEach(([p, m], c) => {
    out[p] = c
    out[m] = c
  })

  return out
})()

const MASS = Array.from({ length: 81 }, (_, k) => coupleTones(k).reduce((s, x) => s + Math.abs(x), 0))
const TONES_OF = Array.from({ length: 81 }, (_, k) => coupleTones(k))

// the first-return tables: FIRST_RETURN[direction][orbit][level][state], level 0..4 (4 or more is the table)
function firstReturn(table: readonly number[]): number[][] {
  return [0, 1, 2, 3, 4].map(level =>
    Array.from({ length: 81 }, (_, k) => {
      if ((MASS[k] ?? 0) > level) {
        return k
      }

      let x = table[k] ?? k

      while ((MASS[x] ?? 0) > level) {
        x = table[x] ?? x
      }

      return x
    }),
  )
}

const FORWARD_TABLES = QUATERNION_TABLES.map(t => [...t])
const BACKWARD_TABLES = FORWARD_TABLES.map(invertCoupleTable)
const FIRST_RETURN = [FORWARD_TABLES.map(firstReturn), BACKWARD_TABLES.map(firstReturn)]

// the exchange partners of code/rule/quaternion-knit (buildPartners, not exported there), rebuilt the same
// way: pairs of lone directions on the free lines whose class (equal root sum, equal forced functionals) has
// exactly two members
const PARTNER: Int32Array = (() => {
  const rows = forcedFunctionals()
  const partner = new Int32Array(24 * 24).fill(-1)
  const classes = new Map<string, [number, number][]>()

  for (let u = 0; u < 24; u++) {
    for (let v = u + 1; v < 24; v++) {
      const lu = LINE_OF[u] ?? 0
      const lv = LINE_OF[v] ?? 0

      if (lu === lv || !EXCHANGE_LINES.includes(lu) || !EXCHANGE_LINES.includes(lv)) continue

      const n = new Array<number>(12).fill(0)

      n[lu] = (n[lu] ?? 0) + (COLD_SIDE[u] ?? 0)
      n[lv] = (n[lv] ?? 0) + (COLD_SIDE[v] ?? 0)

      const sum = [0, 1, 2, 3].map(c => (ROOTS[u]?.[c] ?? 0) + (ROOTS[v]?.[c] ?? 0))
      const values = rows.map(r => r.reduce((a, c, l) => a + c * (n[l] ?? 0), 0))
      const k = `${sum.join(',')}|${values.join(',')}`

      classes.set(k, [...(classes.get(k) ?? []), [u, v]])
    }
  }

  for (const members of classes.values()) {
    if (members.length !== 2) continue

    const [a, b] = members

    if (!a || !b) continue

    partner[a[0] * 24 + a[1]] = b[0] * 24 + b[1]
    partner[a[1] * 24 + a[0]] = b[0] * 24 + b[1]
    partner[b[0] * 24 + b[1]] = a[0] * 24 + a[1]
    partner[b[1] * 24 + b[0]] = a[0] * 24 + a[1]
  }

  return partner
})()

// The Q8-equivariant payer maps: for each couple, a line of the other orbit (or -1 for the second orbit's
// couples), with g A(c) = A(g c) for every g in Q8 acting on lines. Every such map, for the search in
// E-RLT-0054.
export function payerMaps(): number[][] {
  const group = quaternionGroup()
  const lineImage = (g: readonly number[], l: number): number => LINE_OF[g[FIRSTS[l] ?? 0] ?? 0] ?? 0
  const coupleImage = (g: readonly number[], c: number): number => {
    const [p] = QUATERNION_COUPLES[c] ?? [0, 0]

    return COUPLE_OF_LINE[lineImage(g, p)] ?? -1
  }
  const first = COUPLE_ORBIT.map((o, c) => (o === 0 ? c : -1)).filter(c => c >= 0)
  const targets = COUPLE_ORBIT.flatMap((o, c) => (o === 1 ? [...(QUATERNION_COUPLES[c] ?? [])] : []))
  const out: number[][] = []
  const rep = first[0] ?? 0

  for (const line of targets) {
    const map = new Array<number>(6).fill(-1)
    let ok = true

    for (const g of group) {
      const c = coupleImage(g, rep)
      const l = lineImage(g, line)

      if (map[c] === -1) {
        map[c] = l
      } else if (map[c] !== l) {
        ok = false
      }
    }

    if (ok && first.every(c => map[c] !== -1) && new Set(first.map(c => map[c])).size === first.length) {
      out.push(map)
    }
  }

  return out
}

export type SignRule = 'plain' | 'twisted'

// E-RLT-0056: the rich exchange of Q8, every quad its forced functionals allow and the head-on rotation along
// the first line involution commuting with Q8 (code/rule/cold-scatter)
export function quaternionScatter(): ScatterSet {
  const table = QUATERNION_ROTATION_SOURCE()
  const group = quaternionGroup()

  return scatterMoves({ group, forms: forcedFunctionals(), rotation: rotationMaps({ permutations: table, group })[0] })
}

const QUATERNION_ROTATION_SOURCE = (): number[][] => weylF4DirectionPermutations({ directions: ROOTS })

export type ColdQuaternionOptions = {
  // 'quaternion' (the default): T E B E T; 'scatter': one scattering involution alone, for any group
  // (E-RLT-0057), with no clock, no threshold and no counters in use
  readonly mode?: 'quaternion' | 'scatter'
  // the scattering set: the rich exchange in place of E in 'quaternion' mode, the whole beat in 'scatter'
  readonly scatter?: ScatterSet
  // the payer line of each couple (-1: none), a Q8-equivariant bijection from the first orbit
  readonly payers?: readonly number[]
  // how the payer's tone s sets the made state's sign in the couple's frame: 'twisted' (the default) the
  // frame's twist times s, the only one that commutes with Q8 (E-RLT-0054); 'plain' s, a control
  readonly signRule?: SignRule
  // the threshold on (the default) or off (the paid quaternion knit with stores, a control)
  readonly threshold?: boolean
  // the exchange on (the default) or off
  readonly exchange?: boolean
  // units each payer gives (the default 2)
  readonly price?: number
}

export type ColdQuaternionKnit = {
  readonly mode: 'quaternion' | 'scatter'
  readonly scatter: ScatterSet | undefined
  // counts of fired moves and of docks where the rich exchange was blocked (overlapping or unstable)
  readonly tally: { fired: number; blocked: number }
  readonly payers: readonly number[]
  readonly signRule: SignRule
  readonly threshold: boolean
  readonly exchange: boolean
  readonly price: number
}

export const DEFAULT_PAYERS_INDEX = 0

export function makeColdQuaternionKnit(options: ColdQuaternionOptions = {}): ColdQuaternionKnit {
  return {
    mode: options.mode ?? 'quaternion',
    scatter: options.scatter,
    tally: { fired: 0, blocked: 0 },
    payers: options.payers ?? payerMaps()[DEFAULT_PAYERS_INDEX] ?? [],
    signRule: options.signRule ?? 'twisted',
    threshold: options.threshold ?? true,
    exchange: options.exchange ?? true,
    price: options.price ?? 2,
  }
}

// the whole state: per slot a tone, a store and optional labels; per dock six counters
export type ColdQuaternionState = {
  readonly vibe: Int8Array
  readonly store: Int32Array
  readonly counter: Int32Array
  readonly role?: Int8Array
  readonly token?: Int32Array
}

// A meeting of two tokens and the tones they held, in the forward sense (E-RLT-0055): a move that changes
// a footprint holding exactly two vibes, the couple clock on a couple ('clock') or the exchange of two lone
// tones ('exchange'). A clock move on a couple holding three or four vibes is listed as 'many', with no
// tokens, and records no meeting.
export type ColdMeeting = {
  readonly tokens: readonly [number, number]
  readonly signs: readonly [number, number]
  readonly kind: 'clock' | 'exchange' | 'many' | 'quad' | 'rotation'
}

type Arrays = {
  vibe: Int8Array
  store: Int32Array
  counter: Int32Array
  role: Int8Array | undefined
  token: Int32Array | undefined
}

function swapLabels(a: Arrays, i: number, j: number): void {
  if (a.role) {
    const r = a.role[i] ?? 0

    a.role[i] = a.role[j] ?? 0
    a.role[j] = r
  }

  if (a.token) {
    const r = a.token[i] ?? 0

    a.token[i] = a.token[j] ?? 0
    a.token[j] = r
  }
}

const weightOf = (tone: number, d: number): number => (tone !== 0 ? tone : (COLD_SIDE[d] ?? 1))

// carry labels over a move on the listed dock slots (in frame order), from the tones before to the tones
// now in `a`
function carryLabels(a: Arrays, base: number, slots: readonly number[], before: readonly number[]): void {
  if (!a.role && !a.token) {
    return
  }

  const down: number[] = []
  const up: number[] = []

  slots.forEach((d, i) => {
    const w0 = weightOf(before[i] ?? 0, d)
    const w1 = weightOf(a.vibe[base + d] ?? 0, d)

    if (w0 === 1 && w1 === -1) down.push(base + d)
    if (w0 === -1 && w1 === 1) up.push(base + d)
  })

  if (down.length !== up.length) {
    throw new Error('cold quaternion knit: a move changed the dock weight count')
  }

  down.forEach((i, k) => swapLabels(a, i, up[k] ?? i))
}

const SCRATCH = [0, 0, 0, 0]
const BEFORE = [0, 0, 0, 0]

function clock(a: Arrays, base: number, dock: number, direction: 0 | 1, meetings: ColdMeeting[] | undefined): void {
  const returns = FIRST_RETURN[direction] ?? []

  for (let c = 0; c < 6; c++) {
    const frame = FRAMES[c]

    if (!frame) continue

    const slots = frame.slots
    let mass = 0
    let busy = false

    for (let i = 0; i < 4; i++) {
      const at = base + (slots[i] ?? 0)
      const v = a.vibe[at] ?? 0

      SCRATCH[i] = frame.twist * v
      BEFORE[i] = v
      mass += v !== 0 ? 1 : 0
      busy = busy || (a.store[at] ?? 0) !== 0
    }

    if (busy) continue

    const counterAt = dock * 6 + c
    const level = mass + (a.counter[counterAt] ?? 0)
    const k = coupleState(SCRATCH)
    const next = returns[frame.orbit]?.[Math.min(level, 4)]?.[k] ?? k

    if (next === k) continue

    const out = TONES_OF[next] ?? [0, 0, 0, 0]

    a.counter[counterAt] = level - (MASS[next] ?? 0)

    // the forward-sense state before the move is the state now going forward and the result going
    // backward; its tokens are read before the labels move going forward and after going backward
    const tokensBefore = meetings && a.token && direction === 0 ? slots.map(d => a.token?.[base + d] ?? 0) : undefined
    const beforeTones = [...BEFORE]

    for (let i = 0; i < 4; i++) {
      a.vibe[base + (slots[i] ?? 0)] = frame.twist * (out[i] ?? 0)
    }

    carryLabels(a, base, slots, BEFORE)

    if (meetings && a.token) {
      const pre = direction === 0 ? beforeTones : slots.map(d => a.vibe[base + d] ?? 0)
      const tokens = tokensBefore ?? slots.map(d => a.token?.[base + d] ?? 0)
      const held = [0, 1, 2, 3].filter(i => (pre[i] ?? 0) !== 0)

      if (held.length === 2) {
        const [i, j] = held as [number, number]

        meetings.push({ tokens: [tokens[i] ?? 0, tokens[j] ?? 0], signs: [pre[i] ?? 0, pre[j] ?? 0], kind: 'clock' })
      } else if (held.length > 2) {
        meetings.push({ tokens: [-1, -1], signs: [0, 0], kind: 'many' })
      }
    }
  }
}

function exchange(a: Arrays, base: number, meetings: ColdMeeting[] | undefined): void {
  let first = -1
  let second = -1
  let lone = 0

  for (const l of EXCHANGE_LINES) {
    const d = FIRSTS[l] ?? 0
    const o = OPPOSITE[d] ?? 0
    const x = a.vibe[base + d] ?? 0
    const y = a.vibe[base + o] ?? 0

    if ((x === 0) !== (y === 0)) {
      lone++

      const held = x !== 0 ? d : o

      if (first < 0) first = held
      else second = held
    }
  }

  if (lone !== 2) return

  const tone = a.vibe[base + first] ?? 0

  if ((a.vibe[base + second] ?? 0) !== tone) return
  if ((a.store[base + first] ?? 0) !== (a.store[base + second] ?? 0)) return

  const target = PARTNER[first * 24 + second] ?? -1

  if (target < 0) return

  const w = Math.floor(target / 24)
  const x = target % 24

  for (const d of [w, x]) {
    if ((a.vibe[base + d] ?? 0) !== 0 || (a.vibe[base + (OPPOSITE[d] ?? 0)] ?? 0) !== 0) return
  }

  // the tones' labels go with them, each to the target of its own side (D is kept, so one pairing fits)
  const straight = COLD_SIDE[first] === COLD_SIDE[w] && COLD_SIDE[second] === COLD_SIDE[x]
  const to = straight ? [w, x] : [x, w]
  const store = a.store[base + first] ?? 0

  if (!straight && !(COLD_SIDE[first] === COLD_SIDE[x] && COLD_SIDE[second] === COLD_SIDE[w])) {
    throw new Error('cold quaternion knit: an exchange with no side-keeping pairing')
  }

  if (meetings && a.token) {
    meetings.push({ tokens: [a.token[base + first] ?? 0, a.token[base + second] ?? 0], signs: [tone, tone], kind: 'exchange' })
  }

  ;[first, second].forEach((from, k) => {
    const into = to[k] ?? from

    a.vibe[base + from] = 0
    a.store[base + from] = 0
    a.vibe[base + into] = tone
    a.store[base + into] = store
    swapLabels(a, base + from, base + into)
  })
}

const X_FRAME = [1, 1, -1, -1]

function threshold(a: Arrays, base: number, knit: ColdQuaternionKnit): void {
  for (let c = 0; c < 6; c++) {
    const payer = knit.payers[c] ?? -1
    const frame = FRAMES[c]

    if (payer < 0 || !frame) continue

    const p0 = base + (FIRSTS[payer] ?? 0)
    const p1 = base + (OPPOSITE[FIRSTS[payer] ?? 0] ?? 0)
    const s = a.vibe[p0] ?? 0

    if (s === 0 || (a.vibe[p1] ?? 0) !== s) continue

    const sign = knit.signRule === 'plain' ? s : frame.twist * s
    let calm = true
    let made = true

    for (let i = 0; i < 4; i++) {
      const at = base + (frame.slots[i] ?? 0)
      const v = a.vibe[at] ?? 0

      BEFORE[i] = v
      calm = calm && v === 0
      made = made && frame.twist * v === sign * (X_FRAME[i] ?? 0) && (a.store[at] ?? 0) === 0
    }

    if (calm && (a.store[p0] ?? 0) >= knit.price && (a.store[p1] ?? 0) >= knit.price) {
      for (let i = 0; i < 4; i++) a.vibe[base + (frame.slots[i] ?? 0)] = frame.twist * sign * (X_FRAME[i] ?? 0)

      a.store[p0] = (a.store[p0] ?? 0) - knit.price
      a.store[p1] = (a.store[p1] ?? 0) - knit.price
    } else if (made) {
      for (let i = 0; i < 4; i++) a.vibe[base + (frame.slots[i] ?? 0)] = 0

      a.store[p0] = (a.store[p0] ?? 0) + knit.price
      a.store[p1] = (a.store[p1] ?? 0) + knit.price
    } else {
      continue
    }

    carryLabels(a, base, frame.slots, BEFORE)
  }
}

// one dock's collision, forward (C) or backward (C^-1), in place on the arrays; meetings are appended in
// the order the moves ran
export function coldQuaternionCollide(
  knit: ColdQuaternionKnit,
  a: Arrays,
  dock: number,
  forward: boolean,
  meetings?: ColdMeeting[],
): void {
  const base = dock * 24
  const rich = knit.scatter
  const scatter = (): void => {
    if (rich) scatterDock(rich, a, base, forward, meetings as ScatterMeeting[] | undefined, knit.tally)
    else if (knit.exchange) exchange(a, base, meetings)
  }

  if (knit.mode === 'scatter') {
    scatter()
    return
  }

  if (knit.threshold) threshold(a, base, knit)

  scatter()
  clock(a, base, dock, forward ? 0 : 1, meetings)
  scatter()

  if (knit.threshold) threshold(a, base, knit)
}

export type ColdQuaternionLattice = {
  readonly mesh: Mesh
  readonly knit: ColdQuaternionKnit
  // target[i]: the slot slot i streams into
  readonly target: Int32Array
}

export function makeColdQuaternionLattice(mesh: Mesh, knit: ColdQuaternionKnit): ColdQuaternionLattice {
  const target = new Int32Array(mesh.cellCount * 24)

  for (let x = 0; x < mesh.cellCount; x++) {
    if (!ROOTS.every((_, d) => mesh.opposite(d) === OPPOSITE[d])) {
      throw new Error('the cold quaternion knit needs the rootsD4 direction order')
    }

    for (let d = 0; d < 24; d++) {
      target[x * 24 + d] = mesh.neighbour(x, d) * 24 + d
    }
  }

  return { mesh, knit, target }
}

export function emptyColdState(mesh: Mesh, labels = false): ColdQuaternionState {
  const n = mesh.cellCount * 24

  return {
    vibe: new Int8Array(n),
    store: new Int32Array(n),
    counter: new Int32Array(mesh.cellCount * 6),
    role: labels ? new Int8Array(n) : undefined,
    token: labels ? Int32Array.from({ length: n }, (_, i) => i) : undefined,
  }
}

const copyArrays = (s: ColdQuaternionState): Arrays => ({
  vibe: Int8Array.from(s.vibe),
  store: Int32Array.from(s.store),
  counter: Int32Array.from(s.counter),
  role: s.role ? Int8Array.from(s.role) : undefined,
  token: s.token ? Int32Array.from(s.token) : undefined,
})

// one beat: every dock collides, then every slot streams. `crossings` receives [token, slot] for every
// token streaming out of a slot, when tokens are carried
export function coldQuaternionBeat(
  lattice: ColdQuaternionLattice,
  state: ColdQuaternionState,
  record?: { meetings: ColdMeeting[]; crossings?: [number, number][] },
): ColdQuaternionState {
  const a = copyArrays(state)

  for (let x = 0; x < lattice.mesh.cellCount; x++) {
    coldQuaternionCollide(lattice.knit, a, x, true, record?.meetings)
  }

  const n = a.vibe.length
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)
  const role = a.role ? new Int8Array(n) : undefined
  const token = a.token ? new Int32Array(n) : undefined

  for (let i = 0; i < n; i++) {
    const to = lattice.target[i] ?? 0

    vibe[to] = a.vibe[i] ?? 0
    store[to] = a.store[i] ?? 0

    if (role && a.role) role[to] = a.role[i] ?? 0
    if (token && a.token) {
      token[to] = a.token[i] ?? 0
      record?.crossings?.push([a.token[i] ?? 0, i])
    }
  }

  return { vibe, store, counter: a.counter, role, token }
}

// the collision alone at every dock (no stream), for instruments that read between the two
export function coldQuaternionCollideAll(lattice: ColdQuaternionLattice, state: ColdQuaternionState): ColdQuaternionState {
  const a = copyArrays(state)

  for (let x = 0; x < lattice.mesh.cellCount; x++) {
    coldQuaternionCollide(lattice.knit, a, x, true)
  }

  return { vibe: a.vibe, store: a.store, counter: a.counter, role: a.role, token: a.token }
}

// the stream alone
export function coldQuaternionStream(lattice: ColdQuaternionLattice, state: ColdQuaternionState): ColdQuaternionState {
  const n = state.vibe.length
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)

  for (let i = 0; i < n; i++) {
    const to = lattice.target[i] ?? 0

    vibe[to] = state.vibe[i] ?? 0
    store[to] = state.store[i] ?? 0
  }

  return { vibe, store, counter: state.counter }
}

// the exact inverse of coldQuaternionBeat: unstream, then the backward collision everywhere
export function coldQuaternionBeatBack(
  lattice: ColdQuaternionLattice,
  state: ColdQuaternionState,
  record?: { meetings: ColdMeeting[]; crossings?: [number, number][] },
): ColdQuaternionState {
  const n = state.vibe.length
  const a: Arrays = {
    vibe: new Int8Array(n),
    store: new Int32Array(n),
    counter: Int32Array.from(state.counter),
    role: state.role ? new Int8Array(n) : undefined,
    token: state.token ? new Int32Array(n) : undefined,
  }

  for (let i = 0; i < n; i++) {
    const from = lattice.target[i] ?? 0

    a.vibe[i] = state.vibe[from] ?? 0
    a.store[i] = state.store[from] ?? 0

    if (a.role && state.role) a.role[i] = state.role[from] ?? 0
    if (a.token && state.token) {
      a.token[i] = state.token[from] ?? 0
      record?.crossings?.push([state.token[from] ?? 0, i])
    }
  }

  for (let x = 0; x < lattice.mesh.cellCount; x++) {
    coldQuaternionCollide(lattice.knit, a, x, false, record?.meetings)
  }

  return { vibe: a.vibe, store: a.store, counter: a.counter, role: a.role, token: a.token }
}

// one dock's collision on a copy of a 24-slot state with its stores and six counters
export function collideDockCopy(
  knit: ColdQuaternionKnit,
  dock: { vibe: ArrayLike<number>; store: ArrayLike<number>; counter: ArrayLike<number>; role?: ArrayLike<number> },
  forward: boolean,
): { vibe: Int8Array; store: Int32Array; counter: Int32Array; role: Int8Array | undefined } {
  const a: Arrays = {
    vibe: Int8Array.from(dock.vibe),
    store: Int32Array.from(dock.store),
    counter: Int32Array.from(dock.counter),
    role: dock.role ? Int8Array.from(dock.role) : undefined,
    token: undefined,
  }

  coldQuaternionCollide(knit, a, 0, forward)

  return { vibe: a.vibe, store: a.store, counter: a.counter, role: a.role }
}

export function coldQuaternionEnergy(state: { vibe: ArrayLike<number>; store: ArrayLike<number>; counter: ArrayLike<number> }): number {
  let e = 0

  for (let i = 0; i < state.vibe.length; i++) {
    if (state.vibe[i] !== 0) {
      e += 1 + (state.store[i] ?? 0)
    }
  }

  for (let i = 0; i < state.counter.length; i++) {
    e += state.counter[i] ?? 0
  }

  return e
}

// P (count momentum) and P_E (energy current), 4-vectors
export function coldQuaternionMomenta(state: { vibe: ArrayLike<number>; store: ArrayLike<number> }): { p: number[]; pe: number[] } {
  const p = [0, 0, 0, 0]
  const pe = [0, 0, 0, 0]

  for (let i = 0; i < state.vibe.length; i++) {
    if (state.vibe[i] === 0) {
      continue
    }

    const e = ROOTS[i % 24] ?? []
    const w = 1 + (state.store[i] ?? 0)

    for (let k = 0; k < 4; k++) {
      p[k] = (p[k] ?? 0) + (e[k] ?? 0)
      pe[k] = (pe[k] ?? 0) + w * (e[k] ?? 0)
    }
  }

  return { p, pe }
}

// A Q8 element acting on one dock's state: slot d goes to g[d] with its tone times the element's twist and
// its store; couple c's counter goes to the couple holding g's image of c's plus line
export function actOnDock(
  g: readonly number[],
  dock: { vibe: ArrayLike<number>; store: ArrayLike<number>; counter: ArrayLike<number> },
): { vibe: Int8Array; store: Int32Array; counter: Int32Array } {
  const twist = twistOf(g)
  const vibe = new Int8Array(24)
  const store = new Int32Array(24)
  const counter = new Int32Array(6)

  for (let d = 0; d < 24; d++) {
    vibe[g[d] ?? 0] = twist * (dock.vibe[d] ?? 0)
    store[g[d] ?? 0] = dock.store[d] ?? 0
  }

  QUATERNION_COUPLES.forEach(([p], c) => {
    const image = COUPLE_OF_LINE[LINE_OF[g[FIRSTS[p] ?? 0] ?? 0] ?? 0] ?? 0

    counter[image] = dock.counter[c] ?? 0
  })

  return { vibe, store, counter }
}
