// Intelligence level 6, slice 2: a sparse run of a pair rule on any graph
// whose schedule is a sequence of perfect matchings (the coset tilings of lazy-space.ts, handed in as callbacks).
// Import-free (a candidate folder): the caller hands in the partner function, the orientation and the rule tables.
// It caches every partner lookup in typed arrays, holds only the support, and returns one sparse frame per round end.
// Written apart from counter.ts stepRun and lazy-space.ts LazyRun, which the experiment compares it against.

import type { RunFrames } from '@/code/intelligence/improve/mesh/multi-score'
import type { PairMap } from '@/code/intelligence/improve/mesh/selection'

export interface MatchedGraph {
  /** the partner of a cell in one color (a perfect matching per color) */
  partner(color: number, cell: number): number
  /** whether the cell is the first of its pair in that color */
  isFirst(color: number, cell: number): boolean
  /** the cells next to a cell (facet neighbours) */
  neighbors(cell: number): readonly number[]
}

/** partner and orientation cached per color, grown on demand */
export class CachedGraph {
  readonly graph: MatchedGraph
  readonly colors: number
  private partners: Int32Array[]
  private firsts: Int8Array[]

  constructor(graph: MatchedGraph, colors: number) {
    this.graph = graph
    this.colors = colors
    this.partners = Array.from({ length: colors }, () => new Int32Array(64).fill(-1))
    this.firsts = Array.from({ length: colors }, () => new Int8Array(64).fill(-1))
  }

  private grow(color: number, cell: number): void {
    const p = this.partners[color]!

    if (cell < p.length) {
      return
    }

    const size = Math.max(p.length * 2, cell + 1)
    const np = new Int32Array(size).fill(-1)
    const nf = new Int8Array(size).fill(-1)

    np.set(p)
    nf.set(this.firsts[color]!)
    this.partners[color] = np
    this.firsts[color] = nf
  }

  partner(color: number, cell: number): number {
    this.grow(color, cell)

    let v = this.partners[color]![cell]!

    if (v < 0) {
      v = this.graph.partner(color, cell)
      this.partners[color]![cell] = v
    }

    return v
  }

  isFirst(color: number, cell: number): boolean {
    this.grow(color, cell)

    let f = this.firsts[color]![cell]!

    if (f < 0) {
      f = this.graph.isFirst(color, cell) ? 1 : 0
      this.firsts[color]![cell] = f
    }

    return f === 1
  }
}

/** one sparse frame: the cells off the background and their tones, in a fixed order */
export interface SparseFrame {
  readonly cells: Int32Array
  readonly tones: Int8Array
}

/** a sparse run: frame 0 the start, then one frame per round (every color of `order` once) */
export function runSpace(input: {
  graph: CachedGraph
  order: readonly number[]
  rule: PairMap
  background: number
  start: readonly (readonly [number, number])[]
  rounds: number
}): SparseFrame[] {
  const { graph, order, rule, background, start, rounds } = input
  // the support as parallel lists; a pair is looked up once per color (a perfect matching)
  let cells: number[] = []
  let tones: number[] = []

  for (const [c, t] of start) {
    if (t !== background) {
      cells.push(c)
      tones.push(t)
    }
  }

  const snapshot = (): SparseFrame => {
    const index = cells.map((_, i) => i).sort((x, y) => cells[x]! - cells[y]!)

    return { cells: Int32Array.from(index, i => cells[i]!), tones: Int8Array.from(index, i => tones[i]!) }
  }

  const frames = [snapshot()]

  for (let t = 0; t < rounds; t++) {
    for (const color of order) {
      // supports stay small (a handful of cells), so a linear lookup beats a hash
      const nextCells: number[] = []
      const nextTones: number[] = []
      const done = new Uint8Array(cells.length)

      for (let k = 0; k < cells.length; k++) {
        if (done[k] === 1) {
          continue
        }

        const u = cells[k]!
        const v = graph.partner(color, u)
        const kv = cells.indexOf(v)

        done[k] = 1

        if (kv >= 0) {
          done[kv] = 1
        }

        const tu = tones[k]!
        const tv = kv >= 0 ? tones[kv]! : background
        const [i, j, ti, tj] = graph.isFirst(color, u) ? [u, v, tu, tv] : [v, u, tv, tu]
        const p = (ti + 1) * 3 + tj + 1
        const a = rule.first[p]!
        const b = rule.second[p]!

        if (a !== background) {
          nextCells.push(i)
          nextTones.push(a)
        }

        if (b !== background) {
          nextCells.push(j)
          nextTones.push(b)
        }
      }

      cells = nextCells
      tones = nextTones
    }

    frames.push(snapshot())
  }

  return frames
}

/** sparse frames as RunFrames */
export function spaceFrames(frames: readonly SparseFrame[], background: number): RunFrames {
  return {
    value: (round, cell) => {
      const f = frames[round]!
      let lo = 0
      let hi = f.cells.length - 1

      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const c = f.cells[mid]!

        if (c === cell) {
          return f.tones[mid]!
        }

        if (c < cell) {
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }

      return background
    },
    occupied: round => Array.from(frames[round]!.cells),
  }
}

/** the radius-1 ball: the origin and its neighbours, in the graph's neighbour order */
export function unitBall(graph: MatchedGraph, origin: number): number[] {
  return [origin, ...graph.neighbors(origin).filter(c => c !== origin)]
}
