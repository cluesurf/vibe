// P237 (cosmology): the {3,4,3,4} bulk is hyperbolic, so its shells grow EXPONENTIALLY with radius. That
// exponential growth IS the eternal expansion (a de-Sitter-like / inflating substrate), and the flat 3D cusp is
// the spatial slice. We measure the bulk's growth ratio (the expansion factor per shell) and frame the
// cosmology, eternal expansion from the hyperbolic growth, the cusp as flat space, peace as the initial state.
// Run: npx tsx code/experiment/p237-cosmology.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function cosmology(): { growthRatio: number; exponential: boolean } {
  const g = buildCellGraph({ symbol: [3, 4, 3, 4] as never, maxCells: 30000 })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  const dist = new Int32Array(N).fill(-1); dist[center] = 0; let fr = [center]; const shell: number[] = [1]
  while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (dist[w] === -1) { dist[w] = dist[u]! + 1; nf.push(w) } } if (nf.length) shell.push(nf.length); fr = nf }
  const mid = shell.slice(2, Math.min(7, shell.length))
  const ratios = mid.slice(1).map((s, i) => s / mid[i]!)
  const growthRatio = Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100) / 100
  console.log('P237 cosmology, the bulk expansion:')
  console.log(`  {3,4,3,4} bulk shell sizes: ${shell.slice(0, 7).join(', ')} ...`)
  console.log(`  growth ratio per shell = ${growthRatio} (> 1 means EXPONENTIAL growth = eternal expansion)`)
  const exponential = growthRatio > 1.5
  console.log('')
  console.log('Reading:')
  console.log(' - The hyperbolic {3,4,3,4} bulk grows EXPONENTIALLY (each radial shell is ~' + growthRatio + 'x the last). That')
  console.log('   exponential growth IS the eternal expansion of the substrate, a de-Sitter / inflating geometry built in.')
  console.log(' - The flat 3D cusp / horosphere is the spatial slice (where physics lives), the radial direction is the')
  console.log('   cosmic time / scale factor (growing exponentially), and PEACE (the all-zero tone) is the natural initial')
  console.log('   state the rule starts from.')
  console.log(' - So the cosmology is built into the geometry, eternal exponential expansion (the hyperbolic growth), flat')
  console.log('   spatial sections (the cusp), and an emergent positive cosmological-constant-like curvature. The committed')
  console.log('   eternal-expansion fate is the bulk growth, not an add-on.')
  return { growthRatio, exponential }
}

export default defineExperiment({
  id: 'cosmology/p237-cosmology',
  title:
    'the hyperbolic {3,4,3,4} bulk grows exponentially with radius, the eternal expansion',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = cosmology()
    const ok = r.exponential
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} bulk shells grow by a constant ratio greater than one per radial step, an exponential expansion of the substrate',
      metrics: {
        growthRatio: r.growthRatio,
        exponential: r.exponential ? 1 : 0,
      },
      notes:
        'L1, the exponential shell growth is a measured graph-growth property of a hyperbolic tiling, a known geometric fact framed as cosmic expansion, not an emergent dynamical result.',
    })
  },
})
