// Build a renderer-agnostic Scene for a Schlafli symbol. This is the RENDER layer on top of the base cell
// engine, it reuses substrate/coxeter cell-direct for the cell enumeration (the orbit of the cell under the
// Coxeter group) and the canonical Minkowski math, and adds only what drawing needs, the cell shape, the
// upright orientation, the ball projection, and edge dedup. The SAME path makes a 2D tiling ({7,3}) and a 3D
// honeycomb ({5,3,4}), reading the dimension from the frame. See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import type { Scene, SceneEdge } from '@/code/render/scene'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { classifyGeometry } from '@/code/substrate/coxeter/schlafli'
import { mobiusAdd, negate } from '@/code/render/geometry/isometry'
import {
  Vec,
  matVec,
  toPoincare,
  reflectPoint,
  hyperbolicDistance,
  nullVector,
  normalizeTimelike,
  pointKey,
} from '@/code/substrate/coxeter/minkowski'

const DEFAULT_MAX_CELLS = 12000
const MAX_VERTICES_PER_CELL = 500
const BOUNDARY_CLIP = 0.9996

export type HoneycombOptions = {
  // the Schlafli symbol, e.g. [7,3] (a 2D tiling) or [5,3,4] (a 3D honeycomb)
  symbol: number[]
  // how many cells to enumerate, more means denser detail toward the boundary
  maxCells?: number
  // orient the central cell upright, a vertex pointing straight up for an odd-sided cell, or a flat side up
  // for an even-sided cell. On by default, so every tiling reads the same way.
  orientUp?: boolean
}

// build the tessellation Scene for a Schlafli symbol
export function buildHoneycombScene(input: HoneycombOptions): Scene {
  const { symbol, maxCells = DEFAULT_MAX_CELLS, orientUp = true } = input

  // the base engine enumerates the cells (with their placing isometries) in the Coxeter frame
  const graph = buildCellGraph({ symbol, maxCells })
  const frame = graph.frame!
  const cellMat = graph.cellMat!
  const { normals, metric, timeAxis } = frame
  const dim = metric.length
  const ballDim = dim - 1 // 2 for a tiling (disk), 3 for a honeycomb (ball)

  // the cell shape, in the same frame, the fundamental vertex is the meet of every mirror but the first, and
  // the cell vertices are its orbit under the cell stabilizer (every mirror but the last)
  const v0 = normalizeTimelike(nullVector(normals.slice(1), metric), metric, timeAxis)
  const stabilizerNormals = normals.slice(0, dim - 1)
  const baseVertices = orbitVertices(v0, stabilizerNormals, metric)
  const baseEdges = polyhedronEdges(baseVertices, metric)

  // recenter, translate the whole tiling so the central cell's center sits at the ball origin, so a tile face
  // is centered for every symbol. graph.coords[0] is the central cell center in the ball, and a Mobius
  // translation by its negation brings it to the origin while keeping the tiling exact.
  const centerBall = graph.coords[0] ?? baseVertices[0]!.map(() => 0)
  const shift = negate(centerBall)
  const recenter = (b: Vec): Vec => mobiusAdd(shift, b)

  // orientation, rotate the first two ball axes so the recentered central cell sits upright, a vertex up for an
  // odd-sided cell, a flat side up for an even-sided cell. Computed from the recentered central cell vertices.
  const centralBallVerts = baseVertices.map((v) => recenter(toPoincare(matVec(cellMat[0]!, v), timeAxis)))
  const { cos: orientCos, sin: orientSin } = orientation(centralBallVerts, symbol[0] ?? 3, orientUp)
  const orient = (b: Vec): Vec => {
    if (!orientUp) return b
    const x = b[0] ?? 0
    const y = b[1] ?? 0
    const out = b.slice()
    out[0] = orientCos * x - orientSin * y
    out[1] = orientSin * x + orientCos * y
    return out
  }

  // each cell's center, the lattice points, recentered and oriented the same way as the edges
  const centers: Vec[] = graph.coords.map((c) => orient(recenter(c)))

  // replicate the cell edges across every cell, deduplicated in ball space
  const edges: SceneEdge[] = []
  const seen = new Set<string>()
  for (const g of cellMat) {
    const ballVerts = baseVertices.map((v) => orient(recenter(toPoincare(matVec(g, v), timeAxis))))
    for (const [i, j] of baseEdges) {
      const a = ballVerts[i]!
      const b = ballVerts[j]!
      if (norm(a) > BOUNDARY_CLIP || norm(b) > BOUNDARY_CLIP) continue
      const key = pairKey(a, b)
      if (seen.has(key)) continue
      seen.add(key)
      edges.push({ a, b })
    }
  }

  return { dim: ballDim, symbol: symbol.slice(), edges, cellCount: cellMat.length, centers }
}

// is the cell (the symbol minus its last entry) a finite spherical polytope? finite cells are the case this
// generator handles. for a 2D tiling the cell is a single polygon, always finite.
export function hasFiniteCell(symbol: number[]): boolean {
  const cell = symbol.slice(0, -1)
  if (cell.length <= 1) return true
  return classifyGeometry(cell) === 'spherical'
}

// the rotation (as cos and sin) that brings the central cell upright, from its recentered ball vertices
function orientation(ballVertices: Vec[], p: number, orientUp: boolean): { cos: number; sin: number } {
  if (!orientUp) return { cos: 1, sin: 0 }
  let bestR = -1
  let theta0 = 0
  for (const b of ballVertices) {
    const x = b[0] ?? 0
    const y = b[1] ?? 0
    const r = x * x + y * y
    if (r > bestR) {
      bestR = r
      theta0 = Math.atan2(y, x)
    }
  }
  const half = p % 2 === 0 ? Math.PI / p : 0
  const angle = Math.PI / 2 - theta0 - half
  return { cos: Math.cos(angle), sin: Math.sin(angle) }
}

// the orbit of the fundamental vertex under the cell stabilizer (reflecting across the stabilizer mirrors)
function orbitVertices(v0: Vec, stabilizerNormals: number[][], metric: number[]): Vec[] {
  const vertices: Vec[] = [v0]
  const visited = new Set<string>([pointKey(v0)])
  const queue: Vec[] = [v0]
  while (queue.length > 0 && vertices.length < MAX_VERTICES_PER_CELL) {
    const v = queue.shift()!
    for (const n of stabilizerNormals) {
      const vr = reflectPoint(v, n, metric)
      const k = pointKey(vr)
      if (visited.has(k)) continue
      visited.add(k)
      vertices.push(vr)
      queue.push(vr)
    }
  }
  return vertices
}

// the edges of a cell, the vertex pairs at the minimum (edge) hyperbolic distance
function polyhedronEdges(vertices: Vec[], metric: number[]): [number, number][] {
  let minDist = Infinity
  const cap = Math.min(vertices.length, 20)
  for (let i = 0; i < cap; i++) for (let j = i + 1; j < cap; j++) {
    const d = hyperbolicDistance(vertices[i]!, vertices[j]!, metric)
    if (d > 0.01 && d < minDist) minDist = d
  }
  const edgeLength = minDist < Infinity ? minDist : 1
  const tolerance = edgeLength * 1.2
  const edges: [number, number][] = []
  for (let i = 0; i < vertices.length; i++) for (let j = i + 1; j < vertices.length; j++) {
    const d = hyperbolicDistance(vertices[i]!, vertices[j]!, metric)
    if (d > 0.01 && d < tolerance) edges.push([i, j])
  }
  return edges
}

// the Euclidean norm of a ball point
function norm(v: number[]): number {
  let s = 0
  for (const x of v) s += x * x
  return Math.sqrt(s)
}

function pairKey(a: number[], b: number[]): string {
  const ka = a.map((x) => Math.round(x * 1e4)).join(',')
  const kb = b.map((x) => Math.round(x * 1e4)).join(',')
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}
