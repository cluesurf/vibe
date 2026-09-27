// The discrete symmetry ledger of a collision schedule on one cell: every coin permutation p, every
// relabelling tau of the three tones, and every shift in time, tried as a FORWARD symmetry and as a
// REVERSAL symmetry.
//
//   forward   tau p C_t = C_(t + k) tau p           for every beat t (k the time shift)
//   reversal  tau p C_t = C_(m - t)^-1 tau p        for every beat t (m the mirror phase)
//
// Both rules of the lattice gas apply one collision in every cell and stream every slot along its
// direction, so streaming commutes with every linear coin permutation and the question is exactly
// one about the cell's collision. A reversal found here with coin part q is, on the lattice, the
// velocity reversal (slot d to its opposite) composed with the spatial map -q, since running a
// history backward also reverses every velocity. In four dimensions -q and q have the same
// determinant, so the ledger's determinant is the lattice's orientation character either way:
// +1 a rotation, -1 a reflection (a parity).
//
// The check is exact on the states it is given. Candidates are rejected on a quick set (the 48
// lone-tone states and a dense fill) and every survivor is confirmed on a larger dense set. The
// dense fills are deterministic low-discrepancy patterns, never random draws. The same search in
// forward form alone is E-FRC-0113 (test/experiment/gauge/hidden-rule-symmetries.ts), whose inline
// search this module generalizes to reversals.

import { Collision } from '@/code/rule/collision'
import { determinant } from '@/code/algebra/linear/dense'
import { linearMapOf } from '@/code/substrate/d4-box'

// the six relabellings of the three tones, each the images of (fear, calm, love) = (-1, 0, +1)
export const TONE_RELABELLINGS: readonly (readonly number[])[] = [
  [-1, 0, 1],
  [-1, 1, 0],
  [0, -1, 1],
  [0, 1, -1],
  [1, -1, 0],
  [1, 0, -1],
]

// the index of charge conjugation (fear and love swapped, calm kept) in TONE_RELABELLINGS
export const CHARGE_CONJUGATION = 5

const GOLDEN = (Math.sqrt(5) - 1) / 2

// deterministic dense cell states, a golden-ratio fill with about 30 percent fear, 30 percent love
export function denseCellStates(input: {
  count: number
  offset: number
  degree: number
}): Int8Array[] {
  const { count, offset, degree } = input
  const states: Int8Array[] = []

  for (let n = 0; n < count; n++) {
    const state = new Int8Array(degree)

    for (let d = 0; d < degree; d++) {
      const u = ((offset + n * degree + d + 1) * GOLDEN) % 1

      state[d] = u < 0.3 ? -1 : u < 0.6 ? 1 : 0
    }

    states.push(state)
  }

  return states
}

// the 2 * degree states holding one fear or one love and nothing else
export function loneCellStates(degree: number): Int8Array[] {
  const out: Int8Array[] = []

  for (let d = 0; d < degree; d++) {
    for (const tone of [1, -1]) {
      const state = new Int8Array(degree)

      state[d] = tone
      out.push(state)
    }
  }

  return out
}

// The states that make each four-slot move fire: for a move [u, v, w, x] (u to w, v to x), tones on u and v
// with every other slot calm, and on w and x likewise, in all four sign combinations. A move whose firing
// asks only that its own slots be held and its opposite slots be calm fires on these; a map that carries
// the move to one the rule does not make is caught on them
export function moveFiringStates(input: {
  moves: readonly (readonly [number, number, number, number])[]
  degree: number
}): Int8Array[] {
  const out: Int8Array[] = []

  for (const [u, v, w, x] of input.moves) {
    for (const [a, b] of [
      [u, v],
      [w, x],
    ] as const) {
      for (const sa of [1, -1]) {
        for (const sb of [1, -1]) {
          const state = new Int8Array(input.degree)

          state[a] = sa
          state[b] = sb
          out.push(state)
        }
      }
    }
  }

  return out
}

export type LedgerEntry = {
  // index into the permutation list
  p: number
  // index into TONE_RELABELLINGS
  tau: number
  // the time shift k (forward) or the mirror phase m (reversal)
  phase: number
  kind: 'forward' | 'reversal'
}

// apply tau p to a cell state: the tone in slot d lands relabelled in slot p[d]
function carry(
  out: Int8Array,
  state: Int8Array,
  p: readonly number[],
  tau: readonly number[],
): void {
  for (let d = 0; d < state.length; d++) {
    out[p[d] ?? 0] = tau[(state[d] ?? 0) + 1] ?? 0
  }
}

export function symmetryLedger(input: {
  forward: (beat: number) => Collision
  inverse: (beat: number) => Collision
  period: number
  permutations: readonly (readonly number[])[]
  degree: number
  relabellings?: readonly (readonly number[])[]
  quickDense?: number
  thoroughDense?: number
  // states a piece of the collision needs to fire at all, added to the quick set: a rule whose pieces
  // fire only in configurations the dense fills rarely reach (a four-line scattering needs two lone
  // tones going into two wholly calm lines) is otherwise tested blind to those pieces
  extraStates?: readonly Int8Array[]
}): LedgerEntry[] {
  const { period, permutations, degree } = input
  const relabellings = input.relabellings ?? TONE_RELABELLINGS
  const quick = [
    ...loneCellStates(degree),
    ...(input.extraStates ?? []),
    ...denseCellStates({ count: input.quickDense ?? 64, offset: 0, degree }),
  ]
  const thorough = denseCellStates({
    count: input.thoroughDense ?? 2048,
    offset: 5000,
    degree,
  })
  const forward = Array.from({ length: period }, (_, t) => input.forward(t))
  const inverse = Array.from({ length: period }, (_, t) => input.inverse(t))
  const a = new Int8Array(degree)
  const b = new Int8Array(degree)

  const holds = (
    p: readonly number[],
    tau: readonly number[],
    phase: number,
    kind: 'forward' | 'reversal',
    states: readonly Int8Array[],
  ): boolean => {
    for (const state of states) {
      for (let t = 0; t < period; t++) {
        // a = tau p C_t state
        b.set(state)
        forward[t]?.(b, 0, degree)
        carry(a, b, p, tau)

        // b = C'(tau p state), C' = C_(t + k) or C_(m - t)^-1
        carry(b, state, p, tau)

        const target =
          kind === 'forward'
            ? forward[(t + phase) % period]
            : inverse[(((phase - t) % period) + period) % period]

        target?.(b, 0, degree)

        for (let d = 0; d < degree; d++) {
          if (a[d] !== b[d]) {
            return false
          }
        }
      }
    }

    return true
  }

  const found: LedgerEntry[] = []

  permutations.forEach((p, pi) => {
    relabellings.forEach((tau, ti) => {
      for (const kind of ['forward', 'reversal'] as const) {
        for (let phase = 0; phase < period; phase++) {
          if (
            holds(p, tau, phase, kind, quick) &&
            holds(p, tau, phase, kind, thorough)
          ) {
            found.push({ p: pi, tau: ti, phase, kind })
          }
        }
      }
    })
  })

  return found
}

// the collision conjugated by a coin permutation, p C p^-1: the rule's image under p. A state s' of the
// image rule is read back to s[d] = s'[p[d]], collided, and carried forward to s''[p[d]] = C(s)[d].
export function conjugateCollision(input: {
  collision: Collision
  permutation: readonly number[]
}): Collision {
  const { collision, permutation } = input
  const degree = permutation.length
  const cell = new Int8Array(degree)

  return (slots, base) => {
    for (let d = 0; d < degree; d++) {
      cell[d] = slots[base + (permutation[d] ?? 0)] ?? 0
    }

    collision(cell, 0, degree)

    for (let d = 0; d < degree; d++) {
      slots[base + (permutation[d] ?? 0)] = cell[d] ?? 0
    }
  }
}

// the determinant of a permutation of the 24 D4 roots read as a linear map of R^4: +1 for a
// rotation, -1 for a reflection, 0 when the permutation is not linear
export function orientationOf(permutation: readonly number[]): number {
  const matrix = linearMapOf(permutation)

  return matrix ? Math.round(determinant(matrix)) : 0
}
