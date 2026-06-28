// Wave dispersion of a discrete rule from its neighbour direction set. The
// nearest-neighbour lattice dispersion is omega^2(k) = sum over directions d of
// (1 - cos(k . d)), the small-k limit of the discrete Laplacian. How isotropic this
// is at fixed |k| (axis versus diagonal) is the lattice-isotropy test: the D4
// 24-direction set is isotropic to order four, the cubic 6 and hypercubic 8 are not.

import { dot } from '@/code/algebra/vector'
import { linearFit } from '@/code/measure/regression'

// Least-squares fit of a relativistic dispersion omega^2 = speedSquared * k^2 + massSquared, by
// regressing omega^2 on k^2. The continuum relativistic relation has speedSquared = 1 (the light
// speed) and massSquared = m^2 (the rest energy squared, the gap at k = 0).
export function relativisticDispersionFit(input: {
  wavenumbers: readonly number[]
  frequencies: readonly number[]
}): { speedSquared: number; massSquared: number } {
  const fit = linearFit({
    xs: input.wavenumbers.map(k => k * k),
    ys: input.frequencies.map(w => w * w),
  })

  return { speedSquared: fit.slope, massSquared: fit.intercept }
}

// omega^2(k) for a lattice whose nearest-neighbour offsets are `directions`.
export function latticeDispersion(input: {
  directions: number[][]
  wave: number[]
}): number {
  const { directions, wave } = input

  return directions.reduce(
    (sum, d) => sum + (1 - Math.cos(dot(wave, d))),
    0,
  )
}

// Axis-versus-diagonal anisotropy of the lattice dispersion at fixed momentum
// magnitude q: the relative difference of omega^2 / (number of directions) between a
// pure axis wave (q, 0, ...) and a body-diagonal wave (q/sqrt(dim), ...), both of
// magnitude q. Zero is isotropic. The D4 24-direction set is isotropic to order four
// (tiny anisotropy), while the cubic and hypercubic axis sets are anisotropic
// already at order four.
export function dispersionAxisDiagonalAnisotropy(input: {
  directions: number[][]
  dimension: number
  magnitude: number
}): number {
  const { directions, dimension, magnitude } = input
  const axis = new Array<number>(dimension).fill(0)
  axis[0] = magnitude

  const diagonal = new Array<number>(dimension).fill(
    magnitude / Math.sqrt(dimension),
  )

  const axisOmega =
    latticeDispersion({ directions, wave: axis }) / directions.length

  const diagonalOmega =
    latticeDispersion({ directions, wave: diagonal }) /
    directions.length

  return (
    Math.abs(axisOmega - diagonalOmega) /
    ((axisOmega + diagonalOmega) / 2)
  )
}

// The oscillation frequency omega(k) of a single Fourier mode of the second-order
// reversible wave on a 1D ring with nearest neighbours at +/-1. A plane wave
// e^{ikx} evolves under the linear recurrence q(t+1) = 2 cos(k) q(t) - q(t-1)
// (starting q(-1)=0, q(0)=1). The mode oscillates at a real frequency when its
// amplitude stays bounded; omega is read from the spacing between two consecutive
// zero crossings (a half period), so omega = pi / spacing. A bounded oscillation is
// a real frequency (a particle); unbounded growth is an imaginary frequency (a
// tachyon).
export function waveModeFrequency(input: {
  wavenumber: number
  maxBeats?: number
  boundedThreshold?: number
}): { omega: number; oscillates: boolean; bounded: boolean } {
  const k = input.wavenumber
  const maxBeats = input.maxBeats ?? 1500
  const boundedThreshold = input.boundedThreshold ?? 10
  const factor = 2 * Math.cos(k)

  let previous = 0 // q(t-1), starting q(-1)
  let current = 1 // q(t), starting q(0)

  const zeros: number[] = []

  let maxAbs = 1

  for (let t = 0; t < maxBeats && zeros.length < 2; t++) {
    const next = factor * current - previous // q(t+1)
    maxAbs = Math.max(maxAbs, Math.abs(next))

    if (current >= 0 !== next >= 0) {
      zeros.push(t + current / (current - next))
    } // interpolated zero in (t, t+1)

    previous = current
    current = next
  }

  const spacing = zeros.length >= 2 ? zeros[1]! - zeros[0]! : 0
  const omega = spacing > 0 ? Math.PI / spacing : 0

  return {
    omega,
    oscillates: zeros.length >= 2,
    bounded: maxAbs < boundedThreshold,
  }
}

// The leading order of the angular anisotropy in momentum: the log-log slope of the angular spread of the phase
// speed (over a probe set of directions) against the momentum scale. A higher order means the anisotropy is more
// strongly suppressed at small momentum. The D4 24-direction set comes out near order four, while a hypercubic
// set comes out near order two. This reads the emergent-Lorentz-violation scale off the substrate: a high order
// means violation is hidden to high energy. (The axis-versus-body-diagonal pair is exactly isotropic for D4 by a
// special symmetry, so the full angular spread, not that one pair, is needed to expose the residual order.)
export function anisotropySpreadOrder(input: {
  directions: number[][]
  probes: number[][]
  scales: readonly number[]
}): { order: number; spreads: number[] } {
  const spreads = input.scales.map(scale =>
    dispersionAnisotropyAtScale({
      directions: input.directions,
      probes: input.probes,
      scale,
    }),
  )

  const first = spreads[0]!
  const last = spreads[spreads.length - 1]!
  const sFirst = input.scales[0]!
  const sLast = input.scales[input.scales.length - 1]!

  const order =
    first > 0 && last > 0
      ? (Math.log(last) - Math.log(first)) /
        (Math.log(sLast) - Math.log(sFirst))
      : 0

  return { order, spreads }
}

// The isotropic discreteness signature: how the phase speed omega/|k| along one axis deviates from its
// infrared value as the momentum grows, and the leading order of that deviation. The continuum has a constant
// speed; a discrete lattice bends omega below c at high k, so the relative deviation rises with momentum. The
// deviation vanishes in the infrared (continuum restored) and its leading log-log order (about two, from the
// k^4 term in omega^2) plus its coefficient set the momentum scale where discreteness becomes visible.
export function dispersionSpeedDeviation(input: {
  directions: number[][]
  axis: number[]
  wavenumbers: readonly number[]
}): {
  deviations: number[]
  leadingOrder: number
  infraredSpeed: number
} {
  const speeds = input.wavenumbers.map(k => {
    const wave = input.axis.map(component => component * k)

    return (
      Math.sqrt(
        latticeDispersion({ directions: input.directions, wave }),
      ) / k
    )
  })

  const infraredSpeed = speeds[0]!
  const deviations = speeds.map(
    speed => Math.abs(infraredSpeed - speed) / infraredSpeed,
  )

  // fit the leading order from the upper part of the range (away from the noisy near-zero infrared point)
  const lo = Math.max(1, Math.floor(input.wavenumbers.length / 2))
  const hi = input.wavenumbers.length - 1
  const dLo = deviations[lo]!
  const dHi = deviations[hi]!
  const kLo = input.wavenumbers[lo]!
  const kHi = input.wavenumbers[hi]!

  const leadingOrder =
    dLo > 0 && dHi > 0
      ? (Math.log(dHi) - Math.log(dLo)) /
        (Math.log(kHi) - Math.log(kLo))
      : 0

  return { deviations, leadingOrder, infraredSpeed }
}

// Anisotropy of the lattice dispersion at a momentum scale: the relative spread
// (standard deviation over mean) of the phase speed omega(k) / |k| as the momentum
// direction sweeps the probe set, with |k| fixed at `scale`. Zero is perfectly
// isotropic. It falls toward zero as the scale goes to zero (continuous rotational
// symmetry restored in the infrared), faster for richer direction sets.
export function dispersionAnisotropyAtScale(input: {
  directions: number[][]
  probes: number[][]
  scale: number
}): number {
  const { directions, probes, scale } = input
  const speeds = probes.map(
    probe =>
      Math.sqrt(
        latticeDispersion({
          directions,
          wave: probe.map(v => v * scale),
        }),
      ) / scale,
  )

  const mean =
    speeds.reduce((sum, value) => sum + value, 0) / speeds.length

  const variance =
    speeds.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    speeds.length

  return Math.sqrt(variance) / mean
}
