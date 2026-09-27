// Frame-covariant meetings of several tokens: which Clifford meetings commute with every change of frame,
// and the reflection through the frame direction that measures a role against a reference (E-QTM-0134 to
// E-QTM-0136).
//
// A token's role point is a phase point x = (a, b) of Z3^2, index 3 a + b (code/rule/fear-weave). A fear is
// stored at the reflected point (a, -b), so a frame change, a grid move g = (M, t) with M in SL(2, 3), moves
// every stored point the same way, x -> M x + t, love or fear. What differs is the symplectic form: the
// reflection is antisymplectic, so on n tokens with signs w (love +1, fear -1) the form on the stored points
// is B(x, y) = sum_i w_i [x_i, y_i], [u, v] = u_a v_b - u_b v_a.
//
// A Clifford meeting moves the joint points by an affine symplectic map F (Gross 2006). F commutes with the
// diagonal frame change (M, t) on all n tokens exactly when
//   - its linear part commutes with M + M + ... + M for every M in SL(2, 3). SL(2, 3) acts absolutely
//     irreducibly on Z3^2, so the linear part is A (x) 1, an n x n matrix A over F3 acting on the token
//     index and alike on the role and the tilt (linearCommutantDimension checks this over F3),
//   - it keeps the form: A^T W A = W, W = diag(w),
//   - it commutes with the diagonal translation 1 (x) t: A 1 = 1, 1 the all-ones vector, and the shift is
//     fixed by every M, so it is 0.
// So the covariant Clifford meetings are the orthogonal group of W over F3 fixed on 1. The form's value on
// 1 is B-norm w . 1 = sum of w = the vibe charge of the tokens. When the charge is 0 mod 3 (the tokens are a
// knot) 1 is isotropic; otherwise the reflection through 1,
//
//   R = 2 q^(-1) 1 w^T - 1,   q = the charge mod 3,
//
// is covariant and keeps 1: it is the map x -> 2 q^(-1) B(x, 1) 1 - x. On a love-love-fear triple it reads
//   x1' = x1 - x2 + x3,  x2' = -x1 + x2 + x3,  x3' = -x1 - x2
// on stored points. Every covariant meeting keeps the color content Q = sum w_i x_i = B-pairing with 1,
// since B(A x, 1) = B(A x, A 1) = B(x, 1).
//
// Pieces:
// - covariantCliffords: every A with A^T W A = W and A 1 = 1, by backtracking over columns (complete)
// - linearCommutantDimension: the F3 dimension of the linear maps commuting with the diagonal SL(2, 3)
// - frameReflection, applyStoredLinear: R and the action of A on stored joint points
// - sigma648Elements, characterValues: the 648 frame changes as 3 x 3 unitaries, enumerated from the
//   generators, and their traces (commutant dimensions by characters)
// - weilLift: the unitary of a linear symplectic map on physical points, from the displacements

import { operatorFrom3, displacementOperators } from '@/code/measure/qutrit-clifford'
import { operator, multiplyOperators, adjointOperator, type Operator } from '@/code/measure/grid-weights'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'

export const mod3 = (x: number): number => ((x % 3) + 3) % 3

// the symplectic pairing of two phase points, index 3 a + b: [u, v] = u_a v_b - u_b v_a
export function pointForm(u: number, v: number): number {
  return mod3(Math.floor(u / 3) * (v % 3) - (u % 3) * Math.floor(v / 3))
}

export const addPoints = (u: number, v: number): number => 3 * mod3(Math.floor(u / 3) + Math.floor(v / 3)) + mod3(u + v)
export const scalePoint = (k: number, u: number): number => 3 * mod3(k * Math.floor(u / 3)) + mod3(k * u)

// the vibe charge of a sign pattern, mod 3
export const chargeOf = (signs: readonly number[]): number => mod3(signs.reduce((s, w) => s + w, 0))

// every n x n matrix A over F3 (row-major) with A^T W A = W and A 1 = 1, W = diag(signs): the covariant
// Clifford meetings of n tokens. Built column by column: column j has B-norm w_j and is B-orthogonal to the
// columns before it, and the last column is 1 minus the others (A 1 = sum of the columns)
export function covariantCliffords(signs: readonly number[]): number[][] {
  const n = signs.length
  const vectors: number[][] = []

  for (let k = 0; k < 3 ** n; k++) {
    vectors.push(Array.from({ length: n }, (_, i) => Math.floor(k / 3 ** i) % 3))
  }

  const form = (u: readonly number[], v: readonly number[]): number => mod3(u.reduce((s, x, i) => s + (signs[i] ?? 0) * x * (v[i] ?? 0), 0))
  const out: number[][] = []
  const columns: number[][] = []

  const place = (j: number): void => {
    if (j === n - 1) {
      const last = Array.from({ length: n }, (_, i) => mod3(1 - columns.reduce((s, c) => s + (c[i] ?? 0), 0)))

      if (form(last, last) === mod3(signs[j] ?? 0) && columns.every(c => form(c, last) === 0)) {
        const all = [...columns, last]

        out.push(Array.from({ length: n * n }, (_, k) => all[k % n]?.[Math.floor(k / n)] ?? 0))
      }

      return
    }

    for (const v of vectors) {
      if (form(v, v) === mod3(signs[j] ?? 0) && columns.every(c => form(c, v) === 0)) {
        columns.push(v)
        place(j + 1)
        columns.pop()
      }
    }
  }

  place(0)

  return out
}

export const isPermutationMatrix = (a: readonly number[], n: number): boolean =>
  Array.from({ length: n }, (_, i) => a.slice(i * n, i * n + n)).every(row => row.filter(x => x === 1).length === 1 && row.every(x => x === 0 || x === 1)) &&
  Array.from({ length: n }, (_, j) => Array.from({ length: n }, (__, i) => a[i * n + j] ?? 0)).every(col => col.filter(x => x === 1).length === 1)

// the reflection through the frame direction 1, R = 2 q^(-1) 1 w^T - 1, or null on a knot (q = 0)
export function frameReflection(signs: readonly number[]): number[] | null {
  const n = signs.length
  const q = chargeOf(signs)

  if (q === 0) {
    return null
  }

  const c = mod3(2 * (q === 1 ? 1 : 2))

  return Array.from({ length: n * n }, (_, k) => mod3(c * (signs[k % n] ?? 0) - (Math.floor(k / n) === k % n ? 1 : 0)))
}

// A acting on the tokens' stored points (index 3 a + b each), alike on the role and the tilt
export function applyStoredLinear(a: readonly number[], points: readonly number[], out: number[]): void {
  const n = points.length

  for (let i = 0; i < n; i++) {
    let ra = 0
    let rb = 0

    for (let j = 0; j < n; j++) {
      const m = a[i * n + j] ?? 0
      const p = points[j] ?? 0

      ra += m * Math.floor(p / 3)
      rb += m * (p % 3)
    }

    out[i] = 3 * mod3(ra) + mod3(rb)
  }
}

// the F3 dimension of the 2n x 2n matrices L (coordinates a1, b1, a2, b2, ...) with L (M + ... + M) =
// (M + ... + M) L for both generators of SL(2, 3); the prediction is n^2 (L = A (x) 1)
export function linearCommutantDimension(n: number): number {
  const size = 2 * n
  const unknowns = size * size
  const generators = [
    [1, 1, 0, 1],
    [1, 0, 1, 1],
  ]
  const rows: number[][] = []

  for (const m of generators) {
    const block = (r: number, c: number): number => (Math.floor(r / 2) === Math.floor(c / 2) ? (m[2 * (r % 2) + (c % 2)] ?? 0) : 0)

    // (L G - G L)_rc = sum_k L_rk G_kc - G_rk L_kc
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const row = new Array<number>(unknowns).fill(0)

        for (let k = 0; k < size; k++) {
          row[r * size + k] = mod3((row[r * size + k] ?? 0) + block(k, c))
          row[k * size + c] = mod3((row[k * size + c] ?? 0) - block(r, k))
        }

        rows.push(row)
      }
    }
  }

  let rank = 0

  for (let col = 0; col < unknowns && rank < rows.length; col++) {
    const pivot = rows.findIndex((row, i) => i >= rank && (row[col] ?? 0) !== 0)

    if (pivot < 0) {
      continue
    }

    ;[rows[rank], rows[pivot]] = [rows[pivot]!, rows[rank]!]

    const top = rows[rank]!
    const inverse = top[col] === 1 ? 1 : 2

    for (let c = 0; c < unknowns; c++) {
      top[c] = mod3((top[c] ?? 0) * inverse)
    }

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]!
      const f = row[col] ?? 0

      if (r !== rank && f !== 0) {
        for (let c = 0; c < unknowns; c++) {
          row[c] = mod3((row[c] ?? 0) - f * (top[c] ?? 0))
        }
      }
    }

    rank++
  }

  return unknowns - rank
}

// the 648 frame changes of Sigma(648) as 3 x 3 unitaries, enumerated from the generators
export function sigma648Elements(): Operator[] {
  const generators = SU3_SUBGROUPS.sigma648.generators.map(operatorFrom3)
  const key = (m: Operator): string => [...m.re, ...m.im].map(x => Math.round(x * 1e6)).join(',')
  const identity = operator(3)

  for (let i = 0; i < 3; i++) {
    identity.re[4 * i] = 1
  }

  const seen = new Set<string>([key(identity)])
  const out: Operator[] = [identity]

  for (let i = 0; i < out.length && out.length < 10_000; i++) {
    for (const g of generators) {
      const next = multiplyOperators(g, out[i]!)
      const k = key(next)

      if (!seen.has(k)) {
        seen.add(k)
        out.push(next)
      }
    }
  }

  return out
}

// the trace of each element
export function characterValues(elements: readonly Operator[]): [number, number][] {
  return elements.map(m => [m.re[0]! + m.re[4]! + m.re[8]!, m.im[0]! + m.im[4]! + m.im[8]!])
}

// The unitary of a linear symplectic map S on n qutrits' PHYSICAL phase points (S as a 2n x 2n matrix over
// F3 on a1, b1, a2, b2, ...): U = Y / norm, Y = sum_v D(S v) |c><c| D(v)^dagger, which is 3^n Tr(U^dagger
// |c><c|) U for the U with U D(v) U^dagger = D(S v). null when S has no such lift
export function weilLift(s: readonly number[], n: number): Operator | null {
  const dim = 3 ** n
  const displacements = displacementOperators(n)
  const image = (v: number): number => {
    const coordinates: number[] = []

    for (let i = 0; i < n; i++) {
      const p = Math.floor(v / 9 ** (n - 1 - i)) % 9

      coordinates.push(Math.floor(p / 3), p % 3)
    }

    let out = 0

    for (let i = 0; i < n; i++) {
      let a = 0
      let b = 0

      for (let k = 0; k < 2 * n; k++) {
        a += (s[(2 * i) * 2 * n + k] ?? 0) * (coordinates[k] ?? 0)
        b += (s[(2 * i + 1) * 2 * n + k] ?? 0) * (coordinates[k] ?? 0)
      }

      out = out * 9 + 3 * mod3(a) + mod3(b)
    }

    return out
  }

  for (let c = 0; c < dim; c++) {
    const y = operator(dim)

    for (let v = 0; v < dim * dim; v++) {
      const dv = displacements[v]!
      const dsv = displacements[image(v)]!

      for (let r = 0; r < dim; r++) {
        const ar = dsv.re[r * dim + c] ?? 0
        const ai = dsv.im[r * dim + c] ?? 0

        if (ar === 0 && ai === 0) {
          continue
        }

        for (let k = 0; k < dim; k++) {
          // conj(D(v)_kc)
          const br = dv.re[k * dim + c] ?? 0
          const bi = -(dv.im[k * dim + c] ?? 0)

          y.re[r * dim + k] = (y.re[r * dim + k] ?? 0) + ar * br - ai * bi
          y.im[r * dim + k] = (y.im[r * dim + k] ?? 0) + ar * bi + ai * br
        }
      }
    }

    const yy = multiplyOperators(y, adjointOperator(y))
    const norm = Math.sqrt(yy.re[0] ?? 0)

    if (norm > 1e-6) {
      for (let i = 0; i < dim * dim; i++) {
        y.re[i] = (y.re[i] ?? 0) / norm
        y.im[i] = (y.im[i] ?? 0) / norm
      }

      return y
    }
  }

  return null
}

// the physical linear map of A on n tokens with signs w: stored point = R_i physical, R = (a, b) -> (a, -b)
// on a fear, so S = R (A (x) 1) R, as 2n x 2n on a1, b1, ...
export function physicalMap(a: readonly number[], signs: readonly number[]): number[] {
  const n = signs.length
  const out = new Array<number>(4 * n * n).fill(0)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const m = a[i * n + j] ?? 0

      out[(2 * i) * 2 * n + 2 * j] = mod3(m)
      out[(2 * i + 1) * 2 * n + 2 * j + 1] = mod3((signs[i] ?? 1) * m * (signs[j] ?? 1))
    }
  }

  return out
}

// max |A B - B A| entry
export function commutatorSize(a: Operator, b: Operator): number {
  const ab = multiplyOperators(a, b)
  const ba = multiplyOperators(b, a)
  let worst = 0

  for (let i = 0; i < ab.re.length; i++) {
    worst = Math.max(worst, Math.hypot((ab.re[i] ?? 0) - (ba.re[i] ?? 0), (ab.im[i] ?? 0) - (ba.im[i] ?? 0)))
  }

  return worst
}
