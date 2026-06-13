// P49: the crystal is hidden and hierarchical (implications 1 and 4).
// Two claims from note/what-the-tessellation-base-means.md, made testable:
//   1. Reality can be a crystal you cannot catch from inside. A regular hyperbolic
//      crystal ({7,3}) reads the same to a local observer as a random foam (same low
//      anisotropy), while a flat lattice is instantly caught (high anisotropy). So the
//      crystal hides behind exactly the measurement that exposes a lattice.
//   4. The base is natively hierarchical and tree-like. We measure Gromov's
//      delta-hyperbolicity (the four-point thinness of triangles): a tree has delta 0,
//      a hyperbolic crystal has small bounded delta, a flat grid has delta growing with
//      size. So the crystal is tree-like and the flat lattice is not.
// Run: npx tsx code/experiment/p49-crystal-hidden-hierarchical.ts

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '@/code/tool/rng'
import { coxeterTessellation } from '@/code/substrate/coxeter'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { lattice } from '@/code/substrate/lattice'
import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function bfs(adj: ReadonlyArray<Uint32Array>, source: number, size: number): Int32Array {
  const dist = new Int32Array(size).fill(-1)
  dist[source] = 0
  let frontier = [source]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of adj[v] ?? new Uint32Array(0)) {
        if (dist[w] === -1) {
          dist[w] = (dist[v] ?? 0) + 1
          next.push(w)
        }
      }
    }
    frontier = next
  }
  return dist
}

// Gromov delta from the four-point condition, sampled. For four points, of the three
// sums of opposite-pair distances, the largest two differ by at most 2 delta.
function gromovDelta(s: Substrate, samples: number, rng: Rng): number {
  const adj = undirectedAdjacency({ substrate: s })
  const size = s.size
  let worst = 0
  for (let k = 0; k < samples; k++) {
    const pts = [rng.nextInt({ max: size }), rng.nextInt({ max: size }), rng.nextInt({ max: size }), rng.nextInt({ max: size })]
    const d = pts.map((p) => bfs(adj, p, size))
    const dij = (a: number, b: number): number => d[a]?.[pts[b]!] ?? 0
    const s1 = dij(0, 1) + dij(2, 3)
    const s2 = dij(0, 2) + dij(1, 3)
    const s3 = dij(0, 3) + dij(1, 2)
    const sorted = [s1, s2, s3].sort((a, b) => b - a)
    const delta = ((sorted[0] ?? 0) - (sorted[1] ?? 0)) / 2
    worst = Math.max(worst, delta)
  }
  return worst
}

function anisotropyOf(s: Substrate, seed: number): number {
  return lorentzIsotropy({ substrate: s, samples: 3000, rng: makeRng({ seed }) }).anisotropy
}

export function crystalHiddenHierarchical(input: { seed: number }): {
  crystalAnisotropy: number
  foamAnisotropy: number
  latticeAnisotropy: number
  indistinguishable: boolean
  crystalDelta: number
  latticeDelta: number
  crystalIsTreeLike: boolean
} {
  const crystal = coxeterTessellation({ schlafli: [7, 3], maxVertices: 1500 })
  const foam = hyperbolicGraph({ count: 1500, radius: 7, connectThreshold: 3.0, rng: makeRng({ seed: input.seed }) })
  const flat = lattice({ dimension: 2, extent: 38, signature: 'riemannian' })

  const crystalAnisotropy = anisotropyOf(crystal, input.seed + 1)
  const foamAnisotropy = anisotropyOf(foam, input.seed + 1)
  const latticeAnisotropy = anisotropyOf(flat, input.seed + 1)

  // Indistinguishable from inside: crystal and foam read alike, both unlike the lattice.
  const indistinguishable =
    Math.abs(crystalAnisotropy - foamAnisotropy) < 0.1 &&
    Math.abs(crystalAnisotropy - latticeAnisotropy) > 0.5

  const crystalDelta = gromovDelta(crystal, 150, makeRng({ seed: input.seed + 2 }))
  const latticeDelta = gromovDelta(flat, 150, makeRng({ seed: input.seed + 2 }))
  const crystalIsTreeLike = crystalDelta < 0.5 * latticeDelta

  return {
    crystalAnisotropy,
    foamAnisotropy,
    latticeAnisotropy,
    indistinguishable,
    crystalDelta,
    latticeDelta,
    crystalIsTreeLike,
  }
}

export function main(): void {
  const r = crystalHiddenHierarchical({ seed: 2 })
  console.log('P49: the crystal is hidden and hierarchical (implications 1 and 4)')
  console.log('')
  console.log('  1. Hidden from inside (Lorentz anisotropy, the test that catches a lattice):')
  console.log(`     hyperbolic crystal {7,3}: ${r.crystalAnisotropy.toFixed(3)}`)
  console.log(`     random foam (sprinkle):   ${r.foamAnisotropy.toFixed(3)}`)
  console.log(`     flat lattice:             ${r.latticeAnisotropy.toFixed(3)}`)
  console.log(`     crystal indistinguishable from the foam, both unlike the lattice: ${r.indistinguishable ? 'YES' : 'no'}`)
  console.log('')
  console.log('  4. Hierarchical and tree-like (Gromov delta-hyperbolicity, 0 = a tree):')
  console.log(`     hyperbolic crystal {7,3}: delta = ${r.crystalDelta.toFixed(1)} (small, tree-like)`)
  console.log(`     flat lattice:             delta = ${r.latticeDelta.toFixed(1)} (large, grid-like)`)
  console.log(`     the crystal is tree-like, the lattice is not: ${r.crystalIsTreeLike ? 'YES' : 'no'}`)
  console.log('')
  console.log('  So a regular hyperbolic crystal hides behind the very measurement that exposes a')
  console.log('  flat lattice, reading the same as a random foam from inside, and it is tree-like,')
  console.log('  natively hierarchical, where the flat lattice is not. Order at the foundation is')
  console.log('  undetectable from within and brings the branching hierarchy the framework wanted.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'geometry/crystal-hidden-hierarchical',
  title: 'crystal is indistinguishable from foam inside, tree-like, unlike a flat lattice',
  category: 'geometry',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = crystalHiddenHierarchical({ seed: 2 })
    const ok = r.indistinguishable && r.crystalIsTreeLike
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hyperbolic crystal reads like a random foam from inside and is tree-like with a small Gromov delta, both unlike a flat lattice',
      metrics: {
        crystalAnisotropy: r.crystalAnisotropy,
        foamAnisotropy: r.foamAnisotropy,
        latticeAnisotropy: r.latticeAnisotropy,
        crystalDelta: r.crystalDelta,
        latticeDelta: r.latticeDelta,
      },
    })
  },
})
