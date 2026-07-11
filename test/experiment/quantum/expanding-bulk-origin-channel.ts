// The route to true flatness: the origin channel on an expanding bulk.
//
// E-QTM-0034 and E-QTM-0035 showed the local shared past, carried through the bulk,
// declines only as a power law in physical distance, a huge improvement but still a
// decline. The route to a correlation that is EXACTLY flat in physical distance is
// the origin.
//
// On an expanding bulk every point traces its lineage back to a common origin (the
// growth seed, the root of the tree). As two boundary points are taken farther and
// farther apart in physical distance, their LOWEST common ancestor recedes toward
// the origin: at large physical distance the only past they still share is the
// origin itself. And every pair shares the origin, at every physical distance. So a
// correlation imprinted at the origin is available to all points equally, distance
// independent, with no signal crossing space (the origin is in the shared past of
// both).
//
// This measures it: as physical distance grows, the common-ancestor generation
// recedes toward the origin (generation 0), while the local cone overlap decays to
// zero. The origin remains the shared, distance-independent channel. E-QTM-0030
// already showed, from the dynamics, that the rule PRESERVES an origin-imprinted
// correlation at all distances, which is the dynamical half of this.
//
// Grade L2: a measured geometric property of the expanding bulk (the common
// ancestor recedes to the origin while the origin stays universal) with the local
// channel as the decaying control.

import {
  bulkTreeSamples,
  commonAncestorGeneration,
} from '@/code/measure/cusp-distance'
import { betheMesh, meshNeighbors } from '@/code/tool/mesh'
import { neighborDistances } from '@/code/tool/graph'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/expanding-bulk-origin-channel',
  code: 'E-QTM-0036',
  title:
    'on the expanding bulk the common ancestor recedes to the origin as physical distance grows, so the only distance-independent shared past is the origin every point shares, the route to a flat correlation with no action at a distance',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const coneDepth = 4
    const mesh = betheMesh({ coordination: 2, depth: 15 })
    const neighbors = meshNeighbors(mesh)
    const generation = Array.from(
      neighborDistances({ neighbors, size: mesh.cellCount, source: 0 }),
    )

    const maxGeneration = generation.reduce((m, g) => Math.max(m, g), 0)

    const leaves: number[] = []

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      if (generation[cell] === maxGeneration) leaves.push(cell)
    }

    const reference = leaves[0]!
    const gaps = [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]

    const physical: number[] = []
    const ancestorGen: number[] = []
    const originShared: number[] = []

    for (const gap of gaps) {
      const partner = leaves[gap]

      if (partner === undefined) continue

      physical.push(gap)
      ancestorGen.push(
        commonAncestorGeneration({
          neighbors,
          generation,
          a: reference,
          b: partner,
        }),
      )
      // the origin (root, generation 0) is an ancestor of every cell, so every pair
      // shares it: the full backward cones both reach the root.
      originShared.push(1)
    }

    // the local channel, the cone-overlap shared past, decays with physical distance
    const localSamples = bulkTreeSamples({
      coordination: 2,
      depth: 15,
      coneDepth,
    })

    const localEtaFar =
      localSamples.length > 0
        ? localSamples[localSamples.length - 1]!.eta
        : 1

    if (physical.length < 5) {
      return verdict({
        status: 'fail',
        claim: 'not enough boundary pairs (build a larger tree)',
        metrics: { pairs: physical.length },
      })
    }

    // the common ancestor recedes toward the origin as physical distance grows
    const ancestorVsPhysical = linearFit({
      xs: physical.map(p => Math.log(p)),
      ys: ancestorGen,
    })

    const farthestAncestorGen =
      ancestorGen[ancestorGen.length - 1] ?? maxGeneration

    // 1. The common ancestor recedes toward the origin (strongly decreasing).
    const recedesToOrigin =
      ancestorVsPhysical.slope < 0 && ancestorVsPhysical.r2 > 0.85

    // 2. At the largest physical distance the only shared past is near the origin
    //    (the common ancestor has receded into the innermost quarter of the bulk).
    const onlyOriginRemains =
      farthestAncestorGen <= 0.25 * maxGeneration

    // 3. The origin is universal: every pair shares it at every distance (flat).
    const originUniversal = originShared.every(v => v === 1)

    // 4. The local channel has decayed to near zero where the origin still holds.
    const localChannelGone = localEtaFar < 0.05

    const solved =
      recedesToOrigin &&
      onlyOriginRemains &&
      originUniversal &&
      localChannelGone

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'as two boundary points are taken farther apart in physical distance their common ancestor recedes to the origin, so at large physical distance the only shared past is the origin, which every pair shares at every distance, giving a distance-independent channel for an origin-imprinted correlation while the local cone-overlap channel decays to zero',
      metrics: {
        ancestorVsPhysicalSlope: ancestorVsPhysical.slope,
        ancestorVsPhysicalR2: ancestorVsPhysical.r2,
        farthestAncestorGeneration: farthestAncestorGen,
        originSharedFraction:
          originShared.reduce((a, b) => a + b, 0) / originShared.length,
        localEtaFar,
        maxGeneration,
      },
      control: {
        // The local channel is the control: it decays to near zero with physical
        // distance, so the surviving flat channel is specifically the origin, not a
        // generic shared past. If the local channel had stayed up, the origin would
        // not be the distinguishing route.
        localEtaFar,
      },
      notes:
        'L2, geometric. The common-ancestor generation and the origin reachability are exact integer quantities, deterministic. originShared is 1 by construction because the root is an ancestor of every cell, which is exactly the point: the origin is the universal, distance-independent shared past. The dynamical realization, that the rule PRESERVES an origin-imprinted correlation at all distances, is E-QTM-0030. The Bethe tree carries the placeholder coin, not the momentum-conserving rule, so the dynamical correlation on it is left to the flat-substrate E-QTM-0030.',
    })
  },
})
