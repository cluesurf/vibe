// Exact linear algebra over the prime field GF(p), for counting the dimension of a solution space without a
// tolerance. A matrix with rational entries is reduced mod p (each denominator inverted), and its rank mod p is its
// rank over the rationals unless p divides one of the minors that decide it. Two unrelated primes that give the same
// rank rule that out in practice, and every count here is read from two.
//
// The primes are below 2^25, so a product of two residues is below 2^50 and exact in a double: no BigInt, no
// rounding. Deterministic: the primes are found by trial division from a fixed start.

// the largest prime below `n` (n <= 2^26)
export function primeBelow(n: number): number {
  for (let m = n - 1; m > 2; m--) {
    let prime = m % 2 === 1

    for (let f = 3; prime && f * f <= m; f += 2) {
      if (m % f === 0) {
        prime = false
      }
    }

    if (prime) {
      return m
    }
  }

  throw new Error(`no prime below ${n}`)
}

export const mod = (x: number, p: number): number => ((x % p) + p) % p

export const mulMod = (a: number, b: number, p: number): number =>
  (a * b) % p

export function powMod(a: number, e: number, p: number): number {
  let result = 1
  let base = mod(a, p)
  let k = e

  while (k > 0) {
    if (k % 2 === 1) {
      result = mulMod(result, base, p)
    }

    base = mulMod(base, base, p)
    k = Math.floor(k / 2)
  }

  return result
}

export const inverseMod = (a: number, p: number): number => {
  if (mod(a, p) === 0) {
    throw new Error('inverse of zero mod p')
  }

  return powMod(a, p - 2, p)
}

// a dyadic rational (a double whose value is m / 2^e with e <= 40) as a residue; throws on anything else, so a
// value that is not exactly representable can never slip in
const SCALE = 2 ** 40
const CHUNK = 2 ** 20
const scaleInverse = new Map<number, number>()

export function dyadicMod(x: number, p: number): number {
  const m = x * SCALE

  if (!Number.isInteger(m) || Math.abs(m) > Number.MAX_SAFE_INTEGER) {
    throw new Error(`not a dyadic rational: ${x}`)
  }

  // split into two base-2^20 digits, so no product leaves the exact range
  const a = Math.abs(m)
  const high = Math.floor(a / CHUNK)
  const r = mod(mulMod(high % p, CHUNK % p, p) + (a - high * CHUNK), p)

  if (!scaleInverse.has(p)) {
    scaleInverse.set(p, inverseMod(SCALE % p, p))
  }

  return mulMod(mod(m < 0 ? -r : r, p), scaleInverse.get(p)!, p)
}

// reduced row echelon form mod p of `rows` (each of length `cols`); returns the pivot columns and the pivot rows
export function rrefMod(
  rows: readonly (readonly number[])[],
  cols: number,
  p: number,
): { pivots: number[]; rows: number[][] } {
  const basis: number[][] = []
  const pivots: number[] = []

  for (const input of rows) {
    const row = input.map(x => mod(x, p))

    // reduce by the pivots found so far
    for (let k = 0; k < basis.length; k++) {
      const c = pivots[k]!
      const f = row[c]!

      if (f !== 0) {
        const b = basis[k]!

        for (let j = 0; j < cols; j++) {
          if (b[j] !== 0) {
            row[j] = mod(row[j]! - mulMod(f, b[j]!, p), p)
          }
        }
      }
    }

    const lead = row.findIndex(x => x !== 0)

    if (lead < 0) {
      continue
    }

    const scale = inverseMod(row[lead]!, p)

    for (let j = 0; j < cols; j++) {
      row[j] = mulMod(row[j]!, scale, p)
    }

    // keep the basis fully reduced: clear the new pivot column from the earlier rows
    for (const b of basis) {
      const f = b[lead]!

      if (f !== 0) {
        for (let j = 0; j < cols; j++) {
          if (row[j] !== 0) {
            b[j] = mod(b[j]! - mulMod(f, row[j]!, p), p)
          }
        }
      }
    }

    basis.push(row)
    pivots.push(lead)
  }

  return { pivots, rows: basis }
}

export const rankMod = (
  rows: readonly (readonly number[])[],
  cols: number,
  p: number,
): number => rrefMod(rows, cols, p).pivots.length

// a basis of the right null space {x : rows x = 0} mod p, one vector per free column
export function nullSpaceMod(
  rows: readonly (readonly number[])[],
  cols: number,
  p: number,
): number[][] {
  const { pivots, rows: reduced } = rrefMod(rows, cols, p)
  const isPivot = new Set(pivots)
  const basis: number[][] = []

  for (let free = 0; free < cols; free++) {
    if (isPivot.has(free)) {
      continue
    }

    const v = new Array<number>(cols).fill(0)

    v[free] = 1
    reduced.forEach((r, k) => (v[pivots[k]!] = mod(-r[free]!, p)))
    basis.push(v)
  }

  return basis
}

// the product of an (m x n) and an (n x k) matrix mod p
export function multiplyMod(
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
  p: number,
): number[][] {
  const k = b[0]?.length ?? 0

  return a.map(row => {
    const out = new Array<number>(k).fill(0)

    row.forEach((x, i) => {
      if (x === 0) {
        return
      }

      const bi = b[i]!

      for (let j = 0; j < k; j++) {
        if (bi[j] !== 0) {
          out[j] = mod(out[j]! + mulMod(x, bi[j]!, p), p)
        }
      }
    })

    return out
  })
}

// the inverse of a square matrix mod p (throws if singular)
export function inverseMatrixMod(
  m: readonly (readonly number[])[],
  p: number,
): number[][] {
  const n = m.length
  const joined = m.map((row, i) => [
    ...row.map(x => mod(x, p)),
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ])
  const { pivots, rows } = rrefMod(joined, 2 * n, p)

  if (pivots.length < n || pivots.some((c, k) => c !== k)) {
    throw new Error('singular matrix mod p')
  }

  return rows.map(r => r.slice(n))
}
