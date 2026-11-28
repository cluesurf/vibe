/**
 * Held-out problems for level 2, built from benchmark family A before any
 * learning: on each lab geometry, the maze and obstacle fields of family A
 * (the same structured walls and the same goal rule), with the agent
 * starting from many cells. The starts are the cells that can reach the
 * goal, in cell order; position p in that list is a training start when
 * p mod 4 = 0 and a held-out start when p mod 4 = 2, so the two sets are
 * disjoint, fixed by the geometry alone, and the held-out set exists before
 * the learner is built.
 *
 * The oracle is plain graph breadth-first search from the goal through the
 * open cells, outside the problem/operator/solver machinery; it gives the
 * exact cost-to-go of every start, which checks the learned table and the
 * solvers independently. The base heuristic is family A's: bare hop
 * distance to the goal, walls ignored, its table charged.
 *
 * The bare-hop table is sealed with the evaluator (`sealEstimate`), so a
 * solve that reads it, as the base heuristic or as `problem.distance`, is
 * charged for it by the evaluator, never by its own declaration; the port
 * operators are registered as this world's primitives.
 *
 * This file sits beside the learner only because that is where the level 2
 * code lives; it is evaluator side, and no learner may import it.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import { registerPrimitives, sealEstimate } from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import type { MeshState } from '@/code/intelligence/problem/state'
import type { Heuristic } from '@/code/intelligence/solver/search/expand'
import {
  AGENT,
  OPEN,
  WALL,
  agentCell,
  agentPortOperators,
  rawKeyMeshProblem,
} from '@/code/intelligence/benchmark/navigation/agent-mesh'
import { familyGeometries } from '@/code/intelligence/benchmark/navigation/family'
import { NAVIGATION_BUDGET } from '@/code/intelligence/benchmark/navigation/instance'
import { mazeWalls, obstacleWalls } from '@/code/intelligence/benchmark/navigation/maze'
import { fieldCharge, hopDistances } from '@/code/intelligence/benchmark/navigation/mesh-distance'
import type { LabCurvature, LabGeometry, LabGeometryName } from '@/code/substrate/lab-geometry'

const ORIGIN = 0

export const SPLIT_PERIOD = 4
export const TRAINING_PHASE = 0
export const HELD_OUT_PHASE = 2

export type LearningKind = 'maze' | 'obstacle'

export const LEARNING_KINDS: readonly LearningKind[] = ['maze', 'obstacle']

export interface LearningEnvironment {
  id: string
  kind: LearningKind
  geometry: LabGeometryName
  curvature: LabCurvature
  cells: number
  goal: number
  operators: Operator<MeshState>[]
  /** bare hop distance to the goal, walls ignored, its table charged */
  base: Heuristic<MeshState>
  /** exact hop distance to the goal through the open cells, -1 where unreachable */
  oracle: Int32Array
  training: Problem<MeshState>[]
  heldOut: Problem<MeshState>[]
  /** the start cell of each problem, by problem id */
  startOf: ReadonlyMap<string, number>
}

/** The agent's cell read from a raw tone key (one latin-1 char per cell). */
export function agentOfKey(key: string): number {
  return key.indexOf(String.fromCharCode(AGENT))
}

function goalCell(geometry: LabGeometry, kind: LearningKind, walls: Uint8Array): number {
  if (kind === 'obstacle') {
    for (let cell = walls.length - 1; cell > 0; cell--) {
      if (walls[cell] === 0) {
        return cell
      }
    }

    return ORIGIN
  }

  const reach = hopDistances(geometry.graph, [ORIGIN], cell => walls[cell] === 1).distance

  let goal = ORIGIN

  for (let cell = 0; cell < reach.length; cell++) {
    if (reach[cell]! > reach[goal]!) {
      goal = cell
    }
  }

  return goal
}

function environment(geometry: LabGeometry, kind: LearningKind): LearningEnvironment {
  const graph = geometry.graph
  const walls = kind === 'maze' ? mazeWalls(geometry) : obstacleWalls(geometry)

  walls[ORIGIN] = 0

  const goal = goalCell(geometry, kind, walls)
  const oracle = hopDistances(graph, [goal], cell => walls[cell] === 1).distance
  const bare = hopDistances(graph, [goal])
  const name = geometry.spec.name
  const id = `${kind}-${name}`
  const charge = fieldCharge([bare])
  // one sealed table, read as the problems' distance and as the base heuristic; any solve that reads it pays for it
  const estimate = sealEstimate(`bare-hop-distance:${id}`, (state: MeshState): number => bare.distance[agentCell(state)]!, charge)
  const startOf = new Map<string, number>()

  const problemFrom = (start: number): Problem<MeshState> => {
    const cells = new Int8Array(graph.size)

    for (let cell = 0; cell < graph.size; cell++) {
      cells[cell] = walls[cell] === 1 ? WALL : OPEN
    }

    cells[start] = AGENT

    const problem = rawKeyMeshProblem({
      id: `${id}-from-${start}`,
      regime: 'pure',
      initial: { cells },
      goal: state => state.cells[goal] === AGENT,
      distance: estimate,
      budget: NAVIGATION_BUDGET,
    })

    startOf.set(problem.id, start)

    return problem
  }

  const starts: number[] = []

  for (let cell = 0; cell < graph.size; cell++) {
    if (oracle[cell]! > 0) {
      starts.push(cell)
    }
  }

  const training: Problem<MeshState>[] = []
  const heldOut: Problem<MeshState>[] = []

  starts.forEach((start, position) => {
    const phase = position % SPLIT_PERIOD

    if (phase === TRAINING_PHASE) {
      training.push(problemFrom(start))
    } else if (phase === HELD_OUT_PHASE) {
      heldOut.push(problemFrom(start))
    }
  })

  return {
    id,
    kind,
    geometry: name,
    curvature: geometry.spec.curvature,
    cells: graph.size,
    goal,
    operators: registerPrimitives(agentPortOperators(graph, tone => tone === OPEN)),
    base: { id: 'bare-hop-distance', estimate, preprocessing: charge },
    oracle,
    training,
    heldOut,
    startOf,
  }
}

/** The level 2 environments on the given geometries (all twelve by default), maze and obstacle on each. */
export function learningEnvironments(names?: readonly LabGeometryName[]): LearningEnvironment[] {
  const out: LearningEnvironment[] = []

  for (const geometry of familyGeometries(names)) {
    for (const kind of LEARNING_KINDS) {
      out.push(environment(geometry.walk, kind))
    }
  }

  return out
}
