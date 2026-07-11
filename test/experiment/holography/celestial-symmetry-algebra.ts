// Celestial holography seed: the boundary conformal symmetry closes into the
// Lie algebra so(4,1). The conformal group of the ideal boundary S^3 of
// hyperbolic 4-space is O(4,1), so its generators, the boundary rotations and
// boosts, must close under commutator into so(4,1). This is the algebraic seed
// of the celestial symmetry algebra, the level at which the BMS and Virasoro
// currents live in the full theory.
//
// We build the ten generators of so(4,1), confirm each satisfies the algebra
// condition M^T eta + eta M = 0, and confirm every one of their commutators does
// too, so the algebra is closed. The control is a symmetric matrix, which is not
// in so(4,1) and whose commutator with a generator breaks closure.
//
// Depth L1. This confirms a known algebraic fact, the closure of so(4,1), the
// isometry algebra of the bulk and the conformal algebra of its boundary. It is
// the seed of the celestial symmetry algebra, not a claim that vibe dynamically
// realizes BMS or Virasoro, which would presuppose emergent Lorentzian spacetime.

import {
  algebraViolation,
  commutator,
  metricSignature,
  orthogonalGenerators,
  type Matrix,
} from '@/code/algebra/group/orthogonal-algebra'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a symmetric 5x5 matrix, not in so(4,1), the negative control
const CONTROL: Matrix = [
  [0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
]

export default experiment({
  id: 'holography/celestial-symmetry-algebra',
  code: 'E-HLG-0027',
  title:
    'the boundary conformal symmetry closes into so(4,1), the algebraic seed of the celestial symmetry algebra',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const metric = metricSignature(4, 1)
    const generators = orthogonalGenerators(metric)
    const dimension = generators.length

    let maxGeneratorViolation = 0

    for (const g of generators) {
      maxGeneratorViolation = Math.max(
        maxGeneratorViolation,
        algebraViolation(g, metric),
      )
    }

    let maxCommutatorViolation = 0

    for (let i = 0; i < generators.length; i++) {
      for (let j = i + 1; j < generators.length; j++) {
        const c = commutator(generators[i]!, generators[j]!)

        maxCommutatorViolation = Math.max(
          maxCommutatorViolation,
          algebraViolation(c, metric),
        )
      }
    }

    // control: the symmetric matrix is not in the algebra, and its commutator
    // with a generator does not close
    const controlSelf = algebraViolation(CONTROL, metric)
    const controlCommutator = algebraViolation(
      commutator(generators[0]!, CONTROL),
      metric,
    )

    const ok =
      dimension === 10 &&
      maxGeneratorViolation < 1e-12 &&
      maxCommutatorViolation < 1e-12 &&
      controlSelf > 0.5 &&
      controlCommutator > 0.5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the ten generators of so(4,1) all satisfy the algebra condition and all their commutators close, so the boundary conformal symmetry is the so(4,1) algebra, while a symmetric control matrix breaks closure',
      metrics: {
        dimension,
        maxGeneratorViolation,
        maxCommutatorViolation,
      },
      control: {
        symmetricSelf: controlSelf,
        symmetricCommutator: controlCommutator,
      },
    })
  },
})
