// The delete-one jackknife: the statistical error of any estimator computed from a list of samples,
// including a nonlinear one (a ratio of averages, the log of a ratio) where propagating the errors
// of the parts by hand is wrong. Each of the n leave-one-out subsets gives an estimate, and the
// spread of those estimates, scaled by (n - 1) / n, is the variance of the full estimate.

//
// Monte Carlo samples taken a few updates apart are correlated, and the delete-one jackknife then
// underestimates the error. `binSize` groups consecutive samples into bins and deletes one bin at a
// time, which is honest once a bin is longer than the autocorrelation time. Grow the bin until the
// error stops growing.
export function jackknife<Sample>(input: {
  samples: readonly Sample[]
  estimator: (samples: readonly Sample[]) => number
  binSize?: number
}): { value: number; error: number } {
  const { samples, estimator } = input
  const binSize = Math.max(1, input.binSize ?? 1)
  const bins = Math.floor(samples.length / binSize)
  const n = bins
  const value = estimator(samples)

  if (n < 2) {
    return { value, error: Number.NaN }
  }

  const estimates = Array.from({ length: bins }, (_, drop) =>
    estimator(
      samples.filter(
        (__, index) => Math.floor(index / binSize) !== drop && index < bins * binSize,
      ),
    ),
  )
  const center = estimates.reduce((sum, x) => sum + x, 0) / n
  const variance =
    ((n - 1) / n) * estimates.reduce((sum, x) => sum + (x - center) ** 2, 0)

  return { value, error: Math.sqrt(variance) }
}

// Average several equal-length series sample by sample, the ensemble mean of a table of loops or a
// correlator.
export function averageSeries(input: {
  series: readonly (readonly number[])[]
}): number[] {
  const { series } = input
  const length = series[0]?.length ?? 0
  const out = new Array<number>(length).fill(0)

  for (const row of series) {
    for (let k = 0; k < length; k++) {
      out[k] = (out[k] ?? 0) + (row[k] ?? 0) / series.length
    }
  }

  return out
}
