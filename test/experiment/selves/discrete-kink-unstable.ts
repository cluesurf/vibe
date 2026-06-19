// 2A tested (plans/bound-body-base-modifications), the discrete sine-Gordon kink. The best no-new-ingredient bet
// was a second-order field (0B) with more tone values (0D), whose KINK is a topological soliton, bound by topology
// and able to radiate. We build the reversible integer scheme u(t+1) = left + right - u(t-1) + accel(u), with a
// double-well accel (two vacua), and test whether a kink is a stable bound-and-radiating structure.
//
// It is not. The speed-one discrete wave scheme is only MARGINALLY stable, so the on-site force destabilizes the
// zone-edge modes. With a BOUNDED (saturating) force the field stays bounded but SHATTERS, one clean kink turns
// into a turbulence of many walls. With an UNBOUNDED (linear pull-back) force the field BLOWS UP (its magnitude
// runs away). Either way there is no stable kink, so no body-hit can heal. Stabilizing the scheme would need
// sub-unity (real) coefficients, which the discrete commitment forbids. So the naive discrete sine-Gordon does not
// give a self, a stable discrete kink would need a special integrable discretization (an open question).
//
// Depth L2, an honest negative for the 2A route, the discrete kink shatters or blows up.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeWaveField,
  stepWaveField,
  doubleWellAccel,
  fieldMaxAbs,
  domainWallCount,
  type WaveField,
} from '@/code/dynamics/wave-field'

export default experiment({
  id: 'selves/discrete-kink-unstable',
  title:
    'the discrete sine-Gordon kink is unstable: a bounded force shatters it, an unbounded force blows it up',
  category: 'selves',
  substrates: ['integer-field'],
  depth: 'L2',
  paper: true,
  run() {
    const size = 240
    const steps = 300
    const amplitude = 3
    const center = size / 2

    // a kink at rest, the left vacuum is minus the amplitude, the right is plus, a sharp wall at the center.
    const kink = (): WaveField =>
      makeWaveField({
        size,
        fill: x => (x < center ? -amplitude : amplitude),
      })

    // bounded (saturating) force, the field stays bounded but shatters into many walls.
    let bounded: WaveField = kink()
    const boundedAccel = doubleWellAccel({
      amplitude,
      saturating: true,
    })
    for (let t = 0; t < steps; t++) {
      bounded = stepWaveField({
        field: bounded,
        accel: boundedAccel,
        boundary: {
          form: 'absorbing',
          left: -amplitude,
          right: amplitude,
        },
      })
    }
    const boundedWalls = domainWallCount(bounded.curr)
    const boundedMaxAbs = fieldMaxAbs(bounded.curr)

    // unbounded (linear pull-back) force on a SMOOTH ramp kink, the field magnitude runs away. (A sharp kink stays
    // within the vacua and only shatters, the runaway needs intermediate values to trigger the linear branch.)
    const ramp = (): WaveField =>
      makeWaveField({
        size,
        fill: x =>
          Math.max(-amplitude, Math.min(amplitude, x - center)),
      })
    let unbounded: WaveField = ramp()
    const unboundedAccel = doubleWellAccel({
      amplitude,
      saturating: false,
    })
    for (let t = 0; t < steps; t++) {
      unbounded = stepWaveField({
        field: unbounded,
        accel: unboundedAccel,
        boundary: {
          form: 'absorbing',
          left: -amplitude,
          right: amplitude,
        },
      })
    }
    const unboundedMaxAbs = fieldMaxAbs(unbounded.curr)

    // the honest negative, the bounded scheme shatters (far more than one wall) and the unbounded scheme blows up
    // (magnitude far above the vacuum). Neither gives a stable kink. PASS means we demonstrated the instability.
    const boundedShatters =
      boundedWalls >= 10 && boundedMaxAbs <= 10 * amplitude
    const unboundedBlowsUp = unboundedMaxAbs >= 100 * amplitude
    const ok = boundedShatters && unboundedBlowsUp

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the naive discrete sine-Gordon kink is unstable, the reversible integer scheme u(t+1) = left + right - u(t-1) + accel(u) is only marginally stable at wave speed one, so the on-site double-well force destabilizes the zone-edge modes, a bounded (saturating) force keeps the field bounded but SHATTERS the single kink into a turbulence of many walls, and an unbounded (linear) force makes the field BLOW UP, neither leaves a stable kink that could heal a hit, stabilizing would need sub-unity real coefficients which the discrete commitment forbids, so the 2A route does not give a self by this discretization',
      metrics: {
        amplitude,
        boundedWalls,
        boundedMaxAbs,
        unboundedMaxAbs,
        boundedShatters: boundedShatters ? 1 : 0,
        unboundedBlowsUp: unboundedBlowsUp ? 1 : 0,
        steps,
      },
      control: { boundedWalls, unboundedMaxAbs },
      notes:
        'honest negative for 2A (discrete sine-Gordon). The discreteness fights the soliton, a bounded force shatters the kink, an unbounded one blows up. A stable discrete kink needs a special integrable discretization (Ablowitz-Ladik style) or real coefficients, an open problem. Related, a self also needs an ENERGY SCALE to separate bound from free, which the single-speed substrate lacks, pointing at multi-speed (0C) as needed infrastructure',
    })
  },
})
