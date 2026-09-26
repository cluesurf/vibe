// Exact Schmidt data of a pure two-role knot read straight off its grid weights, and the exact algebraic
// number its largest CHSH value is (E-QTM-0132's form 2 sqrt((p1 + p2)^2 + 4 p1 p2) + 2 p3).
//
// THE ROUTE. A whole's weights W are whole numbers over U = sum W. The first role's reduced density is its
// marginal: rho_A = sum_p (N_p / U) A(p), N_p = sum over the other coordinate's points, with A(p) the nine
// single-role phase-point operators, whose entries are Eisenstein integers (checked, not assumed). So
// M = U rho_A has entries in Z[omega], and its characteristic data are integers:
//   tr M = U,   E2 = sum of the principal 2 x 2 minors of M = U^2 e2,   E3 = det M = U^3 e3,
// each checked to have no omega part. The marginal is the same whatever frame the OTHER coordinate is written
// in (a fear's reflected point permutes that coordinate's points, and the sum over them does not see it), so
// the route is safe for the color mode's wholes. For a pure knot the spectrum of rho_A is the Schmidt weights.
//
// THE NUMBER. With y = U x the characteristic polynomial is the monic integer cubic y^3 - U y^2 + E2 y - E3,
// so a rational Schmidt weight is an INTEGER root over U (rational root theorem). When the smallest weight
// p3 = y3 / U is rational, p1 p2 = e2 - p3 (1 - p3) is rational and
//   CHSH = 2 sqrt(R) + 2 p3,  R = (1 - p3)^2 + 4 p1 p2,
// so CHSH = (2 y3 + 2 sqrt S) / U with S = U^2 R an integer: rational when S is a square, otherwise a
// quadratic surd with minimal polynomial U^2 x^2 - 4 U y3 x + 4 (y3^2 - S) (made primitive). When no weight
// is rational the value is still algebraic (degree at most 6) and the function says so rather than guess.

import { phasePointOperators } from '@/code/measure/grid-weights'

export type EisBig = [bigint, bigint]

const SQRT3 = Math.sqrt(3)

function eisMul(a: EisBig, b: EisBig): EisBig {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0] - a[1] * b[1]]
}

function eisAdd(a: EisBig, b: EisBig): EisBig {
  return [a[0] + b[0], a[1] + b[1]]
}

function eisSub(a: EisBig, b: EisBig): EisBig {
  return [a[0] - b[0], a[1] - b[1]]
}

// a complex number as the Eisenstein integer x + y omega it equals, or throw
export function eisensteinInteger(re: number, im: number): EisBig {
  const y = Math.round((2 * im) / SQRT3)
  const x = Math.round(re + y / 2)

  if (Math.abs(x - y / 2 - re) > 1e-9 || Math.abs((y * SQRT3) / 2 - im) > 1e-9) {
    throw new Error(`not an Eisenstein integer: ${re} + ${im} i`)
  }

  return [BigInt(x), BigInt(y)]
}

let SINGLE: EisBig[][] | undefined

// the nine single-role phase-point operators as exact Eisenstein matrices, row-major
export function exactPhasePoints(): EisBig[][] {
  SINGLE =
    SINGLE ??
    phasePointOperators(1).map(a => Array.from({ length: 9 }, (_, k) => eisensteinInteger(a.re[k] ?? 0, a.im[k] ?? 0)))

  return SINGLE
}

export type ExactReduced = {
  // U, the whole's units
  units: bigint
  // M = U rho_A, exact
  m: EisBig[]
  // tr M (must equal U), E2 = U^2 e2, E3 = U^3 e3, all integers
  trace: bigint
  e2: bigint
  e3: bigint
  // the purity count of the whole: 3^k sum w^2 = U^2 (a pure whole)
  pure: boolean
}

// the exact reduced data of one coordinate of a whole of k coordinates
export function exactReduced(input: { weight: readonly bigint[]; coordinate: number; coordinates: number }): ExactReduced {
  const { weight, coordinate, coordinates } = input
  const stride = 9 ** (coordinates - 1 - coordinate)
  const marginal = new Array<bigint>(9).fill(0n)
  let units = 0n
  let square = 0n

  weight.forEach((w, i) => {
    const p = Math.floor(i / stride) % 9

    marginal[p] = (marginal[p] ?? 0n) + w
    units += w
    square += w * w
  })

  const points = exactPhasePoints()
  const m: EisBig[] = Array.from({ length: 9 }, () => [0n, 0n] as EisBig)

  marginal.forEach((n, p) => {
    for (let k = 0; k < 9; k++) {
      const a = points[p]![k]!

      m[k] = eisAdd(m[k]!, [n * a[0], n * a[1]])
    }
  })

  const at = (i: number, j: number): EisBig => m[3 * i + j]!
  const real = (x: EisBig, what: string): bigint => {
    if (x[1] !== 0n) {
      throw new Error(`${what} has an omega part`)
    }

    return x[0]
  }
  const trace = real(eisAdd(eisAdd(at(0, 0), at(1, 1)), at(2, 2)), 'trace')
  let e2: EisBig = [0n, 0n]

  for (const [i, j] of [
    [0, 1],
    [0, 2],
    [1, 2],
  ] as const) {
    e2 = eisAdd(e2, eisSub(eisMul(at(i, i), at(j, j)), eisMul(at(i, j), at(j, i))))
  }

  const minor = (r: number, c: number): EisBig => {
    const rows = [0, 1, 2].filter(x => x !== r)
    const cols = [0, 1, 2].filter(x => x !== c)

    return eisSub(eisMul(at(rows[0]!, cols[0]!), at(rows[1]!, cols[1]!)), eisMul(at(rows[0]!, cols[1]!), at(rows[1]!, cols[0]!)))
  }
  let det: EisBig = [0n, 0n]

  for (let c = 0; c < 3; c++) {
    const t = eisMul(at(0, c), minor(0, c))

    det = c % 2 === 0 ? eisAdd(det, t) : eisSub(det, t)
  }

  return {
    units,
    m,
    trace,
    e2: real(e2, 'e2'),
    e3: real(det, 'e3'),
    // tr rho^2 = 3^k sum W^2 (tr A(x) A(y) = 3^k delta on k roles), so a pure whole has 3^k sum w^2 = U^2
    pure: BigInt(3 ** coordinates) * square === units * units,
  }
}

function abs(x: bigint): bigint {
  return x < 0n ? -x : x
}

function gcd(a: bigint, b: bigint): bigint {
  let x = abs(a)
  let y = abs(b)

  while (y > 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export function integerSqrt(n: bigint): bigint {
  if (n < 0n) {
    throw new Error('negative')
  }

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

// n = f^2 s with s squarefree (trial division, fine for the sizes here)
export function squarefreeSplit(n: bigint): { f: bigint; s: bigint } {
  let f = 1n
  let s = 1n
  let rest = n

  for (let p = 2n; p * p <= rest; p++) {
    let e = 0

    while (rest % p === 0n) {
      rest /= p
      e++
    }

    f *= p ** BigInt(Math.floor(e / 2))
    s *= e % 2 === 1 ? p : 1n
  }

  return { f, s: s * rest }
}

export type ChshNumber = {
  // the Schmidt weights, largest first (floating, for reading)
  schmidt: number[]
  // the integer roots y of y^3 - U y^2 + E2 y - E3 (each a rational weight y / U)
  integerRoots: bigint[]
  // p3 = y3 / U when the smallest weight is rational, else null
  p3Numerator: bigint | null
  // CHSH = (2 y3 + 2 f sqrt s) / U when p3 is rational
  radicandSquareFactor: bigint | null
  radicandSquarefree: bigint | null
  // the primitive integer minimal polynomial, highest power first ([] when p3 is irrational)
  minimalPolynomial: bigint[]
  // the value, read from the exact form in floating point
  value: number
  // a readable closed form
  form: string
}

export function chshNumber(r: ExactReduced): ChshNumber {
  const U = r.units
  const poly = (y: bigint): bigint => y * y * y - U * y * y + r.e2 * y - r.e3
  // the three weights numerically, by the trigonometric cubic
  const u = Number(U)
  const e2 = Number(r.e2) / (u * u)
  const e3 = Number(r.e3) / (u * u * u)
  const p = e2 - 1 / 3
  const q = -2 / 27 + e2 / 3 - e3
  const roots: number[] = []

  if (Math.abs(p) < 1e-15) {
    const c = Math.cbrt(-q)

    roots.push(c + 1 / 3, c + 1 / 3, c + 1 / 3)
  } else {
    const mm = 2 * Math.sqrt(Math.max(0, -p / 3))
    const theta = Math.acos(Math.max(-1, Math.min(1, (3 * q) / (p * mm)))) / 3

    for (let k = 0; k < 3; k++) {
      roots.push(mm * Math.cos(theta - (2 * Math.PI * k) / 3) + 1 / 3)
    }
  }

  const schmidt = roots.sort((a, b) => b - a)
  const integerRoots: bigint[] = []

  for (const x of schmidt) {
    const y0 = BigInt(Math.round(x * u))

    for (const y of [y0 - 1n, y0, y0 + 1n]) {
      if (poly(y) === 0n && !integerRoots.includes(y)) {
        integerRoots.push(y)
      }
    }
  }

  const smallest = BigInt(Math.round((schmidt[2] ?? 0) * u))
  const y3 = [smallest - 1n, smallest, smallest + 1n].find(y => poly(y) === 0n && Math.abs(Number(y) / u - (schmidt[2] ?? 0)) < 1e-9) ?? null
  const value = 2 * Math.sqrt(((schmidt[0] ?? 0) + (schmidt[1] ?? 0)) ** 2 + 4 * (schmidt[0] ?? 0) * (schmidt[1] ?? 0)) + 2 * (schmidt[2] ?? 0)

  if (y3 === null) {
    return {
      schmidt,
      integerRoots,
      p3Numerator: null,
      radicandSquareFactor: null,
      radicandSquarefree: null,
      minimalPolynomial: [],
      value,
      form: 'p3 irrational: algebraic of degree at most 6, not reduced here',
    }
  }

  // S = U^2 R = (U - y3)^2 + 4 (E2 - y3 (U - y3))
  const S = (U - y3) ** 2n + 4n * (r.e2 - y3 * (U - y3))
  const { f, s } = squarefreeSplit(S)
  let coefficients = [U * U, -4n * U * y3, 4n * (y3 * y3 - S)]

  if (s === 1n) {
    // rational: U x = 2 y3 + 2 f
    coefficients = [U, -(2n * y3 + 2n * f)]
  }

  const g = coefficients.reduce((a, b) => gcd(a, b), 0n)

  coefficients = coefficients.map(c => c / g)

  if ((coefficients[0] ?? 0n) < 0n) {
    coefficients = coefficients.map(c => -c)
  }

  const reduce = (n: bigint, d: bigint): string => {
    const h = gcd(n, d)

    return d / h === 1n ? `${n / h}` : `${n / h}/${d / h}`
  }
  const surd = `${reduce(2n * f, U)} sqrt ${s}`
  const form = s === 1n ? reduce(2n * y3 + 2n * f, U) : y3 === 0n ? surd : `${reduce(2n * y3, U)} + ${surd}`

  return { schmidt, integerRoots, p3Numerator: y3, radicandSquareFactor: f, radicandSquarefree: s, minimalPolynomial: coefficients, value, form }
}
