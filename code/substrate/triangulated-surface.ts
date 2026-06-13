// A triangulated surface mesh with optional periodic wrap, so we can control its
// topology. Every square cell is split by a diagonal into two triangles, so the
// cell complex has genuine 2-cells (filled faces). With no wrap it is a disk,
// wrapping one direction gives a cylinder, wrapping both gives a torus. Used to
// validate that the Kahler-Dirac zero-mode count equals the surface topology
// (the sum of Betti numbers): the "spin from topology" check for P4.

import { Graph, makeGraph } from '@/code/tool/graph'

export function triangulatedSurface(input: {
  width: number
  height: number
  wrapWidth: boolean
  wrapHeight: boolean
}): Graph {
  const W = input.width
  const H = input.height
  const size = W * H
  const idx = (i: number, j: number): number => j * W + i

  const neighbors: number[][] = Array.from({ length: size }, () => [])
  const addEdge = (a: number, b: number): void => {
    if (a !== b) {
      neighbors[a]?.push(b)
      neighbors[b]?.push(a)
    }
  }

  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const a = idx(i, j)
      // right neighbor
      if (i + 1 < W) {
        addEdge(a, idx(i + 1, j))
      } else if (input.wrapWidth) {
        addEdge(a, idx(0, j))
      }
      // up neighbor
      if (j + 1 < H) {
        addEdge(a, idx(i, j + 1))
      } else if (input.wrapHeight) {
        addEdge(a, idx(i, 0))
      }
      // diagonal up-right, the shared edge that splits the square into triangles
      const ni = i + 1 < W ? i + 1 : input.wrapWidth ? 0 : -1
      const nj = j + 1 < H ? j + 1 : input.wrapHeight ? 0 : -1
      if (ni >= 0 && nj >= 0) {
        addEdge(a, idx(ni, nj))
      }
    }
  }

  const cleaned = neighbors.map((row) => [...new Set(row)])
  return makeGraph({ size, directed: false, neighbors: cleaned })
}
