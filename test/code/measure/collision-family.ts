// Conformance for code/measure/collision-family. The free part of the knit is the pairing of the 12
// lines into 6 pairs, so the total count of pairings is the number of perfect matchings of 12
// labelled elements, the double factorial (12-1)!! = 11*9*7*5*3*1 = 10395. We re-derive that integer
// independently and pin the enumerator to it. The count of B4-symmetric pairings is bounded (it is a
// subset of the total, and at least one symmetric pairing exists).

import { suite, check, equal, ok } from '@/test/code/harness'
import { linePairingFamily } from '@/code/measure/collision-family'

// (2n-1)!! independently, the number of perfect matchings of 2n labelled points.
function doubleFactorialOdd(twoN: number): number {
  let product = 1

  for (let k = twoN - 1; k >= 1; k -= 2) {
    product *= k
  }

  return product
}

suite('measure/collision-family: linePairingFamily', [
  check(
    'total pairings = (12-1)!! = 10395 perfect matchings of 12 lines',
    () => {
      equal(doubleFactorialOdd(12), 10395) // re-derived constant
      equal(linePairingFamily().totalPairings, 10395)
    },
  ),
  check(
    'symmetric pairings are a nonempty subset of all pairings',
    () => {
      const { totalPairings, symmetricPairings } = linePairingFamily()
      ok(
        symmetricPairings >= 1,
        'at least one B4-invariant pairing exists',
      )
      ok(
        symmetricPairings <= totalPairings,
        'symmetric count cannot exceed total',
      )
      ok(Number.isInteger(symmetricPairings))
    },
  ),
])
