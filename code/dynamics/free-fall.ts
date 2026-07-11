// Free fall in a potential, the geodesic motion of a body of mass cells down a field. Each beat every occupied
// cell hops to its lowest-potential empty neighbour, computed from a SNAPSHOT so all pieces move simultaneously
// (one hop per beat, no cascade), with excluded volume (one body per cell, two pieces cannot take the same target).
// Because every piece follows the SAME field gradient, a body of any mass falls at the same rate, which is the
// equivalence principle, the universality of free fall. A uniform field gives exactly one cell per beat for every
// body, regardless of its mass.

// One beat of free fall, mutating `occupied` in place. Returns the number of pieces that moved.
export function freeFallStep(input: {
  occupied: Uint8Array
  phi: Int32Array
  neighbour: (cell: number, direction: number) => number
  cellCount: number
  spatialDegree: number
}): number {
  const { occupied, phi, neighbour, cellCount, spatialDegree } = input
  const snapshot = occupied.slice()
  const taken = new Uint8Array(cellCount)

  let moved = 0

  for (let c = 0; c < cellCount; c++) {
    if (!snapshot[c]) continue

    let best = -1
    let bestPhi = phi[c]!

    for (let d = 0; d < spatialDegree; d++) {
      const target = neighbour(c, d)

      if (
        !snapshot[target] &&
        !taken[target] &&
        phi[target]! < bestPhi
      ) {
        bestPhi = phi[target]!
        best = target
      }
    }

    if (best >= 0) {
      occupied[c] = 0
      occupied[best] = 1
      taken[best] = 1
      moved++
    }
  }

  return moved
}
