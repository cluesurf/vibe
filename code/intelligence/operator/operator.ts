/**
 * An operator turns one state into another. Operators are pure and
 * deterministic: `apply` returns a new state and never changes its input,
 * and the same input always gives the same output. The evaluator checks
 * both on every step it replays.
 *
 * `compose` is the source's section 15.5: a found path becomes a new
 * operator, and composites compose again.
 */

import type { MeshState } from '@/code/intelligence/problem/state'

export interface Operator<S = MeshState> {
  id: string
  applicable: (state: S) => boolean
  /** a new state; the input is left untouched */
  apply: (state: S) => S
  /** a nonnegative cost of applying here */
  cost: (state: S) => number
}

/**
 * The operator that runs `operators` in order. It is applicable only when
 * every step is applicable on the state it meets, its cost is the sum of
 * the steps' costs, and the empty composition is the identity at cost 0.
 * Applying it where it is not applicable throws instead of running a
 * partial path.
 *
 * With `memo`, the last run is remembered by input object, so a search that
 * asks `applicable`, then `cost`, then `apply` of one state runs the steps
 * once, not three times (the same answers, a third of the work). The
 * evaluator's replay composes without it, so its purity and determinism
 * checks run the steps afresh.
 */
export function compose<S>(id: string, operators: readonly Operator<S>[], options: { memo?: boolean } = {}): Operator<S> {
  const steps = operators.slice()
  const memo = options.memo ?? false

  let lastInput: S | undefined
  let lastResult: { state: S; cost: number } | null = null
  let remembered = false

  function runSteps(initial: S): { state: S; cost: number } | null {
    let state = initial
    let cost = 0
    for (const step of steps) {
      if (!step.applicable(state)) {
        return null
      }
      cost += step.cost(state)
      state = step.apply(state)
    }
    return { state, cost }
  }

  function run(initial: S): { state: S; cost: number } | null {
    if (!memo) {
      return runSteps(initial)
    }
    if (remembered && lastInput === initial) {
      return lastResult
    }
    lastResult = runSteps(initial)
    lastInput = initial
    remembered = true
    return lastResult
  }

  return {
    id,
    applicable(initial) {
      return run(initial) !== null
    },
    apply(initial) {
      const result = run(initial)
      if (result === null) {
        throw new Error(`compose ${id}: not applicable here`)
      }
      return result.state
    },
    cost(initial) {
      const result = run(initial)
      if (result === null) {
        throw new Error(`compose ${id}: not applicable here`)
      }
      return result.cost
    },
  }
}

/** The ids of the operators, checked unique, since a path names operators by id. */
export function operatorIndex<S>(operators: readonly Operator<S>[]): Map<string, Operator<S>> {
  const index = new Map<string, Operator<S>>()
  for (const operator of operators) {
    if (index.has(operator.id)) {
      throw new Error(`operatorIndex: duplicate operator id ${operator.id}`)
    }
    index.set(operator.id, operator)
  }
  return index
}
