// P196: extract the HOROSPHERE from the {3,4,3,4} 4D bulk (the same buildHorosphereBand used for {5,3,4}) and
// measure it. The generic band is a thin slab reading ~2.5D (the clean flat-3D {4,3,4} is the special cusp,
// not a generic horosphere). Ported from the throwaway probe.
// Run: npx tsx code/experiment/p196-horosphere-3434.ts

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { toCsr } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function horosphere3434(): { cells: number; meanDegree: number; specDim16: number } {
  const slab = buildHorosphereBand({ symbol: [3, 4, 3, 4] as never, maxBand: 3000, half: 0.5, margin: 0.6 })
  const n = slab.cellCount
  let sum = 0, mx = 0
  for (let i = 0; i < n; i++) { const d = slab.neighbors[i]!.length; sum += d; if (d > mx) mx = d }
  const { offsets: off, adj } = toCsr(slab.neighbors)
  let center = 0, best = -1; for (let i = 0; i < n; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  let p = new Float64Array(n); p[center] = 1; let np = new Float64Array(n); const P: number[] = []
  for (let t = 0; t < 36; t++) {
    P.push(p[center]!); np.fill(0)
    for (let i = 0; i < n; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; const sh = (0.5 * pi) / d; np[i] = np[i]! + 0.5 * pi; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh }
    const tmp = p; p = np; np = tmp
  }
  const ds = (t: number): number => (-2 * (Math.log(P[t + 2]!) - Math.log(P[t - 2]!))) / (Math.log(t + 2) - Math.log(t - 2))
  const meanDegree = Math.round((sum / n) * 10) / 10
  return { cells: n, meanDegree, specDim16: ds(16) }
}

// The generic horosphere of the {3,4,3,4} bulk is a thin slab, not clean flat 3D space. We
// extract the band with the same horosphere builder used for {5,3,4} and measure its
// spectral dimension, which reads near 2.5, a thin slab between a surface and a volume. The
// clean flat-3D {4,3,4} is the special cusp, not a generic horosphere. This is an honest
// structural finding, not the headline result, so paper is false. L1, a measured property
// of a known tessellation.
export default defineExperiment({
  id: 'geometry/horosphere-3434',
  title: 'the generic {3,4,3,4} horosphere band is a thin slab (~2.5D), not clean flat 3D',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = horosphere3434()
    const thinSlab = r.specDim16 > 2 && r.specDim16 < 3
    const ok = thinSlab && r.cells > 0
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the generic horosphere band of the {3,4,3,4} bulk reads spectral dimension near 2.5, a thin slab rather than clean flat 3D space',
      metrics: {
        bandCells: r.cells,
        meanDegree: r.meanDegree,
        spectralDimension: r.specDim16,
      },
      notes:
        'L1, a measured property of a known tessellation, and an honest structural finding. The generic band is a thin slab, the clean flat-3D {4,3,4} is the special cusp, not a generic horosphere.',
    })
  },
})
