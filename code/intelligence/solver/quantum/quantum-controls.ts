/**
 * Dishonest quantum solvers the Q7 judge or the evaluator must reject, each
 * an isolated candidate like the honest one (items
 * vibe-computation-intelligence-0014 and 0021).
 *
 * - noProbability: solves by breadth-first search and claims a quantum
 *   success with no measured probability (the path is valid and every
 *   metered count honest, so only the quantum judge can catch it).
 * - inflatedProbability: the honest walk, its success probability then
 *   reported as 1.
 * - understatedStates: the honest walk, reporting half the states it swept
 *   and walked.
 * - unknownSolutionField, unknownLedgerField, unknownQuantumField,
 *   unknownPreprocessingField: the honest walk with one field the evaluator
 *   does not know planted at that level of its answer (the evaluator must
 *   refuse it by name, never drop it).
 */

import type { Problem } from '@/code/intelligence/problem/problem'
import type { QuantumLedger, Solution, Solver } from '@/code/intelligence/solver/solver'
import { breadthFirstSolver } from '@/code/intelligence/solver/search/breadth-first'
import { QUANTUM_ID, blankReport, quantumWalkSolver } from '@/code/intelligence/solver/quantum/quantum-search'

/** The honest walk, its answer then changed by `change`. */
function rewritten<S>(change: (solution: Solution<S>) => Solution<S>): Solver<S> {
  const inner = quantumWalkSolver<S>()

  return {
    id: inner.id,
    solve: (problem, operators): Solution<S> => change(inner.solve(problem, operators)),
  }
}

/** The honest walk with its quantum ledger changed by `change`. */
function rewrittenQuantum<S>(change: (quantum: QuantumLedger) => QuantumLedger): Solver<S> {
  return rewritten<S>(solution =>
    solution.ledger.quantum === undefined ? solution : { ...solution, ledger: { ...solution.ledger, quantum: change(solution.ledger.quantum) } },
  )
}

export function noProbability<S>(): Solver<S> {
  const inner = breadthFirstSolver<S>()

  return {
    id: QUANTUM_ID,
    solve(problem, operators): Solution<S> {
      let goalTests = 0

      // count the goal tests the search makes, so the report is honest wherever the evaluator can meter it
      const counted: Problem<S> = {
        ...problem,
        goal: (state: S): boolean => {
          goalTests++

          return problem.goal(state)
        },
      }

      const solution = inner.solve(counted, operators)

      return {
        ...solution,
        ledger: {
          ...solution.ledger,
          quantum: {
            ...blankReport('found'),
            statesExpanded: solution.ledger.expansions,
            states: solution.ledger.expansions,
            marked: 1,
            goalTests,
          },
        },
      }
    },
  }
}

export function inflatedProbability<S>(): Solver<S> {
  return rewrittenQuantum<S>(quantum =>
    quantum.successProbability === null ? quantum : { ...quantum, successProbability: { n: ['1'], d: '1' } },
  )
}

export function understatedStates<S>(): Solver<S> {
  return rewrittenQuantum<S>(quantum => ({ ...quantum, states: quantum.states >> 1, statesExpanded: quantum.statesExpanded >> 1 }))
}

// the planted fields are cast through unknown on purpose: the type forbids them, the evaluator must refuse them at run time

export function unknownSolutionField<S>(): Solver<S> {
  return rewritten<S>(solution => ({ ...solution, beats: 0 }) as unknown as Solution<S>)
}

export function unknownLedgerField<S>(): Solver<S> {
  return rewritten<S>(solution => ({ ...solution, ledger: { ...solution.ledger, oracleQueries: 0 } }) as unknown as Solution<S>)
}

export function unknownQuantumField<S>(): Solver<S> {
  return rewrittenQuantum<S>(quantum => ({ ...quantum, measuredState: 0 }) as unknown as QuantumLedger)
}

export function unknownPreprocessingField<S>(): Solver<S> {
  return rewritten<S>(
    solution =>
      ({
        ...solution,
        ledger: { ...solution.ledger, preprocessing: { ...solution.ledger.preprocessing, walkBeats: 0 } },
      }) as unknown as Solution<S>,
  )
}
