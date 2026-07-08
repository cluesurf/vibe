// Hossenfelder's falsifiable signature, made quantitative from the substrate.
//
// Superdeterminism (the route vibe takes) predicts something standard quantum
// mechanics does not: the Bell violation is CONTINGENT on the measurement settings
// being correlated with the shared past. Two consequences follow, both measurable
// here from the shared-past fraction read off the real substrate.
//
//   1. A critical separation. The measurement-dependence bound says the reachable
//      CHSH with aligned settings is S = 2 + 2 * eta, where eta is the shared-past
//      fraction. The full quantum value, the Tsirelson bound 2 root 2, needs eta at
//      least root 2 - 1 (about 0.414). Since eta falls with separation, there is a
//      largest separation d* at which the quantum value is still reachable. On the
//      negatively curved substrate eta collapses fast, so d* is SMALL. On the flat
//      substrate eta decays slowly, so d* is larger. The quantum correlation is
//      supportable only over a short range on the curved mesh.
//
//   2. The alignment contingency. With aligned settings (drawn from the shared
//      past) the reachable S exceeds 2. With settings DECORRELATED from the shared
//      past the effective fraction is 0 and S is exactly 2, no violation. So vibe
//      predicts the violation disappears if the settings could be decoupled from
//      the common past. Standard quantum mechanics predicts the violation stays.
//
// Both are read from the measured eta (the same exact cone-overlap as E-QTM-0029),
// mapped through the cited measurement-dependence bound (chshFromSharedPast). The
// flat substrate is the control for the critical separation.
//
// Grade L2: a measured substrate quantity (eta vs separation) turned, through a
// cited bound, into a critical separation that differs between curved and flat,
// plus the alignment contingency. The bound itself is cited, not derived.

import { squareMesh, betheMesh, meshNeighbors } from '@/code/tool/mesh'
import { neighborDistances } from '@/code/tool/graph'
import { criticalSeparation } from '@/code/measure/shared-past'
import {
  chshFromSharedPast,
  TSIRELSON_SHARED_PAST,
} from '@/code/measure/bell'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const CONE_DEPTH = 4
const TSIRELSON = 2 * Math.SQRT2

function flatGeneration(neighbors: number[][], size: number): number[] {
  return Array.from(
    neighborDistances({ neighbors, size, source: size >> 1 }),
  )
}

export default experiment({
  id: 'quantum/measurement-independence-signature',
  code: 'E-QTM-0033',
  title:
    'the measured shared past sets a critical separation for the quantum value, smaller on the curved substrate, and the violation is contingent on settings aligned with the shared past',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const distances = [1, 2, 3, 4, 5, 6, 7, 8]

    // Flat substrate (degree 4), the control: eta decays slowly, so d* is larger.
    const square = squareMesh({ side: 41 })
    const squareNeighbors = meshNeighbors(square)
    const flat = criticalSeparation({
      neighbors: squareNeighbors,
      size: square.cellCount,
      generation: flatGeneration(squareNeighbors, square.cellCount),
      distances,
      coneDepth: CONE_DEPTH,
      etaThreshold: TSIRELSON_SHARED_PAST,
    })

    // Negatively curved substrate (degree 4 Bethe bulk): eta collapses, d* is small.
    const bethe = betheMesh({ coordination: 3, depth: 12 })
    const betheNeighbors = meshNeighbors(bethe)
    const betheGeneration = Array.from(
      neighborDistances({
        neighbors: betheNeighbors,
        size: bethe.cellCount,
        source: 0,
      }),
    )

    const curved = criticalSeparation({
      neighbors: betheNeighbors,
      size: bethe.cellCount,
      generation: betheGeneration,
      distances,
      coneDepth: CONE_DEPTH,
      etaThreshold: TSIRELSON_SHARED_PAST,
    })

    // The aligned vs decorrelated CHSH at the smallest separation (d = 1), where the
    // shared past is largest. Aligned uses the measured eta; decorrelated uses 0.
    const etaNear = curved.etaByDistance.get(1) ?? 0
    const alignedSNear = chshFromSharedPast(etaNear)
    const decorrelatedS = chshFromSharedPast(0)

    // 1. The critical separation is smaller on the curved substrate than on the
    //    flat one: the quantum value is supportable over a shorter range.
    const curvedCriticalSmaller =
      curved.dStar < flat.dStar && flat.dStar >= 1

    // 2. The violation is contingent on alignment: aligned settings beat the
    //    classical bound, decorrelated settings sit exactly on it.
    const alignmentContingent =
      alignedSNear > 2 && Math.abs(decorrelatedS - 2) < 1e-9

    const solved = curvedCriticalSmaller && alignmentContingent

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the measured shared-past fraction sets a critical separation beyond which even aligned superdeterministic settings cannot reach the Tsirelson value, and that separation is smaller on the negatively curved substrate than on the flat one, while decorrelating the settings from the shared past removes the violation entirely (S returns to 2), the experimentally distinguishing signature of the superdeterministic route',
      metrics: {
        curvedCriticalSeparation: curved.dStar,
        flatCriticalSeparation: flat.dStar,
        tsirelsonSharedPast: TSIRELSON_SHARED_PAST,
        tsirelsonValue: TSIRELSON,
        etaNearCurved: etaNear,
        alignedSNear,
        decorrelatedS,
      },
      control: {
        // The flat substrate is the control: same bound, same threshold, but its
        // slow eta decay gives a larger critical separation. If the curved and flat
        // critical separations matched, curvature would not be shrinking the range.
        flatCriticalSeparation: flat.dStar,
        decorrelatedS,
      },
      notes:
        'L2. eta is the exact cone-overlap fraction from the real substrate (as in E-QTM-0029), deterministic. The map eta -> S is the cited measurement-dependence bound S = 2 + 2 eta, Tsirelson at eta = root 2 - 1. The decorrelated case is the same bound at zero alignment, the no-violation baseline. The falsifiable content: vibe predicts a finite, curvature-dependent critical separation and that the violation is contingent on setting-shared-past alignment, neither of which standard quantum mechanics predicts.',
    })
  },
})
