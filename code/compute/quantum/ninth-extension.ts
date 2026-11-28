// A MULTIQUADRATIC EXTENSION OF Q(zeta_9) (item vibe-computation-models-0049, Q3b). The one-line scattering of bare U
// needs plane waves e^(ipk) and their beat eigenvalues exactly. Their cosines are rational, their sines and the square
// roots of the dispersion are rational multiples of sqrt 3 or of sqrt 91, so every number the S-matrix needs lies in
// K = Q(zeta_9)(sqrt d_1, ..., sqrt d_g) for a short list of square-free integers d_j (here -1 and 91).
//
//   a number      2^g coordinates in Q(zeta_9) (code/algebra/ninth-field) on the basis prod_{j in m} sqrt d_j, m a bit
//                 mask; sqrt d_S * sqrt d_T = sqrt d_(S xor T) * prod_(j in S and T) d_j
//   conj          complex conjugation: conj on every coordinate, and sqrt d_j -> -sqrt d_j for negative d_j
//   inverse       recursive on the top generator, (u + v sqrt d)^-1 = (u - v sqrt d) / (u^2 - d v^2), down to Q(zeta_9),
//                 where x^-1 = prod_(k != 1) sigma_k(x) / N(x) over the Galois group zeta -> zeta^k. A zero divisor
//                 (generators not independent) throws: fail-closed.
//
// DETERMINISM: no random numbers, no floating point; `toComplexDisplay` is for display only.

import {
  type Ninth,
  ONE as NINTH_ONE,
  ZERO as NINTH_ZERO,
  add as addNinth,
  conj as conjNinth,
  equals as equalsNinth,
  isZero as isZeroNinth,
  keyOf as keyOfNinth,
  mul as mulNinth,
  neg as negNinth,
  scale as scaleNinth,
  toComplex,
  zetaPower,
} from '@/code/algebra/ninth-field'

export type Extension = { readonly generators: readonly bigint[]; readonly size: number }

export type Num = { readonly c: readonly Ninth[] }

export function extension(generators: readonly bigint[]): Extension {
  return { generators, size: 1 << generators.length }
}

const popcountNegative = (ext: Extension, mask: number): number =>
  ext.generators.reduce((n, d, j) => n + ((mask >> j) & 1 && d < 0n ? 1 : 0), 0)

const sharedFactor = (ext: Extension, mask: number): bigint =>
  ext.generators.reduce((f, d, j) => ((mask >> j) & 1 ? f * d : f), 1n)

export const zeroOf = (ext: Extension): Num => ({ c: Array.from({ length: ext.size }, () => NINTH_ZERO) })

export const fromNinth = (ext: Extension, x: Ninth): Num => ({
  c: Array.from({ length: ext.size }, (_, m) => (m === 0 ? x : NINTH_ZERO)),
})

export const rational = (ext: Extension, numerator: bigint | number, denominator: bigint | number = 1): Num =>
  fromNinth(ext, scaleNinth(NINTH_ONE, numerator, denominator))

// sqrt d_j as a number (the basis element of mask 1 << j)
export const generator = (ext: Extension, j: number): Num => ({
  c: Array.from({ length: ext.size }, (_, m) => (m === 1 << j ? NINTH_ONE : NINTH_ZERO)),
})

export const add = (a: Num, b: Num): Num => ({ c: a.c.map((x, m) => addNinth(x, b.c[m]!)) })
export const neg = (a: Num): Num => ({ c: a.c.map(negNinth) })
export const sub = (a: Num, b: Num): Num => add(a, neg(b))
export const scale = (a: Num, numerator: bigint | number, denominator: bigint | number = 1): Num => ({
  c: a.c.map(x => scaleNinth(x, numerator, denominator)),
})
export const scaleBy = (a: Num, x: Ninth): Num => ({ c: a.c.map(y => mulNinth(x, y)) })

export function mul(ext: Extension, a: Num, b: Num): Num {
  const c = Array.from({ length: ext.size }, () => NINTH_ZERO)

  a.c.forEach((x, i) => {
    if (isZeroNinth(x)) {
      return
    }

    b.c.forEach((y, j) => {
      if (isZeroNinth(y)) {
        return
      }

      c[i ^ j] = addNinth(c[i ^ j]!, scaleNinth(mulNinth(x, y), sharedFactor(ext, i & j)))
    })
  })

  return { c }
}

export const conj = (ext: Extension, a: Num): Num => ({
  c: a.c.map((x, m) => (popcountNegative(ext, m) % 2 ? negNinth(conjNinth(x)) : conjNinth(x))),
})

export const isZero = (a: Num): boolean => a.c.every(isZeroNinth)
export const equals = (a: Num, b: Num): boolean => a.c.every((x, m) => equalsNinth(x, b.c[m]!))
export const keyOf = (a: Num): string => a.c.map(keyOfNinth).join(' | ')

// the coordinate on 1, when every other coordinate is zero (else undefined)
export const asNinth = (a: Num): Ninth | undefined => (a.c.every((x, m) => m === 0 || isZeroNinth(x)) ? a.c[0] : undefined)

// sigma_k: zeta -> zeta^k on one Q(zeta_9) number
function galois(x: Ninth, k: number): Ninth {
  return x.n.reduce<Ninth>((s, coefficient, j) => addNinth(s, scaleNinth(zetaPower(j * k), coefficient, x.d)), NINTH_ZERO)
}

export function inverseNinth(x: Ninth): Ninth {
  if (isZeroNinth(x)) {
    throw new Error('FAIL: inverse of zero in Q(zeta_9)')
  }

  let others = NINTH_ONE

  for (const k of [2, 4, 5, 7, 8]) {
    others = mulNinth(others, galois(x, k))
  }

  const norm = mulNinth(x, others)

  if (!norm.n.every((c, j) => j === 0 || c === 0n) || norm.n[0] === 0n) {
    throw new Error('FAIL: the norm of a Q(zeta_9) number is not a nonzero rational')
  }

  return scaleNinth(others, norm.d, norm.n[0])
}

// the inverse in the sub-extension of the first `level` generators (coordinates of masks below 2^level)
function inverseAt(ext: Extension, a: Num, level: number): Num {
  if (level === 0) {
    return fromNinth(ext, inverseNinth(a.c[0]!))
  }

  const top = 1 << (level - 1)
  const d = ext.generators[level - 1]!
  const u: Num = { c: a.c.map((x, m) => (m < top ? x : NINTH_ZERO)) }
  const v: Num = { c: a.c.map((_, m) => (m < top ? a.c[m + top]! : NINTH_ZERO)) }
  // u^2 - d v^2 lies in the lower sub-extension
  const lower = sub(mul(ext, u, u), scale(mul(ext, v, v), d))

  if (lower.c.some((x, m) => m >= top && !isZeroNinth(x))) {
    throw new Error('FAIL: a norm left the lower sub-extension')
  }

  const lowerInverse = inverseAt(ext, lower, level - 1)
  const conjugate: Num = { c: a.c.map((x, m) => (m < top ? x : negNinth(x))) }

  return mul(ext, conjugate, lowerInverse)
}

export function inverse(ext: Extension, a: Num): Num {
  if (isZero(a)) {
    throw new Error('FAIL: inverse of zero')
  }

  const out = inverseAt(ext, a, ext.generators.length)

  if (!equals(mul(ext, out, a), fromNinth(ext, NINTH_ONE))) {
    throw new Error('FAIL: the inverse does not invert (generators not independent?)')
  }

  return out
}

export const div = (ext: Extension, a: Num, b: Num): Num => mul(ext, a, inverse(ext, b))

export const weight = (ext: Extension, a: Num): Num => mul(ext, a, conj(ext, a))

export function power(ext: Extension, a: Num, k: number): Num {
  let base = k < 0 ? inverse(ext, a) : a
  let e = k < 0 ? -k : k
  let out = fromNinth(ext, NINTH_ONE)

  while (e > 0) {
    if (e & 1) {
      out = mul(ext, out, base)
    }

    base = mul(ext, base, base)
    e >>= 1
  }

  return out
}

// a rational number, when the value is one (else undefined): [numerator, denominator]
export function asRational(a: Num): readonly [bigint, bigint] | undefined {
  const x = asNinth(a)

  if (!x?.n.every((c, j) => j === 0 || c === 0n)) {
    return undefined
  }

  return [x.n[0]!, x.d]
}

// display only: generators with d < 0 are i sqrt|d|
export function toComplexDisplay(ext: Extension, a: Num): readonly [number, number] {
  let re = 0
  let im = 0

  a.c.forEach((x, m) => {
    const [xr, xi] = toComplex(x)

    let magnitude = 1
    let imaginary = false

    ext.generators.forEach((d, j) => {
      if ((m >> j) & 1) {
        magnitude *= Number(d < 0n ? -d : d) ** 0.5
        imaginary = d < 0n ? !imaginary : imaginary
      }
    })

    if (imaginary) {
      re -= xi * magnitude
      im += xr * magnitude
    } else {
      re += xr * magnitude
      im += xi * magnitude
    }
  })

  return [re, im]
}

// ---- matrices over K ----

export type NumMatrix = readonly (readonly Num[])[]

export const identity = (ext: Extension, n: number): Num[][] =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? rational(ext, 1) : zeroOf(ext))))

export function matMul(ext: Extension, a: NumMatrix, b: NumMatrix): Num[][] {
  return a.map(row =>
    b[0]!.map((_, j) => row.reduce((s, x, k) => (isZero(x) ? s : add(s, mul(ext, x, b[k]![j]!))), zeroOf(ext))),
  )
}

export const matAdd = (a: NumMatrix, b: NumMatrix): Num[][] => a.map((row, i) => row.map((x, j) => add(x, b[i]![j]!)))

export const matScale = (ext: Extension, a: NumMatrix, s: Num): Num[][] => a.map(row => row.map(x => mul(ext, x, s)))

export const dagger = (ext: Extension, a: NumMatrix): Num[][] =>
  a[0]!.map((_, i) => a.map(row => conj(ext, row[i]!)))

export const sameMatrix = (a: NumMatrix, b: NumMatrix): boolean =>
  a.length === b.length && a.every((row, i) => row.every((x, j) => equals(x, b[i]![j]!)))

// Gauss-Jordan inverse, exact (throws on a singular matrix)
export function matInverse(ext: Extension, a: NumMatrix): Num[][] {
  const n = a.length
  const work = a.map((row, i) => [...row, ...identity(ext, n)[i]!])

  for (let col = 0; col < n; col++) {
    const pivot = work.findIndex((row, r) => r >= col && !isZero(row[col]!))

    if (pivot < 0) {
      throw new Error('FAIL: singular matrix')
    }

    ;[work[col], work[pivot]] = [work[pivot]!, work[col]!]

    const inv = inverse(ext, work[col]![col]!)

    work[col] = work[col]!.map(x => mul(ext, x, inv))

    for (let r = 0; r < n; r++) {
      if (r !== col && !isZero(work[r]![col]!)) {
        const f = work[r]![col]!

        work[r] = work[r]!.map((x, j) => sub(x, mul(ext, f, work[col]![j]!)))
      }
    }
  }

  return work.map(row => row.slice(n))
}
