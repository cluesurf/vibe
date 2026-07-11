// Navigating the bulk is moving through renormalization scale. The substrate's hyperbolic bulk
// grows exponentially outward (the {3,4,3,4} warp factor is exactly this exponential growth), so
// coarsely the bulk is a balanced tree of branching b with the boundary as its leaves, the
// physical fine layer, and the root the coarsest cell. A route between two boundary cells goes up
// to their common ancestor and back down, and the depth that common ancestor sits below the
// boundary is the coarse-graining level at which the two cells first become one: the
// renormalization scale where they merge. Because the tree is exponential, that depth is the
// logarithm of the boundary separation, so the bulk depth a route reaches equals log of the
// separation, the holographic identity bulk-depth = RG-scale as an exact routing law.
//
// Measured on the bulk tree of branching three: the bulk penetration of the route between boundary
// cell zero and boundary cell s is exactly the floor of log base three of s plus one at every
// separation across a wide sweep, so it increments by exactly one each time the separation
// multiplies by the branching (each renormalization step doubles the coarse-graining, the
// self-similar ladder), and the route length is exactly twice the penetration (the geodesic dives
// to the merge depth and climbs back). This is a logarithmic law: separation two hundred forty
// three routes through depth six.
//
// The control is the flat chain of the same boundary cells, which has no bulk: the route between
// cells at separation s is s hops, linear, so the tree-to-chain route ratio grows without bound
// (twenty-fold at separation two hundred forty three and rising), the logarithmic compression that
// only the bulk provides. So depth-as-scale and the logarithmic shortcut are properties of the
// exponential bulk, absent from flat locality.
//
// Depth L2. It establishes the exact logarithmic depth-versus-separation routing law on the
// exponential bulk (penetration = floor log_b separation + 1, route = twice that) against the
// linear flat-chain control, the holographic bulk-depth-is-renormalization-scale statement made a
// measured law. Known hyperbolic-tree mathematics, read as the RG-scale map.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  bulkPenetration,
  treeRouteLength,
  chainRouteLength,
} from '@/code/measure/bulk-routing'

const BRANCHING = 3
const DEPTH = 9
const SEPARATIONS = [2, 3, 4, 8, 9, 27, 81, 243]

export default experiment({
  id: 'addressing/routing-depth-is-scale',
  code: 'E-NVG-0008',
  title:
    'the bulk depth a route reaches equals the logarithm of the boundary separation (penetration = floor log_b s + 1, route = twice that, incrementing by one per branching factor), the holographic depth-is-RG-scale law, while a flat chain routes linearly',
  category: 'addressing',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the exact logarithmic depth law, at every separation
    let worstLawError = 0

    for (const s of SEPARATIONS) {
      const penetration = bulkPenetration({
        leafA: 0,
        leafB: s,
        branching: BRANCHING,
        depth: DEPTH,
      })

      const predicted =
        Math.floor(Math.log(s) / Math.log(BRANCHING)) + 1

      worstLawError = Math.max(
        worstLawError,
        Math.abs(penetration - predicted),
      )
    }

    // one renormalization step per branching factor: penetration increments by exactly one
    // between s = b^k and s = b^(k+1)
    let stepConstant = true

    for (let k = 1; k <= 4; k++) {
      const lower = bulkPenetration({
        leafA: 0,
        leafB: BRANCHING ** k,
        branching: BRANCHING,
        depth: DEPTH,
      })

      const upper = bulkPenetration({
        leafA: 0,
        leafB: BRANCHING ** (k + 1),
        branching: BRANCHING,
        depth: DEPTH,
      })

      if (upper - lower !== 1) stepConstant = false
    }

    // the route is exactly twice the penetration (dive and climb)
    let routeIsTwicePenetration = true

    for (const s of SEPARATIONS) {
      const penetration = bulkPenetration({
        leafA: 0,
        leafB: s,
        branching: BRANCHING,
        depth: DEPTH,
      })

      const route = treeRouteLength({
        leafA: 0,
        leafB: s,
        branching: BRANCHING,
        depth: DEPTH,
      })

      if (route !== 2 * penetration) routeIsTwicePenetration = false
    }

    // CONTROL: the flat chain routes linearly, so the compression ratio grows without bound
    const farSeparation = 243
    const treeRoute = treeRouteLength({
      leafA: 0,
      leafB: farSeparation,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const chainRoute = chainRouteLength(farSeparation)
    const compression = chainRoute / treeRoute

    const lawExact = worstLawError === 0
    const chainLinear = chainRoute === farSeparation
    const compresses = compression > 15

    const ok =
      lawExact &&
      stepConstant &&
      routeIsTwicePenetration &&
      chainLinear &&
      compresses

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the exponential bulk tree of branching three the bulk penetration of the route between boundary cell zero and boundary cell s equals the floor of log base three of s plus one exactly at every separation across the sweep (a logarithmic depth-versus-separation law), incrementing by exactly one each time the separation multiplies by the branching (one renormalization step per factor, the self-similar coarse-graining ladder), with the route length exactly twice the penetration (the geodesic dives to the merge depth and climbs back), so the bulk depth a route reaches is the renormalization scale at which the two boundary cells merge, the holographic depth-is-scale identity as a measured routing law, while the flat chain of the same boundary cells routes in linear separation so the tree-to-chain compression exceeds twenty-fold at separation two hundred forty three and grows without bound, the logarithmic shortcut being a property of the exponential bulk only',
      metrics: {
        worstLawError,
        penetrationStepPerBranching: stepConstant ? 1 : 0,
        treeRouteAt243: treeRoute,
        chainRouteAt243: chainRoute,
        compressionRatio: Number(compression.toFixed(1)),
      },
      // CONTROL: the flat chain routes linearly, no logarithmic bulk shortcut.
      control: { chainRouteAt243: chainRoute },
      notes:
        'Bulk depth is renormalization scale (the holographic RG statement) as an exact routing law on the exponential bulk. Complements greedy hyperbolic routing (E-NVG-0003) with the depth-scaling reading, and the bulk shortcut for Bell reach (E-QTM-0035).',
    })
  },
})
