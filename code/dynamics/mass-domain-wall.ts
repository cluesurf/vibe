// A mass domain wall on the coined Dirac walk: a mass profile that changes sign binds a Jackiw-Rebbi
// state at the wall, a same-sign wall of the same gradient does not, a uniform mass disperses. This is a
// hand-written unitary walk (code/dynamics/coined-dirac-walk), not the lattice-gas rule, see
// foundations/rule-has-no-amplitudes. Until 2026-08-31 this file carried its own copy of the walk.

import {
  addGaussianPacket,
  coinedWalkStep,
  coinedWalkWindowFraction,
  makeCoinedWalk,
  massProfile,
  normalizeCoinedWalk,
} from '@/code/dynamics/coined-dirac-walk'

// The fraction of the probability that stays within `window` sites of the wall after `steps`, for a packet
// launched at rest on the wall. `flip` is m tanh((x - wall) / wallWidth), `samesign` is the same gradient
// shifted so the mass never changes sign, `uniform` is a constant mass.
export function massWallRetainedWeight(input: {
  size: number
  steps: number
  mass: number
  profile: 'flip' | 'samesign' | 'uniform'
  width: number
  wallWidth: number
  window: number
}): number {
  const { size, steps, mass, profile, width, wallWidth, window } = input
  const wall = size >> 1
  const walk = makeCoinedWalk({ size })

  addGaussianPacket({
    walk,
    center: wall,
    width,
    momentum: 0,
    chirality: 'both',
  })
  normalizeCoinedWalk(walk)

  const { cosMass, sinMass } = massProfile({
    size,
    massAt: x => {
      const th = Math.tanh((x - wall) / wallWidth)

      return profile === 'flip'
        ? mass * th
        : profile === 'samesign'
          ? mass * (1.5 + 0.5 * th)
          : mass
    },
  })

  for (let t = 0; t < steps; t++) {
    coinedWalkStep({ walk, cosMass, sinMass, boundary: 'periodic' })
  }

  return coinedWalkWindowFraction({ walk, centre: wall, window })
}
