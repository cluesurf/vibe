// P4: the monist spinor.
// Build the Kahler-Dirac operator on a cell complex of a mesh. The Dirac
// operator is indefinite (its spectrum is symmetric about 0), so zero modes sit
// in the MIDDLE of the spectrum, not at the bottom. We find them by taking the
// smallest eigenvalues of D^2 (positive) and reporting their square roots, the
// smallest |eigenvalues of D|. Near-zero values are the fermion zero modes.
// Run: npx tsx code/experiment/p4-spinor.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lattice } from '@/code/substrate/lattice'
import { cellComplexOf, kahlerDirac } from '@/code/operator/dirac'
import { sparseMatVec, LinearOperator } from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'

export default defineExperiment({
  id: 'spin/spinor',
  title: 'the Kahler-Dirac operator on a 2D mesh has near-zero modes in the middle of its spectrum',
  category: 'spin',
  substrates: ['any'],
  depth: 'L2',
  paper: false,
  run() {
    const result = main()
    // a flat disk (Betti sum b0 + b1 + b2 = 1) carries one harmonic zero mode.
    const ok = result.nearZero >= 1
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Kahler-Dirac operator on a 2D cell complex is indefinite with a spectrum symmetric about zero, and taking the smallest eigenvalues of its square recovers near-zero fermion modes sitting in the middle of the spectrum',
      metrics: {
        nearZeroModes: result.nearZero,
        smallestMagnitude: result.smallestMagnitudes[0] ?? 0,
      },
      notes:
        'L2, known math and physics (the Kahler-Dirac operator and its harmonic zero modes). This finds the zero modes on a single disk, the topological count (zero modes equal the Betti sum, with a cylinder and torus as controls) is the companion experiment spin/topology. Deterministic Lanczos, no random seed in the result.',
    })
  },
})
