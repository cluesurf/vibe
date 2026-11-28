/**
 * Best-first search in two settings of one loop:
 *
 * - A*: priority g + h, ties to the smaller h, then insertion order. With
 *   an admissible heuristic the first goal popped is optimal; a state
 *   reached again at a lower g is reopened, so optimality does not lean on
 *   the heuristic also being consistent.
 * - greedy best-first: priority h alone, every state expanded at most
 *   once. Fast when the estimate points the right way, never promised
 *   optimal.
 *
 * The heuristic's preprocessing (a distance table built before the search)
 * is charged to the ledger before the first expansion, so it eats into the
 * same budget the search spends.
 */

import type { Problem } from '@/code/intelligence/problem/problem'
import { emptyLedger, type Solver } from '@/code/intelligence/solver/solver'
import {
  canExpand,
  hold,
  holdBatch,
  readPath,
  release,
  successors,
  unsolved,
  type Held,
  type Heuristic,
  type ParentEntry,
} from '@/code/intelligence/solver/search/expand'
import { PriorityQueue } from '@/code/intelligence/solver/search/priority-queue'

type Mode = 'a-star' | 'greedy'

function bestFirst<S>(mode: Mode, heuristic: Heuristic<S>): Solver<S> {
  return {
    id: mode,
    solve(problem: Problem<S>, operators) {
      const ledger = emptyLedger()
      ledger.preprocessing = { ...heuristic.preprocessing }
      const held: Held = { states: 0, bytes: 0 }
      const parents = new Map<string, ParentEntry<S>>()
      const best = new Map<string, number>()
      const closed = new Set<string>()
      const open = new PriorityQueue<string>()
      const initialKey = problem.key(problem.initial)
      parents.set(initialKey, {
        state: problem.initial,
        parent: null,
        operatorId: '',
        stepCost: 0,
      })
      best.set(initialKey, 0)
      hold(problem, held, ledger, problem.initial)
      const h0 = heuristic.estimate(problem.initial)
      // at the initial state g = 0, so both modes start at priority h
      open.push(h0, h0, initialKey)
      while (open.size > 0) {
        const entry = open.pop()!
        const key = entry.value
        const g = best.get(key)!
        // a stale entry: the state was reached more cheaply after this one was queued
        if (mode === 'a-star' && entry.primary !== g + entry.secondary) {
          continue
        }
        if (closed.has(key)) {
          continue
        }
        const state = parents.get(key)!.state
        if (problem.goal(state)) {
          return { ...readPath(parents, key), solved: true, ledger }
        }
        if (!canExpand(problem, ledger)) {
          return unsolved(problem, ledger)
        }
        closed.add(key)
        ledger.expansions++
        const batch = successors(state, operators, ledger)
        holdBatch(problem, held, ledger, batch)
        for (const next of batch) {
          const nextKey = problem.key(next.state)
          const nextG = g + next.cost
          const known = best.get(nextKey)
          if (mode === 'greedy' && known !== undefined) {
            continue
          }
          if (mode === 'a-star' && known !== undefined && known <= nextG) {
            continue
          }
          const previous = parents.get(nextKey)
          if (previous !== undefined) {
            // reopened at a lower cost: the old copy is dropped from the held count
            release(problem, held, previous.state)
            closed.delete(nextKey)
          }
          parents.set(nextKey, {
            state: next.state,
            parent: key,
            operatorId: next.operatorId,
            stepCost: next.cost,
          })
          best.set(nextKey, nextG)
          hold(problem, held, ledger, next.state)
          const h = heuristic.estimate(next.state)
          open.push(mode === 'a-star' ? nextG + h : h, h, nextKey)
        }
      }
      return unsolved(problem, ledger)
    },
  }
}

/** A* over the given heuristic; optimal whenever the heuristic is admissible. */
export function aStarSolver<S>(heuristic: Heuristic<S>): Solver<S> {
  return bestFirst('a-star', heuristic)
}

/** Greedy best-first over the given heuristic. */
export function greedySolver<S>(heuristic: Heuristic<S>): Solver<S> {
  return bestFirst('greedy', heuristic)
}
