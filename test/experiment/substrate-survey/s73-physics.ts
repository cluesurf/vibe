// S73-PHYSICS ({7,3} suite): gravity, cosmology, hierarchy, isotropy. Verdicts, the holographic correlator
// (Bethe z=7) is clean 1/r^2 (PORTS), cosmology (2D hyperbolic growth) and hierarchy (radial tree) PORT, and
// the emergent ISOTROPY is strong (7-fold is isotropic to order 6 in 2D). The DIFFERENCE, physical-space gravity
// is in 1D, so the potential is LINEAR (confining), not 1/r. Run: npx tsx code/experiment/s73-physics.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'
import { betheCorrelatorExponent } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s73Physics(): { betheAlpha: number; growthRatio: number; sevenFoldIsotropic: boolean } {
  // Bethe holographic correlator, z=7
  const betheAlpha = betheCorrelatorExponent(7)
  // cosmology + hierarchy, bulk shell growth
  const g = buildCellGraph({ symbol: [7, 3] as never, maxCells: 12000 })
  const N = g.cellCount, nb = g.neighbors
  let center = 0, best = -1; for (let i = 0; i < N; i++) if (nb[i]!.length > best) { best = nb[i]!.length; center = i }
  const shell = bfsShells({ neighbors: nb, root: center }).shellCounts
  const mid = shell.slice(2, Math.min(7, shell.length))
  const growthRatio = Math.round((mid.slice(1).reduce((s, v, i) => s + v / mid[i]!, 0) / Math.max(1, mid.length - 1)) * 100) / 100
  // 7-fold 2D isotropy, 4th moment, sum d_x^4 = 3 sum d_x^2 d_y^2 (isotropic in 2D)
  const dirs = Array.from({ length: 7 }, (_, k) => [Math.cos((2 * Math.PI * k) / 7), Math.sin((2 * Math.PI * k) / 7)])
  let m4diag = 0, m4mix = 0; for (const d of dirs) { m4diag += d[0]! ** 4; m4mix += d[0]! ** 2 * d[1]! ** 2 }
  const sevenFoldIsotropic = Math.abs(m4diag - 3 * m4mix) < 1e-6
  return { betheAlpha, growthRatio, sevenFoldIsotropic }
}

export default defineExperiment({
  id: 'substrate-survey/s73-physics',
  title: 'the holographic correlator, cosmology, and 7-fold isotropy port to {7,3}, with 1D linear gravity',
  category: 'substrate-survey',
  substrates: ['73'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s73Physics()
    const ok =
      Math.abs(r.betheAlpha - 2) < 0.3 &&
      r.growthRatio > 1.2 &&
      r.sevenFoldIsotropic
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Bethe correlator on {7,3} is a clean 1/r^2, the bulk shells grow exponentially, and the 7-fold coin is isotropic to fourth moment, while physical-space gravity is 1D and linear',
      metrics: {
        betheAlpha: r.betheAlpha,
        growthRatio: r.growthRatio,
        sevenFoldIsotropic: r.sevenFoldIsotropic ? 1 : 0,
      },
      notes:
        'L1, the correlator, shell growth, and the fourth-moment isotropy check are all computed. The 1D linear-gravity statement is an analytic consequence of the 1D horocycle, stated in the notes, not measured here.',
    })
  },
})
