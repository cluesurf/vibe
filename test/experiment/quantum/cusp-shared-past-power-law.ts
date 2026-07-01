// The bridge between the holographic bulk shortcut and the spacelike-Bell problem.
//
// The holography experiments (E-HLG-0005, E-HLG-0018) established that on the
// committed hyperbolic bulk the through-bulk distance grows as the LOG of the
// within-cusp distance: two points far apart in physical space are joined by a
// short path through the bulk. The spacelike-Bell experiments (E-QTM-0029) measured
// the shared past collapsing exponentially with BULK distance. Put the two together
// and the collapse is in the wrong variable.
//
// This measures the shared past (the Bell-relevant cone overlap) directly as a
// function of the PHYSICAL (cusp) distance a detector would measure. On the
// hyperbolic bulk the shared past is exponential in bulk distance (the collapse),
// physical distance is exponential in bulk distance (the shortcut), so the shared
// past is only a slow POWER LAW in physical distance. On a flat substrate physical
// distance equals bulk distance, so there is no such softening. The flat substrate
// is the curvature control.
//
// Consequence: the shared past, and so the reachable Bell correlation, declines far
// more gently in the physical distance a Bell experiment spans than the bulk
// collapse made it look. E-QTM-0035 turns this into a physical reach.
//
// Grade L2: it reproduces the established bulk shortcut and measures the shared past
// inheriting it, with a flat control. The geometry is cited, the new content is the
// shared-past power law in physical distance.

import { bulkTreeSamples, flatLineSamples } from '@/code/measure/cusp-distance'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/cusp-shared-past-power-law',
  code: 'E-QTM-0034',
  title:
    'the Bell shared past is exponential in bulk distance but only a power law in physical cusp distance, inheriting the holographic shortcut, while the flat control has no shortcut',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const bulk = bulkTreeSamples({ coordination: 2, depth: 15, coneDepth: 4 })
    const flat = flatLineSamples({ side: 81, coneDepth: 4 })

    if (bulk.length < 5 || flat.length < 5) {
      return verdict({
        status: 'fail',
        claim: 'not enough samples to fit (build a larger mesh)',
        metrics: { bulkSamples: bulk.length, flatSamples: flat.length },
      })
    }

    // On the hyperbolic bulk: physical is exponential in bulk (the shortcut),
    // eta is exponential in bulk (the collapse), so eta is a power law in physical.
    const physicalVsBulk = linearFit({
      xs: bulk.map(s => s.bulk),
      ys: bulk.map(s => Math.log(s.physical)),
    })

    const etaVsBulk = linearFit({
      xs: bulk.map(s => s.bulk),
      ys: bulk.map(s => Math.log(s.eta)),
    })

    const etaVsPhysical = linearFit({
      xs: bulk.map(s => Math.log(s.physical)),
      ys: bulk.map(s => Math.log(s.eta)),
    })

    const physicalExponent = -etaVsPhysical.slope

    // On the flat substrate: physical equals bulk, a straight line of slope 1.
    const flatPhysicalVsBulk = linearFit({
      xs: flat.map(s => s.bulk),
      ys: flat.map(s => s.physical),
    })

    const shortcutPresent =
      physicalVsBulk.slope > 0.1 && physicalVsBulk.r2 > 0.85

    const collapseInBulk = etaVsBulk.r2 > 0.9
    const powerLawInPhysical =
      etaVsPhysical.r2 > 0.85 && physicalExponent > 0

    const flatNoShortcut =
      flatPhysicalVsBulk.r2 > 0.98 &&
      Math.abs(flatPhysicalVsBulk.slope - 1) < 0.1

    const solved =
      shortcutPresent &&
      collapseInBulk &&
      powerLawInPhysical &&
      flatNoShortcut

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on the hyperbolic bulk the Bell shared past collapses exponentially with bulk distance, but physical cusp distance is exponential in bulk distance (the holographic shortcut), so the shared past is only a slow power law in physical distance; on the flat control physical distance equals bulk distance and there is no such softening',
      metrics: {
        physicalExponent,
        etaVsPhysicalR2: etaVsPhysical.r2,
        etaVsBulkRate: -etaVsBulk.slope,
        etaVsBulkR2: etaVsBulk.r2,
        physicalVsBulkSlope: physicalVsBulk.slope,
        physicalVsBulkR2: physicalVsBulk.r2,
        flatPhysicalVsBulkSlope: flatPhysicalVsBulk.slope,
        flatPhysicalVsBulkR2: flatPhysicalVsBulk.r2,
      },
      control: {
        // The flat substrate is the curvature control: no bulk shortcut, so physical
        // distance tracks bulk distance one for one and the shared past gets no
        // power-law softening. If the hyperbolic case behaved the same, curvature
        // would not be doing the work.
        flatPhysicalVsBulkSlope: flatPhysicalVsBulk.slope,
      },
      notes:
        'L2. The bulk shortcut (physical ~ exp bulk) is the established RT log law, here re-measured and cited (E-HLG-0005, E-HLG-0018). eta is the exact integer cone-overlap shared past. Physical distance is the independent boundary-ordering separation, so its exponential relation to bulk distance is measured, not assumed. The new content is that the Bell shared past inherits the shortcut as a power law in physical distance. Deterministic, exact.',
    })
  },
})
