// A SELF WITH A KEEL AND A FLAME (item vibe-roadmap-grounding-0027, future-models.md Living Lattice ideas 1 and 3), all
// opt-in, none of it the rule. The flame is B1's lone 3-love cluster on the line engine (code/measure/cone-line.ts).
// The keel is its bound level (kept for ever under B1's rule, E-SLF-0188) plus a HISTORY REGISTER, one value of Z3
// held beside the line. Each beat, before the line beat:
//
//   steer  the register reads the flame: the phase w^(h o(S)) (w = e^(2 pi i / 3), h the register, o the shape's
//          orientation below), so the register's value picks which shape phase acts on the flame
//   write  the flame writes into the register by a controlled shift mod 3: h -> h + o(S)
//
// Both read only the shape, so the pair is a permutation of (register, configuration) times a cube root of unity:
// exactly unitary, exactly reversible, every amplitude in the clock-14 ring Z[zeta_42] (w = zeta_42^14).
//
// THE ORIENTATION o(S) of a shape (sorted positions with repeats): A full docks with a love to their right, B with a
// love to their left, o = A + 2 B mod 3. For B1's three loves: 1 when the full dock is left of the single, 2 when it is
// right, 0 when there is no full dock. It is the flame's inside: which end of the cluster holds the pair.
//
// THE SECTORS. Every piece here is a function of one operator on the register (X^o for the write alone, X^o Z^o for
// steer then write, X|h> = |h+1>, Z|h> = w^h |h>), so they commute and share eigenvectors, each of weight 1/3 in the
// start |h = 0>. The flame's reduced state is therefore exactly the mean of three flames, each run alone with a fixed
// shape phase p(o) (a TWIST): write alone w^(k o) for k = 0, 1, 2 (k = 0 is the bare rule); steer then write
// (1, w^m, w^(2m - 1)) on o = 0, 1, 2 for m = 0, 1, 2 (X^2 Z^2 = w^-1 (XZ)^2). The experiment checks this exactly.

import {
  coneInner,
  type ConeStore,
} from '@/code/measure/cone-line'
import { hermitianEigen } from '@/code/measure/quantum-ladder'

// w^j, j = 0, 1, 2
export const OMEGA: readonly (readonly [number, number])[] = [
  [1, 0],
  [-0.5, Math.sqrt(3) / 2],
  [-0.5, -Math.sqrt(3) / 2],
]

export function orientationOf(pos: Int32Array): number {
  const n = pos.length

  let A = 0
  let B = 0

  for (let a = 0; a + 1 < n; a++) {
    if (pos[a + 1] !== pos[a]) {
      continue
    }

    if (a + 2 < n) {
      A++
    }

    if (a > 0) {
      B++
    }

    a++
  }

  return (A + 2 * B) % 3
}

// a twist: the shape phase w^(table[o(S)]); null (no work) where the power is 0
export const twistOf =
  (table: readonly number[]) =>
  (pos: Int32Array): readonly [number, number] | null => {
    const j = table[orientationOf(pos)]! % 3

    return j === 0 ? null : OMEGA[j]!
  }

// the register rules: K (frozen: no write, no steer), R (write only), C (steer then write)
export type RegisterRule = 'K' | 'R' | 'C'

export const writeOf = (rule: RegisterRule) => (pos: Int32Array): number =>
  rule === 'K' ? 0 : orientationOf(pos)

export const steerOf = (rule: RegisterRule) => (h: number, pos: Int32Array): number =>
  rule === 'C' ? h * orientationOf(pos) : 0

// the twists whose mean is each register rule's flame (see THE SECTORS)
export const SECTORS: Record<RegisterRule, readonly (readonly number[])[]> = {
  K: [[0, 0, 0]],
  R: [
    [0, 0, 0],
    [0, 1, 2],
    [0, 2, 1],
  ],
  C: [
    [0, 0, 2],
    [0, 1, 1],
    [0, 2, 0],
  ],
}

export type Gram = { n: number; re: Float64Array; im: Float64Array }

// the Gram matrix <v_i | v_j> of a list of stores
export function gramOf(vs: readonly ConeStore[]): Gram {
  const n = vs.length
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const [r, m] = coneInner(vs[i]!, vs[j]!)

      re[i * n + j] = r
      im[i * n + j] = m
      re[j * n + i] = r
      im[j * n + i] = -m
    }
  }

  return { n, re, im }
}

// the register's reduced state rho[h][h'] = <psi_h' | psi_h> has the Gram's eigenvalues: its entropy in bits
export function entropyBits(values: readonly number[]): number {
  let total = 0

  for (const v of values) {
    total += Math.max(v, 0)
  }

  let S = 0

  for (const v of values) {
    const p = Math.max(v, 0) / total

    if (p > 0) {
      S -= p * Math.log2(p)
    }
  }

  return S
}

export function registerEntropy(stores: readonly ConeStore[]): { bits: number; weights: number[] } {
  const g = gramOf(stores)
  const { values } = hermitianEigen(g.n, g.re, g.im)
  const weights = stores.map((_, h) => g.re[h * g.n + h]!)

  return { bits: entropyBits(values), weights }
}

// the classical spread of the register's values, in bits
export const valueEntropy = (weights: readonly number[]): number => entropyBits(weights)

// THE FLAME'S DIVERGENCE: the trace distance between the flame's reduced states sum_h |p_h><p_h| and sum_h |q_h><q_h|.
// With V = [p, q] and D = diag(1.., -1..), rho - sigma = V D V^dag, whose nonzero eigenvalues are those of
// G^(1/2) D G^(1/2), G = V^dag V the Gram
export function flameDistance(ps: readonly ConeStore[], qs: readonly ConeStore[]): number {
  const vs = [...ps, ...qs]
  const g = gramOf(vs)
  const n = g.n
  const eig = hermitianEigen(n, g.re, g.im)
  // G^(1/2) = sum sqrt(lambda) u u^dag
  const sr = new Float64Array(n * n)
  const si = new Float64Array(n * n)

  eig.values.forEach((lambda, a) => {
    const s = Math.sqrt(Math.max(lambda, 0))
    const u = eig.vectors[a]!

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // u_i conj(u_j)
        sr[i * n + j] = sr[i * n + j]! + s * (u.re[i]! * u.re[j]! + u.im[i]! * u.im[j]!)
        si[i * n + j] = si[i * n + j]! + s * (u.im[i]! * u.re[j]! - u.re[i]! * u.im[j]!)
      }
    }
  })

  // M = S D S
  const mr = new Float64Array(n * n)
  const mi = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let r = 0
      let m = 0

      for (let k = 0; k < n; k++) {
        const d = k < ps.length ? 1 : -1
        const ar = sr[i * n + k]!
        const ai = si[i * n + k]!
        const br = sr[k * n + j]!
        const bi = si[k * n + j]!

        r += d * (ar * br - ai * bi)
        m += d * (ar * bi + ai * br)
      }

      mr[i * n + j] = r
      mi[i * n + j] = m
    }
  }

  const { values } = hermitianEigen(n, mr, mi)

  return values.reduce((t, v) => t + Math.abs(v), 0) / 2
}

// the return weight <psi_0 | rho_flame | psi_0> = sum_h |<psi_0 | psi_h>|^2
export function returnWeight(start: ConeStore, stores: readonly ConeStore[]): number {
  let P = 0

  for (const s of stores) {
    const [r, m] = coneInner(start, s)

    P += r * r + m * m
  }

  return P
}
