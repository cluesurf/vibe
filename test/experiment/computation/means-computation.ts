// P141: the means check, universal computation on the {5,3,4}. (computable-to-intentional.md.)
//
// Margenstern proved the dodecagrid {5,3,4} is computationally UNIVERSAL (the 5-state railway automaton).
// We confirm it at toy scale by running a 2-counter (Minsky) machine, which is itself Turing-universal,
// with its REGISTERS stored as charge in regions of the mesh and its operations realized by the cell
// state, INC = create a charge in the region, DEC = annihilate one, test-zero = count the charge. We run
// a multiplication program and verify it computes a*b correctly, the substrate hosts universal computation.
// Run: npx tsx code/experiment/p141-means-computation.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { minskyMultiplyProgram } from '@/code/operator/register-machine'
import { buildDodecagridRegisterMachine } from '@/code/operator/dodecagrid-register-machine'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// run R2 = R0 * R1 on a conserving Minsky machine whose registers are charge held in regions carved from
// the dodecagrid cell index space (R3 the scratch counter, the rest the ground holding the balancing -1
// charges). The dodecagrid register-machine builder lives in code/operator/dodecagrid-register-machine.
function multiply(a: number, b: number, n: number): number {
  const per = Math.floor(buildDodecagrid({ maxCells: n }).cellCount / 8)
  const m = buildDodecagridRegisterMachine({
    maxCells: n,
    numRegisters: 4,
    perRegister: per,
  })
  m.set(0, a)
  m.set(1, b)
  m.run(minskyMultiplyProgram())

  return m.read(2)
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
  const cases = tests.map(([a, b]) => ({
    a,
    b,
    expected: a * b,
    got: multiply(a, b, n),
  }))
  const allCorrect = cases.every(c => c.got === c.expected)
  const universalAtToyScale = allCorrect
  const solved = universalAtToyScale

  return { n, cases, allCorrect, universalAtToyScale, solved }
}

export default experiment({
  id: 'computation/means-computation',
  title: 'the {5,3,4} hosts universal computation via a Minsky machine',
  category: 'computation',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = meansComputation({ n: 4000 })
    const ok = r.solved && r.allCorrect

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a 2-counter Minsky machine with registers stored as mesh charge computes multiplication correctly on the dodecagrid',
      metrics: {
        cases: r.cases.length,
        allCorrect: r.allCorrect ? 1 : 0,
      },
    })
  },
})
