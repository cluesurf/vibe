// E-SPN-0219's stage-2 part runner: one K read of one of the clock's three points, exactly as E-MTR-0031, E-MTR-0032 and
// E-SPN-0217 made theirs (ball ceil(4.5 a_B), contact well removed, the K = 0 hydrogenic start unfolded onto the C4v
// sector along the axis), only longer: its autocorrelation over n lags, saved as spn219-<point>-K<K>.json.
// usage: spn219-part.ts <point> <K> <n> <threads> [probe|smoke]
//   point   m0284a12, m0380a10 or m0427a7.5
//   probe   a 30-lag read first, so the log shows the rate within minutes
//   smoke   30 lags only, compared with the first 31 lags of the point's saved 4,400-lag K read (the same path must give
//           the same numbers), written to tmp/spn219-smoke/
// refuses to overwrite a saved part
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { softenContact } from '@/code/measure/contact-core'
import { boostCorrelation } from '@/code/measure/pair-boost'
import { radiusOf, setupFor, type TrackPoint } from '@/code/measure/register-track'

const RECORD = `${import.meta.dirname}/../..`
const POINTS: Record<string, { unit: readonly [number, number]; aB: number; saved: (K: number) => string }> = {
  m0284a12: { unit: [-7, 2], aB: 12, saved: K => `${RECORD}/E-MTR-0031/mtr-light-K${K}.json` },
  m0380a10: { unit: [-2, 5], aB: 10, saved: K => `${RECORD}/E-MTR-0032/mtr-fade-m0380a10-K${K}.json` },
  'm0427a7.5': { unit: [-5, 1], aB: 7.5, saved: K => `${RECORD}/E-SPN-0217/clock-c7.5-K${K}.json` },
}

const [name, KText, nText, threadText, mode] = process.argv.slice(2) as string[]
const point = POINTS[name!]

if (!point) {
  console.log(`unknown point ${name}`)
  process.exit(2)
}

const K = Number(KText)
const smoke = mode === 'smoke'
const n = smoke ? 30 : Number(nText)
const threads = Number(threadText ?? 1)
const OUT = smoke ? `${import.meta.dirname}/../../../../tmp/spn219-smoke` : `${import.meta.dirname}/..`
const out = `${OUT}/spn219-${name}-K${K}.json`
const stamp = (): string => new Date().toISOString()

mkdirSync(OUT, { recursive: true })
if (existsSync(out)) {
  console.log(`refusing to overwrite ${out}`)
  process.exit(3)
}

const su = setupFor(point.unit)
const p: TrackPoint = { name: name!, aB: point.aB, R: radiusOf(point.aB), N: 8192, motion: true }
const opts = { backend: 'native' as const, threads }

console.log(`${stamp()} spn219 ${name} K ${K}: a_B ${point.aB} ball ${p.R}, ${n} lags, ${threads} threads${smoke ? ' SMOKE' : ''}`)

if (mode === 'probe') {
  const probe = boostCorrelation(su, p, K, 30, opts, softenContact)

  console.log(`${stamp()} ${name} K ${K}: 31 lags in ${probe.seconds} s with setup`)
}

const r = boostCorrelation(su, p, K, n, opts, softenContact)

writeFileSync(out, JSON.stringify({ point: name, K, n, aB: point.aB, unit: point.unit, re: r.re, im: r.im, seconds: r.seconds }))
console.log(`${stamp()} ${name} K ${K}: ${n} lags in ${r.seconds} s, saved ${out}`)

if (smoke) {
  const saved = JSON.parse(readFileSync(point.saved(K), 'utf8'))
  let off = 0

  for (let l = 0; l < r.re.length; l++) off = Math.max(off, Math.abs(r.re[l]! - saved.re[l]), Math.abs(r.im[l]! - saved.im[l]))
  console.log(`smoke: largest difference from the saved read over ${r.re.length} lags ${off.toExponential(2)} (${off <= 1e-12 ? 'same path' : 'DIFFERENT'})`)
  process.exit(off <= 1e-12 ? 0 : 1)
}

process.exit(0)
