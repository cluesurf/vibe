// Conformance for code/rule/fear-weave's one convention for grid moves (fixed 2026-09-26, E-QTM-0124). A
// whole is indexed by the phase point (a, b) at 3 a + b; a grid move is a table on the grid point x = a,
// y = b at a + 3 b (sigma-links' toGrid). The pin: for every element U of Sigma(648), the permutation
// moveCoordinate applies for the grid move sigma-links assigns U (its quotient) is exactly the phase-space
// action of U (U A(q) U^dagger = A(map q), read off the operators, not off either table). The control: the
// reading before the fix (the grid table applied to the phase index) disagrees with it.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  CONJUGATE_GRID,
  CONJUGATE_POINT,
  GRID_OF_PHASE,
  moveCoordinate,
  movePhaseCoordinate,
  phaseMove,
  type Whole,
} from '@/code/rule/fear-weave'
import { makeSigmaLinks } from '@/code/rule/sigma-links'
import { gridMoves } from '@/code/rule/vibe-weave'
import { phaseSpaceAction } from '@/code/measure/qutrit-phase-space'
import { type Matrix3 } from '@/code/dynamics/finite-gauge'

const rule = makeSigmaLinks({ side: 3, kappa: 0, tension: 0, capacity: 0 })
const grid = gridMoves()

// a one-token whole with a distinct weight at every phase point, so a permutation is read off it
const marked: Whole = { tokens: [0], weight: Array.from({ length: 9 }, (_, q) => BigInt(q + 1)) }

const imageOf = (moved: Whole): number[] =>
  Array.from({ length: 9 }, (_, q) => moved.weight.findIndex(w => w === BigInt(q + 1)))

suite('rule/fear-weave: grid moves act by sigma-links toGrid', [
  check('GRID_OF_PHASE is sigma-links toGrid, an involution', () => {
    GRID_OF_PHASE.forEach((g, q) => {
      equal(g, Math.floor(q / 3) + 3 * (q % 3), `phase ${q}`)
      equal(GRID_OF_PHASE[g], q, `involution at ${q}`)
    })
  }),
  check('every Sigma(648) element: moveCoordinate of its grid move is its phase-space action (648 of 648)', () => {
    let agree = 0

    for (let g = 0; g < rule.order; g++) {
      const action = phaseSpaceAction({ unitary: rule.group.matrices[g] as Matrix3 })
      const table = grid.act[rule.quotient[g] ?? 0] ?? []
      const image = imageOf(moveCoordinate(marked, 0, table))

      ok(action !== undefined, `element ${g} acts on the phase points`)
      agree += image.every((x, q) => x === action?.[q]) ? 1 : 0
    }

    equal(agree, rule.order, 'elements whose moveCoordinate is their action')
  }),
  check('control: the transposed reading (grid table on the phase index) is the action for only a few moves', () => {
    const agree = new Set<number>()

    for (let g = 0; g < rule.order; g++) {
      const action = phaseSpaceAction({ unitary: rule.group.matrices[g] as Matrix3 })
      const table = grid.act[rule.quotient[g] ?? 0] ?? []
      const image = imageOf(movePhaseCoordinate(marked, 0, table))

      if (image.every((x, q) => x === action?.[q])) {
        agree.add(rule.quotient[g] ?? 0)
      }
    }

    ok(agree.size < 216 && agree.size <= 12, `${agree.size} of 216 grid moves read the same transposed`)
  }),
  check('phaseMove is a homomorphism: phaseMove(g h) = phaseMove(g) phaseMove(h) on all 216 x 216', () => {
    let faults = 0

    for (let g = 0; g < grid.act.length; g++) {
      for (let h = 0; h < grid.act.length; h++) {
        const gh = Array.from({ length: 9 }, (_, p) => grid.act[g]?.[grid.act[h]?.[p] ?? 0] ?? 0)
        const lhs = phaseMove(gh)
        const pg = phaseMove(grid.act[g] ?? [])
        const ph = phaseMove(grid.act[h] ?? [])

        faults += lhs.every((x, q) => x === pg[ph[q] ?? 0]) ? 0 : 1
      }
    }

    equal(faults, 0, 'faults')
  }),
  check('CONJUGATE_GRID is CONJUGATE_POINT in grid terms', () => {
    equal(phaseMove(CONJUGATE_GRID).join(','), CONJUGATE_POINT.join(','), 'the reflection (a, b) -> (a, -b)')
  }),
])
