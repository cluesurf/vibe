// Conformance for code/measure/boundary-dimension: the intrinsic dimension of a 3D honeycomb's outer
// boundary shell. The boundary of a 3D cell graph is a 2D screen, so its spectral dimension should
// read near 2 (an S^2 holographic screen). The boundary is a strict, non-empty subset of all cells.
// The spectral fit is curvature-inflated, so only a band around 2 is asserted.

import { suite, check, ok } from '@/test/code/harness'
import { boundaryDimension } from '@/code/measure/boundary-dimension'

suite('measure/boundary-dimension: 3D honeycomb boundary', [
  check(
    'the boundary is a strict non-empty subset of the cells',
    () => {
      const r = boundaryDimension({ symbol: [4, 3, 5], maxCells: 1500 })

      ok(r.boundaryCells > 0, 'boundary should be non-empty')
      ok(
        r.boundaryCells < r.cells,
        `boundary ${r.boundaryCells} should be fewer than all ${r.cells}`,
      )
    },
  ),
  // A 3D bulk has a 2D boundary screen.
  check('the boundary dimension reads near 2 (an S^2 screen)', () => {
    const r = boundaryDimension({ symbol: [4, 3, 5], maxCells: 1500 })

    ok(
      Number.isFinite(r.boundaryDim),
      `boundaryDim should be finite, got ${r.boundaryDim}`,
    )

    ok(
      r.boundaryDim > 1.4 && r.boundaryDim < 3,
      `2D boundary should read near 2, got ${r.boundaryDim}`,
    )
  }),
])
