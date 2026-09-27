// The coincidence null for two EXACT constants, built on the E-MTH-0010 budget (code/measure/integer-relation).
//
// E-MTH-0010's null asks whether a MEASURED number lands on a budget form by chance: numbers uniform in a
// window, the share with a hit at the number's own uncertainty. Two constants that are both proven exact have
// no uncertainty, so that null says nothing about whether their equality is a common origin: any two proven
// simple constants that are equal are equal to every digit. The question is then discrete. The budget's forms
// of low complexity take only a few distinct values near any target, and two constants each reached by a short
// derivation are drawn from those few. So:
//
//   F_k(x0) = the distinct positive values of budget forms a T(x) = b + c B (T in {x, x^2}, B in the
//             E-MTH-0010 basis or absent, 1 <= a <= 12, |c| <= 12) with complexity a + |c| <= k, inside
//             x0 (1 +- NULL_WINDOW)
//   the coincidence rate is 1 / |F_k|, k the complexity of the shared value's simplest form: the chance a
//   second constant of that complexity, landing on one of those values uniformly, lands on the first one's
//
// A shared exact value is evidence of a common origin only when that rate is under 0.01, the E-MTH-0010
// threshold. Otherwise only a derivation that reaches both through one route can carry it.
//
// For a shared small integer (a 7 appearing in two constants), the matching count is the integers 1 to
// RELATION_A_MAX: the rate is 1 / RELATION_A_MAX.

import { NULL_WINDOW, RELATION_A_MAX, RELATION_BASIS, RELATION_C_MAX } from '@/code/measure/integer-relation'

export function budgetValuesInWindow(x0: number, maxComplexity: number): number[] {
  const low = x0 * (1 - NULL_WINDOW)
  const high = x0 * (1 + NULL_WINDOW)
  const seen = new Set<string>()
  const out: number[] = []
  const bases: [number, number][] = [[0, 0], ...RELATION_BASIS.map(([, v]) => [1, v] as [number, number])]

  const keep = (x: number): void => {
    if (x >= low && x <= high) {
      const key = x.toPrecision(12)

      if (!seen.has(key)) {
        seen.add(key)
        out.push(x)
      }
    }
  }

  for (let a = 1; a <= RELATION_A_MAX; a++) {
    for (const [present, value] of bases) {
      for (let c = -RELATION_C_MAX; c <= RELATION_C_MAX; c++) {
        if ((present === 0) !== (c === 0) || a + Math.abs(c) > maxComplexity) {
          continue
        }

        const shift = c * value

        // T = x: x = (b + c B) / a, T = x^2: x = sqrt((b + c B) / a), b over the integers that reach the window
        for (let b = Math.floor(a * low - shift) - 1; b <= Math.ceil(a * high - shift) + 1; b++) {
          keep((b + shift) / a)
        }

        for (let b = Math.floor(a * low * low - shift) - 1; b <= Math.ceil(a * high * high - shift) + 1; b++) {
          const square = (b + shift) / a

          if (square > 0) {
            keep(Math.sqrt(square))
          }
        }
      }
    }
  }

  return out.sort((p, q) => p - q)
}

// 1 / |F_k|, the chance two constants of complexity k share a value by accident
export function exactCoincidenceRate(x0: number, complexity: number): { values: number; rate: number } {
  const values = budgetValuesInWindow(x0, complexity).length

  return { values, rate: values > 0 ? 1 / values : 1 }
}

export function sharedIntegerRate(): number {
  return 1 / RELATION_A_MAX
}
