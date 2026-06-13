// P17: quantum coherence on the mesh (a first rung beyond Bell).
// P7 gave the Bell-correlation hinge. The full quantum formalism is the long road
// (Born rule, amplitudes, unitarity: see note/questions/next-version.md P17). One
// concrete rung is genuine quantum coherence: a continuous-time quantum walk
// (unitary e^{-iHt}) spreads BALLISTICALLY, its width growing like t, because
// amplitudes interfere. A classical random walk on the same graph spreads
// DIFFUSIVELY, its width growing like sqrt(t). Seeing the ballistic law is seeing
// interference, the heart of quantum behaviour, emerge on the mesh.
// Run: npx tsx code/experiment/p17-quantum-walk.ts

import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import {
  continuousQuantumWalkMsd,
  continuousClassicalWalkMsd,
} from '@/code/dynamics/quantum-walk'
import { chainOperators } from '@/code/operator/chain-operators'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the continuous-time walk MSDs live in the dynamics library, the 1D chain operators in
// code/operator/chain-operators; re-exported under the names test/test.ts has always used.
export const quantumMsd = continuousQuantumWalkMsd
export const classicalMsd = continuousClassicalWalkMsd
export { chainOperators }

export default defineExperiment({
  id: 'quantum/quantum-walk',
  title: 'a quantum walk is ballistic while a classical walk is diffusive',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const n = 151
    const center = Math.floor(n / 2)
    const ops = chainOperators(n)
    const eigA = eigSymmetric({ matrix: ops.adjacency })
    const eigL = eigSymmetric({ matrix: ops.laplacian })
    const qRatio =
      Math.sqrt(quantumMsd({ eig: eigA, n, center, t: 16 })) /
      Math.sqrt(quantumMsd({ eig: eigA, n, center, t: 4 }))
    const cRatio =
      Math.sqrt(classicalMsd({ eig: eigL, n, center, t: 16 })) /
      Math.sqrt(classicalMsd({ eig: eigL, n, center, t: 4 }))
    const ok = qRatio > 3.5 && cRatio > 1.7 && cRatio < 2.4
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'quadrupling the time roughly quadruples the quantum width (ballistic) but only doubles the classical one (diffusive)',
      metrics: { quantumWidthRatio: qRatio, classicalWidthRatio: cRatio },
    })
  },
})
