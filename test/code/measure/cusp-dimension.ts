// Conformance for code/measure/cusp-dimension: the curvature-aware dimension readout. The whole point
// of the measure is the contrast between the BULK (exponentially growing, the curvature signature,
// growth ratio well above 1) and the CUSP horosphere (a flat polynomial slice, growth ratio near 1).
// That contrast is the robust, derivable fact and is what is asserted here. The absolute cusp/bulk
// DIMENSION values are tuning-sensitive at affordable build sizes (they belong to the experiment with
// its tuned maxCells / bandHalfWidth), so they are not pinned to exact numbers.

import { suite, check, ok } from '@/test/code/harness'
import { cuspDimension } from '@/code/measure/cusp-dimension'

suite('measure/cusp-dimension: bulk vs cusp growth', [
  check('the bulk grows exponentially while the cusp is flat', () => {
    const r = cuspDimension({
      symbol: [4, 3, 5],
      maxCells: 4000,
      bandHalfWidth: 0.08,
    })
    ok(r.cuspCells > 0, 'a non-empty cusp slice should be extracted')
    ok(Number.isFinite(r.cuspDim), 'cusp dimension should be finite')
    // the bulk's exponential reach: a ball-growth ratio well above 1
    ok(r.bulkRatio > 1.8, `bulk should grow exponentially, ratio ${r.bulkRatio}`)
    // the cusp horosphere is a flat slice: its ratio is near 1
    ok(
      r.cuspRatio > 0.6 && r.cuspRatio < 1.5,
      `cusp should be flat (ratio near 1), got ${r.cuspRatio}`,
    )
    // and the cusp is much flatter than the bulk
    ok(
      r.cuspRatio < r.bulkRatio,
      `cusp ratio ${r.cuspRatio} should be below bulk ratio ${r.bulkRatio}`,
    )
  }),
])
