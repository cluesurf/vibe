// Conformance for code/check/reversibility: the round-trip Hamming distance after
// `beats` forward beats then `beats` inverse beats. Zero means exact recovery; positive
// means information was lost. We pin all four regimes:
//   - involution collision  -> Hamming 0 (recovered)
//   - lossy (erasing) collision -> Hamming > 0 (information destroyed)
//   - non-involution pair table with its PAIRED INVERSE -> Hamming 0
//   - non-involution pair table with the FORWARD as inverse -> Hamming > 0 (the false
//     nonzero the inverseCollision parameter exists to prevent)

import { suite, check, equal, ok } from '@/test/code/harness'
import { roundtrip } from '@/code/check/reversibility'
import {
  Collision,
  momentumRotate2D,
  headOnRotate,
  leakyConfine,
  pairCollision,
} from '@/code/rule/collision'
import { squareMesh, Mesh } from '@/code/tool/mesh'
import {
  Will,
  makeWill,
  fillWillPattern,
  charge,
} from '@/code/tone/will'

const square = squareMesh({ side: 4 })

function oppositeOf(mesh: Mesh): number[] {
  return Array.from({ length: mesh.degree }, (_unused, d) =>
    mesh.opposite(d),
  )
}

function patternWill(mesh: Mesh): Will {
  const will = makeWill(mesh)

  fillWillPattern(will)

  return will
}

const erase: Collision = (slots, base, degree) => {
  for (let d = 0; d < degree; d++) slots[base + d] = 0
}

const opposite = oppositeOf(square)

suite('check/reversibility: round-trip Hamming distance', [
  check('Hamming is 0 for an involution collision', () => {
    for (const collision of [
      momentumRotate2D,
      headOnRotate({ opposite }),
      leakyConfine({ opposite }),
    ]) {
      const { roundtripHamming } = roundtrip({
        will: patternWill(square),
        collision,
        beats: 5,
      })

      equal(
        roundtripHamming,
        0,
        'an involution must recover the start exactly',
      )
    }
  }),
  check('Hamming is > 0 for a lossy (erasing) collision', () => {
    const will = patternWill(square)

    ok(
      charge(will) !== 0,
      'the test will must carry information to lose',
    )

    const { roundtripHamming } = roundtrip({
      will,
      collision: erase,
      beats: 2,
    })

    ok(roundtripHamming > 0, 'erasing slots must lose information')
  }),
])

suite('check/reversibility: the inverseCollision parameter', [
  check('pair table + PAIRED INVERSE gives Hamming 0', () => {
    const { roundtripHamming } = roundtrip({
      will: patternWill(square),
      collision: pairCollision({ opposite, forward: true }),
      beats: 5,
      inverseCollision: pairCollision({ opposite, forward: false }),
    })

    equal(
      roundtripHamming,
      0,
      'the paired inverse recovers the start exactly',
    )
  }),
  check(
    'pair table + FORWARD as its own inverse gives Hamming > 0',
    () => {
      // Default inverseCollision = the forward collide, which is WRONG for a
      // non-involution, so the round-trip applies the order-3 map twice and diverges.
      const { roundtripHamming } = roundtrip({
        will: patternWill(square),
        collision: pairCollision({ opposite, forward: true }),
        beats: 1,
      })

      ok(
        roundtripHamming > 0,
        'using the forward table to invert itself must NOT recover',
      )
    },
  ),
])
