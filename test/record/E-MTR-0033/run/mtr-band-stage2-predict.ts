// E-MTR-0033's second stage, the prediction for m 0.427 a_B 7.5 before its K reads exist: each two-point form fitted on
// P1 and P3 (the first stage's reads) carried to the new point, and the members' band carried by its bound state
// usage: mtr-band-stage2-predict.ts
import { memberQuarticFraction } from '@/code/measure/pair-boost'
import { setupFor } from '@/code/measure/register-track'
import { POINTS, predictImpulse, readPoint, STAGE_TWO } from '@/test/experiment/matter/light-pair-band-decomposition'

const reads = POINTS.slice(0, 2).map(p => readPoint(p, predictImpulse(p))!)
const su = setupFor(STAGE_TWO.unit)
const Ks = STAGE_TWO.reads.map(r => r.K)
const member = Ks.reduce((s, K) => s + memberQuarticFraction(su, K), 0) / Ks.length
const imp = predictImpulse(STAGE_TWO)
const x = (m: number, aB: number) => ({ lattice: (Math.tan(m) / m - 1) / aB, coupling: 1 / (m * aB), mass2: m * m })
const at = x(su.m, STAGE_TWO.aB)
const line = (key: 'lattice' | 'coupling' | 'mass2', ys: number[]) => {
  const [p, q] = reads.map(r => x(r.m, r.aB)[key])
  const slope = (ys[1]! - ys[0]!) / (q! - p!)

  return ys[0]! + slope * (at[key] - p!)
}

console.log(`new point m ${su.m} a_B ${STAGE_TWO.aB}: lone member ${member}; carried band rho_imp ${imp.rhoImp} (radius ${imp.radius}, at a_B ${imp.rhoImpAB})`)
for (const key of ['lattice', 'coupling', 'mass2'] as const) {
  const delta = line(key, reads.map(r => r.delta))
  const lam = line(key, reads.map(r => r.lambda))

  console.log(`  form ${key}: Delta ${delta} -> rho ${member + delta}; lambda ${lam}`)
}
console.log(`  first-stage reads: ${reads.map(r => `${r.name} rho ${r.rho} delta ${r.delta} lambda ${r.lambda}`).join('; ')}`)
process.exit(0)
