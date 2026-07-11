// A general positional NUMERATION in a grid's own growth basis, Margenstern's "language of the splitting"
// (Vol I, Ch 3.3.3) generalized past the pentagrid's Fibonacci. Every combinatoric tiling has a splitting
// matrix whose characteristic polynomial gives a linear recurrence, and the leaves of the splitting tree per
// generation follow that recurrence. Writing a tile's breadth-first rank in THAT basis (greedily, largest
// term first) gives the tile's exact coordinate, the higher-dimensional analogue of the Zeckendorf word.
//
// For the pentagrid/heptagrid the basis is Fibonacci (1, 2, 3, 5, 8, ... , the recurrence u = u' + u''), and
// the dodecagrid {5,3,4} and the 4D grids have their own recurrences. We build the basis either from an
// explicit linear recurrence or directly from a grid's measured shell growth, so the numeration is exact in any
// dimension. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md and the
// splitting-method notes.

export type Numeration = {
  // the increasing basis (term 0 is 1)
  readonly basis: number[]
  // the digits of a positive integer, most-significant first, greedy (largest basis term first)
  encode(value: number): number[]
  // the integer value of a digit list (the inverse of encode)
  decode(digits: number[]): number
  // the largest digit that appears across 1..limit, the effective alphabet size minus one
  maxDigit(limit: number): number
}

// a numeration over an explicit increasing integer basis (must start at 1 and strictly increase)
export function makeNumeration(input: { basis: number[] }): Numeration {
  const basis = [...input.basis].sort((a, b) => a - b)

  if (basis[0] !== 1) {
    throw new Error('numeration basis must start at 1')
  }

  function encode(value: number): number[] {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(
        `numeration needs a non-negative integer, got ${value}`,
      )
    }

    if (value === 0) {
      return [0]
    }

    let remainder = value
    let top = basis.length - 1

    while (top >= 0 && basis[top]! > remainder) {
      top--
    }

    const digits: number[] = []

    for (let i = top; i >= 0; i--) {
      const digit = Math.floor(remainder / basis[i]!)

      digits.push(digit)
      remainder -= digit * basis[i]!
    }

    return digits
  }

  function decode(digits: number[]): number {
    let sum = 0

    const len = digits.length

    for (let i = 0; i < len; i++) {
      sum += digits[i]! * basis[len - 1 - i]!
    }

    return sum
  }

  function maxDigit(limit: number): number {
    let m = 0

    for (let n = 1; n <= limit; n++) {
      for (const d of encode(n)) {
        if (d > m) {
          m = d
        }
      }
    }

    return m
  }

  return { basis, encode, decode, maxDigit }
}

// build a basis from a linear recurrence u_n = sum_k coefficients[k] * u_{n-1-k}, given the first
// `coefficients.length` seed terms. For the pentagrid: coefficients [1,1], seeds [1,2] (Fibonacci). For a
// {p,4} grid: coefficients [p-2, -1], seeds [1, p-2].
export function recurrenceBasis(input: {
  coefficients: number[]
  seeds: number[]
  terms: number
}): number[] {
  const { coefficients, seeds, terms } = input
  const basis = seeds.slice(0, terms)

  while (basis.length < terms) {
    let next = 0

    for (let k = 0; k < coefficients.length; k++) {
      next += coefficients[k]! * basis[basis.length - 1 - k]!
    }

    if (next <= basis[basis.length - 1]!) {
      break
    }
    // basis must strictly increase to be a valid numeration

    basis.push(next)
  }

  return basis
}

// build a basis directly from a grid's measured shell growth (the count of NEW cells at each breadth-first
// distance), the cumulative-free, dimension-general way to get a tiling's natural numeration basis. Pass the
// per-shell counts (shell 0 = 1). Keeps only the strictly-increasing prefix, so it is a valid greedy basis.
export function growthBasis(shellCounts: number[]): number[] {
  const basis: number[] = [1]

  for (const count of shellCounts) {
    if (count > basis[basis.length - 1]!) {
      basis.push(count)
    }
  }

  return basis
}
