// THE MANY-BODY RULE WITH REGISTERS (E-SPN-0163). Every piece of E-SPN-0160's register rule (the swap coin, the mixers on
// Q_S and Q_D, E-FRC-0258's chiral masses, E-FRC-0259's flavor masses, the stream) is a ONE-BODY unitary P on a member's
// mode space. The fermionic many-body rule is then its second quantization Gamma(P): the unique extension that is
// multiplicative (Gamma(AB) = Gamma(A) Gamma(B)), restricts to P on one member, and blocks two members from one mode
// (Pauli), and on a k-member state its matrix element is a k x k minor, <S'| Gamma(P) |S> = det P[S', S] (the exterior
// power; Cauchy-Binet is multiplicativity). E-SPN-0140's rank-one dock mixer 1 + (e^(i theta) - 1) N_U is the special
// case Gamma(1 + (e^(i theta) - 1) |U><U|). This file builds that rule exactly on small Fock spaces, the one-hole
// propagator it implies, the two-body vertex the halves need, and the pair states the pair table can make.
//
//   QW exact           the Q(w) arithmetic of code/measure/flavor-register, with an inverse and an exact determinant
//   fockGamma          Gamma(P) by minors, block by member number, exact over Q(w)
//   fermion operators  c and c^dag on bitmask Fock states with the ascending-order sign, a second-quantized two-body
//                      operator, and the particle-hole map Xi (c <-> c^dag, the empty state to the full one)
//   register exchange  the two-body operator that swaps two members' registers and keeps their flavors; H' = sum over
//                      pairs of (1 - swap), integer valued, so the vertex v^H' is an exact unit phase for a ring unit v
//   rest pair toy      two members at rest in E-FRC-0259's singlet scalar pair (blades 1, vol) x 3 flavors: 6 modes,
//                      the free beat Gamma(b), the vertex, and the exact rational transition probabilities between
//                      chirality states
//
// DETERMINISM: no random numbers. EXACT: every statement read here is BigInt arithmetic over Q(w).

import { eisConj, eisNorm } from '@/code/measure/swap-cone'
import {
  qw,
  qwAdd,
  qwConj,
  qwMul,
  qwSub,
  qwIsZero,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'

// ---- exact Q(w) extras ----

/** 1 / x for x = (a + b w) / d nonzero: d conj(a + b w) / N(a + b w). */
export function qwInv(x: QW): QW {
  const n = eisNorm([x.a, x.b])
  const c = eisConj([x.a, x.b])

  return qw(c[0] * x.d, c[1] * x.d, n)
}

export const qwNeg = (x: QW): QW => qw(-x.a, -x.b, x.d)

export function qwPow(x: QW, k: number): QW {
  let r = QW_ONE

  for (let i = 0; i < k; i++) {
    r = qwMul(r, x)
  }

  return r
}

/** The determinant of a square Q(w) matrix, by elimination (0 x 0 is 1). */
export function qwDet(M: readonly (readonly QW[])[]): QW {
  const n = M.length
  const a = M.map(r => [...r])

  let det = QW_ONE

  for (let c = 0; c < n; c++) {
    const p = a.findIndex((r, i) => i >= c && !qwIsZero(r[c]!))

    if (p < 0) {
      return QW_ZERO
    }

    if (p !== c) {
      ;[a[c], a[p]] = [a[p]!, a[c]!]
      det = qwNeg(det)
    }

    const pivot = a[c]![c]!
    const inv = qwInv(pivot)

    det = qwMul(det, pivot)

    for (let r = c + 1; r < n; r++) {
      const row = a[r]!
      const f = qwMul(row[c]!, inv)

      if (qwIsZero(f)) {
        continue
      }

      for (let k = c; k < n; k++) {
        row[k] = qwSub(row[k]!, qwMul(f, a[c]![k]!))
      }
    }
  }

  return det
}

export const qwMatSub = (A: QWMatrix, B: QWMatrix): QWMatrix =>
  A.map((r, i) => r.map((x, j) => qwSub(x, (B[i] as QW[])[j]!)))
export const qwIsZeroMatrix = (A: QWMatrix): boolean =>
  A.every(r => r.every(qwIsZero))
export const qwScalar = (A: QWMatrix, s: QW): QWMatrix =>
  A.map(r => r.map(x => qwMul(x, s)))

export const qwFromNumber = (x: number): QW => {
  // an exact dyadic double (a multiple of 1 / 2^10 at most, which every register entry is) as a fraction
  const d = 1024
  const a = Math.round(x * d)

  if (a / d !== x) {
    throw new Error(`not dyadic ${x}`)
  }

  return qw(BigInt(a), 0n, BigInt(d))
}

export const qwFromNumbers = (
  A: readonly (readonly number[])[],
): QWMatrix => A.map(r => r.map(qwFromNumber))

export const qwMatMulSq = (A: QWMatrix, B: QWMatrix): QWMatrix => {
  const n = A.length
  const m = (B[0] as QW[]).length
  const out: QWMatrix = Array.from({ length: n }, () =>
    Array.from({ length: m }, () => QW_ZERO),
  )

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < B.length; k++) {
      const x = (A[i] as QW[])[k]!

      if (qwIsZero(x)) {
        continue
      }

      for (let j = 0; j < m; j++) {
        const y = (B[k] as QW[])[j]!

        if (!qwIsZero(y)) {
          ;(out[i] as QW[])[j] = qwAdd(
            (out[i] as QW[])[j]!,
            qwMul(x, y),
          )
        }
      }
    }
  }

  return out
}

export const qwDaggerSq = (A: QWMatrix): QWMatrix =>
  (A[0] as QW[]).map((_, j) => A.map(r => qwConj(r[j]!)))
export const qwIdentityOf = (n: number): QWMatrix =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? QW_ONE : QW_ZERO)),
  )
export const qwMatEqual = (A: QWMatrix, B: QWMatrix): boolean =>
  A.length === B.length &&
  A.every((r, i) =>
    r.every((x, j) => qwIsZero(qwSub(x, (B[i] as QW[])[j]!))),
  )

// ---- the Fock space ----

const popcount = (x: number): number => {
  let c = 0

  for (let y = x; y; y &= y - 1) {
    c++
  }

  return c
}

/** The k-member states of n modes, as bitmasks in increasing order. */
export function fockStates(n: number, k: number): number[] {
  const out: number[] = []

  for (let s = 0; s < 1 << n; s++) {
    if (popcount(s) === k) {
      out.push(s)
    }
  }

  return out
}

const modesOf = (s: number, n: number): number[] =>
  Array.from({ length: n }, (_, i) => i).filter(i => (s >> i) & 1)

/** Gamma(P) on the k-member block: [to][from] = det P[modes(to), modes(from)]. */
export function fockGammaBlock(P: QWMatrix, k: number): QWMatrix {
  const n = P.length
  const states = fockStates(n, k)
  const modes = states.map(s => modesOf(s, n))

  return modes.map(rows =>
    modes.map(cols =>
      qwDet(rows.map(r => cols.map(c => (P[r] as QW[])[c]!))),
    ),
  )
}

/** Gamma(P) on the whole Fock space, [to][from], basis in bitmask order 0 .. 2^n - 1. */
export function fockGamma(P: QWMatrix): QWMatrix {
  const n = P.length
  const N = 1 << n
  const out: QWMatrix = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => QW_ZERO),
  )

  for (let k = 0; k <= n; k++) {
    const states = fockStates(n, k)
    const block = fockGammaBlock(P, k)

    states.forEach((to, i) =>
      states.forEach(
        (from, j) => ((out[to] as QW[])[from] = (block[i] as QW[])[j]!),
      ),
    )
  }

  return out
}

// ---- fermion operators on bitmask states (ascending order: c^dag_{s1} ... c^dag_{sk} |0>, s1 < ... < sk) ----

export type Op = { dag: boolean; mode: number }

/** Apply the operators right to left; the new state and its sign, or null for zero. */
export function applyOps(
  state: number,
  ops: readonly Op[],
): { state: number; sign: number } | null {
  let s = state
  let sign = 1

  for (let i = ops.length - 1; i >= 0; i--) {
    const { dag, mode } = ops[i]!
    const occupied = (s >> mode) & 1

    if (dag === Boolean(occupied)) {
      return null
    }

    if (popcount(s & ((1 << mode) - 1)) % 2 === 1) {
      sign = -sign
    }

    s ^= 1 << mode
  }

  return { state: s, sign }
}

/** A second-quantized operator sum_t coef_t (op string)_t on n modes, as a dense [to][from] matrix. */
export function fockOperator(
  n: number,
  terms: readonly { coef: QW; ops: readonly Op[] }[],
): QWMatrix {
  const N = 1 << n
  const out: QWMatrix = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => QW_ZERO),
  )

  for (let from = 0; from < N; from++) {
    for (const { coef, ops } of terms) {
      const r = applyOps(from, ops)

      if (!r) {
        continue
      }

      const row = out[r.state] as QW[]

      row[from] = qwAdd(row[from]!, r.sign > 0 ? coef : qwNeg(coef))
    }
  }

  return out
}

/** The particle-hole map Xi: c^dag_{S} |0> -> c_{S} |full> (same order), a signed permutation, [to][from]. */
export function particleHole(n: number): QWMatrix {
  const N = 1 << n
  const full = N - 1
  const out: QWMatrix = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => QW_ZERO),
  )

  for (let S = 0; S < N; S++) {
    const r = applyOps(
      full,
      modesOf(S, n).map(mode => ({ dag: false, mode })),
    ) as { state: number; sign: number }

    ;(out[r.state] as QW[])[S] = r.sign > 0 ? QW_ONE : qwNeg(QW_ONE)
  }

  return out
}

/** The number operator N on n modes (diagonal). */
export const numberOperator = (n: number): QWMatrix =>
  qwIdentityOf(1 << n).map((r, s) =>
    r.map((x, j) => (j === s ? qw(BigInt(popcount(s)), 0n) : QW_ZERO)),
  )

// ---- the register exchange (modes s * F + f: register index s, flavor f) ----

/**
 * O = sum over member pairs of the register swap (flavors kept): first quantized O |s f> |t g> = |t f> |s g>, second
 * quantized (1/2) sum_(s, t, f, g) c^dag_(t f) c^dag_(s g) c_(t g) c_(s f).
 */
export function registerExchange(R: number, F: number): QWMatrix {
  const half = qw(1n, 0n, 2n)
  const terms: { coef: QW; ops: Op[] }[] = []
  const m = (s: number, f: number): number => s * F + f

  for (let s = 0; s < R; s++) {
    for (let t = 0; t < R; t++) {
      for (let f = 0; f < F; f++) {
        for (let g = 0; g < F; g++) {
          terms.push({
            coef: half,
            ops: [
              { dag: true, mode: m(t, f) },
              { dag: true, mode: m(s, g) },
              { dag: false, mode: m(t, g) },
              { dag: false, mode: m(s, f) },
            ],
          })
        }
      }
    }
  }

  return fockOperator(R * F, terms)
}

/** H' = N (N - 1) / 2 - O: the count of member pairs, weighted 1 - swap. Diagonal in N; integer valued. */
export function exchangeCount(R: number, F: number): QWMatrix {
  const O = registerExchange(R, F)

  return O.map((r, i) =>
    r.map((x, j) => {
      const k = popcount(i)

      return i === j
        ? qwSub(qw(BigInt((k * (k - 1)) / 2), 0n), x)
        : qwNeg(x)
    }),
  )
}

/**
 * The spectral projectors of an operator whose eigenvalues lie in `values` (checked: prod (H - l) = 0 exactly), by
 * Lagrange, and v^H = sum v^l Pi_l. Returns null if the product is not zero.
 */
export function unitPower(
  H: QWMatrix,
  values: readonly number[],
  v: QW,
): {
  U: QWMatrix
  projectors: { value: number; P: QWMatrix }[]
} | null {
  const n = H.length
  const I = qwIdentityOf(n)
  const shift = (l: number): QWMatrix =>
    qwMatSub(H, qwScalar(I, qw(BigInt(l), 0n)))

  let prod = I

  for (const l of values) {
    prod = qwMatMulSq(prod, shift(l))
  }

  if (!qwIsZeroMatrix(prod)) {
    return null
  }

  const projectors = values.map(l => {
    let P = I

    for (const mu of values) {
      if (mu === l) {
        continue
      }

      P = qwScalar(qwMatMulSq(P, shift(mu)), qw(1n, 0n, BigInt(l - mu)))
    }

    return { value: l, P }
  })

  let U: QWMatrix = I.map(r => r.map(() => QW_ZERO))

  for (const { value, P } of projectors) {
    U = U.map((r, i) =>
      r.map((x, j) =>
        qwAdd(x, qwMul(qwPow(v, value), (P[i] as QW[])[j]!)),
      ),
    )
  }

  return { U, projectors }
}

// ---- the rest pair toy (6 modes: s = 0 the blade 1, s = 1 vol; f = 0, 1, 2) ----

/**
 * The two-member states |h1 f1, h2 f2>~ = c~^dag_(h1 f1) c~^dag_(h2 f2) |0>, c~^dag_(h f) = c^dag_(0 f) + h c^dag_(1 f)
 * (h = +-1; unnormalized, norm^2 4 for two different chirality modes), as vectors on the 2-member block of 6 modes.
 */
export function chiralPair(
  h1: number,
  f1: number,
  h2: number,
  f2: number,
): Map<number, bigint> {
  const out = new Map<number, bigint>()
  const one = (h: number, f: number): { mode: number; c: bigint }[] => [
    { mode: f, c: 1n },
    { mode: 3 + f, c: BigInt(h) },
  ]

  for (const a of one(h1, f1)) {
    for (const b of one(h2, f2)) {
      const r = applyOps(0, [
        { dag: true, mode: a.mode },
        { dag: true, mode: b.mode },
      ])

      if (!r) {
        continue
      }

      out.set(
        r.state,
        (out.get(r.state) ?? 0n) + BigInt(r.sign) * a.c * b.c,
      )
    }
  }

  for (const [k, v] of out) {
    if (v === 0n) {
      out.delete(k)
    }
  }

  return out
}

/** Propagate a Fock vector (Map state -> QW) by a dense [to][from] operator restricted to the states given. */
export function applyBlock(
  U: QWMatrix,
  states: readonly number[],
  x: Map<number, QW>,
): Map<number, QW> {
  const out = new Map<number, QW>()

  for (const to of states) {
    let s = QW_ZERO

    for (const [from, a] of x) {
      const u = (U[to] as QW[])[from]!

      if (!qwIsZero(u)) {
        s = qwAdd(s, qwMul(u, a))
      }
    }

    if (!qwIsZero(s)) {
      out.set(to, s)
    }
  }

  return out
}

/** <y|x> for Fock vectors with integer (real) bra coefficients. */
export const overlap = (
  y: Map<number, bigint>,
  x: Map<number, QW>,
): QW => {
  let s = QW_ZERO

  for (const [k, c] of y) {
    const a = x.get(k)

    if (a) {
      s = qwAdd(s, qwMul(qw(c, 0n), a))
    }
  }

  return s
}

export const qwAbs2 = (x: QW): QW => qwMul(x, qwConj(x))
