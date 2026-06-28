// The Shannon entropy (in bits) of the ternary tone histogram over a chosen set of slot indices. This is the
// apparent mixedness a local observer sees in a subregion's marginal: zero when the region is one pure tone,
// positive when the tones are spread. Reusable across any experiment that reads local marginal disorder.

// entropy of the {-1, 0, +1} histogram over the given slot indices of a tone array, in bits.
export function ternaryToneEntropyBits(
  values: Int8Array,
  indices: number[],
): number {
  if (indices.length === 0) {
    return 0
  }

  const count: [number, number, number] = [0, 0, 0]

  for (const i of indices) {
    count[(values[i]! + 1) as 0 | 1 | 2] += 1
  }

  const total = indices.length

  let bits = 0

  for (const c of count) {
    if (c > 0) {
      const p = c / total
      bits -= p * Math.log2(p)
    }
  }

  return bits
}
