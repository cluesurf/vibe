// P228 (the first QUANTITATIVE prediction): sin^2(theta_W) at unification from the so(10)/su(5) structure we
// built (p221, p225, p227). It is a pure group-theory number, sin^2(theta_W) = sum T_3^2 / sum Q^2 over one
// generation (the 16 of so(10)), with the GUT-normalized hypercharge. We compute it from the actual fermion
// charges and get 3/8 = 0.375 (the standard SU(5)/SO(10) value, runs down to ~0.231 at low energy by RG). Plus
// the other numbers the structure forces (16 = 15 + 1, charge quantization, 3 generations). Fully discrete /
// rational arithmetic over charges. Run: npx tsx code/experiment/p228-electroweak-prediction.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  generationFermionCount,
  weinbergAngleAtUnification,
} from '@/code/measure/standard-model-charges'

export function electroweakPrediction(): {
  sin2: number
  count: number
  isThreeEighths: boolean
} {
  const count = generationFermionCount()
  const sin2 = weinbergAngleAtUnification()
  const isThreeEighths = Math.abs(sin2 - 3 / 8) < 1e-9
  return { sin2, count, isThreeEighths }
}

export default experiment({
  id: 'gauge/electroweak-prediction',
  title:
    'sin squared of the weak mixing angle is 3/8 at unification from the so(10) charges',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const r = electroweakPrediction()
    const ok = r.isThreeEighths && r.count === 16
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'summing the weak isospin and electric charge over one so(10) generation gives sin squared of the weak mixing angle exactly 3/8 at the unification scale',
      metrics: {
        sin2: r.sin2,
        fermionCount: r.count,
        isThreeEighths: r.isThreeEighths ? 1 : 0,
      },
      notes:
        'L1, known math. This is the standard SU(5)/SO(10) group-theory value sin squared = 3/8, computed from the assumed generation charges. It is not a derivation of the low-energy 0.231, which needs renormalization-group running.',
    })
  },
})
