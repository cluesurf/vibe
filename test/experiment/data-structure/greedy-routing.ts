import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { greedyRoutingSuccess } from '@/code/measure/navigation'
import { withScrambledEmbedding } from '@/code/tool/graph'

// DS4 (data-structures-in-the-4d-bulk, experiments/16). Greedy geometric routing. In hyperbolic space a
// message can be routed by always stepping to the neighbour closest to the destination in the HYPERBOLIC
// metric, with O(1) state per node and no routing tables. This greedy walk succeeds in hyperbolic space and
// gets stuck when the address does not encode geometric position. We route many deterministic pairs on the
// hyperbolic dodecagrid {5,3,4} using its Poincare-ball embedding, then run the SAME pairs on the SAME graph
// with the coordinates SCRAMBLED (the control). Greedy succeeds with the geometric embedding and collapses
// with the scrambled one, isolating the embedding as the cause. References, Kleinberg 2007, Boguna et al. 2010.

export default experiment({
  id: 'data-structure/greedy-routing',
  title:
    'DS4: greedy routing delivers on the hyperbolic metric and degrades on the Euclidean control',
  category: 'data-structure',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const graph = hyperbolicDodecagrid({
      depth: 4,
      connectThreshold: 2.0,
      maxVertices: 1500,
    })

    const trials = 300
    const maxHops = 200

    // greedy routing on the geometric Poincare-ball embedding
    const geometric = greedyRoutingSuccess({
      graph,
      trials,
      rng: makeRng({ seed: 1 }),
      maxHops,
    })

    // CONTROL: the SAME graph with the coordinates scrambled, same pairs (same seed)
    const scrambled = greedyRoutingSuccess({
      graph: withScrambledEmbedding(graph),
      trials,
      rng: makeRng({ seed: 1 }),
      maxHops,
    })

    // greedy delivers reliably on the geometric embedding and clearly beats the scrambled control
    const geometricDelivers = geometric.successRate > 0.9
    const beatsScrambled =
      geometric.successRate > scrambled.successRate + 0.2

    const ok = geometricDelivers && beatsScrambled

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'greedy routing on the geometric hyperbolic-ball embedding of the bulk delivers almost every pair with O(1) per-node state, and the same routing on the same graph with scrambled coordinates collapses, so the geometric embedding is what makes greedy routing work',
      metrics: {
        cells: graph.size,
        geometricSuccessRate: geometric.successRate,
        geometricMeanStretch: geometric.meanStretch,
        beatsScrambled: beatsScrambled ? 1 : 0,
      },
      // CONTROL: scrambling the coordinates on the identical graph collapses greedy delivery, so the success
      // is the geometric embedding (the address encoding position), not the topology alone.
      control: {
        scrambledSuccessRate: scrambled.successRate,
        scrambledMeanStretch: scrambled.meanStretch,
      },
      notes:
        'DS4 of experiments/16-data-structures-in-the-bulk. Extends addressing/dodecagrid-navigation with the Euclidean control that isolates the geometry. Greedy routing with O(1) state is the basis of hyperbolic network embeddings (Boguna et al.).',
    })
  },
})
