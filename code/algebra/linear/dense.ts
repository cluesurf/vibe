// Small dense matrices on typed arrays, row-major. For state-space operators in
// P1 and as a target for sparse-to-dense conversion in the eigensolvers.

export interface DenseMatrix {
  readonly form: 'dense'
  readonly rows: number
  readonly cols: number
  readonly data: Float64Array // row major: data[r * cols + c]
}

export function makeDense(input: { rows: number; cols: number }): DenseMatrix {
  return {
    form: 'dense',
    rows: input.rows,
    cols: input.cols,
    data: new Float64Array(input.rows * input.cols),
  }
}

export function denseGet(m: DenseMatrix, input: { row: number; col: number }): number {
  return m.data[input.row * m.cols + input.col] ?? 0
}

export function denseSet(
  m: DenseMatrix,
  input: { row: number; col: number; value: number },
): void {
  m.data[input.row * m.cols + input.col] = input.value
}

export function denseMatVec(m: DenseMatrix, input: { x: Float64Array }): Float64Array {
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

export interface ComplexMatrix {
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
