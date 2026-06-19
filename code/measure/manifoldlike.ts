// Manifold-likeness: a composite test for whether a causal set looks like a
// smooth spacetime rather than a random order. Combines a finite Myrheim-Meyer
// dimension with a check that the order is not a flat Kleitman-Rothschild order.

import { Poset } from '@/code/tool/poset'
import { myrheimMeyerDimension } from '@/code/measure/dimension'

// Height of the poset: the number of links in the longest chain anywhere in the
// order (so a single antichain has height 0, a path of L+1 elements has height
// L). Computed by relaxing covering links in topological order.
function posetHeight(input: { poset: Poset }): number {
  const p = input.poset

  if (p.size === 0) {
    return 0
  }

  // Longest-chain height by repeated relaxation of covering links. Iterating
  // until no value changes converges to the true longest chain regardless of
  // element index order (a Bellman-Ford-style fixpoint on a DAG).
  const best = new Int32Array(p.size)

  for (let pass = 0; pass < p.size; pass++) {
    let changed = false

    for (let x = 0; x < p.size; x++) {
      const row = p.links[x] ?? new Uint32Array(0)
      const baseValue = best[x] ?? 0

      for (let k = 0; k < row.length; k++) {
        const child = row[k] ?? 0
        const candidate = baseValue + 1

        if (candidate > (best[child] ?? 0)) {
          best[child] = candidate
          changed = true
        }
      }
    }

    if (!changed) {
      break
    }
  }

  let max = 0

  for (let x = 0; x < p.size; x++) {
    if ((best[x] ?? 0) > max) {
      max = best[x] ?? 0
    }
  }

  return max
}

// Decide whether the poset looks like a smooth manifold.
//
// estimatedDimension: the Myrheim-Meyer effective dimension.
// isKleitmanRothschild: KR orders are the flat three-layer orders that dominate
//   the count of all finite posets. They have tiny height (~2 links / 3 layers)
//   even when N is large. We flag KR when the height is small relative to the
//   log of N, which a genuine manifold's growing chains will exceed.
// score: a heuristic in [0,1]. High when the dimension is finite and physical
//   (1 <= d <= 6) and the order is not Kleitman-Rothschild. The dimension band
//   is scored with a smooth falloff outside [1,6]; KR collapses the score.
export function manifoldLikeness(input: { poset: Poset }): {
  score: number
  estimatedDimension: number
  isKleitmanRothschild: boolean
} {
  const n = input.poset.size
  const estimatedDimension = myrheimMeyerDimension({
    poset: input.poset,
  })

  const height = posetHeight({ poset: input.poset })

  // KR test: height stays around 2 (three layers) while N grows. Compare the
  // height to log2(N): a manifold's longest chain grows with the linear size of
  // the sprinkling, so height >> a small constant; a KR order does not.
  const logN = n > 1 ? Math.log2(n) : 1
  const isKleitmanRothschild =
    n >= 8 && height <= 3 && height < 0.5 * logN

  let score = 0

  if (n >= 2 && estimatedDimension > 0) {
    // Dimension band: full credit inside [1,6], smooth falloff outside.
    let dimScore: number

    if (estimatedDimension >= 1 && estimatedDimension <= 6) {
      dimScore = 1
    } else if (estimatedDimension < 1) {
      dimScore = Math.max(0, estimatedDimension / 1)
    } else {
      // d > 6: decay by one unit of penalty per extra dimension.
      dimScore = Math.max(0, 1 - (estimatedDimension - 6) / 6)
    }

    score = dimScore

    if (isKleitmanRothschild) {
      // A KR order is the canonical non-manifold; suppress the score hard.
      score *= 0.1
    }
  }

  return {
    score,
    estimatedDimension,
    isKleitmanRothschild,
  }
}
