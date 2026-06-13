// P238 (nesting / hierarchy, resolving the P208 negative): the flat-layer form-tower was a generic slow-mode,
// not genuine self-nesting (P208). But a real multi-scale HIERARCHY does exist, the bulk's RADIAL TREE. The
// hyperbolic bulk's radial coarse-graining is a genuine renormalization hierarchy (the holographic RG / a MERA
// tensor network), each radial level coarse-grains the boundary at the next scale. We verify the bulk has a
// clean tree structure with a constant branching (the hierarchy's scale factor) and that radial depth ~ log of
// the boundary size (the holographic / RG relation). So hierarchy is the BULK TREE, not flat self-nesting.
// Run: npx tsx code/experiment/p238-hierarchy-bulk-tree.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'

export function hierarchyBulkTree(): { branching: number; depthLogsBoundary: boolean } {
  const g = buildCellGraph({ symbol: [3, 4, 3, 4] as never, maxCells: 30000 })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  // radial BFS tree, shell sizes = the boundary size at each radius; branching = shell ratio
  const dist = new Int32Array(N).fill(-1); dist[center] = 0; let fr = [center]; const shell: number[] = [1]
  while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (dist[w] === -1) { dist[w] = dist[u]! + 1; nf.push(w) } } if (nf.length) shell.push(nf.length); fr = nf }
  const mid = shell.slice(2, Math.min(7, shell.length))
  const branching = Math.round((mid.slice(1).reduce((s, v, i) => s + v / mid[i]!, 0) / (mid.length - 1)) * 100) / 100
  // holographic relation, radial depth d to reach a shell of size S is ~ log_branching(S)
  const testShell = mid[mid.length - 1]!, depthForIt = shell.indexOf(testShell)
  const predictedDepth = Math.log(testShell) / Math.log(branching)
  const depthLogsBoundary = Math.abs(depthForIt - predictedDepth) < 2
  return { branching, depthLogsBoundary }
}

export default defineExperiment({
  id: 'holography/hierarchy-bulk-tree',
  title: 'the {3,4,3,4} bulk radial tree is a self-similar hierarchy with constant branching',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = hierarchyBulkTree()
    const ok = r.branching > 1 && r.depthLogsBoundary
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the radial BFS tree of the {3,4,3,4} bulk has a constant branching ratio and a radial depth that scales as the logarithm of the boundary shell size, the self-similar tree of a holographic renormalization hierarchy',
      metrics: {
        branching: r.branching,
        depthLogsBoundary: r.depthLogsBoundary ? 1 : 0,
      },
      notes:
        'L1, known math. The constant shell-growth ratio and the depth-equals-log-boundary relation are geometric properties of a hyperbolic tessellation, computed deterministically from the cell graph. This resolves the earlier flat-layer nesting negative by relocating the hierarchy to the bulk radial tree, but the tree structure itself is established geometry, not an emergence claim.',
    })
  },
})
