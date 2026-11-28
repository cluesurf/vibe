// Bounds on the standing modes one source excites, and the exact orbit period of the Z3 wave without a run cap.
// Exact integers, polynomials over F3 and bigint only.
//
// THE BOUNDS. A' = A + sigma I commutes with every graph automorphism, so A'^j delta_0 is fixed by the stabilizer of
// cell 0 and the Krylov space of delta_0 lies in the span of the stabilizer's orbit indicators: k <= the number of
// orbits of Stab(0) (`stabilizerOrbits`, exact automorphisms by individualization and refinement, the method of
// graph-automorphism.ts). Sharper, and over any field: the coarsest equitable partition with cell 0 individualized is
// A'-invariant (every cell of one class has the same number of neighbours in each class), so k <= its class count
// (`equitableBound`). Orbits refine the equitable classes, so equitable <= orbits.
//
// THE PERIOD. The wave map T(p, c) = (c, A' c - p) satisfies T + T^-1 = A' (on both slices), so with m the minimal
// polynomial of A' on delta_0 (degree k), mu(x) = x^k m(x + 1/x) annihilates (0, delta_0); its degree 2k equals the
// dimension of T's cyclic space (E-CMP-0046 gate B2), so mu is T's minimal polynomial there, and the orbit period of
// (0, delta_0) is the multiplicative order of x modulo mu over F3. It is found with no run: square-free factorization,
// distinct-degree factorization (both deterministic), the order of x modulo each degree-d part from the prime factors of
// 3^d - 1, and the power of 3 that the repeated factors add. A part whose 3^d - 1 cannot be factored and certified within
// the trial bound is reported unresolved (null), never guessed.

export type Neighbors = readonly (readonly number[])[]

// ---- the equitable partition bound ----

// Colour refinement from (cell `root`, everything else) to the coarsest equitable partition; its class count.
export function equitableBound(neighbors: Neighbors, root: number): number {
  const n = neighbors.length

  let colour = new Int32Array(n)

  colour[root] = 1

  let classes = 2

  for (;;) {
    const table = new Map<string, number>()
    const next = new Int32Array(n)

    for (let v = 0; v < n; v++) {
      const around = neighbors[v]!.map(u => colour[u]!).sort((a, b) => a - b)
      const key = `${colour[v]}:${around.join(',')}`

      let id = table.get(key)

      if (id === undefined) {
        id = table.size
        table.set(key, id)
      }

      next[v] = id
    }

    colour = next

    if (table.size === classes) {
      return classes
    }

    classes = table.size
  }
}

// ---- the stabilizer's orbits ----

export type StabilizerOrbits = {
  // the number of orbits of Stab(root) on the cells, or null when the refinement budget ran out
  readonly orbits: number | null
  readonly equitable: number
  readonly refinements: number
}

const ORBIT_BUDGET = 400_000

export function stabilizerOrbits(input: { neighbors: Neighbors; root: number; budget?: number }): StabilizerOrbits {
  const rows = input.neighbors.map((row, x) => [...new Set(row)].filter(y => y !== x))
  const n = rows.length
  const budget = input.budget ?? ORBIT_BUDGET
  const adjacency = rows.map(row => new Set(row))

  let refinements = 0

  // the refinement of graph-automorphism.ts: both sides together, failing when the histograms differ
  const refinePair = (left: Int32Array, right: Int32Array): boolean => {
    refinements++

    let classes = -1

    for (;;) {
      const table = new Map<string, number>()
      const nextLeft = new Int32Array(n)
      const nextRight = new Int32Array(n)

      const signature = (colour: Int32Array, v: number): string => {
        const around = rows[v]!.map(u => colour[u]!).sort((a, b) => a - b)

        return `${colour[v]}:${around.join(',')}`
      }

      for (let v = 0; v < n; v++) {
        const key = signature(left, v)

        let id = table.get(key)

        if (id === undefined) {
          id = table.size
          table.set(key, id)
        }

        nextLeft[v] = id
      }

      for (let v = 0; v < n; v++) {
        const id = table.get(signature(right, v))

        if (id === undefined) {
          return false
        }

        nextRight[v] = id
      }

      const count = new Int32Array(table.size)

      for (let v = 0; v < n; v++) {
        count[nextLeft[v]!]!++
        count[nextRight[v]!]!--
      }

      if (count.some(c => c !== 0)) {
        return false
      }

      left.set(nextLeft)
      right.set(nextRight)

      if (table.size === classes) {
        return true
      }

      classes = table.size
    }
  }

  const isAutomorphism = (g: Int32Array): boolean => {
    const seen = new Uint8Array(n)

    for (let x = 0; x < n; x++) {
      if (g[x]! < 0 || seen[g[x]!]) {
        return false
      }

      seen[g[x]!] = 1

      for (const y of rows[x]!) {
        if (!adjacency[g[x]!]!.has(g[y]!)) {
          return false
        }
      }
    }

    return true
  }

  const search = (left: Int32Array, right: Int32Array): Int32Array | null | 'budget' => {
    if (refinements > budget) {
      return 'budget'
    }

    if (new Set(left).size === n) {
      const at = new Int32Array(n)

      for (let x = 0; x < n; x++) {
        at[right[x]!] = x
      }

      const g = Int32Array.from(left, c => at[c]!)

      return isAutomorphism(g) ? g : null
    }

    const size = new Int32Array(n)

    for (let x = 0; x < n; x++) {
      size[left[x]!]!++
    }

    let target = -1

    for (let c = 0; c < n; c++) {
      if (size[c]! > 1 && (target < 0 || size[c]! < size[target]!)) {
        target = c
      }
    }

    const v = left.indexOf(target)

    for (let x = 0; x < n; x++) {
      if (right[x] !== target) {
        continue
      }

      const l = Int32Array.from(left)
      const r = Int32Array.from(right)

      l[v] = n
      r[x] = n

      if (!refinePair(l, r)) {
        continue
      }

      const found = search(l, r)

      if (found !== null) {
        return found
      }
    }

    return null
  }

  // the partition with the root individualized
  const base = new Int32Array(n)

  base[input.root] = n
  refinePair(base, Int32Array.from(base))

  const equitable = new Set(base).size
  const parent = Int32Array.from({ length: n }, (_, i) => i)

  const find = (i: number): number => {
    let r = i

    while (parent[r] !== r) {
      r = parent[r]!
    }

    let c = i

    while (parent[c] !== r) {
      const next = parent[c]!

      parent[c] = r
      c = next
    }

    return r
  }

  const join = (a: number, b: number): void => {
    const ra = find(a)
    const rb = find(b)

    if (ra !== rb) {
      parent[Math.max(ra, rb)] = Math.min(ra, rb)
    }
  }

  const cells = new Map<number, number[]>()

  for (let x = 0; x < n; x++) {
    const list = cells.get(base[x]!) ?? []

    list.push(x)
    cells.set(base[x]!, list)
  }

  for (const cell of cells.values()) {
    const representatives: number[] = []

    for (const w of cell) {
      if (representatives.some(r => find(r) === find(w))) {
        continue
      }

      let merged = false

      for (const r of representatives) {
        const l = Int32Array.from(base)
        const rr = Int32Array.from(base)

        l[r] = n + 1
        rr[w] = n + 1

        const g = refinePair(l, rr) ? search(l, rr) : null

        if (g === 'budget') {
          return { orbits: null, equitable, refinements }
        }

        if (g !== null) {
          for (let x = 0; x < n; x++) {
            join(x, g[x]!)
          }

          merged = true
          break
        }
      }

      if (!merged) {
        representatives.push(w)
      }
    }
  }

  let orbits = 0

  for (let x = 0; x < n; x++) {
    if (find(x) === x) {
      orbits++
    }
  }

  return { orbits, equitable, refinements }
}

// ---- polynomials over F3, lowest degree first, no trailing zeros (the zero polynomial is []) ----

export type Poly = number[]

function trim(a: Poly): Poly {
  let k = a.length

  while (k > 0 && a[k - 1] === 0) {
    k--
  }

  return a.slice(0, k)
}

const degreeOf = (a: Poly): number => a.length - 1

function addPoly(a: Poly, b: Poly): Poly {
  const out = new Array<number>(Math.max(a.length, b.length)).fill(0)

  for (let i = 0; i < out.length; i++) {
    out[i] = ((a[i] ?? 0) + (b[i] ?? 0)) % 3
  }

  return trim(out)
}

function scalePoly(a: Poly, c: number): Poly {
  return trim(a.map(v => (v * c) % 3))
}

function mulPoly(a: Poly, b: Poly): Poly {
  if (a.length === 0 || b.length === 0) {
    return []
  }

  const out = new Array<number>(a.length + b.length - 1).fill(0)

  for (let i = 0; i < a.length; i++) {
    if (a[i] === 0) {
      continue
    }

    for (let j = 0; j < b.length; j++) {
      out[i + j] = (out[i + j]! + a[i]! * b[j]!) % 3
    }
  }

  return trim(out)
}

// quotient and remainder; the inverse of 1 and 2 mod 3 is themselves
function divmodPoly(a: Poly, b: Poly): [Poly, Poly] {
  if (b.length === 0) {
    throw new Error('mode-bounds: division by the zero polynomial')
  }

  const r = [...a]
  const db = degreeOf(b)
  const lead = b[db]!
  const q = new Array<number>(Math.max(0, a.length - db)).fill(0)

  for (let i = r.length - 1; i >= db; i--) {
    const c = (r[i]! * lead) % 3

    if (c === 0) {
      continue
    }

    q[i - db] = c

    for (let j = 0; j <= db; j++) {
      r[i - db + j] = (r[i - db + j]! + 3 * 3 - c * b[j]!) % 3
    }
  }

  return [trim(q), trim(r)]
}

const modPoly = (a: Poly, b: Poly): Poly => divmodPoly(a, b)[1]

function monic(a: Poly): Poly {
  return a.length === 0 ? a : scalePoly(a, a[a.length - 1]!)
}

function gcdPoly(a: Poly, b: Poly): Poly {
  let x = trim(a)
  let y = trim(b)

  while (y.length > 0) {
    const r = modPoly(x, y)

    x = y
    y = r
  }

  return monic(x)
}

function derivative(a: Poly): Poly {
  return trim(a.slice(1).map((v, i) => (v * ((i + 1) % 3)) % 3))
}

// x^e mod f, e a bigint
function powXMod(e: bigint, f: Poly): Poly {
  let result: Poly = [1]
  let base: Poly = modPoly([0, 1], f)
  let k = e

  while (k > 0n) {
    if (k & 1n) {
      result = modPoly(mulPoly(result, base), f)
    }

    base = modPoly(mulPoly(base, base), f)
    k >>= 1n
  }

  return modPoly(result, f)
}

const isOne = (a: Poly): boolean => a.length === 1 && a[0] === 1

// the p-th root of a polynomial in x^3 (the Frobenius fixes F3)
function cubeRoot(a: Poly): Poly {
  const out: Poly = []

  for (let i = 0; i < a.length; i += 3) {
    out.push(a[i]!)
  }

  return trim(out)
}

// square-free factorization: pairs (s, j) with f = product s^j, s square-free, pairwise coprime
export function squareFree(f: Poly): [Poly, number][] {
  const out: [Poly, number][] = []
  const fm = monic(f)
  const d = derivative(fm)

  if (d.length === 0) {
    if (degreeOf(fm) <= 0) {
      return out
    }

    return squareFree(cubeRoot(fm)).map(([g, j]) => [g, 3 * j])
  }

  let c = gcdPoly(fm, d)
  let w = divmodPoly(fm, c)[0]
  let i = 1

  while (degreeOf(w) > 0) {
    const y = gcdPoly(w, c)
    const factor = monic(divmodPoly(w, y)[0])

    if (degreeOf(factor) > 0) {
      out.push([factor, i])
    }

    w = y
    c = divmodPoly(c, y)[0]
    i++
  }

  if (degreeOf(c) > 0) {
    for (const [g, j] of squareFree(cubeRoot(monic(c)))) {
      out.push([g, 3 * j])
    }
  }

  return out
}

// distinct-degree factorization of a square-free monic f: pairs (g, d), g the product of f's irreducible factors of
// degree d
export function distinctDegree(f: Poly): [Poly, number][] {
  const out: [Poly, number][] = []

  let rest = monic(f)
  let h: Poly = modPoly([0, 1], rest)

  for (let d = 1; 2 * d <= degreeOf(rest); d++) {
    // h = x^(3^d) mod rest
    h = modPoly(mulPoly(mulPoly(h, h), h), rest)

    const g = gcdPoly(addPoly(h, [0, 2]), rest)

    if (degreeOf(g) > 0) {
      out.push([g, d])
      rest = divmodPoly(rest, g)[0]
      h = modPoly(h, rest)
    }
  }

  if (degreeOf(rest) > 0) {
    out.push([rest, degreeOf(rest)])
  }

  return out
}

// ---- integer factoring of 3^d - 1 (cyclotomic pieces, trial division over primes 1 mod e, certified remainders) ----

function bigPow(b: bigint, e: number): bigint {
  let r = 1n

  for (let i = 0; i < e; i++) {
    r *= b
  }

  return r
}

function modPow(b: bigint, e: bigint, m: bigint): bigint {
  let r = 1n
  let x = b % m
  let k = e

  while (k > 0n) {
    if (k & 1n) {
      r = (r * x) % m
    }

    x = (x * x) % m
    k >>= 1n
  }

  return r
}

// deterministic Miller-Rabin with the first 13 prime bases: correct for every n < 3.317e24 (Sorenson and Webster 2015);
// null above that bound
const MR_BOUND = 3_317_044_064_679_887_385_961_981n

function isPrimeCertified(n: bigint): boolean | null {
  if (n < 2n) {
    return false
  }

  for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) {
    if (n === p) {
      return true
    }

    if (n % p === 0n) {
      return false
    }
  }

  if (n >= MR_BOUND) {
    return null
  }

  let d = n - 1n
  let s = 0

  while (d % 2n === 0n) {
    d /= 2n
    s++
  }

  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n]) {
    let x = modPow(a, d, n)

    if (x === 1n || x === n - 1n) {
      continue
    }

    let composite = true

    for (let r = 1; r < s; r++) {
      x = (x * x) % n

      if (x === n - 1n) {
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

function divisors(n: number): number[] {
  const out: number[] = []

  for (let i = 1; i <= n; i++) {
    if (n % i === 0) {
      out.push(i)
    }
  }

  return out
}

function mobius(n: number): number {
  let m = n
  let sign = 1

  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      m /= p

      if (m % p === 0) {
        return 0
      }

      sign = -sign
    }
  }

  return m > 1 ? -sign : sign
}

// Phi_e(3) = product over f | e of (3^f - 1)^mu(e / f)
function cyclotomicAtThree(e: number): bigint {
  let num = 1n
  let den = 1n

  for (const f of divisors(e)) {
    const mu = mobius(e / f)
    const v = bigPow(3n, f) - 1n

    if (mu === 1) {
      num *= v
    } else if (mu === -1) {
      den *= v
    }
  }

  return num / den
}

export const TRIAL_STEPS = 4_000_000

// The prime factorization of 3^d - 1 as a map prime -> exponent, or null when some remainder can be neither split by
// trial division nor certified prime. A prime factor of Phi_e(3) either divides e or is 1 mod e, so the trial divisors
// after the primes of e step through 1 + e t (1 + 2 e t when e is odd, since every factor is odd).
export function factorThreePowerMinusOne(d: number): Map<bigint, number> | null {
  const out = new Map<bigint, number>()

  const add = (p: bigint, k = 1): void => {
    out.set(p, (out.get(p) ?? 0) + k)
  }

  for (const e of divisors(d)) {
    let r = cyclotomicAtThree(e)

    for (let p = 2; p <= e; p++) {
      if (e % p === 0 && isPrimeCertified(BigInt(p))) {
        while (r % BigInt(p) === 0n) {
          r /= BigInt(p)
          add(BigInt(p))
        }
      }
    }

    const stride = BigInt(e % 2 === 0 ? e : 2 * e)

    let q = 1n + stride
    let steps = 0

    while (r > 1n && q * q <= r && steps < TRIAL_STEPS) {
      while (r % q === 0n) {
        r /= q
        add(q)
      }

      q += stride
      steps++
    }

    if (r === 1n) {
      continue
    }

    // every factor of r is at least q: below q^2 it is prime
    if (q * q > r) {
      add(r)
      continue
    }

    const prime = isPrimeCertified(r)

    if (prime !== true) {
      return null
    }

    add(r)
  }

  return out
}

// ---- the exact period ----

export type ExactPeriod = {
  // the order of x modulo mu, or null when a factorization of 3^d - 1 was not certified
  readonly period: bigint | null
  // the degrees of mu's irreducible factors (with multiplicity in the square-free parts), for the log
  readonly degrees: readonly number[]
  readonly largestDegree: number
}

// mu(x) = x^k m(x + 1/x), m monic of degree k, lowest coefficient first
export function waveAnnihilator(m: readonly number[]): Poly {
  const k = m.length - 1

  let out: Poly = []

  // (x^2 + 1)^j x^(k - j) for each coefficient m_j
  let power: Poly = [1]

  for (let j = 0; j <= k; j++) {
    if (m[j]! % 3 !== 0) {
      const shifted = new Array<number>(k - j).fill(0).concat(power)

      out = addPoly(out, scalePoly(shifted, m[j]! % 3))
    }

    power = mulPoly(power, [1, 0, 1])
  }

  return out
}

function orderModSquareFree(g: Poly, d: number): bigint | null {
  const factors = factorThreePowerMinusOne(d)

  if (!factors) {
    return null
  }

  let order = bigPow(3n, d) - 1n

  if (!isOne(powXMod(order, g))) {
    throw new Error('mode-bounds: x^(3^d - 1) is not 1 modulo a degree-d part')
  }

  for (const [p, e] of factors) {
    for (let i = 0; i < e; i++) {
      if (order % p === 0n && isOne(powXMod(order / p, g))) {
        order /= p
      } else {
        break
      }
    }
  }

  return order
}

const gcdBig = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcdBig(b, a % b))
const lcmBig = (a: bigint, b: bigint): bigint => (a / gcdBig(a, b)) * b

export function exactWavePeriod(m: readonly number[]): ExactPeriod {
  const mu = waveAnnihilator(m)

  if (mu[0] === 0) {
    throw new Error('mode-bounds: mu has a factor x, but T is invertible')
  }

  const degrees: number[] = []

  let period = 1n
  let resolved = true

  for (const [s, j] of squareFree(mu)) {
    let o = 1n

    for (const [g, d] of distinctDegree(s)) {
      for (let c = 0; c < degreeOf(g) / d; c++) {
        degrees.push(d)
      }

      const part = orderModSquareFree(g, d)

      if (part === null) {
        resolved = false
        continue
      }

      o = lcmBig(o, part)
    }

    if (!resolved) {
      continue
    }

    // the repeated factor s^j adds a power of 3: the least t with x^(o 3^t) = 1 modulo s^j
    let sj: Poly = [1]

    for (let i = 0; i < j; i++) {
      sj = mulPoly(sj, s)
    }

    let t = o

    while (!isOne(powXMod(t, sj))) {
      t *= 3n
    }

    period = lcmBig(period, t)
  }

  return { period: resolved ? period : null, degrees, largestDegree: Math.max(0, ...degrees) }
}
