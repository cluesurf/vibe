// Conformance for code/substrate/coxeter/tessellation: the pure classifier describeTessellation. It splits
// a symbol into cell (drop last) and vertex figure (drop first), classifies each, and labels compactness:
// both finite => compact, a Euclidean piece => paracompact, a spherical whole => a finite polytope. We
// re-derive these from the known geometry of each symbol. All discrete labels, so EXACT.

import { suite, check, equal, ok } from '@/test/code/harness'
import { describeTessellation } from '@/code/substrate/coxeter/tessellation'

suite('substrate/coxeter/tessellation: classification', [
  check('{5,3,4} is a compact hyperbolic honeycomb, orbit-buildable', () => {
    const d = describeTessellation([5, 3, 4])
    equal(d.spaceDimension, 3, 'tiles 3-space')
    equal(d.geometry, 'hyperbolic', 'hyperbolic whole')
    equal(d.cell.join(','), '5,3', 'cell')
    equal(d.cellGeometry, 'spherical', 'finite dodecahedral cell')
    equal(d.vertexFigure.join(','), '3,4', 'vertex figure')
    equal(d.vertexFigureGeometry, 'spherical', 'finite vertex figure')
    equal(d.compactness, 'compact', 'compact')
    ok(d.buildable, 'buildable')
    equal(d.builder, 'orbit', 'orbit engine')
  }),
  check('{3,4,3,4} is paracompact (Euclidean vertex figure) but still buildable', () => {
    const d = describeTessellation([3, 4, 3, 4])
    equal(d.geometry, 'hyperbolic', 'hyperbolic whole')
    equal(d.cellGeometry, 'spherical', 'finite 24-cell')
    equal(d.vertexFigureGeometry, 'euclidean', 'cubic cusp vertex figure')
    equal(d.compactness, 'paracompact', 'paracompact')
    ok(d.buildable, 'cell is finite so orbit engine applies')
    equal(d.builder, 'orbit', 'orbit engine')
  }),
  check('a spherical symbol is a finite polytope, not a tessellation', () => {
    const d = describeTessellation([3, 3])
    equal(d.geometry, 'spherical', 'spherical')
    equal(d.compactness, 'finite-polytope', 'finite polytope')
    ok(!d.buildable, 'not a tessellation')
    equal(d.builder, 'none', 'no tessellation builder')
  }),
  check('a euclidean honeycomb selects the lattice builder', () => {
    const d = describeTessellation([4, 3, 4])
    equal(d.geometry, 'euclidean', 'euclidean')
    equal(d.builder, 'euclidean-lattice', 'lattice builder')
  }),
  check('an invalid symbol is reported, not built', () => {
    const d = describeTessellation([1])
    ok(!d.buildable, 'invalid symbol not buildable')
  }),
])
