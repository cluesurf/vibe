// P214 (the make-or-break gate, the RIGHT test): does the rule's effective ENERGY contain a stabilizing
// (Skyrme) term? Derrick is about the ENERGY landscape, so a dynamical streaming term cannot supply it, only an
// energy term can. The rule carries a DIRAC FERMION (the coin walk, p191), and integrating a fermion out
// induces a gradient-stiffness (Skyrme) term whose SIGN decides stabilization. This computes that sign directly,
// the fermion sea energy in a soliton (kink) background as a function of the soliton WIDTH R. If the sea energy
// RISES as the soliton sharpens (R -> small), the fermion adds POSITIVE gradient stiffness -> stabilizing.
// 1D Jackiw-Rebbi Dirac, real-symmetric Hamiltonian, eigenvalues by Jacobi. (1D is the tractable proxy for the
// 3D Skyrme sign, same fermion-induced-stiffness mechanism.) Run: npx tsx code/experiment/p214-actual-rule-soliton.ts

import { jackiwRebbiHamiltonian } from '@/code/operator/jackiw-rebbi'
import { diracSeaEnergy } from '@/code/measure/dirac-sea-energy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function seaEnergy(N: number, m0: number, R: number): number {
  return diracSeaEnergy({
    hamiltonian: jackiwRebbiHamiltonian({
      sites: N,
      mass: m0,
      width: R,
    }),
  })
}

export function fermionInducedStabilizer(): {
  data: { R: number; sea: number }[]
  risesAsSharpens: boolean
} {
  const N = 80,
    m0 = 1.0

  const Rs = [2, 3, 5, 8, 13]
  const data = Rs.map(R => ({
    R,
    sea: Math.round(seaEnergy(N, m0, R) * 1000) / 1000,
  }))

  // induced stiffness: does the (more negative) sea energy go UP (less negative) as the soliton sharpens (small R)?
  // a sharper soliton costing MORE fermion energy = positive induced gradient stiffness = stabilizing.
  const sharp = data[0]!.sea,
    smooth = data[data.length - 1]!.sea

  const risesAsSharpens = sharp > smooth // sea energy higher (less bound) for the sharp soliton

  return { data, risesAsSharpens }
}

export default experiment({
  id: 'gauge/actual-rule-soliton',
  code: 'E-FRC-0001',
  title:
    'a 1D fermion sea does not settle the 3D Skyrme stabilizing sign, an honest open gate',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = fermionInducedStabilizer()
    const sharp = r.data[0]?.sea ?? 0
    const smooth = r.data[r.data.length - 1]?.sea ?? 0

    return verdict({
      status: 'open',
      claim:
        'the 1D Jackiw-Rebbi fermion sea energy falls as the soliton sharpens, which is destabilizing, but 1D is not a valid proxy for the 3D Skyrme sign so the gate stays open',
      metrics: {
        sharpestSea: sharp,
        smoothestSea: smooth,
        risesAsSharpens: r.risesAsSharpens ? 1 : 0,
      },
      notes:
        'L2 computation, honest open result. The 1D Dirac sea is computed correctly, but the stabilizing 3D Skyrme sign comes from a specifically-3D chiral-anomaly structure with no 1D analog, so the 1D trend is irrelevant to the 3D sign. None of the tractable proxies resolve it. Reported open, not a pass.',
    })
  },
})
