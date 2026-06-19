// The general Coxeter engine. Given any Schlafli symbol {p, q} or {p, q, r}, it builds the
// real tiling by reflecting the fundamental chamber across the mirrors in the model space
// (spherical, Euclidean, or hyperbolic, set by the Gram signature), dedupes coincident
// chambers so the mesh is whole (the cousin links appear automatically), collects the
// distinct cell centers, and reads off the FULL facet-adjacency by minimal cell-to-cell
// distance. This replaces the spanning-tree generators: a {7,3} cell comes out with its true
// 7 neighbors, the dodecagrid {5,3,4} with its true 12. Coordinates are the Poincare-ball
// projection, ready to draw.
//
// Method: a chamber is one copy of the fundamental simplex, tracked by two points it carries,
// a generic interior point (to tell chambers apart) and its cell center. Reflecting a chamber
// across mirror i reflects both points across that fixed mirror, so the whole orbit is grown
// by point reflections alone, no matrices. Distinct chambers that land on the same cell center
// are the cell's stabilizer, so the cell centers dedupe to the cells.

import {
  mirrorFrame,
  classifyGeometry,
  type Geometry,
} from '@/code/substrate/coxeter/schlafli'

function innerJ(x: number[], y: number[], metric: number[]): number {
  let s = 0
  for (let a = 0; a < x.length; a++)
    s += (metric[a] ?? 1) * (x[a] ?? 0) * (y[a] ?? 0)
  return s
}

function reflect(
  x: number[],
  normal: number[],
  metric: number[],
): number[] {
  const d = 2 * innerJ(x, normal, metric)
  return x.map((xa, a) => xa - d * (normal[a] ?? 0))
}

function determinant(a: number[][]): number {
  const n = a.length
  if (n === 0) return 1
  const m = a.map(row => row.slice())
  let det = 1
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r]![col]!) > Math.abs(m[pivot]![col]!)) pivot = r
    }
    if (Math.abs(m[pivot]![col]!) < 1e-15) return 0
    if (pivot !== col) {
      const tmp = m[pivot]!
      m[pivot] = m[col]!
      m[col] = tmp
      det = -det
    }
    det *= m[col]![col]!
    for (let r = col + 1; r < n; r++) {
      const f = m[r]![col]! / m[col]![col]!
      for (let c = col; c < n; c++) m[r]![c]! -= f * m[col]![c]!
    }
  }
  return det
}

function normalizeTimelike(
  x: number[],
  metric: number[],
  timeAxis: number,
): number[] {
  const norm = innerJ(x, x, metric)
  const scale = 1 / Math.sqrt(Math.abs(norm))
  const out = x.map(v => v * scale)
  if ((out[timeAxis] ?? 0) < 0)
    for (let a = 0; a < out.length; a++) out[a] = -(out[a] ?? 0)
  return out
}

// The cell center: J-orthogonal to the first k mirror normals (the cell uses all mirrors but
// the last), as the cofactor null vector, normalized to a future-pointing unit-timelike point.
function cellCenter(input: {
  normals: number[][]
  metric: number[]
  cellMirrors: number
  timeAxis: number
}): number[] {
  const { normals, metric, cellMirrors, timeAxis } = input
  const m = metric.length
  const rows: number[][] = []
  for (let i = 0; i < cellMirrors; i++) {
    rows.push(normals[i]!.map((val, a) => (metric[a] ?? 1) * val))
  }
  const c: number[] = new Array<number>(m).fill(0)
  for (let j = 0; j < m; j++) {
    const sub = rows.map(row => row.filter((_, col) => col !== j))
    c[j] = (j % 2 === 0 ? 1 : -1) * determinant(sub)
  }
  return normalizeTimelike(c, metric, timeAxis)
}

function toPoincare(x: number[], timeAxis: number): number[] {
  const time = x[timeAxis] ?? 1
  const out: number[] = []
  for (let a = 0; a < x.length; a++) {
    if (a === timeAxis) continue
    out.push((x[a] ?? 0) / (1 + time))
  }
  return out
}

export interface CoxeterMesh {
  readonly form: 'coxeter-mesh'
  readonly symbol: number[]
  readonly geometry: Geometry
  readonly cellCount: number
  readonly facetCount: number // the mature (interior) cell degree
  readonly neighbors: number[][] // full facet-adjacency
  readonly coords: number[][] // Poincare-ball coordinates (2D for {p,q}, 3D for {p,q,r})
  readonly generation: number[] // graph distance from the seed cell, by face-adjacency
}

// Build the mesh for a Schlafli symbol. depth bounds the chamber reflection generations,
// maxChambers caps the work. Returns the full facet-adjacency and Poincare coordinates.
export function buildCoxeterMesh(input: {
  symbol: number[]
  depth?: number
  maxChambers?: number
}): CoxeterMesh {
  const symbol = input.symbol
  const depth = input.depth ?? 12
  const maxChambers = input.maxChambers ?? 40000
  const geometry = classifyGeometry(symbol)
  const { normals, metric, timeAxis } = mirrorFrame(symbol)
  const m = metric.length
  const cellMirrors = symbol.length

  const c0 = cellCenter({ normals, metric, cellMirrors, timeAxis })
  // a generic interior point, off every mirror, so distinct chambers get distinct images
  const offset = new Array<number>(m).fill(0)
  for (let i = 0; i < m; i++)
    for (let a = 0; a < m; a++)
      offset[a]! += (i + 1) * (normals[i]![a] ?? 0)
  const g0 = normalizeTimelike(
    c0.map((v, a) => v + 0.13 * (offset[a] ?? 0)),
    metric,
    timeAxis,
  )

  const round = (p: number[]): string =>
    p.map(v => Math.round(v * 1e6) / 1e6).join(',')

  // BFS over chambers. Each chamber carries (generic point, cell center). Dedup by generic.
  const cellId = new Map<string, number>()
  const cellCenters: number[][] = []
  const cellCoords: number[][] = []
  const registerCell = (cc: number[]): number => {
    const key = round(toPoincare(cc, timeAxis))
    const found = cellId.get(key)
    if (found !== undefined) return found
    const id = cellCenters.length
    cellId.set(key, id)
    cellCenters.push(cc)
    cellCoords.push(toPoincare(cc, timeAxis))
    return id
  }

  const seenChamber = new Set<string>([round(toPoincare(g0, timeAxis))])
  registerCell(c0)
  let frontier: { g: number[]; cc: number[] }[] = [{ g: g0, cc: c0 }]
  let gen = 0
  let chamberCount = 1
  while (
    frontier.length > 0 &&
    gen < depth &&
    chamberCount < maxChambers
  ) {
    gen++
    const next: { g: number[]; cc: number[] }[] = []
    for (const ch of frontier) {
      for (let i = 0; i < m; i++) {
        const g = reflect(ch.g, normals[i]!, metric)
        const key = round(toPoincare(g, timeAxis))
        if (seenChamber.has(key)) continue
        seenChamber.add(key)
        const cc = reflect(ch.cc, normals[i]!, metric)
        registerCell(cc)
        next.push({ g, cc })
        chamberCount++
        if (chamberCount >= maxChambers) break
      }
      if (chamberCount >= maxChambers) break
    }
    frontier = next
  }

  // Full facet-adjacency by minimal cell-to-cell distance. cosh(distance) = -<x,y>_J.
  const n = cellCenters.length
  const cdist = (a: number, b: number): number =>
    -innerJ(cellCenters[a]!, cellCenters[b]!, metric)
  let minCosh = Infinity
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const c = cdist(a, b)
      if (c > 1.0000001 && c < minCosh) minCosh = c
    }
  }
  const cut = minCosh * 1.02
  const neighbors: number[][] = Array.from({ length: n }, () => [])
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (cdist(a, b) <= cut) {
        neighbors[a]!.push(b)
        neighbors[b]!.push(a)
      }
    }
  }

  let facetCount = 0
  for (const nb of neighbors)
    facetCount = Math.max(facetCount, nb.length)

  // generation = face-adjacency BFS distance from the seed cell (cell 0)
  const generation = new Array<number>(n).fill(-1)
  generation[0] = 0
  let ring = [0]
  while (ring.length > 0) {
    const nx: number[] = []
    for (const v of ring) {
      for (const w of neighbors[v]!) {
        if (generation[w] === -1) {
          generation[w] = (generation[v] ?? 0) + 1
          nx.push(w)
        }
      }
    }
    ring = nx
  }

  return {
    form: 'coxeter-mesh',
    symbol,
    geometry,
    cellCount: n,
    facetCount,
    neighbors,
    coords: cellCoords,
    generation,
  }
}
