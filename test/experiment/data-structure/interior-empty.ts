import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { outermostShellFraction } from '@/code/substrate/coxeter/growth'

// DS13 (experiments/16). The interior-empty caveat (an honest negative). The same exponential growth that
// gives the bulk its capacity also concentrates almost all cells in the outermost shell, so the interior is
// nearly empty and uniform dense storage wastes it. We measure the fraction of cells in the last complete
// shell for the hyperbolic {3,4,3,4} (bounded away from 0, boundary-dominated) and the flat {3,4,3,3} (lower,
// tending to 0). Reference, Gugelmann et al. 2012.

export default defineExperiment({
  id: 'data-structure/interior-empty',
  title: 'DS13: the hyperbolic bulk is boundary-dominated, almost all cells lie in the outermost shell',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const hyperbolic = buildCoxeterMatrixMesh([3, 4, 3, 4], 3000)
    const flat = buildCoxeterMatrixMesh([3, 4, 3, 3], 3000)
    const hyperbolicFraction = outermostShellFraction(hyperbolic.shells)
    const flatFraction = outermostShellFraction(flat.shells)

    // the boundary dominates: the hyperbolic outermost-shell fraction is large and clearly exceeds the flat one
    const boundaryDominates = hyperbolicFraction > 0.3 && hyperbolicFraction > flatFraction + 0.05

    return verdict({
      status: boundaryDominates ? 'pass' : 'fail',
      claim:
        'a large fraction of the hyperbolic bulk lives in its outermost shell, the boundary-dominance caveat, so uniform dense storage wastes the interior and the bulk pays off only for hierarchical or boundary-concentrated data',
      metrics: {
        hyperbolicOutermostFraction: hyperbolicFraction,
        hyperbolicShells: hyperbolic.shells.length,
        boundaryDominates: boundaryDominates ? 1 : 0,
      },
      // CONTROL: the flat {3,4,3,3} honeycomb has a smaller outermost-shell fraction (the surface fraction of a
      // flat ball goes to 0), so the boundary-dominance is genuinely the negative curvature.
      control: { flatOutermostFraction: flatFraction },
      notes:
        'DS13 of experiments/16, an honest NEGATIVE. Paired with DS14 (range scans), this keeps the bulk-as-data story honest, exponential capacity comes with a near-empty interior and expensive range scans.',
    })
  },
})
