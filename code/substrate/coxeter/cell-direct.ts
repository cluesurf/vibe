// Cell-direct Coxeter engine. Builds the {p,q,r} CELL graph directly (cells = vibes, with their true
// facet-adjacency), with no chamber overhead and no O(n^2) distance scan. The cell graph is the orbit of
// the cell center under the group, and a cell's neighbors are reached by the 12 (in general, facet-many)
// FACE reflections, the H_cell-conjugates of the outer generator. This is the scalable shape, O(facet*n).
//
// Step 1 is in plain floating point, to VERIFY the construction against the chamber engine (same cell
// counts, same facet degree). Step 2 (a separate build) swaps in double-double arithmetic to pass the
// float precision wall (~15.5k cells) toward a million.
//
// Background: a cell center c0 is fixed by the cell-stabilizer (the first symbol.length-1 generators).
// The outer generator moves it to a neighbor. Conjugating that move by the cell stabilizer gives all
// facet neighbors. Tracking each cell by a group-element matrix g, its center is g*c0 and its neighbors
// are g*F_i for the precomputed face reflections F_i.

import { mirrorFrame } from '~/substrate/coxeter/schlafli'

type Mat = number[][]
type Vec = number[]

function innerJ(x: Vec, y: Vec, metric: number[]): number {
  let s = 0
  for (let a = 0; a < x.length; a++) s += (metric[a] ?? 1) * (x[a] ?? 0) * (y[a] ?? 0)
  return s
}

function matMul(a: Mat, b: Mat): Mat {
  const n = a.length
  const out: Mat = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) {
    const aik = a[i]![k]!
    if (aik === 0) continue
    for (let j = 0; j < n; j++) out[i]![j]! += aik * b[k]![j]!
  }
  return out
}

function matVec(a: Mat, x: Vec): Vec {
  const n = a.length
  const out: Vec = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let j = 0; j < n; j++) s += a[i]![j]! * (x[j] ?? 0)
    out[i] = s
  }
  return out
}

function identity(n: number): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
}

// reflection matrix across a J-unit normal: M[a][b] = delta_ab - 2 n_a (J_b n_b)
function reflectionMatrix(normal: Vec, metric: number[]): Mat {
  const n = normal.length
  const out: Mat = identity(n)
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    out[a]![b]! -= 2 * normal[a]! * (metric[b] ?? 1) * normal[b]!
  }
  return out
}

function determinant(a: Mat): number {
  const n = a.length
  if (n === 0) return 1
  const m = a.map((row) => row.slice())
  let det = 1
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r]![col]!) > Math.abs(m[pivot]![col]!)) pivot = r
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

function normalizeTimelike(x: Vec, metric: number[], timeAxis: number): Vec {
  const norm = innerJ(x, x, metric)
  const scale = 1 / Math.sqrt(Math.abs(norm))
  const out = x.map((v) => v * scale)
  if ((out[timeAxis] ?? 0) < 0) for (let a = 0; a < out.length; a++) out[a] = -(out[a] ?? 0)
  return out
}

function cellCenter(normals: Mat, metric: number[], cellMirrors: number, timeAxis: number): Vec {
  const m = metric.length
  const rows: Mat = []
  for (let i = 0; i < cellMirrors; i++) rows.push(normals[i]!.map((val, a) => (metric[a] ?? 1) * val))
  const c: Vec = new Array<number>(m).fill(0)
  for (let j = 0; j < m; j++) {
    const sub = rows.map((row) => row.filter((_, col) => col !== j))
    c[j] = (j % 2 === 0 ? 1 : -1) * determinant(sub)
  }
  return normalizeTimelike(c, metric, timeAxis)
}

function toPoincare(x: Vec, timeAxis: number): Vec {
  const time = x[timeAxis] ?? 1
  const out: Vec = []
  for (let a = 0; a < x.length; a++) if (a !== timeAxis) out.push((x[a] ?? 0) / (1 + time))
  return out
}

const keyOf = (p: Vec): string => p.map((v) => Math.round(v * 1e6) / 1e6).join(',')

export interface CellGraph {
  readonly symbol: number[]
  readonly cellCount: number
  readonly facetCount: number
  readonly neighbors: number[][]
  readonly coords: number[][]
  readonly hit: boolean // true if the build stopped at maxCells (more cells exist)
}

export function buildCellGraph(input: { symbol: number[]; maxCells?: number }): CellGraph {
  const symbol = input.symbol
  const maxCells = input.maxCells ?? 20000
  const { normals, metric, timeAxis } = mirrorFrame(symbol)
  const dim = metric.length
  const cellMirrors = symbol.length // generators that FIX the cell center

  // generator reflection matrices
  const R: Mat[] = normals.map((nrm) => reflectionMatrix(nrm, metric))

  // enumerate the cell stabilizer H = <R[0..cellMirrors-1]> (a finite group), by BFS over matrices
  const stab: Mat[] = [identity(dim)]
  const stabSeen = new Set<string>([keyOf(stab[0]!.flat())])
  for (let head = 0; head < stab.length; head++) {
    for (let i = 0; i < cellMirrors; i++) {
      const g = matMul(R[i]!, stab[head]!)
      const k = keyOf(g.flat())
      if (!stabSeen.has(k)) {
        stabSeen.add(k)
        stab.push(g)
      }
    }
    if (stab.length > 100000) break // safety
  }

  // the facet (outer) generator's normal, and the facet normals = H-orbit of it
  const outerNormal = normals[normals.length - 1]!
  const faceNormals: Vec[] = []
  const faceSeen = new Set<string>()
  for (const h of stab) {
    const fn = matVec(h, outerNormal)
    const k = keyOf(fn)
    if (!faceSeen.has(k)) {
      faceSeen.add(k)
      faceNormals.push(fn)
    }
  }
  const F: Mat[] = faceNormals.map((fn) => reflectionMatrix(fn, metric))

  const c0 = cellCenter(normals, metric, cellMirrors, timeAxis)

  // BFS the cell graph: each cell tracked by a group-element matrix g (center = g*c0), neighbors = g*F_i
  const cellMat: Mat[] = [identity(dim)]
  const cellCoord: Vec[] = [toPoincare(c0, timeAxis)]
  const cellKey = new Map<string, number>([[keyOf(cellCoord[0]!), 0]])
  const neighbors: number[][] = [[]]
  let hit = false
  for (let head = 0; head < cellMat.length; head++) {
    const g = cellMat[head]!
    for (const f of F) {
      const gp = matMul(g, f)
      const center = matVec(gp, c0)
      const coord = toPoincare(center, timeAxis)
      const k = keyOf(coord)
      let id = cellKey.get(k)
      if (id === undefined) {
        if (cellMat.length >= maxCells) {
          hit = true
          continue
        }
        id = cellMat.length
        cellKey.set(k, id)
        cellMat.push(gp)
        cellCoord.push(coord)
        neighbors.push([])
      }
      if (id !== head && !neighbors[head]!.includes(id)) {
        neighbors[head]!.push(id)
        neighbors[id]!.push(head)
      }
    }
    if (hit) break
  }

  let facetCount = 0
  for (const nb of neighbors) facetCount = Math.max(facetCount, nb.length)

  return {
    symbol,
    cellCount: cellMat.length,
    facetCount,
    neighbors,
    coords: cellCoord,
    hit,
  }
}
