// FRONTIER (the generation puzzle, pushed one necessary step further, still honestly OPEN):
// spin/generations-f4-jordan establishes that the substrate's F4 symmetry forces a rank-three
// exceptional Jordan structure (three is forced by octonion non-associativity). The next NECESSARY
// condition for those three slots to be three fermion GENERATIONS is a family (horizontal) symmetry
// that relates them. This experiment shows that symmetry exists and is exact: the symmetric group
// S_3 permuting the three Jordan slots acts by genuine AUTOMORPHISMS of J3(O) (verified, not assumed),
// with a cyclic order-3 generator E0 -> E1 -> E2 -> E0, the candidate generation triality.
//
// But the SAME computation exposes the honest gap. Because the S_3 is EXACT, the three slots are
// DEGENERATE: every quantity the algebra alone supplies (the trace, the rank, the idempotent norm)
// is equal across the three. So the substrate gives a family SYMMETRY but no family BREAKING, and
// three identical slots are not yet three DISTINCT generations with different masses and mixings.
// Splitting the degeneracy needs a dynamical mechanism the bare algebra does not contain, which is
// exactly Boyle's open conjecture. Verdict: PARTIAL. A real necessary structure, the identification
// with the three Standard Model generations is NOT established.

import {
  diagonalJordanFrame,
  isJordanAutomorphism,
  octonionMatrixEquals,
  octonionMatrixTrace,
  permutationConjugate,
  permutations,
} from '@/code/algebra/jordan'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function generationFamilySymmetry(): {
  familyGroupSize: number
  allAreAutomorphisms: boolean
  cyclicPermutesFrame: boolean
  cyclicHasOrderThree: boolean
  slotsAreDegenerate: boolean
  threeDistinctGenerationsEstablished: boolean
} {
  const frame = diagonalJordanFrame(3)
  const family = permutations(3) // S_3, the candidate family symmetry of the three slots

  // (1) every slot permutation is a genuine Jordan automorphism (verified on test elements)
  const allAreAutomorphisms = family.every(perm =>
    isJordanAutomorphism(perm),
  )

  // (2) the cyclic generator sends E0 -> E1 -> E2 -> E0, the generation triality
  const cyclic = [1, 2, 0]
  const cyclicPermutesFrame =
    octonionMatrixEquals(
      permutationConjugate(frame[0]!, cyclic),
      frame[1]!,
    ) &&
    octonionMatrixEquals(
      permutationConjugate(frame[1]!, cyclic),
      frame[2]!,
    ) &&
    octonionMatrixEquals(
      permutationConjugate(frame[2]!, cyclic),
      frame[0]!,
    )

  // (3) it has order 3: three applications return to the start
  let cycled = frame[0]!
  for (let k = 0; k < 3; k++) {
    cycled = permutationConjugate(cycled, cyclic)
  }

  const cyclicHasOrderThree = octonionMatrixEquals(cycled, frame[0]!)

  // (4) THE HONEST GAP: the three slots are degenerate, the algebra distinguishes none of them.
  // Every frame idempotent has the same trace 1 (and the same rank and norm), so there is no
  // algebraic label that makes them three DIFFERENT generations.
  const traces = frame.map(e => octonionMatrixTrace(e))
  const slotsAreDegenerate =
    traces.every(t => Math.abs(t - 1) < 1e-9) &&
    Math.abs(traces[0]! - traces[1]!) < 1e-9 &&
    Math.abs(traces[1]! - traces[2]!) < 1e-9

  // the family symmetry is necessary but not sufficient: three identical slots, no breaking
  const threeDistinctGenerationsEstablished = false

  return {
    familyGroupSize: family.length,
    allAreAutomorphisms,
    cyclicPermutesFrame,
    cyclicHasOrderThree,
    slotsAreDegenerate,
    threeDistinctGenerationsEstablished,
  }
}

export default experiment({
  id: 'spin/generation-family-symmetry-3434',
  title:
    'the three Jordan slots carry an exact S3 family symmetry but stay degenerate, so three distinct generations is not established',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = generationFamilySymmetry()
    // the necessary structure holds (S_3 automorphisms, the cyclic order-3 triality on the frame),
    // but the slots are degenerate, so the generation identification is honestly NOT established and
    // the verdict is partial.
    const structureOk =
      r.familyGroupSize === 6 &&
      r.allAreAutomorphisms &&
      r.cyclicPermutesFrame &&
      r.cyclicHasOrderThree &&
      r.slotsAreDegenerate

    return verdict({
      status: structureOk ? 'partial' : 'fail',
      claim:
        'the symmetric group S3 permuting the three slots of the exceptional Jordan algebra acts by genuine automorphisms with a cyclic order-three generator, a real family symmetry, but the three slots are degenerate under the algebra so three DISTINCT Standard Model generations is not established, only a family symmetry without the breaking that would make the generations different',
      metrics: {
        familyGroupSize: r.familyGroupSize,
        allAreAutomorphisms: r.allAreAutomorphisms ? 1 : 0,
        cyclicPermutesFrame: r.cyclicPermutesFrame ? 1 : 0,
        cyclicHasOrderThree: r.cyclicHasOrderThree ? 1 : 0,
        slotsAreDegenerate: r.slotsAreDegenerate ? 1 : 0,
        threeDistinctGenerationsEstablished:
          r.threeDistinctGenerationsEstablished ? 1 : 0,
      },
      notes:
        "L1, known math (S3 acting on the Jordan frame by automorphisms). This is the NEXT necessary condition for the generation reading beyond spin/generations-f4-jordan (which forced rank three): a family symmetry relating the three slots, here verified exact. The HONEST GAP, surfaced by the same computation, is that the exactness of the S3 makes the three slots DEGENERATE, the algebra supplies no label to tell them apart, so three identical slots are not three different generations. The breaking that would split them is a dynamical mechanism the bare algebra does not contain, which is Boyle's open conjecture. Reported as partial, the generation count and the splitting remain the open frontier.",
    })
  },
})
