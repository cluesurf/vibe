// The relaxation law of a conserved density, read off a run of a rule with nothing of the law put in.
//
// The start is a structured background, every slot of a periodic D4 mesh holding -1, 0 or +1 by a
// fixed hash of its index, with the three tones at fractions (1 - z) / 2, z, (1 - z) / 2, and a charge
// modulation laid over it: the +1 and -1 fractions tilted by +-contrast cos(2 pi n x / L). The charge
// mode is the complex Fourier amplitude of the net cell charge,
//
//   A_n(t) = sum over cells of q(cell, t) exp(-2 pi i n x / L).
//
// Background noise is cancelled by running the modulation and its mirror (contrast negated, the same
// hash) and halving the difference, so the series is the response to the modulation alone, with every
// even-order nonlinearity cancelled as well.
//
// The analysis reads two things off the normalized series a(t) = A_n(t) / A_n(0) without assuming a law.
// The SLOW part is the running mean over L beats, which removes any oscillation at a multiple of
// 2 pi / L exactly (free streaming at one cell per beat moves a mode of wavenumber 2 pi n / L at that
// frequency), and its decay rate is the slope of its logarithm. The FAST part is the remainder, whose
// frequency is the peak of its discrete spectrum and whose decay rate is the slope of the logarithm of
// its root-mean-square over successive windows of L beats. Every number is an exact function of the
// start and the rule.

import { Will, makeWill } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import { coordAlong } from '@/code/measure/hydrodynamics'
import { linearFit } from '@/code/measure/regression'

// A hash background with the charge modulated along `axis`: slot i is +1 when its hash falls below
// p+(x), -1 below p+(x) + p-(x), else 0, with p+- = (1 - z) / 2 (1 +- contrast cos(2 pi n x / L)).
export function modulatedChargeStart(input: {
  mesh: Mesh
  side: number
  axis: number
  mode: number
  contrast: number
  zeroFraction: number
  salt: number
}): Will {
  const { mesh, side, axis, mode, contrast, zeroFraction, salt } = input
  const will = makeWill(mesh)
  const charged = (1 - zeroFraction) / 2

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const tilt = contrast * Math.cos((2 * Math.PI * mode * coordAlong(cell, axis, side)) / side)
    const plus = charged * (1 + tilt)
    const minus = charged * (1 - tilt)

    for (let d = 0; d < mesh.degree; d++) {
      const i = cell * mesh.degree + d
      const r = hashRand(i, 0, salt)

      will.data[i] = r < plus ? 1 : r < plus + minus ? -1 : 0
    }
  }

  return will
}

// The complex Fourier amplitude of the net cell charge along `axis` at wavenumber 2 pi n / L.
export function chargeModeAmplitude(input: {
  will: Will
  side: number
  axis: number
  mode: number
}): { re: number; im: number } {
  const { will, side, axis, mode } = input
  const degree = will.mesh.degree
  const perSlab = new Float64Array(side)

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    let q = 0

    for (let d = 0; d < degree; d++) {
      q += will.data[cell * degree + d] ?? 0
    }

    const x = coordAlong(cell, axis, side)

    perSlab[x] = (perSlab[x] ?? 0) + q
  }

  let re = 0
  let im = 0

  for (let x = 0; x < side; x++) {
    const angle = (2 * Math.PI * mode * x) / side

    re += (perSlab[x] ?? 0) * Math.cos(angle)
    im -= (perSlab[x] ?? 0) * Math.sin(angle)
  }

  return { re, im }
}

export type ChargeModeRun = {
  // the response amplitude, the half-difference of the modulated and mirrored runs, divided by its value
  // at beat zero (which is real up to hash noise, so the real part carries the mode)
  readonly re: number[]
  readonly im: number[]
  // the largest change of the total charge between successive beats, over both runs
  readonly chargeDrift: number
  // the absolute amplitude at beat zero
  readonly initial: number
}

export function chargeModeRun(input: {
  mesh: Mesh
  side: number
  axis: number
  mode: number
  contrast: number
  zeroFraction: number
  salt: number
  beats: number
  schedule: (beatIndex: number) => Collision
}): ChargeModeRun {
  const { mesh, side, axis, mode, beats, schedule } = input
  const table = streamSourceTable(mesh)
  const runs = [1, -1].map(sign => ({
    current: modulatedChargeStart({ ...input, contrast: sign * input.contrast }),
    next: makeWill(mesh),
  }))
  const total = (will: Will): number => will.data.reduce((s, v) => s + v, 0)
  const charges = runs.map(run => total(run.current))
  const re: number[] = []
  const im: number[] = []

  let chargeDrift = 0
  let initial = 0

  for (let t = 0; t <= beats; t++) {
    const [a, b] = runs.map(run => chargeModeAmplitude({ will: run.current, side, axis, mode }))
    const r = ((a?.re ?? 0) - (b?.re ?? 0)) / 2
    const i = ((a?.im ?? 0) - (b?.im ?? 0)) / 2

    if (t === 0) {
      initial = r
    }

    re.push(r / initial)
    im.push(i / initial)

    if (t === beats) {
      break
    }

    runs.forEach((run, k) => {
      beatInto({ src: run.current, dst: run.next, table, collision: schedule(t) })
      ;[run.current, run.next] = [run.next, run.current]

      const q = total(run.current)

      chargeDrift = Math.max(chargeDrift, Math.abs(q - (charges[k] ?? 0)))
      charges[k] = q
    })
  }

  return { re, im, chargeDrift, initial }
}

export type ModeLaw = {
  // the running mean over `window` beats, one value per start beat 0..T - window
  readonly slow: number[]
  // the slow decay rate per beat (positive for decay) and the r2 and standard error of its fit
  readonly slowRate: number
  readonly slowRateError: number
  readonly slowR2: number
  // the slow part's level just after the first window, the fraction of the mode that is not oscillating
  readonly slowLevel: number
  // the fast part: its angular frequency (the spectral peak), its decay rate and that rate's error
  readonly fastFrequency: number
  readonly fastRate: number
  readonly fastRateError: number
  // root mean square of the fast part in the first and last windows
  readonly fastFirst: number
  readonly fastLast: number
}

// The standard error of a least-squares slope, from the residual scatter about the fitted line.
export function slopeError(xs: readonly number[], ys: readonly number[], slope: number, intercept: number): number {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0)
  const residual = xs.reduce((s, x, i) => s + ((ys[i] ?? 0) - (slope * x + intercept)) ** 2, 0)

  return n > 2 && sxx > 0 ? Math.sqrt(residual / (n - 2) / sxx) : Number.POSITIVE_INFINITY
}

// Split a normalized mode series into its slow and fast parts and fit both, over beats from `from` on.
export function modeLaw(input: { series: readonly number[]; window: number; from?: number }): ModeLaw {
  const { series, window } = input
  const from = input.from ?? window
  const slow: number[] = []

  for (let t = 0; t + window <= series.length; t++) {
    let sum = 0

    for (let s = t; s < t + window; s++) {
      sum += series[s] ?? 0
    }

    slow.push(sum / window)
  }

  // slow rate: log of the running mean against the window's centre, from `from` on
  const xs: number[] = []
  const ys: number[] = []

  for (let t = from; t < slow.length; t++) {
    const value = slow[t] ?? 0

    if (value > 0) {
      xs.push(t + (window - 1) / 2)
      ys.push(Math.log(value))
    }
  }

  const slowFit = linearFit({ xs, ys })

  // fast part: series minus the running mean centred on each beat
  const half = Math.floor(window / 2)
  const fast: number[] = []

  for (let t = half; t + window - half <= series.length; t++) {
    fast.push((series[t] ?? 0) - (slow[t - half] ?? 0))
  }

  // spectral peak of the fast part, scanned on a fine grid of angular frequencies in (0, pi]
  let fastFrequency = 0
  let best = -1

  for (let step = 1; step <= 2000; step++) {
    const omega = (Math.PI * step) / 2000

    let c = 0
    let s = 0

    fast.forEach((v, t) => {
      c += v * Math.cos(omega * t)
      s += v * Math.sin(omega * t)
    })

    const power = c * c + s * s

    if (power > best) {
      best = power
      fastFrequency = omega
    }
  }

  // fast envelope: root mean square in successive windows
  const wx: number[] = []
  const wy: number[] = []
  const rms: number[] = []

  for (let start = 0; start + window <= fast.length; start += window) {
    let sum = 0

    for (let t = start; t < start + window; t++) {
      sum += (fast[t] ?? 0) ** 2
    }

    const value = Math.sqrt(sum / window)

    rms.push(value)

    if (value > 0) {
      wx.push(start + (window - 1) / 2)
      wy.push(Math.log(value))
    }
  }

  const fastFit = linearFit({ xs: wx, ys: wy })

  return {
    slow,
    slowRate: -slowFit.slope,
    slowRateError: slopeError(xs, ys, slowFit.slope, slowFit.intercept),
    slowR2: slowFit.r2,
    slowLevel: slow[from] ?? 0,
    fastFrequency,
    fastRate: -fastFit.slope,
    fastRateError: slopeError(wx, wy, fastFit.slope, fastFit.intercept),
    fastFirst: rms[0] ?? 0,
    fastLast: rms[rms.length - 1] ?? 0,
  }
}
