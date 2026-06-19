// Base-generator family D, the SELECTION seed, the geometry as the unique WINNER of a principle. The decisive
// discriminator is triality: among the simple root systems, D4 is the UNIQUE one whose Dynkin diagram has the
// symmetry S3 (order 6). Every other classical type has diagram-automorphism order 1 or 2. So crystallographic
// plus triality plus self-dual plus rank-4 forces the {3,4,3,4} dock. This is the general form of the v0.6.0/
// v0.7.0 spinor-forcing. Plan: theory-v0.8.0/plans/the-base-generator.md.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  cartanMatrix,
  rootsD4,
  isRootSystem,
  icosahedronVertexDirections,
} from '@/code/algebra/group/root-system'
import {
  diagramAutomorphismOrder,
  outerAutomorphismOrder,
} from '@/code/algebra/group/automorphism'

// basis vector e_i in `dim` dimensions with the given nonzero entries.
function basis(
  dim: number,
  ...entries: Array<[number, number]>
): number[] {
  const v = new Array<number>(dim).fill(0)

  for (const [index, value] of entries) {
    v[index] = value
  }

  return v
}

const chain = (dim: number, count: number) =>
  Array.from({ length: count }, (_, i) =>
    basis(dim, [i, 1], [i + 1, -1]),
  )

const aRoots = (n: number) => chain(n + 1, n)
const dRoots = (n: number) => [
  ...chain(n, n - 1),
  basis(n, [n - 2, 1], [n - 1, 1]),
]

const bRoots = (n: number) => [...chain(n, n - 1), basis(n, [n - 1, 1])]
const cRoots = (n: number) => [...chain(n, n - 1), basis(n, [n - 1, 2])]
const f4Simple = [
  [0, 1, -1, 0],
  [0, 0, 1, -1],
  [0, 0, 0, 1],
  [0.5, -0.5, -0.5, -0.5],
]

const g2Simple = [
  [0, 1, -1],
  [1, -2, 1],
]

export default experiment({
  id: 'foundations/generator-triality-unique',
  title:
    'D4 is the unique simple root system with triality, which forces the {3,4,3,4} dock',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const systems: Array<{ label: string; simple: number[][] }> = [
      { label: 'A2', simple: aRoots(2) },
      { label: 'A3', simple: aRoots(3) },
      { label: 'A4', simple: aRoots(4) },
      { label: 'A5', simple: aRoots(5) },
      { label: 'B3', simple: bRoots(3) },
      { label: 'B4', simple: bRoots(4) },
      { label: 'C3', simple: cRoots(3) },
      { label: 'C4', simple: cRoots(4) },
      { label: 'D4', simple: dRoots(4) },
      { label: 'D5', simple: dRoots(5) },
      { label: 'D6', simple: dRoots(6) },
      { label: 'F4', simple: f4Simple },
      { label: 'G2', simple: g2Simple },
    ]

    const trialitySystems = systems
      .filter(
        s => diagramAutomorphismOrder(cartanMatrix(s.simple)) === 6,
      )
      .map(s => s.label)

    const uniqueD4 =
      trialitySystems.length === 1 && trialitySystems[0] === 'D4'

    // cross-check the small-system full computation: D4's outer automorphism order is exactly 6 (S3 = triality)
    const d4Outer = outerAutomorphismOrder(rootsD4())

    // crystallographic discriminator: the dock is a root system, the {5,3,4} icosahedral coin is not
    const dockCrystallographic = isRootSystem(rootsD4())
    const icosaCrystallographic = isRootSystem(
      icosahedronVertexDirections(),
    )

    const ok =
      uniqueD4 &&
      d4Outer === 6 &&
      dockCrystallographic &&
      !icosaCrystallographic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'among the simple root systems swept, D4 alone has diagram-automorphism order 6 (the symmetric group S3, triality), confirmed by its full outer automorphism order 6, and it is crystallographic where the {5,3,4} coin is not, so triality plus crystallographicity forces the {3,4,3,4} dock',
      metrics: {
        trialitySystems: trialitySystems.length,
        d4OuterOrder: d4Outer,
        systemsSwept: systems.length,
      },
      notes: `triality systems found: ${trialitySystems.join(', ') || 'none'}; the E-type diagrams (E6 order 2, E7/E8 order 1) carry no triality either, a cited fact outside this sweep`,
    })
  },
})
