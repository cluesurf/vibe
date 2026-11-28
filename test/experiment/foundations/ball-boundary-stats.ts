// INTERIOR SHELL STATISTICS VS BOUNDARY CONDITION ON EXACT {3,4,3,4} BALLS (E-FND-0182).
// Compares reflecting, calm-open (absorbing), and vacuum-phase-twisted boundaries on cached exact R = 2 (481 docks)
// and R = 3 (8,857 docks) honeycomb balls under F-G + split coin.
//
// Depth L2: exact cached {3,4,3,4} balls + exact Float64 unitary/open evolution. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runBallBoundaryStats } from '@/code/measure/ball-boundary-stats'

export default experiment({
  id: 'foundations/ball-boundary-stats',
  code: 'E-FND-0182',
  title:
    'Interior shell statistics on exact R = 2 and R = 3 {3,4,3,4} balls under reflecting, calm-open, and vacuum-twisted boundaries',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runBallBoundaryStats()
    const i0 =
      res.r2.cells === 481 &&
      res.r2.outerShellCount === 456 &&
      res.r3.cells === 8857 &&
      res.r3.outerShellCount === 8376
    const maxNormErr = Math.max(
      res.r2.normErrReflecting,
      res.r2.normErrVacuumOuter,
      res.r3.normErrReflecting,
      res.r3.normErrVacuumOuter,
    )
    const i1 = maxNormErr <= 1e-13
    const maxInside = Math.max(res.r2.maxInnerDiffInsideHorizon, res.r3.maxInnerDiffInsideHorizon)
    const g1 = maxInside <= 1e-13
    const g2 = res.r2.innerDiffAtHorizonCross > 1e-3 && res.r3.innerDiffAtHorizonCross > 1e-3
    const ok = i0 && i1 && g1 && g2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Exact balls confirm outer-shell dominance (R=2: 456/481=${(res.r2.outerShellFraction * 100).toFixed(2)}%, ` +
        `R=3: 8376/8857=${(res.r3.outerShellFraction * 100).toFixed(2)}%, maxNormErr=${maxNormErr.toExponential(2)}). ` +
        `Strict causal shield holds on inner shells r <= 1 inside the horizon (t <= R-1): max diff across all 3 ` +
        `boundaries is ${maxInside.toExponential(2)}. Immediately at horizon crossing (t = R), reflecting vs calm-open ` +
        `boundaries diverge on inner shells by ${res.r2.innerDiffAtHorizonCross.toFixed(4)} (R=2, t=2) and ` +
        `${res.r3.innerDiffAtHorizonCross.toFixed(4)} (R=3, t=3) (vs vacuum-twisted: ` +
        `${res.r2.innerDiffReflectVsVacuumAtHorizonCross.toFixed(4)}, ${res.r3.innerDiffReflectVsVacuumAtHorizonCross.toFixed(4)}), ` +
        `confirming finite-ball thermodynamics depends on the boundary once t >= R - r`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        r2OuterFrac: res.r2.outerShellFraction,
        r3OuterFrac: res.r3.outerShellFraction,
        maxNormErr,
        maxInnerDiffInsideHorizon: maxInside,
        r2HorizonCrossCalmDiff: res.r2.innerDiffAtHorizonCross,
        r3HorizonCrossCalmDiff: res.r3.innerDiffAtHorizonCross,
        r2HorizonCrossVacDiff: res.r2.innerDiffReflectVsVacuumAtHorizonCross,
        r3HorizonCrossVacDiff: res.r3.innerDiffReflectVsVacuumAtHorizonCross,
      },
    })
  },
})
