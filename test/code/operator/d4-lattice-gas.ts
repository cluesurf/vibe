// Conformance for code/operator/d4-lattice-gas: the 24-direction reversible lattice gas
// on a finite D4 torus. Exact integer facts:
//   - opposite directions form a fixed-point-free involution.
//   - streamD4 followed by streamD4Inverse is the identity (streaming is a permutation
//     of the N*24 slots), and streaming conserves count and momentum.
//   - the collision involution is its own inverse and conserves count and momentum.
//   - d4Count is a popcount.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  D4_DIRECTIONS,
  d4OppositeDirections,
  streamD4,
  streamD4Inverse,
  d4CollisionInvolution,
  d4Count,
  d4Momentum,
} from '@/code/operator/d4-lattice-gas'
import { buildD4Torus } from '@/code/substrate/d4-torus'
import { makeRng } from '@/code/tool/rng'

const torus = buildD4Torus(2)
const roots = torus.roots
const neigh = torus.neigh
const opp = d4OppositeDirections(roots)
const N = neigh.length

// A deterministic occupancy: a 24-bit mask per cell.
function fillOccupancy(seed: number): number[] {
  const rng = makeRng({ seed })

  return Array.from({ length: N }, () => {
    let o = 0

    for (let d = 0; d < D4_DIRECTIONS; d++) {
      if (rng.next() < 0.3) {
        o |= 1 << d
      }
    }

    return o
  })
}

// Independent popcount over 24 bits, summed over cells.
function popcountTotal(occ: readonly number[]): number {
  let total = 0

  for (const o of occ) {
    for (let d = 0; d < D4_DIRECTIONS; d++) {
      total += (o >> d) & 1
    }
  }

  return total
}

const occEqual = (
  a: readonly number[],
  b: readonly number[],
): boolean => a.length === b.length && a.every((v, i) => v === b[i])

suite('operator/d4-lattice-gas: opposite directions', [
  check('opp is a fixed-point-free involution with -root', () => {
    equal(roots.length, D4_DIRECTIONS, 'exactly 24 directions')

    for (let d = 0; d < D4_DIRECTIONS; d++) {
      ok(opp[d] !== d, `direction ${d} has a distinct opposite`)
      equal(opp[opp[d]!], d, 'opp is an involution')

      for (let q = 0; q < 4; q++) {
        equal(roots[opp[d]!]![q], -roots[d]![q]!, 'opp[d] is -root[d]')
      }
    }
  }),
])

suite('operator/d4-lattice-gas: streaming', [
  check('streamD4 then streamD4Inverse is the identity', () => {
    const occ = fillOccupancy(3)
    const there = streamD4({ occupancy: occ, neigh })
    const back = streamD4Inverse({ occupancy: there, neigh, opp })
    ok(occEqual(back, occ), 'streaming is exactly reversible')
  }),
  check(
    'streamD4 is a permutation of the slots (count conserved)',
    () => {
      const occ = fillOccupancy(5)
      const there = streamD4({ occupancy: occ, neigh })
      equal(d4Count(there), d4Count(occ), 'count conserved by stream')
    },
  ),
  check('streamD4 conserves total momentum', () => {
    const occ = fillOccupancy(9)
    const m0 = d4Momentum({ occupancy: occ, roots })
    const m1 = d4Momentum({
      occupancy: streamD4({ occupancy: occ, neigh }),
      roots,
    })

    for (let q = 0; q < 4; q++) {
      equal(m1[q], m0[q], `momentum component ${q} conserved`)
    }
  }),
])

suite('operator/d4-lattice-gas: collision', [
  check('the collision involution is its own inverse', () => {
    const collide = d4CollisionInvolution({ roots, opp })
    const occ = fillOccupancy(13)
    ok(
      occEqual(collide(collide(occ)), occ),
      'collide applied twice is the identity',
    )
  }),
  check(
    'collision conserves count and momentum on a seeded pair',
    () => {
      const collide = d4CollisionInvolution({ roots, opp })
      // Reconstruct the two swapped pair masks the operator uses.
      const k = roots.findIndex(
        (s, i) =>
          i !== 0 &&
          i !== opp[0] &&
          s.every((x, q) => x !== -roots[0]![q]!),
      )

      const A = (1 << 0) | (1 << opp[0]!)
      const B = (1 << k) | (1 << opp[k]!)
      const occ = new Array<number>(N).fill(0)
      occ[0] = A
      occ[1 % N] = B

      const out = collide(occ)
      equal(d4Count(out), d4Count(occ), 'count conserved by collision')

      const m0 = d4Momentum({ occupancy: occ, roots })
      const m1 = d4Momentum({ occupancy: out, roots })

      for (let q = 0; q < 4; q++) {
        equal(
          m1[q],
          m0[q],
          `momentum component ${q} conserved (each pair has zero momentum)`,
        )
      }
    },
  ),
])

suite('operator/d4-lattice-gas: count', [
  check('d4Count equals an independent popcount', () => {
    const occ = fillOccupancy(17)
    equal(
      d4Count(occ),
      popcountTotal(occ),
      'd4Count is a popcount over all slots',
    )
  }),
])
