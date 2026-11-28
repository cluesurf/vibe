/**
 * The token-sliding kind, pebble motion on the cell graph: pleasure tokens
 * (+1) and pain tokens (-1) on a small ball, one token slid per step to an
 * adjacent empty cell, until the two colors have traded places. A
 * permutation puzzle on the mesh, like the 15-puzzle with tones for tiles.
 *
 * Tokens: two of each color when the ball has at most 22 cells, one of each
 * otherwise (the state space grows as the cells to the fourth power). The
 * +1 tokens start on the first cells of the outer shell and the -1 tokens on
 * its last cells (on every non-origin cell when that shell is too small);
 * the goal swaps them. On a path the colors cannot pass each other, so the
 * line instance has no solution, a built-in accuracy probe.
 *
 * Operators: one per directed edge, `slide-u-v`. Heuristic: the sum over
 * tokens of the bare distance to the nearest goal cell of its color,
 * admissible since each step moves one token one hop; one multi-source
 * distance table per color, charged to the solve. No oracle outside the
 * search.
 */

import type { Operator } from '@/code/intelligence/operator/operator'
import { copyMeshState, type MeshState } from '@/code/intelligence/problem/state'
import { rawKeyMeshProblem, rawToneKey } from '@/code/intelligence/benchmark/navigation/agent-mesh'
import type { LabGeometry } from '@/code/substrate/lab-geometry'
import {
  NAVIGATION_BUDGET,
  defineInstance,
  type NavigationInstance,
} from '@/code/intelligence/benchmark/navigation/instance'
import { cellShells } from '@/code/intelligence/benchmark/navigation/maze'
import { fieldCharge, hopDistances } from '@/code/intelligence/benchmark/navigation/mesh-distance'

const SMALL_BALL = 22

function slideOperators(geometry: LabGeometry): Operator<MeshState>[] {
  const operators: Operator<MeshState>[] = []
  geometry.graph.neighbors.forEach((row, from) => {
    for (const to of row) {
      operators.push({
        id: `slide-${from}-${to}`,
        applicable: state => state.cells[from] !== 0 && state.cells[to] === 0,
        apply(state) {
          if (state.cells[from] === 0 || state.cells[to] !== 0) {
            throw new Error(`slide-${from}-${to}: not applicable`)
          }
          const next = copyMeshState(state)
          next.cells[to] = state.cells[from]!
          next.cells[from] = 0
          return next
        },
        cost: () => 1,
      })
    }
  })
  return operators
}

export function tokenInstance(geometry: LabGeometry): NavigationInstance {
  const graph = geometry.graph
  const perColor = graph.size <= SMALL_BALL ? 2 : 1
  const byShell = cellShells(geometry)
  const outer = byShell[byShell.length - 1]!
  const pool =
    outer.length >= 2 * perColor
      ? outer
      : Array.from({ length: graph.size - 1 }, (_, index) => index + 1)
  const plusStart = pool.slice(0, perColor)
  const minusStart = pool.slice(pool.length - perColor)

  const initial = new Int8Array(graph.size)
  const target = new Int8Array(graph.size)
  for (const cell of plusStart) {
    initial[cell] = 1
    target[cell] = -1
  }
  for (const cell of minusStart) {
    initial[cell] = -1
    target[cell] = 1
  }
  const targetKey = rawToneKey(target)

  // the goal cells of each color are where the other color starts
  const plusField = hopDistances(graph, minusStart)
  const minusField = hopDistances(graph, plusStart)
  const estimate = (state: MeshState): number => {
    let sum = 0
    for (let cell = 0; cell < state.cells.length; cell++) {
      const tone = state.cells[cell]
      if (tone === 1) {
        sum += plusField.distance[cell]!
      } else if (tone === -1) {
        sum += minusField.distance[cell]!
      }
    }
    return sum
  }
  const problem = rawKeyMeshProblem({
    id: `tokenSliding-base-${geometry.spec.name}`,
    regime: 'pure',
    initial: { cells: initial },
    goal: state => rawToneKey(state.cells) === targetKey,
    distance: estimate,
    budget: NAVIGATION_BUDGET,
  })
  return defineInstance({
    id: problem.id,
    kind: 'tokenSliding',
    geometry: geometry.spec.name,
    curvature: geometry.spec.curvature,
    cells: graph.size,
    variant: 'base',
    oracleCost: null,
    oracleSolvable: null,
    problem,
    operators: slideOperators(geometry),
    heuristic: { id: 'nearest-goal-sum', estimate, preprocessing: fieldCharge([plusField, minusField]) },
  })
}
