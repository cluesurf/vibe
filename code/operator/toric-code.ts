// The toric (surface) code built from the {3,4,3,4} mesh's own cell complex. The cells of d4Mesh are the
// points of the D4 lattice on a periodic side^4 torus, its twenty-four directions are the D4 roots, so
// the mesh carries a natural 2-complex: vertices (cells), edges (a cell and a root), and triangles (a
// cell with two roots r1, r2 whose difference is also a root, which for roots of norm two is exactly
// r1 . r2 = 1). Qubits live on the edges, X-checks on the vertices (the coboundary of the 0-cells),
// Z-checks on the triangles (the boundary of the 2-cells). The number of logical qubits is
//
//   k = n - rank(H_X) - rank(H_Z) = dim H_1(complex, Z_2),
//
// the first Betti number over Z_2 (Kitaev 1997, Dennis, Kitaev, Landahl and Preskill 2002). For one
// four-torus that is 4, for a contractible open patch it is 0. Everything here is counted from the
// complex, nothing is put in.
//
// One fact this construction exposed on 2026-08-31: every D4 root changes the coordinate sum by an even
// number, so on a periodic box of EVEN side the cells split into two lattices (even and odd coordinate
// sum) that no root connects, b_0 = 2, and the code has 2 x 4 = 8 logical qubits. An odd side wraps the two
// classes into one lattice. See complexComponents.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { BitMatrix, bitMatrixRank, makeBitMatrix, setBit } from '@/code/tool/bitset'

export type CellComplex = {
  vertices: number
  edges: [number, number][]
  triangles: [number, number, number][] // edge indices
  triangleVertices: [number, number, number][] // (cell, cell + r1, cell + r2), the oriented cycle
}

const ROOTS = rootsD4()

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)
}

// the D4 lattice 2-complex on a side^4 box, periodic (a four-torus) or open (a contractible patch)
export function d4CellComplex(input: {
  side: number
  periodic: boolean
}): CellComplex {
  const { side, periodic } = input
  const area = side * side
  const volume = area * side
  const vertices = volume * side

  const coordinates = (cell: number): number[] => [
    cell % side,
    Math.floor(cell / side) % side,
    Math.floor(cell / area) % side,
    Math.floor(cell / volume) % side,
  ]

  // the cell reached from `cell` along `root`, or -1 if it leaves an open patch
  const step = (cell: number, root: number[]): number => {
    const c = coordinates(cell)
    const moved = c.map((x, i) => x + (root[i] ?? 0))

    if (!periodic && moved.some(x => x < 0 || x >= side)) {
      return -1
    }

    const wrapped = moved.map(x => ((x % side) + side) % side)

    return (
      wrapped[0]! +
      side * (wrapped[1]! + side * (wrapped[2]! + side * wrapped[3]!))
    )
  }

  // edges: each unordered adjacent pair once, keyed by its endpoints
  const edgeIndex = new Map<string, number>()
  const edges: [number, number][] = []

  const edgeKey = (a: number, b: number): string =>
    a < b ? `${a},${b}` : `${b},${a}`

  for (let cell = 0; cell < vertices; cell++) {
    for (const root of ROOTS) {
      const other = step(cell, root)

      if (other === -1 || other === cell) {
        continue
      }

      const key = edgeKey(cell, other)

      if (!edgeIndex.has(key)) {
        edgeIndex.set(key, edges.length)
        edges.push(cell < other ? [cell, other] : [other, cell])
      }
    }
  }

  // triangles: cell, cell + r1, cell + r2 with r2 - r1 also a root (equivalently r1 . r2 = 1 for roots of
  // norm 2), each unordered vertex triple once
  const triangleSeen = new Set<string>()
  const triangles: [number, number, number][] = []
  const triangleVertices: [number, number, number][] = []

  for (let cell = 0; cell < vertices; cell++) {
    for (let i = 0; i < ROOTS.length; i++) {
      for (let j = i + 1; j < ROOTS.length; j++) {
        const r1 = ROOTS[i]!
        const r2 = ROOTS[j]!

        // |r2 - r1|^2 = 4 - 2 r1 . r2 equals 2 exactly when r1 . r2 = 1
        if (dot(r1, r2) !== 1) {
          continue
        }

        const a = step(cell, r1)
        const b = step(cell, r2)

        if (a === -1 || b === -1) {
          continue
        }

        const key = [cell, a, b].sort((x, y) => x - y).join(',')

        if (triangleSeen.has(key)) {
          continue
        }

        triangleSeen.add(key)

        const e1 = edgeIndex.get(edgeKey(cell, a))
        const e2 = edgeIndex.get(edgeKey(a, b))
        const e3 = edgeIndex.get(edgeKey(cell, b))

        if (e1 === undefined || e2 === undefined || e3 === undefined) {
          continue
        }

        triangles.push([e1, e2, e3])
        triangleVertices.push([cell, a, b])
      }
    }
  }

  return { vertices, edges, triangles, triangleVertices }
}

// the X-check matrix: one row per vertex, a one on every edge touching it (the coboundary of 0-cells)
export function vertexCheckMatrix(complex: CellComplex): BitMatrix {
  const m = makeBitMatrix({
    rows: complex.vertices,
    cols: complex.edges.length,
  })

  complex.edges.forEach(([a, b], edge) => {
    setBit(m, { row: a, col: edge })
    setBit(m, { row: b, col: edge })
  })

  return m
}

// the Z-check matrix: one row per triangle, a one on each of its three edges (the boundary of 2-cells)
export function triangleCheckMatrix(complex: CellComplex): BitMatrix {
  const m = makeBitMatrix({
    rows: complex.triangles.length,
    cols: complex.edges.length,
  })

  complex.triangles.forEach(([e1, e2, e3], triangle) => {
    setBit(m, { row: triangle, col: e1 })
    setBit(m, { row: triangle, col: e2 })
    setBit(m, { row: triangle, col: e3 })
  })

  return m
}

// the code parameters counted from the complex: qubits, independent X and Z checks, logical qubits
export function toricCodeParameters(complex: CellComplex): {
  qubits: number
  vertexChecks: number
  triangleChecks: number
  independentVertexChecks: number
  independentTriangleChecks: number
  logicalQubits: number
} {
  const qubits = complex.edges.length
  const independentVertexChecks = bitMatrixRank(vertexCheckMatrix(complex))
  const independentTriangleChecks = bitMatrixRank(
    triangleCheckMatrix(complex),
  )

  return {
    qubits,
    vertexChecks: complex.vertices,
    triangleChecks: complex.triangles.length,
    independentVertexChecks,
    independentTriangleChecks,
    logicalQubits: qubits - independentVertexChecks - independentTriangleChecks,
  }
}

// the number of connected components of the complex's 1-skeleton, b_0, by breadth-first search
export function complexComponents(complex: CellComplex): number {
  const adjacency: number[][] = Array.from({ length: complex.vertices }, () => [])

  for (const [a, b] of complex.edges) {
    adjacency[a]!.push(b)
    adjacency[b]!.push(a)
  }

  const seen = new Uint8Array(complex.vertices)

  let components = 0

  for (let start = 0; start < complex.vertices; start++) {
    if (seen[start]) {
      continue
    }

    components++
    seen[start] = 1

    const queue = [start]

    while (queue.length > 0) {
      const cell = queue.pop()!

      for (const next of adjacency[cell]!) {
        if (!seen[next]) {
          seen[next] = 1
          queue.push(next)
        }
      }
    }
  }

  return components
}

// The Z_3 (qutrit) version of the same code, with the complex's boundary maps taken with orientation
// over the field of three elements: the edge [a, b] (a < b) has boundary b - a, and the triangle
// (cell, cell + r1, cell + r2) is the oriented cycle cell -> cell + r1 -> cell + r2 -> cell. The X checks
// are the rows of the vertex boundary, the Z checks the rows of the triangle boundary, and they commute
// because d1 d2 = 0. The number of logical qutrits is the first Betti number over Z_3, which for the
// torsion-free four-torus is again 4 per component. The tone alphabet {-1, 0, +1} IS the qutrit alphabet.
export function ternaryVertexCheckRows(complex: CellComplex): Int8Array[] {
  const rows = Array.from({ length: complex.vertices }, () => new Int8Array(complex.edges.length))

  complex.edges.forEach(([a, b], edge) => {
    rows[a]![edge] = 2 // -1 mod 3
    rows[b]![edge] = 1
  })

  return rows
}

export function ternaryTriangleCheckRows(complex: CellComplex): Int8Array[] {
  return complex.triangles.map(([e1, e2, e3], triangle) => {
    const row = new Int8Array(complex.edges.length)
    const [v0, v1, v2] = complex.triangleVertices[triangle]!
    // traverse v0 -> v1 -> v2 -> v0, an edge counts +1 if traversed from its lower to its higher vertex
    const sign = (from: number, to: number): number => (from < to ? 1 : 2)

    row[e1] = sign(v0, v1)
    row[e2] = sign(v1, v2)
    row[e3] = sign(v2, v0)

    return row
  })
}

// d1 d2 = 0 over Z_3: every triangle row is annihilated by every vertex row
export function ternaryChecksCommute(vertexRows: Int8Array[], triangleRows: Int8Array[]): boolean {
  for (const t of triangleRows) {
    for (const v of vertexRows) {
      let sum = 0

      for (let e = 0; e < t.length; e++) {
        sum += t[e]! * v[e]!
      }

      if (sum % 3 !== 0) {
        return false
      }
    }
  }

  return true
}
