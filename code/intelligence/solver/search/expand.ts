/**
 * What every graph-search baseline shares: the heuristic it is handed with
 * the preprocessing that built it, the successor step that counts every
 * operator call in the ledger, the held-state accounting for the memory
 * peak, and the path read back from a parent table.
 *
 * Counting is exact, never estimated: one call for each `applicable`, and
 * for an applicable operator one `cost` and one `apply`. The evaluator
 * counts the same calls on its own copies of the operators and rejects a
 * ledger that reports fewer.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import type { Problem } from '@/code/intelligence/problem/problem'
import {
  NO_PREPROCESSING,
  chargedExpansions,
  type Ledger,
  type Preprocessing,
  type Solution,
} from '@/code/intelligence/solver/solver'

/**
 * A distance estimate and what it cost to build. A table built before the
 * search (a mesh distance field, a pattern table) is charged to the solve
 * through `preprocessing`, so a solver never looks cheaper by moving work
 * out of the search.
 */
export interface Heuristic<S> {
  id: string
  estimate: (state: S) => number
  preprocessing: Preprocessing
}

/**
 * The problem's own estimate, declaring no charge. The evaluator charges a
 * solve for any sealed table the estimate reads, so on a benchmark problem
 * (whose distance is the sealed table) a ledger built on this is rejected;
 * an unsealed distance reaches a solver only as the trivial bound 0.
 */
export function problemHeuristic<S>(problem: Problem<S>): Heuristic<S> {
  return {
    id: 'problem-distance',
    estimate: problem.distance,
    preprocessing: { ...NO_PREPROCESSING },
  }
}

export interface Successor<S> {
  operatorId: string
  state: S
  cost: number
}

/** Every successor of `state`, in operator order, with every operator call counted. */
export function successors<S>(
  state: S,
  operators: readonly Operator<S>[],
  ledger: Ledger,
): Successor<S>[] {
  const out: Successor<S>[] = []
  for (const operator of operators) {
    ledger.operatorCalls++
    if (!operator.applicable(state)) {
      continue
    }
    ledger.operatorCalls += 2
    const cost = operator.cost(state)
    const next = operator.apply(state)
    ledger.generated++
    out.push({ operatorId: operator.id, state: next, cost })
  }
  return out
}

/** Whether the budget leaves room for one more expansion, preprocessing counted. */
export function canExpand<S>(problem: Problem<S>, ledger: Ledger): boolean {
  return chargedExpansions(ledger) < problem.budget.expansions
}

/** The states a search holds at once, for the memory peak. */
export interface Held {
  states: number
  bytes: number
}

export function hold<S>(problem: Problem<S>, held: Held, ledger: Ledger, state: S): void {
  held.states++
  held.bytes += problem.bytes(state)
  if (held.states > ledger.peakStates) {
    ledger.peakStates = held.states
  }
  if (held.bytes > ledger.peakBytes) {
    ledger.peakBytes = held.bytes
  }
}

/**
 * A batch of successors exists all at once, before the search keeps some
 * and drops the rest: count the whole batch on top of what is held, for the
 * peak only (the kept ones are then held one by one).
 */
export function holdBatch<S>(problem: Problem<S>, held: Held, ledger: Ledger, batch: readonly Successor<S>[]): void {
  let states = held.states
  let bytes = held.bytes
  for (const next of batch) {
    states++
    bytes += problem.bytes(next.state)
  }
  if (states > ledger.peakStates) {
    ledger.peakStates = states
  }
  if (bytes > ledger.peakBytes) {
    ledger.peakBytes = bytes
  }
}

export function release<S>(problem: Problem<S>, held: Held, state: S): void {
  held.states--
  held.bytes -= problem.bytes(state)
}

export interface ParentEntry<S> {
  state: S
  /** the key of the state this one was reached from, null at the initial state */
  parent: string | null
  operatorId: string
  /** cost of the step into this state */
  stepCost: number
}

/** The path from the initial state to `endKey`, read back through the parent table. */
export function readPath<S>(
  parents: ReadonlyMap<string, ParentEntry<S>>,
  endKey: string,
): { states: S[]; operators: string[]; cost: number } {
  const states: S[] = []
  const operators: string[] = []
  let cost = 0
  let cursor: string | null = endKey
  while (cursor !== null) {
    const entry = parents.get(cursor)
    if (entry === undefined) {
      throw new Error(`readPath: key missing from the parent table`)
    }
    states.push(entry.state)
    if (entry.parent !== null) {
      operators.push(entry.operatorId)
      cost += entry.stepCost
    }
    cursor = entry.parent
  }
  states.reverse()
  operators.reverse()
  return { states, operators, cost }
}

/** The answer of a search that found nothing: the initial state alone, not solved. */
export function unsolved<S>(problem: Problem<S>, ledger: Ledger): Solution<S> {
  return { states: [problem.initial], operators: [], cost: 0, solved: false, ledger }
}
