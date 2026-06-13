// P45: the dodecagrid, the 3D hyperbolic honeycomb {5,3,4}.
// Margenstern's main 3D structure is the dodecagrid, the regular {5,3,4} honeycomb of
// right-angled dodecahedra in hyperbolic 3-space. P40 and P41 showed the 2D regular
// tilings are Lorentz-safe because curvature scrambles direction. Does the same hold in
// three dimensions? We build the dodecagrid by reflecting a central hyperbolic
// dodecahedron across its faces (sphere inversions in the Poincare ball) and measure its
// Lorentz isotropy against a flat 3D cubic lattice. See note/deterministic-substrate.md.
// Run: npx tsx code/experiment/p45-dodecagrid.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { lattice } from '@/code/substrate/lattice'
import { Substrate, substrateUndirectedMeanDegree } from '@/code/tool/substrate'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { reachIsExponential } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const meanDegree = (s: Substrate): number => substrateUndirectedMeanDegree({ substrate: s })

// The exponential-reach classifier lives in code/measure/dimension.
const reachExponential = (s: Substrate): boolean => reachIsExponential({ substrate: s, maxRadius: 18 })

export function dodecagrid(input: { seed: number }): {
  honeycomb: { size: number; degree: number; anisotropy: number; reach: boolean; lorentzSafe: boolean }
  flatLattice: { degree: number; anisotropy: number; lorentzSafe: boolean }
} {
  const g = hyperbolicDodecagrid({ depth: 4, connectThreshold: 2.0, maxVertices: 3000 })
  const ga = lorentzIsotropy({ substrate: g, samples: 3000, rng: makeRng({ seed: input.seed }) })

  const L = lattice({ dimension: 3, extent: 14, signature: 'riemannian' })
  const la = lorentzIsotropy({ substrate: L, samples: 3000, rng: makeRng({ seed: input.seed }) })

  return {
    honeycomb: {
      size: g.size,
      degree: meanDegree(g),
      anisotropy: ga.anisotropy,
      reach: reachExponential(g),
      lorentzSafe: ga.anisotropy < 0.25,
    },
    flatLattice: {
      degree: meanDegree(L),
      anisotropy: la.anisotropy,
      lorentzSafe: la.anisotropy < 0.25,
    },
  }
}

export default defineExperiment({
  id: 'geometry/dodecagrid',
  title: 'the 3D hyperbolic honeycomb {5,3,4} is Lorentz-safe, a flat cubic lattice is not',
  category: 'geometry',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = dodecagrid({ seed: 2 })
    const ok =
      r.honeycomb.lorentzSafe &&
      r.honeycomb.anisotropy < 0.2 &&
      r.honeycomb.reach &&
      r.flatLattice.lorentzSafe === false
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {5,3,4} honeycomb scrambles direction in 3D so it is Lorentz-safe while a flat cubic lattice keeps preferred axes',
      metrics: {
        honeycombAnisotropy: r.honeycomb.anisotropy,
        flatLatticeAnisotropy: r.flatLattice.anisotropy,
      },
    })
  },
})
