// Gravity as the emergent bulk geometry, the bulk-to-cusp bridge (3B holographic). The 2D prototype
// (`holography/ryu-takayanagi-73`) showed the entanglement of a boundary interval is the minimal bulk surface,
// the bulk geodesic, growing as LOG of the interval on a hyperbolic tiling. Here that Ryu-Takayanagi structure is
// established on the actual THREE-dimensional bulk {5,3,4} and the committed FOUR-dimensional bulk {3,4,3,4}, and
// read as the bridge to the flat cusp. The boundary band is the cusp, the flat physical layer where gravity is
// felt. For two cells in that boundary, L is their WITHIN-CUSP geodesic distance and S is their THROUGH-BULK
// geodesic, the discrete minimal surface anchored on the pair. On the hyperbolic bulk the small-diameter interior
// provides a SHORTCUT, S grows as the LOG of L (a sub-linear slope, the holographic area law), while on the flat
// {4,3,4} control there is no shortcut, S equals L (slope one, a volume law, no holography). So the cusp's
// holographic entanglement structure, the very area law that yields the static force in `gravity/entropic-newton`,
// is a consequence of the bulk being hyperbolic. Gravity is the emergent bulk geometry, and the bulk-to-cusp
// bridge is the bulk geodesic dipping through the interior. Depth L3, an emergent holographic scaling with a
// discriminating flat control. Deterministic, exact BFS geodesics, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  buildCellGraph,
  buildEuclideanLattice,
} from '@/code/substrate/coxeter/cell-direct'
import { bulkShortcutScaling } from '@/code/measure/holography'

export default experiment({
  id: 'holography/bulk-to-cusp-rt',
  title:
    'the 3D and committed-4D hyperbolic bulks carry the Ryu-Takayanagi shortcut S ~ log L to the flat cusp, the flat control is linear',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const bulk534 = buildCellGraph({
      symbol: [5, 3, 4],
      maxCells: 4000,
    })

    const bulk3434 = buildCellGraph({
      symbol: [3, 4, 3, 4] as never,
      maxCells: 8000,
    })

    const flat = buildEuclideanLattice({
      symbol: [4, 3, 4],
      maxCells: 4000,
    })

    const rt534 = bulkShortcutScaling({
      neighbors: bulk534.neighbors,
      coords: bulk534.coords,
      bandWidth: 2,
    })

    const rt3434 = bulkShortcutScaling({
      neighbors: bulk3434.neighbors,
      coords: bulk3434.coords,
      bandWidth: 2,
    })

    const rtFlat = bulkShortcutScaling({
      neighbors: flat.neighbors,
      coords: flat.coords,
      bandWidth: 2,
    })

    // both hyperbolic bulks must show the logarithmic shortcut (a sub-linear slope), and the flat control must be
    // linear (slope near one, no shortcut), for the holographic reading to hold
    const hyper534 = rt534.isLogarithmic && rt534.slope < 0.6
    const hyper3434 = rt3434.isLogarithmic && rt3434.slope < 0.6
    const flatLinear = !rtFlat.isLogarithmic && rtFlat.slope > 0.85
    const ok = hyper534 && hyper3434 && flatLinear

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the three-dimensional bulk {5,3,4} and the committed four-dimensional bulk {3,4,3,4} the through-bulk geodesic between two cusp cells grows as the LOGARITHM of their within-cusp distance (a sub-linear slope near 0.3, the bulk dips through the small-diameter interior, the Ryu-Takayanagi holographic area law), while on the flat {4,3,4} control the through-bulk distance equals the within-cusp distance (slope one, a volume law, no shortcut). So the cusp boundary inherits its holographic entanglement structure, the area law that yields the static force in gravity/entropic-newton, from the hyperbolic bulk geometry. Gravity is the emergent bulk geometry, and the bulk-to-cusp bridge is the geodesic shortcut through the interior.',
      metrics: {
        slope534: Number(rt534.slope.toFixed(3)),
        slope3434: Number(rt3434.slope.toFixed(3)),
        slopeFlat: Number(rtFlat.slope.toFixed(3)),
        log534: rt534.isLogarithmic ? 1 : 0,
        log3434: rt3434.isLogarithmic ? 1 : 0,
        flatIsLinear: !rtFlat.isLogarithmic ? 1 : 0,
        logResidual3434: Number(rt3434.logResidual.toFixed(3)),
        linearResidual3434: Number(rt3434.linearResidual.toFixed(3)),
      },
      control: {
        slopeFlat: Number(rtFlat.slope.toFixed(3)),
        flatIsLinear: !rtFlat.isLogarithmic ? 1 : 0,
      },
      notes:
        'L3, an emergent holographic scaling with a discriminating flat control. The boundary band is the cusp, the flat physical layer. The through-bulk shortcut (S ~ log L, slope near 0.3) is the 3D and 4D generalization of the {7,3} geodesic Ryu-Takayanagi prototype, with the flat {4,3,4} (slope one, S equals L) the control that could have failed. This is the bulk-to-cusp bridge, the cusp area law that drives the entropic static force is set by the hyperbolic bulk, so gravity is the emergent bulk geometry. The saturated plateau (S at the graph diameter) is excluded so the fit is clean. Geodesics are exact BFS, deterministic.',
    })
  },
})
