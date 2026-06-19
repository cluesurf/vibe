// The discrete Kahler-Dirac operator D = d + delta on a cell complex derived
// from a substrate. A spinor is one element of the direct sum of cochain spaces
// (0-cochains on vertices, 1-cochains on edges, 2-cochains on triangles), that
// is, one tone per cell across grades. This satisfies monism route 2 by
// construction. The low spectrum read as a dispersion relation gives the P4
// fermion-doubling check.

import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import {
  SparseMatrix,
  Triplet,
  LinearOperator,
  sparseFromTriplets,
  sparseMatVec,
  operatorFromSparse,
} from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'

// A cell complex: cellCount[k] is the number of k-cells, boundary[k] is the
// boundary map from k-cells to (k-1)-cells with orientation signs. boundary[0]
// is a placeholder empty map (vertices have no boundary).
export interface CellComplex {
  readonly form: 'cell-complex'
  readonly cellCount: readonly number[]
  readonly boundary: readonly SparseMatrix[]
}

// Build a cell complex from a substrate up to grade maxGrade.
//   0-cells = vertices (substrate elements)
//   1-cells = undirected edges (a < b), one per pair
//   2-cells = triangles (3-cliques), only when maxGrade >= 2
// Orientation is fixed by vertex order (ascending). boundary[1] sends an edge
// (a, b) to +b - a; boundary[2] sends a triangle (a, b, c) with a<b<c to the
// alternating sum of its faces (b,c) - (a,c) + (a,b).
export function cellComplexOf(input: {
  substrate: Substrate
  maxGrade: number
}): CellComplex {
  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  const vertexCount = adjacency.length

  // 1-cells: undirected edges a < b, with an index lookup.
  const edges: { a: number; b: number }[] = []
  const edgeIndex = new Map<string, number>()

  for (let a = 0; a < vertexCount; a++) {
    const row = adjacency[a] ?? new Uint32Array(0)

    for (let k = 0; k < row.length; k++) {
      const b = row[k] ?? 0

      if (a < b) {
        edgeIndex.set(`${a},${b}`, edges.length)
        edges.push({ a, b })
      }
    }
  }

  // Fast neighbor membership test for clique finding.
  const neighborSet: Set<number>[] = adjacency.map(
    row => new Set(Array.from(row)),
  )

  // boundary[1]: edges (1-cells) -> vertices (0-cells). Sign +1 at head b,
  // -1 at tail a, matching d acting as a difference along the edge.
  const boundary1Triplets: Triplet[] = []

  for (let e = 0; e < edges.length; e++) {
    const edge = edges[e]

    if (!edge) {
      continue
    }

    boundary1Triplets.push({ row: edge.b, col: e, value: 1 })
    boundary1Triplets.push({ row: edge.a, col: e, value: -1 })
  }

  const boundary1 = sparseFromTriplets({
    rows: vertexCount,
    cols: edges.length,
    triplets: boundary1Triplets,
  })

  const cellCount: number[] = [vertexCount, edges.length]
  // boundary[0] is empty: vertices have no boundary (0 rows is degenerate, so
  // use a single-column-free map of shape vertexCount x 0 is also degenerate;
  // store a 1x1 zero placeholder that is never assembled into D).
  const boundary0 = sparseFromTriplets({
    rows: 0,
    cols: vertexCount,
    triplets: [],
  })

  const boundary: SparseMatrix[] = [boundary0, boundary1]

  if (input.maxGrade >= 2) {
    // 2-cells: triangles (3-cliques). For each edge a<b, scan common neighbors
    // c with c > b so each triangle a<b<c is found exactly once.
    const triangles: { a: number; b: number; c: number }[] = []

    for (let e = 0; e < edges.length; e++) {
      const edge = edges[e]

      if (!edge) {
        continue
      }

      const { a, b } = edge
      const setA = neighborSet[a]
      const setB = neighborSet[b]

      if (!setA || !setB) {
        continue
      }

      for (const c of setB) {
        if (c > b && setA.has(c)) {
          triangles.push({ a, b, c })
        }
      }
    }

    // boundary[2]: triangles (2-cells) -> edges (1-cells). With a<b<c the
    // oriented boundary is (b,c) - (a,c) + (a,b).
    const boundary2Triplets: Triplet[] = []

    for (let t = 0; t < triangles.length; t++) {
      const tri = triangles[t]

      if (!tri) {
        continue
      }

      const eBC = edgeIndex.get(`${tri.b},${tri.c}`)
      const eAC = edgeIndex.get(`${tri.a},${tri.c}`)
      const eAB = edgeIndex.get(`${tri.a},${tri.b}`)

      if (eBC !== undefined) {
        boundary2Triplets.push({ row: eBC, col: t, value: 1 })
      }

      if (eAC !== undefined) {
        boundary2Triplets.push({ row: eAC, col: t, value: -1 })
      }

      if (eAB !== undefined) {
        boundary2Triplets.push({ row: eAB, col: t, value: 1 })
      }
    }

    const boundary2 = sparseFromTriplets({
      rows: edges.length,
      cols: triangles.length,
      triplets: boundary2Triplets,
    })

    cellCount.push(triangles.length)
    boundary.push(boundary2)
  }

  return { form: 'cell-complex', cellCount, boundary }
}

// Build D = d + delta on the direct sum of cochain spaces. The stacked vector
// is [0-cochains; 1-cochains; 2-cochains], with grade k starting at offset[k].
//
// Block layout: D couples adjacent grades only. For boundary map
// B_k : C_k -> C_{k-1} (shape cellCount[k-1] x cellCount[k]):
//   - delta_k = B_k maps k-cochains down to (k-1)-cochains. This is the block
//     at rows offset[k-1], cols offset[k].
//   - d_{k-1} = B_k^T maps (k-1)-cochains up to k-cochains. This is the mirror
//     block at rows offset[k], cols offset[k-1].
// Placing B_k and its transpose in mirror positions makes the whole operator
// symmetric, so the Lanczos solver applies.
export function kahlerDirac(input: {
  complex: CellComplex
}): SparseMatrix {
  const cellCount = input.complex.cellCount
  const grades = cellCount.length

  // Offsets of each grade block within the stacked vector.
  const offset: number[] = new Array<number>(grades + 1)
  offset[0] = 0

  for (let k = 0; k < grades; k++) {
    offset[k + 1] = (offset[k] ?? 0) + (cellCount[k] ?? 0)
  }

  const total = offset[grades] ?? 0

  const triplets: Triplet[] = []

  // For each grade k >= 1, fold in boundary[k] (shape (k-1)-cells x k-cells).
  for (let k = 1; k < grades; k++) {
    const b = input.complex.boundary[k]

    if (!b) {
      continue
    }

    const lowOffset = offset[k - 1] ?? 0
    const highOffset = offset[k] ?? 0

    // Walk the CSR rows of B_k. row r is a (k-1)-cell, col c is a k-cell.
    for (let r = 0; r < b.rows; r++) {
      const start = b.rowPtr[r] ?? 0
      const end = b.rowPtr[r + 1] ?? 0

      for (let p = start; p < end; p++) {
        const c = b.colIdx[p] ?? 0
        const value = b.value[p] ?? 0
        // delta block: maps high grade k down to low grade k-1.
        triplets.push({
          row: lowOffset + r,
          col: highOffset + c,
          value,
        })
        // d block (transpose): maps low grade k-1 up to high grade k.
        triplets.push({
          row: highOffset + c,
          col: lowOffset + r,
          value,
        })
      }
    }
  }

  return sparseFromTriplets({ rows: total, cols: total, triplets })
}

// The lowest `count` eigenvalues of D (ascending) via Lanczos.
export function diracSpectrum(input: {
  complex: CellComplex
  count: number
}): Float64Array {
  const matrix = kahlerDirac({ complex: input.complex })
  const operator = operatorFromSparse(matrix)

  return lowestEigenvalues({ operator, count: input.count })
}

// The smallest |eigenvalues| of the Kahler-Dirac operator D, plus a count of those
// below `threshold` (the harmonic zero modes). D is indefinite, so zero modes sit in
// the MIDDLE of its spectrum. We find them as the smallest eigenvalues of the positive
// operator D^2 and return their square roots. The zero-mode count is a topological
// invariant equal to the Betti sum of the complex.
export function kahlerDiracZeroModes(input: {
  complex: CellComplex
  count: number
  threshold: number
  steps?: number
}): { smallestMagnitudes: number[]; zeroModes: number } {
  const dirac = kahlerDirac({ complex: input.complex })
  const dSquared: LinearOperator = {
    size: dirac.rows,
    apply: ({ x }) =>
      sparseMatVec(dirac, { x: sparseMatVec(dirac, { x }) }),
  }

  const squared = lowestEigenvalues({
    operator: dSquared,
    count: input.count,
    ...(input.steps === undefined ? {} : { steps: input.steps }),
  })

  const smallestMagnitudes = Array.from(squared, v =>
    Math.sqrt(Math.max(0, v)),
  )

  const zeroModes = smallestMagnitudes.filter(
    x => x < input.threshold,
  ).length

  return { smallestMagnitudes, zeroModes }
}
