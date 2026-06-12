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
  // faceNeighbor[cell][fi] = the neighbour reached through face fi (a fixed generator in the H-orbit of
  // the outer generator), or -1 if that face landed outside the built patch. The face index fi is a
  // consistent "direction type" across cells (the same local generator), which is what a
  // generator-indexed addressing / neighbour automaton needs. Present for buildCellGraph only.
  readonly faceNeighbor?: number[][]
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
  const faceNeighbor: number[][] = [new Array<number>(F.length).fill(-1)]
  let hit = false
  for (let head = 0; head < cellMat.length; head++) {
    const g = cellMat[head]!
    for (let fi = 0; fi < F.length; fi++) {
      const gp = matMul(g, F[fi]!)
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
        faceNeighbor.push(new Array<number>(F.length).fill(-1))
      }
      faceNeighbor[head]![fi] = id
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
    faceNeighbor,
  }
}

// FLAT (Euclidean) honeycomb builder. The cell-direct builder above is HYPERBOLIC-only, it projects a
// Lorentzian space to the Poincare ball, so a EUCLIDEAN (affine) honeycomb stalls (its cell center is an ideal
// point, the BFS finds 1 cell). Euclidean regular honeycombs are flat LATTICES, built directly here, so they
// can be compared on equal footing (same observables) with the hyperbolic ones. Verified flat by POLYNOMIAL
// (not exponential) shell growth. Supported, the 4D Euclidean regulars and their lower-D analogues,
//   {3,4,3,3} = D4 lattice (24-cell honeycomb, degree 24, the FLAT D4, dual-compare to the hyperbolic {3,4,3,4})
//   {3,3,4,3} = D4 lattice (16-cell honeycomb, the dual, degree 24)
//   {4,3,3,4} = Z^4 tesseractic (degree 8) ; {4,3,4} = Z^3 cubic (degree 6) ; {4,4} = Z^2 square (degree 4)
//   {3,6} / {6,3} = triangular / hexagonal (degree 3 / 6) ; {3,3,4,3,3}-Euclidean families fall through to Z^n
export function buildEuclideanLattice(input: { symbol: number[]; maxCells?: number }): CellGraph {
  const symbol = input.symbol
  const maxCells = input.maxCells ?? 20000
  const key = symbol.join(',')
  // pick the lattice and neighbour offsets for the named Euclidean honeycomb
  let dim: number
  let offsets: number[][]
  let onLattice: (p: number[]) => boolean = () => true
  const axes = (d: number): number[][] => { const o: number[][] = []; for (let i = 0; i < d; i++) for (const s of [1, -1]) { const v = new Array<number>(d).fill(0); v[i] = s; o.push(v) } return o }
  const dRoots = (d: number): number[][] => { const o: number[][] = []; for (let i = 0; i < d; i++) for (let j = i + 1; j < d; j++) for (const si of [1, -1]) for (const sj of [1, -1]) { const v = new Array<number>(d).fill(0); v[i] = si; v[j] = sj; o.push(v) } return o }
  if (key === '3,4,3,3' || key === '3,3,4,3') { dim = 4; offsets = dRoots(4); onLattice = (p) => (p.reduce((s, x) => s + x, 0) % 2 === 0) } // D4
  else if (key === '4,3,3,4') { dim = 4; offsets = axes(4) } // Z^4
  else if (key === '4,3,4') { dim = 3; offsets = axes(3) } // Z^3 cubic
  else if (key === '4,4') { dim = 2; offsets = axes(2) } // Z^2 square
  else if (key === '3,6' || key === '6,3') { dim = 2; offsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]] } // triangular A2
  else { dim = symbol.length; offsets = axes(symbol.length) } // fallback, Z^n
  // BFS a box patch from the origin on the (sub)lattice
  const start = new Array<number>(dim).fill(0)
  const kOf = (p: number[]): string => p.join(',')
  const idOf = new Map<string, number>([[kOf(start), 0]])
  const coords: number[][] = [start]
  const neighbors: number[][] = [[]]
  for (let head = 0; head < coords.length; head++) {
    const p = coords[head]!
    for (const o of offsets) {
      const q = p.map((x, i) => x + o[i]!)
      if (!onLattice(q)) continue
      const k = kOf(q)
      let id = idOf.get(k)
      if (id === undefined) {
        if (coords.length >= maxCells) continue
        id = coords.length; idOf.set(k, id); coords.push(q); neighbors.push([])
      }
      if (id !== head && !neighbors[head]!.includes(id)) { neighbors[head]!.push(id); neighbors[id]!.push(head) }
    }
  }
  let facetCount = 0
  for (const nb of neighbors) facetCount = Math.max(facetCount, nb.length)
  return { symbol, cellCount: coords.length, facetCount, neighbors, coords, hit: coords.length >= maxCells }
}

// Extract a HOROSPHERE patch from a hyperbolic honeycomb, the natural FLAT (Euclidean) sheet inside the
// curved crystal. Because {5,3,4} is COCOMPACT (no parabolic elements, no cusps), a horosphere is NOT a
// reflection subgroup, it is a flat SURFACE the cells cross aperiodically. We pick an ideal point xi on
// the boundary at infinity (the direction of the farthest cell), compute the Busemann function toward xi
// (whose level sets ARE the horospheres), and keep the cells in a thin band around one level. The induced
// subgraph is a flat 2D sheet, verified by its POLYNOMIAL (not exponential) growth.
export interface HorospherePatch {
  readonly cellCount: number
  readonly neighbors: number[][] // induced adjacency among band cells (reindexed)
  readonly coords: number[][]
  readonly busemann: number[]
  readonly idealPoint: number[]
}

export function buildHorosphere(input: { symbol?: number[]; maxCells?: number; bandHalfWidth?: number; level?: number }): HorospherePatch {
  const symbol = input.symbol ?? [5, 3, 4]
  const g = buildCellGraph({ symbol, maxCells: input.maxCells ?? 12000 })
  const coords = g.coords
  const n = g.cellCount
  const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))

  // ideal point xi = direction of the farthest cell (closest to the boundary), projected to the sphere
  let far = 0
  let fr = -1
  for (let i = 0; i < n; i++) {
    const r = norm(coords[i]!)
    if (r > fr) {
      fr = r
      far = i
    }
  }
  const fc = coords[far]!
  const fn = norm(fc)
  const xi = fc.map((v) => v / fn)

  // Busemann function b(x) = log( |x - xi|^2 / (1 - |x|^2) ), level sets are the horospheres tangent at xi
  const bus: number[] = coords.map((x) => {
    let d2 = 0
    for (let k = 0; k < x.length; k++) d2 += (x[k]! - xi[k]!) ** 2
    const r2 = x.reduce((s, v) => s + v * v, 0)
    return Math.log(d2 / Math.max(1e-12, 1 - r2))
  })

  const level = input.level ?? 0 // the horosphere through the origin
  const half = input.bandHalfWidth ?? 0.3
  const inBand: number[] = []
  const reindex = new Int32Array(n).fill(-1)
  for (let i = 0; i < n; i++) if (Math.abs(bus[i]! - level) < half) {
    reindex[i] = inBand.length
    inBand.push(i)
  }
  const neighbors: number[][] = inBand.map(() => [])
  for (let a = 0; a < inBand.length; a++) {
    for (const w of g.neighbors[inBand[a]!]!) {
      const b = reindex[w]!
      if (b >= 0) neighbors[a]!.push(b)
    }
  }
  return {
    cellCount: inBand.length,
    neighbors,
    coords: inBand.map((i) => coords[i]!),
    busemann: inBand.map((i) => bus[i]!),
    idealPoint: xi,
  }
}

// TARGETED horosphere generator, a Busemann-pruned BFS that grows ONLY the horosphere band slab, so the
// whole cell budget goes to the flat slice instead of the exponential bulk (O(band), not O(bulk)). It picks
// an ideal point xi up front (a deep walk along one facet), then BFS from the origin expanding only cells
// within (half + margin) of the Busemann level 0, dropping everything outside the slab. Returns the slab
// graph (run the dynamics on it) plus the Busemann value per cell (filter |b| < half for the band) and xi
// (for the 2D projection). Reaches far more band cells than slicing a full bulk of the same size. See
// note/research/vibe/notes/horosphere-extraction-algorithms.md and the WebGPU plan.
export function buildHorosphereBand(input: { symbol?: number[]; maxBand?: number; half?: number; margin?: number }): {
  cellCount: number
  bandCount: number
  neighbors: number[][]
  coords: Vec[]
  busemann: number[]
  idealPoint: Vec
} {
  const symbol = input.symbol ?? [5, 3, 4]
  const maxBand = input.maxBand ?? 100000
  const half = input.half ?? 0.5
  const margin = input.margin ?? 0.6
  const { normals, metric, timeAxis } = mirrorFrame(symbol)
  const dim = metric.length
  const cellMirrors = symbol.length

  const R: Mat[] = normals.map((nrm) => reflectionMatrix(nrm, metric))
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
    if (stab.length > 100000) break
  }
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

  const norm = (v: Vec): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  // the ideal point, a deep walk along one facet direction, normalized to the boundary
  let gw = identity(dim)
  for (let i = 0; i < 40; i++) gw = matMul(gw, F[0]!)
  const xc = toPoincare(matVec(gw, c0), timeAxis)
  const xn = norm(xc) || 1
  const xi = xc.map((v) => v / xn)
  const busOf = (coord: Vec): number => {
    let d2 = 0
    for (let k = 0; k < coord.length; k++) d2 += (coord[k]! - xi[k]!) ** 2
    return Math.log(d2 / Math.max(1e-12, 1 - coord.reduce((s, v) => s + v * v, 0)))
  }
  const expandLimit = half + margin

  const c0coord = toPoincare(c0, timeAxis)
  const cellMat: Mat[] = [identity(dim)]
  const cellCoord: Vec[] = [c0coord]
  const cellBus: number[] = [busOf(c0coord)]
  const cellKey = new Map<string, number>([[keyOf(c0coord), 0]])
  const neighbors: number[][] = [[]]
  let bandCount = Math.abs(cellBus[0]!) < half ? 1 : 0

  for (let head = 0; head < cellMat.length; head++) {
    if (Math.abs(cellBus[head]!) >= expandLimit) continue // pruned, outside the slab, do not expand
    const g = cellMat[head]!
    for (const f of F) {
      const gp = matMul(g, f)
      const coord = toPoincare(matVec(gp, c0), timeAxis)
      const b = busOf(coord)
      if (Math.abs(b) >= expandLimit) continue // drop cells outside the slab entirely
      const k = keyOf(coord)
      let id = cellKey.get(k)
      if (id === undefined) {
        id = cellMat.length
        cellKey.set(k, id)
        cellMat.push(gp)
        cellCoord.push(coord)
        cellBus.push(b)
        neighbors.push([])
        if (Math.abs(b) < half) bandCount++
      }
      if (id !== head && !neighbors[head]!.includes(id)) {
        neighbors[head]!.push(id)
        neighbors[id]!.push(head)
      }
    }
    if (bandCount >= maxBand) break
  }

  return { cellCount: cellMat.length, bandCount, neighbors, coords: cellCoord, busemann: cellBus, idealPoint: xi }
}
