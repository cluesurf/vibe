// P8: one gauge field and one charged fermion.
// Put a U(1) gauge field on a mesh, relax it with the Wilson heat bath, measure a
// confinement proxy, then build the covariant Kahler-Dirac operator and read its
// spectrum.
// Run: npx tsx code/experiment/p8-gauge-fermion.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { lattice } from '~/substrate/lattice'
import { Graph } from '~/core/graph'
import { makeGaugeField } from '~/core/gauge-field'
import { plaquettesOf, heatBathSweep } from '~/dynamics/wilson'
import { staticPotentialProxy } from '~/measure/wilson-loop'
import { cellComplexOf } from '~/operator/dirac'
import { covariantKahlerDirac } from '~/operator/gauge-dirac'
import { operatorFromSparse } from '~/linalg/sparse'
import { lowestEigenvalues } from '~/linalg/eig-lanczos'

export function main(): { potential: number; lowest: number[] } {
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

  for (let sweep = 0; sweep < 40; sweep++) {
    heatBathSweep({ field, plaquettes, beta: 1.5, rng })
  }
  const potential = staticPotentialProxy({ field, plaquettes })

  const complex = cellComplexOf({ substrate: graph, maxGrade: 2 })
  const dirac = covariantKahlerDirac({ complex, field, charge: 1 })
  const spectrum = lowestEigenvalues({
    operator: operatorFromSparse(dirac),
    count: 12,
  })
  const lowest = Array.from(spectrum, (x) => Math.round(x * 1000) / 1000)

  console.log('P8 gauge field plus charged fermion')
  console.log('  plaquettes              :', plaquettes.loops.length)
  console.log('  static-potential proxy  :', potential.toFixed(4))
  console.log('  covariant Dirac lowest  :', lowest.slice(0, 8).join(', '))
  return { potential, lowest }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
