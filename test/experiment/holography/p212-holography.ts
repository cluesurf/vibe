// P212 (Tier 3): holography, the boundary at infinity is the screen. Measure the intrinsic dimension of the
// OUTER SHELL (the boundary) of each bulk, {5,3,4} should read ~2 (an S^2 screen), {3,4,3,4} ~3 (an S^3
// screen), the dimension the holographic dual would live in. Also confirm the area-law shape, the boundary cut
// of a ball scales with the shell (boundary), not the interior. Run: npx tsx code/experiment/p212-holography.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { boundaryDimension } from '@/code/measure/boundary-dimension'

export function holography(): {
  fiveBoundaryDim: number
  fourBoundaryDim: number
  confounded: boolean
} {
  const a = boundaryDimension({ symbol: [5, 3, 4], maxCells: 40000 })
  const b = boundaryDimension({ symbol: [3, 4, 3, 4], maxCells: 40000 })
  // a finite hyperbolic patch is ~99% boundary, so the "shell" is the whole bulk (and the 4D shell sub-graph
  // fragments), the readings (2->3.07, 3->0.45) are wrong -> the method is CONFOUNDED, same as the gravity measure.
  const confounded =
    Math.abs(a.boundaryDim - 2) > 0.7 ||
    Math.abs(b.boundaryDim - 3) > 0.7
  return {
    fiveBoundaryDim: a.boundaryDim,
    fourBoundaryDim: b.boundaryDim,
    confounded,
  }
}

export default experiment({
  id: 'holography/p212-holography',
  title:
    'finite-patch shell extraction cannot read a clean holographic screen dimension',
  category: 'holography',
  substrates: ['534', '3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = holography()
    const ok = r.confounded
    return verdict({
      status: ok ? 'open' : 'pass',
      claim:
        'extracting the outer-shell intrinsic dimension of a finite hyperbolic patch does not return the expected screen dimensions of 2 and 3 because the patch is almost entirely boundary, so the holographic screen dimension is open and needs an ideal-boundary construction',
      metrics: {
        fiveBoundaryDim: r.fiveBoundaryDim,
        fourBoundaryDim: r.fourBoundaryDim,
        confounded: r.confounded ? 1 : 0,
      },
      notes:
        'L1, honest open negative. Deterministic. The method is confounded, a finite hyperbolic patch is roughly 99 percent boundary so a thin screen cannot be isolated and the readings are wrong. This is the same limitation as the finite-patch gravity measure. The result is reported as open, not as a measured screen dimension.',
    })
  },
})
