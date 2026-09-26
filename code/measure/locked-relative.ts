// The relative walk of two LOCKED like tokens (E-SPN-0072): the doublet is the slot, so two loves on one dock meet
// through U on their slot pair, U |01> = ((1 + omega)|01> + (1 - omega)|10>) / 2, and not through a phase on each
// slot state. On exchange-antisymmetric states (two identical fermions) U is omega, the contact phase of
// code/measure/contact-bound; on symmetric states it is 1. This module builds the walk with U at contact, so its
// antisymmetric spectrum can be compared with contact-bound's phase-omega walk by a second construction.
// Measurement code (floats, eigenvalues).

import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { COIN_A, COIN_B, ONE, OMEGA, quasiEnergy, type Complex } from '@/code/measure/contact-bound'

const mul = (x: Complex, y: Complex): Complex => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const cexp = (t: number): Complex => [Math.cos(t), Math.sin(t)]
const stepOf = (c: number): number => (c === 0 ? 1 : -1)
const rel = (r: number, c1: number, c2: number): number => r * 4 + c1 * 2 + c2

// the 2 x 2 contact block on (|01>, |10>): U, or the identity (no meeting)
const U_BLOCK: Complex[][] = [
  [
    [(1 + OMEGA[0]) / 2, OMEGA[1] / 2],
    [(1 - OMEGA[0]) / 2, -OMEGA[1] / 2],
  ],
  [
    [(1 - OMEGA[0]) / 2, -OMEGA[1] / 2],
    [(1 + OMEGA[0]) / 2, OMEGA[1] / 2],
  ],
]

export function lockedRelativeWalk(input: { ring: number; momentum: number; meet: boolean }): { re: Float64Array; im: Float64Array; n: number } {
  const { ring: L, momentum: K } = input
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
        // the meeting takes (d1, d2) to a combination of (e1, e2)
        const after: { e1: number; e2: number; amp: Complex }[] = []

        if (r === 0 && d1 !== d2 && input.meet) {
          const col = d1 === 0 ? 0 : 1

          after.push({ e1: 0, e2: 1, amp: U_BLOCK[0]![col]! }, { e1: 1, e2: 0, amp: U_BLOCK[1]![col]! })
        } else after.push({ e1: d1, e2: d2, amp: ONE })

        for (const m of after) {
          for (let c1 = 0; c1 < 2; c1++) {
            for (let c2 = 0; c2 < 2; c2++) {
              const amp = mul(mul(coin[c1]![m.e1]!, coin[c2]![m.e2]!), m.amp)
              const r2 = (((r + stepOf(c2) - stepOf(c1)) % L) + L) % L
              const v = mul(amp, cexp(-K * stepOf(c1)))
              const at = rel(r2, c1, c2) * n + rel(r, d1, d2)

              re[at] = (re[at] as number) + v[0]
              im[at] = (im[at] as number) + v[1]
            }
          }
        }
      }
    }
  }

  return { re, im, n }
}

export type LockedRelativeState = { energy: number; nearWeight: number; parity: number }

// eigenstates of the locked walk whose quasi-energy passes `keep`: energy, weight within `near`, exchange parity
export function lockedRelativeSpectrum(input: { ring: number; momentum: number; meet: boolean; near: number; keep: (energy: number) => boolean }): LockedRelativeState[] {
  const w = lockedRelativeWalk(input)
  const values = complexEigenvalues(w)
  const L = input.ring
  const out: LockedRelativeState[] = []

  values.re.forEach((vr, i) => {
    const vi = values.im[i] ?? 0
    const energy = quasiEnergy(vr, vi)

    if (!input.keep(energy)) return

    const v = complexEigenvector({ ...w, value: [vr, vi] })
    let near = 0
    let pr = 0

    for (let r = 0; r < L; r++) {
      const dist = Math.min(r, L - r)

      for (let c1 = 0; c1 < 2; c1++) {
        for (let c2 = 0; c2 < 2; c2++) {
          const k = rel(r, c1, c2)
          const a: Complex = [v.re[k] ?? 0, v.im[k] ?? 0]

          if (dist <= input.near) near += a[0] * a[0] + a[1] * a[1]

          const kp = rel((L - r) % L, c2, c1)
          const b = mul(cexp(input.momentum * r), [v.re[kp] ?? 0, v.im[kp] ?? 0])

          pr += a[0] * b[0] + a[1] * b[1]
        }
      }
    }

    out.push({ energy, nearWeight: near, parity: pr })
  })

  return out
}
