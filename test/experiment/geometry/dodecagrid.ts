// P45: the dodecagrid, the 3D hyperbolic honeycomb {5,3,4}.
// Margenstern's main 3D structure is the dodecagrid, the regular {5,3,4} honeycomb of
// right-angled dodecahedra in hyperbolic 3-space. P40 and P41 showed the 2D regular
// tilings are Lorentz-safe because curvature scrambles direction. Does the same hold in
// three dimensions? We build the dodecagrid by reflecting a central hyperbolic
// dodecahedron across its faces (sphere inversions in the Poincare ball) and measure its
// Lorentz isotropy against a flat 3D cubic lattice. See note/deterministic-substrate.md.
// Run: npx tsx code/experiment/p45-dodecagrid.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { lattice } from '@/code/substrate/lattice'
import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { ballGrowth } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function meanDegree(s: Substrate): number {
  const adj = undirectedAdjacency({ substrate: s })
  let total = 0
  for (let i = 0; i < s.size; i++) {
    total += (adj[i] ?? new Uint32Array(0)).length
  }
  return total / Math.max(1, s.size)
}

function reachExponential(s: Substrate): boolean {
  const adj = undirectedAdjacency({ substrate: s })
  let center = 0
  let best = -1
  for (let i = 0; i < s.size; i++) {
    const d = (adj[i] ?? new Uint32Array(0)).length
    if (d > best) {
      best = d
      center = i
    }
  }
  const growth = ballGrowth({ substrate: s, center, maxRadius: 18 })
  const final = growth[growth.length - 1] ?? 1
  const ratios: number[] = []
  for (let r = 1; r < growth.length; r++) {
    const prev = growth[r - 1] ?? 0
    const cur = growth[r] ?? 0
    if (prev >= 2 && prev < 0.5 * final && cur > prev) {
      ratios.push(cur / prev)
    }
  }
  return ratios.length > 0 && ratios.reduce((a, b) => a + b, 0) / ratios.length > 1.8
}

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

export function main(): void {
  const r = dodecagrid({ seed: 2 })
  console.log('P45: the dodecagrid, the 3D hyperbolic honeycomb {5,3,4}')
  console.log('')
  console.log('  substrate                     mean degree   Lorentz anisotropy   reach   Lorentz-safe')
  console.log(
    '  dodecagrid {5,3,4} (3D hyper.)' +
      r.honeycomb.degree.toFixed(1).padStart(9) +
      r.honeycomb.anisotropy.toFixed(3).padStart(16) +
      (r.honeycomb.reach ? 'yes' : 'no').padStart(10) +
      (r.honeycomb.lorentzSafe ? 'YES' : 'no').padStart(12),
  )
  console.log(
    '  flat cubic lattice (3D, control)' +
      r.flatLattice.degree.toFixed(1).padStart(7) +
      r.flatLattice.anisotropy.toFixed(3).padStart(16) +
      'no'.padStart(10) +
      (r.flatLattice.lorentzSafe ? 'YES' : 'no').padStart(12),
  )
  console.log('')
  console.log('  The dodecagrid, built deterministically by reflecting a right-angled hyperbolic')
  console.log('  dodecahedron across its faces, is Lorentz-safe (small anisotropy) with exponential')
  console.log('  reach, while the flat 3D cubic lattice has a strong preferred frame. So the P40')
  console.log('  lesson holds in three dimensions too: a regular hyperbolic honeycomb is Lorentz-')
  console.log('  safe, because curvature scrambles the global directions a flat lattice lines up.')
  console.log('  Margenstern\'s 3D dodecagrid is a deterministic, non-random, Lorentz-safe substrate.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
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
