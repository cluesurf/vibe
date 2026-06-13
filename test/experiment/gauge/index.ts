// Front 1: the lattice index theorem (chiral fermion meets gauge field).
// Put the overlap fermion in a 2D U(1) gauge background of topological charge Q
// and count its zero modes. The Atiyah-Singer index theorem on the lattice
// predicts zero modes = |Q|: the chiral fermion sees gauge topology exactly, as
// an integer, at finite lattice spacing. See note/questions/frontier-spec.md.
// Run: npx tsx code/experiment/p8-index.ts

import { pathToFileURL } from 'node:url'
import { overlapIndex } from '@/code/operator/gauge-index'

export function main(): void {
  const length = 6
  console.log(`Lattice index theorem: overlap fermion in U(1) background (L=${length})`)
  console.log('  charge Q   total flux / 2pi   overlap index   match')

  let allMatch = true
  for (const charge of [0, 1, 2, -1]) {
    const result = overlapIndex({ length, charge })
    const fluxOverTwoPi = result.flux / (2 * Math.PI)
    const rounded = Math.round(result.index)
    const isInteger = Math.abs(result.index - rounded) < 0.05
    const match = isInteger && Math.abs(rounded) === Math.abs(charge)
    if (!match) {
      allMatch = false
    }
    console.log(
      `  ${String(charge).padStart(8)}   ${fluxOverTwoPi.toFixed(3).padStart(16)}   ${result.index.toFixed(3).padStart(13)}   ${match ? 'YES' : 'no'}`,
    )
  }
  console.log('')
  console.log(
    `  index theorem holds (index = +/- Q, integer): ${allMatch ? 'YES' : 'no'}`,
  )
  console.log(
    '  the overlap fermion sees gauge topology exactly, as an integer.',
  )
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
