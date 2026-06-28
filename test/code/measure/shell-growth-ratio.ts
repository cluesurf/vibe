// Conformance for code/measure/shell-growth-ratio: the arithmetic-mean of consecutive shell ratios
// over a window, rounded to two places. Checked on geometric series (mean ratio = the common ratio),
// a sub-window, the rounding behavior, and the safeDenominator branch for a single-ratio window.

import { suite, check, equal } from '@/test/code/harness'
import { shellGrowthRatio } from '@/code/measure/shell-growth-ratio'

suite('measure/shell-growth-ratio', [
  // Geometric series of ratio 2: every consecutive ratio is 2, so the mean is 2.00.
  check('a geometric series gives its common ratio', () => {
    equal(
      shellGrowthRatio({ shellCounts: [1, 2, 4, 8, 16], from: 0, to: 5 }),
      2,
    )
  }),
  // A sub-window [1,4) = [2,4,8]: ratios 2, 2, mean 2.
  check('a sub-window averages only its own ratios', () => {
    equal(shellGrowthRatio({ shellCounts: [1, 2, 4, 8, 16], from: 1, to: 4 }), 2)
  }),
  // [3,4,5]: ratios 4/3 and 5/4, mean (1.3333 + 1.25)/2 = 1.29167 -> 1.29.
  check('the mean is rounded to two places', () => {
    equal(shellGrowthRatio({ shellCounts: [3, 4, 5], from: 0, to: 3 }), 1.29)
  }),
  // A window with a single entry and no safeDenominator returns 0.
  check('a single-entry window returns 0 without safeDenominator', () => {
    equal(shellGrowthRatio({ shellCounts: [5, 10, 20], from: 1, to: 2 }), 0)
  }),
  // safeDenominator clamps the divisor to >= 1; a single-entry window has no ratios, so the mean is 0.
  check('safeDenominator keeps a single-entry window defined at 0', () => {
    equal(
      shellGrowthRatio({
        shellCounts: [5, 10, 20],
        from: 1,
        to: 2,
        safeDenominator: true,
      }),
      0,
    )
  }),
  // `to` past the end is clamped to the series length.
  check('an over-long window is clamped to the series', () => {
    equal(shellGrowthRatio({ shellCounts: [1, 2, 4], from: 0, to: 99 }), 2)
  }),
])
