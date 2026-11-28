// Exact resonance measures for linear Z3 dynamics on a cell graph (item vibe-computation-models-0019, M8). Everything
// is integer arithmetic mod 3 or bigint rationals: no floating point decides anything here.
//
// The linear second-order wave s(t+1) = A' s(t) - s(t-1) with A' = A + sigma I over F3 is the map
// T (s(t-1), s(t)) = (s(t), A' s(t) - s(t-1)). Its modes are read through:
//   - the minimal polynomial of A' on a seed vector (Krylov elimination over F3): the number of standing modes the seed
//     excites. T's cyclic space from (0, seed) has twice that dimension (substitute y = x + 1/x),
//   - the exact orbit period of a seed pair,
//   - the Z3 order parameter M^2 = |sum over cells of omega^s|^2, an integer, averaged over one period.
// And for the front of the one-source wave on an open ball: exact geodesic counts (bigint) and Lucas's theorem.

export type Neighbors = readonly (readonly number[])[]

// ---- exact rationals over bigint ----

export type Fraction = { readonly n: bigint; readonly d: bigint }

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    const r = x % y

    x = y
    y = r
  }

  return x
}

export function fraction(n: bigint | number, d: bigint | number = 1n): Fraction {
  let nn = BigInt(n)
  let dd = BigInt(d)

  if (dd === 0n) {
    throw new Error('z3-resonance: zero denominator')
  }

  if (dd < 0n) {
    nn = -nn
    dd = -dd
  }

  const g = gcd(nn, dd) || 1n

  return { n: nn / g, d: dd / g }
}

export function addFractions(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d)
}

export function scaleFraction(a: Fraction, n: bigint, d: bigint): Fraction {
  return fraction(a.n * n, a.d * d)
}

// -1, 0, +1 as a < b, a = b, a > b
export function compareFractions(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const l = a.n * b.d
  const r = b.n * a.d

  return l < r ? -1 : l > r ? 1 : 0
}

// for display only, never for a verdict
export function fractionToNumber(a: Fraction, digits = 4): number {
  const scale = 10n ** BigInt(digits)
  const q = (a.n * scale * 2n + a.d) / (2n * a.d)

  return Number(q) / Number(scale)
}

// ---- graph facts ----

// two-colour the graph by breadth-first search; true when every edge joins the two colours
export function isBipartite(neighbors: Neighbors): boolean {
  const n = neighbors.length
  const colour = new Int8Array(n).fill(-1)

  for (let s = 0; s < n; s++) {
    if (colour[s] !== -1) {
      continue
    }

    colour[s] = 0

    const queue = [s]

    // the queue grows while it is read; for-of visits the appended cells too
    for (const u of queue) {
      for (const w of neighbors[u] ?? []) {
        if (colour[w] === -1) {
          colour[w] = 1 - colour[u]!
          queue.push(w)
        } else if (colour[w] === colour[u]) {
          return false
        }
      }
    }
  }

  return true
}

// ---- linear algebra over F3 ----

// y = A' x = (A + sigma I) x mod 3
export function applyShiftedAdjacency(neighbors: Neighbors, sigma: number, x: Uint8Array): Uint8Array {
  const n = neighbors.length
  const y = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    let s = sigma * x[i]!

    for (const j of neighbors[i] ?? []) {
      s += x[j]!
    }

    y[i] = s % 3
  }

  return y
}

// m(A') x, coefficients lowest degree first, by Horner's rule
export function evaluatePolynomialOn(
  neighbors: Neighbors,
  sigma: number,
  coefficients: readonly number[],
  x: Uint8Array,
): Uint8Array {
  let acc = new Uint8Array(x.length)

  for (let k = coefficients.length - 1; k >= 0; k--) {
    acc = applyShiftedAdjacency(neighbors, sigma, acc)

    const c = coefficients[k]! % 3

    if (c !== 0) {
      for (let i = 0; i < x.length; i++) {
        acc[i] = (acc[i]! + c * x[i]!) % 3
      }
    }
  }

  return acc
}

// The minimal polynomial of a linear map on a seed over F3, by incremental Krylov elimination: seed, M seed, M^2 seed,
// ... until the next power is a combination of the earlier ones. Returns the monic coefficients, lowest degree first
// (length degree + 1), or null when the degree would pass maxDegree.
export function krylovMinimalPolynomial(input: {
  apply: (v: Uint8Array) => Uint8Array
  seed: Uint8Array
  maxDegree: number
}): number[] | null {
  const { apply, seed, maxDegree } = input
  const basis: { vec: Uint8Array; pivot: number; poly: Uint8Array }[] = []

  let raw = seed

  for (let k = 0; k <= maxDegree; k++) {
    if (k > 0) {
      raw = apply(raw)
    }

    const w = Uint8Array.from(raw)
    const poly = new Uint8Array(maxDegree + 1)

    poly[k] = 1

    for (const b of basis) {
      const c = w[b.pivot]!

      if (c === 0) {
        continue
      }

      // b.vec[b.pivot] = 1, so subtract c * b
      const minus = 3 - c

      for (let i = 0; i < w.length; i++) {
        w[i] = (w[i]! + minus * b.vec[i]!) % 3
      }

      for (let i = 0; i < poly.length; i++) {
        poly[i] = (poly[i]! + minus * b.poly[i]!) % 3
      }
    }

    let pivot = -1

    for (let i = 0; i < w.length; i++) {
      if (w[i] !== 0) {
        pivot = i
        break
      }
    }

    if (pivot === -1) {
      return Array.from(poly.subarray(0, k + 1))
    }

    // normalize the pivot to 1 (the inverse of 2 mod 3 is 2)
    if (w[pivot] === 2) {
      for (let i = 0; i < w.length; i++) {
        w[i] = (w[i]! * 2) % 3
      }

      for (let i = 0; i < poly.length; i++) {
        poly[i] = (poly[i]! * 2) % 3
      }
    }

    basis.push({ vec: w, pivot, poly })
  }

  return null
}

// the minimal polynomial of A' on the seed
export function shiftedAdjacencyMinimalPolynomial(input: {
  neighbors: Neighbors
  sigma: number
  seed: Uint8Array
}): number[] {
  const { neighbors, sigma, seed } = input
  const m = krylovMinimalPolynomial({
    apply: v => applyShiftedAdjacency(neighbors, sigma, v),
    seed,
    maxDegree: neighbors.length,
  })

  if (!m) {
    throw new Error('z3-resonance: Krylov degree passed the dimension')
  }

  return m
}

// the wave map T on the stacked pair (previous, current), length 2N
export function waveMap(neighbors: Neighbors, sigma: number): (v: Uint8Array) => Uint8Array {
  const n = neighbors.length

  return v => {
    const previous = v.subarray(0, n)
    const current = v.subarray(n, 2 * n)
    const next = applyShiftedAdjacency(neighbors, sigma, current)
    const out = new Uint8Array(2 * n)

    out.set(current, 0)

    for (let i = 0; i < n; i++) {
      out[n + i] = (next[i]! + 3 - previous[i]!) % 3
    }

    return out
  }
}

// the Z3 order parameter |sum omega^s|^2 = n0^2 + n1^2 + n2^2 - n0 n1 - n1 n2 - n2 n0, an exact integer
export function z3OrderSquared(state: Uint8Array): number {
  let n0 = 0
  let n1 = 0
  let n2 = 0

  for (const v of state) {
    if (v === 0) {
      n0++
    } else if (v === 1) {
      n1++
    } else {
      n2++
    }
  }

  return n0 * n0 + n1 * n1 + n2 * n2 - n0 * n1 - n1 * n2 - n2 * n0
}

export type OrbitReading = {
  // the exact period, or -1 past the cap
  readonly period: number
  // the mean of M^2 / N^2 over one period, exact, null past the cap
  readonly phaseOrder: Fraction | null
}

// Run (previous, current) under the wave until the pair returns. Reversible, so the orbit is a pure cycle through the
// start. M^2 is summed over the states s(1) .. s(P), which is one full period of the current slice.
export function waveOrbit(input: {
  neighbors: Neighbors
  sigma: number
  previous: Uint8Array
  current: Uint8Array
  cap: number
}): OrbitReading {
  const { neighbors, sigma, cap } = input
  const n = neighbors.length
  const step = waveMap(neighbors, sigma)
  const start = new Uint8Array(2 * n)

  start.set(input.previous, 0)
  start.set(input.current, n)

  let v = start
  let order = 0n

  for (let t = 1; t <= cap; t++) {
    v = step(v)
    order += BigInt(z3OrderSquared(v.subarray(n, 2 * n)))

    let back = true

    for (let i = 0; i < 2 * n; i++) {
      if (v[i] !== start[i]) {
        back = false
        break
      }
    }

    if (back) {
      return { period: t, phaseOrder: fraction(order, BigInt(t) * BigInt(n) * BigInt(n)) }
    }
  }

  return { period: -1, phaseOrder: null }
}

// The uniform mode's period: x(t+1) = c x(t) - x(t-1) mod 3 from (x(-1), x(0)) = (0, 1), with c = degree + sigma.
export function uniformModePeriod(c: number): number {
  let a = 0
  let b = 1

  for (let t = 1; t <= 9; t++) {
    const next = (((c * b - a) % 3) + 3) % 3

    a = b
    b = next

    if (a === 0 && b === 1) {
      return t
    }
  }

  throw new Error('z3-resonance: the uniform recurrence did not return within 9 steps')
}

// ---- the front of the one-source wave ----

// The exact number of geodesics from the origin to every cell, by dynamic programming over BFS distances.
export function geodesicCounts(input: {
  neighbors: Neighbors
  distance: Int32Array
  origin: number
}): bigint[] {
  const { neighbors, distance, origin } = input
  const n = neighbors.length
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => distance[a]! - distance[b]! || a - b)
  const count: bigint[] = new Array<bigint>(n).fill(0n)

  count[origin] = 1n

  for (const u of order) {
    if (u === origin || distance[u]! < 0) {
      continue
    }

    let c = 0n

    for (const w of neighbors[u] ?? []) {
      if (distance[w] === distance[u]! - 1) {
        c += count[w]!
      }
    }

    count[u] = c
  }

  return count
}

// L_base(t): the number of a in 0..t with C(t, a) not divisible by the prime `base` (Lucas): the product of
// (digit + 1) over the base-`base` digits of t
export function lucasNonzeroCount(t: number, base: number): number {
  let product = 1
  let x = t

  while (x > 0) {
    product *= (x % base) + 1
    x = Math.floor(x / base)
  }

  return product
}
