// What decides keeping: the window-phase test. The four split lines' eight directions
// (8, 11, 13, 14, 16, 19, 21, 22) classified at seed beats 20, 21, 22 (same union-window
// instrument, window t >= seedBeat+8 for 6 beats). If keeper-ness flips with seed beat,
// keeping is birth-phase-relative. Two uniform-line controls (9, 10 both-keep; 5, 6
// both-leave). Incremental.
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

const classify = (dir: number, seedBeat: number): string => {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const acc = new Set<number>()
  const readStart = seedBeat + 8
  for (let t = 0; t < readStart + 6; t++) {
    const active = (c: number): boolean => coord(c, 0) <= t
    if (t === seedBeat) {
      const slot = seedCell * 24 + dir
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t >= readStart) {
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) acc.add(Math.floor(i / 24))
      }
    }
  }
  return acc.has(seedCell) ? 'K' : 'l'
}

for (const dir of [8, 11, 13, 14, 16, 19, 21, 22, 9, 10, 5, 6]) {
  const row = [20, 21, 22].map(b => classify(dir, b)).join('')
  console.log(`dir ${String(dir).padStart(2)}: beats 20/21/22 -> ${row}`)
}
