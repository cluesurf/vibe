// Calm is the one whole: a knot's loves and fears stored as its departure from the fully mixed state.
//
// In the fear weave (code/rule/fear-weave, E-QTM-0099) a knot of k tokens is a signed weight n on the 9^k
// joint points of their role grids, the discrete Wigner function in whole units, and its weights sum to
// the knot's size N: love minus fear is one whole, always. On the lattice love minus fear is the vibe
// charge, and from calm it is zero. This module moves the one whole out of the knot and into calm:
//
//   W = U + Delta,   U = 1 / 9^k on every joint point (the fully mixed state, rho = 1 / 3^k),
//
// and stores Delta, whose weights sum to zero, so every knot holds as many loves as fears. In whole numbers
// Delta is kept over its own units M (Delta = delta / M), and M is kept beside it because a sum of zero no
// longer names the units. From a knot n over N: delta = 9^k n - N over M = 9^k N, then reduced.
//
// Why the same rule moves Delta: every classical step permutes joint points, which fixes the uniform U,
// and the fear beat's meeting kernel is unital (each row sums to its divisor) as well as weight-keeping
// (each column does), since U = 1 / 9^k is the Wigner function of the identity and a unitary fixes the
// identity. So K (U + Delta) = U + K Delta and Delta evolves by exactly the kernel W does. A non-unital
// step (a reset, rho -> |0><0|) moves U, and there Delta alone no longer follows the rule.
//
// Reading: a chance is a sum of W along the points of one reading, so it is 1 / 3^k (U's share) plus the
// sum of Delta over those points. Purity: sum W^2 = 1 / 3^k for a pure knot, so sum Delta^2 =
// 1 / 3^k - 1 / 9^k, in whole numbers 9^k sum delta^2 = (3^k - 1) M^2.
//
// Two knots joining (their tokens meet for the first time) take the tensor product of U + Delta:
//
//   Delta_ab = Delta_a x U_b + U_a x Delta_b + Delta_a x Delta_b,
//
// which sums to zero again, so the balance survives every merge.

import { type ColorWeave } from '@/code/rule/color-weave'
import { CONJUGATE_GRID, CONJUGATE_POINT, meetWhole, moveCoordinate, translatedOf, type BeatRecord, type Whole } from '@/code/rule/fear-weave'

// a knot's departure from calm: tokens (most significant coordinate first), delta on the 9^k joint points,
// and the units M (Delta = delta / M). Like a whole, it carries each coordinate's own role point (phase index),
// the point the comoving fear beat reads a meeting about; absent, every own point is the origin
export type Departure = {
  readonly tokens: readonly number[]
  readonly delta: readonly bigint[]
  readonly units: bigint
  readonly own?: readonly number[]
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

const POINTS = (k: number): bigint => 9n ** BigInt(k)

// divide out the common factor of every delta and the units
export function reduceDeparture(d: Departure): Departure {
  const g = d.delta.reduce((a, b) => gcd(a, b), d.units)

  return g > 1n ? { ...d, delta: d.delta.map(x => x / g), units: d.units / g } : d
}

// the departure of a knot stored the fear weave's way
export function departureOf(whole: Whole): Departure {
  const n = whole.weight.reduce((a, b) => a + b, 0n)
  const p = POINTS(whole.tokens.length)

  return reduceDeparture({ tokens: whole.tokens, delta: whole.weight.map(w => p * w - n), units: p * n, ...(whole.own ? { own: whole.own } : {}) })
}

// the knot stored the fear weave's way, reduced: n = M + 9^k delta over 9^k M
export function wholeOfDeparture(d: Departure): Whole {
  const p = POINTS(d.tokens.length)
  const weight = d.delta.map(x => d.units + p * x)
  const g = weight.reduce((a, b) => gcd(a, b), 0n)

  return { tokens: d.tokens, weight: g > 1n ? weight.map(w => w / g) : weight, ...(d.own ? { own: d.own } : {}) }
}

// loves and fears of a departure, in its units
export function departureLovesAndFears(d: Departure): { loves: bigint; fears: bigint } {
  let loves = 0n
  let fears = 0n

  for (const x of d.delta) {
    if (x > 0n) {
      loves += x
    } else {
      fears -= x
    }
  }

  return { loves, fears }
}

// the chance of every reading of the k roles (index sum of role_c 3^(k-1-c)), as numerators over one
// denominator: 1 / 3^k plus the sum of Delta over the reading's 3^k points
export function departureChances(d: Departure): { numerator: bigint[]; denominator: bigint } {
  const k = d.tokens.length
  const readings = 3 ** k
  const sums = new Array<bigint>(readings).fill(0n)

  d.delta.forEach((x, i) => {
    let reading = 0

    for (let c = 0; c < k; c++) {
      reading = reading * 3 + Math.floor((Math.floor(i / 9 ** (k - 1 - c)) % 9) / 3)
    }

    sums[reading] = (sums[reading] ?? 0n) + x
  })

  const denominator = BigInt(readings) * d.units

  return { numerator: sums.map(s => d.units + BigInt(readings) * s), denominator }
}

// one meeting: the kernel (kernel / divisor) on coordinates a and b. fixed: keep the units and return null
// where a fraction would be needed. Otherwise multiply the units by the divisor and reduce.
export function meetDeparture(input: {
  departure: Departure
  a: number
  b: number
  kernel: readonly (readonly number[])[]
  divisor: number
  fixed: boolean
}): Departure | null {
  const { departure, a, b, kernel, fixed } = input
  const divisor = BigInt(input.divisor)
  const raw = meetWhole({ whole: { tokens: departure.tokens, weight: departure.delta }, a, b, kernel4: kernel, fixed: true, divisor: 1 })

  if (!raw) {
    return null
  }

  if (fixed) {
    if (raw.weight.some(x => x % divisor !== 0n)) {
      return null
    }

    return { ...departure, delta: raw.weight.map(x => x / divisor) }
  }

  return reduceDeparture({ ...departure, delta: raw.weight, units: departure.units * divisor })
}

// one beat's record applied to a departure, in the order advanceWhole uses: meetings then crossings going
// forward, crossings then meetings going back. moveOf, when given, replaces each grid move's permutation
// (a knot stored in conjugate points moves by C g C).
//
// The fear beat here is the COMOVING one, adopted 2026-09-26, exactly as advanceWhole's grain mode: each
// meeting's kernel translated to the two coordinates' own points (the departure's `own`, the origin when
// absent), each own point moved by the permutation its coordinate's weights move by at every crossing. The
// translated kernel is unital, so Delta still evolves by exactly the kernel W does. `comoving: false` is the
// fixed-frame beat before the adoption, the control
export function advanceDeparture(input: {
  weave: ColorWeave
  departure: Departure
  record: BeatRecord
  kernel: readonly (readonly number[])[]
  divisor: number
  fixed: boolean
  forward: boolean
  moveOf?: (g: number) => ArrayLike<number>
  comoving?: boolean
}): Departure | null {
  const { weave, record, kernel, divisor, fixed, forward, moveOf } = input
  const comoving = input.comoving !== false
  const coordinate = new Map(input.departure.tokens.map((t, i) => [t, i]))

  let d: Departure | null = input.departure

  const meet = (): void => {
    for (const [ta, tb] of record.meetings) {
      const a = coordinate.get(ta)
      const b = coordinate.get(tb)

      if (d && a !== undefined && b !== undefined) {
        const read = comoving && d.own ? translatedOf(kernel, d.own[a] ?? 0, d.own[b] ?? 0) : kernel

        d = meetDeparture({ departure: d, a, b, kernel: read, divisor, fixed })
      }
    }
  }

  const cross = (): void => {
    for (const [tk, g] of record.crossings) {
      const c = coordinate.get(tk)

      if (d && c !== undefined && g !== weave.moves.identity) {
        // the own point moves with the weights (movePhaseCoordinate)
        const moved = moveCoordinate({ tokens: d.tokens, weight: d.delta, ...(d.own ? { own: d.own } : {}) }, c, moveOf ? moveOf(g) : (weave.moves.act[g] ?? []))

        d = { ...d, delta: moved.weight, ...(moved.own ? { own: moved.own } : {}) }
      }
    }
  }

  if (forward) {
    meet()
    cross()
  } else {
    cross()
    meet()
  }

  return d
}

// two knots joined: the departure of the tensor product of U + Delta, coordinates of a then of b
export function mergeDepartures(a: Departure, b: Departure): Departure {
  const pa = POINTS(a.tokens.length)
  const pb = POINTS(b.tokens.length)
  const nb = b.delta.length
  const delta = new Array<bigint>(a.delta.length * nb)

  // over M_a M_b pa pb: Delta_a U_b = D_a / (M_a pb), U_a Delta_b = D_b / (pa M_b), Delta_a Delta_b =
  // D_a D_b / (M_a M_b)
  for (let i = 0; i < a.delta.length; i++) {
    for (let j = 0; j < nb; j++) {
      const da = a.delta[i] ?? 0n
      const db = b.delta[j] ?? 0n

      delta[i * nb + j] = da * b.units * pa + pb * a.units * db + pa * pb * da * db
    }
  }

  const ownOf = (d: Departure): number[] => (d.own ? [...d.own] : new Array<number>(d.tokens.length).fill(0))

  return reduceDeparture({ tokens: [...a.tokens, ...b.tokens], delta, units: a.units * b.units * pa * pb, own: [...ownOf(a), ...ownOf(b)] })
}

// does the kernel fix the uniform weighting (every row sums to the divisor), and keep the total weight
// (every column does)
export function kernelIsUnital(kernel: readonly (readonly number[])[], divisor: number): boolean {
  return kernel.every(row => row.reduce((s, x) => s + x, 0) === divisor)
}

export function kernelKeepsWeight(kernel: readonly (readonly number[])[], divisor: number): boolean {
  return kernel.every((_, c) => kernel.reduce((s, row) => s + (row[c] ?? 0), 0) === divisor)
}

// charge conjugation on the grid, C: (a, b) -> (a, -b) on every coordinate of k roles
export function conjugateIndex(i: number, k: number): number {
  let out = 0

  for (let c = 0; c < k; c++) {
    out = out * 9 + (CONJUGATE_POINT[Math.floor(i / 9 ** (k - 1 - c)) % 9] ?? 0)
  }

  return out
}

// a kernel on two roles seen through C on both coordinates: K^C(x, y) = K(C x, C y)
export function conjugateKernel(kernel: readonly (readonly number[])[]): number[][] {
  return Array.from({ length: 81 }, (_, r) => Array.from({ length: 81 }, (__, c) => kernel[conjugateIndex(r, 2)]?.[conjugateIndex(c, 2)] ?? 0))
}

// a grid move seen through C: C g C. The move is a table on the GRID index a + 3 b (weave.moves.act), so C is
// CONJUGATE_GRID there. It read CONJUGATE_POINT, the phase-index table, until 2026-09-26, which was right only
// while moveCoordinate applied grid tables to the phase index directly (E-QTM-0124 changed that)
export function conjugateMove(perm: ArrayLike<number>): number[] {
  return Array.from({ length: 9 }, (_, p) => CONJUGATE_GRID[perm[CONJUGATE_GRID[p] ?? 0] ?? 0] ?? 0)
}
