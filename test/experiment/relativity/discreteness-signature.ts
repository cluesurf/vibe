// A discreteness signature, novel and falsifiable. The discrete dispersion deviates from the linear continuum
// relation by a leading correction that grows with momentum (the phase speed bends below the infrared light
// speed). We measure that relative deviation along an axis on the D4 set and its leading order. The deviation
// vanishes in the infrared (the continuum is recovered at low energy) and rises with momentum at a leading order
// near two (from the k^4 term in omega^2). Its coefficient sets the momentum scale where discreteness becomes
// visible. If the deviation were large at accessible momenta, the theory would be falsified.
//
// L2, a measured property of the discrete dispersion. Compute in code/measure/dispersion (dispersionSpeedDeviation).

import { rootsD4 } from '@/code/algebra/group/root-system'
import { dispersionSpeedDeviation } from '@/code/measure/dispersion'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'relativity/discreteness-signature',
  code: 'E-RLT-0009',
  title:
    'the discrete dispersion bends below the continuum at a leading order in momentum, vanishing in the infrared',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const wavenumbers = [0.05, 0.1, 0.2, 0.4, 0.8]
    const r = dispersionSpeedDeviation({
      directions: rootsD4(),
      axis: [1, 0, 0, 0],
      wavenumbers,
    })

    const vanishesInIR = r.deviations[0]! < 0.01
    const risesWithMomentum =
      r.deviations[r.deviations.length - 1]! > r.deviations[0]! + 0.02

    const leadingOrderNearTwo =
      r.leadingOrder > 1.5 && r.leadingOrder < 2.5

    const ok = vanishesInIR && risesWithMomentum && leadingOrderNearTwo

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the phase speed deviates from its infrared value as a power of momentum near two, vanishing in the infrared so the continuum is recovered at low energy, the leading discreteness signature whose coefficient sets the scale at which it becomes observable',
      metrics: {
        leadingOrder: r.leadingOrder,
        deviationAtLowK: r.deviations[1]!,
        deviationAtHighK: r.deviations[r.deviations.length - 1]!,
      },
      notes:
        'L2. novel falsifiable, the coefficient is order one in lattice units so the deviation is Planck-suppressed in physical units, below current bounds, and predicts where it would appear',
    })
  },
})
