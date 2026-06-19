// The octonions O, the 8-dimensional normed division algebra. They are the algebra
// behind the substrate's exceptional symmetry: the 24 directions of {3,4,3,4} are the
// long roots of F4, and F4 is the automorphism group of the exceptional Jordan algebra
// J3(O) built on these octonions. The octonions are NON-ASSOCIATIVE (only alternative),
// which is exactly the property that forces the three-fold structure in jordan.ts.
//
// An octonion is eight reals, the coefficients on the basis e0 (the unit) and the seven
// imaginary units e1..e7. Multiplication follows the Fano-plane table built below.

export type Octonion = number[] // length 8, coefficients on e0..e7

export const OCTONION_DIM = 8

// The seven oriented Fano lines. Each triple (a, b, c) is a quaternionic cycle:
// e_a e_b = e_c, e_b e_c = e_a, e_c e_a = e_b, and each reverse negates.
const FANO_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [1, 2, 3],
  [1, 4, 5],
  [1, 7, 6],
  [2, 4, 6],
  [2, 5, 7],
  [3, 4, 7],
  [3, 6, 5],
]

// The multiplication table: PRODUCT_INDEX[i][j] is the basis index of e_i e_j, and
// PRODUCT_SIGN[i][j] is its sign. Built once at module load from the Fano lines.
const PRODUCT_INDEX: number[][] = Array.from({ length: 8 }, () =>
  new Array<number>(8).fill(0),
)
const PRODUCT_SIGN: number[][] = Array.from({ length: 8 }, () =>
  new Array<number>(8).fill(0),
)

const buildTable = (): void => {
  // e0 is the identity: e0 e_j = e_j, e_i e0 = e_i.
  for (let i = 0; i < 8; i++) {
    PRODUCT_INDEX[0]![i] = i
    PRODUCT_SIGN[0]![i] = 1
    PRODUCT_INDEX[i]![0] = i
    PRODUCT_SIGN[i]![0] = 1
  }

  // each imaginary unit squares to minus the identity.
  for (let i = 1; i < 8; i++) {
    PRODUCT_INDEX[i]![i] = 0
    PRODUCT_SIGN[i]![i] = -1
  }

  // the oriented cycles, each forward product +1 and its reverse -1.
  const set = (i: number, j: number, k: number, sign: number): void => {
    PRODUCT_INDEX[i]![j] = k
    PRODUCT_SIGN[i]![j] = sign
    PRODUCT_INDEX[j]![i] = k
    PRODUCT_SIGN[j]![i] = -sign
  }

  for (const [a, b, c] of FANO_LINES) {
    set(a, b, c, 1)
    set(b, c, a, 1)
    set(c, a, b, 1)
  }
}

buildTable()

export function octonionZero(): Octonion {
  return new Array<number>(8).fill(0)
}

// The basis unit e_i (i from 0 to 7). e0 is the multiplicative identity.
export function octonionUnit(index: number): Octonion {
  const value = octonionZero()
  value[index] = 1

  return value
}

// The identity 1 = e0.
export function octonionOne(): Octonion {
  return octonionUnit(0)
}

// A real number embedded as scalar times the unit e0.
export function octonionReal(scalar: number): Octonion {
  const value = octonionZero()
  value[0] = scalar

  return value
}

export function octonionAdd(a: Octonion, b: Octonion): Octonion {
  return a.map((x, i) => x + b[i]!)
}

export function octonionSubtract(a: Octonion, b: Octonion): Octonion {
  return a.map((x, i) => x - b[i]!)
}

export function octonionScale(a: Octonion, scalar: number): Octonion {
  return a.map(x => x * scalar)
}

// The octonion product, bilinear over the Fano-plane table.
export function octonionMultiply(a: Octonion, b: Octonion): Octonion {
  const out = octonionZero()
  for (let i = 0; i < 8; i++) {
    const ai = a[i]!
    if (ai === 0) {
      continue
    }

    const indexRow = PRODUCT_INDEX[i]!
    const signRow = PRODUCT_SIGN[i]!
    for (let j = 0; j < 8; j++) {
      const bj = b[j]!
      if (bj === 0) {
        continue
      }

      out[indexRow[j]!]! += signRow[j]! * ai * bj
    }
  }

  return out
}

// Conjugation: keep the real part, negate the seven imaginary parts.
export function octonionConjugate(a: Octonion): Octonion {
  return a.map((x, i) => (i === 0 ? x : -x))
}

// The real part, the coefficient on e0.
export function octonionRealPart(a: Octonion): number {
  return a[0]!
}

// The norm squared, the sum of the squared coefficients (a a-conjugate = norm^2 times 1).
export function octonionNormSquared(a: Octonion): number {
  return a.reduce((sum, x) => sum + x * x, 0)
}

export function octonionEquals(
  a: Octonion,
  b: Octonion,
  tolerance = 1e-9,
): boolean {
  return a.every((x, i) => Math.abs(x - b[i]!) <= tolerance)
}
