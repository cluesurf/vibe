// A screen law the engine did not type in: the relaxation law of the committed rule's conserved charge,
// read off runs with nothing of the law put in. E-FND-0129 names the dispersion relation proper as the
// coarse-bridge deliverable. This measures it for the conserved density.
//
// First, which quantities the committed turning weave conserves exactly: the total charge (the sum of
// all tones) is checked at every beat of every run below, and two other candidates, the tone count and
// the momentum along x, are checked on a hash start and found not conserved (their largest drift is
// reported), so charge is the conserved density to modulate.
//
// The start is a hash background, the three tones at a third each, with the charge tilted by
// 0.3 cos(2 pi n x / L), and the response is the half-difference of the tilted and mirrored runs, so the
// background's own noise cancels (code/measure/charge-mode). The normalized Fourier amplitude a(t) is
// split without assuming a law: its running mean over L beats (which removes any oscillation at a
// multiple of 2 pi / L exactly) is the slow part, whose logarithmic slope is the relaxation rate
// Gamma(k), and the remainder is the fast part, whose spectral peak is its frequency omega(k). Modes
// n = 1 to 4 on a side-9 mesh and n = 1 on a side-11 mesh, over 216 beats (nine schedule periods),
// give five wavenumbers from 0.57 to 2.79. The exponent p of Gamma = Gamma0 k^p says the law: 2 for
// diffusion, 1 for a ballistic front, 0 for a relaxation that does not depend on wavelength.
//
// Control: pure streaming moves each tone one cell per beat along its root, so the mode splits into a
// static half and a half oscillating at omega = k, and nothing relaxes: Gamma = 0 exactly. The
// committed rule has to differ from that to have any law of its own.
//
// Deterministic throughout: the background is a fixed hash of the slot index, and every run is exact.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import {
  Collision,
  passThrough,
  turningWeave,
} from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { makeWill } from '@/code/tone/will'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  chargeModeRun,
  modeLaw,
  modulatedChargeStart,
  slopeError,
} from '@/code/measure/charge-mode'
import { linearFit } from '@/code/measure/regression'

const BEATS = 216
const CONTRAST = 0.3
const THIRD = 1 / 3
const SALT = 11

function measure(input: {
  side: number
  mode: number
  schedule: (beatIndex: number) => Collision
}) {
  const { side, mode, schedule } = input
  const run = chargeModeRun({
    mesh: d4Mesh({ side }),
    side,
    axis: 0,
    mode,
    contrast: CONTRAST,
    zeroFraction: THIRD,
    salt: SALT,
    beats: BEATS,
    schedule,
  })
  const law = modeLaw({ series: run.re, window: side })

  return { side, mode, k: (2 * Math.PI * mode) / side, run, law }
}

// the largest drift of the tone count and of the x momentum over two schedule periods
function candidateDrifts(side: number): {
  toneCount: number
  momentumX: number
} {
  const mesh = d4Mesh({ side })
  const rule = turningWeave({ opposite: meshOpposites(mesh) })
  const table = streamSourceTable(mesh)
  const roots = rootsD4()

  let current = modulatedChargeStart({
    mesh,
    side,
    axis: 0,
    mode: 1,
    contrast: CONTRAST,
    zeroFraction: THIRD,
    salt: SALT,
  })
  let next = makeWill(mesh)

  const tally = (): [number, number] => {
    let count = 0
    let momentum = 0

    for (let i = 0; i < current.data.length; i++) {
      const tone = current.data[i] ?? 0

      count += tone === 0 ? 0 : 1
      momentum += tone * (roots[i % 24]?.[0] ?? 0)
    }

    return [count, momentum]
  }

  const [count0, momentum0] = tally()

  let toneCount = 0
  let momentumX = 0

  for (let t = 0; t < 48; t++) {
    beatInto({ src: current, dst: next, table, collision: rule(t) })
    ;[current, next] = [next, current]

    const [count, momentum] = tally()

    toneCount = Math.max(toneCount, Math.abs(count - count0))
    momentumX = Math.max(momentumX, Math.abs(momentum - momentum0))
  }

  return { toneCount, momentumX }
}

export default experiment({
  id: 'fluids/charge-mode-law',
  code: 'E-FLD-0020',
  title:
    'the committed rule conserves charge exactly and its long-wavelength charge modes obey a law nothing typed in: the propagating half moves at exactly one cell per beat (omega = k) and the mode relaxes at a rate that does not depend on wavelength (Gamma about 0.0015 per beat, exponent near 0 over k = 0.57 to 2.79 at two sizes), neither diffusive (2) nor a damped front (1), a nearly collisionless gas whose diffusive regime lies beyond every mesh run here, while pure streaming relaxes nothing',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const rule9 = turningWeave({
      opposite: meshOpposites(d4Mesh({ side: 9 })),
    })
    const rule11 = turningWeave({
      opposite: meshOpposites(d4Mesh({ side: 11 })),
    })
    const committed = [
      ...[1, 2, 3, 4].map(mode =>
        measure({ side: 9, mode, schedule: rule9 }),
      ),
      measure({ side: 11, mode: 1, schedule: rule11 }),
    ]
    const streaming = [1, 2].map(mode =>
      measure({ side: 9, mode, schedule: () => passThrough }),
    )
    const drifts = candidateDrifts(9)

    const xs = committed.map(m => Math.log(m.k))
    const ys = committed.map(m => Math.log(m.law.slowRate))
    const fit = linearFit({ xs, ys })
    const exponentError = slopeError(xs, ys, fit.slope, fit.intercept)
    const rates = committed.map(m => m.law.slowRate)
    const rateMean = rates.reduce((s, v) => s + v, 0) / rates.length
    const rateSpread = Math.sqrt(
      rates.reduce((s, v) => s + (v - rateMean) ** 2, 0) /
        (rates.length - 1),
    )
    const speedError = Math.max(
      ...committed.map(m => Math.abs(m.law.fastFrequency / m.k - 1)),
    )
    const fastRates = committed.map(m => m.law.fastRate)
    const chargeExact = [...committed, ...streaming].every(
      m => m.run.chargeDrift === 0,
    )

    const streamingSilent = streaming.every(
      m =>
        Math.abs(m.law.slowRate) < 1e-9 &&
        Math.abs(m.law.fastRate) < 1e-6 &&
        Math.abs(m.law.fastFrequency / m.k - 1) < 0.005,
    )
    const relaxes = committed.every(
      m => m.law.slowRate > 1e-4 && m.law.slowR2 > 0.95,
    )
    const flat = Math.abs(fit.slope) < 0.5
    const notDiffusive = 2 - fit.slope > 5 * exponentError
    const notBallistic = 1 - fit.slope > 5 * exponentError
    const lightSpeed = speedError < 0.005
    const ok =
      chargeExact &&
      drifts.toneCount > 0 &&
      drifts.momentumX > 0 &&
      streamingSilent &&
      relaxes &&
      flat &&
      notDiffusive &&
      notBallistic &&
      lightSpeed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'charge is conserved exactly at every beat while tone count and x momentum are not, and the charge mode of the committed rule has a propagating part at omega = k to within 0.5 percent and a slow part relaxing at a rate independent of wavelength, the fitted exponent of Gamma against k far from both 2 and 1, where pure streaming relaxes nothing',
      metrics: {
        exponent: fit.slope,
        exponentError,
        rateMean,
        rateSpread,
        meanFreeTime: 1 / rateMean,
        rateK057: committed[4]?.law.slowRate ?? 0,
        rateK070: committed[0]?.law.slowRate ?? 0,
        rateK140: committed[1]?.law.slowRate ?? 0,
        rateK209: committed[2]?.law.slowRate ?? 0,
        rateK279: committed[3]?.law.slowRate ?? 0,
        smallestRateR2: Math.min(...committed.map(m => m.law.slowR2)),
        slowLevelK070: committed[0]?.law.slowLevel ?? 0,
        largestSpeedError: speedError,
        fastRateSmallest: Math.min(...fastRates),
        fastRateLargest: Math.max(...fastRates),
        toneCountDrift: drifts.toneCount,
        momentumXDrift: drifts.momentumX,
      },
      control: {
        streamingSlowRateLargest: Math.max(
          ...streaming.map(m => Math.abs(m.law.slowRate)),
        ),
        streamingFastRateLargest: Math.max(
          ...streaming.map(m => Math.abs(m.law.fastRate)),
        ),
        streamingSlowLevel: streaming[0]?.law.slowLevel ?? 0,
        streamingSpeedError: Math.max(
          ...streaming.map(m =>
            Math.abs(m.law.fastFrequency / m.k - 1),
          ),
        ),
      },
      notes:
        'L3: the committed rule runs through beat, and the law is read off the runs by a split (running mean over L beats, spectral peak of the rest) that assumes no form, with pure streaming as the control that relaxes nothing. The measured law is kinetic, not hydrodynamic: about half the mode (0.48 of it, against 0.50 under streaming) oscillates at omega = k, the speed of light to the resolution of the frequency scan (a grid step of 0.0016), and the mode relaxes at the same rate at every wavenumber, which is what a gas does when its mean free path is longer than the wavelength. A two-state reading (static charge released at rate Gamma into movers at speed one) puts the diffusive regime at k well below Gamma, wavelengths of thousands of cells, beyond any mesh run here, so this does not show diffusion and does not rule it out at scales not reached. The rate spread across the five wavenumbers (about ten percent) is systematic, not noise, and the exponent error is from that scatter. This fills the dispersion relation E-FND-0129 names for the conserved density only, not species by species. Under the previous committed pair table the charge wave recurred instead (E-FLD-0002). One background density (a third of each tone) is gated here: the design runs at 0.6 zeros gave the same k-independent picture at rates about 0.002, and at 0.85 zeros the fits were noisier.',
    })
  },
})
