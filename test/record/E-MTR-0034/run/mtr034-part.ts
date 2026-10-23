// E-MTR-0034's part runner: the light pair at m 0.284 (ringUnit(-7, 2)), a_B 16 (ball 72), contact well removed, as
// E-MTR-0031 read it at a_B 12: the K = 0 identity read (O_h, N 8192, its tracked line the witness's reference) and the
// K reads 0.35, 0.5, 1.0 (C4v along the axis, the K = 0 hydrogenic start unfolded, 4,400 lags), one JSON each,
// written as it lands.
// usage: mtr034-part.ts <zero|K|all> <threads> [probe|smoke]
//   all     zero, then K 1, 0.5, 0.35 in turn
//   probe   a 30-lag read before the first K read, so the log shows the rate within minutes
//   smoke   the same path at a_B 2.5 (ball 12), N 64 and 40 lags, written to tmp/mtr034-smoke/ (a test of the path only)
// refuses to overwrite a saved part
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { softenContact } from '@/code/measure/contact-core'
import { boostCorrelation } from '@/code/measure/pair-boost'
import { radiusOf, readZero, setupFor, type TrackPoint } from '@/code/measure/register-track'

const [what, threadText, mode] = process.argv.slice(2) as string[]
const smoke = mode === 'smoke'
const UNIT = [-7, 2] as const
const A_B = smoke ? 2.5 : 16
const N = smoke ? 64 : 8192
const LAGS = smoke ? 40 : 4400
const MOMENTA = [1, 0.5, 0.35]
const OUT = smoke ? `${import.meta.dirname}/../../../../tmp/mtr034-smoke` : `${import.meta.dirname}/..`
const threads = Number(threadText ?? 1)
const opts = { backend: 'native' as const, threads }
const p: TrackPoint = { name: `m0284a${A_B}`, aB: A_B, R: radiusOf(A_B), N, motion: true }
const stamp = (): string => new Date().toISOString()

mkdirSync(OUT, { recursive: true })

const su = setupFor(UNIT)

console.log(`${stamp()} mtr034 ${what} a_B ${A_B} ball ${p.R} m ${su.m} threads ${threads}${smoke ? ' SMOKE' : ''}`)

function zero(): void {
  const out = `${OUT}/mtr034-zero.json`

  if (existsSync(out)) {
    console.log(`refusing to overwrite ${out}`)
    return
  }

  const z = readZero(su, p, opts, w => console.log(`${stamp()} ${w}`), 1, softenContact)

  writeFileSync(out, JSON.stringify({ aB: A_B, unit: UNIT, R: p.R, N, reps: z.reps, tracked: z.tracked, lines: z.lines, x: z.x, seconds: z.seconds }))
  console.log(`${stamp()} zero: ${z.reps} representatives, ${z.x.re.length} lags, tracked ${z.tracked.E} in ${z.seconds} s, saved ${out}`)
}

// with `probe`, the first K read is preceded by a 30-lag read, so the log shows the rate within minutes
let probed = mode !== 'probe'

function moving(K: number): void {
  const out = `${OUT}/mtr034-K${K}.json`

  if (existsSync(out)) {
    console.log(`refusing to overwrite ${out}`)
    return
  }

  if (!probed) {
    const probe = boostCorrelation(su, p, K, 30, opts, softenContact)

    probed = true
    console.log(`${stamp()} K ${K}: 31 lags in ${probe.seconds} s with setup`)
  }

  console.log(`${stamp()} K ${K}: starting ${LAGS} lags`)

  const r = boostCorrelation(su, p, K, LAGS, opts, softenContact)

  writeFileSync(out, JSON.stringify({ K, n: LAGS, aB: A_B, unit: UNIT, re: r.re, im: r.im, seconds: r.seconds }))
  console.log(`${stamp()} K ${K}: ${LAGS} lags in ${r.seconds} s, saved ${out}`)
}

if (what === 'zero') zero()
else if (what === 'all') {
  zero()
  for (const K of MOMENTA) moving(K)
} else moving(Number(what))

console.log(`${stamp()} mtr034 ${what} done`)
process.exit(0)
