// H02 on {7,3} (Ryu-Takayanagi, prototyped on the cheapest holographic substrate, the heptagrid): the
// entanglement entropy of a boundary interval equals the length of the minimal bulk surface anchored on
// it. In the 2D {7,3} bulk that surface is the bulk GEODESIC between the interval's two endpoints. We
// measure its length as the boundary interval grows.
//
//   - {7,3} HYPERBOLIC: the geodesic dips into the negatively curved bulk and its length grows as LOG of
//     the interval, the 2D CFT area law S ~ (c/3) log L. The holographic signature.
//   - {6,3} FLAT control: the minimal path hugs the boundary and grows LINEARLY with the interval, a
//     volume law. No holography. This is the control that could have failed, if the curved case also grew
//     linearly there would be no Ryu-Takayanagi structure.
//
// The 1D boundary of the 2D bulk makes this the cleanest possible Ryu-Takayanagi test, the prototype for
// the same measurement on the 3D {5,3,4} bulk (needed-534). Deterministic, no randomness.

import { buildCellGraph, buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import { ryuTakayanagiScaling } from '@/code/measure/holography'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function ryuTakayanagi73(): {
  hyperbolicLogResidual: number
  hyperbolicLinearResidual: number
  hyperbolicIsLog: boolean
  flatLogResidual: number
  flatLinearResidual: number
  flatIsLinear: boolean
} {
  const hyperbolic = buildCellGraph({ symbol: [7, 3], maxCells: 3000 })
  const rtHyperbolic = ryuTakayanagiScaling({ neighbors: hyperbolic.neighbors, coords: hyperbolic.coords })

  const flat = buildEuclideanLattice({ symbol: [6, 3], maxCells: 3000 })
  const rtFlat = ryuTakayanagiScaling({ neighbors: flat.neighbors, coords: flat.coords })

  return {
    hyperbolicLogResidual: rtHyperbolic.logResidual,
    hyperbolicLinearResidual: rtHyperbolic.linearResidual,
    hyperbolicIsLog: rtHyperbolic.isLogarithmic,
    flatLogResidual: rtFlat.logResidual,
    flatLinearResidual: rtFlat.linearResidual,
    flatIsLinear: !rtFlat.isLogarithmic,
  }
}

export default experiment({
  id: 'holography/ryu-takayanagi-73',
  title: 'on {7,3} the boundary-interval entanglement follows the logarithmic Ryu-Takayanagi law, while the flat control is linear',
  category: 'holography',
  substrates: ['73'],
  depth: 'L3',
  paper: true,
  run() {
    const r = ryuTakayanagi73()
    // the curved bulk must be logarithmic AND the flat control must be linear, both, for the holographic
    // reading to hold. Either alone is not enough.
    const ok = r.hyperbolicIsLog && r.flatIsLinear
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the minimal bulk geodesic anchored on a boundary interval of the {7,3} hyperbolic tiling grows as the LOGARITHM of the interval length, the 2D Ryu-Takayanagi area law, while on the flat {6,3} tiling the same quantity grows LINEARLY, so the holographic entanglement scaling is a property of the negative curvature and not of any tiling',
      metrics: {
        hyperbolicLogResidual: r.hyperbolicLogResidual,
        hyperbolicLinearResidual: r.hyperbolicLinearResidual,
        flatLogResidual: r.flatLogResidual,
        flatLinearResidual: r.flatLinearResidual,
        hyperbolicIsLog: r.hyperbolicIsLog ? 1 : 0,
        flatIsLinear: r.flatIsLinear ? 1 : 0,
      },
      control: {
        // the FLAT {6,3} tiling: the same geodesic-versus-interval measurement is LINEAR, not logarithmic.
        // The negative curvature is what produces the Ryu-Takayanagi log law.
        flatIsLinear: r.flatIsLinear ? 1 : 0,
        flatLinearResidual: r.flatLinearResidual,
      },
      notes:
        'L3, an emergent holographic scaling with a discriminating flat control. The Ryu-Takayanagi minimal surface in the 2D bulk is the boundary-anchored geodesic, and its LOG growth on {7,3} versus LINEAR on flat {6,3} is the 2D CFT entanglement area law read off the substrate. The 1D boundary makes the heptagrid the cleanest Ryu-Takayanagi testbed, this prototypes the same measurement for the 3D {5,3,4} bulk. Geodesics are exact BFS shortest paths, averaged over boundary positions, deterministic. Reuses code/measure/holography.',
    })
  },
})
