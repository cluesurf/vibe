// P163: higher-level affordances, the ladder is open upward. (P122, level-relative-possibility.md.)
//
// A structure impossible at one level can become possible at a HIGHER composite level. The cleanest case
// is representational capacity, a single base cell is TERNARY (3 states), but a BLOCK of m cells has a far
// richer alphabet, its net charge alone takes 2m+1 values, and its full pattern takes 3^m. So a K-ary
// symbol with K > 3 is IMPOSSIBLE to store in one base cell but trivial in a block, and the capacity keeps
// growing with each level up. We confirm, the base alphabet is 3, a block of 3 cells stores 7 distinct
// symbols (charge -3..+3), we store and READ BACK every one of them (impossible for a ternary cell), and
// the alphabet strictly increases up the ladder. Run: npx tsx code/experiment/p163-higher-affordances.ts

import { pathToFileURL } from 'node:url'

// store an integer symbol in a block of m cells as its net charge (a value in -m..+m), then read it back
function encodeCharge(value: number, m: number): Int8Array {
  // value in [-m, m], represent with (value) net charge, balanced fill otherwise
  const cell = new Int8Array(m)
  let v = value
  for (let i = 0; i < m && v > 0; i++, v--) cell[i] = 1
  for (let i = m - 1; i >= 0 && v < 0; i--, v++) if (cell[i] === 0) cell[i] = -1
  return cell
}
const readCharge = (cell: Int8Array): number => {
  let s = 0
  for (let i = 0; i < cell.length; i++) s += cell[i]!
  return s
}

export function higherAffordances(): {
  baseAlphabet: number
  blockChargeAlphabet: number
  blockPatternAlphabet: number
  symbolsStored: number
  allReadBack: boolean
  alphabetGrowsUpLadder: boolean
  ladder: { level: number; cells: number; chargeStates: number; patternStates: number }[]
  beatsBase: boolean
  solved: boolean
} {
  const baseAlphabet = 3 // a single cell, {-1, 0, +1}

  // a block of m=3 cells, store and read back every symbol in its charge alphabet (-3..+3 = 7 values)
  const m = 3
  const blockChargeAlphabet = 2 * m + 1 // 7
  const blockPatternAlphabet = 3 ** m // 27
  let allReadBack = true
  let symbolsStored = 0
  for (let value = -m; value <= m; value++) {
    const cell = encodeCharge(value, m)
    if (readCharge(cell) !== value) allReadBack = false
    symbolsStored++
  }

  // the alphabet up the ladder, each level groups blocks of 3 from the level below
  const ladder: { level: number; cells: number; chargeStates: number; patternStates: number }[] = []
  let cells = 1
  for (let level = 0; level < 4; level++) {
    ladder.push({ level, cells, chargeStates: 2 * cells + 1, patternStates: Math.min(3 ** Math.min(cells, 20), 1e15) })
    cells *= 3
  }
  let alphabetGrowsUpLadder = true
  for (let i = 1; i < ladder.length; i++) if (ladder[i]!.chargeStates <= ladder[i - 1]!.chargeStates) alphabetGrowsUpLadder = false

  const beatsBase = blockChargeAlphabet > baseAlphabet // a K-ary symbol with K>3 is impossible at the base
  const solved = allReadBack && beatsBase && alphabetGrowsUpLadder && symbolsStored === blockChargeAlphabet

  return { baseAlphabet, blockChargeAlphabet, blockPatternAlphabet, symbolsStored, allReadBack, alphabetGrowsUpLadder, ladder, beatsBase, solved }
}

export function main(): void {
  const r = higherAffordances()
  console.log('P163: higher-level affordances, the ladder is open upward')
  console.log('')
  console.log(`  base cell alphabet: ${r.baseAlphabet} states (ternary)`)
  console.log(`  a block of 3 cells: ${r.blockChargeAlphabet} charge-states (or ${r.blockPatternAlphabet} patterns), strictly richer`)
  console.log(`  stored and read back all ${r.symbolsStored} symbols of the 7-ary alphabet (impossible for a ternary cell): ${r.allReadBack}`)
  console.log('')
  console.log('  alphabet up the ladder (each level groups 3 from below):')
  for (const l of r.ladder) console.log(`    level ${l.level}: ${l.cells} cells -> ${l.chargeStates} charge-states`)
  console.log('')
  console.log(`  a structure (a K>3 symbol) impossible at the base is possible higher, and capacity grows up: ${r.solved}`)
  console.log('  => the affordance ladder is genuinely open upward, higher levels realize what lower ones cannot.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
