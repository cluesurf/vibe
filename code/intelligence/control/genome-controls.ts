/**
 * Dishonest genome realizations for the improvement-loop experiment, as
 * isolated candidates: each is a learner or solver factory a candidate could
 * ship in place of the honest realization (genome/realize.ts).
 *
 * Candidate side: each runs in its own context and sees only handles.
 */

import type { TableLearner } from '@/code/intelligence/experience/experience'
import { readsBaseTable, type IntelligenceGenome } from '@/code/intelligence/genome/genome'
import { addCharge, realizedLearner, realizedSolver, type RealizedSolverArgs } from '@/code/intelligence/genome/realize'
import type { Operator } from '@/code/intelligence/operator/operator'
import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import { NO_PREPROCESSING, emptyLedger, type Solver } from '@/code/intelligence/solver/solver'

/** claims every problem solved where it starts, at no cost and no work */
export function selfGradingSolver<S>(): Solver<S> {
  return {
    id: 'self-grading',
    solve: problem => ({ states: [problem.initial], operators: [], cost: 0, solved: true, ledger: emptyLedger() }),
  }
}

/** reports no learning work at all */
export function hidingLearningLearner<S>(genome: IntelligenceGenome, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return { ...realizedLearner(genome, operators, key), spent: () => ({ ...NO_PREPROCESSING }) }
}

/** drops the learning charge from every ledger, keeping only the base table */
export function hidingChargeSolver<S>(args: RealizedSolverArgs, host: CandidateHost<S>): Solver<S> {
  const inner = realizedSolver(args, host)

  return {
    id: 'hiding-charge',
    solve(problem, operators) {
      const solution = inner.solve(problem, operators)

      solution.ledger.preprocessing = { ...args.base.preprocessing }

      return solution
    },
  }
}

/** The wrecked environment: problem ids that start with it (an environment with headline validation starts). */
export const WRECKED = 'obstacle-{6,4}-'

/**
 * Honest everywhere except one environment, where it gives up at once (a
 * clean, unsolved answer). Under a genome whose mean beats its parent's, it
 * raises the mean while wrecking that environment, which the mean-only rule
 * adopts and the harm rule refuses. The wrecking itself lowers the mean
 * against its honest twin; the experiment reports both.
 */
export function wreckingSolver<S>(args: RealizedSolverArgs, host: CandidateHost<S>): Solver<S> {
  const honest = realizedSolver(args, host)

  return {
    id: 'wrecking',
    solve(problem, operators) {
      if (!problem.id.startsWith(WRECKED)) {
        return honest.solve(problem, operators)
      }

      const ledger = emptyLedger()

      ledger.preprocessing = addCharge(readsBaseTable(args.genome) ? args.base.preprocessing : NO_PREPROCESSING, args.learningCharge)

      return { states: [problem.initial], operators: [], cost: 0, solved: false, ledger }
    },
  }
}

/** a learned table handed over with its lookups overridden: no plain data, values computed on demand */
export function lazyTableLearner<S>(genome: IntelligenceGenome, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const inner = realizedLearner(genome, operators, key)

  return {
    ...inner,
    table() {
      const real = inner.table()

      return Object.assign(new Map<string, number>(), {
        get: (entry: string) => real.get(entry),
        has: (entry: string) => real.has(entry),
      })
    },
  }
}

/** the same learner handing over an empty table: what the lazy one must be graded as */
export function emptyTableLearner<S>(genome: IntelligenceGenome, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return { ...realizedLearner(genome, operators, key), table: () => new Map<string, number>() }
}
