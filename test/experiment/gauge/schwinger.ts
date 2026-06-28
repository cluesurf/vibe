// P8 / A4: the chiral condensate in a dynamical gauge field (the Schwinger model).
// The overlap fermion is placed in random 2D U(1) gauge backgrounds, and we
// measure the near-zero spectral density of the gamma5-Hermitian overlap, which by
// Banks-Casher is proportional to the chiral condensate. The Schwinger condensate
// is nonzero purely from the anomaly and grows with gauge coupling, so the signal
// should rise with disorder. See note/questions/remaining-frontier-spec.md (A4).
// Run: npx tsx code/experiment/p8-schwinger.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { chiralCondensateSignal } from '@/code/operator/overlap-condensate'

export default experiment({
  id: 'gauge/schwinger',
  code: 'E-FRC-0045',
  title:
    'the Schwinger chiral condensate signal is near zero free and grows with gauge disorder',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const disorders = [0, 0.25, 0.5, 0.75, 1.0]
    const densities = disorders.map(
      disorder =>
        chiralCondensateSignal({
          length: 5,
          disorder,
          configs: 3,
          rng: makeRng({ seed: 500 + Math.round(disorder * 100) }),
        }).nearZeroDensity,
    )

    const free = densities[0] ?? 0
    const strong = densities[densities.length - 1] ?? 0
    const ok = free < 0.02 && strong > free

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the near-zero spectral density of the overlap fermion, proportional to the chiral condensate by Banks-Casher, is small in the free theory and rises with gauge disorder, the anomaly-induced Schwinger condensate',
      metrics: {
        freeDensity: free,
        strongDensity: strong,
      },
      notes:
        'L2, known physics, the Schwinger-model chiral condensate from the anomaly. The gauge backgrounds are pseudo-random, so each density is a Monte Carlo estimate over an ensemble. The free theory is the near-zero control that makes the rise meaningful. Statistical reproduction of a known result, not an emergent claim.',
    })
  },
})
