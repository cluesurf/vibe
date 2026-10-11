// Exact many-walker reads on a box of N modes over Q(w): Lambda^k of a 3 x 3 colour (minors on increasing
// k-subsets), the sparse exact second quantization Gamma(P) of a one-walker matrix under fermion, boson and
// hard-core statistics (amplitudes det / perm P[T, S], weights w(S) carried, never normalized), its product,
// equality, unitarity and capacity leak, and Ryser's permanent in complex floats for a read on 24 modes.
// Lifted from E-SPN-0205 (test/experiment/spin/walker-species.ts).

import {
  qw,
  qwAdd,
  qwConj,
  qwIsZero,
  qwMul,
  qwSub,
  qwValue,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import { qwDet } from '@/code/measure/register-many-body'
import { FERMION, multiplicityWeight, type Quantization, type State } from '@/code/measure/register-statistics'

const real = (x: QW): number => qwValue(x)[0]
const qwNeg = (x: QW): QW => qw(-x.a, -x.b, x.d)

export const subsetsOf = (n: number, k: number): number[][] => FERMION.states(n, k).map(s => [...s])

function det(M: QWMatrix): QW {
  return M.length === 0 ? QW_ONE : qwDet(M)
}

/** Lambda^k(R): the k x k minors on increasing k-subsets of {0, 1, 2}. */
export function wedge(R: QWMatrix, k: number): QWMatrix {
  const sets = subsetsOf(3, k)

  return sets.map(I => sets.map(J => det(I.map(i => J.map(j => R[i]![j]!)))))
}

// ---------------- sparse exact second quantization ----------------

export type Col = [number, QW][]
export type Sparse = Map<number, QW>[]

export const columnsOf = (P: QWMatrix): Col[] =>
  (P[0] ?? []).map((_, j) =>
    P.flatMap((r, i) => (qwIsZero(r[j]!) ? [] : [[i, r[j]!] as [number, QW]])),
  )

export type Space = {
  q: Quantization
  states: State[]
  index: Map<string, number>
  weight: bigint[]
}

export function spaceOf(q: Quantization, N: number, n: number): Space {
  const states = q.states(N, n)

  return {
    q,
    states,
    index: new Map(states.map((s, i) => [s.join(','), i])),
    weight: states.map(q.weight),
  }
}

function parity(t: readonly number[]): number {
  let inv = 0

  for (let i = 0; i < t.length; i++) {
    for (let j = i + 1; j < t.length; j++) {
      if (t[i]! > t[j]!) {
        inv++
      }
    }
  }

  return inv % 2 === 0 ? 1 : -1
}

/**
 * The scaled column Gamma(P)|S>: amp(T, S) = det P[T, S] (fermion), perm P[T, S] (boson, every multiset) or perm on 0/1
 * states (hard-core), by expanding prod_i (sum_t P[t][s_i] a_t^dag) over ordered tuples, keyed by T's sorted modes.
 */
export function expand(q: Quantization, P: readonly Col[], S: State): Map<string, QW> {
  const fermi = q.name === 'fermion'
  const distinct = q.name !== 'boson'
  const out = new Map<string, QW>()
  const t: number[] = []
  const walk = (i: number, v: QW): void => {
    if (i === S.length) {
      const key = [...t].sort((a, b) => a - b).join(',')
      const x = fermi && parity(t) < 0 ? qwNeg(v) : v

      out.set(key, qwAdd(out.get(key) ?? QW_ZERO, x))

      return
    }

    for (const [r, x] of P[S[i]!]!) {
      if (distinct && t.includes(r)) {
        continue
      }

      t.push(r)
      walk(i + 1, qwMul(v, x))
      t.pop()
    }
  }

  walk(0, QW_ONE)

  for (const [key, x] of out) {
    if (qwIsZero(x)) {
      out.delete(key)
    } else if (!distinct) {
      const T = key === '' ? [] : key.split(',').map(Number)

      out.set(key, qwMul(x, qw(multiplicityWeight(T), 0n)))
    }
  }

  return out
}

export function gamma(sp: Space, P: QWMatrix): Sparse {
  const cols = columnsOf(P)

  return sp.states.map(S => {
    const out = new Map<number, QW>()

    for (const [key, x] of expand(sp.q, cols, S)) {
      out.set(sp.index.get(key)!, x)
    }

    return out
  })
}

// (A B)_TS = sum_R A_TR B_RS / w(R)
export function product(sp: Space, A: Sparse, B: Sparse): Sparse {
  return B.map(col => {
    const out = new Map<number, QW>()

    for (const [R, b] of col) {
      const w = sp.weight[R]!

      for (const [T, a] of A[R]!) {
        const ab = qwMul(a, b)

        out.set(T, qwAdd(out.get(T) ?? QW_ZERO, w === 1n ? ab : qw(ab.a, ab.b, ab.d * w)))
      }
    }

    return out
  })
}

export function sparseEqual(A: Sparse, B: Sparse): boolean {
  return A.every((col, S) => {
    const other = B[S]!

    for (const [T, x] of col) {
      if (!qwIsZero(qwSub(x, other.get(T) ?? QW_ZERO))) {
        return false
      }
    }

    for (const [T, y] of other) {
      if (!col.has(T) && !qwIsZero(y)) {
        return false
      }
    }

    return true
  })
}

// sum_T conj(G_TS) G_TS' / w(T) = delta w(S)
export function sparseUnitary(sp: Space, G: Sparse): boolean {
  const n = sp.states.length
  const rows: [number, QW][][] = Array.from({ length: n }, () => [])

  G.forEach((col, S) => col.forEach((x, T) => rows[T]!.push([S, x])))

  const acc = new Map<number, QW>()

  rows.forEach((row, T) => {
    const w = sp.weight[T]!

    for (const [S, x] of row) {
      for (const [S2, y] of row) {
        if (S2 < S) {
          continue
        }

        const p = qwMul(qwConj(x), y)
        const key = S * n + S2

        acc.set(key, qwAdd(acc.get(key) ?? QW_ZERO, w === 1n ? p : qw(p.a, p.b, p.d * w)))
      }
    }
  })

  for (let S = 0; S < n; S++) {
    if (!qwIsZero(qwSub(acc.get(S * n + S) ?? QW_ZERO, qw(sp.weight[S]!, 0n)))) {
      return false
    }
  }

  for (const [key, x] of acc) {
    if (Math.floor(key / n) !== key % n && !qwIsZero(x)) {
      return false
    }
  }

  return true
}

// the largest weight a 0/1 start sends to doubly held states (start weight 1)
export function sparseLeak(sp: Space, G: Sparse): number {
  let worst = 0

  G.forEach((col, S) => {
    if (sp.weight[S] !== 1n) {
      return
    }

    let w = QW_ZERO

    for (const [T, x] of col) {
      if (sp.weight[T]! > 1n) {
        const p = qwMul(x, qwConj(x))

        w = qwAdd(w, qw(p.a, p.b, p.d * sp.weight[T]!))
      }
    }

    worst = Math.max(worst, real(w))
  })

  return worst
}

// ---------------- the sea ----------------

/** Ryser's permanent in complex floats (2^n terms by Gray code), for a read on n = 24. */
export function permanentFloat(A: QWMatrix): [number, number] {
  const n = A.length
  const re = A.map(r => r.map(x => qwValue(x)[0]))
  const im = A.map(r => r.map(x => qwValue(x)[1]))
  const sr = new Float64Array(n)
  const si = new Float64Array(n)

  let tr = 0
  let ti = 0
  let gray = 0

  for (let step = 1; step < 2 ** n; step++) {
    const j = 31 - Math.clz32(step & -step)
    const adding = ((gray >> j) & 1) === 0

    gray ^= 1 << j

    const s = adding ? 1 : -1

    for (let i = 0; i < n; i++) {
      sr[i]! += s * re[i]![j]!
      si[i]! += s * im[i]![j]!
    }

    let pr = 1
    let pi = 0

    for (let i = 0; i < n; i++) {
      const a = pr * sr[i]! - pi * si[i]!

      pi = pr * si[i]! + pi * sr[i]!
      pr = a
    }

    // each Gray step flips one bit, so the subset's size has the parity of the step
    const sign = step % 2 === 0 ? 1 : -1

    tr += sign * pr
    ti += sign * pi
  }

  const sn = n % 2 === 0 ? 1 : -1

  return [sn * tr, sn * ti]
}
