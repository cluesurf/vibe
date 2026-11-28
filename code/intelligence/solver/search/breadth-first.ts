/**
 * Breadth-first search, the exact baseline. Every operator in the
 * navigation family costs 1, and on unit costs breadth-first search
 * returns a path with the fewest steps, so its cost is the optimum every
 * heuristic solver is checked against. Run to exhaustion it also proves a
 * problem has no solution, which no heuristic baseline here can do faster.
 *
 * The goal is tested when a state is generated (and on the initial state),
 * which is exact on unit costs and saves the last layer.
 */

import type { Solver } from '@/code/intelligence/solver/solver'
import { emptyLedger } from '@/code/intelligence/solver/solver'
import {
  canExpand,
  hold,
  holdBatch,
  readPath,
  successors,
  unsolved,
  type Held,
  type ParentEntry,
} from '@/code/intelligence/solver/search/expand'

export function breadthFirstSolver<S>(): Solver<S> {
  return {
    id: 'breadth-first',
    solve(problem, operators) {
      const ledger = emptyLedger()
      const held: Held = { states: 0, bytes: 0 }
      const parents = new Map<string, ParentEntry<S>>()
      const initialKey = problem.key(problem.initial)
      parents.set(initialKey, {
        state: problem.initial,
        parent: null,
        operatorId: '',
        stepCost: 0,
      })
      hold(problem, held, ledger, problem.initial)
      if (problem.goal(problem.initial)) {
        return { ...readPath(parents, initialKey), solved: true, ledger }
      }
      const queue: string[] = [initialKey]
      let head = 0
      while (head < queue.length) {
        if (!canExpand(problem, ledger)) {
          return unsolved(problem, ledger)
        }
        const key = queue[head++]!
        const state = parents.get(key)!.state
        ledger.expansions++
        const batch = successors(state, operators, ledger)
        holdBatch(problem, held, ledger, batch)
        for (const next of batch) {
          const nextKey = problem.key(next.state)
          if (parents.has(nextKey)) {
            continue
          }
          parents.set(nextKey, {
            state: next.state,
            parent: key,
            operatorId: next.operatorId,
            stepCost: next.cost,
          })
          hold(problem, held, ledger, next.state)
          if (problem.goal(next.state)) {
            return { ...readPath(parents, nextKey), solved: true, ledger }
          }
          queue.push(nextKey)
        }
      }
      return unsolved(problem, ledger)
    },
  }
}
