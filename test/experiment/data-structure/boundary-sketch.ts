import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { bloomFalsePositiveRate } from '@/code/measure/sketch'

// DS12 (experiments/16). Boundary sketch. The exponential boundary is a huge cheap address space, so a Bloom
// filter placed on the boundary cells has a false-positive rate that falls as the boundary grows, which on a
// hyperbolic tessellation means it falls exponentially with radius. We measure the false-positive rate of a
// fixed Bloom filter at a small boundary (one radius) and a large boundary (a few radii further out, where the
// outermost shell is exponentially larger), holding the item count fixed. Reference, Bloom 1970.

export default experiment({
  id: 'data-structure/boundary-sketch',
  title: 'DS12: a Bloom filter on the exponential boundary has a false-positive rate that falls with radius',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // the boundary at a radius is the outermost shell; in the hyperbolic mesh it grows exponentially outward
    const mesh = buildCoxeterMatrixMesh([3, 4, 3, 4], 6000)
    const shells = mesh.shells
    const smallBoundary = shells[5]! // an inner shell
    const largeBoundary = shells[shells.length - 3]! // an outer shell, exponentially larger
    const items = 150
    const hashes = 4
    const queries = 2000

    const smallRate = bloomFalsePositiveRate({ cells: smallBoundary, items, hashes, queries })
    const largeRate = bloomFalsePositiveRate({ cells: largeBoundary, items, hashes, queries })

    // the larger (exponentially bigger) boundary yields a much lower false-positive rate
    const falsePositiveFalls = largeBoundary > smallBoundary * 2 && largeRate < smallRate * 0.5

    return verdict({
      status: falsePositiveFalls ? 'pass' : 'fail',
      claim:
        'a Bloom filter over the boundary cells has a false-positive rate that falls sharply as the boundary grows, and the hyperbolic boundary grows exponentially with radius, so the sketch becomes asymptotically cheap',
      metrics: {
        smallBoundaryCells: smallBoundary,
        largeBoundaryCells: largeBoundary,
        smallFalsePositiveRate: smallRate,
        largeFalsePositiveRate: largeRate,
      },
      // CONTROL: the inner (small) boundary is a flat-sized sketch with a high false-positive rate, so the gain
      // is the exponentially larger boundary, not the Bloom filter itself.
      control: { boundaryGrewExponentially: largeBoundary > smallBoundary * 2 ? 1 : 0 },
      notes:
        'DS12 of experiments/16. The exponential boundary is also the home of the hash table (SS2) and the inverted index (SS13), the sketch capacity is the boundary size.',
    })
  },
})
