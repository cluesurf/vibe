// E4 of the observer chunk, the experience-to-tone correspondence made behavioural. The tone IS the felt
// value, pain at minus, pleasure at plus, and a self should act on it, approaching pleasure and avoiding
// pain. Placed in a tone dipole (a plus strip on one side, a minus strip on the other), the self drifts
// toward the plus side, the lean making the minus strip annihilate its facing edge while the plus strip
// nourishes it. The drift reverses when the gradient reverses (the differential is large and positive) and
// vanishes without the dynamics (a no-dynamics control gives zero), so valence shows up as measured
// approach-avoid behaviour, not an imposed rule. Depth L2, a measured directed drift with a no-dynamics
// control and a gradient-reversal test. Spec: note theory-v0.8.0/experiments/05-observer-and-inner-experience.md
// (E4).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { valenceDrift } from '@/code/coarse/valence-drift'

const L = 64
const beats = 500
const seed = 777

// the gradient must steer the self by at least this many cells (differential), and the no-dynamics control
// must stay below this. The measured differential is near 35 and the control is exactly 0.
const STEER_MIN = 12
const CONTROL_MAX = 4

export default experiment({
  id: 'selves/valence-approach',
  code: 'E-SLF-0148',
  title:
    'a self drifts toward a +tone region and away from a -tone region, and not without the dynamics',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const driftToPlusRight = valenceDrift({
      L,
      beats,
      seed,
      plusSide: 'right',
      withDynamics: true,
    })

    const driftToPlusLeft = valenceDrift({
      L,
      beats,
      seed,
      plusSide: 'left',
      withDynamics: true,
    })

    const deadRight = valenceDrift({
      L,
      beats,
      seed,
      plusSide: 'right',
      withDynamics: false,
    })

    const deadLeft = valenceDrift({
      L,
      beats,
      seed,
      plusSide: 'left',
      withDynamics: false,
    })

    // the self goes toward whichever side the plus tone is on, so the right-minus-left differential is large
    // and positive, while it cancels any baseline drift.
    const valenceDifferential = driftToPlusRight - driftToPlusLeft
    const noDynamicsDifferential = deadRight - deadLeft

    const ok =
      valenceDifferential > STEER_MIN &&
      noDynamicsDifferential < CONTROL_MAX

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self drifts toward a plus-tone (pleasure) region and away from a minus-tone (pain) region, the drift reversing with the gradient, and the directed motion vanishes without the dynamics, so the lean is realized as measured approach-avoid behaviour',
      metrics: {
        driftToPlusRight,
        driftToPlusLeft,
        valenceDifferential,
        noDynamicsDifferential,
      },
      control: { noDynamicsDifferential },
      notes:
        'the differential (drift toward a plus-right gradient minus drift toward a plus-left gradient) cancels the baseline drift, the no-dynamics control shows the directed motion needs the dynamics',
    })
  },
})
