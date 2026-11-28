// A proper vertex coloring of an INFINITE tile graph, defined on the tiling itself.
//
// WHY. The reversible Blume-Capel rule (M2-B, code/rule/spin-one-q2r.ts) updates the cells of one independent set at a
// time, so it needs a proper vertex coloring. On a closed quotient the schedule is a greedy pass in breadth-first order
// from cell 0 ('greedy-bfs'). The lazy spaces (code/compute/lab/lazy-space.ts) carry edge colorings (matchings) only.
// This module gives them the same family: the greedy coloring in the space's CANONICAL order, which is a breadth-first
// order of the infinite tiling (distance from the origin first, then a canonical tie-break that never depends on the
// order cells were created).
//
// THE RULE. A cell takes the first color, in its candidate order, that none of its EARLIER neighbours (canonical order)
// holds. The candidate order is 0, 1, ..., K - 1 ('greedy'), or the same rotated to start at distance mod K
// ('greedy-shifted', a second coloring of the same family, so that a reading can be checked under two colorings, as
// a declared schedule needs). K = degree + 1: an earlier-neighbour set has at most `degree` members, so a free color exists.
//
// PROPER ON EVERY BALL (proof). For an edge {u, w}, one end is earlier, say w < u; u avoids the colors of all its
// earlier neighbours, w among them, so color(u) != color(w). This holds for every edge of the infinite tiling, hence on
// every ball. WELL DEFINED: the color of u depends only on the colors of cells earlier than u; the canonical order sorts
// by distance first, so each cell has finitely many predecessors and the recursion ends. INDEPENDENT OF CREATION ORDER:
// the color is a function of the canonical order and the adjacency alone, both properties of the tiling. Both are also
// checked by gates (`checkProper`, and an experiment that builds the same cells in another order).
//
// LOCALITY. The color of a cell at distance d may depend on cells along a chain of earlier neighbours back to the
// origin; it is a deterministic function of the tiling, computed on demand, never a lookup table of a finite patch.

export type CanonicalGraph = {
  readonly degree: number
  neighbors(cell: number): readonly number[]
  distance(cell: number): number
  compare(a: number, b: number): number
}

export type CanonicalColoringKind = 'greedy' | 'greedy-shifted'

export class CanonicalVertexColoring {
  readonly kind: CanonicalColoringKind
  readonly colors: number
  private readonly graph: CanonicalGraph
  private readonly color = new Map<number, number>()
  private readonly neighborCache = new Map<number, readonly number[]>()

  constructor(input: { graph: CanonicalGraph; kind: CanonicalColoringKind }) {
    this.graph = input.graph
    this.kind = input.kind
    this.colors = input.graph.degree + 1
  }

  neighbors(cell: number): readonly number[] {
    let row = this.neighborCache.get(cell)

    if (row === undefined) {
      row = this.graph.neighbors(cell)
      this.neighborCache.set(cell, row)
    }

    return row
  }

  private earlier(cell: number): number[] {
    return this.neighbors(cell).filter(w => this.graph.compare(w, cell) < 0)
  }

  colorOf(cell: number): number {
    const known = this.color.get(cell)

    if (known !== undefined) {
      return known
    }

    // explicit stack: a cell is colored once every earlier neighbour is
    const stack = [cell]

    while (stack.length > 0) {
      const u = stack[stack.length - 1]!

      if (this.color.has(u)) {
        stack.pop()
        continue
      }

      const before = this.earlier(u)
      const missing = before.filter(w => !this.color.has(w))

      if (missing.length > 0) {
        stack.push(...missing)
        continue
      }

      const used = new Set(before.map(w => this.color.get(w)!))
      const start = this.kind === 'greedy' ? 0 : this.graph.distance(u) % this.colors

      let pick = -1

      for (let k = 0; k < this.colors; k++) {
        const c = (start + k) % this.colors

        if (!used.has(c)) {
          pick = c
          break
        }
      }

      if (pick < 0) {
        throw new Error(`canonical-vertex-coloring: cell ${u} has no free color among ${this.colors}`)
      }

      this.color.set(u, pick)
      stack.pop()
    }

    return this.color.get(cell)!
  }
}

export type ColoringCheck = {
  cells: number
  edges: number
  // edges whose two ends share a color (must be 0)
  conflicts: number
  // colors seen on the ball
  used: number
}

// Every cell within `radius` of the origin (cell 0) and every edge at such a cell: no edge joins two cells of one color.
export function checkProper(coloring: CanonicalVertexColoring, graph: CanonicalGraph, radius: number): ColoringCheck {
  const seen = new Set<number>([0])
  const queue = [0]

  let edges = 0
  let conflicts = 0

  const used = new Set<number>()

  for (const u of queue) {
    const cu = coloring.colorOf(u)

    used.add(cu)

    for (const w of coloring.neighbors(u)) {
      edges++

      if (coloring.colorOf(w) === cu) {
        conflicts++
      }

      if (!seen.has(w) && graph.distance(w) <= radius) {
        seen.add(w)
        queue.push(w)
      }
    }
  }

  return { cells: queue.length, edges, conflicts, used: used.size }
}
