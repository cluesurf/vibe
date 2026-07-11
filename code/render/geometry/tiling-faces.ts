// Per-cell FACE polygons for a tessellation, aligned with the cell graph indices, so a cellular automaton
// running on the cell graph can color cell i by drawing polygons[i]. Reuses the cell engine (buildCellGraph)
// and the shared cell shape (buildCellShape), and recenters so the central cell sits at the origin (same as the
// honeycomb strut renderer). The polygon vertices are returned in cyclic (counterclockwise) order, ready to
// fill. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { buildCellShape } from '@/code/render/geometry/cell-shape'
import {
  matVec,
  toPoincare,
  type Vec,
} from '@/code/substrate/coxeter/minkowski'
import { mobiusAdd, negate } from '@/code/render/geometry/isometry'

export type TilingFaces = {
  // the cell adjacency graph (cell i's neighbors), what the automaton runs on
  readonly neighbors: number[][]
  // the face polygon (cyclic ball vertices) of each cell, aligned with the neighbor indices
  readonly polygons: Vec[][]
  // each cell's center in the ball, recentered
  readonly centers: Vec[]
  readonly cellCount: number
}

export function buildTilingFaces(input: {
  symbol: number[]
  maxCells?: number
}): TilingFaces {
  const { symbol, maxCells = 2000 } = input
  const graph = buildCellGraph({ symbol, maxCells })
  const shape = buildCellShape(symbol)
  const cellMat = graph.cellMat!
  const timeAxis = graph.frame!.timeAxis

  // recenter so the central cell is at the origin (Mobius translation by the negation of its center)
  const centerBall = graph.coords[0] ?? shape.vertices[0]!.map(() => 0)
  const shift = negate(centerBall)
  const recenter = (b: Vec): Vec => mobiusAdd(shift, b)

  const polygons: Vec[][] = []
  const centers: Vec[] = graph.coords.map(c => recenter(c))

  for (let cell = 0; cell < graph.cellCount; cell++) {
    const center = centers[cell]!
    const verts = shape.vertices.map(v =>
      recenter(toPoincare(matVec(cellMat[cell]!, v), timeAxis)),
    )

    // order the vertices cyclically around the cell center so the polygon does not self-cross
    const ordered = verts
      .map(p => ({
        p,
        angle: Math.atan2(
          (p[1] ?? 0) - (center[1] ?? 0),
          (p[0] ?? 0) - (center[0] ?? 0),
        ),
      }))
      .sort((a, b) => a.angle - b.angle)
      .map(x => x.p)

    polygons.push(ordered)
  }

  return {
    neighbors: graph.neighbors,
    polygons,
    centers,
    cellCount: graph.cellCount,
  }
}
