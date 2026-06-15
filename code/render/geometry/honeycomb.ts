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
import { buildCellShape } from '@/code/render/geometry/cell-shape'
import { Vec, matVec, toPoincare, pointKey } from '@/code/substrate/coxeter/minkowski'

const DEFAULT_MAX_CELLS = 12000
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
  const { metric, timeAxis } = frame
  const dim = metric.length
  const ballDim = dim - 1 // 2 for a tiling (disk), 3 for a honeycomb (ball)

  // the cell shape, in the same frame, the fundamental vertex's orbit under the cell stabilizer (shared with
  // the walking camera via cell-shape.ts)
  const shape = buildCellShape(symbol)
  const baseVertices = shape.vertices
  const baseEdges = shape.edges

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
