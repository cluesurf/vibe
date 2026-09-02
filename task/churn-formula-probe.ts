// The churn-rate mass formula: composite velocity =? occupancy-weighted mean cone
// velocity. Single seed, dirs 4 and 8 (and 0 as control), side 17, one schedule period:
// per beat, the difference field's slot-occupancy distribution p_d(t); prediction
// v_pred = |mean over beats of sum_d p_d(t) root(d)| / sqrt2. Compare with measured
// centroid drift over the same window. Incremental.
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

for (const dir of [0, 4, 8]) {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  seeded.data[center * 24 + dir] = 1
  const meanV = [0, 0, 0, 0]
  let usedBeats = 0
  let finalCentroid = [0, 0, 0, 0]
  const T = 10 // window-safe at side 17 (reach ~ 10 * 1.41 = 14 hmm > 8.5) -> use 6? keep 6
  const beats = 6
  for (let t = 0; t < beats; t++) {
    vacuum = beat(vacuum, rule(t))
    seeded = beat(seeded, rule(t))
    const occupancy = new Array<number>(24).fill(0)
    let total = 0
    const cells = new Set<number>()
    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        occupancy[i % 24]!++
        total++
        cells.add(Math.floor(i / 24))
      }
    }
    for (let d = 0; d < 24; d++) {
      const p = occupancy[d]! / (total || 1)
      for (let a = 0; a < 4; a++) meanV[a]! += p * roots[d]![a]!
    }
    usedBeats++
    if (t === beats - 1) {
      const sum = [0, 0, 0, 0]
      for (const c of cells)
        for (let a = 0; a < 4; a++) sum[a]! += wrap(coord(c, a) - mid)
      const n = cells.size || 1
      finalCentroid = sum.map(v => v / n)
    }
  }
  const vPred = Math.hypot(...meanV.map(v => v / usedBeats)) / Math.SQRT2
  const vMeas = Math.hypot(...finalCentroid) / beats / Math.SQRT2
  console.log(`dir ${dir}: v_pred/c=${vPred.toFixed(3)} v_measured/c=${vMeas.toFixed(3)} ratio=${(vMeas / (vPred || 1)).toFixed(3)}`)
}
