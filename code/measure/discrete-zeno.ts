// THE DISCRETE-TIME ZENO LAW (E-QTM-0187). A beat U is the smallest step there is, so a reading can come at most once a
// beat. For a state psi read every k beats ("is it still psi?"), the chance it is still psi after N readings, over
// T = N k beats, is
//
//   S(N, k) = |a(k)|^(2 N),  a(k) = <psi| U^k |psi>,  so the decay rate per beat is  Gamma(k) = -ln |a(k)|^2 / k.
//
// One beat is exact: 1 - |a(1)|^2 = <psi|U^dag U|psi> - |<psi|U|psi>|^2, the spread of U in psi. For a state of
// quasi-energies W with weights p(W), |a(k)|^2 = |sum p(W) e^(-i k W)|^2 = 1 - k^2 Var_p(W) + O(k^4), so
// Gamma(k) = k Var_p(W) + O(k^3) while k sqrt(Var) is small: readings more often slow the decay (the Zeno effect),
// linearly in the interval, as in continuous quantum mechanics. Continuous time lets k go to 0 and Gamma to 0 (the
// freeze). Here k >= 1, so the slowest decay reading can buy is the floor Gamma(1) = -ln |a(1)|^2 ~ Var_p(W) per beat,
// never 0 unless psi has one quasi-energy.
//
// This file holds the lone vibe's walk on a line (the fear walk, which E-QTM-0157 shows is the working rule's lone
// vibe bit for bit): its symbol from the rule's coin, its two bands, a packet's survival read in momentum and,
// independently, by running the walk in position, plus the slot reading on the rule's own branches.

import { FEAR_COIN, type Eisenstein } from '@/code/rule/fear-walk'
import type { LockedState } from '@/code/rule/doublet-locked-knit'
import type { LineBox } from '@/code/measure/line-barrier'

export type Complex = readonly [number, number]

const SQRT3_2 = Math.sqrt(3) / 2

// an Eisenstein integer over 2 as a complex number: (m + n w) / 2, w = e^(2 pi i / 3)
export const eisensteinHalf = (e: Eisenstein): Complex => [
  (Number(e[0]) - Number(e[1]) / 2) / 2,
  (Number(e[1]) * SQRT3_2) / 2,
]

const mul = (x: Complex, y: Complex): Complex => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0],
]
const add = (x: Complex, y: Complex): Complex => [x[0] + y[0], x[1] + y[1]]
const conjMul = (x: Complex, y: Complex): Complex => [
  x[0] * y[0] + x[1] * y[1],
  x[0] * y[1] - x[1] * y[0],
]
const expi = (t: number): Complex => [Math.cos(t), Math.sin(t)]

// the coin of the rule's lone vibe, keep and reverse, as complex numbers
export function fearCoin(): { keep: Complex; reverse: Complex } {
  return {
    keep: eisensteinHalf(FEAR_COIN[0]),
    reverse: eisensteinHalf(FEAR_COIN[1]),
  }
}

// one beat in momentum q (psi(x) = e^(i q x)): coin, then the right slot steps right (e^(-i q)) and the left slot left;
// rows and columns (right, left)
export function fearSymbol(q: number): [[Complex, Complex], [Complex, Complex]] {
  const { keep, reverse } = fearCoin()
  const r = expi(-q)
  const l = expi(q)

  return [
    [mul(r, keep), mul(r, reverse)],
    [mul(l, reverse), mul(l, keep)],
  ]
}

// the two eigenvalues of the symbol as phases theta (lambda = e^(-i theta), theta in (-pi, pi]) and their unit
// eigenvectors, band 0 the larger theta. With lambda = e^(i pi / 3) e^(+- i W), cos W = cos q / 2 (E-QTM-0157), band 0 is
// theta = W - pi / 3 in [0, pi / 3] and band 1 is -W - pi / 3 in [-pi, -2 pi / 3], so neither wraps away from q = pi
export function fearBands(q: number): {
  theta: [number, number]
  vector: [[Complex, Complex], [Complex, Complex]]
} {
  const m = fearSymbol(q)
  const tr = add(m[0][0], m[1][1])
  const det = add(mul(m[0][0], m[1][1]), mul([-m[0][1][0], -m[0][1][1]], m[1][0]))
  // lambda = tr/2 +- sqrt(tr^2/4 - det)
  const h: Complex = [tr[0] / 2, tr[1] / 2]
  const disc = add(mul(h, h), [-det[0], -det[1]])
  const mod = Math.hypot(disc[0], disc[1])
  const arg = Math.atan2(disc[1], disc[0])
  const root: Complex = [Math.sqrt(mod) * Math.cos(arg / 2), Math.sqrt(mod) * Math.sin(arg / 2)]
  const lambdas: Complex[] = [add(h, root), add(h, [-root[0], -root[1]])]
  const vec = (lam: Complex): [Complex, Complex] => {
    // (m00 - lam) x + m01 y = 0 -> (x, y) = (m01, lam - m00), or from the second row if that is degenerate
    let x: Complex = m[0][1]
    let y: Complex = add(lam, [-m[0][0][0], -m[0][0][1]])

    if (Math.hypot(x[0], x[1]) + Math.hypot(y[0], y[1]) < 1e-12) {
      x = add(lam, [-m[1][1][0], -m[1][1][1]])
      y = m[1][0]
    }

    const n = Math.sqrt(x[0] ** 2 + x[1] ** 2 + y[0] ** 2 + y[1] ** 2)

    return [
      [x[0] / n, x[1] / n],
      [y[0] / n, y[1] / n],
    ]
  }
  const thetas = lambdas.map(l => -Math.atan2(l[1], l[0])) as [number, number]
  const order = thetas[0] >= thetas[1] ? [0, 1] : [1, 0]

  return {
    theta: [thetas[order[0]!]!, thetas[order[1]!]!],
    vector: [vec(lambdas[order[0]!]!), vec(lambdas[order[1]!]!)],
  }
}

export type Packet = {
  readonly cells: number
  // weight on each momentum q_n = 2 pi n / cells, summing to 1, all in one band
  readonly weight: readonly number[]
  readonly band: 0 | 1
}

// a Gaussian packet in momentum, centered on q0 with spread dq, in one band of the walk
export function gaussianPacket(
  cells: number,
  q0: number,
  dq: number,
  band: 0 | 1,
): Packet {
  const raw = Array.from({ length: cells }, (_, n) => {
    let d = (2 * Math.PI * n) / cells - q0

    d -= 2 * Math.PI * Math.round(d / (2 * Math.PI))

    return dq === 0 ? 0 : Math.exp(-(d * d) / (2 * dq * dq))
  })

  if (dq === 0) {
    let best = 0

    for (let n = 0; n < cells; n++) {
      const d = Math.abs((2 * Math.PI * n) / cells - q0)
      const b = Math.abs((2 * Math.PI * best) / cells - q0)

      if (d < b) {
        best = n
      }
    }

    raw[best] = 1
  }

  const total = raw.reduce((s, x) => s + x, 0)

  return { cells, weight: raw.map(x => x / total), band }
}

// the quasi-energy phase of each momentum in the packet's band, from the symbol
export function packetPhases(p: Packet): number[] {
  return p.weight.map((_, n) => fearBands((2 * Math.PI * n) / p.cells).theta[p.band])
}

// a(k) = sum_q p(q) e^(-i k theta(q)), read in momentum
export function packetAmplitude(p: Packet, k: number, phases = packetPhases(p)): Complex {
  let re = 0
  let im = 0

  p.weight.forEach((w, n) => {
    re += w * Math.cos(k * phases[n]!)
    im -= w * Math.sin(k * phases[n]!)
  })

  return [re, im]
}

// the variance of the band phase over the packet (the quasi-energy spread squared, in 1/beat^2), unwrapped about its
// circular mean
export function phaseVariance(p: Packet, phases = packetPhases(p)): number {
  let c = 0
  let s = 0

  p.weight.forEach((w, n) => {
    c += w * Math.cos(phases[n]!)
    s += w * Math.sin(phases[n]!)
  })

  const mean = Math.atan2(s, c)

  let v = 0

  p.weight.forEach((w, n) => {
    let d = phases[n]! - mean

    d -= 2 * Math.PI * Math.round(d / (2 * Math.PI))
    v += w * d * d
  })

  return v
}

// Gamma(k) = -ln |a(k)|^2 / k, per beat
export const zenoRate = (a: Complex, k: number): number =>
  -Math.log(a[0] * a[0] + a[1] * a[1]) / k

// the packet as a state in position: psi(x, slot) = sum_q sqrt(p(q)) e^(i q x) u(q)
export function packetState(p: Packet): { right: Complex[]; left: Complex[] } {
  const n = p.cells
  const right: Complex[] = Array.from({ length: n }, () => [0, 0] as Complex)
  const left: Complex[] = Array.from({ length: n }, () => [0, 0] as Complex)

  p.weight.forEach((w, m) => {
    if (w < 1e-30) {
      return
    }

    const q = (2 * Math.PI * m) / n
    const u = fearBands(q).vector[p.band]
    const amp = Math.sqrt(w / n)

    for (let x = 0; x < n; x++) {
      const e: Complex = [amp * Math.cos(q * x), amp * Math.sin(q * x)]

      right[x] = add(right[x]!, mul(e, u[0]))
      left[x] = add(left[x]!, mul(e, u[1]))
    }
  })

  return { right, left }
}

// one beat of the lone vibe's walk in position, complex: the rule's coin on each dock, then stream
export function walkBeatComplex(s: { right: Complex[]; left: Complex[] }): {
  right: Complex[]
  left: Complex[]
} {
  const { keep, reverse } = fearCoin()
  const n = s.right.length
  const right: Complex[] = new Array<Complex>(n)
  const left: Complex[] = new Array<Complex>(n)

  for (let x = 0; x < n; x++) {
    const r = s.right[x]!
    const l = s.left[x]!

    right[(x + 1) % n] = add(mul(keep, r), mul(reverse, l))
    left[(x - 1 + n) % n] = add(mul(reverse, r), mul(keep, l))
  }

  return { right, left }
}

export function overlap(
  a: { right: Complex[]; left: Complex[] },
  b: { right: Complex[]; left: Complex[] },
): Complex {
  let out: Complex = [0, 0]

  for (let x = 0; x < a.right.length; x++) {
    out = add(out, conjMul(a.right[x]!, b.right[x]!))
    out = add(out, conjMul(a.left[x]!, b.left[x]!))
  }

  return out
}

// the slot reading on the rule's own branches: keep the branches whose open vibe is on the line's forward slot
// (forward true) or back slot, drop the rest. An ideal reading of the slot (a stand-in: no piece of the rule records
// it), applied to the rule's exact state
export function readSlot(box: LineBox, s: LockedState, forward: boolean): LockedState {
  const want = forward ? box.slot : box.back

  return {
    branches: s.branches.filter(b => {
      for (let i = 0; i < b.vibe.length; i++) {
        if (b.vibe[i] !== 0 && b.open[i] === 1) {
          return i % 24 === want
        }
      }

      return false
    }),
  }
}
