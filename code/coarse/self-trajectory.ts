// Shared micro source for the coarse-graining experiments (E2, E3, E4 in the multi-level-selves plan). It
// emerges a self on the flat horosphere layer, runs the conserving beat, and records two things, a discrete
// trajectory of the self's position bin (for the Markov-state model) and periodic tone snapshots (for the
// commuting-square test).
//
// On determinism, the self-kit beat carries a stochastic hop, so this is a single realization of an ensemble
// and the claims that use it are statistical, labeled L2. Robustness comes from varying the lattice size L,
// not from averaging seeds. The seed only fixes one reproducible realization.

import {
  flatGraph,
  emergeSelf,
  beat,
  type Graph,
  type Rng,
} from '@/code/model/self-kit'
import { extractUnits, meanUnitSize } from '@/code/coarse/macro-unit'

export function makeRng(seed: number): Rng {
  let s = seed >>> 0
  return {
    next() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      return s / 4294967296
    },
  }
}

// The global positive-charge centroid x, the mean column of all plus-tone cells. A smooth observable that
// drifts slowly, so its lag-tau Markov model has a clear slow mode when temporal structure is present.
function positiveCentroidX(tone: Int8Array, L: number): number {
  let sum = 0
  let count = 0
  for (let i = 0; i < tone.length; i++) {
    if (tone[i] === 1) {
      sum += i % L
      count++
    }
  }
  return count > 0 ? sum / count : L / 2
}

export interface Trajectory {
  graph: Graph
  L: number
  bins: number
  // the position-bin label at each beat (fixed bins over the lattice width).
  labels: number[]
  // the continuous positive-centroid x at each beat, for quantile binning.
  centroids: number[]
  // periodic tone snapshots, for the commuting-square test.
  snapshots: Int8Array[]
  // the mean cells-per-self at the end, the level-0 compression factor C.
  meanSelfSize: number
}

export function selfTrajectory(input: {
  L: number
  beats: number
  bins: number
  seed: number
  snapshotEvery?: number
}): Trajectory {
  const { L, beats, bins, seed } = input
  const snapshotEvery = input.snapshotEvery ?? 8
  const graph = flatGraph(L)
  const rng = makeRng(seed)
  const moved = new Uint8Array(graph.cellCount)
  const { tone } = emergeSelf(graph, rng, moved, {
    beats: 60,
    density: 0.1,
  })
  const labels: number[] = []
  const centroids: number[] = []
  const snapshots: Int8Array[] = []
  const toBin = (x: number): number =>
    Math.min(bins - 1, Math.max(0, Math.floor((x / L) * bins)))
  for (let t = 0; t < beats; t++) {
    beat(tone, graph, moved, rng, 0.01, 0.22)
    const cx = positiveCentroidX(tone, L)
    centroids.push(cx)
    labels.push(toBin(cx))
    if (t % snapshotEvery === 0) snapshots.push(tone.slice())
  }
  const positions = (cell: number): readonly [number, number] => [
    cell % L,
    Math.floor(cell / L),
  ]
  const units = extractUnits({
    tone,
    graph,
    positions,
    sign: 1,
    minSize: 3,
  })
  return {
    graph,
    L,
    bins,
    labels,
    centroids,
    snapshots,
    meanSelfSize: meanUnitSize(units),
  }
}

// The position bin of a tone state, the coarse map used by the commuting-square test.
export function positionBin(input: {
  tone: Int8Array
  L: number
  bins: number
}): number {
  const { tone, L, bins } = input
  return Math.min(
    bins - 1,
    Math.max(0, Math.floor((positiveCentroidX(tone, L) / L) * bins)),
  )
}

// The trajectory of the SELF's own centroid x, tracking the largest plus-charge cluster each beat. Unlike the
// global positive centroid (which the active vacuum's churn dominates), this follows the bound self, so it
// drifts smoothly and is forward-predictable. Used by the surrogate-fidelity check (multiscale MS1). If the
// self is momentarily undetected (no cluster at or above minSize) the last known position is held.
export interface UnitTrajectory {
  graph: Graph
  L: number
  // the self centroid x at each beat.
  centroids: number[]
  // the mean detected self size over the run, the level-0 compression factor.
  meanSelfSize: number
}

// the shared core, run a self and record its centroid each beat, with the binding strength given by a
// cohesion schedule cohesionAt(beat). A constant schedule is the stationary self, a schedule that changes
// partway is a self whose coarse dynamics drift (used to test surrogate drift detection, MS4).
function runUnitTrajectory(input: {
  L: number
  beats: number
  seed: number
  minSize: number
  cohesionAt: (beat: number) => number
}): UnitTrajectory {
  const { L, beats, seed, minSize, cohesionAt } = input
  const graph = flatGraph(L)
  const rng = makeRng(seed)
  const moved = new Uint8Array(graph.cellCount)
  const { tone } = emergeSelf(graph, rng, moved, {
    beats: 60,
    density: 0.1,
  })
  const positions = (cell: number): readonly [number, number] => [
    cell % L,
    Math.floor(cell / L),
  ]
  const centroids: number[] = []
  let sizeSum = 0
  let sizeCount = 0
  let lastCx = L / 2
  for (let t = 0; t < beats; t++) {
    beat(tone, graph, moved, rng, 0.01, cohesionAt(t))
    const units = extractUnits({
      tone,
      graph,
      positions,
      sign: 1,
      minSize,
    })
    if (units.length > 0) {
      let largest = units[0]!
      for (const u of units) if (u.size > largest.size) largest = u
      lastCx = largest.cx
      sizeSum += largest.size
      sizeCount++
    }
    centroids.push(lastCx)
  }
  return {
    graph,
    L,
    centroids,
    meanSelfSize: sizeCount > 0 ? sizeSum / sizeCount : 0,
  }
}

export function selfUnitTrajectory(input: {
  L: number
  beats: number
  seed: number
  minSize?: number
}): UnitTrajectory {
  return runUnitTrajectory({
    ...input,
    minSize: input.minSize ?? 3,
    cohesionAt: () => 0.22,
  })
}

// A self whose binding strength changes at changeAt, so its coarse dynamics drift into a new regime. With
// cohesionEarly equal to cohesionLate this is the stationary self (the no-drift control).
export function driftingSelfTrajectory(input: {
  L: number
  beats: number
  seed: number
  cohesionEarly: number
  cohesionLate: number
  changeAt: number
  minSize?: number
}): UnitTrajectory {
  const { cohesionEarly, cohesionLate, changeAt } = input
  return runUnitTrajectory({
    ...input,
    minSize: input.minSize ?? 3,
    cohesionAt: t => (t < changeAt ? cohesionEarly : cohesionLate),
  })
}
