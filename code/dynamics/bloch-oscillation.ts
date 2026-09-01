// Bloch oscillations on the coined Dirac walk: a constant force F enters as a linear on-site potential
// V(x) = F x, the periodic band turns the drift into an oscillation at the Bloch frequency omega_B = F, and
// the spatial amplitude is the band width over the force. This is a hand-written unitary walk
// (code/dynamics/coined-dirac-walk), not the lattice-gas rule, see foundations/rule-has-no-amplitudes.
// Until 2026-08-31 this file carried its own copy of the walk and of the frequency transform.

import {
  addGaussianPacket,
  coinedWalkCentroid,
  coinedWalkStep,
  makeCoinedWalk,
  massProfile,
  normalizeCoinedWalk,
  potentialPhase,
} from '@/code/dynamics/coined-dirac-walk'
import { dominantAngularFrequency } from '@/code/measure/dominant-frequency'

// The centroid (mean signed displacement from the launch site) of a packet launched at rest at the centre
// under a constant force, recorded after each step. The potential is centred so it is antisymmetric.
export function blochCentroidTrace(input: {
  size: number
  steps: number
  mass: number
  force: number
  width: number
}): number[] {
  const { size, steps, mass, force, width } = input
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

  const { cosMass, sinMass } = massProfile({ size, massAt: () => mass })
  const phase =
    force !== 0
      ? potentialPhase({ size, potentialAt: x => force * (x - x0) })
      : undefined

  const centroid: number[] = []

  for (let t = 0; t < steps; t++) {
    coinedWalkStep({
      walk,
      cosMass,
      sinMass,
      phaseRe: phase?.phaseRe,
      phaseIm: phase?.phaseIm,
      boundary: 'periodic',
    })

    centroid.push(coinedWalkCentroid({ walk, origin: x0 }))
  }

  return centroid
}

// The dominant oscillation frequency of the centroid trace. For a force F this is the Bloch frequency,
// about F. For zero force the trace has no clean peak and the transform's answer is not meaningful.
export function blochFrequency(input: {
  size: number
  steps: number
  mass: number
  force: number
  width: number
}): number {
  return dominantAngularFrequency({ trace: blochCentroidTrace(input) })
}
