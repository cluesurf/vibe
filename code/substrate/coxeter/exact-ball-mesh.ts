// The exact {3,4,3,4} ball (exact-3434.ts buildExactBall, E-GMT-0040) as the Mesh the working rule takes
// (code/rule/vibe-weave makeVibeWeave on a mesh, item vibe-roadmap-honeycomb-0007): degree 24, slots in rootsD4()
// order, neighbour -1 at the frontier, opposite = isometric-knit's OPPOSITE. The ball's own mesh already has that
// shape; this file GATES it, so a run on the honeycomb can never start from a mislabeled table:
//
// - the cell's labelling is exact: the labelled facet-direction Gram equals the rootsD4() dot products entry for entry
//   (so slot k carries the direction rootsD4()[k], up to an isometry of the whole root system, which every slot
//   shares), and the inversion exchanges antipodes
// - the ball's opposite labels equal OPPOSITE on all 24 slots (lockedTables throws otherwise)
// - 0 inconsistent steps and every in-ball step returns by its opposite slot
// - every slot is -1 or a cell of the ball
//
// It also gives each dock its class mod 2 D4, by the homomorphism k_a -> a mod 2 D4 onto (Z/2)^4 (the class of a slot
// is its root's basis coordinates mod 2), assigned breadth-first from the base cell with every edge checked: the
// class map exists exactly when `classConflicts` is 0. A store that depends only on a dock's class and the line pulls
// back through it (item 0002's vacuum pullback).
//
// NOTHING MOVES: this file reads the ball's table.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { d4Coordinates } from '@/code/substrate/d4-box'
import {
  buildExactBall,
  exactCell,
  type ExactBall,
  type ExactCell,
} from '@/code/substrate/coxeter/exact-3434'
import { type Mesh } from '@/code/tool/mesh'

const SLOTS = 24

export type ExactBallMesh = {
  readonly mesh: Mesh
  readonly ball: ExactBall
  readonly cells: number
  readonly radius: number
  // cells * 24 slots that face out of the ball
  readonly frontierSlots: number
  // each dock's class mod 2 D4 relative to the base cell, 0..15 (basis coordinates mod 2, bit k for coordinate k)
  readonly classOf: Uint8Array
  // edges whose two ends disagree with k_a -> a mod 2 D4 (0 when the class map is well defined)
  readonly classConflicts: number
  // the gates, each true
  readonly gates: {
    gramExact: boolean
    inversionExchangesAntipodes: boolean
    oppositeIsKnitOpposite: boolean
    consistent: boolean
    returnsExactly: boolean
    inRange: boolean
  }
}

// the class of rootsD4()[k] mod 2 D4: its basis coordinates mod 2
export const SLOT_CLASS: readonly number[] = rootsD4().map(r =>
  d4Coordinates([...r]).reduce(
    (s, v, k) => s + ((((v % 2) + 2) % 2) << k),
    0,
  ),
)

export function exactBallMesh(input: {
  radius: number
  cell?: ExactCell
}): ExactBallMesh {
  const cell = input.cell ?? exactCell()
  const ball = buildExactBall({ radius: input.radius, cell })
  const cells = ball.cells
  const table = ball.table

  let frontierSlots = 0
  let inRange = true

  for (let i = 0; i < table.length; i++) {
    const n = table[i]!

    if (n < 0) {
      frontierSlots += n === -1 ? 1 : 0
      inRange &&= n === -1
    } else {
      inRange &&= n < cells
    }
  }

  const oppositeIsKnitOpposite =
    cell.opposite.length === SLOTS &&
    cell.opposite.every((o, k) => o === OPPOSITE[k])

  const gates = {
    gramExact: cell.gramExact,
    inversionExchangesAntipodes: cell.inversionExchangesAntipodes,
    oppositeIsKnitOpposite,
    consistent: ball.inconsistentSteps === 0,
    returnsExactly: ball.returnsExactly,
    inRange,
  }

  const failed = Object.entries(gates)
    .filter(([, ok]) => !ok)
    .map(([name]) => name)

  if (failed.length > 0) {
    throw new Error(
      `exactBallMesh: radius ${input.radius} fails ${failed.join(', ')}`,
    )
  }

  // the class map, breadth-first in cell order (the ball's cells are already in breadth-first order)
  const classOf = new Uint8Array(cells)
  const assigned = new Uint8Array(cells)

  assigned[0] = 1

  let classConflicts = 0

  for (let x = 0; x < cells; x++) {
    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!

      if (y < 0) {
        continue
      }

      const c = classOf[x]! ^ SLOT_CLASS[k]!

      if (!assigned[y]) {
        assigned[y] = 1
        classOf[y] = c
      } else if (classOf[y] !== c) {
        classConflicts++
      }
    }
  }

  const mesh: Mesh = {
    id: ball.mesh.id,
    degree: SLOTS,
    cellCount: cells,
    neighbour(c, direction) {
      return table[c * SLOTS + direction] ?? -1
    },
    opposite(direction) {
      return OPPOSITE[direction] ?? direction
    },
  }

  return {
    mesh,
    ball,
    cells,
    radius: input.radius,
    frontierSlots,
    classOf,
    classConflicts,
    gates,
  }
}
