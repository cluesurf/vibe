// The binding margin, Hearst's individuation criterion made into a number
// (darren-hearst in the related-theories census). A subject individuates when its
// internal integration exceeds its external coupling, Phi_internal > C_external. On a
// graph, for a candidate region, the internal edges are the integration and the boundary
// edges (one endpoint inside, one outside) are the coupling. The margin is
// (internal - boundary) / (internal + boundary), so it is positive exactly when the
// region is more bound to itself than to the outside, the moment Hearst calls
// individuation, and negative when the outside dominates, the moment of dissolution
// (death as the binding falls below threshold, the same criterion run backwards).
//
// This reads only the graph, so it is a structural proxy, the same kind the integration
// module documents. It is exact and integer in its edge counts.

import { Mesh, shellDistances } from '@/code/tool/mesh'

// The cells within a breadth-first radius of a centre, a compact candidate self.
export function ballAtRadius(input: {
  mesh: Mesh
  center: number
  radius: number
}): number[] {
  const distance = shellDistances(input.mesh, input.center)
  const region: number[] = []

  for (let cell = 0; cell < input.mesh.cellCount; cell++) {
    if (distance[cell]! >= 0 && distance[cell]! <= input.radius)
      region.push(cell)
  }

  return region
}

// The internal and boundary edge counts of a region, and the binding margin. Internal
// edges have both endpoints inside, boundary edges have exactly one. The margin runs
// from -1 (all coupling, no integration) to +1 (all integration, no coupling), crossing
// zero at the individuation threshold.
export function bindingMargin(input: {
  neighbors: readonly (readonly number[])[]
  region: readonly number[]
}): { internal: number; boundary: number; margin: number } {
  const { neighbors } = input
  const inside = new Set(input.region)

  let internal = 0
  let boundary = 0

  for (const cell of input.region) {
    const row = neighbors[cell]!

    for (const next of row) {
      if (inside.has(next)) {
        if (cell < next) {
          internal++
        }
      } else {
        boundary++
      }
    }
  }

  const total = internal + boundary
  const margin = total === 0 ? 0 : (internal - boundary) / total

  return { internal, boundary, margin }
}
