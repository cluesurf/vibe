// M10, self-reproduction and adaptation from the M1 rules (item vibe-computation-models-0021). Algebra: spin-one.
// Layer 2: reads the pair rules through gates.ts, the line runner and the species split of counter.ts (M6) and the sparse
// runner of particle-census.ts, and adds nothing to the mesh but a LAYOUT (a structure and an enumerated environment).
//
// COPY. A copy of a structure (its round-0 window, both ends off the background) is a place where the state equals the
// window moved by a schedule-preserving symmetry (on the line: an even translation), tone for tone, with every cell within
// MARGIN of it on the background. REPRODUCTION: at least 2 + (copies in the environment's own run) copies, from a start
// holding at most one. HEREDITY: a point mutation of the structure breeds true when its run holds copies of the mutant at
// every place the original run held copies of the original, at the same round.
//
// THE MARK (P2, species cells). In a species cell every step moves the whole state by a cell bijection fixed by the
// driving set D of the start, and D itself moves by a permutation that ignores D. So a point mutation that changes D at c
// changes D at exactly one cell later, and one that keeps D changes the whole state at exactly one cell later. `markCheck`
// reads that cell live against its prediction.
//
// Criteria and parameters are fixed in note/project/vibe/computation/models/m10-reproduction.md (re-plan).

import { CellSplit, Frame, LineRun, Schedule, applyStep, frameAt } from '@/code/compute/lab/counter'
import { GateRule } from '@/code/compute/lab/gates'
import { PairSpace, Tones, clusters, shapeKey, sparseRound } from '@/code/measure/particle-census'

export const MARGIN = 2
export const LINK_GAP = 2

// ---- windows ----

// a pattern on consecutive line cells from `start`; an environment is a list of them
export type LineWindow = { start: number; window: readonly number[] }

export function layoutOf(parts: readonly LineWindow[], background: number): Map<number, number> {
  const out = new Map<number, number>()

  for (const p of parts) {
    p.window.forEach((t, i) => {
      if (out.has(p.start + i)) {
        throw new Error(`reproduction: windows overlap at ${p.start + i}`)
      }

      if (t !== background) {
        out.set(p.start + i, t)
      }
    })
  }

  return out
}

// the distinct windows of width 1..maxWidth with both ends off the background (interior any tone)
export function distinctWindows(background: number, maxWidth: number): number[][] {
  const off = [-1, 0, 1].filter(t => t !== background)
  const out: number[][] = []

  for (let w = 1; w <= maxWidth; w++) {
    const interior = Math.max(0, w - 2)

    for (let e = 0; e < (w === 1 ? 2 : 4); e++) {
      for (let code = 0; code < 3 ** interior; code++) {
        if (w === 1) {
          out.push([off[e]!])
          continue
        }

        const window = [off[e & 1]!]

        let x = code

        for (let i = 0; i < interior; i++) {
          window.push((x % 3) - 1)
          x = Math.floor(x / 3)
        }

        window.push(off[(e >> 1) & 1]!)
        out.push(window)
      }
    }
  }

  return out
}

// every point mutation of a window: one cell to another tone, an end cell never to the background
export function pointMutations(window: readonly number[], background: number): number[][] {
  const out: number[][] = []

  for (let i = 0; i < window.length; i++) {
    for (const t of [-1, 0, 1]) {
      if (t === window[i] || ((i === 0 || i === window.length - 1) && t === background)) {
        continue
      }

      const m = [...window]

      m[i] = t
      out.push(m)
    }
  }

  return out
}

// ---- copies on the line ----

export type LineView = {
  tone(x: number): number
  background(x: number): number
  // the lowest and highest cells off the background (hi < lo when there are none)
  lo: number
  hi: number
}

export function frameView(f: Frame, background: number): LineView {
  return {
    tone: x => frameAt(f, x, background),
    background: () => background,
    lo: f.lo,
    hi: f.lo + f.tones.length - 1,
  }
}

// the disjoint isolated copies of `pattern` at positions of the given parity, left to right
export function lineCopies(view: LineView, pattern: readonly number[], parity: number): number[] {
  const w = pattern.length
  const out: number[] = []

  let x = view.lo + (((view.lo - parity) % 2) + 2) % 2

  while (x + w - 1 <= view.hi) {
    let match = true

    for (let i = 0; i < w && match; i++) {
      match = view.tone(x + i) === pattern[i]
    }

    for (let y = x - MARGIN; y < x && match; y++) {
      match = view.tone(y) === view.background(y)
    }

    for (let y = x + w; y < x + w + MARGIN && match; y++) {
      match = view.tone(y) === view.background(y)
    }

    if (match) {
      out.push(x)
      x += w + ((w % 2) === 0 ? 0 : 1)
    } else {
      x += 2
    }
  }

  return out
}

function frameCharge(f: Frame, background: number): number {
  let q = 0

  for (const t of f.tones) {
    q += t - background
  }

  return q
}

// ---- reproduction on the line, fixed background ----

export type ReproductionEvent = { round: number; copies: number[]; environmentCopies: number }

export type ReproductionRun = {
  event: ReproductionEvent | null
  maxCopies: number
  chargeKept: boolean
}

export class EnvironmentCache {
  private readonly runs = new Map<string, Frame[]>()

  frames(rule: GateRule, background: number, environment: readonly LineWindow[], rounds: number): Frame[] {
    const key = `${rule.name}/${background}/${rounds}/${environment.map(e => `${e.start}:${e.window.join(',')}`).join('|')}`
    const hit = this.runs.get(key)

    if (hit !== undefined) {
      return hit
    }

    const frames = new LineRun(rule, background, layoutOf(environment, background), rounds).frames

    this.runs.set(key, frames)

    return frames
  }
}

// one structure in one environment: the first round with a reproduction event, the most copies seen, and charge
export function lineReproduction(input: {
  rule: GateRule
  background: number
  structure: LineWindow
  environment: readonly LineWindow[]
  rounds: number
  cache: EnvironmentCache
}): ReproductionRun {
  const { rule, background, structure, environment, rounds, cache } = input
  const frames = new LineRun(rule, background, layoutOf([structure, ...environment], background), rounds).frames
  const alone = environment.length === 0 ? null : cache.frames(rule, background, environment, rounds)
  const parity = ((structure.start % 2) + 2) % 2
  const q0 = frameCharge(frames[0]!, background)
  const start = lineCopies(frameView(frames[0]!, background), structure.window, parity).length

  let event: ReproductionEvent | null = null
  let maxCopies = start
  let chargeKept = true

  for (let t = 1; t <= rounds; t++) {
    const f = frames[t]!

    chargeKept &&= frameCharge(f, background) === q0

    const copies = lineCopies(frameView(f, background), structure.window, parity)

    maxCopies = Math.max(maxCopies, copies.length)

    if (event === null && start <= 1 && copies.length >= 2) {
      const environmentCopies =
        alone === null ? 0 : lineCopies(frameView(alone[t]!, background), structure.window, parity).length

      if (copies.length >= 2 + environmentCopies) {
        event = { round: t, copies, environmentCopies }
      }
    }
  }

  return { event, maxCopies, chargeKept }
}

// whether the mutant breeds true: copies of it at every place of the event, at the event's round
export function lineBreedsTrue(input: {
  rule: GateRule
  background: number
  structure: LineWindow
  mutant: readonly number[]
  environment: readonly LineWindow[]
  event: ReproductionEvent
}): boolean {
  const { rule, background, structure, mutant, environment, event } = input
  const frames = new LineRun(
    rule,
    background,
    layoutOf([{ start: structure.start, window: mutant }, ...environment], background),
    event.round,
  ).frames
  const parity = ((structure.start % 2) + 2) % 2
  const found = new Set(lineCopies(frameView(frames[event.round]!, background), mutant, parity))

  return event.copies.every(x => found.has(x))
}

// one food item beside a structure: right of it with `gap` background cells between, or left of it
export function foodBeside(structure: LineWindow, food: readonly number[], side: 'left' | 'right', gap: number): LineWindow {
  return side === 'right'
    ? { start: structure.start + structure.window.length + gap, window: food }
    : { start: structure.start - gap - food.length, window: food }
}

// ---- the ring: a closed even box under the brick schedule, for the live vacuum ----

export function ringStep(rule: GateRule, cells: Int8Array, color: number): void {
  const n = cells.length

  for (let i = color; i < n; i += 2) {
    const j = i + 1 === n ? 0 : i + 1
    const p = (cells[i]! + 1) * 3 + cells[j]! + 1
    const a = rule.first[p]!

    cells[j] = rule.second[p]!
    cells[i] = a
  }
}

// the state at every round end, round 0 the start
export function ringRounds(rule: GateRule, start: Int8Array, rounds: number): Int8Array[] {
  const cells = Int8Array.from(start)
  const out = [Int8Array.from(cells)]

  for (let t = 0; t < rounds; t++) {
    ringStep(rule, cells, 0)
    ringStep(rule, cells, 1)
    out.push(Int8Array.from(cells))
  }

  return out
}

// `rounds` rounds back with the inverse rule (colors in reverse order)
export function ringBack(inverse: GateRule, end: Int8Array, rounds: number): Int8Array {
  const cells = Int8Array.from(end)

  for (let t = 0; t < rounds; t++) {
    ringStep(inverse, cells, 1)
    ringStep(inverse, cells, 0)
  }

  return cells
}

// a ring long enough that two fronts from a window of width w never meet around the back within `rounds` rounds
export function ringSize(width: number, rounds: number): number {
  const n = width + 4 * rounds + 2 * MARGIN + 8

  return n + (n % 2)
}

export function ringView(state: Int8Array, background: Int8Array): LineView {
  let lo = state.length
  let hi = -1

  for (let i = 0; i < state.length; i++) {
    if (state[i] !== background[i]) {
      lo = Math.min(lo, i)
      hi = i
    }
  }

  return {
    tone: x => (x >= 0 && x < state.length ? state[x]! : background[0]!),
    background: x => (x >= 0 && x < state.length ? background[x]! : background[0]!),
    lo,
    hi,
  }
}

export function ringCharge(state: Int8Array): number {
  let q = 0

  for (const t of state) {
    q += t
  }

  return q
}

// the live vacuum: the uniform start's orbit, and the rounds at which it is uniform again
export function vacuumOrbit(rule: GateRule, n: number, rounds: number): { orbit: Int8Array[]; aligned: boolean[] } {
  const orbit = ringRounds(rule, new Int8Array(n), rounds)

  return { orbit, aligned: orbit.map(s => s.every(t => t === 0)) }
}

// one structure on the live vacuum (no food): copies read only where the vacuum orbit is uniform again
export function vacuumReproduction(input: {
  rule: GateRule
  window: readonly number[]
  parity: number
  rounds: number
  orbit: { orbit: Int8Array[]; aligned: boolean[] }
}): ReproductionRun & { place: number } {
  const { rule, window, parity, rounds, orbit } = input
  const n = orbit.orbit[0]!.length
  const half = n / 2

  // the structure sits in the middle, its low end on the given parity
  const place = half - (half % 2) + parity
  const start = new Int8Array(n)

  window.forEach((t, i) => {
    start[place + i] = t
  })

  const states = ringRounds(rule, start, rounds)
  const q0 = ringCharge(states[0]!)

  let event: ReproductionEvent | null = null
  let maxCopies = 1
  let chargeKept = true

  for (let t = 1; t <= rounds; t++) {
    chargeKept &&= ringCharge(states[t]!) === q0

    if (!orbit.aligned[t]) {
      continue
    }

    const copies = lineCopies(ringView(states[t]!, orbit.orbit[t]!), window, parity)

    maxCopies = Math.max(maxCopies, copies.length)

    if (event === null && copies.length >= 2) {
      event = { round: t, copies, environmentCopies: 0 }
    }
  }

  return { event, maxCopies, chargeKept, place }
}

export function vacuumBreedsTrue(input: {
  rule: GateRule
  mutant: readonly number[]
  place: number
  orbit: { orbit: Int8Array[]; aligned: boolean[] }
  event: ReproductionEvent
}): boolean {
  const { rule, mutant, place, orbit, event } = input
  const start = new Int8Array(orbit.orbit[0]!.length)

  mutant.forEach((t, i) => {
    start[place + i] = t
  })

  const states = ringRounds(rule, start, event.round)
  const found = new Set(lineCopies(ringView(states[event.round]!, orbit.orbit[event.round]!), mutant, place % 2))

  return event.copies.every(x => found.has(x))
}

// ---- P2: the mark of a point mutation in a species cell ----

// membership in the driving set D: occupancy (T0..T3), the mover set (T5), the static set (T4)
export function drivingMember(split: CellSplit, tone: number): boolean {
  if (split.type === 'T4') {
    return tone === split.still
  }

  if (split.type === 'T5') {
    return tone === split.mover
  }

  return tone !== split.background
}

// whether the pair (c, p) swaps its cells, from the driving layer of the state (the M6 lemma)
function lemmaSwaps(split: CellSplit, tc: number, tp: number): boolean {
  const dc = drivingMember(split, tc)
  const dp = drivingMember(split, tp)

  switch (split.type) {
    case 'T0':
      return false
    case 'T3':
      return true
    case 'T1':
      return dc && dp
    case 'T2':
      return !(dc && dp)
    case 'T4':
      return !(dc || dp)
    case 'T5':
      return dc || dp
    default:
      throw new Error(`reproduction: ${split.rule} on ${split.background} is not a species cell`)
  }
}

// whether D moves at all: T2, T3, T5 move it by the full swap, T0, T1, T4 never
function drivingMoves(split: CellSplit): boolean {
  return split.type === 'T2' || split.type === 'T3' || split.type === 'T5'
}

export type MarkReading = {
  layer: 'driving' | 'state'
  // rounds whose difference set (in the layer) is not exactly the predicted cell
  breaks: number
  maxDifference: number
}

function differences(a: Tones, b: Tones, background: number, keep: (x: number, y: number) => boolean): number[] {
  const cells = new Set([...a.keys(), ...b.keys()])

  return [...cells].filter(c => !keep(a.get(c) ?? background, b.get(c) ?? background)).sort((x, y) => x - y)
}

export function markCheck(input: {
  rule: GateRule
  split: CellSplit
  schedule: Schedule
  start: Tones
  cell: number
  tone: number
  rounds: number
}): MarkReading {
  const { rule, split, schedule, start, cell, tone, rounds } = input
  const b = split.background
  const x = new Map(start)
  const y = new Map(start)

  if (tone === b) {
    y.delete(cell)
  } else {
    y.set(cell, tone)
  }

  const layer = drivingMember(split, start.get(cell) ?? b) !== drivingMember(split, tone) ? 'driving' : 'state'
  const L = schedule.colors.length

  let predicted = cell
  let breaks = 0
  let maxDifference = 0

  for (let r = 0; r < rounds; r++) {
    for (let j = 0; j < L; j++) {
      const k = r * L + j
      const p = schedule.space.partner(schedule.colors[j]!, predicted)

      if (p >= 0) {
        const swaps =
          layer === 'driving' ? drivingMoves(split) : lemmaSwaps(split, x.get(predicted) ?? b, x.get(p) ?? b)

        if (swaps) {
          predicted = p
        }
      }

      applyStep(rule, b, schedule, k, x)
      applyStep(rule, b, schedule, k, y)
    }

    const diff =
      layer === 'driving'
        ? differences(x, y, b, (s, t) => drivingMember(split, s) === drivingMember(split, t))
        : differences(x, y, b, (s, t) => s === t)

    maxDifference = Math.max(maxDifference, diff.length)

    if (diff.length !== 1 || diff[0] !== predicted) {
      breaks++
    }
  }

  return { layer, breaks, maxDifference }
}

// the largest number of cells two runs differ on, over `rounds` rounds (any cell kind; the negative control)
export function markSpread(input: {
  rule: GateRule
  background: number
  schedule: Schedule
  start: Tones
  cell: number
  tone: number
  rounds: number
}): number {
  const { rule, background, schedule, start, cell, tone, rounds } = input
  const x = new Map(start)
  const y = new Map(start)

  if (tone === background) {
    y.delete(cell)
  } else {
    y.set(cell, tone)
  }

  const L = schedule.colors.length

  let most = 0

  for (let r = 0; r < rounds; r++) {
    for (let j = 0; j < L; j++) {
      applyStep(rule, background, schedule, r * L + j, x)
      applyStep(rule, background, schedule, r * L + j, y)
    }

    most = Math.max(most, differences(x, y, background, (s, t) => s === t).length)
  }

  return most
}

// ---- S4: copy candidates on a tiling ----

// the clusters of a state that could be a copy: the same cell count and the same capped-distance shape key
export function clusterCandidates(space: PairSpace, state: Tones, key: string, size: number): number {
  let n = 0

  for (const c of clusters(space, state)) {
    if (c.length === size && shapeKey(space, state, c) === key) {
      n++
    }
  }

  return n
}

function tonesCharge(state: Tones, background: number): number {
  let q = 0

  for (const t of state.values()) {
    q += t - background
  }

  return q
}

export type TilingCandidate = { round: number; candidates: number; environmentCandidates: number }

// one structure in one environment on a tiling: the first round with a copy candidate event, and charge
export function tilingReproduction(input: {
  rule: GateRule
  background: number
  space: PairSpace
  colors: readonly number[]
  structure: Tones
  environment: Tones | null
  environmentRounds: readonly Tones[] | null
  rounds: number
}): { candidate: TilingCandidate | null; chargeKept: boolean } {
  const { rule, background, space, colors, structure, environment, environmentRounds, rounds } = input
  const key = shapeKey(space, structure)
  const size = structure.size
  const state = new Map(structure)

  for (const [c, t] of environment ?? new Map<number, number>()) {
    state.set(c, t)
  }

  const q0 = tonesCharge(state, background)
  const start = clusterCandidates(space, state, key, size)

  let candidate: TilingCandidate | null = null
  let chargeKept = true

  for (let t = 1; t <= rounds; t++) {
    sparseRound({ space, colors, rule, background, state })
    chargeKept &&= tonesCharge(state, background) === q0

    if (candidate !== null || start > 1) {
      continue
    }

    const n = clusterCandidates(space, state, key, size)

    if (n >= 2) {
      const e = environmentRounds === null ? 0 : clusterCandidates(space, environmentRounds[t]!, key, size)

      if (n >= 2 + e) {
        candidate = { round: t, candidates: n, environmentCandidates: e }
      }
    }
  }

  return { candidate, chargeKept }
}

// the environment's own run on a tiling, every round end
export function tilingRounds(input: {
  rule: GateRule
  background: number
  space: PairSpace
  colors: readonly number[]
  start: Tones
  rounds: number
}): Tones[] {
  const state = new Map(input.start)
  const out = [new Map(state)]

  for (let t = 0; t < input.rounds; t++) {
    sparseRound({ space: input.space, colors: input.colors, rule: input.rule, background: input.background, state })
    out.push(new Map(state))
  }

  return out
}

// ---- A1: the census of a line state and the response to an environment ----

// isolated clusters (cells off the background linked across at most LINK_GAP - 1 background cells), keyed by the parity of
// the low end and the tones from low to high end
export function lineCensus(f: Frame, background: number): Map<string, number> {
  const out = new Map<string, number>()
  const n = f.tones.length

  let i = 0

  while (i < n) {
    if (f.tones[i] === background) {
      i++
      continue
    }

    let j = i

    for (let k = i + 1; k < n && k - j <= LINK_GAP; k++) {
      if (f.tones[k] !== background) {
        j = k
      }
    }

    const key = `${(((f.lo + i) % 2) + 2) % 2}:${Array.from(f.tones.slice(i, j + 1)).join(',')}`

    out.set(key, (out.get(key) ?? 0) + 1)
    i = j + 1
  }

  return out
}

// the size of the multiset difference between the joint census and the union of the two separate ones
export function censusResponse(joint: Map<string, number>, a: Map<string, number>, b: Map<string, number>): number {
  const keys = new Set([...joint.keys(), ...a.keys(), ...b.keys()])

  let d = 0

  for (const k of keys) {
    d += Math.abs((joint.get(k) ?? 0) - (a.get(k) ?? 0) - (b.get(k) ?? 0))
  }

  return d
}

export function censusSignature(joint: Map<string, number>, a: Map<string, number>, b: Map<string, number>): string {
  const keys = [...new Set([...joint.keys(), ...a.keys(), ...b.keys()])].sort()

  return keys
    .map(k => [k, (joint.get(k) ?? 0) - (a.get(k) ?? 0) - (b.get(k) ?? 0)] as const)
    .filter(([, d]) => d !== 0)
    .map(([k, d]) => `${k}x${d}`)
    .join(' ')
}

// windows laid left to right from `from`, each starting on an even cell at least `gap` background cells after the last
export function laidOut(windows: readonly (readonly number[])[], from: number, gap: number): LineWindow[] {
  const out: LineWindow[] = []

  let next = from + (((from % 2) + 2) % 2)

  for (const w of windows) {
    out.push({ start: next, window: w })

    const end = next + w.length - 1 + gap + 1

    next = end + (((end % 2) + 2) % 2)
  }

  return out
}
