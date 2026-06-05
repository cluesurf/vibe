// P4 / P8 Stage D: the chirality wall.
// Compare the naive, Wilson, and overlap lattice Dirac operators in 2D momentum
// space on the species count (doublers) and the Ginsparg-Wilson residual (exact
// lattice chiral symmetry). The naive operator has 2^2 = 4 doublers. Wilson cuts
// it to 1 but breaks chiral symmetry. The overlap operator gives 1 species AND a
// zero GW residual: a single fermion with exact lattice chiral symmetry, the
// ideal resolution of Nielsen-Ninomiya. See note/questions/p4-chirality-spec.md.
// Run: npx tsx code/experiment/p4-chirality.ts

import { pathToFileURL } from 'node:url'
import {
  naiveDirac2D,
  wilsonDirac2D,
  overlapDirac2D,
  scanBrillouin,
} from '~/operator/lattice-fermion'

export function main(): void {
  const gridSize = 12 // even, so k = 0 and k = pi are grid points
  const r = 1
  const m0 = 1 // in (0, 2r), keeps the physical mode and lifts doublers

  const naive = scanBrillouin({
    operator: ({ k1, k2 }) => naiveDirac2D({ k1, k2 }),
    gridSize,
  })
  const wilson = scanBrillouin({
    operator: ({ k1, k2 }) => wilsonDirac2D({ k1, k2, m: 0, r }),
    gridSize,
  })
  const overlap = scanBrillouin({
    operator: ({ k1, k2 }) => overlapDirac2D({ k1, k2, m0, r }),
    gridSize,
  })

  console.log('P4 / Stage D: the chirality wall (2D, momentum space)')
  console.log('  operator   species(zeros)  GW residual   reading')
  console.log(
    `  naive      ${String(naive.species).padStart(13)}  ${naive.gwResidualMax.toExponential(2).padStart(11)}   doubled (2^2 = 4)`,
  )
  console.log(
    `  wilson     ${String(wilson.species).padStart(13)}  ${wilson.gwResidualMax.toExponential(2).padStart(11)}   1 species, chiral symmetry broken`,
  )
  console.log(
    `  overlap    ${String(overlap.species).padStart(13)}  ${overlap.gwResidualMax.toExponential(2).padStart(11)}   1 species, exact GW chiral symmetry`,
  )
  console.log('')

  const naiveDoubled = naive.species === 4
  const wilsonOne = wilson.species === 1
  const overlapOne = overlap.species === 1
  const overlapChiral = overlap.gwResidualMax < 1e-9
  const wilsonBroken = wilson.gwResidualMax > 1e-3

  console.log(`  naive shows 4 doublers:                 ${naiveDoubled ? 'YES' : 'no'}`)
  console.log(`  Wilson removes doublers to 1 species:   ${wilsonOne ? 'YES' : 'no'}`)
  console.log(`  Wilson breaks chiral symmetry:          ${wilsonBroken ? 'YES' : 'no'}`)
  console.log(`  overlap: 1 species:                     ${overlapOne ? 'YES' : 'no'}`)
  console.log(`  overlap: exact chiral symmetry (GW=0):  ${overlapChiral ? 'YES' : 'no'}`)
  console.log('')
  console.log(
    `  chirality wall threaded: ${overlapOne && overlapChiral ? 'YES (overlap)' : 'no'}`,
  )
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
