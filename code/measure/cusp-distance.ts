// Sampling the Bell shared past as a joint function of physical (cusp) distance and
// bulk distance, the bridge between the holographic bulk shortcut and the
// spacelike-Bell problem. On a hyperbolic bulk two boundary points far apart in
// physical (cusp) distance are a short hop apart through the bulk, so the shared
// past, which collapses with bulk distance, declines only slowly in physical
// distance. These helpers collect the (physical, bulk, eta) triples that the cusp
// experiments fit.

import { betheMesh, squareMesh, meshNeighbors } from '@/code/tool/mesh'
import { neighborDistances } from '@/code/tool/graph'
import { bulkSharedPast } from '@/code/measure/shared-past'

export type CuspSample = {
  readonly physical: number // distance within the cusp (the boundary)
  readonly bulk: number // distance through the bulk
  readonly eta: number // the shared-past fraction (the Bell-relevant cone overlap)
}

// The single parent of a cell (its neighbour of smaller generation), used to climb
// from a boundary leaf to the interior ancestor whose cone of the chosen depth is
// full.
function ancestorAt(input: {
  neighbors: number[][]
  generation: number[]
  leaf: number
  target: number
}): number {
  let cell = input.leaf

  while ((input.generation[cell] ?? 0) > input.target) {
    let parent = cell

    for (const n of input.neighbors[cell] ?? []) {
      if (
        (input.generation[n] ?? Infinity) <
        (input.generation[cell] ?? 0)
      ) {
        parent = n
        break
      }
    }

    if (parent === cell) break

    cell = parent
  }

  return cell
}

// The generation (depth from the origin) of the common ancestor of two boundary
// leaves: climb both toward the origin in lockstep until they meet. A small number
// means the two points are joined only near the origin, a large number means they
// share a recent ancestor near the boundary.
export function commonAncestorGeneration(input: {
  neighbors: number[][]
  generation: number[]
  a: number
  b: number
}): number {
  const parentOf = (cell: number): number => {
    for (const n of input.neighbors[cell] ?? []) {
      if (
        (input.generation[n] ?? Infinity) <
        (input.generation[cell] ?? 0)
      )
        return n
    }

    return cell
  }

  let x = input.a
  let y = input.b

  // bring both to the same generation first
  while ((input.generation[x] ?? 0) > (input.generation[y] ?? 0))
    x = parentOf(x)

  while ((input.generation[y] ?? 0) > (input.generation[x] ?? 0))
    y = parentOf(y)

  while (x !== y) {
    const px = parentOf(x)
    const py = parentOf(y)

    if (px === x || py === y) break

    x = px
    y = py
  }

  return input.generation[x] ?? 0
}

// Samples on a hyperbolic bulk tree. The boundary is the set of leaves, physical
// distance is the boundary-ordering separation (the number of boundary cells
// between a pair, measured independently of the bulk graph distance), and the
// shared past is measured at the interior ancestors whose cones are full.
export function bulkTreeSamples(input: {
  coordination: number
  depth: number
  coneDepth: number
  gaps?: number[]
}): CuspSample[] {
  const mesh = betheMesh({
    coordination: input.coordination,
    depth: input.depth,
  })

  const neighbors = meshNeighbors(mesh)
  const generation = Array.from(
    neighborDistances({ neighbors, size: mesh.cellCount, source: 0 }),
  )

  const maxGeneration = generation.reduce((m, g) => Math.max(m, g), 0)
  const target = maxGeneration - input.coneDepth

  const leaves: number[] = []

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (generation[cell] === maxGeneration) leaves.push(cell)
  }

  const index = new Map(leaves.map((leaf, i) => [leaf, i]))
  const reference = leaves[0]!
  const referenceAncestor = ancestorAt({
    neighbors,
    generation,
    leaf: reference,
    target,
  })

  const gaps = input.gaps ?? [8, 16, 24, 32, 48, 64, 96, 128, 192, 256]
  const samples: CuspSample[] = []

  for (const gap of gaps) {
    const partner = leaves[gap]

    if (partner === undefined) continue

    const partnerAncestor = ancestorAt({
      neighbors,
      generation,
      leaf: partner,
      target,
    })

    if (partnerAncestor === referenceAncestor) continue

    const bulk =
      neighborDistances({
        neighbors,
        size: mesh.cellCount,
        source: referenceAncestor,
      })[partnerAncestor] ?? -1

    const eta = bulkSharedPast({
      neighbors,
      size: mesh.cellCount,
      cellA: referenceAncestor,
      cellB: partnerAncestor,
      depth: input.coneDepth,
    }).eta

    if (eta > 0 && bulk > 0) {
      samples.push({
        physical: Math.abs(
          (index.get(partner) ?? 0) - (index.get(reference) ?? 0),
        ),
        bulk,
        eta,
      })
    }
  }

  return samples
}

// Samples on a flat lattice. The boundary is a straight line and a step along it is
// a step through the bulk, so physical distance equals bulk distance, no shortcut.
export function flatLineSamples(input: {
  side: number
  coneDepth: number
  steps?: number[]
}): CuspSample[] {
  const mesh = squareMesh({ side: input.side })
  const neighbors = meshNeighbors(mesh)
  const reference = (input.side >> 1) * input.side + (input.side >> 1)
  const fromReference = neighborDistances({
    neighbors,
    size: mesh.cellCount,
    source: reference,
  })

  const steps = input.steps ?? [1, 2, 3, 4, 5, 6, 7, 8]
  const samples: CuspSample[] = []

  for (const step of steps) {
    const partner = reference + step
    const bulk = fromReference[partner] ?? -1
    const eta = bulkSharedPast({
      neighbors,
      size: mesh.cellCount,
      cellA: reference,
      cellB: partner,
      depth: input.coneDepth,
    }).eta

    if (eta > 0 && bulk > 0) samples.push({ physical: step, bulk, eta })
  }

  return samples
}

// The farthest sample (largest physical distance) at which the shared past still
// meets a threshold (e.g. the Tsirelson value root 2 minus 1), reporting that ONE
// sample's physical and bulk distance together, and the amplification, its physical
// distance divided by its bulk distance. The two values come from the same sample,
// taking independent maxima across different samples would let the ratio mix a far
// physical reach with another sample's larger bulk distance. On a flat substrate
// the amplification is 1 (physical equals bulk). On a hyperbolic bulk it is large,
// because the same bulk distance is an exponentially larger physical distance.
export function reachAtThreshold(input: {
  samples: CuspSample[]
  threshold: number
}): {
  physicalReach: number
  bulkReach: number
  amplification: number
} {
  let physicalReach = 0
  let bulkReach = 0

  for (const sample of input.samples) {
    if (sample.eta >= input.threshold) {
      if (sample.physical > physicalReach) {
        physicalReach = sample.physical
        bulkReach = sample.bulk
      }
    }
  }

  return {
    physicalReach,
    bulkReach,
    amplification: bulkReach > 0 ? physicalReach / bulkReach : 0,
  }
}
