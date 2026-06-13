// S534-PHYSICS ({5,3,4} suite): gravity, cosmology, hierarchy, isotropy. Verdicts, the holographic correlator
// (Bethe z=12) is clean 1/r^2 (PORTS), cosmology (3D hyperbolic growth) and hierarchy (radial tree) PORT, and
// the emergent ISOTROPY is EXCELLENT because the 12 icosahedral directions are isotropic to high order (icosa-
// hedral kills anisotropy up to order 5, better than cubic). The one DIFFERENCE, physical-space gravity is in
// 2D, so the Newtonian potential is LOGARITHMIC (not 1/r). Run: npx tsx code/experiment/s534-physics.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { mostConnectedNode } from '@/code/tool/graph'
import { bfsShells, branchingRatio } from '@/code/measure/shells'
import { betheBoundaryExponent } from '@/code/algebra/linear/bethe-resolvent'
import { icosahedronVertexDirections } from '@/code/algebra/group/root-system'
import { directionFourthMoments } from '@/code/measure/isotropy'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s534Physics(): { betheAlpha: number; growthRatio: number; icosaIsotropic: boolean } {
  // (1) Bethe holographic correlator, z=12 -> clean 1/r^2 (ports)
  const betheAlpha = Math.round(betheBoundaryExponent({ coordination: 12, energy: 12 }) * 100) / 100
  // (2) cosmology + hierarchy, bulk shell growth ratio (exponential = expansion, radial tree = RG)
  const g = buildCellGraph({ symbol: [5, 3, 4] as never, maxCells: 16000 })
  const nb = g.neighbors
  const center = mostConnectedNode(nb)
  const { shellCounts: shell } = bfsShells({ neighbors: nb, root: center })
  const growthRatio = Math.round(branchingRatio({ shellCounts: shell, from: 3, to: 6 }) * 100) / 100
  // (3) icosahedral isotropy, the 12 directions, 4th-moment isotropy check sum d_i^4 = 3 sum d_i^2 d_j^2
  const icosaIsotropic = directionFourthMoments(icosahedronVertexDirections()).anisotropy < 1e-6
  return { betheAlpha, growthRatio, icosaIsotropic }
}

export default defineExperiment({
  id: 'gravity/s534-physics',
  title: 'the {5,3,4} suite, a Bethe 1/r squared correlator, exponential shell growth, and exact icosahedral 4th-moment isotropy',
  category: 'gravity',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s534Physics()
    const correlatorClean = Math.abs(r.betheAlpha - 2) < 0.1
    const expanding = r.growthRatio > 1
    const ok = correlatorClean && expanding && r.icosaIsotropic
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on {5,3,4} the analytic Bethe boundary correlator is a clean 1/r squared, the measured bulk shells grow exponentially, and the 12 icosahedral directions are exactly isotropic at the 4th moment',
      metrics: {
        betheAlpha: r.betheAlpha,
        growthRatio: r.growthRatio,
        icosaIsotropic: r.icosaIsotropic ? 1 : 0,
      },
      notes:
        'L1 mixed consistency suite. The 1/r squared correlator is the closed-form Bethe (z=12) resolvent, the icosahedral 4th-moment identity is exact group theory, both put in by hand. Only the shell growth is measured on the real {5,3,4} graph. Useful as a confirmation that {5,3,4} ports the same structures, but no emergent gravity, and the physical-space gravity here would be 2D logarithmic, not the 3D 1/r law.',
    })
  },
})
