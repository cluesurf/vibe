// Discrete exterior calculus on a cell complex: the boundary maps, the exterior
// derivative d, the codifferential delta, and the Kahler-Dirac operator D = d + delta.
// This puts fermions on ANY oriented complex as differential FORMS, with no spin
// structure in the directions required, the route to spinors on {5,3,4} and {7,3} where
// the face-directions carry no spinor. The defining facts: d composed with d is zero, and
// D squared is the Hodge Laplacian, so D is a Dirac operator, a square root of the Laplacian.

export type Matrix = number[][]

// A graded chain complex: boundary[k] maps k+1 chains to k chains (so boundary[0] is
// edges to vertices, boundary[1] is faces to edges, and so on).
export interface CellComplex {
  dimensions: number[] // the count of cells in each grade, [vertices, edges, faces, ...]
  boundary: Matrix[] // boundary[k] has shape dimensions[k] by dimensions[k+1]
}

export function transpose(matrix: Matrix): Matrix {
  if (matrix.length === 0) {
    return []
  }

  return matrix[0]!.map((_, column) => matrix.map(row => row[column]!))
}

export function multiply(left: Matrix, right: Matrix): Matrix {
  const inner = right.length

  return left.map(row =>
    (right[0] ?? []).map((_, column) => {
      let sum = 0

      for (let index = 0; index < inner; index++) {
        sum += (row[index] ?? 0) * (right[index]![column] ?? 0)
      }

      return sum
    }),
  )
}

// The exterior derivative on grade k is the coboundary, the transpose of the boundary.
export function exteriorDerivative(
  complex: CellComplex,
  grade: number,
): Matrix {
  return transpose(complex.boundary[grade]!)
}

// Assemble the Kahler-Dirac operator D = d + delta as a single block matrix on the total
// graded space (vertices then edges then faces ...). d raises grade, delta lowers it.
export function kahlerDirac(complex: CellComplex): Matrix {
  const total = complex.dimensions.reduce(
    (sum, count) => sum + count,
    0,
  )

  const offset: number[] = []

  let running = 0

  for (const count of complex.dimensions) {
    offset.push(running)
    running += count
  }

  const operator: Matrix = Array.from({ length: total }, () =>
    new Array(total).fill(0),
  )

  for (let grade = 0; grade < complex.boundary.length; grade++) {
    const derivative = exteriorDerivative(complex, grade) // grade -> grade+1, shape next by current

    for (let row = 0; row < derivative.length; row++) {
      for (let column = 0; column < derivative[row]!.length; column++) {
        const value = derivative[row]![column]!

        if (value === 0) {
          continue
        }

        // d: grade -> grade+1 (lower-left block), delta = d transpose (upper-right)
        const lowerRow = offset[grade + 1]! + row
        const upperColumn = offset[grade]! + column
        operator[lowerRow]![upperColumn] =
          (operator[lowerRow]![upperColumn] ?? 0) + value
        operator[upperColumn]![lowerRow] =
          (operator[upperColumn]![lowerRow] ?? 0) + value
      }
    }
  }

  return operator
}

// The boundary maps for a single n-gon: n vertices, n edges, one face.
export function polygonComplex(sides: number): CellComplex {
  // boundary[0]: edges -> vertices (n by n). edge e goes from vertex e to vertex e+1.
  const edgesToVertices: Matrix = Array.from({ length: sides }, () =>
    new Array(sides).fill(0),
  )

  for (let edge = 0; edge < sides; edge++) {
    edgesToVertices[edge]![edge] = -1
    edgesToVertices[(edge + 1) % sides]![edge] = 1
  }

  // boundary[1]: the face -> edges (n by 1). the face boundary is the oriented cycle of all edges.
  const faceToEdges: Matrix = Array.from({ length: sides }, () => [1])

  return {
    dimensions: [sides, sides, 1],
    boundary: [edgesToVertices, faceToEdges],
  }
}

// Whether d composed with d is zero (the defining identity of a complex).
export function boundaryOfBoundaryIsZero(
  complex: CellComplex,
): boolean {
  for (let grade = 0; grade + 1 < complex.boundary.length; grade++) {
    const product = multiply(
      complex.boundary[grade]!,
      complex.boundary[grade + 1]!,
    )

    if (
      product.some(row => row.some(value => Math.abs(value) > 1e-9))
    ) {
      return false
    }
  }

  return true
}
