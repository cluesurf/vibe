// Conformance for code/measure/histogram. histogramFlatness is the normalized Shannon entropy of a
// fixed-width histogram, 1 for a uniform spread, 0 for a single occupied bin. We place samples to land
// in known bins and re-derive the entropy by hand.

import { suite, check, equal, close } from '@/test/code/harness'
import { histogramFlatness } from '@/code/measure/histogram'

const TOL = 1e-12

suite('measure/histogram: histogramFlatness', [
  check('a perfectly uniform two-bin histogram is flat (1)', () => {
    // range 1, 2 bins: -0.5 -> bin 0, 0.5 -> bin 1. p=(0.5,0.5) -> entropy ln2 -> /ln2 = 1.
    close(
      histogramFlatness({ samples: [-0.5, 0.5], range: 1, bins: 2 }),
      1,
      TOL,
    )
  }),
  check('all samples in one bin gives flatness 0', () => {
    close(histogramFlatness({ samples: [0, 0, 0], range: 1, bins: 4 }), 0, TOL)
  }),
  check('an empty sample set returns 0', () => {
    equal(histogramFlatness({ samples: [], range: 1, bins: 4 }), 0)
  }),
  check('all-out-of-range samples return 0', () => {
    equal(histogramFlatness({ samples: [5, -5], range: 1, bins: 4 }), 0)
  }),
])
