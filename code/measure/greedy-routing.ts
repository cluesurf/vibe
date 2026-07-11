import { Graph } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'

// Greedy geometric routing, the local-only physical walkway. A walker who knows only its own
// coordinate, its neighbors' coordinates, and the target's coordinate can reach any target by
// always stepping to the neighbor closest to the target in the hyperbolic metric. No global map, no
// routing table, just local descent: the exact walkway a self can physically follow through the
// bulk. In the hyperbolic embedding this greedy walk always arrives and the path is nearly the true
// geodesic (low stretch). Scrambling the coordinates (a walker with no meaningful map) makes the
// greedy walk stall in local minima almost always.

// The Poincare-disk hyperbolic distance between two embedded points.
export function poincareDistance(input: {
  ux: number
  uy: number
  vx: number
  vy: number
}): number {
  const { ux, uy, vx, vy } = input
  const numerator = (ux - vx) * (ux - vx) + (uy - vy) * (uy - vy)
  const denominator =
    (1 - (ux * ux + uy * uy)) * (1 - (vx * vx + vy * vy))

  return Math.acosh(1 + (2 * numerator) / Math.max(denominator, 1e-15))
}

// The graph (breadth-first) distance between two cells, for measuring stretch.
export function graphDistance(
  graph: Graph,
  source: number,
  target: number,
): number {
  const distance = new Map<number, number>([[source, 0]])
  const queue = [source]

  while (queue.length > 0) {
    const cell = queue.shift()!

    if (cell === target) return distance.get(cell)!

    for (const neighbor of graph.neighbors[cell] ??
      new Uint32Array(0)) {
      if (!distance.has(neighbor)) {
        distance.set(neighbor, distance.get(cell)! + 1)
        queue.push(neighbor)
      }
    }
  }

  return -1
}

// Greedy route from source to target using a coordinate lookup: at each step move to the neighbor
// that minimizes the hyperbolic distance to the target, never revisiting. Returns the number of
// steps, or -1 if it stalls in a local minimum (no neighbor is strictly closer) before arriving.
export function greedyRoute(input: {
  graph: Graph
  coordX: (cell: number) => number
  coordY: (cell: number) => number
  source: number
  target: number
  limit: number
}): number {
  const { graph, coordX, coordY, source, target, limit } = input

  let current = source
  let steps = 0

  const seen = new Set<number>()

  const distanceTo = (cell: number): number =>
    poincareDistance({
      ux: coordX(cell),
      uy: coordY(cell),
      vx: coordX(target),
      vy: coordY(target),
    })

  while (current !== target && steps < limit) {
    seen.add(current)

    let best = -1
    let bestDistance = distanceTo(current)

    for (const neighbor of graph.neighbors[current] ??
      new Uint32Array(0)) {
      const candidate = distanceTo(neighbor)

      if (candidate < bestDistance - 1e-12 && !seen.has(neighbor)) {
        bestDistance = candidate
        best = neighbor
      }
    }

    if (best < 0) return -1

    current = best
    steps++
  }

  return current === target ? steps : -1
}

// A deterministic scramble of the cell indices, for the no-meaningful-map control: the coordinate
// of cell i is taken to be the embedding coordinate of scramble[i].
export function scramblePermutation(
  size: number,
  seed: number,
): number[] {
  const permutation = Array.from({ length: size }, (unused, i) => i)
  const rng = makeRng({ seed })

  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const swap = permutation[i]!

    permutation[i] = permutation[j]!
    permutation[j] = swap
  }

  return permutation
}
