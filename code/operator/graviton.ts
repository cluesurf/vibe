// The graviton operator DERIVED from the action, not typed in. The linearized graviton (spin-2)
// operator is built through the geometric pipeline Christoffel -> Ricci -> Einstein from the metric
// perturbation, NOT typed as a formula. From that derived operator, two facts come out with no
// projector imposed: pure-gauge perturbations h = k xi + xi k are annihilated (diffeomorphism
// invariance), and the physical spectrum is exactly TWO massless modes at eigenvalue (1/2)|k|^2 (the
// graviton polarizations).

import { operatorToVoigtMatrix } from '@/code/algebra/linear/voigt'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { linearizedEinsteinTensor } from '@/code/operator/linearized-curvature'

// The derived linearized Einstein operator, the graviton operator built via the geometric pipeline.
export const einsteinOp = linearizedEinsteinTensor

function einsteinMatrix(
  k: number[],
): ReturnType<typeof operatorToVoigtMatrix> {
  return operatorToVoigtMatrix(h => einsteinOp(h, k))
}

export function gravitonFromAction(input: { k: number[] }): {
  k2: number
  eigenvalues: number[]
  gravitonModes: number
  gravitonEigenvalue: number
  diffeoResidual: number
} {
  const k = input.k
  const k2 = (k[0] ?? 0) ** 2 + (k[1] ?? 0) ** 2 + (k[2] ?? 0) ** 2
  const eig = eigSymmetric({ matrix: einsteinMatrix(k) })
  const eigenvalues = Array.from(eig.values).sort((a, b) => a - b)
  const target = 0.5 * k2

  let gravitonModes = 0

  for (const v of eigenvalues) {
    if (Math.abs(v - target) < 1e-6 * (1 + k2)) {
      gravitonModes += 1
    }
  }

  const xi = [0.7, -0.3, 0.5]
  const hGauge: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      hGauge[i]![j] =
        (k[i] ?? 0) * (xi[j] ?? 0) + (k[j] ?? 0) * (xi[i] ?? 0)
    }
  }

  const g = einsteinOp(hGauge, k)

  let gn = 0
  let hn = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      gn += (g[i]?.[j] ?? 0) ** 2
      hn += (hGauge[i]?.[j] ?? 0) ** 2
    }
  }

  return {
    k2,
    eigenvalues,
    gravitonModes,
    gravitonEigenvalue: target,
    diffeoResidual: hn > 0 ? Math.sqrt(gn / hn) : 0,
  }
}
