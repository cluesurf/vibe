// A modular mesh: numCells cohesive cells of cellSize vibes each, dense inside (fill +1, the
// cohesion that makes a cell a self), sparse and weak between cells (a few +1 links). The modular
// structure that nested selves and integrated information are built on: a cell is strongly bound
// inside and weakly coupled to other cells.

import { Rng } from '@/code/tool/rng'
import { makeGraph, Graph } from '@/code/tool/graph'

export function modularMesh(input: {
  numCells: number
  cellSize: number
  intraDegree: number
  interPerCell: number
  rng: Rng
}): {
  g: Graph
  fills: Int8Array[]
  cellOf: Int32Array
} {
  const { numCells, cellSize, intraDegree, interPerCell, rng } = input
  const n = numCells * cellSize
  const adj: Map<number, number>[] = Array.from(
    { length: n },
    () => new Map(),
  )
  const addEdge = (u: number, v: number, f: number): void => {
    if (u === v) return
    adj[u]?.set(v, f)
    adj[v]?.set(u, f)
  }
  const cellOf = new Int32Array(n)
  for (let c = 0; c < numCells; c++) {
    for (let i = 0; i < cellSize; i++) cellOf[c * cellSize + i] = c
    // dense intra-cell edges, fill +1 (strong cohesion)
    for (let i = 0; i < cellSize; i++) {
      const u = c * cellSize + i
      for (let d = 0; d < intraDegree; d++) {
        const v = c * cellSize + rng.nextInt({ max: cellSize })
        addEdge(u, v, 1)
      }
    }
  }
  // sparse inter-cell edges, fill +1 (weak coupling)
  for (let c = 0; c < numCells; c++) {
    for (let e = 0; e < interPerCell; e++) {
      const u = c * cellSize + rng.nextInt({ max: cellSize })
      const other =
        (c + 1 + rng.nextInt({ max: numCells - 1 })) % numCells
      const v = other * cellSize + rng.nextInt({ max: cellSize })
      addEdge(u, v, 1)
    }
  }
  const neighbors: number[][] = adj.map(m => [...m.keys()])
  const fills: Int8Array[] = adj.map(m => Int8Array.from(m.values()))
  const g = makeGraph({ size: n, directed: false, neighbors })
  return { g, fills, cellOf }
}
