// Classical sequential growth (Rideout-Sorkin): grow a causal set by adding
// elements one at a time, each born to the future of a random subset of the
// existing elements, closed transitively. Births respect discrete general
// covariance (the label order is unphysical). This is a transitive-percolation
// variant of the CSG model. See research/testbed/02-substrates.md.

import { Rng } from '~/core/rng'
import { BitMatrix, makeBitMatrix, setBit, getBit } from '~/core/bitset'
import { Poset, makePosetFromFuture } from '~/core/poset'

export function growCsg(input: {
  size: number
  couplings: Float64Array
  rng: Rng
}): Poset {
  const n = input.size

  // Base birth probability. Transitive percolation uses a single p; if more
  // couplings are supplied we still use couplings[0] as the base probability,
  // clamped to [0, 1].
  const rawP = input.couplings[0] ?? 0.5
  const p = Math.min(1, Math.max(0, rawP))

  const future: BitMatrix = makeBitMatrix({ rows: n, cols: n })

  // Add elements in order 0, 1, ..., n-1. Element e is "existing" when we add a
  // later element m > e. For each existing e, with probability p the new element
  // m is to the future of e; then we close transitively: if m is to the future
  // of e and some earlier d precedes e, then m is also to the future of d.
  for (let m = 1; m < n; m++) {
    // Decide direct ancestry, then take the transitive closure of the past.
    for (let e = 0; e < m; e++) {
      if (input.rng.next() < p) {
        setBit(future, { row: e, col: m })
      }
    }
    // Transitive closure: ensure every ancestor of a chosen parent is also an
    // ancestor of m. Walk existing elements; if e precedes m, pull in e's past.
    for (let e = 0; e < m; e++) {
      if (getBit(future, { row: e, col: m })) {
        for (let d = 0; d < e; d++) {
          if (getBit(future, { row: d, col: e })) {
            setBit(future, { row: d, col: m })
          }
        }
      }
    }
  }

  return makePosetFromFuture({ size: n, future })
}
