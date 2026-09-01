// Celestial holography seed, the rung that joins the two suites: the substrate's
// own emergent boost acts on the celestial sphere of asymptotic directions by
// exactly the conformal Mobius map the celestial seed suite measured. This is the
// discrete seed of Pasterski's founding fact read dynamically, that a Lorentz
// boost is the conformal (aberration) map of the celestial sphere.
//
// A massless emergent excitation of spatial momentum k travels to the celestial
// point n = k / |k| (its light cone is omega = |k|, the frame-independent cone
// verified in the boost-velocity arena). Boost it: the substrate's own
// boostEnergyMomentum mixes (omega, k_parallel) by rapidity phi while k_perp rides
// along, so the asymptotic direction moves to n'. We show n' is the image of n
// under ballIsometry(tanh(phi/2) * axis), the very conformal boundary map the
// E-HLG-002x seeds used for cross-ratio invariance and correlator covariance. So
// the celestial conformal map is not an abstract ball isometry, it is the physical
// aberration of the substrate's emergent light rays under its emergent boost.
//
// Three witnesses, over several D4 boost axes and several rapidities:
//   1. the substrate-boosted celestial direction equals the conformal map image
//      (the parameter identification s = tanh(phi/2) is the content),
//   2. the boosted directions keep their conformal cross-ratio (ties to 0161),
//   3. control: a Galilean boost n' = normalize(n + beta axis) does neither, it
//      mismatches the conformal map and breaks the cross-ratio.
//
// Depth L2. This reproduces the known celestial-sphere aberration (Lorentz boost
// as a conformal map) using the substrate's emergent boost helper, joining the
// emergent-dynamics arena to the celestial-kinematics seeds. It is not a celestial
// amplitude, which would presuppose an emergent asymptotic scattering matrix.

import {
  normalize,
  dot,
  add,
  scale,
  sub,
  norm,
  type Vec,
} from '@/code/algebra/vector'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { ballIsometry } from '@/code/geometry/mobius'
import { boostEnergyMomentum } from '@/code/measure/rapidity'
import { crossRatio } from '@/code/measure/cross-ratio'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { containsVector } from '@/code/algebra/vector'

// six coin boundary directions as celestial points, and three D4 boost axes
const CELESTIAL_DIRECTIONS: Vec[] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, -1],
  [0, 0, 1, 1],
  [1, -1, 0, 0],
]

const BOOST_AXES: Vec[] = [
  [1, 0, -1, 0],
  [0, 1, 1, 0],
  [1, 0, 0, 1],
]

const RAPIDITIES = [0.5, 1.0, 1.5]

// the asymptotic celestial direction of a massless excitation of momentum
// direction n after an emergent boost of rapidity phi along axis u. The substrate's
// own boostEnergyMomentum mixes (omega = |k| = 1, k_parallel), k_perp rides along.
function boostCelestialDirection(n: Vec, u: Vec, phi: number): Vec {
  const kParallel = dot(n, u)
  const kPerp = sub(n, scale(u, kParallel))
  const boosted = boostEnergyMomentum({
    omega: 1,
    wavenumber: kParallel,
    rapidity: phi,
  })

  return normalize(add(scale(u, boosted.wavenumber), kPerp))
}

// the non-relativistic control: add the frame velocity, renormalize to the sphere
function galileanDirection(n: Vec, u: Vec, beta: number): Vec {
  return normalize(add(n, scale(u, beta)))
}

export default experiment({
  id: 'holography/celestial-boost-aberration',
  code: 'E-HLG-0030',
  title:
    'the substrate emergent boost acts on the celestial sphere by exactly the conformal map the celestial seeds measured, joining the dynamics and kinematics suites',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const directions = CELESTIAL_DIRECTIONS.map(normalize)

    const grounded =
      CELESTIAL_DIRECTIONS.every(v => containsVector({ vectors: roots, vector: v })) &&
      BOOST_AXES.every(v => containsVector({ vectors: roots, vector: v }))

    let mapResidual = 0
    let crossRatioShift = 0
    let controlMismatch = 0
    let controlCrossRatioShift = 0

    const crReference = crossRatio(directions.slice(0, 4))

    for (const rawAxis of BOOST_AXES) {
      const u = normalize(rawAxis)

      for (const phi of RAPIDITIES) {
        const beta = Math.tanh(phi)
        const conformalMap = ballIsometry(scale(u, Math.tanh(phi / 2)))

        const boosted = directions.map(n =>
          boostCelestialDirection(n, u, phi),
        )

        const mapped = directions.map(n => conformalMap(n))
        const galilean = directions.map(n =>
          galileanDirection(n, u, beta),
        )

        for (let i = 0; i < directions.length; i++) {
          mapResidual = Math.max(
            mapResidual,
            norm(sub(boosted[i]!, mapped[i]!)),
          )

          controlMismatch = Math.max(
            controlMismatch,
            norm(sub(galilean[i]!, mapped[i]!)),
          )
        }

        crossRatioShift = Math.max(
          crossRatioShift,
          Math.abs(crossRatio(boosted.slice(0, 4)) - crReference),
        )

        controlCrossRatioShift = Math.max(
          controlCrossRatioShift,
          Math.abs(crossRatio(galilean.slice(0, 4)) - crReference),
        )
      }
    }

    const ok =
      grounded &&
      mapResidual < 1e-9 &&
      crossRatioShift < 1e-9 &&
      controlMismatch > 1e-2 &&
      controlCrossRatioShift > 1e-2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the substrate emergent boost carries a massless excitation to a celestial direction given exactly by the conformal Mobius map ballIsometry(tanh(phi/2) axis), the same map the celestial seeds used, preserving the cross-ratio, while a Galilean boost matches neither',
      metrics: {
        mapResidual,
        crossRatioShift,
        crossRatio: crReference,
        rapidities: RAPIDITIES.length,
      },
      control: {
        galileanMismatch: controlMismatch,
        galileanCrossRatioShift: controlCrossRatioShift,
      },
      notes: grounded
        ? undefined
        : 'the chosen directions or axes are not all D4 roots, grounding failed',
    })
  },
})
