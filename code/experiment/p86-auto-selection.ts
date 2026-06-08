// P86: does a local rule deterministically pick {5,3,4}? (Implements todo T4.)
//
// The claim from how-reflection-and-selection-work.md: two principles pick the crystal almost
// entirely, with the golden 5 emerging rather than assumed.
//   1. Ternary tone -> three-valent cell vertices (q = 3).
//   2. Eternal growth + minimality -> the tightest clean (compact) eternal crystal.
// This experiment checks both computationally. With q = 3, the finite cells are the tetrahedron
// {3,3}, cube {4,3}, dodecahedron {5,3}. For each, find the fewest cells per edge (r) that
// overflows into a COMPACT hyperbolic honeycomb. The dodecahedron uniquely reaches it at the
// tightest closure r = 4 (three would close into the finite 120-cell), the cube needs five,
// the tetrahedron only goes paracompact. So {5,3,4} is the minimal eternal crystal with
// ternary vertices, and the 5 (the golden dodecahedron) is forced, not chosen.
// Run: npx tsx code/experiment/p86-auto-selection.ts

import { pathToFileURL } from 'node:url'
import { classifyGeometry, edgeRegime, dihedralAngleDegrees } from '~/substrate/coxeter/schlafli'

function isCompactHyperbolic(symbol: number[]): boolean {
  if (symbol.length < 2) return false
  if (classifyGeometry(symbol) !== 'hyperbolic') return false
  const cell = symbol.slice(0, -1)
  const vertexFigure = symbol.slice(1)
  return classifyGeometry(cell) === 'spherical' && classifyGeometry(vertexFigure) === 'spherical'
}

export function autoSelection(): {
  ternaryCells: { cell: string; finite: boolean; dihedral: number }[]
  minimalClosure: { cell: string; minimalCompactR: number | null; symbol: string | null }[]
  allQ3Compact: { symbol: string; r: number }[]
  tightestQ3: string | null
  forcedSymbol: string | null
  fiveIsForced: boolean
  solved: boolean
} {
  // The three-valent finite cells {p,3}: tetra, cube, dodeca (p = 3,4,5). p >= 6 is not finite.
  const ternaryCells = [3, 4, 5, 6].map((p) => ({
    cell: `{${p},3}`,
    finite: classifyGeometry([p, 3]) === 'spherical',
    dihedral: Math.round(dihedralAngleDegrees({ p, q: 3 }) * 10) / 10,
  }))

  // For each finite three-valent cell, the minimal r making {p,3,r} compact hyperbolic.
  const minimalClosure = [3, 4, 5].map((p) => {
    let minR: number | null = null
    for (let r = 3; r <= 8; r++) {
      if (isCompactHyperbolic([p, 3, r])) {
        minR = r
        break
      }
    }
    return {
      cell: `{${p},3}`,
      minimalCompactR: minR,
      symbol: minR === null ? null : `{${p},3,${minR}}`,
    }
  })

  // All compact hyperbolic honeycombs with three-valent cells (q = 3), and the tightest (min r).
  const allQ3Compact: { symbol: string; r: number }[] = []
  for (let p = 3; p <= 6; p++) {
    for (let r = 3; r <= 8; r++) {
      if (isCompactHyperbolic([p, 3, r])) allQ3Compact.push({ symbol: `{${p},3,${r}}`, r })
    }
  }
  let tightestQ3: string | null = null
  let bestR = Infinity
  for (const c of allQ3Compact) {
    if (c.r < bestR) {
      bestR = c.r
      tightestQ3 = c.symbol
    }
  }

  const forcedSymbol = tightestQ3
  // the 5 is forced: every q=3 compact honeycomb whose cell is the largest-angle finite cell
  // (the dodecahedron, p=5) is the one reaching eternal growth at the minimal closure
  const dodecaMin = minimalClosure.find((c) => c.cell === '{5,3}')?.minimalCompactR
  const cubeMin = minimalClosure.find((c) => c.cell === '{4,3}')?.minimalCompactR
  const tetraMin = minimalClosure.find((c) => c.cell === '{3,3}')?.minimalCompactR
  const fiveIsForced = dodecaMin === 4 && cubeMin === 5 && tetraMin === null

  const solved = forcedSymbol === '{5,3,4}' && fiveIsForced

  return {
    ternaryCells,
    minimalClosure,
    allQ3Compact,
    tightestQ3,
    forcedSymbol,
    fiveIsForced,
    solved,
  }
}

export function main(): void {
  const r = autoSelection()
  console.log('P86: does a local rule deterministically pick {5,3,4}?')
  console.log('')
  console.log('  step 1, ternary forces three-valent cells {p,3}. finite ones (the candidates):')
  for (const c of r.ternaryCells) {
    console.log(`    ${c.cell.padEnd(7)} finite=${c.finite}  dihedral=${c.dihedral} deg`)
  }
  console.log('')
  console.log('  step 2, minimal cells-per-edge for a COMPACT eternal crystal, per cell:')
  for (const c of r.minimalClosure) {
    const overflow = c.minimalCompactR
      ? edgeRegime({ p: Number(c.cell[1]), q: 3, r: c.minimalCompactR })
      : null
    const tag = c.symbol
      ? `-> ${c.symbol} (r=${c.minimalCompactR}, ${overflow?.totalAngleDegrees.toFixed(0)} deg)`
      : '-> none compact (paracompact only)'
    console.log(`    ${c.cell.padEnd(7)} ${tag}`)
  }
  console.log('')
  console.log(`  all q=3 compact hyperbolic honeycombs: ${r.allQ3Compact.map((c) => c.symbol).join(', ')}`)
  console.log(`  tightest (minimal cells per edge): ${r.tightestQ3}`)
  console.log(`  the 5 is forced (dodeca r=4, cube r=5, tetra none): ${r.fiveIsForced}`)
  console.log('')
  console.log(`  forced crystal: ${r.forcedSymbol}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
