// The Bell critical-separation signature, on the GENUINE {3,4,3,4} substrate.
//
// E-QTM-0033 turned the measured shared-past fraction eta into a falsifiable critical
// separation d* (the largest separation at which aligned superdeterministic settings
// can still reach the Tsirelson value), but it measured d* on a BETHE-TREE stand-in for
// the curved substrate, because a genuine hyperbolic tessellation is shallow at feasible
// cell counts. E-QTM-0032 then confirmed the shared-past COLLAPSE on the real committed
// {3,4,3,4} tessellation (real facet-adjacency and cycles). This experiment closes the
// remaining gap: it runs the critical-separation SIGNATURE itself on the genuine
// committed substrate, no tree stand-in, at the short range the real mesh can hold.
//
// Measured, off the real mesh (buildCellGraph {3,4,3,4}, 20,000 cells), with exact
// integer cone counts and no randomness:
//   1. On the genuine CURVED substrate the shared-past fraction never reaches the
//      Tsirelson threshold (root 2 - 1 ~ 0.414) at ANY resolvable separation, so the
//      critical separation is d* = 0: the reachable CHSH via the local shared-past
//      channel, S = 2 + 2 eta, stays strictly below the quantum value 2 root 2 at every
//      separation. Even adjacent backward cones overlap only ~10 percent, the curvature.
//   2. On the FLAT {3,4,3,4} (the D4 lattice), the same measurement reaches the
//      threshold at short range (d* >= 1, eta ~ 0.62 at the smallest separation), so the
//      quantum value IS locally reachable there. This is the curvature control: if the
//      flat mesh also gave d* = 0, curvature would not be the cause.
//   3. The curved fraction is smaller than the flat one at every separation, and
//      decorrelating the settings from the shared past drops the reachable value to
//      exactly 2 (no violation), the alignment-contingency signature.
//
// So on the REAL committed substrate the local shared past cannot carry the quantum
// correlation even at the smallest separation, a sharper negative than the tree gave.
// The distance-independent quantum correlation must be seed-anchored (the past boundary),
// not locally refreshed. Grade L2: a measured substrate quantity (eta vs separation on
// the genuine mesh) mapped through the cited measurement-dependence bound S = 2 + 2 eta
// (Hall); the bound is cited, not derived, and the interior is shallow by the curvature
// itself, so d* is read at the short range the genuine tessellation holds.

import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { mostConnectedNode, neighborDistances } from '@/code/tool/graph'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { criticalSeparation } from '@/code/measure/shared-past'
import {
  chshFromSharedPast,
  TSIRELSON_SHARED_PAST,
} from '@/code/measure/bell'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const CONE_DEPTH = 2
const DISTANCES = [1, 2, 3, 4]
const TSIRELSON = 2 * Math.SQRT2

export default experiment({
  id: 'quantum/critical-separation-genuine',
  code: 'E-QTM-0083',
  title:
    'on the genuine {3,4,3,4} tessellation the shared past never reaches the Tsirelson threshold at any separation (critical separation zero), while the flat {3,4,3,4} reaches it at short range, so the quantum correlation is not locally reachable on the real curved substrate',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // the genuine large {3,4,3,4} hyperbolic tessellation, real cycles
    const curved = buildCellGraph({
      symbol: [3, 4, 3, 4],
      maxCells: 20000,
    })

    const curvedSeed = mostConnectedNode(curved.neighbors)
    const curvedGeneration = Array.from(
      neighborDistances({
        neighbors: curved.neighbors,
        size: curved.cellCount,
        source: curvedSeed,
      }),
    )

    const curvedCritical = criticalSeparation({
      neighbors: curved.neighbors,
      size: curved.cellCount,
      generation: curvedGeneration,
      distances: DISTANCES,
      coneDepth: CONE_DEPTH,
      etaThreshold: TSIRELSON_SHARED_PAST,
    })

    // the flat {3,4,3,4} (D4 lattice), the curvature control
    const flat = d4Mesh({ side: 15 })
    const flatNeighbors = meshNeighbors(flat)
    const flatSeed = flat.cellCount >> 1
    const flatGeneration = Array.from(
      neighborDistances({
        neighbors: flatNeighbors,
        size: flat.cellCount,
        source: flatSeed,
      }),
    )

    const flatCritical = criticalSeparation({
      neighbors: flatNeighbors,
      size: flat.cellCount,
      generation: flatGeneration,
      distances: DISTANCES,
      coneDepth: CONE_DEPTH,
      etaThreshold: TSIRELSON_SHARED_PAST,
    })

    // the shared-past fractions actually resolved on each mesh
    const curvedEtas = DISTANCES.map(d =>
      curvedCritical.etaByDistance.get(d),
    ).filter((e): e is number => e !== undefined)

    const flatEtas = DISTANCES.map(d =>
      flatCritical.etaByDistance.get(d),
    ).filter((e): e is number => e !== undefined)

    const curvedMaxEta = curvedEtas.length ? Math.max(...curvedEtas) : 0
    const flatMaxEta = flatEtas.length ? Math.max(...flatEtas) : 0

    // reachable CHSH from the largest shared past each mesh offers at any separation
    const curvedReachableS = chshFromSharedPast(curvedMaxEta)
    const flatReachableS = chshFromSharedPast(flatMaxEta)

    // the alignment contingency, read at the flat mesh's smallest separation where the
    // shared past is largest: aligned settings beat the classical bound, decorrelated
    // settings (effective fraction 0) sit exactly on it
    const flatNearEta = flatCritical.etaByDistance.get(1) ?? 0
    const alignedSNear = chshFromSharedPast(flatNearEta)
    const decorrelatedS = chshFromSharedPast(0)

    // the curved fraction is smaller than the flat at EVERY resolved separation
    const curvedSharesLessEverywhere = DISTANCES.every(d => {
      const c = curvedCritical.etaByDistance.get(d)
      const f = flatCritical.etaByDistance.get(d)

      return c === undefined || f === undefined || c < f
    })

    // 1. on the genuine curved substrate the quantum value is never locally reachable:
    //    the shared past never reaches the Tsirelson threshold, so d* = 0
    const curvedNeverReachesQuantum =
      curvedCritical.dStar === 0 &&
      curvedMaxEta < TSIRELSON_SHARED_PAST &&
      curvedReachableS < TSIRELSON - 1e-9

    // 2. the flat control DOES reach the quantum value at short range (d* >= 1), the
    //    case that could have failed
    const flatReachesQuantum =
      flatCritical.dStar >= 1 && flatReachableS >= TSIRELSON - 1e-9

    // 3. the alignment contingency: aligned beats 2, decorrelated sits exactly on 2
    const alignmentContingent =
      alignedSNear > 2 && Math.abs(decorrelatedS - 2) < 1e-9

    const ok =
      curvedNeverReachesQuantum &&
      flatReachesQuantum &&
      curvedSharesLessEverywhere &&
      alignmentContingent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the genuine committed {3,4,3,4} hyperbolic tessellation the measured shared-past fraction never reaches the Tsirelson threshold at any resolvable separation, so the critical separation is zero and the reachable CHSH via the local shared-past channel (S = 2 + 2 eta) stays below the quantum value everywhere, while the flat {3,4,3,4} control reaches the quantum value at short range, the curved fraction is smaller at every separation, and decorrelating the settings returns S to exactly 2, so on the real curved substrate the local shared past cannot carry the quantum correlation',
      metrics: {
        curvedCells: curved.cellCount,
        curvedCriticalSeparation: curvedCritical.dStar,
        curvedMaxEtaTimes1000: Math.round(curvedMaxEta * 1000),
        curvedReachableSTimes1000: Math.round(curvedReachableS * 1000),
        flatCriticalSeparation: flatCritical.dStar,
        flatMaxEtaTimes1000: Math.round(flatMaxEta * 1000),
        flatReachableSTimes1000: Math.round(flatReachableS * 1000),
        tsirelsonThresholdTimes1000: Math.round(
          TSIRELSON_SHARED_PAST * 1000,
        ),
        alignedSNearTimes1000: Math.round(alignedSNear * 1000),
      },
      // CONTROL: the flat {3,4,3,4} (same coin, zero curvature) reaches the Tsirelson
      // threshold at short range, so the curved d* = 0 is the curvature, not the method;
      // and the decorrelated-settings value returns to exactly 2 (no violation).
      control: {
        flatCriticalSeparation: flatCritical.dStar,
        flatReachableSTimes1000: Math.round(flatReachableS * 1000),
        decorrelatedS,
      },
      notes:
        'L2, measured on the genuine committed substrate (buildCellGraph {3,4,3,4}, real facet-adjacency and cycles, 20k cells) with exact integer cone counts, no randomness. The map eta -> S is the cited measurement-dependence bound S = 2 + 2 eta (Hall), Tsirelson at eta = root 2 - 1; the bound is cited, not derived. Cone depth 2, the reliable regime the shallow genuine interior holds (hyperbolic volume piles up near the boundary, so 20k cells reach only a few shells, which is the curvature itself, and is why E-QTM-0033 used a radial Bethe tree for long range). Here the signature is confirmed with no tree stand-in: on the real curved substrate the shared past never reaches the quantum threshold at any resolvable separation (d* = 0), a sharper negative than the tree gave, while the flat {3,4,3,4} reaches it at d = 1. This is the dynamical/geometric companion of E-QTM-0032 (the collapse) turned into the Bell signature of E-QTM-0033 on the genuine substrate. The surviving distance-independent channel is the seed (the past boundary), not the local shared past.',
    })
  },
})
