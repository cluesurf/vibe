// The connected two-point correlation of a per-cell readout, by graph distance,
// computed EXACTLY over every pair (no sampling, deterministic). The sibling of
// connectedCorrelationByDistance, which samples with an rng; this one sums all
// pairs, so it is reproducible and exact, at O(cells^2) cost (fine up to a few
// thousand cells). C(r) = mean over pairs at graph distance r of readout(a) *
// readout(b), minus the square of the global mean readout. A nonzero C(r) at
// distance r means the two cells are correlated across r hops.

import { neighborDistances } from '@/code/tool/graph'

export function connectedToneCorrelation(input: {
  neighbors: readonly (readonly number[] | Uint32Array)[]
  size: number
  readout: ArrayLike<number> // one value per cell, e.g. the sign of the charge
  maxRadius: number
}): number[] {
  const { neighbors, size, readout, maxRadius } = input

  let total = 0

  for (let cell = 0; cell < size; cell++) {
    total += readout[cell] ?? 0
  }

  const mean = size > 0 ? total / size : 0

  const sum = new Float64Array(maxRadius + 1)
  const count = new Float64Array(maxRadius + 1)

  for (let source = 0; source < size; source++) {
    const distance = neighborDistances({ neighbors, size, source })
    const here = readout[source] ?? 0

    // only count each unordered pair once (other > source)
    for (let other = source + 1; other < size; other++) {
      const r = distance[other] ?? -1

      if (r >= 1 && r <= maxRadius) {
        sum[r] = (sum[r] ?? 0) + here * (readout[other] ?? 0)
        count[r] = (count[r] ?? 0) + 1
      }
    }
  }

  const correlation: number[] = []

  for (let r = 0; r <= maxRadius; r++) {
    const c = count[r] ?? 0
    correlation.push(c > 0 ? (sum[r] ?? 0) / c - mean * mean : 0)
  }

  return correlation
}

// The average magnitude of the correlation in a distance window, the compact
// readout for "is there correlation beyond the causal horizon". lo and hi are
// inclusive graph-distance bounds.
export function meanCorrelationMagnitude(input: {
  correlation: number[]
  lo: number
  hi: number
}): number {
  const { correlation, lo, hi } = input

  let total = 0
  let n = 0

  for (let r = lo; r <= hi; r++) {
    total += Math.abs(correlation[r] ?? 0)
    n++
  }

  return n > 0 ? total / n : 0
}
