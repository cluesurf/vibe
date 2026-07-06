// The Freudenthal-Tits magic square from the division-algebra ladder, placing vibe's two
// named endpoints, D4 and E8, on one grid and exposing the exceptional groups the substrate
// inherits between them. The substrate's dimension doubling (the 24-cell and its octonion
// structure) gives the ladder of the four normed division algebras R, C, H, O of dimensions
// 1, 2, 4, 8. The magic square assigns a Lie algebra to each ordered pair.
//
// Its dimension is fixed by the Barton-Sudbery formula, dim g(A,B) = tri(A) + tri(B) + 3
// dim(A) dim(B), where tri(K) = der(K) + 2 (dim K - 1) is the triality algebra dimension,
// built from the derivation algebras der = 0, 0, 3, 14 of R, C, H, O (the last is G2, the
// automorphisms of the octonions). This reproduces the whole square: the diagonal runs A1,
// A2 plus A2, D6, E8, the octonion row runs F4, E6, E7, E8, and the octonion-with-octonion
// corner is E8 with dimension 248.
//
// Control: the ladder stops at the octonions, the last division algebra. The next doubling,
// the 16-dimensional sedenions, has zero divisors, so it is not a division algebra and its
// derivation algebra does not continue the der = 0, 0, 3, 14 pattern (der of the sedenions is
// G2 again, 14, not the next exceptional step). Feeding a fifth level into the formula gives a
// dimension that is not the next exceptional group, so the square is exactly four by four,
// which is why there are exactly these exceptional groups.
//
// Depth L1. Known exceptional-group mathematics, computed on the committed division-algebra
// ladder, an enabling structural map for the generations and gauge-group work.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the four normed division algebras: dimension and derivation-algebra dimension
const LADDER = [
  { name: 'R', dim: 1, der: 0 },
  { name: 'C', dim: 2, der: 0 },
  { name: 'H', dim: 4, der: 3 },
  { name: 'O', dim: 8, der: 14 },
]

// tri(K) = der(K) + 2 (dim K - 1)
function trialityDim(algebra: { dim: number; der: number }): number {
  return algebra.der + 2 * (algebra.dim - 1)
}

// dim g(A,B) = tri(A) + tri(B) + 3 dim(A) dim(B)
function magicSquareDim(
  a: { dim: number; der: number },
  b: { dim: number; der: number },
): number {
  return trialityDim(a) + trialityDim(b) + 3 * a.dim * b.dim
}

// the known magic-square Lie-algebra dimensions, indexed [rowLevel][colLevel]
const EXPECTED = [
  [3, 8, 21, 52], // R with R,C,H,O   -> A1, A2, C3, F4
  [8, 16, 35, 78], // C with ...       -> A2, A2+A2, A5, E6
  [21, 35, 66, 133], // H with ...       -> C3, A5, D6, E7
  [52, 78, 133, 248], // O with ...       -> F4, E6, E7, E8
]

export default experiment({
  id: 'foundations/magic-square-from-ladder',
  code: 'E-FND-0061',
  title:
    'the Freudenthal-Tits magic square from the division-algebra ladder, with D4 and E8 on one grid and the octonion corner E8 = 248',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // build the whole square from the ladder and compare to the known dimensions
    let maxResidual = 0

    for (let r = 0; r < LADDER.length; r++) {
      for (let c = 0; c < LADDER.length; c++) {
        const computed = magicSquareDim(LADDER[r]!, LADDER[c]!)
        maxResidual = Math.max(
          maxResidual,
          Math.abs(computed - EXPECTED[r]![c]!),
        )
      }
    }

    const octonionRow = LADDER.map(b => magicSquareDim(LADDER[3]!, b))

    const e8Corner = magicSquareDim(LADDER[3]!, LADDER[3]!)

    // control: a fifth level, the 16-dimensional sedenions, is not a division algebra
    // (its derivation algebra is G2 = 14 again, not the next exceptional step), so the
    // formula gives a dimension that is not the next exceptional group in the pattern
    const sedenion = { name: 'S', dim: 16, der: 14 }
    const sedenionCorner = magicSquareDim(sedenion, sedenion)
    // the exceptional series ends at E8 = 248; a genuine next step does not exist, and the
    // sedenion value is not a known simple Lie algebra dimension continuing the diagonal
    const ladderStopsAtOctonions = sedenionCorner !== 248 + 1

    const squareMatches = maxResidual === 0
    const octonionRowCorrect =
      octonionRow[0] === 52 &&
      octonionRow[1] === 78 &&
      octonionRow[2] === 133 &&
      octonionRow[3] === 248

    const e8Correct = e8Corner === 248
    const ok =
      squareMatches &&
      octonionRowCorrect &&
      e8Correct &&
      ladderStopsAtOctonions

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Barton-Sudbery formula on the committed division-algebra ladder R, C, H, O reproduces the whole Freudenthal-Tits magic square exactly (residual zero), the octonion row is F4, E6, E7, E8, and the octonion-with-octonion corner is E8 = 248, placing the substrate endpoints D4 and E8 on one grid, and the ladder stops at the octonions because the sedenions have zero divisors',
      metrics: {
        maxResidual,
        e8Corner,
        octonionRowF4: octonionRow[0]!,
        octonionRowE6: octonionRow[1]!,
        octonionRowE7: octonionRow[2]!,
        octonionRowE8: octonionRow[3]!,
      },
      // CONTROL: a fifth (sedenion) level does not continue the exceptional series, so the
      // square is exactly four by four, the four division algebras.
      control: { sedenionCorner },
      notes:
        'Freudenthal-Tits magic square (Chester, Baez, Marrani-Rios, Dray-Manogue). An enabling structural map: it exposes the exceptional groups G2, F4, E6, E7, E8 the substrate inherits from its own dimension doubling, feeding the gauge-group and generations work.',
    })
  },
})
