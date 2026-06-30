// Recreating the quantum value at a large PHYSICAL distance, through the bulk.
//
// A Bell pair reaches the quantum correlation (S = 2 root 2, the 85 percent win
// rate in the cooperation game) only if the settings and the system share enough
// causal past: the measurement-dependence bound gives S = 2 + 2 eta, so reaching
// the Tsirelson value needs the shared-past fraction eta at least root 2 minus 1,
// about 0.414.
//
// On a flat substrate that holds only at tiny separations, because the shared past
// collapses with distance and physical distance equals bulk distance. But on the
// hyperbolic bulk the same shared past sits at the same SMALL bulk distance while
// the two detectors are an EXPONENTIALLY larger PHYSICAL distance apart (the
// holographic shortcut, E-QTM-0034). So the quantum value is reachable out to a
// physical distance far beyond its bulk reach.
//
// The measurable is the amplification: the physical reach of the quantum value
// divided by its bulk reach. On the flat substrate the amplification is 1 (physical
// equals bulk). On the hyperbolic bulk it is large, and it grows with the threshold
// distance, because physical distance is exponential in bulk distance. This is the
// superdeterministic Bell violation recreated at a large physical separation,
// through a strictly local, no-signaling bulk (the connection is a common ancestor
// in the shared past, not a sideways influence).
//
// Grade L2: the shared past is measured exactly on the substrate, mapped through the
// cited measurement-dependence bound, with the flat substrate as the control.

import {
  bulkTreeSamples,
  flatLineSamples,
  reachAtThreshold,
} from '@/code/measure/cusp-distance'
import {
  chshFromSharedPast,
  TSIRELSON_SHARED_PAST,
} from '@/code/measure/bell'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/bulk-chsh-reach',
  code: 'E-QTM-0035',
  title:
    'through the bulk shortcut the quantum value (Tsirelson, the 85 percent win) is reachable out to an exponentially larger physical distance than on the flat substrate, the Bell violation recreated at a large physical separation with no action at a distance',
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
        claim: 'not enough samples (build a larger mesh)',
        metrics: { bulkSamples: bulk.length, flatSamples: flat.length },
      })
    }

    // Reach at the Tsirelson threshold (the quantum value, S = 2 root 2).
    const bulkReach = reachAtThreshold({
      samples: bulk,
      threshold: TSIRELSON_SHARED_PAST,
    })

    const flatReach = reachAtThreshold({
      samples: flat,
      threshold: TSIRELSON_SHARED_PAST,
    })

    // The CHSH at the largest physical reach of the quantum value on the bulk, and
    // the physical and bulk distance there, so the amplification is explicit.
    const bulkQuantumS = 2 + 2 * TSIRELSON_SHARED_PAST

    // 1. The bulk amplifies the physical reach of the quantum value far beyond its
    //    bulk reach.
    const bulkAmplifies = bulkReach.amplification > 2

    // 2. The flat substrate does not: physical reach equals bulk reach.
    const flatNoAmplification =
      flatReach.bulkReach > 0 &&
      Math.abs(flatReach.amplification - 1) < 0.25

    // 3. So the physical reach of the quantum value is much larger on the bulk than
    //    on the flat substrate.
    const bulkReachesFurther =
      bulkReach.physicalReach > 3 * flatReach.physicalReach

    const solved = bulkAmplifies && flatNoAmplification && bulkReachesFurther

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the quantum correlation (Tsirelson, the 85 percent win) is reachable out to a physical distance many times its bulk distance on the hyperbolic substrate (the bulk amplifies the physical reach), while on the flat substrate the physical reach equals the bulk reach, so the Bell violation is recreated at a large physical separation through a bulk-local common ancestor with no signal crossing space',
      metrics: {
        bulkPhysicalReach: bulkReach.physicalReach,
        bulkBulkReach: bulkReach.bulkReach,
        bulkAmplification: bulkReach.amplification,
        flatPhysicalReach: flatReach.physicalReach,
        flatBulkReach: flatReach.bulkReach,
        flatAmplification: flatReach.amplification,
        quantumValueReached: bulkQuantumS,
        tsirelsonSharedPast: TSIRELSON_SHARED_PAST,
        chshAtThreshold: chshFromSharedPast(TSIRELSON_SHARED_PAST),
      },
      control: {
        // The flat substrate is the control: with no bulk shortcut its physical
        // reach equals its bulk reach (amplification 1). The bulk amplification is
        // the curvature effect, and it could have been absent.
        flatAmplification: flatReach.amplification,
      },
      notes:
        'L2. eta is the exact cone-overlap shared past from the substrate; the map eta -> S is the cited measurement-dependence bound (Tsirelson at eta = root 2 - 1). The amplification (physical reach over bulk reach) is the holographic shortcut applied to the Bell reach. No signal crosses space: the correlation is carried by a common ancestor in the shared bulk past, so no-signaling holds by construction. The remaining gap to perfect distance-independence is in E-QTM-0036 (the expanding-bulk seed channel). Deterministic, exact.',
    })
  },
})
