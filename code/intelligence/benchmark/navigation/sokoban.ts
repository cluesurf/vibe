/**
 * A small Sokoban on the mesh: the agent (+1) must push one box (-1) onto a
 * target cell. The agent walks into empty cells; it pushes by walking into
 * the box's cell, and the box moves on to a neighbor w of its cell that is
 * empty, is not the agent's cell, and is not adjacent to the agent's cell
 * (so the box always moves away from the pusher, two hops from where the
 * agent stood). A tiling has no global "straight ahead", so this is the
 * graph form of a push: on the square grid it allows the straight push and
 * the two diagonal-away pushes. The ball's rim is the wall, so a box pushed
 * against it can be stuck for good, the long-horizon consequence the kind
 * tests.
 *
 * Start: agent at the origin, box on cell 1 (the first cell of shell 1).
 * Target: the outer-shell cell farthest from the box, ties to the lowest.
 * Operators: `port-p` moves, then `push-p-q` (agent port p, box port q).
 * Heuristic: the bare distance from the box to the target, admissible since
 * each push moves the box one hop. No oracle outside the search.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import { copyMeshState, type MeshState } from '@/code/intelligence/problem/state'
import type { LabGeometry } from '@/code/substrate/lab-geometry'
import {
  AGENT,
  OPEN,
  agentCell,
  agentPortOperators,
  maxDegree,
  rawKeyMeshProblem,
} from '@/code/intelligence/benchmark/navigation/agent-mesh'
import {
  NAVIGATION_BUDGET,
  defineInstance,
  type NavigationInstance,
} from '@/code/intelligence/benchmark/navigation/instance'
import { cellShells } from '@/code/intelligence/benchmark/navigation/maze'
import { fieldCharge, hopDistances } from '@/code/intelligence/benchmark/navigation/mesh-distance'

const BOX = -1
const ORIGIN = 0
const BOX_START = 1

function pushOperators(geometry: LabGeometry): Operator<MeshState>[] {
  const graph = geometry.graph
  const top = maxDegree(graph)
  const operators: Operator<MeshState>[] = []
  for (let agentPort = 0; agentPort < top; agentPort++) {
    for (let boxPort = 0; boxPort < top; boxPort++) {
      // the cells of a push from this state, or null when it is not a legal push
      const cellsOf = (state: MeshState): { from: number; box: number; to: number } | null => {
        const from = agentCell(state)
        const row = graph.neighbors[from]!
        if (agentPort >= row.length) {
          return null
        }
        const box = row[agentPort]!
        if (state.cells[box] !== BOX) {
          return null
        }
        const boxRow = graph.neighbors[box]!
        if (boxPort >= boxRow.length) {
          return null
        }
        const to = boxRow[boxPort]!
        if (to === from || row.includes(to) || state.cells[to] !== OPEN) {
          return null
        }
        return { from, box, to }
      }
      const id = `push-${agentPort}-${boxPort}`
      operators.push({
        id,
        applicable: state => cellsOf(state) !== null,
        apply(state) {
          const push = cellsOf(state)
          if (push === null) {
            throw new Error(`${id}: not applicable`)
          }
          const next = copyMeshState(state)
          next.cells[push.from] = OPEN
          next.cells[push.box] = AGENT
          next.cells[push.to] = BOX
          return next
        },
        cost: () => 1,
      })
    }
  }
  return operators
}

export function sokobanInstance(geometry: LabGeometry): NavigationInstance {
  const graph = geometry.graph
  const byShell = cellShells(geometry)
  const outer = byShell[byShell.length - 1]!
  const fromBox = hopDistances(graph, [BOX_START]).distance
  let target = outer[0]!
  for (const cell of outer) {
    if (fromBox[cell]! > fromBox[target]!) {
      target = cell
    }
  }
  const cells = new Int8Array(graph.size)
  cells[ORIGIN] = AGENT
  cells[BOX_START] = BOX
  const toTarget = hopDistances(graph, [target])
  const estimate = (state: MeshState): number => toTarget.distance[state.cells.indexOf(BOX)]!
  const problem = rawKeyMeshProblem({
    id: `sokoban-base-${geometry.spec.name}`,
    regime: 'pure',
    initial: { cells },
    goal: state => state.cells[target] === BOX,
    distance: estimate,
    budget: NAVIGATION_BUDGET,
  })
  return defineInstance({
    id: problem.id,
    kind: 'sokoban',
    geometry: geometry.spec.name,
    curvature: geometry.spec.curvature,
    cells: graph.size,
    variant: 'base',
    oracleCost: null,
    oracleSolvable: null,
    problem,
    operators: [...agentPortOperators(graph, tone => tone === OPEN), ...pushOperators(geometry)],
    heuristic: { id: 'box-hop-distance', estimate, preprocessing: fieldCharge([toTarget]) },
  })
}
