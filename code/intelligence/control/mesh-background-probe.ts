/**
 * A control solver for the evaluator's metered mesh round on a declared background.
 * It asks the evaluator for one batch of runs of a layout it is handed as
 * data, every run labelled with the problem's initial state, and reports the read cells it was answered in its id
 * ('mesh-background-probe <digits>', residue digits 0, 1, 2 for 0, +1, -1), so a judge can compare them with its own
 * runs. The initial state is the goal: the solve itself is empty, only the metered runs matter.
 *
 * The layout is passed through as the args give it, `background` included or left out, so the evaluator alone decides
 * whether it is valid: a wrong background reaches the evaluator unchanged and must be refused there.
 *
 * Candidate side: imports only interfaces and the solver ledger. Exact integers, no random numbers.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { emptyLedger, type Solver } from '@/code/intelligence/solver/solver'

export interface BackgroundProbeArgs {
  rule: string
  /** start, window, inputs, readPosition, readRound and, when declared, background: handed on unchanged */
  layout: Record<string, unknown>
  /** the input trits, run after run */
  words: number[]
  /** the number of trits in one run's word */
  arity: number
  step: number
  /** the number of runs when `arity` is 0 */
  runs?: number
}

export interface BackgroundProbeHost<S> {
  meshRuns: (
    rule: string,
    layout: Record<string, unknown>,
    step: number,
    nodes: readonly S[],
    words: readonly number[],
  ) => { values: number[]; pairUpdates: number; frameDigest: number }
}

export const BACKGROUND_PROBE_ID = 'mesh-background-probe'

export function meshBackgroundProbe<S>(args: BackgroundProbeArgs, host: CandidateHost<S> & BackgroundProbeHost<S>): Solver<S> {
  const probe: Solver<S> = {
    id: BACKGROUND_PROBE_ID,
    solve(problem: Problem<S>) {
      const ledger = emptyLedger()
      // a layout with no inputs (refused by the evaluator) is asked for `runs` empty words
      const runs = args.arity === 0 ? (args.runs ?? 0) : args.words.length / args.arity

      if (!Number.isInteger(runs) || runs < 1) {
        throw new Error('mesh-background-probe: the words are not whole runs')
      }

      const nodes = Array.from({ length: runs }, () => problem.initial)
      const reply = host.meshRuns(args.rule, args.layout, args.step, nodes, args.words)

      if (reply.values.length !== runs) {
        throw new Error('mesh-background-probe: the evaluator answered a different number of runs')
      }

      probe.id = `${BACKGROUND_PROBE_ID} ${reply.values.map(v => (v === -1 ? '2' : String(v))).join('')}`

      return { states: [problem.initial], operators: [], cost: 0, solved: problem.goal(problem.initial), ledger }
    },
  }

  return probe
}
