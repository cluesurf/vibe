// Conformance for code/dynamics/free-fall: geodesic descent of mass cells down a potential. Invariants:
//   - MASS CONSERVATION: a beat is a set of hops, so the occupied-cell count is exactly preserved.
//   - EQUIVALENCE PRINCIPLE: in a uniform field the leading edge of a body advances one cell per beat
//     regardless of the body's mass (a light body and a heavy body fall at the same rate).
//   - DETERMINISM (no RNG).

import { suite, check, equal } from '@/test/code/harness'
import { freeFallStep } from '@/code/dynamics/free-fall'

// A 1D line of `cellCount` cells. Direction 0 = down (c-1), 1 = up (c+1). Off the ends, the neighbour
// is the cell itself (its potential is not lower, so nothing moves off the edge).
function lineSetup(cellCount: number): {
  phi: Int32Array
  neighbour: (c: number, d: number) => number
  cellCount: number
  spatialDegree: number
} {
  const phi = Int32Array.from({ length: cellCount }, (_, c) => c) // lower index = lower potential
  const neighbour = (c: number, d: number): number =>
    d === 0 ? (c - 1 >= 0 ? c - 1 : c) : c + 1 < cellCount ? c + 1 : c

  return { phi, neighbour, cellCount, spatialDegree: 2 }
}

const countOccupied = (o: Uint8Array): number =>
  o.reduce((s, v) => s + v, 0)

const minOccupied = (o: Uint8Array): number => {
  for (let i = 0; i < o.length; i++) {
    if (o[i]) {
      return i
    }
  }

  return -1
}

suite('dynamics/free-fall: mass conservation', [
  check(
    'the occupied-cell count is preserved across many beats',
    () => {
      const setup = lineSetup(20)
      const occupied = new Uint8Array(20)

      occupied[10] = 1
      occupied[11] = 1
      occupied[12] = 1

      const before = countOccupied(occupied)

      for (let b = 0; b < 15; b++) {
        freeFallStep({ occupied, ...setup })
        equal(
          countOccupied(occupied),
          before,
          `count preserved at beat ${b}`,
        )
      }
    },
  ),
])

suite('dynamics/free-fall: equivalence principle', [
  check(
    'the leading edge advances one cell per beat, independent of mass',
    () => {
      const setup = lineSetup(30)
      const light = new Uint8Array(30)

      light[20] = 1

      const heavy = new Uint8Array(30)

      heavy[20] = 1
      heavy[21] = 1
      heavy[22] = 1
      heavy[23] = 1

      for (let b = 1; b <= 8; b++) {
        freeFallStep({ occupied: light, ...setup })
        freeFallStep({ occupied: heavy, ...setup })
        equal(
          minOccupied(light),
          20 - b,
          `light leading edge at beat ${b}`,
        )

        equal(
          minOccupied(heavy),
          20 - b,
          `heavy leading edge at beat ${b}`,
        )
      }
    },
  ),
  check(
    'an isolated mass moves exactly one cell per beat until the bottom',
    () => {
      const setup = lineSetup(10)
      const occupied = new Uint8Array(10)

      occupied[5] = 1

      for (let b = 1; b <= 5; b++) {
        const moved = freeFallStep({ occupied, ...setup })

        equal(moved, 1, `one move at beat ${b}`)
        equal(minOccupied(occupied), 5 - b, `position at beat ${b}`)
      }

      // at the bottom there is no lower neighbour, so it stops
      equal(
        freeFallStep({ occupied, ...setup }),
        0,
        'no move at the bottom',
      )
    },
  ),
])

suite('dynamics/free-fall: determinism', [
  check('two identical setups evolve identically', () => {
    const setup = lineSetup(20)
    const a = new Uint8Array(20)

    a[10] = 1
    a[12] = 1

    const b = new Uint8Array(20)

    b[10] = 1
    b[12] = 1

    for (let t = 0; t < 8; t++) {
      freeFallStep({ occupied: a, ...setup })
      freeFallStep({ occupied: b, ...setup })
    }

    for (let i = 0; i < 20; i++) {
      equal(a[i]!, b[i]!, `cell ${i}`)
    }
  }),
])
