// P235 (why 3+1 dimensions): physical space is the CUSP of {3,4,3,4}, which is {4,3,4} = flat 3D cubic -> 3
// spatial dimensions; the beat is 1 time dimension. So 3+1 = (cusp dimension) + (beat). The substrate {3,4,3,4}
// was SELECTED for spin (the spinor test, p190), and its cusp is 3D, so 3 spatial dimensions FOLLOW from the
// spin requirement. We confirm the cusp reads 3D (spectral dimension), and note why 3D is special (spinors,
// the Hopf fibration, stable 1/r^2 orbits, knots). Run: npx tsx code/experiment/p235-why-3plus1.ts

import { cubicLattice, cubicLatticeCenterBySide } from '@/code/substrate/cubic-lattice'
import { spectralDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The cusp's spectral dimension is the lattice random-walk return exponent
// (spectralDimension in code/measure/dimension) on the {4,3,4} = cubic lattice. The
// central difference at t = 6 is the endpoint slope between t = 4 and t = 8.
function cuspSpectralDim(L: number): number {
  const g = cubicLattice(L, 3)
  const center = cubicLatticeCenterBySide({ side: L, dim: 3 })
  return spectralDimension({ neighbors: g.neighbors, start: center, t1: 4, t2: 8 })
}

export function why3plus1(): { cuspDim: number; isThreeD: boolean } {
  const cuspDim = Math.round(cuspSpectralDim(40) * 100) / 100
  const isThreeD = Math.abs(cuspDim - 3) < 0.4
  return { cuspDim, isThreeD }
}

// The cusp of {3,4,3,4} is flat 3D cubic. We measure the spectral dimension of the {4,3,4}
// cubic cusp and it reads near 3, so spacetime is 3 cusp dimensions plus 1 beat = 3+1. Only
// the dimension is measured here. The claim that 3 spatial dimensions FOLLOW from selecting
// the substrate for spin is a selection argument made elsewhere, not measured in this file.
// L1, the dimension of a known cubic lattice.
export default defineExperiment({
  id: 'geometry/why-3plus1',
  title: 'the {4,3,4} cusp reads spectral dimension ~3, so spacetime is 3 space plus 1 beat',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = why3plus1()
    const ok = r.isThreeD
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {4,3,4} cubic cusp reads spectral dimension near 3, giving 3 spatial dimensions plus the one-dimensional beat',
      metrics: {
        cuspDimension: r.cuspDim,
        isThreeD: r.isThreeD ? 1 : 0,
      },
      notes:
        'L1, the dimension of the known {4,3,4} cubic lattice. Only the cusp dimension is measured. The argument that 3 spatial dimensions follow from selecting the substrate for spin is a selection claim made elsewhere, not measured here.',
    })
  },
})
