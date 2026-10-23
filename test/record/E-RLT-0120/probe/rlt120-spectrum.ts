// probe for E-RLT-0120 (scratch, not a record): the K = 0 axis correlation at the chosen size, its lines and the
// broadened spectrum's peaks near the level, to place the level group's search range before any K read. Args: aB R lags
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { pairCorrelation, pairLevel } from '@/code/measure/pair-direction'
import { radiusOf, setup } from '@/code/measure/register-track'
import { groupOverSettings, spectralPeaks } from '@/code/measure/level-group'
import { heaviestLine, lineSolve } from '@/code/measure/line-mobility'

const aB = Number(process.argv[2] ?? 4.5)
const R = Number(process.argv[3] ?? radiusOf(aB))
const lags = Number(process.argv[4] ?? 4096)
const opts = { backend: 'native' as const, threads: 4 }
const su = setup()
const save = `${import.meta.dirname}/rlt120-spectrum-${aB}.json`

let EL: number
let x: { re: number[]; im: number[] }

if (existsSync(save)) {
  const s = JSON.parse(readFileSync(save, 'utf8'))

  EL = s.EL
  x = s.x
} else {
  const level = pairLevel({ su, aB, R, opts })

  EL = level.EL
  console.log(`level ${EL} residual ${level.residual}`)
  x = pairCorrelation({ su, level, direction: [1, 0, 0], kappa: 0.1, k: 0, length: lags, opts })
  writeFileSync(save, JSON.stringify({ EL, x: { re: x.re, im: x.im } }))
}

console.log(`EL ${EL}, ${x.re.length} lags`)

const lines = lineSolve({ x, lo: EL - 0.02, hi: EL + 0.06, basis: 120, S: Math.floor(x.re.length / 2) })

console.log('lines (E - EL : weight) with weight >= 1e-3:')
for (const l of lines.filter(l => l.weight >= 1e-3).sort((a, b) => a.E - b.E)) {
  console.log(`  ${(l.E - EL).toExponential(4)} : ${l.weight.toFixed(4)} |z| ${l.modulus}`)
}
console.log(`heaviest ${(heaviestLine(lines)!.E - EL).toExponential(4)}`)

for (const sigma of [0.002, 0.003]) {
  const peaks = spectralPeaks({ x, lo: EL - 0.03, hi: EL + 0.08, sigma, least: 0.002 })

  console.log(`sigma ${sigma} peaks: ${peaks.map(p => `${(p.E - EL).toExponential(3)}:${p.weight.toFixed(4)}`).join(' ')}`)
}

const g = groupOverSettings({
  x,
  lo: EL - 0.03,
  hi: EL + 0.08,
  settings: [
    { sigma: 0.002, edge: 0.5 },
    { sigma: 0.002, edge: 0.4 },
  ],
  least: 0.1,
  next: 0.03,
  below: 0.02,
  above: 0.01,
})

console.log(`group: ${g.reads.map(r => (r ? `c-EL ${(r.centroid - EL).toExponential(4)} w ${r.weight.toFixed(4)} width ${r.width.toExponential(2)} [${(r.lo - EL).toExponential(2)}, ${(r.hi - EL).toExponential(2)}] gap ${r.gap}` : 'none')).join('; ')}, half ${g.half}`)
