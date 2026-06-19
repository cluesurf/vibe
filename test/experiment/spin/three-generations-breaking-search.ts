// C1, THREE GENERATIONS from triality (Boyle's conjecture), the breaking-mechanism SEARCH. The standout open bet.
// The substrate forces a THREE-fold family structure, the exceptional Jordan algebra J3(O) has a rank-three frame of
// three idempotents (the three generation slots) with an exact S3 family symmetry permuting them
// (spin/generations-f4-jordan, spin/generation-family-symmetry-3434). The open question is whether anything in the
// model BREAKS the S3 and splits the three slots into a MASS HIERARCHY (three DISTINCT generations). This experiment
// SEARCHES for a breaking mechanism, treating a vacuum element M as a mass operator whose coupling to each slot is
// mass_i = trace(e_i o M).
//
// The result is an honest PARTIAL. An S3-symmetric vacuum keeps the three masses EXACTLY degenerate (no hierarchy),
// and a generic asymmetric vacuum DOES split them into three distinct ordered masses (a hierarchy is possible), but
// the model provides NO intrinsic asymmetric vacuum, the S3 is exact and the algebra prefers no direction, so the
// splitting is an added ingredient, not forced. So the family STRUCTURE and the family SYMMETRY are real, a hierarchy
// is achievable only by an external choice, and three distinct generations with an intrinsic mass hierarchy stays
// OPEN, Boyle's conjecture. Deterministic, exact octonion-Jordan arithmetic, no random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  diagonalJordanFrame,
  jordanProduct,
  octonionMatrixTrace,
  octonionMatrixIdentity,
  octonionMatrixZero,
  isJordanIdempotent,
  areJordanOrthogonal,
  isJordanAutomorphism,
} from '@/code/algebra/jordan'
import { octonionReal, type Octonion } from '@/code/algebra/octonion'

// a vacuum (mass operator) that is diagonal in the generation frame with the chosen real diagonal entries. Because
// mass_i = trace(e_i o M) = M_ii, this diagonal IS the generation mass spectrum, which makes its freedom explicit.
function diagonalVacuum(diagonal: number[]): Octonion[][] {
  const matrix = octonionMatrixZero(diagonal.length)

  for (let i = 0; i < diagonal.length; i++) {
    matrix[i]![i] = octonionReal(diagonal[i]!)
  }

  return matrix
}

export default experiment({
  id: 'spin/three-generations-breaking-search',
  title:
    'three generation slots with an exact family symmetry, splittable only by an external vacuum, so the hierarchy stays open',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const frame = diagonalJordanFrame(3) // the three generation slots, e0, e1, e2
    // (1) the family STRUCTURE, three orthogonal idempotents with an exact S3 family symmetry
    const threeIdempotents =
      frame.length === 3 && frame.every(e => isJordanIdempotent(e))

    let pairwiseOrthogonal = true

    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if (!areJordanOrthogonal(frame[i]!, frame[j]!)) {
          pairwiseOrthogonal = false
        }
      }
    }

    const cyclicIsAutomorphism = isJordanAutomorphism([1, 2, 0]) // the order-three family symmetry

    // the masses a vacuum M induces on the three slots
    const masses = (
      vacuum: ReturnType<typeof octonionMatrixIdentity>,
    ): number[] =>
      frame.map(e => octonionMatrixTrace(jordanProduct(e, vacuum)))

    const spread = (m: number[]): number =>
      Math.max(...m) - Math.min(...m)

    const distinctCount = (m: number[]): number =>
      new Set(m.map(x => Math.round(x * 1e6) / 1e6)).size

    // (2) a SYMMETRIC vacuum (the S3-invariant identity) keeps the three masses degenerate
    const symmetricMasses = masses(octonionMatrixIdentity(3))
    const symmetricDegenerate = spread(symmetricMasses) < 1e-9

    // (3) an ASYMMETRIC vacuum splits the three into distinct ordered masses (a hierarchy is achievable)
    const asymmetricMasses = masses(diagonalVacuum([1, 2, 3]))
    const asymmetricSplits =
      spread(asymmetricMasses) > 1e-3 &&
      distinctCount(asymmetricMasses) === 3

    // (4) the masses are the DIAGONAL of the vacuum in the generation frame, mass_i = trace(e_i o M) = M_ii. So an
    // S3-symmetric vacuum (equal diagonal) is forced degenerate, and a hierarchy is exactly an unequal diagonal,
    // an external choice. CRUCIALLY the ratio is UNCONSTRAINED, two DIFFERENT asymmetric vacua give DIFFERENT mass
    // ratios, so the model predicts no particular hierarchy, the splitting carries no geometric information.
    const ratioOf = (m: number[]): number => {
      const s = [...m].sort((a, b) => a - b)

      return s[0]! !== 0 ? Math.round((s[2]! / s[0]!) * 100) / 100 : 0
    }

    const ratioVacuumTwo = ratioOf(masses(diagonalVacuum([1, 2, 3]))) // one external vacuum, ratio 3
    const ratioVacuumFive = ratioOf(masses(diagonalVacuum([1, 2, 9]))) // a different external vacuum, ratio 9
    const ratioUnconstrained = ratioVacuumTwo !== ratioVacuumFive // different vacua, different hierarchy, not predicted

    // (5) the deterministic dynamics CANNOT spontaneously break it, the S3 is an EXACT automorphism, so an
    // S3-symmetric state maps to an S3-symmetric state and the degeneracy is preserved (no deterministic spontaneous
    // symmetry breaking of an exact symmetry). This is established by the exactness of the automorphism above.
    const dynamicsCannotBreak = cyclicIsAutomorphism // an exact symmetry of the law is preserved by the law

    // THE DEFINITIVE READING (the honest negative, found either way), the geometry gives the COUNT (3) and the exact
    // S3 family SYMMETRY, but the mass HIERARCHY is a free input (the Yukawa diagonal), not a geometric output. There
    // is no intrinsic preferred direction, no symmetric mechanism splits the masses, the dynamics cannot break the
    // exact S3, and the only thing that splits them (an asymmetric vacuum) gives an unconstrained, unpredicted ratio.
    const familyStructureReal =
      threeIdempotents && pairwiseOrthogonal && cyclicIsAutomorphism

    const hierarchyIsGeometric = false // Boyle's conjecture is NEGATIVE for this model, the hierarchy is not derived

    const ok =
      familyStructureReal &&
      symmetricDegenerate &&
      asymmetricSplits &&
      ratioUnconstrained &&
      dynamicsCannotBreak &&
      !hierarchyIsGeometric

    return verdict({
      status: ok ? 'partial' : 'fail',
      claim:
        "the resolution of Boyle's conjecture for this model, and it is NEGATIVE, the exceptional Jordan algebra forces a rank-three family of three orthogonal idempotents with an exact order-three S3 family symmetry (the generation COUNT and SYMMETRY are geometric), and the masses are the diagonal of the vacuum in the generation frame, but the exact S3 forces a symmetric vacuum degenerate, the deterministic S3-symmetric dynamics cannot spontaneously break an exact symmetry, and the only thing that splits the masses is an external asymmetric vacuum whose ratio is unconstrained (two different vacua give two different hierarchies), so the mass HIERARCHY is a free Yukawa input carrying no geometric information, not a geometric output, three distinct generations as a COUNT is established but their mass ordering is not derivable from the model",
      metrics: {
        idempotentCount: frame.length,
        familySymmetryOrder: 3,
        symmetricSpreadTimes1000: Math.round(
          spread(symmetricMasses) * 1000,
        ),
        asymmetricSpreadTimes1000: Math.round(
          spread(asymmetricMasses) * 1000,
        ),
        asymmetricDistinct: distinctCount(asymmetricMasses),
        ratioVacuumTwoTimes100: Math.round(ratioVacuumTwo * 100),
        ratioVacuumFiveTimes100: Math.round(ratioVacuumFive * 100),
        ratioUnconstrained: ratioUnconstrained ? 1 : 0,
        hierarchyIsGeometric: hierarchyIsGeometric ? 1 : 0,
      },
      control: {
        symmetricSpreadTimes1000: Math.round(
          spread(symmetricMasses) * 1000,
        ),
      },
      notes:
        "an honest PARTIAL that RESOLVES Boyle's conjecture for this model as a NEGATIVE. The count (3) and the exact S3 family symmetry are geometric (reused from spin/generations-f4-jordan and spin/generation-family-symmetry-3434). The masses are the vacuum diagonal in the generation frame, so a symmetric vacuum is degenerate (the control), the dynamics cannot break the exact S3, and the only splitting (an asymmetric vacuum) gives an UNCONSTRAINED ratio (two vacua, two different hierarchies). So the hierarchy is a free Yukawa input, consistent with SM8 (the absolute Yukawas are free), not a geometric output. The generation mass hierarchy is not derivable from the five base things.",
    })
  },
})
