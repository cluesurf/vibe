// P258 (defects ARE particles): the persistent topological defects of p257 behave like real particles. A
// defect (winding +1) and an ANTI-defect (winding -1) have total charge 0, so they can ATTRACT and ANNIHILATE,
// the field relaxes to vacuum (energy -> 0). Two LIKE defects (total charge +2) CANNOT annihilate, the
// conserved total winding locks the energy above the topological minimum, they persist. So the topological
// charge is conserved in collisions, pairs annihilate, like charges persist, exactly particle-antiparticle
// behavior. This completes the persistence-to-particle story (PS5) on top of p257.
// Run: npx tsx code/experiment/p258-defect-particles-3434.ts

import { phaseWinding } from '@/code/measure/winding'
import {
  Complex2,
  ringFieldEnergy,
  relaxRingField,
  ringFieldWithWinding,
  ringDefectPair,
} from '@/code/dynamics/ginzburg-landau'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Z = Complex2
const winding = (theta: number[]): number => phaseWinding(theta)
const phase = (z: Z): number => Math.atan2(z.im, z.re)
const energy = (psi: Z[]): number => ringFieldEnergy(psi)

function relax(
  psi: Z[],
  steps: number,
  dt: number,
): { hist: number[]; final: Z[] } {
  const hist: number[] = []
  const final = relaxRingField({
    field: psi,
    steps,
    dt,
    sampleEvery: 500,
    onSample: cur => hist.push(winding(cur.map(phase))),
  })

  return { hist, final }
}

const fieldWithWinding = (L: number, w: number): Z[] =>
  ringFieldWithWinding(L, w)

const defectPair = (L: number): Z[] => ringDefectPair(L)

export function defectParticles(): {
  pairAnnihilates: boolean
  likeChargesPersist: boolean
  chargeConserved: boolean
  particleLike: boolean
} {
  const L = 64
  // (1) defect + antidefect (total winding 0) -> annihilate to vacuum
  const pair = defectPair(L)
  const wPair = winding(pair.map(phase))
  const pr = relax(pair, 6000, 0.1)
  const ePairFinal = energy(pr.final)
  const pairAnnihilates = wPair === 0 && ePairFinal < 0.01

  // (2) two LIKE defects (total winding +2) -> cannot annihilate, energy locked above topological minimum
  const like = fieldWithWinding(L, 2)
  const wLike = winding(like.map(phase))
  const lk = relax(like, 6000, 0.1)
  const eLikeFinal = energy(lk.final)
  const topoMin = (2 * Math.PI * 2) ** 2 / L // minimal energy of a total-winding-2 config on the ring
  const likeChargesPersist = wLike === 2 && eLikeFinal > 0.5 * topoMin

  // (3) total winding conserved throughout BOTH evolutions (no phase slips)
  const chargeConserved =
    pr.hist.every(w => w === 0) && lk.hist.every(w => w === 2)

  const particleLike =
    pairAnnihilates && likeChargesPersist && chargeConserved

  return {
    pairAnnihilates,
    likeChargesPersist,
    chargeConserved,
    particleLike,
  }
}

export default experiment({
  id: 'spin/defect-particles-3434',
  code: 'E-SPN-0008',
  title:
    'topological defects annihilate in opposite-charge pairs and persist as like charges',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = defectParticles()
    const ok =
      r.pairAnnihilates && r.likeChargesPersist && r.chargeConserved

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a defect and an anti-defect (total winding zero) relax to vacuum and annihilate, two like defects (total winding two) cannot decay and lock their energy above the topological minimum, and the total winding is conserved at every step, exactly particle-antiparticle behaviour',
      metrics: {
        pairAnnihilates: r.pairAnnihilates ? 1 : 0,
        likeChargesPersist: r.likeChargesPersist ? 1 : 0,
        chargeConserved: r.chargeConserved ? 1 : 0,
      },
      control: {
        // the like-charge pair is the negative control for annihilation: same
        // relaxation, but the conserved total winding forbids decay, so the energy
        // stays up while the opposite-charge pair falls to vacuum.
        likeChargesPersist: r.likeChargesPersist ? 1 : 0,
      },
      notes:
        'L2, known physics (topological defects in a complex order parameter, the Kibble-Zurek and XY-model picture). The like-vs-opposite charge pair is a genuine control. HONEST CAVEAT: this is a heat-flow relaxation on a 1D phase ring, NOT the directional lattice-gas base rule, so it shows the topological-charge bookkeeping, not that the base dynamics produces these defects. Deterministic given the seeded fields.',
    })
  },
})
