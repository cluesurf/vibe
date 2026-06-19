// Navigation without addressing: can a vibe route a message using only its
// neighbors and embedding coordinates, with no global table and no Fibonacci
// address? This is the alternative to the regular tiling's finite-automaton
// addressing, and the third leg of the P3 fork. Greedy geometric routing on a
// hyperbolic graph is the candidate both-worlds answer.

import { Graph } from '@/code/tool/graph'
import { poincareCoshFromParts } from '@/code/geometry/distance'
import { Rng } from '@/code/tool/rng'

// Distance used by greedy routing. For a hyperbolic (Poincare-disc) embedding we
// use the true hyperbolic disc distance; otherwise Euclidean in the coordinates.
function targetDistance(input: {
  graph: Graph
  node: number
  target: number
}): number {
  const e = input.graph.embedding
  if (!e) {
    return 0
  }
  const d = e.dimension
  const isDisc = e.manifold.form === 'hyperbolic'
  let sum2 = 0
  let nodeNorm2 = 0
  let targetNorm2 = 0
  for (let axis = 0; axis < d; axis++) {
    const a = e.coords[input.node * d + axis] ?? 0
    const b = e.coords[input.target * d + axis] ?? 0
    sum2 += (a - b) * (a - b)
    nodeNorm2 += a * a
    targetNorm2 += b * b
  }
  if (!isDisc) {
    return Math.sqrt(sum2)
  }
  // Poincare disc distance: arccosh(1 + 2|u-v|^2 / ((1-|u|^2)(1-|v|^2))).
  const denom = (1 - nodeNorm2) * (1 - targetNorm2)
  if (denom <= 0) {
    return Math.sqrt(sum2)
  }
  return Math.acosh(
    poincareCoshFromParts(sum2, 1 - nodeNorm2, 1 - targetNorm2),
  )
}

// Greedy geometric routing for a single source/target pair: from the source, step
// each time to the neighbor closest to the target by embedding distance, until the
// target is reached. Returns the hop count, or -1 if it gets stuck at a local minimum
// or exceeds the hop budget. The single-pair primitive under greedyRoutingSuccess.
export function greedyRouteHops(input: {
  graph: Graph
  source: number
  target: number
  maxHops?: number
}): number {
  const { graph, source, target } = input
  const maxHops = input.maxHops ?? 4 * graph.size
  let current = source
  let hops = 0
  while (current !== target && hops < maxHops) {
    const row = graph.neighbors[current] ?? new Uint32Array(0)
    let best = -1
    let bestDistance = targetDistance({ graph, node: current, target })
    for (let k = 0; k < row.length; k++) {
      const neighbor = row[k] ?? 0
      const distance = targetDistance({ graph, node: neighbor, target })
      if (distance < bestDistance) {
        bestDistance = distance
        best = neighbor
      }
    }
    if (best === -1) {
      return -1
    } // stuck at a local minimum, greedy failed
    current = best
    hops += 1
  }
  return current === target ? hops : -1
}

// Greedy geometric routing: from the source, repeatedly step to the neighbor
// closest to the target by embedding distance. Success if the target is reached
// without getting stuck at a local minimum and within a hop budget.
export function greedyRoutingSuccess(input: {
  graph: Graph
  trials: number
  rng: Rng
  maxHops?: number
  countDisconnectedAsFailure?: boolean
}): { successRate: number; meanStretch: number; trials: number } {
  const graph = input.graph
  if (!graph.embedding) {
    return { successRate: 0, meanStretch: 0, trials: 0 }
  }
  const size = graph.size
  const maxHops = input.maxHops ?? 4 * Math.ceil(Math.sqrt(size)) + 20

  let successes = 0
  let stretchSum = 0
  let counted = 0

  for (let t = 0; t < input.trials; t++) {
    const source = input.rng.nextInt({ max: size })
    let target = input.rng.nextInt({ max: size })
    if (target === source) {
      target = (target + 1) % size
    }
    // By default an unreachable target is a connectivity fact, not a routing failure, so we skip
    // disconnected pairs (this measures routing quality GIVEN connectivity, used on connected
    // tilings in P42/P76). For a GLOBAL navigability claim (P3), set countDisconnectedAsFailure:
    // a fragmented graph that routes only within tiny components is not globally navigable, so
    // unreachable pairs are counted as failures.
    if (bfsHops({ graph, from: source, to: target }) < 0) {
      if (input.countDisconnectedAsFailure) {
        counted++
      }
      continue
    }

    let current = source
    let hops = 0
    let reached = false
    let stuck = false
    while (hops < maxHops) {
      if (current === target) {
        reached = true
        break
      }
      const row = graph.neighbors[current] ?? new Uint32Array(0)
      let best = -1
      let bestDistance = targetDistance({
        graph,
        node: current,
        target,
      })
      for (let k = 0; k < row.length; k++) {
        const neighbor = row[k] ?? 0
        const distance = targetDistance({
          graph,
          node: neighbor,
          target,
        })
        if (distance < bestDistance) {
          bestDistance = distance
          best = neighbor
        }
      }
      if (best < 0) {
        // No neighbor is closer: a local minimum, greedy routing fails here.
        stuck = true
        break
      }
      current = best
      hops++
    }

    counted++
    if (reached && !stuck) {
      successes++
      // Stretch against the straight-line hop estimate is approximated by hops
      // over the lower bound 1, reported as raw hop count normalised by sqrt N.
      stretchSum += hops / Math.max(1, Math.sqrt(size))
    }
  }

  return {
    successRate: counted === 0 ? 0 : successes / counted,
    meanStretch: successes === 0 ? 0 : stretchSum / successes,
    trials: counted,
  }
}

// Distance-guided depth-first routing with backtracking: at each node move to the
// unvisited neighbor closest to the target, and pop when stuck. This uses local
// memory (the path stack and a visited set) but never gives up on a connected
// graph, so it pushes navigability toward 100 percent. The price over pure
// greedy is the memory and a longer route. We report success and the route
// stretch (forward path length over the shortest-path hop count).
export function routingWithBacktrack(input: {
  graph: Graph
  trials: number
  rng: Rng
  maxSteps?: number
}): { successRate: number; meanStretch: number; trials: number } {
  const graph = input.graph
  if (!graph.embedding) {
    return { successRate: 0, meanStretch: 0, trials: 0 }
  }
  const size = graph.size
  const maxSteps = input.maxSteps ?? 40 * size

  let successes = 0
  let stretchSum = 0
  let counted = 0

  for (let t = 0; t < input.trials; t++) {
    const source = input.rng.nextInt({ max: size })
    let target = input.rng.nextInt({ max: size })
    if (target === source) {
      target = (target + 1) % size
    }
    const shortest = bfsHops({ graph, from: source, to: target })
    if (shortest < 0) {
      continue
    }

    const visited = new Uint8Array(size)
    const stack: number[] = [source]
    visited[source] = 1
    let steps = 0
    let reached = false

    while (stack.length > 0 && steps < maxSteps) {
      const current = stack[stack.length - 1] ?? source
      if (current === target) {
        reached = true
        break
      }
      const row = graph.neighbors[current] ?? new Uint32Array(0)
      let best = -1
      let bestDistance = Infinity
      for (let k = 0; k < row.length; k++) {
        const neighbor = row[k] ?? 0
        if ((visited[neighbor] ?? 0) === 1) {
          continue
        }
        const distance = targetDistance({
          graph,
          node: neighbor,
          target,
        })
        if (distance < bestDistance) {
          bestDistance = distance
          best = neighbor
        }
      }
      if (best < 0) {
        stack.pop()
      } else {
        visited[best] = 1
        stack.push(best)
      }
      steps++
    }

    counted++
    if (reached) {
      successes++
      const routeLength = stack.length - 1
      if (shortest > 0) {
        stretchSum += routeLength / shortest
      }
    }
  }

  return {
    successRate: counted === 0 ? 0 : successes / counted,
    meanStretch: successes === 0 ? 0 : stretchSum / successes,
    trials: counted,
  }
}

function bfsHops(input: {
  graph: Graph
  from: number
  to: number
}): number {
  if (input.from === input.to) {
    return 0
  }
  const size = input.graph.size
  const distance = new Int32Array(size).fill(-1)
  distance[input.from] = 0
  let frontier: number[] = [input.from]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const node of frontier) {
      const row = input.graph.neighbors[node] ?? new Uint32Array(0)
      for (let k = 0; k < row.length; k++) {
        const neighbor = row[k] ?? 0
        if ((distance[neighbor] ?? -1) === -1) {
          distance[neighbor] = (distance[node] ?? 0) + 1
          if (neighbor === input.to) {
            return distance[neighbor] ?? -1
          }
          next.push(neighbor)
        }
      }
    }
    frontier = next
  }
  return -1
}
