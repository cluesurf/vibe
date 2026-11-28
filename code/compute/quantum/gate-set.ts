// THE EXACT GATE SET OF THE BARE BEAT U (item vibe-computation-models-0030, Q1; decision 004 of vibe/computation/models).
// W12 read three gates inside bare U in float64 (test/verify/bare-universality-deep-checks.ts and the W12 note):
// the role meeting M_meet, its Lie closure on the 9-dim S = 1 sector of six like-sign excitations (su(9)), the 2/3
// role-SWAP of a pulse fused with a doublon, and the Sym^3 CZ near 0.99943 pi. This module rebuilds each one over
// Q(zeta_9) (code/algebra/ninth-field) so every equality, probability and phase is decided exactly.
//
//   the meeting        M = (zeta6 / 2) I + ((omega - 1) / 2) SWAP on the roles of two like-sign excitations on one line
//                      (bare-beat applyRoleMeet: omega on equal roles, the 2 x 2 keep / swap mixer on unequal ones).
//                      Eigenvalues: omega on the symmetric part, 1 on the antisymmetric part, so M^3 = I.
//   the spin sector    n excitations with roles 0 / 1 and k of them in role 1: the C(n, k) role words, each transposition
//                      P_pq a permutation matrix, M_pq = (zeta6 / 2) I + ((omega - 1) / 2) P_pq. The Casimir
//                      4 sum_{p<q} P_pq - n (n - 4) I has eigenvalue 4 S (S + 1) on total spin S, so the projector on
//                      one S is a rational polynomial in it.
//   the closure        compact closure of <M_{k,k+1}>. Its Lie algebra holds i P_ab Pi_std(abc) for every consecutive
//                      triple when <M_ab, M_bc> is infinite and non-abelian on the triple's 2-dim irrep (the density
//                      witness below). lieClosureDimension spans the real Lie algebra those generate by brackets, with an
//                      exact rank over Q on integer matrices (scaling never changes a span).
//   the density witness  on one '1' among three excitations (triv + std), g = M_ab M_bc; on std, 2 cos(theta) =
//                      |tr_std g|^2 - 2 for the angle theta between g's two eigenvalues. If that number is not an
//                      algebraic integer, theta / pi is irrational (2 cos of a rational multiple of pi is an algebraic
//                      integer), so g has infinite order in PU(2). A conjugate h = M_ab g M_ab^-1 that does not commute
//                      with g has another axis, so the closure's identity component is all of SO(3) = PU(2).
//   the Yang fusion    R_ab(w) = (w I - i P_ab) / (w + i); at u* = -sqrt3 / 2 the fused pulse-doublon operator is
//                      F = R_02(u* + i/2) R_12(u* - i/2) with u* + i/2 = i zeta6, u* - i/2 = i omega, so
//                      F = (zeta6 I - P_02)(omega I - P_12) / ((1 + zeta6)(1 + omega)), every entry in Q(omega).
//   Clifford levels    X^a Z^b up to a scalar for the level-1 test; level k + 1 when every generator's conjugate is at
//                      level k (the generators suffice up to level 3, because levels 1 and 2 are groups).
//
// DETERMINISM: no random numbers, no floating point, no call to the host Math object. EXACT: every test is an equality
// of Ninth numbers or of bigint matrices.

import {
  type Ninth,
  type NinthMatrix,
  ONE,
  ZERO,
  OMEGA,
  add,
  conj,
  dagger,
  equals,
  identityMatrix,
  isZero,
  matMul,
  mul,
  neg,
  ninth,
  scale,
  scaleMatrix,
  sameMatrix,
  sub,
  zetaPower,
} from '@/code/algebra/ninth-field'
import { Z9_MEET_SWAP, Z9_OMEGA, Z9_ZETA6, z9ToNinth } from '@/code/rule/bare-beat'

// ---- the meeting's coefficients, taken from the beat (bare-beat applyRoleMeet, branching denominator 2) ----

export const MEET_EQUAL: Ninth = z9ToNinth(Z9_OMEGA)
export const MEET_KEEP: Ninth = z9ToNinth(Z9_ZETA6, 2n)
export const MEET_SWAP: Ninth = z9ToNinth(Z9_MEET_SWAP, 2n)
export const ZETA6: Ninth = z9ToNinth(Z9_ZETA6)

type Matrix = Ninth[][]

const zeroMatrix = (n: number): Matrix => Array.from({ length: n }, () => Array.from({ length: n }, () => ZERO))

export const addMatrix = (a: NinthMatrix, b: NinthMatrix): Matrix => a.map((row, i) => row.map((x, j) => add(x, b[i]![j]!)))

export const subMatrix = (a: NinthMatrix, b: NinthMatrix): Matrix => a.map((row, i) => row.map((x, j) => sub(x, b[i]![j]!)))

export const isZeroMatrix = (a: NinthMatrix): boolean => a.every(row => row.every(isZero))

export const commutes = (a: NinthMatrix, b: NinthMatrix): boolean => sameMatrix(matMul(a, b), matMul(b, a))

export const isExactlyUnitary = (a: NinthMatrix): boolean =>
  sameMatrix(matMul(dagger(a), a), identityMatrix(a.length)) && sameMatrix(matMul(a, dagger(a)), identityMatrix(a.length))

// a + b P for a permutation matrix P given as an image list (column c goes to row image[c])
function linearInPermutation(image: readonly number[], a: Ninth, b: Ninth): Matrix {
  const m = zeroMatrix(image.length)

  image.forEach((r, c) => {
    m[c]![c] = add(m[c]![c]!, a)
    m[r]![c] = add(m[r]![c]!, b)
  })

  return m
}

// ---- two excitations with `roles` roles each: index r1 * roles + r2 ----

export function swapImage(roles: number): number[] {
  return Array.from({ length: roles * roles }, (_, c) => (c % roles) * roles + ((c - (c % roles)) / roles))
}

// the beat's layer read as a gate: omega on equal roles, keep / swap on unequal ones
export function meetGate(roles: number): Matrix {
  const m = zeroMatrix(roles * roles)

  for (let r1 = 0; r1 < roles; r1++) {
    for (let r2 = 0; r2 < roles; r2++) {
      const c = r1 * roles + r2

      if (r1 === r2) {
        m[c]![c] = MEET_EQUAL
      } else {
        m[c]![c] = MEET_KEEP
        m[r2 * roles + r1]![c] = MEET_SWAP
      }
    }
  }

  return m
}

// the closed form (zeta6 / 2) I + ((omega - 1) / 2) SWAP, to compare with meetGate
export const meetClosedForm = (roles: number): Matrix => linearInPermutation(swapImage(roles), MEET_KEEP, MEET_SWAP)

export const swapGate = (roles: number): Matrix => linearInPermutation(swapImage(roles), ZERO, ONE)

// ---- the spin sector: n excitations, k in role 1 ----

export type SpinSector = {
  n: number
  k: number
  // the positions in role 1, ascending, one entry per basis word
  words: number[][]
  index: Map<string, number>
}

export function spinSector(n: number, k: number): SpinSector {
  const words: number[][] = []

  const walk = (start: number, chosen: number[]): void => {
    if (chosen.length === k) {
      words.push([...chosen])

      return
    }

    for (let p = start; p < n; p++) {
      walk(p + 1, [...chosen, p])
    }
  }

  walk(0, [])

  return { n, k, words, index: new Map(words.map((w, i) => [w.join(','), i])) }
}

// the image of each basis word under the transposition (p q)
export function transpositionImage(sector: SpinSector, p: number, q: number): number[] {
  return sector.words.map(w => {
    const moved = w.map(x => (x === p ? q : x === q ? p : x)).sort((a, b) => a - b)

    return sector.index.get(moved.join(','))!
  })
}

export const meetOnSector = (sector: SpinSector, p: number, q: number): Matrix =>
  linearInPermutation(transpositionImage(sector, p, q), MEET_KEEP, MEET_SWAP)

// ---- integer matrices (exact rational work with denominators cleared) ----

export type IntMatrix = bigint[][]

const intZero = (n: number): IntMatrix => Array.from({ length: n }, () => Array<bigint>(n).fill(0n))

export const intIdentity = (n: number): IntMatrix => intZero(n).map((row, i) => row.map((_, j) => (i === j ? 1n : 0n)))

export function intMul(a: IntMatrix, b: IntMatrix): IntMatrix {
  const n = a.length
  const out = intZero(n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const x = a[i]![k]!

      if (x === 0n) {
        continue
      }

      for (let j = 0; j < n; j++) {
        out[i]![j]! += x * b[k]![j]!
      }
    }
  }

  return out
}

export const intAdd = (a: IntMatrix, b: IntMatrix): IntMatrix => a.map((row, i) => row.map((x, j) => x + b[i]![j]!))
export const intSub = (a: IntMatrix, b: IntMatrix): IntMatrix => a.map((row, i) => row.map((x, j) => x - b[i]![j]!))
export const intScale = (a: IntMatrix, s: bigint): IntMatrix => a.map(row => row.map(x => x * s))
export const intEqual = (a: IntMatrix, b: IntMatrix): boolean => a.every((row, i) => row.every((x, j) => x === b[i]![j]))
export const intTrace = (a: IntMatrix): bigint => a.reduce((s, row, i) => s + row[i]!, 0n)
export const intCommutator = (a: IntMatrix, b: IntMatrix): IntMatrix => intSub(intMul(a, b), intMul(b, a))

export function permutationInt(image: readonly number[]): IntMatrix {
  const m = intZero(image.length)

  image.forEach((r, c) => {
    m[r]![c] = 1n
  })

  return m
}

// 4 sum_{p<q} P_pq - n (n - 4) I, eigenvalue 4 S (S + 1) on total spin S
export function casimirInt(sector: SpinSector): IntMatrix {
  const size = sector.words.length

  let c = intScale(intIdentity(size), BigInt(-sector.n * (sector.n - 4)))

  for (let p = 0; p < sector.n; p++) {
    for (let q = p + 1; q < sector.n; q++) {
      c = intAdd(c, intScale(permutationInt(transpositionImage(sector, p, q)), 4n))
    }
  }

  return c
}

// the total spins present in the sector: |n/2 - k| to n/2, as 2S
export function twiceSpins(sector: SpinSector): number[] {
  const top = sector.n
  const low = sector.n - 2 * sector.k < 0 ? 2 * sector.k - sector.n : sector.n - 2 * sector.k
  const out: number[] = []

  for (let s = low; s <= top; s += 2) {
    out.push(s)
  }

  return out
}

const casimirValue = (twiceS: number): bigint => BigInt(twiceS * (twiceS + 2)) // 4 S (S + 1) = 2S (2S + 2)

// the projector on total spin S as numerator / denominator: prod_{S' != S} (C - c_S') / (c_S - c_S')
export function spinProjector(sector: SpinSector, twiceS: number): { numerator: IntMatrix; denominator: bigint } {
  const size = sector.words.length
  const c = casimirInt(sector)

  let numerator = intIdentity(size)
  let denominator = 1n

  for (const other of twiceSpins(sector)) {
    if (other === twiceS) {
      continue
    }

    numerator = intMul(numerator, intSub(c, intScale(intIdentity(size), casimirValue(other))))
    denominator *= casimirValue(twiceS) - casimirValue(other)
  }

  if (denominator < 0n) {
    numerator = intScale(numerator, -1n)
    denominator = -denominator
  }

  return { numerator, denominator }
}

// 3 Pi_std of the triple (a, b, c) = 3 I - (I + C + C^2), C = P_ab P_bc (the even part of S_3 is triv + sign)
export function tripleStdProjectorTimes3(sector: SpinSector, a: number, b: number, c: number): IntMatrix {
  const size = sector.words.length
  const cycle = intMul(permutationInt(transpositionImage(sector, a, b)), permutationInt(transpositionImage(sector, b, c)))
  const even = intAdd(intAdd(intIdentity(size), cycle), intMul(cycle, cycle))

  return intSub(intScale(intIdentity(size), 3n), even)
}

// ---- the real Lie algebra spanned by brackets, exact rank over Q ----

// X = re + i im with integer entries; a generator i G has re = 0, im = G
export type LieElement = { re: IntMatrix; im: IntMatrix }

export function lieBracket(x: LieElement, y: LieElement): LieElement {
  return {
    re: intSub(intCommutator(x.re, y.re), intCommutator(x.im, y.im)),
    im: intAdd(intCommutator(x.re, y.im), intCommutator(x.im, y.re)),
  }
}

const flatten = (x: LieElement): bigint[] => [...x.re.flat(), ...x.im.flat()]

function unflatten(v: readonly bigint[], n: number): LieElement {
  const at = (offset: number): IntMatrix =>
    Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => v[offset + i * n + j]!))

  return { re: at(0), im: at(n * n) }
}

const absBig = (x: bigint): bigint => (x < 0n ? -x : x)

function gcdBig(a: bigint, b: bigint): bigint {
  let x = absBig(a)
  let y = absBig(b)

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

function primitive(v: bigint[]): bigint[] {
  let g = 0n

  for (const x of v) {
    g = gcdBig(g, x)
  }

  return g <= 1n ? v : v.map(x => x / g)
}

// an echelon basis over Q kept as primitive integer rows; `insert` returns false when the vector lies in the span
export class RationalSpan {
  readonly rows: { pivot: number; row: bigint[] }[] = []

  reduce(input: readonly bigint[]): bigint[] {
    let v = [...input]

    for (const { pivot, row } of this.rows) {
      const x = v[pivot]!

      if (x === 0n) {
        continue
      }

      const p = row[pivot]!

      v = primitive(v.map((y, i) => p * y - x * row[i]!))
    }

    return v
  }

  insert(input: readonly bigint[]): bigint[] | undefined {
    const v = this.reduce(input)
    const pivot = v.findIndex(x => x !== 0n)

    if (pivot < 0) {
      return undefined
    }

    this.rows.push({ pivot, row: v })

    return v
  }

  get dimension(): number {
    return this.rows.length
  }
}

export type LieClosure = { dimension: number; closed: boolean; brackets: number }

// the real Lie algebra the generators span under brackets: every basis element is bracketed with every generator until
// nothing new appears (that span is closed under ad of each generator, hence under the whole bracket); stopped once the
// dimension passes `cap`
export function lieClosureDimension(generators: readonly LieElement[], cap: number): LieClosure {
  const n = generators[0]!.re.length
  const span = new RationalSpan()
  const queue: LieElement[] = []

  let brackets = 0

  for (const g of generators) {
    const row = span.insert(flatten(g))

    if (row) {
      queue.push(unflatten(row, n))
    }
  }

  // an array iterator reads the length at every step, so the elements pushed below are visited too
  for (const element of queue) {
    for (const g of generators) {
      brackets++

      const row = span.insert(flatten(lieBracket(element, g)))

      if (row) {
        queue.push(unflatten(row, n))

        if (span.dimension > cap) {
          return { dimension: span.dimension, closed: false, brackets }
        }
      }
    }
  }

  return { dimension: span.dimension, closed: true, brackets }
}

// i P_ab Pi_std(abc) Pi_S on the sector, scaled to integers: the generators the density witness puts in Lie(closure)
export function tripleGenerators(sector: SpinSector, twiceS: number): LieElement[] {
  const projector = spinProjector(sector, twiceS).numerator
  const size = sector.words.length
  const out: LieElement[] = []

  for (let a = 0; a + 2 < sector.n; a++) {
    const std = tripleStdProjectorTimes3(sector, a, a + 1, a + 2)

    for (const [p, q] of [
      [a, a + 1],
      [a + 1, a + 2],
    ] as const) {
      const g = intMul(intMul(permutationInt(transpositionImage(sector, p, q)), std), projector)

      out.push({ re: intZero(size), im: g })
    }
  }

  return out
}

// W12's own generators: the traceless part of i P_{k,k+1} Pi_S, scaled to integers (9 * 40 * P N - tr(P N) N for n = 6)
export function adjacentSwapGenerators(sector: SpinSector, twiceS: number): LieElement[] {
  const { numerator, denominator } = spinProjector(sector, twiceS)
  const size = sector.words.length
  const rank = intTrace(numerator) / denominator
  const out: LieElement[] = []

  for (let p = 0; p + 1 < sector.n; p++) {
    const pn = intMul(permutationInt(transpositionImage(sector, p, p + 1)), numerator)
    const g = intSub(intScale(pn, rank * denominator), intScale(numerator, intTrace(pn)))

    out.push({ re: intZero(size), im: g })
  }

  return out
}

// ---- the density witness on one triple ----

export type DensityWitness = {
  // M_ab^3 = I (a meeting) or M_ab^2 = I (a swap), and both letters are unitary
  meetOrderThree: boolean
  // g (1, 1, 1) = omega^2 (1, 1, 1): the trivial part of g = M_ab M_bc
  trivialEigenvalue: boolean
  // 2 cos(theta) = |tr_std g|^2 - 2
  twoCos: Ninth
  // twoCos is rational and not an integer: theta / pi irrational, g of infinite order in PU(2)
  irrationalAngle: boolean
  // h = M_ab g M_ab^2 does not commute with g: two different axes
  nonCommutingConjugate: boolean
}

// `trivial` is g's eigenvalue on (1, 1, 1): omega^2 for two meetings, 1 for two plain swaps (the control)
export function tripleDensityWitness(meetA: NinthMatrix, meetB: NinthMatrix, trivial: Ninth): DensityWitness {
  const g = matMul(meetA, meetB)
  const all = [ONE, ONE, ONE]
  const gAll = g.map(row => row.reduce((s, x, j) => add(s, mul(x, all[j]!)), ZERO))
  const traceG = g.reduce((s, row, i) => add(s, row[i]!), ZERO)
  const traceStd = sub(traceG, trivial)
  const twoCos = sub(mul(traceStd, conj(traceStd)), ninth([2]))
  const rational = twoCos.n.every((x, k) => k === 0 || x === 0n)
  const meetCube = matMul(matMul(meetA, meetA), meetA)
  const meetSquare = matMul(meetA, meetA)
  // M_ab^-1 = M_ab^2 for a meeting and M_ab for a swap: the dagger is the inverse of either
  const h = matMul(matMul(meetA, g), dagger(meetA))

  return {
    meetOrderThree:
      (sameMatrix(meetCube, identityMatrix(meetA.length)) || sameMatrix(meetSquare, identityMatrix(meetA.length))) &&
      isExactlyUnitary(meetA) &&
      isExactlyUnitary(meetB),
    trivialEigenvalue: gAll.every(x => equals(x, trivial)),
    twoCos,
    irrationalAngle: rational && twoCos.d !== 1n,
    nonCommutingConjugate: !commutes(g, h),
  }
}

// ---- Clifford hierarchy on n qudits of dimension d ----

function digitsOf(x: number, d: number, n: number): number[] {
  const out: number[] = []

  let rest = x

  for (let i = 0; i < n; i++) {
    const digit = rest % d

    out.unshift(digit)
    rest = (rest - digit) / d
  }

  return out
}

const numberOf = (digits: readonly number[], d: number): number => digits.reduce((s, x) => s * d + x, 0)

// the phase of Z on level j: omega^j for d = 3, (-1)^j for d = 2
const clockPhase = (d: number, j: number): Ninth => (d === 3 ? zetaPower(3 * (j % 3)) : j % 2 === 0 ? ONE : neg(ONE))

// X^a Z^b on n qudits, a and b as digit lists
export function pauli(d: number, n: number, a: readonly number[], b: readonly number[]): Matrix {
  const size = d ** n
  const m = zeroMatrix(size)

  for (let c = 0; c < size; c++) {
    const digits = digitsOf(c, d, n)

    let phase = ONE

    digits.forEach((x, i) => {
      phase = mul(phase, clockPhase(d, (b[i]! * x) % d))
    })

    const r = numberOf(
      digits.map((x, i) => (x + a[i]!) % d),
      d,
    )

    m[r]![c] = phase
  }

  return m
}

export function pauliGenerators(d: number, n: number): Matrix[] {
  const out: Matrix[] = []

  for (let i = 0; i < n; i++) {
    const unit = Array.from({ length: n }, (_, j) => (j === i ? 1 : 0))
    const none = Array<number>(n).fill(0)

    out.push(pauli(d, n, unit, none), pauli(d, n, none, unit))
  }

  return out
}

// U = c X^a Z^b for some scalar c: the shift a is read off row 0, then every clock b is tried
export function isPauliUpToPhase(u: NinthMatrix, d: number, n: number): boolean {
  const column = u[0]!.findIndex(x => !isZero(x))

  if (column < 0) {
    return false
  }

  const a = digitsOf(column, d, n).map(x => (d - x) % d)

  for (let b = 0; b < d ** n; b++) {
    const q = pauli(d, n, a, digitsOf(b, d, n))
    const v = matMul(u, dagger(q))
    const c = v[0]![0]!

    if (!isZero(c) && sameMatrix(v, scaleMatrix(identityMatrix(u.length), c))) {
      return true
    }
  }

  return false
}

function atLevel(u: NinthMatrix, level: number, d: number, n: number, generators: readonly Matrix[]): boolean {
  if (level === 1) {
    return isPauliUpToPhase(u, d, n)
  }

  const ud = dagger(u)

  return generators.every(p => atLevel(matMul(matMul(u, p), ud), level - 1, d, n, generators))
}

// the least level 1, 2 or 3 of the Clifford hierarchy holding U, or 0 when it lies in none of them
export function cliffordLevel(u: NinthMatrix, d: number, n: number): number {
  const generators = pauliGenerators(d, n)

  for (let level = 1; level <= 3; level++) {
    if (atLevel(u, level, d, n, generators)) {
      return level
    }
  }

  return 0
}

// ---- the Yang fusion on three excitations with three roles: index 9 r0 + 3 r1 + r2 ----

export function transpositionOnRoles(roles: number, count: number, p: number, q: number): number[] {
  const size = roles ** count

  return Array.from({ length: size }, (_, c) => {
    const digits = digitsOf(c, roles, count)
    const swapped = [...digits]

    swapped[p] = digits[q]!
    swapped[q] = digits[p]!

    return numberOf(swapped, roles)
  })
}

// (1 + zeta6)^-1 = (1 - omega) / 3 and (1 + omega)^-1 = zeta6^-1 = -omega, both checked by the caller
export const ONE_PLUS_ZETA6_INVERSE: Ninth = scale(sub(ONE, OMEGA), 1, 3)
export const ONE_PLUS_OMEGA_INVERSE: Ninth = neg(OMEGA)

// R_ab at the rapidity difference i x, divided out: (x I - P_ab) / (x + 1)
export function yangFactor(x: Ninth, xPlusOneInverse: Ninth, p: number, q: number): Matrix {
  return linearInPermutation(transpositionOnRoles(3, 3, p, q), mul(x, xPlusOneInverse), neg(xPlusOneInverse))
}

// F = R_02(i zeta6) R_12(i omega): the pulse (excitation 2) through the doublon (0, 1) at u* = -sqrt3 / 2
export function fusedRoleSwap(): { r02: Matrix; r12: Matrix; fused: Matrix } {
  const r02 = yangFactor(ZETA6, ONE_PLUS_ZETA6_INVERSE, 0, 2)
  const r12 = yangFactor(OMEGA, ONE_PLUS_OMEGA_INVERSE, 1, 2)

  return { r02, r12, fused: matMul(r02, r12) }
}

export const applyMatrix = (m: NinthMatrix, v: readonly Ninth[]): Ninth[] =>
  m.map(row => row.reduce((s, x, j) => (isZero(x) || isZero(v[j]!) ? s : add(s, mul(x, v[j]!))), ZERO))

export const innerProduct = (a: readonly Ninth[], b: readonly Ninth[]): Ninth =>
  a.reduce((s, x, i) => add(s, mul(conj(x), b[i]!)), ZERO)

export const basisVector = (size: number, entries: readonly (readonly [number, Ninth])[]): Ninth[] => {
  const v = Array.from({ length: size }, () => ZERO)

  for (const [i, x] of entries) {
    v[i] = add(v[i]!, x)
  }

  return v
}

// a number of Q(zeta_9) that is rational: every coordinate past the first is zero
export const isRational = (x: Ninth): boolean => x.n.every((c, k) => k === 0 || c === 0n)

// an algebraic integer of Q(zeta_9): Z[zeta_9] is the ring of integers and 1, zeta, ..., zeta^5 an integral basis
export const isAlgebraicInteger = (x: Ninth): boolean => x.d === 1n
