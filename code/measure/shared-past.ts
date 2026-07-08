// The shared causal past of two cells, read off the real mesh. The base rule
// streams one cell per beat (ballistic, z = 1, the speed measured in the
// light-cone experiments), and it couples a cell only to its mesh neighbours, so
// the domain of dependence of a cell after T beats is exactly the graph ball of
// radius T on the mesh adjacency. The backward light cone of a measurement is
// therefore that ball, and the shared past of two measurements is the overlap of
// their balls. This module measures that overlap, so the setting-state
// correlation that a superdeterministic model needs is read out of the substrate
// rather than assumed as a decay law.

import { neighborDistances } from '@/code/tool/graph'

type Adjacency = readonly (readonly number[] | Uint32Array)[]

// The backward light cone of a cell: every cell within graph radius `depth`. This
// is the cell's causal past over `depth` beats under the local one-hop rule.
export function backwardCone(input: {
  neighbors: Adjacency
  size: number
  cell: number
  depth: number
}): Set<number> {
  const distance = neighborDistances({
    neighbors: input.neighbors,
    size: input.size,
    source: input.cell,
  })

  const cone = new Set<number>()

  for (let cell = 0; cell < input.size; cell++) {
    const hops = distance[cell] ?? -1

    if (hops >= 0 && hops <= input.depth) {
      cone.add(cell)
    }
  }

  return cone
}

function intersectionSize(a: Set<number>, b: Set<number>): number {
  const small = a.size <= b.size ? a : b
  const large = a.size <= b.size ? b : a

  let shared = 0

  for (const cell of small) {
    if (large.has(cell)) {
      shared++
    }
  }

  return shared
}

// The result of a shared-past measurement: the fraction of cell A's causal past
// that also lies in cell B's, plus the raw cone sizes and overlap count, so the
// fraction is fully traceable to integer set sizes (exact, no tolerance).
export interface SharedPast {
  readonly eta: number // shared / sizeA, the fraction of A's past shared with B
  readonly shared: number // cells in both cones
  readonly sizeA: number // cells in A's cone
  readonly sizeB: number // cells in B's cone
  readonly sharesPast: boolean // is the overlap non-empty at all
}

// The BULK shared past at a fixed cone depth: the local common cause available to
// a Bell pair measured at A and B. It is exactly zero once the separation exceeds
// twice the depth (the cones are disjoint), and on a negatively curved mesh it
// falls off faster than on a flat one, because hyperbolic ball volume concentrates
// on the outer shell, so the lens of overlap is a smaller fraction of the ball.
// Measured from the adjacency, not assumed.
export function bulkSharedPast(input: {
  neighbors: Adjacency
  size: number
  cellA: number
  cellB: number
  depth: number
}): SharedPast {
  const coneA = backwardCone({
    neighbors: input.neighbors,
    size: input.size,
    cell: input.cellA,
    depth: input.depth,
  })

  const coneB = backwardCone({
    neighbors: input.neighbors,
    size: input.size,
    cell: input.cellB,
    depth: input.depth,
  })

  const shared = intersectionSize(coneA, coneB)

  return {
    eta: coneA.size === 0 ? 0 : shared / coneA.size,
    shared,
    sizeA: coneA.size,
    sizeB: coneB.size,
    sharesPast: shared > 0,
  }
}

// The SEED-anchored shared past: the overlap of the two cells' full backward cones
// traced all the way to the growth seed, each cone's depth set to that cell's
// generation (its graph distance from the seed). Both full cones reach the seed,
// so a correlation imprinted at the initial surface is shared at EVERY separation,
// even where the bulk fraction has fallen to zero. The returned `eta` is the
// relative weight of that seed channel. On a curved mesh it still thins with
// separation, which is the price a model pays to keep a distance-independent
// correlation. `sharesPast` is whether the cones overlap at all.
export function seedSharedPast(input: {
  neighbors: Adjacency
  size: number
  generation: readonly number[]
  cellA: number
  cellB: number
}): SharedPast {
  const depthA = input.generation[input.cellA] ?? 0
  const depthB = input.generation[input.cellB] ?? 0

  const coneA = backwardCone({
    neighbors: input.neighbors,
    size: input.size,
    cell: input.cellA,
    depth: depthA,
  })

  const coneB = backwardCone({
    neighbors: input.neighbors,
    size: input.size,
    cell: input.cellB,
    depth: depthB,
  })

  const shared = intersectionSize(coneA, coneB)

  return {
    eta: coneA.size === 0 ? 0 : shared / coneA.size,
    shared,
    sizeA: coneA.size,
    sizeB: coneB.size,
    sharesPast: shared > 0,
  }
}

// Pick one representative cell at each graph distance from an anchor, the most
// interior one (smallest generation) so its cone stays inside the built mesh and
// is not truncated by the finite frontier. Returns, for each requested distance, a
// cell at that distance whose generation does not exceed `maxGeneration`, or none
// if the mesh has no such interior cell at that distance. The anchor's own
// distance array is measured, so the distances are exact graph distances, not
// generation differences.
export function interiorCellsByDistance(input: {
  neighbors: Adjacency
  size: number
  generation: readonly number[]
  anchor: number
  distances: readonly number[]
  maxGeneration: number
}): Map<number, number> {
  const fromAnchor = neighborDistances({
    neighbors: input.neighbors,
    size: input.size,
    source: input.anchor,
  })

  const wanted = new Set(input.distances)
  const best = new Map<number, number>()
  const bestGeneration = new Map<number, number>()

  for (let cell = 0; cell < input.size; cell++) {
    const hops = fromAnchor[cell] ?? -1

    if (hops < 0 || !wanted.has(hops)) {
      continue
    }

    const generation = input.generation[cell] ?? Infinity

    if (generation > input.maxGeneration) {
      continue
    }

    const incumbent = bestGeneration.get(hops)

    if (incumbent === undefined || generation < incumbent) {
      best.set(hops, cell)
      bestGeneration.set(hops, generation)
    }
  }

  return best
}

// The largest separation d at which the aligned measurement-dependence CHSH can still
// reach a target shared-past fraction. For each requested distance it picks an interior
// cell that far from an anchor sitting at cone depth `coneDepth`, measures the exact
// cone-overlap fraction eta(d) off the mesh, and returns eta by distance plus the
// largest d with eta(d) >= etaThreshold. Pass TSIRELSON_SHARED_PAST as the threshold to
// get the critical separation for the quantum (Tsirelson) value. Deterministic, exact.
export function criticalSeparation(input: {
  neighbors: Adjacency
  size: number
  generation: readonly number[]
  distances: readonly number[]
  coneDepth: number
  etaThreshold: number
}): { dStar: number; etaByDistance: Map<number, number> } {
  const {
    neighbors,
    size,
    generation,
    distances,
    coneDepth,
    etaThreshold,
  } = input

  const maxGeneration = generation.reduce((m, g) => Math.max(m, g), 0)

  let anchor = 0

  for (let cell = 0; cell < size; cell++) {
    if (generation[cell] === coneDepth) {
      anchor = cell
      break
    }
  }

  const picks = interiorCellsByDistance({
    neighbors,
    size,
    generation,
    anchor,
    distances,
    maxGeneration: maxGeneration - coneDepth,
  })

  const etaByDistance = new Map<number, number>()

  let dStar = 0

  for (const d of distances) {
    const partner = picks.get(d)

    if (partner === undefined) {
      continue
    }

    const eta = bulkSharedPast({
      neighbors,
      size,
      cellA: anchor,
      cellB: partner,
      depth: coneDepth,
    }).eta

    etaByDistance.set(d, eta)

    if (eta >= etaThreshold) {
      dStar = Math.max(dStar, d)
    }
  }

  return { dStar, etaByDistance }
}
