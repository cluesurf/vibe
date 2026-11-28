// M6, universality from the M1 rules alone (item vibe-computation-models-0017). Layer 2: reads the pair rules
// (code/rule/pair-rule.ts), the sparse runner (code/measure/particle-census.ts) and the M5 line runner
// (code/compute/lab/gates.ts), and adds nothing to the mesh but a LAYOUT.
//
// THE SPLIT. On a uniform background b the two other tones are the excitations u < v. A rule-background cell is
//   species       every pair maps inside its multiset of tones (the 8 vacuum-fixing rules on each background), so the
//                 cell is one triple (lone u, lone v, u meets v), each keep or swap, and one of six types T0..T5;
//   reactive      b is fixed but some pair changes its tones (the 16 creating rules on +1 and -1: two 0 tones fuse);
//   live_vacuum   b is not fixed (the 16 creating rules on the vacuum), so no finite start exists.
//
// THE NO-FEEDBACK LEMMA (species cells, any graph and schedule). Whether a matched pair swaps its two cells depends
// only on a DRIVING layer that moves by a cell permutation fixed in advance: occupancy (T0..T3), the mover set in free
// flight (T5), or the mover set among static mirrors (T4). So the tone of cell x at round T is found by walking x back
// step by step, asking at each step one question about the driving layer, which is itself a single-cell walk back to
// the start (`traceTone`). The walk keeps a constant number of cells and counters: a logspace procedure.
//
// THE COUNTER (T5). In id.CBA.swap on the vacuum a +1 is in free flight whatever happens, and a static -1 moves one
// cell each time a +1 crosses it: a register whose value is a position, changed by +1s and never read by them.
//
// THE REACTIVE CENSUS. Statics and movers of width at most 3 on the line, every mover against every static, and the
// four ingredients of a Minsky counter (increment, decrement, a reference static, a zero test), a bounded search.

import { GateRule, fixesUniform } from '@/code/compute/lab/gates'
import { PairSpace, Tones } from '@/code/measure/particle-census'

// ---- parameters, fixed before the first run (m6-universality.md) ----

export const SPECIES_WIDTH = 3
export const SPECIES_PERIOD = 24
export const SPECIES_SPAN_SLACK = 4
export const COLLISION_ROUNDS = 120
export const CLEAR_RADIUS = 8
export const SHIFT_SEARCH = 16
export const APPROACH_GAP = 4
export const ZERO_SEPARATIONS = 8
export const CAVITY_RETURN_CAP = 60

// ---- the split ----

export type Move = 'keep' | 'swap'
export type CellKind = 'species' | 'reactive' | 'live_vacuum'
export type SpeciesType = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'

export type CellSplit = {
  rule: string
  background: number
  kind: CellKind
  type: SpeciesType | null
  // the two excitations, u < v
  tones: [number, number]
  lone: [Move, Move] | null
  meet: Move | null
  // T4 and T5: the tone whose lone move is swap, and the other
  mover: number | null
  still: number | null
}

function image(rule: GateRule, a: number, b: number): [number, number] {
  const p = (a + 1) * 3 + b + 1

  return [rule.first[p]!, rule.second[p]!]
}

// keep or swap when the pair (a, b) maps to itself or to (b, a); null when its tones change
export function pairMove(rule: GateRule, a: number, b: number): Move | null {
  const [x, y] = image(rule, a, b)

  if (x === a && y === b) {
    return 'keep'
  }

  return x === b && y === a ? 'swap' : null
}

export function splitCell(rule: GateRule, background: number): CellSplit {
  const tones = [-1, 0, 1].filter(t => t !== background) as [number, number]
  const base = { rule: rule.name, background, tones, lone: null, meet: null, mover: null, still: null, type: null }

  if (!fixesUniform(rule, background)) {
    return { ...base, kind: 'live_vacuum' }
  }

  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      if (pairMove(rule, a, b) === null) {
        return { ...base, kind: 'reactive' }
      }
    }
  }

  const [u, v] = tones
  const lu = pairMove(rule, u, background)!
  const lv = pairMove(rule, v, background)!
  const m = pairMove(rule, u, v)!
  const key = `${lu === 'swap' ? 1 : 0}${lv === 'swap' ? 1 : 0}${m === 'swap' ? 1 : 0}`
  const type: Record<string, SpeciesType> = {
    '000': 'T0',
    '001': 'T1',
    '110': 'T2',
    '111': 'T3',
    '100': 'T4',
    '010': 'T4',
    '101': 'T5',
    '011': 'T5',
  }
  const mixed = lu !== lv

  return {
    ...base,
    kind: 'species',
    type: type[key]!,
    lone: [lu, lv],
    meet: m,
    mover: mixed ? (lu === 'swap' ? u : v) : null,
    still: mixed ? (lu === 'swap' ? v : u) : null,
  }
}

// The pair-level form of the lemma, brute force over the nine pairs: whether the pair's action (keep or swap) is fixed
// by the driving pattern alone, for the type's driving layer. Returns the patterns that break it (none for a lemma).
export function lemmaBreaks(rule: GateRule, split: CellSplit): string[] {
  if (split.kind !== 'species') {
    return ['not a species cell']
  }

  const b = split.background
  const drive = (t: number): string =>
    split.type === 'T4' || split.type === 'T5'
      ? t === split.mover
        ? 'm'
        : t === split.still
          ? 's'
          : '.'
      : t === b
        ? '.'
        : 'o'
  const seen = new Map<string, Set<Move>>()

  for (let a = -1; a <= 1; a++) {
    for (let c = -1; c <= 1; c++) {
      const key = `${drive(a)}${drive(c)}`
      const move = pairMove(rule, a, c)!
      // a pair of equal tones is the same under keep and swap
      const options: Move[] = a === c ? ['keep', 'swap'] : [move]
      const prior = seen.get(key)
      const next = new Set(prior === undefined ? options : options.filter(o => prior.has(o)))

      seen.set(key, next)
    }
  }

  // T4 is driven by the static set, so a pattern with no still cell must swap and one with a still cell must keep;
  // T5 by the mover set: swap with a mover, keep without; the others by occupancy (checked by consistency alone)
  const breaks = [...seen.entries()].filter(([, s]) => s.size === 0).map(([k]) => k)

  if (split.type === 'T4') {
    for (const [k, s] of seen) {
      const want: Move = k.includes('s') ? 'keep' : 'swap'

      if (k !== '..' && !s.has(want)) {
        breaks.push(`T4 ${k}`)
      }
    }
  }

  if (split.type === 'T5') {
    for (const [k, s] of seen) {
      const want: Move = k.includes('m') ? 'swap' : 'keep'

      if (k !== '..' && !s.has(want)) {
        breaks.push(`T5 ${k}`)
      }
    }
  }

  return breaks
}

// ---- schedules and runs on any pair space ----

export type Schedule = {
  space: PairSpace
  colors: readonly number[]
}

function colorAt(s: Schedule, step: number): number {
  return s.colors[step % s.colors.length]!
}

// one step (one color) of the rule, in place
export function applyStep(rule: GateRule, background: number, s: Schedule, step: number, state: Tones): void {
  const color = colorAt(s, step)
  const done = new Set<number>()

  for (const u of [...state.keys()]) {
    if (done.has(u)) {
      continue
    }

    const w = s.space.partner(color, u)

    done.add(u)

    if (w < 0) {
      continue
    }

    done.add(w)

    const [i, j] = s.space.isFirst(color, u) ? [u, w] : [w, u]
    const [a, b] = image(rule, state.get(i) ?? background, state.get(j) ?? background)

    if (a === background) {
      state.delete(i)
    } else {
      state.set(i, a)
    }

    if (b === background) {
      state.delete(j)
    } else {
      state.set(j, b)
    }
  }
}

// the state after every step, step 0 the start
export function stepRun(rule: GateRule, background: number, s: Schedule, start: Tones, steps: number): Tones[] {
  const state = new Map(start)
  const out = [new Map(state)]

  for (let k = 0; k < steps; k++) {
    applyStep(rule, background, s, k, state)
    out.push(new Map(state))
  }

  return out
}

// ---- the driving layer and the backward tracer ----

// the cell that holds, before step k, what cell y held at the start, for the driving layer's permutation: walked
// forward. Occupancy of T2 and T3 and the mover of T5 are in free flight (every pair swaps); T4's mover swaps unless
// the pair holds a still cell; T0 and T1 occupancy never moves.
function driverForward(split: CellSplit, s: Schedule, start: Tones, y: number, k: number): number {
  let c = y

  for (let j = 0; j < k; j++) {
    c = driverStep(split, s, start, j, c)
  }

  return c
}

function isStill(split: CellSplit, start: Tones, c: number): boolean {
  return split.type === 'T4' && start.get(c) === split.still
}

// one step of the driving permutation (an involution per step, so it is also its own inverse)
function driverStep(split: CellSplit, s: Schedule, start: Tones, j: number, c: number): number {
  if (split.type === 'T0' || split.type === 'T1') {
    return c
  }

  const p = s.space.partner(colorAt(s, j), c)

  if (p < 0) {
    return c
  }

  if (split.type === 'T4' && (isStill(split, start, c) || isStill(split, start, p))) {
    return c
  }

  return p
}

// whether cell y carries the driving layer before step k: walk it back to the start
export function drivenAt(split: CellSplit, s: Schedule, start: Tones, k: number, y: number): boolean {
  let c = y

  for (let j = k - 1; j >= 0; j--) {
    c = driverStep(split, s, start, j, c)
  }

  const t = start.get(c)

  if (t === undefined) {
    return false
  }

  return split.type === 'T4' || split.type === 'T5' ? t === split.mover : true
}

// whether the pair (c, p) swaps its cells at step k, read from the driving layer alone (the lemma)
function swapsAt(split: CellSplit, s: Schedule, start: Tones, k: number, c: number, p: number): boolean {
  switch (split.type) {
    case 'T0':
      return false
    case 'T3':
      return true
    case 'T1':
      return drivenAt(split, s, start, k, c) && drivenAt(split, s, start, k, p)
    case 'T2':
      return !(drivenAt(split, s, start, k, c) && drivenAt(split, s, start, k, p))
    case 'T4':
      return !(isStill(split, start, c) || isStill(split, start, p))
    case 'T5':
      return drivenAt(split, s, start, k, c) || drivenAt(split, s, start, k, p)
    default:
      throw new Error(`no tracer for ${split.rule} on ${split.background}`)
  }
}

// The tone of cell x after `steps` steps, from the start alone: walk x back step by step through the swaps the
// driving layer decides. Holds a constant number of cells and counters at any time.
export function traceTone(split: CellSplit, s: Schedule, start: Tones, steps: number, x: number): number {
  let c = x

  for (let k = steps - 1; k >= 0; k--) {
    const p = s.space.partner(colorAt(s, k), c)

    if (p >= 0 && swapsAt(split, s, start, k, c, p)) {
      c = p
    }
  }

  return start.get(c) ?? split.background
}

// the driving layer of a state: occupied cells (T0..T3) or the mover's cells (T4, T5)
export function driverCells(split: CellSplit, state: Tones): number[] {
  return [...state.entries()]
    .filter(([, t]) => (split.type === 'T4' || split.type === 'T5' ? t === split.mover : true))
    .map(([c]) => c)
    .sort((a, b) => a - b)
}

// the driving layer predicted from the start by its fixed permutation, walked forward
export function predictedDriver(split: CellSplit, s: Schedule, start: Tones, k: number): number[] {
  return driverCells(split, start)
    .map(c => driverForward(split, s, start, c, k))
    .sort((a, b) => a - b)
}

// ---- the line ----

export type LineStart = { start: number; window: number[] }

// every start of width 1..maxWidth: both end cells off the background, interior cells any tone, both parities
export function lineStarts(background: number, maxWidth: number): LineStart[] {
  const off = [-1, 0, 1].filter(t => t !== background)
  const out: LineStart[] = []

  for (let w = 1; w <= maxWidth; w++) {
    const interior = Math.max(0, w - 2)
    const ends = w === 1 ? 2 : 4

    for (let e = 0; e < ends; e++) {
      for (let code = 0; code < 3 ** interior; code++) {
        const window: number[] = []

        if (w === 1) {
          window.push(off[e]!)
        } else {
          window.push(off[e & 1]!)

          let x = code

          for (let i = 0; i < interior; i++) {
            window.push((x % 3) - 1)
            x = Math.floor(x / 3)
          }

          window.push(off[(e >> 1) & 1]!)
        }

        for (const start of [0, 1]) {
          out.push({ start, window })
        }
      }
    }
  }

  return out
}

// A dense run on the infinite line under the brick schedule (color 0 pairs (2k, 2k + 1), color 1 pairs (2k + 1,
// 2k + 2), left cell first), the M5 convention. Only pairs that touch the support are updated, since every rule here
// fixes the background pair. Frames are kept as (low position, tones).
export type Frame = { lo: number; tones: Int8Array }

export class LineRun {
  readonly frames: Frame[] = []
  private readonly cells: Int8Array
  private readonly offset: number
  private lo: number
  private hi: number

  constructor(
    private readonly rule: GateRule,
    private readonly background: number,
    layout: ReadonlyMap<number, number>,
    rounds: number,
  ) {
    const positions = [...layout.keys()]
    const min = positions.length > 0 ? Math.min(...positions) : 0
    const max = positions.length > 0 ? Math.max(...positions) : 0
    const pad = 2 * rounds + 4

    // offset even, so index parity equals position parity
    this.offset = pad - min + ((pad - min) & 1)
    this.cells = new Int8Array(max - min + 2 * pad + 4).fill(background)

    for (const [x, t] of layout) {
      this.cells[x + this.offset] = t
    }

    this.lo = min + this.offset
    this.hi = max + this.offset
    this.record()

    for (let t = 0; t < rounds; t++) {
      this.round()
    }
  }

  private round(): void {
    const c = this.cells

    for (let color = 0; color < 2; color++) {
      let i = this.lo - 1

      if ((i & 1) !== color) {
        i--
      }

      for (; i <= this.hi; i += 2) {
        const p = (c[i]! + 1) * 3 + c[i + 1]! + 1

        c[i] = this.rule.first[p]!
        c[i + 1] = this.rule.second[p]!
      }

      this.shrink()
    }

    this.record()
  }

  private shrink(): void {
    const c = this.cells

    let lo = this.lo - 2
    let hi = this.hi + 2

    while (lo <= hi && c[lo] === this.background) {
      lo++
    }

    while (hi >= lo && c[hi] === this.background) {
      hi--
    }

    if (lo > hi) {
      this.lo = this.offset
      this.hi = this.offset - 1
    } else {
      this.lo = lo
      this.hi = hi
    }
  }

  private record(): void {
    if (this.lo > this.hi) {
      this.frames.push({ lo: 0, tones: new Int8Array(0) })
    } else {
      this.frames.push({ lo: this.lo - this.offset, tones: this.cells.slice(this.lo, this.hi + 1) })
    }
  }
}

export function frameKey(f: Frame): string {
  return f.tones.length === 0 ? '' : `${f.lo}:${f.tones.join(',')}`
}

// the pattern without its position, plus the parity of its low end
export function patternKey(f: Frame): string {
  return f.tones.length === 0 ? '' : `${f.lo & 1}:${f.tones.join(',')}`
}

export function frameAt(f: Frame, x: number, background: number): number {
  const i = x - f.lo

  return i >= 0 && i < f.tones.length ? f.tones[i]! : background
}

function shifted(f: Frame, d: number): Frame {
  return { lo: f.lo + d, tones: f.tones }
}

function sameFrame(a: Frame, b: Frame): boolean {
  return frameKey(a) === frameKey(b)
}

// ---- G4: the line transient ----

export type Transient = {
  // the last round with a u-v meeting outside a T4 cavity (or -1)
  lastFreeEvent: number
  // T0, T1, T4: the cavity part returns exactly within the cap (period) or null
  cavityPeriod: number | null
}

// a u-v meeting at some color of round t: a matched pair holding u and v
function meetings(frameBefore: Frame, color: number, background: number): number[] {
  const out: number[] = []

  for (let i = 0; i + 1 < frameBefore.tones.length; i++) {
    const x = frameBefore.lo + i

    if ((x & 1) !== color) {
      continue
    }

    const a = frameBefore.tones[i]!
    const b = frameBefore.tones[i + 1]!

    if (a !== background && b !== background && a !== b) {
      out.push(x)
    }
  }

  return out
}

// The transient of one line start, read by color steps: the last round with an interaction outside the T4 cavities
// (between the leftmost and the rightmost still cell, which never move), and for T0, T1 and T4 the exact period of
// the cavity part from round `from` on.
export function lineTransient(input: {
  rule: GateRule
  split: CellSplit
  start: LineStart
  from: number
  cap: number
}): Transient {
  const { rule, split, start, from, cap } = input
  const b = split.background
  const layout = new Map(start.window.map((t, i) => [start.start + i, t]))
  const rounds = from + cap
  const half = new HalfStepLine(rule, b, layout)
  const stills = split.type === 'T4' ? [...layout.entries()].filter(([, t]) => t === split.still).map(([x]) => x) : []
  const lo = stills.length > 0 ? Math.min(...stills) : Infinity
  const hi = stills.length > 0 ? Math.max(...stills) : -Infinity
  const bounded = split.type === 'T0' || split.type === 'T1'

  let last = -1

  const cavity: string[] = []

  for (let t = 0; t < rounds; t++) {
    for (let color = 0; color < 2; color++) {
      const f = half.frame()

      for (const x of meetings(f, color, b)) {
        // T4: a meeting inside the cavity span is a mirror bounce of a confined mover
        const inCavity = split.type === 'T4' && x >= lo && x + 1 <= hi

        if (!bounded && !inCavity) {
          last = t
        }
      }

      half.step(color)
    }

    if (t + 1 >= from) {
      const f = half.frame()
      const part =
        split.type === 'T4'
          ? Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => frameAt(f, lo + i, b)).join(',')
          : frameKey(f)

      cavity.push(part)
    }
  }

  let period: number | null = null

  if (bounded || split.type === 'T4') {
    for (let p = 1; p < cavity.length; p++) {
      if (cavity[p] === cavity[0]) {
        period = p
        break
      }
    }
  }

  return { lastFreeEvent: last, cavityPeriod: period }
}

// a sparse line state stepped color by color (used where single color steps are read)
class HalfStepLine {
  private state: Map<number, number>

  constructor(
    private readonly rule: GateRule,
    private readonly background: number,
    layout: ReadonlyMap<number, number>,
  ) {
    this.state = new Map(layout)
  }

  frame(): Frame {
    const xs = [...this.state.keys()]

    if (xs.length === 0) {
      return { lo: 0, tones: new Int8Array(0) }
    }

    const lo = Math.min(...xs)
    const hi = Math.max(...xs)
    const tones = new Int8Array(hi - lo + 1).fill(this.background)

    for (const [x, t] of this.state) {
      tones[x - lo] = t
    }

    return { lo, tones }
  }

  step(color: number): void {
    const next = new Map<number, number>()
    const done = new Set<number>()

    for (const x of this.state.keys()) {
      const i = (x & 1) === color ? x : x - 1

      if (done.has(i)) {
        continue
      }

      done.add(i)

      const [a, b] = image(this.rule, this.state.get(i) ?? this.background, this.state.get(i + 1) ?? this.background)

      if (a !== this.background) {
        next.set(i, a)
      }

      if (b !== this.background) {
        next.set(i + 1, b)
      }
    }

    this.state = next
  }
}

// the tones of the occupied cells, left to right, at every round
export function lineOrders(rule: GateRule, background: number, start: LineStart, rounds: number): string[] {
  const run = new LineRun(rule, background, new Map(start.window.map((t, i) => [start.start + i, t])), rounds)

  return run.frames.map(f => Array.from(f.tones).filter(t => t !== background).join(','))
}

// ---- G6: the T5 register ----

export type RegisterRun = {
  // the still tone's position after every mover has passed
  value: number | null
  // every mover followed its lone free-flight track at every round
  moversFree: boolean
}

// A register at position `a` (the still tone of a T5 cell) and `n` movers sent from one side (`from` = 'right': movers
// at odd positions right of it, moving left; 'left': even positions left of it, moving right), spaced 4 cells apart.
export function registerRun(input: {
  rule: GateRule
  split: CellSplit
  a: number
  n: number
  from: 'left' | 'right'
}): RegisterRun {
  const { rule, split, a, n, from } = input
  const b = split.background
  const mover = split.mover!
  const layout = new Map<number, number>([[a, split.still!]])
  const movers: number[] = []

  for (let k = 0; k < n; k++) {
    // first mover 3 or 4 cells away, then every 4 cells, on the parity that moves toward the register
    const x = from === 'right' ? a + 3 + 4 * k + ((a + 3 + 4 * k) % 2 === 0 ? 1 : 0) : a - 3 - 4 * k - ((a - 3 - 4 * k) % 2 !== 0 ? 1 : 0)

    movers.push(x)
    layout.set(x, mover)
  }

  const rounds = 4 * n + 8
  const run = new LineRun(rule, b, layout, rounds)
  const lone = movers.map(x => new LineRun(rule, b, new Map([[x, mover]]), rounds))

  let free = true

  for (let t = 0; t <= rounds; t++) {
    const f = run.frames[t]!

    for (const l of lone) {
      const g = l.frames[t]!

      if (g.tones.length !== 1 || frameAt(f, g.lo, b) !== mover) {
        free = false
      }
    }
  }

  const last = run.frames[rounds]!
  const stills: number[] = []

  for (let i = 0; i < last.tones.length; i++) {
    if (last.tones[i] === split.still) {
      stills.push(last.lo + i)
    }
  }

  return { value: stills.length === 1 ? stills[0]! : null, moversFree: free }
}

// ---- G7: the reactive census on the line ----

export type Species = {
  key: string
  motion: 'static' | 'mover'
  period: number
  // displacement per period (0 for a static)
  shift: number
  // the orbit's frames over one period, from the representative start
  orbit: Frame[]
}

// Species of width at most `width`: a start that returns exactly in place (static) or translated by a nonzero shift
// (mover) within `maxPeriod` rounds, its span never exceeding width + slack on the way.
export function lineSpecies(rule: GateRule, background: number, width: number, maxPeriod: number): Species[] {
  const out = new Map<string, Species>()

  for (const s of lineStarts(background, width)) {
    const layout = new Map(s.window.map((t, i) => [s.start + i, t]))
    const run = new LineRun(rule, background, layout, maxPeriod)
    const f0 = run.frames[0]!
    const limit = s.window.length + SPECIES_SPAN_SLACK

    for (let p = 1; p <= maxPeriod; p++) {
      const fp = run.frames[p]!

      if (fp.tones.length === 0 || fp.tones.join(',') !== f0.tones.join(',')) {
        continue
      }

      const d = fp.lo - f0.lo

      if ((d & 1) !== 0) {
        continue
      }

      const orbit = run.frames.slice(0, p)

      if (orbit.some(f => f.tones.length === 0 || f.tones.length > limit)) {
        break
      }

      const key = `${d === 0 ? 'S' : d > 0 ? 'R' : 'L'}|${[...new Set(orbit.map(patternKey))].sort().join('|')}`

      if (!out.has(key)) {
        out.set(key, { key, motion: d === 0 ? 'static' : 'mover', period: p, shift: d, orbit })
      }

      break
    }
  }

  return [...out.values()]
}

export type CollisionOutcome =
  | { kind: 'transparent' }
  | { kind: 'shift'; delta: number }
  | { kind: 'other' }

// the static's frame at round t of its lone run, shifted by d
function staticAt(s: Species, t: number, d: number): Frame {
  return shifted(s.orbit[t % s.period]!, d)
}

// the mover's frame at round t of its lone run started from orbit phase `phase` shifted by d
function moverAt(m: Species, phase: number, t: number, d: number): Frame {
  const r = phase + t
  const k = Math.floor(r / m.period)

  return shifted(m.orbit[r % m.period]!, d + k * m.shift)
}

function union(frames: readonly Frame[], background: number): Frame | null {
  const live = frames.filter(f => f.tones.length > 0)

  if (live.length === 0) {
    return { lo: 0, tones: new Int8Array(0) }
  }

  const lo = Math.min(...live.map(f => f.lo))
  const hi = Math.max(...live.map(f => f.lo + f.tones.length - 1))
  const tones = new Int8Array(hi - lo + 1).fill(background)

  for (const f of live) {
    for (let i = 0; i < f.tones.length; i++) {
      const t = f.tones[i]!

      if (t === background) {
        continue
      }

      if (tones[f.lo + i - lo] !== background) {
        return null
      }

      tones[f.lo + i - lo] = t
    }
  }

  // trim
  let a = 0
  let z = tones.length - 1

  while (a <= z && tones[a] === background) {
    a++
  }

  while (z >= a && tones[z] === background) {
    z--
  }

  return a > z ? { lo: 0, tones: new Int8Array(0) } : { lo: lo + a, tones: tones.slice(a, z + 1) }
}

// where to put a mover (orbit phase `phase`) so that it approaches the frame `target` from its side with a gap of
// APPROACH_GAP or APPROACH_GAP + 1 cells, plus an extra even shift `extra` away from it; even shifts only
function approach(m: Species, phase: number, target: Frame, extra: number): number {
  const f = m.orbit[phase]!

  if (m.shift > 0) {
    // mover's high end at most target.lo - APPROACH_GAP - 1
    let d = target.lo - APPROACH_GAP - 1 - (f.lo + f.tones.length - 1)

    if ((d & 1) !== 0) {
      d--
    }

    return d - extra
  }

  let d = target.lo + target.tones.length - 1 + APPROACH_GAP + 1 - f.lo

  if ((d & 1) !== 0) {
    d++
  }

  return d + extra
}

export type Collision = {
  phase: number
  extra: number
  outcome: CollisionOutcome
}

// A mover against a set of statics (each a species frame at a position), run COLLISION_ROUNDS rounds. Transparent:
// the joint frame is the union of the lone frames at every round. Shift (one static only): the static reappears
// exactly translated by a nonzero delta (searched in +-SHIFT_SEARCH, any phase) and nothing else is within
// CLEAR_RADIUS cells of it at the end.
export function collide(input: {
  rule: GateRule
  background: number
  mover: Species
  phase: number
  extra: number
  statics: readonly { species: Species; at: number }[]
}): Collision {
  const { rule, background, mover, phase, extra, statics } = input
  const b = background
  const parts = statics.map(s => staticAt(s.species, 0, s.at))
  const target = union(parts, b)

  if (target === null || target.tones.length === 0) {
    return { phase, extra, outcome: { kind: 'other' } }
  }

  const d = approach(mover, phase, target, extra)
  const start = union([...parts, moverAt(mover, phase, 0, d)], b)

  if (start === null) {
    return { phase, extra, outcome: { kind: 'other' } }
  }

  const layout = new Map<number, number>()

  for (let i = 0; i < start.tones.length; i++) {
    if (start.tones[i] !== b) {
      layout.set(start.lo + i, start.tones[i]!)
    }
  }

  const run = new LineRun(rule, b, layout, COLLISION_ROUNDS)

  let transparent = true

  for (let t = 0; t <= COLLISION_ROUNDS && transparent; t++) {
    const lone = union([...statics.map(s => staticAt(s.species, t, s.at)), moverAt(mover, phase, t, d)], b)

    transparent = lone !== null && sameFrame(lone, run.frames[t]!)
  }

  if (transparent) {
    return { phase, extra, outcome: { kind: 'transparent' } }
  }

  if (statics.length === 1) {
    const s = statics[0]!
    const end = run.frames[COLLISION_ROUNDS]!

    for (let delta = -SHIFT_SEARCH; delta <= SHIFT_SEARCH; delta++) {
      if (delta === 0) {
        continue
      }

      for (let psi = 0; psi < s.species.period; psi++) {
        const want = staticAt(s.species, psi, s.at + delta)

        if (want.tones.length === 0) {
          continue
        }

        const lo = want.lo - CLEAR_RADIUS
        const hi = want.lo + want.tones.length - 1 + CLEAR_RADIUS

        let ok = true

        for (let x = lo; x <= hi && ok; x++) {
          ok = frameAt(end, x, b) === frameAt(want, x, b)
        }

        if (ok && (delta & 1) === 0) {
          return { phase, extra, outcome: { kind: 'shift', delta } }
        }

        if (ok) {
          // an odd translation lands on the other parity: count it only if the shifted pattern is itself static there
          const check = new LineRun(
            rule,
            b,
            new Map(Array.from(want.tones, (t, i) => [want.lo + i, t] as [number, number]).filter(([, t]) => t !== b)),
            s.species.period * 2,
          )

          if (check.frames.some((f, i) => i > 0 && sameFrame(f, check.frames[0]!))) {
            return { phase, extra, outcome: { kind: 'shift', delta } }
          }
        }
      }
    }
  }

  return { phase, extra, outcome: { kind: 'other' } }
}

export type Ingredients = {
  statics: number
  movers: number
  collisions: number
  transparent: number
  shifts: number
  // (static key, delta) pairs reached, and which movers reach them
  increments: string[]
  // the first static with both a +delta and a -delta shift, if any
  counter: { staticKey: string; delta: number; up: string; down: string } | null
  // a static transparent to both counter movers at every placement
  reference: string | null
  // the zero test reading per separation (outcome kind), or null when not reached
  zeroTest: { separations: number[]; outcomes: string[]; passes: boolean } | null
  // all four ingredients
  lead: boolean
}

// The bounded Minsky-ingredient census of one reactive cell on the line.
export function reactiveIngredients(rule: GateRule, background: number): Ingredients {
  const species = lineSpecies(rule, background, SPECIES_WIDTH, SPECIES_PERIOD)
  const statics = species.filter(s => s.motion === 'static')
  const movers = species.filter(s => s.motion === 'mover')
  const table = new Map<string, Map<string, Collision[]>>()

  let collisions = 0
  let transparent = 0
  let shifts = 0

  for (const s of statics) {
    const row = new Map<string, Collision[]>()

    for (const m of movers) {
      const list: Collision[] = []

      for (let phase = 0; phase < m.period; phase++) {
        for (const extra of [0, 2]) {
          const c = collide({ rule, background, mover: m, phase, extra, statics: [{ species: s, at: 0 }] })

          collisions++
          transparent += c.outcome.kind === 'transparent' ? 1 : 0
          shifts += c.outcome.kind === 'shift' ? 1 : 0
          list.push(c)
        }
      }

      row.set(m.key, list)
    }

    table.set(s.key, row)
  }

  const increments: string[] = []

  let counter: Ingredients['counter'] = null

  for (const s of statics) {
    const deltas = new Map<number, string>()

    for (const m of movers) {
      for (const c of table.get(s.key)!.get(m.key)!) {
        if (c.outcome.kind === 'shift' && !deltas.has(c.outcome.delta)) {
          deltas.set(c.outcome.delta, m.key)
        }
      }
    }

    for (const [delta, m] of deltas) {
      increments.push(`${s.key} ${delta} by ${m}`)

      if (counter === null && delta > 0 && deltas.has(-delta)) {
        counter = { staticKey: s.key, delta, up: m, down: deltas.get(-delta)! }
      }
    }
  }

  let reference: string | null = null
  let zeroTest: Ingredients['zeroTest'] = null

  if (counter !== null) {
    const c = counter

    for (const z of statics) {
      if (z.key === c.staticKey) {
        continue
      }

      const clear = [c.up, c.down].every(mk => table.get(z.key)!.get(mk)!.every(x => x.outcome.kind === 'transparent'))

      if (clear) {
        reference = z.key
        break
      }
    }

    if (reference !== null) {
      const z = statics.find(x => x.key === reference)!
      const s = statics.find(x => x.key === c.staticKey)!
      const m = movers.find(x => x.key === c.up)!
      const separations: number[] = []
      const outcomes: string[] = []
      const zFrame = z.orbit[0]!
      const sFrame = s.orbit[0]!

      // S on the far side of Z from the mover (the mover crosses Z first), at even translations so S keeps its
      // parity, the first ZERO_SEPARATIONS that do not overlap; a separation reads 'shift' when some placement of the
      // mover (every phase, both extra shifts) leaves Z unmoved and S moved by delta with nothing else near
      for (let off = 0; separations.length < ZERO_SEPARATIONS && off < 4 * ZERO_SEPARATIONS + 16; off++) {
        const at =
          m.shift > 0
            ? zFrame.lo + zFrame.tones.length + off - sFrame.lo
            : zFrame.lo - off - (sFrame.lo + sFrame.tones.length)

        if ((at & 1) !== 0 || union([zFrame, shifted(sFrame, at)], background) === null) {
          continue
        }

        separations.push(at)

        let clean = false

        for (let phase = 0; phase < m.period && !clean; phase++) {
          for (const extra of [0, 2]) {
            if (!clean && cleanPairShift({ rule, background, mover: m, phase, extra, z, s, at, delta: c.delta })) {
              clean = true
            }
          }
        }

        outcomes.push(clean ? 'shift' : 'none')
      }

      const passes = outcomes.length > 1 && outcomes[0] !== 'shift' && outcomes.slice(1).every(o => o === 'shift')

      zeroTest = { separations, outcomes, passes }
    }
  }

  return {
    statics: statics.length,
    movers: movers.length,
    collisions,
    transparent,
    shifts,
    increments,
    counter,
    reference,
    zeroTest,
    lead: zeroTest?.passes === true,
  }
}

// Z at 0 and S at `at`, the mover placed as in the hit that shifted S alone: after COLLISION_ROUNDS rounds Z is in
// its orbit unmoved, S is in its orbit moved by delta, and nothing else lies within CLEAR_RADIUS of either.
function cleanPairShift(input: {
  rule: GateRule
  background: number
  mover: Species
  phase: number
  extra: number
  z: Species
  s: Species
  at: number
  delta: number
}): boolean {
  const { rule, background, mover, phase, extra, z, s, at, delta } = input
  const b = background
  const target = union([staticAt(z, 0, 0), staticAt(s, 0, at)], b)!
  const d = approach(mover, phase, target, extra)
  const start = union([target, moverAt(mover, phase, 0, d)], b)

  if (start === null) {
    return false
  }

  const layout = new Map<number, number>()

  for (let i = 0; i < start.tones.length; i++) {
    if (start.tones[i] !== b) {
      layout.set(start.lo + i, start.tones[i]!)
    }
  }

  const end = new LineRun(rule, b, layout, COLLISION_ROUNDS).frames[COLLISION_ROUNDS]!

  for (let pz = 0; pz < z.period; pz++) {
    for (let ps = 0; ps < s.period; ps++) {
      const want = union([staticAt(z, pz, 0), staticAt(s, ps, at + delta)], b)

      if (want === null || want.tones.length === 0) {
        continue
      }

      const lo = want.lo - CLEAR_RADIUS
      const hi = want.lo + want.tones.length - 1 + CLEAR_RADIUS

      let ok = true

      for (let x = lo; x <= hi && ok; x++) {
        ok = frameAt(end, x, b) === frameAt(want, x, b)
      }

      if (ok) {
        return true
      }
    }
  }

  return false
}
