// The computation lab's geometry adapter: one function from a geometry name to a cell Graph plus the metadata a
// classification row needs (cell degree, curvature sign, boundary kind, the degree-matched control). A lab cell is
// a TILE (a dock, blocks never points): a {p,q} cell has p neighbors, the tiles it shares an edge (a facet) with.
//
// Twelve geometries. The eight the sources name: the line (degree 2), {4,4} (4), {6,3} (6), {3,6} (3), {5,4} (5),
// {7,3} (7), {8,3} (8) and {3,4,3,4} (24). Every hyperbolic one of those has a degree no flat one has, so curvature
// would be confounded with degree. The four controls fix that, one hyperbolic tiling of the SAME degree per flat one:
// {4,4} against {4,5}, {6,3} against {6,4}, {3,6} against {3,7}, and the hyperbolic {3,4,3,4} against the flat D4
// honeycomb {3,4,3,3}.
//
// Sources, never rebuilt here: hyperbolic tilings come from buildCellGraph (exact facet adjacency through the face
// reflections), flat ones from buildEuclideanLattice, the line from torusGrid. tilingPQ is never used (it returns a
// spanning tree with the side edges missing for every symbol but {5,4}). One flat case needs a reading:
// buildEuclideanLattice returns the SAME degree-6 triangular lattice for {3,6} and {6,3}, the vertex reading. Under
// the tile convention that graph is {6,3} (hexagon centers form the triangular lattice), and the {3,6} tiles are its
// triangular faces, two faces adjacent when they share an edge, which is the degree-3 honeycomb graph. The adapter
// reads those faces off the lattice buildEuclideanLattice returns.
//
// Boundary. An open ball is the induced subgraph of every cell within `radius` hops of a fixed origin cell, the
// window on the infinite tiling with vacuum outside. A closed geometry has no boundary (the line as a ring). The
// adapter fails closed: it throws when the source patch does not hold the WHOLE ball with every edge among its cells
// (buildCellGraph is kept under its float precision wall, about 15,500 cells, so a hyperbolic ball is capped).
//
// `exact: true` builds a hyperbolic ball from the exact chamber tiling instead (chamber-tiling.ts: integer chamber
// ids and the Coxeter matrix, no floating point anywhere in the adjacency), grown lazily, so the radius is limited only
// by memory and by `maxCells` (decision 003 of vibe/computation/models). It changes nothing for flat geometries, which
// are integer lattices already. The default stays the float build, so existing experiments read the same balls.

import { exactTileBall } from '@/code/substrate/coxeter/chamber-tiling'
import { buildCellGraph, buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import { torusGrid } from '@/code/substrate/torus-grid'
import { Graph, makeGraph } from '@/code/tool/graph'

export type LabGeometryName =
  | 'line'
  | '{4,4}'
  | '{6,3}'
  | '{3,6}'
  | '{5,4}'
  | '{7,3}'
  | '{8,3}'
  | '{3,4,3,4}'
  | '{4,5}'
  | '{6,4}'
  | '{3,7}'
  | '{3,4,3,3}'

export type LabCurvature = 'flat' | 'hyperbolic'

export type LabBoundary = 'openBall' | 'closed'

export type LabSource =
  | 'torusGrid'
  | 'buildCellGraph'
  | 'buildEuclideanLattice'
  | 'buildEuclideanLatticeFaces'

export type LabGeometrySpec = {
  readonly name: LabGeometryName
  // the Schlafli symbol, empty for the line
  readonly symbol: readonly number[]
  // facets per tile, the degree of every cell away from a boundary
  readonly degree: number
  readonly dimension: number
  readonly curvature: LabCurvature
  // the geometry of the same degree and the other curvature, null when none is in the set
  readonly matchedControl: LabGeometryName | null
  // whether this one was added to the source eight as a degree-matched control
  readonly addedControl: boolean
  readonly source: LabSource
}

export const LAB_GEOMETRIES: readonly LabGeometrySpec[] = [
  {
    name: 'line',
    symbol: [],
    degree: 2,
    dimension: 1,
    curvature: 'flat',
    matchedControl: null,
    addedControl: false,
    source: 'torusGrid',
  },
  {
    name: '{4,4}',
    symbol: [4, 4],
    degree: 4,
    dimension: 2,
    curvature: 'flat',
    matchedControl: '{4,5}',
    addedControl: false,
    source: 'buildEuclideanLattice',
  },
  {
    name: '{6,3}',
    symbol: [6, 3],
    degree: 6,
    dimension: 2,
    curvature: 'flat',
    matchedControl: '{6,4}',
    addedControl: false,
    source: 'buildEuclideanLattice',
  },
  {
    name: '{3,6}',
    symbol: [3, 6],
    degree: 3,
    dimension: 2,
    curvature: 'flat',
    matchedControl: '{3,7}',
    addedControl: false,
    source: 'buildEuclideanLatticeFaces',
  },
  {
    name: '{5,4}',
    symbol: [5, 4],
    degree: 5,
    dimension: 2,
    curvature: 'hyperbolic',
    matchedControl: null,
    addedControl: false,
    source: 'buildCellGraph',
  },
  {
    name: '{7,3}',
    symbol: [7, 3],
    degree: 7,
    dimension: 2,
    curvature: 'hyperbolic',
    matchedControl: null,
    addedControl: false,
    source: 'buildCellGraph',
  },
  {
    name: '{8,3}',
    symbol: [8, 3],
    degree: 8,
    dimension: 2,
    curvature: 'hyperbolic',
    matchedControl: null,
    addedControl: false,
    source: 'buildCellGraph',
  },
  {
    name: '{3,4,3,4}',
    symbol: [3, 4, 3, 4],
    degree: 24,
    dimension: 4,
    curvature: 'hyperbolic',
    matchedControl: '{3,4,3,3}',
    addedControl: false,
    source: 'buildCellGraph',
  },
  {
    name: '{4,5}',
    symbol: [4, 5],
    degree: 4,
    dimension: 2,
    curvature: 'hyperbolic',
    matchedControl: '{4,4}',
    addedControl: true,
    source: 'buildCellGraph',
  },
  {
    name: '{6,4}',
    symbol: [6, 4],
    degree: 6,
    dimension: 2,
    curvature: 'hyperbolic',
    matchedControl: '{6,3}',
    addedControl: true,
    source: 'buildCellGraph',
  },
  {
    name: '{3,7}',
    symbol: [3, 7],
    degree: 3,
    dimension: 2,
    curvature: 'hyperbolic',
    matchedControl: '{3,6}',
    addedControl: true,
    source: 'buildCellGraph',
  },
  {
    name: '{3,4,3,3}',
    symbol: [3, 4, 3, 3],
    degree: 24,
    dimension: 4,
    curvature: 'flat',
    matchedControl: '{3,4,3,4}',
    addedControl: true,
    source: 'buildEuclideanLattice',
  },
]

export type LabGeometry = {
  readonly spec: LabGeometrySpec
  readonly boundary: LabBoundary
  // open ball: the hop radius. closed: -1
  readonly radius: number
  // the cell graph, cells numbered in BFS order from the origin (cell 0)
  readonly graph: Graph
  // hop distance of each cell from the origin, in the graph itself
  readonly distance: Int32Array
  // shellSizes[r] = cells at hop distance r from the origin
  readonly shellSizes: number[]
  // cells of the source patch before the ball was cut (the build size)
  readonly patchCells: number
}

// The float precision wall of buildCellGraph is near 15,500 cells (traps.md), so a hyperbolic patch stays below it.
export const HYPERBOLIC_PATCH_CAP = 15000

export function labGeometrySpec(name: LabGeometryName): LabGeometrySpec {
  const spec = LAB_GEOMETRIES.find(g => g.name === name)

  if (!spec) {
    throw new Error(`lab-geometry: unknown geometry ${name}`)
  }

  return spec
}

// Build a lab geometry. An open ball (the default for every tiling) is the induced subgraph within `radius` hops of
// the origin tile. The line is a closed ring of `size` cells by default, or an open ball (a path of 2 * radius + 1
// cells) when `boundary` is 'openBall'.
export function labGeometry(input: {
  name: LabGeometryName
  boundary?: LabBoundary
  radius?: number
  size?: number
  // hyperbolic open balls from the exact chamber tiling; maxCells caps its ball (it throws past the cap)
  exact?: boolean
  maxCells?: number
}): LabGeometry {
  const spec = labGeometrySpec(input.name)
  const boundary: LabBoundary =
    input.boundary ?? (spec.name === 'line' ? 'closed' : 'openBall')

  if (boundary === 'closed') {
    if (spec.name !== 'line') {
      throw new Error(
        `lab-geometry: ${spec.name} has no closed form here, closed hyperbolic quotients live in tiling-quotient`,
      )
    }

    const size = input.size ?? 0

    if (!Number.isInteger(size) || size < 3) {
      throw new Error('lab-geometry: a closed line needs size >= 3')
    }

    const ring = torusGrid(1, size).map(row => Array.from(row))

    return cutBall({ spec, boundary, neighbors: ring, radius: size })
  }

  const radius = input.radius ?? 0

  if (!Number.isInteger(radius) || radius < 1) {
    throw new Error('lab-geometry: an open ball needs an integer radius >= 1')
  }

  if (input.exact === true && spec.curvature === 'hyperbolic') {
    // the exact ball holds every edge among its cells, the outermost included, so every cell counts as complete
    const ball = exactTileBall({
      symbol: spec.symbol,
      radius,
      ...(input.maxCells === undefined ? {} : { maxCells: input.maxCells }),
    })

    return cutBall({
      spec,
      boundary,
      neighbors: ball.neighbors,
      radius,
      complete: new Uint8Array(ball.neighbors.length).fill(1),
    })
  }

  const patch = sourcePatch(spec, radius)

  return cutBall({
    spec,
    boundary,
    neighbors: patch.neighbors,
    radius,
    complete: patch.complete,
  })
}

// Shell sizes |S(r)| for r = 0..radius on the infinite tiling, without cutting a ball. Exact when every cell closer
// than `radius` is complete in the source patch, which is a weaker need than a whole ball (the edges among the
// outermost cells do not matter for counting them), so it reaches one shell further: {3,4,3,4} to radius 3
// (1, 24, 456, 8376) under the precision cap, where its full ball stops at radius 2. Throws when not exact.
export function labShellSizes(input: {
  name: LabGeometryName
  radius: number
  // hyperbolic shells from the exact chamber tiling, to any radius memory allows
  exact?: boolean
}): number[] {
  const spec = labGeometrySpec(input.name)
  const radius = input.radius

  if (!Number.isInteger(radius) || radius < 1) {
    throw new Error('lab-geometry: shell sizes need an integer radius >= 1')
  }

  if (input.exact === true && spec.curvature === 'hyperbolic') {
    return exactTileBall({ symbol: spec.symbol, radius }).shellSizes
  }

  const patch = sourcePatch(spec, radius)
  const distance = new Int32Array(patch.neighbors.length).fill(-1)
  const order: number[] = [0]
  const shells: number[] = [1]

  distance[0] = 0

  // a for-of over an array that grows while it runs visits the pushed cells too, which is the BFS queue
  for (const u of order) {
    if (distance[u]! >= radius) {
      continue
    }

    if (!patch.complete[u]) {
      throw new Error(
        `lab-geometry: ${spec.name} shells to ${radius} do not fit the source patch (cell at distance ${distance[u]} incomplete)`,
      )
    }

    for (const w of patch.neighbors[u] ?? []) {
      if (distance[w] === -1) {
        distance[w] = distance[u]! + 1
        shells[distance[w]] = (shells[distance[w]] ?? 0) + 1
        order.push(w)
      }
    }
  }

  return shells
}

type SourcePatch = {
  neighbors: number[][]
  // complete[c] = 1 when every facet neighbor of patch cell c is in the patch and joined to it
  complete: Uint8Array
}

function sourcePatch(spec: LabGeometrySpec, radius: number): SourcePatch {
  if (spec.source === 'torusGrid') {
    // a ring two cells longer than the ball's diameter: the ball misses only the antipode, so it is a path
    const ring = torusGrid(1, 2 * radius + 2).map(row => Array.from(row))

    return { neighbors: ring, complete: new Uint8Array(ring.length).fill(1) }
  }

  if (spec.source === 'buildCellGraph') {
    const graph = buildCellGraph({
      symbol: [...spec.symbol],
      maxCells: HYPERBOLIC_PATCH_CAP,
    })

    const faces = graph.faceNeighbor ?? []
    const complete = new Uint8Array(graph.cellCount)

    // a cell is complete once its BFS step ran over every face; a cell the build never expanded has -1 faces
    for (let c = 0; c < graph.cellCount; c++) {
      const row = faces[c] ?? []

      complete[c] =
        row.length > 0 &&
        row.every(f => f >= 0) &&
        (graph.neighbors[c]?.length ?? 0) === spec.degree
          ? 1
          : 0
    }

    return { neighbors: graph.neighbors, complete }
  }

  // flat lattices: a box that holds the ball of radius + 1 (cells at graph distance r have sup-norm <= r on every
  // lattice used here), sized generously so the BFS prefix covers the ball
  const side = 2 * (radius + 2) + 1
  const dimension = spec.name === '{3,4,3,3}' ? 4 : 2
  const maxCells = Math.pow(side, dimension)

  if (spec.source === 'buildEuclideanLattice') {
    const graph = buildEuclideanLattice({
      symbol: [...spec.symbol],
      maxCells,
    })

    return {
      neighbors: graph.neighbors,
      complete: completeByDegree(graph.neighbors, spec.degree),
    }
  }

  // {3,6}: the triangular faces of the degree-6 lattice buildEuclideanLattice returns
  const lattice = buildEuclideanLattice({ symbol: [6, 3], maxCells })
  const faces = latticeTriangles(lattice.coords, lattice.neighbors)

  return {
    neighbors: faces,
    complete: completeByDegree(faces, spec.degree),
  }
}

function completeByDegree(
  neighbors: readonly (readonly number[])[],
  degree: number,
): Uint8Array {
  const complete = new Uint8Array(neighbors.length)

  for (let c = 0; c < neighbors.length; c++) {
    complete[c] = (neighbors[c]?.length ?? 0) === degree ? 1 : 0
  }

  return complete
}

// The faces of the triangular lattice, read off the lattice's own adjacency: every triple of mutually adjacent
// points is a face, and two faces are adjacent when they share two points (an edge). Face 0 contains lattice point 0
// (the origin), so the ball is centered on a tile touching the lattice origin.
export function latticeTriangles(
  coords: readonly (readonly number[])[],
  neighbors: readonly (readonly number[])[],
): number[][] {
  const adjacent = neighbors.map(row => new Set(row))
  const triangles: [number, number, number][] = []

  for (let a = 0; a < neighbors.length; a++) {
    for (const b of neighbors[a] ?? []) {
      if (b <= a) {
        continue
      }

      for (const c of neighbors[b] ?? []) {
        if (c <= b || !adjacent[a]!.has(c)) {
          continue
        }

        triangles.push([a, b, c])
      }
    }
  }

  // put a face holding the origin first, in a fixed order (lowest lattice ids)
  triangles.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2])

  if (coords.length === 0 || triangles.length === 0 || triangles[0]![0] !== 0) {
    throw new Error('lab-geometry: the lattice origin touches no face')
  }

  const byEdge = new Map<string, number[]>()

  for (let t = 0; t < triangles.length; t++) {
    const [a, b, c] = triangles[t]!

    for (const [u, v] of [
      [a, b],
      [a, c],
      [b, c],
    ] as const) {
      const key = `${u},${v}`
      const list = byEdge.get(key)

      if (list) {
        list.push(t)
      } else {
        byEdge.set(key, [t])
      }
    }
  }

  const faceNeighbors: number[][] = triangles.map(() => [])

  for (const list of byEdge.values()) {
    if (list.length > 2) {
      throw new Error('lab-geometry: a lattice edge bounds more than two faces')
    }

    if (list.length === 2) {
      faceNeighbors[list[0]!]!.push(list[1]!)
      faceNeighbors[list[1]!]!.push(list[0]!)
    }
  }

  return faceNeighbors
}

// Cut the ball of `radius` hops around cell 0 out of a source patch, renumber its cells in BFS order and check that
// the patch held all of it: every cell closer than `radius` must be complete (all its facet neighbors present), and
// every cell AT `radius` must be complete too, so that the edges among the outermost cells are not missing.
function cutBall(input: {
  spec: LabGeometrySpec
  boundary: LabBoundary
  neighbors: readonly (readonly number[])[]
  radius: number
  complete?: Uint8Array
}): LabGeometry {
  const { spec, boundary, neighbors, radius } = input
  const n = neighbors.length
  const sourceDistance = new Int32Array(n).fill(-1)
  const order: number[] = [0]

  sourceDistance[0] = 0

  for (const u of order) {
    if (sourceDistance[u]! >= radius) {
      continue
    }

    for (const w of neighbors[u] ?? []) {
      if (sourceDistance[w] === -1) {
        sourceDistance[w] = sourceDistance[u]! + 1
        order.push(w)
      }
    }
  }

  if (input.complete) {
    for (const u of order) {
      if (!input.complete[u]) {
        throw new Error(
          `lab-geometry: ${spec.name} radius ${radius} does not fit the source patch (cell at distance ${sourceDistance[u]} incomplete)`,
        )
      }
    }
  }

  const index = new Int32Array(n).fill(-1)

  order.forEach((u, i) => {
    index[u] = i
  })

  const ballNeighbors = order.map(u =>
    (neighbors[u] ?? []).filter(w => index[w]! >= 0).map(w => index[w]!),
  )

  const graph = makeGraph({
    size: order.length,
    directed: false,
    neighbors: ballNeighbors,
  })

  const distance = Int32Array.from(order.map(u => sourceDistance[u]!))
  const shellSizes: number[] = []

  for (const d of distance) {
    shellSizes[d] = (shellSizes[d] ?? 0) + 1
  }

  return {
    spec,
    boundary,
    radius: boundary === 'closed' ? -1 : radius,
    graph,
    distance,
    shellSizes,
    patchCells: n,
  }
}
