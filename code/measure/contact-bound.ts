// Two tokens on a husk line meeting through the fear beat (E-SPN-0069): the relative-motion walk, its bound
// states, their closed-form condition, and the full two-token rule with roles, run exactly and in floats.
//
// THE RULE (a STAND-IN token: the fear walk of code/rule/fear-walk with a role riding along, as in
// code/rule/spinor-token's spectator mode, on one husk line, a ring of L docks). A token holds a slot (0 copied
// one dock forward, 1 copied one dock back) and a role (a qutrit). One beat:
//   1. meeting: two tokens on the same dock in OPPOSITE slots (both slots of the dock's line held, the knit's
//      meeting) meet through the fear beat on their roles: like vibes the swap phase U = P_sym + omega P_anti,
//      a love and a fear the singlet phase V = 1 + (omega - 1) |Phi><Phi|, Phi = sum_j |j j> / sqrt 3
//      (code/measure/eisenstein-words); a meeting of two tokens is the knit's (E-SPN-0062), in their own frame
//   2. coin: the fear coin C = [[a, b], [b, a]], 2a = 1 + omega, 2b = 1 - omega, on each token's two slots
//   3. stream: slot 0 copied one dock forward, slot 1 one dock back
// Every number the rule uses is in Z[omega][1/6]: omega, halves (C, U) and thirds (V). The exact runner below holds
// amplitudes as Eisenstein integers over 2^a 3^b in bigints, with no angle, no square root and no rounding.
//
// WHY IT BINDS, by construction. U commutes with SWAP, so it is 1 on role-symmetric pairs and omega on
// role-antisymmetric pairs; V is omega on Phi and 1 on its complement. So in each role channel the meeting is a
// pure CONTACT PHASE p (omega or 1) on the two relative states with the tokens on one dock in opposite slots, and
// the relative motion at total momentum K is the walk W(K) = S(K) (C (x) C) M(p). Quasi-energy lives on a
// circle, so the free two-token continuum leaves gaps, and a contact phase p != 1 puts a state in a gap exactly
// when det(1 - (p - 1) G(lambda)) = 0 on the 2 x 2 contact block, G(lambda) = Pi W0 (lambda - W0)^(-1) Pi, W0 the
// free walk (Ahlbrecht, Alberti, Meschede, Scholz, Werner, Werner, New J. Phys. 14, 073050 (2012): molecular
// binding in interacting quantum walks). This module evaluates G as the exact finite-ring momentum sum.
//
// Measurement code (floats, eigenvalues) except for the exact runner, which is the rule in integers.

import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'

export type Complex = [number, number]

const SQRT3_2 = Math.sqrt(3) / 2

// measurement values of the rule's numbers
export const OMEGA: Complex = [-0.5, SQRT3_2]
export const ONE: Complex = [1, 0]
// a = (1 + omega)/2, b = (1 - omega)/2
export const COIN_A: Complex = [0.25, SQRT3_2 / 2]
export const COIN_B: Complex = [0.75, -SQRT3_2 / 2]

const mul = (x: Complex, y: Complex): Complex => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const cexp = (t: number): Complex => [Math.cos(t), Math.sin(t)]

// the two stream steps: slot 0 forward, slot 1 back
export const STEP = [1, -1] as const

// index of (r, c1, c2) in the relative basis
const rel = (r: number, c1: number, c2: number): number => r * 4 + c1 * 2 + c2

// the relative walk at total momentum K (psi(x1, x2) = e^(i K x1) phi(x2 - x1)), contact phase p on the states
// r = 0 with c1 != c2, as a dense row-major complex matrix of size 4 L
export function relativeWalk(input: { ring: number; momentum: number; phase: Complex }): { re: Float64Array; im: Float64Array; n: number } {
  const { ring: L, momentum: K, phase } = input
  const n = 4 * L
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const coin = [
    [COIN_A, COIN_B],
    [COIN_B, COIN_A],
  ]

  for (let r = 0; r < L; r++) {
    for (let d1 = 0; d1 < 2; d1++) {
      for (let d2 = 0; d2 < 2; d2++) {
        // column (r, d1, d2): meeting, then coin to (c1, c2), then stream
        const m: Complex = r === 0 && d1 !== d2 ? phase : ONE

        for (let c1 = 0; c1 < 2; c1++) {
          for (let c2 = 0; c2 < 2; c2++) {
            const amp = mul(mul(coin[c1]![d1]!, coin[c2]![d2]!), m)
            const r2 = (((r + STEP[c2] - STEP[c1]) % L) + L) % L
            const phase1 = cexp(-K * STEP[c1])
            const v = mul(amp, phase1)
            const at = rel(r2, c1, c2) * n + rel(r, d1, d2)

            re[at] = (re[at] as number) + v[0]
            im[at] = (im[at] as number) + v[1]
          }
        }
      }
    }
  }

  return { re, im, n }
}

// quasi-energy of an eigenvalue lambda = e^(-i E), E in (-pi, pi]
export const quasiEnergy = (re: number, im: number): number => -Math.atan2(im, re)

// the wrapped distance between two quasi-energies
export const arcDistance = (a: number, b: number): number => {
  const d = Math.abs(a - b) % (2 * Math.PI)

  return Math.min(d, 2 * Math.PI - d)
}

export type RelativeState = { energy: number; nearWeight: number; symmetric: number; profile: Float64Array; vector: { re: Float64Array; im: Float64Array } }

// the eigenstates of W(K) whose quasi-energy passes `keep` (all by default): quasi-energy, weight within
// |r| <= near, exchange parity (<P> for P phi(r, c1, c2) = e^(i K r) phi(-r, c2, c1), +1 symmetric, -1
// antisymmetric), the weight at each ring distance, and the vector
export function relativeSpectrum(input: { ring: number; momentum: number; phase: Complex; near: number; keep?: (energy: number) => boolean }): RelativeState[] {
  const w = relativeWalk(input)
  const values = complexEigenvalues(w)
  const L = input.ring
  const out: RelativeState[] = []

  values.re.forEach((vr, i) => {
    const vi = values.im[i] ?? 0

    if (input.keep && !input.keep(quasiEnergy(vr, vi))) return

    const v = complexEigenvector({ ...w, value: [vr, vi] })
    const profile = new Float64Array(Math.floor(L / 2) + 1)
    let near = 0
    let pr = 0
    let pi = 0

    for (let r = 0; r < L; r++) {
      const dist = Math.min(r, L - r)

      for (let c1 = 0; c1 < 2; c1++) {
        for (let c2 = 0; c2 < 2; c2++) {
          const k = rel(r, c1, c2)
          const a: Complex = [v.re[k] ?? 0, v.im[k] ?? 0]

          if (dist <= input.near) near += a[0] * a[0] + a[1] * a[1]
          profile[dist] = (profile[dist] as number) + a[0] * a[0] + a[1] * a[1]

          // <phi | P phi>
          const kp = rel((L - r) % L, c2, c1)
          const b = mul(cexp(input.momentum * r), [v.re[kp] ?? 0, v.im[kp] ?? 0])

          pr += a[0] * b[0] + a[1] * b[1]
          pi += a[0] * b[1] - a[1] * b[0]
        }
      }
    }

    out.push({ energy: quasiEnergy(vr, vi), nearWeight: near, symmetric: pr, profile, vector: v })
  })

  return out
}

// the smallest arc distance from a quasi-energy to the L -> infinity continuum at K
export function continuumDistance(input: { momentum: number; energy: number; samples?: number }): number {
  const cont = continuumEnergies({ momentum: input.momentum, samples: input.samples ?? 4000 })
  let best = Infinity

  for (const c of cont) best = Math.min(best, arcDistance(c, input.energy))

  return best
}

// the free continuum at K on a ring of L: every quasi-energy of W0(K), and the arcs it covers at L -> infinity
// (from the single-token bands cos(e) = cos(k) / 2 around the global phase, sampled finely)
export function continuumEnergies(input: { momentum: number; samples: number }): number[] {
  const out: number[] = []

  for (let s = 0; s < input.samples; s++) {
    const q = (2 * Math.PI * s) / input.samples
    const k1 = input.momentum / 2 - q
    const k2 = input.momentum / 2 + q

    for (const e1 of singleEnergies(k1)) for (const e2 of singleEnergies(k2)) out.push(wrap(e1 + e2))
  }

  return out
}

const wrap = (e: number): number => {
  let x = e % (2 * Math.PI)

  if (x > Math.PI) x -= 2 * Math.PI
  if (x <= -Math.PI) x += 2 * Math.PI

  return x
}

// the two quasi-energies of one token at momentum k: eigenvalues of S(k) C, lambda = e^(i pi/3) e^(+- i acos(cos k / 2))
export function singleEnergies(k: number): [number, number] {
  const t = Math.acos(Math.cos(k) / 2)

  return [wrap(-(Math.PI / 3 + t)), wrap(-(Math.PI / 3 - t))]
}

// the closed-form bound-state condition: f(lambda) = det(1 - (p - 1) G(lambda)) on the contact block
// {(r 0, slots 0 1), (r 0, slots 1 0)}, G = Pi W0 (lambda - W0)^(-1) Pi, W0 the free relative walk, as the exact
// momentum sum over the ring's L relative momenta (each a 4 x 4 block)
export function contactDeterminant(input: { ring: number; momentum: number; phase: Complex; energy: number }): Complex {
  const { ring: L, momentum: K, phase, energy } = input
  const lambda = cexp(-energy)
  // G restricted to contact: G_ab = (1/L) sum_q [W0(q) (lambda - W0(q))^(-1)]_(ab), a, b in {(0,1), (1,0)}
  const g: Complex[] = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]
  const idx = [1, 2] as const

  for (let s = 0; s < L; s++) {
    const q = (2 * Math.PI * s) / L
    // W0(q)[c, d] = e^(-i K s(c1)) e^(-i q (s(c2) - s(c1))) C_c1d1 C_c2d2, relative plane wave e^(i q r)
    const w: Complex[][] = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => [0, 0] as Complex))
    const coin = [
      [COIN_A, COIN_B],
      [COIN_B, COIN_A],
    ]

    for (let c1 = 0; c1 < 2; c1++) {
      for (let c2 = 0; c2 < 2; c2++) {
        const ph = cexp(-K * STEP[c1] - q * (STEP[c2] - STEP[c1]))

        for (let d1 = 0; d1 < 2; d1++) {
          for (let d2 = 0; d2 < 2; d2++) {
            w[c1 * 2 + c2]![d1 * 2 + d2] = mul(ph, mul(coin[c1]![d1]!, coin[c2]![d2]!))
          }
        }
      }
    }

    // (lambda - W0)^(-1) by Gauss-Jordan on 4 x 4 complex
    const a: Complex[][] = w.map((row, i) => row.map((x, j) => [(i === j ? lambda[0] : 0) - x[0], (i === j ? lambda[1] : 0) - x[1]] as Complex))
    const inv = invert4(a)
    const prod: Complex[][] = w.map(row => inv[0]!.map((_, j) => row.reduce<Complex>((s2, x, k) => add(s2, mul(x, inv[k]![j]!)), [0, 0])))

    idx.forEach((i, ai) => {
      idx.forEach((j, bj) => {
        const v = prod[i]![j]!

        g[ai * 2 + bj] = add(g[ai * 2 + bj]!, [v[0] / L, v[1] / L])
      })
    })
  }

  const pm: Complex = [phase[0] - 1, phase[1]]
  const m = g.map(x => mul(pm, x))
  const m00: Complex = [1 - m[0]![0], -m[0]![1]]
  const m11: Complex = [1 - m[3]![0], -m[3]![1]]
  const m01: Complex = [-m[1]![0], -m[1]![1]]
  const m10: Complex = [-m[2]![0], -m[2]![1]]
  const d1 = mul(m00, m11)
  const d2 = mul(m01, m10)

  return [d1[0] - d2[0], d1[1] - d2[1]]
}

const add = (x: Complex, y: Complex): Complex => [x[0] + y[0], x[1] + y[1]]

function invert4(a: Complex[][]): Complex[][] {
  const n = 4
  const m = a.map(row => row.map(x => [...x] as Complex))
  const inv = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? [1, 0] : [0, 0]) as Complex))

  for (let c = 0; c < n; c++) {
    let pivot = c

    for (let r = c + 1; r < n; r++) if (Math.hypot(...m[r]![c]!) > Math.hypot(...m[pivot]![c]!)) pivot = r

    ;[m[c], m[pivot]] = [m[pivot]!, m[c]!]
    ;[inv[c], inv[pivot]] = [inv[pivot]!, inv[c]!]

    const p = m[c]![c]!
    const den = p[0] * p[0] + p[1] * p[1]
    const pinv: Complex = [p[0] / den, -p[1] / den]

    for (let j = 0; j < n; j++) {
      m[c]![j] = mul(m[c]![j]!, pinv)
      inv[c]![j] = mul(inv[c]![j]!, pinv)
    }

    for (let r = 0; r < n; r++) {
      if (r === c) continue

      const f = m[r]![c]!

      for (let j = 0; j < n; j++) {
        const t1 = mul(f, m[c]![j]!)
        const t2 = mul(f, inv[c]![j]!)

        m[r]![j] = [m[r]![j]![0] - t1[0], m[r]![j]![1] - t1[1]]
        inv[r]![j] = [inv[r]![j]![0] - t2[0], inv[r]![j]![1] - t2[1]]
      }
    }
  }

  return inv
}
