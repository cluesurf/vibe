import { pearson } from '@/code/measure/statistics'

// Persistence of a time series of coarse fields: the mean, over the window, of the lag-`lag`
// autocorrelation (Pearson correlation of the field at beat t with the field at beat t + lag). A
// structure that survives `lag` beats scores high. Used by the coherence-tower probes to ask whether
// coarse-grained patterns persist longer than the fine scale and longer than a shuffled null.
export function lagAutocorrelation(input: {
  series: ReadonlyArray<ArrayLike<number>>
  lag: number
  epsilon?: number
}): number {
  const { series, lag, epsilon } = input

  let acc = 0
  let count = 0

  for (let t = 0; t + lag < series.length; t++) {
    acc += pearson({ a: series[t]!, b: series[t + lag]!, epsilon })
    count++
  }

  return count > 0 ? acc / count : 0
}
