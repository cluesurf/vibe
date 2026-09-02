// Window-safe port conversion: side 25, readout at t=12 (nine beats after seeding, max
// radiation reach ~12.7 against half-side 12.5, marginal but the trail is slow), with a
// NO-SLAB null: without the projective slab the phase dependence of the split should
// weaken or vanish, pinning the conversion on the port.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 25
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const cellAt = (v: number[]): number => v[0]! + v[1]! * side + v[2]! * side * side + v[3]! * side ** 3
const mid = 12

const run = (tone: number, preKick: boolean, withSlab: boolean) => {
  const mainSlab = new Set<number>()
  const preSlab = new Set<number>()
  for (let c = 0; c < mesh.cellCount; c++) {
    const x = coord(c, 0)
    if (x === 13) mainSlab.add(c)
    if (x === 9) preSlab.add(c)
  }
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  for (let t = 0; t < 13; t++) {
    if (t === 3) {
      const slot = cellAt([12, 4, mid, mid]) * 24 + 8
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + tone + 4) % 3) - 1) as -1 | 0 | 1
    }
    const active = (c: number): boolean => {
      if (withSlab && mainSlab.has(c)) return t >= 2
      if (preKick && preSlab.has(c)) return t >= 7
      return true
    }
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
  }
  let near = 0
  let far = 0
  for (let i = 0; i < seeded.data.length; i++) {
    if (seeded.data[i] !== vacuum.data[i]) {
      const x = coord(Math.floor(i / 24), 0)
      if (x >= 14 && x <= 20) far++
      else near++
    }
  }
  return { near, far, total: near + far }
}

for (const withSlab of [true, false]) {
  console.log(withSlab ? 'WITH projective slab (x=13, adjacent, offset 2):' : 'NO-SLAB null:')
  for (const [label, tone, preKick] of [['plus', 1, false], ['minus', -1, false], ['plus-prekicked', 1, true]] as const) {
    const r = run(tone, preKick, withSlab)
    console.log(`  ${label.padEnd(15)} near=${r.near} far=${r.far} total=${r.total} farFraction=${r.total ? (r.far / r.total).toFixed(3) : 'n/a'}`)
  }
}
