// Build a renderer-agnostic Scene for a Schlafli symbol. This is the RENDER layer on top of the base cell
// engine, it reuses substrate/coxeter cell-direct for the cell enumeration (the orbit of the cell under the
// Coxeter group) and the canonical Minkowski math, and adds only what drawing needs, the cell shape, the
// upright orientation, the ball projection, and edge dedup. The SAME path makes a 2D tiling ({7,3}) and a 3D
// honeycomb ({5,3,4}), reading the dimension from the frame. See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import type { Scene, SceneEdge } from '@/code/render/scene'
import {
  buildCellGraph,
  buildEuclideanLattice,
} from '@/code/substrate/coxeter/cell-direct'
import { classifyGeometry } from '@/code/substrate/coxeter/schlafli'
import { coxeterCellFrame } from '@/code/substrate/coxeter/frame'
import { mobiusAdd, negate } from '@/code/render/geometry/isometry'
import { buildCellShape } from '@/code/render/geometry/cell-shape'
import {
  Vec,
  Mat,
  matVec,
  matMul,
  identity,
  toPoincare,
  pointKey,
  nullVector,
  normalizeModelPoint,
  stereographic,
  orthogonalComplementBasis,
} from '@/code/substrate/coxeter/minkowski'

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
  const {
    symbol,
    maxCells = DEFAULT_MAX_CELLS,
    orientUp = true,
  } = input

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
  const centralBallVerts = baseVertices.map(v =>
    recenter(toPoincare(matVec(cellMat[0]!, v), timeAxis)),
  )
  const { cos: orientCos, sin: orientSin } = orientation(
    centralBallVerts,
    symbol[0] ?? 3,
    orientUp,
  )
  const orient = (b: Vec): Vec => {
    if (!orientUp) {
      return b
    }

    const x = b[0] ?? 0
    const y = b[1] ?? 0
    const out = b.slice()
    out[0] = orientCos * x - orientSin * y
    out[1] = orientSin * x + orientCos * y

    return out
  }

  // each cell's center, the lattice points, recentered and oriented the same way as the edges
  const centers: Vec[] = graph.coords.map(c => orient(recenter(c)))

  // replicate the cell edges across every cell, deduplicated in ball space
  const edges: SceneEdge[] = []
  const seen = new Set<string>()
  for (const g of cellMat) {
    const ballVerts = baseVertices.map(v =>
      orient(recenter(toPoincare(matVec(g, v), timeAxis))),
    )
    for (const [i, j] of baseEdges) {
      const a = ballVerts[i]!
      const b = ballVerts[j]!
      if (norm(a) > BOUNDARY_CLIP || norm(b) > BOUNDARY_CLIP) {
        continue
      }

      const key = pairKey(a, b)
      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      edges.push({ a, b })
    }
  }

  return {
    dim: ballDim,
    symbol: symbol.slice(),
    edges,
    cellCount: cellMat.length,
    centers,
  }
}

// Build the Scene for a SPHERICAL symbol, a regular tiling of the sphere (a polyhedron, {p,q} with
// 1/p + 1/q > 1/2) or a spherical honeycomb of the 3-sphere ({p,q,r} all spherical, the regular polytopes).
// The Coxeter frame is positive-definite here, the reflection group is FINITE, so the cell orbit closes on its
// own. The same orbit-of-the-cell BFS as the hyperbolic builder runs, then each model point is carried to the
// ball by stereographic projection from the antipode of the central cell, the spherical analogue of the
// Poincare recentering. One engine, every signature.
export function buildSphericalScene(input: HoneycombOptions): Scene {
  const {
    symbol,
    maxCells = DEFAULT_MAX_CELLS,
    orientUp = true,
  } = input
  const frame = coxeterCellFrame(symbol)
  const { normals, metric, timeAxis, faces, dim } = frame
  const ballDim = dim - 1

  // the central cell center, fixed by the cell mirrors (every generator but the last), as a unit model point
  const cellMirrors = dim - 1
  const c0 = normalizeModelPoint(
    nullVector(normals.slice(0, cellMirrors), metric),
    metric,
    timeAxis,
  )

  // BFS the FINITE cell orbit, each cell its group matrix g (center = g * c0), neighbors = g * faces[i]
  const cellMat: Mat[] = [identity(dim)]
  const seenCell = new Set<string>([pointKey(c0)])
  for (let head = 0; head < cellMat.length; head++) {
    const g = cellMat[head]!
    for (const f of faces) {
      const gp = matMul(g, f)
      const center = normalizeModelPoint(
        matVec(gp, c0),
        metric,
        timeAxis,
      )
      const k = pointKey(center)
      if (seenCell.has(k)) {
        continue
      }

      seenCell.add(k)
      if (cellMat.length >= maxCells) {
        break
      }

      cellMat.push(gp)
    }
  }

  // stereographic projection to the ball, with the central cell at the origin
  const basis = orthogonalComplementBasis(c0)
  const project = (modelPoint: Vec): Vec =>
    stereographic(
      normalizeModelPoint(modelPoint, metric, timeAxis),
      c0,
      basis,
    )

  const shape = buildCellShape(symbol)
  const baseVertices = shape.vertices
  const baseEdges = shape.edges

  // orient the central cell upright, the same convention as the hyperbolic builder
  const centralBallVerts = baseVertices.map(v =>
    project(matVec(cellMat[0]!, v)),
  )
  const { cos: orientCos, sin: orientSin } = orientation(
    centralBallVerts,
    symbol[0] ?? 3,
    orientUp,
  )
  const orient = (b: Vec): Vec => {
    if (!orientUp) {
      return b
    }

    const x = b[0] ?? 0
    const y = b[1] ?? 0
    const out = b.slice()
    out[0] = orientCos * x - orientSin * y
    out[1] = orientSin * x + orientCos * y

    return out
  }

  // collect the raw stereographic edges. Under stereographic projection from the antipode, the whole sphere
  // unrolls onto the plane (the front hemisphere inside the unit disk, the far hemisphere outside it, the single
  // antipodal cell at infinity). We keep every finite edge and scale the whole figure to fit the disk, so the
  // entire polyhedron shows, rather than clipping to the front hemisphere.
  const INFINITY_GUARD = 1e4
  const rawEdges: SceneEdge[] = []
  const seen = new Set<string>()
  let maxR = 1e-9
  for (const g of cellMat) {
    const ballVerts = baseVertices.map(v =>
      orient(project(matVec(g, v))),
    )
    for (const [i, j] of baseEdges) {
      const a = ballVerts[i]!
      const b = ballVerts[j]!
      if (norm(a) > INFINITY_GUARD || norm(b) > INFINITY_GUARD) {
        continue
      }

      const key = pairKey(a, b)
      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      rawEdges.push({ a, b })
      maxR = Math.max(maxR, norm(a), norm(b))
    }
  }

  const scale = 0.95 / maxR
  const fit = (p: Vec): Vec => p.map(v => v * scale)
  const edges: SceneEdge[] = rawEdges.map(e => ({
    a: fit(e.a),
    b: fit(e.b),
  }))
  const centers: Vec[] = cellMat
    .map(g => orient(project(matVec(g, c0))))
    .filter(c => norm(c) <= INFINITY_GUARD)
    .map(fit)

  return {
    dim: ballDim,
    symbol: symbol.slice(),
    edges,
    cellCount: cellMat.length,
    centers,
  }
}

// the embedding basis for a 2D Euclidean regular tiling, the lattice vectors in the plane
const EUCLIDEAN_BASIS_2D: Record<string, Vec[]> = {
  '4,4': [
    [1, 0],
    [0, 1],
  ], // square
  '3,6': [
    [1, 0],
    [0.5, Math.sqrt(3) / 2],
  ], // triangular
  '6,3': [
    [1, 0],
    [0.5, Math.sqrt(3) / 2],
  ], // hexagonal lattice (drawn as the triangular dual lattice)
}

// Build the Scene for a EUCLIDEAN (flat) symbol. The reflection group is affine (its model metric is
// degenerate), so the hyperboloid path does not apply, the flat lattice builder enumerates a finite patch
// instead. The lattice points are embedded with the tiling's plane basis and scaled to sit inside the disk,
// and the edges are the nearest-neighbour bonds, drawn straight (a flat geodesic is a straight line).
export function buildEuclideanScene(input: HoneycombOptions): Scene {
  const { symbol, maxCells = 1200 } = input
  const lattice = buildEuclideanLattice({ symbol, maxCells })
  const key = symbol.join(',')
  const basis = EUCLIDEAN_BASIS_2D[key] ?? [
    [1, 0],
    [0, 1],
  ]
  const ballDim = basis.length

  // embed each lattice coord with the plane basis
  const placed: Vec[] = lattice.coords.map(c => {
    const p: Vec = new Array<number>(ballDim).fill(0)
    for (let a = 0; a < ballDim; a++) {
      for (let i = 0; i < basis.length; i++) {
        p[a] = (p[a] ?? 0) + (c[i] ?? 0) * (basis[i]![a] ?? 0)
      }
    }

    return p
  })

  // center on the centroid and scale to fit the disk
  const centroid: Vec = new Array<number>(ballDim).fill(0)
  for (const p of placed) {
    for (let a = 0; a < ballDim; a++) {
      centroid[a]! += p[a]! / placed.length
    }
  }

  let maxR = 1e-9
  for (const p of placed) {
    maxR = Math.max(maxR, norm(p.map((v, a) => v - centroid[a]!)))
  }

  const scale = 0.92 / maxR
  const ball: Vec[] = placed.map(p =>
    p.map((v, a) => (v - centroid[a]!) * scale),
  )

  const edges: SceneEdge[] = []
  const seen = new Set<string>()
  for (let i = 0; i < lattice.neighbors.length; i++) {
    for (const j of lattice.neighbors[i]!) {
      if (j <= i) {
        continue
      }

      const a = ball[i]!
      const b = ball[j]!
      const k = pairKey(a, b)
      if (seen.has(k)) {
        continue
      }

      seen.add(k)
      edges.push({ a, b })
    }
  }

  return {
    dim: ballDim,
    symbol: symbol.slice(),
    edges,
    cellCount: ball.length,
    centers: ball,
  }
}

// Build the Scene for ANY regular symbol, dispatching on its geometry, hyperbolic (the Poincare ball),
// spherical (stereographic from the sphere), or Euclidean (a flat lattice patch). One entry point for the
// whole classical family, the three constant-curvature 2D geometries and their honeycombs.
export function buildTilingScene(input: HoneycombOptions): Scene {
  const geometry = classifyGeometry(input.symbol)
  if (geometry === 'spherical') {
    return buildSphericalScene(input)
  }

  if (geometry === 'euclidean') {
    return buildEuclideanScene(input)
  }

  return buildHoneycombScene(input)
}

// is the cell (the symbol minus its last entry) a finite spherical polytope? finite cells are the case this
// generator handles. for a 2D tiling the cell is a single polygon, always finite.
export function hasFiniteCell(symbol: number[]): boolean {
  const cell = symbol.slice(0, -1)
  if (cell.length <= 1) {
    return true
  }

  return classifyGeometry(cell) === 'spherical'
}

// the rotation (as cos and sin) that brings the central cell upright, from its recentered ball vertices
function orientation(
  ballVertices: Vec[],
  p: number,
  orientUp: boolean,
): { cos: number; sin: number } {
  if (!orientUp) {
    return { cos: 1, sin: 0 }
  }

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
  for (const x of v) {
    s += x * x
  }

  return Math.sqrt(s)
}

function pairKey(a: number[], b: number[]): string {
  const ka = a.map(x => Math.round(x * 1e4)).join(',')
  const kb = b.map(x => Math.round(x * 1e4)).join(',')

  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}
