// CUSP COLUMN COUNTS, BRANCHING STEP-FIELD SCREENING, AND PAIR-DENSITY (1/N_D^2 = l^-6) WARPED 1/r GRAVITY
// (E-GRV-0156).
//
// Depth L2: exact cached {3,4,3,4} cusp geometry + exact 3D Bloch Schur complement. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runCuspColumnGravity } from '@/code/measure/cusp-column-gravity'

export default experiment({
  id: 'gravity/cusp-column-gravity',
  code: 'E-GRV-0156',
  title:
    'Exact {3,4,3,4} cusp column counts, raw bulk screening (Option A fails), and parameter-free pair-density 1/N_D^2 (= l^-6) warped 1/r gravity without a floor',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runCuspColumnGravity()
    const i0 =
      res.shellCountsD0to3[0] === 1 &&
      res.shellCountsD0to3[1] === 18 &&
      res.shellCountsD0to3[2] === 330 &&
      res.shellCountsD0to3[3] === 6034 &&
      res.cumulativeD0to3[3] === 6383
    const g1 = res.rawDecayRatio2to1 < 0.25
    const r = res.warpedColResistances
    const resGrows = r[1]! > r[0]! && r[2]! > r[1]! && r[3]! > r[2]!
    const g2 = resGrows && res.warpedSlope1to5 >= -1.25 && res.warpedSlope1to5 <= -0.75
    const ok = i0 && g1 && g2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Exact cached {3,4,3,4} cusp columns: N_D(0..3) = ${res.shellCountsD0to3.join(', ')} (cumulative ${res.cumulativeD0to3.join(', ')}). ` +
        `Raw unweighted bulk Laplacian screens sharply on the 3D husk (G(2)/G(1) = ${res.rawDecayRatio2to1.toFixed(4)} < 0.25, ` +
        `confirming a board proposal Option A fails without a floor). Parameter-free pair-density warp w(D) = 1/N_D^2 (= l^-6, ` +
        `zero free parameters!) makes column resistance diverge exponentially with depth (${r.map(x => x.toExponential(2)).join(' -> ')}) ` +
        `and restores an unscreened 3D 1/r husk propagator (log-log slope r=1..5: ${res.warpedSlope1to5.toFixed(4)}, ` +
        `max rel 1/r dev: ${(res.warpedMaxRel1overRErr1to5 * 100).toFixed(2)}%) with ZERO floor and ZERO depth register`,
      metrics: {
        i0: i0 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        nD0: res.shellCountsD0to3[0],
        nD1: res.shellCountsD0to3[1],
        nD2: res.shellCountsD0to3[2],
        nD3: res.shellCountsD0to3[3],
        rawDecayRatio2to1: res.rawDecayRatio2to1,
        warpedResF3: r[0]!,
        warpedResF12: r[3]!,
        warpedSlope1to5: res.warpedSlope1to5,
        warpedMaxRel1overRErr1to5: res.warpedMaxRel1overRErr1to5,
      },
    })
  },
})
