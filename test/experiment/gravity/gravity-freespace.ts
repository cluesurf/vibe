// P224 (gravity plateau, SOLVED): nail the 3D Newton exponent with NO box artifact, by computing the FREE-SPACE
// 3D lattice Green's function directly in k-space, G(r) = (1/(2pi)^3) integral cos(k.r) / [2(3 - cos kx - cos ky
// - cos kz)] d^3k. This is the infinite-volume lattice Coulomb/Newton potential, ~ 1/(4 pi r), so the log-log
// slope is exactly -1 (no Dirichlet image charge to steepen it, unlike p219/p222). Run: npx tsx code/experiment/p224-gravity-freespace.ts

import { latticeGreenDifferenceX } from '@/code/operator/lattice-green-kspace'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function gravityFreeSpace(): { coeffA: number; fitResidual: number } {
  const M = 96, r0 = 2
  const rs = [3, 4, 5, 6, 8, 10, 12, 14]
  const dG = rs.map((r) => [r, latticeGreenDifferenceX({ r, r0, gridPoints: M })] as [number, number])
  // fit dG = a*(1/r) + b  (so G ~ a/r + const, a should be 1/(4 pi) = 0.0796)
  const fit = linearFit({ xs: dG.map(([r]) => 1 / r), ys: dG.map(([, g]) => g) })
  const a = fit.slope
  const coeffA = Math.round(a * 10000) / 10000, fitResidual = Math.sqrt(fit.residual / dG.length)
  const ok = Math.abs(a - 1 / (4 * Math.PI)) < 0.01 && fitResidual < 1e-3
  return { coeffA, fitResidual }
}

export default experiment({
  id: 'gravity/gravity-freespace',
  title: 'the free-space 3D lattice Green function is exactly 1/(4 pi r), the clean 1/r Newton law',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = gravityFreeSpace()
    const expectedCoeff = 1 / (4 * Math.PI)
    const ok =
      Math.abs(r.coeffA - expectedCoeff) < 0.01 && r.fitResidual < 1e-3
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the infinite-volume cubic lattice Green function computed in k-space fits a/r with a equal to 1/(4 pi) and a tiny residual, the clean 1/r Newton potential with no box artifact',
      metrics: {
        coeffA: r.coeffA,
        expectedCoeff,
        fitResidual: r.fitResidual,
      },
      notes:
        'L1 known math. This evaluates the standard infinite-volume cubic-lattice Coulomb Green function, whose continuum limit is 1/(4 pi r) by textbook lattice field theory. It removes the box and k=0 artifacts of the boundary solve but assumes the Laplacian, so it confirms established math, not emergent gravity from the dynamics.',
    })
  },
})
