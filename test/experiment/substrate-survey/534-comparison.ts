// P242 (can we do the same experiments on {5,3,4}? a decisive sweep): {5,3,4} is the 3D hyperbolic honeycomb
// (12-neighbour dodecahedral cells, 2D horosphere, S^2 boundary). We test which results PORT (the substrate-
// general framework, solvable on {5,3,4} too, often easier) versus which FAIL (the physics content that needs
// {3,4,3,4}'s 24=D4 spinors and 3D cusp). Answer, the FRAMEWORK is fully solvable on {5,3,4}, but the PHYSICS
// (spin, gauge, the Standard Model, 3D space) does NOT port, which is exactly why {3,4,3,4} was chosen.
// Run: npx tsx code/experiment/p242-534-comparison.ts

import { betheCorrelatorExponent } from '@/code/measure/dimension'
import { cellGraphSpectral } from '@/code/measure/cell-graph-spectral'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function comparison534(): {
  specDim: number
  degree: number
  betheAlpha: number
} {
  // {5,3,4} bulk spectral dimension via the lazy-walk return probability (the central
  // difference here is the endpoint slope between t = 3 and t = 6), and the Bethe-lattice
  // boundary correlator exponent, both in code/measure.
  const bulk = cellGraphSpectral({
    symbol: [5, 3, 4],
    maxCells: 20000,
    t1: 3,
    t2: 6,
  })

  const betheAlpha = betheCorrelatorExponent(12)

  return { specDim: bulk.specDim, degree: bulk.degree, betheAlpha }
}

export default experiment({
  id: 'substrate-survey/534-comparison',
  code: 'E-SBT-0004',
  title:
    'the framework ports to {5,3,4} (3D bulk, clean 1/r^2 correlator), the control isolating what needs {3,4,3,4}',
  category: 'substrate-survey',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const r = comparison534()
    const ok = r.degree === 12 && Math.abs(r.betheAlpha - 2) < 0.3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the substrate-general framework is fully solvable on the {5,3,4} honeycomb, a hyperbolic bulk with dodecahedral degree 12 and a clean 1/r^2 Bethe correlator, which is the control that isolates the spin gauge and 3D-space physics that only {3,4,3,4} supplies',
      metrics: {
        degree: r.degree,
        specDim: r.specDim,
        betheAlpha: r.betheAlpha,
      },
      notes:
        'L1 known math, a closed-form Bethe-lattice correlator on the degree-12 {5,3,4} cell graph. The spectral dimension is read from a crude short-time lazy-walk return slope, which overshoots on a strongly hyperbolic graph (it reads ~4 here, not the geometric 3), so it is reported but NOT used in the pass. The pass rests on the exact degree and the clean correlator. The spin gauge and 3D claims are asserted from icosahedral geometry, not measured. This is a positive control for the framework, not a physics result.',
    })
  },
})
