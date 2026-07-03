// Conformance for code/measure/persistence. lagAutocorrelation is the mean over the window of the
// lag-`lag` Pearson autocorrelation of a series of vectors. We re-derive it on series whose lagged
// pairs are perfectly correlated (+1) or perfectly anti-correlated (-1).

import { suite, check, equal, close } from '@/test/code/harness'
import { lagAutocorrelation } from '@/code/measure/persistence'

const TOL = 1e-12

suite('measure/persistence: lagAutocorrelation', [
  check('a constant-in-time series autocorrelates at +1', () => {
    // every lag-1 pair is the same vector -> pearson 1 -> mean 1.
    const series = [
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ]

    close(lagAutocorrelation({ series, lag: 1 }), 1, TOL)
  }),
  check('a reversed-pair series autocorrelates at -1', () => {
    const series = [
      [1, 2, 3],
      [3, 2, 1],
    ]

    close(lagAutocorrelation({ series, lag: 1 }), -1, TOL)
  }),
  check('a lag past the series length yields 0', () => {
    const series = [
      [1, 2, 3],
      [3, 2, 1],
    ]

    equal(lagAutocorrelation({ series, lag: 5 }), 0)
  }),
])
