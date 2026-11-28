/**
 * The dynamic maze: the walls are a field of tones that moves under an M1
 * pair rule while the agent walks. Every nonzero cell of the field is a
 * wall. Each step the agent takes a port or waits, then the field takes
 * one partitioned round; the step is legal only when the agent's new cell
 * is empty in the new field. The state is the agent's cell and the whole
 * field, so two equal states have the same future and the search space is
 * exact (no clock in the state, the field's own orbit is the clock).
 *
 * The rule: spin-one, conservative and reversible, one of the 24 of
 * code/rule/pair-rule, applied on the greedy edge coloring of the ball's
 * own graph with every edge oriented from the lower cell to the higher.
 * The ball is a finite closed system here (no edges leave it), recorded as
 * such: algebra spin-one, schedule greedy-edge-coloring, boundary the ball
 * rim. Default rule `swap.CBA.swap`, which swaps the two tones of every
 * matched pair, so excitations travel and walls move.
 *
 * Field: tone +1 on cells c with c mod 5 = 2, -1 on c mod 5 = 4, else 0, a
 * structured pattern. Goal: the highest-numbered cell (outer shell).
 *
 * Oracle: a time-expanded breadth-first search over (cell, round), run on a
 * precomputed history of the field with plain arrays, outside the
 * problem/operator/solver machinery. Heuristic: the bare hop distance to
 * the goal, admissible since a step moves the agent at most one hop.
 *
 * Control: the frozen planner plans a path on the walls of round 0 as if
 * they never moved, then walks it; it fails where the walls move into its
 * path, which is what makes this kind a test of replanning.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import { candidate, registerPrimitives, type CandidateSpec } from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { toneKey } from '@/code/intelligence/problem/state'
import { pairRulesFromFibers, type PairTable } from '@/code/rule/pair-rule'
import { forwardRoundInPlace, inverseRounds } from '@/code/rule/partitioned-pair'
import { buildPartitionSchedule, type PartitionSchedule } from '@/code/rule/partition-schedule'
import type { LabGeometry } from '@/code/substrate/lab-geometry'
import type { Graph } from '@/code/tool/graph'
import { maxDegree, rawToneKey } from '@/code/intelligence/benchmark/navigation/agent-mesh'
import {
  NAVIGATION_BUDGET,
  defineInstance,
  summarize,
  type GradeSummary,
  type NavigationInstance,
} from '@/code/intelligence/benchmark/navigation/instance'
import { fieldCharge, hopDistances, shortestCellPath } from '@/code/intelligence/benchmark/navigation/mesh-distance'

export interface FieldAgentState {
  /** the wall field, spin-one tones; nonzero is a wall */
  field: Int8Array
  agent: number
}

export const DEFAULT_DYNAMIC_RULE = 'swap.CBA.swap'

/** Rounds the oracle looks ahead before it calls an instance undecided. */
const ORACLE_HORIZON = 2000

const ORIGIN = 0

export function dynamicRule(name: string): PairTable {
  const rule = pairRulesFromFibers().find(candidate => candidate.name === name)
  if (rule === undefined) {
    throw new Error(`dynamic-maze: no pair rule named ${name}`)
  }
  return rule.table
}

export function wallField(size: number): Int8Array {
  const field = new Int8Array(size)
  for (let cell = 0; cell < size; cell++) {
    field[cell] = cell % 5 === 2 ? 1 : cell % 5 === 4 ? -1 : 0
  }
  return field
}

export interface DynamicEnvironment {
  rule: string
  colorCount: number
  /** the field's charge sum stayed constant over the oracle history */
  chargeConserved: boolean
  /** the inverse rounds took the last field of the history back to the first */
  reversible: boolean
  /** rounds simulated for the oracle */
  rounds: number
}

export interface DynamicMaze {
  instance: NavigationInstance
  environment: DynamicEnvironment
  /** the frozen planner, graded by the evaluator */
  frozen: () => GradeSummary
}

/**
 * The frozen planner: the plan, one shortest path on the walls of round 0
 * held fixed, is made here (benchmark side) and charged as preprocessing;
 * the isolated control walks it port by port.
 */
function frozenPlanner(graph: Graph, goal: number, start: FieldAgentState): CandidateSpec {
  const walls = (cell: number): boolean => start.field[cell] !== 0
  const plan = shortestCellPath(graph, start.agent, goal, walls) ?? []
  const steps: string[] = []

  for (let index = 1; index < plan.length; index++) {
    steps.push(`port-${graph.neighbors[plan[index - 1]!]!.indexOf(plan[index]!)}`)
  }

  return candidate('code/intelligence/control/plan-follower', 'planFollower', {
    steps,
    preprocessing: { expansions: graph.size, operatorCalls: 0, memoryBytes: 4 * graph.size },
  })
}

export function dynamicMaze(geometry: LabGeometry, ruleName: string = DEFAULT_DYNAMIC_RULE): DynamicMaze {
  const graph = geometry.graph
  const table = dynamicRule(ruleName)
  const schedule: PartitionSchedule = buildPartitionSchedule({
    neighbors: graph.neighbors,
    orient: (u, v) => [u, v],
    orientation: 'lower cell first',
    colorOrder: 'forward',
  })
  const goal = graph.size - 1

  // the field's successor, memoized by array identity; fields are never mutated once made
  const memo = new WeakMap<Int8Array, Int8Array>()
  const nextField = (field: Int8Array): Int8Array => {
    const known = memo.get(field)
    if (known !== undefined) {
      return known
    }
    const next = Int8Array.from(field)
    forwardRoundInPlace({ table, schedule, state: next })
    memo.set(field, next)
    return next
  }

  const operators: Operator<FieldAgentState>[] = []
  const step = (id: string, target: (state: FieldAgentState) => number): void => {
    operators.push({
      id,
      applicable(state) {
        const cell = target(state)
        return cell >= 0 && nextField(state.field)[cell] === 0
      },
      apply(state) {
        const cell = target(state)
        const field = nextField(state.field)
        if (cell < 0 || field[cell] !== 0) {
          throw new Error(`${id}: not applicable`)
        }
        return { field, agent: cell }
      },
      cost: () => 1,
    })
  }
  for (let port = 0; port < maxDegree(graph); port++) {
    step(`port-${port}`, state => {
      const row = graph.neighbors[state.agent]!
      return port < row.length ? row[port]! : -1
    })
  }
  step('wait', state => state.agent)
  registerPrimitives(operators)

  const bare = hopDistances(graph, [goal])
  const estimate = (state: FieldAgentState): number => bare.distance[state.agent]!
  const initial: FieldAgentState = { field: wallField(graph.size), agent: ORIGIN }
  const problem: Problem<FieldAgentState> = {
    id: `dynamicMaze-base-${geometry.spec.name}`,
    regime: 'pure',
    initial,
    goal: state => state.agent === goal,
    distance: estimate,
    budget: NAVIGATION_BUDGET,
    key: state => `${state.agent}|${rawToneKey(state.field)}`,
    links: () => null,
    bytes: state => state.field.byteLength + 4,
  }

  // the oracle: (cell, round) breadth-first over a plain history of the field
  const history: Int8Array[] = [initial.field]
  let reach = new Uint8Array(graph.size)
  reach[ORIGIN] = 1
  let oracle: number | null = null
  for (let round = 1; round <= ORACLE_HORIZON && oracle === null; round++) {
    const field = Int8Array.from(history[round - 1]!)
    forwardRoundInPlace({ table, schedule, state: field })
    history.push(field)
    const next = new Uint8Array(graph.size)
    for (let cell = 0; cell < graph.size; cell++) {
      if (reach[cell] !== 1) {
        continue
      }
      if (field[cell] === 0) {
        next[cell] = 1
      }
      for (const neighbor of graph.neighbors[cell]!) {
        if (field[neighbor] === 0) {
          next[neighbor] = 1
        }
      }
    }
    reach = next
    if (reach[goal] === 1) {
      oracle = round
    }
  }

  const charge = (field: Int8Array): number => field.reduce((sum, tone) => sum + tone, 0)
  const charge0 = charge(history[0]!)
  const back = inverseRounds({
    table,
    schedule,
    state: history[history.length - 1]!,
    rounds: history.length - 1,
  })

  const instance = defineInstance({
    id: problem.id,
    kind: 'dynamicMaze',
    geometry: geometry.spec.name,
    curvature: geometry.spec.curvature,
    cells: graph.size,
    variant: 'base',
    oracleCost: oracle,
    oracleSolvable: oracle === null ? null : true,
    problem,
    operators,
    heuristic: { id: 'bare-hop-distance', estimate, preprocessing: fieldCharge([bare]) },
  })

  return {
    instance,
    environment: {
      rule: ruleName,
      colorCount: schedule.colorCount,
      chargeConserved: history.every(field => charge(field) === charge0),
      reversible: toneKey(back) === toneKey(history[0]!),
      rounds: history.length - 1,
    },
    frozen: () => summarize(frozenPlanner(graph, goal, initial), problem, operators),
  }
}
