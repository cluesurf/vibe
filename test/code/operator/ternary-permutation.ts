// Conformance for code/operator/ternary-permutation: the deterministic conserving pair
// rule and its parity-block sweep. Exact integer facts:
//   - the pair update is a bijection on the 9 pair-states (both create modes).
//   - the pair update conserves the pair charge a + b.
//   - the committed table entries match the spec.
//   - a 3D parity-block beat conserves total charge.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  ternaryPairPermutation,
  parityBlockBeat3D,
} from '@/code/operator/ternary-permutation'

const TONES = [-1, 0, 1]
const pairKey = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

function isBijection(create: boolean): boolean {
  const seen = new Set<number>()

  for (const a of TONES) {
    for (const b of TONES) {
      const [na, nb] = ternaryPairPermutation(a, b, create)

      seen.add(pairKey(na, nb))
    }
  }

  return seen.size === 9
}

function conserves(create: boolean): boolean {
  for (const a of TONES) {
    for (const b of TONES) {
      const [na, nb] = ternaryPairPermutation(a, b, create)

      if (na + nb !== a + b) return false
    }
  }

  return true
}

suite('operator/ternary-permutation: the pair update', [
  check(
    'is a bijection on the 9 pair-states only when creating',
    () => {
      // Reversibility (the permutation property) needs create = true: it makes
      // (0,0) -> (1,-1) -> (-1,1) -> (0,0) a 3-cycle. Without creation, annihilation
      // (-1,1) -> (0,0) collides with the held (0,0) -> (0,0), so it is NOT a bijection.
      ok(
        isBijection(true),
        'permutes all 9 states when creating (reversible CA mode)',
      )

      ok(
        !isBijection(false),
        'NOT a permutation without creation (annihilation has no inverse source)',
      )
    },
  ),
  check('conserves the pair charge a + b in both modes', () => {
    ok(conserves(false), 'charge conserved (create = false)')
    ok(conserves(true), 'charge conserved (create = true)')
  }),
  check('committed table entries match the spec', () => {
    equal(
      ternaryPairPermutation(0, 0, true).join(','),
      '1,-1',
      'two peaces create +,- when creating',
    )

    equal(
      ternaryPairPermutation(0, 0, false).join(','),
      '0,0',
      'two peaces hold when not creating',
    )

    equal(
      ternaryPairPermutation(-1, 1, true).join(','),
      '0,0',
      '-,+ annihilates to 0,0',
    )

    equal(
      ternaryPairPermutation(1, -1, true).join(','),
      '-1,1',
      '+,- swaps to -,+',
    )

    equal(
      ternaryPairPermutation(1, 0, true).join(','),
      '0,1',
      'a charge hops into the 0',
    )

    equal(
      ternaryPairPermutation(1, 1, true).join(','),
      '1,1',
      'like charges hold',
    )
  }),
])

suite('operator/ternary-permutation: 3D parity-block beat', [
  check('a full beat conserves total charge', () => {
    const side = 2

    const index = (x: number, y: number, z: number): number => {
      const w = (v: number): number => ((v % side) + side) % side

      return w(x) + side * w(y) + side * side * w(z)
    }

    const tone = Int8Array.from([1, -1, 0, 1, -1, 0, 1, -1])
    const before = tone.reduce((s, v) => s + v, 0)

    parityBlockBeat3D({ tone, side, index, create: true })

    const after = tone.reduce((s, v) => s + v, 0)

    equal(
      after,
      before,
      'every pair move conserves charge, so the beat does too',
    )
  }),
])
