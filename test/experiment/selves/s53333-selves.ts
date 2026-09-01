// S53333-SELVES ({5,3,3,3,3} suite): matter / solitons on the 4D horosphere. Verdicts, topological solitons DO
// exist in 4D (instantons, pi_3(S^3) = Z, and pi_4 textures), so "selves" form (POSITIVE), but they are 4D
// objects in a 4D physical space, OVER-dimensional. 4D does have spinors (Spin(4) = SU(2)xSU(2)), so statistics
// could be fermionic, but the COIN supplies no spinor (s53333-structure), and the dimension is wrong (4D not
// 3D). The form-tower is a generic slow-mode (NEUTRAL). Run: npx tsx code/experiment/s53333-selves.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s53333Selves(): {
  solitonsExist: boolean
  instantonCharge: number
  overDimensional: boolean
} {
  // 4D instanton topological charge, pi_3(S^3) = Z. A BPST-like profile on a 4D radial grid, winding = 1.
  // We verify the winding of the map S^3 -> S^3 for a hedgehog in 4D (the degree of the boundary 3-sphere map).
  // Discretize the radial profile, charge = (1/2pi^2) * integral of the winding density, here = 1 by construction.
  const samples = 200

  let charge = 0

  for (let i = 0; i < samples; i++) {
    const r = ((i + 0.5) / samples) * 6 // radius
    const f = Math.PI * (1 - 1 / (1 + r * r)) // chiral angle 0 -> pi (the instanton profile)
    const fNext =
      Math.PI * (1 - 1 / (1 + (((i + 1.5) / samples) * 6) ** 2))

    const df = fNext - f

    charge += (2 / Math.PI) * Math.sin(f) ** 2 * df // d/df of (f - sin f cos f)/pi integrated = winding density
  }

  const instantonCharge = Math.round(charge)
  const solitonsExist = Math.abs(instantonCharge) >= 1
  const overDimensional = true // physical space is 4D, one more than the observed 3D

  return { solitonsExist, instantonCharge, overDimensional }
}

export default experiment({
  id: 'selves/s53333-selves',
  code: 'E-SLF-0106',
  title:
    'topological solitons exist on the 4D horosphere but are over-dimensional',
  category: 'selves',
  substrates: ['53333'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s53333Selves()
    // AUDIT 2026-08-31: overDimensional = true is a typed statement (4D space versus the observed 3D), not a
    // measurement made here, so it is reported and no longer feeds ok.
    const ok = r.solitonsExist && r.instantonCharge === 1

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a 4D instanton on the horosphere carries topological charge one so solitons exist, but they live in a 4D physical space, one dimension too many versus the observed three',
      metrics: {
        instantonCharge: r.instantonCharge,
        solitonsExist: r.solitonsExist ? 1 : 0,
        overDimensional: r.overDimensional ? 1 : 0,
      },
      notes:
        'L1, known math. The instanton charge is the analytic pi_3(S^3) = Z winding of a hand-built BPST-like profile, not produced by the rule. The honest verdict is that selves form but are over-dimensional, and the coin supplies no fundamental spinor. The form-tower is a generic slow mode.',
    })
  },
})
