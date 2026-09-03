// Coherence re-check under the committed turning weave: bare protected species, two
// spatially separated branches, a kick inserted in ONE branch, measure whether the joint
// clock amplitude shows phase-dependent interference (constructive when aligned,
// destructive when kicked). This is genuine single-particle two-path coherence, the thing
// "no coherence" would forbid. Incremental.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'
import { clockAmplitude, phaseDegrees } from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'

const side = 13
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const cellAt = (v: number[]): number => v[0]! + v[1]! * side + v[2]! * side * side + v[3]! * side ** 3
const mid = 6

// branch A: dir-0 protected traveller from one cell. branch B: dir-0 from another.
// kick branch B by a slab so it acquires 30 vs A's 150. Measure joint vs solo amplitudes.
const wall = new Set<number>()
for (let c = 0; c < mesh.cellCount; c++) if (coord(c, 0) === 4) wall.add(c)

const run = (seeds: { cell: number; dir: number }[], kickB: boolean) => {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const re: number[] = [], im: number[] = []
  for (let t = 0; t < 18; t++) {
    if (t === 3) for (const s of seeds) {
      const slot = s.cell * 24 + s.dir
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    const active = (c: number): boolean => (kickB && wall.has(c) ? t >= 7 : true)
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    const d = pairSub(clockAmplitude(seeded), clockAmplitude(vacuum))
    re.push(d[0]); im.push(d[1])
  }
  return { re, im }
}

const A = { cell: cellAt([8, 8, 2, 2]), dir: 0 }   // x-blind location, free
const B = { cell: cellAt([1, 0, mid, mid]), dir: 0 }  // crosses the kick slab
const solo = run([A], false)
const joint0 = run([A, B], false)   // both free: should add to ~2 root3 @150
const jointK = run([A, B], true)    // B kicked: A@150 + B@30 -> root3 @90
const r3 = Math.sqrt(3)
for (const t of [12, 14, 16]) {
  const m0 = Math.hypot(joint0.re[t]!, joint0.im[t]!)
  const mK = Math.hypot(jointK.re[t]!, jointK.im[t]!)
  console.log(`t=${t}: joint(aligned)=${m0.toFixed(3)}@${Math.round(phaseDegrees([joint0.re[t]!, joint0.im[t]!]))} joint(kicked)=${mK.toFixed(3)}@${Math.round(phaseDegrees([jointK.re[t]!, jointK.im[t]!]))} | 2root3=${(2*r3).toFixed(3)} root3=${r3.toFixed(3)}`)
}
