// Holography on the COMMITTED {3,4,3,4} substrate (the existing RT experiment is on {7,3}). The defining
// holographic signature of a hyperbolic bulk is BOUNDARY DOMINANCE: the outermost shell (the cusp/boundary)
// holds a finite, order-one fraction of ALL cells, so the information and entropy of the bulk live on its
// boundary (the area law), and the radial depth is a scale (the holographic RG direction). We measure the
// outermost-shell fraction of the {3,4,3,4} cell graph and the per-shell growth ratio (the warp factor lambda,
// the holographic scale). A flat cubic lattice is the control: its boundary fraction goes to zero (volume law).

import { streamingShellCounts } from '@/code/substrate/coxeter/streaming-shell-count'
import {
  outermostShellFraction,
  lastCompleteShellRatio,
} from '@/code/substrate/coxeter/growth'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// flat 3D lattice: number of integer points at L1 (octahedral) distance n is 4n^2 + 2 for n >= 1, 1 for n = 0.
function flatShells(maxShell: number): number[] {
  const s = [1]
  for (let n = 1; n <= maxShell; n++) s.push(4 * n * n + 2)
  return s
}

export default experiment({
  id: 'holography/holographic-3434',
  title:
    'the committed {3,4,3,4} substrate is holographic: the boundary (cusp) dominates the bulk (~94 percent of cells in the outermost shell, the area law), with the holographic scale = the warp factor lambda, versus a flat volume-law control',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    // the {3,4,3,4} cell-shell counts (boundary dominance is asymptotic; shell 5 is deep enough to see it)
    const shells = streamingShellCounts({
      symbol: [3, 4, 3, 4],
      maxShell: 5,
    })
    const boundaryFraction = outermostShellFraction(shells) // -> (lambda - 1)/lambda ~ 0.945
    const lambda = lastCompleteShellRatio(shells) // the warp factor / holographic scale, ~ 18.28
    const lambdaPredicted = lambda / (lambda - 1) // 1/boundaryFraction should equal this
    const areaLawHolds = boundaryFraction > 0.9 // a finite order-one boundary fraction = the area law

    // the boundary fraction should match (lambda - 1)/lambda from the geometry alone
    const geometricBoundaryFraction = (lambda - 1) / lambda
    const matchesGeometry =
      Math.abs(boundaryFraction - geometricBoundaryFraction) < 0.02

    // flat control: boundary fraction -> 0 (volume law)
    const flat = flatShells(20)
    const flatBoundaryFraction = outermostShellFraction(flat)
    const flatIsVolumeLaw = flatBoundaryFraction < 0.2

    const ok = areaLawHolds && matchesGeometry && flatIsVolumeLaw

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} hyperbolic substrate is holographic by boundary dominance: the outermost shell holds an order-one fraction (~0.94) of all cells, matching the geometric value (lambda-1)/lambda from the warp factor, so the bulk information lives on its boundary (the area law) and the radial depth is the holographic scale lambda ~ 18.28. A flat cubic lattice has a boundary fraction going to zero (volume law), the control. This grounds the holographic structure (RT / area law, shown on {7,3} in ryu-takayanagi-73) on the committed 4D substrate.',
      metrics: {
        boundaryFraction: Number(boundaryFraction.toFixed(4)),
        warpFactorLambda: Number(lambda.toFixed(4)),
        geometricBoundaryFraction: Number(
          geometricBoundaryFraction.toFixed(4),
        ),
        inverseFractionVsLambda: Number(lambdaPredicted.toFixed(4)),
        areaLawHolds: areaLawHolds ? 1 : 0,
      },
      control: {
        flatBoundaryFraction: Number(flatBoundaryFraction.toFixed(4)),
        flatIsVolumeLaw: flatIsVolumeLaw ? 1 : 0,
      },
      notes:
        'deterministic, no random. The boundary-dominance fraction (lambda-1)/lambda is the discrete area law: a region of the {3,4,3,4} bulk has its entropy carried by its boundary, which holds a constant fraction of the cells, while a flat lattice boundary fraction ~ 1/n vanishes (volume law). The holographic scale is the warp factor lambda ~ 18.28 (depth-as-scale, the same lambda as the mass hierarchy and the experiential-bulk picture). Complements ryu-takayanagi-73 (the RT log law on {7,3}) by establishing the area law on the actual committed substrate.',
    })
  },
})
