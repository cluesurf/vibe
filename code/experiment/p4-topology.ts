// P4 validation: spin from topology.
// The zero modes of the Kahler-Dirac operator D = d + delta are the harmonic
// forms, whose count is the sum of the surface's Betti numbers (b0 + b1 + b2).
// So the zero-mode count is a topological invariant, not a metric accident. We
// build a disk, a cylinder, and a torus and check the count matches the
// prediction: 1, 2, 4. If it does, spin (as a Dirac zero mode) is topological,
// the Bombelli / Friedman-Sorkin reading and the monist-spinor route.
// Run: npx tsx code/experiment/p4-topology.ts

import { pathToFileURL } from 'node:url'
import { triangulatedSurface } from '~/substrate/triangulated-surface'
import { cellComplexOf, kahlerDirac } from '~/operator/dirac'
import { sparseMatVec, LinearOperator } from '~/linalg/sparse'
import { lowestEigenvalues } from '~/linalg/eig-lanczos'

function zeroModeCount(input: {
  width: number
  height: number
  wrapWidth: boolean
  wrapHeight: boolean
}): { zeroModes: number; smallest: number[]; cells: string } {
  const surface = triangulatedSurface(input)
  const complex = cellComplexOf({ substrate: surface, maxGrade: 2 })
  const dirac = kahlerDirac({ complex })
  const dSquared: LinearOperator = {
    size: dirac.rows,
    apply: ({ x }) => sparseMatVec(dirac, { x: sparseMatVec(dirac, { x }) }),
  }
  // The zero eigenvalue is degenerate (multiplicity = Betti sum), so the Krylov
  // dimension must be well above that multiplicity to resolve every copy.
  const squared = lowestEigenvalues({
    operator: dSquared,
    count: 12,
    steps: Math.min(dirac.rows, 220),
  })
  const magnitudes = Array.from(squared, (v) => Math.sqrt(Math.max(0, v)))
  const zeroModes = magnitudes.filter((x) => x < 5e-4).length
  return {
    zeroModes,
    smallest: magnitudes.slice(0, 6).map((x) => Math.round(x * 1000) / 1000),
    cells: complex.cellCount.join(','),
  }
}

export function main(): void {
  const cases = [
    { name: 'disk', wrapWidth: false, wrapHeight: false, predicted: 1 },
    { name: 'cylinder', wrapWidth: true, wrapHeight: false, predicted: 2 },
    { name: 'torus', wrapWidth: true, wrapHeight: true, predicted: 4 },
  ]
  console.log('P4 validation: Kahler-Dirac zero modes vs topology (Betti sum)')
  console.log('  surface    cells(v,e,f)   predicted  measured  smallest |eig|')
  for (const c of cases) {
    const r = zeroModeCount({
      width: 9,
      height: 9,
      wrapWidth: c.wrapWidth,
      wrapHeight: c.wrapHeight,
    })
    const ok = r.zeroModes === c.predicted ? 'OK' : 'MISMATCH'
    console.log(
      `  ${c.name.padEnd(9)} ${r.cells.padStart(12)}   ${String(c.predicted).padStart(8)}  ${String(r.zeroModes).padStart(8)}  ${r.smallest.join(', ')}  ${ok}`,
    )
  }
  console.log('')
  console.log('  match means the Dirac zero-mode count is a topological invariant.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
