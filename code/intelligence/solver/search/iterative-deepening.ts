/**
 * IDA*: depth-first search under a cost bound g + h, the bound raised to
 * the smallest value that was cut off, until a goal is found. It holds
 * only the current path and the unexplored children of each state on it,
 * so its memory is about depth times branching, and it pays for
 * that in time: it keeps no table of visited states, so on a graph with
 * many paths to one state it re-expands the state once per path. The only
 * cycle check is against the current path.
 *
 * With an admissible heuristic and unit costs the first goal found is
 * optimal. It stops, unsolved, when the expansion budget (preprocessing
 * counted) runs out, which is how its time cost shows in the profile.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import type { Problem } from '@/code/intelligence/problem/problem'
import { emptyLedger, type Ledger, type Solver } from '@/code/intelligence/solver/solver'
import {
  canExpand,
  hold,
  release,
  successors,
  unsolved,
  type Held,
  type Heuristic,
} from '@/code/intelligence/solver/search/expand'

interface Frame<S> {
  states: S[]
  keys: string[]
  operators: string[]
  costs: number[]
  onPath: Set<string>
}

type Outcome = { found: true } | { found: false; next: number; exhausted: boolean }

function search<S>(
  problem: Problem<S>,
  operators: readonly Operator<S>[],
  heuristic: Heuristic<S>,
  ledger: Ledger,
  held: Held,
  frame: Frame<S>,
  g: number,
  bound: number,
): Outcome {
  const state = frame.states[frame.states.length - 1]!
  const f = g + heuristic.estimate(state)
  if (f > bound) {
    return { found: false, next: f, exhausted: false }
  }
  if (problem.goal(state)) {
    return { found: true }
  }
  if (!canExpand(problem, ledger)) {
    return { found: false, next: Infinity, exhausted: true }
  }
  ledger.expansions++
  let next = Infinity
  // every child is held from the moment it is made until its own subtree is done: the sibling lists along the path
  const children = successors(state, operators, ledger)
  for (const child of children) {
    hold(problem, held, ledger, child.state)
  }
  for (let index = 0; index < children.length; index++) {
    const child = children[index]!
    const key = problem.key(child.state)
    if (frame.onPath.has(key)) {
      release(problem, held, child.state)
      continue
    }
    frame.states.push(child.state)
    frame.keys.push(key)
    frame.operators.push(child.operatorId)
    frame.costs.push(child.cost)
    frame.onPath.add(key)
    const outcome = search(problem, operators, heuristic, ledger, held, frame, g + child.cost, bound)
    if (outcome.found) {
      return outcome
    }
    frame.states.pop()
    frame.keys.pop()
    frame.operators.pop()
    frame.costs.pop()
    frame.onPath.delete(key)
    release(problem, held, child.state)
    if (outcome.exhausted) {
      for (const rest of children.slice(index + 1)) {
        release(problem, held, rest.state)
      }
      return outcome
    }
    next = Math.min(next, outcome.next)
  }
  return { found: false, next, exhausted: false }
}

export function iterativeDeepeningSolver<S>(heuristic: Heuristic<S>): Solver<S> {
  return {
    id: 'ida-star',
    solve(problem, operators) {
      const ledger = emptyLedger()
      ledger.preprocessing = { ...heuristic.preprocessing }
      const held: Held = { states: 0, bytes: 0 }
      const initialKey = problem.key(problem.initial)
      const frame: Frame<S> = {
        states: [problem.initial],
        keys: [initialKey],
        operators: [],
        costs: [],
        onPath: new Set([initialKey]),
      }
      hold(problem, held, ledger, problem.initial)
      let bound = heuristic.estimate(problem.initial)
      for (;;) {
        const outcome = search(problem, operators, heuristic, ledger, held, frame, 0, bound)
        if (outcome.found) {
          const cost = frame.costs.reduce((sum, c) => sum + c, 0)
          return {
            states: frame.states.slice(),
            operators: frame.operators.slice(),
            cost,
            solved: true,
            ledger,
          }
        }
        // no state beyond the bound: the reachable space is exhausted along simple paths, no solution
        if (outcome.exhausted || outcome.next === Infinity) {
          return unsolved(problem, ledger)
        }
        bound = outcome.next
      }
    },
  }
}
