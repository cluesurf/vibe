import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { lastCompleteShellRatio } from '@/code/substrate/coxeter/growth'

// DS1 (data-structures-in-the-4d-bulk, experiments/16). Capacity. The 4D hyperbolic bulk {3,4,3,4} holds
// exponentially more cells per radius than a flat honeycomb, the property that makes addresses logarithmic and
// capacity exponential. We measure the cell-graph growth ratio of the generated {3,4,3,4} Coxeter mesh against
// the flat 24-cell honeycomb {3,4,3,3}. The hyperbolic mesh grows faster (ratio bounded above 1), the flat one
// grows polynomially (ratio toward 1). Reference, Krioukov et al. 2010.

export default experiment({
  id: 'data-structure/capacity',
  title: 'DS1: the 4D hyperbolic bulk holds exponentially more cells per radius than the flat honeycomb',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const hyperbolic = buildCoxeterMatrixMesh([3, 4, 3, 4], 3000)
    const flat = buildCoxeterMatrixMesh([3, 4, 3, 3], 3000)
    const hyperbolicRatio = lastCompleteShellRatio(hyperbolic.shells)
    const flatRatio = lastCompleteShellRatio(flat.shells)

    // exponential capacity, the hyperbolic growth ratio is bounded above 1 and clearly beats the flat one
    const exponentialCapacity = hyperbolicRatio > 1.5 && hyperbolicRatio > flatRatio + 0.2

    return verdict({
      status: exponentialCapacity ? 'pass' : 'fail',
      claim:
        'the generated {3,4,3,4} hyperbolic cell graph grows faster per radius than the flat 24-cell honeycomb {3,4,3,3}, the exponential-capacity signature that makes the bulk a logarithmic-address store',
      metrics: {
        hyperbolicGrowthRatio: hyperbolicRatio,
        hyperbolicCells: hyperbolic.adjacency.length,
        hyperbolicShells: hyperbolic.shells.length,
      },
      // CONTROL: the flat {3,4,3,3} mesh grows with a lower ratio (polynomial), so the hyperbolic capacity is
      // genuine negative curvature, not an artifact of the generation.
      control: { flatGrowthRatio: flatRatio, hyperbolicAboveFlat: exponentialCapacity ? 1 : 0 },
      notes:
        'DS1 of experiments/16-data-structures-in-the-bulk. Capacity exponential in radius is the lever behind logarithmic addressing (DS2), short DHT routes (DS5), and high associative-memory capacity (DS10). The flat control confirms the growth is curvature.',
    })
  },
})
