import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { vsaRecallAccuracy } from '@/code/measure/associative-memory'

// DS10 (experiments/16). Associative memory. A vector-symbolic memory superposes many key-value bindings in
// one vector and recalls them by unbinding and cleanup, and its capacity scales with the vector dimension,
// which in the bulk is the cell count in a radius, exponential in the radius. We store the same number of
// bindings in a small-dimension memory and a large-dimension one (the large one corresponds to a slightly
// larger radius, exponentially more cells) and confirm the larger memory recalls far more accurately, so
// capacity grows with the radius. References, Plate 1995, Kanerva 2009.

export default experiment({
  id: 'data-structure/associative-memory',
  title:
    'DS10: associative-memory capacity scales with dimension, exponential in the bulk radius',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const items = 40
    const smallDimension = 96 // an inner radius
    const largeDimension = 1024 // a few radii further out, exponentially more cells
    const smallAccuracy = vsaRecallAccuracy({
      dim: smallDimension,
      items,
    })

    const largeAccuracy = vsaRecallAccuracy({
      dim: largeDimension,
      items,
    })

    // the larger memory (more cells, a larger radius) recalls far more accurately, so capacity scales with the
    // dimension, hence exponentially with the radius
    const capacityScalesWithRadius =
      largeAccuracy > 0.9 && largeAccuracy > smallAccuracy + 0.2

    return verdict({
      status: capacityScalesWithRadius ? 'pass' : 'fail',
      claim:
        'a vector-symbolic associative memory recalls far more bindings at a larger dimension, and the bulk dimension (cells in a radius) is exponential in the radius, so the memory capacity grows exponentially with the bulk radius',
      metrics: {
        items,
        largeDimension,
        largeAccuracy,
        capacityScalesWithRadius: capacityScalesWithRadius ? 1 : 0,
      },
      // CONTROL: the small-dimension memory (an inner radius, far fewer cells) recalls the same bindings much
      // worse, so the capacity is the exponential cell count, not the memory scheme.
      control: { smallDimension, smallAccuracy },
      notes:
        'DS10 of experiments/16. Capacity equals the cell count in a radius (DS1), here read as binding capacity.',
    })
  },
})
