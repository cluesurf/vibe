// The temporal renormalization tower of surrogates (the multiscale-self program, MS3 and MS6). Level L models
// the self at lag baseLag * 2^L, so each level up describes the self at twice the time-coarseness and at
// roughly half the cost to cover a fixed span. The fidelity (forward accuracy) of each level's learned
// surrogate is compared to a time-shuffled control, and the op-count cost is compared to the base resolution.
// A climbable tower keeps fidelity above chance for several levels while the cost falls geometrically. Reuses
// the surrogate fit and validation layer.

import {
  fitMarkovSurrogate,
  forwardAccuracy,
  timeShuffle,
} from '@/code/coarse/surrogate'

export type TowerLevel = {
  level: number
  lag: number
  // forward accuracy of the learned surrogate at this lag, on the held-out window.
  accuracy: number
  // forward accuracy of a time-shuffled surrogate at this lag, the no-dynamics control.
  shuffledAccuracy: number
  // op-count to simulate the span at this level, ceil(span / lag) steps each costing bins squared.
  surrogateCost: number
  // op-count to simulate the span at base resolution, span beats each touching every cell.
  baseCost: number
  speedup: number
}

// Build the surrogate tower from a discrete label trajectory. Each level fits a Markov surrogate at lag
// baseLag * 2^level, validates it forward on a held-out window, and prices it against base resolution.
export function surrogateTower(input: {
  labels: number[]
  bins: number
  baseLag: number
  levels: number
  cellCount: number
  span: number
  trainFraction?: number
  shuffleSeed?: number
}): TowerLevel[] {
  const { labels, bins, baseLag, levels, cellCount, span } = input
  const trainFraction = input.trainFraction ?? 0.6
  const shuffleSeed = input.shuffleSeed ?? 321
  const cut = Math.floor(labels.length * trainFraction)
  const train = labels.slice(0, cut)
  const test = labels.slice(cut)
  const shuffledTrain = timeShuffle({
    trajectory: train,
    seed: shuffleSeed,
  })

  const out: TowerLevel[] = []

  for (let level = 0; level < levels; level++) {
    const lag = baseLag * 2 ** level
    const surrogate = fitMarkovSurrogate({
      trajectory: train,
      stateCount: bins,
      lag,
    })

    const shuffled = fitMarkovSurrogate({
      trajectory: shuffledTrain,
      stateCount: bins,
      lag,
    })

    const accuracy = forwardAccuracy({ tpm: surrogate, test, lag })
    const shuffledAccuracy = forwardAccuracy({
      tpm: shuffled,
      test,
      lag,
    })

    const surrogateCost = Math.ceil(span / lag) * bins * bins
    const baseCost = span * cellCount

    out.push({
      level,
      lag,
      accuracy,
      shuffledAccuracy,
      surrogateCost,
      baseCost,
      speedup: baseCost / surrogateCost,
    })
  }

  return out
}

// The forward accuracy of a surrogate fit at a single lag, used for an over-compression control beyond the
// climbable tower (a lag so coarse the fidelity collapses toward chance).
export function towerAccuracyAtLag(input: {
  labels: number[]
  bins: number
  lag: number
  trainFraction?: number
}): number {
  const { labels, bins, lag } = input
  const trainFraction = input.trainFraction ?? 0.6
  const cut = Math.floor(labels.length * trainFraction)
  const train = labels.slice(0, cut)
  const test = labels.slice(cut)
  const surrogate = fitMarkovSurrogate({
    trajectory: train,
    stateCount: bins,
    lag,
  })

  return forwardAccuracy({ tpm: surrogate, test, lag })
}
