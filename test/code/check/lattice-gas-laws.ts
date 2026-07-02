// Conformance for code/check/lattice-gas-laws: the conservative-logic laws of the directional lattice gas.
// streamIsPermutation must hold on a periodic mesh (Toffoli's no-fan-out: every slot read exactly once), the
// tone census is the conserved multiset, and censusEqual compares two censuses. We re-derive the census by an
// independent count and confirm that streaming (a pure slot permutation) leaves it fixed. All integer, all exact.

import { suite, check, equal, ok } from '@/test/code/harness'
import { squareMesh, cubicMesh, d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { stream } from '@/code/rule/lattice-gas'
import {
  streamIsPermutation,
  toneCensus,
  censusEqual,
} from '@/code/check/lattice-gas-laws'

// Independent census: count negatives, zeros, positives without calling the module.
function handCensus(data: Int8Array): {
  minus: number
  zero: number
  plus: number
} {
  let minus = 0
  let zero = 0
  let plus = 0

  for (const v of data) {
    if (v < 0) {
      minus++
    } else if (v > 0) {
      plus++
    } else {
      zero++
    }
  }

  return { minus, zero, plus }
}

suite(
  'check/lattice-gas-laws: stream is a permutation on periodic meshes',
  [
    check(
      'square, cubic, and d4 periodic meshes all route bijectively',
      () => {
        ok(
          streamIsPermutation(squareMesh({ side: 5 })),
          'square is a permutation',
        )
        ok(
          streamIsPermutation(cubicMesh({ side: 3 })),
          'cubic is a permutation',
        )
        ok(
          streamIsPermutation(d4Mesh({ side: 3 })),
          'd4 coin is a permutation',
        )
      },
    ),
  ],
)

suite('check/lattice-gas-laws: tone census', [
  check('toneCensus matches an independent count', () => {
    const data = Int8Array.from([-1, -1, 0, 1, 0, 1, 1, -1, 0])
    const c = toneCensus(data)
    const h = handCensus(data)
    equal(c.minus, h.minus, 'minus count')
    equal(c.zero, h.zero, 'zero count')
    equal(c.plus, h.plus, 'plus count')
    // and the totals are conserved: every slot is counted once.
    equal(
      c.minus + c.zero + c.plus,
      data.length,
      'every slot counted once',
    )
  }),
  check('censusEqual is true only when all three counts match', () => {
    const a = { minus: 2, zero: 3, plus: 4 }
    ok(
      censusEqual(a, { minus: 2, zero: 3, plus: 4 }),
      'identical censuses are equal',
    )
    ok(
      !censusEqual(a, { minus: 2, zero: 4, plus: 3 }),
      'shifted zero/plus differ',
    )
  }),
  check('streaming permutes slots, so the census is conserved', () => {
    const will = makeWill(squareMesh({ side: 6 }))
    fillWillPattern(will, 1)

    const before = toneCensus(will.data)
    const after = toneCensus(stream(will).data)
    ok(
      censusEqual(before, after),
      'a pure slot permutation cannot change the census',
    )
  }),
])
