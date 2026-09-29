// Measurement for E-SPN-0114 (test/experiment/spin/meson-scaled-step): a reading rule for the string-bound love-fear
// meson's band (code/measure/meson-band) whose K step is set by the level's own physics rather than a fixed pi/64.
//
// THE BAND'S OWN ROTATION RATE. Followed in K, the level's block vector turns at a rate set by its quantum metric g(K):
// |<psi(K)|psi(K + dK)>| = 1 - g dK^2 / 2 + O(dK^3). Two parts of g are read off the level at K = 0, with no fit.
//  (a) THE PAIR'S SIZE. The block is written with love at the origin (string-binding pairColumn puts the whole e^(-iK)
//      on love's step), so a pair whose centre sits at d/2 carries e^(iKd/2) phi(d): this part of g is Var(d)/4,
//      Var(d) read from the level's own weights on its d.
//  (b) EACH TOKEN'S SPIN. A boost dK moves each token's momentum by dK/2, and the lone walk's particle spinor B(k)
//      turns with k at its own metric g_B(k) = lim (1 - |<B(k - h)|B(k + h)>|^2) / (4 h^2) (gauge free). Two tokens
//      at k = 0: 2 (1/2)^2 g_B(0) = g_B(0)/2. g_B is largest at k = 0 (the spinor turns fastest at rest), so the K = 0
//      value bounds it along the band.
// g = Var(d)/4 + g_B(0)/2. A step dK keeps the EXPECTED per-step loss g dK^2/2 under `bound` when dK <= sqrt(2 bound
// / g); the grid is range / ceil(range / that), so it lands on the range's end. The estimate is a prediction; the
// measured consecutive overlap is what a reading gates on, so a level the estimate misjudges is caught, not passed.
//
// NOTHING MOVES: the coin and the cost write amplitudes on a dock's own line; the stream copies. The floats are
// measurement.

import { type Vec } from '@/code/measure/quantum-ladder'
import {
  bandInverse,
  overlapOf,
  pairBand,
  type BandLevel,
} from '@/code/measure/meson-band'
import {
  fineBranch,
  parityIndices,
  type Meson,
} from '@/code/measure/string-binding'

// the variance of d = x_fear - x_love on an even-block vector
export function blockVarianceD(m: Meson, block: Vec): number {
  const idx = parityIndices(m, 0)

  let t = 0
  let s1 = 0
  let s2 = 0

  idx.forEach((i, a) => {
    const d = m.b.configs[Math.floor(i / m.b.labelCount)]![1]!
    const p = block.re[a]! ** 2 + block.im[a]! ** 2

    t += p
    s1 += p * d
    s2 += p * d * d
  })

  return s2 / t - (s1 / t) ** 2
}

// the lone particle spinor's metric at momentum k, by the gauge-free fidelity of B(k - h) and B(k + h)
export function branchMetric(fine: number, k = 0, h = 1e-4): number {
  const u = fineBranch(fine, k - h).B
  const v = fineBranch(fine, k + h).B

  let r = 0
  let i = 0

  for (let s = 0; s < 2; s++) {
    r += u[s]![0] * v[s]![0] + u[s]![1] * v[s]![1]
    i += u[s]![0] * v[s]![1] - u[s]![1] * v[s]![0]
  }

  return (1 - (r * r + i * i)) / (4 * h * h)
}

export type BandMetric = {
  varianceD: number
  spin: number
  metric: number
}

// g at K = 0 of a level: Var(d)/4 + g_B(0)/2 (see the header)
export function bandMetric(m: Meson, level: BandLevel): BandMetric {
  const varianceD = blockVarianceD(m, level.block)
  const spin = branchMetric(m.fine)

  return { varianceD, spin, metric: varianceD / 4 + spin / 2 }
}

// the largest step keeping g dK^2/2 <= bound, shrunk so an integer number of steps covers `range`
export function scaledStep(
  metric: number,
  bound: number,
  range: number,
): number {
  return range / Math.ceil(range / Math.sqrt((2 * bound) / metric))
}

export type HeldTrack = {
  K: number
  energy: number
  overlap: number
  residual: number
}

// the even-block level followed from K = 0 in equal steps up to `end` (meson-band followBand's step, with the same six
// rounds of inverse iteration and the same unwrapping), recording each step's own consecutive overlap and stopping
// after the first step whose overlap is under `hold`; point 0 is the level at K = 0 (overlap 1)
export function followHeld(
  m: Meson,
  level: BandLevel,
  step: number,
  end: number,
  hold: number,
  rounds = 6,
): HeldTrack[] {
  const count = Math.round(end / step)

  let prev: Vec = {
    re: Float64Array.from(level.block.re),
    im: Float64Array.from(level.block.im),
  }
  let energy = level.unwrapped

  const out: HeldTrack[] = [
    { K: 0, energy, overlap: 1, residual: level.residual },
  ]

  for (let s = 1; s <= count; s++) {
    const K = s === count ? end : s * step
    const it = bandInverse(pairBand(m, K, 0), prev, rounds)
    const overlap = overlapOf(prev, it.vector)

    energy =
      it.energy +
      2 * Math.PI * Math.round((energy - it.energy) / (2 * Math.PI))
    prev = it.vector
    out.push({ K, energy, overlap, residual: it.residual })

    if (overlap < hold) {
      break
    }
  }

  return out
}
