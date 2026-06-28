// Conformance for code/measure/cell-graph-spectral: the bulk degree and spectral dimension of a
// Coxeter cell graph. The interior facet count is forced by the cell shape: a cube honeycomb {4,3,5}
// has degree 6, a dodecahedral {5,3,4} degree 12, an icosahedral {3,5,3} degree 20 (one neighbour per
// face). That exact degree is checked; the spectral dimension is checked to be finite and positive
// (its value is inflated by curvature, so only a band is asserted).

import { suite, check, equal, ok } from '@/test/code/harness'
import { cellGraphSpectral } from '@/code/measure/cell-graph-spectral'

suite('measure/cell-graph-spectral: bulk degree', [
  // The interior degree is the number of faces of the cell.
  check('cube / dodecahedral / icosahedral honeycombs have degree 6 / 12 / 20', () => {
    equal(cellGraphSpectral({ symbol: [4, 3, 5], maxCells: 1500, t1: 2, t2: 6 }).degree, 6)
    equal(cellGraphSpectral({ symbol: [5, 3, 4], maxCells: 1500, t1: 2, t2: 6 }).degree, 12)
    equal(cellGraphSpectral({ symbol: [3, 5, 3], maxCells: 1500, t1: 2, t2: 6 }).degree, 20)
  }),
  // The cell count and spectral dimension are well-formed.
  check('the spectral dimension is finite and positive', () => {
    const r = cellGraphSpectral({ symbol: [4, 3, 5], maxCells: 1500, t1: 2, t2: 6 })
    ok(r.cells > 0, 'should build cells')
    ok(Number.isFinite(r.specDim) && r.specDim > 0, `specDim should be positive, got ${r.specDim}`)
    ok(r.specDim < 6, `specDim should be a sane dimension, got ${r.specDim}`)
  }),
])
