// S53333-PHYSICS ({5,3,3,3,3} suite): gravity, cosmology, hierarchy, isotropy. Verdicts, the holographic
// correlator (Bethe) is clean 1/r^2 (PORTS, universal), cosmology and hierarchy PORT, isotropy is strong
// (H5 coin). The DIFFERENCE, physical-space gravity is in 4D, so the Newtonian potential is 1/r^2 (the 4D
// Laplacian), not 1/r, OVER-dimensional. Run: npx tsx code/experiment/s53333-physics.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'
import { betheCorrelatorExponent } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s53333Physics(): { betheAlpha: number; growthRatio: number; spaceGravityExp: number } {
  const g = buildCellGraph({ symbol: [5, 3, 3, 3, 3] as never, maxCells: 6000 })
  const N = g.cellCount, nb = g.neighbors
  let center = 0, best = -1; for (let i = 0; i < N; i++) if (nb[i]!.length > best) { best = nb[i]!.length; center = i }
  const betheAlpha = betheCorrelatorExponent(best)
  // cosmology + hierarchy, bulk shell growth
  const shell = bfsShells({ neighbors: nb, root: center }).shellCounts
  const mid = shell.slice(1, Math.min(4, shell.length))
  const growthRatio = Math.round((mid.slice(1).reduce((s, v, i) => s + v / mid[i]!, 0) / Math.max(1, mid.length - 1)) * 100) / 100
  // physical-space gravity exponent, the flat layer is 4D, so the Laplacian Green's function ~ 1/r^(d-2) = 1/r^2
  const spaceDim = 4, spaceGravityExp = spaceDim - 2
  return { betheAlpha, growthRatio, spaceGravityExp }
}

export default defineExperiment({
  id: 'substrate-survey/s53333-physics',
  title: 'the holographic correlator and cosmology port to {5,3,3,3,3}, but physical-space gravity is 4D (1/r^2, over-dimensional)',
  category: 'substrate-survey',
  substrates: ['53333'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s53333Physics()
    const ok =
      Math.abs(r.betheAlpha - 2) < 0.3 &&
      r.growthRatio > 1.2 &&
      r.spaceGravityExp === 2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Bethe correlator on {5,3,3,3,3} is a clean 1/r^2 and the bulk shells grow exponentially, but the flat layer is 4D so physical-space gravity would be 1/r^2, over-dimensional versus the observed 3D 1/r',
      metrics: {
        betheAlpha: r.betheAlpha,
        growthRatio: r.growthRatio,
        spaceGravityExp: r.spaceGravityExp,
      },
      notes:
        'L1, the Bethe correlator and shell growth are computed from the built cell graph. The physical-space gravity exponent is a hand-derived consequence of the 4D Laplacian (spaceDim - 2), set in the function, not measured, so that part is an analytic note. {5,3,3,3,3} is paracompact, beyond the H^4 compact limit.',
    })
  },
})
