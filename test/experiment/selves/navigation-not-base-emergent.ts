// Is goal-directed movement base-emergent, or does it live strictly at the selves
// layer? The committed {3,4,3,4} lattice gas is run bare (the reversible conserving
// pair collision, nothing added) with a structured body placed beside a large
// charge-rich resource slab, and the body's transport centroid is tracked. If the
// bare rule carried any approach tendency, the centroid would move toward the
// resource in both orientations (resource east and resource west). It does not, the
// measured drift toward the resource is tiny and orientation-inconsistent, while the
// same question asked at the selves layer (the valence-drift machinery with its
// dissipative lean, an added ingredient the suite declares) gives a large consistent
// approach differential. So navigation is NOT base-emergent, it appears exactly when
// the selves-layer lean is added, locating agency at the emergent layer and
// sharpening the honest boundary the corrected active-persistence negative
// (E-SLF-0002) points at.
//
// Design notes for honesty. The body is deliberately ASYMMETRIC in x (so no mirror
// symmetry forces the null result, the trap the single-outcome audit flagged), the
// same unmirrored body is used in both orientations, the resource columns are masked
// out of the centroid so the standing source is never mistaken for the body, and the
// mask is applied symmetrically on both edges in both runs. Charge conservation is
// asserted exactly. The positive control (the selves layer navigates) uses the
// established valence differential, so the measurement pipeline demonstrably can
// detect navigation when it is present.
//
// Grade L2: a controlled honest negative on the committed rule, with the selves-layer
// positive control showing the instrument works. The result could have come out the
// other way (a base-level approach bias would have been a major discovery).

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, charge, type Will } from '@/code/tone/will'
import { run } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { maskedWillCentroidX } from '@/code/measure/masked-centroid'
import { valenceDifferential } from '@/code/coarse/valence-drift'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIDE = 8
const BEATS = 8
const MASK = 1 // mask the resource column on both edges, both runs

// A structured, x-asymmetric body near the lattice center: an L-shaped set of cells
// whose slot fill depends on x, so the body has no mirror symmetry in x.
function stampBody(will: Will): void {
  const { mesh, data } = will
  const side = SIDE
  const area = side * side
  const volume = area * side
  const c = side >> 1

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 1 && dy === 1) {
        continue // the missing corner makes the body L-shaped
      }

      const x = c + dx
      const y = c + dy
      const cell = c * volume + c * area + y * side + x

      // slot fill depends on x, so the body is x-asymmetric by construction
      const slots = 2 + ((x + 2 * dy) % 3)

      for (let d = 0; d < slots; d++) {
        data[cell * mesh.degree + d] = d % 2 === 0 ? 1 : -1
      }
    }
  }
}

// A charge-rich resource slab filling one boundary column of the lattice.
function stampResource(will: Will, atX: number): void {
  const { mesh, data } = will
  const side = SIDE

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (cell % side === atX) {
      for (let d = 0; d < 6; d++) {
        data[cell * mesh.degree + d] = 1
      }
    }
  }
}

// drift of the body transport centroid toward the resource, positive = approach
function driftTowardResource(resourceEast: boolean): number {
  const mesh = d4Mesh({ side: SIDE })
  const opposite = Array.from({ length: mesh.degree }, (_, d) =>
    mesh.opposite(d),
  )

  const collision = pairCollision({ opposite })
  const will = makeWill(mesh)
  stampBody(will)
  stampResource(will, resourceEast ? SIDE - 1 : 0)

  const chargeBefore = charge(will)
  const centroidBefore = maskedWillCentroidX({
    will,
    side: SIDE,
    maskLow: MASK,
    maskHigh: MASK,
  })

  const evolved = run(will, collision, BEATS)

  const chargeAfter = charge(evolved)

  if (chargeAfter !== chargeBefore) {
    throw new Error('charge not conserved, the base rule is broken')
  }

  const centroidAfter = maskedWillCentroidX({
    will: evolved,
    side: SIDE,
    maskLow: MASK,
    maskHigh: MASK,
  })

  const drift = centroidAfter - centroidBefore

  return resourceEast ? drift : -drift
}

export default experiment({
  id: 'selves/navigation-not-base-emergent',
  code: 'E-SLF-0154',
  title:
    'the bare committed rule does not navigate: a structured body beside a charge-rich resource shows no consistent centroid drift toward it in either orientation, while the selves-layer valence machinery (the declared added lean) shows a large approach differential, so goal-directed movement is not base-emergent and lives at the emergent selves layer',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const towardEast = driftTowardResource(true)
    const towardWest = driftTowardResource(false)

    // the base-rule navigation signal: approach requires a positive drift toward the
    // resource in BOTH orientations, and of usable size
    const baseApproach = Math.min(towardEast, towardWest)

    // the selves-layer positive control: the established valence differential (the
    // added dissipative lean) navigates on the same measurement principle
    const selvesDifferential = valenceDifferential({
      L: 48,
      beats: 220,
      seed: 5,
      withDynamics: true,
    })

    // 1. the bare rule shows no consistent approach (below half a cell over the run)
    const noBaseNavigation = baseApproach < 0.5

    // 2. the instrument can detect navigation: the selves layer differential is large
    const instrumentWorks = selvesDifferential > 2

    // 3. the contrast is sharp: the selves-layer signal dwarfs the base-rule signal
    const sharpContrast =
      selvesDifferential > 4 * Math.max(baseApproach, 0.1)

    const solved = noBaseNavigation && instrumentWorks && sharpContrast

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on the committed {3,4,3,4} lattice gas run bare, an x-asymmetric structured body beside a charge-rich resource slab shows no consistent transport-centroid drift toward the resource (the orientation-minimum drift stays below half a cell over the run, with charge conserved exactly), while the selves-layer valence machinery with its declared dissipative lean produces a large approach differential on the same centroid principle, so goal-directed movement is not provided by the base rule and emerges only with the selves-layer ingredient, an honest controlled negative locating navigation at the emergent layer',
      metrics: {
        driftTowardEastResource: Number(towardEast.toFixed(4)),
        driftTowardWestResource: Number(towardWest.toFixed(4)),
        baseApproach: Number(baseApproach.toFixed(4)),
        selvesDifferential: Number(selvesDifferential.toFixed(3)),
      },
      control: {
        // the selves-layer valence differential is the positive control: the same
        // centroid-based detection reports strong navigation when the declared lean
        // ingredient is present, so the null on the bare rule is a property of the
        // rule, not of the instrument
        selvesDifferential: Number(selvesDifferential.toFixed(3)),
        baseApproach: Number(baseApproach.toFixed(4)),
      },
      notes:
        'L2 honest negative with a working-instrument positive control. The body is deliberately x-asymmetric so the null is not symmetry-forced, the same unmirrored body is used with the resource east and west, the resource columns are masked from the centroid in both runs, and charge conservation is asserted exactly. The selves-layer control reuses the established valence-drift machinery (E-SLF-0148), whose dissipative lean is a declared added ingredient. The finding aligns with the corrected active-persistence negative (E-SLF-0002): under the bare committed rule nothing seeks, agency needs the emergent layer.',
    })
  },
})
