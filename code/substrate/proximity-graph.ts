// The intrinsic surface connectivity of a point cloud: a nearest-neighbour
// proximity graph. Connect two points when their distance is below a threshold,
// chosen as a multiple of the MEDIAN nearest-neighbour distance so the graph adapts
// to the local point spacing. Used to recover the in-surface adjacency of a
// horosphere (or any extracted sheet) from its ambient coordinates, so its intrinsic
// growth can be measured without an a priori lattice.

import { poincareDistance } from '@/code/geometry/distance'

// Proximity graph on coordinate points, with an injectable distance and a threshold
// multiplier on the median nearest-neighbour distance (default 1.7).
export function proximityGraph(input: {
  coords: number[][]
  distance?: (a: number[], b: number[]) => number
  thresholdFactor?: number
}): number[][] {
  const { coords } = input
  const distance = input.distance ?? poincareDistance
  const thresholdFactor = input.thresholdFactor ?? 1.7
  const n = coords.length
  const nnDist: number[] = []
  for (let i = 0; i < n; i++) {
    let mn = Infinity
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const d = distance(coords[i]!, coords[j]!)
        if (d < mn) {
          mn = d
        }
      }
    }

    nnDist.push(mn)
  }

  const sorted = [...nnDist].sort((a, b) => a - b)
  const median = sorted[Math.floor(n / 2)]!
  const threshold = thresholdFactor * median
  const neighbors: number[][] = coords.map(() => [])
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (distance(coords[i]!, coords[j]!) < threshold) {
        neighbors[i]!.push(j)
        neighbors[j]!.push(i)
      }
    }
  }

  return neighbors
}

// The point of a cloud nearest the origin (smallest squared norm). The natural BFS
// seed for an extracted sheet whose centre sits near the ball origin.
export function centerNearestOrigin(coords: number[][]): number {
  let center = 0
  let best = Infinity
  for (let i = 0; i < coords.length; i++) {
    const r = coords[i]!.reduce((s, v) => s + v * v, 0)
    if (r < best) {
      best = r
      center = i
    }
  }

  return center
}
