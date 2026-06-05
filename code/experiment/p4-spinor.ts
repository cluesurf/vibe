// P4: the monist spinor.
// Build the Kahler-Dirac operator on a cell complex of a mesh. The Dirac
// operator is indefinite (its spectrum is symmetric about 0), so zero modes sit
// in the MIDDLE of the spectrum, not at the bottom. We find them by taking the
// smallest eigenvalues of D^2 (positive) and reporting their square roots, the
// smallest |eigenvalues of D|. Near-zero values are the fermion zero modes.
// Run: npx tsx code/experiment/p4-spinor.ts

import { pathToFileURL } from 'node:url'
import { lattice } from '~/substrate/lattice'
import { cellComplexOf, kahlerDirac } from '~/operator/dirac'
import { sparseMatVec, LinearOperator } from '~/linalg/sparse'
import { lowestEigenvalues } from '~/linalg/eig-lanczos'

export function main(): { smallestMagnitudes: number[]; nearZero: number } {
  const substrate = lattice({
    dimension: 2,
    extent: 10,
    signature: 'riemannian',
  })
  const complex = cellComplexOf({ substrate, maxGrade: 2 })
  const dirac = kahlerDirac({ complex })

  // D^2 as a positive operator: apply D twice.
  const dSquared: LinearOperator = {
    size: dirac.rows,
    apply: ({ x }) => sparseMatVec(dirac, { x: sparseMatVec(dirac, { x }) }),
  }
  const squared = lowestEigenvalues({ operator: dSquared, count: 16 })
  const smallestMagnitudes = Array.from(squared, (v) =>
    Math.round(Math.sqrt(Math.max(0, v)) * 1000) / 1000,
  )
  const nearZero = smallestMagnitudes.filter((x) => x < 0.05).length

  console.log('P4 Kahler-Dirac on a 2D mesh')
  console.log('  cell counts (0,1,2):', complex.cellCount.join(', '))
  console.log(
    '  smallest |eigenvalues|:',
    smallestMagnitudes.slice(0, 8).join(', '),
  )
  console.log('  near-zero modes       :', nearZero)
  return { smallestMagnitudes, nearZero }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
