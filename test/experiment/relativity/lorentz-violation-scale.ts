// Emergent Lorentz violation, novel and falsifiable. The theory says Lorentz invariance is emergent, so it must
// break at some order in momentum. We measure the leading order of the axis-versus-diagonal anisotropy on the D4
// 24-direction set versus a hypercubic set. D4 is isotropic to high order, so its anisotropy is strongly
// suppressed at small momentum (a large scaling order), while the hypercubic set is anisotropic already at order
// two. So the {3,4,3,4} substrate hides Lorentz violation to high order (below current bounds), and a hypercubic
// substrate would already be ruled out. If D4's leading order were low, the theory would be falsified.
//
// L2 with a control (the hypercubic set), reading a known isotropy fact as the violation scale. Compute in
// code/measure/dispersion (anisotropyScalingOrder) and code/algebra/group/root-system.

import {
  rootsD4,
  hypercubicAxes,
  probeDirections4D,
} from '@/code/algebra/group/root-system'
import { anisotropySpreadOrder } from '@/code/measure/dispersion'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'relativity/lorentz-violation-scale',
  title:
    'the D4 substrate suppresses Lorentz violation to a higher order in momentum than a hypercubic substrate',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const probes = probeDirections4D()
    const scales = [0.25, 0.5, 1.0, 1.5, 2.0]
    const d4 = anisotropySpreadOrder({
      directions: rootsD4(),
      probes,
      scales,
    })
    const cubic = anisotropySpreadOrder({
      directions: hypercubicAxes(4),
      probes,
      scales,
    })

    const d4HigherOrder = d4.order > cubic.order + 1.5
    const d4SmallerAtLowK = d4.spreads[0]! < cubic.spreads[0]! / 10

    const ok = d4HigherOrder && d4SmallerAtLowK

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the leading Lorentz anisotropy on the D4 24-direction set scales at a markedly higher order in momentum than on a hypercubic set and is far smaller at low momentum, so {3,4,3,4} suppresses Lorentz violation to high order while a hypercubic substrate would be anisotropic at low order and already ruled out',
      metrics: {
        d4LeadingOrder: d4.order,
        d4AnisotropyAtLowK: d4.spreads[0]!,
      },
      control: {
        cubicLeadingOrder: cubic.order,
        cubicAnisotropyAtLowK: cubic.spreads[0]!,
      },
      notes:
        'L2. the high-order isotropy of D4 is a known lattice fact, the novel content is reading its order as the emergent-Lorentz-violation suppression scale, falsifiable, a low order would contradict the tight experimental bounds',
    })
  },
})
