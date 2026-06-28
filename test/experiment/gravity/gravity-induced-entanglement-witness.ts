// EXTERNAL THEORY: Marletto-Vedral and Bose et al. (gravity-induced entanglement, the GIE / BMV witness), with
// Van Raamsdonk and Deutsch-Marletto behind it (author-bridges/roy-herbert.md point 5 and the E/G covariation,
// author-bridges/van-raamsdonk.md). The witness logic: if two systems A and B that never interact directly
// become entangled, then whatever mediates between them (the gravitational / geometric channel) must itself
// carry quantum information. On vibe the mediator is geometry, a chain of bonds, so the witness becomes: does
// A-to-B entanglement appear only through the geometric mediator, and does it covary with the mediator strength.
// This extends E-HLG-0021 (throat-pinching) to the full mediator witness.
//
// Tested on a free-fermion chain partitioned A | M | B, where A and B share no direct bond and connect only
// through the mediator M (the same correlation-matrix machinery as holography/entanglement). The mutual
// information I(A:B) = S(A) + S(B) - S(A union B) is the entanglement witness between the two distant regions.
// Sweeping the mediator weight from open (1) to severed (0): I(A:B) covaries with the mediator strength
// (Pearson near 1) and collapses to nothing when the mediator is cut, so the two distant regions are entangled
// only through the geometric channel. CONTROL: add a direct A-B bypass bond, and severing the mediator no
// longer kills I(A:B), the discriminator that the entanglement was genuinely mediated by geometry and not a
// global artifact of the chain.

import { mediatorChainHamiltonian } from '@/code/operator/tight-binding'
import {
  freeFermionCorrelationMatrix,
  regionEntanglementEntropy,
} from '@/code/measure/entanglement'
import { pearson } from '@/code/measure/statistics'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the mutual information I(A:B) = S(A) + S(B) - S(A union B) of two regions in a free-fermion ground state.
function mutualInformation(input: {
  mediatorWeight: number
  bypassWeight: number
}): number {
  const { mediatorWeight, bypassWeight } = input
  const { h, n, regionA, regionB } = mediatorChainHamiltonian({
    nA: 18,
    nM: 8,
    nB: 18,
    mediatorWeight,
    bypassWeight,
  })

  const c = freeFermionCorrelationMatrix({ h, n })
  const sA = regionEntanglementEntropy({ c, n, region: regionA })
  const sB = regionEntanglementEntropy({ c, n, region: regionB })
  const sAB = regionEntanglementEntropy({
    c,
    n,
    region: [...regionA, ...regionB],
  })

  return sA + sB - sAB
}

export default experiment({
  id: 'gravity/gravity-induced-entanglement-witness',
  code: 'E-GRV-0041',
  title:
    'two distant regions on vibe become entangled only through the geometric mediator and the mutual information covaries with the mediator strength (the GIE / BMV witness), while a direct bypass keeps them entangled when the mediator is cut',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // deterministic sweep of the mediator weight from open (1) to severed (0).
    const weights = [1, 0.7, 0.5, 0.3, 0.15, 0.05, 0]

    const mediated = weights.map(w =>
      mutualInformation({ mediatorWeight: w, bypassWeight: 0 }),
    )

    // CONTROL: a direct A-B bypass bond present throughout the same sweep.
    const bypassed = weights.map(w =>
      mutualInformation({ mediatorWeight: w, bypassWeight: 1 }),
    )

    // I(A:B) tracks the mediator strength (drop the severed end-point so the correlation is over the live range).
    const rCovary = pearson({
      a: weights.slice(0, weights.length - 1),
      b: mediated.slice(0, mediated.length - 1),
    })

    const coVary = rCovary > 0.9

    const openMI = mediated[0]!
    const severedMI = mediated[mediated.length - 1]!
    // cutting the geometric mediator kills the A-B entanglement (no other channel exists).
    const severedKills = severedMI < openMI * 0.1

    // CONTROL: with a direct bypass, severing the mediator leaves the entanglement largely intact.
    const bypassSevered = bypassed[bypassed.length - 1]!
    const bypassOpen = bypassed[0]!
    const bypassRetains = bypassSevered > bypassOpen * 0.5

    const ok = coVary && severedKills && bypassRetains

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two regions that share no direct bond become entangled only through the geometric mediator: their mutual information covaries with the mediator strength (Pearson > 0.9) and collapses to under a tenth when the mediator is cut, the gravity-induced-entanglement witness that the geometric channel carries the correlation, while a direct bypass bond keeps over half the entanglement when the mediator is severed, confirming the entanglement was genuinely mediated by geometry',
      metrics: {
        sweepPoints: weights.length,
        pearson: rCovary,
        mutualInfoOpen: openMI,
        mutualInfoSevered: severedMI,
        severedFraction: severedMI / Math.max(1e-12, openMI),
      },
      control: {
        bypassOpen,
        bypassSevered,
        bypassRetained: bypassSevered / Math.max(1e-12, bypassOpen),
        bypassRetains: bypassRetains ? 1 : 0,
      },
      notes:
        'L2, the mediator (BMV-style) witness on a free-fermion chain A | M | B (44 sites, the correlation-matrix method). A and B share no direct bond, so their mutual information is mediated entirely by M. The mediator weight is swept deterministically. I(A:B) covaries with the mediator strength and vanishes when M is cut, the witness that geometry carries the entanglement. The bypass control adds a direct A-B bond and shows the entanglement then survives a severed mediator, ruling out a global artifact. This extends E-HLG-0021 from throat-pinching to the explicit mediator witness, not full nonlinear gravity.',
    })
  },
})
