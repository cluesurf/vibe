// The intrinsic dimension of a cell graph's outer boundary shell, the dimension the holographic dual
// would live in (an S^2 screen reads ~2, an S^3 screen ~3). Build the cell graph for a Schlafli symbol,
// take the outer shell (cells whose radial coordinate exceeds a fraction of the maximum radius),
// restrict the adjacency to that shell, and read the spectral dimension of the boundary subgraph alone
// from the highest-degree boundary cell.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { norm } from '@/code/algebra/vector'
import { mostConnectedNode } from '@/code/tool/graph'
import { spectralDimension } from '@/code/measure/dimension'

export function boundaryDimension(input: {
  symbol: number[]
  maxCells: number
  radiusFraction?: number
  specDimT1?: number
  specDimT2?: number
}): { cells: number; boundaryCells: number; boundaryDim: number } {
  const g = buildCellGraph({
    symbol: input.symbol as never,
    maxCells: input.maxCells,
  })

  const N = g.cellCount
  const nb = g.neighbors
  const rad = g.coords.map(norm)
  const rmax = Math.max(...rad)
  const fraction = input.radiusFraction ?? 0.78
  const boundary = [...Array(N).keys()].filter(
    i => rad[i]! > fraction * rmax,
  )

  const isB = new Uint8Array(N)

  for (const b of boundary) {
    isB[b] = 1
  }

  const id = new Map<number, number>()
  boundary.forEach((b, i) => id.set(b, i))

  // sub-adjacency restricted to the boundary shell, reindexed to [0, boundary.length)
  const bAdj: number[][] = boundary.map(b => {
    const out: number[] = []

    for (const w of nb[b]!) {
      if (isB[w]) {
        out.push(id.get(w)!)
      }
    }

    return out
  })

  const center = mostConnectedNode(bAdj)
  const boundaryDim =
    Math.round(
      spectralDimension({
        neighbors: bAdj,
        start: center,
        t1: input.specDimT1 ?? 2,
        t2: input.specDimT2 ?? 6,
      }) * 100,
    ) / 100

  return { cells: N, boundaryCells: boundary.length, boundaryDim }
}
