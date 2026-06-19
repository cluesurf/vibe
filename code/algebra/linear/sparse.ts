// Compressed-sparse-row matrix for large operators (Laplacian, Dirac).

export interface SparseMatrix {
  readonly form: 'sparse'
  readonly rows: number
  readonly cols: number
  readonly rowPtr: Uint32Array // length rows + 1
  readonly colIdx: Uint32Array // length nnz
  readonly value: Float64Array // length nnz
}

export interface Triplet {
  readonly row: number
  readonly col: number
  readonly value: number
}

// Build a CSR matrix from triplets. Duplicate (row, col) entries are summed.
export function sparseFromTriplets(input: {
  rows: number
  cols: number
  triplets: ReadonlyArray<Triplet>
}): SparseMatrix {
  const counts = new Uint32Array(input.rows)

  for (const t of input.triplets) {
    counts[t.row] = (counts[t.row] ?? 0) + 1
  }

  const rowPtr = new Uint32Array(input.rows + 1)

  for (let r = 0; r < input.rows; r++) {
    rowPtr[r + 1] = (rowPtr[r] ?? 0) + (counts[r] ?? 0)
  }

  const nnz = rowPtr[input.rows] ?? 0
  const colIdx = new Uint32Array(nnz)
  const value = new Float64Array(nnz)
  const cursor = Uint32Array.from(rowPtr.subarray(0, input.rows))

  for (const t of input.triplets) {
    const pos = cursor[t.row] ?? 0
    colIdx[pos] = t.col
    value[pos] = t.value
    cursor[t.row] = pos + 1
  }

  return {
    form: 'sparse',
    rows: input.rows,
    cols: input.cols,
    rowPtr,
    colIdx,
    value,
  }
}

export function sparseMatVec(
  m: SparseMatrix,
  input: { x: Float64Array },
): Float64Array {
  const y = new Float64Array(m.rows)

  for (let r = 0; r < m.rows; r++) {
    const start = m.rowPtr[r] ?? 0
    const end = m.rowPtr[r + 1] ?? 0

    let s = 0

    for (let k = start; k < end; k++) {
      s += (m.value[k] ?? 0) * (input.x[m.colIdx[k] ?? 0] ?? 0)
    }

    y[r] = s
  }

  return y
}

// A symmetric linear operator presented to the Lanczos solver.
export interface LinearOperator {
  readonly size: number
  apply(input: { x: Float64Array }): Float64Array
}

export function operatorFromSparse(m: SparseMatrix): LinearOperator {
  return { size: m.rows, apply: ({ x }) => sparseMatVec(m, { x }) }
}

const AUBRY_ANDRE_GOLDEN = 0.6180339887498949

// The sparse operator with a deterministic quasiperiodic (Aubry-Andre) on-site potential added to
// the diagonal: V_i = strength * cos(2 pi golden i). At strength 0 it is the bare operator; a large
// strength drives Anderson-like localization with no randomness. The localization control behind the
// propagation tests.
export function sparseWithAubryAndrePotential(
  m: SparseMatrix,
  strength: number,
): LinearOperator {
  if (strength === 0) {
    return operatorFromSparse(m)
  }

  const potential = new Float64Array(m.rows)

  for (let i = 0; i < m.rows; i++) {
    potential[i] =
      strength * Math.cos(2 * Math.PI * AUBRY_ANDRE_GOLDEN * i)
  }

  return {
    size: m.rows,
    apply: ({ x }) => {
      const y = sparseMatVec(m, { x })

      for (let i = 0; i < m.rows; i++) {
        y[i] = y[i]! + potential[i]! * x[i]!
      }

      return y
    },
  }
}
