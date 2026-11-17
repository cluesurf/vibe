// MARGENSTERN'S RAILWAY, SWITCH LEVEL: a register machine compiled to one circuit of fixed, flip-flop and
// memory switches, run by one locomotive, and checked against direct evaluation of the machine.
//
// The railway is Stewart's (1994), as Margenstern uses it for his universal automata on {7,3}, {5,4} and
// {5,3,4} (Cellular Automata in Hyperbolic Spaces, Vol II 4.2, arXiv:0903.2108, arXiv:1510.09129). The switch
// rule, the one-bit element and the register unit are his. The wiring of the control is ours, rebuilt from
// the same three switches because his figures 12, 13 and 17 are drawings (code/compute/railway-circuit.ts).
//
// What is checked:
//   1. the switch rule on all 18 cases (3 kinds, 2 settings, 3 entry sides) against the definitions
//   2. one element read and rewritten from both bits, by running it
//   3. four programs over grids of inputs: add, double (two inc callers on one register), parity (two dec
//      callers on one register, with different zero targets) and multiply. Every run must halt with every
//      register equal to direct evaluation, and never cross a flip-flop passively
//   4. controls: the same circuits with every memory switch made fixed, and with every flip-flop made fixed.
//      A control that still computed would mean the switch kinds were not doing the work
//
// Depth L2: a known construction reproduced and checked end to end. No randomness.

import {
  PROGRAMS,
  type Circuit,
  type Program,
  type SwitchKind,
  addElement,
  addTerminal,
  compileProgram,
  connect,
  copyCircuit,
  crossSwitch,
  elementBit,
  evaluateProgram,
  makeCircuit,
  registerValue,
  replaceSwitchKind,
  runCircuit,
} from '@/code/compute/railway-circuit'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

/** The crossings a run may take before it counts as not halting. */
const LIMIT = 2_000_000

/** Each program with its input grid and the units each register gets. */
const CASES: {
  name: string
  program: Program
  inputs: number[][]
  units: (input: number[]) => number[]
}[] = [
  {
    name: 'add',
    program: PROGRAMS.add!,
    inputs: grid([5, 5]).map(([x, y]) => [x!, y!]),
    units: ([x, y]) => [Math.max(1, x! + y!), Math.max(1, y!)],
  },
  {
    name: 'double',
    program: PROGRAMS.double!,
    inputs: grid([5, 3]).map(([x, y]) => [x!, y!]),
    units: ([x, y]) => [Math.max(1, x!), Math.max(1, y! + 2 * x!)],
  },
  {
    name: 'parity',
    program: PROGRAMS.parity!,
    inputs: grid([8]).map(([x]) => [x!, 0]),
    units: ([x]) => [Math.max(1, x!), 1],
  },
  {
    name: 'multiply',
    program: PROGRAMS.multiply!,
    inputs: grid([4, 4]).map(([x, y]) => [x!, y!, 0, 0]),
    units: ([x, y]) => [
      Math.max(1, x!),
      Math.max(1, y!),
      Math.max(1, x! * y!),
      Math.max(1, y!),
    ],
  },
]

/** Every tuple 0 .. size - 1 in each place. */
function grid(sizes: number[]): number[][] {
  let tuples: number[][] = [[]]

  for (const size of sizes) {
    tuples = tuples.flatMap(t => Array.from({ length: size }, (_, v) => [...t, v]))
  }

  return tuples
}

/** The switch definitions of Vol II 4.2.1, written out case by case: exit port and setting after. */
function definition(
  kind: SwitchKind,
  selected: 1 | 2,
  entry: number,
): { exit: number; selected: 1 | 2; forbidden: boolean } {
  if (entry === 0) {
    // active: leave by the selected track. A flip-flop changes the track to be taken next time
    const next: 1 | 2 = kind === 'flip_flop' ? (selected === 1 ? 2 : 1) : selected

    return { exit: selected, selected: next, forbidden: false }
  }

  // passive: leave by the single track. A memory switch now selects the track just used. A flip-flop
  // must never be crossed this way
  return {
    exit: 0,
    selected: kind === 'memory' ? (entry === 1 ? 1 : 2) : selected,
    forbidden: kind === 'flip_flop',
  }
}

/** Run one element from bit b: read it, then write it, then read it again. */
function elementTrial(bit: 0 | 1): boolean {
  const results: boolean[] = []

  for (const action of ['read', 'write'] as const) {
    const circuit: Circuit = makeCircuit()
    const start = addTerminal(circuit, { kind: 'start', label: 'start' })
    const element = addElement(circuit, { bit, label: 'element' })
    const out0 = addTerminal(circuit, { kind: 'halt', label: 'read 0' })
    const out1 = addTerminal(circuit, { kind: 'halt', label: 'read 1' })
    const outWrite = addTerminal(circuit, { kind: 'halt', label: 'written' })
    const unused = addTerminal(circuit, { kind: 'stray', label: 'unused' })

    connect(circuit, element.readOut0, { node: out0, port: 0 })
    connect(circuit, element.readOut1, { node: out1, port: 0 })
    connect(circuit, element.writeOut, { node: outWrite, port: 0 })

    if (action === 'read') {
      connect(circuit, { node: start, port: 0 }, element.readIn)
      connect(circuit, { node: unused, port: 0 }, element.writeIn)
    } else {
      connect(circuit, { node: start, port: 0 }, element.writeIn)
      connect(circuit, { node: unused, port: 0 }, element.readIn)
    }

    const run = runCircuit({ circuit, start, limit: 100 })
    const after = elementBit(circuit, element)

    if (action === 'read') {
      results.push(run.ending === 'halt' && run.at === (bit === 1 ? out1 : out0) && after === bit)
    } else {
      results.push(run.ending === 'halt' && run.at === outWrite && after === 1 - bit)
    }
  }

  return results.every(Boolean)
}

/** Run every case on `transform` of its compiled circuit, counting the runs that match direct evaluation. */
function runAll({
  transform,
  limit,
}: {
  transform: (circuit: Circuit) => Circuit
  limit: number
}): {
  runs: number
  correct: number
  forbidden: number
  crossings: number
  longest: number
  switches: number
} {
  let longest = 0
  let runs = 0
  let correct = 0
  let forbidden = 0
  let crossings = 0
  let switches = 0

  for (const test of CASES) {
    for (const input of test.inputs) {
      const compiled = compileProgram({
        program: test.program,
        initial: input,
        units: test.units(input),
      })
      const circuit = transform(copyCircuit(compiled.circuit))
      const run = runCircuit({ circuit, start: compiled.start, limit })
      const want = evaluateProgram({ program: test.program, initial: input, limit: LIMIT })
      const got = compiled.registers.map(r => registerValue(circuit, r))

      runs += 1
      crossings += run.crossings
      longest = Math.max(longest, run.crossings)
      switches = Math.max(switches, compiled.circuit.nodes.length)
      forbidden += run.ending === 'forbidden' ? 1 : 0

      if (
        run.ending === 'halt' &&
        want.halted &&
        got.every((v, r) => v === want.registers[r])
      ) {
        correct += 1
      }
    }
  }

  return { runs, correct, forbidden, crossings, longest, switches }
}

export function railwaySwitches() {
  // 1. the switch rule against the definitions, all 18 cases
  let ruleCases = 0
  let ruleAgree = 0

  for (const kind of ['fixed', 'flip_flop', 'memory'] as SwitchKind[]) {
    for (const selected of [1, 2] as (1 | 2)[]) {
      for (const entry of [0, 1, 2]) {
        const got = crossSwitch({ kind, selected, entry })
        const want = definition(kind, selected, entry)

        ruleCases += 1
        ruleAgree +=
          got.exit === want.exit &&
          got.selected === want.selected &&
          got.forbidden === want.forbidden
            ? 1
            : 0
      }
    }
  }

  // 2. the element, from both bits
  const elementOk = elementTrial(0) && elementTrial(1)

  // 3. the programs
  const machine = runAll({ transform: circuit => circuit, limit: LIMIT })

  // 4. the controls, given ten times the crossings the longest true run took
  const limit = 10 * machine.longest
  const noMemory = runAll({
    transform: circuit =>
      replaceSwitchKind({ circuit, from: 'memory', to: 'fixed' }),
    limit,
  })
  const noFlipFlop = runAll({
    transform: circuit =>
      replaceSwitchKind({ circuit, from: 'flip_flop', to: 'fixed' }),
    limit,
  })

  return { ruleCases, ruleAgree, elementOk, machine, noMemory, noFlipFlop }
}

export default experiment({
  id: 'computation/railway-switches',
  code: 'E-CMP-0021',
  title:
    "Margenstern's railway at the switch level: fixed, flip-flop and memory switches wired into register machines compute add, double, parity and multiply, equal to direct evaluation on every input tried",
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = railwaySwitches()
    const machineOk =
      r.machine.correct === r.machine.runs && r.machine.forbidden === 0
    // a control must fail on some input where the machine does work
    const controlsFail =
      r.noMemory.correct < r.noMemory.runs &&
      r.noFlipFlop.correct < r.noFlipFlop.runs
    const ok =
      r.ruleAgree === r.ruleCases && r.elementOk && machineOk && controlsFail

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `one locomotive on a circuit of fixed, flip-flop and memory switches ran ${r.machine.runs} register-machine runs (add, double, parity, multiply) and halted with every register equal to direct evaluation in ${r.machine.correct} of them. With the memory switches made fixed ${r.noMemory.correct} of ${r.noMemory.runs} came out right, with the flip-flops made fixed ${r.noFlipFlop.correct} of ${r.noFlipFlop.runs}`,
      metrics: {
        ruleCasesAgree: r.ruleAgree,
        ruleCases: r.ruleCases,
        elementReadWriteOk: r.elementOk ? 1 : 0,
        runs: r.machine.runs,
        runsCorrect: r.machine.correct,
        forbiddenCrossings: r.machine.forbidden,
        switchCrossings: r.machine.crossings,
        largestCircuitNodes: r.machine.switches,
      },
      control: {
        memoryAsFixedCorrect: r.noMemory.correct,
        flipFlopAsFixedCorrect: r.noFlipFlop.correct,
      },
      notes:
        'L2, a known construction (Stewart 1994, Margenstern Vol II 4.2) reproduced and run. The switch rule, the one-bit element and the two-element register unit follow the sources. The control wiring (the toggle loop, the caller marks, the register exits) is rebuilt from the same three switches and is ours. The reference is a plain register-machine interpreter.',
    })
  },
})
