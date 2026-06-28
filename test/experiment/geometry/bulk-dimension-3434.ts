// The {3,4,3,4} bulk is four dimensional, read the curvature-aware way.
//
// A flat-calibrated estimator cannot see this. The lazy-walk spectral dimension and the
// shell-slope estimator both assume a Euclidean regime, and a strongly curved honeycomb
// has none: its balls grow exponentially at every scale, so the curvature inflates the
// reading and the flat calibration grids themselves misread at the small scales the
// finite bulk allows. The dimension lives cleanly on the FLAT cusp instead. The ideal
// boundary of the bulk is a horosphere, a flat Euclidean slice whose own ball growth IS
// polynomial, so its dimension reads directly, and the bulk is one higher because the
// cusp is a codimension-one slice of it.
//
// So we measure the cusp dimension (polynomial, clean) and report the bulk as cusp + 1,
// with the bulk's exponential growth ratio as the curvature signature distinguishing the
// two. The control is the {5,3,4} sibling: the SAME method reads its cusp one dimension
// lower (a flat 2D sheet), so the bulk reads 3D there, which is what makes the {3,4,3,4}
// reading of 4D mean something. Depth L2, the dimension of known tessellations measured
// by a sound, curvature-aware method with a dimension-down control.

import { cuspDimension } from '@/code/measure/cusp-dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function bulkDimension(): {
  cusp3434: number
  cuspRatio3434: number
  bulkRatio3434: number
  bulk3434: number
  cusp534: number
  cuspRatio534: number
  bulkRatio534: number
  bulk534: number
} {
  // {3,4,3,4}: the cusp is a flat 3D sheet, so the bulk is 4D. A bigger build is a more
  // accurate measurement (more cells in the slice), not a speed knob.
  const a = cuspDimension({
    symbol: [3, 4, 3, 4],
    maxCells: 120000,
    bandHalfWidth: 0.6,
  })

  // {5,3,4}: the dimension-down control, its cusp is a flat 2D sheet, so its bulk is 3D
  const b = cuspDimension({
    symbol: [5, 3, 4],
    maxCells: 14000,
    bandHalfWidth: 0.3,
  })

  return {
    cusp3434: a.cuspDim,
    cuspRatio3434: a.cuspRatio,
    bulkRatio3434: a.bulkRatio,
    bulk3434: a.bulkDim,
    cusp534: b.cuspDim,
    cuspRatio534: b.cuspRatio,
    bulkRatio534: b.bulkRatio,
    bulk534: b.bulkDim,
  }
}

export default experiment({
  id: 'geometry/bulk-dimension-3434',
  code: 'E-GMT-0002',
  title:
    'the {3,4,3,4} cusp is a flat 3D sheet inside an exponential bulk, so the bulk is 4D, and {5,3,4} reads one dimension lower',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = bulkDimension()

    // {3,4,3,4}: cusp is a flat 3D sheet (polynomial), bulk is exponential (curved)
    const cusp3434IsThreeD = Math.abs(r.cusp3434 - 3) < 0.6
    const cusp3434IsFlat = r.cuspRatio3434 < 3 // polynomial, not exponential
    const bulk3434IsCurved = r.bulkRatio3434 > 3 // exponential growth
    const bulk3434IsFourD = r.bulk3434 === 4

    // the {5,3,4} dimension-down control: cusp is a flat 2D sheet, bulk is 3D
    const cusp534IsTwoD = Math.abs(r.cusp534 - 2) < 0.6
    const bulk534IsThreeD = r.bulk534 === 3

    const ok =
      cusp3434IsThreeD &&
      cusp3434IsFlat &&
      bulk3434IsCurved &&
      bulk3434IsFourD &&
      cusp534IsTwoD &&
      bulk534IsThreeD

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} cusp (a horosphere, the flat ideal boundary) grows polynomially with effective dimension near three while the bulk grows exponentially, so the bulk is a four-dimensional hyperbolic space with a flat three-dimensional cusp. The same method on the {5,3,4} sibling reads a flat two-dimensional cusp, so its bulk is three-dimensional, the dimension-down control that fixes the meaning of the four',
      metrics: {
        cuspDimension3434: Number(r.cusp3434.toFixed(2)),
        bulkDimension3434: r.bulk3434,
        cuspDimension534: Number(r.cusp534.toFixed(2)),
        bulkDimension534: r.bulk534,
        bulkExponentialRatio3434: Number(r.bulkRatio3434.toFixed(2)),
        cuspPolynomialRatio3434: Number(r.cuspRatio3434.toFixed(2)),
      },
      control: {
        cuspDimension534: Number(r.cusp534.toFixed(2)),
        bulkDimension534: r.bulk534,
      },
      notes:
        'L2. The curvature-aware dimension via code/measure/cusp-dimension: the cusp (Busemann horosphere) is the flat Euclidean slice whose polynomial growth reads its true dimension, and the bulk is cusp + 1. The lazy-walk spectral dimension fails here because a strongly curved honeycomb has no Euclidean regime (the curvature inflates the reading and the flat calibration grids misread at the small scales the finite bulk allows). The {5,3,4} cusp reading 2D (bulk 3D) is the dimension-down control.',
    })
  },
})
