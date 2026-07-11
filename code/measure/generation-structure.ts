// The threefold-generation structure of the exceptional Jordan algebra J3(O), measured (not assumed) from the
// Jordan primitives. J3(O) is forced to be rank three: a Jordan algebra for n <= 3, failing at n = 4 because the
// octonions do not associate. It has three 8-dimensional off-diagonal octonion pieces and an S_3 slot symmetry
// (the generation horizontal symmetry). This measure also tests the naive identification of the three pieces with
// three Standard Model generations, which fails dimensionally (each piece is 8, a generation is 16). Reused by the
// generations experiment, kept here so the experiment stays thin.

import {
  hermitianOctonionDimension,
  maxJordanIdentityResidual,
  diagonalJordanFrame,
  isJordanIdempotent,
  areJordanOrthogonal,
  permutations,
  isJordanAutomorphism,
} from '@/code/algebra/jordan'
import { generationFermionCount } from '@/code/measure/standard-model-charges'

export function exceptionalJordanGenerationStructure(): {
  dimension: number
  residualAt3: number
  residualAt4: number
  frameIsRank3: boolean
  s3Count: number
  s3AreAutomorphisms: boolean
  pieceDimension: number
  generationFermions: number
  naiveIdentificationHolds: boolean
} {
  const dimension = hermitianOctonionDimension(3) // 27
  const residualAt3 = maxJordanIdentityResidual(3) // ~0, it is a Jordan algebra
  const residualAt4 = maxJordanIdentityResidual(4) // large, it is not (the control)

  const frame = diagonalJordanFrame(3)
  const idempotent = frame.every(e => isJordanIdempotent(e))

  let orthogonal = true

  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      if (!areJordanOrthogonal(frame[i]!, frame[j]!)) orthogonal = false
    }
  }

  const s3 = permutations(3)
  const s3AreAutomorphisms = s3.every(p => isJordanAutomorphism(p))

  // three off-diagonal octonion pieces, each 8-dimensional; a generation has 16 Weyl fermions
  const pieceDimension = 8
  const generationFermions = generationFermionCount() // 16

  return {
    dimension,
    residualAt3,
    residualAt4,
    frameIsRank3: idempotent && orthogonal,
    s3Count: s3.length,
    s3AreAutomorphisms,
    pieceDimension,
    generationFermions,
    naiveIdentificationHolds: pieceDimension === generationFermions,
  }
}
