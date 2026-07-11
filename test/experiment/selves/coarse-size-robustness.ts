// Robustness of the spectral-gap result across lattice SIZE, the discipline the methodology requires (vary
// the size, not the seed). The Markov model of a real self must show a slow mode at every lattice size, and
// the time-shuffled control must lack it at every size. A result that held at only one size would be a knife
// edge. This sweeps three sizes and requires the gap at all of them.
//
// Depth L2, the same method check as coarse-spectral-gap, made robust over size.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  countMatrix,
  transitionEigenvalues,
  spectralGap,
  quantileLabels,
} from '@/code/coarse/transition-matrix'
import { selfTrajectory, makeRng } from '@/code/coarse/self-trajectory'

function shuffle(labels: number[], seed: number): number[] {
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

function lambda2(labels: number[], bins: number, lag: number): number {
  return spectralGap(
    transitionEigenvalues(
      countMatrix({ trajectory: labels, stateCount: bins, lag }),
    ),
  ).lambda2
}

export default experiment({
  id: 'selves/coarse-size-robustness',
  code: 'E-SLF-0030',
  title:
    'the self slow-mode survives across lattice sizes, and the shuffled control fails at every size',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const bins = 8
    const lag = 5
    const sizes = [48, 64, 96]
    const metrics: Record<string, number> = { bins, lag }

    let worstMargin = Infinity
    let worstShuffled = 0

    for (const L of sizes) {
      const traj = selfTrajectory({
        L,
        beats: 600,
        bins,
        seed: 1000 + L,
      })

      const labels = quantileLabels({ series: traj.centroids, bins })
      const real = lambda2(labels, bins, lag)
      const shuffled = lambda2(shuffle(labels, 7 * L + 1), bins, lag)

      metrics[`real_L${L}`] = real
      metrics[`shuffled_L${L}`] = shuffled
      worstMargin = Math.min(worstMargin, real - shuffled)
      worstShuffled = Math.max(worstShuffled, shuffled)
    }

    metrics.worstMargin = worstMargin

    const ok = worstMargin > 0.15

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the second Markov eigenvalue of a real self exceeds its time-shuffled control by a clear margin at every lattice size tested',
      metrics,
      control: { worstShuffled },
      notes:
        'robustness over lattice size, the methodology discipline, not over random seeds',
    })
  },
})
