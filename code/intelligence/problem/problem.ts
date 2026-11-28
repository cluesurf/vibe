/**
 * A problem is a difference between a state and a goal. The goal is a
 * predicate, never one exact configuration, so "reach any safe cell" or
 * "build any stable bridge" are problems too.
 *
 * From the source's section 15.1, with two changes: the problem names its
 * regime and how to read links and keys from a state, and the budget
 * counts preprocessing, so work moved out of the solve is still paid for.
 */

import {
  meshStateBytes,
  meshStateKey,
  meshStateLinks,
  type MeshState,
  type Regime,
} from '@/code/intelligence/problem/state'

/**
 * What one attempt may spend. Each cap covers the solve AND the
 * preprocessing charged to it: a learned table, a precomputed heuristic,
 * a macro library built for this problem.
 */
export interface Budget {
  /** most operator applications on the returned path */
  steps: number
  /** most states expanded, search plus preprocessing */
  expansions: number
  /** most bytes held at once, search peak plus retained preprocessing */
  memoryBytes: number
}

export interface Problem<S = MeshState> {
  id: string
  regime: Regime
  initial: S
  /** the goal: any state it accepts solves the problem */
  goal: (state: S) => boolean
  /** an estimate of distance to the goal; solvers may use it, nobody trusts it */
  distance: (state: S) => number
  budget: Budget
  /** canonical key: equal keys if and only if equal states */
  key: (state: S) => string
  /** the link tones of a state, or null when it has none (pure regime) */
  links: (state: S) => Int8Array | null
  /** bytes one state holds, for memory accounting */
  bytes: (state: S) => number
}

/** A problem over mesh states, with the mesh key, links and byte count filled in. */
export function meshProblem(input: {
  id: string
  regime: Regime
  initial: MeshState
  goal: (state: MeshState) => boolean
  distance: (state: MeshState) => number
  budget: Budget
}): Problem<MeshState> {
  if (input.regime === 'pure' && input.initial.links !== undefined) {
    throw new Error(`meshProblem ${input.id}: a pure problem has no links`)
  }
  if (input.regime !== 'pure' && input.initial.links === undefined) {
    throw new Error(`meshProblem ${input.id}: a ${input.regime} problem needs links`)
  }
  return {
    ...input,
    key: meshStateKey,
    links: meshStateLinks,
    bytes: meshStateBytes,
  }
}
