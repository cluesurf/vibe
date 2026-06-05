// Order statistics that separate a manifold-like causal set from a layered
// Kleitman-Rothschild (KR) order. The key discriminant is the height ratio: a 2D
// manifold-like order has a longest chain about sqrt(N) (its proper time), so the
// ratio is order 1, while a KR order has height 3 and the ratio falls toward 0.
// See note/questions/p2-dynamics-spec.md.

import { Poset, relationCount } from '~/core/poset'
import { myrheimMeyerDimension } from '~/measure/dimension'

// Longest chain length in elements (the order's height). Assumes the labelling is
// topological (a precedes b implies a < b), which holds for sprinklings and for
// the Monte Carlo's a < b representation.
export function posetHeight(input: { poset: Poset }): number {
  const p = input.poset
  if (p.size === 0) {
    return 0
  }
  const longest = new Int32Array(p.size).fill(1)
  let maxHeight = 1
  for (let v = 0; v < p.size; v++) {
    const lv = longest[v] ?? 1
    const row = p.links[v] ?? new Uint32Array(0)
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      if (lv + 1 > (longest[w] ?? 1)) {
        longest[w] = lv + 1
        if (lv + 1 > maxHeight) {
          maxHeight = lv + 1
        }
      }
    }
  }
  return maxHeight
}

export function orderStatistics(input: { poset: Poset }): {
  orderingFraction: number
  height: number
  heightRatio: number
  mmDimension: number
} {
  const p = input.poset
  const pairs = (p.size * (p.size - 1)) / 2
  const orderingFraction = pairs > 0 ? relationCount(p) / pairs : 0
  const height = posetHeight({ poset: p })
  const heightRatio = p.size > 1 ? height / Math.sqrt(p.size) : 0
  const mmDimension = myrheimMeyerDimension({ poset: p })
  return { orderingFraction, height, heightRatio, mmDimension }
}
