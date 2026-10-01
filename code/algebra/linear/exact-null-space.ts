// THE EXACT NULL SPACE OF A LARGE SPARSE INTEGER SYSTEM (E-FND-0170). A search for conserved quantities collects one
// integer row per observed step (the change of every feature count) and asks for every coefficient vector the rows all
// annihilate. The rows run to hundreds of thousands and the columns to a few thousand, so the system is solved through
// its Gram matrix: over the rationals null(A) = null(A^T A) exactly (A^T A x = 0 gives |A x|^2 = 0), and A^T A is
// square, n x n, whatever the row count.
//
//   RowSet           integer rows, deduplicated, with the columns any row touches
//   exactNullSpace   the null space of a RowSet over Q: A^T A reduced mod a prime below 2^25 (a product of two residues
//                    is below 2^50, exact in a double), eliminated mod p, its null basis read in reduced echelon form
//                    (each vector 1 on its own free column and 0 on every other free column), every entry lifted to a
//                    rational by rational reconstruction, and every vector then CHECKED against every row in exact
//                    integer arithmetic. The certificate: rank mod p is at most the rank over Q, so the null space mod
//                    p is at least as large as over Q; the verified vectors are rational members of null(A), independent
//                    (unit on their free columns), and as many as the mod-p dimension. So the two dimensions are equal
//                    and the basis is exact. A vector that fails to lift or to verify is reported, never dropped
//   inSpan           whether an integer vector lies in the span of a verified basis, exactly: in echelon form the only
//                    candidate combination is the vector's own entries on the free columns
//   spanResidual     a vector minus that candidate combination (zero exactly when it is in the span)
//   rankExact        the rank of a few integer vectors over Q, fraction-free (Bareiss) in BigInt
//   nullDimSmall     the null dimension over a small prime field (Z3), directly on the distinct rows
//
// DETERMINISM: no random numbers; the prime is the largest below 2^25. EXACT: integer rows, residues, BigInt.

import {
  inverseMod,
  mod,
  primeBelow,
  rankMod,
} from '@/code/algebra/linear/modular-linear'

export type SparseRow = {
  readonly idx: Int32Array
  readonly val: Float64Array
}

// integer rows over n columns, each distinct row kept once
export class RowSet {
  readonly n: number
  readonly rows: SparseRow[] = []
  readonly touched: Uint8Array
  private readonly seen = new Set<string>()

  constructor(n: number) {
    this.n = n
    this.touched = new Uint8Array(n)
  }

  // add a row given as column -> integer value (zeros ignored); returns whether it was new
  add(entries: ReadonlyMap<number, number>): boolean {
    const cols = [...entries.keys()]
      .filter(c => entries.get(c) !== 0)
      .sort((a, b) => a - b)

    if (cols.length === 0) {
      return false
    }

    const key = cols.map(c => `${c}:${entries.get(c)}`).join(',')

    if (this.seen.has(key)) {
      return false
    }

    this.seen.add(key)

    const idx = Int32Array.from(cols)
    const val = Float64Array.from(cols, c => entries.get(c)!)

    for (const c of cols) {
      if (c < 0 || c >= this.n || !Number.isInteger(entries.get(c))) {
        throw new Error(`exact-null-space: bad entry at column ${c}`)
      }

      this.touched[c] = 1
    }

    this.rows.push({ idx, val })

    return true
  }

  // the same rows restricted to the columns below `k` (a projection onto the first k features)
  project(k: number): RowSet {
    const out = new RowSet(k)

    for (const r of this.rows) {
      const m = new Map<number, number>()

      r.idx.forEach((c, i) => {
        if (c < k) {
          m.set(c, r.val[i]!)
        }
      })

      out.add(m)
    }

    return out
  }

  // every row of `other` added to this set (same column count)
  merge(other: RowSet): void {
    for (const r of other.rows) {
      const m = new Map<number, number>()

      r.idx.forEach((c, i) => m.set(c, r.val[i]!))
      this.add(m)
    }
  }
}

// a basis vector: x = num / den on the columns idx (num integers, den a positive integer)
export type ExactVector = {
  readonly free: number
  readonly idx: Int32Array
  readonly num: Float64Array
  readonly den: number
}

export type NullBasis = {
  readonly n: number
  readonly dim: number
  readonly prime: number
  readonly vectors: ExactVector[]
  // per column, the basis vector whose free column it is, or -1 (a pivot column)
  readonly freeOf: Int32Array
  // every vector lifted to a rational and every one checked against every row exactly
  readonly reconstructed: boolean
  readonly verified: boolean
  readonly rank: number
}

export const NULL_PRIME = primeBelow(2 ** 25)

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y !== 0) {
    const t = x % y

    x = y
    y = t
  }

  return x
}

// the rational n / d with |n|, d <= sqrt((p - 1) / 2) congruent to a mod p (Wang), or undefined
export function rationalOf(
  a: number,
  p: number,
): [number, number] | undefined {
  const bound = Math.floor(Math.sqrt((p - 1) / 2))

  let r0 = p
  let r1 = mod(a, p)
  let s0 = 0
  let s1 = 1

  while (r1 > bound) {
    const q = Math.floor(r0 / r1)

    ;[r0, r1] = [r1, r0 - q * r1]
    ;[s0, s1] = [s1, s0 - q * s1]
  }

  if (s1 === 0 || Math.abs(s1) > bound || gcd(r1, s1) !== 1) {
    return undefined
  }

  return s1 < 0 ? [-r1, -s1] : [r1, s1]
}

export function exactNullSpace(set: RowSet, p = NULL_PRIME): NullBasis {
  const n = set.n
  const cols: number[] = []
  const at = new Int32Array(n).fill(-1)

  for (let c = 0; c < n; c++) {
    if (set.touched[c]) {
      at[c] = cols.length
      cols.push(c)
    }
  }

  const m = cols.length
  const G = new Float64Array(m * m)

  // the Gram matrix mod p, accumulated row by row
  for (const r of set.rows) {
    const k = r.idx.length
    const ci = new Int32Array(k)
    const vi = new Float64Array(k)

    for (let i = 0; i < k; i++) {
      ci[i] = at[r.idx[i]!]!
      vi[i] = mod(r.val[i]!, p)
    }

    for (let i = 0; i < k; i++) {
      const base = ci[i]! * m
      const a = vi[i]!

      for (let j = 0; j < k; j++) {
        const o = base + ci[j]!

        G[o] = (G[o]! + ((a * vi[j]!) % p)) % p
      }
    }
  }

  // forward elimination mod p, unit pivots
  const pivotCol: number[] = []
  const isPivot = new Uint8Array(m)
  const NZ = new Int32Array(m)
  const invP = 1 / p

  let row = 0

  for (let c = 0; c < m && row < m; c++) {
    let i = row

    while (i < m && G[i * m + c] === 0) {
      i++
    }

    if (i === m) {
      continue
    }

    if (i !== row) {
      for (let j = c; j < m; j++) {
        const t = G[i * m + j]!

        G[i * m + j] = G[row * m + j]!
        G[row * m + j] = t
      }
    }

    const inv = inverseMod(G[row * m + c]!, p)
    const pr = row * m

    for (let j = c; j < m; j++) {
      G[pr + j] = (G[pr + j]! * inv) % p
    }

    // the pivot row's nonzero columns, so a sparse pivot row costs only its own entries
    let nz = 0

    for (let j = c; j < m; j++) {
      if (G[pr + j] !== 0) {
        NZ[nz++] = j
      }
    }

    for (let r2 = row + 1; r2 < m; r2++) {
      const o = r2 * m
      const f = G[o + c]!

      if (f === 0) {
        continue
      }

      // (g - f b) mod p with the reduction x - floor(x / p) p: f b < 2^50, exact in a double
      for (let k = 0; k < nz; k++) {
        const j = NZ[k]!
        const x = G[o + j]! - f * G[pr + j]!

        let r = x - Math.floor(x * invP) * p

        if (r < 0) {
          r += p
        } else if (r >= p) {
          r -= p
        }

        G[o + j] = r
      }
    }

    pivotCol.push(c)
    isPivot[c] = 1
    row++
  }

  const rank = pivotCol.length
  const freeOf = new Int32Array(n).fill(-1)
  const vectors: ExactVector[] = []

  let reconstructed = true

  // the free columns in increasing original order: the untouched ones and the touched non-pivots
  const freeCols: number[] = []

  for (let c = 0; c < n; c++) {
    if (at[c]! < 0 || !isPivot[at[c]!]) {
      freeCols.push(c)
    }
  }

  const x = new Float64Array(m)

  for (const fc of freeCols) {
    freeOf[fc] = vectors.length

    if (at[fc]! < 0) {
      vectors.push({
        free: fc,
        idx: Int32Array.of(fc),
        num: Float64Array.of(1),
        den: 1,
      })
      continue
    }

    x.fill(0)
    x[at[fc]!] = 1

    for (let k = rank - 1; k >= 0; k--) {
      const pc = pivotCol[k]!
      const o = k * m

      let s = 0

      for (let j = pc + 1; j < m; j++) {
        const g = G[o + j]!

        if (g !== 0 && x[j] !== 0) {
          s = (s + ((g * x[j]!) % p)) % p
        }
      }

      x[pc] = s === 0 ? 0 : p - s
    }

    const idx: number[] = []
    const fr: [number, number][] = []

    for (let j = 0; j < m; j++) {
      if (x[j] === 0) {
        continue
      }

      const q = rationalOf(x[j]!, p)

      if (!q) {
        reconstructed = false
        continue
      }

      idx.push(cols[j]!)
      fr.push(q)
    }

    let den = 1

    for (const [, d] of fr) {
      den = (den / gcd(den, d)) * d

      // past 2^40 the common denominator no longer certifies exactly: report, and stop growing it
      if (den > 2 ** 40) {
        reconstructed = false
        den = 1
        break
      }
    }

    vectors.push({
      free: fc,
      idx: Int32Array.from(idx),
      num: Float64Array.from(fr, ([a, d]) => a * (den / d)),
      den,
    })
  }

  return {
    n,
    dim: vectors.length,
    prime: p,
    vectors,
    freeOf,
    reconstructed,
    verified: reconstructed && verifyNull(set, vectors),
    rank,
  }
}

// every vector against every row, in exact integer arithmetic (a product sum is checked to stay below 2^53)
function verifyNull(set: RowSet, vectors: readonly ExactVector[]): boolean {
  const dense = new Float64Array(set.n)

  for (const v of vectors) {
    if (v.idx.length === 1 && !set.touched[v.idx[0]!]) {
      continue
    }

    dense.fill(0)
    v.idx.forEach((c, i) => (dense[c] = v.num[i]!))

    for (const r of set.rows) {
      let s = 0
      let bound = 0

      for (let i = 0; i < r.idx.length; i++) {
        const y = dense[r.idx[i]!]!

        if (y !== 0) {
          s += r.val[i]! * y
          bound += Math.abs(r.val[i]! * y)
        }
      }

      if (bound >= 2 ** 53 || s !== 0) {
        return false
      }
    }
  }

  return true
}

// y minus its only candidate combination of the basis (y's entries on the free columns), scaled to integers:
// the zero vector exactly when y lies in the span. y is an integer vector of length n
export function spanResidual(
  basis: NullBasis,
  y: ArrayLike<number>,
): bigint[] {
  let den = 1n

  for (const v of basis.vectors) {
    if (y[v.free] !== 0) {
      const d = BigInt(v.den)

      den = (den / gcdBig(den, d)) * d
    }
  }

  const out = Array.from({ length: basis.n }, (_, c) => BigInt(y[c]!) * den)

  for (const v of basis.vectors) {
    const a = y[v.free]!

    if (a === 0) {
      continue
    }

    const scale = BigInt(a) * (den / BigInt(v.den))

    v.idx.forEach((c, i) => {
      out[c] = out[c]! - scale * BigInt(v.num[i]!)
    })
  }

  return out
}

const gcdBig = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    const t = x % y

    x = y
    y = t
  }

  return x
}

export const inSpan = (basis: NullBasis, y: ArrayLike<number>): boolean =>
  spanResidual(basis, y).every(v => v === 0n)

// the same test for a sparse integer vector (column -> value), in exact double arithmetic: every product is checked to
// stay below 2^50, and a larger one throws rather than rounds
export function inSpanSparse(
  basis: NullBasis,
  y: ReadonlyMap<number, number>,
): boolean {
  let den = 1

  y.forEach((a, c) => {
    const j = basis.freeOf[c]!

    if (a !== 0 && j >= 0) {
      const d = basis.vectors[j]!.den

      den = (den / gcd(den, d)) * d
    }
  })

  const out = new Map<number, number>()

  const add = (c: number, v: number): void => {
    if (Math.abs(v) >= 2 ** 50) {
      throw new Error('exact-null-space: a span test left the exact range')
    }

    out.set(c, (out.get(c) ?? 0) + v)
  }

  y.forEach((a, c) => add(c, a * den))
  y.forEach((a, c) => {
    const j = basis.freeOf[c]!

    if (a === 0 || j < 0) {
      return
    }

    const v = basis.vectors[j]!
    const scale = a * (den / v.den)

    v.idx.forEach((k, i) => add(k, -scale * v.num[i]!))
  })

  for (const v of out.values()) {
    if (v !== 0) {
      return false
    }
  }

  return true
}

// the rank of integer vectors over Q, fraction-free elimination in BigInt (each new row divided by its content)
export function rankExact(vectors: readonly (readonly bigint[])[]): number {
  if (vectors.length === 0) {
    return 0
  }

  const a = vectors.map(v => [...v])
  const cols = a[0]!.length

  let r = 0

  for (let c = 0; c < cols && r < a.length; c++) {
    let i = r

    while (i < a.length && a[i]![c] === 0n) {
      i++
    }

    if (i === a.length) {
      continue
    }

    ;[a[i], a[r]] = [a[r]!, a[i]!]

    const pr = a[r]!
    const pv = pr[c]!

    for (let k = r + 1; k < a.length; k++) {
      const rk = a[k]!
      const f = rk[c]!

      if (f === 0n) {
        continue
      }

      let g = 0n

      for (let j = c; j < cols; j++) {
        rk[j] = pv * rk[j]! - f * pr[j]!
        g = gcdBig(g, rk[j]!)
      }

      if (g > 1n) {
        for (let j = c; j < cols; j++) {
          rk[j] = rk[j]! / g
        }
      }
    }

    r++
  }

  return r
}

// the null dimension over GF(q) for a small prime q, on the distinct rows reduced mod q
export function nullDimSmall(set: RowSet, q: number): number {
  const seen = new Set<string>()
  const rows: number[][] = []

  for (const r of set.rows) {
    const dense = new Array<number>(set.n).fill(0)

    r.idx.forEach((c, i) => (dense[c] = mod(r.val[i]!, q)))

    const key = dense.join('')

    if (!seen.has(key) && dense.some(v => v !== 0)) {
      seen.add(key)
      rows.push(dense)
    }
  }

  return set.n - rankMod(rows, set.n, q)
}
