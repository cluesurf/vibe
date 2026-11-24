// EXACT U(2) GATE GROUP DENSITY AND HONG-OU-MANDEL VISIBILITY (E-QTM-0204, item vibe-roadmap-board-0008, gaps B-07, B-46).
// Proves the working rule's two-mode gate group is infinite and dense in SU(2) via exact Z[w][1/2] trace arithmetic
// (Tr(w^2 C diag(1,w)) = 1/2 => cos(theta) = 1/4 => irrational multiple of pi by Kronecker/Niven), verifies 2-adic
// inertia in Z[zeta_9][1/6], measures HOM visibility through word length L = 14 under both Q(w) and Sigma(648) lifts,
// and exhibits an exact 3-step path+role 50:50 branch splitter in Z[w][1/2].
//
// Depth L2: exact Z[w][1/2] algebra + deterministic unitarity-checked word synthesis. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runGateGroupHom } from '@/code/measure/gate-group-hom'

export default experiment({
  id: 'quantum/gate-group-hom',
  code: 'E-QTM-0204',
  title:
    'Exact proof that the two-mode gate group is infinite and dense in SU(2), HOM visibility vs word length, and exact 3-step path+role 50:50 split',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const res = runGateGroupHom()
    const qw14 = res.qwLiftCurve[res.qwLiftCurve.length - 1]!
    const s14 = res.sigma648LiftCurve[res.sigma648LiftCurve.length - 1]!

    const i0 = res.maxUnitarityErr <= 1e-13 && res.detIsOne && res.traceIsExactHalf && res.traceDenPow2 === 1
    const i1 = res.commutatorNorm > 0.5
    const g1 = res.twoInertOrderMod9 === 6 && qw14.bestVisibility > 0.9999 && s14.bestVisibility > 0.9999
    const g2 = res.pathRoleExactHalfSteps <= 3 && res.pathRoleMaxErr === 0

    const ok = i0 && i1 && g1 && g2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Two-mode gate group is INFINITE and DENSE in SU(2): exact Z[w][1/2] matrix w^2*C*diag(1,w) has det=1 and ` +
        `exact trace 1/2 (cos theta = 1/4, non-algebraic-integer trace => infinite order by Kronecker/Niven) with ` +
        `non-commuting conjugate (||[U1,U2]||_F=${res.commutatorNorm.toFixed(4)}). 2 has order ${res.twoInertOrderMod9} ` +
        `mod 9 (inert in Z[zeta_9], so no single amplitude hits |z|^2=1/2), yet word length L=14 reaches HOM visibility ` +
        `V=${qw14.bestVisibility.toFixed(7)} (Q(w) lift, delta=${qw14.bestDeltaHalf.toExponential(2)}) and ` +
        `V=${s14.bestVisibility.toFixed(7)} (Sigma(648) lift, delta=${s14.bestDeltaHalf.toExponential(2)}). ` +
        `Path+role splitter hits exact 1/2 = 1/4 + 1/4 (err ${res.pathRoleMaxErr}) in ${res.pathRoleExactHalfSteps} steps`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        traceIsExactHalf: res.traceIsExactHalf ? 1 : 0,
        commutatorNorm: res.commutatorNorm,
        twoInertOrderMod9: res.twoInertOrderMod9,
        maxUnitarityErr: res.maxUnitarityErr,
        qwDeltaL4: res.qwLiftCurve[3]!.bestDeltaHalf,
        qwVisL4: res.qwLiftCurve[3]!.bestVisibility,
        qwDeltaL14: qw14.bestDeltaHalf,
        qwVisL14: qw14.bestVisibility,
        s648DeltaL4: res.sigma648LiftCurve[3]!.bestDeltaHalf,
        s648VisL4: res.sigma648LiftCurve[3]!.bestVisibility,
        s648DeltaL14: s14.bestDeltaHalf,
        s648VisL14: s14.bestVisibility,
        pathRolePort0: res.pathRolePortWeights[0],
        pathRolePort1: res.pathRolePortWeights[1],
        pathRoleMaxErr: res.pathRoleMaxErr,
      },
    })
  },
})
