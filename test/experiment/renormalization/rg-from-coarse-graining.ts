// RG-FROM-COARSE-GRAINING: the path to deriving the RUNNING from the dynamics. The bulk's RADIAL direction IS a
// coarse-graining (the holographic RG, p238, each radial shell rescales the boundary). So a coupling defined on
// the substrate RUNS with radial position = energy scale, the running is a GEOMETRIC, derived feature, not
// imported QFT. We demonstrate the MECHANISM, coarse-graining generates a coupling flow with a beta function,
// using the exact 1D decimation RG (a clean, solvable coarse-graining), and connect it to the bulk's radial
// rescaling. Reproducing the exact SM beta functions needs gauge + matter on the mesh (the open dynamical sim).
// Run: npx tsx code/experiment/rg-from-coarse-graining.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// 1D Ising decimation RG, integrate out every other spin, the coupling renormalizes as K' = (1/2) ln cosh(2K).
// This is a coupling FLOWING purely from coarse-graining, the simplest exact RG, with a real beta function.
const decimate = (K: number): number => 0.5 * Math.log(Math.cosh(2 * K))

export function rgFromCoarseGraining(): { flows: boolean; betaSign: number } {
  for (const K0 of [2.0, 1.0, 0.5]) {
    let K = K0; const traj: number[] = [K]
    for (let step = 0; step < 6; step++) { K = decimate(K); traj.push(Math.round(K * 1000) / 1000) }
  }
  // the beta function, beta(K) = K' - K per coarse-graining step (the change of the coupling with scale)
  const betaAt = (K: number): number => decimate(K) - K
  const flows = Math.abs(betaAt(1.0)) > 0.05
  const betaSign = betaAt(1.0) < 0 ? -1 : 1
  return { flows, betaSign }
}

export default defineExperiment({
  id: 'renormalization/rg-from-coarse-graining',
  title: 'the 1D decimation RG shows a coupling flows with a beta function under coarse-graining',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = rgFromCoarseGraining()
    const betaAtOne = decimate(1.0) - 1.0
    const ok = r.flows && r.betaSign < 0
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the exact 1D Ising decimation recursion gives a nonzero negative beta function, a coupling that runs down to the disordered fixed point purely from integrating out short-distance detail',
      metrics: {
        betaAtKOne: betaAtOne,
        betaSign: r.betaSign,
        flows: r.flows ? 1 : 0,
      },
      notes:
        'L1 known math. This is the textbook 1D Ising decimation RG (K prime equals one half ln cosh 2K), so the running and its beta function are established, not derived from the substrate. The link to the bulk radial direction as a holographic RG is narrative only here. Reproducing the actual Standard-Model beta coefficients needs gauge and matter on the mesh, which is open.',
    })
  },
})
