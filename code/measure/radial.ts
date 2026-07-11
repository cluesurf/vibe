// Radial (Busemann) structure of an embedded hyperbolic graph, for the multiresolution and cusp data-structure
// experiments. The Busemann function toward an ideal point is the radial / scale coordinate, its level sets are
// nested horoballs, and a level is a flat slice (a horosphere). These read the bulk as a multiresolution
// pyramid over the flat boundary.

import { Graph } from '@/code/tool/graph'
import { idealDirection, busemann } from '@/code/substrate/horosphere'
import { type Vec } from '@/code/algebra/vector'

export function graphBusemann(graph: Graph): number[] {
  const e = graph.embedding

  if (!e) {
    return new Array<number>(graph.size).fill(0)
  }

  const d = e.dimension
  const coords: Vec[] = []

  for (let i = 0; i < graph.size; i++) {
    coords.push(Array.from(e.coords.subarray(i * d, (i + 1) * d)))
  }

  const ideal = idealDirection(coords)

  return busemann({ coords, ideal })
}

// bin the cells into `bins` radial levels by their Busemann value (inner to outer), the populations per level
export function busemannLevels(graph: Graph, bins: number): number[] {
  const values = graphBusemann(graph).filter(Number.isFinite)

  if (values.length === 0) {
    return []
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const histogram = new Array<number>(bins).fill(0)

  for (const v of values) {
    const k = Math.min(
      bins - 1,
      Math.floor(((v - min) / (max - min + 1e-9)) * bins),
    )

    histogram[k] = histogram[k]! + 1
  }

  return histogram
}
