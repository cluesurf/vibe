/**
 * An experience is one attempt remembered: the problem, the path taken,
 * where it ended, what it was predicted to cost and what it did cost.
 * A learner observes experiences and proposes new operators.
 *
 * From the source's sections 15.3 and 15.4, with two changes: `utility`
 * is written by the evaluator from its own grade, never by the solver,
 * and a learner reports the work it spends, which is charged as
 * preprocessing to whatever solve uses what it learned.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import type { MeshState } from '@/code/intelligence/problem/state'
import type { Preprocessing, Solution } from '@/code/intelligence/solver/solver'

export interface Experience<S = MeshState> {
  problemId: string
  initial: S
  solution: Solution<S>
  /** the last state the path reached */
  outcome: S
  /** the cost the solver expected before it searched */
  predictedCost: number
  /** the path cost as the evaluator recomputed it */
  actualCost: number
  /** the evaluator's score of this attempt; elementary valence, reward and goodness stay separate quantities */
  utility: number
}

export interface Learner<S = MeshState> {
  id: string
  observe: (experience: Experience<S>) => void
  /** operators proposed from what was observed; pure and deterministic like every operator */
  proposeOperators: () => Operator<S>[]
  /** the total work spent observing and proposing so far */
  spent: () => Preprocessing
}

/**
 * A learner whose product is a table from state key to a learned value, as
 * the evaluator takes it at hand-over: a plain Map, copied out as data. A
 * learner may also hand over a report (plain data, such as the macros it
 * confirmed), which the evaluator passes on unread.
 */
export type TableLearner<S = MeshState> = Learner<S> & {
  table: () => ReadonlyMap<string, number>
  report?: () => unknown
}

/** How an isolated learner is built: from its arguments (data), the operators and key it is handed. */
export type LearnerFactory<A, S = unknown> = (args: A, operators: readonly Operator<S>[], key: (state: S) => string) => TableLearner<S>
