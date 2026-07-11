// The matrix-rep Coxeter reflection group as a cell graph. Each generator is the reflection matrix
// in the simple-root (mirror-normal) basis, R_i = I - 2 G_i (the standard geometric rep of a
// Coxeter system from its Gram matrix). Cells are group elements reached by right-multiplying
// generators, indexed by a rounded matrix key, and adjacency joins a cell to its neighbour across
// each generator. BFS grows the graph shell by shell up to a cell cap, so a hyperbolic symbol grows
// exponentially and a Euclidean one polynomially. This is the matrix-group sibling of the
// coordinate-based cell-direct builder: it carries the full reflection-group element per cell rather
// than a coset coordinate, which is what a dynamics rule needs to walk the real generated geometry.

import { gramMatrix } from '@/code/substrate/coxeter/schlafli'

// The reflection matrices of a linear Coxeter symbol, in the simple-root basis: R_i = I - 2 G_i,
// where G is the Gram matrix of the mirror normals.
export function reflections(symbol: number[]): number[][][] {
  const gram = gramMatrix(symbol)
  const n = gram.length

  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, k) =>
      Array.from({ length: n }, (_, j) =>
        k === i
          ? (j === i ? 1 : 0) - 2 * gram[i]![j]!
          : k === j
            ? 1
            : 0,
      ),
    ),
  )
}

// Matrix product of two square matrices.
export function multiply(a: number[][], b: number[][]): number[][] {
  return a.map(row =>
    b[0]!.map((_, j) =>
      row.reduce((sum, value, k) => sum + value * b[k]![j]!, 0),
    ),
  )
}

// A rounded string key for a group-element matrix (rounded to 1e-5), so equal group elements map to
// the same cell despite floating-point drift in the reflection products.
export function matrixKey(matrix: number[][]): string {
  return matrix
    .flat()
    .map(value => Math.round(value * 1e5))
    .join(',')
}

// BFS the cell graph of the matrix reflection group up to maxCells cells, returning the shell sizes
// AND the adjacency (for each cell, the index of its neighbour across each generator, or -1 if that
// neighbour falls outside the truncated mesh).
export function buildCoxeterMatrixMesh(
  symbol: number[],
  maxCells: number,
): { shells: number[]; adjacency: number[][] } {
  const generators = reflections(symbol)
  const degree = generators.length
  const n = symbol.length + 1
  const identity: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )

  const index = new Map<string, number>([[matrixKey(identity), 0]])
  const matrices: number[][][] = [identity]

  let frontier = [0]

  const shells = [1]

  while (index.size < maxCells && frontier.length > 0) {
    const next: number[] = []

    for (const cell of frontier) {
      for (let g = 0; g < degree; g++) {
        const neighbour = multiply(matrices[cell]!, generators[g]!)
        const id = matrixKey(neighbour)

        if (!index.has(id)) {
          index.set(id, matrices.length)
          matrices.push(neighbour)
          next.push(index.get(id)!)
        }
      }

      if (index.size >= maxCells) break
    }

    if (next.length > 0) shells.push(next.length)

    frontier = next
  }

  // resolve the adjacency now that all cells are known
  const adjacency = matrices.map(matrix =>
    generators.map(
      generator =>
        index.get(matrixKey(multiply(matrix, generator))) ?? -1,
    ),
  )

  return { shells, adjacency }
}
