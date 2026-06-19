// Small statistical measures shared across experiments.

// Arithmetic mean of a series (0 for an empty series).
export function mean(series: ArrayLike<number>): number {
  const n = series.length
  if (n === 0) {
    return 0
  }
  let s = 0
  for (let i = 0; i < n; i++) {
    s += series[i]!
  }
  return s / n
}

// Population variance (divide by n) of a series (0 for an empty series).
export function populationVariance(series: ArrayLike<number>): number {
  const n = series.length
  if (n === 0) {
    return 0
  }
  const m = mean(series)
  let s = 0
  for (let i = 0; i < n; i++) {
    s += (series[i]! - m) ** 2
  }
  return s / n
}

// Population standard deviation (sqrt of the population variance) of a series.
export function standardDeviation(series: ArrayLike<number>): number {
  return Math.sqrt(populationVariance(series))
}

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

// Relative standard deviation of a series: the standard deviation divided by the
// largest absolute value in the series (a scale-free fluctuation measure). Near
// zero means the quantity is effectively constant, used to detect conserved
// quantities (a conservation law shows relative spread below a tolerance).
export function relativeStandardDeviation(
  series: ArrayLike<number>,
): number {
  const n = series.length
  if (n === 0) {
    return 0
  }
  let m = 0
  let scale = 1e-9
  for (let i = 0; i < n; i++) {
    m += series[i]!
    scale = Math.max(scale, Math.abs(series[i]!))
  }
  m /= n
  let v = 0
  for (let i = 0; i < n; i++) {
    v += (series[i]! - m) ** 2
  }
  v /= n
  return Math.sqrt(v) / scale
}

// Relative root-mean-square error between two series, sqrt( sum (a-b)^2 / sum a^2 ), normalized by the
// reference `a`. Zero when they coincide. The commuting-square fidelity (how close coarsen-then-evolve
// is to evolve-then-coarsen) and other agreement-of-fields checks read off this.
export function relativeL2Error(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
): number {
  const n = Math.min(a.length, b.length)
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (a[i]! - b[i]!) ** 2
    den += a[i]! * a[i]!
  }
  return den > 0 ? Math.sqrt(num / den) : 0
}

// The joint count table between TWO different label series at lag tau, counts[i][j] = number of times series
// A is in state i at time t and series B is in state j at time t+tau. Unlike countMatrix (one series against
// itself) this is the cross-joint of two series, the input to a mutual-information measurement of how much
// one series tells about the future of another (the predictive-information measure).
export function crossJointCounts(input: {
  seriesA: number[]
  seriesB: number[]
  stateCount: number
  lag: number
}): number[][] {
  const { seriesA, seriesB, stateCount, lag } = input
  const counts: number[][] = Array.from({ length: stateCount }, () =>
    new Array<number>(stateCount).fill(0),
  )
  const last = Math.min(seriesA.length, seriesB.length) - lag
  for (let t = 0; t < last; t++) {
    const i = seriesA[t]!
    const j = seriesB[t + lag]!
    if (i >= 0 && j >= 0 && i < stateCount && j < stateCount) {
      counts[i]![j]!++
    }
  }
  return counts
}

// Mutual information I(X; Y) in BITS from a joint COUNT table joint[x][y]. Normalizes the counts
// to a probability, then sums p(x,y) log2( p(x,y) / (p(x) p(y)) ) over non-empty cells. Zero when
// the variables are independent, used to quantify measurement dependence (the setting-versus-hidden
// -state correlation) in the Bell / superdeterminism experiments.
export function mutualInformationBits(
  joint: ArrayLike<ArrayLike<number>>,
): number {
  const rows = joint.length
  const cols = joint[0]?.length ?? 0
  let total = 0
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      total += joint[x]![y] ?? 0
    }
  }
  if (total <= 0) {
    return 0
  }
  const px = new Array<number>(rows).fill(0)
  const py = new Array<number>(cols).fill(0)
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      const p = (joint[x]![y] ?? 0) / total
      px[x] = (px[x] ?? 0) + p
      py[y] = (py[y] ?? 0) + p
    }
  }
  let mi = 0
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      const p = (joint[x]![y] ?? 0) / total
      if (p > 0) {
        const denom = (px[x] ?? 0) * (py[y] ?? 0)
        if (denom > 0) {
          mi += p * Math.log2(p / denom)
        }
      }
    }
  }
  return mi
}
