// Conformance for code/rule/viscous-collision: the momentum-mixing collision that gives the lattice gas a finite
// bulk viscosity. The load-bearing facts are exact:
//   - buildViscousQuads emits DISJOINT quads (no slot reused), and the two pairs of each quad carry the SAME
//     total momentum (root[a]+root[b] = root[c]+root[d]), which is why swapping them conserves momentum.
//   - viscousRotate (and its controlled variant) is a self-inverse INVOLUTION that conserves mass (the count of
//     occupied slots) and the full momentum vector.
// We re-derive the momentum sum from the D4 roots, independent of the implementation.

import { suite, check, equal, ok } from '@/test/code/harness'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  buildViscousQuads,
  viscousRotate,
  controlledViscousRotate,
} from '@/code/rule/viscous-collision'
import { Collision } from '@/code/rule/collision'

const D4 = rootsD4()
const DEGREE = D4.length // 24

// Total momentum of a single cell's occupancy: sum over occupied slots of the direction root.
function momentum(slots: Int8Array): number[] {
  const m = [0, 0, 0, 0]

  for (let d = 0; d < DEGREE; d++) {
    if (slots[d] === 1) {
      for (let axis = 0; axis < 4; axis++) {
        m[axis]! += D4[d]![axis]!
      }
    }
  }

  return m
}

function count(slots: Int8Array): number {
  let n = 0

  for (const v of slots) {
    if (v === 1) {
      n++
    }
  }

  return n
}

function apply(collision: Collision, slots: Int8Array): Int8Array {
  const copy = Int8Array.from(slots)
  collision(copy, 0, copy.length)

  return copy
}

const quads = buildViscousQuads(D4)

suite(
  'rule/viscous-collision: quads are disjoint and momentum-matched',
  [
    check(
      'the two pairs of each quad carry equal total momentum',
      () => {
        for (const quad of quads) {
          const [a, b, c, d] = quad as [number, number, number, number]

          for (let axis = 0; axis < 4; axis++) {
            equal(
              D4[a]![axis]! + D4[b]![axis]!,
              D4[c]![axis]! + D4[d]![axis]!,
              `quad ${quad.join(',')} axis ${axis} momentum match`,
            )
          }
        }
      },
    ),
    check(
      'no slot index is reused across quads (disjoint involution factors)',
      () => {
        const seen = new Set<number>()

        for (const quad of quads) {
          for (const slot of quad) {
            ok(!seen.has(slot), `slot ${slot} used twice`)
            seen.add(slot)
          }
        }

        equal(
          seen.size,
          quads.length * 4,
          'every quad contributes four fresh slots',
        )
      },
    ),
  ],
)

// A deterministic occupancy pattern over the 24 slots.
function pattern(): Int8Array {
  const slots = new Int8Array(DEGREE)

  for (let i = 0; i < DEGREE; i++) {
    slots[i] = i % 3 === 0 ? 1 : 0
  }

  return slots
}

suite(
  'rule/viscous-collision: viscousRotate is a conserving involution',
  [
    check('applying it twice is the identity', () => {
      const start = pattern()
      const twice = apply(
        viscousRotate({ directions: D4 }),
        apply(viscousRotate({ directions: D4 }), start),
      )

      equal(
        JSON.stringify(Array.from(twice)),
        JSON.stringify(Array.from(start)),
        'self-inverse',
      )
    }),
    check('it conserves mass and the full momentum vector', () => {
      const start = pattern()
      const after = apply(viscousRotate({ directions: D4 }), start)
      equal(count(after), count(start), 'count (mass) conserved')
      equal(
        JSON.stringify(momentum(after)),
        JSON.stringify(momentum(start)),
        'momentum conserved',
      )
    }),
    check(
      'it actually moves occupancy when a quad fires (not a no-op)',
      () => {
        const [a, b, c, d] = quads[0] as [
          number,
          number,
          number,
          number,
        ]

        const slots = new Int8Array(DEGREE)
        slots[a] = 1
        slots[b] = 1 // pair occupied, partner (c,d) empty -> must swap

        const after = apply(viscousRotate({ directions: D4 }), slots)
        equal(after[a], 0, 'pair emptied')
        equal(after[b], 0, 'pair emptied')
        equal(after[c], 1, 'partner filled')
        equal(after[d], 1, 'partner filled')
      },
    ),
  ],
)

suite(
  'rule/viscous-collision: controlled variant stays a conserving involution',
  [
    check('the controlled collision is also self-inverse', () => {
      const start = pattern()
      const collision = controlledViscousRotate({ directions: D4 })
      const twice = apply(collision, apply(collision, start))
      equal(
        JSON.stringify(Array.from(twice)),
        JSON.stringify(Array.from(start)),
        'self-inverse',
      )
    }),
    check(
      'the controlled collision conserves mass and momentum',
      () => {
        const start = pattern()
        const after = apply(
          controlledViscousRotate({ directions: D4 }),
          start,
        )

        equal(count(after), count(start), 'count conserved')
        equal(
          JSON.stringify(momentum(after)),
          JSON.stringify(momentum(start)),
          'momentum conserved',
        )
      },
    ),
  ],
)
