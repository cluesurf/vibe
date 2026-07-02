// Momentum continuity at coarse block scale, the transport-sector half of the
// discrete-to-continuum map. The charge half (measure/continuity) checks the
// scalar law. This checks the VECTOR law: for every coarse block and every
// momentum component, the change of block momentum over one beat must equal
// minus the net momentum flux carried across the block boundary by the stream.
// A collision that conserves momentum per cell closes this exactly (integer
// equality at every scale). A collision that creates momentum inside cells (the
// pair table's create move makes a (+1, -1) pair on one line, net momentum two
// roots) leaves a nonzero residual that the flux cannot account for, so the
// measure genuinely discriminates.

import type { Will } from '@/code/tone/will'
import { cloneWill } from '@/code/tone/will'
import { collide, stream } from '@/code/rule/lattice-gas'
import type { Collision } from '@/code/rule/collision'

// block index of a cell on the 4D periodic lattice, cell = ((w s + z) s + y) s + x
function blockOf(cell: number, side: number, block: number): number {
  const blocks = side / block
  const x = cell % side
  const y = Math.floor(cell / side) % side
  const z = Math.floor(cell / (side * side)) % side
  const w = Math.floor(cell / (side * side * side)) % side

  return (
    ((Math.floor(w / block) * blocks + Math.floor(z / block)) * blocks +
      Math.floor(y / block)) *
      blocks +
    Math.floor(x / block)
  )
}

// total momentum per block, one Float64Array per component (integer values)
function blockMomentum(input: {
  will: Will
  roots: number[][]
  side: number
  block: number
}): Float64Array[] {
  const { will, roots, side, block } = input
  const { mesh, data } = will
  const blocks = (side / block) ** 4
  const components = roots[0]?.length ?? 4
  const momentum = Array.from(
    { length: components },
    () => new Float64Array(blocks),
  )

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const b = blockOf(cell, side, block)

    for (let d = 0; d < mesh.degree; d++) {
      const t = data[cell * mesh.degree + d] ?? 0

      if (t !== 0) {
        const root = roots[d] ?? []

        for (let k = 0; k < components; k++) {
          momentum[k]![b] = (momentum[k]![b] ?? 0) + t * (root[k] ?? 0)
        }
      }
    }
  }

  return momentum
}

// the maximum absolute momentum-continuity residual over all blocks and
// components for ONE beat of the given collision at the given block scale:
// residual = P(after) - P(before) + outflux - influx, exactly zero when the
// collision conserves momentum per cell
export function maxMomentumResidual(input: {
  will: Will
  collision: Collision
  roots: number[][]
  side: number
  block: number
}): { residual: number; after: Will } {
  const { will, collision, roots, side, block } = input
  const mesh = will.mesh
  const components = roots[0]?.length ?? 4

  const before = blockMomentum({ will, roots, side, block })

  // collide in place on a copy, then account the stream flux from that state
  const collided = cloneWill(will)
  collide(collided, collision)

  const blocks = (side / block) ** 4
  const flux = Array.from(
    { length: components },
    () => new Float64Array(blocks),
  )

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const from = blockOf(cell, side, block)

    for (let d = 0; d < mesh.degree; d++) {
      const t = collided.data[cell * mesh.degree + d] ?? 0

      if (t === 0) {
        continue
      }

      const to = blockOf(mesh.neighbour(cell, d), side, block)

      if (to !== from) {
        const root = roots[d] ?? []

        for (let k = 0; k < components; k++) {
          const p = t * (root[k] ?? 0)
          flux[k]![from] = (flux[k]![from] ?? 0) + p
          flux[k]![to] = (flux[k]![to] ?? 0) - p
        }
      }
    }
  }

  const after = stream(collided)
  const afterMomentum = blockMomentum({
    will: after,
    roots,
    side,
    block,
  })

  let worst = 0

  for (let k = 0; k < components; k++) {
    for (let b = 0; b < blocks; b++) {
      const r =
        (afterMomentum[k]![b] ?? 0) -
        (before[k]![b] ?? 0) +
        (flux[k]![b] ?? 0)

      worst = Math.max(worst, Math.abs(r))
    }
  }

  return { residual: worst, after }
}
