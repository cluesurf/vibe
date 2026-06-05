// Bit-packed relation matrix. A Poset of size N stores its transitive closure
// as N rows of ceil(N/32) words, so set operations on relations are bitwise.

export interface BitMatrix {
  readonly form: 'bit-matrix'
  readonly rows: number
  readonly cols: number
  readonly stride: number // words per row = ceil(cols/32)
  readonly words: Uint32Array
}

export function makeBitMatrix(input: { rows: number; cols: number }): BitMatrix {
  const stride = (input.cols + 31) >>> 5
  return {
    form: 'bit-matrix',
    rows: input.rows,
    cols: input.cols,
    stride,
    words: new Uint32Array(input.rows * stride),
  }
}

export function setBit(m: BitMatrix, input: { row: number; col: number }): void {
  const i = input.row * m.stride + (input.col >>> 5)
  m.words[i] = (m.words[i] ?? 0) | (1 << (input.col & 31))
}

export function getBit(m: BitMatrix, input: { row: number; col: number }): boolean {
  const i = input.row * m.stride + (input.col >>> 5)
  return ((m.words[i] ?? 0) & (1 << (input.col & 31))) !== 0
}

function popcount32(x: number): number {
  let v = x - ((x >>> 1) & 0x55555555)
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

export function popcountRow(m: BitMatrix, input: { row: number }): number {
  const base = input.row * m.stride
  let total = 0
  for (let w = 0; w < m.stride; w++) {
    total += popcount32(m.words[base + w] ?? 0)
  }
  return total
}

// Number of set bits in (rowA AND rowB). Used for Alexandrov-interval sizes.
export function popcountAnd(
  m: BitMatrix,
  input: { rowA: number; rowB: number },
): number {
  const a = input.rowA * m.stride
  const b = input.rowB * m.stride
  let total = 0
  for (let w = 0; w < m.stride; w++) {
    total += popcount32((m.words[a + w] ?? 0) & (m.words[b + w] ?? 0))
  }
  return total
}

// Lowest-set-bit position of a 32-bit word, safe for bit 31.
function trailingZeros(word: number): number {
  const lsb = (word & -word) >>> 0
  return 31 - Math.clz32(lsb)
}

// Visit every column index set in a row, in increasing order.
export function forEachSetBit(
  m: BitMatrix,
  input: { row: number; visit: (col: number) => void },
): void {
  const base = input.row * m.stride
  for (let w = 0; w < m.stride; w++) {
    let bits = m.words[base + w] ?? 0
    while (bits !== 0) {
      const col = (w << 5) + trailingZeros(bits)
      input.visit(col)
      bits &= bits - 1
    }
  }
}

// Collect the set columns of a row into a sorted Uint32Array.
export function rowToArray(m: BitMatrix, input: { row: number }): Uint32Array {
  const out: number[] = []
  forEachSetBit(m, { row: input.row, visit: (col) => out.push(col) })
  return Uint32Array.from(out)
}
