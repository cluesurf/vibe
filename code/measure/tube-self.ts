// B1'S LINE SELF ON THE EXACT TUBE (E-SLF-0198). E-SLF-0189 read the line self
// under the frame mixer at strength theta on the line engine, which is honeycomb-exact only through beat 2 (Lemma W,
// note/line-confinement.md section 4): weight the mixer sends off the line never comes back there. Here the same self
// runs on the whole honeycomb near its line (code/substrate/coxeter/exact-tube), so weight that leaves at beat 1 can
// come back at beat 3.
//
// THE RULE: B1's line rule as the board proposal writes it for any state (code/measure/cross-ball sparseBeat, split
// place, the sign and the cost on, clock 14, exact in Z[w][1/2] per clock count), with G_theta = I + (u - 1) P_u on
// every lone frame before each beat (keep (7 + u)/8, each other slot of the frame (u - 1)/8, thetaMixBranch's values).
// u = e^(i theta) is not in Z[w] for theta = 4pi/9, so it is carried as a power: a state is a map p -> an exact sparse
// state, the physical state sum_p u^p psi_p. Keep sends 7/8 to p and 1/8 to p + 1, a cross -1/8 to p and 1/8 to p + 1.
// The mixer hop's sign is a choice: 'parity' multiplies it by the reordering parity of the open modes in modeIndex
// order (the board proposal's sign on every slot map), 'none' moves the vibe with no sign (thetaMixBranch).
//
// THE START: a line engine store (code/measure/cone-line) placed on the tube's line l through dock 0 along D0 (mode
// 2x + 1 the forward label on D0 at line position x - offset, 2x the back label on its opposite), times the gauge
// parity from line order to modeIndex order, with the line string as its register (bulk-self's lineRegister). The
// float amplitudes are written exactly (a double is a dyadic rational), the real and the imaginary parts as two states.
//
// THE PRUNE (opt-in, for a read that needs every love on l after beat 3): the stream moves a vibe one facet and every
// dock-local piece keeps a lone vibe's dock and line (B fixes a single line's slot, the coin and the meetings copy
// within a line), so a vibe alone on its dock keeps its line to the stream. At stage 'return' (beat 2) a mixer choice
// is kept only if each vibe off l alone on its dock sits on a line one of whose slots streams to a dock of l, and after
// the stream every term with a vibe off l on a dock off l is dropped. At stage 'land' (beat 3) a choice is kept only if
// no vibe off l is alone on its dock, and after the stream only terms with every love on l are kept. A vibe that shares
// its dock is never pruned (K may move it).
//
// THE READ: B1's bound-trio count (coneBoundCount) of the terms with every love on l, grouped by the register off l
// and by the register on l minus the line string (a closed loop of flux records a path, so different groups are
// orthogonal), each group a line engine store with the gauge undone.
//
// NOTHING MOVES the rule: the beat is cross-ball's, the mixer's values are thetaMixBranch's, exact per power. Floats
// only in the read.

import { addAmp as coneAdd, coneBeat, coneBoundCount, coneStore, eachConfiguration, mixPass, type ConeStore } from '@/code/measure/cone-line'
import type { Coin, LineReader } from '@/code/measure/cold-line'
import { physical, sparseBeat, sparseDiffer, type Amp, type SparseState, type SparseTally, type SparseTerm } from '@/code/measure/cross-ball'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { lockedTables, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { FRAME_OF_SLOT, FRAME_SLOTS, modeIndex } from '@/code/rule/coined-locked-knit'
import { registerKey, reorderParity, type CrossOptions, type Register } from '@/code/rule/cross-line-pieces'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { exactTube, type ExactTube } from '@/code/substrate/coxeter/exact-tube'

export const D0 = LINE_FIRSTS[0]!
export const D0_BACK = OPPOSITE[D0]!
export const LINE_L = LINE_OF[D0]!
export const TUBE_CLOCK = 14
export const TUBE_RULE: CrossOptions = { sign: true, cost: true, clock: TUBE_CLOCK, place: 'split' }

const BIG = 1 << 28
const LONE_GUARD = 6

export type Tube = {
  exact: ExactTube
  cells: number
  tables: LockedTables
  pos: ReadonlyMap<number, number>
  dockAt: ReadonlyMap<number, number>
}

export function tubeOf(input: { from: number; to: number; radius: number }): Tube {
  const exact = exactTube({ dir: D0, ...input })
  const f = lockedFresh({ mesh: exact.mesh, store: new Int8Array(exact.cells * 12) })
  const tables = lockedTables(f.weave, 'pass', new Int16Array(exact.cells * 24).fill(f.weave.moves.identity))

  return { exact, cells: exact.cells, tables, pos: exact.pos, dockAt: exact.dockAt }
}

export const onL = (tube: Tube, slot: number): boolean =>
  tube.pos.has(Math.floor(slot / 24)) && LINE_OF[slot % 24] === LINE_L

const allOnL = (tube: Tube, slots: Int32Array): boolean => {
  for (const s of slots) {
    if (!onL(tube, s)) {
      return false
    }
  }

  return true
}

// ---- exact amplitudes ----

export type PowerState = Map<number, SparseState>

function reduceAmp(x: Amp): Amp {
  let { a, b, k } = x

  while (k > 0 && a % 2n === 0n && b % 2n === 0n) {
    a /= 2n
    b /= 2n
    k--
  }

  return { a, b, k }
}

function addInto(into: Map<number, Amp>, e: number, x: Amp): void {
  const o = into.get(e)

  if (!o) {
    const r = reduceAmp(x)

    if (r.a !== 0n || r.b !== 0n) {
      into.set(e, r)
    }

    return
  }

  const k = Math.max(o.k, x.k)
  const r = reduceAmp({
    a: o.a * (1n << BigInt(k - o.k)) + x.a * (1n << BigInt(k - x.k)),
    b: o.b * (1n << BigInt(k - o.k)) + x.b * (1n << BigInt(k - x.k)),
    k,
  })

  if (r.a === 0n && r.b === 0n) {
    into.delete(e)
  } else {
    into.set(e, r)
  }
}

// cross-ball's term key, so a state built here merges with the beat's own
const termKey = (slots: Int32Array, values: Int8Array, reg: Register): string =>
  `${Array.from(slots, (s, i) => `${s}${values[i]! > 0 ? '+' : '-'}`).join(',')}|${registerKey(reg)}`

// add amps * factor / 2^dk on the configuration (slots in any order; stored ascending)
function putTerm(
  out: SparseState,
  slots: Int32Array,
  values: Int8Array,
  reg: Register,
  amps: ReadonlyMap<number, Amp>,
  factor: bigint,
  dk: number,
): void {
  const order = Array.from(slots.keys()).sort((p, q) => slots[p]! - slots[q]!)
  const s = Int32Array.from(order, i => slots[i]!)
  const v = Int8Array.from(order, i => values[i]!)
  const key = termKey(s, v, reg)

  let o = out.get(key)

  if (!o) {
    o = { slots: s, values: v, reg, amps: new Map() }
    out.set(key, o)
  }

  for (const [e, x] of amps) {
    addInto(o.amps, e, { a: x.a * factor, b: x.b * factor, k: x.k + dk })
  }

  if (o.amps.size === 0) {
    out.delete(key)
  }
}

function stateAt(s: PowerState, p: number): SparseState {
  let x = s.get(p)

  if (!x) {
    x = new Map()
    s.set(p, x)
  }

  return x
}

function mergeInto(out: SparseState, from: SparseState): void {
  for (const [key, term] of from) {
    const o = out.get(key)

    if (!o) {
      out.set(key, term)
      continue
    }

    for (const [e, x] of term.amps) {
      addInto(o.amps, e, x)
    }

    if (o.amps.size === 0) {
      out.delete(key)
    }
  }
}

// a double as an exact dyadic rational
export function dyadic(x: number): Amp {
  if (!Number.isFinite(x)) {
    throw new Error(`tube-self: ${x} is not a finite amplitude`)
  }

  let y = x
  let k = 0

  while (!Number.isInteger(y)) {
    y *= 2
    k++
  }

  return reduceAmp({ a: BigInt(y), b: 0n, k })
}

// ---- the start ----

const coneMode = (offset: number, p: number, j: number): number => 2 * (offset + p) + (j === 0 ? 1 : 0)

// the order O_joint's key of a slot: l's modes in line order (cone modes), every other mode before them
export function jointKey(tube: Tube, offset: number, slot: number): number {
  const x = Math.floor(slot / 24)
  const d = slot % 24
  const p = tube.pos.get(x)

  return p !== undefined && LINE_OF[d] === LINE_L ? coneMode(offset, p, d === D0 ? 0 : 1) : modeIndex(slot) - BIG
}

export const gaugeOf = (tube: Tube, offset: number, slots: ArrayLike<number>): number =>
  reorderParity(Array.from(slots, s => jointKey(tube, offset, s)), Array.from(slots, s => modeIndex(s))) === 1 ? -1 : 1

// the cluster's string on l: link p -> p + 1 holds the loves at positions <= p, mod 3 (bulk-self's lineRegister)
export function lineRegister(tube: Tube, positions: readonly number[]): Map<number, number> {
  const reg = new Map<number, number>()

  if (positions.length === 0) {
    return reg
  }

  const lo = Math.min(...positions)
  const hi = Math.max(...positions)

  for (let p = lo; p < hi; p++) {
    const f = positions.filter(x => x <= p).length % 3

    if (f !== 0) {
      reg.set(tube.dockAt.get(p)! * 24 + D0, f)
    }
  }

  return reg
}

export type TubeStart = { re: PowerState; im: PowerState | null; dropped: number; kept: number; configs: number }

// a line engine store on the tube: configurations of weight under `floor` are left out and their weight reported
export function tubeStart(tube: Tube, store: ConeStore, offset: number, floor: number): TubeStart {
  const re: PowerState = new Map([[0, new Map()]])
  const im: PowerState = new Map([[0, new Map()]])

  let dropped = 0
  let kept = 0
  let configs = 0
  let anyIm = false

  eachConfiguration(store, (modes, ar, ai) => {
    const w = ar * ar + ai * ai

    if (w === 0) {
      return
    }

    configs++

    if (w < floor) {
      dropped += w
      return
    }

    kept++

    const positions = Array.from(modes, m => (m >> 1) - offset)
    const slots = Int32Array.from(modes, (m, i) => {
      const x = tube.dockAt.get(positions[i]!)

      if (x === undefined) {
        throw new Error(`tube-self: line position ${positions[i]} is outside the tube's segment`)
      }

      return x * 24 + ((m & 1) === 1 ? D0 : D0_BACK)
    })
    const values = new Int8Array(slots.length).fill(1)
    const g = gaugeOf(tube, offset, slots)
    const reg = lineRegister(tube, positions)

    if (ar !== 0) {
      putTerm(re.get(0)!, slots, values, reg, new Map([[0, dyadic(g * ar)]]), 1n, 0)
    }

    if (ai !== 0) {
      anyIm = true
      putTerm(im.get(0)!, slots, values, reg, new Map([[0, dyadic(g * ai)]]), 1n, 0)
    }
  })

  return { re, im: anyIm ? im : null, dropped, kept, configs }
}

// one love at a slot, amplitude 1, empty register
export function loneLove(slot: number): PowerState {
  const s: SparseState = new Map()

  putTerm(s, Int32Array.of(slot), Int8Array.of(1), new Map(), new Map([[0, { a: 1n, b: 0n, k: 0 }]]), 1n, 0)

  return new Map([[0, s]])
}

// ---- the mixer and the step ----

export type Stage = 'free' | 'return' | 'land'
export type HopSign = 'parity' | 'none'

export type StepTally = SparseTally & { mixed: number; droppedChoices: number; droppedTerms: number; generated: number }

export const newStepTally = (): StepTally => ({ kFired: 0, frontier: 0, mixed: 0, droppedChoices: 0, droppedTerms: 0, generated: 0 })

// whether a vibe at `slot` alone on its dock can still be on l after this beat (stage 'return': after beat 3)
function reachesL(tube: Tube, slot: number): boolean {
  const x = Math.floor(slot / 24)
  const d = slot % 24

  for (const s of [slot, x * 24 + OPPOSITE[d]!]) {
    const y = Math.floor(tube.tables.target[s]! / 24)

    if (y !== x && tube.pos.has(y)) {
      return true
    }
  }

  return false
}

function alive(tube: Tube, stage: Stage, slot: number, shared: boolean): boolean {
  if (stage === 'free' || shared || onL(tube, slot)) {
    return true
  }

  return stage === 'return' ? reachesL(tube, slot) : false
}

// keep: 7 at bit 0, 1 at bit 1; a cross: -1 at bit 0, 1 at bit 1; all over 8
const COEF: readonly (readonly [bigint, bigint])[] = [
  [7n, 1n],
  [-1n, 1n],
]

function mixTerm(tube: Tube, term: SparseTerm, p: number, stage: Stage, sign: HopSign, out: PowerState, tally: StepTally): void {
  const slots = term.slots
  const dockCount = new Map<number, number>()
  const frames = new Map<number, number[]>()

  slots.forEach((s, i) => {
    const x = Math.floor(s / 24)

    dockCount.set(x, (dockCount.get(x) ?? 0) + 1)

    const id = x * 3 + FRAME_OF_SLOT[s % 24]!
    const list = frames.get(id)

    if (list) {
      list.push(i)
    } else {
      frames.set(id, [i])
    }
  })

  const lone: { i: number; choices: number[] }[] = []

  for (const [id, list] of frames) {
    if (list.length !== 1) {
      continue
    }

    const i = list[0]!
    const s = slots[i]!
    const x = Math.floor(id / 3)
    const ss = FRAME_SLOTS[id % 3]!
    const q = ss.indexOf(s % 24)
    const shared = dockCount.get(x)! > 1
    const choices: number[] = []

    for (let o = 0; o < 8; o++) {
      const to = x * 24 + ss[q ^ o]!

      if (alive(tube, stage, to, shared)) {
        choices.push(o)
      } else {
        tally.droppedChoices++
      }
    }

    if (choices.length === 0) {
      tally.droppedTerms++
      return
    }

    lone.push({ i, choices })
  }

  if (lone.length === 0) {
    putTerm(stateAt(out, p), slots, term.values, term.reg, term.amps, 1n, 0)
    return
  }

  if (lone.length > LONE_GUARD) {
    throw new Error(`tube-self: ${lone.length} lone frames in one term, over the guard ${LONE_GUARD}`)
  }

  tally.mixed += lone.length

  const modes0 = Array.from(slots, s => modeIndex(s))
  const n = lone.length
  const radix = lone.map(l => 2 * l.choices.length)
  const digit = new Array<number>(n).fill(0)

  for (;;) {
    const next = Int32Array.from(slots)

    let factor = 1n
    let power = p

    for (let a = 0; a < n; a++) {
      const { i, choices } = lone[a]!
      const o = choices[digit[a]! >> 1]!
      const bit = digit[a]! & 1
      const s = slots[i]!
      const x = Math.floor(s / 24)
      const ss = FRAME_SLOTS[FRAME_OF_SLOT[s % 24]!]!
      const q = ss.indexOf(s % 24)

      next[i] = x * 24 + ss[q ^ o]!
      factor *= COEF[o === 0 ? 0 : 1]![bit]!
      power += bit
    }

    if (sign === 'parity' && reorderParity(modes0, Array.from(next, s => modeIndex(s))) === 1) {
      factor = -factor
    }

    tally.generated++
    putTerm(stateAt(out, power), next, term.values, term.reg, term.amps, factor, 3 * n)

    let a = 0

    while (a < n) {
      digit[a]!++

      if (digit[a]! < radix[a]!) {
        break
      }

      digit[a] = 0
      a++
    }

    if (a === n) {
      break
    }
  }
}

function keepAfter(tube: Tube, stage: Stage, term: SparseTerm): boolean {
  if (stage === 'free') {
    return true
  }

  if (stage === 'land') {
    return allOnL(tube, term.slots)
  }

  for (const s of term.slots) {
    if (!onL(tube, s) && !tube.pos.has(Math.floor(s / 24))) {
      return false
    }
  }

  return true
}

export type StepOptions = { mix: HopSign | null; stage: Stage; prune: boolean; chunk?: number }

// one beat: the mixer (when `mix`), then cross-ball's beat, per power and in chunks of terms, the prune when asked
export function tubeStep(tube: Tube, s: PowerState, beat: number, o: StepOptions, tally: StepTally): PowerState {
  const stage: Stage = o.prune ? o.stage : 'free'
  const chunk = o.chunk ?? 1 << 15
  const out: PowerState = new Map()

  const flush = (mixed: PowerState): void => {
    for (const [q, ms] of mixed) {
      if (ms.size === 0) {
        continue
      }

      const b = sparseBeat(TUBE_RULE, tube.tables, ms, beat, tally)

      if (stage !== 'free') {
        for (const [key, term] of b) {
          if (!keepAfter(tube, stage, term)) {
            b.delete(key)
          }
        }
      }

      mergeInto(stateAt(out, q), b)
    }
  }

  for (const [p, state] of s) {
    let mixed: PowerState = new Map()
    let count = 0

    for (const term of state.values()) {
      if (o.mix) {
        mixTerm(tube, term, p, stage, o.mix, mixed, tally)
      } else {
        putTerm(stateAt(mixed, p), term.slots, term.values, term.reg, term.amps, 1n, 0)
      }

      if (++count >= chunk) {
        flush(mixed)
        mixed = new Map()
        count = 0
      }
    }

    flush(mixed)
  }

  for (const [q, st] of out) {
    if (st.size === 0) {
      out.delete(q)
    }
  }

  return out
}

export const termCount = (s: PowerState): number => [...s.values()].reduce((n, x) => n + x.size, 0)

// ---- the read ----

export type TubePart = { state: PowerState; unit: readonly [number, number] }

export type TubeRead = {
  F: number
  onL: number
  norm: number
  deviant: number
  groups: number
  terms: number
}

const cmul = (a: readonly [number, number], b: readonly [number, number]): [number, number] => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

function powerOf(u: readonly [number, number], p: number): [number, number] {
  let x: [number, number] = [1, 0]

  for (let i = 0; i < p; i++) {
    x = cmul(x, u)
  }

  return x
}

// F of the terms with every love on l (and, with `withNorm`, the norm of the whole state, every key combined)
export function tubeRead(
  tube: Tube,
  parts: readonly TubePart[],
  u: readonly [number, number],
  offset: number,
  line: number,
  rd: LineReader,
  withNorm: boolean,
): TubeRead {
  const on = new Map<string, { slots: Int32Array; reg: Register; re: number; im: number }>()
  const all = new Map<string, [number, number]>()

  let terms = 0

  for (const { state, unit } of parts) {
    for (const [p, s] of state) {
      const f = cmul(unit, powerOf(u, p))

      for (const [key, term] of s) {
        terms++

        const [ar, ai] = physical(term, TUBE_CLOCK)
        const [re, im] = cmul(f, [ar, ai])

        if (withNorm) {
          const o = all.get(key) ?? [0, 0]

          o[0] += re
          o[1] += im
          all.set(key, o)
        }

        if (!allOnL(tube, term.slots)) {
          continue
        }

        const o = on.get(key) ?? { slots: term.slots, reg: term.reg, re: 0, im: 0 }

        o.re += re
        o.im += im
        on.set(key, o)
      }
    }
  }

  // each group's configurations, read one group at a time (a store's first arena chunk is 64 MB)
  const groups = new Map<string, { modes: Int32Array; re: number; im: number }[]>()

  let onWeight = 0
  let deviant = 0

  for (const v of on.values()) {
    const w = v.re * v.re + v.im * v.im
    const positions = Array.from(v.slots, s => tube.pos.get(Math.floor(s / 24))!)
    const canon = lineRegister(tube, positions)
    const envReg = new Map<number, number>()
    const dev = new Map<number, number>()

    for (const [id, f] of v.reg) {
      if (id % 24 === D0 && tube.pos.has(Math.floor(id / 24))) {
        continue
      }

      envReg.set(id, f)
    }

    for (const id of new Set([...canon.keys(), ...[...v.reg.keys()].filter(id => id % 24 === D0 && tube.pos.has(Math.floor(id / 24)))])) {
      const d = ((((v.reg.get(id) ?? 0) - (canon.get(id) ?? 0)) % 3) + 3) % 3

      if (d !== 0) {
        dev.set(id, d)
      }
    }

    const key = `${registerKey(envReg)}#${registerKey(dev)}`

    onWeight += w

    if (key !== '#') {
      deviant += w
    }

    let list = groups.get(key)

    if (!list) {
      list = []
      groups.set(key, list)
    }

    const g = gaugeOf(tube, offset, v.slots)

    list.push({ modes: Int32Array.from(v.slots, s => jointKey(tube, offset, s)).sort(), re: g * v.re, im: g * v.im })
  }

  let F = 0

  for (const list of groups.values()) {
    const st = coneStore(3, line, 1e8, TUBE_CLOCK)

    for (const c of list) {
      coneAdd(st, c.modes, c.re, c.im)
    }

    F += coneBoundCount(st, rd)
  }

  let norm = Number.NaN

  if (withNorm) {
    norm = 0

    for (const [re, im] of all.values()) {
      norm += re * re + im * im
    }
  }

  return { F, onL: onWeight, norm, deviant, groups: groups.size, terms }
}

// the all-on-l part of a state, exact
export function onLPart(tube: Tube, s: PowerState): PowerState {
  const out: PowerState = new Map()

  for (const [p, st] of s) {
    const kept: SparseState = new Map()

    for (const [key, term] of st) {
      if (allOnL(tube, term.slots)) {
        kept.set(key, term)
      }
    }

    out.set(p, kept)
  }

  return out
}

// exact entries where two power states differ (0 when equal)
export function powerDiffer(a: PowerState, b: PowerState): number {
  let n = 0

  for (const p of new Set([...a.keys(), ...b.keys()])) {
    n += sparseDiffer(a.get(p) ?? new Map(), b.get(p) ?? new Map())
  }

  return n
}

// the weight of the all-on-l terms of a state, every power combined
export function onLWeight(tube: Tube, parts: readonly TubePart[], u: readonly [number, number]): number {
  const on = new Map<string, [number, number]>()

  for (const { state, unit } of parts) {
    for (const [p, s] of state) {
      const f = cmul(unit, powerOf(u, p))

      for (const [key, term] of s) {
        if (!allOnL(tube, term.slots)) {
          continue
        }

        const [re, im] = cmul(f, physical(term, TUBE_CLOCK))
        const o = on.get(key) ?? [0, 0]

        o[0] += re
        o[1] += im
        on.set(key, o)
      }
    }
  }

  let w = 0

  for (const [re, im] of on.values()) {
    w += re * re + im * im
  }

  return w
}

// ---- the line engine side (E-SLF-0189's lineRun, a few beats) ----

export type OnLineBlock = { lone: Coin; full: readonly [number, number] }

// L(t) = F(t) / F(0) on the line engine for beats 0..beats, with the mixer's on-line block before each beat
export function lineEngineL(first: () => ConeStore, block: OnLineBlock | null, beats: number, rd: LineReader): number[] {
  let a = first()
  let b = coneStore(a.n, a.line, a.cap, a.clock)

  const F0 = coneBoundCount(a, rd)
  const L = [1]

  for (let t = 1; t <= beats; t++) {
    if (block) {
      mixPass(a, block.lone, block.full)
    }

    coneBeat(a, b, true)
    ;[a, b] = [b, a]
    L.push(coneBoundCount(a, rd) / F0)
  }

  return L
}

// theta's on-line block (note/line-confinement.md section 4, E-SLF-0189's onLine): a single keeps 1 + h, the other
// slot h (h = (u - 1)/8); a full line is two vibes in one frame, not lone, so untouched
export function thetaBlock(u: readonly [number, number]): OnLineBlock {
  const hr = (u[0] - 1) / 8
  const hi = u[1] / 8

  return {
    lone: [
      [1 + hr, hi],
      [hr, hi],
    ],
    full: [1, 0],
  }
}
