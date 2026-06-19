// The bulk spectral readout of a Coxeter cell graph, the most-duplicated structural measurement
// in the tessellation survey. Build the cell graph for a Schlafli symbol, take the highest-degree
// interior cell as the centre, and report the cell count, the bulk degree, and the lazy-walk
// return-probability spectral dimension over a [t1, t2] window (rounded to two places).

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { mostConnectedNode } from '@/code/tool/graph'
import { spectralDimension } from '@/code/measure/dimension'

export function cellGraphSpectral(input: {
  symbol: number[]
  maxCells: number
  t1: number
  t2: number
}): { cells: number; degree: number; specDim: number } {
  const g = buildCellGraph({
    symbol: input.symbol as never,
    maxCells: input.maxCells,
  })
  const nb = g.neighbors
  const center = mostConnectedNode(nb)
  const degree = nb[center]!.length
  const specDim =
    Math.round(
      spectralDimension({
        neighbors: nb,
        start: center,
        t1: input.t1,
        t2: input.t2,
      }) * 100,
    ) / 100
  return { cells: g.cellCount, degree, specDim }
}
