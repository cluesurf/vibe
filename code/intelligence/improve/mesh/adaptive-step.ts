/**
 * Level 6, slice 4: one adaptive proposer step as a solve the evaluator meters, in a reactive cell on its
 * background. The step problem's initial state holds both candidates' contents (genome word, then a tag), the score
 * tone the evaluator wrote for each, P (the child's edit, as bits) and Q (the current lead). The solver
 *
 * 1. selects: asks the evaluator for one run per content trit of the cell's tie-holding selector, word [a_k, b_k, sA, sB];
 * 2. carries: the read of the tag trit is the control input of every stage-2 run;
 * 3. steers: one run per lead bit of the cell's mux, word [c, P_j, Q_j];
 * 4. writes every read into the output, one metered operator application each.
 *
 * The rule, the layouts (each naming the cell's background) and the declared semantics come as data in the factory's
 * arguments. Arms: the honest step; select only (no stage 2); the smuggler (the same outputs from the written tones and
 * the declared semantics, no run asked); the carrier forger (stage 2 fed the child's tag whatever stage 1 read); the
 * score forger (stage 1 run with tones of its own that always route the child). The judge tells them apart by the meter.
 *
 * Candidate side: imports only interfaces and the solver ledger. Exact integers, no random numbers.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { hold, type Held } from '@/code/intelligence/solver/search/expand'
import { emptyLedger, type Solver } from '@/code/intelligence/solver/solver'

/** A brick-line layout as the evaluator takes it, its background always stated. */
export interface StepLayout {
  start: number
  window: number[]
  inputs: number[]
  readPosition: number
  readRound: number
  background: number
}

export interface StepRunsReply {
  values: number[]
  pairUpdates: number
  frameDigest: number
}

export interface StepHost<S> {
  meshRuns: (rule: string, layout: StepLayout, step: number, nodes: readonly S[], words: readonly number[]) => StepRunsReply
}

export const SELECT_STEP = 0
export const STEER_STEP = 1

export const WRITES: Readonly<Record<number, string>> = { [-1]: 'write-minus', 0: 'write-zero', 1: 'write-plus' }

export type StepMode = 'mesh' | 'smuggled' | 'forged-carrier' | 'forged-scores'

export interface StepArgs {
  id: string
  rule: string
  select: StepLayout
  /** null: select only */
  steer: StepLayout | null
  mode: StepMode
  /** the declared semantics, read only by the smuggler: 1 when the selector routes B, per tone pair (tA + 1) * 3 + (tB + 1) */
  routesB: number[]
  /** the tag value at which the mux copies P (the child's tag) */
  copyPAt: number
  /** the score forger's tones */
  forged: { scoreA: number; scoreB: number }
}

/** One step instance, as the initial state's key spells it. */
export interface StepInstance {
  a: number[]
  b: number[]
  scoreA: number
  scoreB: number
  p: number[]
  q: number[]
  out: number[]
}

const toneChar = (t: number): string => (t === 1 ? '+' : t === -1 ? '-' : '0')
const text = (word: readonly number[]): string => word.map(toneChar).join('')

/** The canonical key of a step state. */
export function stepKey(s: StepInstance): string {
  return `step a=${text(s.a)} b=${text(s.b)} sA=${s.scoreA} sB=${s.scoreB} p=${text(s.p)} q=${text(s.q)} out=${text(s.out)}`
}

const KEY = /^step a=([-0+]+) b=([-0+]+) sA=(-1|0|1) sB=(-1|0|1) p=([-0+]*) q=([-0+]*) out=([-0+]*)$/

/** The instance a key spells, or null. */
export function parseStepKey(key: string): StepInstance | null {
  const m = KEY.exec(key)

  if (m === null || m[1]!.length !== m[2]!.length || m[5]!.length !== m[6]!.length) {
    return null
  }

  const word = (t: string): number[] => Array.from(t, c => (c === '+' ? 1 : c === '-' ? -1 : 0))

  return { a: word(m[1]!), b: word(m[2]!), scoreA: Number(m[3]), scoreB: Number(m[4]), p: word(m[5]!), q: word(m[6]!), out: word(m[7]!) }
}

type Host<S> = CandidateHost<S> & StepHost<S>

function stepSolver<S>(args: StepArgs, host: Host<S>): Solver<S> {
  return {
    id: args.id,
    solve(problem: Problem<S>, operators) {
      const ledger = emptyLedger()
      const held: Held = { states: 0, bytes: 0 }
      const instance = parseStepKey(problem.key(problem.initial))

      if (instance?.out.length !== 0) {
        throw new Error('adaptive-step: the initial state is not a fresh step instance')
      }

      const n = instance.a.length
      const m = args.steer === null ? 0 : instance.p.length

      hold(problem, held, ledger, problem.initial)

      const values: number[] = []

      if (args.mode === 'smuggled') {
        const routesB = args.routesB[(instance.scoreA + 1) * 3 + instance.scoreB + 1] === 1
        const winner = routesB ? instance.b : instance.a

        values.push(...winner)

        const tag = winner[n - 1]!

        for (let j = 0; j < m; j++) {
          values.push(tag === args.copyPAt ? instance.p[j]! : instance.q[j]!)
        }
      } else {
        const scoreA = args.mode === 'forged-scores' ? args.forged.scoreA : instance.scoreA
        const scoreB = args.mode === 'forged-scores' ? args.forged.scoreB : instance.scoreB
        const words: number[] = []

        for (let k = 0; k < n; k++) {
          words.push(instance.a[k]!, instance.b[k]!, scoreA, scoreB)
        }

        const select = host.meshRuns(args.rule, args.select, SELECT_STEP, Array.from({ length: n }, () => problem.initial), words)

        if (select.values.length !== n) {
          throw new Error('adaptive-step: the evaluator answered a different number of select runs')
        }

        values.push(...select.values)

        if (args.steer !== null && m > 0) {
          // the carrier: the tag the mesh read is the control of every steer run
          const tag = args.mode === 'forged-carrier' ? args.copyPAt : select.values[n - 1]!
          const steerWords: number[] = []

          for (let j = 0; j < m; j++) {
            steerWords.push(tag, instance.p[j]!, instance.q[j]!)
          }

          const steer = host.meshRuns(args.rule, args.steer, STEER_STEP, Array.from({ length: m }, () => problem.initial), steerWords)

          if (steer.values.length !== m) {
            throw new Error('adaptive-step: the evaluator answered a different number of steer runs')
          }

          values.push(...steer.values)
        }
      }

      const byId = new Map(operators.map(operator => [operator.id, operator]))
      const states = [problem.initial]
      const path: string[] = []

      let state = problem.initial
      let cost = 0

      for (const value of values) {
        const operator = byId.get(WRITES[value] ?? '')

        if (operator === undefined) {
          throw new Error(`adaptive-step: a read of ${value} names no write`)
        }

        ledger.expansions++
        ledger.operatorCalls++

        if (!operator.applicable(state)) {
          throw new Error('adaptive-step: the output is already full')
        }

        ledger.operatorCalls += 2
        cost += operator.cost(state)
        state = operator.apply(state)
        ledger.generated++
        hold(problem, held, ledger, state)
        states.push(state)
        path.push(operator.id)
      }

      return { states, operators: path, cost, solved: problem.goal(state), ledger }
    },
  }
}

const argsOf = (raw: unknown, mode: StepMode): StepArgs => {
  const args = raw as StepArgs

  if (args === null || typeof args !== 'object' || typeof args.rule !== 'string' || args.mode !== mode) {
    throw new Error(`adaptive-step: arguments for ${mode} are malformed`)
  }

  return args
}

export function adaptiveStep<S>(args: unknown, host: Host<S>): Solver<S> {
  return stepSolver(argsOf(args, 'mesh'), host)
}

/** Claims to be the step; computes its outputs in its own code and asks for no run. */
export function smuggledStep<S>(args: unknown, host: Host<S>): Solver<S> {
  return stepSolver(argsOf(args, 'smuggled'), host)
}

/** Claims to be the step; feeds stage 2 the child's tag whatever stage 1 read. */
export function forgedCarrierStep<S>(args: unknown, host: Host<S>): Solver<S> {
  return stepSolver(argsOf(args, 'forged-carrier'), host)
}

/** Claims to be the step; runs stage 1 with score tones of its own. */
export function forgedScoresStep<S>(args: unknown, host: Host<S>): Solver<S> {
  return stepSolver(argsOf(args, 'forged-scores'), host)
}
