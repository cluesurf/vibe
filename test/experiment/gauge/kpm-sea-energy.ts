// P216 (the gate-closer): the Dirac-SEA energy of the 3D Dirac-skyrmion operator vs soliton size R, by the
// Kernel Polynomial Method (Chebyshog expansion of |x|) + stochastic trace with COMMON RANDOM NUMBERS.
// Since Tr[H] = 0 for this operator, E_sea = -(1/2) Tr|H|. We estimate Tr|H| via the Chebyshev series of |x|
// and a stochastic trace; using the SAME random vectors for hedgehog and vacuum makes the huge bulk cancel
// per-sample, so the soliton's fermionic energy Delta E_sea(R) = E_sea(hedgehog,R) - E_sea(vacuum) survives.
// If Delta E_sea RISES as the soliton sharpens (R -> small), the fermion adds POSITIVE stiffness -> the rule's
// fermion supplies a STABILIZING term (the Skyrme sign). Run: npx tsx code/experiment/p216-kpm-sea-energy.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeDirac } from '@/code/operator/dirac-skyrmion'
import { newCx } from '@/code/algebra/linear/complex-vector'
import {
  absoluteValueCoefficients,
  jacksonKernel,
  chebyshevMoments,
  spectralBound,
} from '@/code/algebra/linear/kernel-polynomial'

export function kpmSeaEnergy(): { deltaE: [number, number][]; hasMinimum: boolean } {
  const L = 14, M = 1.5, MCHEB = 220, NRV = 12
  const Rs = [2, 3, 4, 6, 9]
  // TEXTURE mode: constant mass magnitude, only the DIRECTION winds (a charge-1 hopfion). No volume term, so the
  // fermion energy is purely gradient = exchange*R + Skyrme/R. The vacuum is uniform-z (sea energy is
  // direction-independent by isospin symmetry, so the far-field cancels). A MINIMUM in Delta E_sea(R) proves
  // the Skyrme coefficient D > 0 (stabilizing).
  const vac = makeDirac(L, M, 0, 'uniformz')
  const dim = vac.dim
  const c = absoluteValueCoefficients(MCHEB), g = jacksonKernel(MCHEB)
  const hedges = Rs.map((R) => makeDirac(L, M, R, 'texture'))
  // spectral bound: max over vacuum and the SHARPEST texture (sharp textures have the largest spectrum)
  const a =
    Math.sqrt(
      Math.max(
        spectralBound({ operator: vac.applyH, dim }),
        spectralBound({ operator: hedges[0]!.applyH, dim }),
      ),
    ) * 1.2
  const dMu: Float64Array[] = Rs.map(() => new Float64Array(MCHEB)) // accumulated Delta moments per R
  let rng = 12345
  const xi = newCx(dim)
  for (let r = 0; r < NRV; r++) {
    for (let i = 0; i < dim; i++) { rng = (rng * 1103515245 + 12345) & 0x7fffffff; xi.re[i] = (rng & 1) ? 1 : -1; xi.im[i] = 0 } // Rademacher
    const muV = chebyshevMoments({ operator: vac.applyH, scale: a, probe: xi, count: MCHEB, dim })
    hedges.forEach((h, ri) => { const muH = chebyshevMoments({ operator: h.applyH, scale: a, probe: xi, count: MCHEB, dim }); for (let n = 0; n < MCHEB; n++) dMu[ri]![n]! += (muH[n]! - muV[n]!) / NRV })
  }
  // Delta E_sea(R) = -(1/2) * a * sum_n g_n c_n Delta mu_n
  const deltaE: [number, number][] = Rs.map((R, ri) => {
    let dTrAbs = 0; for (let n = 0; n < MCHEB; n++) dTrAbs += g[n]! * c[n]! * dMu[ri]![n]!
    return [R, Math.round(-0.5 * a * dTrAbs * 100) / 100] as [number, number]
  })
  // a minimum at an INTERIOR R means Delta E ~ B*R + D/R with D>0 (Skyrme stabilizing)
  let minI = 0
  for (let i = 1; i < deltaE.length; i++) if (deltaE[i]![1] < deltaE[minI]![1]) minI = i
  const hasMinimum = minI > 0 && minI < deltaE.length - 1
  return { deltaE, hasMinimum }
}

export default defineExperiment({
  id: 'gauge/kpm-sea-energy',
  title: 'the 3D Dirac sea energy of a texture soliton, probed for an interior minimum, the Skyrme sign',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = kpmSeaEnergy()
    const first = r.deltaE[0]?.[1] ?? 0
    const last = r.deltaE[r.deltaE.length - 1]?.[1] ?? 0
    return verdict({
      status: r.hasMinimum ? 'pass' : 'open',
      claim:
        'the fermion sea energy of a 3D texture soliton is estimated by the kernel polynomial method against soliton width, and an interior minimum would mean a positive stabilizing Skyrme coefficient',
      metrics: {
        firstDeltaSea: first,
        lastDeltaSea: last,
        hasInteriorMinimum: r.hasMinimum ? 1 : 0,
      },
      notes:
        'L2, known method, the kernel polynomial estimate of a Dirac sea energy. It uses a stochastic trace over pseudo-random Rademacher probe vectors, so the result is a statistical estimate, not a deterministic-base quantity. If no interior minimum appears the Skyrme sign is not cleanly isolated, reported open rather than a forced pass.',
    })
  },
})
