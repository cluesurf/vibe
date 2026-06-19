// The capture recipe, demonstrated end to end (inspiral-capture-design, routes-to-nested-selves). Nested selves
// need CAPTURE, two structures binding into one, and the arc established that capture needs TWO ingredients, an
// attractive interaction (a bound state to fall into) and a bath (somewhere to shed the binding energy). The
// reversible bulk supplies neither, so this is the reduced canonical model of the mechanism, the relative
// coordinate of two opposite charges (the binding well is the attraction) coupled to a radiative field-chain bath
// (an absorbing far end is radiation leaving to infinity). It is the same physics that forms positronium or a
// binary inspiral.
//
// Two charges are launched APART (outward relative velocity). Capture means the relative coordinate stays bounded
// and SETTLES small. Three cases isolate the two ingredients.
//   attractive + bath:    the well pulls them back and the bath drains the energy, they settle to r ~ 0, CAPTURE.
//   attractive + no bath: the well pulls them back but the radiated energy reflects and returns, they oscillate
//                         forever, bound but never settled, NO capture.
//   repulsive  + bath:    no bound state to fall into, they coast out and escape, the bath cannot bind them.
//
// Only attractive-plus-bath captures, so BOTH ingredients are necessary. Honest status, L2 and reduced, both the
// attraction and the bath are modeled, not derived from the committed rule. The substrate-faithful half (the bath
// as the open or infinite lattice) is `selves/bath-from-open-boundary`. Whether the ATTRACTION can emerge from
// the pure rule is the open L3, probed in `selves/emergent-attraction-search`.
//
// Depth L2, the recipe demonstrated with two controls, no bath (reflecting) and no attraction (repulsive).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  oscillatorBathTrajectory,
  lateAmplitude as lateAmp,
} from '@/code/dynamics/oscillator-bath'

// the early and late amplitude of a pair launched APART in an attractive well coupled to a radiative bath.
function lateAmplitude(input: {
  absorbing: boolean
  stiffness: number
}): { early: number; late: number } {
  const steps = 6000
  const trajectory = oscillatorBathTrajectory({
    absorbing: input.absorbing,
    stiffness: input.stiffness,
    start: 0.2,
    velocity: 0.6,
    steps,
  })
  let early = 0
  for (let t = 0; t < steps * 0.15; t++) {
    const a = Math.abs(trajectory[t]!)
    if (a > early) early = a
  }
  return { early, late: lateAmp(trajectory) }
}

export default experiment({
  id: 'selves/inspiral-capture',
  title:
    'attraction plus a bath captures (inspiral and settle), removing either one prevents capture',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const attractiveBath = lateAmplitude({
      absorbing: true,
      stiffness: 1.0,
    })
    const attractiveNoBath = lateAmplitude({
      absorbing: false,
      stiffness: 1.0,
    })
    const repulsiveBath = lateAmplitude({
      absorbing: true,
      stiffness: -0.5,
    })

    // only attraction + bath settles, the other two do not, so BOTH ingredients are necessary.
    const captured = attractiveBath.late < 0.1
    const noBathOscillates = attractiveNoBath.late > 0.2
    const noAttractionEscapes = repulsiveBath.late > 100

    const ok = captured && noBathOscillates && noAttractionEscapes
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a pair launched apart in an attractive well coupled to a radiative bath inspirals and SETTLES (capture), while removing the bath (a reflecting end) leaves it oscillating forever and removing the attraction (a repulsive well) lets it escape, so capture requires BOTH an attractive interaction and a bath, exactly the recipe the self arc predicted',
      metrics: {
        attractiveBathLate: attractiveBath.late,
        attractiveNoBathLate: attractiveNoBath.late,
        repulsiveBathLate: repulsiveBath.late,
        startAmplitude: attractiveBath.early,
        captured: captured ? 1 : 0,
        noBathOscillates: noBathOscillates ? 1 : 0,
        noAttractionEscapes: noAttractionEscapes ? 1 : 0,
      },
      control: {
        attractiveNoBathLate: attractiveNoBath.late,
        repulsiveBathLate: repulsiveBath.late,
      },
      notes:
        'reduced canonical model (L2), the attraction is a binding well and the bath is a radiative chain with an absorbing end, both modeled not derived from the committed rule. It proves the recipe, capture = attraction + bath, and that both are necessary. The bath half is substrate-faithful in selves/bath-from-open-boundary, the attraction half (does it emerge from the pure rule) is the open L3 in selves/emergent-attraction-search',
    })
  },
})
