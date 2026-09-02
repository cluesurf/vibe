// The Kac telegraph mass: track the bare quantum (the seeded slot's difference content)
// per beat, record its step sign along the drift axis, count flips over a long window
// (the bare core stays compact so wrap only affects radiation, and per-beat deltas are
// unambiguous). Flip rate gamma -> m = hbar gamma / c^2 with hbar = 3/(2 pi).
// Species: dirs 4, 8 (and 0 control: gamma = 0). Incremental.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 17
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const wrap = (d: number): number => (d > side / 2 ? d - side : d < -side / 2 ? d + side : d)
const mid = 8
const center = mid + mid * side + mid * side * side + mid * side ** 3
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - mid)))
}
const T = 48

for (const dir of [0, 4, 8]) {
  const axis = roots[dir]!.map(v => v / Math.SQRT2)
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  seeded.data[center * 24 + dir] = 1
  let prevPos: number[] | null = null
  const signs: number[] = []
  let lost = 0
  for (let t = 0; t < T; t++) {
    vacuum = beat(vacuum, rule(t % 24))
    seeded = beat(seeded, rule(t % 24))
    // bare-core position: mean of cells whose SEEDED SLOT differs
    const cells: number[] = []
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      if (seeded.data[cell * 24 + dir] !== vacuum.data[cell * 24 + dir]) cells.push(cell)
    }
    if (cells.length === 0) { lost++; prevPos = null; continue }
    // position relative to previous, via wrap-aware mean delta
    const pos = [0, 1, 2, 3].map(a => {
      let s = 0
      for (const c of cells) s += wrap(coord(c, a) - mid)
      return s / cells.length
    })
    if (prevPos) {
      let step = 0
      for (let a = 0; a < 4; a++) step += (pos[a]! - prevPos[a]!) * axis[a]!
      signs.push(Math.sign(Math.round(step * 100) / 100))
    }
    prevPos = pos
  }
  let flips = 0
  for (let i = 1; i < signs.length; i++) if (signs[i] !== 0 && signs[i - 1] !== 0 && signs[i] !== signs[i - 1]) flips++
  const gamma = flips / signs.length
  const hbar = 3 / (2 * Math.PI)
  console.log(`dir ${dir}: steps=${signs.length} lost=${lost} signs=${signs.map(s => (s > 0 ? '+' : s < 0 ? '-' : '0')).join('')}`)
  console.log(`  flips=${flips} gamma=${gamma.toFixed(3)}/beat  m_Kac=hbar*gamma/c^2=${(hbar * gamma / 2).toFixed(4)} lattice units`)
}
