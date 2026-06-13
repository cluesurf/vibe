// The ternary signed-majority rule and its per-edge coupling field. Each cell holds
// a tone in {-1, 0, +1}. The local field at a cell is the sum over its incident
// edges of (edge coupling) times (neighbour tone); the next tone is its sign. With
// symmetric couplings (the same value on both half-edges of an undirected edge)
// this is the perception rule of the committed vibe model, run synchronously.

import { Rng } from '@/code/tool/rng'

type Neighbors = ReadonlyArray<ArrayLike<number>>

// Symmetric per-edge ternary couplings: for each undirected edge a uniform value in
// {-1, 0, +1} is drawn once (when w > v) and written to both half-edges, so the
// coupling field is consistent in both directions. `fills[v][k]` is the coupling on
// the edge from v to its k-th neighbour.
export function symmetricEdgeFills(input: { neighbors: Neighbors; rng: Rng }): Int8Array[] {
  const { neighbors, rng } = input
  const n = neighbors.length
  const indexOf = neighbors.map((row) => {
    const m = new Map<number, number>()
    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }
    return m
  })
  const fills = neighbors.map((row) => new Int8Array(row.length))
  for (let v = 0; v < n; v++) {
    const fv = fills[v]
    const row = neighbors[v] ?? []
    if (!fv) {
      continue
    }
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      if (w > v) {
        const f = rng.nextInt({ max: 3 }) - 1
        fv[k] = f
        const fw = fills[w]
        const kk = indexOf[w]?.get(v)
        if (fw && kk !== undefined) {
          fw[kk] = f
        }
      }
    }
  }
  return fills
}

// One synchronous signed-majority beat: the whole next state is computed from the
// current state at once. next[v] = sign( sum_k fills[v][k] * tone[neighbors[v][k]] ).
export function signedMajorityStep(input: {
  neighbors: Neighbors
  fills: Int8Array[]
  tone: Int8Array
}): Int8Array {
  const { neighbors, fills, tone } = input
  const n = neighbors.length
  const next = new Int8Array(n)
  for (let v = 0; v < n; v++) {
    const nb = neighbors[v] ?? []
    const fl = fills[v] ?? new Int8Array(0)
    let h = 0
    for (let k = 0; k < nb.length; k++) {
      h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
    }
    next[v] = h > 0 ? 1 : h < 0 ? -1 : 0
  }
  return next
}
