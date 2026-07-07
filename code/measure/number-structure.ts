import { octonionFanoLines } from '@/code/measure/quaternionic-generations'

// Integer-structure measures: the genuine number sequences and counts the substrate forces, and a
// coincidence auditor that separates a forced identity from a numerological match. The discipline
// throughout is that a number matters only when it is derived (an exact count or an algebraic
// integer from the structure), never when it is fitted to a target within a tolerance.

// The sum of the cubes of the divisors of n (sigma_3), the coefficient family of the Eisenstein
// series E4.
export function sigmaCubes(n: number): number {
  let sum = 0

  for (let d = 1; d <= n; d++) {
    if (n % d === 0) {
      sum += d * d * d
    }
  }

  return sum
}

// The number of E8 lattice vectors of squared length exactly `normSquared`, by direct enumeration of
// the two cosets (integer coordinates with even sum, and half-integer coordinates with even sum).
// The theta series of E8 is the Eisenstein series E4, so this count at normSquared = 2n is
// 240 * sigma_3(n).
export function e8ThetaCoefficient(normSquared: number): number {
  let count = 0

  const recurse = (
    coset: 0 | 1,
    index: number,
    integerSum: number,
    norm: number,
  ): void => {
    if (norm > normSquared) {
      return
    }

    if (index === 8) {
      if (integerSum % 2 !== 0) {
        return
      }

      if (norm === normSquared) {
        count++
      }

      return
    }

    if (coset === 0) {
      for (let x = -2; x <= 2; x++) {
        recurse(coset, index + 1, integerSum + x, norm + x * x)
      }
    } else {
      for (let k = -3; k <= 2; k++) {
        const c = k + 0.5
        recurse(coset, index + 1, integerSum + k, norm + c * c)
      }
    }
  }

  recurse(0, 0, 0, 0)
  recurse(1, 0, 0, 0)

  return count
}

// The binary structure of the octonions: the seven imaginary units labeled 1..7 are the seven
// nonzero three-bit strings, and each Fano line (quaternionic triple) is an exclusive-or triple
// a xor b = c in that labeling. Returns the number of Fano lines and how many are exact xor triples.
export function octonionBinaryStructure(): {
  units: number
  fanoLines: number
  xorTriples: number
} {
  const lines = octonionFanoLines()

  let xorTriples = 0

  for (const [a, b, c] of lines) {
    if ((a ^ b ^ c) === 0) {
      xorTriples++
    }
  }

  return { units: 7, fanoLines: lines.length, xorTriples }
}

// The distinct values a pair of balanced-ternary tones can carry, high tone weighted by three:
// 3*a + b for a, b in {-1, 0, 1}. There are exactly nine, spanning -4..+4, the ternary alphabet
// squared.
export function ternaryPairStates(): {
  count: number
  min: number
  max: number
} {
  const values = new Set<number>()

  for (const a of [-1, 0, 1]) {
    for (const b of [-1, 0, 1]) {
      values.add(3 * a + b)
    }
  }

  return {
    count: values.size,
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

// The nth Fibonacci number (F1 = F2 = 1).
export function fibonacci(n: number): number {
  let a = 1
  let b = 1

  for (let i = 2; i <= n; i++) {
    const next = a + b
    a = b
    b = next
  }

  return b
}

// The real roots of the depressed-then-solved cubic x^3 + a x^2 + b x + c, returned sorted
// descending. Used for the warp-factor characteristic polynomial.
export function cubicRoots(a: number, b: number, c: number): number[] {
  const p = b - (a * a) / 3
  const q = (2 * a * a * a) / 27 - (a * b) / 3 + c
  const discriminant = (q * q) / 4 + (p * p * p) / 27
  const roots: number[] = []

  if (discriminant < 0) {
    const r = Math.sqrt((-p * p * p) / 27)
    const phi = Math.acos(-q / (2 * r))
    const magnitude = 2 * Math.cbrt(r)

    for (let k = 0; k < 3; k++) {
      roots.push(
        magnitude * Math.cos((phi + 2 * Math.PI * k) / 3) - a / 3,
      )
    }
  } else {
    const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant))
    const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant))
    roots.push(u + v - a / 3)
  }

  return roots.sort((x, y) => y - x)
}

// The number of distinct reduced fractions p/q with denominator at most `maxDenominator` that lie
// within `tolerance` of `value`. The look-elsewhere count for a claimed simple-number match: a
// forced exact value has exactly one such target at a tiny tolerance, while a fitted match sits in a
// thicket of comparably-simple rivals.
export function simpleTargetsWithin(input: {
  value: number
  tolerance: number
  maxDenominator: number
}): number {
  const { value, tolerance, maxDenominator } = input
  const seen = new Set<string>()

  const gcd = (a: number, b: number): number =>
    b === 0 ? a : gcd(b, a % b)

  for (let q = 1; q <= maxDenominator; q++) {
    const highest = Math.ceil((value + tolerance) * q)

    for (let p = 0; p <= highest; p++) {
      if (!(p === 0 && q === 1) && gcd(p, q) !== 1) {
        continue
      }

      if (Math.abs(p / q - value) < tolerance) {
        seen.add(`${p}/${q}`)
      }
    }
  }

  return seen.size
}

// The number of ways to write `total` as a sum of three distinct positive integers (unordered), the
// look-elsewhere count for attributing an integer to one specific decomposition (such as reading a
// derived trace as one favoured sum).
export function distinctTripleSums(total: number): number {
  let count = 0

  for (let a = 1; a < total; a++) {
    for (let b = a + 1; b < total; b++) {
      const c = total - a - b

      if (c > b && c < total) {
        count++
      }
    }
  }

  return count
}
