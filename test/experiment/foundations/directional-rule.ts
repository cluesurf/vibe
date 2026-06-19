import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import {
  momentumRotate2D,
  pairCollision,
  PAIR_FORWARD,
  PAIR_INVERSE,
} from '@/code/rule/collision'
import { conservesCharge, isReversible } from '@/code/check/invariant'

// The base discipline of the committed substrate (experiment SP11). The directional
// lattice-gas conserves total charge and runs backward exactly, on both the 2D square
// reference (the momentum-rotate involution) and the 24-direction D4 coin (the 9-state
// pair table, a reversible bijection run backward through its paired inverse). The
// 9-state table itself is a permutation of the nine pair states, so it is reversible
// by construction.
export default experiment({
  id: 'foundations/directional-rule',
  title:
    'the directional lattice-gas conserves charge and is exactly reversible',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // The 2D reference: the momentum-rotate involution on a periodic square mesh.
    const square = squareMesh({ side: 48 })
    const squareWill = makeWill(square)
    fillWillPattern(squareWill)

    const squareConserves = conservesCharge(
      squareWill,
      momentumRotate2D,
      200,
    )

    const squareReverses = isReversible(
      squareWill,
      momentumRotate2D,
      200,
    )

    // The committed coin: the 9-state directional rule on the 24-direction D4 mesh.
    const d4 = d4Mesh({ side: 6 })
    const d4Will = makeWill(d4)
    fillWillPattern(d4Will, 1)

    const opposite = Array.from({ length: d4.degree }, (_, direction) =>
      d4.opposite(direction),
    )

    const forward = pairCollision({ opposite, forward: true })
    const inverse = pairCollision({ opposite, forward: false })
    const d4Conserves = conservesCharge(d4Will, forward, 60)
    const d4Reverses = isReversible(d4Will, forward, 60, inverse)

    // The 9-state pair table is a permutation and its inverse, so it is reversible.
    const tablePermutes =
      new Set(PAIR_FORWARD.map(pair => pair.join(','))).size === 9 &&
      new Set(PAIR_INVERSE.map(pair => pair.join(','))).size === 9

    const ok =
      squareConserves &&
      squareReverses &&
      d4Conserves &&
      d4Reverses &&
      tablePermutes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the stream-collide rule conserves total charge and runs backward exactly, on both the square reference and the 24-direction D4 coin',
      metrics: {
        squareBeats: 200,
        d4Beats: 60,
        d4Directions: 24,
        pairStates: 9,
      },
    })
  },
})
