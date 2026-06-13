// The uniform mesh interface. Every substrate, the square toy, the cubic cusp,
// the {3,4,3,4} honeycomb, exposes the same shape: a fixed number of cells, a
// fixed coin of directions per cell, the neighbour reached along each direction,
// and the opposite direction, which is what makes streaming well defined. A
// consumer of a Mesh never knows or cares which substrate it was handed.

import { modulo } from '@/code/tool/integer'
import { rootsD4 } from '@/code/algebra/group/root-system'

export interface Mesh {
  readonly id: string
  readonly degree: number // directions per cell, the coin size
  readonly cellCount: number
  // the cell reached by leaving `cell` through `direction`.
  neighbour(cell: number, direction: number): number
  // the reverse of a direction, so a streamed charge keeps its line of travel.
  opposite(direction: number): number
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
const D4_OPPOSITE = D4_ROOTS.map((root) =>
  D4_ROOTS.findIndex((other) =>
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
