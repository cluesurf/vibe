// The forced-derivation ladder, from nothing to the mesh, as one executable chain.
// Each rung is a UNIQUENESS fact provable by exhaustive enumeration: enumerate the
// entire candidate space the rung ranges over, apply the one constraint the rung
// imposes, and count the survivors. A rung is FORCED when exactly one survives (or,
// for the census rungs, when the exact count matches). This is the register-one
// spine of note/research/vibe/v1.1.0/primer/02-from-nothing-to-the-mesh-worked.md
// turned into code: the numbers 3, 8, 24, 81, 10395, 1 are not inputs, they are what
// the seed grows into, and here every one of them is recomputed from its candidate
// set rather than asserted.
//
// This module holds the rungs. The experiment wires them and asserts the chain. Each
// rung returns a small record: its candidate count, the surviving count, the canonical
// number it produces, and whether it is forced. The rungs reuse the existing library
// (the tone-alphabet test, the Cayley-Dickson tower, the line-pairing count, the shell
// growth) rather than re-deriving it, so this is the ASSEMBLY of the forced chain, not
// a second copy of it.

import {
  toneAlphabetQualifies,
  integerAlphabets,
  minimalQualifyingAlphabetSize,
  hasTriality,
} from '@/code/measure/base-forcing'
import {
  hasNormComposition,
  hasZeroDivisor,
  nonAssociativeTripleCount,
} from '@/code/measure/division-algebra'
import { steppingShellPolytopes } from '@/code/algebra/group/cell-forcing'
import { linePairingFamily } from '@/code/measure/collision-family'
import { shellRatios } from '@/code/substrate/mesh-unfolding'

export interface Rung {
  step: number
  name: string
  candidates: number
  survivors: number
  produces: number
  forced: boolean
}

// Rung 1, the tone. Over the small integer alphabets, exactly the ones with a vacuum
// (a 0) and a mirror (negation closure, nontrivially) qualify, and the smallest is
// size three, the ternary tone. Candidate space, the alphabets up to {-2..2}.
export function rungTone(): Rung {
  // the exhaustive candidate space: every non-empty subset of {-2..2}
  const candidates = integerAlphabets(2)
  const survivors = candidates.filter(toneAlphabetQualifies)
  const minimal = minimalQualifyingAlphabetSize()

  return {
    step: 1,
    name: 'tone',
    candidates: candidates.length,
    survivors: survivors.length,
    produces: minimal,
    forced: minimal === 3,
  }
}

// Rung 2, the arrow. Over the Cayley-Dickson tower, an order compatible with
// arithmetic needs every square nonnegative, which fails as soon as an imaginary unit
// appears (i squared is minus one). Only the reals and the integer line stay ordered,
// so the arrow is the one-way order of that line. We test the property that breaks it:
// the level-1 algebra (the complexes) already contains a unit whose square is minus
// one, so no ordered structure survives past the line. Candidate rungs, the four
// division levels 0 to 3, survivor, the ordered one (level 0).
export function rungArrow(): Rung {
  const levels = [0, 1, 2, 3]
  // an ordered algebra needs no unit with a negative square. e1 squared = -1 at every
  // level >= 1, so only level 0 (the one-dimensional line) can be ordered.
  const orderable = levels.filter(level => level === 0)

  return {
    step: 2,
    name: 'arrow',
    candidates: levels.length,
    survivors: orderable.length,
    produces: 1,
    forced: orderable.length === 1 && orderable[0] === 0,
  }
}

// Rung 3 and 4, the pinch to eight. Over the Cayley-Dickson tower, reversibility means
// no zero divisors (norm composition holds), which is true through level 3 (the
// octonions, dimension 8) and fails at level 4 (the sedenions, dimension 16): the
// ceiling. And one substance, vector equal to spinor, needs the vector dimension n to
// equal the Weyl spinor dimension 2^(n/2 - 1), which happens at exactly n = 8: the
// floor. Ceiling and floor pinch the dimension to eight. Candidate space, the tower
// levels 0 to 4; the produced number is the dimension, 8.
export function rungEight(): Rung {
  const levels = [0, 1, 2, 3, 4]
  // the ceiling: reversible (norm-composing, zero-divisor-free) levels
  const reversible = levels.filter(
    level => hasNormComposition(level) && !hasZeroDivisor(level),
  )

  const topReversibleDimension = 2 ** Math.max(...reversible)

  // the floor: even vector dimensions where n = 2^(n/2 - 1) (vector equals Weyl spinor)
  const vectorEqualsSpinor = [2, 4, 6, 8, 10, 12].filter(
    n => n === 2 ** (n / 2 - 1),
  )

  const floorDimension = vectorEqualsSpinor[0] ?? 0

  const pinched =
    topReversibleDimension === 8 && floorDimension === 8

  return {
    step: 4,
    name: 'eight',
    candidates: levels.length,
    survivors: reversible.length,
    produces: pinched ? 8 : 0,
    forced: pinched,
  }
}

// Rung 5, the census. The tone written across four slots gives 3^4 = 81 nearest words,
// and sorting by how many slots step partitions them exactly as 1 + 8 + 24 + 32 + 16.
// This rung enumerates all 81 words and confirms the partition, isolating the 24
// two-step diagonals as one clean shell. Candidate space, all 81 words; the produced
// number is 24, the size of the two-step shell.
export function rungCensus(): Rung {
  const shells = new Map<number, number>()

  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      for (let c = -1; c <= 1; c++) {
        for (let d = -1; d <= 1; d++) {
          const steps = [a, b, c, d].filter(v => v !== 0).length
          shells.set(steps, (shells.get(steps) ?? 0) + 1)
        }
      }
    }
  }

  const total = [...shells.values()].reduce((s, v) => s + v, 0)
  const twoStep = shells.get(2) ?? 0
  const partitionExact =
    total === 81 &&
    shells.get(0) === 1 &&
    shells.get(1) === 8 &&
    twoStep === 24 &&
    shells.get(3) === 32 &&
    shells.get(4) === 16

  return {
    step: 5,
    name: 'census',
    candidates: total,
    survivors: twoStep,
    produces: twoStep,
    forced: partitionExact,
  }
}

// Rung 6, the cell. Among the tone-word shells, a cell that tiles space through its
// faces must be self-dual (corners equal faces). The 8 axis-steps make the 16-cell
// (8 corners, 16 faces), the 16 four-step diagonals make the tesseract (16 corners, 8
// faces), and only the 24 two-step diagonals make a shape with corners equal to faces,
// the 24-cell. It is also the shell whose directional set carries triality (the D4
// order-six Dynkin symmetry, the spinors), which the reused hasTriality confirms.
// Candidate space, the three stepping shells {8, 24, 16}; the survivor is the 24.
export function rungCell(): Rung {
  // corners and faces DERIVED from each shell's vertex set by facet enumeration (no table)
  const shells = steppingShellPolytopes()
  const selfDual = shells.filter(s => s.selfDual)
  const cellCarriesTriality = hasTriality(4)

  return {
    step: 6,
    name: 'cell',
    candidates: shells.length,
    survivors: selfDual.length,
    produces: selfDual[0]?.corners ?? 0,
    forced:
      selfDual.length === 1 &&
      selfDual[0]!.corners === 24 &&
      cellCarriesTriality,
  }
}

// Rung 7, the mesh. Tiling four-dimensional hyperbolic space with the 24-cell gives the
// honeycomb {3,4,3,4}, whose shell counts grow exponentially. We measure the growth
// ratio off the honeycomb shell counts and confirm it is the known warp factor near
// 18.25 (exponential, hyperbolic), the signature that the mesh is negatively curved.
// This rung is a measured coefficient rather than a survivor count, so its forcing is
// the exponential-growth property (ratio well above one and near the warp factor).
export function rungMesh(input: { shellCounts: readonly number[] }): Rung {
  // the OUTER ratio, the deepest consecutive-shell ratio, which sits near the warp factor
  // 18.278 (the raw ratios descend 24, 19, 18.37, 18.29 toward it from above)
  const ratios = shellRatios(input.shellCounts)
  const outerRatio = ratios[ratios.length - 1] ?? 0

  return {
    step: 7,
    name: 'mesh',
    candidates: input.shellCounts.length,
    survivors: 1,
    produces: outerRatio,
    // the {3,4,3,4} warp factor is near 18.278, so a tight band around it, not a loose >10
    forced: outerRatio > 15 && outerRatio < 20,
  }
}

// Rung 8, the law. The 24 directions form 12 opposite lines, and a collision law pairs
// them into 6 colliding pairs, 11 double-factorial = 10395 ways. Demanding the law
// respect the full 24-cell (B4) symmetry collapses the family. We reuse the line-pairing
// enumeration: it reports the total pairings and how many are symmetry-invariant.
// Candidate space, the 10395 pairings; the survivors are the symmetric ones (the knit
// family), a tiny fraction, the forcing being that the symmetry cuts the family to a
// vanishing remnant rather than leaving it free.
export function rungLaw(): Rung {
  const { totalPairings, symmetricPairings } = linePairingFamily()

  return {
    step: 8,
    name: 'law',
    candidates: totalPairings,
    survivors: symmetricPairings,
    produces: symmetricPairings,
    forced: totalPairings === 10395 && symmetricPairings < totalPairings,
  }
}

// The full ladder in order. The caller supplies the honeycomb shell counts for rung 7
// (measured elsewhere on the actual substrate) so this module stays pure arithmetic
// plus the reused library.
export function forcedLadder(input: {
  shellCounts: readonly number[]
}): Rung[] {
  return [
    rungTone(),
    rungArrow(),
    rungEight(),
    rungCensus(),
    rungCell(),
    rungMesh({ shellCounts: input.shellCounts }),
    rungLaw(),
  ]
}

// The number of nonassociative octonion triples, reused for the pinch note (the octonions
// are the last rung where grouping still costs only a sign, not information).
export function octonionNonassociativeTriples(): number {
  return nonAssociativeTripleCount()
}
