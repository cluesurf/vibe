// Shape statistics of a one-dimensional distribution, read off a fixed-width
// histogram. The normalized Shannon entropy (flatness) is the boost-invariance
// discriminant: a Lorentz-invariant rapidity distribution is flat (entropy near 1),
// a preferred-frame one piles up at a single value (entropy near 0).

// Normalized Shannon entropy of the samples binned into a histogram over
// [-range, range], in [0, 1]. 1 means flat (uniform across bins), near 0 means
// concentrated in one bin. Samples outside the range are dropped, and an empty
// (all-out-of-range) histogram returns 0.
export function histogramFlatness(input: {
  samples: readonly number[]
  range: number
  bins: number
}): number {
  const { samples, range, bins } = input

  if (samples.length === 0) {
    return 0
  }

  const h = new Array<number>(bins).fill(0)

  let kept = 0

  for (const e of samples) {
    if (e < -range || e > range) {
      continue
    }

    const k = Math.min(
      bins - 1,
      Math.floor(((e + range) / (2 * range)) * bins),
    )

    h[k] = (h[k] ?? 0) + 1
    kept += 1
  }

  if (kept === 0) {
    return 0
  }

  let ent = 0

  for (const c of h) {
    if (c > 0) {
      const p = c / kept
      ent -= p * Math.log(p)
    }
  }

  return ent / Math.log(bins)
}
