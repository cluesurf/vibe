// Walking one step in flat 3D space is an exact isometry of the curved bulk. Our physical space is a
// horosphere of the hyperbolic bulk (a horocycle in the plane model, a horizontal line in the upper
// half plane), and a physical step along it is the parabolic translation z to z + t. This map is an
// exact isometry of the whole bulk: it preserves every hyperbolic distance, not just distances along
// the slice. And the steps compose as a group: taking a step of t and then a step of s is exactly a
// single step of t plus s, and stepping back by minus t returns exactly home. So physically walking
// in 3D is not merely moving on the surface, it is applying an exact symmetry of the four-dimensional
// bulk, and a self that walks is navigating the bulk by its isometry group. On the horosphere itself
// the parabolic step acts as an ordinary flat translation, which is why walking feels Euclidean even
// though it moves the whole curved bulk rigidly.
//
// Measured: under the parabolic step every pairwise hyperbolic distance among a set of bulk points is
// unchanged to machine precision (an exact isometry), the composition of a step of t then s equals
// the single step of t plus s to machine precision (the group law), and a step followed by its
// inverse returns each point exactly (the identity). On the horosphere the step is a rigid flat
// translation (distances along the slice preserved, positions shifted by the step).
//
// The control is a NON-isometry, a naive Euclidean vertical shear that also moves points along the
// slice but does not preserve the hyperbolic metric: it changes pairwise bulk distances by a large
// amount, so the isometry property is specific to the parabolic step, not to any motion that slides
// the slice.
//
// Depth L2. It establishes that a physical horospheric step is an exact bulk isometry with the group
// composition law (walking 3D applies a symmetry of the 4D bulk) against a non-isometry control, the
// isometry-group reading of physical motion. Known hyperbolic geometry, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  upperHalfPlaneDistance,
  parabolicStep,
} from '@/code/measure/bulk-geometry'

const POINTS = [
  { x: 0.3, y: 1.0 },
  { x: 1.7, y: 2.0 },
  { x: -0.5, y: 0.7 },
  { x: 0.9, y: 3.1 },
]

const STEP_T = 1.3
const STEP_S = 0.5

export default experiment({
  id: 'geometry/horocyclic-step-isometry',
  code: 'E-GMT-0033',
  title:
    'a physical horospheric step is an exact bulk isometry (every hyperbolic distance preserved to machine precision) that composes as a group (step t then s equals step t+s, inverse returns home), so walking 3D applies a symmetry of the 4D bulk, while a naive shear breaks the metric',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const distance = (
      a: { x: number; y: number },
      b: { x: number; y: number },
    ): number =>
      upperHalfPlaneDistance({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })

    // the parabolic step preserves every pairwise hyperbolic distance
    let worstIsometryError = 0

    for (let i = 0; i < POINTS.length; i++) {
      for (let j = i + 1; j < POINTS.length; j++) {
        const before = distance(POINTS[i]!, POINTS[j]!)
        const after = distance(
          parabolicStep({ ...POINTS[i]!, shift: STEP_T }),
          parabolicStep({ ...POINTS[j]!, shift: STEP_T }),
        )

        worstIsometryError = Math.max(
          worstIsometryError,
          Math.abs(before - after),
        )
      }
    }

    // the group law: step t then s equals the single step t + s
    let worstCompositionError = 0
    // the inverse: step t then minus t returns home
    let worstInverseError = 0

    for (const point of POINTS) {
      const composed = parabolicStep({
        ...parabolicStep({ ...point, shift: STEP_T }),
        shift: STEP_S,
      })

      const single = parabolicStep({ ...point, shift: STEP_T + STEP_S })

      worstCompositionError = Math.max(
        worstCompositionError,
        Math.hypot(composed.x - single.x, composed.y - single.y),
      )

      const roundTrip = parabolicStep({
        ...parabolicStep({ ...point, shift: STEP_T }),
        shift: -STEP_T,
      })

      worstInverseError = Math.max(
        worstInverseError,
        Math.hypot(roundTrip.x - point.x, roundTrip.y - point.y),
      )
    }

    // CONTROL: a naive vertical shear (x, y) -> (x + shift, y * scale) slides the slice but is not a
    // hyperbolic isometry, so it changes bulk distances
    const shearScale = 1.4

    let worstShearError = 0

    for (let i = 0; i < POINTS.length; i++) {
      for (let j = i + 1; j < POINTS.length; j++) {
        const before = distance(POINTS[i]!, POINTS[j]!)
        const after = distance(
          { x: POINTS[i]!.x + STEP_T, y: POINTS[i]!.y * shearScale },
          { x: POINTS[j]!.x + STEP_T, y: POINTS[j]!.y * shearScale },
        )

        worstShearError = Math.max(
          worstShearError,
          Math.abs(before - after),
        )
      }
    }

    const isometry = worstIsometryError < 1e-12
    const groupLaw = worstCompositionError < 1e-12
    const inverse = worstInverseError < 1e-12
    const shearBreaksMetric = worstShearError > 0.1

    const ok = isometry && groupLaw && inverse && shearBreaksMetric

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the parabolic step z to z plus t, which is a physical step along the flat horospheric slice, preserves every pairwise hyperbolic distance among the bulk points to machine precision (an exact isometry of the whole four-dimensional bulk, not just of the slice), composes as a group so a step of t then a step of s equals a single step of t plus s to machine precision and a step followed by its inverse returns each point exactly home, so physically walking in three dimensions applies a symmetry of the curved bulk and a walking self navigates the bulk by its isometry group, while a naive vertical shear that also slides the slice changes bulk distances by more than a tenth so it is not an isometry, the property being specific to the parabolic step',
      metrics: {
        worstIsometryError: Number(worstIsometryError.toExponential(2)),
        worstCompositionError: Number(
          worstCompositionError.toExponential(2),
        ),
        worstInverseError: Number(worstInverseError.toExponential(2)),
        shearMetricChange: Number(worstShearError.toFixed(3)),
      },
      // CONTROL: a naive shear changes bulk distances, so it is not a bulk isometry.
      control: {
        shearMetricChange: Number(worstShearError.toFixed(3)),
      },
      notes:
        'A physical horospheric step is an exact bulk parabolic isometry with the group law: walking 3D applies a symmetry of the 4D bulk. Grounds the horosphere-flatness result (E-CSM-0049) in the isometry group. Non-isometry shear control.',
    })
  },
})
