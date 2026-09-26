// Bell gates on a two-token knot's grid weights (E-QTM-0111, E-QTM-0112): no signaling, the Tsirelson
// bound, and CHSH at the settings the model itself has.
//
// THE MODEL'S OWN SETTINGS. A token's reading is its role, the line of the 3 x 3 grid its point lies on
// (role = floor(p / 3)). Before reading, a grid move (one of the 216 affine maps of determinant one) can act
// on the token: that is the only freedom a party has. The images of the three role lines under the 216 moves
// are the 12 lines of the grid, in 4 parallel families of 3. So a setting is a family (which move was applied,
// up to what the reading cannot see), an outcome is one of its 3 lines, and a two-outcome observable is +1 on
// a subset of the family's lines and -1 on the rest: the constants +1 and -1 and, per family, one line
// against the other two and its negation, 26 in all. Every one is a +-1 function a(x) of the grid point.
//
// Because every observable is a function of the point, every correlator is a signed COUNT of the knot:
//
//   E(a, b) = sum over joint points (x, y) of W(x, y) a(x) b(y),
//
// exact in the knot's units. With no fear (W >= 0) this is a local hidden-variable model whose hidden
// variable is the joint point, so every CHSH value is at most 2. With fears the bound is 2 (L + F) / (L - F),
// L and F the knot's loves and fears. A CHSH value above 2 at these settings is carried by fear, not by any
// dependence of a party's reading on the other's setting.
//
// Tsirelson: for a knot whose weights are the Wigner function of a positive operator, no two-outcome
// measurement on each role (of any kind, not only the 26 above) gives CHSH above 2 sqrt 2 (Tsirelson 1980).
// The knot's own purity count (9 sum W^2 = 1) does NOT imply positivity: Hermitian, trace 1 and purity 1
// allow the eigenvalues (2/3, 2/3, -1/3, 0, ...). So positivity is measured here, from the density matrix,
// and a weight array that passes the purity count but is not positive is built as the control.
//
// A CHSH value a pure state of two qutrits reaches with Schmidt weights p1, p2, p3, by pairing two of them
// into a qubit block and giving the third a fixed outcome,
//
//   max over pairings of 2 sqrt((pi + pj)^2 + 4 pi pj) + 2 pk,
//
// which is sqrt 7 at (3/4, 1/4, 0) and (2 + 4 sqrt 2) / 3 at (1/3, 1/3, 1/3), the see-saw's values there. It is
// a LOWER bound on the maximum in general: E-QTM-0112 found the see-saw above it by up to 0.09 on other states.

import { gridMoves } from '@/code/rule/vibe-weave'
import { type Operator } from '@/code/measure/grid-weights'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// the 12 lines of the 3 x 3 grid as sorted point triples, found as the images of the role lines under the
// 216 grid moves, grouped into their 4 parallel families
export type GridLines = {
  readonly lines: readonly (readonly number[])[]
  readonly families: readonly (readonly (readonly number[])[])[]
}

let LINES: GridLines | undefined

export function gridLines(): GridLines {
  if (LINES) {
    return LINES
  }

  const moves = gridMoves()
  const seen = new Map<string, number[]>()

  for (let role = 0; role < 3; role++) {
    const line = [0, 1, 2].map(tilt => 3 * role + tilt)

    for (const act of moves.act) {
      const image = line.map(p => act[p] ?? p).sort((a, b) => a - b)

      seen.set(image.join(','), image)
    }
  }

  const lines = [...seen.values()].sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1))
  const families: number[][][] = []

  for (const line of lines) {
    const family = families.find(f => f.every(other => other.every(p => !line.includes(p))))

    if (family) {
      family.push(line)
    } else {
      families.push([line])
    }
  }

  LINES = { lines, families }

  return LINES
}

// the 26 two-outcome observables at the model's settings, each a +-1 value on the 9 points
export function lineObservables(): readonly Int8Array[] {
  const { families } = gridLines()
  const out: Int8Array[] = [new Int8Array(9).fill(1), new Int8Array(9).fill(-1)]

  for (const family of families) {
    for (const line of family) {
      const a = new Int8Array(9).fill(-1)

      for (const p of line) {
        a[p] = 1
      }

      out.push(a, Int8Array.from(a, x => -x))
    }
  }

  return out
}

// E(a, b) numerators for every pair of observables: sum W(x, y) a(x) b(y), exact, over the knot's units
export function correlatorTable(weight: readonly bigint[]): bigint[][] {
  const observables = lineObservables()

  return observables.map(a =>
    observables.map(b => {
      let sum = 0n

      for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
          const w = weight[x * 9 + y] ?? 0n

          if (w !== 0n) {
            sum += BigInt((a[x] ?? 0) * (b[y] ?? 0)) * w
          }
        }
      }

      return sum
    }),
  )
}

// the largest CHSH value over the 26 x 26 x 26 x 26 settings, as an exact numerator over the units, found by
// maximizing b0 and b1 separately for each (a0, a1), which is exact since CHSH is a sum of a b0 term and a b1
// term
export function enumeratedChsh(weight: readonly bigint[]): { numerator: bigint; units: bigint; value: number; settings: readonly number[] } {
  const table = correlatorTable(weight)
  const units = weight.reduce((s, w) => s + w, 0n)
  const n = table.length
  let best = -1n << 400n
  let settings: number[] = []

  for (let a0 = 0; a0 < n; a0++) {
    for (let a1 = 0; a1 < n; a1++) {
      let plus = -1n << 400n
      let plusAt = 0
      let minus = -1n << 400n
      let minusAt = 0

      for (let b = 0; b < n; b++) {
        const p = (table[a0]?.[b] ?? 0n) + (table[a1]?.[b] ?? 0n)
        const m = (table[a0]?.[b] ?? 0n) - (table[a1]?.[b] ?? 0n)

        if (p > plus) {
          plus = p
          plusAt = b
        }

        if (m > minus) {
          minus = m
          minusAt = b
        }
      }

      if (plus + minus > best) {
        best = plus + minus
        settings = [a0, a1, plusAt, minusAt]
      }
    }
  }

  return { numerator: best, units, value: Number(best) / Number(units), settings }
}

// the counts a party reads for each outcome of each of its settings, summed over the other party's outcomes
// of each of the other's settings: counts[mySetting][otherSetting][outcome]. No signaling at the model's
// settings is that the last two indices do not depend on otherSetting
export function marginalCounts(weight: readonly bigint[], side: 0 | 1): bigint[][][] {
  const { families } = gridLines()

  return families.map(mine =>
    families.map(other =>
      mine.map(line => {
        let sum = 0n

        for (const p of line) {
          for (const otherLine of other) {
            for (const q of otherLine) {
              sum += weight[side === 0 ? p * 9 + q : q * 9 + p] ?? 0n
            }
          }
        }

        return sum
      }),
    ),
  )
}

// a party's marginal weight on its own 9 points
export function marginal(weight: readonly bigint[], side: 0 | 1): bigint[] {
  const out = new Array<bigint>(9).fill(0n)

  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      const p = side === 0 ? x : y

      out[p] = (out[p] ?? 0n) + (weight[x * 9 + y] ?? 0n)
    }
  }

  return out
}

// the eigenvalues of an n x n Hermitian operator, ascending, from its 2n real symmetric form (each value
// appears twice there; one of each pair is kept)
export function hermitianValues(rho: Operator): number[] {
  const n = rho.n
  const m = makeDense({ rows: 2 * n, cols: 2 * n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = rho.re[i * n + j] ?? 0
      const b = rho.im[i * n + j] ?? 0

      m.data[i * 2 * n + j] = a
      m.data[(n + i) * 2 * n + n + j] = a
      m.data[i * 2 * n + n + j] = -b
      m.data[(n + i) * 2 * n + j] = b
    }
  }

  const values = Array.from(eigSymmetric({ matrix: m }).values).sort((x, y) => x - y)

  return values.filter((_, i) => i % 2 === 0)
}

// the first role's reduced operator of a two-role density, 3 x 3
export function reducedFirst(rho: Operator): Operator {
  const out: Operator = { n: 3, re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        re += rho.re[(3 * i + k) * 9 + (3 * j + k)] ?? 0
        im += rho.im[(3 * i + k) * 9 + (3 * j + k)] ?? 0
      }

      out.re[i * 3 + j] = re
      out.im[i * 3 + j] = im
    }
  }

  return out
}

// Settings with one local meeting: the party's token first meets an ancilla token of its own, started on a
// line of the grid (uniform weight 1/3 on the line's three points, a basis state), through a meeting kernel
// K (4 K or D K in whole numbers over `divisor`, on (token, ancilla) with the token first); then one of the
// 26 line observables is read on the token or on the ancilla. A grid move before the meeting adds nothing:
// the kernels commute with the same move on both coordinates, so it moves the ancilla's line and the reading
// only, and both sets are closed under grid moves. The effective observable on the party's 9 points is
//
//   a~(x) = sum over z of W_anc(z) sum over (x', z') of K(x', z'; x, z) a(x' or z'),
//
// a real function that can leave [-1, 1] where the kernel is negative. Returned with the 26 plain ones.
export function meetingObservables(kernels: readonly { kernel: readonly (readonly number[])[]; divisor: number }[]): Float64Array[] {
  const plain = lineObservables()
  const { lines } = gridLines()
  const out: Float64Array[] = plain.map(a => Float64Array.from(a))

  for (const { kernel, divisor } of kernels) {
    for (const line of lines) {
      for (const readAncilla of [false, true]) {
        for (const a of plain) {
          const effective = new Float64Array(9)

          for (let x = 0; x < 9; x++) {
            let sum = 0

            for (const z of line) {
              for (let r = 0; r < 81; r++) {
                const k = kernel[r]?.[x * 9 + z] ?? 0

                if (k !== 0) {
                  const read = readAncilla ? r % 9 : Math.floor(r / 9)

                  sum += (k / divisor) * (a[read] ?? 0)
                }
              }
            }

            effective[x] = sum / 3
          }

          out.push(effective)
        }
      }
    }
  }

  return out
}

// the largest CHSH value found over two finite sets of observables (Alice's on the first coordinate, Bob's
// on the second), by exact alternating maximization from every pair of Bob's first 26 (the plain settings):
// for fixed b0, b1 the best a0 and a1 are found separately, and back, until no step improves. A lower bound on
// the maximum over the sets, exact on the plain 26 x 26 (checked against enumeratedChsh)
export function alternatingChsh(input: {
  weight: readonly number[]
  alice: readonly Float64Array[]
  bob: readonly Float64Array[]
}): { value: number; settings: readonly number[] } {
  const { weight, alice, bob } = input
  // Alice's observables folded against the weight: row[a][y] = sum_x W(x, y) a(x)
  const folded = alice.map(a => {
    const row = new Float64Array(9)

    for (let x = 0; x < 9; x++) {
      const ax = a[x] ?? 0

      if (ax === 0) {
        continue
      }

      for (let y = 0; y < 9; y++) {
        row[y] = (row[y] ?? 0) + (weight[x * 9 + y] ?? 0) * ax
      }
    }

    return row
  })
  const e = (a: number, b: number): number => {
    const row = folded[a]!
    const ob = bob[b]!
    let s = 0

    for (let y = 0; y < 9; y++) {
      s += (row[y] ?? 0) * (ob[y] ?? 0)
    }

    return s
  }
  const table = alice.map((_, a) => bob.map((__, b) => e(a, b)))
  const at = (a: number, b: number): number => table[a]?.[b] ?? 0
  let best = Number.NEGATIVE_INFINITY
  let settings: number[] = []
  const starts = Math.min(26, bob.length)

  for (let s0 = 0; s0 < starts; s0++) {
    for (let s1 = 0; s1 < starts; s1++) {
      let b0 = s0
      let b1 = s1
      let a0 = 0
      let a1 = 0
      let value = Number.NEGATIVE_INFINITY

      for (let round = 0; round < 50; round++) {
        let bestA0 = Number.NEGATIVE_INFINITY
        let bestA1 = Number.NEGATIVE_INFINITY

        for (let a = 0; a < alice.length; a++) {
          const p = at(a, b0) + at(a, b1)
          const m = at(a, b0) - at(a, b1)

          if (p > bestA0) {
            bestA0 = p
            a0 = a
          }

          if (m > bestA1) {
            bestA1 = m
            a1 = a
          }
        }

        let bestB0 = Number.NEGATIVE_INFINITY
        let bestB1 = Number.NEGATIVE_INFINITY

        for (let b = 0; b < bob.length; b++) {
          const p = at(a0, b) + at(a1, b)
          const m = at(a0, b) - at(a1, b)

          if (p > bestB0) {
            bestB0 = p
            b0 = b
          }

          if (m > bestB1) {
            bestB1 = m
            b1 = b
          }
        }

        const next = bestB0 + bestB1

        if (next <= value + 1e-15) {
          break
        }

        value = next
      }

      if (value > best) {
        best = value
        settings = [a0, a1, b0, b1]
      }
    }
  }

  return { value: best, settings }
}

// the closed-form largest CHSH value of a pure two-qutrit state from its Schmidt weights (see the header)
export function pureChshBound(schmidt: readonly number[]): number {
  const p = [...schmidt].map(x => Math.max(0, x))
  let best = 0

  for (const [i, j, k] of [
    [0, 1, 2],
    [0, 2, 1],
    [1, 2, 0],
  ] as const) {
    const a = p[i] ?? 0
    const b = p[j] ?? 0

    best = Math.max(best, 2 * Math.sqrt((a + b) ** 2 + 4 * a * b) + 2 * (p[k] ?? 0))
  }

  return best
}
