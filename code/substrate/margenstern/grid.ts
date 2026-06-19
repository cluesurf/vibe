// A complete Margenstern-addressed, walkable hyperbolic grid for ANY regular tessellation, the pentagrid {5,4}
// and heptagrid {7,3} in 2D, the dodecagrid {5,3,4} in 3D, the {5,3,3,4} and friends in 4D, and the
// paracompact families beyond. It ties together three things the repo already has,
//   - the cell geometry (buildCellGraph), the true facet adjacency, valid in any rank,
//   - a breadth-first SPLITTING TREE from the central cell, children ordered deterministically (by angle in 2D,
//     so the tree is Margenstern's splitting tree, and lexicographically by cell center in higher dimensions),
//     which records each tile's parent, children, and depth, and
//   - an exact INTEGER coordinate per tile, its breadth-first rank, drift-free, plus the Zeckendorf (Fibonacci)
//     word in 2D where it is the canonical Margenstern coordinate.
//
// The result is a TileSource (so the cellwalker rides on it) whose cells carry an exact address and integer
// coordinate, with address-only routing between any two tiles. We DERIVE the splitting structure from the true
// geometry rather than transcribing Margenstern's per-grid neighbour tables, which both is simpler and is
// verified correct (children counts, growth, and routing all check against the geometry), and it generalizes to
// every dimension for free, the geometry engine does the dimension-specific work. Margenstern proves addresses
// exist up to 4D (the geometric ceiling, there is no regular hyperbolic honeycomb in 5D), with the navigation
// language no longer regular past 2D. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md
// and the splitting-method notes (land/text/papers/maurice-margenstern/notes).

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { toZeckendorf } from '@/code/substrate/margenstern/zeckendorf'
import type { TileSource, FaceStep } from '@/code/substrate/tile-source'

export type TileColor = 'white' | 'black' | 'other'

export interface MargensternGrid extends TileSource {
  // the splitting-tree address, the path of child-ordinals from the root (Margenstern's tree coordinate)
  address(cell: number): number[]
  // the exact integer coordinate, the tile's breadth-first rank (1-based), a drift-free identity
  coordinate(cell: number): number
  // the Zeckendorf (Fibonacci) word of the coordinate. In 2D this is the canonical Margenstern address. In
  // higher dimensions it is still an exact bijective integer code, just not the grid-specific numeration.
  zeckendorf(cell: number): string
  // the tile's color from its child count, white = a 3-node, black = a 2-node (2D), other otherwise
  color(cell: number): TileColor
  // the parent cell in the splitting tree (-1 at the root)
  parent(cell: number): number
  // the children cells in the splitting tree
  children(cell: number): number[]
  // the depth (graph distance) of a cell from the root
  depth(cell: number): number
  // the route between two tiles by address arithmetic alone (up to the common ancestor, then down)
  route(from: number, to: number): number[]
}

export function buildMargensternGrid(input: {
  symbol: number[]
  maxCells?: number
}): MargensternGrid {
  const symbol = input.symbol
  const graph = buildCellGraph({
    symbol,
    maxCells: input.maxCells ?? 4000,
  })

  const count = graph.cellCount
  const ballDim = graph.coords[0]?.length ?? 2
  const twoD = ballDim === 2

  // the central cell (the most connected) is the root, the natural center of the splitting
  let root = 0
  let bestDegree = -1

  for (let i = 0; i < count; i++) {
    const d = graph.neighbors[i]!.length

    if (d > bestDegree) {
      bestDegree = d
      root = i
    }
  }

  // breadth-first splitting tree, parent / depth / children, children ordered deterministically so the tree is
  // reproducible (by angle in 2D = Margenstern's tree, lexicographically by cell center otherwise)
  const parentOf = new Int32Array(count).fill(-1)
  const depthOf = new Int32Array(count).fill(-1)
  const childrenOf: number[][] = Array.from({ length: count }, () => [])
  depthOf[root] = 0
  parentOf[root] = -1

  let frontier = [root]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const v of frontier) {
      const kids: number[] = []

      for (const w of graph.neighbors[v]!) {
        if (depthOf[w] === -1) {
          depthOf[w] = depthOf[v]! + 1
          parentOf[w] = v
          kids.push(w)
          next.push(w)
        }
      }

      kids.sort((a, b) =>
        childOrder(
          graph.coords[v]!,
          graph.coords[a]!,
          graph.coords[b]!,
          twoD,
        ),
      )
      childrenOf[v] = kids
    }

    frontier = next
  }

  // the splitting-tree address (path of child-ordinals), assigned parent-before-child so a parent's address
  // exists when its children are addressed
  const address: number[][] = Array.from({ length: count }, () => [])
  const byDepth = Array.from({ length: count }, (_, i) => i)
    .filter(i => depthOf[i]! >= 0)
    .sort((a, b) => depthOf[a]! - depthOf[b]!)

  for (const cell of byDepth) {
    if (cell === root) {
      continue
    }

    const p = parentOf[cell]!
    address[cell] = [...address[p]!, childrenOf[p]!.indexOf(cell)]
  }

  // the exact integer coordinate, the breadth-first rank (depth, then address order), 1-based
  const rank = new Int32Array(count).fill(0)
  const order = byDepth
    .slice()
    .sort(
      (a, b) =>
        depthOf[a]! - depthOf[b]! ||
        compareAddress(address[a]!, address[b]!),
    )

  order.forEach((cell, index) => (rank[cell] = index + 1))

  // each cell's neighbors in a stable order so the cellwalker has a consistent spin and reciprocal
  const spinNeighbors: number[][] = []

  for (let cell = 0; cell < count; cell++) {
    const ordered = graph.neighbors[cell]!.slice().sort((a, b) =>
      childOrder(
        graph.coords[cell]!,
        graph.coords[a]!,
        graph.coords[b]!,
        twoD,
      ),
    )

    spinNeighbors.push(ordered)
  }

  function step(cell: number, spin: number): FaceStep {
    const here = spinNeighbors[cell]!
    const degree = here.length
    const neighbor = here[((spin % degree) + degree) % degree]!
    const back = spinNeighbors[neighbor]!.indexOf(cell)

    return { cell: neighbor, back, mirror: false }
  }

  function colorOf(cell: number): TileColor {
    const k = childrenOf[cell]!.length

    if (!twoD) {
      return 'other'
    }

    return k >= 3 ? 'white' : 'black'
  }

  // route by address, up to the common ancestor then down the target's address suffix, edges are graph edges
  function route(from: number, to: number): number[] {
    const af = address[from]!
    const at = address[to]!

    let common = 0

    while (
      common < af.length &&
      common < at.length &&
      af[common] === at[common]
    ) {
      common++
    }

    const up: number[] = []

    let cur = from

    while (depthOf[cur]! > common) {
      up.push(cur)
      cur = parentOf[cur]!
    }

    const ancestor = cur
    const down: number[] = []

    let node = ancestor

    for (let i = common; i < at.length; i++) {
      node = childrenOf[node]![at[i]!] ?? node
      down.push(node)
    }

    return [...up, ancestor, ...down]
  }

  return {
    symbol: symbol.slice(),
    origin: root,
    get size(): number {
      return count
    },
    degree: (cell: number): number => spinNeighbors[cell]!.length,
    position: (cell: number): number[] => graph.coords[cell]!,
    step,
    address: (cell: number): number[] => address[cell]!.slice(),
    coordinate: (cell: number): number => rank[cell]!,
    zeckendorf: (cell: number): string => toZeckendorf(rank[cell]!),
    color: colorOf,
    parent: (cell: number): number => parentOf[cell]!,
    children: (cell: number): number[] => childrenOf[cell]!.slice(),
    depth: (cell: number): number => depthOf[cell]!,
    route,
  }
}

// a deterministic order for a cell's neighbors or children, by angle in 2D (the cyclic edge order Margenstern's
// splitting tree uses) and lexicographically by rounded cell center in any higher dimension
function childOrder(
  here: number[],
  a: number[],
  b: number[],
  twoD: boolean,
): number {
  if (twoD) {
    const aa = Math.atan2(
      (a[1] ?? 0) - (here[1] ?? 0),
      (a[0] ?? 0) - (here[0] ?? 0),
    )

    const ab = Math.atan2(
      (b[1] ?? 0) - (here[1] ?? 0),
      (b[0] ?? 0) - (here[0] ?? 0),
    )

    return aa - ab
  }

  for (let i = 0; i < a.length; i++) {
    const da = Math.round((a[i]! - (here[i] ?? 0)) * 1e6)
    const db = Math.round((b[i]! - (here[i] ?? 0)) * 1e6)

    if (da !== db) {
      return da - db
    }
  }

  return 0
}

// compare two child-ordinal addresses lexicographically (shorter first, then by ordinals)
function compareAddress(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)

  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      return a[i]! - b[i]!
    }
  }

  return a.length - b.length
}
