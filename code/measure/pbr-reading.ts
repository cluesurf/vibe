// PBR'S READING ON TWO ROLES, EXACT IN Z[w] (E-QTM-0191, decision 001 of the quantum-coverage project).
//
// Pusey, Barrett and Rudolph (2012): two systems, each prepared independently in psi_0 or psi_1 (non-orthogonal),
// and one entangled reading on the pair whose every outcome has chance exactly 0 on at least one of the four product
// preparations. Here a role is a qutrit, psi_0 = |0> and psi_1 = |+> = (|0> + |1> + |2>) / sqrt 3 (overlap 1/3, the
// only overlap two non-orthogonal stabilizer states have), and a reading is a unitary W followed by the computational
// readout, the outcome j having chance |<j| W |psi_x psi_y>|^2.
//
// EXACTNESS. Every gate is a matrix over Z[w], w = e^(2 pi i / 3), times a dropped positive scalar (1 / sqrt 3 for
// the Fourier gate, 1 / 2 for the swap phase, 1 / 3 for the singlet phase). The zero test (an amplitude is 0) and
// orthogonality do not see a positive scalar, and a chance is the exact rational N(amp) / (|row|^2 |state|^2). A
// number a + b w is a pair of doubles holding integers; every product is checked against 2^52, so a result is exact
// or the code throws.
//
// THE CLOSURE OF THE RULE'S WORDS BY MEETINGS. A word of the rule's letters is C_m M_m C_(m-1) ... M_1 C_0, each C_i a
// local Clifford pair (the links, 216 per role mod phases) and each M_i a meeting: the like meeting U (swap phase,
// U = ((1 + w) + (1 - w) SWAP) / 2), its inverse U^dag (the rule's meeting w U^dag up to phase), the love-fear meeting
// V = 1 + (w - 1) |Phi><Phi| and V^dag. U commutes with every A (x) A and V with every A (x) conj(A) (checked exactly
// over all 216 A), so C_i = D (I (x) B) with D moved left through the meeting into C_(i+1): every word with m meetings
// equals C M_m (I (x) B_(m-1)) ... M_1 (I (x) B_0), B_i one of 216, C a full local pair. The readout after C sees only
// C's coset mod the monomial local Cliffords (54 per role, which permute and rephase outcomes), so C ranges over the
// 4 x 4 product stabilizer bases (reps I, F, F S, F S^2 on each role). Searching that set for m = 0 .. M covers every
// element of the rule's group with at most M meetings, at any word length.

import { cliffordGroup } from '@/code/measure/eisenstein-words'

// ---- Z[w] vectors: Float64Array, entry i at [2 i, 2 i + 1] = (a, b) for a + b w ----

export type Vec = Float64Array

const LIMIT = 2 ** 52

const check = (x: number): number => {
  if (Math.abs(x) > LIMIT) {
    throw new Error(`Z[w] overflow ${x}`)
  }

  return x
}

// (a + b w)(c + d w) = ac - bd + (ad + bc - bd) w
const mulRe = (a: number, b: number, c: number, d: number): number =>
  a * c - b * d
const mulIm = (a: number, b: number, c: number, d: number): number =>
  a * d + b * c - b * d

export const eisNormOf = (a: number, b: number): number => a * a - a * b + b * b

export type Mat = { n: number; e: Float64Array }

export function matFrom(n: number, entries: readonly [number, number][]): Mat {
  const e = new Float64Array(2 * n * n)

  entries.forEach((z, i) => {
    e[2 * i] = z[0]
    e[2 * i + 1] = z[1]
  })

  return { n, e }
}

export function matVec(m: Mat, v: Vec): Vec {
  const n = m.n
  const out = new Float64Array(2 * n)

  for (let i = 0; i < n; i++) {
    let re = 0
    let im = 0

    for (let k = 0; k < n; k++) {
      const a = m.e[2 * (i * n + k)]!
      const b = m.e[2 * (i * n + k) + 1]!

      if (a === 0 && b === 0) {
        continue
      }

      const c = v[2 * k]!
      const d = v[2 * k + 1]!

      re += mulRe(a, b, c, d)
      im += mulIm(a, b, c, d)
    }

    out[2 * i] = check(re)
    out[2 * i + 1] = check(im)
  }

  return out
}

export function matMul(p: Mat, q: Mat): Mat {
  const n = p.n
  const e = new Float64Array(2 * n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        const a = p.e[2 * (i * n + k)]!
        const b = p.e[2 * (i * n + k) + 1]!
        const c = q.e[2 * (k * n + j)]!
        const d = q.e[2 * (k * n + j) + 1]!

        re += mulRe(a, b, c, d)
        im += mulIm(a, b, c, d)
      }

      e[2 * (i * n + j)] = check(re)
      e[2 * (i * n + j) + 1] = check(im)
    }
  }

  return { n, e }
}

// conj(a + b w) = (a - b) - b w
export function matConj(m: Mat): Mat {
  const e = new Float64Array(m.e.length)

  for (let i = 0; i < m.e.length; i += 2) {
    e[i] = m.e[i]! - m.e[i + 1]!
    e[i + 1] = -m.e[i + 1]!
  }

  return { n: m.n, e }
}

export function matAdjoint(m: Mat): Mat {
  const c = matConj(m)
  const n = m.n
  const e = new Float64Array(c.e.length)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      e[2 * (j * n + i)] = c.e[2 * (i * n + j)]!
      e[2 * (j * n + i) + 1] = c.e[2 * (i * n + j) + 1]!
    }
  }

  return { n, e }
}

export function matKron(p: Mat, q: Mat): Mat {
  const n = p.n * q.n
  const e = new Float64Array(2 * n * n)

  for (let i1 = 0; i1 < p.n; i1++) {
    for (let j1 = 0; j1 < p.n; j1++) {
      const a = p.e[2 * (i1 * p.n + j1)]!
      const b = p.e[2 * (i1 * p.n + j1) + 1]!

      for (let i2 = 0; i2 < q.n; i2++) {
        for (let j2 = 0; j2 < q.n; j2++) {
          const c = q.e[2 * (i2 * q.n + j2)]!
          const d = q.e[2 * (i2 * q.n + j2) + 1]!
          const at = (i1 * q.n + i2) * n + j1 * q.n + j2

          e[2 * at] = check(mulRe(a, b, c, d))
          e[2 * at + 1] = check(mulIm(a, b, c, d))
        }
      }
    }
  }

  return { n, e }
}

export const matEqual = (p: Mat, q: Mat): boolean =>
  p.n === q.n && p.e.every((x, i) => x === q.e[i])

// M M^dag = lambda I exactly, lambda a positive integer: M is a unitary times a positive scalar
export function scaledUnitary(m: Mat): number {
  const g = matMul(m, matAdjoint(m))
  const lambda = g.e[0]!

  if (!(lambda > 0)) {
    return 0
  }

  for (let i = 0; i < m.n; i++) {
    for (let j = 0; j < m.n; j++) {
      const re = g.e[2 * (i * m.n + j)]!
      const im = g.e[2 * (i * m.n + j) + 1]!

      if (im !== 0 || re !== (i === j ? lambda : 0)) {
        return 0
      }
    }
  }

  return lambda
}

// ---- the letters ----

const Z0: [number, number] = [0, 0]
const ONE: [number, number] = [1, 0]
const W: [number, number] = [0, 1]
const W2: [number, number] = [-1, -1]
const powW = (k: number): [number, number] => [ONE, W, W2][((k % 3) + 3) % 3]!

export const identity = (n: number): Mat =>
  matFrom(
    n,
    Array.from({ length: n * n }, (_, i) =>
      Math.floor(i / n) === i % n ? ONE : Z0,
    ),
  )

export const shift3 = (): Mat =>
  matFrom(3, [Z0, Z0, ONE, ONE, Z0, Z0, Z0, ONE, Z0])
export const clock3 = (): Mat =>
  matFrom(3, [ONE, Z0, Z0, Z0, W, Z0, Z0, Z0, W2])
export const phase3 = (): Mat =>
  matFrom(3, [ONE, Z0, Z0, Z0, ONE, Z0, Z0, Z0, W])
// sqrt 3 F: entries w^(jk)
export const fourier3 = (): Mat =>
  matFrom(
    3,
    Array.from({ length: 9 }, (_, i) => powW(Math.floor(i / 3) * (i % 3))),
  )

// 2 U: (1 + w) on the diagonal, (1 - w) from |ji> to |ij> (2 when i = j); dagger: conjugate entries (U is symmetric)
export function likeMeeting(dagger: boolean): Mat {
  const keep: [number, number] = dagger ? [0, -1] : [1, 1]
  const swap: [number, number] = dagger ? [2, 1] : [1, -1]
  const e: [number, number][] = Array.from({ length: 81 }, () => Z0)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = 3 * i + j
      const at = row * 9 + row
      const other = row * 9 + 3 * j + i

      e[at] = [e[at]![0] + keep[0], e[at]![1] + keep[1]]
      e[other] = [e[other]![0] + swap[0], e[other]![1] + swap[1]]
    }
  }

  return matFrom(9, e)
}

// 3 V: 3 on the diagonal plus (w - 1) between |jj> and |kk>; dagger: (w^2 - 1)
export function loveFearMeeting(dagger: boolean): Mat {
  const t: [number, number] = dagger ? [-2, -1] : [-1, 1]
  const e: [number, number][] = Array.from({ length: 81 }, (_, i) =>
    Math.floor(i / 9) === i % 9 ? [3, 0] : Z0,
  )

  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const at = 4 * j * 9 + 4 * k

      e[at] = [e[at]![0] + t[0], e[at]![1] + t[1]]
    }
  }

  return matFrom(9, e)
}

// the 216 local Cliffords of one role mod phases, as Z[w] matrices with the positive scalar dropped
export function localCliffords(): Mat[] {
  return cliffordGroup().map(m => matFrom(3, m.num as [number, number][]))
}

// ---- canonical form of a vector up to a nonzero scalar (powers of 2 and of 1 - w, and the six units) ----

const UNIT_LIST: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, -1],
  [-1, 0],
  [0, -1],
  [1, 1],
]

export function reduceVec(v: Vec): Vec {
  let out = Float64Array.from(v)

  if (out.every(x => x === 0)) {
    return out
  }

  while (out.every(x => x % 2 === 0)) {
    out = out.map(x => x / 2)
  }

  // 1 - w divides a + b w exactly when 3 divides a + b; z / (1 - w) = z (2 + w) / 3
  for (;;) {
    let divisible = true

    for (let i = 0; i < out.length; i += 2) {
      if ((out[i]! + out[i + 1]!) % 3 !== 0) {
        divisible = false
        break
      }
    }

    if (!divisible) {
      break
    }

    const next = new Float64Array(out.length)

    for (let i = 0; i < out.length; i += 2) {
      next[i] = mulRe(out[i]!, out[i + 1]!, 2, 1) / 3
      next[i + 1] = mulIm(out[i]!, out[i + 1]!, 2, 1) / 3
    }

    out = next
  }

  let first = 0

  while (out[first] === 0 && out[first + 1] === 0) {
    first += 2
  }

  let best: [number, number] = UNIT_LIST[0]!
  let bestValue: [number, number] = [out[first]!, out[first + 1]!]

  for (const u of UNIT_LIST) {
    const re = mulRe(out[first]!, out[first + 1]!, u[0], u[1])
    const im = mulIm(out[first]!, out[first + 1]!, u[0], u[1])

    if (re > bestValue[0] || (re === bestValue[0] && im > bestValue[1])) {
      best = u
      bestValue = [re, im]
    }
  }

  const result = new Float64Array(out.length)

  for (let i = 0; i < out.length; i += 2) {
    result[i] = mulRe(out[i]!, out[i + 1]!, best[0], best[1])
    result[i + 1] = mulIm(out[i]!, out[i + 1]!, best[0], best[1])
  }

  return result
}

export const tupleKey = (ys: readonly Vec[]): string =>
  ys
    .map(y => Array.from(y).join(','))
    .sort()
    .join('|')

export const vecNorm = (v: Vec): number => {
  let s = 0

  for (let i = 0; i < v.length; i += 2) {
    s += eisNormOf(v[i]!, v[i + 1]!)
  }

  return check(s)
}

// the hermitian product <u, v> = sum conj(u_i) v_i
export function inner(u: Vec, v: Vec): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < u.length; i += 2) {
    const a = u[i]! - u[i + 1]!
    const b = -u[i + 1]!

    re += mulRe(a, b, v[i]!, v[i + 1]!)
    im += mulIm(a, b, v[i]!, v[i + 1]!)
  }

  return [check(re), check(im)]
}

// ---- the preparations ----

export function kron3(x: Vec, y: Vec): Vec {
  const out = new Float64Array(18)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const at = 2 * (3 * a + b)

      out[at] = mulRe(x[2 * a]!, x[2 * a + 1]!, y[2 * b]!, y[2 * b + 1]!)
      out[at + 1] = mulIm(x[2 * a]!, x[2 * a + 1]!, y[2 * b]!, y[2 * b + 1]!)
    }
  }

  return out
}

export const ket3 = (re: readonly number[]): Vec =>
  Float64Array.from(re.flatMap(x => [x, 0]))

// the four products of psi_0, psi_1 on two roles: 00, 01, 10, 11
export const productPreparations = (psi0: Vec, psi1: Vec): Vec[] => [
  kron3(psi0, psi0),
  kron3(psi0, psi1),
  kron3(psi1, psi0),
  kron3(psi1, psi1),
]

// ---- the zero test of a reading given by its rows (amplitude row . state, no conjugation) ----

export type RowRead = {
  excluded: number
  // per outcome: the preparations it zeroes
  zeroes: number[][]
  // the outcome with the largest least chance, and that chance as an exact fraction
  leftoverOutcome: number
  leftoverNum: bigint
  leftoverDen: bigint
}

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export function readRows(rows: readonly Vec[], states: readonly Vec[]): RowRead {
  const zeroes: number[][] = []
  let leftoverOutcome = -1
  let leftoverNum = 0n
  let leftoverDen = 1n

  rows.forEach((r, j) => {
    const rowNorm = BigInt(vecNorm(r))
    const zs: number[] = []
    let leastNum = -1n
    let leastDen = 1n

    states.forEach((s, k) => {
      let re = 0
      let im = 0

      for (let i = 0; i < r.length; i += 2) {
        re += mulRe(r[i]!, r[i + 1]!, s[i]!, s[i + 1]!)
        im += mulIm(r[i]!, r[i + 1]!, s[i]!, s[i + 1]!)
      }

      check(re)
      check(im)

      if (re === 0 && im === 0) {
        zs.push(k)
      }

      const num = BigInt(eisNormOf(re, im))
      const den = rowNorm * BigInt(vecNorm(s))

      if (leastNum < 0n || num * leastDen < leastNum * den) {
        leastNum = num
        leastDen = den
      }
    })

    zeroes.push(zs)

    if (zs.length === 0 && leastNum * leftoverDen > leftoverNum * leastDen) {
      leftoverNum = leastNum
      leftoverDen = leastDen
      leftoverOutcome = j
    }
  })

  const g = gcd(leftoverNum, leftoverDen) || 1n

  return {
    excluded: zeroes.filter(z => z.length > 0).length,
    zeroes,
    leftoverOutcome,
    leftoverNum: leftoverNum / g,
    leftoverDen: leftoverDen / g,
  }
}

// the rows of a 9 x 9 matrix as vectors
export const rowsOf = (m: Mat): Vec[] =>
  Array.from({ length: m.n }, (_, i) =>
    m.e.slice(2 * m.n * i, 2 * m.n * (i + 1)),
  )

// Schmidt rank above 1: some 2 x 2 minor of the 3 x 3 coefficient matrix is nonzero
export function entangledRow(v: Vec): boolean {
  const at = (a: number, b: number): [number, number] => [
    v[2 * (3 * a + b)]!,
    v[2 * (3 * a + b) + 1]!,
  ]

  for (const [a1, a2] of [
    [0, 1],
    [0, 2],
    [1, 2],
  ]) {
    for (const [b1, b2] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      const p = at(a1!, b1!)
      const q = at(a2!, b2!)
      const r = at(a1!, b2!)
      const s = at(a2!, b1!)
      const re = mulRe(p[0], p[1], q[0], q[1]) - mulRe(r[0], r[1], s[0], s[1])
      const im = mulIm(p[0], p[1], q[0], q[1]) - mulIm(r[0], r[1], s[0], s[1])

      if (re !== 0 || im !== 0) {
        return true
      }
    }
  }

  return false
}

// ---- the two controls ----

// PBR's own qubit basis for |0>, |+> on qubits, embedded in |0>, |1> of each role, completed by the five
// computational vectors outside the embedded span; its preparations use psi_1 = |0> + |1>
export function pbrQubitReading(): { rows: Vec[]; preparations: Vec[] } {
  const v = (entries: [number, number, number][]): Vec => {
    const out = new Float64Array(18)

    for (const [a, b, x] of entries) {
      out[2 * (3 * a + b)] = x
    }

    return out
  }
  const xi = [
    v([
      [0, 1, 1],
      [1, 0, 1],
    ]),
    v([
      [0, 0, 1],
      [0, 1, -1],
      [1, 0, 1],
      [1, 1, 1],
    ]),
    v([
      [0, 0, 1],
      [0, 1, 1],
      [1, 0, -1],
      [1, 1, 1],
    ]),
    v([
      [0, 0, 1],
      [1, 1, -1],
    ]),
  ]
  const rest = [
    [0, 2],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ].map(([a, b]) => v([[a!, b!, 1]]))

  return {
    rows: [...xi, ...rest],
    preparations: productPreparations(ket3([1, 0, 0]), ket3([1, 1, 0])),
  }
}

// PBR's two-copy reading solved for the model's own states |0>, |+> (overlap 1/3 < 1/2, so two copies suffice):
// four entangled outcomes A, B, C, D, one orthogonal to each product preparation, inside the span of the products,
// each paired with a vector w_i of the span's orthogonal complement of the same norm (A + w, A - w stay orthogonal
// and zero what A zeroes), and the last complement vector. Every row has norm 16: the reading is 1/4 times an
// integer matrix, a real orthogonal matrix over Z[1/2]. With e0 = |0>, e1 = |1> + |2>, d = |1> - |2>:
//   A = 1 (x) 1 - e0 e0        zeroes |0 0>      w1 = 2 e0 d
//   B = -2 e0 e0 + e0 e1 - e1 e0  zeroes |0 +>   w2 = 2 d e0
//   C = -2 e0 e0 - e0 e1 + e1 e0  zeroes |+ 0>   w3 = e1 d + d e1
//   D = -e0 e1 - e1 e0 + e1 e1    zeroes |+ +>   w4 = e1 d - d e1,  and 2 d d
export function pbrTwoCopyReading(): { rows: Vec[]; preparations: Vec[] } {
  const e0 = [1, 0, 0]
  const e1 = [0, 1, 1]
  const d = [0, 1, -1]
  const all = [1, 1, 1]
  const outer = (x: number[], y: number[], c: number): number[] =>
    x.flatMap(p => y.map(q => c * p * q))
  const sum = (...terms: number[][]): Vec =>
    Float64Array.from(
      Array.from({ length: 9 }, (_, i) =>
        terms.reduce((s, t) => s + t[i]!, 0),
      ).flatMap(x => [x, 0]),
    )
  const a = sum(outer(all, all, 1), outer(e0, e0, -1))
  const b = sum(outer(e0, e0, -2), outer(e0, e1, 1), outer(e1, e0, -1))
  const c = sum(outer(e0, e0, -2), outer(e0, e1, -1), outer(e1, e0, 1))
  const dd = sum(outer(e0, e1, -1), outer(e1, e0, -1), outer(e1, e1, 1))
  const w = [
    sum(outer(e0, d, 2)),
    sum(outer(d, e0, 2)),
    sum(outer(e1, d, 1), outer(d, e1, 1)),
    sum(outer(e1, d, 1), outer(d, e1, -1)),
  ]
  const plusMinus = (x: Vec, y: Vec): Vec[] => [
    x.map((v, i) => v + y[i]!),
    x.map((v, i) => v - y[i]!),
  ]

  return {
    rows: [
      ...plusMinus(a, w[0]!),
      ...plusMinus(b, w[1]!),
      ...plusMinus(c, w[2]!),
      ...plusMinus(dd, w[3]!),
      sum(outer(d, d, 2)),
    ],
    preparations: productPreparations(ket3([1, 0, 0]), ket3([1, 1, 1])),
  }
}

// ---- the readout bases after the last local pair: the four stabilizer bases of a role, as row sets ----

export function readoutBases(): { name: string; m: Mat }[] {
  const f = fourier3()
  const s = phase3()

  return [
    { name: 'Z', m: identity(3) },
    { name: 'F', m: f },
    { name: 'FS', m: matMul(f, s) },
    { name: 'FS2', m: matMul(f, matMul(s, s)) },
  ]
}

// ---- the closure search ----

export type ClosureConfig = {
  meetings: string[]
  locals: number[]
  bases: [string, string]
}

export type ClosureRead = {
  depth: number
  configurations: number
  distinctTuples: number
  readings: number
  firstReading?: ClosureConfig
  bestExcluded: number
  // configurations that exclude bestExcluded outcomes
  bestCount: number
  // the least largest leftover chance over the configurations, exact, and one configuration with it
  leastLeftoverNum: bigint
  leastLeftoverDen: bigint
  leastLeftover?: ClosureConfig & { outcome: number }
  // over the configurations that exclude 8 of 9: how often each readout position (3 j1 + j2) is the one left
  leftoverPositions: number[]
  // over those: how often the left outcome's least chance is on each preparation
  leftoverPreparationCounts: number[]
}

type Basis = { name: string; m: Mat }

// role-2 action of a 3 x 3 matrix on a two-role vector
export function applySecond(b: Mat, v: Vec): Vec {
  const out = new Float64Array(18)

  for (let a = 0; a < 3; a++) {
    for (let c = 0; c < 3; c++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        const x = b.e[2 * (3 * c + k)]!
        const y = b.e[2 * (3 * c + k) + 1]!

        if (x === 0 && y === 0) {
          continue
        }

        re += mulRe(x, y, v[2 * (3 * a + k)]!, v[2 * (3 * a + k) + 1]!)
        im += mulIm(x, y, v[2 * (3 * a + k)]!, v[2 * (3 * a + k) + 1]!)
      }

      out[2 * (3 * a + c)] = check(re)
      out[2 * (3 * a + c) + 1] = check(im)
    }
  }

  return out
}

export function applyFirst(b: Mat, v: Vec): Vec {
  const out = new Float64Array(18)

  for (let c = 0; c < 3; c++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        const x = b.e[2 * (3 * c + k)]!
        const y = b.e[2 * (3 * c + k) + 1]!

        if (x === 0 && y === 0) {
          continue
        }

        re += mulRe(x, y, v[2 * (3 * k + j)]!, v[2 * (3 * k + j) + 1]!)
        im += mulIm(x, y, v[2 * (3 * k + j)]!, v[2 * (3 * k + j) + 1]!)
      }

      out[2 * (3 * c + j)] = check(re)
      out[2 * (3 * c + j) + 1] = check(im)
    }
  }

  return out
}

type Evaluated = {
  excluded: number
  bases: [number, number]
  leftover: number
  outcome: number
  preparation: number
}

// every product stabilizer readout of a tuple: per readout pair, the excluded count and the largest least chance
function evaluateTuple(
  ys: readonly Vec[],
  bases: readonly Basis[],
  rowNorms: readonly number[],
  visit: (e: Evaluated) => void,
): void {
  const norms = ys.map(vecNorm)

  for (let r2 = 0; r2 < bases.length; r2++) {
    const second = ys.map(y => applySecond(bases[r2]!.m, y))

    for (let r1 = 0; r1 < bases.length; r1++) {
      const amps = second.map(y => applyFirst(bases[r1]!.m, y))
      let excluded = 0
      let leftover = 0
      let outcome = -1
      let preparation = -1

      for (let j = 0; j < 9; j++) {
        let zero = false
        let least = Number.POSITIVE_INFINITY
        let leastAt = -1

        for (let k = 0; k < amps.length; k++) {
          const re = amps[k]![2 * j]!
          const im = amps[k]![2 * j + 1]!

          if (re === 0 && im === 0) {
            zero = true
            break
          }

          const p =
            eisNormOf(re, im) /
            (rowNorms[r1]! * rowNorms[r2]! * norms[k]!)

          if (p < least) {
            least = p
            leastAt = k
          }
        }

        if (zero) {
          excluded++
        } else if (least > leftover) {
          leftover = least
          outcome = j
          preparation = leastAt
        }
      }

      visit({ excluded, bases: [r1, r2], leftover, outcome, preparation })
    }
  }
}

export type Meeting = { name: string; m: Mat }

export function ruleMeetings(): Meeting[] {
  return [
    { name: 'U', m: likeMeeting(false) },
    { name: 'U^dag', m: likeMeeting(true) },
    { name: 'V', m: loveFearMeeting(false) },
    { name: 'V^dag', m: loveFearMeeting(true) },
  ]
}

// exact leftover fraction of one configuration's outcome
function exactLeftover(
  ys: readonly Vec[],
  b1: Mat,
  b2: Mat,
  outcome: number,
): [bigint, bigint] {
  const row = kron3Rows(b1, b2)[outcome]!
  const read = readRows([row], ys)
  // readRows reports the least chance of a non-zeroed outcome
  return [read.leftoverNum, read.leftoverDen]
}

// the nine rows of B1 (x) B2
export function kron3Rows(b1: Mat, b2: Mat): Vec[] {
  return rowsOf(matKron(b1, b2))
}

export function closureSearch(input: {
  preparations: readonly Vec[]
  maxMeetings: number
  meetings: readonly Meeting[]
  locals: readonly Mat[]
}): ClosureRead[] {
  const bases = readoutBases()
  const rowNorms = bases.map(b => vecNorm(b.m.e.slice(0, 6)))
  const out: ClosureRead[] = []

  type Node = { ys: Vec[]; meetings: string[]; locals: number[] }

  // the children of a node: I (x) B, then a meeting, every B and meeting
  const children = (node: Node, visit: (child: Node) => void): void => {
    input.locals.forEach((b, bi) => {
      const moved = node.ys.map(y => applySecond(b, y))

      for (const meeting of input.meetings) {
        visit({
          ys: moved.map(y => reduceVec(matVec(meeting.m, y))),
          meetings: [...node.meetings, meeting.name],
          locals: [...node.locals, bi],
        })
      }
    })
  }

  // layers 0 .. maxMeetings - 1 are stored with duplicates removed (equal up to a scalar per state and an order of the
  // states); the last layer is streamed from the one before it, every child read, none skipped
  let layer: Node[] = [
    { ys: input.preparations.map(reduceVec), meetings: [], locals: [] },
  ]

  for (let depth = 0; depth <= input.maxMeetings; depth++) {
    const streamed = depth > 0 && depth === input.maxMeetings
    let distinct = layer.length

    if (depth > 0 && !streamed) {
      const seen = new Set<string>()
      const next: Node[] = []

      for (const node of layer) {
        children(node, child => {
          const key = tupleKey(child.ys)

          if (!seen.has(key)) {
            seen.add(key)
            next.push(child)
          }
        })
      }

      layer = next
      distinct = layer.length
    }

    if (streamed) {
      distinct = -1
    }

    const read: ClosureRead = {
      depth,
      configurations: 0,
      distinctTuples: distinct,
      readings: 0,
      bestExcluded: 0,
      bestCount: 0,
      leastLeftoverNum: 1n,
      leastLeftoverDen: 1n,
      leftoverPositions: new Array<number>(9).fill(0),
      leftoverPreparationCounts: new Array<number>(4).fill(0),
    }
    let leastFloat = Number.POSITIVE_INFINITY
    let leastNode: Node | undefined
    let leastEval: Evaluated | undefined

    const evaluate = (node: Node): void =>
      evaluateTuple(node.ys, bases, rowNorms, e => {
        read.configurations++

        const config = (): ClosureConfig => ({
          meetings: node.meetings,
          locals: node.locals,
          bases: [bases[e.bases[0]]!.name, bases[e.bases[1]]!.name],
        })

        if (e.excluded === 9) {
          read.readings++
          read.firstReading ??= config()

          return
        }

        if (e.excluded > read.bestExcluded) {
          read.bestExcluded = e.excluded
          read.bestCount = 0
        }

        if (e.excluded === read.bestExcluded) {
          read.bestCount++
        }

        if (e.excluded === 8) {
          read.leftoverPositions[e.outcome]!++
          read.leftoverPreparationCounts[e.preparation]!++
        }

        if (e.leftover < leastFloat) {
          leastFloat = e.leftover
          leastNode = node
          leastEval = e
        }
      })

    for (const node of layer) {
      if (streamed) {
        children(node, evaluate)
      } else {
        evaluate(node)
      }
    }

    if (leastNode && leastEval) {
      const [num, den] = exactLeftover(
        leastNode.ys,
        bases[leastEval.bases[0]]!.m,
        bases[leastEval.bases[1]]!.m,
        leastEval.outcome,
      )

      read.leastLeftoverNum = num
      read.leastLeftoverDen = den
      read.leastLeftover = {
        meetings: leastNode.meetings,
        locals: leastNode.locals,
        bases: [
          bases[leastEval.bases[0]]!.name,
          bases[leastEval.bases[1]]!.name,
        ],
        outcome: leastEval.outcome,
      }
    }

    out.push(read)
  }

  return out
}

// ---- E-QTM-0180's word search, exact: X, Z, S, F on each role and U, computational readout ----

export type WordRead = {
  words: number
  readings: number
  firstReading: string
  bestExcluded: number
  // per length: least over words with U of the largest leftover chance, as a float and as an exact fraction
  leftoverByLength: number[]
  leftoverExact: [bigint, bigint][]
}

export function wordSearch(preparations: readonly Vec[], length: number): WordRead {
  const local = [shift3(), clock3(), phase3(), fourier3()]
  const names = ['X1', 'Z1', 'S1', 'F1', 'X2', 'Z2', 'S2', 'F2', 'U']
  const u = likeMeeting(false)
  const leftoverByLength = new Array<number>(length + 1).fill(
    Number.POSITIVE_INFINITY,
  )
  const bestStates: (Vec[] | undefined)[] = new Array(length + 1).fill(undefined)
  const bestOutcome = new Array<number>(length + 1).fill(-1)

  let words = 0
  let readings = 0
  let bestExcluded = 0
  let firstReading = ''

  const walk = (ys: Vec[], word: number[], hasU: boolean): void => {
    words++

    const norms = ys.map(vecNorm)
    let excluded = 0
    let leftover = 0
    let outcome = -1

    for (let j = 0; j < 9; j++) {
      let zero = false
      let least = Number.POSITIVE_INFINITY

      for (let k = 0; k < ys.length; k++) {
        const re = ys[k]![2 * j]!
        const im = ys[k]![2 * j + 1]!

        if (re === 0 && im === 0) {
          zero = true
          break
        }

        least = Math.min(least, eisNormOf(re, im) / norms[k]!)
      }

      if (zero) {
        excluded++
      } else if (least > leftover) {
        leftover = least
        outcome = j
      }
    }

    if (hasU) {
      bestExcluded = Math.max(bestExcluded, excluded)

      if (excluded < 9 && leftover < leftoverByLength[word.length]!) {
        leftoverByLength[word.length] = leftover
        bestStates[word.length] = ys
        bestOutcome[word.length] = outcome
      }
    }

    if (excluded === 9) {
      readings++
      firstReading ||= word.map(i => names[i]).join(' ')
    }

    if (word.length === length) {
      return
    }

    for (let l = 0; l < 9; l++) {
      if (l === 8 && word[word.length - 1] === 8) {
        continue
      }

      walk(
        ys.map(y =>
          reduceVec(
            l === 8
              ? matVec(u, y)
              : l < 4
                ? applyFirst(local[l]!, y)
                : applySecond(local[l - 4]!, y),
          ),
        ),
        [...word, l],
        hasU || l === 8,
      )
    }
  }

  walk(preparations.map(reduceVec), [], false)

  const unit: Vec[] = Array.from({ length: 9 }, (_, j) => {
    const v = new Float64Array(18)

    v[2 * j] = 1

    return v
  })
  const leftoverExact = bestStates.map((ys, l): [bigint, bigint] => {
    if (!ys || bestOutcome[l]! < 0) {
      return [0n, 0n]
    }

    const r = readRows([unit[bestOutcome[l]!]!], ys)

    return [r.leftoverNum, r.leftoverDen]
  })

  return {
    words,
    readings,
    firstReading,
    bestExcluded,
    leftoverByLength,
    leftoverExact,
  }
}
