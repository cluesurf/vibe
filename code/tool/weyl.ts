// Deterministic low-discrepancy sequences: the one source of spread-out values in the repo. There is no
// random number and no seed anywhere. Every value here is the fractional part of an integer multiple of a
// stated irrational (a Weyl, or Kronecker, sequence), so a result built on it is a statement about the
// deterministic system and a fixed, equidistributed set of starts, never about a draw.
//
// The three theorems it stands on:
//
//   Weyl: for irrational a, frac(n a) is equidistributed on [0, 1).
//   Kronecker: for 1, a_1, ..., a_d linearly independent over the rationals, the points
//   (frac(n a_1), ..., frac(n a_d)) are equidistributed on the d-cube.
//   Besicovitch (1940): the square roots of distinct square-free integers are linearly independent over
//   the rationals, together with 1.
//
// The stream (makeWeyl) keeps the interface the retired seeded generator had (next, nextInt,
// nextGaussian), so a caller that took a generator takes a stream unchanged. Its structure, stated so a
// reader can judge where it is and is not a stand-in for independent draws:
//
//   the stream at `start` owns one prime P(start), the least prime at or above 400 + 1000 u with
//   u = start mod 2^26, and draw k uses slot j = k mod 64 and step m = floor(k / 64) + 1 and returns
//   frac(m sqrt(q_j P(start))), q_j the j-th prime (2, 3, 5, ..., 311).
//
//   Every q_j P is square-free and every one is distinct, across slots and across streams (P is a prime
//   above 311, and prime gaps below 7e10 are under 1000, so distinct u give distinct P). By Besicovitch the
//   rates of ANY finite set of streams are independent over the rationals, so by Kronecker the streams
//   taken together are one jointly equidistributed sequence: each slot is a Weyl orbit, any window of up to
//   64 consecutive draws of one stream is equidistributed in 64 dimensions, and two or more streams are
//   mutually equidistributed, with no linear relation between starts.
//
//   Why a prime per start: two earlier versions were linear in the start. The first shifted each slot's
//   phase by frac(start b_j), so two streams differed by the same offset at every step and their
//   sign-pattern correlation sat near 0.07 however long they ran. The second also tilted the rate by
//   start c_j, which fixed pairs but left every four streams with s1 - s2 + s3 - s4 = 0 exactly related,
//   so a product of four sign patterns averaged 0.33 against 0.025 for independent values. A vector memory
//   binding key 2i + 1 to value 2i + 2 (E-DST-0002) failed on both. With a prime per start, pairs correlate
//   at 0.034 for n = 1024 (0.031 independent), the four-stream product averages 0.023, and one stream's
//   consecutive-pair chi-square over 100 cells is 6, a sixteenth of a generator's
//   (tmp/det-design-probe.ts, 2026-09-25).
//
//   Starts that agree modulo 2^26 read the same stream.
//
//   What it is NOT: the sequence is not completely uniformly distributed, so a Monte Carlo chain driven by
//   it is a deterministic dynamics with a quasi-random schedule, not a Markov chain. A result that needed
//   true independence can move when switched to it.
//
// Arithmetic is exact 32-bit fixed point: each rate frac(sqrt(q_j P)) is rounded to an odd 32-bit integer
// and the value is (m * rate_j) mod 2^32, so the stream is bit-identical on every machine.

// the golden and silver Weyl rotations, the fractional parts of (1 + sqrt 5) / 2 and 1 + sqrt 2
export const GOLDEN = (Math.sqrt(5) - 1) / 2
export const SILVER = Math.SQRT2 - 1

// the number of slots in the stream: the largest window that is a single Kronecker point
export const WEYL_DIMENSION = 64

const TWO_32 = 4294967296

// the first `count` primes, by trial division
function firstPrimes(count: number): number[] {
  const primes: number[] = []

  for (let n = 2; primes.length < count; n++) {
    if (primes.every(p => n % p !== 0)) {
      primes.push(n)
    }
  }

  return primes
}

// q_0 .. q_63, the slot primes 2 to 311
const SLOT_PRIMES = firstPrimes(WEYL_DIMENSION)

// frac(x) as an odd 32-bit integer: odd so the rotation by it has the full period 2^32
function fixedFraction(x: number): number {
  return (Math.floor((x - Math.floor(x)) * TWO_32) | 1) >>> 0
}

// frac(sqrt p), for the lattice values of weylCell
function fixedIrrational(prime: number): number {
  return fixedFraction(Math.sqrt(prime))
}

// how a start becomes its prime: u = start mod 2^26, P = the least prime at or above 400 + 1000 u. The
// base 400 keeps P above every slot prime; the spacing 1000 exceeds every prime gap below 7e10, so
// distinct u never share a P; 2^26 keeps q_j P below 2.1e13, where a double's square root leaves 30 exact
// bits of fraction.
const START_MODULUS = 2 ** 26
const PRIME_BASE = 400
const PRIME_SPACING = 1000

// Deterministic Miller-Rabin: the bases 2 to 17 decide primality exactly below 3.4e14.
const WITNESSES = [2n, 3n, 5n, 7n, 11n, 13n, 17n]

function isPrime(n: number): boolean {
  if (n < 2) {
    return false
  }

  for (const q of SLOT_PRIMES) {
    if (n === q) {
      return true
    }

    if (n % q === 0) {
      return false
    }
  }

  const big = BigInt(n)
  const less = big - 1n

  let d = less
  let s = 0

  while (d % 2n === 0n) {
    d /= 2n
    s++
  }

  const power = (base: bigint, exponent: bigint): bigint => {
    let result = 1n
    let b = base % big
    let e = exponent

    while (e > 0n) {
      if (e & 1n) {
        result = (result * b) % big
      }

      b = (b * b) % big
      e >>= 1n
    }

    return result
  }

  for (const a of WITNESSES) {
    let x = power(a, d)

    if (x === 1n || x === less) {
      continue
    }

    let composite = true

    for (let r = 1; r < s; r++) {
      x = (x * x) % big

      if (x === less) {
        composite = false
        break
      }
    }

    if (composite) {
      return false
    }
  }

  return true
}

const STREAM_PRIMES = new Map<number, number>()

// the prime a start owns (see the header)
export function weylStreamPrime(start: number): number {
  const u = ((Math.round(start) % START_MODULUS) + START_MODULUS) % START_MODULUS
  const known = STREAM_PRIMES.get(u)

  if (known !== undefined) {
    return known
  }

  let n = PRIME_BASE + PRIME_SPACING * u

  while (!isPrime(n)) {
    n++
  }

  STREAM_PRIMES.set(u, n)

  return n
}

// The stream type. The method names match the retired generator so every caller that took one keeps
// working; the values are a Kronecker sequence, not draws.
export type Weyl = {
  // a value in [0, 1)
  next(): number
  // an integer in [0, max)
  nextInt(input: { max: number }): number
  // a standard normal value, the inverse normal distribution function of one stream value
  nextGaussian(): number
}

// The inverse of the standard normal distribution function, Acklam's rational approximation (relative
// error below 1.2e-9 over the whole open interval). One stream value gives one normal value, so a
// normal is never built from a PAIR of values, which a Weyl pair would correlate.
const ACKLAM_A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
  1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
]
const ACKLAM_B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
  6.680131188771972e1, -1.328068155288572e1,
]
const ACKLAM_C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
  -2.549732539343734, 4.374664141464968, 2.938163982698783,
]
const ACKLAM_D = [
  7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
  3.754408661907416,
]
const ACKLAM_LOW = 0.02425

export function inverseNormal(u: number): number {
  const [a0, a1, a2, a3, a4, a5] = ACKLAM_A as [number, number, number, number, number, number]
  const [b0, b1, b2, b3, b4] = ACKLAM_B as [number, number, number, number, number]
  const [c0, c1, c2, c3, c4, c5] = ACKLAM_C as [number, number, number, number, number, number]
  const [d0, d1, d2, d3] = ACKLAM_D as [number, number, number, number]

  if (u < ACKLAM_LOW) {
    const q = Math.sqrt(-2 * Math.log(u))

    return (
      (((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) /
      ((((d0 * q + d1) * q + d2) * q + d3) * q + 1)
    )
  }

  if (u > 1 - ACKLAM_LOW) {
    const q = Math.sqrt(-2 * Math.log(1 - u))

    return -(
      (((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) /
      ((((d0 * q + d1) * q + d2) * q + d3) * q + 1)
    )
  }

  const q = u - 0.5
  const r = q * q

  return (
    ((((((a0 * r + a1) * r + a2) * r + a3) * r + a4) * r + a5) * q) /
    (((((b0 * r + b1) * r + b2) * r + b3) * r + b4) * r + 1)
  )
}

// The Kronecker stream. `start` is an integer that picks which equidistributed stream to read (through
// the prime it owns, every slot's rate frac(sqrt(q_j P))), not a seed: there is nothing random behind it.
export function makeWeyl(input: { start: number }): Weyl {
  const prime = weylStreamPrime(input.start)
  const rate = Uint32Array.from(SLOT_PRIMES, q =>
    fixedFraction(Math.sqrt(q * prime)),
  )

  let slot = 0
  let step = 1

  // the raw 32-bit value of the next draw: (m * rate_j) mod 2^32
  const advance = (): number => {
    const j = slot
    const value = Math.imul(step, rate[j] ?? 0) >>> 0

    slot++

    if (slot === WEYL_DIMENSION) {
      slot = 0
      step++
    }

    return value
  }

  const next = (): number => advance() / TWO_32

  return {
    next,
    nextInt: ({ max }) => Math.floor(next() * max),
    // the half-step centering keeps the value strictly inside (0, 1), so the tails stay finite
    nextGaussian: () => inverseNormal((advance() + 0.5) / TWO_32),
  }
}

// The Kronecker value of a lattice point: frac(key * a + beat * b + salt * c), with a, b, c the
// fractional parts of sqrt 2, sqrt 3 and sqrt 5 in exact 32-bit fixed point. It replaces the stateless
// hash a rule used to consult per (edge, beat): a fixed, equidistributed function of the point, with no
// generator behind it. Unlike a hash its neighbors are related (the value at key + 1 is the value at key
// moved by a), so a threshold on it draws a quasi-periodic (Sturmian) pattern along the key, not
// independent bits.
const CELL_KEY = fixedIrrational(2)
const CELL_BEAT = fixedIrrational(3)
const CELL_SALT = fixedIrrational(5)

export function weylCell(key: number, beat: number, salt: number): number {
  const value =
    (Math.imul(key | 0, CELL_KEY) +
      Math.imul(beat | 0, CELL_BEAT) +
      Math.imul(salt | 0, CELL_SALT)) >>>
    0

  return value / TWO_32
}

// frac(index * alpha): the index-th point of the Weyl sequence of alpha, the golden rotation by default
export function weyl(index: number, alpha: number = GOLDEN): number {
  const x = index * alpha

  return x - Math.floor(x)
}

// the first `count` points frac((offset + i + 1) * alpha), the fill every start in the repo is built from
export function weylFill(input: {
  count: number
  alpha?: number
  offset?: number
}): Float64Array {
  const alpha = input.alpha ?? GOLDEN
  const offset = input.offset ?? 0
  const out = new Float64Array(input.count)

  for (let i = 0; i < input.count; i++) {
    out[i] = weyl(offset + i + 1, alpha)
  }

  return out
}

// A deterministic permutation of [0, size): the Fisher-Yates shuffle driven by the stream at `start`.
export function weylPermutation(input: {
  size: number
  start: number
}): number[] {
  const stream = makeWeyl({ start: input.start })
  const order = Array.from({ length: input.size }, (_value, i) => i)

  for (let i = input.size - 1; i > 0; i--) {
    const j = stream.nextInt({ max: i + 1 })
    const a = order[i] ?? 0

    order[i] = order[j] ?? 0
    order[j] = a
  }

  return order
}

// A deterministic unit vector in n dimensions: n normal values from the stream, normalized. The
// direction is equidistributed on the sphere over starts, and it is never orthogonal to a fixed vector
// except on a set of starts of measure zero, which is all a Krylov or power method needs of its start.
export function weylUnitVector(input: {
  dimension: number
  start: number
}): Float64Array {
  const stream = makeWeyl({ start: input.start })
  const out = new Float64Array(input.dimension)

  let norm = 0

  for (let i = 0; i < input.dimension; i++) {
    const v = stream.nextGaussian()

    out[i] = v
    norm += v * v
  }

  const scale = norm > 0 ? 1 / Math.sqrt(norm) : 0

  for (let i = 0; i < input.dimension; i++) {
    out[i] = (out[i] ?? 0) * scale
  }

  return out
}

// A deterministic orthogonal matrix: modified Gram-Schmidt on n normal vectors from the stream. Rows are
// orthonormal to rounding. For linear-algebra tests that need a generic basis, not a Haar sample.
export function weylOrthogonal(input: {
  dimension: number
  start: number
}): number[][] {
  const n = input.dimension
  const stream = makeWeyl({ start: input.start })
  const rows: number[][] = []

  for (let i = 0; i < n; i++) {
    const v = Array.from({ length: n }, () => stream.nextGaussian())

    for (const row of rows) {
      let dot = 0

      for (let k = 0; k < n; k++) {
        dot += (row[k] ?? 0) * (v[k] ?? 0)
      }

      for (let k = 0; k < n; k++) {
        v[k] = (v[k] ?? 0) - dot * (row[k] ?? 0)
      }
    }

    const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0))

    rows.push(v.map(x => x / norm))
  }

  return rows
}

// A deterministic unitary matrix: modified Gram-Schmidt on n complex normal vectors from the stream, as
// separate real and imaginary parts. Rows are orthonormal under the Hermitian product to rounding.
export function weylUnitary(input: {
  dimension: number
  start: number
}): { re: number[][]; im: number[][] } {
  const n = input.dimension
  const stream = makeWeyl({ start: input.start })
  const re: number[][] = []
  const im: number[][] = []

  for (let i = 0; i < n; i++) {
    const vr = Array.from({ length: n }, () => stream.nextGaussian())
    const vi = Array.from({ length: n }, () => stream.nextGaussian())

    for (let r = 0; r < re.length; r++) {
      const ur = re[r] ?? []
      const ui = im[r] ?? []

      // <u, v> = sum conj(u) v
      let dr = 0
      let di = 0

      for (let k = 0; k < n; k++) {
        const a = ur[k] ?? 0
        const b = ui[k] ?? 0
        const c = vr[k] ?? 0
        const d = vi[k] ?? 0

        dr += a * c + b * d
        di += a * d - b * c
      }

      for (let k = 0; k < n; k++) {
        const a = ur[k] ?? 0
        const b = ui[k] ?? 0

        vr[k] = (vr[k] ?? 0) - (dr * a - di * b)
        vi[k] = (vi[k] ?? 0) - (dr * b + di * a)
      }
    }

    let norm = 0

    for (let k = 0; k < n; k++) {
      norm += (vr[k] ?? 0) ** 2 + (vi[k] ?? 0) ** 2
    }

    const scale = 1 / Math.sqrt(norm)

    re.push(vr.map(x => x * scale))
    im.push(vi.map(x => x * scale))
  }

  return { re, im }
}

// A Poisson(lambda) count by Knuth's product method, driven by the stream: the element count of a
// sprinkling at expected count lambda. Valid while exp(-lambda) is representable.
export function poissonSample(input: { lambda: number; rng: Weyl }): number {
  const limit = Math.exp(-input.lambda)

  let k = 0
  let p = 1

  do {
    k++
    p *= input.rng.next()
  } while (p > limit)

  return k - 1
}

// Categorical frequencies over `draws` stream values: bin k of a population partitioned into bins of
// size counts[k] receives the values that land in its share. With a Weyl stream this is a quasi-Monte
// Carlo estimate of counts[k] / total whose error falls like 1 / draws, not 1 / sqrt(draws).
export function sampleEmpiricalFrequencies(input: {
  counts: number[]
  draws: number
  rng: Weyl
}): number[] {
  const { counts, draws, rng } = input
  const cumulative: number[] = []

  let acc = 0

  for (const c of counts) {
    acc += c
    cumulative.push(acc)
  }

  const total = acc
  const hits = new Array<number>(counts.length).fill(0)

  for (let d = 0; d < draws; d++) {
    const u = rng.nextInt({ max: total })

    let k = 0

    while (k < cumulative.length && u >= (cumulative[k] ?? 0)) {
      k++
    }

    hits[k] = (hits[k] ?? 0) + 1
  }

  return hits.map(h => h / draws)
}
