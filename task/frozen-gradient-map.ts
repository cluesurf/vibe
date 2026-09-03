// Settle versus seed position: dir 18 and dir 23 at every x0, frozen-gradient background.
// Reveals whether localization is a smooth well or a commensurability resonance structure.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 17
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const wrap = (d: number): number => (d > side / 2 ? d - side : d < -side / 2 ? d + side : d)
const mid = 8

const run = (dir: number, x0: number): { settle: number; spread: number } => {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const samples: number[] = []
  for (let t = 0; t < 40; t++) {
    const active = (c: number): boolean => coord(c, 0) <= t
    if (t === 24) {
      const slot = (x0 + mid * side + mid * side * side + mid * side ** 3) * 24 + dir
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t >= 32) {
      let sx = 0, n = 0
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) { sx += wrap(coord(Math.floor(i / 24), 0) - x0); n++ }
      }
      if (n > 0) samples.push(sx / n)
    }
  }
  const settle = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : NaN
  const spread = samples.length ? Math.max(...samples) - Math.min(...samples) : NaN
  return { settle, spread }
}

for (const dir of [18, 23]) {
  const row: string[] = []
  for (let x0 = 0; x0 < side; x0++) {
    const r = run(dir, x0)
    row.push(`x${x0}:${r.settle.toFixed(1)}${r.spread < 1 ? 'L' : ''}`)
  }
  console.log(`dir ${dir}: ${row.join(' ')}`)
}
