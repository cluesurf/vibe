// P226 (the final problem, is the symmetric collision forced?): the base principles force only the DISCRETE
// lattice symmetry. It is effectively forced into the CONTINUOUS so(8)/so(10) in the IR by emergent symmetry
// restoration, the same mechanism that gives emergent Lorentz (p211). The strength of that restoration = the
// order at which anisotropy first appears. For the cubic lattice (Lorentz) it is order 4. We show TRIALITY
// makes the coin even better, the 24-cell's full symmetry (F4) has NO degree-4 anisotropy (only |x|^4), so the
// coin's continuous symmetry is emergent up to order 6, MORE robust than spacetime Lorentz. So the symmetric
// collision is effectively forced in the IR, by triality. Run: npx tsx code/experiment/p226-emergent-symmetry.ts

import { invariantPolynomialDimension } from '@/code/algebra/group/invariant-theory'
import { closure as groupClosure } from '@/code/algebra/group/finite-group'
import { matrixProduct } from '@/code/algebra/linear/dense'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type M = number[][]
const I4: M = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
]
const mul = matrixProduct
const key = (A: M): string =>
  A.flat()
    .map(x => Math.round(x * 1000))
    .join(',')
const trace = (A: M): number =>
  A[0]![0]! + A[1]![1]! + A[2]![2]! + A[3]![3]!
const closure = (gens: M[]): M[] =>
  groupClosure(gens, { multiply: mul, inverse: m => m, key })
// dim of degree-d invariant polynomials = (1/|G|) sum_g h_d(eigenvalues of g), h from power sums via Newton
const invDim = (G: M[], d: 2 | 4): number =>
  invariantPolynomialDimension({
    group: G,
    degree: d,
    identity: I4,
    multiply: mul,
    trace,
  })

export function emergentSymmetry(): { b4Inv4: number; f4Inv4: number } {
  // B4 (hyperoctahedral, signed permutations) generators
  const cyc: M = [
    [0, 0, 0, 1],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ] // (1234) permutation
  const swap: M = [
    [0, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ] // (12)
  const flip: M = [
    [-1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ] // sign flip on x1
  const B4 = closure([cyc, swap, flip])
  // triality generator: Hadamard/2 (maps 8v -> 8s, mixing the three 16-cells), order 2, extends B4 -> F4
  const H: M = [
    [1, 1, 1, 1],
    [1, -1, 1, -1],
    [1, 1, -1, -1],
    [1, -1, -1, 1],
  ].map(r => r.map(x => x / 2))
  const F4 = closure([cyc, swap, flip, H])
  const b4Inv2 = invDim(B4, 2),
    b4Inv4 = invDim(B4, 4),
    f4Inv2 = invDim(F4, 2),
    f4Inv4 = invDim(F4, 4)
  return { b4Inv4, f4Inv4 }
}

export default experiment({
  id: 'gauge/emergent-symmetry',
  title:
    'triality kills the degree-4 anisotropy, so the F4 coin symmetry is continuous to order 6',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = emergentSymmetry()
    const ok = r.b4Inv4 === 2 && r.f4Inv4 === 1
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the signed-permutation group B4 has two degree-4 invariants including an anisotropy, but the full 24-cell symmetry F4 has only the isotropic one, so triality makes the coin symmetry emergently continuous to order 6',
      metrics: {
        b4DegreeFourInvariants: r.b4Inv4,
        f4DegreeFourInvariants: r.f4Inv4,
      },
      notes:
        'L1, known math. An invariant-theory count of the F4 and B4 polynomial invariants. The B4 anisotropy is the control that makes the F4 result meaningful. The claim that this forces a symmetric collision in the infrared is an interpretation, not measured from dynamics.',
    })
  },
})
