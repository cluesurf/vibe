// The uniform mesh interface. Every substrate, the square toy, the cubic cusp,
// the {3,4,3,4} honeycomb, exposes the same shape: a fixed number of cells, a
// fixed coin of directions per cell, the neighbour reached along each direction,
// and the opposite direction, which is what makes streaming well defined. A
// consumer of a Mesh never knows or cares which substrate it was handed.

import { modulo } from '@/code/tool/integer'
import { rootsD4, rootsB4 } from '@/code/algebra/group/root-system'

export type Mesh = {
  readonly id: string
  readonly degree: number // directions per cell, the coin size
  readonly cellCount: number
  // the cell reached by leaving `cell` through `direction`.
  neighbour(cell: number, direction: number): number
  // the reverse of a direction, so a streamed charge keeps its line of travel.
  opposite(direction: number): number
}

// The graph distance from `source` to every cell, by breadth-first search over the
// coin. Distance is the number of single-direction hops, so it is the natural radius
// for a light cone (one cell per beat) and for any shell measure on a mesh.
// Unreachable cells stay -1 (none, on a connected periodic mesh).
export function shellDistances(mesh: Mesh, source: number): Int32Array {
  const distance = new Int32Array(mesh.cellCount).fill(-1)

  distance[source] = 0

  let frontier = [source]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const cell of frontier) {
      const here = distance[cell]!

      for (let direction = 0; direction < mesh.degree; direction++) {
        const neighbour = mesh.neighbour(cell, direction)

        if (distance[neighbour] === -1) {
          distance[neighbour] = here + 1
          next.push(neighbour)
        }
      }
    }

    frontier = next
  }

  return distance
}

// The opposite-direction table of a mesh as a plain array, opposite[direction] is the
// reverse slot. The collisions and line pairings all key off this array, so building it
// once here keeps every consumer identical.
export function meshOpposites(mesh: Mesh): number[] {
  const opposite: number[] = []

  for (let direction = 0; direction < mesh.degree; direction++)
    opposite.push(mesh.opposite(direction))

  return opposite
}

// The plain adjacency list of a mesh: for each cell, the distinct neighbour cells
// reached along its coin, with self-loops (a direction that returns the cell, like
// a rest slot or a tree leaf's missing child) dropped. The neighbours-native graph
// measures want this form, and a CoxeterMesh already exposes it, so this gives the
// flat Mesh builders the same shape.
export function meshNeighbors(mesh: Mesh): number[][] {
  const out: number[][] = []

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const row = new Set<number>()

    for (let direction = 0; direction < mesh.degree; direction++) {
      const neighbour = mesh.neighbour(cell, direction)

      if (neighbour !== cell) row.add(neighbour)
    }

    out.push([...row])
  }

  return out
}

// A mesh as a CSR adjacency graph (cellCount, offsets, adj), the compact form the edge-sweep and the
// cluster/cone measures consume, built from the mesh's own neighbour relation. Deduplicates the
// neighbour set per cell (a mesh direction can fold back to the same cell).
export function meshCsr(mesh: Mesh): {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
} {
  const neighbors = meshNeighbors(mesh)
  const cellCount = mesh.cellCount
  const offsets = new Int32Array(cellCount + 1)

  for (let i = 0; i < cellCount; i++)
    offsets[i + 1] = offsets[i]! + neighbors[i]!.length

  const adj = new Int32Array(offsets[cellCount]!)

  let p = 0

  for (let i = 0; i < cellCount; i++) {
    for (const w of neighbors[i]!) adj[p++] = w
  }

  return { cellCount, offsets, adj }
}

// A periodic square lattice in two dimensions, four directions (E, W, N, S). The
// minimal directional mesh, used to pin the rule against the known 2D result.
// Direction order: 0 is +x (E), 1 is -x (W), 2 is +y (N), 3 is -y (S).
export function squareMesh(input: { side: number }): Mesh {
  const side = input.side
  const wrap = (value: number): number => modulo(value, side)
  const at = (x: number, y: number): number => wrap(y) * side + wrap(x)
  const opposites = [1, 0, 3, 2]

  return {
    id: `square-${side}`,
    degree: 4,
    cellCount: side * side,
    neighbour(cell, direction) {
      const x = cell % side
      const y = (cell - x) / side

      switch (direction) {
        case 0:
          return at(x + 1, y)
        case 1:
          return at(x - 1, y)
        case 2:
          return at(x, y + 1)
        default:
          return at(x, y - 1)
      }
    },
    opposite(direction) {
      return opposites[direction] ?? direction
    },
  }
}

// The 24 D4 root directions of the {3,4,3,4} cell, computed once, with the
// opposite (the negated root) index for each, so streaming on the coin is well
// defined.
const D4_ROOTS = rootsD4()
const D4_OPPOSITE = D4_ROOTS.map(root =>
  D4_ROOTS.findIndex(other =>
    other.every((value, axis) => value === -(root[axis] ?? 0)),
  ),
)

// A periodic four-dimensional lattice on the 24 D4 root directions, the flat
// lattice model of the {3,4,3,4} cusp. Each cell has 24 neighbours at the roots
// (+-1, +-1, 0, 0), the D4 coin that can carry genuine spinors (8v + 8s + 8c).
// This is the substrate the directional lattice-gas needs for spin. cellCount is
// side^4, so keep side small (side 6 is 1296 cells, 31104 slots).
export function d4Mesh(input: { side: number }): Mesh {
  const side = input.side
  const area = side * side
  const volume = area * side
  const hyper = volume * side
  const wrap = (value: number): number => modulo(value, side)

  return {
    id: `d4-${side}`,
    degree: 24,
    cellCount: hyper,
    neighbour(cell, direction) {
      const x = cell % side
      const y = Math.floor(cell / side) % side
      const z = Math.floor(cell / area) % side
      const w = Math.floor(cell / volume) % side
      const root = D4_ROOTS[direction] ?? [0, 0, 0, 0]
      const nx = wrap(x + (root[0] ?? 0))
      const ny = wrap(y + (root[1] ?? 0))
      const nz = wrap(z + (root[2] ?? 0))
      const nw = wrap(w + (root[3] ?? 0))

      return nw * volume + nz * area + ny * side + nx
    },
    opposite(direction) {
      return D4_OPPOSITE[direction] ?? direction
    },
  }
}

// The D4 coin with an extra REST direction (index 24), a zero-speed slot. A charge in the rest slot never streams
// (its neighbour is the cell itself), so it stays put, giving the coin an ENERGY SCALE, rest charges are the bound
// body, moving charges (directions 0..23) are the radiation. The rest slot is its own opposite, so the line-paired
// collisions (which require direction < opposite) never touch it. This is the 0C enrichment in
// plans/bound-body-base-modifications, the minimal way to make a persistent bound identity discrete.
export function d4MeshWithRest(input: { side: number }): Mesh {
  const base = d4Mesh(input)
  const rest = base.degree

  return {
    id: `d4-rest-${input.side}`,
    degree: base.degree + 1,
    cellCount: base.cellCount,
    neighbour(cell, direction) {
      return direction < base.degree
        ? base.neighbour(cell, direction)
        : cell
    },
    opposite(direction) {
      return direction < base.degree ? base.opposite(direction) : rest
    },
  }
}

// A finite Bethe tree (a rooted tree where every internal node has `coordination` children), a stand-in for the
// HYPERBOLIC BULK, its shells grow EXPONENTIALLY with radius (coordination^r), the hallmark of negative curvature.
// Used to test whether bulk curvature confines (it does not, exponential shell growth means a disturbance disperses
// exponentially, the opposite of binding). Direction 0 is the parent, directions 1..coordination are the children.
// Opposite is a placeholder (the tree is used for shell-growth, not a momentum-conserving lattice gas).
export function betheMesh(input: {
  coordination: number
  depth: number
}): Mesh {
  const { coordination, depth } = input
  const parent: number[] = [-1]
  const children: number[][] = [[]]

  let frontier = [0]

  for (let level = 0; level < depth; level++) {
    const nextFrontier: number[] = []

    for (const node of frontier) {
      for (let k = 0; k < coordination; k++) {
        const child = parent.length

        parent.push(node)
        children.push([])
        children[node]!.push(child)
        nextFrontier.push(child)
      }
    }

    frontier = nextFrontier
  }

  const cellCount = parent.length
  const degree = coordination + 1

  return {
    id: `bethe-${coordination}-${depth}`,
    degree,
    cellCount,
    neighbour(cell, direction) {
      if (direction === 0) {
        const p = parent[cell]!

        return p < 0 ? cell : p
      }

      const kids = children[cell]!
      const child = kids[direction - 1]

      return child ?? cell
    },
    opposite(direction) {
      return direction === 0 ? 1 : 0
    },
  }
}

// The 32 B4 root directions, the two-speed coin: the 24 long D4 roots plus the 8
// short axis roots, computed once with their opposite (negated root) indices.
const B4_ROOTS = rootsB4()
const B4_OPPOSITE = B4_ROOTS.map(root =>
  B4_ROOTS.findIndex(other =>
    other.every((value, axis) => value === -(root[axis] ?? 0)),
  ),
)

// A periodic four-dimensional lattice on the 32 B4 root directions, the TWO-SPEED
// coin (Option 4, routes-to-nested-selves). A long step (+-1, +-1, 0, 0) moves two
// coordinates per beat, a short step (+-1, 0, 0, 0) moves one. The extra speed is
// what lets a bound state drift slowly while its parts move fast, which the single-
// speed D4 coin forbids. cellCount is side^4, so keep side small.
export function b4Mesh(input: { side: number }): Mesh {
  const side = input.side
  const area = side * side
  const volume = area * side
  const hyper = volume * side
  const wrap = (value: number): number => modulo(value, side)

  return {
    id: `b4-${side}`,
    degree: 32,
    cellCount: hyper,
    neighbour(cell, direction) {
      const x = cell % side
      const y = Math.floor(cell / side) % side
      const z = Math.floor(cell / area) % side
      const w = Math.floor(cell / volume) % side
      const root = B4_ROOTS[direction] ?? [0, 0, 0, 0]
      const nx = wrap(x + (root[0] ?? 0))
      const ny = wrap(y + (root[1] ?? 0))
      const nz = wrap(z + (root[2] ?? 0))
      const nw = wrap(w + (root[3] ?? 0))

      return nw * volume + nz * area + ny * side + nx
    },
    opposite(direction) {
      return B4_OPPOSITE[direction] ?? direction
    },
  }
}

// A periodic cubic lattice in three dimensions, six directions. This is the flat
// {4,3,4} cusp, the physical space of the {3,4,3,4} substrate. Direction order:
// 0 is +x, 1 is -x, 2 is +y, 3 is -y, 4 is +z, 5 is -z.
export function cubicMesh(input: { side: number }): Mesh {
  const side = input.side
  const area = side * side
  const wrap = (value: number): number => modulo(value, side)
  const at = (x: number, y: number, z: number): number =>
    wrap(z) * area + wrap(y) * side + wrap(x)

  const opposites = [1, 0, 3, 2, 5, 4]

  return {
    id: `cubic-${side}`,
    degree: 6,
    cellCount: side * area,
    neighbour(cell, direction) {
      const x = cell % side
      const y = Math.floor(cell / side) % side
      const z = Math.floor(cell / area)

      switch (direction) {
        case 0:
          return at(x + 1, y, z)
        case 1:
          return at(x - 1, y, z)
        case 2:
          return at(x, y + 1, z)
        case 3:
          return at(x, y - 1, z)
        case 4:
          return at(x, y, z + 1)
        default:
          return at(x, y, z - 1)
      }
    },
    opposite(direction) {
      return opposites[direction] ?? direction
    },
  }
}
