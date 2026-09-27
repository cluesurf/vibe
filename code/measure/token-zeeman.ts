// The spinor token's Landau chain (code/measure/token-landau) resolved by a conserved spin sector, for E-MTR-0015.
//
// At k_z = 0 a z beat and a depth beat are the coin alone, and the coin is a function of tau_x. In 'locked' mode an
// x or y beat is built from Gamma = tau_z sigma_x or tau_z sigma_y, and S = tau_x sigma_z commutes with tau_x and
// with both (two anticommuting pairs), so S commutes with the whole period in any field along z. In 'spectator'
// mode Gamma = tau_z and S = sigma_z commutes. On the particle band (slot-symmetric, tau_x = +1) S is the spin
// along the field in both modes, so the S = +1 and S = -1 blocks are the spin-up and spin-down Landau ladders.
//
// The coin is (1 + e^(i 2 mu)) / 2 + (1 - e^(i 2 mu)) / 2 SWAP = e^(i mu) e^(-i mu tau_x), which is the model's fear
// coin SWAP^(2/3) at mu = pi / 3 (code/rule/spinor-token's COIN_A, COIN_B) and a light Dirac mass for small mu,
// used as a calibration witness. The slot-symmetric state keeps eigenvalue 1 for every mu, so the rest energy is
// phase 0 per period for every coin.
//
// Everything is built with typed arrays: the period is applied to each of the 2L sector basis vectors of a
// block and projected back, O(L^2) per block, then complexEigenvalues on a 2L x 2L matrix.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { stepGenerator, type Mode, type Step } from '@/code/rule/spinor-token'

export type ZeemanInput = {
  side: number
  schedule: readonly Step[]
  mode: Mode
  field: number
  charge: number
  ky: number
  coinAngle: number
}

// the 4 x 4 coin e^(i mu) e^(-i mu tau_x) (x) 1, index 2 slot + spin, as re and im arrays
function coinOf(mu: number): { re: Float64Array; im: Float64Array } {
  const a = [(1 + Math.cos(2 * mu)) / 2, Math.sin(2 * mu) / 2]
  const b = [(1 - Math.cos(2 * mu)) / 2, -Math.sin(2 * mu) / 2]
  const re = new Float64Array(16)
  const im = new Float64Array(16)

  for (let spin = 0; spin < 2; spin++) {
    for (const [row, col, v] of [
      [spin, spin, a],
      [spin, 2 + spin, b],
      [2 + spin, spin, b],
      [2 + spin, 2 + spin, a],
    ] as const) {
      re[row * 4 + col] = v[0] ?? 0
      im[row * 4 + col] = v[1] ?? 0
    }
  }

  return { re, im }
}

// the projectors (1 +- Gamma) / 2 of a step, as re and im arrays
function projectorsOf(step: Step, mode: Mode): { plusRe: Float64Array; plusIm: Float64Array; minusRe: Float64Array; minusIm: Float64Array } {
  const gamma = stepGenerator(step, mode)
  const plusRe = new Float64Array(16)
  const plusIm = new Float64Array(16)
  const minusRe = new Float64Array(16)
  const minusIm = new Float64Array(16)

  for (let i = 0; i < 16; i++) {
    const [gr, gi] = gamma[i] ?? [0, 0]
    const id = i % 5 === 0 ? 1 : 0

    plusRe[i] = (id + gr) / 2
    plusIm[i] = gi / 2
    minusRe[i] = (id - gr) / 2
    minusIm[i] = -gi / 2
  }

  return { plusRe, plusIm, minusRe, minusIm }
}

// dest[4x..4x+3] (+)= M src[4x..4x+3] for a 4 x 4 complex M
function apply4(mRe: Float64Array, mIm: Float64Array, srcRe: Float64Array, srcIm: Float64Array, at: number, outRe: Float64Array, outIm: Float64Array, to: number, phaseRe: number, phaseIm: number): void {
  for (let i = 0; i < 4; i++) {
    let re = 0
    let im = 0

    for (let j = 0; j < 4; j++) {
      const mr = mRe[i * 4 + j] ?? 0
      const mi = mIm[i * 4 + j] ?? 0
      const vr = srcRe[at + j] ?? 0
      const vi = srcIm[at + j] ?? 0

      re += mr * vr - mi * vi
      im += mr * vi + mi * vr
    }

    outRe[to + i] = (outRe[to + i] ?? 0) + re * phaseRe - im * phaseIm
    outIm[to + i] = (outIm[to + i] ?? 0) + re * phaseIm + im * phaseRe
  }
}

// one period on a chain vector, in place through two scratch buffers
function period(input: ZeemanInput, re: Float64Array, im: Float64Array, scratchRe: Float64Array, scratchIm: Float64Array): void {
  const { side, schedule, mode, field, charge, ky } = input
  const coin = coinOf(input.coinAngle)

  for (const step of schedule) {
    scratchRe.fill(0)
    scratchIm.fill(0)

    for (let x = 0; x < side; x++) {
      apply4(coin.re, coin.im, re, im, 4 * x, scratchRe, scratchIm, 4 * x, 1, 0)
    }

    if (step === 'z' || step === 'up' || step === 'down') {
      re.set(scratchRe)
      im.set(scratchIm)
      continue
    }

    const p = projectorsOf(step, mode)

    re.fill(0)
    im.fill(0)

    for (let x = 0; x < side; x++) {
      if (step === 'x') {
        apply4(p.plusRe, p.plusIm, scratchRe, scratchIm, 4 * x, re, im, 4 * ((x + 1) % side), 1, 0)
        apply4(p.minusRe, p.minusIm, scratchRe, scratchIm, 4 * x, re, im, 4 * ((x - 1 + side) % side), 1, 0)
      } else {
        const angle = charge * field * x - ky

        apply4(p.plusRe, p.plusIm, scratchRe, scratchIm, 4 * x, re, im, 4 * x, Math.cos(angle), Math.sin(angle))
        apply4(p.minusRe, p.minusIm, scratchRe, scratchIm, 4 * x, re, im, 4 * x, Math.cos(angle), -Math.sin(angle))
      }
    }
  }
}

// the two sector basis vectors per dock: for S = +1 and S = -1, the components (index 2 slot + spin) and weights.
// locked, S = tau_x sigma_z: +1 = {(|0 up> + |1 up>), (|0 down> - |1 down>)}, -1 = {(|0 up> - |1 up>), (|0 down> + |1 down>)}
// spectator, S = sigma_z: +1 = {|0 up>, |1 up>}, -1 = {|0 down>, |1 down>}
function sectorBasis(mode: Mode, sector: 1 | -1): number[][] {
  const r = Math.SQRT1_2

  if (mode === 'spectator') {
    return sector === 1
      ? [
          [1, 0, 0, 0],
          [0, 0, 1, 0],
        ]
      : [
          [0, 1, 0, 0],
          [0, 0, 0, 1],
        ]
  }

  return sector === 1
    ? [
        [r, 0, r, 0],
        [0, r, 0, -r],
      ]
    : [
        [r, 0, -r, 0],
        [0, r, 0, r],
      ]
}

// The period restricted to one sector, as a dense 2L x 2L matrix, plus the norm of what leaks to the other
// sector (zero when S commutes).
export function sectorOperator(input: ZeemanInput, sector: 1 | -1): { re: Float64Array; im: Float64Array; n: number; leak: number } {
  const side = input.side
  const n = 2 * side
  const own = sectorBasis(input.mode, sector)
  const other = sectorBasis(input.mode, sector === 1 ? -1 : 1)
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const vRe = new Float64Array(4 * side)
  const vIm = new Float64Array(4 * side)
  const sRe = new Float64Array(4 * side)
  const sIm = new Float64Array(4 * side)
  let leak = 0

  for (let col = 0; col < n; col++) {
    vRe.fill(0)
    vIm.fill(0)

    const dock = Math.floor(col / 2)
    const basis = own[col % 2] ?? []

    for (let c = 0; c < 4; c++) {
      vRe[4 * dock + c] = basis[c] ?? 0
    }

    period(input, vRe, vIm, sRe, sIm)

    for (let x = 0; x < side; x++) {
      for (let k = 0; k < 2; k++) {
        let pr = 0
        let pi = 0
        let lr = 0
        let li = 0

        for (let c = 0; c < 4; c++) {
          pr += (own[k]?.[c] ?? 0) * (vRe[4 * x + c] ?? 0)
          pi += (own[k]?.[c] ?? 0) * (vIm[4 * x + c] ?? 0)
          lr += (other[k]?.[c] ?? 0) * (vRe[4 * x + c] ?? 0)
          li += (other[k]?.[c] ?? 0) * (vIm[4 * x + c] ?? 0)
        }

        re[(2 * x + k) * n + col] = pr
        im[(2 * x + k) * n + col] = pi
        leak = Math.max(leak, Math.hypot(lr, li))
      }
    }
  }

  return { re, im, n, leak }
}

// the phases per period of one sector, in (-pi, pi]
export function sectorPhases(input: ZeemanInput, sector: 1 | -1): { phases: number[]; leak: number } {
  const u = sectorOperator(input, sector)
  const e = complexEigenvalues({ re: u.re, im: u.im, n: u.n })

  return { phases: e.re.map((r, i) => Math.atan2(e.im[i] ?? 0, r)), leak: u.leak }
}
