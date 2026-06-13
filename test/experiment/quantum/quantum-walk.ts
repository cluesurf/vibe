// P17: quantum coherence on the mesh (a first rung beyond Bell).
// P7 gave the Bell-correlation hinge. The full quantum formalism is the long road
// (Born rule, amplitudes, unitarity: see note/questions/next-version.md P17). One
// concrete rung is genuine quantum coherence: a continuous-time quantum walk
// (unitary e^{-iHt}) spreads BALLISTICALLY, its width growing like t, because
// amplitudes interfere. A classical random walk on the same graph spreads
// DIFFUSIVELY, its width growing like sqrt(t). Seeing the ballistic law is seeing
// interference, the heart of quantum behaviour, emerge on the mesh.
// Run: npx tsx code/experiment/p17-quantum-walk.ts

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// A 1D chain of n sites: adjacency A (hopping) and Laplacian L = D - A.
export function chainOperators(n: number): { adjacency: ReturnType<typeof makeDense>; laplacian: ReturnType<typeof makeDense> } {
  const adjacency = makeDense({ rows: n, cols: n })
  const laplacian = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    let degree = 0
    if (i > 0) {
      adjacency.data[i * n + (i - 1)] = 1
      laplacian.data[i * n + (i - 1)] = -1
      degree++
    }
    if (i < n - 1) {
      adjacency.data[i * n + (i + 1)] = 1
      laplacian.data[i * n + (i + 1)] = -1
      degree++
    }
    laplacian.data[i * n + i] = degree
  }
  return { adjacency, laplacian }
}

// Mean-square displacement of a quantum walk e^{-iAt} from the center.
export function quantumMsd(input: { eig: { values: number[] | Float64Array; vectors: Float64Array }; n: number; center: number; t: number }): number {
  const { eig, n, center, t } = input
  let msd = 0
  for (let j = 0; j < n; j++) {
    let re = 0
    let im = 0
    for (let k = 0; k < n; k++) {
      const amp = (eig.vectors[center * n + k] ?? 0) * (eig.vectors[j * n + k] ?? 0)
      const lambda = eig.values[k] ?? 0
      re += amp * Math.cos(lambda * t)
      im += amp * -Math.sin(lambda * t)
    }
    const prob = re * re + im * im
    msd += prob * (j - center) * (j - center)
  }
  return msd
}

// Mean-square displacement of a classical random walk e^{-Lt} from the center.
export function classicalMsd(input: { eig: { values: number[] | Float64Array; vectors: Float64Array }; n: number; center: number; t: number }): number {
  const { eig, n, center, t } = input
  const prob = new Float64Array(n)
  let norm = 0
  for (let j = 0; j < n; j++) {
    let p = 0
    for (let k = 0; k < n; k++) {
      const amp = (eig.vectors[center * n + k] ?? 0) * (eig.vectors[j * n + k] ?? 0)
      const lambda = eig.values[k] ?? 0
      p += amp * Math.exp(-lambda * t)
    }
    prob[j] = Math.max(0, p)
    norm += prob[j] ?? 0
  }
  let msd = 0
  for (let j = 0; j < n; j++) {
    msd += ((prob[j] ?? 0) / Math.max(norm, 1e-300)) * (j - center) * (j - center)
  }
  return msd
}

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
