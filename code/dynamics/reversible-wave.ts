// The second-order reversible wave on a neighbors graph, the deterministic
// (no-RNG) dynamics that propagates ballistically (z=1) instead of diffusing. A
// tone in {0, ..., q-1} per node, the update is next[i] = (sum of neighbour tones
// at the current beat - previous tone) mod q. Second-order in time (it keeps the
// previous beat), which is exactly what makes it a wave and exactly reversible: the
// same symmetric step run with the roles of (previous, current) swapped recovers
// the earlier slice. The mod-q wrap keeps the state in the finite alphabet without
// breaking reversibility.

type Neighbors = ReadonlyArray<ReadonlyArray<number>>

// One forward beat of the second-order reversible wave, written into `next`.
// next[i] = ((sum_{j ~ i} current[j]) - previous[i]) mod q, kept non-negative.
export function reversibleWaveStep(input: {
  neighbors: Neighbors
  previous: Uint8Array
  current: Uint8Array
  next: Uint8Array
  modulus: number
}): void {
  const { neighbors, previous, current, next, modulus } = input
  const n = neighbors.length
  for (let i = 0; i < n; i++) {
    let sum = 0
    const row = neighbors[i] ?? []
    for (let k = 0; k < row.length; k++) sum += current[row[k]!]!
    next[i] = (((sum - previous[i]!) % modulus) + modulus) % modulus
  }
}
