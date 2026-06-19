// P246 (GM1-GM6): {3,4,3,4} is FLAT, the honest cost of choosing spin over hyperbolic geometry. On a D4 ball:
// GM2/GM3 ball volume grows POLYNOMIALLY V(r) ~ r^4 (dimension 4, NOT exponential like {5,3,4}), GM6 graph
// distance tracks the Euclidean metric linearly, GM1 Ollivier-Ricci curvature is ~0 (flat). GM4/GM5 follow,
// polynomial growth means no fractal boundary and no holographic 1/r, the price paid for spin.
// Run: npx tsx code/experiment/p246-gm-geometry-3434.ts

import { add } from '@/code/algebra/vector'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { sinkhornW1 } from '@/code/measure/transport'
import { loglogExponentWindow } from '@/code/measure/regression'
import { pearson } from '@/code/measure/statistics'
import {
  latticeBall,
  latticeWordDistance,
} from '@/code/substrate/lattice-ball'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const euc = (p: number[]): number =>
  Math.hypot(p[0]!, p[1]!, p[2]!, p[3]!)

export function gmGeometry(): {
  exponent: number
  dimensionOk: boolean
  subexponential: boolean
  metricLinear: boolean
  ricciFlat: boolean
} {
  // The D4 lattice BFS ball and word-metric distance live in code/substrate/lattice-ball.
  const roots = rootsD4()
  const { dist } = latticeBall({ generators: roots, radius: 9 })
  // GM2/GM3: V(r) volume growth
  const Vr: number[] = []

  for (let r = 0; r <= 9; r++) {
    let c = 0

    for (const d of dist.values()) {
      if (d <= r) {
        c++
      }
    }

    Vr.push(c)
  }

  // fit log V ~ dim * log r over r = 3..9
  const exponent = loglogExponentWindow({ values: Vr, lo: 3, hi: 9 })
  const dimensionOk = Math.abs(exponent - 4) < 0.5
  const ratios = [6, 7, 8, 9].map(r => Vr[r]! / Vr[r - 1]!)
  const subexponential =
    ratios.every(q => q < 2.2) && ratios[3]! < ratios[0]! + 0.01 // ratio decreasing toward 1, not constant > 1

  // GM6: graph distance vs Euclidean, linear correlation
  const samples = [...dist.entries()]
    .filter(([, d]) => d >= 1 && d <= 6)
    .slice(0, 400)

  const graphDistances = samples.map(([, d]) => d)
  const euclideanDistances = samples.map(([k]) =>
    euc(k.split(',').map(Number)),
  )

  const corr = pearson({ a: graphDistances, b: euclideanDistances })
  const metricLinear = corr > 0.9 // D4 word metric is flat but anisotropic, strong linear correlation with Euclidean

  // GM1: Ollivier-Ricci of an edge (origin, root0), Sinkhorn W1 over the two 24-neighbour distributions
  const x = [0, 0, 0, 0],
    y = roots[0]!

  const nx = roots.map(r => add(x, r)),
    ny = roots.map(r => add(y, r))

  const C = nx.map(a =>
    ny.map(b =>
      latticeWordDistance({ a, b, generators: roots, cap: 6 }),
    ),
  )

  const w1 = sinkhornW1(C, 0.05, 400)
  const ricci = 1 - w1 / 1 // d(x,y) = 1
  const ricciFlat = Math.abs(ricci) < 0.12

  return {
    exponent,
    dimensionOk,
    subexponential,
    metricLinear,
    ricciFlat,
  }
}

// The {3,4,3,4} D4 lattice is flat, the honest cost of choosing spin over hyperbolic
// geometry. On a D4 ball the volume grows polynomially as r^4 (dimension 4, not the
// exponential growth of {5,3,4}), the graph distance tracks the Euclidean metric linearly,
// and the Ollivier-Ricci curvature of an edge is near zero (flat). Polynomial growth means
// no fractal boundary and no holographic 1/r, the price paid for spin. These are known
// properties of the flat D4 root lattice, so L1.
export default experiment({
  id: 'geometry/gm-geometry-3434',
  title:
    'the {3,4,3,4} D4 lattice is flat: polynomial r^4 growth, linear metric, near-zero curvature',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = gmGeometry()
    const ok =
      r.dimensionOk && r.subexponential && r.metricLinear && r.ricciFlat

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} D4 ball grows polynomially as r^4, tracks the Euclidean metric linearly, and has near-zero edge curvature, so it is flat',
      metrics: {
        volumeExponent: r.exponent,
        dimensionFourOk: r.dimensionOk ? 1 : 0,
        polynomialGrowthOk: r.subexponential ? 1 : 0,
        metricLinearOk: r.metricLinear ? 1 : 0,
        curvatureFlatOk: r.ricciFlat ? 1 : 0,
      },
      notes:
        'L1, known geometry of the flat D4 root lattice. The contrast is the hyperbolic {5,3,4} with negative curvature and exponential growth. Flatness is the honest cost of choosing spin, no fractal boundary, no holographic 1/r.',
    })
  },
})
