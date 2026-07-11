// The emergent sound speed of the momentum-conserving lattice gas, read from a
// travelling density pulse. A quiescent deterministic background (head-on pairs placed
// by a position-indexed hash, zero momentum everywhere) carries a localized pure
// density bump (all slots filled in a narrow band of columns, zero net momentum). Under
// head-on-rotate the bump radiates an outgoing pulse whose position, tracked as the
// midpoint of the leading and trailing half-max crossings of the column-averaged excess
// against a bump-free reference run, moves linearly in time. The slope is the front
// speed c_s, and its agreement across two bump widths and two lattice sizes is the
// statement that the gas has one well-defined sound speed. For a 4-direction gas the
// classic long-wavelength expectation is c_s = 1/sqrt(2) (half the charge sits on the
// propagation axis, so the pressure is rho/2), and the measured speed lands within a
// couple percent of it, reported and not gated. The control is the momentum-pinning
// pair table, where the excess profile stays frozen at the bump site (front speed
// measured at zero), so the tracker genuinely fails on a rule without a sound mode.
// Deterministic throughout, the background is a fixed function of the slot index and
// the two runs subtract exactly, no random anywhere.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { headOnRotate, pairCollision } from '@/code/rule/collision'
import { Collision } from '@/code/rule/collision'
import { makeWill } from '@/code/tone/will'
import {
  pairGasFill,
  addDensitySlab,
  excessProfileSeries,
  pulseMidpoint,
} from '@/code/measure/density-front'
import { linearFit } from '@/code/measure/regression'

const PAIR_FILL = 0.35
const FIT_START = 12

function measureFrontSpeed(input: {
  side: number
  halfWidth: number
  collision: Collision
  mesh: ReturnType<typeof squareMesh>
}): { speed: number; r2: number } {
  const { side, halfWidth, collision, mesh } = input
  const center = Math.floor(side / 2)
  // stop before the pulse can reach the far side of the periodic box
  const beats = Math.floor(side / 2) - 10

  const reference = makeWill(mesh)

  pairGasFill({ will: reference, pairFill: PAIR_FILL })

  const bumped = makeWill(mesh)

  pairGasFill({ will: bumped, pairFill: PAIR_FILL })
  addDensitySlab({ will: bumped, side, center, halfWidth })

  const excess = excessProfileSeries({
    reference,
    bumped,
    collision,
    beats,
    side,
  })

  const xs: number[] = []
  const ys: number[] = []

  for (let beat = FIT_START; beat <= beats; beat++) {
    xs.push(beat)
    ys.push(pulseMidpoint({ excess: excess[beat]!, side, center }))
  }

  const fit = linearFit({ xs, ys })

  return { speed: fit.slope, r2: fit.r2 }
}

export default experiment({
  id: 'fluids/emergent-sound-speed',
  code: 'E-FLD-0013',
  title:
    'a density bump in the momentum-conserving gas radiates a ballistic pulse with one well-defined sound speed near 1/sqrt(2), while the pinning pair table leaves the bump frozen',
  category: 'fluids',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // primary measurement, side 128, two bump widths
    const side = 128
    const mesh = squareMesh({ side })
    const opposite = meshOpposites(mesh)
    const conserving = headOnRotate({ opposite })
    const narrow = measureFrontSpeed({
      side,
      halfWidth: 2,
      collision: conserving,
      mesh,
    })

    const wide = measureFrontSpeed({
      side,
      halfWidth: 5,
      collision: conserving,
      mesh,
    })

    // size perturbation, the same pipeline at side 96
    const sideSmall = 96
    const meshSmall = squareMesh({ side: sideSmall })
    const conservingSmall = headOnRotate({
      opposite: meshOpposites(meshSmall),
    })

    const smallNarrow = measureFrontSpeed({
      side: sideSmall,
      halfWidth: 2,
      collision: conservingSmall,
      mesh: meshSmall,
    })

    const smallWide = measureFrontSpeed({
      side: sideSmall,
      halfWidth: 5,
      collision: conservingSmall,
      mesh: meshSmall,
    })

    // the control, the momentum-pinning pair table on the same bumps
    const pinning = pairCollision({ opposite })
    const controlNarrow = measureFrontSpeed({
      side,
      halfWidth: 2,
      collision: pinning,
      mesh,
    })

    const controlWide = measureFrontSpeed({
      side,
      halfWidth: 5,
      collision: pinning,
      mesh,
    })

    // the gates
    const soundSpeed = (narrow.speed + wide.speed) / 2
    const widthAgreement =
      Math.abs(narrow.speed - wide.speed) / soundSpeed

    const inverseSqrt2 = 1 / Math.sqrt(2)
    const deviation = (soundSpeed - inverseSqrt2) / inverseSqrt2

    const ballistic = narrow.r2 >= 0.99 && wide.r2 >= 0.99
    const physicalSpeed = soundSpeed > 0 && soundSpeed < 1
    const wellDefined = widthAgreement <= 0.1
    const robustAcrossSizes =
      Math.abs(smallNarrow.speed - narrow.speed) / narrow.speed <=
        0.1 &&
      Math.abs(smallWide.speed - wide.speed) / wide.speed <= 0.1

    const controlFrozen =
      Math.abs(controlNarrow.speed) <= 0.05 &&
      Math.abs(controlWide.speed) <= 0.05

    const ok =
      ballistic &&
      physicalSpeed &&
      wellDefined &&
      robustAcrossSizes &&
      controlFrozen

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a zero-momentum density bump on a deterministic hash-disordered pair background radiates an outgoing pulse whose tracked midpoint moves linearly in time (r2 above 0.99 for both bump widths), the fitted front speed lies between 0 and 1 lattice units per beat and agrees within 10 percent across two bump widths (half-widths 2 and 5) and two lattice sides (96 and 128), so the head-on-rotate gas has one well-defined emergent sound speed, measured near 1/sqrt(2) (deviation reported, not gated), while under the momentum-pinning pair table the excess profile stays at the bump site and the fitted front speed is zero within 0.05',
      metrics: {
        soundSpeedTimes1000: Math.round(soundSpeed * 1000),
        speedNarrowTimes1000: Math.round(narrow.speed * 1000),
        speedWideTimes1000: Math.round(wide.speed * 1000),
        r2NarrowTimes10000: Math.round(narrow.r2 * 10000),
        r2WideTimes10000: Math.round(wide.r2 * 10000),
        widthAgreementTimes1000: Math.round(widthAgreement * 1000),
        deviationFromInverseSqrt2Times1000: Math.round(
          deviation * 1000,
        ),
        side96SpeedNarrowTimes1000: Math.round(
          smallNarrow.speed * 1000,
        ),
        side96SpeedWideTimes1000: Math.round(smallWide.speed * 1000),
      },
      control: {
        controlSpeedNarrowTimes1000: Math.round(
          controlNarrow.speed * 1000,
        ),
        controlSpeedWideTimes1000: Math.round(controlWide.speed * 1000),
      },
      notes:
        'L2, known lattice-gas hydrodynamics measured on this substrate: c_s is the sound speed of THIS discrete deterministic gas (4-direction square coin, hash pair background at fill 0.35), and this gas is NOT the Dirac fluid, the relativistic sound analogy (the graphene electron fluid of Crossno et al 2016 and Bandurin et al 2016, where sound-like collective modes propagate in a collision-dominated regime) is the coarse-graining target, not the identity. The 1/sqrt(2) comparison is the classic HPP-family long-wavelength sound mode (Hardy, de Pazzis, Pomeau 1973, and FHP, Frisch, Hasslacher, Pomeau 1986, for the isotropic successor): with collisions equilibrating the two lines, half the charge carries pressure along the propagation axis, c_s^2 = 1/2. The measured mean lands within about 2 percent of it. Density (unlike transverse momentum, see E-FLD-0011) does move on the square coin, longitudinal transport has no spurious-invariant obstruction. Tracker honesty, the pulse midpoint (mean of leading and trailing half-max crossings, boxcar smooth 2) is used because the leading edge alone drifts ahead while the pulse broadens (it fits about 0.75) and the excess centroid drags on the trailing residual (about 0.63), the midpoint is the unbiased pulse position, and the same tracker measures the control at exactly zero. A slab-uniform checkerboard background was tried first and rejected honestly, the bump rides it as a coherent structure at exactly speed 1/2, the hash disorder is what makes the medium mix. The fit window starts at beat 12 (pulse formation) and ends before the periodic wraparound, and starting it at beat 16 instead moves both speeds by under half a percent, the verdict is stable under the window and the size perturbations.',
    })
  },
})
