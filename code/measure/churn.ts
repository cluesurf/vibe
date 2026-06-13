// Churn of the second-order reversible mod-q wave on a neighbors graph, the count of cells whose
// tone changes from one beat to the next, summed over the run. A dead (frozen) field gives zero
// churn. A live wave keeps flipping tones, so churn grows with the run. The update is the same
// reversible wave as code/dynamics/reversible-wave: next[i] = (sum_{j ~ i} cur[j] - prev[i]) mod q.

type Neighbors = ReadonlyArray<ReadonlyArray<number>>

export function churnCount(input: {
  neighbors: Neighbors
  initial: Int8Array
  steps: number
  modulus: number
}): number {
  const { neighbors, steps, modulus } = input
  const N = neighbors.length
  let cur = Int8Array.from(input.initial)
  let prev = new Int8Array(N)
  let changes = 0
  for (let t = 0; t < steps; t++) {
    const nx = new Int8Array(N)
    for (let i = 0; i < N; i++) {
      let s = 0
      const row = neighbors[i] ?? []
      for (let k = 0; k < row.length; k++) s += cur[row[k]!]!
      const v = ((((s - prev[i]!) % modulus) + modulus) % modulus) as 0 | 1 | 2
      nx[i] = v
      if (v !== cur[i]!) changes++
    }
    prev = cur
    cur = nx
  }
  return changes
}
