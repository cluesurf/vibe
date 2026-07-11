// The cone-type transfer matrix of a hyperbolic tessellation, the memory-optimal route to the
// EXACT growth rate (the warp factor). Enumerating shells to get the growth rate runs out of
// memory (shell six is fifty million cells), but the growth rate is an algebraic number pinned by a
// tiny matrix. By Cannon's theorem the cells of a hyperbolic tessellation fall into finitely many
// CONE TYPES, and the count of each type in the next shell is a fixed linear function of the counts
// in this shell, so the type vector satisfies v(n+1) = M v(n) for a small integer matrix M. The
// growth rate is the largest eigenvalue of M, and the characteristic polynomial of M is the exact
// minimal polynomial of the growth rate. The matrix is extracted from ONE small graph build, then
// it gives every shell count and the exact constant with no further memory.
//
// For {3,4,3,4} the cone type is simply the BACK-DEGREE (the number of neighbours a cell has in the
// previous shell), which is one, two, or three, and it is complete at every shell because backward
// edges are never truncated by a finite build. So a build to shell four (about 162000 cells)
// suffices to read off the three type vectors and solve the 3x3 matrix.

// breadth-first distances from a root on a neighbour list
function bfsDistances(
  neighbors: readonly (readonly number[])[],
  root: number,
): number[] {
  const distance = new Array<number>(neighbors.length).fill(-1)

  distance[root] = 0

  let frontier = [root]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const cell of frontier) {
      for (const nb of neighbors[cell] ?? []) {
        if (distance[nb] === -1) {
          distance[nb] = distance[cell]! + 1
          next.push(nb)
        }
      }
    }

    frontier = next
  }

  return distance
}

// the type vector of a shell, the count of cells with back-degree one, two, three (cone types A, B,
// C). Back-degree is the number of neighbours in the previous shell, complete at every shell.
export function shellTypeVectors(input: {
  neighbors: readonly (readonly number[])[]
  throughShell: number
}): number[][] {
  const { neighbors, throughShell } = input
  const distance = bfsDistances(neighbors, 0)

  const backDegree = (cell: number): number => {
    const d = distance[cell]!

    let back = 0

    for (const nb of neighbors[cell] ?? []) {
      if (distance[nb] === d - 1) {
        back++
      }
    }

    return back
  }

  const vectors: number[][] = []

  for (let shell = 1; shell <= throughShell; shell++) {
    const vector = [0, 0, 0]

    for (let cell = 0; cell < neighbors.length; cell++) {
      if (distance[cell] === shell) {
        const back = backDegree(cell)

        if (back >= 1 && back <= 3) {
          vector[back - 1]!++
        }
      }
    }

    vectors.push(vector)
  }

  return vectors
}

// solve the 3x3 cone-type transfer matrix M from four consecutive type vectors, v(n+1) = M v(n).
// The first shell is a single type, so its column is read directly; the next two columns are read
// from the residuals of the following transitions.
export function coneTypeTransferMatrix(
  vectors: number[][],
): number[][] {
  const [s1, s2, s3, s4] = vectors as [
    number[],
    number[],
    number[],
    number[],
  ]

  const column1 = s2.map(x => x / s1[0]!)
  const residual2 = s3.map((x, i) => x - s2[0]! * column1[i]!)
  const column2 = residual2.map(x => x / s2[1]!)
  const residual3 = s4.map(
    (x, i) => x - s3[0]! * column1[i]! - s3[1]! * column2[i]!,
  )

  const column3 = residual3.map(x => x / s3[2]!)

  return [
    [column1[0]!, column2[0]!, column3[0]!],
    [column1[1]!, column2[1]!, column3[1]!],
    [column1[2]!, column2[2]!, column3[2]!],
  ]
}

// the characteristic polynomial of a 3x3 matrix as [trace, sumOfPrincipal2x2Minors, determinant],
// so the polynomial is lambda^3 - trace lambda^2 + minorSum lambda - determinant.
export function characteristicPolynomialCubic(m: number[][]): {
  trace: number
  minorSum: number
  determinant: number
} {
  const trace = m[0]![0]! + m[1]![1]! + m[2]![2]!
  const minorSum =
    m[0]![0]! * m[1]![1]! -
    m[0]![1]! * m[1]![0]! +
    (m[0]![0]! * m[2]![2]! - m[0]![2]! * m[2]![0]!) +
    (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!)

  const determinant =
    m[0]![0]! * (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!) -
    m[0]![1]! * (m[1]![0]! * m[2]![2]! - m[1]![2]! * m[2]![0]!) +
    m[0]![2]! * (m[1]![0]! * m[2]![1]! - m[1]![1]! * m[2]![0]!)

  return { trace, minorSum, determinant }
}

// the largest real root of the cubic lambda^3 - a lambda^2 + b lambda - c, by Newton from a seed.
export function largestCubicRoot(input: {
  a: number
  b: number
  c: number
  seed: number
}): number {
  const { a, b, c, seed } = input
  const value = (x: number): number => x ** 3 - a * x * x + b * x - c
  const slope = (x: number): number => 3 * x * x - 2 * a * x + b

  let x = seed

  for (let i = 0; i < 100; i++) {
    x = x - value(x) / slope(x)
  }

  return x
}
