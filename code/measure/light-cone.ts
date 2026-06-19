import { cubicMesh, Mesh, shellDistances } from '@/code/tool/mesh'
import { makeWill, cloneWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { passThrough, pairCollision } from '@/code/rule/collision'

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
export function lightConeRadii(input: {
  side: number
  beats: number
}): number[] {
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

// The perturbation light cone on ANY mesh, the measured causal structure of the
// interacting rule. Start from the deterministic vacuum (the create move makes it
// dynamic on its own, no random fill), perturb one cell, run the directional rule
// (the 9-state collide) on both the base and the perturbed state, and after each
// beat measure how far the difference (the causal influence of the perturbation)
// has spread, as the graph distance of the farthest differing cell. A local rule
// gives a finite cone, radius <= beat count (causal). A ballistic rule reaches
// radius == beat count (z = 1), a diffusive one falls short (radius ~ sqrt of the
// beat count). The result is read out of the dynamics, not assumed.
export function perturbationConeRadii(input: {
  mesh: Mesh
  beats: number
}): number[] {
  const { mesh, beats } = input
  const degree = mesh.degree
  const centre = mesh.cellCount >> 1
  const distance = shellDistances(mesh, centre)
  const opposite = Array.from({ length: degree }, (_, direction) =>
    mesh.opposite(direction),
  )
  const collision = pairCollision({ opposite })

  // The deterministic vacuum, all slots zero.
  const base = makeWill(mesh)
  const perturbed = cloneWill(base)
  // Perturb the centre cell: set all its slots to +1, a clear local change.
  const centreBase = centre * degree
  for (let direction = 0; direction < degree; direction++) {
    perturbed.data[centreBase + direction] = 1
  }

  const radii: number[] = []
  let baseState = base
  let perturbedState = perturbed
  for (let step = 0; step < beats; step++) {
    baseState = beat(baseState, collision)
    perturbedState = beat(perturbedState, collision)
    let maximum = 0
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const cellBase = cell * degree
      let differs = false
      for (let direction = 0; direction < degree; direction++) {
        if (
          baseState.data[cellBase + direction] !==
          perturbedState.data[cellBase + direction]
        ) {
          differs = true
          break
        }
      }
      if (differs && (distance[cell] ?? 0) > maximum) {
        maximum = distance[cell] ?? 0
      }
    }
    radii.push(maximum)
  }
  return radii
}
