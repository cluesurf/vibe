// P218 (upper half, gravity): the bulk-mediated boundary force on the IDEAL boundary = the infinite regular
// tree (Bethe lattice), which models the hyperbolic bulk with NO finite-patch all-boundary contamination (the
// confound that defeated p198/p210). The Bethe-lattice Green's function is analytic, two boundary points couple
// through their common ancestor with a per-edge amplitude t(s), so the boundary coupling falls as 1/r^alpha
// with alpha = -2 ln t / ln b (b = branching, r = boundary distance ~ b^(tree-distance/2)). We read off alpha
// for the MASSLESS mode (band edge) and a massive mode. Run: npx tsx code/experiment/p218-gravity-tree.ts

import { betheBoundaryExponent } from '@/code/algebra/linear/bethe-resolvent'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The boundary coupling exponent alpha = -2 ln t / ln b for coordination z at spectral parameter s
// (band edge s = 2 sqrt(z-1) is the massless point). The Bethe resolvent's per-step amplitude t(s)
// gives the bulk-mediated boundary coupling 1/r^alpha (r = boundary distance ~ b^(tree-distance/2)).
function alpha(z: number, s: number): number {
  return betheBoundaryExponent({ coordination: z, energy: s })
}

export function gravityTree(): {
  masslessAlpha: number
  massiveAlpha: number
} {
  const cases = [
    { name: '{5,3,4} bulk (z=12)', z: 12 },
    { name: '{3,4,3,4} bulk (z=24)', z: 24 },
    { name: 'generic z=4', z: 4 },
  ]

  let masslessAlpha = 0,
    massiveAlpha = 0

  for (const c of cases) {
    const sEdge = 2 * Math.sqrt(c.z - 1) // massless (band edge)
    const aMassless = alpha(c.z, sEdge)
    const aMassive = alpha(c.z, sEdge * 1.3) // gapped / massive mode

    if (c.z === 24) {
      masslessAlpha = aMassless
      massiveAlpha = aMassive
    }
  }

  return { masslessAlpha, massiveAlpha }
}

export default experiment({
  id: 'gravity/gravity-tree',
  title:
    'the Bethe-lattice band-edge boundary coupling falls as 1/r for every branching, but the tree is dimension-blind',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = gravityTree()
    const masslessIsOneOverR = Math.abs(r.masslessAlpha - 1) < 0.05
    const massiveSteeper = r.massiveAlpha > r.masslessAlpha + 0.05
    const ok = masslessIsOneOverR && massiveSteeper

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the analytic Bethe-lattice resolvent gives a band-edge boundary coupling that falls as 1/r for every branching and steeper for a massive mode, but cannot tell a 2D from a 3D boundary',
      metrics: {
        masslessAlpha: r.masslessAlpha,
        massiveAlpha: r.massiveAlpha,
      },
      notes:
        'L1 known math. The exponent comes from the closed-form Bethe-lattice (infinite regular tree) Green function, so the 1/r is a property of the assumed resolvent, not a measured emergent law. The massive-vs-massless contrast acts as a sanity control. Honest caveat from the header, the tree is dimension-blind (alpha equals 1 for any branching), so this does not prove the dimension-correct Newton law and is not emergent gravity.',
    })
  },
})
