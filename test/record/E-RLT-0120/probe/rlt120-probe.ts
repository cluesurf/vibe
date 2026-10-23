// probe for E-RLT-0120 (scratch, not a record): at a candidate pair size, the K = 0 level, the sector sizes per
// direction and the cost of a lag, read at K = 0 only (no K read). Args: aB R lags threads
import { pairCorrelation, pairLevel } from '@/code/measure/pair-direction'
import { radiusOf, setup } from '@/code/measure/register-track'

const aB = Number(process.argv[2] ?? 4)
const R = Number(process.argv[3] ?? radiusOf(aB))
const lags = Number(process.argv[4] ?? 16)
const threads = Number(process.argv[5] ?? 3)
const opts = { backend: 'native' as const, threads }
const su = setup()
const Ec = 1 / (2 * su.mu * aB * aB)

console.log(`aB ${aB} R ${R} (radiusOf ${radiusOf(aB)}), mu ${su.mu}, M0 ${su.M0}, m ${su.m}, Ec ${Ec}, 2 M0 - Ec ${2 * su.M0 - Ec}`)

const t0 = Date.now()
const level = pairLevel({ su, aB, R, opts })

console.log(`level EL ${level.EL} residual ${level.residual} O_h reps ${level.s.count} (${(Date.now() - t0) / 1000} s)`)

for (const n of [[1, 0, 0], [1, 1, 0], [1, 1, 1], [2, 1, 0], [1, 2, 3]]) {
  const t = Date.now()
  const x = pairCorrelation({ su, level, direction: n, kappa: 0.1, k: 0, length: lags, opts })
  const s = (Date.now() - t) / 1000

  console.log(`${n} reps ${x.reps} ${lags} lags ${s} s (${(s / lags).toFixed(4)} s a lag); x1 ${x.re[1]} ${x.im[1]}`)
}
