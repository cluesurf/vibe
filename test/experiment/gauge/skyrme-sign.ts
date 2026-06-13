// P205 (Tier 1 gate): the Skyrme-sign / Derrick measurement on a REAL 3D direction field. Build a localized
// texture of size R, measure exchange energy E_ex(R) and Skyrme energy E_sk(R) directly, and confirm the
// Derrick scaling, in 3D E_ex grows ~ R and E_sk falls ~ 1/R, so E_ex + kappa*E_sk has a stable MINIMUM for
// kappa > 0 and none for kappa <= 0. This measures the stabilization mechanism on a real field (the open
// question is only whether the rule supplies kappa > 0, argued via the fermion in p192 / does-the-rule-...).
// Run: npx tsx code/experiment/p205-skyrme-sign.ts

import { logLogSlope } from '@/code/measure/regression'
import { directionFieldEnergy3d, hedgehogTexture3d } from '@/code/measure/skyrme-energy'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function skyrmeSign(): { exExp: number; skExp: number; stableForPositiveKappa: boolean } {
  const M = 40
  const Rs = [5, 7, 10, 14]
  const data = Rs.map((R) => {
    const { exchange, skyrme } = directionFieldEnergy3d(hedgehogTexture3d({ size: M, radius: R }))
    return { R, ex: exchange, sk: skyrme }
  })
  // fit log E vs log R for the exponents
  const fit = (key: 'ex' | 'sk'): number => logLogSlope(data.map((d) => d.R), data.map((d) => d[key]))
  const exExp = Math.round(fit('ex') * 100) / 100, skExp = Math.round(fit('sk') * 100) / 100
  // E(R) = a R^exExp + kappa b R^skExp. With exExp>0 and skExp<0, kappa>0 gives a minimum, kappa<=0 does not.
  const stableForPositiveKappa = exExp > 0.3 && skExp < -0.3
  return { exExp, skExp, stableForPositiveKappa }
}

export default defineExperiment({
  id: 'gauge/skyrme-sign',
  title: 'on a real 3D texture the exchange energy grows with size and the Skyrme energy falls, the Derrick scaling',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = skyrmeSign()
    const ok = r.stableForPositiveKappa
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'measured on a real 3D direction field, the exchange energy scales up with soliton size and the Skyrme energy scales down, the opposite scaling that gives a stable minimum only for a positive Skyrme coefficient',
      metrics: {
        exchangeExponent: r.exExp,
        skyrmeExponent: r.skExp,
        stableForPositiveKappa: r.stableForPositiveKappa ? 1 : 0,
      },
      notes:
        'L2, known physics, the Derrick scaling argument confirmed on a real field. The measured exponents are the content, and the opposing signs are the meaningful contrast. This confirms the scaling only. The actual sign of the Skyrme coefficient kappa is argued from the fermion the self carries, not measured here, so it stays open.',
    })
  },
})
