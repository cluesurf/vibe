// The Landau problem of the spinor token (code/rule/spinor-token) in a husk plane: one period of the walk at
// k_z = 0 in a uniform field B along z, reduced to one chain.
//
// The field is the Landau gauge theta_y(x) = B x on the y links, with B = 2 pi m / L so theta_y is periodic in x
// on an L-dock ring and no seam is needed; the x links carry no angle. Translations along y then commute with
// the walk, so each wave number k_y is a block: an L-dock chain along x with 4 amplitudes per dock. At k_z = 0 a
// z beat and a depth beat copy every component the same way with no phase, so on the block they are the coin
// alone. A y beat is diagonal in x: the forward copy picks e^(i (q B x - k_y)), the back copy its conjugate, so it
// is e^(-i (k_y - q B x) Gamma_y) at each dock. An x beat moves the P_+ part one dock forward and the P_- part
// one dock back around the ring.
//
// The chain operator is built as a dense 4L x 4L matrix by applying the period to each basis vector, and its
// eigenvalues (code/algebra/linear/complex-eigen) are the Landau levels at that k_y as phases per period.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { coinMatrix, stepGenerator, type Complex, type Mode, type Step } from '@/code/rule/spinor-token'

export type Chain = { re: Float64Array; im: Float64Array }

function applyStep(input: { chain: Chain; side: number; step: Step; mode: Mode; field: number; charge: number; ky: number }): Chain {
  const { chain, side, step, mode, field, charge, ky } = input
  const coin = coinMatrix()
  const gamma = stepGenerator(step, mode)
  const n = 4 * side
  const mid: Chain = { re: new Float64Array(n), im: new Float64Array(n) }

  // the coin
  for (let x = 0; x < side; x++) {
    for (let i = 0; i < 4; i++) {
      let re = 0
      let im = 0

      for (let j = 0; j < 4; j++) {
        const [mr, mi] = coin[i * 4 + j] ?? [0, 0]

        re += mr * (chain.re[4 * x + j] ?? 0) - mi * (chain.im[4 * x + j] ?? 0)
        im += mr * (chain.im[4 * x + j] ?? 0) + mi * (chain.re[4 * x + j] ?? 0)
      }

      mid.re[4 * x + i] = re
      mid.im[4 * x + i] = im
    }
  }

  if (step === 'z' || step === 'up' || step === 'down') {
    return mid
  }

  const out: Chain = { re: new Float64Array(n), im: new Float64Array(n) }
  const projector = (sign: number): Complex[] => Array.from({ length: 16 }, (_, i) => [((i % 5 === 0 ? 1 : 0) + sign * (gamma[i] ?? [0, 0])[0]) / 2, (sign * (gamma[i] ?? [0, 0])[1]) / 2] as Complex)
  const plus = projector(1)
  const minus = projector(-1)

  for (let x = 0; x < side; x++) {
    for (const [p, sign] of [
      [plus, 1],
      [minus, -1],
    ] as const) {
      // the part copied: P psi(x)
      const part: Complex[] = [0, 1, 2, 3].map(i => {
        let re = 0
        let im = 0

        for (let j = 0; j < 4; j++) {
          const [mr, mi] = p[i * 4 + j] ?? [0, 0]

          re += mr * (mid.re[4 * x + j] ?? 0) - mi * (mid.im[4 * x + j] ?? 0)
          im += mr * (mid.im[4 * x + j] ?? 0) + mi * (mid.re[4 * x + j] ?? 0)
        }

        return [re, im]
      })

      if (step === 'x') {
        const target = (((x + sign) % side) + side) % side

        part.forEach(([re, im], i) => {
          out.re[4 * target + i] = (out.re[4 * target + i] ?? 0) + re
          out.im[4 * target + i] = (out.im[4 * target + i] ?? 0) + im
        })
      } else {
        // y: the phase e^(i sign (q B x - k_y)) on the part, staying at x
        const angle = sign * (charge * field * x - ky)
        const c = Math.cos(angle)
        const s = Math.sin(angle)

        part.forEach(([re, im], i) => {
          out.re[4 * x + i] = (out.re[4 * x + i] ?? 0) + re * c - im * s
          out.im[4 * x + i] = (out.im[4 * x + i] ?? 0) + re * s + im * c
        })
      }
    }
  }

  return out
}

// the period operator of a schedule on the chain, as a dense matrix
export function chainOperator(input: { side: number; schedule: readonly Step[]; mode: Mode; field: number; charge: number; ky: number }): { re: Float64Array; im: Float64Array; n: number } {
  const n = 4 * input.side
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let col = 0; col < n; col++) {
    let chain: Chain = { re: new Float64Array(n), im: new Float64Array(n) }

    chain.re[col] = 1

    for (const step of input.schedule) {
      chain = applyStep({ chain, side: input.side, step, mode: input.mode, field: input.field, charge: input.charge, ky: input.ky })
    }

    for (let row = 0; row < n; row++) {
      re[row * n + col] = chain.re[row] ?? 0
      im[row * n + col] = chain.im[row] ?? 0
    }
  }

  return { re, im, n }
}

// the Landau levels as phases per period, in (-pi, pi]
export function chainPhases(input: { side: number; schedule: readonly Step[]; mode: Mode; field: number; charge: number; ky: number }): number[] {
  const u = chainOperator(input)
  const e = complexEigenvalues({ re: u.re, im: u.im, n: u.n })

  return e.re.map((r, i) => Math.atan2(e.im[i] ?? 0, r))
}
