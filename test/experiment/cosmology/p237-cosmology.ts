// P237 (cosmology): the {3,4,3,4} bulk is hyperbolic, so its shells grow EXPONENTIALLY with radius. That
// exponential growth IS the eternal expansion (a de-Sitter-like / inflating substrate), and the flat 3D cusp is
// the spatial slice. We measure the bulk's growth ratio (the expansion factor per shell) and frame the
// cosmology, eternal expansion from the hyperbolic growth, the cusp as flat space, peace as the initial state.
// Run: npx tsx code/experiment/p237-cosmology.ts

import { bfsShells, branchingRatio } from '@/code/measure/shells'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function cosmology(): {
  growthRatio: number
  exponential: boolean
} {
  const g = buildCellGraph({
    symbol: [3, 4, 3, 4] as never,
    maxCells: 30000,
  })
  const N = g.cellCount
  let center = 0,
    best = -1
  for (let i = 0; i < N; i++) {
    const d = g.neighbors[i]!.length
    if (d > best) {
      best = d
      center = i
    }
  }

  const { shellCounts: shell } = bfsShells({
    neighbors: g.neighbors,
    root: center,
  })
  const growthRatio =
    Math.round(
      branchingRatio({ shellCounts: shell, from: 3, to: 7 }) * 100,
    ) / 100
  const exponential = growthRatio > 1.5

  return { growthRatio, exponential }
}

export default experiment({
  id: 'cosmology/p237-cosmology',
  title:
    'the hyperbolic {3,4,3,4} bulk grows exponentially with radius, the eternal expansion',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = cosmology()
    const ok = r.exponential

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} bulk shells grow by a constant ratio greater than one per radial step, an exponential expansion of the substrate',
      metrics: {
        growthRatio: r.growthRatio,
        exponential: r.exponential ? 1 : 0,
      },
      notes:
        'L1, the exponential shell growth is a measured graph-growth property of a hyperbolic tiling, a known geometric fact framed as cosmic expansion, not an emergent dynamical result.',
    })
  },
})
