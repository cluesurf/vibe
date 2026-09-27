// The Lorentz force and cyclotron motion on the husk. The knit's classical vibes carry no phase, so a
// magnetic field cannot turn them (E-FRC-0173). The fear walk's weights do carry one: Eisenstein integers,
// role-phased counts of take, hold and free (E-QTM-0107), and a crossing multiplies them by the link's
// phase. So the fear walk is built as a charge moving in a husk plane (code/measure/charged-walk): each beat
// a sequence of substeps, each the fear walk's coin and a stream along one husk axis, picking up e^(i q theta)
// on every link crossed. The field is the husk's: theta is a husk link's projected angle, 2 pi A / N
// (E-FRC-0168, where any husk gauge field is written onto the sheet links of the bulk). The husk plane here is
// a 64 x 64 torus, larger than any bulk box that can be run, so the field is written on the plane directly.
//
// The order of the substeps decides the physics, and it was fixed from the free symbol before any run
// (tmp/walk-probe.ts, linear algebra only). The band through quasi-energy 0 at k = 0 bends as
// phase = (k Q k) / 2:
// - 'xy' (coin, x, coin, y): Q has eigenvalues 1.732 and -0.577, a saddle. A saddle has open orbits and no
//   cyclotron motion near the band bottom, so it is not the charge used here
// - 'xyyx', the palindrome: Q has eigenvalues -1.155 and -3.464 with axes on the diagonals, a bowl, and a
//   charge in a field B circles at omega_c = q B sqrt(det Q) = 2 q B per beat, with Landau levels spaced by
//   omega_c. The one-dimensional walk's rest mass sqrt 3 (E-CMP-0017) is per step: two steps per axis per beat
//   give sqrt 3 / 2 along one diagonal, and the stream order makes the other diagonal 3 times stiffer
//
// Gates, fixed before the run. The palindrome, a 64 x 64 torus, 40 flux quanta (B = 2 pi 40 / 64^2 =
// 0.0614 per plaquette, a magnetic length of 4.0), a Gaussian packet of width 4 on the band through 0 with
// wave vector (0.3, 0), 205 beats (four predicted periods):
// 1. the exact carrier: on a 6 x 6 torus with 2 pi / 3 per plaquette the Eisenstein walk equals the float walk
//    times 2^(substeps) to 1e-9 over 6 beats, for charge 1 and 2
// 2. the sideways deflection: after 13 beats (a quarter of the predicted period) the velocity has turned by
//    more than 0.5 rad, by the same amount the other way when B is reversed (within 1 percent), and by under
//    0.01 rad with no field
// 3. cyclotron motion: the velocity turns at a mean rate within 5 percent of 2 q B, for q = 1 and for q = 2
//    (twice the rate), and with B reversed the same rate the other way (within 1 percent)
// 4. Landau levels: the spectrum of the packet's return amplitude over 2,048 beats has at least 3 peaks within
//    0.6 below 0, spaced by 2 q B within 5 percent, the highest of them within 10 percent of omega_c / 2
//    below 0 (the zero-point offset)
// And the 'xy' walk under the same field is reported: its velocity turn rate, which a saddle need not make.
//
// Depth L2: the Peierls phase on a quantum walk is a known construction (Landau levels of discrete-time walks
// are published). What is measured is the fear walk's own orbit, against its own symbol.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  ALTERNATE,
  bandCurvature,
  centroid,
  chargedBeat,
  copyWalk,
  emptyWalk,
  exactChargedBeat,
  overlapOf,
  packet,
  PALINDROME,
  uniformField,
  type ExactSlots,
  type Field,
  type Order,
} from '@/code/measure/charged-walk'
import { ZERO, type Eisenstein } from '@/code/rule/fear-walk'

const SIDE = 64
const QUANTA = 40
const SIGMA = 4
const K0 = 0.3
const BEATS = 205
const QUARTER = 13
const SPECTRUM_BEATS = 2048

const fieldB = (quanta: number): number => (2 * Math.PI * quanta) / (SIDE * SIDE)

function exactCheck(charge: number): number {
  const side = 6
  const field = uniformField(side, 12)
  const kx = Int32Array.from(field.thetaX, t => Math.round((3 * t) / (2 * Math.PI)))
  const ky = Int32Array.from(field.thetaY, t => Math.round((3 * t) / (2 * Math.PI)))
  const n = side * side

  let exact: ExactSlots = [Array.from({ length: n }, (_, i) => (i === 0 ? ([1n, 0n] as Eisenstein) : ZERO)), Array.from({ length: n }, () => ZERO)]
  const float = emptyWalk(side)

  float.re[0][0] = 1

  let worst = 0
  let substeps = 0

  for (let t = 0; t < 6; t++) {
    exact = exactChargedBeat(side, exact, kx, ky, charge, PALINDROME)
    chargedBeat(float, field, charge, PALINDROME)
    substeps += PALINDROME.length

    const scale = 2 ** substeps
    let top = 0
    let err = 0

    for (const s of [0, 1] as const) {
      for (let i = 0; i < n; i++) {
        const [m, k] = exact[s][i] ?? ZERO
        // m + k omega = (m - k / 2) + i k sqrt(3) / 2
        const re = Number(m) - Number(k) / 2
        const im = (Number(k) * Math.sqrt(3)) / 2

        top = Math.max(top, Math.hypot(re, im))
        err = Math.max(err, Math.hypot((float.re[s][i] ?? 0) * scale - re, (float.im[s][i] ?? 0) * scale - im))
      }
    }

    worst = Math.max(worst, err / top)
  }

  return worst
}

// the unwrapped angle of the centroid's velocity, beat by beat
function turning(field: Field, charge: number, order: Order, beats: number): number[] {
  const w = packet({ side: SIDE, x0: 0, y0: SIDE / 2, sigma: SIGMA, kx: K0, ky: 0, target: 0, order })
  const angles: number[] = []

  let previous = centroid(w, SIDE)
  let last = Number.NaN

  for (let t = 0; t < beats; t++) {
    chargedBeat(w, field, charge, order)

    const now = centroid(w, SIDE)
    const d = [0, 1].map(i => ((((now[i] ?? 0) - (previous[i] ?? 0) + SIDE * 1.5) % SIDE) - SIDE / 2))
    const angle = Math.atan2(d[1] ?? 0, d[0] ?? 0)
    const unwrapped = Number.isNaN(last) ? angle : last + ((((angle - last + 3 * Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI

    angles.push(unwrapped)
    last = unwrapped
    previous = now
  }

  return angles
}

// the mean turning rate over whole beats 1 .. end, by a least-squares line
function rate(angles: readonly number[]): number {
  const n = angles.length
  const ts = angles.map((_, i) => i)
  const mt = ts.reduce((a, b) => a + b, 0) / n
  const ma = angles.reduce((a, b) => a + b, 0) / n

  return ts.reduce((s, t, i) => s + (t - mt) * ((angles[i] ?? 0) - ma), 0) / ts.reduce((s, t) => s + (t - mt) ** 2, 0)
}

// peaks of |sum_t C(t) e^(i w t) hann(t)|^2 over w in [-0.6, 0.05]
function spectrumPeaks(field: Field, charge: number): number[] {
  const start = packet({ side: SIDE, x0: 0, y0: SIDE / 2, sigma: SIGMA, kx: K0, ky: 0, target: 0, order: PALINDROME })
  const w = copyWalk(start)
  const series: [number, number][] = [[1, 0]]

  for (let t = 1; t < SPECTRUM_BEATS; t++) {
    chargedBeat(w, field, charge, PALINDROME)
    series.push(overlapOf(start, w))
  }

  const grid: number[] = []
  const power: number[] = []

  for (let omega = -0.6; omega <= 0.05; omega += 0.0005) {
    let re = 0
    let im = 0

    series.forEach(([cr, ci], t) => {
      const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / (SPECTRUM_BEATS - 1))
      // C(t) = <start | U^t start> ~ e^(i phase t); multiply by e^(-i omega t)
      const c = Math.cos(omega * t)
      const s = Math.sin(omega * t)

      re += hann * (cr * c + ci * s)
      im += hann * (ci * c - cr * s)
    })

    grid.push(omega)
    power.push(re * re + im * im)
  }

  const top = Math.max(...power)

  return grid.filter((_, i) => (power[i] ?? 0) > 0.02 * top && (power[i] ?? 0) >= (power[i - 1] ?? 0) && (power[i] ?? 0) >= (power[i + 1] ?? 0))
}

export default experiment({
  id: 'gauge/husk-cyclotron',
  code: 'E-FRC-0176',
  title:
    'the Lorentz force and cyclotron motion on the husk: the fear walk as a charge in a husk plane, its Eisenstein weights turned by the link phase on every crossing, deflects sideways in a uniform field, circles at the cyclotron frequency its own symbol predicts, 2 q B per beat for the palindromic walk, and shows Landau levels spaced by it, while the plain alternate walk sits on a saddle',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const b = fieldB(QUANTA)
    const up = uniformField(SIDE, QUANTA)
    const down = uniformField(SIDE, -QUANTA)
    const none = uniformField(SIDE, 0)
    const bowl = bandCurvature(PALINDROME)
    const saddle = bandCurvature(ALTERNATE)
    const predicted = b * Math.sqrt(bowl.eigen[0] * bowl.eigen[1])
    const exact1 = exactCheck(1)
    const exact2 = exactCheck(2)
    const upAngles = turning(up, 1, PALINDROME, BEATS)
    const downAngles = turning(down, 1, PALINDROME, BEATS)
    const noneAngles = turning(none, 1, PALINDROME, BEATS)
    const twoAngles = turning(up, 2, PALINDROME, BEATS)
    const xyAngles = turning(up, 1, ALTERNATE, BEATS)
    const quarter = (a: number[]): number => (a[QUARTER] ?? 0) - (a[0] ?? 0)
    const upRate = rate(upAngles)
    const downRate = rate(downAngles)
    const twoRate = rate(twoAngles)
    const peaks = spectrumPeaks(up, 1).sort((x, y) => y - x)
    const spacings = peaks.slice(1).map((p, i) => (peaks[i] ?? 0) - p)
    const levels = spacings.slice(0, 3)

    const ok =
      exact1 < 1e-9 &&
      exact2 < 1e-9 &&
      Math.abs(quarter(upAngles)) > 0.5 &&
      Math.abs(quarter(upAngles) + quarter(downAngles)) < 0.01 * Math.abs(quarter(upAngles)) &&
      Math.abs(quarter(noneAngles)) < 0.01 &&
      Math.abs(Math.abs(upRate) / predicted - 1) < 0.05 &&
      Math.abs(Math.abs(twoRate) / (2 * predicted) - 1) < 0.05 &&
      Math.abs(upRate + downRate) < 0.01 * Math.abs(upRate) &&
      peaks.length >= 3 &&
      levels.every(s => Math.abs(s / predicted - 1) < 0.05) &&
      Math.abs(-(peaks[0] ?? 0) / (predicted / 2) - 1) < 0.1

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the palindromic fear walk carries its Eisenstein weights exactly through the link phases, turns sideways in a uniform husk field and the other way when it is reversed, circles at 2 q B per beat within 5 percent, twice as fast at charge 2, and its return spectrum shows Landau levels spaced by that cyclotron frequency with the zero-point offset',
      metrics: {
        field: b,
        palindromeCurvature1: bowl.eigen[0],
        palindromeCurvature2: bowl.eigen[1],
        alternateCurvature1: saddle.eigen[0],
        alternateCurvature2: saddle.eigen[1],
        predictedCyclotron: predicted,
        exactCarrierErrorCharge1: exact1,
        exactCarrierErrorCharge2: exact2,
        quarterTurnB: quarter(upAngles),
        quarterTurnMinusB: quarter(downAngles),
        quarterTurnNoField: quarter(noneAngles),
        turnRateB: upRate,
        turnRateMinusB: downRate,
        turnRateCharge2: twoRate,
        turnRateOverPredicted: Math.abs(upRate) / predicted,
        turnRateCharge2OverPredicted: Math.abs(twoRate) / (2 * predicted),
        turnRateNoField: rate(noneAngles),
        alternateWalkTurnRate: rate(xyAngles),
        landauPeaks: peaks.length,
        landauLevel0: peaks[0] ?? Number.NaN,
        landauLevel1: peaks[1] ?? Number.NaN,
        landauLevel2: peaks[2] ?? Number.NaN,
        landauLevel3: peaks[3] ?? Number.NaN,
        landauSpacing01OverPredicted: (spacings[0] ?? 0) / predicted,
        landauSpacing12OverPredicted: (spacings[1] ?? 0) / predicted,
        landauSpacing23OverPredicted: (spacings[2] ?? 0) / predicted,
        landauZeroPointOverHalf: -(peaks[0] ?? 0) / (predicted / 2),
        restMassOneDimension: Math.sqrt(3),
      },
      control: {
        quarterTurnNoField: quarter(noneAngles),
        alternateWalkTurnRate: rate(xyAngles),
      },
      notes:
        'L2. First run, 2026-09-25, failed on a construction error, not the physics: the packet sat at x = 32, where the Landau gauge has A_y = 32 B = 1.96 rad, so its kinetic momentum was (0.3, -1.96), far from the band bottom, and the other sign of B put it at +1.96. It read turn rates 1.50 and 0.20 of the prediction for +B and -B and Landau spacings 0.77 to 0.67 of it. The packet now sits at x = 0, where A = 0, and the gates are as they were. Second run: still fail. The carrier is exact (6e-15), the zero-point offset is 0.953 of omega_c / 2, and 4 Landau levels appear, but their spacings are 0.909, 0.835, 0.770 of 2 q B (the band is not a parabola past its bottom), the velocity turns at 0.76 of the prediction for +B and 0.85 for -B, and the charge-2 turn rate reads 0.20 of twice it, where a turn of about 1.2 rad per beat defeats the per-beat velocity angle. A post-hoc probe (tmp/cyclotron-probe.ts, not a gate) finds the lowest spacing at 0.909, 0.953, 0.977 of 2 q B at 40, 20, 10 flux quanta, a shortfall falling in proportion to B, and identical spectra for +B and -B.The charge is the fear walk, not a knit vibe: the knit carries no phase on its vibes, so this is the coupling a phase-carrying charge would have. The float walk carries the long runs and the exact Eisenstein walk is checked against it where the field is in thirds. The field is written on the husk plane directly, a 64 x 64 torus, and not through a bulk run.',
    })
  },
})
