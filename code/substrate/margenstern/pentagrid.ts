// The pentagrid {5,4} navigated by PURE ADDRESS ARITHMETIC, Margenstern's Theorem 5 (Vol I, Ch 3.2.4), with
// NO geometry and NO floating point. The plane is four quarters (I..IV), each a standard Fibonacci tree
// (fibonacci-tree.ts), and a tile is a coordinate (quarter, node). The five neighbours of a tile are computed
// from its node number by short integer arithmetic, the father, the continuator, and same-level laterals, with
// the leftmost / rightmost branch tiles crossing into the adjacent quarter and the four roots forming the
// central ring. This is exactly the pentagrid, verified, the pure-arithmetic graph is 5-regular, symmetric, and
// has the same ball growth (1, 5, 15, 40, 105, 275, 720) as the geometry. See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md and the splitting-method notes.

import {
  father,
  continuator,
  nodeType,
  sons,
} from '@/code/substrate/margenstern/fibonacci-tree'

// a pentagrid tile, a quarter q in 0..3 and a node number n >= 1 in that quarter's Fibonacci tree
export interface PentaTile {
  readonly q: number
  readonly n: number
}

// the leftmost and rightmost spines of a quarter (the branches that touch the neighbouring quarters), computed
// to ample depth once. A tile on the left spine sends its left lateral into quarter q+1, one on the right spine
// sends its right lateral into quarter q-1.
const LEFT_SPINE = new Set<number>()
const RIGHT_SPINE = new Set<number>()
{
  let n = 1
  for (let i = 0; i < 90; i++) {
    LEFT_SPINE.add(n)
    n = sons(n)[0]!
  }
  n = 1
  for (let i = 0; i < 90; i++) {
    RIGHT_SPINE.add(n)
    const s = sons(n)
    n = s[s.length - 1]!
  }
}

// the five neighbours of a tile, counterclockwise starting from the father (Theorem 5), pure integer arithmetic
export function pentagridNeighbors(tile: PentaTile): PentaTile[] {
  const { q, n } = tile
  const qp = (q + 1) & 3
  const qm = (q + 3) & 3
  if (n === 1) {
    // the root, its three sons plus the two adjacent quarter roots (the central ring around the vertex)
    return [
      { q: qp, n: 1 },
      { q, n: 2 },
      { q, n: 3 },
      { q, n: 4 },
      { q: qm, n: 1 },
    ]
  }
  const f = father(n)
  const c = continuator(n)
  const t = nodeType(n)
  if (LEFT_SPINE.has(n)) {
    // the left lateral crosses into quarter q+1
    return [
      { q, n: f },
      { q: qp, n: c - 1 },
      { q, n: c },
      { q, n: c + 1 },
      { q, n: c + 2 },
    ]
  }
  if (RIGHT_SPINE.has(n)) {
    // the right lateral crosses into quarter q-1
    return [
      { q, n: f },
      { q, n: c - 1 },
      { q, n: c },
      { q, n: c + 1 },
      { q: qm, n: f + 1 },
    ]
  }
  // an interior tile, all five neighbours in quarter q (the left lateral is f-1 for a 2-node, c-1 for a 3-node)
  return [
    { q, n: f },
    { q, n: t === 2 ? f - 1 : c - 1 },
    { q, n: c },
    { q, n: c + 1 },
    { q, n: c + 2 },
  ]
}

// the four quarter roots, the seeds of the whole pentagrid
export function pentagridRoots(): PentaTile[] {
  return [
    { q: 0, n: 1 },
    { q: 1, n: 1 },
    { q: 2, n: 1 },
    { q: 3, n: 1 },
  ]
}

// build the pentagrid cell graph purely from the address arithmetic, breadth-first to maxCells. Geometry-free,
// symmetric by construction. Cells are integer ids; returns adjacency and the tile coordinate of each id.
export function buildPentagridPure(input: { maxCells: number }): {
  cellCount: number
  neighbors: number[][]
  tiles: PentaTile[]
  facetCount: number
} {
  const key = (t: PentaTile): string => `${t.q}.${t.n}`
  const tiles: PentaTile[] = pentagridRoots()
  const idOf = new Map<string, number>(tiles.map((t, i) => [key(t), i]))
  const neighbors: number[][] = tiles.map(() => [])
  let hit = false
  for (let head = 0; head < tiles.length; head++) {
    for (const nb of pentagridNeighbors(tiles[head]!)) {
      if (nb.n < 1) {
        continue
      }
      const k = key(nb)
      let id = idOf.get(k)
      if (id === undefined) {
        if (tiles.length >= input.maxCells) {
          hit = true
          continue
        }
        id = tiles.length
        idOf.set(k, id)
        tiles.push(nb)
        neighbors.push([])
      }
      if (id !== head && !neighbors[head]!.includes(id)) {
        neighbors[head]!.push(id)
        neighbors[id]!.push(head)
      }
    }
    if (hit) {
      break
    }
  }
  let facetCount = 0
  for (const row of neighbors) {
    facetCount = Math.max(facetCount, row.length)
  }
  return { cellCount: tiles.length, neighbors, tiles, facetCount }
}
