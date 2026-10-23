// probe for E-RLT-0120 (scratch, not a record): where the K = 0 start's spectral weight lies, to place a fixed level
// window with its edges in gaps. Reads a saved K = 0 axis correlation only. Args: json (a {EL, x} probe file, or an
// E-RLT-0119 part with zero.axis)
import { readFileSync } from 'node:fs'
import { broadenedSpectrum, groupMoments, spectralPeaks, taperReach } from '@/code/measure/level-group'
import { heaviestLine, lineSolve } from '@/code/measure/line-mobility'

const file = process.argv[2]!
const s = JSON.parse(readFileSync(file, 'utf8'))
const EL: number = s.EL
const x: { re: number[]; im: number[] } = s.x ?? s.zero.axis
const n = x.re.length

console.log(`${file}: EL ${EL}, ${n} points`)

for (const S of [n >= 8192 ? 4096 : 0, 2048].filter(v => v > 0)) {
  const lines = lineSolve({ x, lo: EL - 0.06, hi: EL + 0.06, basis: 120, S })

  console.log(`FD S ${S}: ${lines.filter(l => l.weight >= 1e-3).sort((a, b) => a.E - b.E).map(l => `${(l.E - EL).toExponential(3)}:${l.weight.toFixed(4)}`).join(' ')}; heaviest ${(heaviestLine(lines)!.E - EL).toExponential(3)}`)
}

for (const sigma of [0.001, 0.0015, 0.002, 0.003]) {
  if (taperReach(sigma) > n) continue

  const peaks = spectralPeaks({ x, lo: EL - 0.05, hi: EL + 0.05, sigma, least: 0.002 })
  const w = (lo: number, hi: number) => groupMoments({ x, lo: EL + lo, hi: EL + hi, sigma })
  const edges = [-0.03, -0.02, -0.015, -0.01, 0.01, 0.015, 0.02, 0.03].map(d => `${d}:${(broadenedSpectrum(x, EL + d, sigma) * sigma).toExponential(1)}`)

  console.log(`sigma ${sigma}: peaks ${peaks.map(p => `${(p.E - EL).toExponential(3)}:${p.weight.toFixed(4)}`).join(' ')}`)
  for (const [lo, hi] of [[-0.02, 0.02], [-0.015, 0.015], [-0.01, 0.01]] as const) {
    const g = w(lo, hi)

    console.log(`  window [${lo}, ${hi}]: weight ${g.weight.toFixed(6)} centroid - EL ${(g.centroid - EL).toExponential(4)} width ${g.width.toExponential(3)}`)
  }
  console.log(`  density x sigma at offsets ${edges.join(' ')}`)
}
