// E5 of the observer chunk, the inner experiencer in the bulk. The flat cusp is the outer, physical face of
// the world, the hyperbolic bulk is the inner one. This measures the geometric difference that makes the bulk
// the home for inner experience, its neighborhood grows EXPONENTIALLY (a self's relational structure has
// exponential room there, a tree of relations) while the flat cusp grows only POLYNOMIALLY (mere physical
// extension). So there is exponentially more room off the cusp for an interior life. Depth L2, a measured
// shell-growth contrast (exponential bulk versus polynomial cusp) with the cusp as the control. Spec: note
// theory-v0.8.0/experiments/05-observer-and-inner-experience.md (E5).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { bulkGraph, flatGraph } from '@/code/model/self-kit'
import {
  bfsShells,
  midShellGrowthRatio,
  branchingRatio,
} from '@/code/measure/shells'

type Graph = { cellCount: number; offsets: Int32Array; adj: Int32Array }

// a neighbors view of a CSR graph, one subarray per cell, for the shell traversal.
function neighborsOf(graph: Graph): ArrayLike<number>[] {
  return Array.from({ length: graph.cellCount }, (_, u) =>
    graph.adj.subarray(graph.offsets[u]!, graph.offsets[u + 1]!),
  )
}

// the bulk grows by at least this factor per shell (clearly exponential), the cusp's far-shell ratio must
// stay below this (polynomial, tending to one). The measured values are near 8 and 1.02.
const BULK_MIN = 3
const CUSP_MAX = 1.3

export default experiment({
  id: 'selves/inner-bulk-capacity',
  title:
    'the hyperbolic bulk grows exponentially, the flat cusp polynomially, room for the inner experiencer',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const bulk = bulkGraph(40000)
    const cusp = flatGraph(160)

    // the bulk explodes, so a few shells suffice and the middle window is the stable exponential rate.
    const bulkShells = bfsShells({
      neighbors: neighborsOf(bulk),
      root: 0,
      maxRadius: 6,
    }).shellCounts

    const bulkGrowthRatio = midShellGrowthRatio({
      shellCounts: bulkShells,
      from: 2,
      to: 6,
    })

    // the cusp grows linearly, so its shell-to-shell ratio tends to one at large radius (the polynomial
    // signature), read off the far shells.
    const center = 160 * 80 + 80
    const cuspShells = bfsShells({
      neighbors: neighborsOf(cusp),
      root: center,
      maxRadius: 55,
    }).shellCounts

    const cuspGrowthRatio = branchingRatio({
      shellCounts: cuspShells,
      from: 40,
      to: 55,
    })

    const ok = bulkGrowthRatio > BULK_MIN && cuspGrowthRatio < CUSP_MAX

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hyperbolic bulk grows exponentially shell by shell (a branching ratio near eight) while the flat cusp grows polynomially (a far-shell ratio near one), so the bulk holds exponentially more relational room than the cusp, the geometric home for the inner experiencer',
      metrics: {
        bulkGrowthRatio,
        cuspGrowthRatio,
        bulkShell5: bulkShells[5] ?? 0,
        cuspShell50: cuspShells[50] ?? 0,
      },
      control: { cuspGrowthRatio },
      notes:
        'the contrast is exponential versus polynomial growth, the same fact that makes the cusp a vanishing fraction of the bulk, read here as the room available for an interior structure off the cusp',
    })
  },
})
