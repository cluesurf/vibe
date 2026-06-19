import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { coxeterPoincareGraph } from '@/code/substrate/coxeter/embedding'
import { greedyRoutingSuccess } from '@/code/measure/navigation'
import { withScrambledEmbedding } from '@/code/tool/graph'

// Refinement of substrate-survey/pentacomb-mesh-rule. That experiment ran the rule on the COMBINATORIAL cell
// graph. Here we build the FULL 5D GEOMETRIC embedding of the spinor pentacombs {3,4,3,3,4} and {3,4,3,3,3} via
// the Coxeter-to-Poincare construction, and confirm the embedding is a genuine 5-dimensional hyperbolic space,
// greedy routing by the H^5 metric delivers and collapses when the coordinates are scrambled. So the pentacomb
// is backed by real 5D geometry, not only a combinatorial graph, closing the geometric-mesh refinement.

export default experiment({
  id: 'substrate-survey/pentacomb-geometric',
  title:
    'the 5D pentacomb has a genuine hyperbolic embedding, greedy routing on H^5 delivers',
  category: 'substrate-survey',
  substrates: ['53334'],
  depth: 'L2',
  paper: true,
  run() {
    const symbols: number[][] = [
      [3, 4, 3, 3, 4],
      [3, 4, 3, 3, 3],
    ]

    let allGeometric = true
    let allBeatScrambled = true
    let allFiveDimensional = true
    let worst = 1

    for (const symbol of symbols) {
      const graph = coxeterPoincareGraph(symbol, 1000)
      const greedy = greedyRoutingSuccess({
        graph,
        trials: 150,
        rng: makeRng({ seed: 1 }),
        maxHops: 200,
      })

      const scrambled = greedyRoutingSuccess({
        graph: withScrambledEmbedding(graph),
        trials: 150,
        rng: makeRng({ seed: 1 }),
        maxHops: 200,
      })

      if (graph.embedding!.dimension !== 5) {
        allFiveDimensional = false
      }

      if (greedy.successRate < 0.85) {
        allGeometric = false
      }

      if (!(greedy.successRate > scrambled.successRate + 0.2)) {
        allBeatScrambled = false
      }

      worst = Math.min(worst, greedy.successRate)
    }

    const ok = allFiveDimensional && allGeometric && allBeatScrambled

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the spinor pentacombs {3,4,3,3,4} and {3,4,3,3,3} embed as genuine 5-dimensional hyperbolic spaces (greedy routing by the H^5 metric delivers and collapses when scrambled), so the pentacomb that carries the 24-cell spinor directions and runs the reversible rule is backed by real geometry',
      metrics: {
        pentacombs: symbols.length,
        allFiveDimensional: allFiveDimensional ? 1 : 0,
        allGeometricGreedyDelivers: allGeometric ? 1 : 0,
        worstGreedySuccess: worst,
      },
      // CONTROL: scrambling the coordinates collapses greedy delivery, so the H^5 embedding is genuine geometry.
      control: { allBeatScrambled: allBeatScrambled ? 1 : 0 },
      notes:
        'Refines substrate-survey/pentacomb-mesh-rule (combinatorial) with the full 5D geometric embedding from code/substrate/coxeter/embedding. With pentacomb-spin-curvature (the spinor directions) and pentacomb-mesh-rule (the reversible rule), the pentacomb now has spin, curvature, a working rule, AND a real 5D embedding.',
    })
  },
})
