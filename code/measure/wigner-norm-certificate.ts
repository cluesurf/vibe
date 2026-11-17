// Exact upper certificates on the Wigner norm s(rho) = sum over phase points of |W(x)| (E-QTM-0192).
//
// For n roles, W(x) = Tr(rho A(x)) / 3^n, and for a sign pattern sigma on the 9^n points,
// sum_x sigma_x W(x) = Tr(rho M_sigma) / 3^n with M_sigma = sum_x sigma_x A(x). Hence s(rho) is the largest
// Tr(rho M_sigma) / 3^n over the patterns, and s <= c for every rho whose sign pattern lies in a set S once
// c 3^n I - M_sigma is positive semidefinite for every sigma in S. The phase-point operators have entries in
// Z[omega] (omega = exp(2 pi i / 3)), so each M_sigma does, and positive semidefiniteness is decided here
// exactly: fraction-free (Bareiss) symmetric elimination over Z[omega], with the rule that a zero pivot of a
// positive semidefinite Hermitian matrix has a zero column. No floats enter a verdict.
//
// Measurement code. The rule never calls it.

import {
  phasePointOperators,
  type Operator,
} from '@/code/measure/grid-weights'

// a + b omega, a and b integers
export type Zw = { a: bigint; b: bigint }

export const ZW0: Zw = { a: 0n, b: 0n }

export const zwAdd = (x: Zw, y: Zw): Zw => ({ a: x.a + y.a, b: x.b + y.b })
export const zwSub = (x: Zw, y: Zw): Zw => ({ a: x.a - y.a, b: x.b - y.b })
export const zwScale = (x: Zw, k: bigint): Zw => ({ a: x.a * k, b: x.b * k })

// (a + b w)(c + d w) = ac + (ad + bc) w + bd w^2, w^2 = -1 - w
export const zwMul = (x: Zw, y: Zw): Zw => ({
  a: x.a * y.a - x.b * y.b,
  b: x.a * y.b + x.b * y.a - x.b * y.b,
})

// conj(a + b w) = a + b w^2 = (a - b) - b w
export const zwConj = (x: Zw): Zw => ({ a: x.a - x.b, b: -x.b })

export const zwIsZero = (x: Zw): boolean => x.a === 0n && x.b === 0n

// division by a non-zero integer, which must be exact
export function zwDivExact(x: Zw, k: bigint): Zw {
  if (x.a % k !== 0n || x.b % k !== 0n) {
    throw new Error('inexact division in Z[omega]')
  }

  return { a: x.a / k, b: x.b / k }
}

// the float value of a + b w
export const zwRe = (x: Zw): number => Number(x.a) - Number(x.b) / 2
export const zwIm = (x: Zw): number => (Number(x.b) * Math.sqrt(3)) / 2

// the nearest element of Z[omega] to a complex float, and the distance
export function zwRound(re: number, im: number): { value: Zw; error: number } {
  const b = Math.round((2 * im) / Math.sqrt(3))
  const a = Math.round(re + b / 2)
  const value = { a: BigInt(a), b: BigInt(b) }

  return {
    value,
    error: Math.hypot(zwRe(value) - re, zwIm(value) - im),
  }
}

export type ZwMatrix = { n: number; entries: Zw[] }

// an operator with entries in Z[omega], rounded from floats; throws if any entry is further than 1e-9
export function exactOperator(op: Operator): ZwMatrix {
  const entries: Zw[] = []

  for (let k = 0; k < op.n * op.n; k++) {
    const r = zwRound(op.re[k] ?? 0, op.im[k] ?? 0)

    if (r.error > 1e-9) {
      throw new Error('operator entry is not in Z[omega]')
    }

    entries.push(r.value)
  }

  return { n: op.n, entries }
}

// the exact phase-point operators of n roles, point index x1 9^(n-1) + ... + xn
export function exactPhasePoints(roles: number): ZwMatrix[] {
  return phasePointOperators(roles).map(exactOperator)
}

// is a Hermitian matrix over Z[omega] positive semidefinite? Bareiss elimination in place on a copy: at step
// k with pivot p (an integer, since the leading minors of a Hermitian matrix are real and lie in Z), entries
// become (p a_ij - a_ik a_kj) / p_prev, an exact division by Sylvester's identity. A negative pivot refutes; a
// zero pivot refutes unless its column below is zero, and is then skipped. Returns the verdict and the
// number of positive pivots (the rank when it holds).
export function isPsdExact(m: ZwMatrix): { psd: boolean; rank: number } {
  const n = m.n
  const a = m.entries.map(x => ({ a: x.a, b: x.b }))

  let prev = 1n
  let rank = 0

  for (let k = 0; k < n; k++) {
    const pivot = a[k * n + k]!

    if (pivot.b !== 0n) {
      throw new Error('diagonal entry not real: matrix not Hermitian')
    }

    const p = pivot.a

    if (p < 0n) {
      return { psd: false, rank }
    }

    if (p === 0n) {
      for (let i = k + 1; i < n; i++) {
        if (!zwIsZero(a[i * n + k]!)) {
          return { psd: false, rank }
        }
      }

      continue
    }

    for (let i = k + 1; i < n; i++) {
      const aik = a[i * n + k]!

      for (let j = k + 1; j < n; j++) {
        const next = zwSub(
          zwScale(a[i * n + j]!, p),
          zwMul(aik, a[k * n + j]!),
        )

        a[i * n + j] = zwDivExact(next, prev)
      }
    }

    prev = p
    rank++
  }

  return { psd: true, rank }
}

// c I - sum_x sigma_x A(x), for sigma = +-1 on each point
export function boundMatrix(input: {
  points: readonly ZwMatrix[]
  signs: readonly number[]
  c: bigint
}): ZwMatrix {
  const { points, signs, c } = input
  const n = points[0]!.n
  const entries: Zw[] = Array.from({ length: n * n }, (_, k) =>
    k % (n + 1) === 0 ? { a: c, b: 0n } : ZW0,
  )

  points.forEach((p, x) => {
    const s = signs[x] ?? 0

    for (let k = 0; k < n * n; k++) {
      const e = p.entries[k]!

      if (s > 0) {
        entries[k] = zwSub(entries[k]!, e)
      } else if (s < 0) {
        entries[k] = zwAdd(entries[k]!, e)
      }
    }
  })

  return { n, entries }
}

// the point permutation a unitary induces by conjugation, U A(x) U^dagger = A(pi(x)), or null
export function pointPermutation(
  u: Operator,
  points: readonly Operator[],
): number[] | null {
  const n = u.n
  const conj = (a: Operator): Operator => {
    const ua = { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
    const out = { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let re = 0
        let im = 0

        for (let k = 0; k < n; k++) {
          const xr = u.re[i * n + k] ?? 0
          const xi = u.im[i * n + k] ?? 0
          const yr = a.re[k * n + j] ?? 0
          const yi = a.im[k * n + j] ?? 0

          re += xr * yr - xi * yi
          im += xr * yi + xi * yr
        }

        ua.re[i * n + j] = re
        ua.im[i * n + j] = im
      }
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let re = 0
        let im = 0

        for (let k = 0; k < n; k++) {
          // (U A) U^dagger: (UA)_ik conj(U_jk)
          const xr = ua.re[i * n + k] ?? 0
          const xi = ua.im[i * n + k] ?? 0
          const yr = u.re[j * n + k] ?? 0
          const yi = -(u.im[j * n + k] ?? 0)

          re += xr * yr - xi * yi
          im += xr * yi + xi * yr
        }

        out.re[i * n + j] = re
        out.im[i * n + j] = im
      }
    }

    return out
  }

  const pi: number[] = []

  for (const a of points) {
    const c = conj(a)
    const hit = points.findIndex(b => {
      for (let k = 0; k < n * n; k++) {
        if (
          Math.abs((b.re[k] ?? 0) - (c.re[k] ?? 0)) > 1e-9 ||
          Math.abs((b.im[k] ?? 0) - (c.im[k] ?? 0)) > 1e-9
        ) {
          return false
        }
      }

      return true
    })

    if (hit < 0) {
      return null
    }

    pi.push(hit)
  }

  return pi
}

// the orbits of the cyclic group a permutation generates, each sorted, ordered by least element
export function cyclicOrbits(pi: readonly number[]): number[][] {
  const seen = new Array<boolean>(pi.length).fill(false)
  const out: number[][] = []

  for (let x = 0; x < pi.length; x++) {
    if (seen[x]) {
      continue
    }

    const orbit: number[] = []

    let y = x

    while (!seen[y]) {
      seen[y] = true
      orbit.push(y)
      y = pi[y]!
    }

    out.push(orbit.sort((p, q) => p - q))
  }

  return out
}
