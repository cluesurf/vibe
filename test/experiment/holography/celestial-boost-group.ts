// Celestial holography seed: boosts along one axis form a one-parameter dilation
// group, the structure Pasterski's Mellin transform to the conformal primary
// (boost) basis diagonalizes. Two boosts along the same boundary axis compose
// into a single boost whose rapidity is the sum of the two, so the boost weight
// (the conformal dimension) is an additive label. Boosts along different axes do
// not compose this way, they need a rotation, which is the control.
//
// Depth L2. This reproduces a known group law, the composition of hyperbolic
// translations, on the substrate's boundary directions. It is the seed of the
// boost-weight basis, not a celestial amplitude.

import { normalize, norm, scale, sub, type Vec } from '@/code/algebra/vector'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { ballIsometry } from '@/code/geometry/mobius'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const FOUR_DIRECTIONS: Vec[] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, -1],
]
const AXIS_A: Vec = [1, 0, -1, 0]
const AXIS_B: Vec = [0, 1, 1, 0]
const S1 = 0.3
const S2 = 0.45

// the boost radius that adds the two rapidities, s = tanh(rho / 2)
function composedRadius(s1: number, s2: number): number {
  const rho = 2 * Math.atanh(s1) + 2 * Math.atanh(s2)
  return Math.tanh(rho / 2)
}

function maxPointGap(a: (v: Vec) => Vec, b: (v: Vec) => Vec, points: Vec[]): number {
  let worst = 0
  for (const p of points) {
    worst = Math.max(worst, norm(sub(a(p), b(p))))
  }
  return worst
}

export default experiment({
  id: 'holography/celestial-boost-group',
  code: 'E-HLG-0164',
  title:
    'same-axis boundary boosts compose by adding rapidity, the dilation group the Mellin boost-weight basis diagonalizes',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const grounded =
      [AXIS_A, AXIS_B, ...FOUR_DIRECTIONS].every(v =>
        roots.some(r => r.every((c, i) => Math.abs(c - v[i]!) < 1e-9)),
      )
    const points = FOUR_DIRECTIONS.map(normalize)
    const u = normalize(AXIS_A)

    const boost1 = ballIsometry(scale(u, S1))
    const boost2 = ballIsometry(scale(u, S2))
    const composedSameAxis = (x: Vec) => boost2(boost1(x))
    const predicted = ballIsometry(scale(u, composedRadius(S1, S2)))
    const sameAxisResidual = maxPointGap(composedSameAxis, predicted, points)

    // control: different axes do not compose into the same single boost
    const boost2b = ballIsometry(scale(normalize(AXIS_B), S2))
    const composedDiffAxis = (x: Vec) => boost2b(boost1(x))
    const diffAxisResidual = maxPointGap(composedDiffAxis, predicted, points)

    const ok = grounded && sameAxisResidual < 1e-9 && diffAxisResidual > 1e-2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two boosts along one boundary axis compose into a single boost of summed rapidity, so the boost weight is an additive dilation label, while two boosts along different axes do not',
      metrics: { sameAxisResidual, diffAxisResidual, s1: S1, s2: S2 },
      control: { differentAxisResidual: diffAxisResidual },
    })
  },
})
