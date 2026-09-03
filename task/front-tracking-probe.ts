// Core-cloud decomposition: per beat, the front position (max projection along the drift
// direction), the content within Chebyshev radius 2 of the front (the core), its
// occupancy-mean cone velocity, and the cloud remainder. Species dirs 4 and 8, side 17,
// 6 window-safe beats. Incremental printing.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 25
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const wrap = (d: number): number => (d > side / 2 ? d - side : d < -side / 2 ? d + side : d)
const mid = 12
const center = mid + mid * side + mid * side * side + mid * side ** 3
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - mid)))
}

for (const dir of [4, 8]) {
  const axis = roots[dir]!.map(v => v / Math.SQRT2) // unit drift direction
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  seeded.data[center * 24 + dir] = 1
  console.log(`dir ${dir} (axis ${roots[dir]!.join(',')}):`)
  let prevFront = 0
  for (let t = 0; t < 9; t++) {
    vacuum = beat(vacuum, rule(t))
    seeded = beat(seeded, rule(t))
    type Slot = { cell: number; d: number }
    const slots: Slot[] = []
    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) slots.push({ cell: Math.floor(i / 24), d: i % 24 })
    }
    // projection of each cell along the drift axis
    const proj = (cell: number): number => {
      let p = 0
      for (let a = 0; a < 4; a++) p += wrap(coord(cell, a) - mid) * axis[a]!
      return p
    }
    let front = -99
    for (const s of slots) front = Math.max(front, proj(s.cell))
    // core = slots within projection >= front - 1.5
    const core = slots.filter(s => proj(s.cell) >= front - 1.5)
    const cloud = slots.length - core.length
    // core occupancy-mean velocity along axis
    let vCore = 0
    for (const s of core) {
      let va = 0
      for (let a = 0; a < 4; a++) va += roots[s.d]![a]! * axis[a]!
      vCore += va
    }
    vCore = vCore / (core.length || 1) / Math.SQRT2
    const frontSpeed = t === 0 ? front / 1 : front - prevFront
    prevFront = front
    console.log(`  t=${t + 1}: front=${front.toFixed(2)} dFront=${frontSpeed.toFixed(2)} core=${core.length} cloud=${cloud} vCoreOcc=${vCore.toFixed(3)}`)
  }
}
