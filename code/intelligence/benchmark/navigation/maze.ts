/**
 * The maze and obstacle-avoidance kinds: an agent at the origin cell must
 * reach a goal cell among fixed walls. Both wall patterns are structured,
 * never random, and read only the geometry's own cell order and shells.
 *
 * - maze: every shell at hop distance d = 1, 4, 7, ... from the origin is a
 *   wall with one gap, so the open cells form concentric corridors two
 *   shells thick. The first gap is the first cell of its shell; each later
 *   gap is the cell of its shell farthest (bare hop distance) from the gap
 *   before it, so the path must cross each corridor. The goal is the open
 *   cell farthest from the origin through the maze.
 * - obstacle: an open field with obstacles on every cell c with
 *   c mod 7 in {3, 5} (about two in seven), never the origin; the goal is
 *   the highest-numbered open cell, which sits in the outer shell.
 *
 * Variants (instance.ts): `blocked` walls the middle cell of the oracle's
 * shortest path, `sealed` walls every neighbor of the goal (maze only).
 *
 * Oracle: plain graph breadth-first search on the open cells, outside the
 * search machinery. Heuristic: the bare hop distance to the goal, walls
 * ignored, which never overestimates; its table is charged to the solve.
 */

import type { MeshState } from '@/code/intelligence/problem/state'
import type { LabGeometry } from '@/code/substrate/lab-geometry'
import {
  AGENT,
  OPEN,
  WALL,
  agentCell,
  agentPortOperators,
  rawKeyMeshProblem,
} from '@/code/intelligence/benchmark/navigation/agent-mesh'
import {
  NAVIGATION_BUDGET,
  defineInstance,
  type InstanceVariant,
  type NavigationInstance,
} from '@/code/intelligence/benchmark/navigation/instance'
import { fieldCharge, hopDistances, shortestCellPath } from '@/code/intelligence/benchmark/navigation/mesh-distance'

const ORIGIN = 0

/** Cells of each shell, in cell order. */
export function cellShells(geometry: LabGeometry): number[][] {
  const out: number[][] = []
  for (let cell = 0; cell < geometry.graph.size; cell++) {
    const d = geometry.distance[cell]!
    const shell = out[d] ?? []
    shell.push(cell)
    out[d] = shell
  }
  return out
}

export function mazeWalls(geometry: LabGeometry): Uint8Array {
  const walls = new Uint8Array(geometry.graph.size)
  const byShell = cellShells(geometry)
  let previousGap = -1
  for (let d = 1; d < byShell.length; d += 3) {
    const shell = byShell[d]!
    let gap = shell[0]!
    if (previousGap >= 0) {
      const from = hopDistances(geometry.graph, [previousGap]).distance
      for (const cell of shell) {
        if (from[cell]! > from[gap]!) {
          gap = cell
        }
      }
    }
    for (const cell of shell) {
      walls[cell] = cell === gap ? 0 : 1
    }
    previousGap = gap
  }
  return walls
}

export function obstacleWalls(geometry: LabGeometry): Uint8Array {
  const walls = new Uint8Array(geometry.graph.size)
  for (let cell = 1; cell < geometry.graph.size; cell++) {
    walls[cell] = cell % 7 === 3 || cell % 7 === 5 ? 1 : 0
  }
  return walls
}

/** The open cell farthest from the origin through the walls, ties to the lowest cell. */
function farthestOpen(geometry: LabGeometry, walls: Uint8Array): number {
  const reach = hopDistances(geometry.graph, [ORIGIN], cell => walls[cell] === 1).distance
  let goal = ORIGIN
  for (let cell = 0; cell < reach.length; cell++) {
    if (reach[cell]! > reach[goal]!) {
      goal = cell
    }
  }
  return goal
}

function highestOpen(walls: Uint8Array): number {
  for (let cell = walls.length - 1; cell > 0; cell--) {
    if (walls[cell] === 0) {
      return cell
    }
  }
  return ORIGIN
}

function wallInstance(input: {
  geometry: LabGeometry
  kind: 'maze' | 'obstacle'
  variant: InstanceVariant
  walls: Uint8Array
  goal: number
}): NavigationInstance {
  const { geometry, kind, variant, walls, goal } = input
  const graph = geometry.graph
  const cells = new Int8Array(graph.size)
  for (let cell = 0; cell < graph.size; cell++) {
    cells[cell] = walls[cell] === 1 ? WALL : OPEN
  }
  cells[ORIGIN] = AGENT
  const oracle = hopDistances(graph, [ORIGIN], cell => walls[cell] === 1).distance[goal]!
  const bare = hopDistances(graph, [goal])
  const estimate = (state: MeshState): number => bare.distance[agentCell(state)]!
  const problem = rawKeyMeshProblem({
    id: `${kind}-${variant}-${geometry.spec.name}`,
    regime: 'pure',
    initial: { cells },
    goal: state => state.cells[goal] === AGENT,
    distance: estimate,
    budget: NAVIGATION_BUDGET,
  })
  return defineInstance({
    id: problem.id,
    kind,
    geometry: geometry.spec.name,
    curvature: geometry.spec.curvature,
    cells: graph.size,
    variant,
    oracleCost: oracle >= 0 ? oracle : null,
    oracleSolvable: oracle >= 0,
    problem,
    operators: agentPortOperators(graph, tone => tone === OPEN),
    heuristic: { id: 'bare-hop-distance', estimate, preprocessing: fieldCharge([bare]) },
  })
}

/** The base, blocked and (maze only) sealed instances of one wall kind on one geometry. */
export function wallInstances(geometry: LabGeometry, kind: 'maze' | 'obstacle'): NavigationInstance[] {
  const walls = kind === 'maze' ? mazeWalls(geometry) : obstacleWalls(geometry)
  walls[ORIGIN] = 0
  const goal = kind === 'maze' ? farthestOpen(geometry, walls) : highestOpen(walls)
  const out = [wallInstance({ geometry, kind, variant: 'base', walls, goal })]

  const path = shortestCellPath(geometry.graph, ORIGIN, goal, cell => walls[cell] === 1)
  if (path !== null && path.length >= 3) {
    const blocked = walls.slice()
    blocked[path[Math.floor(path.length / 2)]!] = 1
    out.push(wallInstance({ geometry, kind, variant: 'blocked', walls: blocked, goal }))
  }

  if (kind === 'maze' && goal !== ORIGIN) {
    const sealed = walls.slice()
    for (const cell of geometry.graph.neighbors[goal]!) {
      if (cell !== ORIGIN) {
        sealed[cell] = 1
      }
    }
    out.push(wallInstance({ geometry, kind, variant: 'sealed', walls: sealed, goal }))
  }
  return out
}
