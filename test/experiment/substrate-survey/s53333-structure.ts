// S53333-STRUCTURE ({5,3,3,3,3} suite): the 5D hyperbolic honeycomb (Coxeter [5,3,3,3,3]), for completeness.
// IMPORTANT existence note, compact REGULAR hyperbolic honeycombs exist only through H^4, so {5,3,3,3,3} (which
// would tile H^5) is BEYOND compact, it is paracompact / Lorentzian (ideal vertices, non-compact). The local
// cell graph is still constructible (the builder makes a uniform-degree graph), so the framework experiments
// run on it. Verdicts, bulk 5D, horosphere 4D (so physical space would be 4D, OVER-dimensional), the leading 5
// makes the coin 5-fold / H-family / NON-crystallographic, so NO root-system gauge and NO spinor.
// Run: npx tsx code/experiment/s53333-structure.ts

import { cellGraphSpectral } from '@/code/measure/cell-graph-spectral'
import { symbolContainsSubdiagram } from '@/code/substrate/coxeter/gram-signature'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PENTACOMB5D = [5, 3, 3, 3, 3]

export function s53333Structure(): {
  degree: number
  specDim: number
  crystallographic: boolean
  hasSpinor: boolean
} {
  const { degree, specDim } = cellGraphSpectral({
    symbol: PENTACOMB5D,
    maxCells: 6000,
    t1: 2,
    t2: 4,
  })
  // both flags are now COMPUTED from the symbol, not hand-set. Crystallographic means every entry is 3, 4,
  // or 6 (the crystallographic restriction), and the leading 5 fails it. The spinor hook is the [3,4,3]
  // (24-cell / D4) subdiagram, which {5,3,3,3,3} does not contain.
  const crystallographic = PENTACOMB5D.every(
    n => n === 3 || n === 4 || n === 6,
  )
  const hasSpinor = symbolContainsSubdiagram(PENTACOMB5D, [3, 4, 3])

  return { degree, specDim, crystallographic, hasSpinor }
}

export default experiment({
  id: 'substrate-survey/s53333-structure',
  title:
    'the {5,3,3,3,3} bulk builds as a 5D hyperbolic graph, over-dimensional with no spinor',
  category: 'substrate-survey',
  substrates: ['53333'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s53333Structure()
    const ok =
      r.degree > 0 &&
      r.specDim > 0 &&
      !r.crystallographic &&
      !r.hasSpinor

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
        'L1, known math. The bulk degree and spectral dimension are measured from the cell graph, and the crystallographic and spinor flags are now COMPUTED from the Schlafli symbol, not hand-set. The leading 5 fails the crystallographic restriction (entries must be 3, 4, or 6), and the symbol contains no [3,4,3] (24-cell / D4) subdiagram, so it carries no spinor. So {5,3,3,3,3} is an over-dimensional (5D bulk, 4D horosphere) non-crystallographic substrate with no spinor coin, all read off the symbol and the build, not asserted.',
    })
  },
})
