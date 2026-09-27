// The exact linearized collision of a knit whose dock collision is a coin map chosen by the twelve line
// momenta, at the uniform background (every slot fear, calm or love with chance 1/3), by enumerating the 3^12
// line-momentum vectors (E-RLT-0061 to E-RLT-0063).
//
// code/measure/exact-linear-collision counts the linearization of a knit made of small slot blocks. A
// whole-dock collision such as the isometric knit (code/rule/isometric-knit) reads all 24 slots at once, so
// that method would need 3^24 states. What makes it exact here is that the collision C(x) = w(n) x depends on
// x only through the line momenta n_l = |x_first| - |x_second|, and given n the twelve lines are independent:
//
//   n_l = +1  first holds a love or a fear, second calm      2 of the 9 line states
//   n_l = -1  first calm, second holds a love or a fear      2
//   n_l =  0  both calm, or both held (4 vibe pairs)         5
//
// So the joint chance that slot d holds a and slot f holds b, given n, is a product over lines (a joint table
// when d and f share a line), and the count behind every entry is an integer below 3^24 (exact in doubles).
// With C(x)_e = x_(w^-1 e),
//
//   A[(e, b), (d, a)] = 3 (P(x_d = a, C(x)_e = b) - P(x_d = calm, C(x)_e = b)),  a, b in {love, fear}
//
// the layout of code/coarse/knit-boltzmann (index d * 2 + (0 love, 1 fear), rows the output). The identity
// collision gives A = I exactly, so only the line-momentum vectors where w moves some slot are visited, and
// only their moved outputs.
//
// A sampled estimate (sampledLinearization) over golden-ratio dock states runs the collision function itself,
// the independent second method.

import { type Collision } from '@/code/rule/collision'
import { LINE_FIRSTS, LINE_OF, OPPOSITE, SIDE, type LineMomentumRule } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weyl } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const TOTAL = 3 ** 24
// value index: 0 love, 1 fear, 2 calm
const LOVE = 0
const FEAR = 1
const CALM = 2

export type LineMomentumLinearization = {
  // the 48 x 48 linearized collision
  readonly matrix: Float64Array
  // the chance, over the uniform background, that the rule applies a coin map other than the identity
  readonly acting: number
  // how many of the 3^12 line-momentum vectors it acts on
  readonly actingVectors: number
}

// numerator of the chance that a slot on a line in state n holds value v (denominator 2 when n is +-1, 5
// when n is 0), for a first (side +1) or second (side -1) slot
function slotNumerator(n: number, side: number, v: number): number {
  if (n === 0) {
    return v === CALM ? 1 : 2
  }

  // the held slot is the first when n = +1
  const held = (n === 1) === (side === 1)

  if (held) {
    return v === CALM ? 0 : 1
  }

  return v === CALM ? 2 : 0
}

// numerator of the joint chance (first holds a, second holds b) on a line in state n
function lineJointNumerator(n: number, a: number, b: number): number {
  if (n === 0) {
    return (a === CALM) === (b === CALM) ? 1 : 0
  }

  if (n === 1) {
    return a !== CALM && b === CALM ? 1 : 0
  }

  return a === CALM && b !== CALM ? 1 : 0
}

export function lineMomentumLinearization(input: { rule: LineMomentumRule; columns?: readonly number[] }): LineMomentumLinearization {
  const columns = input.columns ?? Array.from({ length: 24 }, (_, d) => d)
  // delta[((d * 24 + e) * 3 + a) * 2 + b]: the count change P(x_d = a, C(x)_e = b) - P(x_d = a, x_e = b), times 3^24
  const delta = new Float64Array(24 * 24 * 3 * 2)
  const n = new Int8Array(12)
  const p = [0, 0, 0, 0]
  const inverse = new Int32Array(24)
  const numerator = new Float64Array(24 * 3)
  const denominator = new Float64Array(24)
  let acting = 0
  let actingVectors = 0

  // the joint count of (x_d = a, x_f = b) given n, times count(n)
  const joint = (d: number, f: number, a: number, b: number, count: number): number => {
    if (f === d) {
      return a === b ? (count / (denominator[d] ?? 1)) * (numerator[d * 3 + a] ?? 0) : 0
    }

    if (f === OPPOSITE[d]) {
      const first = SIDE[d] === 1 ? a : b
      const second = SIDE[d] === 1 ? b : a

      return (count / (denominator[d] ?? 1)) * lineJointNumerator(n[LINE_OF[d] ?? 0] ?? 0, first, second)
    }

    return (count / ((denominator[d] ?? 1) * (denominator[f] ?? 1))) * (numerator[d * 3 + a] ?? 0) * (numerator[f * 3 + b] ?? 0)
  }

  for (let code = 0; code < 3 ** 12; code++) {
    let rest = code
    let count = 1

    p[0] = 0
    p[1] = 0
    p[2] = 0
    p[3] = 0

    for (let l = 0; l < 12; l++) {
      const value = (rest % 3) - 1
      const r = ROOTS[LINE_FIRSTS[l] ?? 0] ?? []

      rest = Math.floor(rest / 3)
      n[l] = value
      count *= value === 0 ? 5 : 2

      if (value !== 0) {
        p[0] += value * (r[0] ?? 0)
        p[1] += value * (r[1] ?? 0)
        p[2] += value * (r[2] ?? 0)
        p[3] += value * (r[3] ?? 0)
      }
    }

    const w = input.rule(n, p)

    if (!w) {
      continue
    }

    let moves = false

    for (let d = 0; d < 24; d++) {
      inverse[w[d] ?? 0] = d
      moves = moves || w[d] !== d
    }

    if (!moves) {
      continue
    }

    acting += count
    actingVectors++

    for (let s = 0; s < 24; s++) {
      const line = n[LINE_OF[s] ?? 0] ?? 0

      denominator[s] = line === 0 ? 5 : 2

      for (let v = 0; v < 3; v++) numerator[s * 3 + v] = slotNumerator(line, SIDE[s] ?? 1, v)
    }

    for (const d of columns) {
      for (let e = 0; e < 24; e++) {
        const f = inverse[e] ?? e

        if (f === e) continue

        for (let a = 0; a < 3; a++) {
          for (let b = 0; b < 2; b++) {
            const index = ((d * 24 + e) * 3 + a) * 2 + b

            delta[index] = (delta[index] ?? 0) + joint(d, f, a, b, count) - joint(d, e, a, b, count)
          }
        }
      }
    }
  }

  const matrix = new Float64Array(48 * 48)

  for (let i = 0; i < 48; i++) matrix[i * 48 + i] = 1

  for (const d of columns) {
    for (let e = 0; e < 24; e++) {
      for (const a of [LOVE, FEAR]) {
        for (const b of [LOVE, FEAR]) {
          const change = (delta[((d * 24 + e) * 3 + a) * 2 + b] ?? 0) - (delta[((d * 24 + e) * 3 + CALM) * 2 + b] ?? 0)

          matrix[(e * 2 + b) * 48 + d * 2 + a] = (matrix[(e * 2 + b) * 48 + d * 2 + a] ?? 0) + (3 * change) / TOTAL
        }
      }
    }
  }

  return { matrix, acting: acting / TOTAL, actingVectors }
}

// the first 24 primes: slot d of a sampled dock state reads the Weyl orbit of frac(sqrt(q_d)), so the 24
// slots of sample m are one point of a 24-dimensional Kronecker sequence (equidistributed on the 24-cube by
// Besicovitch and Kronecker), never neighbors of one rotation, which would correlate adjacent slots
const SLOT_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89]

// A sampled estimate of the same matrix from the collision function: `samples` dock states, each slot fear,
// calm or love by thirds of its own Weyl orbit, the joint frequencies counted.
export function sampledLinearization(input: { collision: Collision; samples: number }): Float64Array {
  const counts = new Float64Array(24 * 3 * 24 * 2)
  const state = new Int8Array(24)
  const before = new Int8Array(24)
  const index = (v: number): number => (v === 1 ? LOVE : v === -1 ? FEAR : CALM)
  const rates = SLOT_PRIMES.map(q => Math.sqrt(q) - Math.floor(Math.sqrt(q)))

  for (let m = 0; m < input.samples; m++) {
    for (let d = 0; d < 24; d++) {
      const u = weyl(m + 1, rates[d] ?? 0)

      state[d] = u < 1 / 3 ? -1 : u < 2 / 3 ? 0 : 1
      before[d] = state[d] ?? 0
    }

    input.collision(state, 0, 24)

    for (let d = 0; d < 24; d++) {
      const a = index(before[d] ?? 0)

      for (let e = 0; e < 24; e++) {
        const out = state[e] ?? 0

        if (out === 0) continue

        const cell = ((d * 3 + a) * 24 + e) * 2 + (out === 1 ? 0 : 1)

        counts[cell] = (counts[cell] ?? 0) + 1
      }
    }
  }

  const matrix = new Float64Array(48 * 48)

  for (let d = 0; d < 24; d++) {
    for (let e = 0; e < 24; e++) {
      for (const a of [LOVE, FEAR]) {
        for (const b of [0, 1]) {
          const joint = (counts[((d * 3 + a) * 24 + e) * 2 + b] ?? 0) / input.samples
          const calm = (counts[((d * 3 + CALM) * 24 + e) * 2 + b] ?? 0) / input.samples

          matrix[(e * 2 + b) * 48 + d * 2 + a] = 3 * (joint - calm)
        }
      }
    }
  }

  return matrix
}

// the largest change of a matrix under conjugation by the slot permutations (0 when it commutes with all)
export function equivarianceDefect(matrix: Float64Array, permutations: readonly (readonly number[])[]): number {
  let worst = 0

  for (const g of permutations) {
    for (let r = 0; r < 48; r++) {
      const pr = (g[r >> 1] ?? 0) * 2 + (r & 1)

      for (let c = 0; c < 48; c++) {
        const pc = (g[c >> 1] ?? 0) * 2 + (c & 1)

        worst = Math.max(worst, Math.abs((matrix[pr * 48 + pc] ?? 0) - (matrix[r * 48 + c] ?? 0)))
      }
    }
  }

  return worst
}
