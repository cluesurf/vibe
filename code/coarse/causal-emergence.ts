// The causal-emergence layer (Hoel effective information) of the coarse-graining engine. Unlike the earlier
// hand-built funnel test, these operate on a MEASURED transition matrix read from real trajectories, so the
// degeneracy (if any) is discovered, not imposed. Effective information is the information an intervention
// that sets the current state gives about the next state, the causal power of the dynamics at that grain.

import {
  quantileLabels,
  countMatrix,
  rowStochastic,
} from './transition-matrix'

// Effective information of a row-stochastic transition matrix, in bits. EI is the average over states of the
// KL divergence of that state's output distribution from the mean output distribution.
export function effectiveInformation(tpm: number[][]): number {
  const n = tpm.length

  if (n === 0) {
    return 0
  }

  const mean = new Array<number>(n).fill(0)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      mean[j]! += tpm[i]![j]! / n
    }
  }

  let ei = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const p = tpm[i]![j]!

      if (p > 1e-12 && mean[j]! > 1e-12) {
        ei += (p * Math.log2(p / mean[j]!)) / n
      }
    }
  }

  return ei
}

// Coarse-grain a transition matrix by a group-label array. The macro row of a group is the average of its
// members' rows (a uniform intervention over the group), and the macro column sums the members' columns.
export function coarseGrainTpm(input: {
  tpm: number[][]
  groups: number[]
}): number[][] {
  const { tpm, groups } = input
  const macroCount = Math.max(...groups) + 1
  const size = new Array<number>(macroCount).fill(0)

  for (const g of groups) {
    size[g]!++
  }

  const macro: number[][] = Array.from({ length: macroCount }, () =>
    new Array<number>(macroCount).fill(0),
  )

  for (let i = 0; i < tpm.length; i++) {
    const gi = groups[i]!

    for (let j = 0; j < tpm.length; j++) {
      macro[gi]![groups[j]!]! += tpm[i]![j]! / size[gi]!
    }
  }

  return macro
}

// Structured-versus-random effective-information of a coarse observable trajectory. The
// series is quantile-binned into `fine` micro states, a lag-1 transition matrix is read
// off it, and EI is measured three ways, the micro matrix, a STRUCTURED coarse-graining
// that merges adjacent bins into `macroCount` macro states (respecting the dynamics), and
// a RANDOM coarse-graining of the same coarseness (the control). A structured macro that
// keeps more EI than the random macro is the signature of a genuine coarse level. The
// `rng.next()` draws drive a Fisher-Yates shuffle of the random group labels.
export function emergenceGain(input: {
  series: number[]
  fine: number
  macroCount: number
  rng: { next: () => number }
}): {
  eiMicro: number
  eiSpatial: number
  eiRandom: number
} {
  const labels = quantileLabels({
    series: input.series,
    bins: input.fine,
  })

  const micro = rowStochastic(
    countMatrix({ trajectory: labels, stateCount: input.fine, lag: 1 }),
  )

  const eiMicro = effectiveInformation(micro)

  const block = input.fine / input.macroCount
  const spatialGroups = Array.from({ length: input.fine }, (_, i) =>
    Math.floor(i / block),
  )

  const eiSpatial = effectiveInformation(
    coarseGrainTpm({ tpm: micro, groups: spatialGroups }),
  )

  const randomGroups = Array.from(
    { length: input.fine },
    (_, i) => i % input.macroCount,
  )

  for (let i = input.fine - 1; i > 0; i--) {
    const j = Math.floor(input.rng.next() * (i + 1))
    const tmp = randomGroups[i]!
    randomGroups[i] = randomGroups[j]!
    randomGroups[j] = tmp
  }

  const eiRandom = effectiveInformation(
    coarseGrainTpm({ tpm: micro, groups: randomGroups }),
  )

  return { eiMicro, eiSpatial, eiRandom }
}
