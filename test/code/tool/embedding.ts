// Conformance for code/tool/embedding: coordOf is the row-major index into the flat coords buffer,
// coords[element * dimension + axis], with the time axis at axis 0 and an out-of-range read returning 0.
// The indexing is exact, so we lay out a known buffer by hand and read every entry back.

import { suite, check, equal } from '@/test/code/harness'
import { Embedding, coordOf } from '@/code/tool/embedding'

// Three elements in a 2D lorentzian embedding: (t, x) per element, row major.
const e: Embedding = {
  form: 'embedding',
  dimension: 2,
  signature: 'lorentzian',
  coords: Float64Array.from([10, 20, 11, 21, 12, 22]),
  manifold: { form: 'minkowski', dimension: 2 },
}

suite('tool/embedding: coordOf row-major indexing', [
  check('coordOf reads coords[element * dimension + axis]', () => {
    equal(coordOf(e, { element: 0, axis: 0 }), 10, 'element 0 time')
    equal(coordOf(e, { element: 0, axis: 1 }), 20, 'element 0 space')
    equal(coordOf(e, { element: 1, axis: 0 }), 11, 'element 1 time')
    equal(coordOf(e, { element: 1, axis: 1 }), 21, 'element 1 space')
    equal(coordOf(e, { element: 2, axis: 0 }), 12, 'element 2 time')
    equal(coordOf(e, { element: 2, axis: 1 }), 22, 'element 2 space')
  }),
  check('an out-of-range read returns 0', () => {
    equal(coordOf(e, { element: 5, axis: 0 }), 0, 'past the buffer is 0')
  }),
])
