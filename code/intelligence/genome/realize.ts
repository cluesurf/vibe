/**
 * The one fixed reading of a genome: the learner it is taught with and the
 * solver it solves with. A genome is data; this file is the only code that
 * turns it into behavior, and it adds nothing the record does not name.
 *
 * Candidate side. It never imports the evaluator, a benchmark or a held-out
 * split (check:layers forbids it): everything it knows arrives as arguments
 * from the evaluator, which runs the teaching under its meter and decides
 * what the solve must be charged. The solver declares that charge in its
 * ledger and stops its search early enough that search plus preprocessing
 * stays inside the problem's budget and the genome's own cap.
 */

import type { Experience, Learner, TableLearner } from '@/code/intelligence/experience/experience'
import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import { valueTableLearner } from '@/code/intelligence/experience/learner/value-table'
import type { IntelligenceGenome } from '@/code/intelligence/genome/genome'
import { readsBaseTable } from '@/code/intelligence/genome/genome'
import { pathMacroDiscoverer } from '@/code/intelligence/operator/discovery/path-macro-discoverer'
import type { Operator } from '@/code/intelligence/operator/operator'
import type { Problem } from '@/code/intelligence/problem/problem'
import { NO_PREPROCESSING, emptyLedger, type Preprocessing, type Solver } from '@/code/intelligence/solver/solver'
import { aStarSolver, greedySolver } from '@/code/intelligence/solver/search/best-first'
import { breadthFirstSolver } from '@/code/intelligence/solver/search/breadth-first'
import type { Heuristic } from '@/code/intelligence/solver/search/expand'
import { iterativeDeepeningSolver } from '@/code/intelligence/solver/search/iterative-deepening'

export type GenomeLearner<S> = Learner<S> & {
  /** the learned cost-to-go table (empty without the value-table learner) */
  table: () => ReadonlyMap<string, number>
  /** the macro step lists the discoverer confirmed, in its fixed order (empty without a library) */
  macroSteps: () => string[][]
}

/** What the evaluator hands the solver: the base estimate, what was learned, and the charge to declare. */
export interface SolverInput<S> {
  base: Heuristic<S>
  table: ReadonlyMap<string, number>
  key: (state: S) => string
  /** the metered cost of teaching, which every solve must carry */
  learningCharge: Preprocessing
}

/** How a candidate turns its genome into a learner and a solver. */
export interface Realization<S> {
  learner: (genome: IntelligenceGenome, operators: readonly Operator<S>[], key: (state: S) => string) => GenomeLearner<S>
  solver: (genome: IntelligenceGenome, input: SolverInput<S>) => Solver<S>
}

export function addCharge(a: Preprocessing, b: Preprocessing): Preprocessing {
  return {
    expansions: a.expansions + b.expansions,
    operatorCalls: a.operatorCalls + b.operatorCalls,
    memoryBytes: a.memoryBytes + b.memoryBytes,
  }
}

/** The learner the genome names: a value table, a macro discoverer, both, or neither, on the operators handed in. */
export function genomeLearner<S>(
  genome: IntelligenceGenome,
  operators: readonly Operator<S>[],
  key: (state: S) => string,
): GenomeLearner<S> {
  const table = genome.learning.strategy === 'value-table' ? valueTableLearner(operators, key) : null
  const { minLength, maxLength, minCount, limit } = genome.operators
  const discoverer =
    genome.operators.library === 'discovered'
      ? pathMacroDiscoverer(operators, key, { minLength, maxLength, minCount, limit })
      : null

  return {
    id: `genome-learner(${table?.id ?? 'no-table'},${discoverer?.id ?? 'no-library'})`,
    observe(experience: Experience<S>) {
      table?.observe(experience)
      discoverer?.observe(experience)
    },
    proposeOperators: () => discoverer?.proposeOperators() ?? [],
    spent: () => addCharge(table?.spent() ?? NO_PREPROCESSING, discoverer?.spent() ?? NO_PREPROCESSING),
    table: () => table?.table() ?? new Map<string, number>(),
    macroSteps: () => discoverer?.candidates().map(candidate => candidate.steps) ?? [],
  }
}

/** The estimate the genome names, weighted, at no charge of its own (the solver declares the charge once). */
function estimateOf<S>(genome: IntelligenceGenome, input: SolverInput<S>): (state: S) => number {
  const weight = genome.search.weight

  if (genome.search.heuristic === 'none') {
    return () => 0
  }

  if (genome.search.heuristic === 'bare-hop') {
    return state => weight * input.base.estimate(state)
  }

  return state => {
    const base = input.base.estimate(state)
    const learned = input.table.get(input.key(state))

    return weight * (learned === undefined || learned < base ? base : learned)
  }
}

function innerSolver<S>(genome: IntelligenceGenome, heuristic: Heuristic<S>): Solver<S> {
  switch (genome.search.strategy) {
    case 'breadth-first':
      return breadthFirstSolver<S>()
    case 'a-star':
      return aStarSolver(heuristic)
    case 'greedy':
      return greedySolver(heuristic)
    case 'iterative-deepening':
      return iterativeDeepeningSolver(heuristic)
  }
}

/** The preprocessing a solve under this genome declares: the base table when it reads it, plus the teaching. */
export function declaredCharge<S>(genome: IntelligenceGenome, input: SolverInput<S>): Preprocessing {
  return addCharge(readsBaseTable(genome) ? input.base.preprocessing : NO_PREPROCESSING, input.learningCharge)
}

/** The solver the genome names. */
export function genomeSolver<S>(genome: IntelligenceGenome, input: SolverInput<S>): Solver<S> {
  const declared = declaredCharge(genome, input)
  const heuristic: Heuristic<S> = {
    id: `${genome.search.heuristic}x${genome.search.weight}`,
    estimate: estimateOf(genome, input),
    preprocessing: { ...NO_PREPROCESSING },
  }
  const inner = innerSolver(genome, heuristic)

  return {
    id: `genome(${genome.search.strategy},${heuristic.id})`,
    solve(problem: Problem<S>, operators) {
      const room = Math.min(genome.budget.expansions, problem.budget.expansions) - declared.expansions

      if (room <= 0) {
        const ledger = emptyLedger()

        ledger.preprocessing = { ...declared }

        return { states: [problem.initial], operators: [], cost: 0, solved: false, ledger }
      }

      const solution = inner.solve({ ...problem, budget: { ...problem.budget, expansions: room } }, operators)

      solution.ledger.preprocessing = addCharge(solution.ledger.preprocessing, declared)

      return solution
    },
  }
}

/** The realization for a state type. */
export function genomeRealization<S>(): Realization<S> {
  return { learner: genomeLearner, solver: genomeSolver }
}

// ---- the realization as isolated candidates (what the evaluator runs) ----

/** The genome's learner as a candidate: its report is the macros the discoverer confirmed. */
export function realizedLearner<S>(genome: IntelligenceGenome, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const learner = genomeLearner(genome, operators, key)

  return { ...learner, report: () => ({ macroSteps: learner.macroSteps() }) }
}

/** What the evaluator tells the genome's solver as data; the base estimate and the learned table come as artifacts. */
export interface RealizedSolverArgs {
  genome: IntelligenceGenome
  base: { id: string; preprocessing: Preprocessing }
  learningCharge: Preprocessing
}

/** The genome's solver as a candidate, reading the artifacts `base` (estimate) and `table` (when taught). */
export function realizedSolver<S>(args: RealizedSolverArgs, host: CandidateHost<S>): Solver<S> {
  return genomeSolver(args.genome, {
    base: { id: args.base.id, estimate: host.estimate('base'), preprocessing: { ...args.base.preprocessing } },
    table: host.has('table') ? host.table('table') : new Map<string, number>(),
    key: host.key,
    learningCharge: { ...args.learningCharge },
  })
}
