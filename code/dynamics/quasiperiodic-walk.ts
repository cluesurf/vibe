// Aubry-Andre localization on the coined Dirac walk: a deterministic quasiperiodic (golden-ratio) mass
// modulation traps the packet, where the unmodulated walk spreads ballistically. This is a hand-written
// unitary walk (code/dynamics/coined-dirac-walk), not the lattice-gas rule, see
// foundations/rule-has-no-amplitudes. Until 2026-08-31 this file carried its own copy of the walk.

import {
  addGaussianPacket,
  coinedWalkSpread,
  coinedWalkStep,
  makeCoinedWalk,
  massProfile,
  normalizeCoinedWalk,
} from '@/code/dynamics/coined-dirac-walk'

const GOLDEN = (1 + Math.sqrt(5)) / 2

// The spread (standard deviation of the signed displacement from the launch site) of a packet launched at
// rest at the centre under a mass m(x) = mass + lambda cos(2 pi phi (x - x0)), phi the golden ratio.
export function quasiperiodicWalkSpread(input: {
  size: number
  steps: number
  mass: number
  lambda: number
  width: number
}): number {
  const { size, steps, mass, lambda, width } = input
  const x0 = size >> 1
  const walk = makeCoinedWalk({ size })

  addGaussianPacket({
    walk,
    center: x0,
    width,
    momentum: 0,
    chirality: 'both',
  })
  normalizeCoinedWalk(walk)

  const { cosMass, sinMass } = massProfile({
    size,
    massAt: x => mass + lambda * Math.cos(2 * Math.PI * GOLDEN * (x - x0)),
  })

  for (let t = 0; t < steps; t++) {
    coinedWalkStep({ walk, cosMass, sinMass, boundary: 'periodic' })
  }

  return coinedWalkSpread({ walk, origin: x0 })
}
