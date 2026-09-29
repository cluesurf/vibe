// Which covariant maps on a dock's slots move a vibe OFF its line (E-SPN-0094): the dock commutant of E-SPN-0090 read
// as an algebra, its eigenspaces, its unitaries with entries in the rule's ring Z[w][1/2], and the controls.
//
// THE SPACE. A dock's single-vibe space is C^24, one basis vector per slot (a D4 root). W(F4) (1,152 elements) acts by
// permuting slots (code/measure/covariant-coin weylF4). A map is COVARIANT when it commutes with every element.
//
// THE ALGEBRA. The commutant of a permutation group is spanned by its orbitals (orbits on ordered slot pairs). For
// W(F4) on the D4 roots there are five, named by the two roots' inner product: A2 = I, A1 (8 per row), A0 (6 per row,
// the orthogonal roots), A-1 (8 per row), A-2 = R (the opposite root). A1, A0 and A-1 take a slot OFF its line: they
// are the line-mixing classes E-SPN-0090 counted (inner 1, 0, -1) beside the lock-keeping I and R.
//
// THE EIGENSPACES (derived by hand, verified exactly below). The five orbitals form a commutative association scheme,
// so they share five eigenspaces. The 24 roots fall into three FRAMES of four mutually orthogonal lines ({e1 +- e2,
// e3 +- e4} and its two images), and the table, with the dimension of each eigenspace, reads
//
//                  frame-uniform   frame-contrast   even rest   odd vector   odd rest
//     dimension          1               2               9           4            8
//     I                  1               1               1           1            1
//     A1                 8              -4               0           4           -2
//     A0                 6               6              -2           0            0
//     A-1                8              -4               0          -4            2
//     R                  1               1               1          -1           -1
//
// (even: f(-r) = f(r), a function of lines; odd: f(-r) = -f(r); the odd vector is f(r) = r . v; frame-uniform is
// constant on all 24 slots, frame-contrast is constant on each frame and sums to zero.) The idempotents are
// E_j = (m_j / 24) sum_k theta_k(j) A_k / n_k (n_k the row counts 1, 8, 6, 8, 1).
//
// THE RING. A covariant unitary is sum_j mu_j E_j with |mu_j| = 1. Its entries lie in Z[w][1/2] exactly when every
// coefficient c_k = sum_j mu_j m_j theta_k(j) / (24 n_k) does, and then each mu_j is a modulus-one element of
// Z[w][1/2], which is a unit of Z[w] (2 is inert in Z[w]; E-SPN-0092). 3 is not invertible there, and the
// coefficients on A1 and A-1 carry (mu_1 - mu_2) / 12 and (mu_4 - mu_5) / 6: two distinct units never differ by a
// multiple of 3 (their difference has norm at most 4 < 9), so c_1 = c_-1 = 0 in every ring unitary. A vibe can leave
// its line only to an ORTHOGONAL line, the other three lines of its frame.
//
// Exact throughout: integer and Eisenstein matrices, bigint where a product can grow.

import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  eAdd,
  eConj,
  eEq,
  eMul,
  eSub,
  eZero,
  UNITS,
  type Eis,
} from '@/code/measure/covariant-coin'

const ROOTS = rootsD4()

export const INNERS = [2, 1, 0, -1, -2] as const
export const VALENCY = [1, 8, 6, 8, 1] as const
export const EIGEN_NAMES = [
  'frame-uniform',
  'frame-contrast',
  'even rest',
  'odd vector',
  'odd rest',
] as const
export const EIGEN_DIMENSIONS = [1, 2, 9, 4, 8] as const
// THETA[k][j]: the eigenvalue of the orbital of inner product INNERS[k] on eigenspace j
export const THETA: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1],
  [8, -4, 0, 4, -2],
  [6, 6, -2, 0, 0],
  [8, -4, 0, -4, 2],
  [1, 1, 1, -1, -1],
]

export const innerOf = (d: number, e: number): number =>
  ROOTS[d]!.reduce((s, x, k) => s + x * ROOTS[e]![k]!, 0)

export type IntMatrix = number[][]

// the orbital matrix of one inner product
export function orbitalMatrix(inner: number): IntMatrix {
  return Array.from({ length: 24 }, (_, d) =>
    Array.from({ length: 24 }, (_, e) =>
      innerOf(d, e) === inner ? 1 : 0,
    ),
  )
}

export const ORBITALS: readonly IntMatrix[] = INNERS.map(orbitalMatrix)

// ---- the group: a generating set, and the commutant by union-find on pairs (a second count, beside Burnside) ----

function closure(gens: readonly number[][]): number {
  const id = Array.from({ length: 24 }, (_, i) => i)
  const seen = new Set<string>([id.join(',')])
  const queue = [id]

  while (queue.length > 0) {
    const g = queue.pop()!

    for (const h of gens) {
      const next = g.map(d => h[d]!)
      const key = next.join(',')

      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      queue.push(next)
    }
  }

  return seen.size
}

// a small generating set picked greedily from the group's elements in order; returns it and the order it closes at
export function generatorsOf(group: readonly number[][]): {
  generators: number[][]
  closes: number
} {
  const generators: number[][] = []

  let order = 1

  for (const g of group) {
    if (order === group.length) {
      break
    }

    const next = closure([...generators, g])

    if (next > order) {
      generators.push(g)
      order = next
    }
  }

  return { generators, closes: order }
}

// the orbits of the generated group on the 576 ordered slot pairs: the commutant's dimension, counted with the
// generators alone
export function pairOrbits(generators: readonly number[][]): number {
  const parent = Array.from({ length: 576 }, (_, i) => i)

  const find = (i: number): number => {
    let r = i

    while (parent[r] !== r) {
      r = parent[r]!
    }

    return r
  }

  for (const g of generators) {
    for (let d = 0; d < 24; d++) {
      for (let e = 0; e < 24; e++) {
        const a = find(d * 24 + e)
        const b = find(g[d]! * 24 + g[e]!)

        if (a !== b) {
          parent[a] = b
        }
      }
    }
  }

  let roots = 0

  for (let i = 0; i < 576; i++) {
    if (find(i) === i) {
      roots++
    }
  }

  return roots
}

// the covariant PERMUTATIONS: every 0/1 sum of orbitals that is a permutation matrix
export function covariantPermutations(): number[][] {
  const out: number[][] = []

  for (let mask = 1; mask < 32; mask++) {
    const m = ORBITALS.reduce<number[][]>(
      (acc, A, k) =>
        (mask >> k) & 1
          ? acc.map((row, i) => row.map((v, j) => v + A[i]![j]!))
          : acc,
      Array.from({ length: 24 }, () => new Array<number>(24).fill(0)),
    )
    const isPermutation =
      m.every(
        row =>
          row.filter(v => v === 1).length === 1 &&
          row.every(v => v === 0 || v === 1),
      ) &&
      m[0]!.every((_, j) => m.filter(row => row[j] === 1).length === 1)

    if (isPermutation) {
      out.push(INNERS.filter((_, k) => (mask >> k) & 1))
    }
  }

  return out
}

// ---- the eigenspaces, verified exactly ----

const mulInt = (a: IntMatrix, b: IntMatrix): IntMatrix =>
  a.map(row =>
    b[0]!.map((_, j) => row.reduce((s, v, k) => s + v * b[k]![j]!, 0)),
  )
const addInt = (a: IntMatrix, b: IntMatrix): IntMatrix =>
  a.map((row, i) => row.map((v, j) => v + b[i]![j]!))
const scaleInt = (a: IntMatrix, s: number): IntMatrix =>
  a.map(row => row.map(v => v * s))
const eqInt = (a: IntMatrix, b: IntMatrix): boolean =>
  a.every((row, i) => row.every((v, j) => v === b[i]![j]))
const zeroInt = (): IntMatrix =>
  Array.from({ length: 24 }, () => new Array<number>(24).fill(0))
const identityInt = (): IntMatrix =>
  Array.from({ length: 24 }, (_, i) =>
    Array.from({ length: 24 }, (_, j) => (i === j ? 1 : 0)),
  )

// 576 E_j = m_j sum_k theta_k(j) (24 / n_k) A_k, an integer matrix
export function scaledIdempotent(j: number): IntMatrix {
  return INNERS.reduce(
    (acc, _, k) =>
      addInt(
        acc,
        scaleInt(
          ORBITALS[k]!,
          (EIGEN_DIMENSIONS[j] as number) *
            (THETA[k] as number[])[j]! *
            (24 / (VALENCY[k] as number)),
        ),
      ),
    zeroInt(),
  )
}

export type EigenCheck = {
  idempotent: boolean[]
  orthogonal: boolean
  complete: boolean
  eigenvalues: boolean
  traces: number[]
}

export function checkEigenspaces(): EigenCheck {
  const E = [0, 1, 2, 3, 4].map(scaledIdempotent)
  const idempotent = E.map(e => eqInt(mulInt(e, e), scaleInt(e, 576)))

  let orthogonal = true

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i !== j && !eqInt(mulInt(E[i]!, E[j]!), zeroInt())) {
        orthogonal = false
      }
    }
  }

  const complete = eqInt(
    E.reduce((a, e) => addInt(a, e), zeroInt()),
    scaleInt(identityInt(), 576),
  )

  let eigenvalues = true

  for (let k = 0; k < 5; k++) {
    for (let j = 0; j < 5; j++) {
      if (
        !eqInt(
          mulInt(ORBITALS[k]!, E[j]!),
          scaleInt(E[j]!, (THETA[k] as number[])[j]!),
        )
      ) {
        eigenvalues = false
      }
    }
  }

  const traces = E.map(
    e => e.reduce((s, row, i) => s + row[i]!, 0) / 576,
  )

  return { idempotent, orthogonal, complete, eigenvalues, traces }
}

// ---- the ring unitaries ----

// an element of Z[w][1/2]: numerator in Z[w] over 2^p, reduced (p = 0 or the numerator not divisible by 2)
export type Dyadic = { num: Eis; p: number }

const reduceDyadic = (d: Dyadic): Dyadic => {
  let { num, p } = d

  while (p > 0 && num[0] % 2 === 0 && num[1] % 2 === 0) {
    num = [num[0] / 2, num[1] / 2]
    p--
  }

  return { num, p }
}

const v2 = (n: number): number => {
  let k = 0
  let m = n

  while (m % 2 === 0) {
    m /= 2
    k++
  }

  return k
}

// the coefficient on orbital k of sum_j mu_j E_j: in Z[w][1/2] (the dyadic value), or undefined when the odd part of
// the denominator (a power of 3) does not divide the numerator
export function ringCoefficient(
  mu: readonly Eis[],
  k: number,
): Dyadic | undefined {
  let num: Eis = [0, 0]

  for (let j = 0; j < 5; j++) {
    num = eAdd(
      num,
      eMul(mu[j]!, [
        (EIGEN_DIMENSIONS[j] as number) * (THETA[k] as number[])[j]!,
        0,
      ]),
    )
  }

  const den = 24 * (VALENCY[k] as number)
  const p = v2(den)
  const odd = den / 2 ** p

  if (num[0] % odd !== 0 || num[1] % odd !== 0) {
    return undefined
  }

  return reduceDyadic({ num: [num[0] / odd, num[1] / odd], p })
}

export type RingUnitary = {
  mu: Eis[]
  // the unit indices (into UNITS) of mu
  units: number[]
  coefficients: Dyadic[]
  lineMixing: boolean
  reachesInnerOne: boolean
}

// every covariant unitary with entries in Z[w][1/2]: the 6^5 choices of units mu_j, kept when every coefficient lies
// in the ring
export function ringUnitaries(): {
  tried: number
  unitaries: RingUnitary[]
} {
  const unitaries: RingUnitary[] = []

  let tried = 0

  for (let code = 0; code < 6 ** 5; code++) {
    tried++

    const units = [0, 1, 2, 3, 4].map(
      j => Math.floor(code / 6 ** j) % 6,
    )
    const mu = units.map(u => (UNITS[u] as { value: Eis }).value)
    const coefficients: Dyadic[] = []

    let inRing = true

    for (let k = 0; k < 5 && inRing; k++) {
      const c = ringCoefficient(mu, k)

      if (!c) {
        inRing = false
      } else {
        coefficients.push(c)
      }
    }

    if (!inRing) {
      continue
    }

    const nz = (k: number): boolean => !eZero(coefficients[k]!.num)

    unitaries.push({
      mu,
      units,
      coefficients,
      lineMixing: nz(1) || nz(2) || nz(3),
      reachesInnerOne: nz(1) || nz(3),
    })
  }

  return { tried, unitaries }
}

// ---- dense Eisenstein matrices over 2^p, for the direct checks ----

export type EisMatrix = { entries: Eis[][]; p: number }

// the 24 x 24 matrix of a ring unitary, every entry over the common 2^p
export function ringMatrix(coefficients: readonly Dyadic[]): EisMatrix {
  const p = Math.max(...coefficients.map(c => c.p))
  const entries = Array.from({ length: 24 }, (_, d) =>
    Array.from({ length: 24 }, (_, e) => {
      const k = INNERS.indexOf(innerOf(d, e) as (typeof INNERS)[number])
      const c = coefficients[k]!
      const s = 2 ** (p - c.p)

      return [c.num[0] * s, c.num[1] * s] as Eis
    }),
  )

  return { entries, p }
}

// M M^dag = 4^p I exactly
export function isUnitary(m: EisMatrix): boolean {
  const scale = 4 ** m.p

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      let s: Eis = [0, 0]

      for (let k = 0; k < 24; k++) {
        s = eAdd(s, eMul(m.entries[i]![k]!, eConj(m.entries[j]![k]!)))
      }

      if (!eEq(s, [i === j ? scale : 0, 0])) {
        return false
      }
    }
  }

  return true
}

// the group elements a matrix fails to commute with (a permutation g commutes with M iff M[g d][g e] = M[d][e])
export function covarianceFailures(
  group: readonly number[][],
  entry: (d: number, e: number) => Eis,
): number {
  let off = 0

  for (const g of group) {
    let ok = true

    for (let d = 0; d < 24 && ok; d++) {
      for (let e = 0; e < 24 && ok; e++) {
        ok = eEq(entry(g[d]!, g[e]!), entry(d, e))
      }
    }

    if (!ok) {
      off++
    }
  }

  return off
}

// the product of two matrices over 2^p and 2^q, over 2^(p + q)
export function multiplyEis(a: EisMatrix, b: EisMatrix): EisMatrix {
  const entries = Array.from({ length: 24 }, (_, i) =>
    Array.from({ length: 24 }, (_, j) => {
      let s: Eis = [0, 0]

      for (let k = 0; k < 24; k++) {
        s = eAdd(s, eMul(a.entries[i]![k]!, b.entries[k]![j]!))
      }

      return s
    }),
  )

  return { entries, p: a.p + b.p }
}

export const sameEis = (a: EisMatrix, b: EisMatrix): boolean => {
  const p = Math.max(a.p, b.p)
  const sa = 2 ** (p - a.p)
  const sb = 2 ** (p - b.p)

  return a.entries.every((row, i) =>
    row.every((v, j) =>
      eEq(
        [v[0] * sa, v[1] * sa],
        [b.entries[i]![j]![0] * sb, b.entries[i]![j]![1] * sb],
      ),
    ),
  )
}

// the frame phase family M_alpha = I + (alpha - 1) Q, Q the projector on the frame-uniform eigenspaces (the first two):
// mu = (alpha, alpha, 1, 1, 1)
export const framePhaseMu = (alpha: Eis): Eis[] => [
  alpha,
  alpha,
  [1, 0],
  [1, 0],
  [1, 0],
]

// the line block of a matrix on the two slots of one line (d and its opposite), and its determinant over 4^p: the
// amplitude with which a full line of two vibes is kept by the matrix's second-quantized lift
export function lineBlockDeterminant(m: EisMatrix, d: number): Eis {
  const e = ROOTS.findIndex(r =>
    r.every((x, k) => x === -ROOTS[d]![k]!),
  )
  const a = m.entries[d]![d]!
  const b = m.entries[d]![e]!
  const c = m.entries[e]![d]!
  const f = m.entries[e]![e]!

  return eSub(eMul(a, f), eMul(b, c))
}

// |z|^2 of an Eisenstein integer
export const eNorm = (z: Eis): number =>
  z[0] * z[0] - z[0] * z[1] + z[1] * z[1]
