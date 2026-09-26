// A pre-registered integer-relation search with its own null rate: the discipline that separates a closed form
// from a coincidence (E-MTH-0010). The cautionary example is m_p / m_e = 1836.15 against 6 pi^5 = 1836.12.
//
// THE BUDGET, fixed before any target is searched:
//   a T(x) = b + c B,  T in {x, x^2},  B one of RELATION_BASIS or absent (c = 0),
//   1 <= a <= RELATION_A_MAX, |c| <= RELATION_C_MAX, b any integer (fixed by rounding).
//   A hit is |a T(x) - b - c B| <= a delta_T, delta_T = delta for x and 2 |x| delta for x^2, delta the
//   value's own stated uncertainty.
// THE NULL: numbers spread uniformly within 10 percent of the target by the golden Weyl sequence frac(n phi)
// (deterministic, no seed), with the same delta and budget. The null rate is the share with at least one hit. A
// numeric identification is admissible only when the null rate is small; otherwise only a proof can carry it.

export const RELATION_BASIS: readonly (readonly [string, number])[] = [
  ['pi', Math.PI],
  ['sqrt 2', Math.SQRT2],
  ['sqrt 3', Math.sqrt(3)],
  ['sqrt 5', Math.sqrt(5)],
  ['sqrt 7', Math.sqrt(7)],
  ['log 2', Math.LN2],
  ['log 3', Math.log(3)],
]
export const RELATION_A_MAX = 12
export const RELATION_C_MAX = 12
export const NULL_WINDOW = 0.1

export type RelationHit = { readonly form: string; readonly complexity: number; readonly error: number }

export function relationHits(x: number, delta: number): RelationHit[] {
  const hits: RelationHit[] = []

  for (const [name, t, dt] of [
    ['x', x, delta],
    ['x^2', x * x, 2 * Math.abs(x) * delta],
  ] as const) {
    for (let a = 1; a <= RELATION_A_MAX; a++) {
      const plain = a * t
      const b0 = Math.round(plain)

      if (Math.abs(plain - b0) <= a * dt) {
        hits.push({ form: `${a} ${name} = ${b0}`, complexity: a, error: (plain - b0) / a })
      }

      for (const [basis, value] of RELATION_BASIS) {
        for (let c = -RELATION_C_MAX; c <= RELATION_C_MAX; c++) {
          if (c === 0) {
            continue
          }

          const r = a * t - c * value
          const b = Math.round(r)

          if (Math.abs(r - b) <= a * dt) {
            hits.push({ form: `${a} ${name} = ${b} + ${c} ${basis}`, complexity: a + Math.abs(c), error: (r - b) / a })
          }
        }
      }
    }
  }

  return hits.sort((p, q) => p.complexity - q.complexity)
}

// the golden Weyl sequence frac(n phi), n = 1, 2, ...: deterministic, seedless, low discrepancy
export const WEYL_GOLDEN = (Math.sqrt(5) - 1) / 2

export function weylPoint(n: number, alpha = WEYL_GOLDEN): number {
  return (n * alpha) % 1
}

// the share of `samples` numbers in x (1 +- NULL_WINDOW), placed by the golden Weyl sequence (no seed), with
// at least one hit at the same delta
export function nullMatchRate(x: number, delta: number, samples: number): number {
  let matched = 0

  for (let i = 1; i <= samples; i++) {
    const y = x * (1 - NULL_WINDOW + 2 * NULL_WINDOW * weylPoint(i))

    matched += relationHits(y, delta).length > 0 ? 1 : 0
  }

  return matched / samples
}

// the chance a uniform number in the same window lands within delta of one form named in advance
export function namedFormChance(x: number, delta: number): number {
  return (2 * delta) / (2 * NULL_WINDOW * Math.abs(x))
}
