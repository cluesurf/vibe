// Conformance for code/substrate/coxeter/coxeter-growth: the Steinberg-formula growth function W(t) of a
// Coxeter GROUP (it counts group elements / chambers by word length, NOT the per-cell-layer counts of
// growth.ts, which are a coarser sequence). Two independent checks pin it down:
//   - For a FINITE group W(t) is the Poincare polynomial: it is palindromic and W(1) = |W|, the group order
//     (6 for I2(3), 8 for I2(4), 24 for A3, 48 for B3) - matching word.ts and matrix-group.ts.
//   - The expanded series obeys its own denominator recurrence exactly.
// All bigint, so EXACT.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  coxeterGrowthSeries,
  expandSeries,
  recurrenceFromDenominator,
} from '@/code/substrate/coxeter/coxeter-growth'

const sum = (xs: bigint[]): bigint => xs.reduce((a, b) => a + b, 0n)

suite('substrate/coxeter/coxeter-growth: finite Poincare polynomials', [
  check('a finite group growth sums to the group order', () => {
    for (const [symbol, order] of [
      [[3], 6n],
      [[4], 8n],
      [[3, 3], 24n],
      [[4, 3], 48n],
    ] as const) {
      const seq = expandSeries(coxeterGrowthSeries([...symbol]), 40)

      equal(seq[0], 1n, `[${String(symbol)}] identity coefficient`)
      ok(
        sum(seq) === order,
        `[${String(symbol)}] W(1) = |W| = ${order}`,
      )
    }
  }),
  check(
    'the finite growth polynomial is palindromic (Poincare duality)',
    () => {
      for (const symbol of [[3], [4], [3, 3], [4, 3]]) {
        const seq = expandSeries(coxeterGrowthSeries(symbol), 40)

        // strip the trailing zeros to get the polynomial coefficients.
        let top = seq.length - 1

        while (top > 0 && seq[top] === 0n) {
          top--
        }

        const poly = seq.slice(0, top + 1)

        for (let i = 0; i < poly.length; i++) {
          ok(
            poly[i] === poly[poly.length - 1 - i],
            `[${String(symbol)}] palindrome at ${i}`,
          )
        }
      }
    },
  ),
])

suite('substrate/coxeter/coxeter-growth: self-consistent expansion', [
  check(
    'expanding via the denominator recurrence reproduces the series',
    () => {
      for (const symbol of [
        [7, 3],
        [5, 4],
        [5, 3, 4],
      ]) {
        const series = coxeterGrowthSeries(symbol)
        const rec = recurrenceFromDenominator(series.den)
        // The homogeneous denominator recurrence only governs terms past the numerator
        // degree (earlier terms carry the numerator), so seed beyond both lengths.
        const seed = Math.max(rec.length, series.num.length)
        const seq = expandSeries(series, seed + 8)
        const rebuilt = seq.slice(0, seed)

        for (let n = seed; n < seq.length; n++) {
          let v = 0n

          for (let i = 0; i < rec.length; i++)
            v += rec[i]! * rebuilt[n - 1 - i]!

          rebuilt.push(v)
        }

        for (let i = seed; i < seq.length; i++) {
          ok(
            rebuilt[i] === seq[i],
            `[${String(symbol)}] recurrence reproduces term ${i}`,
          )
        }
      }
    },
  ),
  check(
    'an infinite (hyperbolic) group growth is monotone and unbounded',
    () => {
      const seq = expandSeries(coxeterGrowthSeries([7, 3]), 12)

      equal(seq[0], 1n, 'identity at length 0')

      for (let i = 1; i < seq.length; i++)
        ok(seq[i]! >= seq[i - 1]!, `non-decreasing at ${i}`)

      ok(seq[seq.length - 1]! > seq[0]!, 'grows without closing')
    },
  ),
])
