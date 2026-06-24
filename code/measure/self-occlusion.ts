// The perceivable fraction of a self's Being, computed several ways from the {3,4,3,4} geometry. The question
// (posed in a line of spiritual work) is how much of a 360-degree Being a self perceives, with the rest occluded,
// the analogy being a tetrahedron resting under gravity with one of its four faces hidden (3/4 = 270 degrees).
// We compute the candidate fractions exactly and honestly: the direction set, the triality split, the bulk-cusp
// dimensional structure, the tetrahedron face count, and the spinor double cover. They do NOT all agree, and that
// spread is the result: the 3/4 (270 degrees) comes specifically from the dimensional and tetrahedral occlusion,
// while the 24 directions themselves are centrally symmetric and give exactly 1/2.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { dot } from '@/code/algebra/vector'

// the fraction of the 24 directions facing outward under a view (gravity / embodiment) direction, with rim
// directions (perpendicular to the view) counted as half. Because the 24-cell is centrally symmetric (every
// direction has its antipode), the strictly-visible count equals the strictly-occluded count for every view, so
// this fraction is exactly 1/2 always. Returns the fraction and whether central symmetry held.
export function directionalFacingFraction(view: number[]): {
  fraction: number
  centrallySymmetric: boolean
  visible: number
  rim: number
  occluded: number
} {
  const d4 = rootsD4()

  let visible = 0
  let rim = 0
  let occluded = 0

  for (const r of d4) {
    const d = dot(r, view)

    if (d > 1e-9) {
      visible++
    } else if (d < -1e-9) {
      occluded++
    } else {
      rim++
    }
  }

  return {
    fraction: (visible + rim / 2) / d4.length,
    centrallySymmetric: visible === occluded,
    visible,
    rim,
    occluded,
  }
}

// the triality fraction: 24 = 8v + 8s + 8c. A self embodied with one chirality perceives the vector directions
// and its own spinor half (8 + 8 = 16), with the opposite chirality (8c) occluded. 16/24 = 2/3.
export function trialityChiralFraction(): number {
  const vector = 8
  const ownSpinor = 8
  const oppositeSpinor = 8

  return (vector + ownSpinor) / (vector + ownSpinor + oppositeSpinor)
}

// the bulk-cusp dimensional fraction: physical space is the 3D cusp (the boundary), one dimension below the 4D
// hyperbolic bulk, and the fourth bulk dimension is the radial depth beneath each point of the cusp. So a self in
// the cusp perceives 3 of the 4 dimensions, with the radial depth (the holographic "into the screen" direction)
// occluded. 3/4 = 270 degrees.
export function dimensionalCuspFraction(): {
  perceived: number
  total: number
  fraction: number
} {
  const bulkDimension = 4
  const cuspDimension = 3

  return {
    perceived: cuspDimension,
    total: bulkDimension,
    fraction: cuspDimension / bulkDimension,
  }
}

// the tetrahedron face fraction: a regular tetrahedron has 4 equal faces; resting on one under gravity, that
// face is occluded, leaving 3 visible. 3/4 = 270 degrees. This is the literal analogy, and it agrees with the
// dimensional fraction because the occluded face is the downward (radial / gravity) direction.
export function tetrahedronFaceFraction(): number {
  const faces = 4
  const occluded = 1

  return (faces - occluded) / faces
}

// the spinor double-cover fraction: on the 24-cell (the binary tetrahedral group) a full 2-pi turn acts as
// minus one, and only a 4-pi double turn returns to the start. So a single full turn covers half of a self's
// spinor identity, the other half (the sign) hidden until a second turn. 2-pi of 4-pi = 1/2.
export function spinorCoverFraction(): number {
  return (2 * Math.PI) / (4 * Math.PI)
}

// degrees from a fraction of the full 360-degree Being
export function toDegrees(fraction: number): number {
  return fraction * 360
}
