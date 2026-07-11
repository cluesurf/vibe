// Small dense matrices on typed arrays, row-major. For state-space operators in
// P1 and as a target for sparse-to-dense conversion in the eigensolvers.

export type DenseMatrix = {
  readonly form: 'dense'
  readonly rows: number
  readonly cols: number
  readonly data: Float64Array // row major: data[r * cols + c]
}

export function makeDense(input: {
  rows: number
  cols: number
}): DenseMatrix {
  return {
    form: 'dense',
    rows: input.rows,
    cols: input.cols,
    data: new Float64Array(input.rows * input.cols),
  }
}

export function denseGet(
  m: DenseMatrix,
  input: { row: number; col: number },
): number {
  return m.data[input.row * m.cols + input.col] ?? 0
}

export function denseSet(
  m: DenseMatrix,
  input: { row: number; col: number; value: number },
): void {
  m.data[input.row * m.cols + input.col] = input.value
}

export function denseMatVec(
  m: DenseMatrix,
  input: { x: Float64Array },
): Float64Array {
  const y = new Float64Array(m.rows)

  for (let r = 0; r < m.rows; r++) {
    let s = 0

    const base = r * m.cols

    for (let c = 0; c < m.cols; c++) {
      s += (m.data[base + c] ?? 0) * (input.x[c] ?? 0)
    }

    y[r] = s
  }

  return y
}

// Plain square-matrix product over number[][]. The small dense multiply behind finite
// matrix-group closures and invariant-theory counts.
export function matrixProduct(
  a: number[][],
  b: number[][],
): number[][] {
  const n = a.length
  const inner = b.length
  const cols = b[0]?.length ?? 0
  const out: number[][] = []

  for (let i = 0; i < n; i++) {
    const row: number[] = new Array(cols).fill(0)

    for (let k = 0; k < inner; k++) {
      const aik = a[i]![k]!

      if (aik === 0) {
        continue
      }

      const bk = b[k]!

      for (let j = 0; j < cols; j++) {
        row[j]! += aik * bk[j]!
      }
    }

    out.push(row)
  }

  return out
}

// Determinant of a small square matrix (number[][]) by Gaussian elimination with partial pivoting.
// Returns 0 on a (near) singular pivot. The exact-arithmetic-friendly routine behind Coxeter Gram
// signature tests (leading principal minors) and other small linear-algebra checks.
export function determinant(a: number[][]): number {
  const n = a.length
  const m = a.map(row => row.slice())

  let det = 1

  for (let col = 0; col < n; col++) {
    let pivot = col

    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r]![col]!) > Math.abs(m[pivot]![col]!)) {
        pivot = r
      }
    }

    if (Math.abs(m[pivot]![col]!) < 1e-15) {
      return 0
    }

    if (pivot !== col) {
      const tmp = m[pivot]!

      m[pivot] = m[col]!
      m[col] = tmp
      det = -det
    }

    det *= m[col]![col]!

    for (let r = col + 1; r < n; r++) {
      const f = m[r]![col]! / m[col]![col]!

      for (let c = col; c < n; c++) {
        m[r]![c]! -= f * m[col]![c]!
      }
    }
  }

  return det
}

// Solve the dense linear system A x = b by Gauss-Jordan elimination with partial pivoting. A is a
// square matrix as rows, b the right-hand side. Returns the solution vector x.
export function solveLinearSystem(input: {
  matrix: number[][]
  rightHandSide: number[]
}): number[] {
  const A = input.matrix
  const b = input.rightHandSide
  const n = b.length
  const m = A.map((row, i) => [...row, b[i] ?? 0])

  for (let col = 0; col < n; col++) {
    let pivot = col

    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r]![col]!) > Math.abs(m[pivot]![col]!)) {
        pivot = r
      }
    }

    const tmp = m[col]!

    m[col] = m[pivot]!
    m[pivot] = tmp

    const d = m[col]![col]!

    for (let c = col; c <= n; c++) {
      m[col]![c]! /= d
    }

    for (let r = 0; r < n; r++) {
      if (r === col) {
        continue
      }

      const factor = m[r]![col]!

      for (let c = col; c <= n; c++) {
        m[r]![c]! -= factor * m[col]![c]!
      }
    }
  }

  return m.map(row => row[n]!)
}

export type ComplexMatrix = {
  readonly form: 'complex-matrix'
  readonly rows: number
  readonly cols: number
  readonly re: Float64Array
  readonly im: Float64Array
}

export function makeComplexMatrix(input: {
  rows: number
  cols: number
}): ComplexMatrix {
  const n = input.rows * input.cols

  return {
    form: 'complex-matrix',
    rows: input.rows,
    cols: input.cols,
    re: new Float64Array(n),
    im: new Float64Array(n),
  }
}
