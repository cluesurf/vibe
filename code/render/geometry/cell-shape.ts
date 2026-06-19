// The shape of ONE cell of a tessellation, its vertices and edges in the Coxeter frame, independent of where
// the cell sits in the tiling. A cell placed by an isometry g draws its vertices as toPoincare(g * vertex).
// Pulled out of honeycomb.ts so both the all-cells gallery renderer and the virtualized walking camera build
// the cell shape the same way (DRY). See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import {
  coxeterCellFrame,
  type CoxeterCellFrame,
} from '@/code/substrate/coxeter/frame'
import {
  Vec,
  reflectPoint,
  geodesicDistance,
  nullVector,
  normalizeModelPoint,
  pointKey,
} from '@/code/substrate/coxeter/minkowski'

const MAX_VERTICES_PER_CELL = 500

export interface CellShape {
  readonly frame: CoxeterCellFrame
  // the cell's vertices in the Lorentzian frame (place with toPoincare(g * vertex))
  readonly vertices: Vec[]
  // the cell's edges as index pairs into vertices
  readonly edges: [number, number][]
}

// build the cell shape for a Schlafli symbol, the fundamental vertex is the meet of every mirror but the first,
// and the cell vertices are its orbit under the cell stabilizer (every mirror but the last)
export function buildCellShape(symbol: number[]): CellShape {
  const frame = coxeterCellFrame(symbol)
  const { normals, metric, timeAxis, dim } = frame
  const v0 = normalizeModelPoint(
    nullVector(normals.slice(1), metric),
    metric,
    timeAxis,
  )
  const stabilizerNormals = normals.slice(0, dim - 1)
  const vertices = orbitVertices(v0, stabilizerNormals, metric)
  const edges = polyhedronEdges(vertices, metric)
  return { frame, vertices, edges }
}

// the orbit of the fundamental vertex under the cell stabilizer (reflecting across the stabilizer mirrors)
function orbitVertices(
  v0: Vec,
  stabilizerNormals: number[][],
  metric: number[],
): Vec[] {
  const vertices: Vec[] = [v0]
  const visited = new Set<string>([pointKey(v0)])
  const queue: Vec[] = [v0]
  while (queue.length > 0 && vertices.length < MAX_VERTICES_PER_CELL) {
    const v = queue.shift()!
    for (const n of stabilizerNormals) {
      const vr = reflectPoint(v, n, metric)
      const k = pointKey(vr)
      if (visited.has(k)) {
        continue
      }
      visited.add(k)
      vertices.push(vr)
      queue.push(vr)
    }
  }
  return vertices
}

// the edges of a cell, the vertex pairs at the minimum (edge) hyperbolic distance
function polyhedronEdges(
  vertices: Vec[],
  metric: number[],
): [number, number][] {
  let minDist = Infinity
  const cap = Math.min(vertices.length, 20)
  for (let i = 0; i < cap; i++) {
    for (let j = i + 1; j < cap; j++) {
      const d = geodesicDistance(vertices[i]!, vertices[j]!, metric)
      if (d > 0.01 && d < minDist) {
        minDist = d
      }
    }
  }
  const edgeLength = minDist < Infinity ? minDist : 1
  const tolerance = edgeLength * 1.2
  const edges: [number, number][] = []
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const d = geodesicDistance(vertices[i]!, vertices[j]!, metric)
      if (d > 0.01 && d < tolerance) {
        edges.push([i, j])
      }
    }
  }
  return edges
}
