// THE EXACT NULL SPACE OF A SPARSE INTEGER SYSTEM WITH TENS OF THOUSANDS OF COLUMNS (E-FND-0171). exactNullSpace solves
// through the dense Gram matrix, n x n, which is out of reach past a few thousand columns. Most rows of a conservation
// search are short: a probe whose parts never meet changes one feature into another, a row x_g - x_f, and a feature
// that only ever appears alone is forced to zero. Those rows are solved exactly by PEELING before anything dense:
//
//   a row with one live column        that column's class is zero
//   a row a x_f + b x_g, |a| = |b|    the two classes are merged, x_g = -(a / b) x_f (a sign union-find)
//
// repeated to a fixed point (each pass rewrites every row on the class roots). Both steps are exact consequences of
// the rows, so the null space is unchanged: it is the null space of the remaining rows on the live roots, which
// exactNullSpace solves through its Gram matrix and certifies. Each basis vector is then LIFTED back to the original
// columns (every member of a class is its root times its sign, a zero class is 0) and checked against every ORIGINAL
// row in exact integer arithmetic.
//
// The lifted basis keeps the echelon form inSpanSparse and spanResidual read: vector j is 1 on its free column (the
// free root itself, sign +1) and 0 on every other vector's free column (a free root is zero in every other reduced
// vector, and the lift copies it).
//
// DETERMINISM: no random numbers. EXACT: integer rows, residues mod a prime, rationals.

import { exactNullSpace, RowSet, type ExactVector, type NullBasis } from '@/code/algebra/linear/exact-null-space'

export type PeeledNull = NullBasis & {
  // classes forced to zero, merges made, and the live roots left for the dense solve (touched by a remaining row)
  readonly zeroed: number
  readonly merged: number
  readonly dense: number
  readonly passes: number
}

export function peeledNullSpace(set: RowSet): PeeledNull {
  const n = set.n
  const parent = Int32Array.from({ length: n }, (_, i) => i)
  // x_i = sign[i] * x_parent[i]
  const sign = new Int8Array(n).fill(1)
  const zero = new Uint8Array(n)

  const find = (i: number): [number, number] => {
    let s = 1
    let r = i

    while (parent[r] !== r) {
      s *= sign[r]!
      r = parent[r]!
    }

    // path compression with the accumulated sign
    let j = i
    let sj = s

    while (parent[j] !== j) {
      const next = parent[j]!
      const sn = sj * sign[j]!

      parent[j] = r
      sign[j] = sj
      j = next
      sj = sn
    }

    return [r, s]
  }

  let zeroed = 0
  let merged = 0
  let passes = 0
  let changed = true
  const acc = new Map<number, number>()

  const mapped = (idx: Int32Array, val: Float64Array): Map<number, number> => {
    acc.clear()

    for (let k = 0; k < idx.length; k++) {
      const [r, s] = find(idx[k]!)

      if (zero[r]) {
        continue
      }

      acc.set(r, (acc.get(r) ?? 0) + s * val[k]!)
    }

    for (const [r, v] of acc) {
      if (v === 0) {
        acc.delete(r)
      }
    }

    return acc
  }

  while (changed) {
    changed = false
    passes++

    for (const row of set.rows) {
      const m = mapped(row.idx, row.val)

      if (m.size === 1) {
        const [r] = m.keys()

        zero[r!] = 1
        zeroed++
        changed = true
      } else if (m.size === 2) {
        const [[r1, a], [r2, b]] = [...m.entries()] as [[number, number], [number, number]]

        if (Math.abs(a) === Math.abs(b)) {
          // a x_r1 + b x_r2 = 0, so x_r2 = -(a / b) x_r1
          parent[r2] = r1
          sign[r2] = -Math.sign(a) * Math.sign(b)
          merged++
          changed = true
        }
      }
    }
  }

  // the live roots, in increasing order, numbered for the reduced system
  const live = new Int32Array(n).fill(-1)
  const roots: number[] = []

  for (let i = 0; i < n; i++) {
    const [r] = find(i)

    if (r === i && !zero[i]) {
      live[i] = roots.length
      roots.push(i)
    }
  }

  const reduced = new RowSet(roots.length)

  for (const row of set.rows) {
    const m = mapped(row.idx, row.val)
    const out = new Map<number, number>()

    m.forEach((v, r) => out.set(live[r]!, v))
    reduced.add(out)
  }

  let dense = 0

  for (let c = 0; c < reduced.n; c++) {
    dense += reduced.touched[c]!
  }

  const inner = exactNullSpace(reduced)

  // lift: every original column to (root, sign), or zero
  const rootOf = new Int32Array(n)
  const signOf = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    const [r, s] = find(i)

    rootOf[i] = zero[r] ? -1 : live[r]!
    signOf[i] = s
  }

  // the members of each live root
  const members: number[][] = roots.map(() => [])

  for (let i = 0; i < n; i++) {
    if (rootOf[i]! >= 0) {
      members[rootOf[i]!]!.push(i)
    }
  }

  const vectors: ExactVector[] = inner.vectors.map(v => {
    const idx: number[] = []
    const num: number[] = []

    v.idx.forEach((rc, k) => {
      for (const i of members[rc]!) {
        idx.push(i)
        num.push(v.num[k]! * signOf[i]!)
      }
    })

    const order = idx.map((_, k) => k).sort((a, b) => idx[a]! - idx[b]!)

    return {
      free: roots[v.free]!,
      idx: Int32Array.from(order, k => idx[k]!),
      num: Float64Array.from(order, k => num[k]!),
      den: v.den,
    }
  })

  const freeOf = new Int32Array(n).fill(-1)

  vectors.forEach((v, j) => (freeOf[v.free] = j))

  return {
    n,
    dim: vectors.length,
    prime: inner.prime,
    vectors,
    freeOf,
    reconstructed: inner.reconstructed,
    verified: inner.reconstructed && inner.verified && verifyLifted(set, vectors),
    rank: n - vectors.length,
    zeroed,
    merged,
    dense,
    passes,
  }
}

// every lifted vector against every original row, exactly (a product sum is checked to stay below 2^53)
function verifyLifted(set: RowSet, vectors: readonly ExactVector[]): boolean {
  const dense = new Float64Array(set.n)

  for (const v of vectors) {
    if (v.idx.length === 1 && !set.touched[v.idx[0]!]) {
      continue
    }

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
        v.idx.forEach(c => (dense[c] = 0))

        return false
      }
    }

    v.idx.forEach(c => (dense[c] = 0))
  }

  return true
}
