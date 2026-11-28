// M7 association without per-cell weights (item vibe-computation-models-0018). Algebra: spin-one.
//
// A cue is a word of tones on a readout region R (the background everywhere else). A fixed rule runs forward for END
// rounds and the tones of R are read at every round end: that readout is FIELD-REALIZED (the mesh's own tones, no table,
// no clock). The question is whether different cues end as the same word on R, as a Hopfield network's cues end as the
// stored pattern. Every round of a pair rule (M1) and of the reversible Blume-Capel rule (M2-B) is a bijection, so the
// whole state never merges; only the part on R can, with the difference held outside R (transiently in a closed box,
// for good when the open window's sink carries it away).
//
// CENSUS (`regionCensus`). Over every cue: the late trace (the readout at rounds SETTLE..END). A word p is STORED when the
// cue p keeps p on R through the late trace. A COMPLETION is a cue c != p whose late trace is constantly p, p stored and
// not the background word. FORGOTTEN: the late trace is constantly the background word. A MERGE is a late-trace key held
// by two or more cues, the background constant excepted. Each completion is typed entry by entry against p: erase (a
// non-background entry of p is background in c), flip (the other non-background tone), add (p is background there and c
// is not), mixed (more than one kind).
//
// EXTERNAL readout, labeled so: the nearest stored word by Hamming distance (unique minimum, else none), at round END
// and, as the no-dynamics baseline, at round 0 (the cue itself).
//
// CONSERVATION (exact, before any run). Every M1 rule keeps Q = sum (s - b); the vacuum-fixing ones also keep
// D = sum (s^2 - b^2). If c ends with p on R, the outside of R carries Q(c) - Q(p) and D(c) - D(p), which must be the
// charges of a finite configuration on the background (`outsideFeasible`). On the vacuum that is D_out >= |Q_out| with
// equal parity, so an erased or a flipped entry is never restored by a vacuum-fixing rule, in any box.
//
// HOPFIELD (the positive control, per-cell weights, the structure M7 must do without): exact integer Hebbian weights,
// asynchronous sweeps in a fixed order, sign with a tie keeping the tone, until a sweep changes nothing.
//
// Nothing here draws a random number: cues and patterns are enumerated in a fixed order.

import { PairSpace, Tones, sameTones } from '@/code/measure/particle-census'
import { Run, forwardRound, inverseRound } from '@/code/compute/lab/memory'
import { BlumeCapel, CellGraph, IndependentSetSchedule, q2rMove } from '@/code/rule/spin-one-q2r'

// ---- parameters, fixed before the first run ----

export const END = 48
export const SETTLE = 24
export const EXHAUSTIVE_MAX = 7
export const BOUNDED_SUPPORT = 2
export const RETURN_CAP = 512
export const HOPFIELD_SWEEPS = 64
export const GRAPH_ANCHORS = 32
export const GRAPH_PATTERNS = 8

// ---- words ----

const TONE_CHAR = ['n', 'z', 'p']

export function wordKey(word: ArrayLike<number>): string {
  let s = ''

  for (const t of Array.from(word)) {
    s += TONE_CHAR[t + 1]
  }

  return s
}

// Every word in {-1, 0, 1}^n in lexicographic order (-1 < 0 < 1).
export function cueWords(n: number): Int8Array[] {
  const out: Int8Array[] = []
  const word = new Int8Array(n).fill(-1)

  for (;;) {
    out.push(Int8Array.from(word))

    let i = n - 1

    while (i >= 0 && word[i] === 1) {
      word[i] = -1
      i--
    }

    if (i < 0) {
      break
    }

    word[i]!++
  }

  return out
}

// Bounded cue sets enumerated directly (the full product is too large to walk): every word with at most k entries off
// the background, in lexicographic order.
export function boundedCueWords(n: number, background: number, k: number): Int8Array[] {
  const out: Int8Array[] = []
  const off = [-1, 0, 1].filter(t => t !== background)
  const word = new Int8Array(n).fill(background)

  const place = (from: number, left: number): void => {
    out.push(Int8Array.from(word))

    if (left === 0) {
      return
    }

    for (let i = from; i < n; i++) {
      for (const t of off) {
        word[i] = t
        place(i + 1, left - 1)
        word[i] = background
      }
    }
  }

  place(0, k)

  return out.sort((a, b) => compareWords(a, b))
}

function compareWords(a: Int8Array, b: Int8Array): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return a[i]! - b[i]!
    }
  }

  return 0
}

// The first BIT_PLANES bit planes of the region index i + 1 (tone -1 where the bit is 1), the declared patterns of a
// region too large to walk.
export const BIT_PLANES = 5

export function bitPlanePatterns(n: number): Int8Array[] {
  return Array.from({ length: BIT_PLANES }, (_, k) => Int8Array.from({ length: n }, (_, i) => (((i + 1) >> k) & 1 ? -1 : 1)))
}

// Every cue when n <= EXHAUSTIVE_MAX. Otherwise the words with at most BOUNDED_SUPPORT off-background entries, together
// with each bit-plane pattern, its negation and every word at Hamming distance 1 from those (a bounded set never holds a
// full pattern, so without them no system could show a stored word there), deduplicated, in lexicographic order. The
// same list goes to every system on the region.
export function regionCues(n: number, background: number): Int8Array[] {
  if (n <= EXHAUSTIVE_MAX) {
    return cueWords(n)
  }

  const out = new Map<string, Int8Array>()

  for (const w of boundedCueWords(n, background, BOUNDED_SUPPORT)) {
    out.set(wordKey(w), w)
  }

  for (const p of bitPlanePatterns(n)) {
    for (const q of [p, Int8Array.from(p, t => -t)]) {
      out.set(wordKey(q), q)

      for (let i = 0; i < n; i++) {
        for (const t of [-1, 0, 1]) {
          if (t !== q[i]) {
            const c = Int8Array.from(q)

            c[i] = t
            out.set(wordKey(c), c)
          }
        }
      }
    }
  }

  return [...out.values()].sort((a, b) => compareWords(a, b))
}

export type DiffKind = 'same' | 'erase' | 'flip' | 'add' | 'mixed'

export function diffKind(cue: ArrayLike<number>, target: ArrayLike<number>, background: number): DiffKind {
  const kinds = new Set<string>()

  for (let i = 0; i < cue.length; i++) {
    const c = cue[i]!
    const p = target[i]!

    if (c === p) {
      continue
    }

    kinds.add(p === background ? 'add' : c === background ? 'erase' : 'flip')
  }

  if (kinds.size === 0) {
    return 'same'
  }

  return kinds.size === 1 ? ([...kinds][0] as DiffKind) : 'mixed'
}

export function hamming(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let d = 0

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      d++
    }
  }

  return d
}

// ---- conservation ----

export function chargeAbout(word: ArrayLike<number>, background: number): { q: number; d: number } {
  let q = 0
  let d = 0

  for (const t of Array.from(word)) {
    q += t - background
    d += t * t - background * background
  }

  return { q, d }
}

export function tonesCharge(state: Tones, background: number): { q: number; d: number } {
  return chargeAbout([...state.values()], background)
}

// Whether some finite configuration on the background has charge qOut (and excitation dOut when the rule keeps D):
// nonnegative counts n_t of the two off-background tones with sum n_t (t - b) = qOut and sum n_t (t^2 - b^2) = dOut.
export function outsideFeasible(input: { background: number; qOut: number; dOut: number; keepsD: boolean }): boolean {
  const { background: b, qOut, dOut, keepsD } = input
  const [t1, t2] = [-1, 0, 1].filter(t => t !== b) as [number, number]
  const q1 = t1 - b
  const q2 = t2 - b
  const d1 = t1 * t1 - b * b
  const d2 = t2 * t2 - b * b
  const bound = Math.abs(qOut) + Math.abs(dOut) + 2

  for (let n1 = 0; n1 <= bound; n1++) {
    for (let n2 = 0; n2 <= bound; n2++) {
      if (n1 * q1 + n2 * q2 === qOut && (!keepsD || n1 * d1 + n2 * d2 === dOut)) {
        return true
      }
    }
  }

  return false
}

// ---- systems ----

// The same space with every partner, orientation, distance and neighbour list remembered once asked (the answers of a
// fixed space never change, so the runs are identical and faster).
export function cachedSpace(space: PairSpace): PairSpace {
  const c = space.colorCount
  const partner = new Map<number, number>()
  const first = new Map<number, boolean>()
  const distance = new Map<number, number>()
  const neighbors = new Map<number, readonly number[]>()

  return {
    colorCount: c,
    partner: (color, cell) => {
      const k = cell * c + color

      let v = partner.get(k)

      if (v === undefined) {
        v = space.partner(color, cell)
        partner.set(k, v)
      }

      return v
    },
    isFirst: (color, cell) => {
      const k = cell * c + color

      let v = first.get(k)

      if (v === undefined) {
        v = space.isFirst(color, cell)
        first.set(k, v)
      }

      return v
    },
    distance: cell => {
      let v = distance.get(cell)

      if (v === undefined) {
        v = space.distance(cell)
        distance.set(cell, v)
      }

      return v
    },
    neighbors: cell => {
      let v = neighbors.get(cell)

      if (v === undefined) {
        v = space.neighbors(cell)
        neighbors.set(cell, v)
      }

      return v
    },
  }
}

export type CueRun = {
  // the readout key at rounds 0..END
  words: string[]
  // the whole final state (off-background cells only)
  final: Tones
  // the whole start state
  start: Tones
}

export type RegionSystem = {
  readonly region: readonly number[]
  readonly background: number
  runCue(cue: Int8Array): CueRun
}

function startTones(region: readonly number[], cue: Int8Array, background: number): Tones {
  const s: Tones = new Map()

  region.forEach((cell, i) => {
    if (cue[i] !== background) {
      s.set(cell, cue[i]!)
    }
  })

  return s
}

function readKey(region: readonly number[], state: Tones, background: number): string {
  let s = ''

  for (const cell of region) {
    s += TONE_CHAR[(state.get(cell) ?? background) + 1]
  }

  return s
}

export function pairRuleSystem(run: Run, region: readonly number[]): RegionSystem {
  return {
    region,
    background: run.background,
    runCue(cue) {
      const start = startTones(region, cue, run.background)
      const state = new Map(start)
      const words = [readKey(region, state, run.background)]

      for (let t = 1; t <= END; t++) {
        forwardRound(run, state)
        words.push(readKey(region, state, run.background))
      }

      return { words, final: state, start }
    },
  }
}

// Verification only, never a readout: the inverse rule run END rounds back from the final state gives the start.
export function inverseReturns(run: Run, final: Tones, start: Tones): boolean {
  const state = new Map(final)

  for (let t = 0; t < END; t++) {
    inverseRound(run, state)
  }

  return sameTones(state, start)
}

// The exact return round of a whole start within `cap` rounds, 0 when none (closed boxes: a transient coincidence).
export function pairReturn(run: Run, start: Tones, cap: number): number {
  const state = new Map(start)

  for (let t = 1; t <= cap; t++) {
    forwardRound(run, state)

    if (sameTones(state, start)) {
      return t
    }
  }

  return 0
}

// The reversible Blume-Capel rule (M2-B) on a closed graph, sparse on the vacuum (fixed when Delta != 0): a set of the
// independent-set schedule updates only its cells in or beside the support, since a vacuum cell with field 0 stays.
export class SparseBlumeCapel {
  readonly graph: CellGraph
  readonly schedule: IndependentSetSchedule
  readonly model: BlumeCapel

  constructor(input: { graph: CellGraph; schedule: IndependentSetSchedule; model: BlumeCapel }) {
    if (input.model.crystalField === 0) {
      throw new Error('association: the vacuum is not fixed at Delta = 0')
    }

    this.graph = input.graph
    this.schedule = input.schedule
    this.model = input.model
  }

  field(state: Tones, cell: number): number {
    let h = 0

    for (let k = this.graph.offsets[cell]!; k < this.graph.offsets[cell + 1]!; k++) {
      h += state.get(this.graph.adjacency[k]!) ?? 0
    }

    return h
  }

  round(state: Tones): void {
    for (let k = 0; k < this.schedule.colors; k++) {
      const touched = new Set<number>()

      for (const cell of state.keys()) {
        if (this.schedule.colorOf[cell] === k) {
          touched.add(cell)
        }

        for (let j = this.graph.offsets[cell]!; j < this.graph.offsets[cell + 1]!; j++) {
          const n = this.graph.adjacency[j]!

          if (this.schedule.colorOf[n] === k) {
            touched.add(n)
          }
        }
      }

      const next: [number, number][] = []

      for (const cell of [...touched].sort((a, b) => a - b)) {
        next.push([cell, q2rMove(state.get(cell) ?? 0, this.field(state, cell), this.model)])
      }

      for (const [cell, t] of next) {
        if (t === 0) {
          state.delete(cell)
        } else {
          state.set(cell, t)
        }
      }
    }
  }

  energy(state: Tones): number {
    let bond = 0
    let squares = 0

    for (const [cell, t] of state) {
      bond += t * this.field(state, cell)
      squares += t * t
    }

    return -this.model.coupling * (bond / 2) + this.model.crystalField * squares
  }

  returnTime(start: Tones, cap: number): number {
    const state = new Map(start)

    for (let t = 1; t <= cap; t++) {
      this.round(state)

      if (sameTones(state, start)) {
        return t
      }
    }

    return 0
  }
}

export function blumeCapelSystem(rule: SparseBlumeCapel, region: readonly number[]): RegionSystem {
  return {
    region,
    background: 0,
    runCue(cue) {
      const start = startTones(region, cue, 0)
      const state = new Map(start)
      const words = [readKey(region, state, 0)]

      for (let t = 1; t <= END; t++) {
        rule.round(state)
        words.push(readKey(region, state, 0))
      }

      return { words, final: state, start }
    },
  }
}

// ---- Hopfield (the positive control) ----

export type Hopfield = {
  readonly n: number
  // weights[i * n + j], exact integers, zero diagonal
  readonly weights: Int32Array
}

// Hebbian weights sum_mu xi_i xi_j on the given pairs only (sparse: the graph's edges; dense: every pair).
export function hebbian(n: number, patterns: readonly Int8Array[], pairs: readonly (readonly [number, number])[]): Hopfield {
  const weights = new Int32Array(n * n)

  for (const [i, j] of pairs) {
    let w = 0

    for (const xi of patterns) {
      w += xi[i]! * xi[j]!
    }

    weights[i * n + j] = w
    weights[j * n + i] = w
  }

  return { n, weights }
}

export function allPairs(n: number): [number, number][] {
  const out: [number, number][] = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      out.push([i, j])
    }
  }

  return out
}

// One asynchronous sweep in index order; returns whether any tone changed.
export function hopfieldSweep(net: Hopfield, state: Int8Array): boolean {
  let changed = false

  for (let i = 0; i < net.n; i++) {
    let h = 0

    for (let j = 0; j < net.n; j++) {
      h += net.weights[i * net.n + j]! * state[j]!
    }

    const t = h > 0 ? 1 : h < 0 ? -1 : state[i]!

    if (t !== state[i]) {
      state[i] = t
      changed = true
    }
  }

  return changed
}

export function hopfieldRelax(net: Hopfield, cue: Int8Array): Int8Array {
  const state = Int8Array.from(cue)

  for (let s = 0; s < HOPFIELD_SWEEPS; s++) {
    if (!hopfieldSweep(net, state)) {
      break
    }
  }

  return state
}

// The Hopfield network as a region system: one round is one sweep, the region's index i is cell region[i].
export function hopfieldSystem(net: Hopfield, region: readonly number[]): RegionSystem {
  return {
    region,
    background: 0,
    runCue(cue) {
      const state = Int8Array.from(cue)
      const words = [wordKey(state)]

      for (let t = 1; t <= END; t++) {
        hopfieldSweep(net, state)
        words.push(wordKey(state))
      }

      return { words, final: startTones(region, state, 0), start: startTones(region, cue, 0) }
    },
  }
}

// The +-1 words of length n in lexicographic order, kept greedily when at Hamming distance at least ceil(n / 2) from
// every kept word and from its negation.
export function spreadPatterns(n: number): Int8Array[] {
  const kept: Int8Array[] = []
  const need = Math.ceil(n / 2)

  for (let m = 0; m < 1 << n; m++) {
    const w = Int8Array.from({ length: n }, (_, i) => ((m >> (n - 1 - i)) & 1 ? 1 : -1))
    const neg = Int8Array.from(w, t => -t)

    if (kept.every(k => hamming(k, w) >= need && hamming(k, neg) >= need)) {
      kept.push(w)
    }
  }

  return kept
}

export type HopfieldCapacity = {
  // per K = 1..patterns.length: patterns that are fixed points, and distance-1 erase and flip cues that relax to theirs
  rows: { k: number; fixed: number; eraseRight: number; eraseAll: number; flipRight: number; flipAll: number }[]
  // the largest K with every pattern fixed and every distance-1 erase cue right (0 when none)
  capacity: number
}

export function hopfieldCapacity(input: {
  n: number
  patterns: readonly Int8Array[]
  pairs: readonly (readonly [number, number])[]
}): HopfieldCapacity {
  const rows: HopfieldCapacity['rows'] = []

  let capacity = 0
  let broken = false

  for (let k = 1; k <= input.patterns.length; k++) {
    const ps = input.patterns.slice(0, k)
    const net = hebbian(input.n, ps, input.pairs)
    const row = { k, fixed: 0, eraseRight: 0, eraseAll: 0, flipRight: 0, flipAll: 0 }

    for (const p of ps) {
      if (hamming(hopfieldRelax(net, p), p) === 0) {
        row.fixed++
      }

      for (let i = 0; i < input.n; i++) {
        const e = Int8Array.from(p)

        e[i] = 0
        row.eraseAll++
        row.eraseRight += hamming(hopfieldRelax(net, e), p) === 0 ? 1 : 0

        const f = Int8Array.from(p)

        f[i] = -f[i]!
        row.flipAll++
        row.flipRight += hamming(hopfieldRelax(net, f), p) === 0 ? 1 : 0
      }
    }

    rows.push(row)

    if (!broken && row.fixed === k && row.eraseRight === row.eraseAll) {
      capacity = k
    } else {
      broken = true
    }
  }

  return { rows, capacity }
}

// Hopfield on a whole graph with sparse edge weights: patterns are the bit planes of the breadth-first rank, cues erase
// or flip the radius-1 ball of each of the first GRAPH_ANCHORS cells in breadth-first order.
export function graphHopfield(input: { neighbors: readonly (readonly number[])[]; order: readonly number[] }): {
  rows: { k: number; fixed: number; eraseRight: number; flipRight: number; cues: number }[]
  capacity: number
} {
  const n = input.neighbors.length
  const rank = new Int32Array(n)

  input.order.forEach((cell, r) => {
    rank[cell] = r
  })

  const patterns = Array.from({ length: GRAPH_PATTERNS }, (_, k) => Int8Array.from({ length: n }, (_, c) => ((rank[c]! >> k) & 1 ? -1 : 1)))
  const rows: { k: number; fixed: number; eraseRight: number; flipRight: number; cues: number }[] = []
  const anchors = input.order.slice(0, GRAPH_ANCHORS)

  let capacity = 0
  let broken = false

  for (let k = 1; k <= GRAPH_PATTERNS; k++) {
    const ps = patterns.slice(0, k)
    // sparse weights stored per edge
    const w = input.neighbors.map((row, i) => row.map(j => ps.reduce((s, xi) => s + xi[i]! * xi[j]!, 0)))

    const relax = (cue: Int8Array): Int8Array => {
      const s = Int8Array.from(cue)

      for (let sweep = 0; sweep < HOPFIELD_SWEEPS; sweep++) {
        let changed = false

        for (const i of input.order) {
          let h = 0

          input.neighbors[i]!.forEach((j, x) => {
            h += w[i]![x]! * s[j]!
          })

          const t = h > 0 ? 1 : h < 0 ? -1 : s[i]!

          if (t !== s[i]) {
            s[i] = t
            changed = true
          }
        }

        if (!changed) {
          break
        }
      }

      return s
    }

    const row = { k, fixed: 0, eraseRight: 0, flipRight: 0, cues: 0 }

    for (const p of ps) {
      if (hamming(relax(p), p) === 0) {
        row.fixed++
      }

      for (const a of anchors) {
        const ball = [a, ...input.neighbors[a]!]
        const e = Int8Array.from(p)
        const f = Int8Array.from(p)

        for (const c of ball) {
          e[c] = 0
          f[c] = -p[c]!
        }

        row.cues++
        row.eraseRight += hamming(relax(e), p) === 0 ? 1 : 0
        row.flipRight += hamming(relax(f), p) === 0 ? 1 : 0
      }
    }

    rows.push(row)

    if (!broken && row.fixed === k && row.eraseRight === row.cues) {
      capacity = k
    } else {
      broken = true
    }
  }

  return { rows, capacity }
}

// ---- the census ----

export type Completion = {
  cue: string
  target: string
  kind: DiffKind
  distance: number
  // the whole start and final states, for the gates
  start: Tones
  final: Tones
}

export type RegionCensus = {
  cues: number
  stored: string[]
  completions: Completion[]
  forgotten: number
  merges: number
  // late-trace keys held by two or more cues that are not constant (periodic or wandering merges)
  periodicMerges: number
  // distance-1 cues of stored non-background words: field-realized settling on their word, by kind, and wrong recalls
  near: {
    all: number
    right: number
    byKind: Record<'erase' | 'flip' | 'add', { all: number; right: number }>
    wrong: number
    // the external nearest-stored-word decoder at round END and at round 0 (the cue itself, no dynamics)
    externalEnd: number
    externalStart: number
  }
  // stored non-background words completing at least one cue
  completing: number
  // stored non-background words completing every distance-1 cue of one kind
  completingEvery: Record<'erase' | 'flip' | 'add', number>
  serialized: string
}

function nearest(word: string, stored: readonly string[]): string | null {
  let best: string | null = null
  let bestD = Number.MAX_SAFE_INTEGER
  let tie = false

  for (const s of stored) {
    let d = 0

    for (let i = 0; i < s.length; i++) {
      if (s[i] !== word[i]) {
        d++
      }
    }

    if (d < bestD) {
      best = s
      bestD = d
      tie = false
    } else if (d === bestD) {
      tie = true
    }
  }

  return tie ? null : best
}

const CHAR_TONE: Record<string, number> = { n: -1, z: 0, p: 1 }

export function keyWord(key: string): Int8Array {
  return Int8Array.from(key, ch => CHAR_TONE[ch]!)
}

export function regionCensus(system: RegionSystem, cues: readonly Int8Array[]): RegionCensus {
  const bgKey = TONE_CHAR[system.background + 1]!.repeat(system.region.length)
  const late = new Map<string, string>()
  const constant = new Map<string, string | null>()
  const endWord = new Map<string, string>()
  const runs = new Map<string, CueRun>()

  for (const cue of cues) {
    const key = wordKey(cue)
    const r = system.runCue(cue)
    const tail = r.words.slice(SETTLE)

    late.set(key, tail.join('|'))
    constant.set(key, tail.every(w => w === tail[0]) ? tail[0]! : null)
    endWord.set(key, r.words[END]!)
    runs.set(key, r)
  }

  const stored = [...constant.entries()].filter(([k, w]) => w === k).map(([k]) => k)
  const storedSet = new Set(stored)
  const completions: Completion[] = []

  let forgotten = 0

  for (const [k, w] of constant) {
    if (w === null || w === k) {
      continue
    }

    if (w === bgKey) {
      forgotten++
      continue
    }

    if (storedSet.has(w)) {
      const r = runs.get(k)!

      completions.push({
        cue: k,
        target: w,
        kind: diffKind(keyWord(k), keyWord(w), system.background),
        distance: hamming(keyWord(k), keyWord(w)),
        start: r.start,
        final: r.final,
      })
    }
  }

  const groups = new Map<string, number>()

  for (const tail of late.values()) {
    groups.set(tail, (groups.get(tail) ?? 0) + 1)
  }

  const bgTail = Array.from({ length: END - SETTLE + 1 }, () => bgKey).join('|')

  let merges = 0
  let periodicMerges = 0

  for (const [tail, count] of groups) {
    if (count < 2 || tail === bgTail) {
      continue
    }

    merges += count - 1

    const parts = tail.split('|')

    if (!parts.every(w => w === parts[0])) {
      periodicMerges += count - 1
    }
  }

  const real = stored.filter(s => s !== bgKey)
  const near: RegionCensus['near'] = {
    all: 0,
    right: 0,
    byKind: { erase: { all: 0, right: 0 }, flip: { all: 0, right: 0 }, add: { all: 0, right: 0 } },
    wrong: 0,
    externalEnd: 0,
    externalStart: 0,
  }

  const completingEvery: RegionCensus['completingEvery'] = { erase: 0, flip: 0, add: 0 }
  const tones = [-1, 0, 1]

  for (const p of real) {
    const pw = keyWord(p)
    const every = { erase: true, flip: true, add: true }
    const seen = { erase: false, flip: false, add: false }

    for (let i = 0; i < pw.length; i++) {
      for (const t of tones) {
        if (t === pw[i]) {
          continue
        }

        const c = Int8Array.from(pw)

        c[i] = t

        const ck = wordKey(c)

        if (!constant.has(ck)) {
          // a bounded cue set may not hold every neighbour: count only cues that were run
          continue
        }

        const kind = diffKind(c, pw, system.background) as 'erase' | 'flip' | 'add'
        const w = constant.get(ck)
        const right = w === p

        near.all++
        near.byKind[kind].all++
        seen[kind] = true

        if (right) {
          near.right++
          near.byKind[kind].right++
        } else {
          every[kind] = false

          if (w !== null && w !== undefined && w !== bgKey && storedSet.has(w)) {
            near.wrong++
          }
        }

        if (nearest(endWord.get(ck)!, real) === p) {
          near.externalEnd++
        }

        if (nearest(ck, real) === p) {
          near.externalStart++
        }
      }
    }

    for (const kind of ['erase', 'flip', 'add'] as const) {
      if (seen[kind] && every[kind]) {
        completingEvery[kind]++
      }
    }
  }

  const completing = new Set(completions.map(c => c.target)).size
  const serialized = JSON.stringify({
    stored,
    completions: completions.map(c => [c.cue, c.target, c.kind]),
    forgotten,
    merges,
    periodicMerges,
    near,
  })

  return {
    cues: cues.length,
    stored,
    completions,
    forgotten,
    merges,
    periodicMerges,
    near,
    completing,
    completingEvery,
    serialized,
  }
}
