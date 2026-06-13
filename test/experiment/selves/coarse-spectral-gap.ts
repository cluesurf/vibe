// E2 (multi-level-selves plan), the timescale gap. A clean emergent level shows a slow mode in the lag-tau
// Markov model of the level below. Here we build the Markov model of a real self's motion on the flat layer
// and read its second eigenvalue, the slowest relaxing mode. The control is the SAME trajectory shuffled in
// time, which destroys temporal structure, so its Markov model has no slow mode. A positive result is that
// the real self has a slow mode the shuffle does not.
//
// Depth L2. This shows the coarse engine correctly detects temporal structure in self dynamics (a known
// Markov-state-model construction on this substrate), it does not by itself claim a clean emergent level
// from the pure base rule, that is the L3 target of the full tower.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { countMatrix, transitionEigenvalues, spectralGap } from '@/code/coarse/transition-matrix'
import { selfTrajectory, makeRng } from '@/test/experiment/selves/coarse-self-trajectory'

function shuffled(labels: number[], seed: number): number[] {
  const rng = makeRng(seed)
  const out = labels.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

export default defineExperiment({
  id: 'selves/coarse-spectral-gap',
  title: 'the Markov model of a real self has a slow mode the time-shuffled control lacks',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const bins = 8
    const lag = 5
    const traj = selfTrajectory({ L: 64, beats: 600, bins, seed: 12345 })

    const real = countMatrix({ trajectory: traj.labels, stateCount: bins, lag })
    const lambdaReal = spectralGap(transitionEigenvalues(real)).lambda2

    const control = countMatrix({ trajectory: shuffled(traj.labels, 999), stateCount: bins, lag })
    const lambdaShuffled = spectralGap(transitionEigenvalues(control)).lambda2

    const ok = lambdaReal > lambdaShuffled + 0.15
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a real self position trajectory has a slow Markov mode (second eigenvalue near one) that the time-shuffled control destroys',
      metrics: { lambdaReal, lambdaShuffled, bins, lag, beats: 600 },
      control: { lambdaShuffled },
      notes:
        'statistical, one realization, robustness from lattice size not seeds. L2 method check, not a claim of a clean emergent level',
    })
  },
})
