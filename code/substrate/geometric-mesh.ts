// Lightweight 2D meshes: a plain neighbor list plus per-node coordinates in the
// unit square. The random geometric graph (uniform points connected within a
// radius) is the Euclidean analogue of a spatial sprinkling; the square lattice is
// the anisotropic control with a preferred set of axes.

import { Rng } from '@/code/tool/rng'

export interface Mesh {
  size: number
  coords: Float64Array // size * 2, (x, y) per node
  neighbors: number[][]
}

// A 2D random geometric graph: uniform points in the unit square, each pair
// connected when their Euclidean separation is below `radius`.
export function randomGeometricMesh(input: { count: number; radius: number; rng: Rng }): Mesh {
  const n = input.count
  const coords = new Float64Array(n * 2)
  for (let i = 0; i < n; i++) {
    coords[i * 2] = input.rng.next()
    coords[i * 2 + 1] = input.rng.next()
  }
  const neighbors: number[][] = Array.from({ length: n }, () => [])
  const r2 = input.radius * input.radius
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = (coords[i * 2] ?? 0) - (coords[j * 2] ?? 0)
      const dy = (coords[i * 2 + 1] ?? 0) - (coords[j * 2 + 1] ?? 0)
      if (dx * dx + dy * dy < r2) {
        neighbors[i]?.push(j)
        neighbors[j]?.push(i)
      }
    }
  }
  return { size: n, coords, neighbors }
}

// A 2D square lattice of `side` x `side` nodes with coordinates spread over the
// unit square and 4-neighbor (von Neumann) connectivity.
export function squareLatticeMesh(input: { side: number }): Mesh {
  const side = input.side
  const n = side * side
  const coords = new Float64Array(n * 2)
  const neighbors: number[][] = Array.from({ length: n }, () => [])
  const idx = (i: number, j: number): number => j * side + i
  for (let j = 0; j < side; j++) {
    for (let i = 0; i < side; i++) {
      const v = idx(i, j)
      coords[v * 2] = i / (side - 1)
      coords[v * 2 + 1] = j / (side - 1)
      if (i + 1 < side) {
        neighbors[v]?.push(idx(i + 1, j))
        neighbors[idx(i + 1, j)]?.push(v)
      }
      if (j + 1 < side) {
        neighbors[v]?.push(idx(i, j + 1))
        neighbors[idx(i, j + 1)]?.push(v)
      }
    }
  }
  return { size: n, coords, neighbors }
}

// The node nearest the centre (0.5, 0.5) of the unit square.
export function centerNode(mesh: Mesh): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < mesh.size; i++) {
    const dx = (mesh.coords[i * 2] ?? 0) - 0.5
    const dy = (mesh.coords[i * 2 + 1] ?? 0) - 0.5
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}
