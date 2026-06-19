// P7 alignment from dynamics: the honest frontier result.
// We showed CHSH violation needs an ALIGNED setting-state correlation. Can a
// natural causal mesh produce it? In a relativistic mesh the shared past of two
// spacelike-separated measurements (the overlap of their backward light cones)
// SHRINKS with separation, and fast in an expanding hyperbolic mesh. So the
// shared-past fraction eta(d) that drives the correlation decays with separation
// d. We model eta(d) = exp(-d / xi) and measure CHSH S(d). The result: a natural
// mesh gives violation that DECAYS with separation, while quantum mechanics gives
// separation-independent violation. So naturalness and quantum violation are in
// tension for spacelike measurements, the precise residual difficulty. See
// note/experiment/results/p7-naturalness.md.
// Run: npx tsx code/experiment/p7-dynamics.ts

import { chshShared } from '@/code/measure/bell'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/dynamics',
  title:
    'in a natural mesh the CHSH violation decays with separation, unlike flat quantum violation',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const xi = 2.0
    const sNear = chshShared({
      eta: Math.exp(-0 / xi),
      mode: 'aligned',
      trials: 80000,
      seed: 900,
    })

    const sFar = chshShared({
      eta: Math.exp(-8 / xi),
      mode: 'aligned',
      trials: 80000,
      seed: 908,
    })

    const nearViolates = sNear > 2
    const farDecays = sFar < sNear && sFar < 2.4
    const ok = nearViolates && farDecays

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a natural causal mesh reproduces CHSH violation only for nearby measurements, with the violation decaying toward the classical bound as separation grows, unlike the flat separation-independent quantum violation',
      metrics: {
        sNear,
        sFar,
        classicalBound: 2,
        quantumValue: 2 * Math.sqrt(2),
      },
      control: {
        sFar,
      },
      notes:
        'L1, an honest negative. The shared-past fraction eta(d) = exp(-d/xi) is an ASSUMED decay model, not measured from a stepped mesh, so the result quantifies a tension rather than deriving it from the base rule. The far-separation point, where the violation decays, is the control against the near point. It uses random sampling over 80000 trials, so each S is a Monte Carlo estimate. The finding is the precise residual difficulty, a natural mesh gives quantum violation only for nearby measurements, not spacelike ones.',
    })
  },
})
