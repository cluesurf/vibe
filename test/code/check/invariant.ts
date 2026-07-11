// Conformance for code/check/invariant: the invariants of the committed rule, as
// checkable predicates. We confirm each predicate gives the RIGHT verdict, true for a
// rule that genuinely has the property and false for a deliberately broken one:
//   - conservesCharge: true for the committed collisions, false for an erasing one.
//   - isReversible: true for an involution (same map back) and for the non-involution
//     pair table (its PAIRED INVERSE back), false for a lossy collision.
//   - totalMomentum: re-derived by hand on tiny wills; conservesMomentum true for the
//     momentum-rotate rule, false for the charge-hopping pair table (a negative control).

import {
  suite,
  check,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import {
  totalMomentum,
  conservesMomentum,
  conservesCharge,
  isReversible,
} from '@/code/check/invariant'
import {
  Collision,
  momentumRotate2D,
  pairCollision,
  leakyConfine,
  headOnRotate,
} from '@/code/rule/collision'
import { squareMesh, Mesh } from '@/code/tool/mesh'
import {
  Will,
  makeWill,
  loneParticle,
  fillWillPattern,
  charge,
} from '@/code/tone/will'

const square = squareMesh({ side: 4 })

function oppositeOf(mesh: Mesh): number[] {
  return Array.from({ length: mesh.degree }, (_unused, d) =>
    mesh.opposite(d),
  )
}

function patternWill(mesh: Mesh, phase = 0): Will {
  const will = makeWill(mesh)

  fillWillPattern(will, phase)

  return will
}

// An information-destroying collision: zero every slot. Conserves charge only when the
// cell was already empty, so on a charged will it is neither charge-conserving nor
// reversible, the negative control both predicates must reject.
const erase: Collision = (slots, base, degree) => {
  for (let d = 0; d < degree; d++) slots[base + d] = 0
}

// The square coin direction vectors: 0 +x (E), 1 -x (W), 2 +y (N), 3 -y (S).
const SQUARE_DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

const opposite = oppositeOf(square)

suite('check/invariant: conservesCharge', [
  check('true for the committed collisions', () => {
    for (const collision of [
      pairCollision({ opposite }),
      leakyConfine({ opposite }),
      momentumRotate2D,
      headOnRotate({ opposite }),
    ]) {
      ok(
        conservesCharge(patternWill(square), collision, 6),
        'charge must be conserved',
      )
    }
  }),
  check('false for an erasing collision (on a charged will)', () => {
    const will = patternWill(square)

    notOk(
      charge(will) === 0,
      'the test will must carry a nonzero charge',
    )

    notOk(
      conservesCharge(will, erase, 1),
      'erasing every slot must NOT conserve charge',
    )
  }),
])

suite('check/invariant: isReversible', [
  check('true for involution collisions (same map back)', () => {
    for (const collision of [
      momentumRotate2D,
      headOnRotate({ opposite }),
      leakyConfine({ opposite }),
    ]) {
      ok(
        isReversible(patternWill(square), collision, 5),
        'an involution must be reversible',
      )
    }
  }),
  check('true for the pair table when given its PAIRED INVERSE', () => {
    const forward = pairCollision({ opposite, forward: true })
    const inverse = pairCollision({ opposite, forward: false })

    ok(
      isReversible(patternWill(square), forward, 5, inverse),
      'forward + paired inverse must recover the start',
    )
  }),
  check(
    'false for the pair table when given the FORWARD as its own inverse',
    () => {
      const forward = pairCollision({ opposite, forward: true })

      notOk(
        isReversible(patternWill(square), forward, 1, forward),
        'a non-involution must not invert itself',
      )
    },
  ),
  check('false for a lossy (erasing) collision', () => {
    notOk(
      isReversible(patternWill(square), erase, 2),
      'an information-destroying collision is not reversible',
    )
  }),
])

suite('check/invariant: momentum', [
  check('totalMomentum of a lone east-pointing charge is +x', () => {
    const will = loneParticle(square, 5, 0, 1)

    exactArray(
      totalMomentum(will, SQUARE_DIRECTIONS),
      [1, 0],
      'lone E charge',
    )
  }),
  check('totalMomentum of a head-on east+west pair is zero', () => {
    const will = makeWill(square)

    will.data[5 * square.degree + 0] = 1 // east, tone +1
    will.data[5 * square.degree + 1] = 1 // west, tone +1
    exactArray(
      totalMomentum(will, SQUARE_DIRECTIONS),
      [0, 0],
      'zero-momentum pair',
    )
  }),
  check('momentumRotate2D conserves the total momentum', () => {
    const will = makeWill(square)

    will.data[5 * square.degree + 0] = 1 // east
    will.data[5 * square.degree + 1] = 1 // west (rotates to north,south)
    ok(
      conservesMomentum(will, momentumRotate2D, 4, SQUARE_DIRECTIONS),
      'rotating a zero-momentum pair keeps momentum zero',
    )
  }),
  check(
    'the pair table does NOT conserve momentum (a charge hop moves it)',
    () => {
      // A single -1 charge in the WEST slot. The pair table hops it to the EAST slot,
      // reversing its momentum from +x to -x: momentum is not conserved.
      const will = makeWill(square)

      will.data[5 * square.degree + 1] = -1 // west slot, tone -1 -> momentum +x
      exactArray(
        totalMomentum(will, SQUARE_DIRECTIONS),
        [1, 0],
        'before the hop',
      )

      notOk(
        conservesMomentum(
          will,
          pairCollision({ opposite }),
          1,
          SQUARE_DIRECTIONS,
        ),
        'the charge-hopping pair table breaks momentum conservation',
      )
    },
  ),
])
