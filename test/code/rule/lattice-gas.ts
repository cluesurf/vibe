// Conformance for code/rule/lattice-gas: the directional lattice-gas engine, a beat is
// COLLIDE then STREAM. Two properties must hold exactly on a real mesh:
//   - REVERSIBILITY: inverseBeat undoes beat exactly (un-stream then collide back), over
//     several beats, for an involution collision (same map back) and for the non-involution
//     pair table (its PAIRED INVERSE back). The state returns bit-for-bit.
//   - CHARGE CONSERVATION: the total tone is unchanged after every beat (stream permutes
//     slots, the collision conserves the per-pair sum).
// Streaming is a permutation of slots, so we also pin streamInverse(stream(x)) === x.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  stream,
  streamInverse,
  collide,
  beat,
  inverseBeat,
  run,
} from '@/code/rule/lattice-gas'
import {
  Collision,
  momentumRotate2D,
  pairCollision,
  leakyConfine,
  headOnRotate,
} from '@/code/rule/collision'
import { squareMesh, cubicMesh, Mesh } from '@/code/tool/mesh'
import {
  Will,
  makeWill,
  cloneWill,
  fillWillPattern,
  charge,
} from '@/code/tone/will'

// The opposite-direction index array of a mesh, the shape the pair tables consume.
function oppositeOf(mesh: Mesh): number[] {
  return Array.from({ length: mesh.degree }, (_unused, d) =>
    mesh.opposite(d),
  )
}

// A deterministic structured will on a mesh (never random, per methodology).
function patternWill(mesh: Mesh, phase = 0): Will {
  const will = makeWill(mesh)

  fillWillPattern(will, phase)

  return will
}

function sameData(a: Will, b: Will): boolean {
  if (a.data.length !== b.data.length) {
    return false
  }

  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i] !== b.data[i]) {
      return false
    }
  }

  return true
}

// Run `beats` forward beats then `beats` inverse beats (with the paired-inverse collide)
// and report whether the start is recovered bit-for-bit.
function roundTrips(
  will: Will,
  forward: Collision,
  inverse: Collision,
  beats: number,
): boolean {
  const start = cloneWill(will)

  let w = cloneWill(will)

  for (let b = 0; b < beats; b++) {
    w = beat(w, forward)
  }

  for (let b = 0; b < beats; b++) {
    w = inverseBeat(w, inverse)
  }

  return sameData(w, start)
}

const square = squareMesh({ side: 4 })
const cubic = cubicMesh({ side: 3 })

suite('rule/lattice-gas: stream is a permutation of slots', [
  check('streamInverse(stream(x)) recovers the exact will', () => {
    for (const mesh of [square, cubic]) {
      const start = patternWill(mesh)
      const there = stream(start)
      const back = streamInverse(there)

      ok(
        sameData(back, start),
        `${mesh.id}: un-stream must invert stream exactly`,
      )
    }
  }),
  check('stream conserves charge (it only moves slots)', () => {
    const start = patternWill(square)

    equal(
      charge(stream(start)),
      charge(start),
      'stream must not change the charge',
    )
  }),
])

suite('rule/lattice-gas: beat = collide then stream', [
  check('beat equals collide-in-place followed by stream', () => {
    const collision = pairCollision({ opposite: oppositeOf(square) })
    const manual = patternWill(square)

    collide(manual, collision)

    const streamed = stream(manual)
    const viaBeat = beat(patternWill(square), collision)

    ok(
      sameData(viaBeat, streamed),
      'beat must be exactly collide then stream',
    )
  }),
  check('run(n) equals chaining beat() n times', () => {
    const collision = pairCollision({ opposite: oppositeOf(square) })

    let chained = patternWill(square)

    for (let b = 0; b < 5; b++) {
      chained = beat(chained, collision)
    }

    const buffered = run(patternWill(square), collision, 5)

    ok(
      sameData(buffered, chained),
      'the buffered run must match chained beats',
    )
  }),
])

suite('rule/lattice-gas: reversibility (involution collisions)', [
  check(
    'momentumRotate2D round-trips exactly over several beats (square)',
    () => {
      ok(
        roundTrips(
          patternWill(square),
          momentumRotate2D,
          momentumRotate2D,
          6,
        ),
        'an involution must recover the start bit-for-bit',
      )
    },
  ),
  check('headOnRotate round-trips exactly (square and cubic)', () => {
    for (const mesh of [square, cubic]) {
      const collision = headOnRotate({ opposite: oppositeOf(mesh) })

      ok(
        roundTrips(patternWill(mesh), collision, collision, 5),
        `${mesh.id}: head-on rotate is its own inverse`,
      )
    }
  }),
  check('leakyConfine round-trips exactly (cubic)', () => {
    const collision = leakyConfine({ opposite: oppositeOf(cubic) })

    ok(
      roundTrips(patternWill(cubic), collision, collision, 5),
      'leaky-confine is an involution and must recover the start',
    )
  }),
])

suite('rule/lattice-gas: reversibility (non-involution pair table)', [
  check(
    'pair table round-trips with its PAIRED INVERSE (square)',
    () => {
      const opposite = oppositeOf(square)
      const forward = pairCollision({ opposite, forward: true })
      const inverse = pairCollision({ opposite, forward: false })

      ok(
        roundTrips(patternWill(square), forward, inverse, 5),
        'the paired inverse must undo the forward pair table exactly',
      )
    },
  ),
  check(
    'pair table round-trips with its PAIRED INVERSE (cubic)',
    () => {
      const opposite = oppositeOf(cubic)
      const forward = pairCollision({ opposite, forward: true })
      const inverse = pairCollision({ opposite, forward: false })

      ok(
        roundTrips(patternWill(cubic), forward, inverse, 4),
        'the paired inverse must undo the forward pair table on the cubic coin',
      )
    },
  ),
  check(
    'using the FORWARD table as its own inverse FAILS (it is order-3)',
    () => {
      const opposite = oppositeOf(square)
      const forward = pairCollision({ opposite, forward: true })

      ok(
        !roundTrips(patternWill(square), forward, forward, 1),
        'a non-involution must NOT round-trip through itself',
      )
    },
  ),
])

suite('rule/lattice-gas: charge conservation every beat', [
  check(
    'charge is unchanged after every beat (pair table, square)',
    () => {
      const collision = pairCollision({ opposite: oppositeOf(square) })

      let w = patternWill(square)

      const start = charge(w)

      for (let b = 0; b < 8; b++) {
        w = beat(w, collision)
        equal(
          charge(w),
          start,
          `charge must be conserved at beat ${b + 1}`,
        )
      }
    },
  ),
  check(
    'charge is unchanged after every beat (leaky-confine, cubic)',
    () => {
      const collision = leakyConfine({ opposite: oppositeOf(cubic) })

      let w = patternWill(cubic)

      const start = charge(w)

      for (let b = 0; b < 6; b++) {
        w = beat(w, collision)
        equal(
          charge(w),
          start,
          `charge must be conserved at beat ${b + 1}`,
        )
      }
    },
  ),
])
