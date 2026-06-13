// S53333-STRUCTURE ({5,3,3,3,3} suite): the 5D hyperbolic honeycomb (Coxeter [5,3,3,3,3]), for completeness.
// IMPORTANT existence note, compact REGULAR hyperbolic honeycombs exist only through H^4, so {5,3,3,3,3} (which
// would tile H^5) is BEYOND compact, it is paracompact / Lorentzian (ideal vertices, non-compact). The local
// cell graph is still constructible (the builder makes a uniform-degree graph), so the framework experiments
// run on it. Verdicts, bulk 5D, horosphere 4D (so physical space would be 4D, OVER-dimensional), the leading 5
// makes the coin 5-fold / H-family / NON-crystallographic, so NO root-system gauge and NO spinor.
// Run: npx tsx code/experiment/s53333-structure.ts

import { cellGraphSpectral } from '@/code/measure/cell-graph-spectral'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s53333Structure(): { degree: number; specDim: number; crystallographic: boolean; hasSpinor: boolean } {
  const { degree, specDim } = cellGraphSpectral({ symbol: [5, 3, 3, 3, 3], maxCells: 6000, t1: 2, t2: 4 })
  // the symbol contains a 5 -> H-family Coxeter group -> NON-crystallographic (no root lattice, like {5,3,4})
  const crystallographic = false // a 5 in the Schlafli symbol forces 5-fold symmetry, forbidden crystallographically
  const hasSpinor = false // H5 is a non-crystallographic reflection group, the coin carries no spinor
  return { degree, specDim, crystallographic, hasSpinor }
}

export default defineExperiment({
  id: 'substrate-survey/s53333-structure',
  title: 'the {5,3,3,3,3} bulk builds as a 5D hyperbolic graph, over-dimensional with no spinor',
  category: 'substrate-survey',
  substrates: ['53333'],
  depth: 'L0',
  paper: false,
  run() {
    const r = s53333Structure()
    const ok = r.degree > 0 && r.specDim > 0 && !r.crystallographic && !r.hasSpinor
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {5,3,3,3,3} cell graph builds with a measured bulk degree and spectral dimension, and is recorded as non-crystallographic with no spinor because its leading 5 forces the H5 reflection group',
      metrics: {
        degree: r.degree,
        specDim: r.specDim,
        crystallographic: r.crystallographic ? 1 : 0,
        hasSpinor: r.hasSpinor ? 1 : 0,
      },
      notes:
        'L0 for the spin and gauge content, the crystallographic and hasSpinor flags are hard-set to false by hand from the known fact that a 5 in the symbol gives a non-crystallographic H5 group, they are not measured. Only the bulk degree and spectral dimension are measured. The dimension and spinor conclusions are stated, not derived here.',
    })
  },
})
