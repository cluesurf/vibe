import { cubicMesh } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { passThrough } from '@/code/rule/collision'

// The light cone: seed one charge in each of the six directions at the centre of
// the cubic cusp and let them stream with no interaction. A free charge advances
// exactly one cell per beat, so the front radius equals the beat count, a finite
// frame-independent maximum speed normalized to one (z = 1).

function frontRadius(will: Will, side: number): number {
  const degree = will.mesh.degree
  const area = side * side
  const centre = side >> 1
  let maximum = 0
  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const base = cell * degree
    let occupied = false
    for (let direction = 0; direction < degree; direction++) {
      if ((will.data[base + direction] ?? 0) !== 0) {
        occupied = true
        break
      }
    }
    if (!occupied) continue
    const x = cell % side
    const y = Math.floor(cell / side) % side
    const z = Math.floor(cell / area)
    const radius =
      Math.abs(x - centre) + Math.abs(y - centre) + Math.abs(z - centre)
    if (radius > maximum) maximum = radius
  }
  return maximum
}

// The front radius after each of `beats` beats. On the free cusp this is the
// sequence 1, 2, 3, ... (one cell per beat).
export function lightConeRadii(input: { side: number; beats: number }): number[] {
  const side = input.side
  const mesh = cubicMesh({ side })
  const will = makeWill(mesh)
  const centre = side >> 1
  const centreCell = (centre * side + centre) * side + centre
  const base = centreCell * mesh.degree
  for (let direction = 0; direction < mesh.degree; direction++) {
    will.data[base + direction] = 1
  }
  const radii: number[] = []
  let current = will
  for (let step = 0; step < input.beats; step++) {
    current = beat(current, passThrough)
    radii.push(frontRadius(current, side))
  }
  return radii
}
