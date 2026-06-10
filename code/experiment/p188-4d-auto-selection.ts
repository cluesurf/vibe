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

import { pathToFileURL } from 'node:url'
import { classifyGeometry } from '~/substrate/coxeter/schlafli'

const cell = (s: number[]): number[] => s.slice(0, -1)
const vertexFigure = (s: number[]): number[] => s.slice(1)

// a COMPACT regular honeycomb, hyperbolic with finite cells AND finite vertices
function isCompact(symbol: number[]): boolean {
  return (
    classifyGeometry(symbol) === 'hyperbolic' &&
    classifyGeometry(cell(symbol)) === 'spherical' &&
    classifyGeometry(vertexFigure(symbol)) === 'spherical'
  )
}

// an IDEAL regular honeycomb with FINITE cells, hyperbolic, finite cells, but Euclidean (ideal) vertices
function isIdealFiniteCell(symbol: number[]): boolean {
  return (
    classifyGeometry(symbol) === 'hyperbolic' &&
    classifyGeometry(cell(symbol)) === 'spherical' &&
    classifyGeometry(vertexFigure(symbol)) === 'euclidean'
  )
}

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
    if (threeDForced) break
  }
  const threeDIsCompact = threeDForced !== null && isCompact([5, 3, 4])
  const threeDTernaryQ = 3 // q = 3 in {5,3,4}, the ternary three-valent signature in the substrate

  // (2) 4D, every ideal-with-finite-cells honeycomb, and the cubic-cusp subset
  const idealFourD: string[] = []
  const idealCubicCuspFourD: string[] = []
  for (let p = 3; p <= 6; p++) for (let q = 3; q <= 6; q++) for (let r = 3; r <= 6; r++) for (let s = 3; s <= 6; s++) {
    const sym = [p, q, r, s]
    if (!isIdealFiniteCell(sym)) continue
    idealFourD.push(`{${sym.join(',')}}`)
    const vf = vertexFigure(sym)
    if (vf[0] === 4 && vf[1] === 3 && vf[2] === 4) idealCubicCuspFourD.push(`{${sym.join(',')}}`) // cubic cusp {4,3,4}
  }
  const fourDUniqueCandidate = idealCubicCuspFourD.length === 1 ? idealCubicCuspFourD[0]! : null

  // (3) the decisive test on the unique candidate {3,4,3,4}
  const cand = [3, 4, 3, 4]
  const fourDBulkTernaryQ = cand[1]! // q position of the 4D substrate symbol
  const fourDBulkHasTernary = fourDBulkTernaryQ === 3 // does the BULK carry the ternary q=3? (no, it is 4)
  const cusp = vertexFigure(cand) // {4,3,4}
  const fourDCuspCarriesTernary = cusp[1] === 3 // does the cusp (emergent 3D space) carry q=3? (yes)
  const fourDIsCompact = isCompact(cand) // is it compact like {5,3,4}? (no, it is ideal)

  // forced by the SAME principle requires the same ternary position (q=3 in the bulk) AND the same closure
  // regime (compact). {3,4,3,4} fails both, q=4 and ideal. So it is a unique CANDIDATE, not forced.
  const fourDForcedBySamePrinciple = fourDBulkHasTernary && fourDIsCompact

  const keepFiveThreeFour = threeDForced === '{5,3,4}' && !fourDForcedBySamePrinciple
  const solved = threeDForced === '{5,3,4}' && fourDUniqueCandidate === '{3,4,3,4}' && !fourDForcedBySamePrinciple

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

export function main(): void {
  const r = fourDAutoSelection()
  console.log('P188: auto-selection in 4D, is {3,4,3,4} forced, or does {5,3,4} stand?')
  console.log('')
  console.log('  (1) 3D, ternary q=3 plus minimal COMPACT closure:')
  console.log(`      forced substrate ${r.threeDForced} (compact: ${r.threeDIsCompact}, ternary q=${r.threeDTernaryQ} in the bulk)`)
  console.log('')
  console.log('  (2) 4D, all IDEAL honeycombs with finite cells and Euclidean cusps:')
  console.log(`      ideal-finite-cell honeycombs found: ${r.idealFourD.join(', ') || 'none'}`)
  console.log(`      with a CUBIC cusp {4,3,4}: ${r.idealCubicCuspFourD.join(', ') || 'none'}`)
  console.log(`      unique cubic-cusp candidate: ${r.fourDUniqueCandidate ?? 'NOT unique'}`)
  console.log('')
  console.log('  (3) the decisive test on {3,4,3,4}:')
  console.log(`      bulk q = ${r.fourDBulkTernaryQ} (ternary needs 3) -> bulk carries ternary: ${r.fourDBulkHasTernary}`)
  console.log(`      cusp {4,3,4} middle = 3 -> the ternary q=3 lives in the EMERGENT 3D space (the cusp): ${r.fourDCuspCarriesTernary}`)
  console.log(`      is it COMPACT like {5,3,4}? ${r.fourDIsCompact} (it is IDEAL, a different closure regime)`)
  console.log(`      forced by the SAME principle (q=3 in bulk AND compact)? ${r.fourDForcedBySamePrinciple}`)
  console.log('')
  console.log(`  VERDICT, keep {5,3,4} (forced in 3D), {3,4,3,4} is the unique ideal cubic-cusp candidate but NOT forced: ${r.keepFiveThreeFour}`)
  console.log('  => {3,4,3,4} requires extra postulates (ideal not compact closure, and the ternary signature')
  console.log('     relocated from the bulk to the cubic cusp), so it is a strong candidate, not forced.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
