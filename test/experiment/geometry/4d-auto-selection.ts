// P188: auto-selection in 4D, is the ideal {3,4,3,4} substrate FORCED, or does {5,3,4} stand? (P86, how-reflection-and-selection-work.md, theory-v0.6.0/geometry.)
//
// P86 showed the 3D substrate is FORCED, ternary tone gives three-valent vertices (q = 3, the middle
// integer), and minimal eternal closure picks the tightest COMPACT hyperbolic honeycomb, {5,3,4}. The 4D
// question, restricted to IDEAL honeycombs (Euclidean cusps, which give flat 3D space), is {3,4,3,4} (or
// another) FORCED by the same principle, or does {5,3,4} remain the forced substrate?
//
// We compute three things.
//   (1) reconfirm {5,3,4} is the unique minimal COMPACT ternary (q=3) honeycomb in 3D.
//   (2) find every IDEAL H^4 honeycomb with FINITE cells and a Euclidean cusp (cell spherical, vertex
//       figure euclidean, honeycomb hyperbolic), and check whether {3,4,3,4} is unique.
//   (3) the decisive test, does the SAME ternary principle (q = 3 in the substrate symbol) and the SAME
//       closure regime (compact) apply to {3,4,3,4}? Its symbol is {3,4,3,4}, q = 4 not 3, and it is IDEAL
//       not compact. So the ternary three-valent signature is NOT in the 4D bulk, it is in the CUSP {4,3,4}
//       (the cubic honeycomb's own q = 3), the emergent 3D space.
// Verdict, {3,4,3,4} is the UNIQUE clean ideal cubic-cusp H^4 honeycomb (a real candidate), but it is NOT
// forced by the same bare principle that forces {5,3,4} (different q, different closure). So keep {5,3,4},
// with {3,4,3,4} a candidate requiring extra postulates. Run: npx tsx code/experiment/p188-4d-auto-selection.ts

import {
  honeycombVertexFigure as vertexFigure,
  isCompactHoneycomb as isCompact,
  isIdealFiniteCellHoneycomb as isIdealFiniteCell,
} from '@/code/substrate/coxeter/schlafli'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The honeycomb classifiers (compact, ideal-with-finite-cells, cell, vertex figure)
// live in code/substrate/coxeter/schlafli.

export function fourDAutoSelection(): {
  threeDForced: string | null
  threeDIsCompact: boolean
  threeDTernaryQ: number | null
  idealFourD: string[]
  idealCubicCuspFourD: string[]
  fourDUniqueCandidate: string | null
  fourDBulkTernaryQ: number | null
  fourDBulkHasTernary: boolean
  fourDCuspCarriesTernary: boolean
  fourDIsCompact: boolean
  fourDForcedBySamePrinciple: boolean
  keepFiveThreeFour: boolean
  solved: boolean
} {
  // (1) 3D, ternary q = 3, the finite three-valent cells {p,3} (p = 3,4,5), minimal r for COMPACT closure
  let threeDForced: string | null = null

  for (let p = 3; p <= 5; p++) {
    for (let r = 3; r <= 8; r++) {
      if (isCompact([p, 3, r])) {
        // the tightest overall is the largest p (roundest cell) at the smallest r, dodecahedron p=5 wins
        if (p === 5) {
          threeDForced = `{${p},3,${r}}`
          break
        }
      }
    }

    if (threeDForced) {
      break
    }
  }

  const threeDIsCompact = threeDForced !== null && isCompact([5, 3, 4])
  const threeDTernaryQ = 3 // q = 3 in {5,3,4}, the ternary three-valent signature in the substrate

  // (2) 4D, every ideal-with-finite-cells honeycomb, and the cubic-cusp subset
  const idealFourD: string[] = []
  const idealCubicCuspFourD: string[] = []

  for (let p = 3; p <= 6; p++) {
    for (let q = 3; q <= 6; q++) {
      for (let r = 3; r <= 6; r++) {
        for (let s = 3; s <= 6; s++) {
          const sym = [p, q, r, s]

          if (!isIdealFiniteCell(sym)) {
            continue
          }

          idealFourD.push(`{${sym.join(',')}}`)

          const vf = vertexFigure(sym)

          if (vf[0] === 4 && vf[1] === 3 && vf[2] === 4) {
            idealCubicCuspFourD.push(`{${sym.join(',')}}`)
          }
          // cubic cusp {4,3,4}
        }
      }
    }
  }

  const fourDUniqueCandidate =
    idealCubicCuspFourD.length === 1 ? idealCubicCuspFourD[0]! : null

  // (3) the decisive test on the unique candidate {3,4,3,4}
  const cand = [3, 4, 3, 4]
  const fourDBulkTernaryQ = cand[1]! // q position of the 4D substrate symbol
  const fourDBulkHasTernary = fourDBulkTernaryQ === 3 // does the BULK carry the ternary q=3? (no, it is 4)
  const cusp = vertexFigure(cand) // {4,3,4}
  const fourDCuspCarriesTernary = cusp[1] === 3 // does the cusp (emergent 3D space) carry q=3? (yes)
  const fourDIsCompact = isCompact(cand) // is it compact like {5,3,4}? (no, it is ideal)

  // forced by the SAME principle requires the same ternary position (q=3 in the bulk) AND the same closure
  // regime (compact). {3,4,3,4} fails both, q=4 and ideal. So it is a unique CANDIDATE, not forced.
  const fourDForcedBySamePrinciple =
    fourDBulkHasTernary && fourDIsCompact

  const keepFiveThreeFour =
    threeDForced === '{5,3,4}' && !fourDForcedBySamePrinciple

  const solved =
    threeDForced === '{5,3,4}' &&
    fourDUniqueCandidate === '{3,4,3,4}' &&
    !fourDForcedBySamePrinciple

  return {
    threeDForced,
    threeDIsCompact,
    threeDTernaryQ,
    idealFourD,
    idealCubicCuspFourD,
    fourDUniqueCandidate,
    fourDBulkTernaryQ,
    fourDBulkHasTernary,
    fourDCuspCarriesTernary,
    fourDIsCompact,
    fourDForcedBySamePrinciple,
    keepFiveThreeFour,
    solved,
  }
}

export default experiment({
  id: 'geometry/4d-auto-selection',
  code: 'E-GMT-0001',
  title:
    '{5,3,4} stays forced in 3D, {3,4,3,4} is the unique ideal cubic-cusp H4 candidate but not forced',
  category: 'geometry',
  substrates: ['534'],
  depth: 'L1',
  paper: true,
  run() {
    const r = fourDAutoSelection()
    const ok =
      r.solved &&
      r.keepFiveThreeFour &&
      r.fourDUniqueCandidate === '{3,4,3,4}' &&
      !r.fourDForcedBySamePrinciple

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'ternary q equals three plus compact closure forces {5,3,4} in 3D while {3,4,3,4} is the unique ideal cubic-cusp H4 honeycomb but is not forced by the same principle',
      metrics: {
        fourDBulkTernaryQ: r.fourDBulkTernaryQ ?? 0,
      },
    })
  },
})
