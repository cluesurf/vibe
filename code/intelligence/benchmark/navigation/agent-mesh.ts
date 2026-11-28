/**
 * An agent on the mesh, written in tones (pure regime, cells only): the
 * agent's cell is pleasure +1, a wall (or, in the tour, an unvisited city)
 * is pain -1, an open cell is peace 0. The tones here are labels of a
 * puzzle, never read as experience.
 *
 * The operators are the ports of a cell: `port-p` moves the agent to the
 * p-th neighbor of its cell (neighbors in ascending cell order), so a
 * degree-d mesh has d operators. Every move costs 1.
 */

import { Buffer } from 'node:buffer'
import type { Operator } from '@/code/intelligence/operator/operator'
import { meshProblem, type Budget, type Problem } from '@/code/intelligence/problem/problem'
import { copyMeshState, type MeshState, type Regime } from '@/code/intelligence/problem/state'
import type { Graph } from '@/code/tool/graph'

export const AGENT = 1
export const WALL = -1
export const OPEN = 0

/**
 * An injective key of a tone array: its raw bytes read as latin-1, one char
 * per cell. Equal keys exactly when equal tones, like the shared toneKey,
 * but built natively in one pass, which the searches call once per state.
 */
export function rawToneKey(tones: Int8Array): string {
  return Buffer.from(tones.buffer, tones.byteOffset, tones.byteLength).toString('latin1')
}

/** A pure mesh problem (meshProblem's checks) keyed by rawToneKey. */
export function rawKeyMeshProblem(input: {
  id: string
  regime: Regime
  initial: MeshState
  goal: (state: MeshState) => boolean
  distance: (state: MeshState) => number
  budget: Budget
}): Problem<MeshState> {
  if (input.regime !== 'pure') {
    throw new Error(`rawKeyMeshProblem ${input.id}: the raw key covers cells only, so only the pure regime`)
  }
  return { ...meshProblem(input), key: state => rawToneKey(state.cells) }
}

/** The agent's cell: the one +1 cell. */
export function agentCell(state: MeshState): number {
  return state.cells.indexOf(AGENT)
}

export function maxDegree(graph: Graph): number {
  let top = 0
  for (const row of graph.neighbors) {
    top = Math.max(top, row.length)
  }
  return top
}

/**
 * One operator per port. `passable(tone)` says whether the agent may enter a
 * cell holding that tone; the cell it leaves becomes open, so in the tour
 * entering a city (-1) marks it visited.
 */
export function agentPortOperators(
  graph: Graph,
  passable: (tone: number) => boolean,
): Operator<MeshState>[] {
  const operators: Operator<MeshState>[] = []
  for (let port = 0; port < maxDegree(graph); port++) {
    const target = (state: MeshState): number => {
      const row = graph.neighbors[agentCell(state)]
      return row !== undefined && port < row.length ? row[port]! : -1
    }
    operators.push({
      id: `port-${port}`,
      applicable(state) {
        const cell = target(state)
        return cell >= 0 && passable(state.cells[cell]!)
      },
      apply(state) {
        const cell = target(state)
        if (cell < 0 || !passable(state.cells[cell]!)) {
          throw new Error(`port-${port}: not applicable`)
        }
        const next = copyMeshState(state)
        next.cells[agentCell(state)] = OPEN
        next.cells[cell] = AGENT
        return next
      },
      cost: () => 1,
    })
  }
  return operators
}
