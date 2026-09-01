// The Klein paradox on the coined Dirac walk: a right-moving packet hits a barrier region that is either a
// scalar electrostatic potential (a phase e^{-i height} on both chiralities, which transmits, the Klein
// effect) or a mass barrier (a large local mass, a real gap, which reflects). This is a hand-written
// unitary walk (code/dynamics/coined-dirac-walk), not the lattice-gas rule, see
// foundations/rule-has-no-amplitudes. Until 2026-08-31 this file carried its own copy of the walk.

import {
  addGaussianPacket,
  coinedWalkProbability,
  coinedWalkStep,
  makeCoinedWalk,
  massProfile,
  normalizeCoinedWalk,
  potentialPhase,
} from '@/code/dynamics/coined-dirac-walk'

// A right-moving Gaussian packet hits a barrier region. The final probability is split into reflected
// (ended left of the barrier), inside (within it), and transmitted (right of it). For a sharp step (a wide
// barrier) the meaningful number is the penetration, inside plus transmitted. The packet is centred four
// widths left of the barrier so it starts clear of it, and the line is kept wide so nothing wraps.
export function diracBarrierProbability(input: {
  size: number
  steps: number
  mass: number
  momentum: number
  width: number
  barrierStart: number
  barrierWidth: number
  height: number
  kind: 'potential' | 'mass'
}): { reflected: number; inside: number; transmitted: number } {
  const {
    size,
    steps,
    mass,
    momentum,
    width,
    barrierStart,
    barrierWidth,
    height,
    kind,
  } = input

  const barrierEnd = barrierStart + barrierWidth
  const inBarrier = (x: number): boolean => x >= barrierStart && x < barrierEnd
  const walk = makeCoinedWalk({ size })

  addGaussianPacket({
    walk,
    center: Math.floor(barrierStart - 4 * width),
    width,
    momentum,
    chirality: 'right',
  })
  normalizeCoinedWalk(walk)

  const { cosMass, sinMass } = massProfile({
    size,
    massAt: x => (kind === 'mass' && inBarrier(x) ? mass + height : mass),
  })

  const { phaseRe, phaseIm } = potentialPhase({
    size,
    potentialAt: x => (kind === 'potential' && inBarrier(x) ? height : 0),
  })

  for (let t = 0; t < steps; t++) {
    coinedWalkStep({
      walk,
      cosMass,
      sinMass,
      phaseRe,
      phaseIm,
      boundary: 'periodic',
    })
  }

  const p = coinedWalkProbability(walk)

  let reflected = 0
  let inside = 0
  let transmitted = 0
  let total = 0

  for (let x = 0; x < size; x++) {
    total += p[x]!

    if (x < barrierStart) {
      reflected += p[x]!
    } else if (x < barrierEnd) {
      inside += p[x]!
    } else {
      transmitted += p[x]!
    }
  }

  const norm = total || 1

  return {
    reflected: reflected / norm,
    inside: inside / norm,
    transmitted: transmitted / norm,
  }
}
