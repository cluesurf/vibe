// One convention for the grid moves a whole feels: the phase point (a, b) is the grid point x = a, y = b.
//
// A whole of code/rule/fear-weave is indexed by the phase point (a, b) at 3 a + b (code/measure/grid-weights,
// qutrit-phase-space). A link's grid move (weave.moves.act, the 216 affine maps of determinant one from
// code/rule/vibe-weave) is a table on the grid point x + 3 y. code/rule/sigma-links identifies the two by
// toGrid(3 a + b) = a + 3 b, and on that identification the grid move it assigns each element U of
// Sigma(648) is U's phase-space action (U A(q) U^dagger = A(map q)). Until 2026-09-26 fear-weave's
// moveCoordinate applied the grid table to the phase index directly, reading a + 3 b as 3 a + b: every link
// then acted on the whole by T g T, T: (a, b) -> (b, a), the move of a different element (E-QTM-0121's report).
// The fix (fear-weave GRID_OF_PHASE, phaseMove; moveCoordinate takes a grid move) makes sigma-links'
// identification the one convention, and test/code/rule/fear-weave pins it.
//
// Measured:
// 1. every element of Sigma(648): the permutation moveCoordinate applies for sigma-links' quotient of U,
//    against U's phase-space action computed from the operators
// 2. phaseMove is a homomorphism on all 216 x 216 pairs, the identity to the identity
// 3. the control, the old reading: on how many of the 216 moves the transposed table is the action, and
//    that every transposed move T g T is itself one of the 216 (why nothing Clifford broke: T reverses the
//    symplectic form, and twice restores it)
// 4. what the fix changes in the knit: E-QTM-0119's histories (dock 0 of the side-3 color weave, the vacuum
//    and a Weyl matter background, 480 beats, starts |0>|1>, Strange x |0>, Strange x Strange), each run
//    under the old and the new convention, both laws (the swap phase, and the color law with its frames):
//    how many runs end with a different fear share, and the largest change in a run's fear share. Reported,
//    not gated: which convention is right is settled by 1, not by what the knit does
//
// Gates, fixed before the first run: 1 holds for 648 of 648; 2 has 0 faults; in 3 the old reading is the
// action on fewer than 216 moves (the defect was real) and T g T is a grid move for 216 of 216.
//
// Depth L1: a convention, checked exhaustively against the operators.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import {
  fearKernels,
  GRID_OF_PHASE,
  meetingKernel,
  moveCoordinate,
  movePhaseCoordinate,
  phaseMove,
  swapPhase,
  wholeLovesAndFears,
  type Whole,
} from '@/code/rule/fear-weave'
import { makeSigmaLinks } from '@/code/rule/sigma-links'
import { gridMoves } from '@/code/rule/vibe-weave'
import { phaseSpaceAction } from '@/code/measure/qutrit-phase-space'
import { type Matrix3 } from '@/code/dynamics/finite-gauge'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  runWhole,
  vacuumBackground,
  weylBackground,
  type RoleState,
} from '@/code/measure/knit-magic'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 480
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
]

const marked: Whole = { tokens: [0], weight: Array.from({ length: 9 }, (_, q) => BigInt(q + 1)) }
const imageOf = (moved: Whole): number[] => Array.from({ length: 9 }, (_, q) => moved.weight.findIndex(w => w === BigInt(q + 1)))
const shareOf = (w: Whole): number => {
  const { loves, fears } = wholeLovesAndFears(w)

  return Number(fears) / Number(loves + fears)
}

export default experiment({
  id: 'quantum/grid-moves-act-by-sigma-links',
  code: 'E-QTM-0124',
  title:
    'one convention for the grid moves a whole feels: with the phase point (a, b) read as the grid point x = a, y = b (sigma-links toGrid), the move fear-weave applies for every one of the 648 elements of Sigma(648) is that element\'s phase-space action, where the transposed reading used before 2026-09-26 applied a different Clifford move on most links',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const rule = makeSigmaLinks({ side: 3, kappa: 0, tension: 0, capacity: 0 })
    const grid = gridMoves()
    const key = (t: ArrayLike<number>): string => Array.from(t).join(',')
    const gridSet = new Set(grid.act.map(key))

    // 1. every element
    let agreeNew = 0
    const oldAgreeMoves = new Set<number>()

    for (let g = 0; g < rule.order; g++) {
      const action = phaseSpaceAction({ unitary: rule.group.matrices[g] as Matrix3 }) ?? []
      const m = rule.quotient[g] ?? 0
      const table = grid.act[m] ?? []

      agreeNew += key(imageOf(moveCoordinate(marked, 0, table))) === key(action) ? 1 : 0

      if (key(imageOf(movePhaseCoordinate(marked, 0, table))) === key(action)) {
        oldAgreeMoves.add(m)
      }
    }

    // 2. homomorphism
    let homomorphismFaults = 0

    for (let g = 0; g < grid.act.length; g++) {
      for (let h = 0; h < grid.act.length; h++) {
        const gh = Array.from({ length: 9 }, (_, p) => grid.act[g]?.[grid.act[h]?.[p] ?? 0] ?? 0)
        const pg = phaseMove(grid.act[g] ?? [])
        const ph = phaseMove(grid.act[h] ?? [])

        homomorphismFaults += key(phaseMove(gh)) === key(ph.map(q => pg[q] ?? 0)) ? 0 : 1
      }
    }

    const identityFixed = key(phaseMove(grid.act[grid.identity] ?? [])) === key([0, 1, 2, 3, 4, 5, 6, 7, 8]) ? 1 : 0

    // 3. the transposed moves are grid moves
    const transposed = grid.act.map(t => GRID_OF_PHASE.map(q => GRID_OF_PHASE[t[q] ?? 0] ?? 0))
    const transposedInGroup = transposed.filter(t => gridSet.has(key(t))).length
    const selfTransposed = grid.act.filter((t, m) => key(t) === key(transposed[m] ?? [])).length

    // 4. the knit under both conventions: a weave whose tables are the transposed ones reproduces the old
    // reading exactly (moveCoordinate then applies phaseMove(transposed) = the old phase permutation)
    const weave = makeColorWeave({ side: 3, table: 'pair' })
    const oldWeave: ColorWeave = {
      ...weave,
      moves: { ...weave.moves, act: transposed.map(t => Int8Array.from(t)) },
    }
    const slots = weave.mesh.cellCount * 24
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined
    const laws = [
      { name: 'swap', kernel4: kThird, color: undefined },
      { name: 'color', kernel4: [] as number[][], color: colorOn },
    ]
    const changed = [0, 0]
    const runs = [0, 0]
    const largest = [0, 0]

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: 2.11 })]) {
      const records = classicalRecords({ weave, links: weave.links, background, open: Array.from({ length: 24 }, (_, d) => d), beats: BEATS })

      for (const { a, b } of meetingPairs(records)) {
        const mine = pairRecords(records, a, b)

        for (const start of STARTS) {
          laws.forEach((law, li) => {
            const next = runWhole({ weave, start: productWhole([a, b], start), records: mine, kernel4: law.kernel4, color: law.color })
            const old = runWhole({ weave: oldWeave, start: productWhole([a, b], start), records: mine, kernel4: law.kernel4, color: law.color })
            let diff = 0

            next.forEach((step, t) => {
              diff = Math.max(diff, Math.abs(shareOf(step.whole) - shareOf(old[t]?.whole ?? step.whole)))
            })

            runs[li] = (runs[li] ?? 0) + 1
            changed[li] = (changed[li] ?? 0) + (Math.abs(shareOf(next[next.length - 1]!.whole) - shareOf(old[old.length - 1]!.whole)) > 1e-12 ? 1 : 0)
            largest[li] = Math.max(largest[li] ?? 0, diff)
          })
        }
      }
    }

    const ok = agreeNew === rule.order && homomorphismFaults === 0 && identityFixed === 1 && oldAgreeMoves.size < 216 && transposedInGroup === 216

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with the phase point (a, b) read as the grid point x = a, y = b, moveCoordinate applies each element's phase-space action for ${agreeNew} of ${rule.order} elements of Sigma(648) and phaseMove is a homomorphism (${homomorphismFaults} faults in 216 x 216); the transposed reading used before was the action on only ${oldAgreeMoves.size} of 216 grid moves, though every transposed move is itself a grid move (${transposedInGroup} of 216), so the Clifford property never broke; on E-QTM-0119's histories the fix changes the final fear share of ${changed[0]} of ${runs[0]} swap-phase runs and ${changed[1]} of ${runs[1]} color-law runs`,
      metrics: {
        elementsAgreeing: agreeNew,
        elements: rule.order,
        homomorphismFaults,
        identityFixed,
        transposedMovesInGroup: transposedInGroup,
        selfTransposedMoves: selfTransposed,
        swapRuns: runs[0] ?? 0,
        swapRunsFinalShareChanged: changed[0] ?? 0,
        swapLargestShareChange: largest[0] ?? 0,
        colorRuns: runs[1] ?? 0,
        colorRunsFinalShareChanged: changed[1] ?? 0,
        colorLargestShareChange: largest[1] ?? 0,
      },
      control: {
        oldReadingMovesAgreeing: oldAgreeMoves.size,
        gridMoves: grid.act.length,
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status pass as before; runs whose final share changed under the convention change 31 -> 15 (swap) and 30 -> 17 (color), the largest swap share change 0.2958 -> 0.2290. " + ('L1. The pin is also a conformance suite, test/code/rule/fear-weave. What the old reading was, stated: the whole moved by T g T for the link carrying g, which is the phase-space action of a different element (the image of U under the outer automorphism T induces), consistently on every link, so the fear weave alone stayed a self-consistent Clifford dynamics and every result that reads only loves and fears is unaffected in kind; it disagreed with sigma-links on which unitary a link carries, which matters wherever a whole meets a link field read as unitaries. A caller that builds its own phase permutation and passes it to moveCoordinate (calm-weave conjugateMove, used by E-QTM-0106) now needs the grid form of the reflection, CONJUGATE_GRID, not CONJUGATE_POINT: that is reported, not changed here. First run, 2026-09-26 (17 s): pass, gates unchanged. The old reading was the action on 6 of 216 moves (the self-transposed ones), and on the knit it changed the final fear share of 31 of 84 swap-phase runs and 30 of 84 color-law runs, by up to 0.30 at some beat: the same kind of dynamics, a different history.'),
    })
  },
})
