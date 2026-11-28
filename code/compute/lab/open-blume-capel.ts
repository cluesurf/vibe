// The reversible Blume-Capel rule (M2-B) in the open window and behind a wall (item vibe-computation-models-0063).
// Algebra: spin-one.
//
// THE RULE is code/rule/spin-one-q2r.ts q2rMove, unchanged: a cell swaps the two tones of equal local energy
// e(t) = -J t h + Delta t^2 (h its neighbours' sum), so every update of one independent set is an involution that keeps
// E = -J sum_edges s_i s_j + Delta sum s_i^2. It keeps neither Q = sum s nor D = sum s^2.
//
// THE OPEN WINDOW. With Delta != 0 the vacuum is fixed (a vacuum cell with h = 0 stays), so a state that is the vacuum
// outside a finite support evolves exactly by updating only the support and its neighbours: the sparse run IS the run
// on the infinite tiling. The schedule is a proper vertex coloring of the infinite tiling
// (code/substrate/coxeter/canonical-vertex-coloring.ts), K = degree + 1 sets applied in order per round (a set with no
// cell near the support changes nothing).
//
// THE WALL. The same tiling and coloring restricted to the cells within `wall` of the origin: the induced subgraph, a
// finite closed box. An independent set of the tiling is independent on the box, so the rule is still a bijection
// there and every orbit is periodic (any region coincidence must come back).
//
// GATES carried by every run: the light cone (a set moves information at most one hop, so after t rounds no support
// cell lies farther than r0 + K t), and a support budget: a run whose support passes `supportCap` stops, its completed
// rounds stay exact and the stop is recorded, never read as a result.

import { CueRun, END, RegionSystem } from '@/code/compute/lab/association'
import { Tones, sameTones } from '@/code/measure/particle-census'
import { BlumeCapel, q2rMove } from '@/code/rule/spin-one-q2r'
import { CanonicalVertexColoring } from '@/code/substrate/coxeter/canonical-vertex-coloring'

export class OpenBlumeCapel {
  readonly model: BlumeCapel
  readonly coloring: CanonicalVertexColoring
  readonly wall: number | null
  readonly supportCap: number
  readonly order: readonly number[]
  private readonly distanceOf: (cell: number) => number
  private readonly inside = new Map<number, readonly number[]>()
  // the largest (support distance - (r0 + K t)) seen, must stay <= 0
  coneExcess = Number.NEGATIVE_INFINITY

  constructor(input: {
    model: BlumeCapel
    coloring: CanonicalVertexColoring
    distance: (cell: number) => number
    wall: number | null
    supportCap: number
    colorOrder: 'forward' | 'reverse'
  }) {
    if (input.model.crystalField === 0) {
      throw new Error('open-blume-capel: the vacuum is not fixed at Delta = 0')
    }

    this.model = input.model
    this.coloring = input.coloring
    this.distanceOf = input.distance
    this.wall = input.wall
    this.supportCap = input.supportCap

    const sets = Array.from({ length: input.coloring.colors }, (_, k) => k)

    this.order = input.colorOrder === 'forward' ? sets : sets.reverse()
  }

  // neighbours within the box (every neighbour when open)
  neighbors(cell: number): readonly number[] {
    let row = this.inside.get(cell)

    if (row === undefined) {
      const all = this.coloring.neighbors(cell)

      row = this.wall === null ? all : all.filter(w => this.distanceOf(w) <= this.wall!)
      this.inside.set(cell, row)
    }

    return row
  }

  field(state: Tones, cell: number): number {
    let h = 0

    for (const w of this.neighbors(cell)) {
      h += state.get(w) ?? 0
    }

    return h
  }

  // one round in place; false (state left mid-round is never read) once the support passes the budget
  round(state: Tones): boolean {
    for (const k of this.order) {
      const touched = new Set<number>()

      for (const cell of state.keys()) {
        if (this.coloring.colorOf(cell) === k) {
          touched.add(cell)
        }

        for (const n of this.neighbors(cell)) {
          if (this.coloring.colorOf(n) === k) {
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

      if (state.size > this.supportCap) {
        return false
      }
    }

    return true
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

  radius(state: Tones): number {
    let r = -1

    for (const cell of state.keys()) {
      r = Math.max(r, this.distanceOf(cell))
    }

    return r
  }

  // the exact return round of a whole start within `cap` rounds, 0 when none (or when the budget stops the run)
  returnTime(start: Tones, cap: number): number {
    const state = new Map(start)

    for (let t = 1; t <= cap; t++) {
      if (!this.round(state)) {
        return 0
      }

      if (sameTones(state, start)) {
        return t
      }
    }

    return 0
  }

  // whether the region still reads `word` at every round END + 1 .. `until` (a completion that persists past the late
  // window), run on from the final state of the census
  persists(input: { final: Tones; region: readonly number[]; word: string; until: number }): { persists: boolean; lastRound: number } {
    const state = new Map(input.final)

    for (let t = END + 1; t <= input.until; t++) {
      if (!this.round(state)) {
        return { persists: false, lastRound: t - 1 }
      }

      if (readKey(input.region, state) !== input.word) {
        return { persists: false, lastRound: t - 1 }
      }
    }

    return { persists: true, lastRound: input.until }
  }
}

// The walled box run densely: the cells within `wall` of the origin materialized once (canonical breadth-first order),
// the coloring's classes as cell lists, the state an Int8Array. The same rule and the same sets in the same order as
// OpenBlumeCapel with `wall`, so the two give the same states (a gate checks it); dense because a Delta = 1 front fills
// the box and a sparse map over tens of thousands of cells is slow.
export class WalledBlumeCapel {
  readonly model: BlumeCapel
  readonly cells: readonly number[]
  readonly index: ReadonlyMap<number, number>
  readonly offsets: Int32Array
  readonly adjacency: Int32Array
  readonly classes: readonly Int32Array[]

  constructor(input: {
    model: BlumeCapel
    coloring: CanonicalVertexColoring
    distance: (cell: number) => number
    wall: number
    colorOrder: 'forward' | 'reverse'
  }) {
    if (input.model.crystalField === 0) {
      throw new Error('open-blume-capel: the vacuum is not fixed at Delta = 0')
    }

    this.model = input.model

    const seen = new Set<number>([0])
    const queue = [0]

    for (const u of queue) {
      for (const w of input.coloring.neighbors(u)) {
        if (!seen.has(w) && input.distance(w) <= input.wall) {
          seen.add(w)
          queue.push(w)
        }
      }
    }

    this.cells = queue
    this.index = new Map(queue.map((c, i) => [c, i]))

    const rows = queue.map(c => input.coloring.neighbors(c).filter(w => this.index.has(w)).map(w => this.index.get(w)!))
    const offsets = new Int32Array(queue.length + 1)

    rows.forEach((row, i) => {
      offsets[i + 1] = offsets[i]! + row.length
    })

    this.offsets = offsets
    this.adjacency = Int32Array.from(rows.flat())

    const raw: number[][] = Array.from({ length: input.coloring.colors }, () => [])

    queue.forEach((c, i) => {
      raw[input.coloring.colorOf(c)]!.push(i)
    })

    const sets = raw.map(r => Int32Array.from(r))

    this.classes = input.colorOrder === 'forward' ? sets : sets.reverse()
  }

  field(s: Int8Array, i: number): number {
    let h = 0

    for (let k = this.offsets[i]!; k < this.offsets[i + 1]!; k++) {
      h += s[this.adjacency[k]!]!
    }

    return h
  }

  // one round in place: within a set no two cells are adjacent, so updating them one by one reads the fields the set
  // started with
  round(s: Int8Array): void {
    for (const set of this.classes) {
      for (const i of set) {
        const t = s[i]!
        const h = this.field(s, i)

        if (t !== 0 || h !== 0) {
          s[i] = q2rMove(t, h, this.model)
        }
      }
    }
  }

  energy(s: Int8Array): number {
    let bond = 0
    let squares = 0

    for (let i = 0; i < s.length; i++) {
      const t = s[i]!

      if (t !== 0) {
        bond += t * this.field(s, i)
        squares += t * t
      }
    }

    return -this.model.coupling * (bond / 2) + this.model.crystalField * squares
  }

  fromTones(state: Tones): Int8Array {
    const s = new Int8Array(this.cells.length)

    for (const [cell, t] of state) {
      const i = this.index.get(cell)

      if (i === undefined) {
        throw new Error(`open-blume-capel: cell ${cell} lies outside the wall`)
      }

      s[i] = t
    }

    return s
  }

  toTones(s: Int8Array): Tones {
    const out: Tones = new Map()

    for (let i = 0; i < s.length; i++) {
      if (s[i] !== 0) {
        out.set(this.cells[i]!, s[i]!)
      }
    }

    return out
  }

  returnTime(start: Tones, cap: number): number {
    const s0 = this.fromTones(start)
    const s = Int8Array.from(s0)

    for (let t = 1; t <= cap; t++) {
      this.round(s)

      let same = true

      for (let i = 0; i < s.length; i++) {
        if (s[i] !== s0[i]) {
          same = false
          break
        }
      }

      if (same) {
        return t
      }
    }

    return 0
  }
}

export function walledBlumeCapelSystem(rule: WalledBlumeCapel, region: readonly number[], stats: OpenRunStats): RegionSystem {
  const at = region.map(c => {
    const i = rule.index.get(c)

    if (i === undefined) {
      throw new Error(`open-blume-capel: region cell ${c} lies outside the wall`)
    }

    return i
  })

  const key = (s: Int8Array): string => {
    let out = ''

    for (const i of at) {
      out += TONE_CHAR[s[i]! + 1]
    }

    return out
  }

  return {
    region,
    background: 0,
    runCue(cue): CueRun {
      const s = new Int8Array(rule.cells.length)

      at.forEach((i, k) => {
        s[i] = cue[k]!
      })

      const start = rule.toTones(s)
      const e0 = rule.energy(s)
      const words = [key(s)]

      for (let t = 1; t <= END; t++) {
        rule.round(s)
        words.push(key(s))
      }

      let support = 0

      for (const t of s) {
        support += t === 0 ? 0 : 1
      }

      stats.maxSupport = Math.max(stats.maxSupport, support)

      if (rule.energy(s) !== e0) {
        stats.energyFailures++
      }

      return { words, final: rule.toTones(s), start }
    },
  }
}

const TONE_CHAR = ['n', 'z', 'p']

export function readKey(region: readonly number[], state: Tones): string {
  let s = ''

  for (const cell of region) {
    s += TONE_CHAR[(state.get(cell) ?? 0) + 1]
  }

  return s
}

export type OpenRunStats = {
  // cues whose run passed the support budget (their words after the stop are unique markers, never a reading)
  stopped: string[]
  // cues whose energy at the last round differs from the start (must be 0)
  energyFailures: number
  // the largest support seen at a round end
  maxSupport: number
}

// The region system of the census (code/compute/lab/association.ts) for the open or walled rule. A cue whose run stops
// on the budget gets per-round unique markers from the stop on: a non-constant late trace held by no other cue, so it
// is never stored, never a completion and never a merge.
export function openBlumeCapelSystem(rule: OpenBlumeCapel, region: readonly number[], stats: OpenRunStats): RegionSystem {
  return {
    region,
    background: 0,
    runCue(cue): CueRun {
      const start: Tones = new Map()

      region.forEach((cell, i) => {
        if (cue[i] !== 0) {
          start.set(cell, cue[i]!)
        }
      })

      const state = new Map(start)
      const words = [readKey(region, state)]
      const r0 = Math.max(rule.radius(start), 0)
      const e0 = rule.energy(start)
      const label = readKey(region, start)

      let stoppedAt = 0

      for (let t = 1; t <= END; t++) {
        if (stoppedAt === 0 && !rule.round(state)) {
          stoppedAt = t
          stats.stopped.push(label)
        }

        if (stoppedAt > 0) {
          words.push(`!${label}@${t}`)
          continue
        }

        rule.coneExcess = Math.max(rule.coneExcess, rule.radius(state) - (r0 + rule.order.length * t))
        stats.maxSupport = Math.max(stats.maxSupport, state.size)
        words.push(readKey(region, state))
      }

      if (stoppedAt === 0 && rule.energy(state) !== e0) {
        stats.energyFailures++
      }

      return { words, final: state, start }
    },
  }
}
