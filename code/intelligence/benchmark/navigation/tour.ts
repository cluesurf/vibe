/**
 * The tour kind, a travelling-salesperson path over mesh cells: the agent
 * starts at the origin and must visit every city (pain -1 cells, no walls),
 * a city counting as visited once the agent enters it. Open path, no
 * return. The state space is position x visited set, so the tour is a
 * shortest-path problem the baselines solve like any other.
 *
 * Cities: five cells spread evenly through the outer shell in cell order
 * (through every non-origin cell when the outer shell has fewer than five).
 *
 * Oracle: Held-Karp dynamic programming over the hop distances between the
 * start and the cities, an exact method that shares nothing with the
 * state-space search. The two optima agree because a walk passing through a
 * city early only helps, and the optimal walk's cost is at least the sum of
 * hop distances between its successive first visits.
 *
 * Heuristic: the bare distance to the farthest unvisited city, admissible
 * and consistent; one distance table per city, charged to the solve.
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
  type NavigationInstance,
} from '@/code/intelligence/benchmark/navigation/instance'
import { cellShells } from '@/code/intelligence/benchmark/navigation/maze'
import { fieldCharge, hopDistances } from '@/code/intelligence/benchmark/navigation/mesh-distance'

const ORIGIN = 0
const CITY_COUNT = 5

export function tourCities(geometry: LabGeometry): number[] {
  const byShell = cellShells(geometry)
  const outer = byShell[byShell.length - 1]!
  const pool =
    outer.length >= CITY_COUNT
      ? outer
      : Array.from({ length: geometry.graph.size - 1 }, (_, index) => index + 1)
  const count = Math.min(CITY_COUNT, pool.length)
  return Array.from({ length: count }, (_, index) => pool[Math.floor((index * pool.length) / count)]!)
}

/** Held-Karp: the shortest open walk from `start` through every city, from a distance matrix. */
export function heldKarp(fromStart: readonly number[], between: readonly (readonly number[])[]): number {
  const count = fromStart.length
  const full = (1 << count) - 1
  const table = Array.from({ length: 1 << count }, () => new Array<number>(count).fill(Infinity))
  for (let city = 0; city < count; city++) {
    table[1 << city]![city] = fromStart[city]!
  }
  for (let mask = 1; mask <= full; mask++) {
    for (let last = 0; last < count; last++) {
      const here = table[mask]![last]!
      if (!(mask & (1 << last)) || here === Infinity) {
        continue
      }
      for (let next = 0; next < count; next++) {
        if (mask & (1 << next)) {
          continue
        }
        const wider = mask | (1 << next)
        const cost = here + between[last]![next]!
        if (cost < table[wider]![next]!) {
          table[wider]![next] = cost
        }
      }
    }
  }
  return Math.min(...table[full]!)
}

export function tourInstance(geometry: LabGeometry): NavigationInstance {
  const graph = geometry.graph
  const cities = tourCities(geometry)
  const fields = cities.map(city => hopDistances(graph, [city]))
  const fromStart = fields.map(field => field.distance[ORIGIN]!)
  const between = fields.map(field => cities.map(city => field.distance[city]!))
  const oracle = heldKarp(fromStart, between)

  const cells = new Int8Array(graph.size)
  for (const city of cities) {
    cells[city] = WALL
  }
  cells[ORIGIN] = AGENT
  const estimate = (state: MeshState): number => {
    const at = agentCell(state)
    let farthest = 0
    cities.forEach((city, index) => {
      if (state.cells[city] === WALL) {
        farthest = Math.max(farthest, fields[index]!.distance[at]!)
      }
    })
    return farthest
  }
  const problem = rawKeyMeshProblem({
    id: `tour-base-${geometry.spec.name}`,
    regime: 'pure',
    initial: { cells },
    goal: state => !state.cells.includes(WALL),
    distance: estimate,
    budget: NAVIGATION_BUDGET,
  })
  return defineInstance({
    id: problem.id,
    kind: 'tour',
    geometry: geometry.spec.name,
    curvature: geometry.spec.curvature,
    cells: graph.size,
    variant: 'base',
    oracleCost: oracle,
    oracleSolvable: true,
    problem,
    operators: agentPortOperators(graph, tone => tone === OPEN || tone === WALL),
    heuristic: { id: 'farthest-city', estimate, preprocessing: fieldCharge(fields) },
  })
}
