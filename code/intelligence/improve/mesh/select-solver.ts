/**
 * Level 6, slice 3 (level6.md): the selection step of the improve loop as a solve the evaluator meters. The selection
 * problem's initial state names both candidates' contents (genome words, content-code.ts) and the score tone the
 * evaluator wrote for each. The selector asks the evaluator for one run per content trit of E-CMP-0068's T1 selector
 * (`id.CBA.id` on the vacuum, window [a b sA sB], read at b's cell after 3 rounds) through `meshRuns` (decision 003):
 * it names the rule, gives the layout as data and the word [a_k, b_k, sA, sB], and the evaluator runs every round. It
 * then writes the read trits into the problem's output, one metered operator application each: that write is the
 * carrier, and the output is what the loop takes to the next generation.
 *
 * Arms: the honest selector; its knockout (the same layout and words under the identity rule, no dynamics); the
 * smuggler (picks in its own code from the written tones, asks for no run); the forger (asks for the runs with score
 * tones of its own that always route the child). The judge in the experiment tells them apart by the meter alone.
 *
 * Candidate side: imports only interfaces and the solver ledger. Exact integers, no random numbers.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { emptyLedger, type Solver } from '@/code/intelligence/solver/solver'
import { hold, type Held } from '@/code/intelligence/solver/search/expand'

/** A brick-line layout as the evaluator takes it (decision 003). */
export interface SelectLayout {
  start: number
  window: number[]
  inputs: number[]
  readPosition: number
  readRound: number
}

export interface SelectRunsReply {
  values: number[]
  pairUpdates: number
  frameDigest: number
}

/** The metered mesh round the sandbox bridge adds to every solver's host. */
export interface SelectHost<S> {
  meshRuns: (rule: string, layout: SelectLayout, step: number, nodes: readonly S[], words: readonly number[]) => SelectRunsReply
}

/** E-CMP-0068's three-level T1 selector, start parity 0 (parity 1 is not a selector: tmp/level6-loop/probe.ts). */
export const SELECT_RULE = 'id.CBA.id'
export const IDENTITY_RULE = 'id.ABC.id'
export const SELECT_LAYOUT: SelectLayout = { start: 0, window: [0, 0, 0, 0], inputs: [0, 1, 2, 3], readPosition: 1, readRound: 3 }

/** The evaluator's write: level -> tone in A's and B's score cell (E-CMP-0068's codes for this layout). */
export const CODE_A: readonly number[] = [-1, -1, 0]
export const CODE_B: readonly number[] = [-1, 0, 0]

/** The step every selection run is labelled with. */
export const SELECT_STEP = 0

export const WRITE_MINUS = 'write-minus'
export const WRITE_PLUS = 'write-plus'

/** One selection instance, as the initial state's key spells it. */
export interface SelectionInstance {
  a: number[]
  b: number[]
  scoreA: number
  scoreB: number
  out: number[]
}

const contentText = (word: readonly number[]): string => word.map(t => (t === 1 ? '+' : '-')).join('')

/** The canonical key of a selection state. */
export function selectionKey(instance: SelectionInstance): string {
  return `select a=${contentText(instance.a)} b=${contentText(instance.b)} sA=${instance.scoreA} sB=${instance.scoreB} out=${contentText(instance.out)}`
}

const KEY = /^select a=([+-]+) b=([+-]+) sA=(-1|0|1) sB=(-1|0|1) out=([+-]*)$/

/** The instance a key spells, or null when it is not a selection key. */
export function parseSelectionKey(key: string): SelectionInstance | null {
  const match = KEY.exec(key)

  if (match === null || match[1]!.length !== match[2]!.length) {
    return null
  }

  const word = (text: string): number[] => Array.from(text, c => (c === '+' ? 1 : -1))

  return { a: word(match[1]!), b: word(match[2]!), scoreA: Number(match[3]), scoreB: Number(match[4]), out: word(match[5]!) }
}

export interface SelectSettings {
  id: string
  rule: string
  /** mesh: the reads decide; smuggled: candidate code decides, no run; forged: runs with the forger's own score tones */
  decisions: 'mesh' | 'smuggled' | 'forged'
}

export const SELECT_ARMS: Readonly<Record<string, SelectSettings>> = {
  meshSelector: { id: 'mesh-selector', rule: SELECT_RULE, decisions: 'mesh' },
  knockoutSelector: { id: 'knockout-selector', rule: IDENTITY_RULE, decisions: 'mesh' },
  smuggledSelector: { id: 'mesh-selector', rule: SELECT_RULE, decisions: 'smuggled' },
  forgedSelector: { id: 'mesh-selector', rule: SELECT_RULE, decisions: 'forged' },
}

/** The forger's score tones: A occupied, B empty, which routes b. */
export const FORGED_SCORES = { scoreA: -1, scoreB: 0 } as const

type Host<S> = CandidateHost<S> & SelectHost<S>

function selectorSolver<S>(settings: SelectSettings, host: Host<S>): Solver<S> {
  return {
    id: settings.id,
    solve(problem: Problem<S>, operators) {
      const ledger = emptyLedger()
      const held: Held = { states: 0, bytes: 0 }
      const instance = parseSelectionKey(problem.key(problem.initial))

      if (instance?.out.length !== 0) {
        throw new Error('select-solver: the initial state is not a fresh selection instance')
      }

      const n = instance.a.length

      hold(problem, held, ledger, problem.initial)

      let values: number[]

      if (settings.decisions === 'smuggled') {
        // the rule the layout computes, evaluated here: b exactly when A's score cell is occupied and B's is empty
        const routesB = instance.scoreA !== 0 && instance.scoreB === 0

        values = routesB ? instance.b.slice() : instance.a.slice()
      } else {
        const scoreA = settings.decisions === 'forged' ? FORGED_SCORES.scoreA : instance.scoreA
        const scoreB = settings.decisions === 'forged' ? FORGED_SCORES.scoreB : instance.scoreB
        const words: number[] = []

        for (let k = 0; k < n; k++) {
          words.push(instance.a[k]!, instance.b[k]!, scoreA, scoreB)
        }

        const nodes = Array.from({ length: n }, () => problem.initial)
        const reply = host.meshRuns(settings.rule, SELECT_LAYOUT, SELECT_STEP, nodes, words)

        if (reply.values.length !== n) {
          throw new Error('select-solver: the evaluator answered a different number of runs')
        }

        values = reply.values
      }

      // the carrier: each read trit written into the output, one metered application each
      const byId = new Map(operators.map(operator => [operator.id, operator]))
      const states = [problem.initial]
      const path: string[] = []

      let state = problem.initial
      let cost = 0

      for (const value of values) {
        const id = value === 1 ? WRITE_PLUS : value === -1 ? WRITE_MINUS : null
        const operator = id === null ? undefined : byId.get(id)

        if (operator === undefined) {
          throw new Error(`select-solver: a read of ${value} names no write`)
        }

        ledger.expansions++
        ledger.operatorCalls++

        if (!operator.applicable(state)) {
          throw new Error('select-solver: the output is already full')
        }

        ledger.operatorCalls += 2
        cost += operator.cost(state)
        state = operator.apply(state)
        ledger.generated++
        hold(problem, held, ledger, state)
        states.push(state)
        path.push(operator.id)
      }

      return { states, operators: path, cost, solved: true, ledger }
    },
  }
}

const arm = (name: string): SelectSettings => {
  const settings = SELECT_ARMS[name]

  if (settings === undefined) {
    throw new Error(`select-solver: no arm ${name}`)
  }

  return settings
}

export function meshSelector<S>(_args: unknown, host: Host<S>): Solver<S> {
  return selectorSolver(arm('meshSelector'), host)
}

export function knockoutSelector<S>(_args: unknown, host: Host<S>): Solver<S> {
  return selectorSolver(arm('knockoutSelector'), host)
}

/** Claims to be the selector; picks in its own code and asks for no run. */
export function smuggledSelector<S>(_args: unknown, host: Host<S>): Solver<S> {
  return selectorSolver(arm('smuggledSelector'), host)
}

/** Claims to be the selector; asks for the runs with score tones of its own. */
export function forgedSelector<S>(_args: unknown, host: Host<S>): Solver<S> {
  return selectorSolver(arm('forgedSelector'), host)
}
