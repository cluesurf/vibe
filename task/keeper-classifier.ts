// The full keeper-leaver classification: all 24 species, does the settled field hold the
// seed cell? Incremental printing.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 15
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const mid = 7
const seedCell = mid + mid * side + mid * side * side + mid * side ** 3

for (let dir = 0; dir < 24; dir++) {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const acc = new Set<number>()
  for (let t = 0; t < 34; t++) {
    const active = (c: number): boolean => coord(c, 0) <= t
    if (t === 20) {
      const slot = seedCell * 24 + dir
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t >= 28) {
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) acc.add(Math.floor(i / 24))
      }
    }
  }
  console.log(`dir ${String(dir).padStart(2)}: ${acc.has(seedCell) ? 'KEEPER' : 'leaver'} support=${acc.size}`)
}
