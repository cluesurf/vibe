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
// The largest CHSH value of a pure state of two qutrits over all two-outcome measurements, the closed form
// checked against the see-saw: with Schmidt weights p1, p2, p3, pair two of them into a qubit block,
//
//   max over pairings of 2 sqrt((pi + pj)^2 + 4 pi pj) + 2 pk,
//
// which is sqrt 7 at (3/4, 1/4, 0) and (2 + 4 sqrt 2) / 3 at (1/3, 1/3, 1/3), and 2 sqrt 2 only at
// (1/2, 1/2, 0), since sqrt((a + b)^2 + 4 a b) <= sqrt 2 (a + b) with equality at a = b and 2 pk < 2 sqrt 2 pk.

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
