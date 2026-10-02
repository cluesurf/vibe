// Exact arithmetic in the ninth cyclotomic field Q(zeta), zeta = e^(2 pi i / 9) (E-FRC-0278). Every matrix of the
// classical color group Sigma(648) (code/algebra/group/su3-subgroups: the clock, the shift, the Fourier matrix
// -i / sqrt 3 omega^(jk) and diag(eps, eps, eps omega), eps = zeta^2), the qutrit T gate diag(1, zeta, zeta^-1), the cube-root
// swap phase and the singlet phase all have entries in this field, so a group they generate can be enumerated with
// equality decided exactly rather than by a rounded key.
//
//   a number            six rational coordinates on 1, zeta, ..., zeta^5 (bigint numerators over one positive bigint
//                       denominator, reduced), multiplied modulo the cyclotomic polynomial zeta^6 + zeta^3 + 1
//   conj                complex conjugation, the field automorphism zeta -> zeta^-1 = zeta^8
//   omega, i sqrt 3     omega = zeta^3; i sqrt 3 = omega - omega^2 = 2 omega + 1, so -i / sqrt 3 = -(2 omega + 1) / 3
//   matrices            square matrices of these numbers: product, conjugate transpose, Kronecker product, determinant
//                       of a 3 x 3, an exact key
//   cappedClosure       the group a set of matrices generates, by breadth-first products, stopped once it holds more
//                       than `cap` elements (then `closed` is false and the size is a lower bound)
//
// DETERMINISM: no random numbers. EXACT: no floating point enters any equality; `toComplex` is for display only.

export type Ninth = { readonly n: readonly bigint[]; readonly d: bigint }

const DEGREE = 6

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

function reduce(n: bigint[], d: bigint): Ninth {
  if (d === 0n) {
    throw new Error('a zero denominator')
  }

  let g = d < 0n ? -d : d

  for (const x of n) {
    g = gcd(g, x)
  }

  const sign = d < 0n ? -1n : 1n

  return { n: n.map(x => (sign * x) / g), d: (sign * d) / g }
}

export const ninth = (coordinates: readonly (number | bigint)[], denominator: number | bigint = 1): Ninth => {
  const n = Array.from({ length: DEGREE }, (_, k) => BigInt(coordinates[k] ?? 0))

  return reduce(n, BigInt(denominator))
}

export const ZERO: Ninth = ninth([])
export const ONE: Ninth = ninth([1])

// zeta^k for any integer k, reduced to the basis
export function zetaPower(k: number): Ninth {
  const e = ((k % 9) + 9) % 9
  const c = Array<bigint>(9).fill(0n)

  c[e] = 1n

  return ninth(fold(c))
}

// reduce a coefficient list of any length modulo zeta^6 = -zeta^3 - 1 (and zeta^9 = 1)
function fold(c: bigint[]): bigint[] {
  const a = [...c]

  for (let k = a.length - 1; k >= DEGREE; k--) {
    const x = a[k]!

    if (x === 0n) {
      continue
    }

    a[k] = 0n
    a[k - 3] = (a[k - 3] ?? 0n) - x
    a[k - 6] = (a[k - 6] ?? 0n) - x
  }

  return a.slice(0, DEGREE).concat(Array<bigint>(Math.max(0, DEGREE - a.length)).fill(0n))
}

export const add = (a: Ninth, b: Ninth): Ninth =>
  reduce(
    a.n.map((x, k) => x * b.d + b.n[k]! * a.d),
    a.d * b.d,
  )

export const neg = (a: Ninth): Ninth => ({ n: a.n.map(x => -x), d: a.d })

export const sub = (a: Ninth, b: Ninth): Ninth => add(a, neg(b))

export function mul(a: Ninth, b: Ninth): Ninth {
  const c = Array<bigint>(2 * DEGREE - 1).fill(0n)

  a.n.forEach((x, i) => {
    if (x === 0n) {
      return
    }

    b.n.forEach((y, j) => {
      c[i + j]! += x * y
    })
  })

  return reduce(fold(c), a.d * b.d)
}

export const scale = (a: Ninth, numerator: number | bigint, denominator: number | bigint = 1): Ninth =>
  reduce(
    a.n.map(x => x * BigInt(numerator)),
    a.d * BigInt(denominator),
  )

// complex conjugation: zeta^k -> zeta^(9 - k)
export function conj(a: Ninth): Ninth {
  const c = Array<bigint>(9).fill(0n)

  a.n.forEach((x, k) => {
    c[(9 - k) % 9]! += x
  })

  return reduce(fold(c), a.d)
}

export const isZero = (a: Ninth): boolean => a.n.every(x => x === 0n)
export const equals = (a: Ninth, b: Ninth): boolean => a.d === b.d && a.n.every((x, k) => x === b.n[k])
export const keyOf = (a: Ninth): string => `${a.n.join(' ')}/${a.d}`

export const OMEGA: Ninth = zetaPower(3)
// -i / sqrt 3 = -(2 omega + 1) / 3, the Fourier matrix's prefactor
export const MINUS_I_OVER_ROOT3: Ninth = scale(add(scale(OMEGA, 2), ONE), -1, 3)

// a + b i, for display
export function toComplex(a: Ninth): [number, number] {
  let re = 0
  let im = 0

  a.n.forEach((x, k) => {
    const t = (2 * Math.PI * k) / 9

    re += Number(x) * Math.cos(t)
    im += Number(x) * Math.sin(t)
  })

  return [re / Number(a.d), im / Number(a.d)]
}

// ---- matrices ----

export type NinthMatrix = readonly (readonly Ninth[])[]

export const identityMatrix = (n: number): Ninth[][] =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? ONE : ZERO)))

export function matMul(a: NinthMatrix, b: NinthMatrix): Ninth[][] {
  const n = a.length
  const m = b[0]!.length

  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (__, j) => {
      let s = ZERO

      b.forEach((row, k) => {
        const x = a[i]![k]!
        const y = row[j]!

        if (!isZero(x) && !isZero(y)) {
          s = add(s, mul(x, y))
        }
      })

      return s
    }),
  )
}

export const dagger = (a: NinthMatrix): Ninth[][] =>
  Array.from({ length: a[0]!.length }, (_, i) => Array.from({ length: a.length }, (__, j) => conj(a[j]![i]!)))

export const kron = (a: NinthMatrix, b: NinthMatrix): Ninth[][] =>
  Array.from({ length: a.length * b.length }, (_, r) =>
    Array.from({ length: a[0]!.length * b[0]!.length }, (__, c) =>
      mul(a[Math.floor(r / b.length)]![Math.floor(c / b[0]!.length)]!, b[r % b.length]![c % b[0]!.length]!),
    ),
  )

export const scaleMatrix = (a: NinthMatrix, by: Ninth): Ninth[][] => a.map(row => row.map(x => mul(x, by)))

export const sameMatrix = (a: NinthMatrix, b: NinthMatrix): boolean =>
  a.length === b.length && a.every((row, i) => row.every((x, j) => equals(x, b[i]![j]!)))

export const matrixKey = (a: NinthMatrix): string => a.map(row => row.map(keyOf).join(',')).join(';')

export const isUnitary = (a: NinthMatrix): boolean => sameMatrix(matMul(dagger(a), a), identityMatrix(a.length))

export function det3(a: NinthMatrix): Ninth {
  const t = (i: number, j: number, k: number): Ninth => mul(mul(a[0]![i]!, a[1]![j]!), a[2]![k]!)

  return sub(
    add(add(t(0, 1, 2), t(1, 2, 0)), t(2, 0, 1)),
    add(add(t(2, 1, 0), t(0, 2, 1)), t(1, 0, 2)),
  )
}

export const trace = (a: NinthMatrix): Ninth => a.reduce((s, row, i) => add(s, row[i]!), ZERO)

// the exponent k with zeta^k = x, or -1 when x is not a ninth root of unity (the eighteenth roots -zeta^k too)
export function rootExponent(x: Ninth): number {
  for (let k = 0; k < 9; k++) {
    if (equals(x, zetaPower(k))) {
      return k
    }
  }

  return -1
}

export type Closure = {
  // the elements found, in breadth-first order (all of the group when closed)
  elements: Ninth[][][]
  // the closure finished before passing the cap
  closed: boolean
}

// the group generated by `generators` (square matrices of one size), breadth first, stopped past `cap` elements
export function cappedClosure(generators: readonly NinthMatrix[], cap: number): Closure {
  const n = generators[0]!.length
  const start = identityMatrix(n)
  const seen = new Set<string>([matrixKey(start)])
  const elements: Ninth[][][] = [start]

  // an array iterator reads the length at every step, so the elements pushed below are visited too
  for (const e of elements) {
    for (const g of generators) {
      const x = matMul(g, e)
      const k = matrixKey(x)

      if (!seen.has(k)) {
        seen.add(k)
        elements.push(x)

        if (elements.length > cap) {
          return { elements, closed: false }
        }
      }
    }
  }

  return { elements, closed: true }
}
