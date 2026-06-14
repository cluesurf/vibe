// B2: the chiral overlap fermion in a dynamical NON-ABELIAN SU(2) gauge field.
// The full chiral gauge theory is open, but this reaches the rung below it: a
// vector-like overlap fermion coupled to a dynamical SU(2) field, with the chiral
// condensate measured by the Banks-Casher near-zero density. Zero in the free
// theory, nonzero with the field, the non-Abelian analogue of the Schwinger
// condensate. See note/questions/remaining-frontier-spec.md (B2).
// Run: npx tsx code/experiment/p8-su2-condensate.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { chiralCondensateSignalSU2 } from '@/code/operator/overlap-su2'

export default experiment({
  id: 'gauge/su2-condensate',
  title: 'a chiral condensate forms in a dynamical non-abelian SU(2) gauge field, near zero in the free theory',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const disorders = [0, 0.3, 0.6, 1.0]
    const densities = disorders.map(
      (disorder) =>
        chiralCondensateSignalSU2({
          length: 3,
          disorder,
          configs: 10,
          rng: makeRng({ seed: 600 + Math.round(disorder * 100) }),
        }).nearZeroDensity,
    )
    const free = densities[0] ?? 0
    const maxSignal = Math.max(...densities)
    const ok = free < 0.005 && maxSignal > free
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the overlap fermion near-zero density is near zero in the free theory and nonzero in a dynamical SU(2) gauge field, the non-abelian analogue of the Schwinger chiral condensate',
      metrics: {
        freeDensity: free,
        maxDensity: maxSignal,
      },
      notes:
        'L2, known physics, a vector-like overlap fermion in a dynamical SU(2) field. The gauge configurations are pseudo-random, so the densities are Monte Carlo estimates over an ensemble. The free theory is the near-zero control. Statistical reproduction one rung below the open chiral gauge theory, not an emergent claim.',
    })
  },
})
