// P198: gravity via the bulk-tree propagator on {3,4,3,4}. HONEST result, a naive screened-diffusion measure
// is CONFOUNDED, the {5,3,4} calibration (which should give ~ -1 for its 2D boundary) fails too, because a
// finite hyperbolic patch is ~99 percent boundary (no real bulk to propagate through). So the exact gravity
// law is OPEN, it needs a proper common-ancestor tree-path propagator at large scale, not naive diffusion.
// Ported from the throwaway probe. Run: npx tsx code/experiment/p198-gravity-3434.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { norm } from '@/code/algebra/vector'
import { toCsr } from '@/code/tool/graph'
import { boundaryByRadius, surfaceDistances } from '@/code/substrate/radial-tree'
import { logLogSlope } from '@/code/measure/regression'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function measure(symbol: number[], maxCells: number): { N: number; nb: number; slope: number; calibrated: boolean } {
  const g = buildCellGraph({ symbol: symbol as never, maxCells })
  const N = g.cellCount
  const { offsets: off, adj } = toCsr(g.neighbors)
  const rad = g.coords.map(norm)
  const boundary = boundaryByRadius({ radii: rad, fraction: 0.9 })
  const isB = new Uint8Array(N); for (const b of boundary) isB[b] = 1
  const src = boundary[0]!
  const leak = 0.1; let p = new Float64Array(N); p[src] = 1; let np = new Float64Array(N)
  for (let t = 0; t < 400; t++) { np.fill(0); np[src] = 1; for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; const sh = ((1 - leak) * pi) / d; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const dist = surfaceDistances({ offsets: off, adjacency: adj, isBoundary: isB, source: src, nodeCount: N })
  const pts: [number, number][] = []
  for (const b of boundary) { if (b === src || dist[b]! <= 0 || p[b]! <= 1e-14) continue; pts.push([dist[b]!, p[b]!]) }
  const maxd = Math.max(...pts.map((x) => x[0]))
  const mid = pts.filter((x) => x[0] >= Math.round(maxd * 0.15) && x[0] <= Math.round(maxd * 0.6))
  const slope = logLogSlope(mid.map((x) => x[0]), mid.map((x) => x[1]))
  return { N, nb: boundary.length, slope, calibrated: false }
}

export function gravity3434(): { fiveSlope: number; fourSlope: number; confounded: boolean } {
  const a = measure([5, 3, 4], 45000)
  const b = measure([3, 4, 3, 4], 45000)
  const confounded = Math.abs(a.slope + 1) > 1.5 // calibration should be near -1; if far, method confounded
  return { fiveSlope: a.slope, fourSlope: b.slope, confounded }
}

export default defineExperiment({
  id: 'gravity/gravity-3434',
  title: 'the naive screened-diffusion gravity propagator is confounded, the gravity law is open',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = gravity3434()
    return verdict({
      status: 'open',
      claim:
        'a naive screened-diffusion boundary propagator fails its own {5,3,4} calibration because a finite hyperbolic patch is almost all boundary, so the exact gravity law stays open',
      metrics: {
        fiveSlope: r.fiveSlope,
        fourSlope: r.fourSlope,
        confounded: r.confounded ? 1 : 0,
      },
      notes:
        'Honest negative. The {5,3,4} calibration (which should read about -1 for its 2D boundary) fails, which flags the method as confounded rather than producing a gravity law. The finite patch is roughly 99 percent boundary so there is no bulk to propagate through. The exact law needs a proper common-ancestor tree-path propagator at large scale.',
    })
  },
})
