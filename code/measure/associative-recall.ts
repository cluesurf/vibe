// Measures for a content-addressable associative memory, recall accuracy, capacity versus radius, and search
// latency. Built on the engine in operator/associative-memory and the shell BFS in measure/shells. See
// note/research/vibe/notes/theory-v0.7.0/experiments/associative-engine-experiments.md.

import { Rng } from '@/code/tool/rng'
import { bfsShells } from '@/code/measure/shells'
import {
  AssociativeMemory,
  matchScore,
  readWord,
  searchExact,
  searchBest,
} from '@/code/operator/associative-memory'

type Neighbors = ReadonlyArray<ReadonlyArray<number>>

// Exact-recall rate, the fraction of stored cells whose own word, queried exactly, returns that one cell and
// no other. A perfect content memory scores 1.0.
export function exactRecallRate(mem: AssociativeMemory): number {
  let ok = 0
  let total = 0

  for (let c = 0; c < mem.cellCount; c++) {
    if (!mem.occupied[c]) {
      continue
    }

    total++
    const responders = searchExact({ mem, comparand: readWord(mem, c) })

    if (responders.length === 1 && responders[0] === c) {
      ok++
    }
  }

  return total > 0 ? ok / total : 0
}

// Noisy-recall rate, the fraction of stored cells still recovered when their word is corrupted in a fraction
// f of slots and the nearest-content responder is taken. The deterministic corruption uses the supplied rng.
export function nearestRecallRate(input: {
  mem: AssociativeMemory
  corruptionFraction: number
  rng: Rng
  sample?: number[]
}): number {
  const { mem, corruptionFraction, rng } = input
  const cells = input.sample ?? occupiedCells(mem)
  const flips = Math.round(corruptionFraction * mem.wordBits)

  let ok = 0

  for (const c of cells) {
    const q = readWord(mem, c)

    for (let i = 0; i < flips; i++) {
      const k = rng.nextInt({ max: mem.wordBits })
      q[k] = (q[k]! + 1 + rng.nextInt({ max: 2 })) % 3
    }

    if (searchBest({ mem, comparand: q }).cell === c) {
      ok++
    }
  }

  return cells.length > 0 ? ok / cells.length : 0
}

// The false-positive rate, the fraction of random comparands that return any exact responder. The control
// for exact recall, it should be near zero.
export function falsePositiveRate(input: {
  mem: AssociativeMemory
  trials: number
  rng: Rng
}): number {
  const { mem, trials, rng } = input

  let hits = 0

  for (let t = 0; t < trials; t++) {
    const q = new Int8Array(mem.wordBits)

    for (let k = 0; k < mem.wordBits; k++) {
      q[k] = rng.nextInt({ max: 3 })
    }

    if (searchExact({ mem, comparand: q }).length > 0) {
      hits++
    }
  }

  return trials > 0 ? hits / trials : 0
}

// The coverage radius, the largest graph distance from the seed (the beats a query wave needs to reach the
// whole built region). On a hyperbolic graph this is O(log N), on a flat lattice O(N^(1/d)).
export function coverageRadius(input: {
  neighbors: Neighbors
  seed: number
}): number {
  const depth = bfsShells({
    neighbors: input.neighbors,
    root: input.seed,
  }).depth

  let r = 0

  for (let c = 0; c < depth.length; c++) {
    if (depth[c]! > r) {
      r = depth[c]!
    }
  }

  return r
}

// The capacity curve, the cumulative number of cells (storable words) within each radius of the seed. The
// associative capacity reachable within a given search latency. Hyperbolic gives exponential growth, flat
// polynomial.
export function radiusCapacity(input: {
  neighbors: Neighbors
  seed: number
}): number[] {
  const { shellCounts } = bfsShells({
    neighbors: input.neighbors,
    root: input.seed,
  })

  const cumulative: number[] = []

  let total = 0

  for (const s of shellCounts) {
    total += s
    cumulative.push(total)
  }

  return cumulative
}

function occupiedCells(mem: AssociativeMemory): number[] {
  const out: number[] = []

  for (let c = 0; c < mem.cellCount; c++) {
    if (mem.occupied[c]) {
      out.push(c)
    }
  }

  return out
}

// re-export so an experiment can read a slot without importing two modules
export { matchScore }
