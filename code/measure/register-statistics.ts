// SPIN AND STATISTICS ON THE REGISTER RULE (OPEN-MAT-03). E-SPN-0163 second-quantized the register rule by minors
// (fermions) and E-SPN-0014 typed its exchange signs. This file reads the statistics from the rule instead: it
// second-quantizes one exact box of the rule two ways, by minors and by permanents, tests each against the rule's own
// invariants, reads the exchange sign of each, and reads a member's 2 pi turn sign through the W(F4) rotations on the
// Cl+(4) register, in both lifts the rule is covariant under.
//
//   toyBox              the smallest box of the register rule that runs exactly: two docks of 4 modes, a rank-2
//                       non-coordinate projector at each dock, beat 1 the mixer u on Q1, beat 2 conj(u) on Q2, each
//                       followed by the mode reversal and the stream between the docks (E-SPN-0175's exact toy, with a
//                       second beat), and the box's translation (dock x <-> dock y), over Q(w)
//   quantizations       FERMION (minors on 0/1 occupations), BOSON (permanents on every occupation), and the control
//                       HARD_CORE (permanents on 0/1 occupations: the fermion's own state space with the exchange sign
//                       typed +1). Each gives a scaled amplitude amp(P, T, S) and a weight w(S), the normalized element
//                       being amp / sqrt(w(T) w(S)), so every check below is exact rational arithmetic
//   invariant checks    unitary (reversibility), multiplicative (the beats compose), covariant (commutes with the box's
//                       translation), seaKept (the full sea, every mode once, goes to itself with a unit amplitude: one
//                       branch), capacityLeak (the weight a 0/1 state sends to states with a mode holding two)
//   exchangeSign        the eigenvalue of the second-quantized mode swap on a state holding both swapped modes, read
//                       against a reference state (the empty box, or the full sea for holes); null if not an eigenstate
//   turn sign           simpleRotations (the W(F4) rotations fixing a plane), spinLift (the rotor s in Cl+ with
//                       s v s^-1 = g v), left and right multiplication, powerSign (the sign of the k-th power of a
//                       register action for a rotation of order k: the 2 pi turn), commutatorGap (the rule's projectors
//                       against a float register action)
//
// DETERMINISM: no random numbers. EXACT: the box and its quantizations are BigInt over Q(w). The rotor s has entries in
// Z[1/2, 1/sqrt 2, sqrt 3 / 2], so the turn-sign readings are floats checked to a tolerance (measurement on exact data).

import { clifford } from '@/code/measure/chiral-register'
import {
  qw,
  qwAdd,
  qwConj,
  qwFromUnit,
  qwIsZero,
  qwMul,
  qwSub,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import { qwDet, qwMatMulSq } from '@/code/measure/register-many-body'
import {
  EVEN,
  MODES,
  ODD,
  type GroupElement,
} from '@/code/measure/spinor-register'
import { type RingUnit } from '@/code/rule/swap-mixer'

const REG = 8
const SLOTS = 24

type Rows = readonly (readonly number[])[]

// ---- the box ----

export type Box = {
  n: number
  beats: QWMatrix[]
  translation: QWMatrix
}

const zeros = (n: number): QWMatrix =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => QW_ZERO))

/** The permutation matrix sending mode k to to[k], [to][from]. */
export function permutationMatrix(to: readonly number[]): QWMatrix {
  const M = zeros(to.length)

  to.forEach((t, k) => ((M[t] as QW[])[k] = QW_ONE))

  return M
}

// a rank-2 projector in each dock of 4 modes: 1/2 on each of the two given mode pairs
function pairProjector(
  n: number,
  pairs: readonly (readonly [number, number])[],
): QWMatrix {
  const half = qw(1n, 0n, 2n)
  const Q = zeros(n)

  for (let dock = 0; dock < n / 4; dock++) {
    for (const [a, b] of pairs) {
      for (const i of [a, b]) {
        for (const j of [a, b]) {
          ;(Q[dock * 4 + i] as QW[])[dock * 4 + j] = half
        }
      }
    }
  }

  return Q
}

const mixer = (Q: QWMatrix, w: QW): QWMatrix =>
  Q.map((r, i) =>
    r.map((x, j) =>
      qwAdd(i === j ? QW_ONE : QW_ZERO, qwMul(qwSub(w, QW_ONE), x)),
    ),
  )

/**
 * The exact two-dock box: beat 1 = stream (mixer u on Q1), beat 2 = stream (mixer conj u on Q2), the stream being
 * E-SPN-0175's mode reversal in each dock with modes 1 <-> 5 and 2 <-> 6 streaming between the docks; the
 * translation sends mode i to i + 4 mod 8.
 */
export function toyBox(unit: RingUnit): Box {
  const n = 8
  const stream = permutationMatrix([3, 6, 5, 0, 7, 2, 1, 4])
  const u = qwFromUnit(unit)
  const Q1 = pairProjector(n, [
    [0, 1],
    [2, 3],
  ])
  const Q2 = pairProjector(n, [
    [0, 2],
    [1, 3],
  ])

  return {
    n,
    beats: [
      qwMatMulSq(stream, mixer(Q1, u)),
      qwMatMulSq(stream, mixer(Q2, qwConj(u))),
    ],
    translation: permutationMatrix(
      Array.from({ length: n }, (_, i) => (i + 4) % n),
    ),
  }
}

// ---- the permanent ----

/** The permanent of a square Q(w) matrix, by the row-by-row subset recursion (k 2^k products). */
export function qwPermanent(M: readonly (readonly QW[])[]): QW {
  const k = M.length

  let dp = new Map<number, QW>([[0, QW_ONE]])

  for (let i = 0; i < k; i++) {
    const next = new Map<number, QW>()

    for (const [mask, v] of dp) {
      for (let c = 0; c < k; c++) {
        const x = (M[i] as QW[])[c]!

        if ((mask >> c) & 1 || qwIsZero(x)) {
          continue
        }

        const m = mask | (1 << c)

        next.set(m, qwAdd(next.get(m) ?? QW_ZERO, qwMul(v, x)))
      }
    }

    dp = next
  }

  return dp.get((1 << k) - 1) ?? QW_ZERO
}

// ---- the quantizations ----

/** A k-member state as its modes in increasing order, repeats allowed (a mode holding two appears twice). */
export type State = readonly number[]

export type Quantization = {
  name: 'fermion' | 'boson' | 'hard-core'
  states: (n: number, k: number) => State[]
  amp: (P: QWMatrix, to: State, from: State) => QW
  weight: (s: State) => bigint
}

function choose(n: number, k: number, repeat: boolean): State[] {
  const out: number[][] = []
  const walk = (start: number, acc: number[]): void => {
    if (acc.length === k) {
      out.push([...acc])

      return
    }

    for (let i = start; i < n; i++) {
      acc.push(i)
      walk(repeat ? i : i + 1, acc)
      acc.pop()
    }
  }

  walk(0, [])

  return out
}

const sub = (P: QWMatrix, rows: State, cols: State): QW[][] =>
  rows.map(r => cols.map(c => (P[r] as QW[])[c]!))

/** The product of the factorials of a state's mode multiplicities. */
export function multiplicityWeight(s: State): bigint {
  let w = 1n
  let run = 1n

  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) {
      run++
      w *= run
    } else {
      run = 1n
    }
  }

  return w
}

export const FERMION: Quantization = {
  name: 'fermion',
  states: (n, k) => choose(n, k, false),
  amp: (P, to, from) => qwDet(sub(P, to, from)),
  weight: () => 1n,
}

export const BOSON: Quantization = {
  name: 'boson',
  states: (n, k) => choose(n, k, true),
  amp: (P, to, from) => qwPermanent(sub(P, to, from)),
  weight: multiplicityWeight,
}

export const HARD_CORE: Quantization = {
  name: 'hard-core',
  states: (n, k) => choose(n, k, false),
  amp: (P, to, from) => qwPermanent(sub(P, to, from)),
  weight: () => 1n,
}

const qwOver = (x: QW, den: bigint): QW => qw(x.a, x.b, x.d * den)

/** The scaled k-member block [to][from] and the weights of its states. */
export function block(
  q: Quantization,
  P: QWMatrix,
  k: number,
): { states: State[]; amp: QWMatrix; weight: bigint[] } {
  const states = q.states(P.length, k)

  return {
    states,
    amp: states.map(t => states.map(s => q.amp(P, t, s))),
    weight: states.map(q.weight),
  }
}

// the scaled product: (A B)_TS = sum_R A_TR B_RS / w(R)
function scaledProduct(
  A: QWMatrix,
  B: QWMatrix,
  weight: readonly bigint[],
): QWMatrix {
  return A.map(row =>
    (B[0] as QW[]).map((_, j) =>
      row.reduce(
        (s, x, r) =>
          qwIsZero(x)
            ? s
            : qwAdd(s, qwOver(qwMul(x, (B[r] as QW[])[j]!), weight[r]!)),
        QW_ZERO,
      ),
    ),
  )
}

const equal = (A: QWMatrix, B: QWMatrix): boolean =>
  A.every((r, i) =>
    r.every((x, j) => qwIsZero(qwSub(x, (B[i] as QW[])[j]!))),
  )

/** Reversibility: the normalized block is unitary, sum_S amp_TS conj(amp_T'S) / w(S) = delta_TT' w(T). */
export function unitary(q: Quantization, P: QWMatrix, k: number): boolean {
  const b = block(q, P, k)
  const dag = (b.amp[0] as QW[]).map((_, j) => b.amp.map(r => qwConj(r[j]!)))
  const G = scaledProduct(b.amp, dag, b.weight)

  return G.every((r, i) =>
    r.every((x, j) =>
      qwIsZero(qwSub(x, i === j ? qw(b.weight[i]!, 0n) : QW_ZERO)),
    ),
  )
}

/** The beats compose: Gamma(A) Gamma(B) = Gamma(AB) on the k-member block. */
export function multiplicative(
  q: Quantization,
  A: QWMatrix,
  B: QWMatrix,
  k: number,
): boolean {
  const a = block(q, A, k)
  const b = block(q, B, k)

  return equal(
    scaledProduct(a.amp, b.amp, a.weight),
    block(q, qwMatMulSq(A, B), k).amp,
  )
}

/** Translation covariance: Gamma(T) Gamma(P) = Gamma(P) Gamma(T) on the k-member block. */
export function covariant(
  q: Quantization,
  P: QWMatrix,
  T: QWMatrix,
  k: number,
): boolean {
  const p = block(q, P, k)
  const t = block(q, T, k)

  return equal(
    scaledProduct(t.amp, p.amp, p.weight),
    scaledProduct(p.amp, t.amp, p.weight),
  )
}

/**
 * The full sea (every mode once): its amplitude to itself, and whether it stays one branch with a unit amplitude
 * (|amp|^2 = 1 exactly, so no weight leaves it).
 */
export function seaKept(
  q: Quantization,
  P: QWMatrix,
): { amp: QW; kept: boolean } {
  const full = Array.from({ length: P.length }, (_, i) => i)
  const a = q.amp(P, full, full)

  return { amp: a, kept: qwIsZero(qwSub(qwMul(a, qwConj(a)), QW_ONE)) }
}

const qwReal = (x: QW): number =>
  (Number(x.a) - Number(x.b) / 2) / Number(x.d)

/**
 * The largest weight any k-member 0/1 state sends to states with some mode held twice (|amp|^2 / w(T), the start's
 * weight being 1), exactly. Zero on a quantization whose states never hold two.
 */
export function capacityLeak(q: Quantization, P: QWMatrix, k: number): QW {
  const states = q.states(P.length, k)
  const multi = states.filter(t => multiplicityWeight(t) > 1n)

  let worst = QW_ZERO

  for (const s of states.filter(x => multiplicityWeight(x) === 1n)) {
    let w = QW_ZERO

    for (const t of multi) {
      const a = q.amp(P, t, s)

      w = qwAdd(w, qwOver(qwMul(a, qwConj(a)), q.weight(t)))
    }

    if (qwReal(w) > qwReal(worst)) {
      worst = w
    }
  }

  return worst
}

// ---- the exchange sign ----

/** The one-body swap of modes a and b on n modes. */
export const swapOf = (n: number, a: number, b: number): QWMatrix =>
  permutationMatrix(
    Array.from({ length: n }, (_, i) => (i === a ? b : i === b ? a : i)),
  )

/**
 * The sign the second-quantized swap of modes a and b gives a state holding both, against a reference state's own
 * amplitude under the same swap: +1 or -1 when the state is an eigenstate of the swap and the ratio is a real unit,
 * null otherwise.
 */
export function exchangeSign(
  q: Quantization,
  n: number,
  state: State,
  reference: State,
  a: number,
  b: number,
): number | null {
  const S = swapOf(n, a, b)
  const own = q.amp(S, state, state)
  const ref = q.amp(S, reference, reference)
  const eigen = q
    .states(n, state.length)
    .filter(t => t.some((x, i) => x !== state[i]))
    .every(t => qwIsZero(q.amp(S, t, state)))

  if (!eigen || own.b !== 0n || ref.b !== 0n || ref.a === 0n) {
    return null
  }

  const ratio = Number(own.a * ref.d) / Number(ref.a * own.d)

  return ratio === 1 ? 1 : ratio === -1 ? -1 : null
}

// ---- the turn sign ----

const bladeKey = (b: readonly number[]): string => b.join(',')
const EVEN_INDEX = new Map(EVEN.map((b, k) => [bladeKey(b), k]))
const ODD_INDEX = new Map(ODD.map((b, k) => [bladeKey(b), k]))

const matMul = (a: Rows, b: Rows): number[][] =>
  a.map(r =>
    (b[0] as number[]).map((_, j) =>
      r.reduce((s, x, k) => s + x * (b[k] as number[])[j]!, 0),
    ),
  )

// the rank by elimination, and the eliminated rows with their pivot columns (floats; W(F4) entries are dyadic)
function eliminate(m: Rows): { rows: number[][]; pivots: number[] } {
  const a = m.map(r => [...r])
  const pivots: number[] = []
  const width = (a[0] as number[]).length

  let rank = 0

  for (let c = 0; c < width && rank < a.length; c++) {
    let p = -1

    for (let r = rank; r < a.length; r++) {
      const x = Math.abs(a[r]![c]!)

      if (x > 1e-9 && (p < 0 || x > Math.abs(a[p]![c]!))) {
        p = r
      }
    }

    if (p < 0) {
      continue
    }

    ;[a[rank], a[p]] = [a[p]!, a[rank]!]

    const pv = a[rank]![c]!

    a[rank] = a[rank]!.map(x => x / pv)

    for (let r = 0; r < a.length; r++) {
      if (r !== rank) {
        const f = a[r]![c]!

        a[r] = a[r]!.map((x, j) => x - f * a[rank]![j]!)
      }
    }

    pivots.push(c)
    rank++
  }

  return { rows: a, pivots }
}

const isScalar = (m: Rows, s: number, tol: number): boolean =>
  m.every((r, i) =>
    r.every((x, j) => Math.abs(x - (i === j ? s : 0)) <= tol),
  )

/** The order of a matrix (the least k with g^k = 1), up to `max`; -1 past it. */
export function orderOf(m: Rows, max = 24): number {
  let p = m.map(r => [...r])

  for (let k = 1; k <= max; k++) {
    if (isScalar(p, 1, 1e-9)) {
      return k
    }

    p = matMul(p, m)
  }

  return -1
}

/** The rotations of W(F4) that fix a 2-plane pointwise (a turn in one plane only), with their orders. */
export function simpleRotations(
  group: readonly GroupElement[],
  det: (m: Rows) => number,
): { g: GroupElement; order: number }[] {
  return group
    .filter(g => det(g.matrix) === 1)
    .filter(
      g =>
        eliminate(
          g.matrix.map((r, i) => r.map((x, j) => x - (i === j ? 1 : 0))),
        ).pivots.length === 2,
    )
    .map(g => ({ g, order: orderOf(g.matrix) }))
}

// x y or y x for x in Cl+ (coefficients on EVEN) and y an even blade, on the even blades: [row][col]
function multiplication(x: readonly number[], side: 'left' | 'right'): number[][] {
  const M = EVEN.map(() => Array<number>(REG).fill(0))

  EVEN.forEach((B, col) =>
    EVEN.forEach((A, k) => {
      if (x[k] === 0) {
        return
      }

      const p = side === 'left' ? clifford(A, B) : clifford(B, A)

      M[EVEN_INDEX.get(bladeKey(p.blade))!]![col]! += p.sign * x[k]!
    }),
  )

  return M
}

/** L(x) w = x w on the even blades, for x in Cl+ given by its coefficients on EVEN. */
export const leftMultiplication = (x: readonly number[]): number[][] =>
  multiplication(x, 'left')

/** R(x) w = w x on the even blades, for x in Cl+ given by its coefficients on EVEN. */
export const rightMultiplicationOf = (x: readonly number[]): number[][] =>
  multiplication(x, 'right')

/** The reversion of x in Cl+: the sign (-1)^(r (r - 1) / 2) on grade r (for a unit rotor, its inverse). */
export const reversed = (x: readonly number[]): number[] =>
  x.map((c, k) => {
    const r = EVEN[k]!.length

    return ((r * (r - 1)) / 2) % 2 === 0 ? c : -c
  })

// the vector v times each even blade on the left (v w) or right (w v), even to odd: [odd][even]
function vectorTimes(v: readonly number[], side: 'left' | 'right'): number[][] {
  const M = ODD.map(() => Array<number>(REG).fill(0))

  EVEN.forEach((B, col) =>
    [0, 1, 2, 3].forEach(i => {
      if (v[i] === 0) {
        return
      }

      const p = side === 'left' ? clifford([i], B) : clifford(B, [i])

      M[ODD_INDEX.get(bladeKey(p.blade))!]![col]! += p.sign * v[i]!
    }),
  )

  return M
}

/**
 * The rotor of a rotation g: the unit s in Cl+ with s e_i = (g e_i) s for every axis (so s v s^-1 = g v), the null
 * vector of a 32 x 8 linear system, normalized to |s| = 1 and signed so its first nonzero coefficient (the scalar
 * first) is positive. For a turn by 2 pi / k in one plane with k > 2 this is the short lift cos(pi / k) + sin(pi / k) B,
 * the end of the path of turns from 1; for a half turn (k = 2) the sign is a convention the even power never sees.
 */
export function spinLift(g: Rows): number[] {
  const rows: number[][] = []

  for (let i = 0; i < 4; i++) {
    const image = [0, 1, 2, 3].map(k => (g[k] as number[])[i]!)
    const left = vectorTimes(image, 'left')
    const right = vectorTimes(
      [0, 1, 2, 3].map(k => (k === i ? 1 : 0)),
      'right',
    )

    left.forEach((r, a) => rows.push(r.map((x, b) => x - right[a]![b]!)))
  }

  const { rows: a, pivots } = eliminate(rows)
  const free = Array.from({ length: REG }, (_, c) => c).filter(
    c => !pivots.includes(c),
  )

  if (free.length !== 1) {
    throw new Error(`rotor null space of dimension ${free.length}`)
  }

  const f = free[0]!
  const s = Array<number>(REG).fill(0)

  s[f] = 1
  pivots.forEach((c, r) => (s[c] = -a[r]![f]!))

  const norm = Math.hypot(...s)
  const first = s.find(x => Math.abs(x) > 1e-9)!

  return s.map(x => (Math.sign(first) * x) / norm)
}

/**
 * The sign of the k-th power of a register action, k the rotation's order (the 2 pi turn): +1 or -1 when the power
 * is +-1 within `tol`, null otherwise.
 */
export function powerSign(M: Rows, k: number, tol = 1e-9): number | null {
  let p = M.map(r => [...r])

  for (let i = 1; i < k; i++) {
    p = matMul(p, M)
  }

  return isScalar(p, 1, tol) ? 1 : isScalar(p, -1, tol) ? -1 : null
}

/** The largest entry of a - b. */
export const largestGap = (a: Rows, b: Rows): number =>
  Math.max(
    ...a.map((r, i) =>
      Math.max(...r.map((x, j) => Math.abs(x - (b[i] as number[])[j]!))),
    ),
  )

export const multiply8 = matMul

/**
 * The largest entry of g Q - Q g on the 192 modes, g acting on (slot d, register b) as (slots[d], register[a][b]):
 * code/measure/spinor-register's commutesExactly with a measured gap, for a float register action.
 */
export function commutatorGap(
  slots: Int32Array,
  register: Rows,
  q: Float64Array,
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
            left += register[a]![b]! * q[(d * REG + b) * n + e * REG + c]!
            right += q[(sd * REG + a) * n + se * REG + b]! * register[b]![c]!
          }

          worst = Math.max(worst, Math.abs(left - right))
        }
      }
    }
  }

  return worst
}
