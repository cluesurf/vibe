// MS2 of the multiscale-self program, the learned interaction law between two selves. Two selves are emerged,
// then placed at a chosen separation and run under the passive beat, so the only dynamics is the selves
// acting on each other. The interaction law read off the dynamics, two opposite-charge selves annihilate
// where their spreading fronts meet, strongly at contact and not at all out of range, while two same-charge
// selves never annihilate. So the measured inter-self law is both RANGED (falls to zero with separation) and
// CHARGE-SELECTIVE (only opposite charges interact this way). This is the pairwise law the surrogate tower
// needs to run many selves cheaply (MS3). The plus-count is exactly conserved by the passive beat except
// through annihilation, so the annihilated fraction is an exact, noise-free observable. Depth L2, a measured
// two-self interaction with two exact-zero controls (out of range, and same charge). Spec: note
// theory-v0.8.0/experiments/24-multiscale-self-simulation.md (MS2).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  emergeSelfShape,
  runTwoSelfAnnihilation,
} from '@/code/coarse/two-self'

// contact annihilation must clear this, the range and same-charge controls must stay below it. The measured
// contact value is near 0.4 and both controls are exactly 0, so the bounds sit clear of the knife edge.
const CONTACT_MIN = 0.2
const CONTROL_MAX = 0.05

export default experiment({
  id: 'selves/two-self-interaction',
  title:
    'two opposite-charge selves annihilate at contact but not at range, same-charge selves never do',
  category: 'selves',
  substrates: ['flat-horosphere'],
  depth: 'L2',
  paper: false,
  run() {
    const shape = emergeSelfShape({ L: 96, seed: 56789, density: 0.12 })
    const beats = 90
    const cohesion = 0.22

    const annihilatedFraction = (
      d: number,
      rightSign: number,
    ): number => {
      const counts = runTwoSelfAnnihilation({
        shape,
        d,
        rightSign,
        cohesion,
        beats,
        seed: 4242,
      })
      const start = counts[0]!

      return start > 0 ? 1 - counts[counts.length - 1]! / start : 0
    }

    // the interaction law sampled at three points, opposite charges at contact and out of range, and same
    // charges at contact (the charge-selectivity control).
    const contactOpposite = annihilatedFraction(10, -1)
    const rangeOpposite = annihilatedFraction(48, -1)
    const contactSame = annihilatedFraction(10, 1)

    const ok =
      contactOpposite > CONTACT_MIN &&
      rangeOpposite < CONTROL_MAX &&
      contactSame < CONTROL_MAX &&
      contactOpposite - rangeOpposite > 0.15 &&
      contactOpposite - contactSame > 0.15

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two opposite-charge selves annihilate strongly where their fronts meet at contact and not at all out of range, while two same-charge selves never annihilate, so the measured inter-self interaction law is ranged and charge-selective',
      metrics: {
        contactOpposite,
        rangeOpposite,
        contactSame,
        rangeContrast: contactOpposite - rangeOpposite,
        chargeContrast: contactOpposite - contactSame,
        selfSize: shape.size,
      },
      control: { rangeOpposite, contactSame },
      notes:
        'the plus count is exactly conserved by the passive beat except through annihilation, so the annihilated fraction is exact, the two controls (out of range and same charge) both read exactly zero',
    })
  },
})
