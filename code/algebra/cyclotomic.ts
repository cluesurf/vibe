// Exact arithmetic in the cyclotomic integers Z[zeta_m], and the two questions the experiments ask of it: the
// characteristic polynomial of a matrix over Q(zeta_m), and whether every eigenvalue of a unitary is a root of
// unity (Kronecker's theorem, by stripping cyclotomic factors off an integer polynomial).
//
// An element is its integer coordinates on 1, zeta, ..., zeta^(d - 1), d = phi(m), reduced modulo the m-th
// cyclotomic polynomial. A matrix over Q(zeta_m) is integer entries over one common bigint denominator. The
// characteristic polynomial is Faddeev and LeVerrier's: c_(n - k) = -tr(A M_k) / k, each division exact because
// the coefficients of an integer matrix's characteristic polynomial are integers of the ring.
//
// Built for E-CMP-0020 (Z[omega], m = 3) and E-QTM-0164 (Z[zeta_12], which holds omega, i and sqrt 3). BigInt
// throughout, nothing rounded; floats appear only in toComplex, for reports.

export type Poly = bigint[] // integer coefficients, lowest degree first

export function trimPoly(p: readonly bigint[]): Poly {
  const out = [...p]

  while (out.length > 1 && out[out.length - 1] === 0n) {
    out.pop()
  }

  return out
}

export function polyMul(p: readonly bigint[], q: readonly bigint[]): Poly {
  const out = new Array<bigint>(p.length + q.length - 1).fill(0n)

  p.forEach((a, i) => {
    q.forEach((b, j) => {
      out[i + j] = out[i + j]! + a * b
    })
  })

  return trimPoly(out)
}

// p / q for a MONIC q over Z: the quotient and remainder, both integer
export function polyDivMonic(
  p: readonly bigint[],
  q: readonly bigint[],
): { quotient: Poly; remainder: Poly } {
  const dq = q.length - 1

  if (q[dq] !== 1n) {
    throw new Error('polyDivMonic needs a monic divisor')
  }

  const r = [...p]
  const quotient = new Array<bigint>(Math.max(1, p.length - dq)).fill(0n)

  for (let k = p.length - 1; k >= dq; k--) {
    const c = r[k]!

    if (c !== 0n) {
      quotient[k - dq] = c
      q.forEach((b, j) => {
        r[k - dq + j] = r[k - dq + j]! - c * b
      })
    }
  }

  return {
    quotient: trimPoly(quotient),
    remainder: trimPoly(r.slice(0, Math.max(1, dq))),
  }
}

export function eulerPhi(n: number): number {
  let out = n
  let k = n

  for (let p = 2; p * p <= k; p++) {
    if (k % p === 0) {
      while (k % p === 0) {
        k /= p
      }

      out -= out / p
    }
  }

  if (k > 1) {
    out -= out / k
  }

  return out
}

const cyclotomicCache = new Map<number, Poly>()

// the n-th cyclotomic polynomial: x^n - 1 divided by every Phi_d with d a proper divisor of n
export function cyclotomicPolynomial(n: number): Poly {
  const cached = cyclotomicCache.get(n)

  if (cached) {
    return cached
  }

  let p: Poly = [-1n, ...new Array<bigint>(n - 1).fill(0n), 1n]

  for (let d = 1; d < n; d++) {
    if (n % d === 0) {
      p = polyDivMonic(p, cyclotomicPolynomial(d)).quotient
    }
  }

  cyclotomicCache.set(n, p)

  return p
}

// ---------------------------------------------------------------------------------------------------------
// the ring Z[zeta_m]

export type Cyc = bigint[]

export type CyclotomicRing = {
  readonly m: number
  readonly degree: number
  readonly zero: () => Cyc
  readonly one: () => Cyc
  readonly root: (k: number) => Cyc
  readonly add: (a: Cyc, b: Cyc) => Cyc
  readonly sub: (a: Cyc, b: Cyc) => Cyc
  readonly mul: (a: Cyc, b: Cyc) => Cyc
  readonly scale: (a: Cyc, s: bigint) => Cyc
  readonly divExact: (a: Cyc, s: bigint) => Cyc
  readonly conj: (a: Cyc) => Cyc
  readonly isZero: (a: Cyc) => boolean
  readonly equal: (a: Cyc, b: Cyc) => boolean
  readonly toComplex: (a: Cyc) => [number, number]
}

export function cyclotomicRing(m: number): CyclotomicRing {
  const phi = cyclotomicPolynomial(m)
  const degree = phi.length - 1

  // zeta^j reduced, for j up to 2 m
  const powers: Cyc[] = []

  let current: bigint[] = [1n, ...new Array<bigint>(degree - 1).fill(0n)]

  for (let j = 0; j <= 2 * m; j++) {
    powers.push([...current])

    // times zeta, then reduce the top coefficient with zeta^d = -sum phi_k zeta^k
    const top = current[degree - 1]!
    const shifted = [0n, ...current.slice(0, degree - 1)]

    current = shifted.map((x, k) => x - top * phi[k]!)
  }

  const zero = (): Cyc => new Array<bigint>(degree).fill(0n)
  const add = (a: Cyc, b: Cyc): Cyc => a.map((x, k) => x + b[k]!)
  const sub = (a: Cyc, b: Cyc): Cyc => a.map((x, k) => x - b[k]!)
  const scale = (a: Cyc, s: bigint): Cyc => a.map(x => x * s)

  const mul = (a: Cyc, b: Cyc): Cyc => {
    const wide = new Array<bigint>(2 * degree - 1).fill(0n)

    for (let i = 0; i < degree; i++) {
      const x = a[i]!

      if (x === 0n) {
        continue
      }

      for (let j = 0; j < degree; j++) {
        wide[i + j] = wide[i + j]! + x * b[j]!
      }
    }

    const out = wide.slice(0, degree)

    for (let k = degree; k < wide.length; k++) {
      const c = wide[k]!

      if (c !== 0n) {
        const p = powers[k]!

        for (let j = 0; j < degree; j++) {
          out[j] = out[j]! + c * p[j]!
        }
      }
    }

    return out
  }

  const conj = (a: Cyc): Cyc => {
    let out = zero()

    a.forEach((x, k) => {
      if (x !== 0n) {
        out = add(out, scale(powers[(m - k) % m]!, x))
      }
    })

    return out
  }

  const divExact = (a: Cyc, s: bigint): Cyc =>
    a.map(x => {
      if (x % s !== 0n) {
        throw new Error(`inexact division by ${s}`)
      }

      return x / s
    })

  const toComplex = (a: Cyc): [number, number] => {
    let re = 0
    let im = 0

    a.forEach((x, k) => {
      const angle = (2 * Math.PI * k) / m

      re += Number(x) * Math.cos(angle)
      im += Number(x) * Math.sin(angle)
    })

    return [re, im]
  }

  return {
    m,
    degree,
    zero,
    one: () => powers[0]!.slice(),
    root: (k: number) => powers[((k % m) + m) % m]!.slice(),
    add,
    sub,
    mul,
    scale,
    divExact,
    conj,
    isZero: (a: Cyc) => a.every(x => x === 0n),
    equal: (a: Cyc, b: Cyc) => a.every((x, k) => x === b[k]),
    toComplex,
  }
}

// ---------------------------------------------------------------------------------------------------------
// matrices over Q(zeta_m): integer entries over one denominator

export type CycMatrix = {
  readonly n: number
  readonly entries: Cyc[] // row major
  readonly den: bigint
}

export function cycIdentity(ring: CyclotomicRing, n: number): CycMatrix {
  return {
    n,
    entries: Array.from({ length: n * n }, (_, i) =>
      Math.floor(i / n) === i % n ? ring.one() : ring.zero(),
    ),
    den: 1n,
  }
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

// divide out any common factor of every coordinate and the denominator
export function cycReduce(m: CycMatrix): CycMatrix {
  let g = m.den

  for (const e of m.entries) {
    for (const x of e) {
      g = gcd(g, x)

      if (g === 1n) {
        return m
      }
    }
  }

  if (g <= 1n) {
    return m
  }

  return {
    n: m.n,
    entries: m.entries.map(e => e.map(x => x / g)),
    den: m.den / g,
  }
}

export function cycMul(
  ring: CyclotomicRing,
  a: CycMatrix,
  b: CycMatrix,
): CycMatrix {
  const n = a.n
  const entries: Cyc[] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = ring.zero()

      for (let k = 0; k < n; k++) {
        const x = a.entries[i * n + k]!

        if (ring.isZero(x)) {
          continue
        }

        s = ring.add(s, ring.mul(x, b.entries[k * n + j]!))
      }

      entries.push(s)
    }
  }

  return cycReduce({ n, entries, den: a.den * b.den })
}

export function cycAdd(
  ring: CyclotomicRing,
  a: CycMatrix,
  b: CycMatrix,
  sign = 1n,
): CycMatrix {
  return cycReduce({
    n: a.n,
    entries: a.entries.map((x, i) =>
      ring.add(
        ring.scale(x, b.den),
        ring.scale(b.entries[i]!, sign * a.den),
      ),
    ),
    den: a.den * b.den,
  })
}

export function cycScale(m: CycMatrix, num: bigint, den = 1n): CycMatrix {
  return cycReduce({
    n: m.n,
    entries: m.entries.map(e => e.map(x => x * num)),
    den: m.den * den,
  })
}

export function cycTimesElement(
  ring: CyclotomicRing,
  m: CycMatrix,
  c: Cyc,
): CycMatrix {
  return { n: m.n, entries: m.entries.map(e => ring.mul(e, c)), den: m.den }
}

export function cycAdjoint(ring: CyclotomicRing, m: CycMatrix): CycMatrix {
  const n = m.n

  return {
    n,
    entries: Array.from({ length: n * n }, (_, i) =>
      ring.conj(m.entries[(i % n) * n + Math.floor(i / n)]!),
    ),
    den: m.den,
  }
}

export function cycEqual(
  ring: CyclotomicRing,
  a: CycMatrix,
  b: CycMatrix,
): boolean {
  return a.entries.every((x, i) =>
    ring.equal(ring.scale(x, b.den), ring.scale(b.entries[i]!, a.den)),
  )
}

// the characteristic polynomial det(x - N) of the integer matrix N (the numerators, the denominator ignored),
// coefficients in Z[zeta_m], lowest degree first, monic
export function cycCharPoly(ring: CyclotomicRing, m: CycMatrix): Cyc[] {
  const n = m.n
  const a: CycMatrix = { n, entries: m.entries, den: 1n }
  const coeffs: Cyc[] = new Array<Cyc>(n + 1)

  coeffs[n] = ring.one()

  // M_1 = I, c_(n - 1) = -tr(A); M_k = A M_(k - 1) + c_(n - k + 1) I, c_(n - k) = -tr(A M_k) / k
  let mk = cycIdentity(ring, n)

  for (let k = 1; k <= n; k++) {
    const am: Cyc[] = []

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = ring.zero()

        for (let l = 0; l < n; l++) {
          const x = a.entries[i * n + l]!

          if (!ring.isZero(x)) {
            s = ring.add(s, ring.mul(x, mk.entries[l * n + j]!))
          }
        }

        am.push(s)
      }
    }

    let trace = ring.zero()

    for (let i = 0; i < n; i++) {
      trace = ring.add(trace, am[i * n + i]!)
    }

    const c = ring.divExact(ring.scale(trace, -1n), BigInt(k))

    coeffs[n - k] = c
    mk = {
      n,
      entries: am.map((x, idx) =>
        Math.floor(idx / n) === idx % n ? ring.add(x, c) : x,
      ),
      den: 1n,
    }
  }

  return coeffs
}

// For a UNITARY matrix U = N / den over Q(zeta_m): are all its eigenvalues roots of unity, so that U has finite
// order? The polynomial P(x) = prod over the Galois conjugates sigma of sigma(det(x - N)) is in Z[x], and its
// roots are the eigenvalues of N and of every conjugate matrix sigma(N), each a den times a unitary. So the roots
// of R(x) = P(den x) / den^(deg) are unit-modulus numbers, and they are all roots of unity exactly when R is a
// product of cyclotomic polynomials (Kronecker 1857; a non-integral R has a root that is no algebraic integer,
// so no root of unity). Returned: the cyclotomic indices stripped and the rest (an integer multiple of R's part
// with no cyclotomic factor; degree 0 means every eigenvalue is a root of unity).
export function rootsOfUnityTest(
  ring: CyclotomicRing,
  u: CycMatrix,
): {
  finite: boolean
  stripped: number[]
  rest: Poly
  normPoly: Poly
} {
  const p = cycCharPoly(ring, u)
  const units: number[] = []

  for (let k = 1; k < ring.m; k++) {
    if (gcdNumber(k, ring.m) === 1) {
      units.push(k)
    }
  }

  // sigma_k: zeta -> zeta^k, applied to each coefficient; multiply the conjugate polynomials over the ring
  const apply = (c: Cyc, k: number): Cyc => {
    let out = ring.zero()

    c.forEach((x, j) => {
      if (x !== 0n) {
        out = ring.add(out, ring.scale(ring.root(j * k), x))
      }
    })

    return out
  }

  let product: Cyc[] = [ring.one()]

  for (const k of units) {
    const conj = p.map(c => apply(c, k))
    const next: Cyc[] = new Array<Cyc>(product.length + conj.length - 1)
      .fill([])
      .map(() => ring.zero())

    product.forEach((x, i) => {
      conj.forEach((y, j) => {
        next[i + j] = ring.add(next[i + j]!, ring.mul(x, y))
      })
    })

    product = next
  }

  const normPoly: Poly = product.map(c => {
    if (c.slice(1).some(x => x !== 0n)) {
      throw new Error('the norm polynomial is not rational')
    }

    return c[0]!
  })

  // R(x) * den^deg = sum P_k den^k x^k, an integer polynomial whose leading coefficient is den^deg
  const deg = normPoly.length - 1

  let scaled: Poly = normPoly.map((c, k) => c * u.den ** BigInt(k))

  const stripped: number[] = []

  for (let n = 1; n <= 64 * deg + 2; n++) {
    if (eulerPhi(n) > deg) {
      continue
    }

    const phi = cyclotomicPolynomial(n)

    for (;;) {
      if (scaled.length - 1 < phi.length - 1) {
        break
      }

      const { quotient, remainder } = polyDivMonic(scaled, phi)

      if (remainder.some(x => x !== 0n)) {
        break
      }

      stripped.push(n)
      scaled = quotient
    }
  }

  return {
    finite: scaled.length === 1,
    stripped,
    rest: scaled,
    normPoly,
  }
}

function gcdNumber(a: number, b: number): number {
  return b === 0 ? a : gcdNumber(b, a % b)
}

// Kronecker product of two matrices over the same ring
export function cycKron(
  ring: CyclotomicRing,
  a: CycMatrix,
  b: CycMatrix,
): CycMatrix {
  const n = a.n * b.n
  const entries: Cyc[] = new Array<Cyc>(n * n)

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      for (let k = 0; k < b.n; k++) {
        for (let l = 0; l < b.n; l++) {
          entries[(i * b.n + k) * n + (j * b.n + l)] = ring.mul(
            a.entries[i * a.n + j]!,
            b.entries[k * b.n + l]!,
          )
        }
      }
    }
  }

  return cycReduce({ n, entries, den: a.den * b.den })
}
