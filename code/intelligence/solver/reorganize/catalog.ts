/**
 * The level-5 learners as isolated candidates: one register learner in five arms of the causal test. Each
 * factory takes its arguments as plain data and the metered operators and key the evaluator hands it.
 *
 * Candidate side.
 */

import type { TableLearner } from '@/code/intelligence/experience/experience'
import type { Operator } from '@/code/intelligence/operator/operator'
import { registerLearner, type RegisterSettings } from '@/code/intelligence/solver/reorganize/register-learner'

export const ROUNDS_PER_OBSERVATION = 3

export const ARMS: Readonly<Record<string, RegisterSettings>> = {
  meshRegister: { id: 'mesh-register', spacing: 2, rounds: ROUNDS_PER_OBSERVATION, writes: true, smuggle: false },
  meshKnockout: { id: 'mesh-knockout', spacing: 2, rounds: 0, writes: true, smuggle: false },
  meshFrozen: { id: 'mesh-frozen', spacing: 2, rounds: ROUNDS_PER_OBSERVATION, writes: false, smuggle: false },
  meshAdjacent: { id: 'mesh-adjacent', spacing: 1, rounds: ROUNDS_PER_OBSERVATION, writes: true, smuggle: false },
  meshSmuggler: { id: 'mesh-smuggler', spacing: 2, rounds: ROUNDS_PER_OBSERVATION, writes: true, smuggle: true },
}

const arm = (name: string): RegisterSettings => {
  const settings = ARMS[name]

  if (settings === undefined) {
    throw new Error(`reorganize: no arm ${name}`)
  }

  return settings
}

export function meshRegister<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return registerLearner(arm('meshRegister'), operators, key)
}

export function meshKnockout<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return registerLearner(arm('meshKnockout'), operators, key)
}

export function meshFrozen<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return registerLearner(arm('meshFrozen'), operators, key)
}

export function meshAdjacent<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return registerLearner(arm('meshAdjacent'), operators, key)
}

export function meshSmuggler<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return registerLearner(arm('meshSmuggler'), operators, key)
}
