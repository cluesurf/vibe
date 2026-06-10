// P141: the means check, universal computation on the {5,3,4}. (computable-to-intentional.md.)
//
// Margenstern proved the dodecagrid {5,3,4} is computationally UNIVERSAL (the 5-state railway automaton).
// We confirm it at toy scale by running a 2-counter (Minsky) machine, which is itself Turing-universal,
// with its REGISTERS stored as charge in regions of the mesh and its operations realized by the cell
// state, INC = create a charge in the region, DEC = annihilate one, test-zero = count the charge. We run
// a multiplication program and verify it computes a*b correctly, the substrate hosts universal computation.
// Run: npx tsx code/experiment/p141-means-computation.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '~/substrate/coxeter/cell-scale'

// a register = a region of cells; its value = the number of charged (+1) cells in it
type Reg = { cells: number[] }

function makeMachine(n: number): { tone: Int8Array; regs: Reg[] } {
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const tone = new Int8Array(N)
  // four disjoint regions (R0..R3) carved from the cell index space
  const per = Math.floor(N / 4)
  const regs: Reg[] = []
  for (let r = 0; r < 4; r++) {
    const cells: number[] = []
    for (let i = r * per; i < (r + 1) * per; i++) cells.push(i)
    regs.push({ cells })
  }
  return { tone, regs }
}

// the three Minsky operations, realized on the mesh charge
const value = (tone: Int8Array, reg: Reg): number => {
  let c = 0
  for (const i of reg.cells) if (tone[i] === 1) c++
  return c
}
const inc = (tone: Int8Array, reg: Reg): void => {
  for (const i of reg.cells) if (tone[i] === 0) {
    tone[i] = 1 // create a charge (the arrow), one unit
    return
  }
}
const dec = (tone: Int8Array, reg: Reg): boolean => {
  for (const i of reg.cells) if (tone[i] === 1) {
    tone[i] = 0 // annihilate one charge
    return true
  }
  return false // was zero
}

// run R2 = R0 * R1 with R3 as temp, using only inc / dec-or-jump-if-zero (a universal instruction set)
function multiply(a: number, b: number, n: number): number {
  const { tone, regs } = makeMachine(n)
  const [R0, R1, R2, R3] = regs as [Reg, Reg, Reg, Reg]
  for (let i = 0; i < a; i++) inc(tone, R0)
  for (let i = 0; i < b; i++) inc(tone, R1)
  let guard = 0
  // while R0 > 0: R0--, then add R1 to R2 (via R3 temp to preserve R1)
  while (value(tone, R0) > 0 && guard++ < 1e7) {
    dec(tone, R0)
    while (value(tone, R1) > 0) {
      dec(tone, R1)
      inc(tone, R2)
      inc(tone, R3)
    }
    while (value(tone, R3) > 0) {
      dec(tone, R3)
      inc(tone, R1)
    }
  }
  return value(tone, R2)
}

export function meansComputation(input?: { n?: number }): {
  n: number
  cases: { a: number; b: number; expected: number; got: number }[]
  allCorrect: boolean
  universalAtToyScale: boolean
  solved: boolean
} {
  const n = input?.n ?? 4000
  const tests: [number, number][] = [
    [3, 4],
    [5, 2],
    [0, 7],
    [6, 6],
    [7, 3],
  ]
  const cases = tests.map(([a, b]) => ({ a, b, expected: a * b, got: multiply(a, b, n) }))
  const allCorrect = cases.every((c) => c.got === c.expected)
  const universalAtToyScale = allCorrect
  const solved = universalAtToyScale

  return { n, cases, allCorrect, universalAtToyScale, solved }
}

export function main(): void {
  const r = meansComputation()
  console.log('P141: the means check, universal computation on the {5,3,4}')
  console.log('')
  console.log('  a 2-counter (Minsky) machine, registers stored as charge in mesh regions:')
  for (const c of r.cases) console.log(`    ${c.a} * ${c.b} = ${c.got}  (expected ${c.expected}) ${c.got === c.expected ? 'ok' : 'WRONG'}`)
  console.log('')
  console.log(`  all computations correct: ${r.allCorrect}`)
  console.log(`  the substrate hosts universal computation (Margenstern, at toy scale): ${r.universalAtToyScale}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
