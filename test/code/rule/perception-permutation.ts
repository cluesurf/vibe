// Conformance for code/rule/perception-permutation: the 9-state ternary perception
// permutation on an ordered pair of tones. Two exact laws:
//   - SIGNED PAIR SUM is conserved on every one of the nine transitions (a' + b' = a + b),
//     including the arrow 0,0 -> +1,-1 and its closure +1,-1 -> -1,+1 -> 0,0, which are all
//     net-zero pairs.
//   - it is a BIJECTION on the nine ordered pairs (information-preserving), and the published
//     PERCEPTION_FORWARD table matches perceptionPermutation, with PERCEPTION_INVERSE its
//     exact functional inverse.
// The reversible sweep variants (block CA, edge-colouring) recover the start exactly, and a
// matching of the rule conserves the total signed charge.

import { suite, check, equal } from '@/test/code/harness'
import {
  perceptionPermutation,
  PERCEPTION_FORWARD,
  PERCEPTION_INVERSE,
  perceptionMatchingSweepCsr,
  perceptionBlockBeat,
  perceptionEdgeColoringSweep,
} from '@/code/rule/perception-permutation'

const TONES = [-1, 0, 1]
const pairKey = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

const sum = (a: Int8Array): number => {
  let s = 0

  for (const v of a) {
    s += v
  }

  return s
}

suite('rule/perception-permutation: the 9-state core', [
  check(
    'the signed pair sum is conserved on all nine transitions',
    () => {
      for (const a of TONES) {
        for (const b of TONES) {
          const [na, nb] = perceptionPermutation(a, b)

          equal(
            na + nb,
            a + b,
            `pair (${a},${b}) must preserve the signed sum`,
          )
        }
      }
    },
  ),
  check(
    'the permutation is a bijection on the nine ordered pairs',
    () => {
      const seen = new Set<number>()

      for (const a of TONES) {
        for (const b of TONES) {
          const [na, nb] = perceptionPermutation(a, b)

          seen.add(pairKey(na, nb))
        }
      }

      equal(
        seen.size,
        9,
        'all nine inputs must map to distinct outputs',
      )
    },
  ),
  check(
    'PERCEPTION_FORWARD matches perceptionPermutation exactly',
    () => {
      for (const a of TONES) {
        for (const b of TONES) {
          const [na, nb] = perceptionPermutation(a, b)

          equal(
            PERCEPTION_FORWARD[pairKey(a, b)],
            pairKey(na, nb),
            `forward table at (${a},${b})`,
          )
        }
      }
    },
  ),
  check(
    'PERCEPTION_INVERSE is the exact functional inverse of FORWARD',
    () => {
      for (let i = 0; i < 9; i++) {
        equal(
          PERCEPTION_INVERSE[PERCEPTION_FORWARD[i]!],
          i,
          `inverse undoes index ${i}`,
        )

        equal(
          PERCEPTION_FORWARD[PERCEPTION_INVERSE[i]!],
          i,
          `forward undoes index ${i}`,
        )
      }
    },
  ),
  check('the arrow: 0,0 mints a balanced pair +1,-1', () => {
    const [a, b] = perceptionPermutation(0, 0)

    equal(a, 1, 'peace,peace -> +1 (left)')
    equal(b, -1, 'peace,peace -> -1 (right)')
  }),
])

// A periodic-cycle CSR adjacency on `n` vertices (each vertex linked to its two neighbours).
function cycleCsr(n: number): { offsets: number[]; adj: number[] } {
  const offsets: number[] = [0]
  const adj: number[] = []

  for (let v = 0; v < n; v++) {
    adj.push((v + 1) % n, (v + n - 1) % n)
    offsets.push(adj.length)
  }

  return { offsets, adj }
}

suite('rule/perception-permutation: reversible sweeps and charge', [
  check(
    'block CA forward then inverse recovers the ring exactly',
    () => {
      const length = 8
      const start = Int8Array.from([0, 0, 1, -1, 1, 0, -1, 0])

      for (const parity of [0, 1]) {
        const tone = Int8Array.from(start)

        perceptionBlockBeat({
          tone,
          length,
          parity,
          table: PERCEPTION_FORWARD,
        })

        perceptionBlockBeat({
          tone,
          length,
          parity,
          table: PERCEPTION_INVERSE,
        })

        for (let i = 0; i < length; i++) {
          equal(
            tone[i],
            start[i],
            `parity ${parity}: slot ${i} must return`,
          )
        }
      }
    },
  ),
  check('block CA conserves the total signed charge', () => {
    const length = 8
    const tone = Int8Array.from([0, 0, 1, -1, 1, 0, -1, 0])
    const before = sum(tone)

    perceptionBlockBeat({
      tone,
      length,
      parity: 0,
      table: PERCEPTION_FORWARD,
    })
    equal(sum(tone), before, 'a matching of the rule conserves charge')
  }),
  check(
    'edge-colouring sweep forward then reversed-inverse recovers the start',
    () => {
      // A 6-cycle, properly 2-edge-coloured: even edges one matching, odd edges the other.
      const eu = [0, 1, 2, 3, 4, 5]
      const ev = [1, 2, 3, 4, 5, 0]
      const byColor = [
        [0, 2, 4],
        [1, 3, 5],
      ]

      const start = Int8Array.from([0, 0, 1, -1, 0, 1])
      const tone = Int8Array.from(start)

      perceptionEdgeColoringSweep({
        tone,
        eu,
        ev,
        byColor,
        table: PERCEPTION_FORWARD,
        reverse: false,
      })

      perceptionEdgeColoringSweep({
        tone,
        eu,
        ev,
        byColor,
        table: PERCEPTION_INVERSE,
        reverse: true,
      })

      for (let i = 0; i < start.length; i++) {
        equal(tone[i], start[i], `vertex ${i} must return to its start`)
      }
    },
  ),
  check(
    'CSR matching sweep conserves charge and is deterministic',
    () => {
      const n = 6
      const { offsets, adj } = cycleCsr(n)
      const base = Int8Array.from([0, 0, 1, -1, 1, 0])
      const before = sum(base)

      const a = Int8Array.from(base)
      const b = Int8Array.from(base)
      const matched = new Uint8Array(n)

      perceptionMatchingSweepCsr({
        tone: a,
        offsets,
        adj,
        matched,
        start: 0,
      })

      perceptionMatchingSweepCsr({
        tone: b,
        offsets,
        adj,
        matched,
        start: 0,
      })

      equal(sum(a), before, 'the matching must conserve total charge')

      for (let i = 0; i < n; i++) {
        equal(
          a[i],
          b[i],
          `deterministic: slot ${i} must match across runs`,
        )
      }
    },
  ),
])
