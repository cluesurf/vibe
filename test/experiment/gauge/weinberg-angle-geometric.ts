// A constant pinned from geometry. From the discrete charge content of one generation (the 16 of SO(10) that the
// cell forces), the weak mixing angle comes out sin^2(theta_W) = 3/8 exactly and the hypercharge trace vanishes,
// the GUT-scale values. A single altered charge breaks 3/8 (the control), so the value is pinned by the content,
// not fitted. The low-energy 0.231 follows by renormalization-group running, not done here.
//
// L1 known relation, reproduced from the discrete content, with a control. Compute in code/measure/standard-model-charges.

import {
  STANDARD_MODEL_GENERATION,
  weinbergAngleAtUnification,
  hyperchargeTrace,
  generationFermionCount,
} from '@/code/measure/standard-model-charges'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/weinberg-angle-geometric',
  code: 'E-FRC-0055',
  title:
    'the weak mixing angle sin^2(theta_W) = 3/8 is pinned by the discrete charge content, and an altered charge breaks it',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const sinSquared = weinbergAngleAtUnification()
    const trY = hyperchargeTrace()
    const count = generationFermionCount()

    // control: one altered charge (the up quark's charge changed) must move the angle off 3/8
    const altered = STANDARD_MODEL_GENERATION.map((f, i) =>
      i === 0 ? { ...f, q: 0.5 } : f,
    )

    const sinSquaredAltered = weinbergAngleAtUnification(altered)

    const ok =
      Math.abs(sinSquared - 3 / 8) < 1e-12 &&
      Math.abs(trY) < 1e-12 &&
      count === 16 &&
      Math.abs(sinSquaredAltered - 3 / 8) > 0.01

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete one-generation charge content gives sin^2(theta_W) = 3/8 exactly and a vanishing hypercharge trace at the unification scale, and altering a single charge breaks 3/8, so the value is pinned by the content not fitted',
      metrics: {
        sinSquaredWeinberg: sinSquared,
        hyperchargeTrace: trY,
        fermionCount: count,
      },
      control: { sinSquaredAlteredContent: sinSquaredAltered },
      notes:
        'L1 known GUT relation reproduced from the discrete content. 3/8 is the unification-scale value, the low-energy 0.231 follows by RG running which is not done here. Scope note: 3/8 requires only the 15 fermions of SU(5), since the right-handed neutrino contributes nothing to either trace (zero electric charge and zero weak isospin, verified by the audit), so the 16-spinor framing is decorative for this computation.',
    })
  },
})
