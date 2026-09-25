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
// Added 2026-09-25, because the first version gated one background density and left a systematic-looking
// ten percent spread across its five rates unexplained:
//
// DENSITIES. The same five wavenumbers at zero fractions 0.2, 1/3, 0.5 and 0.6, each gated with the same
// exponent, speed and rate thresholds as the committed density, fixed before the gated run. The r2 floor
// of the single-exponential fit is 0.95 at 1/3 as before and 0.9 at the added densities, because the
// design runs showed the relaxation is not a pure exponential (the early half of a run relaxes faster
// than the late half at every density), which caps r2 by curvature, not by noise.
//
// THE SPREAD, each explanation tested alone at the committed density:
// - the one background sample: salts 12 and 13 beside 11 at the four side-9 wavenumbers. If the spread
//   is sampling, the scatter between salts at a fixed k matches it and the salt-averaged rates are flat;
// - the fitting window: the same series read with a 3L running mean, and in halves;
// - finite size: sides 6, 7, 8 and 10 beside 9 and 11. A trend of rate with 1 / L among the sides that do
//   not divide the 24-beat schedule period would be finite size of the kind that could reach the five;
// - anisotropy: the side-9 modes along axes 1, 2 and 3 instead of 0.
//
// Measured: the law holds at all four densities, the rate rising with the empty fraction (0.00113 to
// 0.00223). The spread is the one background's sampling scatter, not the window and not a 1 / L effect.
// Two things the first version did not know: sides that divide the schedule period (6, 8) relax about
// 30 percent more slowly, and the rule is strongly anisotropic (axis 1 relaxes 1.8 times faster than
// axis 0, and along axes 2 and 3 the fast part does not sit at omega = k).
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

// the background densities gated (zero fractions), fixed before the gated run
const DENSITIES = [0.2, THIRD, 0.5, 0.6]
// the r2 floor of the single-exponential fit at the added densities, fixed before the gated run. The
// committed density keeps its 0.95. The design runs showed the relaxation is not a pure exponential
// (the rate over the first half of the run exceeds the rate over the second by up to 40 percent at
// every density), which bounds r2 below one by curvature rather than noise.
const R2_FLOOR_ADDED = 0.9

const rules = new Map<number, (beatIndex: number) => Collision>()

function committedRule(side: number): (beatIndex: number) => Collision {
  const known = rules.get(side)

  if (known !== undefined) {
    return known
  }

  const rule = turningWeave({ opposite: meshOpposites(d4Mesh({ side })) })

  rules.set(side, rule)

  return rule
}

function measure(input: {
  side: number
  mode: number
  schedule: (beatIndex: number) => Collision
  zeroFraction?: number
  salt?: number
  axis?: number
}) {
  const { side, mode, schedule } = input
  const zeroFraction = input.zeroFraction ?? THIRD
  const run = chargeModeRun({
    mesh: d4Mesh({ side }),
    side,
    axis: input.axis ?? 0,
    mode,
    contrast: CONTRAST,
    zeroFraction,
    salt: input.salt ?? SALT,
    beats: BEATS,
    schedule,
  })
  const law = modeLaw({ series: run.re, window: side })
  // the fitting-window explanation: the same series read with a running mean over 3L beats (which also
  // removes every streaming oscillation exactly), and over the first and second halves of the run alone
  const wide = modeLaw({ series: run.re, window: 3 * side })
  const early = modeLaw({
    series: run.re.slice(0, BEATS / 2 + 1),
    window: side,
  })
  const late = modeLaw({
    series: run.re.slice(BEATS / 2),
    window: side,
    from: 0,
  })

  return {
    side,
    mode,
    zeroFraction,
    k: (2 * Math.PI * mode) / side,
    run,
    law,
    wideRate: wide.slowRate,
    earlyRate: early.slowRate,
    lateRate: late.slowRate,
  }
}

const average = (xs: readonly number[]): number =>
  xs.reduce((s, v) => s + v, 0) / xs.length

// the sample standard deviation over the mean
function relativeSpread(xs: readonly number[]): number {
  const m = average(xs)

  return (
    Math.sqrt(
      xs.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, xs.length - 1),
    ) / m
  )
}

// the k law at one density: five wavenumbers, sides 9 (n = 1 to 4) and 11 (n = 1)
function densityLaw(zeroFraction: number) {
  const committed = [
    ...[1, 2, 3, 4].map(mode =>
      measure({ side: 9, mode, schedule: committedRule(9), zeroFraction }),
    ),
    measure({ side: 11, mode: 1, schedule: committedRule(11), zeroFraction }),
  ]
  const xs = committed.map(m => Math.log(m.k))
  const ys = committed.map(m => Math.log(m.law.slowRate))
  const fit = linearFit({ xs, ys })
  const exponentError = slopeError(xs, ys, fit.slope, fit.intercept)
  const rates = committed.map(m => m.law.slowRate)

  return {
    zeroFraction,
    committed,
    exponent: fit.slope,
    exponentError,
    rates,
    rateMean: average(rates),
    rateRelativeSpread: relativeSpread(rates),
    speedError: Math.max(
      ...committed.map(m => Math.abs(m.law.fastFrequency / m.k - 1)),
    ),
    smallestR2: Math.min(...committed.map(m => m.law.slowR2)),
    chargeExact: committed.every(m => m.run.chargeDrift === 0),
  }
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
    'the committed rule conserves charge exactly and its long-wavelength charge modes obey a law nothing typed in: the propagating half moves at exactly one cell per beat (omega = k) and the mode relaxes at a rate that does not depend on wavelength (Gamma about 0.0015 per beat, exponent near 0 over k = 0.57 to 2.79 at two sizes), neither diffusive (2) nor a damped front (1), at each of four background densities (Gamma 0.0011 to 0.0022 rising with the empty fraction), a nearly collisionless gas whose diffusive regime lies beyond every mesh run here, while pure streaming relaxes nothing. The rate spread across k is the sampling scatter of one background, and the rate depends on direction (1.8 times faster along axis 1 than axis 0)',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const laws = DENSITIES.map(densityLaw)
    const main = laws[DENSITIES.indexOf(THIRD)]!
    const committed = main.committed
    const streaming = [1, 2].map(mode =>
      measure({ side: 9, mode, schedule: () => passThrough }),
    )
    const drifts = candidateDrifts(9)

    const fit = { slope: main.exponent }
    const exponentError = main.exponentError
    const rates = main.rates
    const rateMean = main.rateMean
    const rateSpread = main.rateRelativeSpread * rateMean
    const speedError = main.speedError
    const fastRates = committed.map(m => m.law.fastRate)
    const chargeExact =
      laws.every(law => law.chargeExact) &&
      streaming.every(m => m.run.chargeDrift === 0)

    const streamingSilent = streaming.every(
      m =>
        Math.abs(m.law.slowRate) < 1e-9 &&
        Math.abs(m.law.fastRate) < 1e-6 &&
        Math.abs(m.law.fastFrequency / m.k - 1) < 0.005,
    )
    // the committed density keeps its gates exactly as they were
    const relaxes = committed.every(
      m => m.law.slowRate > 1e-4 && m.law.slowR2 > 0.95,
    )
    const flat = Math.abs(fit.slope) < 0.5
    const notDiffusive = 2 - fit.slope > 5 * exponentError
    const notBallistic = 1 - fit.slope > 5 * exponentError
    const lightSpeed = speedError < 0.005
    // every added density: the same exponent, speed and rate gates, with the r2 floor above
    const acrossDensities = laws.every(
      law =>
        law.committed.every(
          m =>
            m.law.slowRate > 1e-4 &&
            m.law.slowR2 >
              (law.zeroFraction === THIRD ? 0.95 : R2_FLOOR_ADDED),
        ) &&
        Math.abs(law.exponent) < 0.5 &&
        2 - law.exponent > 5 * law.exponentError &&
        1 - law.exponent > 5 * law.exponentError &&
        law.speedError < 0.005,
    )

    // WHERE THE SPREAD COMES FROM, each explanation tested alone at the committed density.
    // (1) the one background sample: salts 12 and 13 beside salt 11, at the four side-9 wavenumbers
    const salts = [SALT, 12, 13]
    const bySalt = salts.map(salt =>
      [1, 2, 3, 4].map(mode =>
        salt === SALT
          ? committed[mode - 1]!
          : measure({ side: 9, mode, schedule: committedRule(9), salt }),
      ),
    )
    const saltRates = bySalt.map(row => row.map(m => m.law.slowRate))
    const acrossKOneSalt = relativeSpread(saltRates[0]!)
    // scatter between salts at a fixed k, pooled over the four k
    const betweenSalts = Math.sqrt(
      average(
        [0, 1, 2, 3].map(i =>
          relativeSpread(saltRates.map(row => row[i]!)) ** 2,
        ),
      ),
    )
    const saltMeans = [0, 1, 2, 3].map(i =>
      average(saltRates.map(row => row[i]!)),
    )
    const acrossKSaltMean = relativeSpread(saltMeans)
    const meanFit = linearFit({
      xs: bySalt[0]!.map(m => Math.log(m.k)),
      ys: saltMeans.map(Math.log),
    })
    // sampling explains the spread when the salt scatter at fixed k is at least half the across-k
    // spread, and the across-k spread of the salt means is what that scatter alone leaves (within twice
    // its expected size, scatter / sqrt(salts))
    const samplingExplains =
      betweenSalts >= acrossKOneSalt / 2 &&
      acrossKSaltMean < (2 * betweenSalts) / Math.sqrt(salts.length)

    // (2) the fitting window: the same five series read with a 3L running mean, and in halves
    const windowShift = committed.map(m => m.wideRate / m.law.slowRate - 1)
    const windowPattern = relativeSpread(committed.map(m => m.wideRate))
    const halves = committed.map(m => m.earlyRate / m.lateRate)
    // the window explains the spread only if changing it changes the spread: the 3L reading leaves an
    // across-k spread within a fifth of the L reading's
    const windowExplains =
      Math.abs(windowPattern / main.rateRelativeSpread - 1) > 0.2

    // (3) finite size: sides 6, 7, 8 and 10 beside 9 and 11, n = 1 and 2 (n = 1 alone at 10). Sides 6 and 8
    // divide the 24-beat schedule period, so a tone streaming round the mesh returns at the same schedule
    // phase; 7, 9, 10 and 11 do not.
    const sized = [
      ...[6, 7, 8].flatMap(side =>
        [1, 2].map(mode =>
          measure({ side, mode, schedule: committedRule(side) }),
        ),
      ),
      measure({ side: 10, mode: 1, schedule: committedRule(10) }),
    ]
    const commensurate = sized.filter(m => 24 % m.side === 0)
    const incommensurate = [
      ...sized.filter(m => 24 % m.side !== 0),
      ...committed,
    ]
    const commensurateMean = average(commensurate.map(m => m.law.slowRate))
    const incommensurateMean = average(
      incommensurate.map(m => m.law.slowRate),
    )
    const incommensurateSpread = relativeSpread(
      incommensurate.map(m => m.law.slowRate),
    )
    // finite size explains the five-rate spread only if, at the sides that share its geometry (none
    // divides 24), the rate trends with 1 / L: a least-squares slope of rate against 1 / L more than three
    // standard errors from zero
    const sizeXs = incommensurate.map(m => 1 / m.side)
    const sizeYs = incommensurate.map(m => m.law.slowRate)
    const sizeFit = linearFit({ xs: sizeXs, ys: sizeYs })
    const sizeSlopeError = slopeError(
      sizeXs,
      sizeYs,
      sizeFit.slope,
      sizeFit.intercept,
    )
    const finiteSizeExplains =
      Math.abs(sizeFit.slope) > 3 * sizeSlopeError

    // (4) anisotropy: the same side-9 modes along axes 1, 2 and 3 (n = 1 to 4 on axis 1, n = 1 on 2 and 3)
    const turned = [
      ...[1, 2, 3, 4].map(mode =>
        measure({ side: 9, mode, schedule: committedRule(9), axis: 1 }),
      ),
      measure({ side: 9, mode: 1, schedule: committedRule(9), axis: 2 }),
      measure({ side: 9, mode: 1, schedule: committedRule(9), axis: 3 }),
    ]
    const axisOneRates = turned.slice(0, 4).map(m => m.law.slowRate)
    const axisRatio = average(axisOneRates) / average(saltRates[0]!)
    const axisOneSpread = relativeSpread(axisOneRates)
    const axisOneFit = linearFit({
      xs: turned.slice(0, 4).map(m => Math.log(m.k)),
      ys: axisOneRates.map(Math.log),
    })
    // anisotropy is real if another axis differs from axis 0 by more than three salt scatters. It cannot
    // be the source of the five-rate spread, which is measured along one axis only.
    const anisotropic = Math.abs(axisRatio - 1) > 3 * betweenSalts

    const spreadSource =
      samplingExplains && !windowExplains && !finiteSizeExplains

    const ok =
      chargeExact &&
      drifts.toneCount > 0 &&
      drifts.momentumX > 0 &&
      streamingSilent &&
      relaxes &&
      flat &&
      notDiffusive &&
      notBallistic &&
      lightSpeed &&
      acrossDensities &&
      spreadSource

    const perDensity: Record<string, number> = {}

    laws.forEach(law => {
      const tag = `Z${Math.round(law.zeroFraction * 100)}`

      perDensity[`exponent${tag}`] = law.exponent
      perDensity[`exponentError${tag}`] = law.exponentError
      perDensity[`rateMean${tag}`] = law.rateMean
      perDensity[`rateRelativeSpread${tag}`] = law.rateRelativeSpread
      perDensity[`smallestR2${tag}`] = law.smallestR2
      perDensity[`speedError${tag}`] = law.speedError
      law.committed.forEach(m => {
        perDensity[`rate${tag}L${m.side}N${m.mode}`] = m.law.slowRate
      })
    })

    const spreadMetrics: Record<string, number> = {
      acrossKOneSalt,
      betweenSaltsAtFixedK: betweenSalts,
      acrossKSaltMean,
      exponentOfSaltMeans: meanFit.slope,
      windowShiftLargest: Math.max(...windowShift.map(Math.abs)),
      acrossKWindow3L: windowPattern,
      earlyOverLateSmallest: Math.min(...halves),
      earlyOverLateLargest: Math.max(...halves),
      commensurateSideRateMean: commensurateMean,
      incommensurateSideRateMean: incommensurateMean,
      incommensurateSideSpread: incommensurateSpread,
      rateSlopeAgainstInverseSide: sizeFit.slope,
      rateSlopeAgainstInverseSideError: sizeSlopeError,
      axisOneOverAxisZero: axisRatio,
      axisOneAcrossK: axisOneSpread,
      axisOneExponent: axisOneFit.slope,
      rateAxis2N1: turned[4]?.law.slowRate ?? 0,
      rateAxis3N1: turned[5]?.law.slowRate ?? 0,
      fastOverKAxis2N1: (turned[4]?.law.fastFrequency ?? 0) / (turned[4]?.k ?? 1),
      fastOverKAxis3N1: (turned[5]?.law.fastFrequency ?? 0) / (turned[5]?.k ?? 1),
      samplingExplains: samplingExplains ? 1 : 0,
      windowExplains: windowExplains ? 1 : 0,
      finiteSizeExplains: finiteSizeExplains ? 1 : 0,
      anisotropic: anisotropic ? 1 : 0,
    }

    salts.forEach((salt, s) =>
      saltRates[s]?.forEach((rate, i) => {
        spreadMetrics[`rateSalt${salt}N${i + 1}`] = rate
      }),
    )
    sized.forEach(m => {
      spreadMetrics[`rateSide${m.side}N${m.mode}`] = m.law.slowRate
    })
    axisOneRates.forEach((rate, i) => {
      spreadMetrics[`rateAxis1N${i + 1}`] = rate
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'charge is conserved exactly at every beat while tone count and x momentum are not, and the charge mode of the committed rule has a propagating part at omega = k to within 0.5 percent and a slow part relaxing at a rate independent of wavelength, the fitted exponent of Gamma against k far from both 2 and 1 at each of four background densities (zero fractions 0.2, 1/3, 0.5, 0.6), where pure streaming relaxes nothing. The spread of the rates across k at one background is the sampling scatter of that background: three backgrounds scatter by as much at a fixed k, and their average is flat in k, while the fitting window does not change the spread and the rate shows no 1 / L trend over sides 7 to 11. The rule is anisotropic (axis 1 relaxes 1.8 times faster than axis 0), which a spread measured along one axis cannot contain',
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
        ...perDensity,
        ...spreadMetrics,
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
        'L3: the committed rule runs through beat, and the law is read off the runs by a split (running mean over L beats, spectral peak of the rest) that assumes no form, with pure streaming as the control that relaxes nothing. The measured law is kinetic, not hydrodynamic: about half the mode (0.48 of it, against 0.50 under streaming) oscillates at omega = k, the speed of light to the resolution of the frequency scan (a grid step of 0.0016), and the mode relaxes at the same rate at every wavenumber, which is what a gas does when its mean free path is longer than the wavelength. A two-state reading (static charge released at rate Gamma into movers at speed one) puts the diffusive regime at k well below Gamma, wavelengths of thousands of cells, beyond any mesh run here, so this does not show diffusion and does not rule it out at scales not reached. This fills the dispersion relation E-FND-0129 names for the conserved density only, not species by species. Under the previous committed pair table the charge wave recurred instead (E-FLD-0002). DENSITIES: the law holds at every density gated, with a rate that rises with the empty fraction: mean 0.00113, 0.00152, 0.00190, 0.00223 per beat at zero fractions 0.2, 1/3, 0.5, 0.6, exponents -0.10 +- 0.04, -0.08 +- 0.03, +0.04 +- 0.06, -0.02 +- 0.08, speed error at most 0.18 percent, smallest r2 0.93. THE SPREAD: the earlier note called the five-rate spread (range about 15 percent, standard deviation 6.7 percent) systematic. It is not. Tested one explanation at a time at zero fraction 1/3: (1) sampling. Three hash backgrounds scatter at a fixed k by 4.8 percent, against 5.6 percent across k within one background, and the salt-averaged rates spread by 1.5 percent across k with exponent -0.02. That is the source. (2) the fitting window. A 3L running mean moves single rates by up to 6 percent and leaves the across-k spread at 8.0 percent against 6.7, so the window is not it. The relaxation is not a single exponential either: the first half of a run relaxes 1.16 to 1.36 times faster than the second. (3) finite size. Among sides that do not divide the 24-beat schedule period (7, 9, 10, 11), the rate has no 1 / L trend (slope -0.0002 +- 0.0025). Sides that do divide it (6, 8) relax more slowly, 0.00111 against 0.00156, a commensurability effect between the mesh and the schedule that the five wavenumbers (sides 9 and 11) do not meet. (4) anisotropy. It is real and large: the same modes along axis 1 relax at 0.0025 to 0.0028 (1.78 times axis 0, exponent +0.07, still flat), axis 2 at 0.0021 and axis 3 at 0.0016 for n = 1, and along axes 2 and 3 the fast part does not peak at omega = k (1.12 k and 4.5 k). The rule couples lines in a fixed order that does not treat the four axes alike. It cannot make the spread, which is along axis 0 only. So Gamma is a function of direction, not a single number, and the omega = k claim is gated along axis 0 only.',
    })
  },
})
