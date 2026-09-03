// THE EXACT INSTRUMENT: unwrapped telegraph tracking. Instead of position means (which
// produce lap-dip artifacts at every wrap), integrate the per-beat displacement of the
// bare core (each step is at most one light-step, so the delta is unambiguous), giving an
// unwrapped trajectory with NO wrap artifacts at any T. Then run T long on a SMALL mesh
// (the bare core is compact) until flip statistics converge: side 13, T = 480 (twenty
// schedule periods), all 24 directions, incremental printing.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 13
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const wrap = (d: number): number => (d > side / 2 ? d - side : d < -side / 2 ? d + side : d)
const mid = 6
const center = mid + mid * side + mid * side * side + mid * side ** 3
const roots: number[][] = []
for (let d = 0; d < 24; d++) {
  const to = mesh.neighbour(center, d)
  roots.push([0, 1, 2, 3].map(a => wrap(coord(to, a) - mid)))
}
const T = 480
const hbar = 3 / (2 * Math.PI)

for (let dir = 0; dir < 24; dir++) {
  const axis = roots[dir]!.map(v => v / Math.SQRT2)
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  seeded.data[center * 24 + dir] = 1
  let prevRaw: number[] | null = null
  const signs: number[] = []
  let lost = 0
  for (let t = 0; t < T; t++) {
    vacuum = beat(vacuum, rule(t % 24))
    seeded = beat(seeded, rule(t % 24))
    const cells: number[] = []
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      if (seeded.data[cell * 24 + dir] !== vacuum.data[cell * 24 + dir]) cells.push(cell)
    }
    if (cells.length === 0) { lost++; prevRaw = null; continue }
    const raw = [0, 1, 2, 3].map(a => {
      let s = 0
      for (const c of cells) s += coord(c, a)
      return s / cells.length
    })
    if (prevRaw) {
      // per-beat delta, wrap-corrected per coordinate (deltas are small)
      let step = 0
      for (let a = 0; a < 4; a++) step += wrap(raw[a]! - prevRaw[a]!) * axis[a]!
      signs.push(Math.sign(Math.round(step * 100) / 100))
    }
    prevRaw = raw
  }
  const nonzero = signs.filter(s => s !== 0).length
  let flips = 0, last = 0
  for (const s of signs) {
    if (s !== 0) { if (last !== 0 && s !== last) flips++; last = s }
  }
  const gamma = flips / (signs.length || 1)
  console.log(`dir ${String(dir).padStart(2)}: steps=${signs.length} lost=${lost} nonzero=${nonzero} flips=${flips} gamma=${gamma.toFixed(4)} m=${(hbar * gamma / 2).toFixed(4)}`)
}
