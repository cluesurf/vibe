// S73-STRUCTURE ({7,3} suite, the Margenstern heptagrid): the structural tests. {7,3} is a 2D hyperbolic
// tiling (heptagons, 3 per vertex, degree 7), so the bulk is 2D hyperbolic, the flat layer (horocycle) is 1D,
// and the boundary is S^1. Verdicts, the 7 directions are 7-fold (heptagonal, NON-crystallographic) so NO
// spinor and NO root-system gauge, and physical space would be 1D. Even more degenerate than {5,3,4}.
// Run: npx tsx code/experiment/s73-structure.ts

import { cellGraphSpectral } from '@/code/measure/cell-graph-spectral'
import { directionsAreCrystallographic } from '@/code/measure/crystallographic'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s73Structure(): {
  degree: number
  specDim: number
  crystallographic: boolean
  hasSpinor: boolean
} {
  const { degree, specDim } = cellGraphSpectral({
    symbol: [7, 3],
    maxCells: 12000,
    t1: 3,
    t2: 6,
  })

  // the 7 directions = heptagon edge-normals at angles 2*pi*k/7, crystallographic (root system) check 2(a.b)/(b.b) in Z
  const dirs = Array.from({ length: 7 }, (_, k) => [
    Math.cos((2 * Math.PI * k) / 7),
    Math.sin((2 * Math.PI * k) / 7),
  ])

  const crystallographic = directionsAreCrystallographic(dirs)
  const hasSpinor = false // 7-fold dihedral D7 is a real reflection group, the 7-direction perm rep carries no spinor

  return { degree, specDim, crystallographic, hasSpinor }
}

export default experiment({
  id: 'substrate-survey/s73-structure',
  code: 'E-SBT-0028',
  title:
    'the 7 directions of {7,3} are non-crystallographic (measured), so no root-system gauge and 1D physical space',
  category: 'substrate-survey',
  substrates: ['73'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s73Structure()
    // AUDIT 2026-08-31: hasSpinor = false is a typed statement about the D7 permutation representation, not a
    // measurement made here, so it is reported and no longer feeds ok. The measured facts are the degree, the
    // spectral dimension, and the crystallographic test.
    const ok = r.degree === 7 && r.specDim > 0 && !r.crystallographic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {7,3} bulk has degree 7 and its 7-fold directions fail the crystallographic integer test, so they form no root system and carry no gauge group',
      metrics: {
        degree: r.degree,
        specDim: r.specDim,
        crystallographic: r.crystallographic ? 1 : 0,
        hasSpinor: r.hasSpinor ? 1 : 0,
      },
      notes:
        'L1 known math, the non-crystallographic verdict IS measured by the 2(a.b)/(b.b) integer test on the heptagon directions. The hasSpinor flag is hard-set to false from the known D7 reflection group, not measured. The 1D horocycle dimension is stated, not measured.',
    })
  },
})
