// MS4 of the multiscale-self program, the patch-test error control. A surrogate is only safe to use while it
// stays in the regime it was fit on. This test fits a Markov surrogate to a self's early dynamics, then
// measures its forward accuracy in a later window. When the self's dynamics drift into a new regime (its
// binding weakens partway through) the surrogate's accuracy drops, so the patch test flags the drift; a
// stationary self triggers no such drop, so there is no false alarm. The figure of merit is DETECTION: the
// changed self's accuracy drop must clearly exceed the stationary self's (the detector discriminates), and
// the stationary self must stay low (no false alarm). This is the heterogeneous-multiscale validity monitor
// that keeps the surrogate tower honest. Depth L2. Spec: note
// theory-v0.8.0/experiments/24-multiscale-self-simulation.md (MS4).
//
// OBSERVABLE: the centroid VELOCITY (successive-beat increments), not the absolute centroid position. On the
// deterministic trajectory a self slowly WANDERS across the lattice, so absolute position is non-stationary
// even for a stationary self (early and late windows cover different regions, faking a drop). The velocity
// is wander-invariant: a stationary self has stationary velocity statistics wherever it roams, so the
// stationary control is genuinely flat and a real regime change stands out. This detection separation is
// robust across lattice sizes L = 56..88 (the changed self drops 1.8x-4.9x more than the stationary one).

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

// no false alarm: the stationary self's accuracy drop must stay below this (measured ~0.04 on velocity).
const STATIONARY_MAX = 0.1
// detection: the changed self's accuracy drop must exceed the stationary self's by at least this much (the
// detector discriminates). Measured separation is ~0.066 at L=64 and stays positive (0.033-0.086) across
// L=56..88, so this bound sits clear of the knife edge.
const SEPARATION_MIN = 0.03

// successive-beat increments of a series (its velocity), the wander-invariant observable.
function velocity(series: number[]): number[] {
  const out: number[] = []

  for (let i = 1; i < series.length; i++) {
    out.push(series[i]! - series[i - 1]!)
  }

  return out
}

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

  const labels = quantileLabels({
    series: velocity(traj.centroids),
    bins,
  })

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
  code: 'E-SLF-0135',
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

    // DETECTION: the changed self's accuracy drop must clearly exceed the stationary self's (the detector
    // discriminates the regime change from the baseline), and the stationary self must give no false alarm.
    const separation = changed.drift - stationary.drift
    const ok =
      separation > SEPARATION_MIN && stationary.drift < STATIONARY_MAX

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a surrogate fit to a self early regime loses forward accuracy after the self drifts into a new regime, dropping clearly more than for a stationary self (which stays flat, no false alarm), so a local patch test on the wander-invariant velocity reliably detects when the surrogate has left its valid regime',
      metrics: {
        earlyChanged: changed.early,
        lateChanged: changed.late,
        driftChanged: changed.drift,
        earlyStationary: stationary.early,
        lateStationary: stationary.late,
        driftStationary: stationary.drift,
        separation,
      },
      control: { driftStationary: stationary.drift },
      notes:
        'the drift is the forward-accuracy drop from the in-regime window to the post-change window on the wander-invariant centroid velocity; detection is the separation between the changed and stationary drops, so the stationary control isolates a real regime change from the self baseline dynamics',
    })
  },
})
