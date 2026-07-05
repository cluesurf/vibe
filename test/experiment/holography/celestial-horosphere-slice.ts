// Celestial holography seed: reading a hyperbolic slice of the bulk out to a
// flat boundary chart keeps the conformal structure. This is the discrete seed
// of Pasterski's hyperbolic slicing of Minkowski, where the celestial sphere
// sits at the boundary of the hyperbolic slices, and it is the one genuine
// geometric contact, vibe's bulk is hyperbolic and her slices are hyperbolic.
//
// The horocyclic projection (the substrate's own cusp map, code/substrate/
// horosphere) inverts about an ideal point and projects onto the horosphere
// frame, a stereographic map to a flat chart. A stereographic map is conformal,
// so it must preserve the cross-ratio of ideal boundary points. We check that
// the cross-ratio of four D4 boundary directions matches the cross-ratio of
// their flat-chart images. A linear coordinate drop, which is not conformal, is
// the control.
//
// Depth L2. This reproduces a known geometric fact, the conformality of the
// horocyclic projection, on the substrate. It is the seed of reading a
// hyperbolic slice out to a flat conformal boundary, not a celestial amplitude.

import { normalize, type Vec } from '@/code/algebra/vector'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { horoFrame, horocyclicProject } from '@/code/substrate/horosphere'
import { crossRatio } from '@/code/measure/cross-ratio'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const FOUR_DIRECTIONS: Vec[] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, -1],
]
// the ideal point the horosphere sits at, another D4 direction
const IDEAL: Vec = [0, 0, 1, 1]

export default experiment({
  id: 'holography/celestial-horosphere-slice',
  code: 'E-HLG-0168',
  title:
    'the horocyclic projection to the flat boundary chart preserves the conformal cross-ratio, the seed of the hyperbolic slicing',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const grounded = [IDEAL, ...FOUR_DIRECTIONS].every(v =>
      roots.some(r => r.every((c, i) => Math.abs(c - v[i]!) < 1e-9)),
    )

    const ideal = normalize(IDEAL)
    const frame = horoFrame(ideal)
    const points = FOUR_DIRECTIONS.map(normalize)

    // the flat-chart images under the substrate's own horocyclic projection
    const flat = points.map(point =>
      horocyclicProject({ point, ideal, frame }),
    )

    const crBoundary = crossRatio(points)
    const crFlat = crossRatio(flat)
    const residual = Math.abs(crBoundary - crFlat) / Math.abs(crBoundary)

    // control: a non-conformal linear coordinate drop does not preserve it
    const dropped = points.map(p => [p[0]!, p[1]!, p[2]!])
    const crDropped = crossRatio(dropped)
    const controlResidual = Math.abs(crBoundary - crDropped) / Math.abs(crBoundary)

    const ok = grounded && residual < 1e-6 && controlResidual > 1e-2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the horocyclic projection of the boundary directions to the flat horosphere chart preserves their conformal cross-ratio, so a hyperbolic slice read out to the flat boundary keeps the conformal structure, while a linear coordinate drop does not',
      metrics: { crossRatioResidual: residual, crossRatioBoundary: crBoundary },
      control: { coordinateDropResidual: controlResidual },
    })
  },
})
