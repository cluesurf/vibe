// Option E probe: coarse-graining survival depth per species. Evolve each species 12
// beats (all-active), take the per-cell difference indicator, then iteratively replace
// each cell's value by the mean over itself and its 24 neighbours; survival depth = the
// number of rounds until the field's max falls below half its initial max. Incremental.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 17
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })

for (let dir = 0; dir < 24; dir++) {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const mid = 8
  const center = mid + mid * side + mid * side * side + mid * side ** 3
  seeded.data[center * 24 + dir] = 1
  for (let t = 0; t < 12; t++) {
    vacuum = beat(vacuum, rule(t))
    seeded = beat(seeded, rule(t))
  }
  let field = new Float64Array(mesh.cellCount)
  for (let i = 0; i < seeded.data.length; i++) {
    if (seeded.data[i] !== vacuum.data[i]) field[Math.floor(i / 24)]!++
  }
  const initialMax = Math.max(...field)
  if (initialMax === 0) { console.log(`dir ${String(dir).padStart(2)}: empty`); continue }
  let rounds = 0
  while (rounds < 40) {
    const next = new Float64Array(mesh.cellCount)
    for (let c = 0; c < mesh.cellCount; c++) {
      let s = field[c]!
      for (let d = 0; d < 24; d++) s += field[mesh.neighbour(c, d)]!
      next[c] = s / 25
    }
    field = next
    rounds++
    if (Math.max(...field) < initialMax / 2) break
  }
  console.log(`dir ${String(dir).padStart(2)}: initialMax=${initialMax} survival=${rounds}`)
}
