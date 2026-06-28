// Conformance for code/operator/macro-rule: the renormalized (coarse-grained) signed
// majority rule on a clustered graph. Facts:
//   - effectiveCouplings sums intra-cluster fills into Jself and cross-cluster fills into
//     Jcross, hand-verified on a small two-cluster graph (exact).
//   - the renormalized step keeps the self-coupling and the cross magnitude, while the
//     naive step keeps only the cross sign, and they disagree on a constructed case.

import { suite, check, equal } from '@/test/code/harness'
import {
  effectiveCouplings,
  naiveMacroStep,
  renormMacroStep,
} from '@/code/operator/macro-rule'
import { makeGraph } from '@/code/tool/graph'

// 4 nodes, two clusters {0,1} and {2,3}. Edges 0-1 (intra, +1), 2-3 (intra, +1),
// 1-2 (cross, -1). makeGraph sorts neighbours, so fills are aligned to sorted order.
const g = makeGraph({
  size: 4,
  directed: false,
  neighbors: [[1], [0, 2], [1, 3], [2]],
})
// fills aligned with sorted neighbours: node1 neighbours [0,2] -> [+1 (to 0), -1 (to 2)].
const fills = [
  Int8Array.from([1]), // 0: edge to 1
  Int8Array.from([1, -1]), // 1: edge to 0 (+1), edge to 2 (-1)
  Int8Array.from([-1, 1]), // 2: edge to 1 (-1), edge to 3 (+1)
  Int8Array.from([1]), // 3: edge to 2
]
const cl = Int32Array.from([0, 0, 1, 1])
const eff = effectiveCouplings(g, fills, cl, 2)

suite('operator/macro-rule: effective couplings', [
  check('Jself sums intra-cluster fills (both directions)', () => {
    equal(eff.Jself[0], 2, 'cluster 0: edge 0-1 counted from both ends = 2')
    equal(eff.Jself[1], 2, 'cluster 1: edge 2-3 counted from both ends = 2')
  }),
  check('Jcross is the real summed cross-cluster coupling', () => {
    equal(eff.nbr[0]!.length, 1, 'cluster 0 has one cross-neighbour')
    equal(eff.nbr[0]![0], 1, 'it is cluster 1')
    equal(eff.Jcross[0]![0], -1, 'cross coupling 1-2 = -1')
    equal(eff.nbr[1]![0], 0, 'cluster 1 sees cluster 0')
    equal(eff.Jcross[1]![0], -1, 'symmetric cross coupling = -1')
  }),
])

suite('operator/macro-rule: renorm vs naive step', [
  check('the self-coupling makes renorm disagree with naive', () => {
    const superTone = Int8Array.from([1, 1])
    // renorm cluster 0: h = Jself*super0 + Jcross*super1 = 2*1 + (-1)*1 = 1 -> +1
    // naive  cluster 0: h = sign(Jcross)*super1 = -1*1 = -1 -> -1
    const renorm = renormMacroStep(superTone, eff)
    const naive = naiveMacroStep(superTone, eff)
    equal(renorm[0], 1, 'renorm holds the majority via self-coupling')
    equal(naive[0], -1, 'naive flips, having dropped the self-coupling')
  }),
  check('renorm computes the signed local field exactly', () => {
    const superTone = Int8Array.from([1, -1])
    // cluster 0: 2*1 + (-1)*(-1) = 3 -> +1; cluster 1: 2*(-1) + (-1)*1 = -3 -> -1
    const renorm = renormMacroStep(superTone, eff)
    equal(renorm[0], 1, 'cluster 0 field +3 -> +1')
    equal(renorm[1], -1, 'cluster 1 field -3 -> -1')
  }),
])
