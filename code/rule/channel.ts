// Bounce-back channel walls for the lattice gas. The wall lives at the COLLISION level: a wall cell swaps
// every slot with its opposite slot, which is a bijection (an involution) per cell, so the following stream
// stays exact and charge is conserved exactly, while the cell's momentum is exactly REVERSED. That reversal
// is the no-slip boundary of lattice-gas hydrodynamics, the wall absorbs (exchanges away) the gas momentum
// without absorbing any charge. Walls must NOT be implemented by redefining mesh.neighbour to bounce, two
// sources would then stream into one slot and charge would be lost, the collision-level reversal is the
// correct construction.

import { Collision } from '@/code/rule/collision'

// the per-cell slot reversal: every slot swaps with its opposite slot (a self-opposite slot, like a rest
// slot, is left alone). Charge-conserving, momentum-reversing, its own inverse. Applied at a wall cell this
// is the bounce-back (no-slip) wall.
export function slotReversal(input: { opposite: number[] }): Collision {
  const lines: [number, number][] = []

  for (
    let direction = 0;
    direction < input.opposite.length;
    direction++
  ) {
    const other = input.opposite[direction]!

    if (direction < other) {
      lines.push([direction, other])
    }
  }

  return (slots, base) => {
    for (const [left, right] of lines) {
      const hold = slots[base + left]!

      slots[base + left] = slots[base + right]!
      slots[base + right] = hold
    }
  }
}

// A collision that dispatches per cell: wall cells run the wall collision, every other cell runs the bulk
// collision. The cell index is base / degree (the engine hands each collision the flat slot base). Both
// branches are per-cell bijections, so the composite is a valid (reversible, charge-conserving) collision,
// this is how a channel (bounce-back wall rows around a momentum-conserving bulk) is composed.
export function channelCollision(input: {
  bulk: Collision
  wall: Collision
  isWall: (cell: number) => boolean
}): Collision {
  const { bulk, wall, isWall } = input

  return (slots, base, degree) => {
    if (isWall(base / degree)) {
      wall(slots, base, degree)
    } else {
      bulk(slots, base, degree)
    }
  }
}
