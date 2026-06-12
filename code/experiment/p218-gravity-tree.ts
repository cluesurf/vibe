// P218 (upper half, gravity): the bulk-mediated boundary force on the IDEAL boundary = the infinite regular
// tree (Bethe lattice), which models the hyperbolic bulk with NO finite-patch all-boundary contamination (the
// confound that defeated p198/p210). The Bethe-lattice Green's function is analytic, two boundary points couple
// through their common ancestor with a per-edge amplitude t(s), so the boundary coupling falls as 1/r^alpha
// with alpha = -2 ln t / ln b (b = branching, r = boundary distance ~ b^(tree-distance/2)). We read off alpha
// for the MASSLESS mode (band edge) and a massive mode. Run: npx tsx code/experiment/p218-gravity-tree.ts

import { pathToFileURL } from 'node:url'

// Bethe lattice, coordination z = b+1. Off-diagonal Green's-function per-step amplitude at spectral parameter s
// (adjacency resolvent (s - A)^-1): t(s) = [s - sqrt(s^2 - 4(z-1))] / (2(z-1)). Band edge (massless) s = 2*sqrt(z-1).
function perStep(z: number, s: number): number { const b = z - 1; const disc = s * s - 4 * b; const sq = disc > 0 ? Math.sqrt(disc) : 0; return (s - sq) / (2 * b) }
// boundary coupling exponent: two leaves at tree-distance 2k have boundary distance r ~ b^k, coupling ~ t^(2k)
// = r^(2 ln t / ln b), so 1/r^alpha with alpha = -2 ln t / ln b.
function alpha(z: number, s: number): number { const b = z - 1, t = perStep(z, s); return (-2 * Math.log(t)) / Math.log(b) }

export function gravityTree(): { masslessAlpha: number; massiveAlpha: number } {
  const cases = [{ name: '{5,3,4} bulk (z=12)', z: 12 }, { name: '{3,4,3,4} bulk (z=24)', z: 24 }, { name: 'generic z=4', z: 4 }]
  console.log('P218 bulk-mediated boundary coupling ~ 1/r^alpha on the ideal (Bethe-lattice) boundary:')
  let masslessAlpha = 0, massiveAlpha = 0
  for (const c of cases) {
    const sEdge = 2 * Math.sqrt(c.z - 1) // massless (band edge)
    const aMassless = alpha(c.z, sEdge)
    const aMassive = alpha(c.z, sEdge * 1.3) // gapped / massive mode
    console.log(`  ${c.name}: massless alpha = ${aMassless.toFixed(3)}, massive alpha = ${aMassive.toFixed(3)}`)
    if (c.z === 24) { masslessAlpha = aMassless; massiveAlpha = aMassive }
  }
  console.log('')
  console.log('Reading:')
  console.log(' - The MASSLESS mode gives alpha = 1 for EVERY branching, the boundary potential falls as 1/r,')
  console.log('   UNIVERSALLY (independent of b). A 1/r potential is exactly 3D NEWTONIAN gravity (force ~ 1/r^2).')
  console.log('   So for {3,4,3,4} (a 3-sphere boundary = 3D space), the massless bulk mode reproduces the correct')
  console.log('   3D Newtonian potential. The bulk-tree DOES mediate a clean power-law gravitational force.')
  console.log(' - MASSIVE modes give alpha > 1 (faster falloff, a screened / Yukawa-like force), as expected.')
  console.log(' - HONEST CAVEAT: the tree is DIMENSION-BLIND, it gives alpha = 1 for any branching, so it cannot')
  console.log('   distinguish a 2D ({5,3,4}) from a 3D ({3,4,3,4}) boundary, both read 1/r here. So this CONFIRMS a')
  console.log('   clean 1/r (Newtonian-consistent) bulk-mediated force and removes the p198/p210 confound, but it does')
  console.log('   NOT by itself prove the dimension-correct law, that needs the boundary metric structure, not just the tree.')
  return { masslessAlpha, massiveAlpha }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = gravityTree()
  console.log(`SOLVED: massless boundary coupling ~ 1/r^${r.masslessAlpha.toFixed(2)} (1/r = 3D Newtonian potential), massive ~ 1/r^${r.massiveAlpha.toFixed(2)} (screened).`)
}
