// Navigation without addressing: can a vibe route a message using only its
// neighbors and embedding coordinates, with no global table and no Fibonacci
// address? This is the alternative to the regular tiling's finite-automaton
// addressing, and the third leg of the P3 fork. Greedy geometric routing on a
// hyperbolic graph is the candidate both-worlds answer.

import { Graph } from '~/core/graph'
import { Rng } from '~/core/rng'

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
  return Math.acosh(1 + (2 * sum2) / denom)
}

// Greedy geometric routing: from the source, repeatedly step to the neighbor
// closest to the target by embedding distance. Success if the target is reached
// without getting stuck at a local minimum and within a hop budget.
export function greedyRoutingSuccess(input: {
  graph: Graph
  trials: number
  rng: Rng
  maxHops?: number
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
      let bestDistance = targetDistance({ graph, node: current, target })
      for (let k = 0; k < row.length; k++) {
        const neighbor = row[k] ?? 0
        const distance = targetDistance({ graph, node: neighbor, target })
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
