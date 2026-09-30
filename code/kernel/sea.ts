// REGISTER-SEA ON A KERNEL: E-SPN-0175's two-hole cycle (code/measure/register-sea seaBeat and seaCycle) and its Fourier
// read (pairAt, and flatCount through it), each the engine's own sequence of steps with the heavy loops on a kernel.
// code/kernel/
//
// What stays in JavaScript, and why: the per-dock pair angles (a cosine and sine per dock, computed here exactly as
// seaBeat computes them, so the kernel receives the same doubles), the dock contact at the origin (one dock, cheap), and
// movingWeights (restated below from register-sea, where it is private). What moves to the kernel: the sector piece at
// every dock (independent docks, so a dock is a row), the swap coin and stream (a copy, a dock a row), and pairAt's sum
// over docks (an entry a row, each summed over docks in order).

import type { Kernel } from '@/code/kernel/types'
import { betaOf } from '@/code/measure/register-meson'
import {
  newPair,
  type Moving,
  type Pair,
  type SeaRule,
  type SectorBases,
  type Torus,
  FULL,
  MODES,
} from '@/code/measure/register-sea'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const REG = 8
const NR = 24
const OPP = Int32Array.from(OPPOSITE)

// register-sea dockContact, restated (it is module-private there)
function dockContact(t: Torus, s: Pair, v: readonly [number, number]): void {
  const o = t.origin * FULL
  const v2r = v[0] * v[0] - v[1] * v[1]
  const v2i = 2 * v[0] * v[1]

  for (let d = 0; d < NR; d++) {
    for (let e = 0; e < NR; e++) {
      for (let a = 0; a < REG; a++) {
        for (let b = a + 1; b < REG; b++) {
          const i = o + (d * REG + a) * MODES + e * REG + b
          const j = o + (d * REG + b) * MODES + e * REG + a
          const sr = (s.re[i]! + s.re[j]!) / 2
          const si = (s.im[i]! + s.im[j]!) / 2
          const ar = (s.re[i]! - s.re[j]!) / 2
          const ai = (s.im[i]! - s.im[j]!) / 2
          const wr = v2r * ar - v2i * ai
          const wi = v2r * ai + v2i * ar

          s.re[i] = sr + wr
          s.im[i] = si + wi
          s.re[j] = sr - wr
          s.im[j] = si - wi
        }
      }
    }
  }
}

// seaBeat, the pieces and the stream on the kernel
export function fastSeaBeat(
  k: Kernel,
  t: Torus,
  rule: SeaRule,
  E: SectorBases,
  s: Pair,
  beat: 1 | 2,
  into?: Pair,
): Pair {
  const N = t.sites.length
  const [ur, ui] = rule.u
  const w: [number, number] = beat === 1 ? [ur, ui] : [ur, -ui]
  const sign = beat === 1 ? 1 : -1
  const basis = beat === 1 ? E.S : E.D
  const alpha = new Float64Array(2 * N)
  const beta = new Float64Array(2 * N)
  const phase = rule.whole ? new Float64Array(2 * N) : null

  if (rule.dock) {
    dockContact(t, s, rule.dock)
  }

  for (let i = 0; i < N; i++) {
    const V = t.V[i]!
    const phi =
      sign * ((rule.kernel ? rule.kernel[i]! : rule.string * Math.min(V, rule.cap)) + (V === 0 ? rule.contact : 0))

    let a: readonly [number, number]
    let b: readonly [number, number]

    if (rule.whole) {
      phase![2 * i] = Math.cos(phi)
      phase![2 * i + 1] = Math.sin(phi)
      a = [w[0] - 1, w[1]]
      b = betaOf(w[0], w[1], 0)
    } else if (rule.member) {
      const wr = w[0] * Math.cos(phi / 2) - w[1] * Math.sin(phi / 2)
      const wi = w[0] * Math.sin(phi / 2) + w[1] * Math.cos(phi / 2)

      a = [wr - 1, wi]
      b = [(wr - 1) ** 2 - wi * wi, 2 * (wr - 1) * wi]
    } else {
      a = [w[0] - 1, w[1]]
      b = betaOf(w[0], w[1], phi)
    }

    alpha[2 * i] = a[0]
    alpha[2 * i + 1] = a[1]
    beta[2 * i] = b[0]
    beta[2 * i + 1] = b[1]
  }

  k.seaPiece(s.re, s.im, basis, alpha, beta, phase)

  const out = into ?? newPair(t)

  k.seaStream(s.re, s.im, out.re, out.im, t.move, OPP)

  return out
}

// seaCycle: beat 1 streams s into the spare, beat 2 streams the spare back into s
export function fastSeaCycle(k: Kernel, t: Torus, rule: SeaRule, E: SectorBases, s: Pair, spare?: Pair): Pair {
  const mid = fastSeaBeat(k, t, rule, E, s, 1, spare ?? newPair(t))

  return fastSeaBeat(k, t, rule, E, mid, 2, s)
}

// pairAt: M[m1][m2] = sum_y e^(-i q . y) psi(y)[m1][m2], the phases computed here as pairAt computes them
export function fastPairAt(k: Kernel, t: Torus, s: Pair, j: number): { re: Float64Array; im: Float64Array } {
  const q = t.momenta[j]!
  const N = t.sites.length
  const c = new Float64Array(N)
  const sn = new Float64Array(N)

  t.sites.forEach((y, i) => {
    const ph = -(q[0]! * y[0]! + q[1]! * y[1]! + q[2]! * y[2]! + q[3]! * y[3]!)

    c[i] = Math.cos(ph)
    sn[i] = Math.sin(ph)
  })

  const Mr = new Float64Array(FULL)
  const Mi = new Float64Array(FULL)

  k.phaseSum(s.re, s.im, c, sn, FULL, Mr, Mi)

  return { re: Mr, im: Mi }
}

// register-sea movingWeights, restated (module-private there): ||B^dag M||^2 and ||M conj(B')||^2
function movingWeights(
  mv: Moving,
  j: number,
  jn: number,
  M: { re: Float64Array; im: Float64Array },
): { total: number; w1: number; w2: number } {
  const k1 = mv.rank[j]!
  const k2 = mv.rank[jn]!
  const Br = mv.re[j]!
  const Bi = mv.im[j]!
  const Cr = mv.re[jn]!
  const Ci = mv.im[jn]!

  let total = 0
  let w1 = 0
  let w2 = 0

  for (let x = 0; x < FULL; x++) {
    total += M.re[x]! ** 2 + M.im[x]! ** 2
  }

  for (let col = 0; col < k1; col++) {
    const ar = new Float64Array(MODES)
    const ai = new Float64Array(MODES)

    for (let m1 = 0; m1 < MODES; m1++) {
      const br = Br[m1 * k1 + col]!
      const bi = -Bi[m1 * k1 + col]!

      if (br === 0 && bi === 0) {
        continue
      }

      const o = m1 * MODES

      for (let m2 = 0; m2 < MODES; m2++) {
        const xr = M.re[o + m2]!
        const xi = M.im[o + m2]!

        ar[m2]! += br * xr - bi * xi
        ai[m2]! += br * xi + bi * xr
      }
    }

    for (let m2 = 0; m2 < MODES; m2++) {
      w1 += ar[m2]! ** 2 + ai[m2]! ** 2
    }
  }

  for (let m1 = 0; m1 < MODES; m1++) {
    const o = m1 * MODES

    for (let col = 0; col < k2; col++) {
      let sr = 0
      let si = 0

      for (let m2 = 0; m2 < MODES; m2++) {
        const cr = Cr[m2 * k2 + col]!
        const ci = -Ci[m2 * k2 + col]!
        const xr = M.re[o + m2]!
        const xi = M.im[o + m2]!

        sr += xr * cr - xi * ci
        si += xr * ci + xi * cr
      }

      w2 += sr * sr + si * si
    }
  }

  return { total, w1, w2 }
}

// flatCount: N_F and the Fourier norm, pairAt on the kernel
export function fastFlatCount(k: Kernel, t: Torus, mv: Moving, s: Pair): { nF: number; fourier: number } {
  let total = 0
  let flat = 0

  for (let j = 0; j < t.momenta.length; j++) {
    const M = fastPairAt(k, t, s, j)
    const w = movingWeights(mv, j, t.negMomentum[j]!, M)

    total += w.total
    flat += 2 * w.total - w.w1 - w.w2
  }

  return { nF: flat / total, fourier: total }
}
