// The holographic question, tested honestly. In hyperbolic space two cells can be
// far apart in the bulk yet close on the boundary at infinity (their geodesics from
// the centre point in nearly the same direction). If the entangling correlation
// lived on the boundary, it would track the BOUNDARY angle between two cells, not
// their BULK distance, and so could be distance-independent. That would be the
// holographic escape from the shared-past collapse.
//
// This measures it on a genuine 2D hyperbolic tessellation with Poincare
// coordinates ({7,3}, buildCellGraph). For many interior pairs it records the bulk
// graph distance d, the boundary angular separation theta (the angle between the
// two cells' directions from the disk centre), and the measured shared-past
// fraction eta. Then it asks which variable controls eta.
//
// Measured result: eta tracks the BULK distance (a strong negative correlation),
// and once the bulk distance is held fixed it has essentially no dependence on the
// boundary angle (the partial correlation is near zero). So the bulk shared past is
// bulk-mediated, not boundary-mediated. The simple spatial-boundary holographic
// shortcut does NOT operate at the cone level. This is an honest negative for that
// route, and it sharpens the picture: the distance-independent channel that DOES
// survive is the PAST boundary, the shared growth seed (E-QTM-0029 and
// E-QTM-0030), not the spatial boundary at infinity.
//
// Grade L2: a measured geometric property of the substrate (eta is bulk-mediated)
// with a clean control (the boundary angle, which could have been the controlling
// variable and is not).

import { neighborDistances } from '@/code/tool/graph'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { backwardCone } from '@/code/measure/shared-past'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const CONE_DEPTH = 1

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length

  if (n < 3) {
    return 0
  }

  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n

  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    const dx = (xs[i] ?? 0) - meanX
    const dy = (ys[i] ?? 0) - meanY
    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }

  const denom = Math.sqrt(sxx * syy)

  return denom > 0 ? sxy / denom : 0
}

// The correlation of x and y with the linear effect of z removed.
function partialCorrelation(input: {
  x: number[]
  y: number[]
  z: number[]
}): number {
  const xy = pearson(input.x, input.y)
  const xz = pearson(input.x, input.z)
  const yz = pearson(input.y, input.z)
  const denom = Math.sqrt((1 - xz * xz) * (1 - yz * yz))

  return denom > 0 ? (xy - xz * yz) / denom : 0
}

export default experiment({
  id: 'quantum/boundary-shared-past',
  code: 'E-QTM-0031',
  title:
    'the bulk shared past is bulk-mediated, not boundary-mediated: an honest negative for the spatial-holographic escape, the surviving channel is the past-boundary seed',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const graph = buildCellGraph({
      symbol: [7, 3],
      maxCells: 12000,
    })

    const neighbors = graph.neighbors
    const size = graph.cellCount
    const coords = graph.coords
    const fullDegree = 7

    // Interior cells: full degree, with high-degree neighbours, so a depth-1 cone
    // is not truncated by the frontier, and away from the disk centre where the
    // boundary angle is ill-defined.
    const angleOf = (cell: number): number =>
      Math.atan2(coords[cell]?.[1] ?? 0, coords[cell]?.[0] ?? 0)

    const radiusOf = (cell: number): number =>
      Math.hypot(coords[cell]?.[0] ?? 0, coords[cell]?.[1] ?? 0)

    const interior: number[] = []

    for (let cell = 0; cell < size; cell++) {
      const row = neighbors[cell] ?? []

      if (
        row.length === fullDegree &&
        row.every(n => (neighbors[n] ?? []).length >= fullDegree - 1) &&
        radiusOf(cell) >= 0.3
      ) {
        interior.push(cell)
      }
    }

    const eta = (a: number, b: number): number => {
      const coneA = backwardCone({
        neighbors,
        size,
        cell: a,
        depth: CONE_DEPTH,
      })

      const coneB = backwardCone({
        neighbors,
        size,
        cell: b,
        depth: CONE_DEPTH,
      })

      let shared = 0

      for (const cell of coneA) {
        if (coneB.has(cell)) {
          shared++
        }
      }

      return coneA.size > 0 ? shared / coneA.size : 0
    }

    // Deterministic stride over interior pairs (no random sampling).
    const bulkDistances: number[] = []
    const boundaryAngles: number[] = []
    const etas: number[] = []
    const stride = Math.max(1, Math.floor(interior.length / 60))

    for (let i = 0; i < interior.length; i += stride) {
      const a = interior[i]!
      const fromA = neighborDistances({ neighbors, size, source: a })

      for (let j = i + stride; j < interior.length; j += stride) {
        const b = interior[j]!
        const d = fromA[b] ?? -1

        if (d < 1 || d > 6) {
          continue
        }

        let theta = Math.abs(angleOf(a) - angleOf(b))

        if (theta > Math.PI) {
          theta = 2 * Math.PI - theta
        }

        bulkDistances.push(d)
        boundaryAngles.push(theta)
        etas.push(eta(a, b))
      }
    }

    const corrEtaDistance = pearson(etas, bulkDistances)
    const corrEtaAngle = pearson(etas, boundaryAngles)
    const corrDistanceAngle = pearson(bulkDistances, boundaryAngles)
    const partialEtaAngle = partialCorrelation({
      x: etas,
      y: boundaryAngles,
      z: bulkDistances,
    })

    // 1. eta is controlled by the bulk distance (strong negative correlation).
    const bulkMediated = Math.abs(corrEtaDistance) > 0.4

    // 2. Once the bulk distance is fixed, eta does not track the boundary angle.
    //    The spatial-boundary holographic shortcut does not operate.
    const notBoundaryMediated = Math.abs(partialEtaAngle) < 0.25

    const solved =
      bulkMediated && notBoundaryMediated && etas.length >= 30

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on a genuine hyperbolic tessellation the bulk shared-past fraction tracks the bulk distance between two cells and, with the bulk distance held fixed, has essentially no dependence on their boundary angle, so the bulk shared past is bulk-mediated not boundary-mediated and the simple spatial-holographic escape does not operate at the cone level; the surviving distance-independent channel is the past-boundary seed',
      metrics: {
        pairs: etas.length,
        corrEtaDistance,
        corrEtaAngle,
        corrDistanceAngle,
        partialEtaAngle,
      },
      control: {
        // The boundary angle is the control variable: it could have been what
        // controls eta (the holographic hypothesis), and the partial correlation
        // shows it is not, once bulk distance is accounted for.
        partialEtaAngle,
      },
      notes:
        'L2, an honest negative for the spatial-holographic route. eta is the exact integer cone-overlap fraction, deterministic; the pair set is a fixed stride over interior cells, no random sampling. The raw eta-angle correlation is small and is mostly induced by the distance-angle correlation, which the partial correlation removes. This does not refute holography in general: the past-boundary (seed) channel measured in E-QTM-0029 and E-QTM-0030 is the real distance-independent survivor. It refutes the simpler claim that the bulk shared past rides on the spatial boundary at infinity.',
    })
  },
})
