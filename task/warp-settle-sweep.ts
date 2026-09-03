// Full settling sweep: all 24 species in the growth-warp gradient, settling position
// averaged over the last three readouts, printed incrementally.
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

for (let dir = 0; dir < 24; dir++) {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const samples: number[] = []
  for (let t = 0; t < 40; t++) {
    const active = (c: number): boolean => coord(c, 0) <= t
    if (t === 20) {
      const slot = (mid + mid * side + mid * side * side + mid * side ** 3) * 24 + dir
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t >= 32) {
      let sx = 0, n = 0
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) {
          sx += wrap(coord(Math.floor(i / 24), 0) - mid)
          n++
        }
      }
      if (n > 0) samples.push(sx / n)
    }
  }
  const settle = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : NaN
  const spread = samples.length ? Math.max(...samples) - Math.min(...samples) : NaN
  console.log(`dir ${String(dir).padStart(2)}: settle=${settle.toFixed(2)} spread=${spread.toFixed(2)} samples=${samples.length}`)
}
