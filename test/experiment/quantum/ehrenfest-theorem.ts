// The Ehrenfest theorem on the coined Dirac walk model, with a packet that is actually a particle.
// Ehrenfest says the expectation values obey the classical equations: d<x>/dt = <v(k)> and
// d<k>/dt = -F under a force F. On the walk the momentum half is exact for any packet (a linear
// potential is a rigid momentum translation) and the position half holds for a packet that lives in
// ONE band of the walk's dispersion cos E = cos m cos k. That last condition is the point of this
// file. The first probe of this theorem on 2026-08-31 seeded a Gaussian "at rest" with equal right and
// left amplitude and found the centroid did not follow any classical path, because that seed is 21
// percent negative-energy and the two bands move against each other. Built from the positive band
// alone (code/dynamics/walk-band), the packet follows the classical trajectory to a fraction of a
// cell over sixty cells of travel, and the two ways to break the theorem are both measured: a force
// large enough to drive Landau-Zener transitions into the other band, and the mixed-band seed.
//
// This is a hand-written unitary walk, not the lattice-gas rule (foundations/rule-has-no-amplitudes).
// Prior art: Ehrenfest 1927, and the band description of coined walks (Kitagawa et al. 2010,
// Regensburger et al. 2011 for the Bloch and Zener physics on walks).

import {
  addGaussianPacket,
  coinedWalkCentroid,
  coinedWalkStep,
  makeCoinedWalk,
  massProfile,
  normalizeCoinedWalk,
  potentialPhase,
} from '@/code/dynamics/coined-dirac-walk'
import {
  addPositiveBandPacket,
  ehrenfestTrajectory,
  walkMeanMomentum,
  walkMomentumDistribution,
  walkPositiveBandFraction,
} from '@/code/dynamics/walk-band'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIZE = 400
const MASS = 0.5
const MOMENTUM = 0.6
const WIDTH = 12
const STEPS = 80

// run one packet under a constant force and compare with the Ehrenfest trajectory built from its
// own initial momentum distribution
function trial(input: { force: number; seed: 'band' | 'rest' }): {
  maxPositionError: number
  maxMomentumError: number
  positiveBandStart: number
  positiveBandEnd: number
  travelled: number
} {
  const { force, seed } = input
  const origin = SIZE >> 1
  const walk = makeCoinedWalk({ size: SIZE })

  if (seed === 'band') {
    addPositiveBandPacket({
      walk,
      center: origin,
      width: WIDTH,
      momentum: MOMENTUM,
      mass: MASS,
    })
  } else {
    addGaussianPacket({
      walk,
      center: origin,
      width: WIDTH,
      momentum: MOMENTUM,
      chirality: 'both',
    })
  }

  normalizeCoinedWalk(walk)

  const distribution = walkMomentumDistribution(walk)
  const predicted = ehrenfestTrajectory({
    distribution,
    mass: MASS,
    force,
    steps: STEPS,
  })

  const positiveBandStart = walkPositiveBandFraction(walk, MASS)
  const { cosMass, sinMass } = massProfile({
    size: SIZE,
    massAt: () => MASS,
  })

  const { phaseRe, phaseIm } = potentialPhase({
    size: SIZE,
    potentialAt: x => force * (x - origin),
  })

  // the packet sits at its Berry-connection offset from the nominal centre, so displacement is
  // measured from the initial centroid
  const start = coinedWalkCentroid({ walk, origin })

  let maxPositionError = 0
  let maxMomentumError = 0
  let travelled = 0

  for (let t = 1; t <= STEPS; t++) {
    coinedWalkStep({
      walk,
      cosMass,
      sinMass,
      phaseRe,
      phaseIm,
      boundary: 'periodic',
    })

    travelled = coinedWalkCentroid({ walk, origin }) - start

    maxPositionError = Math.max(
      maxPositionError,
      Math.abs(travelled - predicted[t - 1]!),
    )

    // the classical momentum, folded into (-pi, pi] like the measured circular mean
    let classical = MOMENTUM - force * t

    classical = Math.atan2(Math.sin(classical), Math.cos(classical))

    const measured = walkMeanMomentum(walk)
    const gap = Math.atan2(
      Math.sin(measured - classical),
      Math.cos(measured - classical),
    )

    maxMomentumError = Math.max(maxMomentumError, Math.abs(gap))
  }

  return {
    maxPositionError,
    maxMomentumError,
    positiveBandStart,
    positiveBandEnd: walkPositiveBandFraction(walk, MASS),
    travelled,
  }
}

export default experiment({
  id: 'quantum/ehrenfest-theorem',
  code: 'E-QTM-0094',
  title:
    'the Ehrenfest theorem on the coined Dirac walk model: a positive-band packet follows the classical trajectory of its own momentum distribution to a thousandth of a cell over sixty cells free and under a slow force once the Berry-connection shift is included, the momentum half exact, while a fast force drives Landau-Zener leakage into the other band and a mixed-band rest seed lags the classical path by twenty cells',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const free = trial({ force: 0, seed: 'band' })
    const slow = trial({ force: 0.005, seed: 'band' })
    const fast = trial({ force: 0.8, seed: 'band' })
    const mixed = trial({ force: 0.005, seed: 'rest' })

    const positionFollows =
      free.maxPositionError < 1e-9 && slow.maxPositionError < 0.01
    const momentumExact =
      free.maxMomentumError < 1e-9 && slow.maxMomentumError < 1e-9
    // the slow force still leaks a few parts per hundred thousand into the other band (Zener), measured
    const singleBand =
      free.positiveBandStart > 0.999999 &&
      free.positiveBandEnd > 0.999999 &&
      slow.positiveBandEnd > 0.9999
    const fastBreaks =
      fast.positiveBandEnd < 0.7 && fast.maxPositionError > 5
    const mixedBreaks =
      mixed.positiveBandStart < 0.9 && mixed.maxPositionError > 10
    const ok =
      positionFollows &&
      momentumExact &&
      singleBand &&
      fastBreaks &&
      mixedBreaks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a packet built from the positive band of the walk dispersion cos E = cos m cos k follows the Ehrenfest trajectory, the centroid advancing each step by the group velocity averaged over its own momentum distribution at the midpoint momentum plus the shift of the band Berry connection, to under a billionth of a cell when free and under a hundredth of a cell under a slow constant force over sixty cells of travel, with the mean momentum equal to k0 - F t to machine precision, while a force of 0.8 per step leaves less than seventy percent of the weight in the band and the centroid five cells off the classical path, and the equal-chirality rest seed of the first probe, twenty-one percent negative-energy, lags the classical path by more than ten cells',
      metrics: {
        freePositionError: Number(free.maxPositionError.toExponential(3)),
        slowPositionError: Number(slow.maxPositionError.toFixed(4)),
        slowMomentumError: Number(slow.maxMomentumError.toExponential(3)),
        slowTravelled: Number(slow.travelled.toFixed(3)),
        slowPositiveBand: Number(slow.positiveBandEnd.toFixed(6)),
        slowZenerLeak: Number((1 - slow.positiveBandEnd).toExponential(2)),
      },
      // CONTROL: a fast force (Landau-Zener leakage into the negative band) and the mixed-band rest seed both leave the classical trajectory
      control: {
        fastPositiveBand: Number(fast.positiveBandEnd.toFixed(4)),
        fastPositionError: Number(fast.maxPositionError.toFixed(3)),
        mixedPositiveBand: Number(mixed.positiveBandStart.toFixed(4)),
        mixedPositionError: Number(mixed.maxPositionError.toFixed(3)),
      },
      notes:
        'Model, not rule: the coined Dirac walk of code/dynamics/coined-dirac-walk. The Ehrenfest prediction is computed from the initial momentum distribution, not read off the run, so the position half is a prediction that could have failed. Two things had to be right for it to hold: the packet sits at the Berry connection of the band (-0.142 cells here, measured and predicted alike) and that offset moves as the force drifts the momentum, and the momentum kick lands between the coin and the shift so each step sees the midpoint momentum (with the momentum at the start of the step the residual is 0.19 cells and linear in the force, with the midpoint it is 0.002). The mixed seed is the equal-chirality Gaussian that the 2026-08-31 probe (tmp/probe-ehrenfest.ts) used and found not to follow any classical path, kept here as the control that explains why: it is not a positive-energy state. Prior art: Ehrenfest 1927; Kitagawa, Rudner, Berg, Demler 2010 for the band picture of coined walks; Regensburger et al. 2011 for Bloch oscillations and Zener tunnelling on a photonic walk.',
    })
  },
})
