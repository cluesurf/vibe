// The certified sign of a real number of Q(zeta_9) (a decision
// that needs an order, such as a probability above a baseline, reads a certified sign, never a float comparison).
//
// The embedding is the standard one of code/algebra/ninth-field: zeta = e^(2 pi i / 9). A real x = sum_k n_k zeta^k / d
// equals its real part, sum_k n_k cos(2 pi k / 9) / d. With C_k = 2 cos(2 pi k / 9) and c = C_1 = 2 cos(2 pi / 9), the
// root of t^3 - 3 t + 1 in (3/2, 8/5), the Chebyshev relations C_(k+1) = c C_k - C_(k-1) and c^3 = 3 c - 1 give
//     C_0 = 2,  C_1 = c,  C_2 = c^2 - 2,  C_3 = -1,  C_4 = C_5 = 2 - c - c^2
// so 2 d x = A + B c + E c^2 with integers
//     A = 2 n0 - 2 n2 - n3 + 2 n4 + 2 n5,   B = n1 - n4 - n5,   E = n2 - n4 - n5.
// Since t^3 - 3 t + 1 is irreducible over Q, 1, c, c^2 are independent: x = 0 exactly when A = B = E = 0. Otherwise c is
// bisected in rational intervals [a / D, b / D] (each midpoint's side decided by the exact sign of the cubic) until
// the interval bound of A + B c + E c^2 excludes 0. Every step is bigint arithmetic. A number that is not real throws.
//
// DETERMINISM: no random numbers, no floating point.

import { type Ninth, conj, equals, sub } from '@/code/algebra/ninth-field'

// The integer coordinates (A, B, E) of 2 d x on 1, c, c^2, for a real x.
export function realCoordinates(x: Ninth): readonly [bigint, bigint, bigint] {
  const [n0, n1, n2, n3, n4, n5] = [0, 1, 2, 3, 4, 5].map(k => x.n[k] ?? 0n) as [
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
  ]

  return [2n * n0 - 2n * n2 - n3 + 2n * n4 + 2n * n5, n1 - n4 - n5, n2 - n4 - n5]
}

export const isReal = (x: Ninth): boolean => equals(x, conj(x))

// sign of t^3 - 3 t + 1 at t = m / q (q > 0)
function cubicSign(m: bigint, q: bigint): number {
  const v = m * m * m - 3n * m * q * q + q * q * q

  return v > 0n ? 1 : v < 0n ? -1 : 0
}

const minOf = (a: bigint, b: bigint): bigint => (a < b ? a : b)
const maxOf = (a: bigint, b: bigint): bigint => (a > b ? a : b)

// The most bisections before giving up (fail-closed). Each halves the interval around c, so the cap stands far above
// what any coefficient size reached by a beat calls for.
export const MAX_BISECTIONS = 1 << 14

export type RealBounds = {
  // D^2 * (A + B c + E c^2) lies in [lower, upper] for c in [a / D, b / D]
  readonly lower: bigint
  readonly upper: bigint
  readonly a: bigint
  readonly b: bigint
  readonly d: bigint
  readonly bisections: number
}

// Rational bounds of A + B c + E c^2 after a given number of bisections of c (for display or for a caller's own test).
export function realBounds(x: Ninth, bisections: number): RealBounds {
  if (!isReal(x)) {
    throw new Error('ninth-real-sign: the number is not real')
  }

  const [A, B, E] = realCoordinates(x)

  let a = 15n
  let b = 16n
  let d = 10n

  // the isolating interval (3/2, 8/5) is checked, not assumed
  if (cubicSign(a, d) >= 0 || cubicSign(b, d) <= 0) {
    throw new Error('ninth-real-sign: the isolating interval of 2 cos(2 pi / 9) is wrong')
  }

  for (let i = 0; i < bisections; i++) {
    const m = a + b

    a *= 2n
    b *= 2n
    d *= 2n

    const s = cubicSign(m, d)

    if (s === 0) {
      throw new Error('ninth-real-sign: a rational root of an irreducible cubic')
    }

    if (s < 0) {
      a = m
    } else {
      b = m
    }
  }

  const ad = B * a * d
  const bd = B * b * d
  const a2 = E * a * a
  const b2 = E * b * b
  const base = A * d * d

  return {
    lower: base + minOf(ad, bd) + minOf(a2, b2),
    upper: base + maxOf(ad, bd) + maxOf(a2, b2),
    a,
    b,
    d,
    bisections,
  }
}

// The exact sign of a real number of Q(zeta_9) in the standard embedding: -1, 0 or +1.
export function realSign(x: Ninth): -1 | 0 | 1 {
  if (!isReal(x)) {
    throw new Error('ninth-real-sign: the number is not real')
  }

  const [A, B, E] = realCoordinates(x)

  if (A === 0n && B === 0n && E === 0n) {
    return 0
  }

  // refine in doubling rounds; each call restarts from the isolating interval, which keeps the code one path
  for (let bisections = 4; bisections <= MAX_BISECTIONS; bisections *= 2) {
    const bounds = realBounds(x, bisections)

    if (bounds.lower > 0n) {
      return 1
    }

    if (bounds.upper < 0n) {
      return -1
    }
  }

  throw new Error(`ninth-real-sign: undecided after ${MAX_BISECTIONS} bisections`)
}

// The sign of x - y for real x, y.
export const compareReal = (x: Ninth, y: Ninth): -1 | 0 | 1 => realSign(sub(x, y))
