// MS4 of the multiscale-self program, the patch-test error control. A surrogate is only safe to use while it
// stays in the regime it was fit on. This test fits a Markov surrogate to a self's early dynamics, then
// measures its forward accuracy in a later window. When the self's dynamics drift into a new regime (its
// binding weakens partway through) the surrogate's accuracy drops sharply, so the patch test flags the drift.
// A stationary self triggers no such drop, so there is no false alarm. This is the heterogeneous-multiscale
// validity monitor that keeps the surrogate tower honest. Depth L2, a forward-accuracy drift detector with a
// stationary control. Spec: note theory-v0.8.0/experiments/24-multiscale-self-simulation.md (MS4).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quantileLabels } from '@/code/coarse/transition-matrix'
import { driftingSelfTrajectory } from '@/code/coarse/self-trajectory'
import {
  fitMarkovSurrogate,
  forwardAccuracy,
} from '@/code/coarse/surrogate'

const bins = 6
const lag = 10
const beats = 4000
const changeAt = 2000

// the surrogate must hold accuracy across a stationary self (drift below this) and lose it after a regime
// change (drift above this). The measured drifts are near 0.03 and 0.28, so both bounds sit clear of the
// knife edge.
const STATIONARY_MAX = 0.1
const DRIFT_MIN = 0.15

// fit a surrogate on the self's early regime, then report its forward accuracy early (in regime) and late
// (after the cohesion changes to cohesionLate at changeAt). The accuracy drop is the drift signal.
function patchDrift(cohesionLate: number): {
  early: number
  late: number
  drift: number
} {
  const traj = driftingSelfTrajectory({
    L: 64,
    beats,
    seed: 56789,
    cohesionEarly: 0.22,
    cohesionLate,
    changeAt,
  })
  const labels = quantileLabels({ series: traj.centroids, bins })
  const surrogate = fitMarkovSurrogate({
    trajectory: labels.slice(200, changeAt - 100),
    stateCount: bins,
    lag,
  })
  const early = forwardAccuracy({
    tpm: surrogate,
    test: labels.slice(300, changeAt - 100),
    lag,
  })
  const late = forwardAccuracy({
    tpm: surrogate,
    test: labels.slice(changeAt + 200, beats - 100),
    lag,
  })
  return { early, late, drift: early - late }
}

export default experiment({
  id: 'selves/surrogate-patch-test',
  title:
    'a patch test detects surrogate drift after a regime change, the stationary self gives no false alarm',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    // the self whose binding nearly switches off partway, a genuine change of coarse dynamics.
    const changed = patchDrift(0.02)
    // the stationary self, the no-drift control (same binding throughout).
    const stationary = patchDrift(0.22)

    const ok =
      changed.drift > DRIFT_MIN && stationary.drift < STATIONARY_MAX

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a surrogate fit to a self early regime loses forward accuracy sharply after the self drifts into a new regime (the patch test flags it), while a stationary self keeps its accuracy (no false alarm), so a local patch test reliably detects when the surrogate has left its valid regime',
      metrics: {
        earlyChanged: changed.early,
        lateChanged: changed.late,
        driftChanged: changed.drift,
        earlyStationary: stationary.early,
        lateStationary: stationary.late,
        driftStationary: stationary.drift,
        separation: changed.drift - stationary.drift,
      },
      control: { driftStationary: stationary.drift },
      notes:
        'the drift is the forward-accuracy drop from the in-regime window to the post-change window, the stationary control isolates real drift from sampling noise',
    })
  },
})
