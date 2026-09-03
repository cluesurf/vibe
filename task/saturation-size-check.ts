// The full-period keeping patterns: six conjugate line pairs, all 24 birth beats.
// Pre-registered predictions: (1) conjugate duty equality, (2) the CPT mirror relation
// pattern(opposite d) = pattern(d) read at mirrored birth beats about the schedule
// palindrome center. Side 13, union window seedBeat+8..+13. Incremental per direction.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 17
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const mid = 8
const seedCell = mid + mid * side + mid * side * side + mid * side ** 3

const classify = (dir: number, seedBeat: number): 'K' | 'l' => {
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

for (const dir of [21, 22]) {
  let pattern = ''
  for (let b = 20; b < 44; b++) pattern += classify(dir, b)
  const duty = pattern.split('').filter(c => c === 'K').length
  console.log(`dir ${String(dir).padStart(2)}: ${pattern} duty=${duty}/24`)
}
