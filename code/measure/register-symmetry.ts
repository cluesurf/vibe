// WHAT COMMUTES WITH THE REGISTER RULE: THE RIGHT MULTIPLICATIONS, AND THE UNTWISTED ROTATIONS (E-FRC-0267, E-FRC-0268).
// A member's register is Cl+(4), the even Clifford algebra of the dock's 4d space (E-SPN-0160). Every piece of the
// register rule is P = X (1 + sum (u_k - 1) q_k), and each q_k is built from the slot structure and LEFT Clifford
// multiplication (Q_D = Phi^dag Phi / 4, Phi(a (x) w) = gamma(a) w) or from J = right multiplication by the volume element
// (E-FRC-0258). Right multiplication by any even x commutes with every left multiplication, so it commutes with every
// q_k: the rule has the algebra R(Cl+(4)) = R(H + H) in its commutant, whose norm-one elements are SU(2) x SU(2), one
// SU(2) on each chiral half. This file builds those operators and the rotations of the register:
//
//   multiply           the Clifford product of two multivectors on the 16 blades (Euclidean, e_i^2 = +1)
//   reverse            the reversion (a blade of grade k takes (-1)^(k (k - 1) / 2))
//   rightMultiplication  R(x) w = w x on the even blades, an 8 x 8 matrix [row][col] (integer for a blade)
//   leftMultiplication   L(x) w = x w, the same
//   spinLift           for a rotation g of W(F4), the even element s with s v s~ = g v for every vector v and s s~ = 1,
//                      found as the null space of the 32 linear conditions s e_i - g(e_i) s = 0 (floats: a lift can hold
//                      1 / sqrt 2); unique up to sign
//   registerGap        the largest entry of (g Q - Q g) on the 192 modes, g acting on (slot d, register b) as (slots[d],
//                      m[a][b]): zero for a symmetry. With integer m and an integer Q it is exact
//
// THE TWO ROTATIONS. W(F4) acts on the register by minors (E-SPN-0160), which on even forms is conjugation, rho(g) w =
// s w s~. That is the lattice's own ("twisted") rotation, a genuine representation (rho(-1) = rho(1)). The untwisted
// rotation is L(s) = rho(g) R(s): the slot permutation with LEFT multiplication by s. It commutes with every q_k whenever
// rho(g) and R(s) both do, and it is the spinor representation: the lift of a rotation by pi squares to -1.
//
// DETERMINISM: no random numbers. EXACT: blade products are signs; the right and left multiplications by blades are
// integer matrices and the exact commutator checks run on them; the spin lifts are floats, as measurement.

import { clifford } from '@/code/measure/chiral-register'
import { EVEN, ODD } from '@/code/measure/spinor-register'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG

// the 16 blades: the even ones first (the register's order), then the odd
export const BLADES: readonly (readonly number[])[] = [...EVEN, ...ODD]

const key = (b: readonly number[]): string => b.join(',')
const INDEX = new Map(BLADES.map((b, i) => [key(b), i]))

// a multivector: 16 coefficients over BLADES
export type Multivector = number[]

export function multiply(a: Multivector, b: Multivector): Multivector {
  const out = Array<number>(16).fill(0)

  for (let i = 0; i < 16; i++) {
    if (a[i] === 0) {
      continue
    }

    for (let j = 0; j < 16; j++) {
      if (b[j] === 0) {
        continue
      }

      const p = clifford(BLADES[i]!, BLADES[j]!)

      out[INDEX.get(key(p.blade))!]! += p.sign * a[i]! * b[j]!
    }
  }

  return out
}

export const reverse = (a: Multivector): Multivector =>
  a.map((x, i) => {
    const k = BLADES[i]!.length

    return ((k * (k - 1)) / 2) % 2 === 0 ? x : -x
  })

// an even element as a multivector (8 even coefficients, then 8 zeros)
export const evenElement = (x: readonly number[]): Multivector => [
  ...x,
  ...Array<number>(8).fill(0),
]

export const bladeElement = (b: readonly number[]): Multivector => {
  const m = Array<number>(16).fill(0)

  m[INDEX.get(key(b))!] = 1

  return m
}

// R(x) w = w x and L(x) w = x w on the even blades, [row][col]
function evenMultiplication(
  x: readonly number[],
  side: 'left' | 'right',
): number[][] {
  const X = evenElement(x)
  const M = Array.from({ length: REG }, () => Array<number>(REG).fill(0))

  for (let c = 0; c < REG; c++) {
    const w = bladeElement(EVEN[c]!)
    const y = side === 'right' ? multiply(w, X) : multiply(X, w)

    for (let r = 0; r < REG; r++) {
      M[r]![c] = y[r]!
    }

    if (y.slice(REG).some(z => z !== 0)) {
      throw new Error('an even product left the even blades')
    }
  }

  return M
}

export const rightMultiplication = (x: readonly number[]): number[][] =>
  evenMultiplication(x, 'right')
export const leftMultiplication = (x: readonly number[]): number[][] =>
  evenMultiplication(x, 'left')

// the unit even element with 1 on blade B
export const evenBlade = (b: number): number[] =>
  Array.from({ length: REG }, (_, i) => (i === b ? 1 : 0))

export const mul8 = (
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): number[][] =>
  a.map(row =>
    Array.from({ length: REG }, (_, j) =>
      row.reduce((s, x, k) => s + x * b[k]![j]!, 0),
    ),
  )

// ---- the spin lift of a rotation ----

// the vector e_i as a multivector
const vector = (i: number): Multivector => bladeElement([i])

// g e_i = sum_j g[j][i] e_j
const image = (g: readonly (readonly number[])[], i: number): Multivector => {
  const m = Array<number>(16).fill(0)

  for (let j = 0; j < 4; j++) {
    m[INDEX.get(key([j]))!] = g[j]![i]!
  }

  return m
}

// the null space of a real matrix (rows x 8) by elimination with partial pivoting, pivots below tol read as zero
function nullSpace(A: number[][], tol: number): number[][] {
  const rows = A.map(r => [...r])
  const n = REG
  const pivots: number[] = []

  let r = 0

  for (let c = 0; c < n && r < rows.length; c++) {
    let best = r

    for (let i = r + 1; i < rows.length; i++) {
      if (Math.abs(rows[i]![c]!) > Math.abs(rows[best]![c]!)) {
        best = i
      }
    }

    if (Math.abs(rows[best]![c]!) <= tol) {
      continue
    }

    ;[rows[r], rows[best]] = [rows[best]!, rows[r]!]

    const piv = rows[r]![c]!

    for (let k = 0; k < n; k++) {
      rows[r]![k]! /= piv
    }

    for (let i = 0; i < rows.length; i++) {
      if (i === r) {
        continue
      }

      const f = rows[i]![c]!

      if (f === 0) {
        continue
      }

      for (let k = 0; k < n; k++) {
        rows[i]![k]! -= f * rows[r]![k]!
      }
    }

    pivots.push(c)
    r++
  }

  const free = Array.from({ length: n }, (_, c) => c).filter(
    c => !pivots.includes(c),
  )

  return free.map(f => {
    const v = Array<number>(n).fill(0)

    v[f] = 1

    pivots.forEach((c, i) => {
      v[c] = -rows[i]![f]!
    })

    return v
  })
}

export type SpinLift = {
  // the lift, 8 even coefficients, s s~ = 1, the sign fixed so its first nonzero coefficient is positive
  s: number[]
  // the dimension of the null space (1 for a rotation)
  kernel: number
  // |s s~ - 1| over all 16 components
  normGap: number
}

export function spinLift(g: readonly (readonly number[])[]): SpinLift {
  // column b of the conditions: e_b e_i - g(e_i) e_b, read on the odd blades, for each i
  const rows: number[][] = []

  for (let i = 0; i < 4; i++) {
    const cols = Array.from({ length: REG }, (_, b) => {
      const eb = bladeElement(EVEN[b]!)
      const left = multiply(eb, vector(i))
      const right = multiply(image(g, i), eb)

      return left.map((x, k) => x - right[k]!)
    })

    for (let k = 0; k < 16; k++) {
      rows.push(cols.map(c => c[k]!))
    }
  }

  const kernel = nullSpace(rows, 1e-9)
  const v = kernel[0] ?? Array<number>(REG).fill(0)
  const sv = evenElement(v)
  const n2 = multiply(sv, reverse(sv))[0]!
  const scale = n2 > 0 ? 1 / Math.sqrt(n2) : 0
  const first = v.find(x => Math.abs(x) > 1e-12) ?? 1
  const s = v.map(x => x * scale * Math.sign(first))
  const ss = multiply(evenElement(s), reverse(evenElement(s)))
  const normGap = Math.max(...ss.map((x, i) => Math.abs(x - (i === 0 ? 1 : 0))))

  return { s, kernel: kernel.length, normGap }
}

// ---- operators on the 192 modes ----

// the largest entry of g Q - Q g, g = (slot map, register matrix m); zero for a symmetry, exact when m and Q are integer
export function registerGap(
  q: Float64Array,
  slots: Int32Array,
  m: readonly (readonly number[])[],
): number {
  const n = MODES

  let worst = 0

  for (let d = 0; d < SLOTS; d++) {
    const sd = slots[d]!

    for (let e = 0; e < SLOTS; e++) {
      const se = slots[e]!

      for (let a = 0; a < REG; a++) {
        for (let c = 0; c < REG; c++) {
          let left = 0
          let right = 0

          for (let b = 0; b < REG; b++) {
            left += m[a]![b]! * q[(d * REG + b) * n + e * REG + c]!
            right += q[(sd * REG + a) * n + se * REG + b]! * m[b]![c]!
          }

          worst = Math.max(worst, Math.abs(left - right))
        }
      }
    }
  }

  return worst
}

export const IDENTITY_SLOTS: Int32Array = Int32Array.from(
  { length: SLOTS },
  (_, d) => d,
)

// the trace of 1 (x) m over the 192 modes
export const liftedTrace = (m: readonly (readonly number[])[]): number =>
  SLOTS * m.reduce((s, row, i) => s + row[i]!, 0)
