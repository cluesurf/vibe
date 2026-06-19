// Random walks on a neighbors graph. A single charge taking uniform random steps along adjacency, the
// simplest probe of how a perturbation spreads on the substrate. Core dynamics, used by the isotropy and
// diffusion experiments. The caller supplies the Rng so the walk stays deterministic.

import { Rng, makeRng } from '@/code/tool/rng'
import { bfsShells } from '@/code/measure/shells'

type Neighbors = ReadonlyArray<ReadonlyArray<number>>

// Mean-square displacement of a 1D classical random walk after each step, averaged over independent runs.
// The diffusive baseline (MSD ~ t, exponent ~ 1) that the ballistic quantum walk is contrasted against. Each
// run is seeded deterministically by its index.
export function classicalWalkMSD(input: {
  steps: number
  runs: number
}): number[] {
  const { steps, runs } = input
  const msd = new Float64Array(steps + 1)
  for (let r = 0; r < runs; r++) {
    const rng = makeRng({ seed: r + 1 })
    let x = 0
    for (let t = 0; t <= steps; t++) {
      msd[t]! += x * x
      x += rng.next() < 0.5 ? 1 : -1
    }
  }
  for (let t = 0; t <= steps; t++) msd[t]! /= runs
  return Array.from(msd)
}

// The mean-square-displacement EXPONENT of a uniform random walk on a general neighbors graph:
// average (graph distance from start)^2 over `runs` walks of `beats` steps, then fit the log-log
// slope of MSD versus time over the pre-saturation window [2, beats]. Diffusive transport gives an
// exponent near 1 (MSD ~ t), ballistic near 2. Distances are BFS shells from the start; each run is
// seeded deterministically (100 + run index).
export function graphWalkMsdExponent(input: {
  neighbors: Neighbors
  start: number
  beats: number
  runs: number
}): number {
  const { neighbors, start, beats, runs } = input
  const dist = bfsShells({ neighbors, root: start }).depth
  const msd = new Float64Array(beats + 1)
  for (let run = 0; run < runs; run++) {
    const rng = makeRng({ seed: 100 + run })
    let cur = start
    for (let t = 0; t <= beats; t++) {
      const dd = dist[cur]!
      msd[t]! += dd * dd
      if (t < beats) {
        const nb = neighbors[cur] ?? []
        if (nb.length > 0) cur = nb[Math.floor(rng.next() * nb.length)]!
      }
    }
  }
  for (let t = 0; t <= beats; t++) msd[t]! /= runs
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0
  for (let t = 2; t <= beats; t++) {
    if (msd[t]! <= 0) continue
    const x = Math.log(t)
    const y = Math.log(msd[t]!)
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    m++
  }
  return m > 1 ? (m * sxy - sx * sy) / (m * sxx - sx * sx) : 0
}

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

// Mean final displacement of a PERSISTENT (correlated) random walk in d dimensions.
// Each step is taken along the current direction (one of `directions`); with
// probability `mix` the direction is first scrambled to a fresh uniform choice (the
// collision that acts as a Dirac mass). mix = 0 is a straight ballistic line
// (displacement ~ steps), mix = 1 is a memoryless walk (displacement ~ sqrt(steps)).
// Returns the mean Euclidean displacement over `runs` trials. The caller supplies
// the Rng so the walk stays deterministic.
export function persistentWalkMeanDisplacement(input: {
  directions: number[][]
  mix: number
  steps: number
  runs: number
  rng: Rng
}): number {
  const { directions, mix, steps, runs, rng } = input
  const dimension = directions[0]?.length ?? 0
  const directionCount = directions.length
  let total = 0
  for (let run = 0; run < runs; run++) {
    const position = new Array<number>(dimension).fill(0)
    let d = Math.floor(rng.next() * directionCount)
    for (let s = 0; s < steps; s++) {
      if (rng.next() < mix) d = Math.floor(rng.next() * directionCount)
      const step = directions[d]!
      for (let a = 0; a < dimension; a++) position[a]! += step[a]!
    }
    let sumSquares = 0
    for (let a = 0; a < dimension; a++)
      sumSquares += position[a]! * position[a]!
    total += Math.sqrt(sumSquares)
  }
  return total / runs
}
