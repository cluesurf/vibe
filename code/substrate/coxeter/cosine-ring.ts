// EXACT arithmetic in the ring Z[2cos(pi/m_1), 2cos(pi/m_2), ...] that the geometric representation of a Coxeter group
// lives in, with a CERTIFIED real sign (item vibe-computation-models-0038). No floating point anywhere.
//
// ELEMENTS. One variable v_m = 2cos(pi/m) per distinct m >= 4 (2cos(pi/2) = 0 and 2cos(pi/3) = 1 need none). v_m is an
// algebraic integer whose minimal polynomial psi_2m (degree phi(2m)/2) is monic with integer coefficients, read from the
// cyclotomic polynomial Phi_2m(z) = z^h psi_2m(z + 1/z). An element is its integer coefficient vector on the monomials
// v_1^e_1 v_2^e_2 ... with 0 <= e_k < deg psi_k (mixed radix), so the ring is a tensor product of the Z[v_m]. It is a
// field basis exactly when the fields Q(v_m) are linearly disjoint, which holds for every pair the lab uses (sqrt 2 with
// sqrt 3 or with the golden ratio); a basis that were not would show up as one real number with two coefficient
// vectors, which the tiling gates would catch as a duplicated tile.
//
// SIGN. v_m is the largest real root of psi_2m, isolated in (1, 2) for 4 <= m <= 8 (the next root 2cos(3 pi/m) lies
// below 1 exactly when m < 9; larger m are refused). A fixed-point lower bound A_k = floor(v_k 2^P) is found by
// bisection on exact integer evaluations of psi, so v_k lies in [A_k, A_k + 1] / 2^P. Every v_k is positive, so each
// monomial lies in [prod A^e, prod (A + 1)^e] / 2^(P |e|), and an element's value lies in an exact integer interval.
// When that interval excludes 0 the sign is proven; otherwise P doubles, up to a cap past which the call throws
// (fail-closed: a nonzero coefficient vector whose value never leaves 0 means the basis is not a field basis).

export type CosineRing = {
  // the m of each variable
  readonly ms: readonly number[]
  // degree of each variable's minimal polynomial, and the mixed-radix strides
  readonly degrees: readonly number[]
  readonly strides: readonly number[]
  // coefficients per element (the product of the degrees)
  readonly size: number
  // minimal polynomials, constant term first, monic
  readonly minimal: readonly (readonly bigint[])[]
  // the integer matrix of multiplication by 2cos(pi/m), for every m the ring was asked for (2, 3 included)
  readonly times: ReadonlyMap<number, readonly (readonly bigint[])[]>
}

const SIGN_PRECISION_CAP = 1 << 16

// Phi_n(z), constant term first, by dividing z^n - 1 by Phi_d for every proper divisor d.
function cyclotomic(n: number): bigint[] {
  let num: bigint[] = new Array<bigint>(n + 1).fill(0n)

  num[0] = -1n
  num[n] = 1n

  for (let d = 1; d < n; d++) {
    if (n % d === 0) {
      num = divideExact(num, cyclotomic(d))
    }
  }

  return num
}

function divideExact(a: bigint[], b: bigint[]): bigint[] {
  const r = [...a]
  const db = b.length - 1
  const out = new Array<bigint>(Math.max(0, a.length - db)).fill(0n)

  if (b[db] !== 1n) {
    throw new Error('cosine-ring: division by a polynomial that is not monic')
  }

  for (let i = r.length - 1; i >= db; i--) {
    const c = r[i]!

    if (c !== 0n) {
      out[i - db] = c

      for (let j = 0; j <= db; j++) {
        r[i - db + j] = r[i - db + j]! - c * b[j]!
      }
    }
  }

  if (r.slice(0, db).some(x => x !== 0n)) {
    throw new Error('cosine-ring: a cyclotomic division left a remainder')
  }

  return out
}

// psi_2m(x), the minimal polynomial of 2cos(pi/m), constant term first.
export function cosineMinimal(m: number): bigint[] {
  const phi = cyclotomic(2 * m)
  const d = phi.length - 1
  const h = d / 2

  // P_k(z + 1/z) = z^k + z^-k: P_0 = 2, P_1 = x, P_(k+1) = x P_k - P_(k-1); the constant uses 1, not P_0
  const chebyshev: bigint[][] = [[2n], [0n, 1n]]

  for (let k = 1; k < h; k++) {
    const next = new Array<bigint>(k + 2).fill(0n)

    chebyshev[k]!.forEach((c, i) => {
      next[i + 1] = next[i + 1]! + c
    })

    chebyshev[k - 1]!.forEach((c, i) => {
      next[i] = next[i]! - c
    })
    chebyshev.push(next)
  }

  const out = new Array<bigint>(h + 1).fill(0n)

  out[0] = phi[h]!

  for (let k = 1; k <= h; k++) {
    chebyshev[k]!.forEach((c, i) => {
      out[i] = out[i]! + phi[h + k]! * c
    })
  }

  if (out[h] !== 1n) {
    throw new Error(`cosine-ring: psi_${2 * m} is not monic`)
  }

  return out
}

export function cosineRing(asked: readonly number[]): CosineRing {
  const ms = [...new Set(asked.filter(m => m >= 4))].sort((a, b) => a - b)

  for (const m of ms) {
    if (!Number.isInteger(m) || m > 8) {
      throw new Error(`cosine-ring: m = ${m} is outside 2..8 (the root isolation needs m < 9)`)
    }
  }

  const minimal = ms.map(cosineMinimal)
  const degrees = minimal.map(p => p.length - 1)
  const strides: number[] = []

  let size = 1

  for (const d of degrees) {
    strides.push(size)
    size *= d
  }

  const base: Omit<CosineRing, 'times'> = { ms, degrees, strides, size, minimal }
  const times = new Map<number, bigint[][]>()

  for (const m of new Set([...asked, 2, 3])) {
    const column = (j: number): bigint[] => {
      const out = new Array<bigint>(size).fill(0n)

      if (m === 2) {
        return out
      }

      if (m === 3) {
        out[j] = 1n

        return out
      }

      // v_m times the monomial j: raise the exponent of v_m by one, reducing by psi when it reaches the degree
      const k = ms.indexOf(m)
      const e = Math.floor(j / strides[k]!) % degrees[k]!
      const rest = j - e * strides[k]!

      if (e + 1 < degrees[k]!) {
        out[rest + (e + 1) * strides[k]!] = 1n
      } else {
        // v^d = -(psi_0 + psi_1 v + ... + psi_(d-1) v^(d-1))
        for (let i = 0; i < degrees[k]!; i++) {
          out[rest + i * strides[k]!] = -minimal[k]![i]!
        }
      }

      return out
    }

    // times[m][i][j]: coefficient i of v_m * monomial j
    const cols = Array.from({ length: size }, (_, j) => column(j))

    times.set(
      m,
      Array.from({ length: size }, (_, i) => cols.map(c => c[i]!)),
    )
  }

  return { ...base, times }
}

// ---- certified sign ----

type Bounds = { precision: number; lower: bigint[]; upper: bigint[]; scale: number }

const boundsCache = new WeakMap<CosineRing, Map<number, Bounds>>()
const rootCache = new Map<string, bigint>()

// floor(v_m 2^P) by bisection on exact evaluations: psi changes sign once in (1, 2).
function rootFloor(m: number, minimal: readonly bigint[], precision: number): bigint {
  const key = `${m}:${precision}`
  const hit = rootCache.get(key)

  if (hit !== undefined) {
    return hit
  }

  const d = minimal.length - 1
  const one = 1n << BigInt(precision)

  // the sign of psi(a / 2^P), from the integer psi(a / 2^P) 2^(P d)
  const exact = (a: bigint): number => {
    let acc = 0n

    for (let i = 0; i <= d; i++) {
      acc += minimal[i]! * a ** BigInt(i) * one ** BigInt(d - i)
    }

    return acc === 0n ? 0 : acc > 0n ? 1 : -1
  }

  let lo = one
  let hi = 2n * one

  const sLo = exact(lo)
  const sHi = exact(hi)

  if (sLo === 0 || sHi === 0 || sLo === sHi) {
    throw new Error(`cosine-ring: psi_${2 * m} does not change sign once on (1, 2)`)
  }

  while (hi - lo > 1n) {
    const mid = (lo + hi) >> 1n
    const s = exact(mid)

    if (s === 0) {
      throw new Error(`cosine-ring: 2cos(pi/${m}) is a dyadic rational`)
    }

    if (s === sLo) {
      lo = mid
    } else {
      hi = mid
    }
  }

  rootCache.set(key, lo)

  return lo
}

function bounds(ring: CosineRing, precision: number): Bounds {
  let perRing = boundsCache.get(ring)

  if (!perRing) {
    perRing = new Map()
    boundsCache.set(ring, perRing)
  }

  const cached = perRing.get(precision)

  if (cached) {
    return cached
  }

  const roots = ring.ms.map((m, k) => rootFloor(m, ring.minimal[k]!, precision))
  const scale = ring.degrees.reduce((s, d) => s + d - 1, 0)
  const lower: bigint[] = []
  const upper: bigint[] = []

  for (let j = 0; j < ring.size; j++) {
    let lo = 1n
    let hi = 1n
    let total = 0

    ring.ms.forEach((_, k) => {
      const e = Math.floor(j / ring.strides[k]!) % ring.degrees[k]!

      lo *= roots[k]! ** BigInt(e)
      hi *= (roots[k]! + 1n) ** BigInt(e)
      total += e
    })

    const pad = 1n << BigInt(precision * (scale - total))

    lower.push(lo * pad)
    upper.push(hi * pad)
  }

  const out = { precision, lower, upper, scale }

  perRing.set(precision, out)

  return out
}

// The real sign of a ring element (-1, 0 or 1), proven by exact interval arithmetic.
export function ringSign(ring: CosineRing, x: readonly bigint[], offset = 0): number {
  let zero = true

  for (let i = 0; i < ring.size; i++) {
    if (x[offset + i]! !== 0n) {
      zero = false
    }
  }

  if (zero) {
    return 0
  }

  if (ring.size === 1) {
    return x[offset]! > 0n ? 1 : -1
  }

  for (let precision = 64; precision <= SIGN_PRECISION_CAP; precision *= 2) {
    const b = bounds(ring, precision)

    let lo = 0n
    let hi = 0n

    for (let i = 0; i < ring.size; i++) {
      const c = x[offset + i]!

      if (c > 0n) {
        lo += c * b.lower[i]!
        hi += c * b.upper[i]!
      } else if (c < 0n) {
        lo += c * b.upper[i]!
        hi += c * b.lower[i]!
      }
    }

    if (lo > 0n) {
      return 1
    }

    if (hi < 0n) {
      return -1
    }
  }

  throw new Error('cosine-ring: a nonzero element kept the sign interval around 0 (the basis is not a field basis)')
}

// out[o..] = a[..] + t * b[..] where t multiplies by 2cos(pi/m) (m = 2: nothing to add)
export function addTimes(
  ring: CosineRing,
  m: number,
  a: bigint[],
  ao: number,
  b: readonly bigint[],
  bo: number,
): void {
  if (m === 2) {
    return
  }

  if (m === 3) {
    for (let i = 0; i < ring.size; i++) {
      a[ao + i] = a[ao + i]! + b[bo + i]!
    }

    return
  }

  const t = ring.times.get(m)

  if (!t) {
    throw new Error(`cosine-ring: the ring has no 2cos(pi/${m})`)
  }

  for (let i = 0; i < ring.size; i++) {
    const row = t[i]!

    let acc = a[ao + i]!

    for (let j = 0; j < ring.size; j++) {
      const r = row[j]!

      if (r !== 0n) {
        const c = b[bo + j]!

        if (c !== 0n) {
          acc += r * c
        }
      }
    }

    a[ao + i] = acc
  }
}
