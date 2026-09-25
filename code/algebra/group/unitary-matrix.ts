// Complex N x N matrices for the compact gauge groups U(1), SU(2) and SU(3), stored flat in a
// Float64Array so a whole lattice of links is one buffer. A matrix occupies 2 * N * N doubles at an
// offset, row major, real then imaginary: entry (i, j) is at offset + 2 * (i * N + j).
//
// Every routine takes (buffer, offset) pairs so the hot loops of a lattice sweep never allocate. The
// scratch-free entry points write into an `out` buffer the caller owns.

export type MatrixSlot = {
  readonly data: Float64Array
  readonly offset: number
}

// The number of doubles one N x N complex matrix occupies.
export function matrixSize(input: { n: number }): number {
  return 2 * input.n * input.n
}

export function setIdentity(input: { n: number; out: MatrixSlot }): void {
  const { n, out } = input

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const k = out.offset + 2 * (i * n + j)

      out.data[k] = i === j ? 1 : 0
      out.data[k + 1] = 0
    }
  }
}

export function copyMatrix(input: {
  n: number
  from: MatrixSlot
  out: MatrixSlot
}): void {
  const size = 2 * input.n * input.n

  for (let k = 0; k < size; k++) {
    input.out.data[input.out.offset + k] =
      input.from.data[input.from.offset + k] ?? 0
  }
}

export function zeroMatrix(input: { n: number; out: MatrixSlot }): void {
  const size = 2 * input.n * input.n

  for (let k = 0; k < size; k++) {
    input.out.data[input.out.offset + k] = 0
  }
}

// out += a
export function addInto(input: {
  n: number
  a: MatrixSlot
  out: MatrixSlot
}): void {
  const size = 2 * input.n * input.n

  for (let k = 0; k < size; k++) {
    input.out.data[input.out.offset + k] =
      (input.out.data[input.out.offset + k] ?? 0) +
      (input.a.data[input.a.offset + k] ?? 0)
  }
}

// The four products a b, a b^dag, a^dag b and a^dag b^dag, selected by two flags. `out` must not
// alias a or b.
export function multiplyInto(input: {
  n: number
  a: MatrixSlot
  b: MatrixSlot
  out: MatrixSlot
  daggerA?: boolean
  daggerB?: boolean
}): void {
  const { n, a, b, out } = input
  const daggerA = input.daggerA === true
  const daggerB = input.daggerB === true
  const ad = a.data
  const bd = b.data
  const od = out.data

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        // a(i, k), or conj(a(k, i)) under the dagger
        const ak = a.offset + 2 * (daggerA ? k * n + i : i * n + k)
        const bk = b.offset + 2 * (daggerB ? j * n + k : k * n + j)
        const ar = ad[ak] ?? 0
        const ai = daggerA ? -(ad[ak + 1] ?? 0) : (ad[ak + 1] ?? 0)
        const br = bd[bk] ?? 0
        const bi = daggerB ? -(bd[bk + 1] ?? 0) : (bd[bk + 1] ?? 0)

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      const o = out.offset + 2 * (i * n + j)

      od[o] = re
      od[o + 1] = im
    }
  }
}

// Re Tr a
export function realTrace(input: { n: number; a: MatrixSlot }): number {
  let total = 0

  for (let i = 0; i < input.n; i++) {
    total += input.a.data[input.a.offset + 2 * (i * input.n + i)] ?? 0
  }

  return total
}

// Im Tr a
export function imaginaryTrace(input: { n: number; a: MatrixSlot }): number {
  let total = 0

  for (let i = 0; i < input.n; i++) {
    total += input.a.data[input.a.offset + 2 * (i * input.n + i) + 1] ?? 0
  }

  return total
}

// Re Tr (a b), without forming the product. The link action of a lattice gauge field is this with
// a the link and b the staple sum.
export function realTraceOfProduct(input: {
  n: number
  a: MatrixSlot
  b: MatrixSlot
}): number {
  const { n, a, b } = input

  let total = 0

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ak = a.offset + 2 * (i * n + k)
      const bk = b.offset + 2 * (k * n + i)

      total +=
        (a.data[ak] ?? 0) * (b.data[bk] ?? 0) -
        (a.data[ak + 1] ?? 0) * (b.data[bk + 1] ?? 0)
    }
  }

  return total
}

// Project a matrix that has drifted by rounding back onto the group. N = 1 rescales to unit modulus.
// N >= 2 runs Gram-Schmidt on the rows, and for SU(3) the third row is rebuilt as the conjugate of
// the cross product of the first two, which fixes the determinant to exactly one. SU(2) fixes it by
// rebuilding the second row as (-conj b, conj a) from the first row (a, b). SU(N) for N >= 4
// orthonormalizes every row and turns the last by the conjugate of the determinant's phase.
export function reunitarize(input: { n: number; out: MatrixSlot }): void {
  const { n } = input
  const d = input.out.data
  const o = input.out.offset

  if (n === 1) {
    const r = Math.hypot(d[o] ?? 0, d[o + 1] ?? 0) || 1

    d[o] = (d[o] ?? 0) / r
    d[o + 1] = (d[o + 1] ?? 0) / r

    return
  }

  // normalize row 0
  normalizeRow({ n, data: d, offset: o, row: 0 })

  if (n === 2) {
    const ar = d[o] ?? 0
    const ai = d[o + 1] ?? 0
    const br = d[o + 2] ?? 0
    const bi = d[o + 3] ?? 0

    d[o + 4] = -br
    d[o + 5] = bi
    d[o + 6] = ar
    d[o + 7] = -ai

    return
  }

  // row 1 minus its projection on row 0, then normalize
  let pr = 0
  let pi = 0

  for (let j = 0; j < n; j++) {
    const xr = d[o + 2 * j] ?? 0
    const xi = d[o + 2 * j + 1] ?? 0
    const yr = d[o + 2 * (n + j)] ?? 0
    const yi = d[o + 2 * (n + j) + 1] ?? 0

    // conj(x) . y
    pr += xr * yr + xi * yi
    pi += xr * yi - xi * yr
  }

  for (let j = 0; j < n; j++) {
    const xr = d[o + 2 * j] ?? 0
    const xi = d[o + 2 * j + 1] ?? 0
    const k = o + 2 * (n + j)

    d[k] = (d[k] ?? 0) - (pr * xr - pi * xi)
    d[k + 1] = (d[k + 1] ?? 0) - (pr * xi + pi * xr)
  }

  normalizeRow({ n, data: d, offset: o, row: 1 })

  if (n > 3) {
    // SU(N), N >= 4: Gram-Schmidt the remaining rows, then fix the determinant to one by turning
    // the last row by the conjugate of the determinant's phase (a determinant is linear in a row)
    for (let row = 2; row < n; row++) {
      for (let previous = 0; previous < row; previous++) {
        subtractProjection({ n, data: d, offset: o, row, onto: previous })
      }

      normalizeRow({ n, data: d, offset: o, row })
    }

    const [re, im] = determinant({ n, a: input.out })
    const modulus = Math.hypot(re, im) || 1
    const cr = re / modulus
    const ci = -im / modulus

    for (let j = 0; j < n; j++) {
      const k = o + 2 * ((n - 1) * n + j)
      const xr = d[k] ?? 0
      const xi = d[k + 1] ?? 0

      d[k] = xr * cr - xi * ci
      d[k + 1] = xr * ci + xi * cr
    }

    return
  }

  // row 2 = conj(row0 x row1)
  const u = (j: number, part: number): number => d[o + 2 * j + part] ?? 0
  const v = (j: number, part: number): number => d[o + 2 * (3 + j) + part] ?? 0
  const crossRe = (j: number, k: number): number =>
    u(j, 0) * v(k, 0) - u(j, 1) * v(k, 1) - (u(k, 0) * v(j, 0) - u(k, 1) * v(j, 1))
  const crossIm = (j: number, k: number): number =>
    u(j, 0) * v(k, 1) + u(j, 1) * v(k, 0) - (u(k, 0) * v(j, 1) + u(k, 1) * v(j, 0))

  const c0r = crossRe(1, 2)
  const c0i = crossIm(1, 2)
  const c1r = crossRe(2, 0)
  const c1i = crossIm(2, 0)
  const c2r = crossRe(0, 1)
  const c2i = crossIm(0, 1)

  d[o + 12] = c0r
  d[o + 13] = -c0i
  d[o + 14] = c1r
  d[o + 15] = -c1i
  d[o + 16] = c2r
  d[o + 17] = -c2i
}

// row -= <onto, row> onto, for a unit row `onto`
function subtractProjection(input: {
  n: number
  data: Float64Array
  offset: number
  row: number
  onto: number
}): void {
  const { n, data, offset, row, onto } = input

  let pr = 0
  let pi = 0

  for (let j = 0; j < n; j++) {
    const x = offset + 2 * (onto * n + j)
    const y = offset + 2 * (row * n + j)
    const xr = data[x] ?? 0
    const xi = data[x + 1] ?? 0
    const yr = data[y] ?? 0
    const yi = data[y + 1] ?? 0

    pr += xr * yr + xi * yi
    pi += xr * yi - xi * yr
  }

  for (let j = 0; j < n; j++) {
    const x = offset + 2 * (onto * n + j)
    const y = offset + 2 * (row * n + j)
    const xr = data[x] ?? 0
    const xi = data[x + 1] ?? 0

    data[y] = (data[y] ?? 0) - (pr * xr - pi * xi)
    data[y + 1] = (data[y + 1] ?? 0) - (pr * xi + pi * xr)
  }
}

function normalizeRow(input: {
  n: number
  data: Float64Array
  offset: number
  row: number
}): void {
  const { n, data, offset, row } = input

  let norm = 0

  for (let j = 0; j < n; j++) {
    const k = offset + 2 * (row * n + j)

    norm += (data[k] ?? 0) ** 2 + (data[k + 1] ?? 0) ** 2
  }

  const scale = 1 / (Math.sqrt(norm) || 1)

  for (let j = 0; j < n; j++) {
    const k = offset + 2 * (row * n + j)

    data[k] = (data[k] ?? 0) * scale
    data[k + 1] = (data[k + 1] ?? 0) * scale
  }
}

// The determinant of an N x N complex matrix, as [re, im]. A group-membership check. Closed forms
// for N <= 3, Gaussian elimination with partial pivoting above.
export function determinant(input: {
  n: number
  a: MatrixSlot
}): [number, number] {
  const { n } = input

  if (n > 3) {
    return eliminationDeterminant(input)
  }

  const d = input.a.data
  const o = input.a.offset
  const re = (i: number, j: number): number => d[o + 2 * (i * n + j)] ?? 0
  const im = (i: number, j: number): number => d[o + 2 * (i * n + j) + 1] ?? 0
  const mul = (
    a: [number, number],
    b: [number, number],
  ): [number, number] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
  const at = (i: number, j: number): [number, number] => [re(i, j), im(i, j)]

  if (n === 1) {
    return at(0, 0)
  }

  if (n === 2) {
    const p = mul(at(0, 0), at(1, 1))
    const q = mul(at(0, 1), at(1, 0))

    return [p[0] - q[0], p[1] - q[1]]
  }

  const minor = (a: number, b: number, c: number, e: number): [number, number] => {
    const p = mul(at(1, a), at(2, b))
    const q = mul(at(1, c), at(2, e))

    return [p[0] - q[0], p[1] - q[1]]
  }

  const t0 = mul(at(0, 0), minor(1, 2, 2, 1))
  const t1 = mul(at(0, 1), minor(0, 2, 2, 0))
  const t2 = mul(at(0, 2), minor(0, 1, 1, 0))

  return [t0[0] - t1[0] + t2[0], t0[1] - t1[1] + t2[1]]
}

function eliminationDeterminant(input: { n: number; a: MatrixSlot }): [number, number] {
  const { n } = input
  const m = new Float64Array(2 * n * n)

  for (let k = 0; k < 2 * n * n; k++) {
    m[k] = input.a.data[input.a.offset + k] ?? 0
  }

  let dr = 1
  let di = 0

  for (let column = 0; column < n; column++) {
    let pivot = column
    let best = 0

    for (let row = column; row < n; row++) {
      const size = Math.hypot(m[2 * (row * n + column)] ?? 0, m[2 * (row * n + column) + 1] ?? 0)

      if (size > best) {
        best = size
        pivot = row
      }
    }

    if (best === 0) {
      return [0, 0]
    }

    if (pivot !== column) {
      for (let j = 0; j < n; j++) {
        for (let part = 0; part < 2; part++) {
          const a = 2 * (column * n + j) + part
          const b = 2 * (pivot * n + j) + part
          const hold = m[a] ?? 0

          m[a] = m[b] ?? 0
          m[b] = hold
        }
      }

      dr = -dr
      di = -di
    }

    const hr = m[2 * (column * n + column)] ?? 0
    const hi = m[2 * (column * n + column) + 1] ?? 0
    const nextR = dr * hr - di * hi
    const nextI = dr * hi + di * hr

    dr = nextR
    di = nextI

    const hh = hr * hr + hi * hi

    for (let row = column + 1; row < n; row++) {
      const xr = m[2 * (row * n + column)] ?? 0
      const xi = m[2 * (row * n + column) + 1] ?? 0
      // factor = x / h
      const fr = (xr * hr + xi * hi) / hh
      const fi = (xi * hr - xr * hi) / hh

      for (let j = column; j < n; j++) {
        const cr = m[2 * (column * n + j)] ?? 0
        const ci = m[2 * (column * n + j) + 1] ?? 0
        const k = 2 * (row * n + j)

        m[k] = (m[k] ?? 0) - (fr * cr - fi * ci)
        m[k + 1] = (m[k + 1] ?? 0) - (fr * ci + fi * cr)
      }
    }
  }

  return [dr, di]
}

// The largest entry of |a a^dag - 1|, the distance from unitarity.
export function unitarityDefect(input: { n: number; a: MatrixSlot }): number {
  const { n } = input
  const scratch = new Float64Array(2 * n * n)

  multiplyInto({
    n,
    a: input.a,
    b: input.a,
    out: { data: scratch, offset: 0 },
    daggerB: true,
  })

  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const k = 2 * (i * n + j)
      const re = (scratch[k] ?? 0) - (i === j ? 1 : 0)
      const im = scratch[k + 1] ?? 0

      worst = Math.max(worst, Math.hypot(re, im))
    }
  }

  return worst
}

// Multiply the center element exp(2 pi i k / N) into a matrix, in place. The center of SU(N) is Z_N,
// the phases that commute with every element. A center transformation of every time-like link on one
// time slice leaves the Wilson action unchanged and rotates the Polyakov loop by the same phase.
export function multiplyByCenter(input: {
  n: number
  k: number
  out: MatrixSlot
}): void {
  const angle = (2 * Math.PI * input.k) / input.n
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const size = input.n * input.n
  const d = input.out.data

  for (let e = 0; e < size; e++) {
    const k = input.out.offset + 2 * e
    const re = d[k] ?? 0
    const im = d[k + 1] ?? 0

    d[k] = re * c - im * s
    d[k + 1] = re * s + im * c
  }
}
