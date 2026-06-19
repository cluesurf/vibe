// The ternary signed-majority rule and its per-edge coupling field. Each cell holds
// a tone in {-1, 0, +1}. The local field at a cell is the sum over its incident
// edges of (edge coupling) times (neighbour tone); the next tone is its sign. With
// symmetric couplings (the same value on both half-edges of an undirected edge)
// this is the perception rule of the committed vibe model, run synchronously.

import { makeRng, Rng } from '@/code/tool/rng'

type Neighbors = ReadonlyArray<ArrayLike<number>>

// Symmetric per-edge ternary couplings: for each undirected edge a uniform value in
// {-1, 0, +1} is drawn once (when w > v) and written to both half-edges, so the
// coupling field is consistent in both directions. `fills[v][k]` is the coupling on
// the edge from v to its k-th neighbour.
export function symmetricEdgeFills(input: {
  neighbors: Neighbors
  rng: Rng
}): Int8Array[] {
  const { neighbors, rng } = input
  const n = neighbors.length
  const indexOf = neighbors.map(row => {
    const m = new Map<number, number>()
    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }
    return m
  })
  const fills = neighbors.map(row => new Int8Array(row.length))
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
// With `keepOnTie` a zero local field keeps the current tone (so the base settles
// cleanly), otherwise a tie resets to 0.
export function signedMajorityStep(input: {
  neighbors: Neighbors
  fills: Int8Array[]
  tone: Int8Array
  keepOnTie?: boolean
}): Int8Array {
  const { neighbors, fills, tone, keepOnTie } = input
  const n = neighbors.length
  const next = new Int8Array(n)
  for (let v = 0; v < n; v++) {
    const nb = neighbors[v] ?? []
    const fl = fills[v] ?? new Int8Array(0)
    let h = 0
    for (let k = 0; k < nb.length; k++) {
      h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
    }
    next[v] = h > 0 ? 1 : h < 0 ? -1 : keepOnTie ? (tone[v] ?? 0) : 0
  }
  return next
}

// The ASYNCHRONOUS signed-majority rule on an explicit number[][] adjacency: a random
// ternary tone initial condition, symmetric ternary edge fills, then `beats` sweeps of
// n random single-cell updates each. Reports the settled fraction (1 - changed/n on the
// last beat) and the final tone histogram. The driver the Coxeter-mesh dynamics use to
// confirm the committed rule settles on a freshly built tiling.
export function runAsynchronousSignedMajority(input: {
  neighbors: number[][]
  beats: number
  seed: number
}): {
  settledFraction: number
  toneHistogram: { minus: number; zero: number; plus: number }
} {
  const { neighbors, beats } = input
  const n = neighbors.length
  const rng = makeRng({ seed: input.seed })
  const tone = new Int8Array(n)
  for (let i = 0; i < n; i++)
    tone[i] = (rng.nextInt({ max: 3 }) - 1) as number
  const fill: Map<number, number>[] = Array.from(
    { length: n },
    () => new Map<number, number>(),
  )
  for (let a = 0; a < n; a++) {
    for (const b of neighbors[a]!) {
      if (b > a) {
        const f = rng.nextInt({ max: 3 }) - 1
        fill[a]!.set(b, f)
        fill[b]!.set(a, f)
      }
    }
  }
  let changedLast = n
  for (let beat = 0; beat < beats; beat++) {
    let changed = 0
    for (let s = 0; s < n; s++) {
      const v = rng.nextInt({ max: n })
      let h = 0
      for (const w of neighbors[v]!)
        h += (fill[v]!.get(w) ?? 0) * (tone[w] ?? 0)
      const next = h > 0 ? 1 : h < 0 ? -1 : 0
      if (next !== tone[v]) changed++
      tone[v] = next as number
    }
    changedLast = changed
  }
  let minus = 0
  let zero = 0
  let plus = 0
  for (let i = 0; i < n; i++) {
    const t = tone[i] ?? 0
    if (t < 0) minus++
    else if (t === 0) zero++
    else plus++
  }
  return {
    settledFraction: 1 - changedLast / n,
    toneHistogram: { minus, zero, plus },
  }
}
