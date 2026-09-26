// The cold weave: the paid scatter weave with a cold vacuum and a kinetic threshold for making pairs
// (E-FLD-0032).
//
// E-FLD-0028 kept an exact energy by paying the pair clock from per-line demons, but a vacuum whose
// counters hold the pair mass is hot: it clocks, and it answers a lone love with a pair avalanche
// (E-FLD-0029). A cold vacuum has empty counters, so nothing is made from calm unless something brings the
// energy. Here every tone carries a kinetic store, a whole number at least zero that streams with it and
// moves with it in every exchange and scattering. The energy and the two momenta are
//
//   E   = sum over tones of (1 + store) + sum of the line counters
//   P   = sum over tones of the root                  (every mover counts one)
//   P_E = sum over tones of (1 + store) times the root (the energy current)
//
// Moves, in each dock, beat t:
// - the paid pair clock of code/rule/paid-weave on each couple's wire, taken only when both of the wire's
//   stores are 0 (a pair that carries kinetic energy is left alone, so the paid bind cycle stays a
//   bijection on the zero-store states and fixes every other);
// - the base's palindromic exchange of a like head-on pair with a calm line, taken only when the pair's
//   two stores are equal (so P_E is kept), stores moving with the tones;
// - the matched binary scatterings of code/rule/scatter-weave, taken only when the two scattering tones'
//   stores are equal (with e_u + e_v = e_w + e_x, P_E is kept exactly then and only then), stores moving
//   with the tones;
// - THE THRESHOLD, on each couple (line A, wire W): two tones head on on A (one on each slot), each with a
//   store of at least 1, and W calm: W becomes the pair (s, -s), s the sign of A's first tone, with stores
//   0, and each of A's stores gives up 1. Its reverse: A head on and W holding exactly that pair with stores
//   0, the pair is unmade and each store gains 1. The two classes map into each other, so the move is an
//   involution. It keeps E (two units of kinetic energy become two masses), charge (the pair is neutral),
//   P and P_E (the head-on tones keep their slots and their stores change equally, and the pair carries
//   none). Two tones that bring less than one unit each make nothing.
// The beat is scatter-and-threshold for beat c - t (run backward), the base, then scatter-and-threshold
// for beat t, as in code/rule/scatter-weave, so reversal and CPT hold at the base phase. Negation leaves
// stores and counters alone and maps each move to its mirror. Role points move with the vibes; on W the
// threshold swaps them exactly when the first slot's weight changes sign, as the clock does, so local color
// holds.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { type Mesh } from '@/code/tool/mesh'
import { stateKey, type WireTable } from '@/code/rule/color-local-weave'
import { buildScatterWeave, type ScatterBuilt, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { makeVibeWeave, type VibeWeave } from '@/code/rule/vibe-weave'

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))

export type ColdState = {
  readonly vibe: Int8Array
  readonly store: Int32Array
  readonly demon: Int32Array
  readonly role?: Int8Array
  readonly flow?: Int32Array
}

export type ColdWeave = {
  readonly mesh: Mesh
  readonly spec: ScatterWeaveSpec
  readonly built: ScatterBuilt
  // whether the threshold move runs (off: the paid scatter weave with stores, a control)
  readonly threshold: boolean
  readonly vibeWeave?: VibeWeave
  // a gather table for streaming: the slot each slot's content comes from
  readonly source: Int32Array
  readonly target: Int32Array
}

export function makeColdWeave(input: { mesh?: Mesh; side?: number; spec: ScatterWeaveSpec; threshold?: boolean; roles?: boolean }): ColdWeave {
  const vibeWeave = input.roles ? makeVibeWeave({ side: input.side ?? 3 }) : undefined
  const mesh = vibeWeave?.mesh ?? input.mesh

  if (!mesh) {
    throw new Error('a mesh or a side with roles is needed')
  }

  const opposite = Array.from({ length: 24 }, (_, d) => mesh.opposite(d))
  const source = new Int32Array(mesh.cellCount * 24)
  const target = new Int32Array(mesh.cellCount * 24)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const to = mesh.neighbour(x, d) * 24 + d

      source[to] = x * 24 + d
      target[x * 24 + d] = to
    }
  }

  return { mesh, spec: input.spec, built: buildScatterWeave(input.spec, opposite), threshold: input.threshold ?? true, vibeWeave, source, target }
}

const mod = (t: number, n: number): number => ((t % n) + n) % n
const at = (list: readonly number[], t: number): number => list[mod(t, list.length)] ?? 0

type Arrays = { vibe: Int8Array; store: Int32Array; demon: Int32Array; role: Int8Array | undefined }

function swapSlots(a: Arrays, i: number, j: number): void {
  const v = a.vibe[i] ?? 0

  a.vibe[i] = a.vibe[j] ?? 0
  a.vibe[j] = v

  const s = a.store[i] ?? 0

  a.store[i] = a.store[j] ?? 0
  a.store[j] = s

  if (a.role) {
    const r = a.role[i] ?? 0

    a.role[i] = a.role[j] ?? 0
    a.role[j] = r
  }
}

// the matched scatterings of one sequence, with equal stores
function scatter(a: Arrays, base: number, set: Int32Array): void {
  const { vibe, store } = a

  for (let k = 0; k < set.length; k += 4) {
    const du = set[k] ?? 0
    const dv = set[k + 1] ?? 0
    const dw = set[k + 2] ?? 0
    const dx = set[k + 3] ?? 0
    const u = base + du
    const v = base + dv
    const w = base + dw
    const x = base + dx
    const ou = vibe[base + (OPPOSITE[du] ?? 0)] !== 0
    const ov = vibe[base + (OPPOSITE[dv] ?? 0)] !== 0
    const ow = vibe[base + (OPPOSITE[dw] ?? 0)] !== 0
    const ox = vibe[base + (OPPOSITE[dx] ?? 0)] !== 0

    if (ou !== ow || ov !== ox) {
      continue
    }

    const here = vibe[u] !== 0 && vibe[v] !== 0 && vibe[w] === 0 && vibe[x] === 0 && store[u] === store[v]
    const there = vibe[w] !== 0 && vibe[x] !== 0 && vibe[u] === 0 && vibe[v] === 0 && store[w] === store[x]

    if (here || there) {
      swapSlots(a, u, w)
      swapSlots(a, v, x)
    }
  }
}

// the threshold on every couple of beat t
function threshold(a: Arrays, built: ScatterBuilt, spec: ScatterWeaveSpec, base: number, t: number): void {
  const couples = built.positions[at(spec.base.positionAt, t)] ?? []
  const { vibe, store, role } = a

  for (const [lineIndex, wireIndex] of couples) {
    const line = built.lines[lineIndex] ?? [0, 0]
    const wire = built.lines[wireIndex] ?? [0, 0]
    const a0 = base + line[0]
    const a1 = base + line[1]
    const w0 = base + wire[0]
    const w1 = base + wire[1]
    const x = vibe[a0] ?? 0
    const y = vibe[a1] ?? 0

    if (x === 0 || y === 0) {
      continue
    }

    const s = x
    const calm = vibe[w0] === 0 && vibe[w1] === 0
    const made = vibe[w0] === s && vibe[w1] === -s && store[w0] === 0 && store[w1] === 0

    if (calm && (store[a0] ?? 0) >= 1 && (store[a1] ?? 0) >= 1) {
      vibe[w0] = s
      vibe[w1] = -s
      store[a0] = (store[a0] ?? 0) - 1
      store[a1] = (store[a1] ?? 0) - 1
    } else if (made) {
      vibe[w0] = 0
      vibe[w1] = 0
      store[a0] = (store[a0] ?? 0) + 1
      store[a1] = (store[a1] ?? 0) + 1
    } else {
      continue
    }

    // the first slot's weight goes between +1 (calm) and s: roles swap when s is a fear
    if (role && s === -1) {
      const r = role[w0] ?? 0

      role[w0] = role[w1] ?? 0
      role[w1] = r
    }
  }
}

function exchange(a: Arrays, base: number, line: readonly [number, number], wire: readonly [number, number], fires: Uint8Array): void {
  const { vibe, store } = a
  const l = stateKey(vibe[base + line[0]] ?? 0, vibe[base + line[1]] ?? 0)
  const w = stateKey(vibe[base + wire[0]] ?? 0, vibe[base + wire[1]] ?? 0)

  if (fires[l * 9 + w] !== 1) {
    return
  }

  // the non-calm line's two stores must be equal
  const lineHeld = vibe[base + line[0]] !== 0 || vibe[base + line[1]] !== 0
  const held = lineHeld ? line : wire

  if (store[base + held[0]] !== store[base + held[1]]) {
    return
  }

  swapSlots(a, base + line[0], base + wire[0])
  swapSlots(a, base + line[1], base + wire[1])
}

function clock(a: Arrays, base: number, wire: readonly [number, number], table: WireTable, demonAt: number): void {
  const { vibe, store, demon, role } = a
  const i = base + wire[0]
  const j = base + wire[1]

  if (store[i] !== 0 || store[j] !== 0) {
    return
  }

  const x = vibe[i] ?? 0
  const y = vibe[j] ?? 0
  const image = table[stateKey(x, y)] ?? [x, y]
  const cost = Math.abs(image[0]) + Math.abs(image[1]) - Math.abs(x) - Math.abs(y)
  const held = demon[demonAt] ?? 0

  if (held < cost) {
    return
  }

  demon[demonAt] = held - cost
  vibe[i] = image[0]
  vibe[j] = image[1]

  if (role && (x !== 0 ? x : 1) !== (image[0] !== 0 ? image[0] : 1)) {
    const r = role[i] ?? 0

    role[i] = role[j] ?? 0
    role[j] = r
  }
}

function baseCollide(a: Arrays, built: ScatterBuilt, spec: ScatterWeaveSpec, base: number, t: number, forward: boolean): void {
  const b = spec.base
  const tables = forward ? built.forwardTables : built.inverseTables
  const couples = built.positions[at(b.positionAt, t)] ?? []
  const swapIndex = at(b.swapAt, t)
  const table = tables[at(b.tableAt, t) % tables.length] ?? []
  const dock = base / 24

  couples.forEach(([lineIndex, wireIndex], k) => {
    const line = built.lines[lineIndex] ?? [0, 0]
    const wire = built.lines[wireIndex] ?? [0, 0]
    const demonAt = dock * 12 + wireIndex

    if (k !== swapIndex) {
      clock(a, base, wire, table, demonAt)
    } else {
      exchange(a, base, line, wire, built.fires)
      clock(a, base, wire, table, demonAt)
      exchange(a, base, line, wire, built.fires)
    }
  })
}

// one dock's collision of beat t, forward or inverse
export function coldDockCollide(weave: ColdWeave, a: Arrays, base: number, t: number, forward: boolean): void {
  const { built, spec } = weave
  const n = built.sets.length
  const before = mod(spec.mirror - t, n)
  const after = mod(t, n)
  const empty = new Int32Array(0)

  if (forward) {
    if (weave.threshold) threshold(a, built, spec, base, spec.mirror - t)
    scatter(a, base, built.reversed[before] ?? empty)
    baseCollide(a, built, spec, base, t, true)
    scatter(a, base, built.sets[after] ?? empty)
    if (weave.threshold) threshold(a, built, spec, base, t)
  } else {
    if (weave.threshold) threshold(a, built, spec, base, t)
    scatter(a, base, built.reversed[after] ?? empty)
    baseCollide(a, built, spec, base, t, false)
    scatter(a, base, built.sets[before] ?? empty)
    if (weave.threshold) threshold(a, built, spec, base, spec.mirror - t)
  }
}

export function coldBeat(weave: ColdWeave, state: ColdState, t: number): ColdState {
  const a: Arrays = {
    vibe: Int8Array.from(state.vibe),
    store: Int32Array.from(state.store),
    demon: Int32Array.from(state.demon),
    role: state.role ? Int8Array.from(state.role) : undefined,
  }

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    coldDockCollide(weave, a, x * 24, t, true)
  }

  const n = a.vibe.length
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)

  for (let i = 0; i < n; i++) {
    const from = weave.source[i] ?? 0

    vibe[i] = a.vibe[from] ?? 0
    store[i] = a.store[from] ?? 0
  }

  if (!a.role || !state.flow || !weave.vibeWeave) {
    return { vibe, store, demon: a.demon }
  }

  const { moves, links } = weave.vibeWeave
  const role = new Int8Array(n)
  const flow = Int32Array.from(state.flow)

  for (let i = 0; i < n; i++) {
    role[weave.target[i] ?? 0] = moves.act[links[i] ?? moves.identity]?.[a.role[i] ?? 0] ?? 0
    flow[i] = (flow[i] ?? 0) + (a.vibe[i] ?? 0)
  }

  return { vibe, store, demon: a.demon, role, flow }
}

export function coldBeatBack(weave: ColdWeave, state: ColdState, t: number): ColdState {
  const n = state.vibe.length
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)

  for (let i = 0; i < n; i++) {
    const to = weave.target[i] ?? 0

    vibe[i] = state.vibe[to] ?? 0
    store[i] = state.store[to] ?? 0
  }

  let role: Int8Array | undefined
  let flow: Int32Array | undefined

  if (state.role && state.flow && weave.vibeWeave) {
    const { moves, links } = weave.vibeWeave

    role = new Int8Array(n)
    flow = Int32Array.from(state.flow)

    for (let i = 0; i < n; i++) {
      role[i] = moves.act[moves.inverse[links[i] ?? moves.identity] ?? moves.identity]?.[state.role[weave.target[i] ?? 0] ?? 0] ?? 0
      flow[i] = (flow[i] ?? 0) - (vibe[i] ?? 0)
    }
  }

  const a: Arrays = { vibe, store, demon: Int32Array.from(state.demon), role }

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    coldDockCollide(weave, a, x * 24, t, false)
  }

  return role && flow ? { vibe: a.vibe, store: a.store, demon: a.demon, role, flow } : { vibe: a.vibe, store: a.store, demon: a.demon }
}

export function coldEnergy(state: ColdState): number {
  let e = 0

  for (let i = 0; i < state.vibe.length; i++) {
    if (state.vibe[i] !== 0) {
      e += 1 + (state.store[i] ?? 0)
    }
  }

  return e + state.demon.reduce((s, x) => s + x, 0)
}

// P (count momentum) and P_E (energy current), 4-vectors
export function coldMomenta(state: ColdState): { p: number[]; pe: number[] } {
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
