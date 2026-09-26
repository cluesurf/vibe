// Where a carried-remainder force puts its quantization noise, derived through the leapfrog symbol
// (E-FRC-0183), before any shaped rule is run.
//
// The model. A shaped force pays f_t = kappa B_t + e_t, e_t = sum_j h_j u_(t-j) (+ kappa C C^T u_(t-1) for the
// wave form), with u the fresh quantization error, modeled as white, uniform on [0, 1), variance 1 / 12. The
// kick adds -C^T e_t to the flux. On a mode of the curl-curl M(k) with eigenvalue lambda (unit eigenvector
// v), the noise reaching it is (C v)^dagger e: power lambda sigma^2 per beat, colored by the noise transfer
// function NTF(z) = sum_j h_j z^j, z the one-beat delay. A leapfrog mode of frequency omega, 4 sin^2(omega /
// 2) = kappa lambda, absorbs only the part of a stationary force at its own frequency: its shadow energy
// (1/2 (a_t^2 + a_(t-1)^2 - (2 - kappa lambda) a_t a_(t-1)), what E-FRC-0181 F reads) grows per beat by
//
//   1/2 lambda sigma^2 |NTF(e^(i omega))|^2
//
// summed over every mode of the box (every k and every branch; the pure-gauge branch has lambda = 0 and takes
// nothing). So the heating of a form is a sum over the symbol, and the harm is read on the shell only:
// - first order (E-FRC-0181): |1 - e^(i omega)|^2 = 4 sin^2(omega / 2) = kappa lambda exactly
// - (1 - z)^L: (kappa lambda)^L. Each order buys a factor kappa lambda, which is small for the photon at small
//   k but near 1 for the massive branches (kappa lambda_max = 0.98): the band fills a third of the Nyquist
//   range, so shaping in time alone cannot push the noise above it
// - the wave form: NTF = 1 - (2 - kappa lambda) z + z^2 = z (kappa lambda - 4 sin^2(omega / 2)) at z = e^(i
//   omega), exactly zero on every branch's shell. What it leaves is the rounding of its spatial term, white
//   at variance 1 / (12 q^2): heating (1 / (24 q^2)) tr M, tr M = 3 times the plaquette count
//
// Why the noise cannot be put into the gauge kernel instead. Every kick is a curl, C^T e, and C g = 0 for a
// pure-gauge g (the gradient of a frame change), so g^dagger C^T e = (C g)^dagger e = 0: curl noise is
// orthogonal to every gauge direction by construction, and a kick with a gauge part would be a gradient,
// which changes the divergence of E and breaks Gauss's law. The noise that costs nothing is instead noise in
// the image of the dynamics' own operator, which the wave form produces.

import { hermitianEigen, leapfrogOmega, plaquetteWaveMatrix } from '@/code/measure/photon-modes'
import { applyNorm, gradientVector, huskSymbol } from '@/code/measure/photon-symbol'
import { bulkModeOfHusk, type Husk } from '@/code/measure/photon-husk'
import { waveVector } from '@/code/measure/photon-modes'
import { type PhotonLattice } from '@/code/rule/photon-links'

export type NoiseForm = { readonly name: string; readonly taps: readonly number[]; readonly spread: boolean }

export const NOISE_FORMS: readonly NoiseForm[] = [
  { name: 'white', taps: [], spread: false },
  { name: 'first', taps: [-1], spread: false },
  { name: 'second', taps: [-2, 1], spread: false },
  { name: 'third', taps: [-3, 3, -1], spread: false },
  { name: 'wave', taps: [-2, 1], spread: true },
]

// |NTF(e^(i omega))|^2 for a form on a branch of eigenvalue lambda: 1 + sum_j h_j z^j, and for the wave form
// the spatial term kappa lambda z added to the first tap
export function ntfPower(form: { taps: readonly number[]; spread: boolean }, omega: number, lambda: number, kappa: number): number {
  let re = 1
  let im = 0

  form.taps.forEach((h, i) => {
    const j = i + 1
    const c = h + (j === 1 && form.spread ? kappa * lambda : 0)

    re += c * Math.cos(j * omega)
    im += c * Math.sin(j * omega)
  })

  return re * re + im * im
}

export type BranchSpectrum = {
  // lambda of every branch at every mode, flattened, and the rank of each within its mode (0 the smallest)
  readonly lambda: Float64Array
  readonly rank: Int32Array
  readonly modes: number
  readonly branches: number
  // the largest |M(k) g(k)| / |g(k)| over the modes, g the pure-gauge vector (bulk only; -1 on the husk)
  readonly gaugeLeak: number
}

// every branch of M(k) at every integer mode of the bulk box
export function bulkSpectrum(bulk: PhotonLattice): BranchSpectrum {
  const f = bulk.firsts.length
  const modes = bulk.side ** bulk.dimension
  const lambda = new Float64Array(modes * f)
  const rank = new Int32Array(modes * f)

  let gaugeLeak = 0

  for (let i = 0; i < modes; i++) {
    const n = Array.from({ length: bulk.dimension }, (_, j) => Math.floor(i / bulk.side ** j) % bulk.side)
    const m = plaquetteWaveMatrix(bulk, n)
    const values = Array.from(hermitianEigen(m).values).sort((a, b) => a - b)

    values.forEach((v, b) => {
      lambda[i * f + b] = Math.max(0, v)
      rank[i * f + b] = b
    })

    const g = gradientVector(bulk, waveVector(bulk, n))
    const norm = Math.sqrt(g.im.reduce((s, x) => s + x * x, 0))

    if (norm > 1e-9) {
      gaugeLeak = Math.max(gaugeLeak, applyNorm(m, g) / norm)
    }
  }

  return { lambda, rank, modes, branches: f, gaugeLeak }
}

// the 9 husk branches (the Hermitian husk symbol) at every husk mode
export function huskSpectrum(husk: Husk): BranchSpectrum {
  const side = husk.side
  const modes = side ** 3
  const h = 9
  const lambda = new Float64Array(modes * h)
  const rank = new Int32Array(modes * h)

  for (let i = 0; i < modes; i++) {
    const m = [i % side, Math.floor(i / side) % side, Math.floor(i / (side * side))]
    const values = Array.from(hermitianEigen(huskSymbol(husk, plaquetteWaveMatrix(husk.bulk, bulkModeOfHusk(m))).hermitian).values).sort((a, b) => a - b)

    values.forEach((v, b) => {
      lambda[i * h + b] = Math.max(0, v)
      rank[i * h + b] = b
    })
  }

  return { lambda, rank, modes, branches: h, gaugeLeak: -1 }
}

export type Heating = {
  // (1/2) sigma^2 sum lambda |NTF|^2 over every branch, and split by branch class
  readonly total: number
  readonly light: number
  readonly massive: number
  // the largest |NTF| on any shell
  readonly largestOnShell: number
}

// the predicted heating per beat of a form over a spectrum. `lightRanks` are the ranks counted as light (the
// photons: 1..3 on the bulk, 1..2 on the husk), everything above them massive, rank 0 the gauge branch
export function heating(spectrum: BranchSpectrum, form: { taps: readonly number[]; spread: boolean }, kappa: number, sigma2: number, lightRanks: readonly number[]): Heating {
  let light = 0
  let massive = 0
  let largest = 0

  for (let i = 0; i < spectrum.lambda.length; i++) {
    const lambda = spectrum.lambda[i] as number

    if (lambda < 1e-9) {
      continue
    }

    const power = ntfPower(form, leapfrogOmega(kappa, lambda), lambda, kappa)
    const h = 0.5 * sigma2 * lambda * power

    largest = Math.max(largest, Math.sqrt(power))

    if (lightRanks.includes(spectrum.rank[i] as number)) {
      light += h
    } else {
      massive += h
    }
  }

  return { total: light + massive, light, massive, largestOnShell: largest }
}

// the best reversible second-order notch, NTF 1 - c z + z^2 (its last tap is 1, so the kick still runs
// backward): sum lambda |1 - c z + z^2|^2 = sum lambda (2 cos omega - c)^2 on the unit circle, least at
// c = sum lambda 2 cos omega / sum lambda, the lambda-weighted mean of 2 cos omega over the band
export function notchCoefficient(spectrum: BranchSpectrum, kappa: number): number {
  let num = 0
  let den = 0

  for (let i = 0; i < spectrum.lambda.length; i++) {
    const lambda = spectrum.lambda[i] as number

    if (lambda < 1e-9) {
      continue
    }

    num += lambda * 2 * Math.cos(leapfrogOmega(kappa, lambda))
    den += lambda
  }

  return num / den
}

// the monic FIR NTF of order L, 1 + h_1 z + ... + h_L z^L, that minimizes sum lambda |NTF(e^(i omega))|^2 over
// the spectrum: the Toeplitz normal equations R h = -r, R_ij = sum lambda cos((i - j) omega), r_j = sum
// lambda cos(j omega). The best any shaping in time alone can do on this band, in the white-noise model
export function optimalTaps(spectrum: BranchSpectrum, kappa: number, order: number): number[] {
  const r = new Float64Array(order + 1)

  for (let i = 0; i < spectrum.lambda.length; i++) {
    const lambda = spectrum.lambda[i] as number

    if (lambda < 1e-9) {
      continue
    }

    const omega = leapfrogOmega(kappa, lambda)

    for (let j = 0; j <= order; j++) {
      r[j] = (r[j] as number) + lambda * Math.cos(j * omega)
    }
  }

  // R h = -r(1..L), R_ij = r(|i - j|)
  const a = Array.from({ length: order }, (_, i) => Array.from({ length: order + 1 }, (_, j) => (j < order ? (r[Math.abs(i - j)] as number) : -(r[i + 1] as number))))

  for (let c = 0; c < order; c++) {
    let pivot = c

    for (let i = c + 1; i < order; i++) {
      if (Math.abs(a[i]![c]!) > Math.abs(a[pivot]![c]!)) {
        pivot = i
      }
    }

    ;[a[c], a[pivot]] = [a[pivot]!, a[c]!]

    for (let i = 0; i < order; i++) {
      if (i !== c) {
        const factor = a[i]![c]! / a[c]![c]!

        for (let j = c; j <= order; j++) {
          a[i]![j] = a[i]![j]! - factor * a[c]![j]!
        }
      }
    }
  }

  return a.map((row, i) => row[order]! / row[i]!)
}
