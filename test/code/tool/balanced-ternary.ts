// Conformance for code/tool/balanced-ternary: base three with digits {-1, 0, +1}, the tone alphabet as a
// signed-integer code. The math is exact (integer arithmetic), so every check is an EQUALITY. We re-derive the
// digit cap, the positional value, and a handful of expansions independently of the implementation, then lean on
// those to assert the round-trip holds across the whole representable range.

import {
  suite,
  check,
  equal,
  ok,
  exactArray,
} from '@/test/code/harness'
import {
  balancedTernaryCap,
  toBalancedTernary,
  fromBalancedTernary,
  isBalancedTernaryField,
} from '@/code/tool/balanced-ternary'

// Independent positional value of little-endian balanced-ternary digits: sum d[i] * 3^i. This does NOT call the
// module, so using it to check fromBalancedTernary is a genuine second route, not a tautology.
function valueOfDigits(digits: readonly number[]): number {
  let value = 0
  let power = 1

  for (const d of digits) {
    value += d * power
    power *= 3
  }

  return value
}

suite('tool/balanced-ternary: digit cap', [
  check('cap is (3^K - 1) / 2 for K = 1..5', () => {
    equal(balancedTernaryCap(1), 1, 'one trit covers [-1, 1]')
    equal(balancedTernaryCap(2), 4, 'two trits cover [-4, 4]')
    equal(balancedTernaryCap(3), 13, 'three trits cover [-13, 13]')
    equal(balancedTernaryCap(4), 40, 'four trits cover [-40, 40]')
    equal(balancedTernaryCap(5), 121, 'five trits cover [-121, 121]')
  }),
])

suite('tool/balanced-ternary: hand-derived expansions', [
  check(
    'known little-endian expansions match the hand derivation',
    () => {
      exactArray(toBalancedTernary(0, 3), [0, 0, 0], 'zero')
      exactArray(toBalancedTernary(1, 3), [1, 0, 0], 'one')
      exactArray(toBalancedTernary(-1, 3), [-1, 0, 0], 'minus one')
      exactArray(toBalancedTernary(2, 3), [-1, 1, 0], '2 = -1 + 1*3')
      exactArray(toBalancedTernary(4, 3), [1, 1, 0], '4 = 1 + 1*3')
      exactArray(toBalancedTernary(5, 3), [-1, -1, 1], '5 = -1 -3 + 9')
      exactArray(toBalancedTernary(13, 3), [1, 1, 1], '13 = 1 + 3 + 9')
      exactArray(toBalancedTernary(-13, 3), [-1, -1, -1], '-13')
    },
  ),
  check('every produced digit is a tone in {-1, 0, +1}', () => {
    for (let v = -13; v <= 13; v++) {
      for (const d of toBalancedTernary(v, 3)) {
        ok(
          d === -1 || d === 0 || d === 1,
          `digit ${d} of ${v} must be a tone`,
        )
      }
    }
  }),
])

suite(
  'tool/balanced-ternary: fromBalancedTernary is the positional value',
  [
    check(
      'fromBalancedTernary equals the independent positional sum',
      () => {
        const samples: number[][] = [
          [0, 0, 0],
          [1, 0, 0],
          [-1, 1, 0],
          [1, 1, 0],
          [-1, -1, 1],
          [1, 1, 1],
          [-1, -1, -1],
          [1, -1, 1, -1],
        ]

        for (const digits of samples) {
          equal(
            fromBalancedTernary(digits),
            valueOfDigits(digits),
            `positional value of ${digits.join(',')}`,
          )
        }
      },
    ),
  ],
)

suite('tool/balanced-ternary: round-trip over the whole range', [
  ...[1, 2, 3, 4].map(K =>
    check(
      `from(to(v)) === v for every representable v at K=${K}`,
      () => {
        const cap = balancedTernaryCap(K)

        for (let v = -cap; v <= cap; v++) {
          equal(
            fromBalancedTernary(toBalancedTernary(v, K)),
            v,
            `round-trip ${v}`,
          )
        }
      },
    ),
  ),
  check(
    'out-of-range values clamp to the nearest representable bound',
    () => {
      // K=1 caps at 1, so anything above clamps to +1, below to -1.
      exactArray(toBalancedTernary(7, 1), [1], 'clamp high to cap')
      exactArray(toBalancedTernary(-7, 1), [-1], 'clamp low to -cap')
      equal(
        fromBalancedTernary(toBalancedTernary(99, 2)),
        4,
        'clamp to +4 at K=2',
      )

      equal(
        fromBalancedTernary(toBalancedTernary(-99, 2)),
        -4,
        'clamp to -4 at K=2',
      )
    },
  ),
])

suite('tool/balanced-ternary: field representability', [
  check(
    'a field within the cap is representable, one over is not',
    () => {
      ok(
        isBalancedTernaryField([-13, 0, 7, 13], 3),
        'all within +/-13 at K=3',
      )

      ok(
        !isBalancedTernaryField([0, 14], 3),
        '14 exceeds the K=3 cap of 13',
      )

      ok(
        !isBalancedTernaryField([-14, 0], 3),
        '-14 exceeds the K=3 cap',
      )

      ok(
        isBalancedTernaryField([1, -1, 0], 1),
        'single trits all within +/-1',
      )

      ok(
        !isBalancedTernaryField([2], 1),
        '2 exceeds the single-trit cap',
      )
    },
  ),
])
