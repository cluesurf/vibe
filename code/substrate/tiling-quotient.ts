// CLOSED QUOTIENTS of the lab tilings : finite cell graphs with
// no boundary, so a reversible rule's global map is a permutation of a finite set and every orbit is periodic. A cell is
// a tile, and two cells are neighbours when their tiles share an edge (a facet, in 4D).
//
// THE PIECES, all exact integers (residues, never floats):
//
// - `DartMap` and `analyzeMap`: an oriented closed surface as darts (a dart is one side of one edge, read inside one
//   face), with `faceNext` (the next dart around the same face, counterclockwise) and `edgeMate` (the dart of the same
//   edge in the face across it). Faces are the orbits of faceNext, edges the orbits of edgeMate, vertices the orbits of
//   d -> edgeMate(faceNext^-1 d). Everything a gate needs is COUNTED as orbits: V, E, F, the Euler characteristic
//   V - E + F, the genus, every face length, every vertex degree, and the cell graph (face -> the faces across its
//   sides, in side order).
// - `rotaryMap`: a regular map of type {p,q} from a finite group G = <x, y> with x^p = y^q = (xy)^2 = 1 (a quotient of
//   the rotation triangle group (2,p,q)). Darts are the elements g, faceNext g = g x, edgeMate g = g x y. G is searched
//   in PGL(2, m) for small primes m (2 x 2 matrices over F_m modulo scalars), ascending m, keeping the smallest group
//   whose cell graph is simple. Klein's quartic {7,3} (PSL(2,7), 24 heptagons, genus 3) and Bring's surface {5,4}
//   (PGL(2,5) = S5, 24 pentagons, genus 4) come out of this search.
// - `squareTorus`, `triangleTorus`, `hexagonTorus`: flat tori from integer vertex cycles (`mapFromFaces`), the
//   degree-matched flat partners of equal cell count.
// - `ballSystole`: the largest r for which EVERY r-ball of the quotient equals the infinite tiling's r-ball. The tiling
//   covers the quotient (a closed map with all faces p-gons and all vertices of degree q has the {p,q} tiling as its
//   universal cover), so the cover restricted to a ball is a surjective graph map onto the quotient's ball; equal cell
//   counts make it a bijection and equal induced edge counts an isomorphism. This is the quotient's "systole" in the
//   sense of quotient-3434.ts (the radius to which it looks like the tiling, an injectivity radius r), not the length
//   of its shortest loop. The loop systole L (the shortest closed walk of the cell graph that does not lift to a closed
//   walk of the tiling) follows from the first radius that fails: L is 2r + 2 when some (r + 1)-ball has fewer cells
//   than the tiling's (two tiles at distance r + 1 from a centre fold onto one cell), and 2r + 3 when every (r + 1)-ball
//   has all its cells but an extra edge. The quotient's distance from a cell equals
//   the cover distance for every cover distance up to L / 2, and only past it can the two differ.
// - `honeycombQuotient3434`: the {3,4,3,4} congruence quotient K mod (sqrt 2)^m (congruence-3434.ts) under a size cap,
//   with its open Euler characteristic -E + F - C3 + C4 counted by union-find over (dock, edge) and (dock, triangle)
//   incidences (the 24 vertices of the 24-cell are ideal, so they are not part of the manifold).
// - `d4Torus`: the flat D4 honeycomb {3,4,3,3} torus, the degree-24 partner of the {3,4,3,4} quotient.
// - `closedQuotients`: the catalog the M1 harness takes.
//
// NOTHING MOVES: this file builds tables and counts.

import {
  buildCellGraph,
  buildEuclideanLattice,
} from '@/code/substrate/coxeter/cell-direct'
import {
  cuspIncidence,
  enumerateFrames,
  frameSystole,
  graphGates,
} from '@/code/substrate/coxeter/congruence-3434'
import { exactCell } from '@/code/substrate/coxeter/exact-3434'
import { EXACT_SHELLS } from '@/code/substrate/coxeter/quotient-3434'
import { buildD4Torus } from '@/code/substrate/d4-torus'
import { greedyEdgeColoring, toCsr } from '@/code/tool/graph'

// ---- oriented surfaces as darts ----

export type DartMap = {
  // faceNext[d]: the next dart counterclockwise around d's face
  readonly faceNext: Int32Array
  // edgeMate[d]: the dart of d's edge inside the neighbouring face (a fixed-point-free involution)
  readonly edgeMate: Int32Array
}

export type SurfaceGates = {
  // faceNext is a permutation of the darts
  readonly facePermutation: boolean
  // edgeMate is an involution without fixed points
  readonly edgeInvolution: boolean
  // every face has exactly p sides
  readonly faceLengthP: boolean
  // every vertex has exactly q faces around it
  readonly vertexDegreeQ: boolean
  // every cell has p distinct neighbours, none of them itself
  readonly simpleCellGraph: boolean
  // the cell graph is connected
  readonly connected: boolean
}

export type SurfaceAnalysis = {
  readonly p: number
  readonly q: number
  readonly darts: number
  readonly faces: number
  readonly edges: number
  readonly vertices: number
  // V - E + F
  readonly euler: number
  // (2 - euler) / 2 for an orientable closed surface
  readonly genus: number
  // the cell graph: neighbours[f][k] is the face across side k of f (side 0 is the face's first dart)
  readonly neighbors: number[][]
  readonly gates: SurfaceGates
}

function orbits(next: (d: number) => number, n: number): Int32Array {
  const orbit = new Int32Array(n).fill(-1)

  let count = 0

  for (let d = 0; d < n; d++) {
    if (orbit[d]! >= 0) {
      continue
    }

    let e = d

    while (orbit[e]! < 0) {
      orbit[e] = count
      e = next(e)
    }

    count++
  }

  return orbit
}

function orbitSizes(orbit: Int32Array): number[] {
  const sizes: number[] = []

  for (const o of orbit) {
    sizes[o] = (sizes[o] ?? 0) + 1
  }

  return sizes
}

export function analyzeMap(map: DartMap, p: number, q: number): SurfaceAnalysis {
  const n = map.faceNext.length
  const faceInverse = new Int32Array(n).fill(-1)

  let facePermutation = map.edgeMate.length === n

  for (let d = 0; d < n; d++) {
    const e = map.faceNext[d]!

    facePermutation &&= e >= 0 && e < n && faceInverse[e] === -1
    faceInverse[e] = d
  }

  let edgeInvolution = facePermutation

  for (let d = 0; d < n && edgeInvolution; d++) {
    const e = map.edgeMate[d]!

    edgeInvolution = e >= 0 && e < n && e !== d && map.edgeMate[e] === d
  }

  if (!facePermutation || !edgeInvolution) {
    return {
      p,
      q,
      darts: n,
      faces: 0,
      edges: 0,
      vertices: 0,
      euler: 0,
      genus: 0,
      neighbors: [],
      gates: {
        facePermutation,
        edgeInvolution,
        faceLengthP: false,
        vertexDegreeQ: false,
        simpleCellGraph: false,
        connected: false,
      },
    }
  }

  const faceOf = orbits(d => map.faceNext[d]!, n)
  const vertexOf = orbits(d => map.edgeMate[faceInverse[d]!]!, n)
  const faceSizes = orbitSizes(faceOf)
  const vertexSizes = orbitSizes(vertexOf)
  const faces = faceSizes.length
  const vertices = vertexSizes.length
  const edges = n / 2
  const euler = vertices - edges + faces

  // the cell graph in side order, from each face's first dart
  const first = new Int32Array(faces).fill(-1)

  for (let d = 0; d < n; d++) {
    if (first[faceOf[d]!]! < 0) {
      first[faceOf[d]!] = d
    }
  }

  const neighbors: number[][] = []

  for (let f = 0; f < faces; f++) {
    const row: number[] = []

    let d = first[f]!

    do {
      row.push(faceOf[map.edgeMate[d]!]!)
      d = map.faceNext[d]!
    } while (d !== first[f])

    neighbors.push(row)
  }

  const simpleCellGraph = neighbors.every(
    (row, f) => row.length === p && new Set(row).size === p && !row.includes(f),
  )

  return {
    p,
    q,
    darts: n,
    faces,
    edges,
    vertices,
    euler,
    genus: (2 - euler) / 2,
    neighbors,
    gates: {
      facePermutation,
      edgeInvolution,
      faceLengthP: faceSizes.every(s => s === p),
      vertexDegreeQ: vertexSizes.every(s => s === q),
      simpleCellGraph,
      connected: isConnected(neighbors),
    },
  }
}

function isConnected(neighbors: readonly (readonly number[])[]): boolean {
  if (neighbors.length === 0) {
    return false
  }

  const seen = new Uint8Array(neighbors.length)
  const queue = [0]

  seen[0] = 1

  // for-of over an array visits the elements pushed during the loop, so this is a breadth-first walk
  for (const x of queue) {
    for (const y of neighbors[x]!) {
      if (!seen[y]) {
        seen[y] = 1
        queue.push(y)
      }
    }
  }

  return queue.length === neighbors.length
}

// A dart map from faces given as counterclockwise vertex cycles. Dart (f, k) runs from vertex k to vertex k + 1 of
// face f, and its mate is the dart running back. Orientable and consistently oriented exactly when every directed
// vertex pair occurs once and its reverse once (gates).
export function mapFromFaces(faceVertices: readonly (readonly number[])[]): {
  map: DartMap
  gates: { directedOnce: boolean; reverseFound: boolean }
} {
  let span = 1

  for (const face of faceVertices) {
    for (const v of face) {
      span = Math.max(span, v + 1)
    }
  }

  const dartOf = new Map<number, number>()
  const from: number[] = []
  const to: number[] = []
  const faceNext: number[] = []

  let directedOnce = true

  for (const face of faceVertices) {
    const start = from.length

    face.forEach((v, k) => {
      const w = face[(k + 1) % face.length]!
      const key = v * span + w

      directedOnce &&= !dartOf.has(key)
      dartOf.set(key, from.length)
      from.push(v)
      to.push(w)
      faceNext.push(k + 1 === face.length ? start : from.length)
    })
  }

  let reverseFound = true

  const edgeMate = from.map((v, d) => {
    const mate = dartOf.get(to[d]! * span + v)

    reverseFound &&= mate !== undefined

    return mate ?? d
  })

  return {
    map: { faceNext: Int32Array.from(faceNext), edgeMate: Int32Array.from(edgeMate) },
    gates: { directedOnce, reverseFound },
  }
}

// ---- PGL(2, m): 2 x 2 matrices over F_m modulo scalars, packed ((a m + b) m + c) m + d, first nonzero entry 1 ----

function inverses(m: number): Int32Array {
  const inv = new Int32Array(m)

  for (let a = 1; a < m; a++) {
    for (let b = 1; b < m; b++) {
      if ((a * b) % m === 1) {
        inv[a] = b
      }
    }
  }

  return inv
}

export type ProjectiveGroup = {
  readonly modulus: number
  // every element, ascending by packed key
  readonly elements: number[]
  readonly identity: number
  multiply(g: number, h: number): number
  order(g: number): number
  // the four entries of g, normalized
  entries(g: number): [number, number, number, number]
}

export function projectiveGroup(m: number): ProjectiveGroup {
  const inv = inverses(m)
  const pack = (a: number, b: number, c: number, d: number): number => ((a * m + b) * m + c) * m + d

  const normalize = (a: number, b: number, c: number, d: number): number => {
    const lead = a !== 0 ? a : b !== 0 ? b : c !== 0 ? c : d
    const s = inv[lead]!

    return pack((a * s) % m, (b * s) % m, (c * s) % m, (d * s) % m)
  }

  const entries = (g: number): [number, number, number, number] => {
    const d = g % m
    const c = Math.floor(g / m) % m
    const b = Math.floor(g / (m * m)) % m
    const a = Math.floor(g / (m * m * m))

    return [a, b, c, d]
  }

  const multiply = (g: number, h: number): number => {
    const [a, b, c, d] = entries(g)
    const [e, f, k, l] = entries(h)

    return normalize((a * e + b * k) % m, (a * f + b * l) % m, (c * e + d * k) % m, (c * f + d * l) % m)
  }

  const identity = pack(1, 0, 0, 1)
  const elements: number[] = []

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      for (let c = 0; c < m; c++) {
        for (let d = 0; d < m; d++) {
          const lead = a !== 0 ? a : b !== 0 ? b : c !== 0 ? c : d

          if (lead === 1 && (a * d - b * c) % m !== 0) {
            elements.push(pack(a, b, c, d))
          }
        }
      }
    }
  }

  const order = (g: number): number => {
    let h = g
    let k = 1

    while (h !== identity) {
      h = multiply(h, g)
      k++
    }

    return k
  }

  return { modulus: m, elements, identity, multiply, order, entries }
}

// <x, y> by right multiplication from the identity, breadth first; null when it passes `limit` elements
function closure(group: ProjectiveGroup, x: number, y: number, limit: number): number[] | null {
  const seen = new Set<number>([group.identity])
  const list = [group.identity]

  for (const g of list) {
    for (const s of [x, y]) {
      const h = group.multiply(g, s)

      if (!seen.has(h)) {
        if (list.length >= limit) {
          return null
        }

        seen.add(h)
        list.push(h)
      }
    }
  }

  return list
}

// The regular map of G = <x, y>: darts are the elements, faceNext g = g x, edgeMate g = g x y.
export function rotaryMap(group: ProjectiveGroup, elements: readonly number[], x: number, y: number): DartMap {
  const index = new Map(elements.map((g, i) => [g, i]))
  const xy = group.multiply(x, y)

  return {
    faceNext: Int32Array.from(elements, g => index.get(group.multiply(g, x)) ?? -1),
    edgeMate: Int32Array.from(elements, g => index.get(group.multiply(g, xy)) ?? -1),
  }
}

export type RotaryQuotient = {
  readonly p: number
  readonly q: number
  readonly modulus: number
  readonly x: [number, number, number, number]
  readonly y: [number, number, number, number]
  readonly groupOrder: number
  // the relations of the (2,p,q) rotation group, checked on the matrices
  readonly relations: { xOrder: number; yOrder: number; xyOrder: number }
  // the candidate pairs (x of order p, y of order q, xy of order 2) the search examined at the winning modulus
  readonly candidates: number
  readonly map: DartMap
  readonly analysis: SurfaceAnalysis
}

// The smallest {p,q} regular map with a simple cell graph whose rotation group is generated inside PGL(2, m), at the
// first modulus m in `moduli` that has one. Pairs are scanned in ascending packed-key order, so the result is fixed.
// With a reference tiling, a map must also look like the tiling out to `minSystole` (ballSystole).
export function findRotaryMap(input: {
  p: number
  q: number
  moduli: readonly number[]
  reference?: readonly (readonly number[])[]
  minSystole?: number
}): RotaryQuotient | null {
  const { p, q } = input
  const minSystole = input.minSystole ?? 0
  const looksLikeTiling = (analysis: SurfaceAnalysis): boolean =>
    !input.reference ||
    ballSystole({
      neighbors: analysis.neighbors,
      reference: input.reference,
      referenceDegree: p,
      maxRadius: minSystole,
    }).systole >= minSystole

  for (const m of input.moduli) {
    const group = projectiveGroup(m)
    const orders = new Map(group.elements.map(g => [g, group.order(g)]))
    const xs = group.elements.filter(g => orders.get(g) === p)
    const ys = group.elements.filter(g => orders.get(g) === q)

    let best: RotaryQuotient | null = null
    let candidates = 0

    for (const x of xs) {
      for (const y of ys) {
        const xy = group.multiply(x, y)

        if (xy === group.identity || group.multiply(xy, xy) !== group.identity) {
          continue
        }

        candidates++

        const limit = best ? best.groupOrder - 1 : group.elements.length
        const elements = closure(group, x, y, limit)

        if (!elements) {
          continue
        }

        const map = rotaryMap(group, elements, x, y)
        const analysis = analyzeMap(map, p, q)

        if (Object.values(analysis.gates).every(Boolean) && looksLikeTiling(analysis)) {
          best = {
            p,
            q,
            modulus: m,
            x: group.entries(x),
            y: group.entries(y),
            groupOrder: elements.length,
            relations: { xOrder: orders.get(x)!, yOrder: orders.get(y)!, xyOrder: group.order(xy) },
            candidates: 0,
            map,
            analysis,
          }
        }
      }
    }

    if (best) {
      return { ...best, candidates }
    }
  }

  return null
}

export type RotarySurveyRow = {
  readonly modulus: number
  readonly groupOrder: number
  readonly cells: number
  readonly genus: number
  // the injectivity radius r and the loop systole L (null when r reached the reference's trusted radius)
  readonly systole: number
  readonly loopSystole: number | null
  readonly lowerBound: boolean
}

// Every {p,q} regular map with a simple cell graph whose rotation group <x, y> lies in PGL(2, m), for each prime m in
// `moduli` (how far the loop systole of a regular map reaches at a given size). x
// runs over one representative of each conjugacy class of elements of order p (conjugate generating pairs give
// isomorphic maps), y over the elements of order q with xy of order 2, ascending packed keys. The rotation group acts
// transitively on the faces, so the systole is read from cell 0 alone. Rows are distinct (group order, genus, r, L).
export function rotaryMapSurvey(input: {
  p: number
  q: number
  moduli: readonly number[]
  reference: readonly (readonly number[])[]
}): RotarySurveyRow[] {
  const { p, q } = input
  const rows: RotarySurveyRow[] = []
  const seen = new Set<string>()

  for (const m of input.moduli) {
    const group = projectiveGroup(m)
    const orders = new Map(group.elements.map(g => [g, group.order(g)]))

    const inverse = (g: number): number => {
      let h = group.identity

      for (let k = 1; k < orders.get(g)!; k++) {
        h = group.multiply(h, g)
      }

      return h
    }

    const inverses = new Map(group.elements.map(g => [g, inverse(g)]))
    const xs = group.elements.filter(g => orders.get(g) === p)
    const ys = group.elements.filter(g => orders.get(g) === q)
    const classified = new Set<number>()
    const representatives: number[] = []

    for (const x of xs) {
      if (classified.has(x)) {
        continue
      }

      representatives.push(x)

      for (const g of group.elements) {
        classified.add(group.multiply(group.multiply(g, x), inverses.get(g)!))
      }
    }

    for (const x of representatives) {
      for (const y of ys) {
        const xy = group.multiply(x, y)

        if (xy === group.identity || group.multiply(xy, xy) !== group.identity) {
          continue
        }

        const elements = closure(group, x, y, group.elements.length)!
        const analysis = analyzeMap(rotaryMap(group, elements, x, y), p, q)

        if (!Object.values(analysis.gates).every(Boolean)) {
          continue
        }

        const sys = ballSystole({
          neighbors: analysis.neighbors,
          reference: input.reference,
          referenceDegree: p,
          centers: [0],
        })
        const row: RotarySurveyRow = {
          modulus: m,
          groupOrder: elements.length,
          cells: analysis.neighbors.length,
          genus: analysis.genus,
          systole: sys.systole,
          loopSystole: sys.loopSystole,
          lowerBound: sys.lowerBound,
        }
        const key = `${row.groupOrder}:${row.genus}:${row.systole}:${row.loopSystole}`

        if (!seen.has(key)) {
          seen.add(key)
          rows.push(row)
        }
      }
    }
  }

  return rows
}

// ---- flat tori from integer vertex cycles ----

export type FlatTorus = {
  readonly p: number
  readonly q: number
  readonly sides: [number, number]
  readonly faceVertices: number[][]
  readonly map: DartMap
  readonly orientation: { directedOnce: boolean; reverseFound: boolean }
  readonly analysis: SurfaceAnalysis
}

const wrap = (i: number, n: number): number => ((i % n) + n) % n

function flatTorus(p: number, q: number, sides: [number, number], faceVertices: number[][]): FlatTorus {
  const { map, gates } = mapFromFaces(faceVertices)

  return { p, q, sides, faceVertices, map, orientation: gates, analysis: analyzeMap(map, p, q) }
}

// {4,4}: square (i, j) with corners (i, j), (i+1, j), (i+1, j+1), (i, j+1) modulo (a, b)
export function squareTorus(a: number, b: number): FlatTorus {
  const vertex = (i: number, j: number): number => wrap(i, a) * b + wrap(j, b)
  const faces: number[][] = []

  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      faces.push([vertex(i, j), vertex(i + 1, j), vertex(i + 1, j + 1), vertex(i, j + 1)])
    }
  }

  return flatTorus(4, 4, [a, b], faces)
}

// {3,6}: rhombus (i, j) of the lattice spanned by e1 = (1, 0) and e2 = (1/2, sqrt 3 / 2) split into an up triangle
// (i, j), (i+1, j), (i, j+1) and a down triangle (i+1, j), (i+1, j+1), (i, j+1), modulo (a, b): 2 a b triangles
export function triangleTorus(a: number, b: number): FlatTorus {
  const vertex = (i: number, j: number): number => wrap(i, a) * b + wrap(j, b)
  const faces: number[][] = []

  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      faces.push([vertex(i, j), vertex(i + 1, j), vertex(i, j + 1)])
      faces.push([vertex(i + 1, j), vertex(i + 1, j + 1), vertex(i, j + 1)])
    }
  }

  return flatTorus(3, 6, [a, b], faces)
}

// {6,3}: the hexagon around lattice point (i, j), whose corners are the six triangles around it counterclockwise (the
// dual of triangleTorus), modulo (a, b)
export function hexagonTorus(a: number, b: number): FlatTorus {
  const up = (i: number, j: number): number => 2 * (wrap(i, a) * b + wrap(j, b))
  const down = (i: number, j: number): number => up(i, j) + 1
  const faces: number[][] = []

  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      faces.push([up(i, j), down(i - 1, j), up(i - 1, j), down(i - 1, j - 1), up(i, j - 1), down(i, j - 1)])
    }
  }

  return flatTorus(6, 3, [a, b], faces)
}

// The infinite {3,6} tiling's cell graph (degree 3), breadth first from the up triangle at the origin, from its
// adjacency formula (up (i, j) meets down (i, j - 1), (i, j), (i - 1, j)), independent of the vertex cycles above.
export function triangleTiling(maxCells: number): number[][] {
  const key = (i: number, j: number, s: number): string => `${i},${j},${s}`
  const id = new Map<string, number>([[key(0, 0, 0), 0]])
  const cells: [number, number, number][] = [[0, 0, 0]]
  const neighbors: number[][] = [[]]

  for (let head = 0; head < cells.length; head++) {
    const [i, j, s] = cells[head]!
    const around: [number, number, number][] =
      s === 0
        ? [[i, j - 1, 1], [i, j, 1], [i - 1, j, 1]]
        : [[i + 1, j, 0], [i, j + 1, 0], [i, j, 0]]

    for (const [ni, nj, ns] of around) {
      const k = key(ni, nj, ns)

      let n = id.get(k)

      if (n === undefined) {
        if (cells.length >= maxCells) {
          continue
        }

        n = cells.length
        id.set(k, n)
        cells.push([ni, nj, ns])
        neighbors.push([])
      }

      neighbors[head]!.push(n)
    }
  }

  return neighbors
}

// ---- the systole against the infinite tiling ----

export type BallRow = {
  readonly radius: number
  readonly referenceCells: number
  readonly referenceEdges: number
  // the smallest and largest counts over every center of the quotient
  readonly cells: [number, number]
  readonly edges: [number, number]
  readonly equal: boolean
}

export type BallSystole = {
  // the largest r whose every quotient r-ball equals the tiling's r-ball (-1 if not even r = 0)
  readonly systole: number
  // the largest radius at which the reference patch is complete
  readonly trustedRadius: number
  // the balls matched through trustedRadius, so systole is only a lower bound
  readonly lowerBound: boolean
  // the shortest non-contractible loop, 2 systole + 2 or + 3 by the (systole + 1)-ball, null when lowerBound or no
  // radius matched
  readonly loopSystole: number | null
  readonly rows: BallRow[]
}

// The loop systole from the injectivity radius r and the (r + 1)-ball: fewer cells than the tiling's means an even loop
// 2r + 2 (two tiles at distance r + 1 fold together), all cells but an extra edge an odd loop 2r + 3.
export function loopSystoleOf(r: number, cellsAtNext: number, referenceCellsAtNext: number): number {
  return cellsAtNext < referenceCellsAtNext ? 2 * r + 2 : 2 * r + 3
}

// the distinct neighbours of each cell other than itself (a multigraph's repeated edges count once)
const simpleRows = (rows: readonly (readonly number[])[]): number[][] =>
  rows.map((row, x) => [...new Set(row)].filter(y => y !== x))

// `neighbors` must be simple rows (simpleRows)
function ballCounts(
  neighbors: readonly (readonly number[])[],
  center: number,
  maxRadius: number,
  distance: Int32Array,
  queue: Int32Array,
): { cells: number[]; edges: number[] } {
  const cells = new Array<number>(maxRadius + 1).fill(0)
  const edges = new Array<number>(maxRadius + 1).fill(0)

  let tail = 1

  queue[0] = center
  distance[center] = 0

  for (let head = 0; head < tail; head++) {
    const x = queue[head]!
    const dx = distance[x]!

    cells[dx]!++

    for (const y of neighbors[x]!) {
      if (distance[y]! < 0 && dx < maxRadius) {
        distance[y] = dx + 1
        queue[tail++] = y
      }
    }
  }

  // an edge between two ball cells enters the ball of radius max(dx, dy); each counted once, from its smaller id
  for (let head = 0; head < tail; head++) {
    const x = queue[head]!

    for (const y of neighbors[x]!) {
      if (x < y && distance[y]! >= 0) {
        edges[Math.max(distance[x]!, distance[y]!)]!++
      }
    }
  }

  for (let head = 0; head < tail; head++) {
    distance[queue[head]!] = -1
  }

  for (let r = 1; r <= maxRadius; r++) {
    cells[r]! += cells[r - 1]!
    edges[r]! += edges[r - 1]!
  }

  return { cells, edges }
}

export function ballSystole(input: {
  neighbors: readonly (readonly number[])[]
  reference: readonly (readonly number[])[]
  referenceDegree: number
  maxRadius?: number
  // the centres to read (default every cell); a quotient whose automorphisms act transitively on its cells (a torus) may
  // pass [0]
  centers?: readonly number[]
}): BallSystole {
  const { referenceDegree } = input
  const reference = simpleRows(input.reference)
  const quotient = simpleRows(input.neighbors)
  const refDistance = new Int32Array(reference.length).fill(-1)
  const refQueue = new Int32Array(reference.length)

  let tail = 1

  refDistance[0] = 0

  for (let head = 0; head < tail; head++) {
    const x = refQueue[head]!

    for (const y of reference[x]!) {
      if (refDistance[y]! < 0) {
        refDistance[y] = refDistance[x]! + 1
        refQueue[tail++] = y
      }
    }
  }

  let incomplete = Number.POSITIVE_INFINITY

  for (let x = 0; x < reference.length; x++) {
    if (new Set(reference[x]).size < referenceDegree && refDistance[x]! >= 0) {
      incomplete = Math.min(incomplete, refDistance[x]!)
    }
  }

  const trustedRadius = Math.min(input.maxRadius ?? Number.POSITIVE_INFINITY, incomplete - 1)

  refDistance.fill(-1)

  const ref = ballCounts(reference, 0, trustedRadius, refDistance, refQueue)
  const n = input.neighbors.length
  const distance = new Int32Array(n).fill(-1)
  const queue = new Int32Array(n)
  const lowCells = new Array<number>(trustedRadius + 1).fill(Number.POSITIVE_INFINITY)
  const highCells = new Array<number>(trustedRadius + 1).fill(0)
  const lowEdges = new Array<number>(trustedRadius + 1).fill(Number.POSITIVE_INFINITY)
  const highEdges = new Array<number>(trustedRadius + 1).fill(0)

  // the first radius where cell 0's ball differs bounds the systole, so the other centers need balls only that far
  // (the rows past it carry cell 0's counts alone and are unequal anyway)
  const zero = ballCounts(quotient, 0, trustedRadius, distance, queue)

  let reach = trustedRadius

  for (let r = 0; r <= trustedRadius; r++) {
    if (zero.cells[r] !== ref.cells[r] || zero.edges[r] !== ref.edges[r]) {
      reach = r
      break
    }
  }

  for (let r = 0; r <= trustedRadius; r++) {
    lowCells[r] = highCells[r] = zero.cells[r]!
    lowEdges[r] = highEdges[r] = zero.edges[r]!
  }

  for (const c of input.centers ?? Array.from({ length: n }, (_, k) => k)) {
    if (c === 0) {
      continue
    }

    const own = ballCounts(quotient, c, reach, distance, queue)

    for (let r = 0; r <= reach; r++) {
      lowCells[r] = Math.min(lowCells[r]!, own.cells[r]!)
      highCells[r] = Math.max(highCells[r]!, own.cells[r]!)
      lowEdges[r] = Math.min(lowEdges[r]!, own.edges[r]!)
      highEdges[r] = Math.max(highEdges[r]!, own.edges[r]!)
    }
  }

  const rows: BallRow[] = []

  let systole = -1

  for (let r = 0; r <= trustedRadius; r++) {
    const equal =
      lowCells[r] === ref.cells[r] &&
      highCells[r] === ref.cells[r] &&
      lowEdges[r] === ref.edges[r] &&
      highEdges[r] === ref.edges[r]

    if (equal && systole === r - 1) {
      systole = r
    }

    rows.push({
      radius: r,
      referenceCells: ref.cells[r]!,
      referenceEdges: ref.edges[r]!,
      cells: [lowCells[r]!, highCells[r]!],
      edges: [lowEdges[r]!, highEdges[r]!],
      equal,
    })
  }

  const lowerBound = systole === trustedRadius
  const next = rows[systole + 1]
  const loopSystole =
    lowerBound || systole < 0 || !next
      ? null
      : loopSystoleOf(systole, next.cells[0], next.referenceCells)

  return { systole, trustedRadius, lowerBound, loopSystole, rows }
}

// The {p,q} tiling's cell graph: hyperbolic from buildCellGraph (exact facet adjacency, kept far below its float
// wall), flat from buildEuclideanLattice, the triangle tiles from triangleTiling.
export function referenceTiling(symbol: readonly number[], maxCells: number): number[][] {
  const key = symbol.join(',')

  if (key === '3,6') {
    return triangleTiling(maxCells)
  }

  if (key === '4,4' || key === '6,3' || key === '3,4,3,3') {
    return buildEuclideanLattice({ symbol: [...symbol], maxCells }).neighbors
  }

  return buildCellGraph({ symbol: [...symbol], maxCells }).neighbors
}

// ---- edge colorings into matchings (the partition schedule's raw material) ----

export type MatchingCheck = {
  readonly colors: number
  readonly edges: number
  // every color class touches each cell at most once, and the classes cover every edge exactly once
  readonly matchings: boolean
  readonly covers: boolean
}

export function checkMatchings(neighbors: readonly (readonly number[])[]): MatchingCheck {
  const distinct = neighbors.map((row, x) => [...new Set(row)].filter(y => y !== x))
  const csr = toCsr(distinct)
  const { eu, ev, byColor } = greedyEdgeColoring({
    offsets: csr.offsets,
    adjacency: csr.adj,
    size: distinct.length,
  })
  const expected = distinct.reduce((s, row) => s + row.length, 0) / 2

  let matchings = true

  const used = new Uint8Array(eu.length)

  for (const edges of byColor) {
    const touched = new Set<number>()

    for (const e of edges) {
      matchings &&= !touched.has(eu[e]!) && !touched.has(ev[e]!)
      touched.add(eu[e]!)
      touched.add(ev[e]!)
      used[e]! += 1
    }
  }

  return {
    colors: byColor.length,
    edges: eu.length,
    matchings,
    covers: eu.length === expected && used.every(u => u === 1),
  }
}

// ---- the {3,4,3,4} congruence quotient ----

export type Honeycomb3434 = {
  readonly twoPower: number
  readonly docks: number
  readonly neighbors: number[][]
  readonly gates: { returnsExactly: boolean; noSelfLoops: boolean; distinctNeighbours: boolean }
  readonly systole: number
  // frameSystole read to its radius cap (or the exact shells' end), so systole is only a lower bound
  readonly systoleLowerBound: boolean
  // the shortest non-contractible loop (loopSystoleOf on the frame shells; the frame group acts transitively on docks)
  readonly loopSystole: number | null
  readonly shells: number[]
  // the base 24-cell's edges and triangles found from its ideal vertices (96 and 96)
  readonly baseEdges: number
  readonly baseTriangles: number
  // counted cells of the quotient: C4 docks, C3 facets, F triangles, E edges (ideal vertices excluded)
  readonly counts: { docks: number; facets: number; triangles: number; edges: number }
  // every edge class holds 8 (dock, edge) incidences and every triangle class 4, as in the honeycomb
  readonly uniformIncidence: boolean
  // -E + F - C3 + C4, the Euler characteristic of the open (cusped) quotient
  readonly euler: number
}

function unionFind(size: number): { root(i: number): number; join(i: number, j: number): void } {
  const parent = new Int32Array(size)

  for (let i = 0; i < size; i++) {
    parent[i] = i
  }

  const root = (i: number): number => {
    let r = i

    while (parent[r] !== r) {
      r = parent[r]!
    }

    let c = i

    while (parent[c] !== r) {
      const n = parent[c]!

      parent[c] = r
      c = n
    }

    return r
  }

  return {
    root,
    join(i, j) {
      const a = root(i)
      const b = root(j)

      if (a !== b) {
        parent[a] = b
      }
    },
  }
}

function classSizes(size: number, root: (i: number) => number): number[] {
  const sizes = new Map<number, number>()

  for (let i = 0; i < size; i++) {
    const r = root(i)

    sizes.set(r, (sizes.get(r) ?? 0) + 1)
  }

  return [...sizes.values()]
}

// K mod (sqrt 2)^twoPower, or null when it has more than maxDocks docks
export function honeycombQuotient3434(input: { twoPower: number; maxDocks: number }): Honeycomb3434 | null {
  const SLOTS = 24
  const cell = exactCell()
  const frames = enumerateFrames({ level: { twoPower: input.twoPower, odd: 1 }, maxDocks: input.maxDocks, cell })

  if (!frames.fits) {
    return null
  }

  const docks = frames.order
  const table = frames.table
  const gates = graphGates(table, docks)
  const SYSTOLE_RADIUS = 4
  const systole = frameSystole(table, docks, SYSTOLE_RADIUS)
  const r = systole.systole
  const systoleLowerBound = r >= SYSTOLE_RADIUS || r + 1 >= EXACT_SHELLS.length
  const cumulative = (list: readonly number[], upTo: number): number =>
    list.slice(0, upTo + 1).reduce((a, b) => a + (b ?? 0), 0)
  const loopSystole =
    systoleLowerBound || r < 0
      ? null
      : loopSystoleOf(r, cumulative(systole.shells, r + 1), cumulative(EXACT_SHELLS, r + 1))
  const neighbors: number[][] = []

  for (let x = 0; x < docks; x++) {
    neighbors.push(Array.from(table.subarray(x * SLOTS, (x + 1) * SLOTS)))
  }

  // the base 24-cell from its ideal vertices: an edge is a vertex pair on three common facets (the edge figure of
  // {3,4,3} is a triangle), a triangle three pairwise edges on a common facet
  const incidence = cuspIncidence(cell)
  const V = incidence.vertices.length
  const facetsOf = Array.from({ length: V }, (_, j) =>
    incidence.facetVertices.flatMap((list, a) => (list.includes(j) ? [a] : [])),
  )
  const shared = (i: number, j: number): number => facetsOf[i]!.filter(a => facetsOf[j]!.includes(a)).length
  const edgeList: [number, number][] = []

  for (let i = 0; i < V; i++) {
    for (let j = i + 1; j < V; j++) {
      if (shared(i, j) === 3) {
        edgeList.push([i, j])
      }
    }
  }

  const edgeIndex = new Map(edgeList.map(([i, j], e) => [i * V + j, e]))
  const edgeOf = (i: number, j: number): number => edgeIndex.get(Math.min(i, j) * V + Math.max(i, j)) ?? -1
  const triangleList: [number, number, number][] = []

  for (const [i, j] of edgeList) {
    for (let k = j + 1; k < V; k++) {
      if (edgeOf(i, k) >= 0 && edgeOf(j, k) >= 0) {
        const onFacet = facetsOf[i]!.some(a => facetsOf[j]!.includes(a) && facetsOf[k]!.includes(a))

        if (onFacet) {
          triangleList.push([i, j, k])
        }
      }
    }
  }

  const triangleIndex = new Map(triangleList.map((t, n) => [t.join(','), n]))
  const triangleOf = (t: number[]): number => triangleIndex.get([...t].sort((a, b) => a - b).join(',')) ?? -1
  const E = edgeList.length
  const T = triangleList.length
  const edges = unionFind(docks * E)
  const triangles = unionFind(docks * T)
  const facetEdges = incidence.facetVertices.map(list =>
    edgeList.flatMap(([i, j], e) => (list.includes(i) && list.includes(j) ? [e] : [])),
  )
  const facetTriangles = incidence.facetVertices.map(list =>
    triangleList.flatMap((t, n) => (t.every(v => list.includes(v)) ? [n] : [])),
  )
  const anti = incidence.antipode

  for (let x = 0; x < docks; x++) {
    for (let a = 0; a < SLOTS; a++) {
      const y = table[x * SLOTS + a]!

      for (const e of facetEdges[a]!) {
        const [i, j] = edgeList[e]!

        edges.join(x * E + e, y * E + edgeOf(anti[i]!, anti[j]!))
      }

      for (const n of facetTriangles[a]!) {
        triangles.join(x * T + n, y * T + triangleOf(triangleList[n]!.map(v => anti[v]!)))
      }
    }
  }

  const edgeClasses = classSizes(docks * E, i => edges.root(i))
  const triangleClasses = classSizes(docks * T, i => triangles.root(i))
  const counts = {
    docks,
    // each facet joins two docks (gates.returnsExactly and noSelfLoops)
    facets: (docks * SLOTS) / 2,
    triangles: triangleClasses.length,
    edges: edgeClasses.length,
  }

  return {
    twoPower: input.twoPower,
    docks,
    neighbors,
    gates,
    systole: systole.systole,
    systoleLowerBound,
    loopSystole,
    shells: systole.shells,
    baseEdges: E,
    baseTriangles: T,
    counts,
    uniformIncidence: edgeClasses.every(s => s === 8) && triangleClasses.every(s => s === 4),
    euler: -counts.edges + counts.triangles - counts.facets + counts.docks,
  }
}

// ---- the flat D4 torus ----

export function d4Torus(side: number): { side: number; cells: number; neighbors: number[][] } {
  const torus = buildD4Torus(side)

  return { side, cells: torus.cells.length, neighbors: torus.neigh }
}

// ---- the catalog ----

export type ClosedQuotient = {
  readonly name: string
  readonly symbol: readonly number[]
  readonly curvature: 'flat' | 'hyperbolic'
  readonly dimension: 2 | 4
  readonly cells: number
  readonly degree: number
  // neighbors[c][k]: the cell across side (or slot) k of cell c
  readonly neighbors: number[][]
  // counted Euler characteristic (surfaces V - E + F; the {3,4,3,4} quotient -E + F - C3 + C4); null when not counted
  readonly euler: number | null
  readonly genus: number | null
  // the injectivity radius (ballSystole), whether it is only a lower bound, and the loop systole
  readonly systole: number
  readonly systoleLowerBound: boolean
  readonly loopSystole: number | null
  readonly construction: string
  // the degree-matched partner of equal cell count, by name, or null when no flat tiling has the degree
  readonly partner: string | null
}

// the factor pair a <= b of n with a >= 3 closest to square, or null
export function torusSides(n: number): [number, number] | null {
  let best: [number, number] | null = null

  for (let a = 3; a * a <= n; a++) {
    if (n % a === 0 && n / a >= 3) {
      best = [a, n / a]
    }
  }

  return best
}

export const QUOTIENT_MODULI: readonly number[] = [3, 5, 7, 11]

// the {3,4,3,4} size cap: every 2-adic level under it with a simple dock graph is kept (the small-size runs)
export const HONEYCOMB_MAX_DOCKS = 20000

// the hyperbolic surfaces: the three the sources name and the three degree-matched controls
export const SURFACE_SYMBOLS: readonly (readonly [number, number])[] = [
  [7, 3],
  [5, 4],
  [8, 3],
  [4, 5],
  [6, 4],
  [3, 7],
]

// the flat tiling of each degree that has one
const FLAT_OF_DEGREE: Readonly<Record<number, readonly [number, number]>> = {
  3: [3, 6],
  4: [4, 4],
  6: [6, 3],
}

// a reference patch big enough that every searched radius is complete, far below buildCellGraph's float wall
export const REFERENCE_CELLS = 6000

export type CatalogEntry = {
  readonly quotient: ClosedQuotient
  // what built it, so a gate can read every count
  readonly rotary?: RotaryQuotient
  readonly torus?: FlatTorus
  readonly honeycomb?: Honeycomb3434
  readonly systole?: BallSystole
}

const surfaceName = (symbol: readonly number[], genus: number): string =>
  `${genus === 1 ? 'torus' : 'surface'}-${symbol.join('-')}-genus-${genus}`

function flatPartner(p: number, cells: number): FlatTorus | null {
  const flat = FLAT_OF_DEGREE[p]

  if (!flat) {
    return null
  }

  if (flat[0] === 3) {
    const sides = cells % 2 === 0 ? torusSides(cells / 2) : null

    return sides ? triangleTorus(sides[0], sides[1]) : null
  }

  const sides = torusSides(cells)

  if (!sides) {
    return null
  }

  return flat[0] === 4 ? squareTorus(sides[0], sides[1]) : hexagonTorus(sides[0], sides[1])
}

function torusEntry(torus: FlatTorus, partner: string): CatalogEntry {
  const symbol = [torus.p, torus.q]
  const systole = ballSystole({
    neighbors: torus.analysis.neighbors,
    reference: referenceTiling(symbol, REFERENCE_CELLS),
    referenceDegree: torus.p,
  })

  return {
    quotient: {
      name: `${surfaceName(symbol, 1)}-${torus.sides.join('x')}`,
      symbol,
      curvature: 'flat',
      dimension: 2,
      cells: torus.analysis.faces,
      degree: torus.p,
      neighbors: torus.analysis.neighbors,
      euler: torus.analysis.euler,
      genus: torus.analysis.genus,
      systole: systole.systole,
      systoleLowerBound: systole.lowerBound,
      loopSystole: systole.loopSystole,
      construction: `flat {${symbol.join(',')}} torus of ${torus.sides.join(' x ')} ${torus.p === 3 ? 'rhombi' : 'tiles'}`,
      partner,
    },
    torus,
    systole,
  }
}

// Every closed quotient of the lab: the hyperbolic surfaces with their flat partners, then the {3,4,3,4} levels under
// the cap with the flat D4 torus of equal size where one exists.
export function closedQuotients(): CatalogEntry[] {
  const entries: CatalogEntry[] = []

  for (const [p, q] of SURFACE_SYMBOLS) {
    const reference = referenceTiling([p, q], REFERENCE_CELLS)
    const rotary = findRotaryMap({ p, q, moduli: QUOTIENT_MODULI, reference, minSystole: 1 })

    if (!rotary) {
      continue
    }

    const a = rotary.analysis
    const systole = ballSystole({ neighbors: a.neighbors, reference, referenceDegree: p })
    const name = surfaceName([p, q], a.genus)
    const flat = flatPartner(p, a.faces)
    const flatEntry = flat ? torusEntry(flat, name) : null

    entries.push({
      quotient: {
        name,
        symbol: [p, q],
        curvature: 'hyperbolic',
        dimension: 2,
        cells: a.faces,
        degree: p,
        neighbors: a.neighbors,
        euler: a.euler,
        genus: a.genus,
        systole: systole.systole,
        systoleLowerBound: systole.lowerBound,
        loopSystole: systole.loopSystole,
        construction: `regular map of the (2,${p},${q}) rotation group in PGL(2,${rotary.modulus}), order ${rotary.groupOrder}, x = [${rotary.x.join(' ')}], y = [${rotary.y.join(' ')}]`,
        partner: flatEntry?.quotient.name ?? null,
      },
      rotary,
      systole,
    })

    if (flatEntry) {
      entries.push(flatEntry)
    }
  }

  for (let twoPower = 1; ; twoPower++) {
    const honeycomb = honeycombQuotient3434({ twoPower, maxDocks: HONEYCOMB_MAX_DOCKS })

    if (!honeycomb) {
      break
    }

    if (!honeycomb.gates.distinctNeighbours) {
      continue
    }

    const name = `honeycomb-3-4-3-4-level-${twoPower}`

    // the D4 torus of side s has s^4 / 2 cells
    let side = 2

    while (side ** 4 < 2 * honeycomb.docks) {
      side += 2
    }

    const matched = side % 2 === 0 && side ** 4 / 2 === honeycomb.docks
    const d4Name = `torus-3-4-3-3-side-${side}`

    entries.push({
      quotient: {
        name,
        symbol: [3, 4, 3, 4],
        curvature: 'hyperbolic',
        dimension: 4,
        cells: honeycomb.docks,
        degree: 24,
        neighbors: honeycomb.neighbors,
        euler: honeycomb.euler,
        genus: null,
        systole: honeycomb.systole,
        systoleLowerBound: honeycomb.systoleLowerBound,
        loopSystole: honeycomb.loopSystole,
        construction: `frame group K of the {3,4,3,4} honeycomb modulo (sqrt 2)^${twoPower}, ${honeycomb.docks} docks`,
        partner: matched ? d4Name : null,
      },
      honeycomb,
    })

    if (matched) {
      const torus = d4Torus(side)
      const systole = ballSystole({
        neighbors: torus.neighbors,
        reference: referenceTiling([3, 4, 3, 3], 20000),
        referenceDegree: 24,
      })

      entries.push({
        quotient: {
          name: d4Name,
          symbol: [3, 4, 3, 3],
          curvature: 'flat',
          dimension: 4,
          cells: torus.cells,
          degree: 24,
          neighbors: torus.neighbors,
          euler: null,
          genus: null,
          systole: systole.systole,
          systoleLowerBound: systole.lowerBound,
          loopSystole: systole.loopSystole,
          construction: `flat D4 lattice (24-cell honeycomb {3,4,3,3}) modulo ${side}, even-sum points`,
          partner: name,
        },
        systole,
      })
    }
  }

  return entries
}

// ---- independent checks of a quotient ----
//
// ballSystole and loopSystole read cell and edge COUNTS, which decide an isomorphism only because the tiling covers the
// quotient. The checks below read adjacency instead, so they can fail where a count agrees by accident:
// - rootedIsomorphism: the quotient's r-ball around a centre against the tiling's r-ball, by a map found by search and
//   verified as an induced-subgraph bijection (every edge of one is an edge of the other, both ways).
// - walkLoopSystole: the loop systole from non-backtracking closed walks. A walk lifts uniquely to the cover, so the
//   quotient has more closed walks of length l at a centre than the tiling exactly when one of them is non-contractible,
//   and a shortest non-contractible closed walk never backtracks (removing a backtrack, or conjugating one at the base,
//   gives a shorter homotopic walk). L is the least such l over the centres: distances and walk counts, no ball counts.
// - gf2Homology: the Betti numbers of a surface's cell complex over GF(2) by ranks of its boundary matrices, a
//   different computation from the orbit count of the Euler characteristic; b0 = 1 and b2 = 1 hold only for a
//   connected closed surface, and b1 = 2g then reads its genus.

export type RootedBall = {
  // origin first, cells in breadth-first order; rows induced on the ball, simple
  readonly neighbors: number[][]
  readonly distance: Int32Array
}

// The r-ball around a centre as its own graph, the centre renumbered 0.
export function rootedBall(input: {
  neighbors: readonly (readonly number[])[]
  center: number
  radius: number
}): RootedBall {
  const rows = simpleRows(input.neighbors)
  const index = new Map<number, number>([[input.center, 0]])
  const cells = [input.center]
  const depth = [0]

  for (let head = 0; head < cells.length; head++) {
    if (depth[head]! >= input.radius) {
      continue
    }

    for (const y of rows[cells[head]!]!) {
      if (!index.has(y)) {
        index.set(y, cells.length)
        cells.push(y)
        depth.push(depth[head]! + 1)
      }
    }
  }

  return {
    neighbors: cells.map(x => rows[x]!.filter(y => index.has(y)).map(y => index.get(y)!)),
    distance: Int32Array.from(depth),
  }
}

export type RootedIsomorphism = {
  // 'budget': the search stopped on its step budget, which a gate reads as a failure
  readonly verdict: 'isomorphic' | 'different' | 'budget'
  readonly steps: number
}

// Whether two rooted balls are isomorphic by a map sending origin to origin, by depth-first search in breadth-first
// order: a cell goes to an unused cell of the same depth and ball degree that is adjacent to the images of its mapped
// neighbours and to no other mapped cell. Every step keeps the map an induced-subgraph isomorphism of the mapped part, so
// a complete map is an isomorphism of the balls (equal cell and edge counts are checked first).
export function rootedIsomorphism(input: {
  first: RootedBall
  second: RootedBall
  budget: number
}): RootedIsomorphism {
  const { first: a, second: b, budget } = input
  const n = a.neighbors.length
  const edges = (g: RootedBall): number => g.neighbors.reduce((s, row) => s + row.length, 0)

  if (b.neighbors.length !== n || edges(a) !== edges(b)) {
    return { verdict: 'different', steps: 0 }
  }

  const adjacentB = b.neighbors.map(row => new Set(row))
  const map = new Int32Array(n).fill(-1)
  const inverse = new Int32Array(n).fill(-1)

  let steps = 0

  const fits = (x: number, y: number): boolean => {
    if (inverse[y] !== -1 || a.distance[x] !== b.distance[y] || a.neighbors[x]!.length !== b.neighbors[y]!.length) {
      return false
    }

    let mappedNeighbours = 0

    for (const u of a.neighbors[x]!) {
      if (map[u]! >= 0) {
        mappedNeighbours++

        if (!adjacentB[y]!.has(map[u]!)) {
          return false
        }
      }
    }

    // no mapped cell beside y other than the images of x's mapped neighbours
    let mappedBeside = 0

    for (const z of b.neighbors[y]!) {
      if (inverse[z]! >= 0) {
        mappedBeside++
      }
    }

    return mappedBeside === mappedNeighbours
  }

  // a for-index walk with an explicit stack of candidate lists
  const candidates: number[][] = []

  let i = 0

  candidates[0] = [0]

  while (i >= 0) {
    if (++steps > budget) {
      return { verdict: 'budget', steps }
    }

    if (i === n) {
      return { verdict: 'isomorphic', steps }
    }

    if (map[i]! >= 0) {
      inverse[map[i]!] = -1
      map[i] = -1
    }

    const list = candidates[i]!

    let placed = false

    while (list.length > 0) {
      const y = list.shift()!

      if (fits(i, y)) {
        map[i] = y
        inverse[y] = i
        placed = true
        break
      }
    }

    if (!placed) {
      i--
      continue
    }

    i++

    if (i < n) {
      // cell i's breadth-first parent is mapped: its candidates are the neighbours of that image
      const parent = a.neighbors[i]!.find(u => u < i)

      candidates[i] = parent === undefined ? [] : [...b.neighbors[map[parent]!]!]
    }
  }

  return { verdict: 'different', steps }
}

// The number of non-backtracking closed walks of each length 0..maxLength that start and end at `center` (a step never
// returns along the edge it just used). Exact integers while they stay below 2^53, which the callers' degrees and
// lengths keep (a guard throws past it).
export function closedWalkCounts(input: {
  neighbors: readonly (readonly number[])[]
  center: number
  maxLength: number
}): number[] {
  const rows = simpleRows(input.neighbors)
  const out = [1]

  // walks as a map from the directed edge last used (from * size + to) to their count
  const size = rows.length

  let frontier = new Map<number, number>()

  for (const y of rows[input.center]!) {
    frontier.set(input.center * size + y, 1)
  }

  for (let length = 1; length <= input.maxLength; length++) {
    let closed = 0

    for (const [edge, count] of frontier) {
      if (edge % size === input.center) {
        closed += count
      }
    }

    out.push(closed)

    if (length === input.maxLength) {
      break
    }

    const next = new Map<number, number>()

    for (const [edge, count] of frontier) {
      const from = Math.floor(edge / size)
      const at = edge % size

      for (const y of rows[at]!) {
        if (y !== from) {
          const key = at * size + y
          const total = (next.get(key) ?? 0) + count

          if (total > Number.MAX_SAFE_INTEGER) {
            throw new Error('closedWalkCounts: a count passed 2^53')
          }

          next.set(key, total)
        }
      }
    }

    frontier = next
  }

  return out
}

export type WalkSystole = {
  // the least length at which some centre has more non-backtracking closed walks than the tiling, null when none up to
  // the trusted length
  readonly loopSystole: number | null
  // the longest walk the reference patch counts completely (every cell within half of it has its full row)
  readonly trustedLength: number
}

export function walkLoopSystole(input: {
  neighbors: readonly (readonly number[])[]
  reference: readonly (readonly number[])[]
  referenceDegree: number
  maxLength: number
  centers?: readonly number[]
}): WalkSystole {
  const reference = simpleRows(input.reference)
  const depth = new Int32Array(reference.length).fill(-1)
  const queue = [0]

  depth[0] = 0

  for (const x of queue) {
    for (const y of reference[x]!) {
      if (depth[y]! < 0) {
        depth[y] = depth[x]! + 1
        queue.push(y)
      }
    }
  }

  let incomplete = Number.POSITIVE_INFINITY

  reference.forEach((row, x) => {
    if (row.length < input.referenceDegree && depth[x]! >= 0) {
      incomplete = Math.min(incomplete, depth[x]!)
    }
  })

  // a closed walk of length l stays within floor(l / 2) of its start and needs full rows only there
  const trustedLength = Math.min(input.maxLength, 2 * incomplete - 1)
  const tiling = closedWalkCounts({ neighbors: reference, center: 0, maxLength: trustedLength })
  const centers = input.centers ?? Array.from({ length: input.neighbors.length }, (_, c) => c)

  let loopSystole: number | null = null

  for (const c of centers) {
    const own = closedWalkCounts({ neighbors: input.neighbors, center: c, maxLength: trustedLength })

    for (let l = 1; l <= trustedLength; l++) {
      if (own[l] !== tiling[l]) {
        if (loopSystole === null || l < loopSystole) {
          loopSystole = l
        }

        break
      }
    }
  }

  return { loopSystole, trustedLength }
}

export type CellComplex = {
  readonly vertices: number
  // each edge's two end vertices
  readonly edges: [number, number][]
  // each face's boundary edges in order
  readonly faces: number[][]
}

// The cell complex of a dart map, by union-find (a vertex is the start of a dart; faceNext d and edgeMate d both start
// where d ends), not by the orbit walk of analyzeMap.
export function dartComplex(map: DartMap): CellComplex {
  const n = map.faceNext.length
  const start = unionFind(n)

  for (let d = 0; d < n; d++) {
    start.join(map.faceNext[d]!, map.edgeMate[d]!)
  }

  const vertexId = new Map<number, number>()

  const vertexOf = (d: number): number => {
    const r = start.root(d)

    let v = vertexId.get(r)

    if (v === undefined) {
      v = vertexId.size
      vertexId.set(r, v)
    }

    return v
  }

  const edgeOf = new Int32Array(n).fill(-1)
  const edges: [number, number][] = []

  for (let d = 0; d < n; d++) {
    if (edgeOf[d]! < 0) {
      const e = edges.length

      edgeOf[d] = e
      edgeOf[map.edgeMate[d]!] = e
      edges.push([vertexOf(d), vertexOf(map.edgeMate[d]!)])
    }
  }

  const seen = new Uint8Array(n)
  const faces: number[][] = []

  for (let d = 0; d < n; d++) {
    if (seen[d]) {
      continue
    }

    const face: number[] = []

    let e = d

    while (!seen[e]) {
      seen[e] = 1
      face.push(edgeOf[e]!)
      e = map.faceNext[e]!
    }

    faces.push(face)
  }

  return { vertices: vertexId.size, edges, faces }
}

// the rank over GF(2) of rows given as lists of column indices (a column listed twice cancels)
function gf2Rank(rows: readonly (readonly number[])[], columns: number): number {
  const words = Math.ceil(columns / 32)
  const pivots = new Map<number, Uint32Array>()

  let rank = 0

  for (const list of rows) {
    const row = new Uint32Array(words)

    for (const c of list) {
      row[c >>> 5] = row[c >>> 5]! ^ (1 << (c & 31))
    }

    // clear the highest set bit against its pivot (whose highest bit it is) until a new pivot or the zero row
    reduce: for (let w = words - 1; w >= 0; w--) {
      while (row[w] !== 0) {
        const col = w * 32 + 31 - Math.clz32(row[w]!)
        const pivot = pivots.get(col)

        if (!pivot) {
          pivots.set(col, row)
          rank++
          break reduce
        }

        for (let k = 0; k <= w; k++) {
          row[k] = row[k]! ^ pivot[k]!
        }
      }
    }
  }

  return rank
}

export type Homology2 = { readonly b0: number; readonly b1: number; readonly b2: number }

export function gf2Homology(c: CellComplex): Homology2 {
  const rank1 = gf2Rank(c.edges.map(([u, v]) => [u, v]), c.vertices)
  const rank2 = gf2Rank(c.faces, c.edges.length)

  return { b0: c.vertices - rank1, b1: c.edges.length - rank1 - rank2, b2: c.faces.length - rank2 }
}
