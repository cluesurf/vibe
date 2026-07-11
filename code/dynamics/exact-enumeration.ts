// Exact enumeration of causal sets at small N. The Monte Carlo sampler does not
// reproduce the uniform measure (it favours tall orders), which is exactly what
// blocked the P2 dominance question. Here we sidestep sampling entirely: enumerate
// every naturally-labelled poset on N elements (every transitive upper-triangular
// relation), and compute the exact Boltzmann average of an observable at any
// inverse temperature, including beta = 0 (the true uniform / entropic average).
// This is exact, with no detailed-balance worry. See p2-p6-optimal-path.md.

import { Poset, makePosetFromFuture } from '@/code/tool/poset'
import { makeBitMatrix, setBit } from '@/code/tool/bitset'
import { Action } from '@/code/dynamics/action'

// Enumerate every transitive upper-triangular relation on N elements and compute,
// for each beta, the partition function and the Boltzmann average of each observer.
// A relation is transitive iff for every triple i < j < k, rel(i,j) and rel(j,k)
// imply rel(i,k), which is the minimal check (longer chains follow by induction).
export function exactCausalSetAverages(input: {
  size: number
  betas: readonly number[]
  action: Action
  observers: readonly ((input: { poset: Poset }) => number)[]
}): { count: number; z: number[]; means: number[][] } {
  const n = input.size
  // The ordered list of upper-triangular pairs and a bit index for each.
  const pairs: [number, number][] = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j])
    }
  }

  const P = pairs.length
  const total = 1 << P

  const B = input.betas.length
  const O = input.observers.length
  const z = new Array<number>(B).fill(0)
  const weighted: number[][] = Array.from({ length: B }, () =>
    new Array<number>(O).fill(0),
  )

  let count = 0

  for (let mask = 0; mask < total; mask++) {
    // Decode the relation: present[p] = whether pair p is related.
    // Build a quick lookup rel[i][j].
    const rel: boolean[][] = Array.from({ length: n }, () =>
      new Array<boolean>(n).fill(false),
    )

    for (let p = 0; p < P; p++) {
      if ((mask >> p) & 1) {
        const pair = pairs[p]

        if (pair) {
          rel[pair[0]]![pair[1]] = true
        }
      }
    }

    // Transitivity check over increasing triples.
    let transitive = true

    for (let i = 0; i < n && transitive; i++) {
      for (let j = i + 1; j < n && transitive; j++) {
        if (!rel[i]![j]) {
          continue
        }

        for (let k = j + 1; k < n; k++) {
          if (rel[j]![k] && !rel[i]![k]) {
            transitive = false
            break
          }
        }
      }
    }

    if (!transitive) {
      continue
    }

    count += 1

    // Build the poset and evaluate the action and observers.
    const future = makeBitMatrix({ rows: n, cols: n })

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (rel[i]![j]) {
          setBit(future, { row: i, col: j })
        }
      }
    }

    const poset = makePosetFromFuture({ size: n, future })
    const s = input.action.value({ poset })
    const obs = input.observers.map(f => f({ poset }))

    for (let b = 0; b < B; b++) {
      const w = Math.exp(-(input.betas[b] ?? 0) * s)

      z[b] = (z[b] ?? 0) + w

      const row = weighted[b]!

      for (let o = 0; o < O; o++) {
        row[o] = (row[o] ?? 0) + (obs[o] ?? 0) * w
      }
    }
  }

  const means: number[][] = Array.from({ length: B }, (_unused, b) => {
    const zb = z[b] ?? 0

    return (weighted[b] ?? []).map(x => (zb > 0 ? x / zb : 0))
  })

  return { count, z, means }
}
