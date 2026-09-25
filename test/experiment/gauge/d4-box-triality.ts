// Where can a triality act at all? The committed rule's adoption search ran on the integer torus
// Z^4 / L Z^4, and its note records that "the triality cosets of the full 1,152 group do not act on
// the integer torus". A triality has entries of one half: it keeps the D4 lattice but not the box
// L Z^4, so on that torus it sends cells to points that are not cells.
//
// This builds the box that does admit it (code/substrate/d4-box): the D4 lattice with periods L D4.
// W(F4) keeps D4 and L D4, so every element is an automorphism: cells go to cells and neighbours to
// neighbours. Then it asks the dynamical question the structural counts of E-FRC-0106 could not:
// does a rule's evolution, run beat by beat on four fixed starts, commute with a triality?
//
// Measured on side 3, where both boxes have 81 cells:
//
// - W(F4) elements acting as automorphisms: all 1152 on the D4 box, 384 (the signed permutations) on
//   the integer torus.
// - The previous knit's 24-beat evolution commutes with exactly 2 of the 80 order-three elements, and
//   both fix an A2: its colour-selecting triality is a symmetry of the full dynamics, not only of the
//   collision table.
// - The committed turning weave commutes with none.
//
// Controls: the integer torus admits only the 384 signed permutations, the committed turning weave
// commutes with no order-three element, and the dynamical count of 2 agrees with E-FRC-0106's exact
// block test. Four starts are used because one structured start can let an element pass by
// coincidence (a probe with a coarser pattern let 8 through), and the count with one start is
// printed beside the count with four.
//
// Depth L2: an exact structural and dynamical measurement on a new box, no random numbers (the starts
// are golden-ratio patterns).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, type Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import {
  pairCollision,
  turningWeave,
  type Collision,
} from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import {
  boxCellMap,
  d4BoxMesh,
  linearMapOf,
  transformState,
} from '@/code/substrate/d4-box'

const SIDE = 3
const GOLDEN = (Math.sqrt(5) - 1) / 2

function isAutomorphism(
  mesh: Mesh,
  cellMap: readonly number[] | undefined,
  permutation: readonly number[],
): boolean {
  if (cellMap === undefined) {
    return false
  }

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    for (let d = 0; d < mesh.degree; d++) {
      if (
        cellMap[mesh.neighbour(cell, d)] !==
        mesh.neighbour(cellMap[cell] ?? 0, permutation[d] ?? 0)
      ) {
        return false
      }
    }
  }

  return true
}

// the integer torus: a cell is its Z^4 coordinates, acted on directly
function torusCellMap(
  matrix: readonly (readonly number[])[],
): number[] | undefined {
  const cells = SIDE ** 4
  const map: number[] = []

  for (let cell = 0; cell < cells; cell++) {
    const v = [0, 1, 2, 3].map(a => Math.floor(cell / SIDE ** a) % SIDE)
    const image = matrix.map(row =>
      row.reduce((s, x, k) => s + x * (v[k] ?? 0), 0),
    )

    if (image.some(x => Math.abs(x - Math.round(x)) > 1e-9)) {
      return undefined
    }

    map.push(
      image.reduce(
        (s, x, a) =>
          s + (((Math.round(x) % SIDE) + SIDE) % SIDE) * SIDE ** a,
        0,
      ),
    )
  }

  return new Set(map).size === cells ? map : undefined
}

function starts(mesh: Mesh, count: number): Will[] {
  return Array.from({ length: count }, (_, seed) => {
    const will = makeWill(mesh)

    for (let i = 0; i < will.data.length; i++) {
      const u = ((i + 1) * GOLDEN * (seed + 1.37)) % 1

      will.data[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    }

    return will
  })
}

function commutingOrderThree(input: {
  mesh: Mesh
  rule: (t: number) => Collision
  orderThree: readonly (readonly number[])[]
  startCount: number
}): { commuting: number; fixingSix: number } {
  const { mesh, rule, orderThree, startCount } = input

  let commuting = 0
  let fixingSix = 0

  for (const permutation of orderThree) {
    const matrix = linearMapOf(permutation)
    const cellMap =
      matrix === undefined
        ? undefined
        : boxCellMap({ matrix, side: SIDE })

    if (cellMap === undefined) {
      continue
    }

    let same = true

    for (const start of starts(mesh, startCount)) {
      let a: Will = { mesh, data: Int8Array.from(start.data) }
      let b: Will = {
        mesh,
        data: transformState({
          data: start.data,
          cellMap,
          permutation,
          degree: 24,
        }),
      }

      for (let t = 0; t < 24 && same; t++) {
        a = beat(a, rule(t))
        b = beat(b, rule(t))
        same = transformState({
          data: a.data,
          cellMap,
          permutation,
          degree: 24,
        }).every((x, k) => x === b.data[k])
      }
    }

    if (same) {
      commuting += 1
      fixingSix +=
        permutation.filter((image, d) => image === d).length === 6
          ? 1
          : 0
    }
  }

  return { commuting, fixingSix }
}

export default experiment({
  id: 'gauge/d4-box-triality',
  code: 'E-FRC-0108',
  title:
    'on a box with D4-shaped periods all 1152 coin symmetries act, against 384 on the integer torus the committed rule was searched on, and there the previous knit evolves in exact step with its two colour-selecting trialities while the committed turning weave commutes with none',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const permutations = weylF4DirectionPermutations({
      directions: roots,
    })
    const box = d4BoxMesh({ side: SIDE })
    const torus = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(box)

    let onBox = 0
    let onTorus = 0

    for (const permutation of permutations) {
      const matrix = linearMapOf(permutation)

      if (matrix === undefined) {
        continue
      }

      onBox += isAutomorphism(
        box,
        boxCellMap({ matrix, side: SIDE }),
        permutation,
      )
        ? 1
        : 0

      onTorus += isAutomorphism(
        torus,
        torusCellMap(matrix),
        permutation,
      )
        ? 1
        : 0
    }

    const orderThree = permutations.filter(
      p => permutationOrder({ permutation: p }) === 3,
    )
    const previous = commutingOrderThree({
      mesh: box,
      rule: () => pairCollision({ opposite }),
      orderThree,
      startCount: 4,
    })
    const previousOneStart = commutingOrderThree({
      mesh: box,
      rule: () => pairCollision({ opposite }),
      orderThree,
      startCount: 1,
    })
    const turning = commutingOrderThree({
      mesh: box,
      rule: turningWeave({ opposite }),
      orderThree,
      startCount: 4,
    })

    const ok =
      onBox === 1152 &&
      onTorus === 384 &&
      previous.commuting === 2 &&
      previous.fixingSix === 2 &&
      turning.commuting === 0 &&
      previousOneStart.commuting >= previous.commuting

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'all 1152 elements of W(F4) are automorphisms of the D4-shaped box against 384 on the integer torus, and on the D4 box the previous knit evolves in exact step for 24 beats with exactly 2 of the 80 order-three elements, both colour-selecting trialities, while the committed turning weave commutes with none',
      metrics: {
        automorphismsD4Box: onBox,
        automorphismsIntegerTorus: onTorus,
        previousKnitCommuting: previous.commuting,
        previousKnitCommutingFixingAnA2: previous.fixingSix,
        turningWeaveCommuting: turning.commuting,
      },
      control: {
        previousKnitCommutingOneStart: previousOneStart.commuting,
        orderThreeElements: orderThree.length,
      },
      notes:
        "L2, exact. It answers the box half of why triality was never in the committed rule's design space: the search ran on a box triality cannot act on. On the D4 box it can, and the previous knit, which keeps a colour-selecting triality in its table (E-FRC-0106), keeps it in its full evolution too. The count uses four starts, since a coarse single start can let an element pass by coincidence. E-FRC-0107 is about the schedule and holds on any box. E-FRC-0109 builds a rule on this box that keeps the triality and is also universal.",
    })
  },
})
