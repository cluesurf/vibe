/**
 * Dishonest and degraded solvers for the level-1 navigation experiment, as
 * isolated candidates. Each must be caught by a gate: the replay, the
 * optimality gate, the meter or the charge.
 *
 * Candidate side: each runs in its own context and sees only handles.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import { heuristicOf, type SearchArgs } from '@/code/intelligence/solver/catalog'
import { NO_PREPROCESSING, emptyLedger, type Solver } from '@/code/intelligence/solver/solver'
import { aStarSolver } from '@/code/intelligence/solver/search/best-first'
import { breadthFirstSolver } from '@/code/intelligence/solver/search/breadth-first'
import { successors } from '@/code/intelligence/solver/search/expand'

/** BFS with the middle step of its path dropped: the listed states no longer follow from the operators */
export function shortcut<S>(): Solver<S> {
  const inner = breadthFirstSolver<S>()

  return {
    id: 'shortcut',
    solve(problem, operators) {
      const solution = inner.solve(problem, operators)

      if (solution.operators.length >= 2) {
        const middle = Math.floor(solution.operators.length / 2)

        solution.states.splice(middle + 1, 1)
        solution.operators.splice(middle, 1)
        solution.cost -= 1
      }

      return solution
    },
  }
}

/** one step to the successor the heuristic rates farthest, then BFS: a valid path, often not a shortest one */
export function detour<S>(args: SearchArgs, host: CandidateHost<S>): Solver<S> {
  const heuristic = heuristicOf(args.heuristic, host)

  return {
    id: 'detour',
    solve(problem, operators) {
      const ledger = emptyLedger()

      // it reads the heuristic, so it declares the heuristic's table, as every informed solver must
      ledger.preprocessing = { ...heuristic.preprocessing }

      const first = successors(problem.initial, operators, ledger)

      let away = first[0]

      for (const next of first) {
        if (away !== undefined && heuristic.estimate(next.state) > heuristic.estimate(away.state)) {
          away = next
        }
      }

      if (away === undefined || problem.goal(problem.initial)) {
        return { states: [problem.initial], operators: [], cost: 0, solved: problem.goal(problem.initial), ledger }
      }

      const rest = breadthFirstSolver<S>().solve({ ...problem, initial: away.state }, operators)

      ledger.expansions += 1 + rest.ledger.expansions
      ledger.generated += rest.ledger.generated
      ledger.operatorCalls += rest.ledger.operatorCalls

      // the first batch of successors is held at once beside the initial state, then the rest of the search
      const one = problem.bytes(problem.initial)

      ledger.peakStates = Math.max(rest.ledger.peakStates, first.length) + 1
      ledger.peakBytes = Math.max(rest.ledger.peakBytes, first.reduce((sum, next) => sum + problem.bytes(next.state), 0)) + one

      return {
        states: [problem.initial, ...rest.states],
        operators: [away.operatorId, ...rest.operators],
        cost: away.cost + rest.cost,
        solved: rest.solved,
        ledger,
      }
    },
  }
}

/** A* on four times the heuristic: inadmissible, reported as data */
export function inflated<S>(args: SearchArgs, host: CandidateHost<S>): Solver<S> {
  const heuristic = heuristicOf(args.heuristic, host)

  return aStarSolver({ ...heuristic, id: 'inflated', estimate: state => 4 * heuristic.estimate(state) })
}

/** A* with its table charged reports zero search expansions */
export function hidingSearch<S>(args: SearchArgs, host: CandidateHost<S>): Solver<S> {
  const inner = aStarSolver(heuristicOf(args.heuristic, host))

  return {
    id: 'hiding-search',
    solve(problem, operators) {
      const solution = inner.solve(problem, operators)

      solution.ledger.expansions = 0

      return solution
    },
  }
}

/** breadth-first search that reports its operator calls but no expansions */
export function hidingExpansions<S>(): Solver<S> {
  const inner = breadthFirstSolver<S>()

  return {
    id: 'hiding-expansions',
    solve(problem, operators) {
      const solution = inner.solve(problem, operators)

      solution.ledger.expansions = 0

      return solution
    },
  }
}

/** Breadth-first search reporting no memory at all */
export function hidingMemory<S>(): Solver<S> {
  const inner = breadthFirstSolver<S>()

  return {
    id: 'hiding-memory',
    solve(problem, operators) {
      const solution = inner.solve(problem, operators)

      solution.ledger.peakBytes = 0
      solution.ledger.peakStates = 0
      solution.ledger.generated = 0

      return solution
    },
  }
}

/** A* on the problem's own distance, the same table the informed baselines pay for, declaring no charge */
export function freeDistance<S>(): Solver<S> {
  return {
    id: 'free-distance',
    solve: (problem, operators) =>
      aStarSolver<S>({ id: 'problem-distance', estimate: problem.distance, preprocessing: { ...NO_PREPROCESSING } }).solve(problem, operators),
  }
}
