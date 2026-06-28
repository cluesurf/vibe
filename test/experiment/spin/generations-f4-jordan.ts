// FRONTIER (triality to generations, the HONEST deep dive): the naive 8v/8s/8c reading fails
// (spin/triality-generations, vector + 2 chiralities, not 3 generations). But there is a REAL
// structural path through the substrate's own symmetry, and here we COMPUTE it rather than
// assert it. {3,4,3,4} has symmetry F4: its 24 directions are the 24 LONG roots of F4 (48 = 24
// long + 24 short). F4 = Aut(J3(O)), the exceptional Jordan algebra, the 27-dimensional 3x3
// Hermitian octonionic matrices, whose three-fold rank is Boyle's three-generation candidate.
//
// What is now COMPUTED, not hardcoded:
//   - the 24 substrate directions ARE the F4 long roots (reused from algebra/group/root-system),
//   - J3(O) has real dimension 27 (n + 8 n(n-1)/2 at n = 3),
//   - its diagonal Jordan frame is exactly THREE primitive idempotents, pairwise orthogonal,
//     each of trace 1, summing to the identity (the rank-3 structure, the three slots),
//   - and the reason it is three: the Jordan identity HOLDS for H_n(O) at n <= 3 and FAILS at
//     n = 4 (octonion non-associativity), so the three-fold is FORCED, with n = 4 as the
//     discriminating control.
//
// HONEST verdict: the structural chain is exact and the three-fold is forced, but identifying
// the three Jordan slots with three Standard Model generations is Boyle's OPEN conjecture, so
// the status stays PARTIAL, not pass. A genuine, controlled path, not a solved generation count.

import { rootsD4, rootsF4 } from '@/code/algebra/group/root-system'
import {
  areJordanOrthogonal,
  diagonalJordanFrame,
  hermitianOctonionDimension,
  isJordanIdempotent,
  maxJordanIdentityResidual,
  octonionMatrixAdd,
  octonionMatrixEquals,
  octonionMatrixIdentity,
  octonionMatrixTrace,
} from '@/code/algebra/jordan'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const vectorKey = (p: number[]): string =>
  p.map(x => Math.round(x * 1e4)).join(',')

export function generationsF4Jordan(): {
  longRootsAre3434: boolean
  f4Has48Roots: boolean
  jordanDimension: number
  jordanDim27: boolean
  frameSize: number
  frameIsRankThree: boolean
  jordanResidualAt3: number
  jordanResidualAt4: number
  threeFoldForced: boolean
  threeGenerationsEstablished: boolean
} {
  // the 24 {3,4,3,4} / D4 directions are exactly the LONG roots of F4 (norm squared 2).
  const d4 = rootsD4()
  const f4 = rootsF4()
  const longRoots = f4.filter(
    r => r.reduce((s, x) => s + x * x, 0) === 2,
  )

  const d4Keys = new Set(d4.map(vectorKey))
  const longRootsAre3434 =
    longRoots.length === 24 &&
    new Set(longRoots.map(vectorKey)).size === 24 &&
    longRoots.every(r => d4Keys.has(vectorKey(r)))

  const f4Has48Roots =
    f4.length === 48 && new Set(f4.map(vectorKey)).size === 48

  // F4 = Aut(J3(O)), the exceptional Jordan algebra. Its real dimension is computed, 27.
  const jordanDimension = hermitianOctonionDimension(3)
  const jordanDim27 = jordanDimension === 27

  // the Jordan frame: the three diagonal primitive idempotents. Computed to be a rank-3 frame,
  // each idempotent under the Jordan product, pairwise orthogonal, trace 1, summing to identity.
  const frame = diagonalJordanFrame(3)
  const allIdempotent = frame.every(isJordanIdempotent)
  const allTraceOne = frame.every(
    e => Math.abs(octonionMatrixTrace(e) - 1) < 1e-9,
  )

  const pairwiseOrthogonal =
    areJordanOrthogonal(frame[0]!, frame[1]!) &&
    areJordanOrthogonal(frame[0]!, frame[2]!) &&
    areJordanOrthogonal(frame[1]!, frame[2]!)

  const sumsToIdentity = octonionMatrixEquals(
    octonionMatrixAdd(
      octonionMatrixAdd(frame[0]!, frame[1]!),
      frame[2]!,
    ),
    octonionMatrixIdentity(3),
  )

  const frameSize = frame.length
  const frameIsRankThree =
    frameSize === 3 &&
    allIdempotent &&
    allTraceOne &&
    pairwiseOrthogonal &&
    sumsToIdentity

  // WHY three: the Jordan identity holds for H_n(O) at n <= 3 and fails at n = 4 (the octonions
  // are non-associative). The n = 4 case is the discriminating control, it MUST fail.
  const jordanResidualAt3 = maxJordanIdentityResidual(3)
  const jordanResidualAt4 = maxJordanIdentityResidual(4)
  const threeFoldForced =
    jordanResidualAt3 < 1e-9 && jordanResidualAt4 > 1e-3

  // the three-slot to three-generation identification is Boyle's open conjecture, NOT established.
  const threeGenerationsEstablished = false

  return {
    longRootsAre3434,
    f4Has48Roots,
    jordanDimension,
    jordanDim27,
    frameSize,
    frameIsRankThree,
    jordanResidualAt3,
    jordanResidualAt4,
    threeFoldForced,
    threeGenerationsEstablished,
  }
}

export default experiment({
  id: 'spin/generations-f4-jordan',
  code: 'E-SPN-0016',
  title:
    "the substrate F4 symmetry forces an exceptional rank-three Jordan structure, but three generations stays Boyle's open conjecture",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = generationsF4Jordan()
    // the full structural chain is now COMPUTED: substrate directions are the F4 long roots,
    // J3(O) is 27-dimensional, the Jordan frame is rank three, and three is forced because the
    // Jordan identity holds at n <= 3 and fails at n = 4. The generation identification is the
    // only open link, so the verdict is partial, not pass.
    const structureOk =
      r.longRootsAre3434 &&
      r.f4Has48Roots &&
      r.jordanDim27 &&
      r.frameIsRankThree &&
      r.threeFoldForced

    return verdict({
      status: structureOk ? 'partial' : 'fail',
      claim:
        "the 24 directions of {3,4,3,4} are the long roots of F4 = Aut(J3(O)), the 27-dimensional exceptional Jordan algebra has a computed rank-three frame of primitive idempotents, and three is forced because the Jordan identity holds at n <= 3 and fails at n = 4, but identifying those three slots with three Standard Model generations is Boyle's open conjecture, not established",
      metrics: {
        longRootsAre3434: r.longRootsAre3434 ? 1 : 0,
        f4Has48Roots: r.f4Has48Roots ? 1 : 0,
        jordanDim27: r.jordanDim27 ? 1 : 0,
        frameIsRankThree: r.frameIsRankThree ? 1 : 0,
        jordanResidualAt3: r.jordanResidualAt3,
        jordanResidualAt4: r.jordanResidualAt4,
        threeGenerationsEstablished: r.threeGenerationsEstablished
          ? 1
          : 0,
      },
      control: {
        // the n = 4 Hermitian octonion matrices are NOT a Jordan algebra, the identity fails by
        // order one, so the rank-three structure is special to n = 3, not an arbitrary choice.
        jordanIdentityResidualAtFour: r.jordanResidualAt4,
        jordanIsAlgebraAtFour: r.jordanResidualAt4 < 1e-9 ? 1 : 0,
      },
      notes:
        "L1, known math (the F4 root system, F4 = Aut(J3(O)), and the Jordan-von Neumann-Wigner classification). The structural chain is now COMPUTED, not asserted: the substrate directions are the F4 long roots (reused from algebra/group/root-system), J3(O) is built from the octonions in algebra/octonion and algebra/jordan, its rank-three frame is verified, and three is forced because the Jordan identity holds at n <= 3 and fails at n = 4 (the control). The headline claim, three Jordan slots equal three SM generations, is honestly reported as UNPROVEN (Boyle's conjecture), so the status is partial. This is a genuine, controlled path, strictly stronger than the naive 8v/8s/8c triality reading which fails.",
    })
  },
})
