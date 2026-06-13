// Agreement measures between two ternary tone vectors, plus coarse-graining a tone
// field to cluster majorities. The dot-product overlap (code/operator/hopfield
// toneOverlap) only counts non-zero entries, so for "did the state stay the same"
// the fraction of entries that agree is the right measure.

// Fraction of entries that are exactly equal.
export function agreementFraction(a: Int8Array, b: Int8Array): number {
  let same = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      same++
    }
  }
  return same / Math.max(1, a.length)
}

// Fraction of entries that differ, the complement of the agreement fraction.
export function disagreementFraction(a: Int8Array, b: Int8Array): number {
  return 1 - agreementFraction(a, b)
}

// Coarse-grain a tone field into K cluster tones, each the sign of the sum of its
// members (the cluster majority). `cluster[v]` is the cluster index of cell v.
export function clusterMajority(cluster: Int32Array, clusterCount: number, tone: Int8Array): Int8Array {
  const sum = new Float64Array(clusterCount)
  for (let v = 0; v < tone.length; v++) {
    sum[cluster[v] ?? 0] = (sum[cluster[v] ?? 0] ?? 0) + (tone[v] ?? 0)
  }
  const out = new Int8Array(clusterCount)
  for (let c = 0; c < clusterCount; c++) {
    out[c] = (sum[c] ?? 0) > 0 ? 1 : (sum[c] ?? 0) < 0 ? -1 : 0
  }
  return out
}
