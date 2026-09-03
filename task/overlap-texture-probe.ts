// The overlap observable for the hierarchy: seed a species PAIR at the same cell under
// the frozen warp, evolve, and measure the spatial OVERLAP of their two difference fields
// (shared cells / geometric-mean support). If overlaps span orders across species pairs,
// the Yukawa-as-overlap hierarchy mechanism is present where the centroid missed it.
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

// settled difference field (set of cells) of one species seeded at center at t=20
const fieldOf = (dir: number): Set<number> => {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const acc = new Map<number, number>()
  for (let t = 0; t < 34; t++) {
    const active = (c: number): boolean => coord(c, 0) <= t
    if (t === 20) {
      const slot = (mid + mid * side + mid * side * side + mid * side ** 3) * 24 + dir
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t >= 28) {
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) acc.set(Math.floor(i / 24), (acc.get(Math.floor(i / 24)) ?? 0) + 1)
      }
    }
  }
  return new Set(acc.keys())
}

const species = [0, 4, 8, 18, 23, 12, 9]
const fields = new Map(species.map(d => [d, fieldOf(d)]))
console.log('supports:', species.map(d => `d${d}:${fields.get(d)!.size}`).join(' '))
console.log('\npairwise overlap (shared cells / sqrt(|A||B|)):')
for (let i = 0; i < species.length; i++) for (let j = i; j < species.length; j++) {
  const A = fields.get(species[i]!)!, B = fields.get(species[j]!)!
  let shared = 0
  for (const c of A) if (B.has(c)) shared++
  const ov = shared / Math.sqrt(A.size * B.size || 1)
  console.log(`  d${species[i]}-d${species[j]}: shared=${shared} overlap=${ov.toFixed(3)}`)
}
