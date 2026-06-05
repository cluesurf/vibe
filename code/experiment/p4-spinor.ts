// P4: the monist spinor.
// Build the Kahler-Dirac operator on a cell complex of a mesh and read its low
// spectrum. Linear dispersion near zero signals a Dirac mode; the count of
// near-zero modes is the doubler count.
// Run: npx tsx code/experiment/p4-spinor.ts

import { pathToFileURL } from 'node:url'
import { lattice } from '~/substrate/lattice'
import { cellComplexOf, diracSpectrum } from '~/operator/dirac'

export function main(): { lowest: number[]; nearZero: number } {
  const substrate = lattice({
    dimension: 2,
    extent: 10,
    signature: 'riemannian',
  })
  const complex = cellComplexOf({ substrate, maxGrade: 2 })
  const spectrum = diracSpectrum({ complex, count: 16 })
  const lowest = Array.from(spectrum, (x) => Math.round(x * 1000) / 1000)
  const nearZero = lowest.filter((x) => Math.abs(x) < 1e-6).length

  console.log('P4 Kahler-Dirac spectrum on a 2D mesh')
  console.log('  cell counts (0,1,2):', complex.cellCount.join(', '))
  console.log('  lowest eigenvalues  :', lowest.slice(0, 8).join(', '))
  console.log('  near-zero modes     :', nearZero)
  return { lowest, nearZero }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
