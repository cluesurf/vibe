// Learned surrogate dynamics for a self, the reusable heart of the multiscale tower. Fit a Markov transition
// model from the FIRST part of a self's coarse trajectory, then validate it by FORWARD PREDICTION on a
// held-out later part. A surrogate that has learned real one-step dynamics beats the memoryless marginal
// baseline on data it never saw. A surrogate fit to a time-shuffled trajectory has no dynamics to learn and
// does not. This is the fitting-and-validation layer the surrogate-tower experiments stand on (the
// multiscale-self program, MS1 to MS3). Companion machinery: transition-matrix.ts (the count matrix and the
// spectral gap), self-trajectory.ts (the micro source).

import { countMatrix } from '@/code/coarse/transition-matrix'
import { weylPermutation } from '@/code/tool/weyl'

// A row-stochastic transition matrix fit from a label trajectory at lag tau, with add-alpha (Laplace)
// smoothing so a held-out transition never has probability zero. alpha is a small pseudo-count.
export function fitMarkovSurrogate(input: {
  trajectory: number[]
  stateCount: number
  lag: number
  alpha?: number
}): number[][] {
  const { trajectory, stateCount, lag } = input
  const alpha = input.alpha ?? 1e-3
  const counts = countMatrix({ trajectory, stateCount, lag })

  return counts.map(row => {
    const smoothed = row.map(c => c + alpha)
    const sum = smoothed.reduce((a, b) => a + b, 0)

    return smoothed.map(c => c / sum)
  })
}

// The marginal (memoryless) next-state distribution fit from a label trajectory at lag tau. This is the
// baseline a learned surrogate must beat, it predicts the same distribution regardless of the current state,
// so beating it proves the surrogate captured genuine state-dependent dynamics, not just the occupancy.
export function marginalDistribution(input: {
  trajectory: number[]
  stateCount: number
  lag: number
  alpha?: number
}): number[] {
  const { trajectory, stateCount, lag } = input
  const alpha = input.alpha ?? 1e-3
  const counts = new Array<number>(stateCount).fill(alpha)

  for (let t = 0; t + lag < trajectory.length; t++) {
    const j = trajectory[t + lag]!

    if (j >= 0) {
      counts[j]!++
    }
  }

  const sum = counts.reduce((a, b) => a + b, 0)

  return counts.map(c => c / sum)
}

// Mean log-likelihood per transition that a transition matrix assigns to a held-out trajectory at lag tau.
// Higher (less negative) is a better forward predictor. This is genuine out-of-sample prediction when test is
// data the matrix was not fit on.
export function predictiveLogLikelihood(input: {
  tpm: number[][]
  test: number[]
  lag: number
}): number {
  const { tpm, test, lag } = input

  let total = 0
  let n = 0

  for (let t = 0; t + lag < test.length; t++) {
    const i = test[t]!
    const j = test[t + lag]!

    if (i >= 0 && j >= 0) {
      const p = tpm[i]?.[j] ?? 0

      total += Math.log(p > 0 ? p : Number.MIN_VALUE)
      n++
    }
  }

  return n > 0 ? total / n : -Infinity
}

// The memoryless-baseline version, the log-likelihood of a held-out trajectory under a fixed marginal
// distribution (the current state ignored).
export function marginalLogLikelihood(input: {
  marginal: number[]
  test: number[]
  lag: number
}): number {
  const { marginal, test, lag } = input

  let total = 0
  let n = 0

  for (let t = 0; t + lag < test.length; t++) {
    const j = test[t + lag]!

    if (j >= 0) {
      const p = marginal[j] ?? 0

      total += Math.log(p > 0 ? p : Number.MIN_VALUE)
      n++
    }
  }

  return n > 0 ? total / n : -Infinity
}

// Fraction of held-out transitions whose most-probable next state under the matrix matches the truth. An
// interpretable companion to the log-likelihood.
export function forwardAccuracy(input: {
  tpm: number[][]
  test: number[]
  lag: number
}): number {
  const { tpm, test, lag } = input

  let hits = 0
  let n = 0

  for (let t = 0; t + lag < test.length; t++) {
    const i = test[t]!
    const j = test[t + lag]!

    if (i >= 0 && j >= 0) {
      const row = tpm[i] ?? []

      let best = 0
      let bestP = -1

      for (let k = 0; k < row.length; k++) {
        if (row[k]! > bestP) {
          bestP = row[k]!
          best = k
        }
      }

      if (best === j) {
        hits++
      }

      n++
    }
  }

  return n > 0 ? hits / n : 0
}

// Time-shuffle a label trajectory, destroying the temporal order while preserving the marginal. The control,
// a surrogate fit to this has no real dynamics to learn, so it cannot out-predict the marginal baseline.
// The permutation is the deterministic Weyl permutation at `start` (code/tool/weyl). Until 2026-09-25 it
// was a Fisher-Yates shuffle from a local linear congruential generator seeded by the caller.
export function timeShuffle(input: {
  trajectory: number[]
  start: number
}): number[] {
  const { trajectory, start } = input
  const order = weylPermutation({ size: trajectory.length, start })

  return order.map(i => trajectory[i]!)
}
