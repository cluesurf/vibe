// The one substrate splits into two navigation regimes, and the split is the mind-physics division.
// The hyperbolic BULK grows exponentially, so a region of N cells has diameter of order log N:
// everything is a few hops from everything, the regime of associative recall where any memory is
// reachable from any other in logarithmic time. The flat CUSP, a three-dimensional slice, grows
// polynomially, so a region of N cells has diameter of order N to the one third: genuine locality,
// the regime of physics where signals crawl at a bounded speed and distance is real. Both live on
// the same substrate, and the contrast in how their diameters scale is the difference between a
// mind that accesses globally and a physics that acts locally, made a measured law.
//
// Measured across a sweep of region sizes spanning four orders of magnitude: the cusp diameter
// exponent (the slope of log diameter against log size) sits at one third to within a few percent
// (polynomial locality, the physical three-dimensional layer), while the bulk diameter exponent is
// small and DECREASES monotonically toward zero as the region grows (0.20 down to 0.07 over the
// sweep), the signature of logarithmic, sub-polynomial growth. The ratio of cusp diameter to bulk
// diameter grows without bound (the physical region gets vastly wider than the bulk region of the
// same cell count), so locality and global access diverge with scale.
//
// The control is the two exponents standing against each other: were the physical layer itself
// hyperbolic it would have exponent zero, no locality and no physics, so the polynomial cusp
// exponent is exactly what a world of local dynamics requires and the logarithmic bulk exponent is
// exactly what global recall requires. The two regimes are each other's control.
//
// Depth L2. It establishes the two-regime split of the substrate by diameter scaling (cusp
// exponent one third, bulk exponent decaying to zero, ratio diverging), the mind-physics division
// as a measured navigation law. Known growth-rate geometry, read as the two-regime map.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  bulkDiameter,
  cuspDiameter,
  diameterExponent,
} from '@/code/measure/region-diameter'

const BRANCHING = 3
const DIMENSION = 3
const SMALL = 8000
const LARGE = 4096000
const DECADES: [number, number][] = [
  [1e3, 1e4],
  [1e4, 1e5],
  [1e5, 1e6],
  [1e6, 1e7],
]

export default experiment({
  id: 'addressing/bulk-cusp-navigation-split',
  code: 'E-NVG-0009',
  title:
    'the bulk region diameter grows logarithmically (exponent decaying to zero, global access) while the cusp region diameter grows as N^(1/3) (locality), the one substrate splitting into mind-fast and physics-local navigation regimes',
  category: 'addressing',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // the cusp exponent sits at one third: polynomial locality
    const cuspExponent = diameterExponent({
      diameterSmall: cuspDiameter({
        dimension: DIMENSION,
        cellCount: SMALL,
      }),
      diameterLarge: cuspDiameter({
        dimension: DIMENSION,
        cellCount: LARGE,
      }),
      countSmall: SMALL,
      countLarge: LARGE,
    })

    const cuspIsLocal = Math.abs(cuspExponent - 1 / DIMENSION) < 0.03

    // the bulk exponent decreases monotonically toward zero: logarithmic global access
    const bulkExponents = DECADES.map(([lo, hi]) =>
      diameterExponent({
        diameterSmall: bulkDiameter({
          branching: BRANCHING,
          cellCount: lo,
        }),
        diameterLarge: bulkDiameter({
          branching: BRANCHING,
          cellCount: hi,
        }),
        countSmall: lo,
        countLarge: hi,
      }),
    )

    let bulkDecays = true

    for (let i = 1; i < bulkExponents.length; i++) {
      if (bulkExponents[i]! >= bulkExponents[i - 1]!) {
        bulkDecays = false
      }
    }

    const bulkIsSubPolynomial =
      bulkExponents[bulkExponents.length - 1]! < 0.1

    // the cusp-to-bulk diameter ratio grows: locality and global access diverge with scale
    const ratioSmall =
      cuspDiameter({ dimension: DIMENSION, cellCount: SMALL }) /
      bulkDiameter({ branching: BRANCHING, cellCount: SMALL })

    const ratioLarge =
      cuspDiameter({ dimension: DIMENSION, cellCount: LARGE }) /
      bulkDiameter({ branching: BRANCHING, cellCount: LARGE })

    const ratioGrows = ratioLarge > ratioSmall * 2

    const ok =
      cuspIsLocal && bulkDecays && bulkIsSubPolynomial && ratioGrows

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the flat cusp region diameter grows as the cube root of the cell count (exponent one third to within a few percent, polynomial locality, the physical three-dimensional layer where distance is real and signals crawl) while the hyperbolic bulk region diameter grows logarithmically (its exponent decaying monotonically from about a fifth down below a tenth across four orders of magnitude, the sub-polynomial signature of global access where any cell is a few hops from any other), and the cusp-to-bulk diameter ratio more than doubles across the sweep so locality and global access diverge without bound with scale, the one substrate splitting into a physics-local regime and a mind-fast regime, the two exponents each other controls since a hyperbolic physical layer would have exponent zero and no locality at all',
      metrics: {
        cuspExponent: Number(cuspExponent.toFixed(4)),
        bulkExponentFirst: Number(bulkExponents[0]!.toFixed(4)),
        bulkExponentLast: Number(
          bulkExponents[bulkExponents.length - 1]!.toFixed(4),
        ),
        ratioSmall: Number(ratioSmall.toFixed(2)),
        ratioLarge: Number(ratioLarge.toFixed(2)),
      },
      // CONTROL: the bulk exponent (global access) stands against the cusp exponent (locality).
      control: {
        bulkExponentLast: Number(
          bulkExponents[bulkExponents.length - 1]!.toFixed(4),
        ),
      },
      notes:
        'The mind-physics split as diameter scaling: log-diameter bulk (associative recall) versus N^(1/3) cusp (local physics). Ties navigation to the vibe mind-physics division. Complements the depth-is-scale routing law (E-NVG-0008) and the bulk shortcut (E-QTM-0035).',
    })
  },
})
