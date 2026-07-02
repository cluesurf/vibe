// Masked centroid measures, the x position of a body with designated source columns
// masked out, so a standing tone source (a resource slab, a clamped valence strip) is
// never mistaken for the body being tracked. Two state layers share the concept:
//   - maskedClusterCentroidX reads a selves-layer tone field (one ternary tone per cell)
//     and returns the centroid of the largest positive cluster, the standard way the
//     suite localizes a self (spatial localization, not a recurring scalar).
//   - maskedWillCentroidX reads a base-layer Will (one ternary tone per direction slot
//     per cell) and returns the absolute-charge-weighted mean x, the transport centroid
//     of all body charge on the committed lattice gas.

import {
  largestPositiveCluster,
  type Graph,
} from '@/code/model/self-kit'
import type { Will } from '@/code/tone/will'

// Centroid x of the largest positive cluster, with the first and last `margin` columns
// masked to zero. Returns side/2 when nothing remains (the caller should treat that as
// no surviving body).
export function maskedClusterCentroidX(input: {
  tone: Int8Array
  graph: Graph
  side: number
  margin: number
}): number {
  const { tone, graph, side, margin } = input
  const masked = tone.slice()

  for (let c = 0; c < masked.length; c++) {
    const x = c % side

    if (x < margin || x >= side - margin) {
      masked[c] = 0
    }
  }

  const cells = largestPositiveCluster(masked, graph)

  let s = 0

  for (const c of cells) {
    s += c % side
  }

  return cells.length > 0 ? s / cells.length : side / 2
}

// Absolute-charge-weighted mean x over a Will on a periodic lattice whose cell index
// has x = cell % side (the d4Mesh and cubicMesh convention), with columns x < maskLow
// or x >= side - maskHigh excluded. Exact integer sums under the hood.
export function maskedWillCentroidX(input: {
  will: Will
  side: number
  maskLow: number
  maskHigh: number
}): number {
  const { will, side, maskLow, maskHigh } = input
  const { mesh, data } = will
  const degree = mesh.degree

  let weight = 0
  let moment = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % side

    if (x < maskLow || x >= side - maskHigh) {
      continue
    }

    let mass = 0

    for (let d = 0; d < degree; d++) {
      const t = data[cell * degree + d] ?? 0
      mass += t === 0 ? 0 : 1
    }

    weight += mass
    moment += mass * x
  }

  return weight > 0 ? moment / weight : side / 2
}
