// Conformance for code/measure/generation-structure: the exceptional Jordan algebra J3(O). It is
// 27-dimensional (3 diagonal reals + 3 octonion off-diagonals = 3 + 24), the Jordan identity holds
// at n=3 and fails at n=4 (the rank-3 limit), its diagonal frame is a rank-3 idempotent frame, the
// S_3 slot permutations (6 of them) are automorphisms, and the naive "three 8-dim pieces = three
// 16-fermion generations" identification fails dimensionally (8 != 16).

import { suite, check, equal, ok } from '@/test/code/harness'
import { exceptionalJordanGenerationStructure } from '@/code/measure/generation-structure'

suite('measure/generation-structure: J3(O)', [
  // dim = 3 reals + 3 * 8 octonion off-diagonals = 27.
  check('the algebra is 27-dimensional', () => {
    equal(exceptionalJordanGenerationStructure().dimension, 27)
  }),
  // Jordan identity holds at n=3, fails at n=4 (octonions do not associate).
  check('the Jordan identity holds at 3 and fails at 4', () => {
    const s = exceptionalJordanGenerationStructure()
    ok(
      s.residualAt3 < 1e-6,
      `residual at 3 should be ~0, got ${s.residualAt3}`,
    )
    ok(
      s.residualAt4 > 1e-3,
      `residual at 4 should be large, got ${s.residualAt4}`,
    )
  }),
  // The diagonal frame is a rank-3 orthogonal idempotent frame.
  check('the diagonal Jordan frame is rank 3', () => {
    equal(exceptionalJordanGenerationStructure().frameIsRank3, true)
  }),
  // S_3 has 3! = 6 elements, all automorphisms (the generation horizontal symmetry).
  check('the six S_3 slot permutations are automorphisms', () => {
    const s = exceptionalJordanGenerationStructure()
    equal(s.s3Count, 6)
    equal(s.s3AreAutomorphisms, true)
  }),
  // Each octonion piece is 8-dim; a generation is 16 Weyl fermions, so the naive map fails.
  check(
    'the naive piece = generation identification fails (8 != 16)',
    () => {
      const s = exceptionalJordanGenerationStructure()
      equal(s.pieceDimension, 8)
      equal(s.generationFermions, 16)
      equal(s.naiveIdentificationHolds, false)
    },
  ),
])
