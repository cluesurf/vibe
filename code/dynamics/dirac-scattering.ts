// Scattering and tunneling on the coined Dirac walk. A wave packet with definite rightward momentum runs
// into a mass step (diracScatter) or a finite mass barrier (diracTunnel), and the outgoing probability is
// split into transmitted and reflected parts. The walk is unitary, so a lossless run conserves the total,
// and a lossy run (amplitudes damped each step) does not. This is a hand-written unitary walk
// (code/dynamics/coined-dirac-walk), not the lattice-gas rule, see foundations/rule-has-no-amplitudes.
// Until 2026-08-31 this file carried its own copy of the walk.

import {
  addGaussianPacket,
  coinedWalkRangeProbability,
  coinedWalkStep,
  makeCoinedWalk,
  massProfile,
  normalizeCoinedWalk,
} from '@/code/dynamics/coined-dirac-walk'

// A rightward packet from a quarter of the way along the line hits a mass step at the midpoint. Open ends:
// amplitude that would leave the line is dropped, which is harmless because the packet never reaches an
// end. Returns the probability past the step, before it, and their sum.
export function diracScatter(input: {
  size: number
  barrierMass: number
  momentum: number
  width: number
  steps: number
  leak: number
}): { transmitted: number; reflected: number; total: number } {
  const { size, barrierMass, momentum, width, steps, leak } = input
  const barrier = size >> 1
  const walk = makeCoinedWalk({ size })

  addGaussianPacket({
    walk,
    center: size >> 2,
    width,
    momentum,
    chirality: 'right',
  })
  normalizeCoinedWalk(walk)

  const { cosMass, sinMass } = massProfile({
    size,
    massAt: x => (x >= barrier ? barrierMass : 0),
  })

  for (let t = 0; t < steps; t++) {
    coinedWalkStep({
      walk,
      cosMass,
      sinMass,
      boundary: 'open',
      damp: 1 - leak,
    })
  }

  const transmitted = coinedWalkRangeProbability({
    walk,
    from: barrier,
    to: size,
  })

  const reflected = coinedWalkRangeProbability({ walk, from: 0, to: barrier })

  return { transmitted, reflected, total: transmitted + reflected }
}

// The exact evanescent decay rate of the walk inside a mass barrier, from the walk's own dispersion
// cos(omega) = cos(mass) cos(k) continued to imaginary momentum k = i kappa:
// cosh(kappa) = cos(omega) / cos(mass), defined when the frequency sits below the mass gap.
export function walkTunnelKappa(input: {
  omega: number
  mass: number
}): number {
  return Math.acosh(Math.cos(input.omega) / Math.cos(input.mass))
}

// The continuum Dirac decay rate for the same sub-gap frequency, kappa = sqrt(m^2 - omega^2),
// the small-angle limit of the walk formula.
export function continuumTunnelKappa(input: {
  omega: number
  mass: number
}): number {
  return Math.sqrt(input.mass * input.mass - input.omega * input.omega)
}

// A wide rightward packet (narrow momentum spread) through a finite mass barrier of `barrierWidth` cells,
// massless elsewhere, open ends. Returns the probability past the barrier.
export function diracTunnel(input: {
  size: number
  barrierStart: number
  barrierWidth: number
  barrierMass: number
  momentum: number
  packetCenter: number
  packetWidth: number
  steps: number
}): number {
  const {
    size,
    barrierStart,
    barrierWidth,
    barrierMass,
    momentum,
    packetCenter,
    packetWidth,
    steps,
  } = input

  const walk = makeCoinedWalk({ size })

  addGaussianPacket({
    walk,
    center: packetCenter,
    width: packetWidth,
    momentum,
    chirality: 'right',
  })
  normalizeCoinedWalk(walk)

  const { cosMass, sinMass } = massProfile({
    size,
    massAt: x =>
      x >= barrierStart && x < barrierStart + barrierWidth ? barrierMass : 0,
  })

  for (let t = 0; t < steps; t++) {
    coinedWalkStep({ walk, cosMass, sinMass, boundary: 'open' })
  }

  return coinedWalkRangeProbability({
    walk,
    from: barrierStart + barrierWidth,
    to: size,
  })
}
