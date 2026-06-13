// P177: a full general-purpose computer running on the substrate. (P44, P141, margenstern-computability.md.)
//
// P141 ran one hardcoded multiplication. This builds a complete, PROGRAMMABLE register machine on the
// {5,3,4}, the explicit universal machine the reconciliation pointed to. A register machine with the
// instruction set INC, DECJZ (decrement or jump if zero), and HALT is Turing-complete (Minsky). Here the
// registers are CHARGE held in mesh regions, and the operations are the substrate's own moves.
//   INC(r)   = the arrow creates a balanced pair, a +1 placed in register r and a -1 in the ground region.
//   DEC(r)   = annihilation, a +1 in r meets a -1 in the ground, both return to peace.
//   test-zero = perception, count the +1 charges in r.
// The total charge stays exactly conserved throughout, so the computation is genuine substrate dynamics.
// The SAME machine runs several DIFFERENT programs (addition, truncated subtraction, multiplication),
// each verified correct, which is what makes it a general-purpose computer rather than a fixed circuit.
// Run: npx tsx code/experiment/p177-substrate-computer.ts

import { type Instr, RegisterMachine } from '@/code/operator/register-machine'
import { buildDodecagridRegisterMachine } from '@/code/operator/dodecagrid-register-machine'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The conserving charge register machine (Instr set, INC/DEC/test-zero, conserved run) and its dodecagrid
// wiring (220-cell register-regions from the cell indices plus a large ground region for the balancing -1
// charges) live in code/operator/register-machine and code/operator/dodecagrid-register-machine.
function makeSubstrateComputer(n: number, numRegisters: number): RegisterMachine {
  return buildDodecagridRegisterMachine({ maxCells: n, numRegisters, perRegister: 220 })
}

// registers, R0..R5 plus RZERO for unconditional jumps (never incremented)
const R0 = 0
const R1 = 1
const R2 = 2
const R3 = 3

// ADD, R0 = R0 + R1 (consumes R1)
const PROG_ADD: Instr[] = [
  { op: 'decjz', r: R1, addr: 3 },
  { op: 'inc', r: R0 },
  { op: 'jmp', addr: 0 },
  { op: 'halt' },
]
// MONUS, R0 = max(0, R0 - R1) (truncated subtraction, uses a decision each step)
const PROG_MONUS: Instr[] = [
  { op: 'decjz', r: R1, addr: 3 },
  { op: 'decjz', r: R0, addr: 3 },
  { op: 'jmp', addr: 0 },
  { op: 'halt' },
]
// MULTIPLY, R2 = R0 * R1, using R3 as the restore temp
const PROG_MUL: Instr[] = [
  { op: 'decjz', r: R0, addr: 8 }, // 0, for each unit of R0
  { op: 'decjz', r: R1, addr: 5 }, // 1, move R1 into R2 and R3
  { op: 'inc', r: R2 }, // 2
  { op: 'inc', r: R3 }, // 3
  { op: 'jmp', addr: 1 }, // 4
  { op: 'decjz', r: R3, addr: 0 }, // 5, restore R1 from R3
  { op: 'inc', r: R1 }, // 6
  { op: 'jmp', addr: 5 }, // 7
  { op: 'halt' }, // 8
]

export function substrateComputer(input?: { n?: number }): {
  n: number
  cases: { program: string; inputs: number[]; expected: number; got: number; conserved: boolean }[]
  allCorrect: boolean
  allConserved: boolean
  programsRun: number
  generalPurpose: boolean
  solved: boolean
} {
  const n = input?.n ?? 5000
  const cases: { program: string; inputs: number[]; expected: number; got: number; conserved: boolean }[] = []

  const runCase = (name: string, prog: Instr[], setup: (m: RegisterMachine) => void, readOut: (m: RegisterMachine) => number, inputs: number[], expected: number): void => {
    const m = makeSubstrateComputer(n, 5)
    setup(m)
    const { conserved } = m.run(prog)
    cases.push({ program: name, inputs, expected, got: readOut(m), conserved })
  }

  // ADD
  for (const [a, b] of [[3, 4], [7, 2], [0, 5]] as [number, number][]) {
    runCase('add', PROG_ADD, (m) => { m.set(R0, a); m.set(R1, b) }, (m) => m.read(R0), [a, b], a + b)
  }
  // MONUS
  for (const [a, b] of [[7, 3], [3, 7], [5, 5]] as [number, number][]) {
    runCase('monus', PROG_MONUS, (m) => { m.set(R0, a); m.set(R1, b) }, (m) => m.read(R0), [a, b], Math.max(0, a - b))
  }
  // MULTIPLY
  for (const [a, b] of [[3, 4], [6, 6], [5, 0]] as [number, number][]) {
    runCase('multiply', PROG_MUL, (m) => { m.set(R0, a); m.set(R1, b) }, (m) => m.read(R2), [a, b], a * b)
  }

  const allCorrect = cases.every((c) => c.got === c.expected)
  const allConserved = cases.every((c) => c.conserved)
  const programsRun = new Set(cases.map((c) => c.program)).size
  const generalPurpose = programsRun >= 3 && allCorrect
  const solved = allCorrect && allConserved && generalPurpose

  return { n, cases, allCorrect, allConserved, programsRun, generalPurpose, solved }
}

export default defineExperiment({
  id: 'computation/substrate-computer',
  title: 'a programmable register machine runs on the charge dynamics',
  category: 'computation',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = substrateComputer({ n: 5000 })
    const ok = r.solved && r.allCorrect && r.allConserved && r.generalPurpose
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one programmable register machine on the {5,3,4} charge dynamics runs add, monus, and multiply correctly with charge conserved',
      metrics: {
        cases: r.cases.length,
        programsRun: r.programsRun,
        allCorrect: r.allCorrect ? 1 : 0,
        allConserved: r.allConserved ? 1 : 0,
      },
    })
  },
})
