// Front 1: the lattice index theorem (chiral fermion meets gauge field).
// Put the overlap fermion in a 2D U(1) gauge background of topological charge Q
// and count its zero modes. The Atiyah-Singer index theorem on the lattice
// predicts zero modes = |Q|: the chiral fermion sees gauge topology exactly, as
// an integer, at finite lattice spacing. See note/questions/frontier-spec.md.
// Run: npx tsx code/experiment/p8-index.ts

import { overlapIndex } from '@/code/operator/gauge-index'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/index-theorem',
  code: 'E-FRC-0028',
  title:
    'the overlap fermion zero-mode count equals the gauge topological charge, the lattice index theorem',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const length = 6
    const charges = [0, 1, 2, -1]
    const results = charges.map(charge => {
      const result = overlapIndex({ length, charge })
      const rounded = Math.round(result.index)
      const isInteger = Math.abs(result.index - rounded) < 0.05
      const matches =
        isInteger && Math.abs(rounded) === Math.abs(charge)

      return { charge, index: result.index, matches }
    })

    const allMatch = results.every(row => row.matches)

    return verdict({
      status: allMatch ? 'pass' : 'fail',
      claim:
        'placing the overlap fermion in a U(1) gauge background of topological charge Q gives exactly the absolute value of Q zero modes as an integer, the Atiyah-Singer index theorem on the lattice',
      metrics: {
        chargeOneIndex: results[1]?.index ?? 0,
        chargeTwoIndex: results[2]?.index ?? 0,
        allMatch: allMatch ? 1 : 0,
      },
      notes:
        'L2, known physics, the Atiyah-Singer index theorem reproduced at finite lattice spacing. The gauge backgrounds are deterministic, so this is an exact integer match, not a statistical estimate. It reproduces an established construction, not an emergent result.',
    })
  },
})
