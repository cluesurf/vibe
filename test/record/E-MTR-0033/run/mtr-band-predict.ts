// E-MTR-0033's prediction, from the members' exact band and the recorded K = 0 grounds alone (no K read is opened):
// rho_imp at each point, its density sensitivity, and the members' limit M
// usage: mtr-band-predict.ts
import { memberLimit, POINTS, predictImpulse } from '@/test/experiment/matter/light-pair-band-decomposition'
import { memberQuarticFraction } from '@/code/measure/pair-boost'
import { setupFor } from '@/code/measure/register-track'

const impulses = POINTS.map(p => predictImpulse(p))

POINTS.forEach((p, i) => {
  const im = impulses[i]!
  const su = setupFor(p.unit)
  const Ks = p.reads.map(r => r.K)
  const member = Ks.reduce((s, K) => s + memberQuarticFraction(su, K), 0) / Ks.length

  console.log(
    `${p.name}: m ${su.m} a_B ${p.aB} E0ref ${p.E0ref} binding radius ${im.radius}: rho_imp ${im.rhoImp} (density at a_B: ${im.rhoImpAB}, sigma_imp ${im.sigmaImp}), a_imp ${im.aImp} (R_imp ${0.5 / (2 * im.aImp * p.E0ref)}), member rho ${member}; bands ${im.bands.map(b => `K ${b.K}: ${b.E}`).join(', ')}`,
  )
})

const lim = memberLimit(impulses[0]!.radius)

console.log(`members' limit at P1's K / m: member ${lim.members.join(', ')}; carried band ${lim.impulses.join(', ')}; M ${lim.M}`)
process.exit(0)
