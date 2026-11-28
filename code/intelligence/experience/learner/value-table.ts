/**
 * Level 2 learning: a value table of cost-to-go learned from experiences.
 *
 * From the source's section 15.4 (observe experiences, propose), with the
 * learned transformation being an estimate table rather than operators
 * (operators are level 3, so `proposeOperators` returns none). Two things
 * are learned, both lower bounds on the true cost-to-go wherever the
 * teacher's paths are shortest:
 *
 * - along a verified path, the cost still to pay from each state, read from
 *   the path's own step costs (each step's cost asked of the operator). On
 *   a shortest path every suffix is a shortest path, so these are exact.
 * - one ring out: for a path state s with value v and any operator taking s
 *   to s' at cost c, the triangle inequality d(s) <= c + d(s') gives
 *   d(s') >= v - c, a lower bound for a state the path never entered.
 *
 * Only experiences the evaluator verified (utility above 0) are learned
 * from. The learner sees nothing but the operators it is handed (the
 * evaluator's metered copies), the key, and the experiences: it imports no
 * benchmark, geometry or graph, so all it knows came through a metered
 * channel. It counts its own work exactly and reports it in `spent`; the
 * evaluator rejects a report below its meter. No random numbers: experiences
 * are learned in the order given, operators in their given order.
 */

import type { Experience, Learner } from '@/code/intelligence/experience/experience'
import { operatorIndex, type Operator } from '@/code/intelligence/operator/operator'
import type { Preprocessing } from '@/code/intelligence/solver/solver'

export type ValueTableLearner<S> = Learner<S> & {
  /** key to learned lower bound on cost-to-go (exact on taught shortest paths) */
  table: () => ReadonlyMap<string, number>
}

export function valueTableLearner<S>(
  operators: readonly Operator<S>[],
  key: (state: S) => string,
): ValueTableLearner<S> {
  const index = operatorIndex(operators)
  /** values read off verified paths */
  const exact = new Map<string, number>()
  /** one-ring lower bounds, for states off every path */
  const bounds = new Map<string, number>()

  let operatorCalls = 0

  const consulted = new Set<S>()

  const raise = (map: Map<string, number>, entry: string, value: number, keepLower: boolean): void => {
    const known = map.get(entry)

    if (known === undefined || (keepLower ? value < known : value > known)) {
      map.set(entry, value)
    }
  }

  function observe(experience: Experience<S>): void {
    if (experience.utility <= 0) {
      return
    }

    const { states, operators: ids } = experience.solution
    const stepCosts: number[] = []

    for (let step = 0; step < ids.length; step++) {
      const operator = index.get(ids[step]!)

      if (operator === undefined) {
        return
      }

      operatorCalls++
      consulted.add(states[step]!)
      stepCosts.push(operator.cost(states[step]!))
    }

    let remaining = stepCosts.reduce((sum, cost) => sum + cost, 0)

    for (let step = 0; step < states.length; step++) {
      // a path seen twice keeps its shorter cost-to-go
      raise(exact, key(states[step]!), remaining, true)
      remaining -= stepCosts[step] ?? 0
    }

    // one ring out from every path state but the last
    for (let step = 0; step + 1 < states.length; step++) {
      const state = states[step]!
      const value = exact.get(key(state))!

      for (const operator of operators) {
        operatorCalls++
        consulted.add(state)

        if (!operator.applicable(state)) {
          continue
        }

        operatorCalls += 2

        const cost = operator.cost(state)
        const next = operator.apply(state)

        raise(bounds, key(next), Math.max(0, value - cost), false)
      }
    }
  }

  function table(): Map<string, number> {
    const out = new Map(exact)

    for (const [entry, value] of bounds) {
      if (!exact.has(entry)) {
        out.set(entry, value)
      }
    }

    return out
  }

  function spent(): Preprocessing {
    let memoryBytes = 0

    for (const entry of table().keys()) {
      // two bytes per UTF-16 code unit of the key, eight for the value
      memoryBytes += 2 * entry.length + 8
    }

    return { expansions: consulted.size, operatorCalls, memoryBytes }
  }

  return {
    id: 'value-table',
    observe,
    proposeOperators: () => [],
    spent,
    table,
  }
}
