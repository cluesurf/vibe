import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'

// DS14 (experiments/16). The range-scan caveat (an honest negative). A contiguous range query over a radius-rho
// neighbourhood must visit every cell in a horoball, and a hyperbolic horoball holds exponentially many cells,
// so range scans are the structure the bulk is worst at. We measure the ball size (cumulative cells within a
// radius) and its growth ratio for the hyperbolic {3,4,3,4} (exponential, expensive) against the flat
// {3,4,3,3} (polynomial). Reference, Uhlmann 1991, Ciaccia et al. 1997.

const ballSize = (shells: number[], radius: number): number =>
  shells.slice(0, radius + 1).reduce((sum, size) => sum + size, 0)

export default experiment({
  id: 'data-structure/range-scan',
  title: 'DS14: a range scan in the hyperbolic bulk visits exponentially many cells (the caveat)',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const hyperbolic = buildCoxeterMatrixMesh([3, 4, 3, 4], 4000)
    const flat = buildCoxeterMatrixMesh([3, 4, 3, 3], 4000)
    const radius = 7

    const hyperbolicBall = ballSize(hyperbolic.shells, radius)
    const flatBall = ballSize(flat.shells, radius)
    // the per-radius growth of the scan cost, exponential in the bulk, toward 1 (polynomial) when flat
    const hyperbolicBallRatio = ballSize(hyperbolic.shells, radius) / ballSize(hyperbolic.shells, radius - 1)
    const flatBallRatio = ballSize(flat.shells, radius) / ballSize(flat.shells, radius - 1)

    // the hyperbolic range-scan cost grows exponentially and exceeds the flat one at the same radius
    const exponentialScanCost = hyperbolicBallRatio > 1.3 && hyperbolicBall > flatBall

    return verdict({
      status: exponentialScanCost ? 'pass' : 'fail',
      claim:
        'a radius-rho range scan in the hyperbolic bulk visits exponentially many cells (the ball grows by a ratio bounded above 1), far more than the flat honeycomb at the same radius, so contiguous range queries are the bulk worst case',
      metrics: {
        hyperbolicBallSize: hyperbolicBall,
        hyperbolicBallRatio,
        scanCostExponential: exponentialScanCost ? 1 : 0,
      },
      // CONTROL: the flat {3,4,3,3} ball grows polynomially (ratio toward 1) and is smaller at the same radius,
      // so the exponential scan cost is the negative curvature.
      control: { flatBallSize: flatBall, flatBallRatio },
      notes:
        'DS14 of experiments/16, an honest NEGATIVE. With DS13 it bounds the cost side, the bulk is excellent for point, prefix, and tree queries and poor for dense range scans.',
    })
  },
})
