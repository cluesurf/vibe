// Random walks on a neighbors graph. A single charge taking uniform random steps along adjacency, the
// simplest probe of how a perturbation spreads on the substrate. Core dynamics, used by the isotropy and
// diffusion experiments. The caller supplies the Rng so the walk stays deterministic.

import { Rng } from '@/code/tool/rng'

type Neighbors = ReadonlyArray<ReadonlyArray<number>>

// The endpoint of a uniform random walk of the given number of steps from a start node.
export function randomWalkEndpoint(input: {
  neighbors: Neighbors
  start: number
  steps: number
  rng: Rng
}): number {
  let cur = input.start
  for (let t = 0; t < input.steps; t++) {
    const nbrs = input.neighbors[cur] ?? []
    if (nbrs.length === 0) break
    cur = nbrs[Math.floor(input.rng.next() * nbrs.length)]!
  }
  return cur
}

// The full visited path (start included) of a uniform random walk.
export function randomWalkPath(input: {
  neighbors: Neighbors
  start: number
  steps: number
  rng: Rng
}): number[] {
  const path = [input.start]
  let cur = input.start
  for (let t = 0; t < input.steps; t++) {
    const nbrs = input.neighbors[cur] ?? []
    if (nbrs.length === 0) break
    cur = nbrs[Math.floor(input.rng.next() * nbrs.length)]!
    path.push(cur)
  }
  return path
}
