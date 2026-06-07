// A layered Kleitman-Rothschild order: three antichain layers (bottom, middle,
// top) with every element of a lower layer below every element of a higher one.
// These flat orders dominate the uniform measure over causal sets and are the
// "wrong" (non-manifold) phase. We use one as a warm start for the layered basin
// in the P2 transition study. The labelling is by layer, so it is topological
// (a precedes b implies a < b) and seeds the Monte Carlo relation directly.
// See note/questions/frontier-spec.md (Front 2).

import { Poset, makePosetFromRelation } from '~/tool/poset'

export function kleitmanRothschildOrder(input: { size: number }): Poset {
  const n = input.size
  const bottom = Math.floor(n / 4)
  const top = Math.floor(n / 4)
  const middleEnd = n - top // [bottom, middleEnd) is the middle layer

  const layerOf = (i: number): number => {
    if (i < bottom) {
      return 0
    }
    if (i < middleEnd) {
      return 1
    }
    return 2
  }

  const precedes = (pair: { a: number; b: number }): boolean =>
    layerOf(pair.a) < layerOf(pair.b)

  return makePosetFromRelation({ size: n, precedes })
}
