// The crown jewel and an honest negative. The exceptional Jordan algebra J3(O), the 27-dimensional Albert algebra
// whose automorphism group F4 is the symmetry of the {3,4,3,4} substrate, is forced rank three (a Jordan algebra
// for n <= 3, failing at n = 4 because the octonions do not associate), with three 8-dimensional off-diagonal
// pieces and an S_3 slot symmetry. We TEST the obvious identification, three pieces = three generations: it FAILS
// dimensionally (each piece is 8, a generation is 16), so the naive reading is falsified and the true
// identification stays open (Boyle's conjecture). The deepest open problem, named honestly.
//
// L1 known math with a control (n = 4 fails), an honest open result. Compute in code/measure/generation-structure.

import { exceptionalJordanGenerationStructure } from '@/code/measure/generation-structure'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/exceptional-jordan-generations',
  code: 'E-FRC-0017',
  title:
    'the rank-3 Albert algebra is forced with an S_3 slot symmetry, but its three 8-dim pieces are not three 16-fermion generations',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = exceptionalJordanGenerationStructure()

    const structureForced =
      r.dimension === 27 &&
      r.residualAt3 < 1e-9 &&
      r.residualAt4 > 0.1 &&
      r.frameIsRank3 &&
      r.s3Count === 6 &&
      r.s3AreAutomorphisms

    const status = structureForced
      ? r.naiveIdentificationHolds
        ? 'pass'
        : 'open'
      : 'fail'

    return verdict({
      status,
      claim:
        'J3(O) is forced rank three (Jordan identity holds at n=3, fails at n=4) with three 8-dimensional pieces and an S_3 slot symmetry, but the naive identification with three 16-fermion generations fails dimensionally (8 not 16), so the obvious reading is falsified and the true identification stays open',
      metrics: {
        dimension: r.dimension,
        jordanResidualAt3: r.residualAt3,
        s3Automorphisms: r.s3AreAutomorphisms ? 1 : 0,
        pieceDimension: r.pieceDimension,
        generationFermions: r.generationFermions,
      },
      control: { jordanResidualAt4: r.residualAt4 },
      notes:
        'L1 known math. the structural chain (rank-3 forced by non-associativity, F4 automorphism, S_3 slot symmetry) is nailed, the identification with the three observed generations is Boyle open conjecture, and the naive 8=16 reading is honestly falsified',
    })
  },
})
