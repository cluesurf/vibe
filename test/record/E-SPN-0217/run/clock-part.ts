// E-SPN-0217's part runner: one K read of the m 0.427 a_B 7.5 pair (contact well removed), the K = 0 hydrogenic start
// unfolded onto the K sector along the axis, its autocorrelation over n lags, saved beside the records
// usage: clock-part.ts <K> <n> <threads>   (refuses to overwrite a saved read)
import { existsSync, writeFileSync } from 'node:fs'
import { softenContact } from '@/code/measure/contact-core'
import { boostCorrelation } from '@/code/measure/pair-boost'
import { setupFor } from '@/code/measure/register-track'
import { NEW_POINT, newPointPlan } from '@/test/experiment/spin/register-pair-clock-continuum'

const K = Number(process.argv[2])
const n = Number(process.argv[3])
const threads = Number(process.argv[4] ?? 2)
const out = `${import.meta.dirname}/../clock-c7.5-K${K}.json`

if (existsSync(out)) {
  console.log(`refusing to overwrite ${out}`)
  process.exit(3)
}

const su = setupFor(NEW_POINT.unit)
const p = newPointPlan()
const opts = { backend: 'native' as const, threads }
const probe = boostCorrelation(su, p, K, 30, opts, softenContact)

console.log(`K ${K}: 31 lags in ${probe.seconds} s (with setup); starting ${n} lags at ${new Date().toISOString()}`)

const r = boostCorrelation(su, p, K, n, opts, softenContact)

writeFileSync(out, JSON.stringify({ K, n, aB: NEW_POINT.aB, unit: NEW_POINT.unit, re: r.re, im: r.im, seconds: r.seconds }))
console.log(`K ${K}: ${n} lags in ${r.seconds} s, saved ${out} at ${new Date().toISOString()}`)
process.exit(0)
