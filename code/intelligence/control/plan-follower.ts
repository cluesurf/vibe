/**
 * A control solver that walks a plan made before the solve, one operator
 * id per step, and stops at the first step that is not applicable. The
 * plan's making is declared as preprocessing. Used by the dynamic maze's
 * frozen planner: the plan is a shortest path on the walls of round 0, made
 * by the benchmark, and the walk shows where moving walls defeat it.
 *
 * Candidate side: it runs isolated and sees only handles.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import type { Problem } from '@/code/intelligence/problem/problem'
import { emptyLedger, type Preprocessing, type Solver } from '@/code/intelligence/solver/solver'

export interface PlanArgs {
  steps: string[]
  preprocessing: Preprocessing
}

export function planFollower<S>(args: PlanArgs): Solver<S> {
  return {
    id: 'frozen-plan',
    solve(problem: Problem<S>, operators: readonly Operator<S>[]) {
      const ledger = emptyLedger()
      const start = problem.initial

      ledger.preprocessing = { ...args.preprocessing }

      const states = [start]
      const names: string[] = []

      let state = start

      for (const id of args.steps) {
        const operator = operators.find(candidate => candidate.id === id)

        if (operator === undefined) {
          break
        }

        // consulting an operator on a state expands it, whether or not the step is then taken
        ledger.operatorCalls++
        ledger.expansions++

        if (!operator.applicable(state)) {
          break
        }

        ledger.operatorCalls += 2
        operator.cost(state)
        state = operator.apply(state)
        ledger.generated++
        states.push(state)
        names.push(operator.id)
      }

      ledger.peakStates = states.length
      ledger.peakBytes = states.length * problem.bytes(start)

      return { states, operators: names, cost: names.length, solved: problem.goal(state), ledger }
    },
  }
}
