// P8: one gauge field and one charged fermion.
// Put a U(1) gauge field on a mesh, relax it with the Wilson heat bath, measure a
// confinement proxy, then build the covariant Kahler-Dirac operator and read its
// spectrum.
// Run: npx tsx code/experiment/p8-gauge-fermion.ts

import { makeRng } from '@/code/tool/rng'
import { lattice } from '@/code/substrate/lattice'
import { Graph } from '@/code/tool/graph'
import { makeGaugeField } from '@/code/tool/gauge-field'
import { plaquettesOf, heatBathSweep } from '@/code/dynamics/wilson'
import { staticPotentialProxy } from '@/code/measure/wilson-loop'
import { cellComplexOf } from '@/code/operator/dirac'
import { covariantKahlerDirac } from '@/code/operator/gauge-dirac'
import { operatorFromSparse } from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function study(): { potential: number; lowest: number[] } {
  const rng = makeRng({ seed: 9 })
  const substrate = lattice({
    dimension: 2,
    extent: 12,
    signature: 'riemannian',
  })

  // the riemannian lattice is a Graph
  const graph = substrate as Graph
  const field = makeGaugeField({ graph, group: { form: 'u1', q: 12 } })
  const plaquettes = plaquettesOf({ graph })

  for (let sweep = 0; sweep < 40; sweep++)
    heatBathSweep({ field, plaquettes, beta: 1.5, rng })

  const potential = staticPotentialProxy({ field, plaquettes })

  const complex = cellComplexOf({ substrate: graph, maxGrade: 2 })
  const dirac = covariantKahlerDirac({ complex, field, charge: 1 })
  const spectrum = lowestEigenvalues({
    operator: operatorFromSparse(dirac),
    count: 12,
  })

  const lowest = Array.from(spectrum, x => Math.round(x * 1000) / 1000)

  return { potential, lowest }
}

export default experiment({
  id: 'gauge/gauge-fermion',
  code: 'E-FRC-0023',
  title:
    'a covariant Kahler-Dirac fermion in a relaxed U(1) gauge background has a clean spectrum',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const result = study()
    const ok =
      result.lowest.length === 12 &&
      result.lowest.every(value => Number.isFinite(value)) &&
      Number.isFinite(result.potential)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'relaxing a U(1) gauge field with the Wilson heat bath and building the covariant Kahler-Dirac operator gives a finite static-potential proxy and a well-defined low-lying spectrum',
      metrics: {
        potential: result.potential,
        lowest: result.lowest[0] ?? 0,
        spectrumCount: result.lowest.length,
      },
      notes:
        'L2, known physics, standard lattice U(1) gauge theory plus a covariant Dirac operator. The gauge field is thermalized from a pseudo-random seed, so the numbers are one sample of an ensemble, not a deterministic-base result. This checks the construction runs and is well-defined, not an emergent claim.',
    })
  },
})
