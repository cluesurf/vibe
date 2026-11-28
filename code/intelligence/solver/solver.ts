/**
 * A solver tries to find a path from a problem's initial state to any
 * state its goal accepts, using only the operators it is handed. Graph
 * search, railway, associative and evolutionary solvers all fit this one
 * interface, so they can be compared on the same problems.
 *
 * From the source's sections 15.1 and 15.2, with one change: every
 * solution carries a resource ledger, and preprocessing done for the
 * solve is charged in it, so moving work out of the search never makes a
 * solver look cheaper. The evaluator counts operator calls itself and
 * rejects a ledger that reports fewer. A non-classical cost has a typed
 * field (a quantum walk's in `quantum`); the evaluator rejects any field it
 * does not know, so a cost can never ride in the solver id or be dropped.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import type { Problem } from '@/code/intelligence/problem/problem'
import type { MeshState } from '@/code/intelligence/problem/state'

/** Work done before or outside the search, charged to this solve. */
export interface Preprocessing {
  /** states expanded while building tables, heuristics or macros */
  expansions: number
  /** operator calls (applicable, apply, cost) made while preprocessing */
  operatorCalls: number
  /** bytes the preprocessing result keeps while the search runs */
  memoryBytes: number
}

/**
 * An exact number of Q(zeta_9), zeta = e^(2 pi i / 9), as data: integer
 * coordinates on 1, zeta, ..., zeta^5 (at most six) over one positive
 * denominator, each a decimal string, since a message carries no bigint. A
 * rational p/q is { n: ['p'], d: 'q' }. The evaluator reads it with
 * code/algebra/ninth-field and orders it with ninth-real-sign, never as a
 * float.
 */
export interface ExactValue {
  n: string[]
  d: string
}

export type QuantumOutcome = 'found' | 'initialGoal' | 'noGoal' | 'expansionBudget' | 'memoryBudget'

/** why a walk stopped: no walk ran, its first maximum, its beat cap, or its byte limit */
export type WalkStop = 'none' | 'firstMaximum' | 'cap' | 'bytes'

/**
 * The costs of a quantum walk solver beyond the classical ledger: what one
 * run of the walk takes (beats, amplitude bytes), how likely it is to find
 * (the success probability, exact) and so how often it must be run (the
 * expected repeats, 1/p, exact), with the walk's shape for a judge to
 * recompute. The evaluator meters what it can and rejects a report below its
 * meter: states swept and goal tests never below its counts, the
 * probability in [0, 1], the repeats never below 1/p.
 */
export interface QuantumLedger {
  outcome: QuantumOutcome
  /** states the sweep expanded (operators consulted on) */
  statesExpanded: number
  /** states in the walk's graph */
  states: number
  /** the largest undirected degree, and the degree the walk used (2^a 3^b at or above it) */
  largestDegree: number
  degree: number
  walls: number
  /** goal states marked */
  marked: number
  /** goal tests made */
  goalTests: number
  /** beats simulated, and the beat the measurement is made at (= oracle queries of one run) */
  beatsRun: number
  beats: number
  stoppedBy: WalkStop
  /** the success probability at the measured beat; null when no walk ran */
  successProbability: ExactValue | null
  /** the runs expected until a success, 1/p; null when p is null or 0 */
  expectedRepeats: ExactValue | null
  unitaryDefects: number
  /** the most bytes the amplitudes held at once, and the arc table's bytes */
  amplitudeBytes: number
  graphBytes: number
  arcUpdates: number
  statesTouched: number
  /** key positions (cells) whose value differs between the initial state and some touched state */
  cellsTouched: number
}

export interface Ledger {
  /** states expanded by the search */
  expansions: number
  /** successor states the search produced */
  generated: number
  /** operator calls (applicable, apply, cost) the search made */
  operatorCalls: number
  /** most states held at once by the search */
  peakStates: number
  /** most bytes held at once by the search */
  peakBytes: number
  preprocessing: Preprocessing
  /** a quantum solver's own costs; absent for a classical solver */
  quantum?: QuantumLedger
}

export interface Solution<S = MeshState> {
  /** the path's states, initial first; one more than operators */
  states: S[]
  /** the id of each operator applied, in order */
  operators: string[]
  /** the path's cost as the solver sums it; the evaluator recomputes it */
  cost: number
  /** whether the solver believes the last state meets the goal */
  solved: boolean
  ledger: Ledger
}

export interface Solver<S = MeshState> {
  id: string
  solve: (problem: Problem<S>, operators: readonly Operator<S>[]) => Solution<S>
}

export const NO_PREPROCESSING: Preprocessing = {
  expansions: 0,
  operatorCalls: 0,
  memoryBytes: 0,
}

/** An empty ledger, for a solver to fill as it works. */
export function emptyLedger(): Ledger {
  return {
    expansions: 0,
    generated: 0,
    operatorCalls: 0,
    peakStates: 0,
    peakBytes: 0,
    preprocessing: { ...NO_PREPROCESSING },
  }
}

/** Expansions charged against the budget: search plus preprocessing. */
export function chargedExpansions(ledger: Ledger): number {
  return ledger.expansions + ledger.preprocessing.expansions
}

/** Bytes charged against the budget: search peak plus retained preprocessing. */
export function chargedBytes(ledger: Ledger): number {
  return ledger.peakBytes + ledger.preprocessing.memoryBytes
}

/** Operator calls charged: search plus preprocessing. */
export function chargedOperatorCalls(ledger: Ledger): number {
  return ledger.operatorCalls + ledger.preprocessing.operatorCalls
}
