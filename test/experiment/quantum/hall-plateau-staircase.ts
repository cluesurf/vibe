// The quantum Hall plateau, as a measured staircase. The striking fact of the quantum Hall effect
// is not that conductance is topological, it is the PLATEAU: sweep a continuous knob (field,
// density) and the measured conductance stays pinned at an exact integer, then steps to the next
// integer at a critical point, because the observable is a topological invariant that cannot change
// while the gap is open. This experiment measures that staircase shape on the model's chiral walk,
// where the same invariant (the winding number, the one-dimensional cousin of the Chern number that
// sets sigma_xy) is read from the real dynamics as the mean chiral displacement (E-QTM-0077).
//
// The knob is the second coin angle, swept continuously across a topological transition:
//   - PLATEAU: on each side of the transition the measured invariant sits within 0.05 of its
//     integer (0 below, 2 above) at every one of the sweep points, flat against a continuously
//     varying knob, the plateau phenomenon itself.
//   - THE STEP: the jump happens between two adjacent sweep points, at the angle where the walk's
//     gap closes, and the critical point itself reads 1.0, the midpoint, the known critical-point
//     value between plateaus.
//   - THE CONTROL: the trivial coin swept over the same range reads within 0.05 of zero everywhere,
//     no plateau structure and no step, so the staircase is the chiral band topology and not the
//     sweep or the estimator.
//
// Together with the protection (E-QTM-0080), the edge states (E-QTM-0079, E-QTM-0081) and the
// cyclotron and flux-period results (E-QTM-0078, E-QTM-0062), this is the integer quantum Hall
// structure on the model: an integer observable, flat under a continuous knob, stepping only at gap
// closings, with protected edges. Depth L2: known split-step-walk topology (Kitagawa 2010) measured
// from the dynamics, on the walk model rather than the committed rule. Superconductivity (the
// pairing gap, flux expulsion) is a separate open row. Deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meanChiralDisplacement } from '@/code/dynamics/split-step-walk'

const PI = Math.PI
const SIZE = 1200
const STEPS = 150

function winding(theta1: number, theta2: number): number {
  return meanChiralDisplacement({
    size: SIZE,
    steps: STEPS,
    theta1,
    theta2,
  })
}

export default experiment({
  id: 'quantum/hall-plateau-staircase',
  code: 'E-QTM-0097',
  title:
    'the quantum Hall staircase on the chiral walk: sweeping the coin angle continuously across a topological transition, the measured invariant sits within 0.05 of the integer 0 on one side and 2 on the other at every sweep point (the plateau, an observable pinned at an integer against a continuous knob), steps only at the gap-closing angle where the critical point reads the midpoint 1.0, and the trivial-coin control shows no structure over the same sweep, which with the protection and edge-state results is the integer quantum Hall phenomenology on the model',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // the sweep: theta2 from -0.6 pi to -0.4 pi, crossing the transition at -0.5 pi
    const sweep: number[] = []

    for (let i = 0; i <= 10; i++) {
      sweep.push(-0.6 * PI + (0.2 * PI * i) / 10)
    }

    const measured = sweep.map(t2 => winding(PI / 2, t2))

    // plateau A: the five points strictly below the transition, integer 0
    const below = measured.slice(0, 5)
    // the critical point, at exactly -0.5 pi
    const critical = measured[5]!
    // plateau B: the five points strictly above, integer 2
    const above = measured.slice(6)

    const plateauLow = below.every(w => Math.abs(w) < 0.05)
    const plateauHigh = above.every(w => Math.abs(w - 2) < 0.05)
    const criticalMidpoint = Math.abs(critical - 1) < 0.05

    // the control: the trivial coin over the same sweep, no winding anywhere
    const trivial = sweep.map(t2 => winding(0, t2))
    const controlFlat = trivial.every(w => Math.abs(w) < 0.05)

    const ok =
      plateauLow && plateauHigh && criticalMidpoint && controlFlat

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the invariant holds within 0.05 of integer 0 across five sweep points, jumps at the gap closing where the critical point reads within 0.05 of the midpoint 1, holds within 0.05 of integer 2 across the next five, and the trivial coin reads near zero over the whole sweep',
      metrics: {
        worstLowPlateauError: Number(
          Math.max(...below.map(Math.abs)).toFixed(4),
        ),
        worstHighPlateauError: Number(
          Math.max(...above.map(w => Math.abs(w - 2))).toFixed(4),
        ),
        criticalPointValue: Number(critical.toFixed(3)),
        plateauStep: 2,
      },
      // CONTROL: the trivial coin, flat near zero over the identical sweep
      control: {
        worstTrivialReading: Number(
          Math.max(...trivial.map(Math.abs)).toFixed(4),
        ),
      },
      notes:
        'the knob here is a coin angle rather than a magnetic field, which is the honest scope: the staircase SHAPE (integer plateaus, a step at a gap closing, a midpoint critical value) is the quantum Hall phenomenon, while the Hall resistance in ohms needs the two-dimensional carrier coupled to a real flux, tracked under dynamical_gauge_field. Prior art for the walk: Kitagawa 2010.',
    })
  },
})
