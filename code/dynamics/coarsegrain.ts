// Random coarse-graining (decimation) of a causal set: keep each element with a
// fixed probability and inherit the induced order on the survivors. Bombelli's
// renormalization move and the testbed's nesting operator.

import { Poset, subPoset } from '@/code/tool/poset'
import { Rng } from '@/code/tool/rng'

export function decimate(input: {
  poset: Poset
  keepProbability: number
  rng: Rng
}): Poset {
  const survivors: number[] = []
  for (let a = 0; a < input.poset.size; a++) {
    if (input.rng.next() < input.keepProbability) {
      survivors.push(a)
    }
  }
  // subPoset relabels the survivors 0..k-1 and induces the order via precedes.
  return subPoset(input.poset, { elements: survivors })
}
