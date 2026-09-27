// Polynomials on a jet space in four variables (t, x, y, z), exact over GF(p) or over the integers (p = 0), for
// deciding whether a local Lagrangian's variation is a total derivative without a tolerance. A jet variable is a field
// with a multi-index of derivative orders; a monomial is a sorted list of jet variables; a polynomial maps a monomial's
// key to its coefficient.
//
// THE CRITERION. A variation delta L that is linear in gauge fields xi is a total divergence iff every Euler derivative
// E_xi(delta L) = sum_beta (-D)^beta dL/d(xi_beta) vanishes identically: integrating by parts moves every derivative
// off xi, and int xi E = 0 for all xi iff E = 0 pointwise. For a gauge field that depends on t alone, the condition is
// weaker: E must be a SPATIAL divergence, which holds iff its spatial Euler derivatives vanish, each t-derivative
// order of each field counted as a field of its own (at fixed t the time jets are independent functions of x).
//
// Exact: coefficients are residues mod p (p < 2^25, so products stay exact in a double) or small integers (p = 0).
// DETERMINISM: nothing is drawn.

export type Poly = Map<string, number>

const STRIDE = [512, 64, 8, 1] as const
const FIELD = 4096

// a jet variable: field, then derivative orders in t, x, y, z (each below 8)
export const jet = (field: number, orders: readonly number[] = [0, 0, 0, 0]): number => field * FIELD + orders[0]! * 512 + orders[1]! * 64 + orders[2]! * 8 + orders[3]!
export const jetField = (id: number): number => Math.floor(id / FIELD)
export const jetOrders = (id: number): [number, number, number, number] => [Math.floor(id / 512) % 8, Math.floor(id / 64) % 8, Math.floor(id / 8) % 8, id % 8]
export const jetDegree = (id: number): number => jetOrders(id).reduce((t, x) => t + x, 0)

export function raise(id: number, axis: number): number {
  if (jetOrders(id)[axis]! >= 7) throw new Error('jet-polynomial: derivative order above 7')

  return id + STRIDE[axis]!
}

export const monoKey = (m: readonly number[]): string => m.join(',')
export const parseMono = (key: string): number[] => (key === '' ? [] : key.split(',').map(Number))
const sortMono = (m: number[]): number[] => m.sort((a, b) => a - b)

export const norm = (x: number, p: number): number => (p === 0 ? x : ((x % p) + p) % p)

export function addTerm(poly: Poly, key: string, c: number, p: number): void {
  const v = norm((poly.get(key) ?? 0) + c, p)

  if (v === 0) poly.delete(key)
  else poly.set(key, v)
}

export function addScaled(target: Poly, source: Poly, factor: number, p: number): void {
  for (const [k, c] of source) addTerm(target, k, p === 0 ? c * factor : (c * factor) % p, p)
}

export function monomial(jets: readonly number[], c = 1): Poly {
  return new Map([[monoKey(sortMono([...jets])), c]])
}

export function multiply(a: Poly, b: Poly, p: number): Poly {
  const out: Poly = new Map()

  for (const [ka, ca] of a) {
    const ma = parseMono(ka)

    for (const [kb, cb] of b) addTerm(out, monoKey(sortMono([...ma, ...parseMono(kb)])), p === 0 ? ca * cb : (ca * cb) % p, p)
  }

  return out
}

// the total derivative D_axis of one monomial, as the monomials of the product rule (with repetition)
export function deriveMono(m: readonly number[], axis: number): number[][] {
  return m.map((_, i) => sortMono(m.map((x, j) => (j === i ? raise(x, axis) : x))))
}

export function derive(poly: Poly, axis: number, p: number): Poly {
  const out: Poly = new Map()

  for (const [k, c] of poly) for (const m of deriveMono(parseMono(k), axis)) addTerm(out, monoKey(m), c, p)

  return out
}

// D^orders of a polynomial
export function deriveBy(poly: Poly, orders: readonly number[], p: number): Poly {
  let out = poly

  orders.forEach((n, axis) => {
    for (let i = 0; i < n; i++) out = derive(out, axis, p)
  })

  return out
}

// the image of a polynomial under the substitution jet -> image(jet) (a ring homomorphism)
export function substitute(poly: Poly, image: (id: number) => Poly, p: number): Poly {
  const out: Poly = new Map()

  for (const [k, c] of poly) {
    let term: Poly = new Map([['', c]])

    for (const id of parseMono(k)) term = multiply(term, image(id), p)
    addScaled(out, term, 1, p)
  }

  return out
}

// how many factors of a monomial satisfy `is`
export const countFactors = (m: readonly number[], is: (field: number) => boolean): number => m.reduce((t, id) => t + (is(jetField(id)) ? 1 : 0), 0)

// ---------------------------------------------------------------------------------------------------------
// the Euler derivatives

// E_f(P) for every field f with `isGauge(f)`, where each term of P holds exactly one gauge factor. A gauge field in
// `timeOnly` depends on t alone: only its t-derivatives are moved, and its E is returned for the spatial test.
export function gaugeEuler(poly: Poly, isGauge: (field: number) => boolean, p: number): Map<number, Poly> {
  const out = new Map<number, Poly>()

  for (const [k, c] of poly) {
    const m = parseMono(k)
    const at = m.findIndex(id => isGauge(jetField(id)))

    if (at < 0 || countFactors(m, isGauge) !== 1) throw new Error('jet-polynomial: a term is not linear in the gauge fields')

    const g = m[at]!
    const orders = jetOrders(g)
    const rest = m.filter((_, i) => i !== at)
    const sign = orders.reduce((t, x) => t + x, 0) % 2 === 0 ? 1 : -1
    const f = jetField(g)

    if (!out.has(f)) out.set(f, new Map())
    addScaled(out.get(f)!, deriveBy(new Map([[monoKey(rest), c]]), orders, p), sign, p)
  }

  return out
}

// the spatial Euler derivatives of Q: for each field u and t-order m, sum over spatial alpha of (-D_space)^alpha
// dQ/du_(m, alpha); keyed `${u}:${m}|${monomial}`. Q is a spatial divergence iff the result is empty.
export function spatialEuler(poly: Poly, p: number): Poly {
  const out: Poly = new Map()

  for (const [k, c] of poly) {
    const m = parseMono(k)

    m.forEach((id, i) => {
      const [tOrder, ...space] = jetOrders(id)
      const rest = m.filter((_, j) => j !== i)
      const sign = space.reduce((t, x) => t + x, 0) % 2 === 0 ? 1 : -1

      for (const [rk, rc] of deriveBy(new Map([[monoKey(rest), c]]), [0, ...space], p)) addTerm(out, `${jetField(id)}:${tOrder}|${rk}`, sign * rc, p)
    })
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// a null space from sparse rows, streamed

// the right null space {x : row . x = 0 for every row} mod p, from rows given sparsely (column -> value). The basis is
// kept fully reduced, so a new row is reduced once per pivot it touches and only ever gains entries in free columns.
export function nullSpaceOfRows(rows: Iterable<ReadonlyMap<number, number>>, width: number, p: number): { basis: number[][]; rank: number } {
  const pivotRow = new Map<number, Float64Array>()
  const inverse = (a: number): number => {
    let r = 1
    let b = a % p
    let e = p - 2

    while (e > 0) {
      if (e % 2 === 1) r = (r * b) % p
      b = (b * b) % p
      e = Math.floor(e / 2)
    }

    return r
  }

  for (const sparse of rows) {
    const row = new Float64Array(width)

    for (const [c, v] of sparse) row[c] = norm(v, p)
    for (const [c, v] of sparse) {
      if (v === 0) continue

      const base = pivotRow.get(c)
      const f = row[c]!

      if (base && f !== 0) for (let j = 0; j < width; j++) if (base[j] !== 0) row[j] = norm(row[j]! - ((f * base[j]!) % p), p)
    }

    let lead = -1

    for (let j = 0; j < width; j++) {
      if (row[j] !== 0 && !pivotRow.has(j)) {
        lead = j
        break
      }
    }
    if (lead < 0) continue

    const s = inverse(row[lead]!)

    for (let j = 0; j < width; j++) if (row[j] !== 0) row[j] = (row[j]! * s) % p
    for (const other of pivotRow.values()) {
      const f = other[lead]!

      if (f !== 0) for (let j = 0; j < width; j++) if (row[j] !== 0) other[j] = norm(other[j]! - ((f * row[j]!) % p), p)
    }
    pivotRow.set(lead, row)
  }

  const basis: number[][] = []

  for (let free = 0; free < width; free++) {
    if (pivotRow.has(free)) continue

    const v = new Array<number>(width).fill(0)

    v[free] = 1
    for (const [c, r] of pivotRow) v[c] = norm(-r[free]!, p)
    basis.push(v)
  }

  return { basis, rank: pivotRow.size }
}
