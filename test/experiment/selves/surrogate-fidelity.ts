// MS1 of the multiscale-self program. A learned surrogate of a self's coarse dynamics, fit from the first
// part of its trajectory, forward-predicts the held-out later part better than the memoryless marginal
// baseline, while a surrogate fit to the time-shuffled trajectory does not. This is the validity check that
// makes the surrogate tower (running higher-order selves cheaply, instead of at exponential base cost)
// trustworthy. Depth L2, a standard Markov-state-model forward validation on the self dynamics, with two
// controls (the memoryless marginal and the time-shuffled surrogate).
//
// The observable is the SELF's own centroid (the largest plus-charge cluster), not the global positive
// centroid, because the active vacuum's churn dominates the global one. The self centroid drifts smoothly, so
// its lag-tau dynamics are genuinely Markov-predictable. Spec: note
// theory-v0.8.0/experiments/24-multiscale-self-simulation.md (MS1).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quantileLabels } from '@/code/coarse/transition-matrix'
import { selfUnitTrajectory } from '@/code/coarse/self-trajectory'
import {
  fitMarkovSurrogate,
  marginalDistribution,
  predictiveLogLikelihood,
  marginalLogLikelihood,
  forwardAccuracy,
  timeShuffle,
} from '@/code/coarse/surrogate'

// the surrogate must beat both baselines by at least this much mean log-likelihood per transition. The
// measured gains are near 0.6 to 0.7, so this sits well inside the gap, not on a knife edge.
const MARGIN = 0.2

export default experiment({
  id: 'selves/surrogate-fidelity',
  title:
    'a learned surrogate of a self forward-predicts its held-out coarse future, the controls do not',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const bins = 6
    // a few coarse steps ahead, non-trivial (not lag 1 persistence) yet still inside the self's correlation
    // time, so a learned model has real predictive leverage over the memoryless baseline.
    const lag = 10
    const traj = selfUnitTrajectory({ L: 64, beats: 4000, seed: 56789 })
    const labels = quantileLabels({ series: traj.centroids, bins })

    // a temporal split, fit on the first 60 percent, validate forward on the held-out last 40 percent. The
    // surrogate never sees the test window, so beating a baseline there is genuine forward prediction.
    const cut = Math.floor(labels.length * 0.6)
    const train = labels.slice(0, cut)
    const test = labels.slice(cut)

    const surrogate = fitMarkovSurrogate({
      trajectory: train,
      stateCount: bins,
      lag,
    })

    const marginal = marginalDistribution({
      trajectory: train,
      stateCount: bins,
      lag,
    })

    const shuffled = fitMarkovSurrogate({
      trajectory: timeShuffle({ trajectory: train, seed: 321 }),
      stateCount: bins,
      lag,
    })

    const llSurrogate = predictiveLogLikelihood({
      tpm: surrogate,
      test,
      lag,
    })

    const llMarginal = marginalLogLikelihood({ marginal, test, lag })
    const llShuffled = predictiveLogLikelihood({
      tpm: shuffled,
      test,
      lag,
    })

    const accSurrogate = forwardAccuracy({ tpm: surrogate, test, lag })

    // the surrogate beats the memoryless baseline on data it never saw (it learned real state-dependent
    // dynamics that generalize forward), and the time-shuffled surrogate does not (temporal order is
    // necessary, so the gain is not a fitting artifact).
    const gainOverMarginal = llSurrogate - llMarginal
    const gainOverShuffled = llSurrogate - llShuffled
    const ok = gainOverMarginal > MARGIN && gainOverShuffled > MARGIN

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a Markov surrogate fit from the first part of a self trajectory forward-predicts the held-out later part far better than the memoryless marginal and better than a time-shuffled surrogate, so the learned reduced model captures real self dynamics',
      metrics: {
        llSurrogate,
        llMarginal,
        llShuffled,
        accSurrogate,
        gainOverMarginal,
        gainOverShuffled,
        meanSelfSize: traj.meanSelfSize,
      },
      control: { llMarginal, llShuffled },
      notes:
        'validated out-of-sample on a held-out forward window, the gain over the time-shuffled control shows the predictive power comes from real temporal structure, not from fitting, the observable is the self cluster centroid not the churning global one',
    })
  },
})
