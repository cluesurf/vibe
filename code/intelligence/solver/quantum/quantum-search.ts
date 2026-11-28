/**
 * The quantum solver of Q7: the
 * exact Grover walk of Q5 run as a candidate on benchmark family A, under
 * the same outside evaluator and resource ledger as the level-1 baselines.
 *
 * A quantum walk searches a graph it can query. Here the only access to the
 * graph is the operators the evaluator hands over, so the solver must first
 * build the reachable state graph through them (a breadth-first sweep to
 * exhaustion, every operator call metered by the evaluator, every state
 * goal-tested once: the classical cost of loading the oracle), then walk it
 * with the goal states marked, then read a path. The walk locates a goal
 * state; it does not give a path, so the path is read back through the
 * breadth-first parent table the sweep built (a shortest path to the state
 * the walk most likely returns).
 *
 * The walk runs on the undirected graph (each operator step taken both
 * ways), since the flip-flop shift needs symmetric arcs; every state in it
 * is reachable from the initial state, so every marked state has a path.
 * The degree is the smallest d = 2^a 3^b at or above the largest degree, so
 * the coin is exact; spare slots are reflecting walls.
 *
 * Ledger: search expansions, generated states and operator calls are the
 * sweep's (the evaluator meters every consulted state as search, so the
 * sweep is counted once, there, not again as preprocessing); peak bytes is
 * the larger of the states held at the batch peak and the states held plus
 * the arc table plus the exact amplitude storage at its peak. The quantum
 * part (beats, the measured success probability and the expected repeats
 * 1/p as exact numbers, the amplitude bytes, arc updates, goal tests, states
 * and cells touched) goes in the ledger's typed `quantum` field, which the
 * evaluator meters where it can and the experiment's judge recomputes.
 *
 * No measurement is sampled (no random numbers): the solver returns the
 * marked state of largest weight at the measured beat (ties to the lowest
 * state, breadth-first order) and reports the probability of the whole
 * marked set.
 */

import type { Problem } from '@/code/intelligence/problem/problem'
import {
  emptyLedger,
  type ExactValue,
  type QuantumLedger,
  type QuantumOutcome,
  type Solution,
  type Solver,
} from '@/code/intelligence/solver/solver'
import {
  canExpand,
  hold,
  holdBatch,
  readPath,
  successors,
  type Held,
  type ParentEntry,
} from '@/code/intelligence/solver/search/expand'
import { reduced, searchCap, sixSmoothDegree, walkGraph, walkSearch } from '@/code/intelligence/solver/quantum/exact-grover'

export const QUANTUM_ID = 'quantum-walk'

/** A rational p/q (q > 0) as an exact value. */
export function rationalValue(num: bigint, den: bigint): ExactValue {
  return { n: [num.toString()], d: den.toString() }
}

/** The success probability p/q and the expected repeats q/p (null when p = 0, which never succeeds). */
function measuredOdds(num: bigint, den: bigint): Pick<QuantumLedger, 'successProbability' | 'expectedRepeats'> {
  return { successProbability: rationalValue(num, den), expectedRepeats: num === 0n ? null : rationalValue(den, num) }
}

export function blankReport(outcome: QuantumOutcome): QuantumLedger {
  return {
    outcome,
    statesExpanded: 0,
    states: 0,
    largestDegree: 0,
    degree: 0,
    walls: 0,
    marked: 0,
    goalTests: 0,
    beatsRun: 0,
    beats: 0,
    stoppedBy: 'none',
    successProbability: null,
    expectedRepeats: null,
    unitaryDefects: 0,
    amplitudeBytes: 0,
    graphBytes: 0,
    arcUpdates: 0,
    statesTouched: 0,
    cellsTouched: 0,
  }
}

/** Key positions where some key differs from the first (a longer key counts its extra positions). */
function differingPositions(keys: readonly string[]): number {
  const first = keys[0] ?? ''

  let longest = first.length

  for (const key of keys) {
    if (key.length > longest) {
      longest = key.length
    }
  }

  let count = 0

  for (let at = 0; at < longest; at++) {
    const value = at < first.length ? first.charCodeAt(at) : -1

    for (const key of keys) {
      if ((at < key.length ? key.charCodeAt(at) : -1) !== value) {
        count++
        break
      }
    }
  }

  return count
}

export function quantumWalkSolver<S>(): Solver<S> {
  const solver: Solver<S> = {
    id: QUANTUM_ID,
    solve(problem: Problem<S>, operators): Solution<S> {
      const ledger = emptyLedger()
      const held: Held = { states: 0, bytes: 0 }
      const parents = new Map<string, ParentEntry<S>>()
      const index = new Map<string, number>()
      const keys: string[] = []
      const goal: number[] = []
      const forward: number[][] = []

      let goalTests = 0

      const finish = (report: QuantumLedger, solution: Omit<Solution<S>, 'ledger'>): Solution<S> => {
        ledger.quantum = { ...report, goalTests, statesExpanded: ledger.expansions }

        return { ...solution, ledger }
      }

      const giveUp = (report: QuantumLedger): Solution<S> =>
        finish(report, { states: [problem.initial], operators: [], cost: 0, solved: false })

      const add = (state: S, key: string, parent: string | null, operatorId: string, stepCost: number): number => {
        const at = keys.length

        index.set(key, at)
        keys.push(key)
        forward.push([])
        parents.set(key, { state, parent, operatorId, stepCost })
        hold(problem, held, ledger, state)
        goalTests++

        if (problem.goal(state)) {
          goal.push(at)
        }

        return at
      }

      const initialKey = problem.key(problem.initial)

      add(problem.initial, initialKey, null, '', 0)

      if (goal.length > 0) {
        const report = blankReport('initialGoal')

        return finish(
          { ...report, states: 1, marked: 1, ...measuredOdds(1n, 1n) },
          { ...readPath(parents, initialKey), solved: true },
        )
      }

      // the sweep: every reachable state, breadth first, every operator call counted
      for (let head = 0; head < keys.length; head++) {
        if (!canExpand(problem, ledger)) {
          return giveUp({ ...blankReport('expansionBudget'), states: keys.length })
        }

        const key = keys[head]!
        const state = parents.get(key)!.state

        ledger.expansions++

        const batch = successors(state, operators, ledger)

        holdBatch(problem, held, ledger, batch)

        for (const next of batch) {
          const nextKey = problem.key(next.state)
          const at = index.get(nextKey) ?? add(next.state, nextKey, key, next.operatorId, next.cost)

          if (at !== head && !forward[head]!.includes(at)) {
            forward[head]!.push(at)
          }
        }
      }

      const states = keys.length

      if (goal.length === 0) {
        // the sweep exhausted the space without a goal: unsolvable, proved classically; the walk has nothing to find
        return giveUp({ ...blankReport('noGoal'), states })
      }

      // the undirected graph the walk runs on
      const neighbors: number[][] = forward.map(row => row.slice())

      for (let v = 0; v < states; v++) {
        for (const w of forward[v]!) {
          if (!neighbors[w]!.includes(v)) {
            neighbors[w]!.push(v)
          }
        }
      }

      let largestDegree = 0

      for (const row of neighbors) {
        if (row.length > largestDegree) {
          largestDegree = row.length
        }
      }

      const degree = sixSmoothDegree(largestDegree)
      const graph = walkGraph(neighbors, degree)
      const graphBytes = graph.reverse.byteLength
      const byteLimit = problem.budget.memoryBytes - held.bytes - graphBytes
      const marked = new Uint8Array(states)

      for (const at of goal) {
        marked[at] = 1
      }

      const shape = {
        states,
        largestDegree,
        degree,
        walls: graph.walls,
        marked: goal.length,
        graphBytes,
        cellsTouched: differingPositions(keys),
      }

      if (byteLimit <= 0) {
        return giveUp({ ...blankReport('memoryBudget'), ...shape })
      }

      const reading = walkSearch({ graph, marked, cap: searchCap(states), byteLimit })
      const walked = {
        ...shape,
        beatsRun: reading.beats,
        beats: reading.measuredBeat,
        stoppedBy: reading.stoppedBy,
        unitaryDefects: reading.unitaryDefects,
        amplitudeBytes: reading.amplitudeBytes,
        arcUpdates: reading.arcUpdates,
        statesTouched: reading.statesTouched,
      }
      const peak = held.bytes + graphBytes + reading.amplitudeBytes

      if (peak > ledger.peakBytes) {
        ledger.peakBytes = peak
      }

      if (reading.stoppedBy === 'bytes') {
        return giveUp({ ...blankReport('memoryBudget'), ...walked })
      }

      // the marked state of largest weight at the measured beat, ties to the lowest
      let best = 0

      for (let i = 1; i < reading.markedStates.length; i++) {
        if (reading.markedWeights[i]! > reading.markedWeights[best]!) {
          best = i
        }
      }

      const answer = reading.markedStates[best]!
      const probability = reduced(reading.measured)

      return finish(
        { ...blankReport('found'), ...walked, ...measuredOdds(probability.num, probability.den) },
        { ...readPath(parents, keys[answer]!), solved: true },
      )
    },
  }

  return solver
}
