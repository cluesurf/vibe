// THE EXACT NULL SPACE BY SEVERAL PRIMES AND THE CHINESE REMAINDER THEOREM (E-FND-0171). exactNullSpace lifts each
// residue mod one prime p < 2^25 to a rational by Wang's reconstruction, which only reaches |n|, d <= sqrt((p - 1) / 2),
// about 4,096. A system whose null vectors need larger rationals (a vacuum family read over a whole box, where a row
// counts a feature over thousands of docks) fails to lift and is reported unreconstructed. This solves the same Gram
// system modulo several primes, keeps the primes of the largest rank (a smaller rank is an unlucky prime), checks they
// share the same pivot columns, joins the residues by the Chinese remainder theorem in BigInt, and reconstructs with
// the bound sqrt(M / 2) of the product M. Primes are added until every entry lifts and every vector verifies against
// every row in exact BigInt arithmetic.
//
// The certificate is exactNullSpace's: the dimension mod any prime is at least the dimension over Q, and the lifted
// vectors are verified, independent (unit on their free columns) members of the null space over Q, as many as the
// modular dimension. The result is a NullBasis, its entries as doubles, refused (verified false) if any numerator or
// denominator passes 2^50.
//
// DETERMINISM: no random numbers; the primes are the largest below 2^25 in decreasing order. EXACT: residues, BigInt.

import { type ExactVector, type NullBasis, type RowSet } from '@/code/algebra/linear/exact-null-space'
import { inverseMod, mod, primeBelow } from '@/code/algebra/linear/modular-linear'

type Residues = { rank: number; pivots: number[]; free: number[]; x: Float64Array[] }

// the null basis of the Gram matrix mod p on the touched columns, in reduced echelon form on its free columns
function residues(set: RowSet, cols: readonly number[], at: Int32Array, p: number): Residues {
  const m = cols.length
  const G = new Float64Array(m * m)

  for (const r of set.rows) {
    const k = r.idx.length
    const ci = new Int32Array(k)
    const vi = new Float64Array(k)

    for (let i = 0; i < k; i++) {
      ci[i] = at[r.idx[i]!]!
      vi[i] = mod(r.val[i]!, p)
    }

    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        const o = ci[i]! * m + ci[j]!

        G[o] = (G[o]! + ((vi[i]! * vi[j]!) % p)) % p
      }
    }
  }

  const pivots: number[] = []
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

    let nz = 0

    for (let j = c; j < m; j++) {
      if (G[pr + j] !== 0) {
        NZ[nz++] = j
      }
    }

    for (let r2 = 0; r2 < m; r2++) {
      if (r2 === row) {
        continue
      }

      const o = r2 * m
      const f = G[o + c]!

      if (f === 0) {
        continue
      }

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

    pivots.push(c)
    isPivot[c] = 1
    row++
  }

  // fully reduced: x[pivot k] = -G[k][free] for each free column
  const free: number[] = []

  for (let c = 0; c < m; c++) {
    if (!isPivot[c]) {
      free.push(c)
    }
  }

  const x = free.map(fc => {
    const v = new Float64Array(m)

    v[fc] = 1
    pivots.forEach((pc, k) => {
      const g = G[k * m + fc]!

      v[pc] = g === 0 ? 0 : p - g
    })

    return v
  })

  return { rank: pivots.length, pivots, free, x }
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

const sqrtBig = (n: bigint): bigint => {
  if (n < 2n) {
    return n
  }

  let x = BigInt(Math.floor(Math.sqrt(Number(n))))

  while (x * x > n) {
    x--
  }

  while ((x + 1n) * (x + 1n) <= n) {
    x++
  }

  return x
}

// Wang's rational reconstruction of a mod M with |n|, d <= bound
function rationalBig(a: bigint, M: bigint, bound: bigint): [bigint, bigint] | undefined {
  let r0 = M
  let r1 = ((a % M) + M) % M
  let s0 = 0n
  let s1 = 1n

  while (r1 > bound) {
    const q = r0 / r1

    ;[r0, r1] = [r1, r0 - q * r1]
    ;[s0, s1] = [s1, s0 - q * s1]
  }

  if (s1 === 0n || (s1 < 0n ? -s1 : s1) > bound || gcdBig(r1, s1) !== 1n) {
    return undefined
  }

  return s1 < 0n ? [-r1, -s1] : [r1, s1]
}

export type MultiModularNull = NullBasis & { readonly primes: number }

export function multiModularNullSpace(set: RowSet, maxPrimes = 8): MultiModularNull {
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
  const used: { p: number; r: Residues }[] = []

  let p = 2 ** 25

  for (let attempt = 0; attempt < maxPrimes * 2 && used.length < maxPrimes; attempt++) {
    p = primeBelow(p)

    const r = residues(set, cols, at, p)
    const best = used.length === 0 ? -1 : used[0]!.r.rank

    if (r.rank > best && used.length > 0) {
      // every earlier prime was unlucky
      used.length = 0
    } else if (r.rank < best) {
      continue
    }

    if (used.length > 0 && r.pivots.join(',') !== used[0]!.r.pivots.join(',')) {
      continue
    }

    used.push({ p, r })

    const lifted = lift(used, m)

    if (lifted && verify(set, cols, lifted)) {
      return basisOf(n, cols, used[0]!.r.free, lifted, used.length, true, p)
    }
  }

  const lifted = used.length > 0 ? lift(used, m) : undefined

  return basisOf(n, cols, used[0]?.r.free ?? [], lifted, used.length, false, p)
}

type Lifted = { num: bigint[]; den: bigint }[]

function lift(used: readonly { p: number; r: Residues }[], m: number): Lifted | undefined {
  let M = 1n

  for (const u of used) {
    M *= BigInt(u.p)
  }

  const bound = sqrtBig(M / 2n)
  const out: Lifted = []

  for (let f = 0; f < used[0]!.r.free.length; f++) {
    const fr: [bigint, bigint][] = []

    for (let j = 0; j < m; j++) {
      // the residue of entry j of vector f, joined over the primes
      let a = 0n
      let Mi = 1n

      for (const u of used) {
        const P = BigInt(u.p)
        const v = BigInt(u.r.x[f]![j]!)
        // a + Mi t = v mod P
        const t = ((((v - a) % P) + P) % P * BigInt(inverseMod(Number(Mi % P), u.p))) % P

        a += Mi * t
        Mi *= P
      }

      if (a === 0n) {
        fr.push([0n, 1n])
        continue
      }

      const q = rationalBig(a, M, bound)

      if (!q) {
        return undefined
      }

      fr.push(q)
    }

    let den = 1n

    for (const [, d] of fr) {
      den = (den / gcdBig(den, d)) * d
    }

    out.push({ num: fr.map(([a, d]) => a * (den / d)), den })
  }

  return out
}

function verify(set: RowSet, cols: readonly number[], lifted: Lifted): boolean {
  const pos = new Map(cols.map((c, j) => [c, j]))

  for (const v of lifted) {
    for (const r of set.rows) {
      let s = 0n

      for (let i = 0; i < r.idx.length; i++) {
        const y = v.num[pos.get(r.idx[i]!)!]!

        if (y !== 0n) {
          s += BigInt(r.val[i]!) * y
        }
      }

      if (s !== 0n) {
        return false
      }
    }
  }

  return true
}

function basisOf(
  n: number,
  cols: readonly number[],
  free: readonly number[],
  lifted: Lifted | undefined,
  primes: number,
  verified: boolean,
  prime: number,
): MultiModularNull {
  const LIMIT = 2n ** 50n
  const vectors: ExactVector[] = []
  const freeOf = new Int32Array(n).fill(-1)

  let fits = true

  const touched = new Uint8Array(n)

  cols.forEach(c => (touched[c] = 1))

  // the untouched columns are free, each a unit vector
  for (let c = 0; c < n; c++) {
    if (!touched[c]) {
      freeOf[c] = vectors.length
      vectors.push({ free: c, idx: Int32Array.of(c), num: Float64Array.of(1), den: 1 })
    }
  }

  free.forEach((fc, f) => {
    const v = lifted?.[f]
    const idx: number[] = []
    const num: number[] = []

    if (v) {
      fits &&= v.den < LIMIT

      v.num.forEach((a, j) => {
        if (a !== 0n) {
          fits &&= (a < 0n ? -a : a) < LIMIT
          idx.push(cols[j]!)
          num.push(Number(a))
        }
      })
    }

    freeOf[cols[fc]!] = vectors.length
    vectors.push({
      free: cols[fc]!,
      idx: Int32Array.from(idx),
      num: Float64Array.from(num),
      den: v ? Number(v.den) : 1,
    })
  })

  // free columns in increasing order, as exactNullSpace gives them
  const order = vectors.map((_, j) => j).sort((a, b) => vectors[a]!.free - vectors[b]!.free)
  const sorted = order.map(j => vectors[j]!)

  sorted.forEach((v, j) => (freeOf[v.free] = j))

  return {
    n,
    dim: sorted.length,
    prime,
    vectors: sorted,
    freeOf,
    reconstructed: lifted !== undefined && fits,
    verified: verified && lifted !== undefined && fits,
    rank: n - sorted.length,
    primes,
  }
}
