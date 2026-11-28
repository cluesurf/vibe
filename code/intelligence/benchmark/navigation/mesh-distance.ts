/**
 * Hop distances on a cell graph, for two different jobs that must not be
 * confused:
 *
 * - a heuristic table: distances on the bare mesh, walls ignored (a
 *   relaxation, so every estimate built from it is admissible). Building
 *   it costs one expansion per cell reached and the bytes of the table,
 *   and that cost is charged to every solver that uses it.
 * - an oracle: distances with the walls in place, computed by plain graph
 *   breadth-first search on the cells, outside the problem/operator/solver
 *   machinery, so it checks the state-space solvers independently.
 */

import type { Graph } from '@/code/tool/graph'
import type { Preprocessing } from '@/code/intelligence/solver/solver'

export interface DistanceField {
  /** hop distance from the nearest source, -1 where unreachable */
  distance: Int32Array
  /** cells expanded to build it */
  expansions: number
  bytes: number
}

/** Breadth-first hop distances from `sources`, never entering a blocked cell. */
export function hopDistances(
  graph: Graph,
  sources: readonly number[],
  blocked?: (cell: number) => boolean,
): DistanceField {
  const distance = new Int32Array(graph.size).fill(-1)
  const queue: number[] = []
  for (const source of sources) {
    if (distance[source] === -1 && !(blocked?.(source) ?? false)) {
      distance[source] = 0
      queue.push(source)
    }
  }
  let expansions = 0
  // a for-of over an array that grows while it runs visits the pushed cells too, which is the BFS queue
  for (const cell of queue) {
    expansions++
    for (const next of graph.neighbors[cell]!) {
      if (distance[next] === -1 && !(blocked?.(next) ?? false)) {
        distance[next] = distance[cell]! + 1
        queue.push(next)
      }
    }
  }
  return { distance, expansions, bytes: distance.byteLength }
}

/**
 * One shortest path from `from` to `to` avoiding blocked cells, parents taken
 * at the lowest neighbor index, or null when there is none.
 */
export function shortestCellPath(
  graph: Graph,
  from: number,
  to: number,
  blocked?: (cell: number) => boolean,
): number[] | null {
  const field = hopDistances(graph, [to], blocked)
  if (field.distance[from] === -1) {
    return null
  }
  const path = [from]
  let cell = from
  while (cell !== to) {
    let step = -1
    for (const next of graph.neighbors[cell]!) {
      if (field.distance[next] === field.distance[cell]! - 1) {
        step = next
        break
      }
    }
    path.push(step)
    cell = step
  }
  return path
}

/** The charge for a set of distance fields, as one solve's preprocessing. */
export function fieldCharge(fields: readonly DistanceField[]): Preprocessing {
  let expansions = 0
  let memoryBytes = 0
  for (const field of fields) {
    expansions += field.expansions
    memoryBytes += field.bytes
  }
  return { expansions, operatorCalls: 0, memoryBytes }
}
