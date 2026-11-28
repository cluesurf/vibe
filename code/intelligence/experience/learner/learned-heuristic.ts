/**
 * A heuristic that uses a learned table: at each state the larger of the
 * base estimate and the table's value, the table read by key. The maximum
 * of two lower bounds is a lower bound, so with an admissible base and an
 * admissible table A* stays optimal (best-first reopens states, so it does
 * not need the result to be consistent).
 *
 * Its preprocessing is the base table's charge plus the learning charge the
 * evaluator metered (`LearningGrade.charge`), handed in from outside, so a
 * solve over learned knowledge always pays for the learning.
 */

import type { Preprocessing } from '@/code/intelligence/solver/solver'
import type { Heuristic } from '@/code/intelligence/solver/search/expand'

export function addPreprocessing(a: Preprocessing, b: Preprocessing): Preprocessing {
  return {
    expansions: a.expansions + b.expansions,
    operatorCalls: a.operatorCalls + b.operatorCalls,
    memoryBytes: a.memoryBytes + b.memoryBytes,
  }
}

export function learnedHeuristic<S>(input: {
  base: Heuristic<S>
  table: ReadonlyMap<string, number>
  key: (state: S) => string
  learningCharge: Preprocessing
}): Heuristic<S> {
  const { base, table, key } = input

  return {
    id: `${base.id}+learned`,
    estimate(state) {
      const learned = table.get(key(state))
      const estimate = base.estimate(state)

      return learned === undefined || learned < estimate ? estimate : learned
    },
    preprocessing: addPreprocessing(base.preprocessing, input.learningCharge),
  }
}
