// Small statistical measures shared across experiments.

// Pearson correlation coefficient between two equal-length series. Returns 0 when
// either series has variance at or below `epsilon` (the degenerate, no-signal
// case). The default epsilon of 0 keeps the strict `variance > 0` guard; pass a
// small epsilon (e.g. 1e-9) to treat near-constant series as no-signal.
export function pearson(input: {
  a: ArrayLike<number>
  b: ArrayLike<number>
  epsilon?: number
}): number {
  const { a, b } = input
  const epsilon = input.epsilon ?? 0
  const n = a.length
  let ma = 0
  let mb = 0
  for (let i = 0; i < n; i++) {
    ma += a[i]!
    mb += b[i]!
  }
  ma /= n
  mb /= n
  let num = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < n; i++) {
    const da = a[i]! - ma
    const db = b[i]! - mb
    num += da * db
    va += da * da
    vb += db * db
  }
  return va > epsilon && vb > epsilon ? num / Math.sqrt(va * vb) : 0
}
