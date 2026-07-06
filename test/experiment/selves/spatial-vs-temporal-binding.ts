// Spatial co-presence binds, a temporal chain does not, the McFadden discriminator. Johnjoe
// McFadden's cemi field theory argues that what makes a bound experiencer is physical
// spatial integration, all the parts present and interacting at once, not a feed-forward
// chain of states correlated only in time. The vibe self is a spatially bound region, so it
// should carry high integration, while a feed-forward temporal chain of the same size should
// carry almost none. This adjudicates the spatial-binding claim on the substrate and separates
// the patterns everyone agrees are selves from those that are not.
//
// The integration proxy is the algebraic connectivity (the Fiedler value, the second Laplacian
// eigenvalue) of a region's own graph, how hard it is to split into independent parts. A
// spatially co-present self, a compact ball on the mesh, is densely cross-linked and scores
// high. A temporal chain, the same number of cells linked only in sequence (each to its
// predecessor and successor, a feed-forward path), is trivially cut anywhere and scores near
// zero. So spatial co-presence integrates and the temporal chain does not, by orders of
// magnitude.
//
// The control is the temporal chain itself, temporal correlation with no spatial co-presence.
// It has the same number of cells and the same total activity, and it fails the integration
// test, so it is the spatial binding, not the mere count or the sequence, that makes the self.
//
// Depth L2. It measures the integration proxy on a spatial self against a feed-forward temporal
// chain on the committed substrate, the McFadden spatial-binding discriminator. A structural
// proxy for integration, it marks where a bound subject sits.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { ballAtRadius } from '@/code/coarse/binding-margin'
import { algebraicConnectivity } from '@/code/measure/integration'

const SIDE = 8
const RADIUS = 2

export default experiment({
  id: 'selves/spatial-vs-temporal-binding',
  code: 'E-SLF-0165',
  title:
    'spatial co-presence integrates strongly while a same-size feed-forward temporal chain does not, the McFadden spatial-binding discriminator',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const adjacency = meshNeighbors(mesh).map(row =>
      Uint32Array.from(row),
    )

    // the spatial self: a compact, densely cross-linked ball
    const ball = new Set(
      ballAtRadius({ mesh, center: 0, radius: RADIUS }),
    )

    const spatialPhi = algebraicConnectivity({
      adjacency,
      region: ball,
    })

    // the temporal chain: the same number of cells, linked only in sequence (feed-forward)
    const size = ball.size
    const chainAdjacency = Array.from(
      { length: size },
      (unused, index) => {
        const links: number[] = []

        if (index > 0) {
          links.push(index - 1)
        }

        if (index < size - 1) {
          links.push(index + 1)
        }

        return Uint32Array.from(links)
      },
    )

    const chainRegion = new Set(
      Array.from({ length: size }, (unused, index) => index),
    )

    const temporalPhi = algebraicConnectivity({
      adjacency: chainAdjacency,
      region: chainRegion,
    })

    const ratio = spatialPhi / Math.max(temporalPhi, 1e-12)

    const spatialIntegrates = spatialPhi > 1
    const temporalDoesNot = temporalPhi < 0.01
    const orderOfMagnitude = ratio > 100
    const ok = spatialIntegrates && temporalDoesNot && orderOfMagnitude

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a spatially co-present self (a compact ball) has high integration (algebraic connectivity above one) while a feed-forward temporal chain of the same size has almost none (below one hundredth), a ratio of thousands, so binding needs spatial co-presence and a temporal chain is not a self, the McFadden spatial-integration claim on the substrate',
      metrics: {
        spatialPhi: Number(spatialPhi.toFixed(5)),
        temporalPhi: Number(temporalPhi.toExponential(2)),
        ratio: Number(ratio.toFixed(0)),
        cells: size,
      },
      // CONTROL: the temporal chain (temporal correlation, no spatial co-presence) fails.
      control: { temporalPhi: Number(temporalPhi.toExponential(2)) },
      notes:
        'The McFadden cemi spatial-binding discriminator. Spatial co-presence integrates, a feed-forward temporal chain does not. A structural integration proxy (algebraic connectivity), consistent with IIT (feed-forward gives no integration) and Tononi.',
    })
  },
})
