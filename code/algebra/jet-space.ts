// The derivative side of jet-polynomial, for any number of axes: a jet variable is a field with a multi-index of
// derivative orders on `axes` axes (each below 8), packed as field * 8^axes + orders in base 8. Everything that does not
// depend on the packing (monomials, products, substitution, the streamed null space) stays in jet-polynomial and is
// shared; this module adds what the four-axis packing there hard-codes: the jet itself, the total derivative, and the
// Euler derivatives. With axes = 4 it packs differently from jet-polynomial but computes the same things.
//
// THE CRITERIA (as in jet-polynomial). A variation linear in gauge fields xi is a total divergence iff every Euler
// derivative E_xi = sum_beta (-D)^beta d/d(xi_beta) vanishes. For a gauge field that depends on some axes only (a slide
// that keeps a foliation), E need only be a divergence along the OTHER axes, which holds iff its partial Euler
// derivatives along those axes vanish, each order along the kept axes counted as a field of its own.
//
// Exact: coefficients are residues mod p (p < 2^25) or integers (p = 0). DETERMINISM: nothing is drawn.

import { addScaled, addTerm, monoKey, parseMono, type Poly } from '@/code/algebra/jet-polynomial'

export type JetSpace = {
  readonly axes: number
  readonly jet: (field: number, orders?: readonly number[]) => number
  readonly field: (id: number) => number
  readonly orders: (id: number) => number[]
  readonly degree: (id: number) => number
  readonly raise: (id: number, axis: number) => number
  readonly derive: (poly: Poly, axis: number, p: number) => Poly
  readonly deriveBy: (poly: Poly, orders: readonly number[], p: number) => Poly
  // how many factors of a monomial satisfy `is` (read with this space's packing, never jet-polynomial's)
  readonly count: (m: readonly number[], is: (field: number) => boolean) => number
  // E_f(P) for every gauge field f, each term of P holding exactly one gauge factor
  readonly gaugeEuler: (poly: Poly, isGauge: (field: number) => boolean, p: number) => Map<number, Poly>
  // the partial Euler derivatives of Q along `moving` axes, keyed `${field}:${orders on the other axes}|${monomial}`:
  // empty iff Q is a divergence along those axes
  readonly partialEuler: (poly: Poly, moving: readonly number[], p: number) => Poly
  // the Euler-Lagrange derivatives of one monomial in every field, keyed `${field}|${monomial}`: empty for a total
  // derivative
  readonly equations: (mono: readonly number[], p: number) => Poly
}

export function jetSpace(axes: number): JetSpace {
  const stride = Array.from({ length: axes }, (_, a) => 8 ** (axes - 1 - a))
  const fieldStride = 8 ** axes
  const jet = (field: number, orders: readonly number[] = []): number => {
    let id = field * fieldStride

    for (let a = 0; a < axes; a++) {
      const n = orders[a] ?? 0

      if (n > 7) throw new Error('jet-space: derivative order above 7')
      id += n * stride[a]!
    }

    return id
  }
  const field = (id: number): number => Math.floor(id / fieldStride)
  const orders = (id: number): number[] => stride.map(s => Math.floor(id / s) % 8)
  const degree = (id: number): number => orders(id).reduce((t, x) => t + x, 0)
  const raise = (id: number, axis: number): number => {
    if (orders(id)[axis]! >= 7) throw new Error('jet-space: derivative order above 7')

    return id + stride[axis]!
  }
  const sorted = (m: number[]): number[] => m.sort((a, b) => a - b)
  const derive = (poly: Poly, axis: number, p: number): Poly => {
    const out: Poly = new Map()

    for (const [k, c] of poly) {
      const m = parseMono(k)

      for (let i = 0; i < m.length; i++) addTerm(out, monoKey(sorted(m.map((x, j) => (j === i ? raise(x, axis) : x)))), c, p)
    }

    return out
  }
  const deriveBy = (poly: Poly, by: readonly number[], p: number): Poly => {
    let out = poly

    by.forEach((n, axis) => {
      for (let i = 0; i < n; i++) out = derive(out, axis, p)
    })

    return out
  }
  const parity = (xs: readonly number[]): number => (xs.reduce((t, x) => t + x, 0) % 2 === 0 ? 1 : -1)

  const gaugeEuler = (poly: Poly, isGauge: (f: number) => boolean, p: number): Map<number, Poly> => {
    const out = new Map<number, Poly>()

    for (const [k, c] of poly) {
      const m = parseMono(k)
      const at = m.findIndex(id => isGauge(field(id)))

      if (at < 0 || m.filter(id => isGauge(field(id))).length !== 1) throw new Error('jet-space: a term is not linear in the gauge fields')

      const g = m[at]!
      const by = orders(g)
      const rest = m.filter((_, i) => i !== at)
      const f = field(g)

      if (!out.has(f)) out.set(f, new Map())
      addScaled(out.get(f)!, deriveBy(new Map([[monoKey(rest), c]]), by, p), parity(by), p)
    }

    return out
  }

  const partialEuler = (poly: Poly, moving: readonly number[], p: number): Poly => {
    const out: Poly = new Map()
    const kept = Array.from({ length: axes }, (_, a) => a).filter(a => !moving.includes(a))

    for (const [k, c] of poly) {
      const m = parseMono(k)

      m.forEach((id, i) => {
        const o = orders(id)
        const by = o.map((n, a) => (moving.includes(a) ? n : 0))
        const rest = m.filter((_, j) => j !== i)
        const tag = kept.map(a => o[a]).join('.')

        for (const [rk, rc] of deriveBy(new Map([[monoKey(rest), c]]), by, p)) addTerm(out, `${field(id)}:${tag}|${rk}`, parity(by) * rc, p)
      })
    }

    return out
  }

  const equations = (mono: readonly number[], p: number): Poly => {
    const out: Poly = new Map()

    mono.forEach((id, i) => {
      const rest = mono.filter((_, j) => j !== i)
      const by = orders(id)

      for (const [k, c] of deriveBy(new Map([[monoKey(rest), 1]]), by, p)) addTerm(out, `${field(id)}|${k}`, parity(by) * c, p)
    })

    return out
  }

  const count = (m: readonly number[], is: (f: number) => boolean): number => m.reduce((t, id) => t + (is(field(id)) ? 1 : 0), 0)

  return { axes, jet, field, orders, degree, raise, derive, deriveBy, count, gaugeEuler, partialEuler, equations }
}
