// 1D periodic ring (cycle) substrate, used by the line dynamics (reversible wave, conserving
// perception sweep). Each site x couples to its two neighbours x-1 and x+1, wrapping around.

// Ring neighbour lists: site x neighbours (x-1, x+1) mod L.
export function ringNeighbors(length: number): number[][] {
  const neighbors: number[][] = []
  for (let x = 0; x < length; x++)
    neighbors.push([(x - 1 + length) % length, (x + 1) % length])
  return neighbors
}

// Ring edge endpoints (i, i+1) mod L, laid out as parallel u/v arrays for the edge sweeps.
export function ringEdges(length: number): {
  eu: Int32Array
  ev: Int32Array
} {
  const eu = new Int32Array(length)
  const ev = new Int32Array(length)
  for (let i = 0; i < length; i++) {
    eu[i] = i
    ev[i] = (i + 1) % length
  }
  return { eu, ev }
}
