// E (cross-tessellation): the content-addressable memory is tessellation-agnostic. Run the associative
// battery column on EVERY buildable regular hyperbolic tessellation, not just {3,4,3,4}. Store a distinct
// word on every cell of each substrate, query each by exact content, and confirm exact recall is 1.0 on all
// of them. The engine does not depend on the geometry, only on the cell graph, so the universal pattern is a
// perfect recall across the whole catalog. The per-tessellation measure lives in code/measure/tessellation-
// battery (one source of truth), this experiment is a thin loop over it. See note/cross-tessellation-
// experiments.md for the harness convention.

import { TESSELLATIONS } from '@/code/substrate/tessellation-catalog'
import { measureTessellation } from '@/code/measure/tessellation-battery'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Small per-substrate build, the associative measure is cheap so the whole catalog runs in the suite.
const SWEEP_MAX_CELLS = 1200

export function associativeTessellationSweep(input?: { maxCells?: number }): {
  buildableCount: number
  perfectCount: number
  minRecall: number
  allPerfect: boolean
} {
  const maxCells = input?.maxCells ?? SWEEP_MAX_CELLS
  const buildable = TESSELLATIONS.filter((t) => t.buildable)
  const recalls = buildable.map((t) => measureTessellation({ schlafli: t.schlafli, maxCells }).associativeExactRecall)
  const perfectCount = recalls.filter((r) => r === 1).length
  const minRecall = recalls.reduce((m, r) => Math.min(m, r), 1)
  return {
    buildableCount: buildable.length,
    perfectCount,
    minRecall,
    allPerfect: perfectCount === buildable.length,
  }
}

export default experiment({
  id: 'associative/tessellation-sweep',
  title: 'the content-addressable memory recalls every stored word exactly on every buildable regular hyperbolic tessellation',
  category: 'associative',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = associativeTessellationSweep({ maxCells: SWEEP_MAX_CELLS })
    return verdict({
      status: r.allPerfect ? 'pass' : 'fail',
      claim:
        'storing a distinct word on every cell and querying by exact content returns the unique correct cell on every buildable regular hyperbolic tessellation in the catalog, so the associative engine is genuinely tessellation-agnostic, perfect recall does not depend on the geometry, only on the cell graph',
      metrics: {
        buildableCount: r.buildableCount,
        perfectCount: r.perfectCount,
        minRecall: r.minRecall,
      },
      notes:
        'L2, a comparative survey across the full enumerated catalog (42 buildable of 45 cataloged). One reusable battery column (code/measure/tessellation-battery, associativeExactRecall) measures each from its Schlafli symbol via the Coxeter reflection-group mesh, so every tessellation is measured identically. The result is universal, perfect recall on all of them, which is the point, the memory core is substrate-independent. The geometry only changes capacity and latency (see capacity-vs-curvature), not correctness. Build is kept small (maxCells 1200) so the whole catalog runs cheaply in the suite.',
    })
  },
})
