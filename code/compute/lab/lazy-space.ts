// The open window that never ends: a lab geometry as an infinite tiling grown only where a run's excitation is, with a
// partition schedule defined on the infinite tiling itself (the limit of the exact chamber tiling).
//
// SPACES. A `LazySpace` hands out integer cell ids as cells are reached, gives each cell's exact distance from the
// origin (cell 0) and between two cells, a canonical order of cells (ties in the harness never depend on the order
// cells were created), the exact ball sizes of the infinite tiling, and the schedule:
//   - right-angled tile groups ({5,4}, {6,4}, {3,4,3,4}): the tiles are the group's elements (right-angled-tiling.ts)
//     and the generators are a proper edge coloring with p colors: color g pairs w with w s_g, a perfect matching.
//     Orientation: the shorter tile first (word length orients every edge, the two ends differ by one).
//   - flat lattices ({6,3} as A2, {3,4,3,3} as D4, lazy-lattice.ts): color (k, e) pairs x with x + r_k where the
//     parity coordinate of x is e, a perfect matching, so the d steps give 2d colors (6 and 24, the tile degree).
//     Orientation: along +r_k (the lattice form of the line's left to right).
//   - coset tilings ({7,3}, {8,3}, {4,5}, {3,7} and the flat partners {4,4}, {3,6}, coset-tiling.ts): tiles are cosets
//     of the cell subgroup of the (2, p, q) triangle group; the p colors are lifted from a finite quotient; shorter tile
//     first, ties (q odd) by the canonical order.
// A round applies the colors in index order ('forward') or reversed.
//
// RUNS. `LazyRun` holds only the cells off a uniform background the rule fixes (a background pair never moves), and per
// matching updates each such cell with its partner, creating the partner when it does not exist yet. So a run's memory
// is its support plus one partner per support cell per matching: the light cone of the support. It also checks that
// light cone: no partner it reaches lies farther from the origin than r0 + c t (r0 the start's radius, c colors per
// round), a gate on both the tiling and the schedule. A run whose support grows past `supportCap` stops; the rounds it
// completed stay exact, and the stop is recorded as a budget, never as a window.

import { CosetTiling } from '@/code/substrate/coxeter/coset-tiling'
import { liftedColoring, reduceKey } from '@/code/substrate/coxeter/lifted-coloring'
import { CosetGrowth } from '@/code/substrate/coxeter/small-roots'
import {
  LatticeKind,
  LazyLattice,
  latticeBall,
} from '@/code/substrate/coxeter/lazy-lattice'
import {
  RightAngledTiling,
  reducedLength,
  rightAngledGrowth,
} from '@/code/substrate/coxeter/right-angled-tiling'

export type LazySpace = {
  readonly name: string
  readonly degree: number
  readonly colorCount: number
  readonly coloring: string
  readonly orientation: string
  // cells created so far (ids 0..cells - 1, the origin is 0)
  cells(): number
  distance(cell: number): number
  distanceBetween(a: number, b: number): number
  // every facet neighbour of a cell, created on demand
  neighbors(cell: number): number[]
  // the partner of a cell in color `color` (created on demand), and whether the cell is the pair's first
  partner(color: number, cell: number): number
  isFirst(color: number, cell: number): boolean
  compare(a: number, b: number): number
  // cells within r of any cell (the tiling is cell-transitive), as a number
  ballSize(r: number): number
  // a space-independent name for a cell, and the cell a name gives
  address(cell: number): string
  fromAddress(address: string): number
}

// ---- right-angled tile groups ----

export function rightAngledSpace(input: {
  name: string
  coxeter: readonly (readonly number[])[]
}): LazySpace {
  const tiling = new RightAngledTiling(input.coxeter)
  const rank = tiling.rank

  let cumulative: number[] = []

  const ballSize = (r: number): number => {
    if (r >= cumulative.length) {
      const shells = rightAngledGrowth(input.coxeter, Math.max(2 * r + 2, 64))

      let sum = 0n

      cumulative = shells.map(s => {
        sum += s

        return Number(sum)
      })
    }

    return cumulative[r]!
  }

  return {
    name: input.name,
    degree: rank,
    colorCount: rank,
    coloring: `generator coloring of the right-angled tile group (${rank} colors, color g pairs w with w s_g)`,
    orientation: 'shorter tile first (word length)',
    cells: () => tiling.count,
    distance: c => tiling.length(c),
    distanceBetween: (a, b) =>
      reducedLength(tiling.blocker, [
        ...tiling.word(a).reverse(),
        ...tiling.word(b),
      ]),
    neighbors: c => Array.from({ length: rank }, (_, g) => tiling.neighbor(c, g)),
    partner: (g, c) => tiling.neighbor(c, g),
    isFirst: (g, c) => tiling.length(c) < tiling.length(tiling.neighbor(c, g)),
    compare: (a, b) => tiling.compare(a, b),
    ballSize,
    address: c => tiling.word(c).join('.'),
    fromAddress: a =>
      tiling.fromWord(a === '' ? [] : a.split('.').map(Number)),
  }
}

// ---- coset tilings: every {p,q}, q odd included ----
//
// Tiles are cosets of the cell subgroup in the (2, p, q) triangle group, named by the matrix of their minimal
// representative (coset-tiling.ts); distance by the parent chain, ball sizes by the small-root automaton
// (small-roots.ts). The schedule is the coloring lifted from a finite quotient (lifted-coloring.ts): color c pairs a
// tile with its neighbour across the one edge of color c. Two adjacent tiles may lie at the same distance (q odd gives
// odd cycles), so the orientation is the shorter tile first, ties by the canonical order (distance, then the parent
// chain).

// variant: which lifted coloring (lifted-coloring.ts VARIANTS), 0 the first
export function cosetSpace(input: { name: string; p: number; q: number; variant?: number }): LazySpace {
  const tiling = new CosetTiling({ p: input.p, q: input.q })
  const growth = new CosetGrowth({ p: input.p, q: input.q })
  const coloring = liftedColoring(tiling, input.variant ?? 0)
  const { p } = tiling

  let element = new Int32Array(1024).fill(-1)
  let cumulative: number[] = []

  const groupElement = (c: number): number => {
    if (c >= element.length) {
      const out = new Int32Array(Math.max(element.length * 2, c + 1)).fill(-1)

      out.set(element)
      element = out
    }

    let g = element[c]!

    if (g < 0) {
      const found = coloring.elementIndex.get(reduceKey(tiling.matrix(c), coloring.modulus))

      if (found === undefined) {
        throw new Error(`lazy-space: tile ${c} maps outside the quotient group`)
      }

      g = found
      element[c] = g
    }

    return g
  }

  const partner = (color: number, c: number): number =>
    tiling.neighbor(c, coloring.slotOfColor[groupElement(c) * p + color]!)

  const ballSize = (r: number): number => {
    if (r >= cumulative.length) {
      let sum = 0n

      cumulative = Array.from({ length: Math.max(2 * r + 2, 64) }, (_, d) => {
        sum += growth.shell(d)

        return Number(sum)
      })
    }

    return cumulative[r]!
  }

  return {
    name: input.name,
    degree: p,
    colorCount: p,
    coloring: `coloring ${coloring.variant} lifted from a quotient of order ${coloring.groupOrder} (mod ${coloring.modulus}, ${coloring.quotientTiles} tiles), ${p} colors, color c pairs a tile with its neighbour across its edge of color c`,
    orientation: 'shorter tile first, ties by the canonical order (distance, then the parent chain)',
    cells: () => tiling.count,
    distance: c => tiling.distance(c),
    distanceBetween: (a, b) => tiling.distanceBetween(a, b),
    neighbors: c => Array.from({ length: p }, (_, k) => tiling.neighbor(c, k)),
    partner,
    isFirst: (color, c) => {
      const v = partner(color, c)
      const d = tiling.distance(c) - tiling.distance(v)

      return d < 0 || (d === 0 && tiling.compare(c, v) < 0)
    },
    compare: (a, b) => tiling.compare(a, b),
    ballSize,
    address: c => tiling.address(c).join('.'),
    fromAddress: a => tiling.fromAddress(a === '' ? [] : a.split('.').map(Number)),
  }
}

// ---- flat lattices ----

export function latticeSpace(input: {
  name: string
  kind: LatticeKind
}): LazySpace {
  const lattice = new LazyLattice(input.kind)
  const d = lattice.spec.steps.length

  return {
    name: input.name,
    degree: 2 * d,
    colorCount: 2 * d,
    coloring: `step-parity coloring of the ${input.kind.toUpperCase()} lattice (${2 * d} colors, color 2k + e pairs x with x + r_k where x's parity coordinate is e)`,
    orientation: 'along +r_k',
    cells: () => lattice.count,
    distance: c => lattice.distance(c),
    distanceBetween: (a, b) => lattice.distanceBetween(a, b),
    neighbors: c =>
      lattice.spec.steps.flatMap((_, k) => [
        lattice.step(c, k, 1),
        lattice.step(c, k, -1),
      ]),
    partner: (color, c) => {
      const k = color >> 1

      return lattice.parity(c, k) === (color & 1)
        ? lattice.step(c, k, 1)
        : lattice.step(c, k, -1)
    },
    isFirst: (color, c) => lattice.parity(c, color >> 1) === (color & 1),
    compare: (a, b) => lattice.compare(a, b),
    ballSize: r => latticeBall(input.kind, r),
    address: c => lattice.coordinates(c).join(','),
    fromAddress: a => lattice.at(a.split(',').map(Number)),
  }
}

// ---- runs ----

export type RunRule = {
  readonly first: Int8Array
  readonly second: Int8Array
}

export class LazyRun {
  readonly space: LazySpace
  readonly background: number
  readonly colors: readonly number[]
  readonly supportCap: number
  // the non-background cells and their tones, in insertion order
  readonly state = new Map<number, number>()
  rounds = 0
  // set once the support grew past supportCap; rounds stays at the last complete round
  stopped = false
  // light cone: the start's radius, the farthest partner reached beyond r0 + c t (must stay <= 0), partners looked up
  private r0 = -1
  coneExcess = Number.NEGATIVE_INFINITY
  lookups = 0

  constructor(input: {
    space: LazySpace
    background: number
    colors: readonly number[]
    supportCap: number
  }) {
    this.space = input.space
    this.background = input.background
    this.colors = input.colors
    this.supportCap = input.supportCap
  }

  get(cell: number): number {
    return this.state.get(cell) ?? this.background
  }

  set(cell: number, tone: number): void {
    if (tone === this.background) {
      this.state.delete(cell)
    } else {
      this.state.set(cell, tone)
    }

    if (this.rounds === 0) {
      this.r0 = Math.max(this.r0, this.space.distance(cell))
    }
  }

  support(): number[] {
    return [...this.state.keys()]
  }

  // one round; false once the run has stopped on its budget
  round(rule: RunRule): boolean {
    if (this.stopped) {
      return false
    }

    const { space, state, background } = this
    const c = this.colors.length
    const t = this.rounds + 1
    const ceiling = this.r0 + c * t

    for (const color of this.colors) {
      const done = new Set<number>()

      for (const u of [...state.keys()]) {
        if (done.has(u)) {
          continue
        }

        const v = space.partner(color, u)

        this.lookups++
        done.add(u)
        done.add(v)
        this.coneExcess = Math.max(this.coneExcess, space.distance(v) - ceiling)

        const [i, j] = space.isFirst(color, u) ? [u, v] : [v, u]
        const p = (this.get(i) + 1) * 3 + this.get(j) + 1
        const a = rule.first[p]!
        const b = rule.second[p]!

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

    if (state.size > this.supportCap) {
      this.stopped = true

      return false
    }

    this.rounds = t

    return true
  }
}

// A space whose colors are another's renumbered: color k here is color permutation[k] there, so its forward round runs
// the other's colors in permutation order (a schedule variant of the same coloring).
export function permutedSpace(space: LazySpace, permutation: readonly number[], label: string): LazySpace {
  if (
    permutation.length !== space.colorCount ||
    new Set(permutation).size !== permutation.length ||
    permutation.some(k => k < 0 || k >= space.colorCount)
  ) {
    throw new Error(`lazy-space: ${label} is not a permutation of ${space.colorCount} colors`)
  }

  return {
    ...space,
    name: `${space.name}/${label}`,
    coloring: `${space.coloring}; colors run in the order ${permutation.join(' ')} (${label})`,
    partner: (color, c) => space.partner(permutation[color]!, c),
    isFirst: (color, c) => space.isFirst(permutation[color]!, c),
  }
}

// The colors of one round in order.
export function roundColors(space: LazySpace, order: 'forward' | 'reverse'): number[] {
  const colors = Array.from({ length: space.colorCount }, (_, k) => k)

  return order === 'forward' ? colors : colors.reverse()
}

// ---- the materialized ball, for gates and for the dense side of a comparison ----

export type SpaceBall = {
  // ball cell -> space cell, in canonical order (distance, then compare)
  cells: number[]
  index: Map<number, number>
  neighbors: number[][]
  distance: Int32Array
  // per color, the oriented pairs (first, second) with both cells in the ball, as ball indices
  matchings: Int32Array[]
}

export function spaceBall(space: LazySpace, radius: number, maxCells: number): SpaceBall | null {
  const seen = new Set<number>([0])
  const queue = [0]

  // a for-of over an array that grows while it runs visits the pushed cells too, which is the BFS queue
  for (const u of queue) {
    if (space.distance(u) >= radius) {
      continue
    }

    for (const w of space.neighbors(u)) {
      if (!seen.has(w) && space.distance(w) <= radius) {
        seen.add(w)
        queue.push(w)

        if (queue.length > maxCells) {
          return null
        }
      }
    }
  }

  const cells = [...queue].sort((a, b) => space.compare(a, b))
  const index = new Map(cells.map((c, i) => [c, i]))
  const neighbors = cells.map(c =>
    space
      .neighbors(c)
      .filter(w => index.has(w))
      .map(w => index.get(w)!),
  )
  const distance = Int32Array.from(cells, c => space.distance(c))
  const matchings = Array.from({ length: space.colorCount }, (_, color) => {
    const flat: number[] = []

    cells.forEach((c, i) => {
      if (!space.isFirst(color, c)) {
        return
      }

      const j = index.get(space.partner(color, c))

      if (j !== undefined) {
        flat.push(i, j)
      }
    })

    return Int32Array.from(flat)
  })

  return { cells, index, neighbors, distance, matchings }
}
